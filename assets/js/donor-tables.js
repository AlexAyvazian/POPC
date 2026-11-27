import {sectorGroups,networkData,masterSectorForRecord} from './donor-data.js?v=claude1';
import {mountDonorVisuals} from './donor-visuals.js?v=vertical-bars1';
import {groupDonors} from './donor-groups.js?v=claude1';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=set=>[...set].sort().join('; ')||'Not reported';
const sum=rows=>rows.reduce((n,r)=>n+r.amount,0);
const pageSize=100;
const sameName=(a,b)=>String(a).normalize('NFKC').toUpperCase().replace(/[^\p{L}\p{N}]/gu,'')===String(b).normalize('NFKC').toUpperCase().replace(/[^\p{L}\p{N}]/gu,'');
const primarySector=group=>{const totals=new Map();for(const r of group.records){const sector=masterSectorForRecord(r)||'Unresolved / ambiguous';totals.set(sector,(totals.get(sector)||0)+r.amount);}return [...totals].sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])||b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||'Unresolved / ambiguous';};
const source=r=>/^\d{15,20}$/.test(String(r.image))?`<a href="https://docquery.fec.gov/cgi-bin/fecimg/?${r.image}" target="_blank" rel="noopener noreferrer">FEC filing</a>`:'—';
function researchDetails(group){
 const seen=new Set();
 const entries=[...group.businessResearch.values()].filter(identity=>{const key=identity.name+'|'+JSON.stringify(identity.research);if(!identity.research||seen.has(key))return false;seen.add(key);return true;});
 if(!entries.length)return '';
 return `<details class="donor-business-research"><summary>Business identity &amp; sources</summary>`+entries.map(identity=>{
  const r=identity.research;
  if(!r)return `<div>${esc(identity.reported)}</div>`;
  const sources=(r.sources||[]).filter(url=>/^https?:\/\//i.test(url));
  return `<div><p><strong>${esc(identity.name)}</strong></p><p>${esc(r.scope||'')}</p>${r.parent?`<p>Parent company: ${esc(r.parent)}</p>`:''}<p>${esc(r.evidence||'')}</p><p>${sources.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${i+1}</a>`).join(' · ')}</p></div>`;
 }).join('')+'</details>';
}
function sectorDetails(group){
 const c=group.classification,sector=list(group.sectors),parent=c?.group||sectorGroups[sector]||'',label=`<strong>${esc(sector)}</strong>${parent&&!sameName(parent,sector)&&!sector.startsWith('No sector:')?`<small>${esc(parent)}</small>`:''}`;
 if(!c?.researchedSector)return label;
 const urls=[...new Set((c.evidence||'').match(/https?:\/\/[^\s;]+/g)||[])];
 return label+`<details class="donor-sector-context"><summary>Industry connections</summary><p>${esc(c.relationship||'')}</p>${c.profile?`<p>${esc(c.profile)}</p>`:''}<p>Donor career: ${esc(c.firstHand)}</p><p>Including household: ${esc(c.household)}</p><p>${urls.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${i+1}</a>`).join(' · ')}</p></details>`;
}
function receiptDetails(group,config){
 const details=document.createElement('details'),summary=document.createElement('summary');
 summary.textContent=group.records.length.toLocaleString()+(group.records.length===1?' receipt':' receipts');details.append(summary);
 details.addEventListener('toggle',()=>{
  if(!details.open||details.dataset.loaded)return;details.dataset.loaded='true';
  let shown=0;const body=document.createElement('div'),more=document.createElement('button');more.type='button';more.textContent='Show more receipts';
  const destinations=document.createElement('div');destinations.className='donor-receiving-committees';
  destinations.innerHTML=[...group.committees].map(([key,amount])=>{const c=config.find(c=>c.key===key);return `<p><a href="/pages/${esc(c?.slug)}.html">${esc(c?.name||key)}</a> · ${money(amount)}</p>`;}).join('');
  details.append(destinations);
  const append=()=>{for(const r of group.records.slice(shown,shown+50)){const line=document.createElement('p');line.innerHTML=`${esc(r.date||'Date not supplied')} · ${esc(config.find(c=>c.key===r.committee)?.name||r.committee)} · ${money(r.amount)} · ${source(r)}`;body.append(line);}shown+=50;more.hidden=shown>=group.records.length;};
  more.addEventListener('click',append);details.append(body,more);append();
 });return details;
}
function table(host,key,title,description,groups,config){
 const section=document.createElement('section');section.className='donor-table-section';section.dataset.donorGroup=key;
 section.innerHTML=`<h2>${title}</h2><p>${description}</p><p class="donor-table-total">${groups.length.toLocaleString()} donors · <strong>${money(sum(groups))}</strong></p><label class="donor-search">Search this table <input type="search" placeholder="Name, employer, sector…"></label><div data-donor-visuals></div><div class="jvf-table-wrap"><table class="jvf-table"><thead><tr><th scope="col">${key==='organizations'?'PAC / organization':'Individual donor'}</th>${key==='organizations'?'':'<th scope="col">Reported employer(s)</th>'}<th scope="col">Total donated</th><th scope="col">Committees &amp; receipts</th></tr></thead><tbody></tbody></table></div><div class="donor-table-pagination"><button type="button" data-prev>Previous</button><span role="status"></span><button type="button" data-next>Next</button></div>`;
 if(!host.dataset.committee){
  const downloads=document.createElement('p');downloads.className='donor-downloads';
  const network=host.dataset.network==='schumer'?'schumer':'jeffries';
  downloads.innerHTML='<a data-table-download href="/data/downloads/'+network+'-'+key+'.csv" download>Download full table (CSV)</a>';
  section.querySelector('.donor-table-total').after(downloads);
 }
 const input=section.querySelector('input'),body=section.querySelector('tbody'),prev=section.querySelector('[data-prev]'),next=section.querySelector('[data-next]'),status=section.querySelector('[role=status]');let page=0,visualQuery=null;
 const visuals=mountDonorVisuals(section.querySelector('[data-donor-visuals]'));
 function draw(){
  const q=input.value.trim().toUpperCase(),matched=groups.filter(g=>!q||[g.name,list(g.employers),list(g.occupations),list(g.sectors),g.classification?.group||'',list(g.reportedNames),list(g.reportedEmployers),...[...g.businessResearch.values()].map(i=>i.research?.parent||'')].join(' ').toUpperCase().includes(q));
  if(q!==visualQuery){visualQuery=q;visuals.update(matched);}
  const filtered=[...matched].sort((a,b)=>primarySector(a).localeCompare(primarySector(b))||b.amount-a.amount||a.name.localeCompare(b.name));
  body.replaceChildren();let lastSector=null;
  for(const g of filtered.slice(page*pageSize,(page+1)*pageSize)){
   const sector=primarySector(g);
   if(sector!==lastSector){const divider=document.createElement('tr');divider.className='donor-sector-divider';divider.dataset.sectorDivider=sector;divider.innerHTML=`<th colspan="${key==='organizations'?3:4}" scope="rowgroup">${esc(sector)}</th>`;body.append(divider);lastSector=sector;}
   const aliases=[...g.reportedNames].filter(n=>!sameName(n,g.name));
   const names=aliases.length?`<details class="donor-reported-names"><summary>Reported names</summary><p>${esc(aliases.join('; '))}</p></details>`:'';
   const employerAliases=[...g.reportedEmployers].filter(n=>![...g.employers].some(e=>sameName(n,e)));
   const row=document.createElement('tr');row.dataset.donorRow='';
   row.innerHTML=`<td><strong class="donor-name">${esc(g.name)}</strong>${key==='organizations'?researchDetails(g):`<small class="donor-occupation">${esc(list(g.occupations))}</small>`}${names}</td>${key==='organizations'?'':`<td>${esc(list(g.employers))}${employerAliases.length?`<details><summary>Reported employer names</summary><p>${esc(employerAliases.join('; '))}</p></details>`:''}${researchDetails(g)}</td>`}<td class="jvf-money"><strong>${money(g.amount)}</strong></td><td><span class="donor-committee-count">${g.committees.size} ${g.committees.size===1?'committee':'committees'}</span></td>`;
   for(const [i,cell]of [...row.children].entries())cell.dataset.label=section.querySelectorAll('th')[i].textContent;
   row.lastElementChild.append(receiptDetails(g,config));body.append(row);
  }
  if(!filtered.length){const row=document.createElement('tr');row.innerHTML=`<td colspan="${key==='organizations'?3:4}">No matching donors.</td>`;body.append(row);}
  status.textContent=`${filtered.length? page*pageSize+1:0}–${Math.min((page+1)*pageSize,filtered.length)} of ${filtered.length.toLocaleString()} donors · ${money(sum(filtered))}`;
  prev.disabled=page===0;next.disabled=(page+1)*pageSize>=filtered.length;
 }
 input.addEventListener('input',()=>{page=0;draw();});prev.addEventListener('click',()=>{page--;draw();});next.addEventListener('click',()=>{page++;draw();});host.append(section);draw();
}
async function start(host){
 try{
  const schumer=host.dataset.network==='schumer',data=networkData(schumer?'schumer':'jeffries');
  const config=data.config,committee=host.dataset.committee;
  const records=committee?await data.loadCommittee(config.find(c=>c.key===committee)):await data.loadResearchRecords();
  const groups=groupDonors(records);host.replaceChildren();
  const note=document.createElement('p');note.className='donor-table-note';note.textContent='2025–2026 · Repeat donations are combined before the $500 cutoff. Amounts exclude memos. Sectors use the researched donor career classifications.';host.append(note);
  if(!committee){
   const downloads=document.createElement('p');downloads.className='donor-downloads';
   downloads.innerHTML='<a data-workbook-download href="/data/downloads/'+(schumer?'schumer':'jeffries')+'-combined-donors.xlsx" download>Download all three tables (Excel)</a><span>Complete tables, research, committee amounts and receipt details.</span>';
   host.append(downloads);
  }
  table(host,'organizations','PACs, Political Committees & Organizations','All organizational contributions in one table.',groups.organizations,config);
  table(host,'indirect','Indirect Donors','Individual donors with total contributions of $500 or more, including repeat gifts. Researched employer names appear beside each donor, with the original reported names retained.',groups.indirect,config);
  table(host,'small','Small Donors','Individual donors with total contributions below $500.',groups.small,config);
  host.dataset.ready='true';
 }catch(e){host.textContent='Unable to load donor tables. Please reload the page.';host.dataset.error='true';console.error(e);}
}
for(const host of document.querySelectorAll('[data-donor-tables]'))start(host);
