import {committeeById,committees,cycle,datasets} from '../../assets/js/fec-registry.mjs';
import {normalize,normalizeRow} from '../../assets/js/fec-core.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const paths={receipts:'schedule_a',disbursements:'schedule_b',independent:'schedule_e',notices:'schedule_e'};
const sortFields={receipts:'contribution_receipt_date',disbursements:'disbursement_date',independent:'expenditure_date',notices:'expenditure_date'};
export function parseCursor(value,dataset){
 if(!value)return null;
 if(value.length>500)throw Error('Invalid cursor');
 const x=JSON.parse(value),allowed=new Set(['last_index','last_'+sortFields[dataset],'sort_null_only']);
 if(!x||Array.isArray(x)||typeof x!=='object'||!Object.keys(x).length||Object.keys(x).some(k=>!allowed.has(k))||!/^\d{1,30}$/.test(String(x.last_index??'')))throw Error('Invalid cursor');
 for(const [k,v] of Object.entries(x)){if(k==='sort_null_only'){if(v!==true&&v!==false)throw Error('Invalid cursor');}else if(k!=='last_index'&&!/^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/.test(String(v)))throw Error('Invalid cursor date');}
 return x;
}
export function paramsFor(id,dataset,cursor){return {committee_id:id,per_page:100,sort:'-'+sortFields[dataset],...(dataset==='independent'||dataset==='notices'?{cycle,most_recent:true,is_notice:dataset==='notices'}:{two_year_transaction_period:cycle}),...(cursor||{})};}
const nk=s=>normalize(s).replace(/[^A-Z0-9]/g,'');
export function matchingIdentity(row,c){return row?.committee_id===c.id&&nk(row.name).includes(nk(c.expected));}
async function fec(env,id,path,params,fetcher){
 const keys=[env.OPENFEC_API_KEY,env.OPENFEC_API_KEY_2,env.OPENFEC_API_KEY_3,env.OPENFEC_API_KEY_4];
 const key=keys[committees.findIndex(c=>c.id===id)%keys.length];
 if(!key)throw Object.assign(Error('OpenFEC key binding unavailable'),{status:503});
 const u=new URL('https://api.open.fec.gov/v1'+path);u.searchParams.set('api_key',key);
 for(const [k,v]of Object.entries(params))if(v!==null&&v!==undefined)u.searchParams.set(k,String(v));
 let r;try{r=await fetcher(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});}catch{throw Object.assign(Error('OpenFEC request timed out or failed'),{status:502});}
 if(!r.ok)throw Object.assign(Error(r.status===429?'OpenFEC rate limit reached. Try again after the quota resets.':'OpenFEC returned HTTP '+r.status),{status:r.status===429?429:502});
 try{return await r.json();}catch{throw Object.assign(Error('Invalid OpenFEC response'),{status:502});}
}
export async function handleLive(request,env,fetcher=fetch){
 const u=new URL(request.url),id=u.searchParams.get('id'),dataset=u.searchParams.get('dataset'),c=committeeById(id);
 if(!c||!datasets.includes(dataset))return json({error:'Invalid committee or dataset'},400);
 let cursor;try{cursor=parseCursor(u.searchParams.get('cursor'),dataset);}catch{return json({error:'Invalid pagination cursor'},400);}
 try{
  if(!cursor){const d=await fec(env,id,'/committee/'+id+'/',{per_page:20},fetcher);if(!d.results?.some(r=>matchingIdentity(r,c)))return json({error:'FEC ID/name mismatch; records not displayed',reportedName:d.results?.[0]?.name||null,id},422);}
  const d=await fec(env,id,'/schedules/'+paths[dataset]+'/',paramsFor(id,dataset,cursor),fetcher);
  if(!Array.isArray(d.results))throw Error('Missing FEC results');
  if(d.results.some(r=>r.committee_id&&r.committee_id!==id))throw Error('Unexpected committee in FEC response');
  let next=null;
  if(d.results.length===100){next=d.pagination?.last_indexes;if(!next)throw Error('Missing FEC pagination cursor');next=parseCursor(JSON.stringify(next),dataset);if(JSON.stringify(next)===JSON.stringify(cursor))throw Error('Repeated FEC pagination cursor');}
  return json({id,dataset,rows:d.results.map(r=>normalizeRow(r,dataset,id)),next,reportedCount:d.pagination?.count??null,countExact:d.pagination?.is_count_exact??false});
 }catch(e){return json({error:e.status?e.message:'Unable to retrieve or validate OpenFEC data',id,dataset},e.status||502);}
}
export const onRequestGet=({request,env})=>handleLive(request,env);
