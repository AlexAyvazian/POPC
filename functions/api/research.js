const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export function onRequestGet({env}){return json({available:!!env.OPENROUTER_API_KEY,mode:"free-only"});}
export async function onRequestPost({request,env}){
 if(!env.OPENROUTER_API_KEY)return json({error:"Unavailable"},503);
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Origin not allowed"},403);
 const raw=await request.text();if(raw.length>12000)return json({error:"Too large"},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:"Invalid JSON"},400)}
 const q=body?.question,cat=body?.catalog;
 if(typeof q!=="string"||!q.trim()||q.length>350||!cat||!Array.isArray(cat.roles)||!Array.isArray(cat.sectors)||!Array.isArray(cat.committees))return json({error:"Invalid request"},400);
 const prompt="Translate the question into a JSON query for public FEC contribution receipts. Do not answer with numbers or prose. Return null for unsupported, ambiguous or unrelated questions, or if a requested filter cannot be represented. Allowed keys only: type (individual or organization), committee (exact key), sector (exact sector), role (exact role), occupation (exact reported title), groupBy (sector, committee, role, occupation, type). No dates, individual names, policy positions, external facts, predictions or comparisons not expressible by one query. Omit unspecified filters. Output one JSON object or null, without markdown. Catalog: "+JSON.stringify(cat);
 try{const response=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+env.OPENROUTER_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:"openrouter/free",messages:[{role:"system",content:prompt},{role:"user",content:q}],max_tokens:180,temperature:0}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)return json({error:"Free model unavailable"},503);
 const data=await response.json();const result=data.choices?.[0]?.message?.content;if(typeof result!=="string")return json({query:null});
 let parsed;try{parsed=JSON.parse(result.trim().replace(/^```(?:json)?\s*|\s*```$/g,""))}catch{return json({query:null});}
 if(parsed===null)return json({query:null});
 const allowed=["type","committee","sector","role","occupation","groupBy"];if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)||Object.entries(parsed).some(([k,v])=>!allowed.includes(k)||typeof v!=="string"||v.length>100))return json({query:null});
 return json({query:parsed});
 }catch{return json({error:"Free model unavailable"},503);}
}
