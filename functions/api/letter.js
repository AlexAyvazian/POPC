import {validateSignature,pageNumber,VERSION} from "../lib/open-letter-validation.js";
const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export async function onRequestGet({request,env}){
 if(!env.LETTER_DB)return json({error:"Signing service unavailable"},503);
 try{
  const url=new URL(request.url),db=env.LETTER_DB;
  if(url.searchParams.get("view")==="geo"){
   const rows=await db.prepare("SELECT city,zip,COUNT(*) AS count FROM signatures GROUP BY city,zip ORDER BY count DESC,city LIMIT 10000").all();
   return json({locations:rows.results});
  }
  const after=pageNumber(url.searchParams.get("after")),supplied=url.searchParams.get("snapshot");
  const max=await db.prepare("SELECT COALESCE(MAX(id),0) AS last_id,COUNT(*) AS count FROM signatures").first();
  const snapshot=supplied===null?max.last_id:Math.min(max.last_id,pageNumber(supplied));
  const rows=await db.prepare("SELECT id,full_name,city,zip FROM signatures WHERE id>? AND id<=? ORDER BY id LIMIT 500").bind(after,snapshot).all();
  const count=snapshot===max.last_id?max.count:(await db.prepare("SELECT COUNT(*) AS count FROM signatures WHERE id<=?").bind(snapshot).first()).count;
  let archive=[];
  if(after===0){const a=await db.prepare("SELECT delivered_at,signature_count,file_path FROM delivered_letters ORDER BY delivered_at DESC").all();archive=a.results.filter(x=>/^\/letters\/[a-zA-Z0-9_.-]+\.pdf$/.test(x.file_path));}
  return json({count,snapshot,signatures:rows.results,next:rows.results.length===500?rows.results[499].id:null,archive,sitekey:env.LETTER_TURNSTILE_SITEKEY||"",ready:!!env.LETTER_TURNSTILE_SECRET&&!!env.LETTER_TURNSTILE_SITEKEY});
 }catch{return json({error:"Unable to load the letter"},503);}
}
export async function onRequestPost({request,env}){
 if(!env.LETTER_DB||!env.LETTER_TURNSTILE_SECRET)return json({error:"Signing service unavailable"},503);
 const url=new URL(request.url);
 if(request.headers.get("Origin")!==url.origin)return json({error:"Invalid request origin"},403);
 if(!request.headers.get("Content-Type")?.startsWith("application/json"))return json({error:"Invalid request"},415);
 if(Number(request.headers.get("Content-Length"))>6000)return json({error:"Request too large"},413);
 try{
  const raw=await request.text();if(raw.length>6000)return json({error:"Request too large"},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:"Invalid request"},400);}
  const s=validateSignature(body);if(!s)return json({error:"Please complete every field and give your consent."},400);
  const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:new URLSearchParams({secret:env.LETTER_TURNSTILE_SECRET,response:s.token}),signal:AbortSignal.timeout(10000)});
  if(!verify.ok)return json({error:"Verification temporarily unavailable."},503);
  const challenge=await verify.json();
  if(!challenge.success||challenge.hostname!==url.hostname||challenge.action!=="sign_letter")return json({error:"Please complete the security verification again."},400);
  const key=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s.email))),b=>b.toString(16).padStart(2,"0")).join("");
  const result=await env.LETTER_DB.prepare("INSERT OR IGNORE INTO signatures(full_name,city,state,zip,identity_key,signed_at,consent_version,email) VALUES(?,?,?,?,?,?,?,?)").bind(s.full_name,s.city,"",s.zip,key,new Date().toISOString(),VERSION,s.email).run();
  if(!result.meta.changes)return json({error:"A signature has already been recorded for this email address."},409);
  return json({ok:true},201);
 }catch{return json({error:"Your signature could not be saved. Please try again."},503);}
}