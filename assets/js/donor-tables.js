import {mountDonorVisuals} from './donor-visuals.js?v=categories1';
import {groupDonors} from './donor-groups.js?v=categories1';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=set=>[...set].sort().join('; ')||'Not reported';
const sum=rows=>rows.reduce((n,r)=>n+r.amount,0);
const source=r=>/^\d{15,20}$/.test(String(r.image))?`<a href="https://docquery.fec.gov/cgi-bin/fecimg/?${r.image}" target="_blank" rel="noopener noreferrer">FEC filing</a>`:'—';
function researchDetails(group){
 if(!group.businessResearch.size)return '—';
 return [...group.businessResearch.values()].map(identity=>{
  const r=identity.research;
  if(!r)return `<div>${esc(identity.reported)}<small>Not reviewed</small></div>`;
  const sources=(r.sources||[]).filter(url=>/^https?:\/\//i.test(url));
  return `<details class="donor-business-research"><summary>${esc(identity.name)} · ${esc(r.status)}</summary><p>Reported as: ${esc(identity.reported)}</p><p>${esc(r.scope||'')}</p>${r.parent?`<p>Parent company: ${esc(r.parent)}</p>`:''}<p>${esc(r.evidence||'')}</p>${r.sectorEvidence?`<p>Sector: ${esc(r.sector)} · ${esc(r.sectorEvidence)}</p>`:''}<p>${sources.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${i+1}</a>`).join(' · ')}</p><p>Reviewed: ${esc(r.reviewed||'')}</p></details>`;
 }).join('');
}
function receiptDetails(group,config){
 const details=document.createElement('details'),summary=document.createElement('summary');
 summary.textContent=group.records.length.toLocaleString()+' receipts';details.append(summary);
 details.addEventListener('toggle',()=>{
  if(!details.open||details.dataset.loaded)return;details.dataset.loaded='true';
  let shown=0;const body=document.createElement('div'),more=document.createElement('button');more.type='button';more.textContent='Show more receipts';
  const append=()=>{for(const r of group.records.slice(shown,shown+50)){const line=document.createElement('p');line.innerHTML=`${esc(r.date||'Date not supplied')} · ${esc(config.find(c=>c.key===r.committee)?.name||r.committee)} · ${money(r.amount)} · ${source(r)}`;body.append(line);}shown+=50;more.hidden=shown>=group.records.length;};
  more.addEventListener('click',append);details.append(body,more);append();
 });return details;
}
function table(host,key,title,description,groups,config){
 const section=document.createElement('section');section.className='donor-table-section';section.dataset.donorGroup=key;
 section.innerHTML=`<h2>${title}</h2><p>${description}</p><p class="donor-table-total">${groups.length.toLocaleString()} donors · <strong>${money(sum(groups))}</strong></p><label>Search this table <input type="search" placeholder="Name, employer, sector…"></label><div data-donor-visuals></div><div class="jvf-table-wrap"><table class="jvf-table"><thead><tr><th scope="col">${key==='organizations'?'PAC / political committee / organization':'Individual donor'}</th>${key==='organizations'?'':'<th scope="col">Reported employer(s)</th><th scope="col">Reported occupation(s)</th>'}<th scope="col">Business identity &amp; research</th><th scope="col">Sector</th><th scope="col">Receiving committees</th><th scope="col">Total donated</th><th scope="col">Receipt details</th></tr></thead><tbody></tbody></table></div><div class="donor-table-pagination"><button type="button" data-prev>Previous</button><span role="status"></span><button type="button" data-next>Next</button></div>`;
 const input=section.querySelector('input'),body=section.querySelector('tbody'),prev=section.querySelector('[data-prev]'),next=section.querySelector('[data-next]'),status=section.querySelector('[role=status]');let page=0,visualQuery=null;
 const visuals=mountDonorVisuals(section.querySelector('[data-donor-visuals]'));
 function draw(){
  const q=input.value.trim().toUpperCase(),filtered=groups.filter(g=>!q||[g.name,list(g.employers),list(g.occupations),list(g.sectors),list(g.reportedNames),list(g.reportedEmployers),...[...g.businessResearch.values()].map(i=>i.research?.parent||'')].join(' ').toUpperCase().includes(q));
  if(q!==visualQuery){visualQuery=q;visuals.update(filtered);}
  body.replaceChildren();
  for(const g of filtered.slice(page*50,page*50+50)){
   const row=document.createElement('tr');row.innerHTML=`<td>${esc(g.name)}${key==='organizations'&&[...g.reportedNames].some(n=>n!==g.name)?`<small>Reported as: ${esc(list(g.reportedNames))}</small>`:''}</td>${key==='organizations'?'':`<td>${esc(list(g.employers))}${list(g.reportedEmployers)!==list(g.employers)?`<small>Reported as: ${esc(list(g.reportedEmployers))}</small>`:''}</td><td>${esc(list(g.occupations))}</td>`}<td>${researchDetails(g)}</td><td>${esc(list(g.sectors))}</td><td>${[...g.committees].map(([k,v])=>{const c=config.find(c=>c.key===k);return `<div><a href="/pages/${esc(c?.slug)}.html">${esc(c?.name||k)}</a> · ${money(v)}</div>`;}).join('')}</td><td class="jvf-money"><strong>${money(g.amount)}</strong></td><td></td>`;
   row.lastElementChild.append(receiptDetails(g,config));body.append(row);
  }
  if(!filtered.length){const row=document.createElement('tr');row.innerHTML=`<td colspan="${key==='organizations'?7:9}">No matching donors.</td>`;body.append(row);}
  status.textContent=`${filtered.length? page*50+1:0}–${Math.min((page+1)*50,filtered.length)} of ${filtered.length.toLocaleString()} donors · ${money(sum(filtered))}`;
  prev.disabled=page===0;next.disabled=(page+1)*50>=filtered.length;
 }
 input.addEventListener('input',()=>{page=0;draw();});prev.addEventListener('click',()=>{page--;draw();});next.addEventListener('click',()=>{page++;draw();});host.append(section);draw();
}
async function start(host){
 try{
  const schumer=host.dataset.network==='schumer',data=await import(schumer?'./schumer-research-data.js?v=categories1':'./research-data.js?v=categories1');
  const config=data.config,committee=host.dataset.committee;
  const records=committee?await data.loadCommittee(config.find(c=>c.key===committee)):await data.loadResearchRecords();
  const identities=await import(schumer?'./schumer-business-directory-data.js?v=categories1':'./business-directory-data.js?v=categories1');
  const groups=groupDonors(records,identities.identifyName);host.replaceChildren();
  const note=document.createElement('p');note.className='donor-table-note';note.textContent='2025–2026 · Verified organization aliases are consolidated using the business research; individual gifts are combined by exact reported donor name within this page’s committees. The $500 cutoff uses each donor’s full total before search. Memo amounts are excluded.';host.append(note);
  table(host,'organizations','PACs, Political Committees & Organizations','All organizational contributions in one table.',groups.organizations,config);
  table(host,'indirect','Indirect Donors','Individual donors with total contributions of $500 or more, including repeat gifts. Researched employer names appear beside each donor, with the original reported names retained.',groups.indirect,config);
  table(host,'small','Small Donors','Individual donors with total contributions below $500.',groups.small,config);
  host.dataset.ready='true';
 }catch(e){host.textContent='Unable to load donor tables. Please reload the page.';host.dataset.error='true';console.error(e);}
}
for(const host of document.querySelectorAll('[data-donor-tables]'))start(host);
