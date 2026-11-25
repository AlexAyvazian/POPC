const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
function parseQuery(result,cat){
 let parsed=result;
 if(typeof result==="string"){try{parsed=JSON.parse(result.trim().replace(/^```(?:json)?\s*|\s*```$/g,""));}catch{return undefined;}}
 if(parsed===null)return null;
 if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return undefined;
 const allowed=["type","committee","sector","role","occupation","groupBy"];
 if(Object.entries(parsed).some(([k,v])=>!allowed.includes(k)||typeof v!=="string"||!v.trim()||v.length>100))return undefined;
 if(parsed.type&&!["individual","organization"].includes(parsed.type))return undefined;
 if(parsed.committee&&!cat.committees.some(c=>c.key===parsed.committee))return undefined;
 if(parsed.sector&&!cat.sectors.includes(parsed.sector))return undefined;
 if(parsed.role&&!cat.roles.includes(parsed.role))return undefined;
 if(parsed.groupBy&&!["sector","committee","role","occupation","type"].includes(parsed.groupBy))return undefined;
 if(parsed.type==="organization"&&(parsed.role||parsed.occupation||["role","occupation"].includes(parsed.groupBy)))return undefined;
 return parsed;
}
function cloudflareEnabled(env){return env.WORKERS_AI_FREE_CONFIRMED==="true"&&typeof env.AI?.run==="function";}
function groqEnabled(env){return !!env.GROQ_API_KEY&&env.GROQ_FREE_CONFIRMED==="true";}
const groqModels=["openai/gpt-oss-20b","qwen/qwen3.8-27b","openai/gpt-oss-120b"];
function providers(env){return {cloudflare:{bound:typeof env.AI?.run==="function",enabled:cloudflareEnabled(env)},groq:{configured:!!env.GROQ_API_KEY,enabled:groqEnabled(env)},openrouter:{configured:!!env.OPENROUTER_API_KEY},horde:{configured:!!env.HORDE_API_KEY},novita:{configured:!!env.NOVITA_API_KEY,enabled:false},zai:{configured:!!env.ZAI_API_KEY,enabled:false}};}
async function interpret(env,messages,cat,fetcher,signalFor){
 async function chat(base,key,model,extra={},ms=7000){
  try{const r=await fetcher(base+"/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model,messages,max_tokens:180,temperature:0,...extra}),signal:signalFor(ms)});if(!r.ok)return undefined;const data=await r.json();return parseQuery(data.choices?.[0]?.message?.content,cat);}catch{return undefined;}
 }
 if(cloudflareEnabled(env)){try{const r=await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast",{messages,max_tokens:180,temperature:0});const q=parseQuery(r?.response??r?.choices?.[0]?.message?.content,cat);if(q!==undefined)return {query:q,provider:"cloudflare"};}catch{}}
 if(groqEnabled(env)){for(const model of groqModels){const q=await chat("https://api.groq.com/openai/v1",env.GROQ_API_KEY,model,{reasoning_effort:model.startsWith("qwen/")?"none":"low",max_tokens:320});if(q!==undefined)return {query:q,provider:"groq",model};}}
 if(env.OPENROUTER_API_KEY){const q=await chat("https://openrouter.ai/api/v1",env.OPENROUTER_API_KEY,"openrouter/free");if(q!==undefined)return {query:q,provider:"openrouter"};}
 if(env.HORDE_API_KEY){try{
  const r=await fetcher("https://oai.aihorde.net/v1/models",{headers:{"Authorization":"Bearer "+env.HORDE_API_KEY},signal:signalFor(5000)});if(r.ok){const data=await r.json();const list=Array.isArray(data.data)?data.data:[];const models=list.filter(m=>typeof m.id==="string"&&m.id.length<200&&/instruct|hermes|qwen|gemma|gpt-oss/i.test(m.id)&&!/embed|vision|uncensor|roleplay|nsfw/i.test(m.id));const model=models.find(m=>/qwen|gpt-oss/i.test(m.id))||models[0];if(model){const q=await chat("https://oai.aihorde.net/v1",env.HORDE_API_KEY,model.id,{},18000);if(q!==undefined)return {query:q,provider:"horde",model:model.id};}}
 }catch{}}
 return null;
}
function available(env){return cloudflareEnabled(env)||groqEnabled(env)||!!env.OPENROUTER_API_KEY||!!env.HORDE_API_KEY;}
export function onRequestGet({env}){return json({available:available(env),providers:providers(env),mode:"free-only"});}
export async function onRequestPost({request,env}){
 if(!available(env))return json({error:"Unavailable"},503);
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Origin not allowed"},403);
 if(Number(request.headers.get("Content-Length"))>12000)return json({error:"Too large"},413);
 const raw=await request.text();if(raw.length>12000)return json({error:"Too large"},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 const q=body?.question,cat=body?.catalog;
 const validList=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(s=>typeof s==="string"&&s.length<=120);
 if(typeof q!=="string"||!q.trim()||q.length>350||!cat||!validList(cat.roles,80)||!validList(cat.sectors,100)||!Array.isArray(cat.committees)||cat.committees.length>20||!cat.committees.every(c=>c&&typeof c.key==="string"&&c.key.length<=100&&typeof c.name==="string"&&c.name.length<=150))return json({error:"Invalid request"},400);
 const prompt="Translate the question into a JSON query for public FEC contribution receipts. Do not answer with numbers or prose. Return null for unsupported, ambiguous or unrelated questions, or if a requested filter cannot be represented. Allowed keys only: type (individual or organization), committee (exact key), sector (exact sector), role (exact role), occupation (exact reported title), groupBy (sector, committee, role, occupation, type). No dates, individual names, policy positions, external facts, predictions or comparisons not expressible by one query. Omit unspecified filters. Output one JSON object or null, without markdown. Catalog: "+JSON.stringify(cat);
 const result=await interpret(env,[{role:"system",content:prompt},{role:"user",content:q}],cat,fetch,ms=>AbortSignal.timeout(ms));
 return result?json(result):json({error:"Free model unavailable"},503);
}
