import {renderFundingStory} from "./funding-story.js?v=master-sectors1";
import {config,normalize,occupationGroup,personalCategories,loadCommittee} from "./research-data.js?v=master-sectors1";
(()=>{"use strict";
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n/100),num=n=>n.toLocaleString("en-US"),sum=(a,k)=>a.reduce((n,r)=>n+r[k],0),gross=r=>r.individual+r.organization,pct=(n,d)=>d?((n/d)*100).toFixed(2)+"%":"0.00%";
// Chart colors sampled from the supplied palette, converted to sRGB.
const chartPalette={"blue":["#ecfeff","#74cbf5","#66a8e5","#5ca6f1","#599aee","#4063c7"],"teal":["#f2feff","#acfaf1","#a2f2ea","#7fdfd1","#65c9bd"],"green":["#f5fef2","#c0fb74","#b6f16e","#86ec4f","#7fe148","#5a9e31"],"orange":["#f2a43b","#ec722f","#f09638"],"red":["#f1a38a","#e74a41","#ea3a2e","#ed7147","#e04033"],"pink":["#f9d9ef","#f19dc7","#e46cac","#ea8cae"],"purple":["#f9dafa","#dc64d4","#dc69d1"],"yellow":["#fffed9","#fcef6e","#f4e14a","#f2ce45"]};
const committeeColors={"jvf":"#ecfeff","jfc":"#74cbf5","jbpf":"#66a8e5","jeff-pac":"#5ca6f1","jmf":"#599aee","jcvf":"#4063c7","dvtlf":"#f2feff","jcavf":"#acfaf1"};
const sequence=[...chartPalette.blue,...chartPalette.teal,...chartPalette.green,...chartPalette.yellow,...chartPalette.orange,...chartPalette.red,...chartPalette.pink,...chartPalette.purple];
const indColor=chartPalette.blue[4],orgColor=chartPalette.teal[4];
function sequentialItems(items){return [...items].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)).map((item,i)=>({...item,color:sequence[i%sequence.length]}));}
let selected="",allRecords=null;
function roleTotals(rows){
 const m=new Map();
 for(const r of rows){if(r.type!=="individual")continue;const key=occupationGroup(r.occupation);let x=m.get(key);if(!x){x={name:key,key,value:0,count:0,names:new Set()};m.set(key,x);}x.value+=r.amount;x.count++;x.names.add(normalize(r.name||"NOT REPORTED"));}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function aggregateSectors(rows){
 const m=new Map();
 for(const r of rows){let v=m.get(r.sector);if(!v){v={name:r.sector==="Personal status / unreported employer"?"Donors without an identified business sector":r.sector,key:r.sector,value:0,individual:0,organization:0,count:0};m.set(r.sector,v);}v.value+=r.amount;v[r.type]+=r.amount;v.count++;}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function donut(host,items,onSelect,active,label){host.replaceChildren();const positive=items.filter(x=>x.value>0),den=sum(positive,"value");if(!den){host.textContent="No positive receipts in this selection.";return;}const wrap=document.createElement("div");wrap.className="ca-chart";const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 220 220");svg.setAttribute("class","ca-donut");svg.setAttribute("role","group");svg.setAttribute("aria-label",label);const radius=84,circ=2*Math.PI*radius;let off=0;const legend=document.createElement("div");legend.className="ca-legend";
positive.forEach((item,i)=>{const color=item.color||sequence[i%sequence.length],c=document.createElementNS(svg.namespaceURI,"circle"),frac=item.value/den;for(const [k,v] of Object.entries({cx:110,cy:110,r:radius,fill:"none",stroke:color,"stroke-width":34,"stroke-dasharray":Math.max(frac*circ-Math.min(1.8,frac*circ*.15),0.01)+" "+circ,"stroke-dashoffset":-off,transform:"rotate(-90 110 110)"}))c.setAttribute(k,v);off+=frac*circ;const desc=item.name+": "+money(item.value)+" ("+pct(item.value,den)+")";const title=document.createElementNS(svg.namespaceURI,"title");title.textContent=desc;c.append(title);if(onSelect){c.setAttribute("role","button");c.setAttribute("tabindex","0");c.setAttribute("aria-label",desc);c.addEventListener("click",()=>onSelect(item));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(item);}});}svg.append(c);
const b=document.createElement(onSelect?"button":"div");if(onSelect){b.type="button";b.addEventListener("click",()=>onSelect(item));b.setAttribute("aria-pressed",String(active===item.key));}else{b.style.display="flex";b.style.alignItems="center";b.style.gap="9px";b.style.padding="7px";}if(active===item.key&&onSelect)b.classList.add("ca-selected");b.innerHTML='<span class="ca-swatch" style="background:'+color+'"></span><span class="ca-legend-name">'+esc(item.name)+'</span><span class="ca-legend-value">'+money(item.value)+'<small>'+pct(item.value,den)+'</small></span>';legend.append(b);});
const text=document.createElementNS(svg.namespaceURI,"text");text.setAttribute("x",110);text.setAttribute("y",105);text.setAttribute("text-anchor","middle");text.setAttribute("font-size","11");text.textContent="TOTAL";svg.append(text);const val=document.createElementNS(svg.namespaceURI,"text");val.setAttribute("x",110);val.setAttribute("y",124);val.setAttribute("text-anchor","middle");val.setAttribute("font-size","12");val.setAttribute("font-weight","700");val.textContent=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(den/100);svg.append(val);wrap.append(svg,legend);host.append(wrap);
const nonPositive=items.filter(x=>x.value<=0);if(nonPositive.length){const p=document.createElement("p");p.className="ca-muted";p.textContent="Zero or negative groups are excluded from pie slices.";host.append(p);}}

