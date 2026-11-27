import {classifySectorLabel,loadMasterSectors} from './master-sectors.js?v=categories1';
(() => {
"use strict";
const $=id=>document.getElementById(id);
const money=c=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const source=n=>/^\d{15,20}$/.test(String(n))?'<a class="jvf-fec-link" href="https://docquery.fec.gov/cgi-bin/fecimg/?'+n+'" target="_blank" rel="noopener noreferrer">FEC filing</a>':"—";
const sum=(r,i)=>r.reduce((a,x)=>a+x[i],0);
const sector=(name,type)=>classifySectorLabel(name,'',new Map(),type);
function groups(rows,type){const m=new Map();for(const r of rows){const s=sector(r[0],type);if(!m.has(s))m.set(s,[]);m.get(s).push(r);}return [...m].sort(([a],[b])=>a.localeCompare(b));}
function paged(id,rows,headers,render,{sectors=false,amountIndex=3,pageSize=100,placeholder="Search names…"}={}){
 const type=id==="jmf-employers"?"individual":"organization";const host=$(id);host.replaceChildren();let page=0;
 const bar=document.createElement("div");bar.className="jfc-toolbar";
 const search=document.createElement("input");search.type="search";search.placeholder=placeholder;search.setAttribute("aria-label",placeholder);bar.append(search);
 const select=document.createElement("select");select.setAttribute("aria-label","Filter sector");
 if(sectors){select.add(new Option("All sectors",""));for(const [s] of groups(rows,type))select.add(new Option(s,s));bar.append(select);}
 const result=document.createElement("div");const nav=document.createElement("div");nav.className="jfc-pagination";
 const count=document.createElement("span");count.className="jfc-count";count.setAttribute("aria-live","polite");
 const prev=document.createElement("button"),next=document.createElement("button");for(const b of [prev,next]){b.type="button";b.className="jfc-control";}prev.textContent="Previous";next.textContent="Next";nav.append(count,prev,next);host.append(bar,result,nav);
 function draw(){const q=search.value.trim().toLowerCase(),s=sectors?select.value:"";
  const filtered=rows.filter(r=>(!s||sector(r[0],type)===s)&&(!q||r.slice(0,3).some(v=>String(v).toLowerCase().includes(q))));
  const ordered=sectors?groups(filtered,type).flatMap(([k,rr])=>rr):filtered;
  const max=Math.max(1,Math.ceil(ordered.length/pageSize));page=Math.min(page,max-1);
  const slice=ordered.slice(page*pageSize,(page+1)*pageSize);
  if(!slice.length)result.textContent="No matching records.";
  else if(sectors){const totals=new Map(groups(ordered,type).map(([k,rs])=>[k,[rs.length,sum(rs,amountIndex)]]));result.innerHTML=groups(slice,type).map(([k,rs])=>'<section class="jvf-sector-section"><h2>'+esc(k)+'</h2><p class="jvf-section-meta">'+totals.get(k)[0].toLocaleString()+' records · '+money(totals.get(k)[1])+'</p>'+table(headers,rs.map(render))+'</section>').join("");}
  else result.innerHTML=table(headers,slice.map(render));
  count.textContent=ordered.length?((page*pageSize+1).toLocaleString()+"–"+Math.min((page+1)*pageSize,ordered.length).toLocaleString()+" of "+ordered.length.toLocaleString()+" · Page "+(page+1)+" of "+max):"0 records";prev.disabled=page===0;next.disabled=page>=max-1;
 }
 search.addEventListener("input",()=>{page=0;draw();});select.addEventListener("change",()=>{page=0;draw();});prev.addEventListener("click",()=>{page--;draw();});next.addEventListener("click",()=>{page++;draw();});draw();
}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Unable to load "+path);return r.json();}
async function unpack([count,base64]){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));const rows=JSON.parse(await new Response(stream).text());if(!Array.isArray(rows)||rows.length!==count)throw Error("Corrupt data chunk");return rows;}
async function load(g){const blocks=(await Promise.all(g.paths.map(json))).flat();const rows=(await Promise.all(blocks.map(unpack))).flat();if(rows.length!==g.count)throw Error("Incomplete records");return rows;}
const orgheaders=["Organization / committee","FEC classification","Date","Amount","Source"],indheaders=["Individual donor","Reported employer","Reported occupation","Date","Amount","Source"];
async function start(){
 await loadMasterSectors();
 try{const m=await json("/data/jeffries/jfc-manifest.json");if(m.committee!=="C00503052")throw Error("Wrong committee");
 const [org,emp,ind,im]=await Promise.all(["organization","employers","individual","individual-memo"].map(k=>load(m.groups[k])));
 if(sum(org,3)!==m.directOrganizationCents||sum(ind,4)!==m.directIndividualCents||sum(emp,1)!==m.directIndividualCents||sum(emp,2)!==ind.length)throw Error("Direct receipts do not reconcile");
 $("jvf-summary").textContent=org.length.toLocaleString()+" organization/committee records ("+money(sum(org,3))+") · "+ind.length.toLocaleString()+" individual records ("+money(sum(ind,4))+") · Total direct receipts "+money(sum(org,3)+sum(ind,4));
 paged("jvf-sectors",org,orgheaders,orgrow,{sectors:true,amountIndex:3,placeholder:"Search organizations or PACs…"});
 paged("jmf-employers",emp,["Reported employer / status","Direct individual receipts","Individual receipt total"],emprow,{sectors:true,amountIndex:1,placeholder:"Search reported employers…"});
 paged("jvf-individuals",ind,indheaders,indrow,{placeholder:"Search individual donors, employers or occupations…"});
 paged("jvf-individual-memo",im,indheaders,indrow,{placeholder:"Search individual memo records…"});
 $("jvf-memo-summary").textContent=im.length.toLocaleString()+" individual memo records and "+m.groups["organization-memo"].count.toLocaleString()+" organization/intermediary memo records. These are not added to the direct-receipt totals.";
 const btn=$("jfc-load-org-memos");btn.addEventListener("click",async()=>{btn.disabled=true;btn.textContent="Loading organization memos…";try{const rows=await load(m.groups["organization-memo"]);paged("jvf-organization-memo",rows,orgheaders,orgrow,{placeholder:"Search intermediary or organization…"});btn.remove();}catch(err){btn.disabled=false;btn.textContent="Retry loading organization memo records";console.error(err);}});
 $("jvf-status").remove();
 }catch(err){$("jvf-status").textContent="Unable to load or reconcile contribution data. Please reload the page.";console.error(err);}
}
start();
})();