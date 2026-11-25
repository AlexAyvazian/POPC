const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export async function onRequestPost({request}){
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Origin not allowed"},403);
 if(Number(request.headers.get("Content-Length"))>2000)return json({error:"Too large"},413);
 let body;try{const raw=await request.text();if(raw.length>2000)return json({error:"Too large"},413);body=JSON.parse(raw)}catch{return json({error:"Invalid request"},400)}
 const q=body?.query;if(typeof q!=="string"||!q.trim()||q.length>300)return json({error:"Enter a search of up to 300 characters."},400);
 try{const r=await fetch("https://api.keenable.ai/v1/search/public",{method:"POST",headers:{"Content-Type":"application/json","X-Keenable-Title":"People Over Power Coalition"},body:JSON.stringify({query:q.trim(),max_results:6,mode:"realtime",snippet_max_length:350,disable_cards:true,moderation:"strict"}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)return json({error:"Free web search is temporarily unavailable."},503);
 const data=await r.json();const results=(Array.isArray(data.results)?data.results:[]).slice(0,6).flatMap(x=>{try{const u=new URL(x.url);if(!["http:","https:"].includes(u.protocol))return [];return [{title:String(x.title||u.hostname).slice(0,200),url:u.href,snippet:String(x.snippet||"").slice(0,350)}]}catch{return []}});
 return json({results,provider:"keenable",mode:"keyless"});}catch{return json({error:"Free web search is temporarily unavailable."},503);}
}