function chooseCommittee(key){selected=selected===key?"":key;$("ca-committee").value=selected;render();}
function activeCommittees(){return selected?config.filter(x=>x.key===selected):config;}
function render(){const active=activeCommittees(),ic=sum(active,"individual"),oc=sum(active,"organization"),total=ic+oc,all=sum(config,"individual")+sum(config,"organization");
$("ca-total").textContent=money(total);$("ca-scope").textContent=selected?active[0].name:"All eight committees";$("ca-ind").textContent=money(ic);$("ca-org").textContent=money(oc);$("ca-count").textContent=num(sum(active,"individualCount")+sum(active,"organizationCount"));
const ordered=[...config].sort((a,b)=>gross(b)-gross(a));donut($("ca-committee-pie"),ordered.map((x,i)=>({name:x.name,key:x.key,value:gross(x),color:committeeColors[x.key]})),x=>chooseCommittee(x.key),selected,"Combined receipts by committee");
donut($("ca-source-pie"),[{name:"Contributions from people",key:"ind",value:ic,color:indColor},{name:"Contributions from PACs / organizations",key:"org",value:oc,color:orgColor}],null,"","Receipt sources");
const bars=$("ca-bars");bars.replaceChildren();const key=document.createElement("div");key.className="ca-bar-key";key.innerHTML='<span><i class="ca-swatch" style="background:'+indColor+'"></i>Individual</span><span><i class="ca-swatch" style="background:'+orgColor+'"></i>PAC / organization</span>';bars.append(key);const max=gross(ordered[0]);for(const x of ordered){const b=document.createElement("button");b.type="button";b.className="ca-bar"+(x.key===selected?" ca-selected":"");b.setAttribute("aria-pressed",String(x.key===selected));b.title=x.name+": "+money(gross(x));b.innerHTML='<span>'+esc(x.name)+'</span><span class="ca-track"><span style="background:'+indColor+';width:'+100*x.individual/max+'%"></span><span style="background:'+orgColor+';width:'+100*x.organization/max+'%"></span></span><span class="ca-bar-amount">'+money(gross(x))+'</span>';b.addEventListener("click",()=>chooseCommittee(x.key));bars.append(b);}

if(!allRecords)return;
const records=selected?allRecords.filter(r=>r.committee===selected):allRecords;
const groups=aggregateSectors(records);
donut($("ca-all-sector-pie"),sequentialItems(groups),null,"","All contributions by sector");
donut($("ca-sector-pie"),sequentialItems(groups.map(g=>({...g,value:g.organization}))),null,"","PACs and organizations by sector");
donut($("ca-ind-sector-pie"),sequentialItems(groups.map(g=>({...g,value:g.individual}))),null,"","Personal contributions by employer sector");
const roles=roleTotals(records);
$("ca-role-summary").textContent=money(sum(roles,"value"))+" in personal contributions";
donut($("ca-role-pie"),sequentialItems(roles),null,"","Contributions by reported occupation");
renderFundingStory(allRecords,selected);
}
async function start(){
for(const c of config)$("ca-committee").add(new Option(c.name,c.key));
$("ca-committee").addEventListener("change",e=>{selected=e.target.value;render();});
$("ca-reset").addEventListener("click",()=>{selected="";$("ca-committee").value="";render();});
$("ca-status").textContent="Loading committee data…";render();
allRecords=(await Promise.all(config.map(loadCommittee))).flat();
if(sum(allRecords,"amount")!==sum(config,"individual")+sum(config,"organization")||allRecords.length!==sum(config,"individualCount")+sum(config,"organizationCount"))throw Error("Combined source reconciliation failed");
$("ca-status").textContent="All eight committees loaded";render();
}
start().catch(e=>{allRecords=null;$("ca-status").textContent="Unable to load verified data: "+e.message;$("funding-summary").textContent="Funding visuals unavailable.";$("funding-concentration").textContent="Unavailable until committee data loads.";console.error(e);});})();
