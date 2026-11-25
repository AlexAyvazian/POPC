function createRouter(now=()=>Date.now()){
 const state=new Map();
 const keys=(env,name)=>[...new Set([env[name+"_API_KEY"],env[name+"_API_KEY_2"]].filter(v=>typeof v==="string"&&v.trim()).map(v=>v.trim()))];
 const permitted=(env,name)=>env[name+"_POOL_AUTHORIZED"]==="true";
 function status(env,name){return {configured:keys(env,name).length,eligible:permitted(env,name)?keys(env,name).length:Math.min(1,keys(env,name).length),poolAuthorized:permitted(env,name)};}
 async function request(env,name,send,{anonymous=false}={}){
  const id=name;let s=state.get(id);if(!s){s={cursor:0,until:0,active:false};state.set(id,s);}
  if(s.until>now()||s.active)return undefined;
  const all=keys(env,name),pool=anonymous?[null]:permitted(env,name)?all:all.slice(0,1);
  if(!pool.length)return undefined;
  const start=s.cursor++%pool.length;
  s.active=true;
  try{
   for(let i=0;i<pool.length;i++){
    let r;try{r=await send(pool[(start+i)%pool.length]);}catch{s.until=now()+5000;return undefined;}
    if(r.status===429||r.status===402){
     const retry=r.headers?.get("Retry-After");const seconds=retry&&/^\d+(\.\d+)?$/.test(retry)?Number(retry):NaN;const date=retry&&!Number.isFinite(seconds)?Date.parse(retry):NaN;
     const delay=Number.isFinite(seconds)?seconds*1000:Number.isFinite(date)?date-now():60000;
     s.until=now()+Math.max(r.status===402?3600000:1000,delay);
     return undefined;
    }
    if(r.status===401&&i+1<pool.length)continue;
    if(r.status===401||r.status===403){s.until=now()+60000;return undefined;}
    if(r.ok)return r;
    if(r.status>=500)s.until=now()+5000;
    return undefined;
   }
  }finally{s.active=false;}
 }
 return {status,request};
}
export const keyRouter=createRouter();
export {createRouter};
