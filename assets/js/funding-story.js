import {colorAt} from './chart-palette.js?v=claude1';
import {buildDirectory} from './business-data.js?v=claude1';
import {networkData,normalize} from './donor-data.js?v=claude1';
const {config}=networkData('jeffries');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n/100);
const exact=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
const total=rows=>rows.reduce((v,r)=>v+r.amount,0);
const committee=k=>config.find(c=>c.key===k);
export function groupPeople(records){
 const m=new Map();
 for(const r of records){if(r.type!=='individual'||r.memo)continue;const name=normalize(r.name);if(!m.has(name))m.set(name,{name,records:[],value:0});const g=m.get(name);g.records.push(r);g.value+=r.amount;}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
export function fundingRoutes(records){
 const m=new Map();
 for(const r of records){if(r.memo)continue;const key=JSON.stringify([r.type,normalize(r.name)]);if(!m.has(key))m.set(key,{name:normalize(r.name),type:r.type,value:0,employers:new Set(),roles:new Set(),destinations:new Map()});const g=m.get(key);g.value+=r.amount;if(r.employer)g.employers.add(r.employer);if(r.occupation)g.roles.add(r.occupation);g.destinations.set(r.committee,(g.destinations.get(r.committee)||0)+r.amount);}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
let state={records:null,selected:'',businesses:[],people:[],view:'business',query:'',key:'',bound:false};
function routesHTML(routes){return routes.map(r=>`<div class="funding-route"><div class="funding-giver"><span class="funding-type">${r.type==='individual'?'PERSONAL DONATION':'PAC / ORGANIZATION'}</span><strong>${esc(r.name)}</strong>${r.roles.size?`<small>${esc([...r.roles].join(' · '))}</small>`:''}${state.view==='people'&&r.employers.size?`<small>Reported employer: ${esc([...r.employers].join(' · '))}</small>`:''}<b>${exact(r.value)}</b></div><div class="funding-destinations">${[...r.destinations].sort((a,b)=>b[1]-a[1]).map(([key,value])=>`<div class="funding-destination"><span class="funding-arrow" aria-hidden="true">→</span><a href="${committee(key).slug}.html">${esc(committee(key).name)}</a><strong>${exact(value)}</strong></div>`).join('')}</div></div>`).join('');}
function connection(g){
 const node=document.getElementById('funding-connection');if(!g){node.innerHTML='';return;}
 const routes=fundingRoutes(g.records),people=g.records.filter(r=>r.type==='individual'),org=g.records.filter(r=>r.type==='organization');
 const research=g.research?.status==='Source-backed'?g.research:null;
 const sources=(research?.sources||[]).filter(u=>/^https?:\/\//.test(u));
 node.innerHTML=`<div class="funding-selected-heading"><div><p class="ca-eyebrow">${state.view==='business'?'BUSINESS / ORGANIZATION CONNECTION':'INDIVIDUAL DONOR'}</p><h3>${esc(g.name)}</h3></div><strong>${exact(g.value)}</strong></div>
 ${state.view==='business'?`<div class="funding-split"><span><i class="funding-key pac"></i>PAC / organization donations <b>${exact(total(org))}</b></span><span><i class="funding-key people"></i>Personal donations by reported employees <b>${exact(total(people))}</b></span></div>`:''}
 ${research?.parent?`<p class="funding-parent">Related parent / organization: <strong>${esc(research.parent)}</strong></p>`:''}
 ${research?`<details class="funding-evidence"><summary>Business identity and sources</summary><p>${esc(research.evidence)}</p>${sources.map((u,i)=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Source ${i+1}</a>`).join(' · ')}</details>`:''}
 <div class="funding-route-head"><span>WHO GAVE THE MONEY</span><span>WHERE IT WENT</span></div>${routesHTML(routes.slice(0,6))}
 ${routes.length>6?`<details class="funding-more"><summary>Show ${routes.length-6} more donors / PACs · ${exact(routes.slice(6).reduce((v,r)=>v+r.value,0))}</summary>${routesHTML(routes.slice(6))}</details>`:''}
 <p class="ca-muted">${state.view==='business'?'Employer links identify personal donations alongside PAC / organization donations. The two amounts are shown separately above.':'Contributions are grouped by the reported donor name.'}</p>`;
}
function draw(){
 const groups=state.view==='business'?state.businesses:state.people;
 const matches=groups.filter(g=>!state.query||normalize(g.name).includes(state.query)||g.records.some(r=>normalize(r.name).includes(state.query)||normalize(r.employer).includes(state.query)));
 const shown=matches.slice(0,8);if(!shown.some(g=>g.name===state.key))state.key=shown[0]?.name||'';
 const max=shown[0]?.value||1;
 document.getElementById('funding-summary').textContent=`${shown.length?`Largest ${shown.length} of ${matches.length.toLocaleString()} ${state.view==='business'?'business / organization connections':'reported donor names'}`:'No matching names'}${state.selected?' · '+committee(state.selected).name:' · All eight committees'}. ${state.view==='business'?'Business totals combine PAC / organization money and personal donations by reported employees.':'Amounts are total personal contributions in these records.'}`;
 const host=document.getElementById('funding-bubbles');host.innerHTML=shown.map((g,i)=>`<button type="button" class="funding-bubble ${state.view==='people'?'is-person':''}" data-index="${i}" aria-pressed="${g.name===state.key}" aria-label="${esc(g.name)}, ${exact(g.value)}. Show connections"><span class="funding-orbit" style="--funding-color:${colorAt(i)}" aria-hidden="true"><span style="width:${100*Math.sqrt(g.value/max)}%;aspect-ratio:1"></span></span><span class="funding-name">${esc(g.name)}</span><strong>${dollars(g.value)}</strong></button>`).join('');
 host.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.key=shown[+b.dataset.index].name;host.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));connection(shown[+b.dataset.index]);}));
 connection(shown.find(g=>g.name===state.key));
}
function concentration(){
 const sum=state.people.reduce((v,g)=>v+g.value,0),top=state.people.slice(0,10).reduce((v,g)=>v+g.value,0),share=sum?top/sum*100:0;
 const host=document.getElementById('funding-concentration');
 if(sum<=0||share<0||share>100){host.textContent='No positive individual contribution total in this selection.';return;}
 host.innerHTML=`<div class="funding-concentration-layout"><div><p class="funding-stat">${share.toFixed(1)}%</p><p>The <strong>${Math.min(10,state.people.length)} largest reported donor names</strong> supplied <strong>${exact(top)}</strong> of ${exact(sum)} given by individuals.</p><p class="ca-muted">Each dot = 1% of individual contribution dollars. The boundary dot is filled proportionally.</p></div><div class="funding-dots" role="img" aria-label="Top ten reported donor names supplied ${share.toFixed(1)} percent of individual contributions">${Array.from({length:100},(_,i)=>`<i style="--fill:${Math.max(0,Math.min(100,(share-i)*100))}%"></i>`).join('')}</div></div><div class="funding-dot-key"><span><i></i>Largest 10 donor names</span><span><i></i>All other donor names</span></div>`;
}
export function renderFundingStory(records,selected=''){
 if(state.records!==records||state.selected!==selected){state.records=records;state.selected=selected;const filtered=selected?records.filter(r=>r.committee===selected):records;
 state.businesses=buildDirectory(filtered).filter(g=>!g.personal&&g.organization+g.individual>0).map(g=>({...g,value:g.organization+g.individual})).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));state.people=groupPeople(filtered);concentration();}
 const view=document.getElementById('funding-view'),search=document.getElementById('funding-search');
 if(!view||!search||!document.getElementById('funding-bubbles')||!document.getElementById('funding-connection')||!document.getElementById('funding-summary'))return;
 if(!state.bound){state.bound=true;view.addEventListener('change',e=>{state.view=e.target.value;state.key='';draw();});search.addEventListener('input',e=>{state.query=normalize(e.target.value);draw();});document.getElementById('ca-reset').addEventListener('click',()=>{state.view='business';state.query=state.key='';view.value='business';search.value='';draw();});}
 draw();
}
