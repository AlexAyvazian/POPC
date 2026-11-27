import {chartSwatches,chartSequence,balancedColors,balancedPalette} from './chart-palette.js?v=regroup3';
import {networkData,normalize,occupationGroup,personalCategories} from './donor-data.js?v=researched2';
const {config,loadCommittee}=networkData('schumer');
(()=>{"use strict";
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n/100),num=n=>n.toLocaleString("en-US"),sum=(a,k)=>a.reduce((n,r)=>n+r[k],0),gross=r=>r.individual+r.organization,pct=(n,d)=>d?((n/d)*100).toFixed(2)+"%":"0.00%";
// Chart colors sampled from the supplied palette, converted to sRGB.
const sequence=chartSequence;
const [indColor,orgColor]=balancedPalette(2);
function sequentialItems(items){const ordered=[...items].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)),colors=balancedColors(ordered.map(item=>item.name));return ordered.map(item=>({...item,color:colors.get(item.name)}));}
const isResearchedSectorName=name=>Boolean(name)&&!String(name).startsWith("No sector:")&&String(name)!=="Unresolved / ambiguous";
function sectorItems(items){const ordered=[...items].filter(item=>isResearchedSectorName(item.name)).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)),colors=balancedColors(ordered.map(item=>item.name));return ordered.map(item=>({...item,color:colors.get(item.name)}));}
function sectorCoverage(host,items,valueKey="value"){const excluded=items.filter(item=>!isResearchedSectorName(item.name)).reduce((n,item)=>n+(item[valueKey]||0),0);if(!excluded)return;const p=document.createElement("p");p.className="ca-muted ca-sector-coverage";p.textContent="Current ClaudeFiles leave "+money(excluded)+" without a researched sector assignment. Those records remain in the donor tables and are excluded from this sector chart.";host.append(p);}
let selected="",sectorSelected="",query="",page=0,allRecords=null,mode="organization",roleSelected="",exactOccupation="",occupationPage=0,occupationQuery="",loadFailures=[],loadedCommittees=0;
const pageSize=50;
function roleTotals(rows){
 const m=new Map();
 for(const r of rows){if(r.type!=="individual")continue;const key=occupationGroup(r.occupation);let x=m.get(key);if(!x){x={name:key,key,value:0,count:0,names:new Set()};m.set(key,x);}x.value+=r.amount;x.count++;x.names.add(normalize(r.name||"NOT REPORTED"));}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
const nonExecutiveGroups=new Set(["Other reported occupations","Managers / directors"]);
function nonExecutiveTotals(rows,classify){
 const m=new Map();
 for(const r of rows){if(r.type!=="individual")continue;const group=classify(r.occupation);if(!nonExecutiveGroups.has(group))continue;const name=normalize(r.occupation);if(!name)continue;let v=m.get(name);if(!v){v={name,group,value:0,count:0,names:new Set()};m.set(name,v);}v.value+=r.amount;v.count++;v.names.add(normalize(r.name));}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function aggregateDonors(rows,mode){
 const m=new Map();
 for(const r of rows){
   if(mode==="organization"&&r.type!=="organization"||mode!=="organization"&&r.type!=="individual")continue;
   const key=normalize(mode==="employer"?r.employer||"NOT REPORTED":r.name||"NOT REPORTED");
   let v=m.get(key);if(!v){v={name:key,value:0,count:0,committees:new Map(),sectors:new Set(),employers:new Set(),occupations:new Set(),roleDetails:new Map()};m.set(key,v);}
   v.value+=r.amount;v.count++;v.committees.set(r.committee,(v.committees.get(r.committee)||0)+r.amount);
   v.sectors.add(r.sector);if(r.type==="individual"){const employer=normalize(r.employer||"NOT REPORTED"),occupation=normalize(r.occupation||"NOT REPORTED"),k=JSON.stringify([employer,occupation]);v.employers.add(employer);v.occupations.add(occupation);let d=v.roleDetails.get(k);if(!d){d={employer,occupation,amount:0,count:0};v.roleDetails.set(k,d);}d.amount+=r.amount;d.count++;}
 }
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function aggregateSectors(rows){
 const m=new Map();
 for(const r of rows){const key=r.sector||'Unresolved / ambiguous';let v=m.get(key);if(!v){v={name:key,key,value:0,individual:0,organization:0,count:0};m.set(key,v);}v.value+=r.amount;v[r.type]+=r.amount;v.count++;}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function donut(host,items,onSelect,active,label){host.replaceChildren();const positive=items.filter(x=>x.value>0),den=sum(positive,"value");if(!den){host.textContent="No positive receipts in this selection.";return;}const wrap=document.createElement("div");wrap.className="ca-chart";const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 220 220");svg.setAttribute("class","ca-donut");svg.setAttribute("role","group");svg.setAttribute("aria-label",label);const radius=84,circ=2*Math.PI*radius;let off=0;const legend=document.createElement("div");legend.className="ca-legend";const fallbackColors=balancedPalette(positive.length);
positive.forEach((item,i)=>{const color=item.color||fallbackColors[i],c=document.createElementNS(svg.namespaceURI,"circle"),frac=item.value/den;for(const [k,v] of Object.entries({cx:110,cy:110,r:radius,fill:"none",stroke:color,"stroke-width":34,"stroke-dasharray":(frac*circ)+" "+circ,"stroke-dashoffset":-off,transform:"rotate(-90 110 110)"}))c.setAttribute(k,v);off+=frac*circ;const desc=item.name+": "+money(item.value)+" ("+pct(item.value,den)+")";const title=document.createElementNS(svg.namespaceURI,"title");title.textContent=desc;c.append(title);if(onSelect){c.setAttribute("role","button");c.setAttribute("tabindex","0");c.setAttribute("aria-label",desc);c.addEventListener("click",()=>onSelect(item));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(item);}});}svg.append(c);
const b=document.createElement(onSelect?"button":"div");if(onSelect){b.type="button";b.addEventListener("click",()=>onSelect(item));b.setAttribute("aria-pressed",String(active===item.key));}else{b.style.display="flex";b.style.alignItems="center";b.style.gap="9px";b.style.padding="7px";}if(active===item.key&&onSelect)b.classList.add("ca-selected");b.innerHTML='<span class="ca-swatch" style="background:'+color+'"></span><span class="ca-legend-name">'+esc(item.name)+'</span><span class="ca-legend-value">'+money(item.value)+'<small>'+pct(item.value,den)+'</small></span>';legend.append(b);});
const text=document.createElementNS(svg.namespaceURI,"text");text.setAttribute("x",110);text.setAttribute("y",105);text.setAttribute("text-anchor","middle");text.setAttribute("font-size","11");text.textContent="TOTAL";svg.append(text);const val=document.createElementNS(svg.namespaceURI,"text");val.setAttribute("x",110);val.setAttribute("y",124);val.setAttribute("text-anchor","middle");val.setAttribute("font-size","12");val.setAttribute("font-weight","700");val.textContent=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(den/100);svg.append(val);wrap.append(svg,legend);host.append(wrap);
const nonPositive=items.filter(x=>x.value<=0);if(nonPositive.length){const p=document.createElement("p");p.className="ca-muted";p.textContent="Zero or negative groups are excluded from pie slices; amounts remain in the tables.";host.append(p);}}
function chooseCommittee(key){selected=selected===key?"":key;$("ca-committee").value=selected;sectorSelected="";page=0;render();}
function chooseSector(key){sectorSelected=sectorSelected===key?"":key;$("ca-sector").value=sectorSelected;page=0;renderOrganizations();}
function activeCommittees(){return selected?config.filter(x=>x.key===selected):config;}
function render(){const active=activeCommittees(),ic=sum(active,"individual"),oc=sum(active,"organization"),total=ic+oc,all=sum(config,"individual")+sum(config,"organization");
$("ca-total").textContent=money(total);$("ca-scope").textContent=selected?active[0].name:"All three committees";$("ca-ind").textContent=money(ic);$("ca-org").textContent=money(oc);$("ca-count").textContent=num(sum(active,"individualCount")+sum(active,"organizationCount"));
const ordered=[...config].sort((a,b)=>gross(b)-gross(a));donut($("ca-committee-pie"),sequentialItems(ordered.map(x=>({name:x.name,key:x.key,value:gross(x)}))),x=>chooseCommittee(x.key),selected,"Combined receipts by committee");
const bars=$("ca-bars");bars.replaceChildren();const key=document.createElement("div");key.className="ca-bar-key";key.innerHTML='<span><i class="ca-swatch" style="background:'+indColor+'"></i>Individual</span><span><i class="ca-swatch" style="background:'+orgColor+'"></i>PAC / organization</span>';bars.append(key);const max=gross(ordered[0]);for(const x of ordered){const b=document.createElement("button");b.type="button";b.className="ca-bar"+(x.key===selected?" ca-selected":"");b.setAttribute("aria-pressed",String(x.key===selected));b.title=x.name+": "+money(gross(x));b.innerHTML='<span>'+esc(x.name)+'</span><span class="ca-track"><span style="background:'+indColor+';width:'+100*x.individual/max+'%"></span><span style="background:'+orgColor+';width:'+100*x.organization/max+'%"></span></span><span class="ca-bar-amount">'+money(gross(x))+'</span>';b.addEventListener("click",()=>chooseCommittee(x.key));bars.append(b);}
$("ca-committee-rows").innerHTML=ordered.map(x=>'<tr><td><a href="'+x.slug+'.html">'+esc(x.name)+'</a></td><td class="jvf-money">'+money(x.individual)+'</td><td class="jvf-money">'+money(x.organization)+'</td><td class="jvf-money"><strong>'+money(gross(x))+'</strong></td><td>'+pct(gross(x),all)+'</td></tr>').join("")+'<tr><th scope="row">Combined total</th><td>'+money(sum(config,"individual"))+'</td><td>'+money(sum(config,"organization"))+'</td><td><strong>'+money(all)+'</strong></td><td>100.00%</td></tr>';
renderOrganizations();}
function renderOrganizations(){
if(!allRecords){$("ca-org-rows").innerHTML='<tr><td colspan="5">Loading all three committee datasets…</td></tr>';$("ca-prev").disabled=$("ca-next").disabled=true;return;}
const records=selected?allRecords.filter(x=>x.committee===selected):allRecords;
const allSectorGroups=aggregateSectors(records),groups=allSectorGroups.filter(x=>isResearchedSectorName(x.name)),opt=$("ca-sector");opt.replaceChildren(new Option("All researched sectors",""));for(const x of [...groups].sort((a,b)=>a.name.localeCompare(b.name)))opt.add(new Option(x.name,x.name));if(!groups.some(x=>x.name===sectorSelected))sectorSelected="";opt.value=sectorSelected;
const combinedColored=sectorItems(groups);
const combinedColors=new Map(combinedColored.filter(x=>x.value>0).map(x=>[x.name,x.color]));
donut($("ca-all-sector-pie"),combinedColored,x=>chooseSector(x.key),sectorSelected,"All direct receipts by researched sector");sectorCoverage($("ca-all-sector-pie"),allSectorGroups);
donut($("ca-sector-pie"),sectorItems(groups.filter(x=>x.organization!==0).map(x=>({...x,value:x.organization}))),x=>{mode="organization";$("ca-mode").value=mode;chooseSector(x.key);},sectorSelected,"Direct organizations by researched sector");sectorCoverage($("ca-sector-pie"),allSectorGroups,"organization");
donut($("ca-ind-sector-pie"),sectorItems(groups.filter(x=>x.individual!==0).map(x=>({...x,value:x.individual}))),x=>{mode="individual";$("ca-mode").value=mode;chooseSector(x.key);},sectorSelected,"Individual receipts by researched sector");sectorCoverage($("ca-ind-sector-pie"),allSectorGroups,"individual");
const denominator=sum(groups,"value"),unclassified=allSectorGroups.filter(x=>!isResearchedSectorName(x.name)),unclassifiedTotal=sum(unclassified,"value");
$("ca-sector-rows").innerHTML=groups.map(x=>'<tr><td><button type="button" class="ca-sector-link" data-sector="'+esc(x.name)+'"><span class="ca-swatch ca-sector-swatch" style="background:'+(combinedColors.get(x.name)||'transparent')+'" aria-hidden="true"></span>'+esc(x.name)+'</button></td><td class="jvf-money">'+money(x.organization)+'</td><td class="jvf-money">'+money(x.individual)+'</td><td class="jvf-money"><strong>'+money(x.value)+'</strong></td><td>'+pct(x.value,denominator)+'</td></tr>').join("")+'<tr><th scope="row">'+(loadFailures.length?"Loaded researched-sector subtotal":"Researched-sector total")+'</th><td>'+money(sum(groups,"organization"))+'</td><td>'+money(sum(groups,"individual"))+'</td><td><strong>'+money(denominator)+'</strong></td><td>'+(denominator?"100.00%":"—")+'</td></tr>'+(unclassifiedTotal?'<tr class="ca-muted"><th scope="row">Records without a researched sector assignment</th><td>'+money(sum(unclassified,"organization"))+'</td><td>'+money(sum(unclassified,"individual"))+'</td><td><strong>'+money(unclassifiedTotal)+'</strong></td><td>Excluded above</td></tr>':'');
for(const b of $("ca-sector-rows").querySelectorAll("button"))b.addEventListener("click",()=>chooseSector(b.dataset.sector));
$("ca-name-heading").textContent=mode==="organization"?"Organization / PAC":mode==="individual"?"Individual donor":"Reported employer";
const roleGroups=roleTotals(records);const roleSum=sum(roleGroups,"value"),individualCount=roleGroups.reduce((n,r)=>n+r.count,0);const individualNames=new Set(records.filter(r=>r.type==="individual").map(r=>normalize(r.name||"NOT REPORTED")));
$("ca-role-summary").textContent=num(individualNames.size)+" distinct reported names · "+num(individualCount)+" individual receipts · "+money(roleSum);
const roleOpt=$("ca-role");roleOpt.replaceChildren(new Option("All reported roles",""));for(const r of [...roleGroups].sort((a,b)=>a.name.localeCompare(b.name)))roleOpt.add(new Option(r.name,r.key));if(!roleGroups.some(r=>r.key===roleSelected))roleSelected="";if(mode==="organization")roleSelected="";roleOpt.value=roleSelected;roleOpt.disabled=mode==="organization";
function selectRole(key){exactOccupation="";mode="individual";$("ca-mode").value=mode;roleSelected=roleSelected===key?"":key;page=0;renderOrganizations();}
donut($("ca-role-pie"),sequentialItems(roleGroups),r=>selectRole(r.key),roleSelected,"Individual contributions by reported occupation group");
$("ca-role-rows").innerHTML=roleGroups.map(r=>'<tr><td><button type="button" class="ca-sector-link" data-role="'+esc(r.key)+'">'+esc(r.name)+'</button></td><td>'+num(r.names.size)+'</td><td>'+num(r.count)+'</td><td class="jvf-money">'+money(r.value)+'</td><td>'+pct(r.value,roleSum)+'</td></tr>').join("")+'<tr><th scope="row">Total</th><td>'+num(individualNames.size)+'</td><td>'+num(individualCount)+'</td><td>'+money(roleSum)+'</td><td>'+(roleSum?"100.00%":"—")+'</td></tr>';
for(const b of $("ca-role-rows").querySelectorAll("button"))b.addEventListener("click",()=>selectRole(b.dataset.role));
const statusRows=new Map(personalCategories.map(k=>[k,[]]));for(const r of records){if(r.type!=="individual")continue;const k=occupationGroup(r.occupation);if(statusRows.has(k))statusRows.get(k).push(r);}
for(const [i,k] of personalCategories.entries()){
const matching=statusRows.get(k),g=roleGroups.find(x=>x.key===k),m=new Map();
for(const r of matching){const label=normalize(r.occupation||"NOT REPORTED");let x=m.get(label);if(!x){x={name:label,value:0,count:0,names:new Set()};m.set(label,x);}x.value+=r.amount;x.count++;x.names.add(normalize(r.name||"NOT REPORTED"));}
const titles=[...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));const total=sum(titles,"value"),count=sum(titles,"count");
if(total!==(g?.value||0)||count!==(g?.count||0))throw Error("Status table reconciliation failed: "+k);
$("ca-personal-summary-"+i).textContent=num(g?.names.size||0)+" distinct reported names · "+num(count)+" receipt records · "+money(total);
$("ca-personal-body-"+i).innerHTML=titles.map(x=>'<tr><td><button type="button" class="ca-sector-link" data-occupation="'+esc(x.name)+'">'+esc(x.name)+'</button></td><td>'+num(x.names.size)+'</td><td>'+num(x.count)+'</td><td class="jvf-money">'+money(x.value)+'</td></tr>').join("")||'<tr><td colspan="4">No matching records.</td></tr>';
$("ca-personal-total-"+i).innerHTML='<tr><th scope="row">Total</th><td>'+num(g?.names.size||0)+'</td><td>'+num(count)+'</td><td class="jvf-money">'+money(total)+'</td></tr>';
for(const b of $("ca-personal-body-"+i).querySelectorAll("button"))b.addEventListener("click",()=>{mode="individual";$("ca-mode").value=mode;roleSelected=k;sectorSelected="";query="";$("ca-search").value="";exactOccupation=b.dataset.occupation;page=0;renderOrganizations();$("ca-org-rows").closest("section")?.scrollIntoView({block:"start"});});
}
const nonExec=nonExecutiveTotals(records,occupationGroup),nonExecSum=sum(nonExec,"value"),nonExecCount=sum(nonExec,"count");
const expectedNonExec=roleGroups.filter(r=>nonExecutiveGroups.has(r.key));
if(nonExecSum!==sum(expectedNonExec,"value")||nonExecCount!==sum(expectedNonExec,"count"))throw Error("Reported occupation totals do not reconcile");
$("ca-nonexec-summary").textContent=num(nonExec.length)+" distinct reported titles · "+num(nonExecCount)+" individual receipts · "+money(nonExecSum);
const nonExecFiltered=nonExec.filter(r=>!occupationQuery||r.name.includes(occupationQuery));
const occMax=Math.max(1,Math.ceil(nonExecFiltered.length/pageSize));occupationPage=Math.max(0,Math.min(occupationPage,occMax-1));
$("ca-nonexec-rows").innerHTML=nonExecFiltered.slice(occupationPage*pageSize,(occupationPage+1)*pageSize).map(r=>'<tr><td><button type="button" class="ca-sector-link" data-occupation="'+esc(r.name)+'">'+esc(r.name)+'</button></td><td>'+esc(r.group)+'</td><td>'+num(r.names.size)+'</td><td>'+num(r.count)+'</td><td class="jvf-money">'+money(r.value)+'</td><td>'+pct(r.value,nonExecSum)+'</td></tr>').join("")||'<tr><td colspan="6">No matching occupations.</td></tr>';
$("ca-nonexec-total").innerHTML='<tr><th scope="row">All non-executive / other reported titles</th><td>—</td><td>—</td><td>'+num(nonExecCount)+'</td><td class="jvf-money">'+money(nonExecSum)+'</td><td>'+(nonExecSum?"100.00%":"—")+'</td></tr>';
$("ca-nonexec-page").textContent="Page "+(occupationPage+1)+" of "+occMax;
$("ca-nonexec-prev").disabled=occupationPage===0;$("ca-nonexec-next").disabled=occupationPage>=occMax-1;
for(const b of $("ca-nonexec-rows").querySelectorAll("button"))b.addEventListener("click",()=>{mode="individual";$("ca-mode").value=mode;roleSelected="";sectorSelected="";query="";$("ca-search").value="";exactOccupation=b.dataset.occupation;page=0;renderOrganizations();$("ca-org-rows").closest("section")?.scrollIntoView({block:"start"});});
$("ca-exact-occupation").hidden=!exactOccupation;$("ca-exact-occupation-label").textContent=exactOccupation;
const roleRecords=records.filter(r=>(!roleSelected||(r.type==="individual"&&occupationGroup(r.occupation)===roleSelected))&&(!exactOccupation||(r.type==="individual"&&normalize(r.occupation)===exactOccupation)));
const candidates=aggregateDonors(roleRecords,mode);
$("ca-role-heading").hidden=mode==="organization";
const donors=candidates.filter(x=>(!sectorSelected||[...x.sectors].some(s=>s===sectorSelected))&&(!query||x.name.includes(query)||[...x.employers,...x.occupations].some(v=>v.includes(query))));
const max=Math.max(1,Math.ceil(donors.length/pageSize));page=Math.max(0,Math.min(page,max-1));const rows=donors.slice(page*pageSize,(page+1)*pageSize);
$("ca-org-rows").innerHTML=rows.length?rows.map(x=>'<tr><td class="jvf-contributor">'+esc(x.name)+'</td><td>'+esc([...new Set([...x.sectors].map(s=>isResearchedSectorName(s)?s:"Sector research pending"))].sort().join("; "))+(mode==="individual"?'<small class="jvf-row-note">'+esc([...x.employers].sort().join("; "))+'</small>':"")+'</td>'+(mode==="organization"?"":'<td class="ca-occupation-cell"><details><summary>'+esc([...x.occupations].sort().join("; "))+'</summary><div class="ca-role-details">'+[...x.roleDetails.values()].sort((a,b)=>b.amount-a.amount||a.occupation.localeCompare(b.occupation)).map(d=>'<div><span>'+esc(d.occupation)+'<small>'+esc(d.employer)+'</small></span><strong>'+money(d.amount)+'</strong></div>').join("")+'</div></details></td>')+'<td><details><summary>'+x.committees.size+' '+(x.committees.size===1?"committee":"committees")+'</summary><div class="ca-breakdown">'+[...x.committees].sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=config.find(y=>y.key===k);return '<div><a href="'+c.slug+'.html">'+esc(c.name)+'</a><strong>'+money(v)+'</strong></div>';}).join("")+'</div></details></td><td>'+num(x.count)+'</td><td class="jvf-money"><strong>'+money(x.value)+'</strong></td></tr>').join(""):'<tr><td colspan="'+(mode==="organization"?5:6)+'">No matching donors.</td></tr>';
$("ca-result-count").textContent=num(donors.length)+" reported names · "+money(sum(donors,"value"))+(roleSelected?" · Amounts restricted to matching reported-role receipts":"")+(sectorSelected?" · Matching donor sectors":"");$("ca-page").textContent="Page "+(page+1)+" of "+max;$("ca-prev").disabled=page===0;$("ca-next").disabled=page>=max-1;
}
async function start(){
await Promise.all(config.map(loadCommittee));
for(const c of config)$("ca-committee").add(new Option(c.name,c.key));
$("ca-committee").addEventListener("change",e=>{selected=e.target.value;sectorSelected="";page=0;render();});
$("ca-sector").addEventListener("change",e=>{sectorSelected=e.target.value;page=0;renderOrganizations();});
$("ca-mode").addEventListener("change",e=>{mode=e.target.value;if(mode==="organization"){roleSelected="";exactOccupation="";}page=0;renderOrganizations();});
$("ca-role").addEventListener("change",e=>{roleSelected=e.target.value;exactOccupation="";page=0;renderOrganizations();});
$("ca-search").addEventListener("input",e=>{query=normalize(e.target.value);page=0;renderOrganizations();});
$("ca-reset").addEventListener("click",()=>{selected=sectorSelected=query=roleSelected=exactOccupation=occupationQuery="";occupationPage=0;$("ca-nonexec-search").value="";mode="organization";page=0;$("ca-committee").value=$("ca-search").value="";$("ca-mode").value=mode;render();});
$("ca-nonexec-search").addEventListener("input",e=>{occupationQuery=normalize(e.target.value);occupationPage=0;renderOrganizations();});
$("ca-nonexec-prev").addEventListener("click",()=>{occupationPage--;renderOrganizations();});
$("ca-nonexec-next").addEventListener("click",()=>{occupationPage++;renderOrganizations();});
$("ca-clear-occupation").addEventListener("click",()=>{exactOccupation="";page=0;renderOrganizations();});
$("ca-prev").addEventListener("click",()=>{page--;renderOrganizations();});$("ca-next").addEventListener("click",()=>{page++;renderOrganizations();});
$("ca-status").textContent="Reconciling all three committees…";render();
const results=await Promise.allSettled(config.map(loadCommittee));allRecords=[];loadFailures=[];
results.forEach((r,i)=>{if(r.status==="fulfilled"){allRecords.push(...r.value);loadedCommittees++;}else{loadFailures.push(config[i].name+": "+String(r.reason?.message||r.reason));console.error(r.reason);}});
const expected=sum(config,"individual")+sum(config,"organization"),actual=sum(allRecords,"amount");
if(!loadFailures.length&&(actual!==expected||allRecords.length!==sum(config,"individualCount")+sum(config,"organizationCount")))loadFailures.push("Combined source reconciliation failed");
$("ca-status").textContent=loadFailures.length?"PARTIAL DATA: "+loadedCommittees+" of 3 committees loaded. "+loadFailures.join("; "):"All 3 committees reconciled · "+num(allRecords.length)+" direct records";
if(loadFailures.length){for(const id of ["ca-all-sector-pie","ca-sector-pie","ca-ind-sector-pie","ca-sector-rows","ca-org-rows","ca-role-pie","ca-role-rows","ca-nonexec-rows"]){$(id).closest("section")?.classList.add("ca-partial");}}
renderOrganizations();
}
start().catch(e=>{$("ca-status").textContent="Dashboard error: "+e.message;console.error(e);});})();