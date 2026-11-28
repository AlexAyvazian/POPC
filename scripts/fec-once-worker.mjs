import {WorkflowEntrypoint} from 'cloudflare:workers';
import {committees,committeeById,cycle,datasets} from './fec-registry.mjs';
import {normalize,nextPage,normalizeRow} from './fec-core.mjs';
const BASE='https://api.open.fec.gov/v1';
const paths={receipts:'schedule_a',disbursements:'schedule_b',independent:'schedule_e',notices:'schedule_e'};
function keyFor(env,id){const keys=[env.OPENFEC_API_KEY,env.OPENFEC_API_KEY_2,env.OPENFEC_API_KEY_3,env.OPENFEC_API_KEY_4].filter(Boolean);if(!keys.length)throw Error('No configured OpenFEC key');return keys[committees.findIndex(c=>c.id===id)%keys.length];}
async function fec(env,id,path,params){
 const u=new URL(BASE+path);u.searchParams.set('api_key',keyFor(env,id));
 for(const [k,v] of Object.entries(params))if(v!==null&&v!==undefined)u.searchParams.set(k,String(v));
 let r;try{r=await fetch(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(45000)});}catch{throw Error('OpenFEC network failure');}
 if(!r.ok)throw Error('OpenFEC HTTP '+r.status);
 return r.json();
}
export class FecImport extends WorkflowEntrypoint {
 async run(event,step){
  const p=event.payload, id=p.committee, dataset=p.dataset, c=committeeById(id);
  if(!c||!datasets.includes(dataset))throw Error('Invalid import scope');
  const snapshot='once-2026-'+id+'-'+dataset;
  const db=this.env.FEC_DB;
  const already=await step.do('check-published',async()=>Boolean(await db.prepare('SELECT snapshot_id FROM fec_published WHERE committee_id=? AND cycle=? AND dataset=?').bind(id,cycle,dataset).first()));
  if(already)return {status:'already saved',id,dataset};
  try{
   await step.do('create-snapshot',async()=>{await db.prepare("INSERT OR IGNORE INTO fec_snapshots(id,committee_id,cycle,dataset,state,started_at) VALUES(?,?,?,?,'building',datetime('now'))").bind(snapshot,id,cycle,dataset).run();});
   const identity=await step.do('verify-identity',{retries:{limit:3,delay:'1 minute',backoff:'exponential'},timeout:'2 minutes'},async()=>{
    const d=await fec(this.env,id,'/committee/'+id+'/',{cycle,per_page:20});
    const item=d.results?.find(x=>x.committee_id===id&&normalize(x.name).includes(c.expected));
    if(!item)throw Error('FEC registration name did not match expected '+c.expected);
    return {name:item.name,committee_id:item.committee_id};
   });
   let cursor=null,page=0,finished=false;
   while(!finished){
    if(page>=20000)throw Error('Page safety limit reached; snapshot not published');
    const start=page,prior=cursor;
    const result=await step.do('pages-'+start,{retries:{limit:5,delay:'2 minutes',backoff:'exponential'},timeout:'5 minutes'},async()=>{
     let current=prior,index=start,done=false;
     for(let j=0;j<4&&!done;j++){
      const params={committee_id:id,per_page:100,...(dataset==='independent'||dataset==='notices'?{cycle,most_recent:true,is_notice:dataset==='notices',sort:'-expenditure_date'}:{two_year_transaction_period:cycle,sort:dataset==='receipts'?'-contribution_receipt_date':'-disbursement_date'}),...(current||{})};
      const data=await fec(this.env,id,'/schedules/'+paths[dataset]+'/',params);
      const next=nextPage(data,current);
      const rows=data.results.map(r=>normalizeRow(r,dataset,id));
      await db.prepare('INSERT OR REPLACE INTO fec_snapshot_pages(snapshot_id,page_number,payload,row_count,next_cursor) VALUES(?,?,?,?,?)').bind(snapshot,index,JSON.stringify(rows),rows.length,next?JSON.stringify(next):null).run();
      index++;current=next;done=!next;
     }
     return {cursor:current,page:index,done};
    });
    cursor=result.cursor;page=result.page;finished=result.done;
   }
   return await step.do('publish',async()=>{
    const a=await db.prepare('SELECT COUNT(*) AS pages,COALESCE(SUM(row_count),0) AS rows,MIN(page_number) AS first,MAX(page_number) AS last FROM fec_snapshot_pages WHERE snapshot_id=?').bind(snapshot).first();
    if(a.pages!==page||a.first!==0||a.last!==page-1)throw Error('Incomplete saved pages');
    await db.batch([db.prepare("UPDATE fec_snapshots SET state='complete',completed_at=datetime('now'),row_count=?,error=NULL WHERE id=?").bind(a.rows,snapshot),db.prepare('INSERT OR REPLACE INTO fec_published(committee_id,cycle,dataset,snapshot_id) VALUES(?,?,?,?)').bind(id,cycle,dataset,snapshot)]);
    return {id,dataset,identity,rows:a.rows,pages:a.pages};
   });
  }catch(e){await db.prepare("UPDATE fec_snapshots SET state='failed',error=? WHERE id=? AND state!='complete'").bind(String(e.message||e).slice(0,300),snapshot).run();throw e;}
 }
}
export default {fetch(){return new Response('Not found',{status:404});}};
