import {committeeById,committees,cycle,datasets} from '../../assets/js/fec-registry.mjs';
import {normalize,nextPage,normalizeRow} from '../../assets/js/fec-core.mjs';
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const paths={receipts:'schedule_a',disbursements:'schedule_b',independent:'schedule_e',notices:'schedule_e'};
const nameKey=s=>normalize(s).replace(/[^A-Z0-9]/g,'');
export function validIdentity(item,c){return item?.committee_id===c.id&&nameKey(item.name).includes(nameKey(c.expected));}
export function requestParams(id,dataset,cursor){return {committee_id:id,per_page:100,...(dataset==='independent'||dataset==='notices'?{cycle,most_recent:true,is_notice:dataset==='notices',sort:'-expenditure_date'}:{two_year_transaction_period:cycle,sort:dataset==='receipts'?'-contribution_receipt_date':'-disbursement_date'}),...(cursor||{})};}
async function fetchFec(env,id,path,params){
 const keys=[env.OPENFEC_API_KEY,env.OPENFEC_API_KEY_2,env.OPENFEC_API_KEY_3,env.OPENFEC_API_KEY_4];
 const key=keys[committees.findIndex(c=>c.id===id)%keys.length];if(!key)throw Error('OpenFEC key binding unavailable');
 const u=new URL('https://api.open.fec.gov/v1'+path);u.searchParams.set('api_key',key);
 for(const [k,v]of Object.entries(params))if(v!==null&&v!==undefined)u.searchParams.set(k,String(v));
 let r;try{r=await fetch(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(18000)});}catch{throw Error('OpenFEC network failure');}
 if(!r.ok){const e=Error('OpenFEC HTTP '+r.status);e.status=r.status;throw e;}
 return r.json();
}
export async function onRequestPost({request,env}){
 const db=env.FEC_DB;if(!db)return json({error:'Database unavailable'},503);
 const auth=request.headers.get('Authorization')||'';
 if(!/^Bearer [a-f0-9]{64}$/.test(auth))return json({error:'Unauthorized'},401);
 const grant=await db.prepare("SELECT token FROM fec_import_grants WHERE token=? AND expires_at>datetime('now')").bind(auth.slice(7)).first();
 if(!grant)return json({error:'Unauthorized'},401);
 let body;try{body=await request.json();}catch{return json({error:'Invalid request'},400);}
 const id=body.id,dataset=body.dataset,c=committeeById(id);
 if(!c||!datasets.includes(dataset))return json({error:'Invalid import scope'},400);
 const snapshot='once-2026-'+id+'-'+dataset;
 const existing=await db.prepare('SELECT s.row_count FROM fec_published p JOIN fec_snapshots s ON p.snapshot_id=s.id WHERE p.committee_id=? AND p.cycle=? AND p.dataset=?').bind(id,cycle,dataset).first();
 if(existing)return json({id,dataset,done:true,rows:existing.row_count});
 const lock=crypto.randomUUID();
 const claim=await db.prepare("INSERT INTO fec_import_locks(snapshot_id,lock_id,expires_at) VALUES(?,?,datetime('now','+3 minutes')) ON CONFLICT(snapshot_id) DO UPDATE SET lock_id=excluded.lock_id,expires_at=excluded.expires_at WHERE fec_import_locks.expires_at<=datetime('now')").bind(snapshot,lock).run();
 if(!claim.meta.changes)return json({id,dataset,error:'Import in progress'},409);
 try{
  await db.prepare("INSERT OR IGNORE INTO fec_snapshots(id,committee_id,cycle,dataset,state,started_at) VALUES(?,?,?,?,'building',datetime('now'))").bind(snapshot,id,cycle,dataset).run();
  await db.prepare("UPDATE fec_snapshots SET state='building',error=NULL WHERE id=?").bind(snapshot).run();
  let identity=await db.prepare('SELECT name FROM fec_verified_entities WHERE id=?').bind(id).first();
  if(!identity){const data=await fetchFec(env,id,'/committee/'+id+'/',{per_page:20});const match=data.results?.find(x=>validIdentity(x,c));
   if(!match)throw Error('FEC registration mismatch: '+String(data.results?.[0]?.name||'no match').slice(0,100));
   await db.prepare('INSERT OR REPLACE INTO fec_verified_entities(id,name) VALUES(?,?)').bind(id,match.name).run();
  }
  const last=await db.prepare('SELECT page_number,next_cursor FROM fec_snapshot_pages WHERE snapshot_id=? ORDER BY page_number DESC LIMIT 1').bind(snapshot).first();
  let page=last?last.page_number+1:0,cursor=last?.next_cursor?JSON.parse(last.next_cursor):null,done=Boolean(last&&!last.next_cursor);
  const limit=8;
  for(let i=0;i<limit&&!done;i++){
   if(page>=20000)throw Error('Page safety limit reached');
   const d=await fetchFec(env,id,'/schedules/'+paths[dataset]+'/',requestParams(id,dataset,cursor));
   const next=nextPage(d,cursor);
   const rows=d.results.map(r=>normalizeRow(r,dataset,id));
   await db.prepare('INSERT OR REPLACE INTO fec_snapshot_pages(snapshot_id,page_number,payload,row_count,next_cursor) VALUES(?,?,?,?,?)').bind(snapshot,page,JSON.stringify(rows),rows.length,next?JSON.stringify(next):null).run();
   page++;cursor=next;done=!next;
  }
  const a=await db.prepare('SELECT COUNT(*) AS pages,COALESCE(SUM(row_count),0) AS rows,MIN(page_number) AS first,MAX(page_number) AS last FROM fec_snapshot_pages WHERE snapshot_id=?').bind(snapshot).first();
  if(a.pages!==page||a.first!==0||a.last!==page-1)throw Error('Incomplete saved pages');
  if(done){await db.batch([db.prepare("UPDATE fec_snapshots SET state='complete',completed_at=datetime('now'),row_count=?,error=NULL WHERE id=?").bind(a.rows,snapshot),db.prepare('INSERT OR REPLACE INTO fec_published(committee_id,cycle,dataset,snapshot_id) VALUES(?,?,?,?)').bind(id,cycle,dataset,snapshot)]);}
  else await db.prepare('UPDATE fec_snapshots SET row_count=? WHERE id=?').bind(a.rows,snapshot).run();
  return json({id,dataset,done,rows:a.rows,pages:a.pages});
 }catch(e){const msg=String(e.message||e).slice(0,250);await db.prepare("UPDATE fec_snapshots SET state='failed',error=? WHERE id=? AND state!='complete'").bind(msg,snapshot).run();return json({id,dataset,error:msg},e.status===429?429:502);}
 finally{await db.prepare('DELETE FROM fec_import_locks WHERE snapshot_id=? AND lock_id=?').bind(snapshot,lock).run();}
}
