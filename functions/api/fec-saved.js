import {committeeById,committees,cycle,datasets,unresolved} from '../../assets/js/fec-registry.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':status===200?'public, max-age=120':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequestGet({request,env}){
 if(!env.FEC_DB)return json({error:'Saved database binding unavailable'},503);
 const db=env.FEC_DB,u=new URL(request.url),id=u.searchParams.get('id'),dataset=u.searchParams.get('dataset');
 try{
  if(!id&&!dataset){const p=await db.prepare('SELECT s.committee_id,s.dataset,s.state,s.started_at,s.completed_at,s.row_count,s.error,CASE WHEN p.snapshot_id=s.id THEN 1 ELSE 0 END AS published,(SELECT COUNT(*) FROM fec_snapshot_pages x WHERE x.snapshot_id=s.id) AS pages FROM fec_snapshots s LEFT JOIN fec_published p ON p.snapshot_id=s.id WHERE s.cycle=? ORDER BY s.committee_id,s.dataset').bind(cycle).all();return json({cycle,committees,unresolved,datasets,snapshots:p.results});}
  if(!committeeById(id)||!datasets.includes(dataset))return json({error:'Invalid committee or dataset'},400);
  const start=Number(u.searchParams.get('start')||0),limit=Number(u.searchParams.get('limit')||5);
  if(!Number.isSafeInteger(start)||start<0||!Number.isInteger(limit)||limit<1||limit>10)return json({error:'Invalid page range'},400);
  const p=await db.prepare('SELECT s.id,s.row_count,s.completed_at FROM fec_published p JOIN fec_snapshots s ON s.id=p.snapshot_id WHERE p.committee_id=? AND p.cycle=? AND p.dataset=? AND s.state=\'complete\'').bind(id,cycle,dataset).first();
  if(!p)return json({error:'No completed saved snapshot',id,dataset},404);
  const pages=await db.prepare('SELECT page_number,payload FROM fec_snapshot_pages WHERE snapshot_id=? AND page_number>=? ORDER BY page_number LIMIT ?').bind(p.id,start,limit).all();
  return json({id,dataset,total:p.row_count,completedAt:p.completed_at,rows:pages.results.flatMap(x=>JSON.parse(x.payload)),next:pages.results.length===limit?start+limit:null});
 }catch(e){console.error('Saved FEC data read failed',e.message);return json({error:'Saved FEC data read failed'},500);}
}
