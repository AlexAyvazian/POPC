import {networkData,normalize} from './donor-data.js?v=claude1';
const host=document.querySelector('[data-donor-tables][data-committee]');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
function receiptTable(parent,id,title,rows){
 const section=document.createElement('section');section.className='jvf-main-section';section.innerHTML='<h2>'+esc(title)+'</h2><p>'+rows.length.toLocaleString()+' records · '+money(rows.reduce((n,r)=>n+r.amount,0))+'</p><div id="'+id+'"></div>';
 const target=section.lastElementChild,search=document.createElement('input'),wrap=document.createElement('div'),nav=document.createElement('div');
 search.type='search';search.placeholder='Search receipt records';search.setAttribute('aria-label','Search '+title);wrap.className='jvf-table-wrap';nav.className='donor-table-pagination';
 const previous=document.createElement('button'),next=document.createElement('button'),status=document.createElement('span');previous.type=next.type='button';previous.textContent='Previous';next.textContent='Next';nav.append(previous,status,next);target.append(search,wrap,nav);let page=0;
 function draw(){
  const q=normalize(search.value),matches=rows.filter(r=>!q||[r.name,r.employer,r.occupation,r.sector,r.note,r.transaction].some(v=>normalize(v).includes(q))),pages=Math.max(1,Math.ceil(matches.length/50));page=Math.min(page,pages-1);
  wrap.innerHTML='<table class="jvf-table"><thead><tr>'+['Reported donor','Employer','Occupation','Sector','Date','Amount','FEC filing'].map(s=>'<th scope="col">'+s+'</th>').join('')+'</tr></thead><tbody>'+matches.slice(page*50,page*50+50).map(r=>'<tr>'+[esc(r.name)+(r.note?'<small>'+esc(r.note)+'</small>':''),esc(r.employer||'—'),esc(r.occupation||'—'),esc(r.sector||'—'),esc(r.date||'—'),money(r.amount),/^\d{15,20}$/.test(String(r.image))?'<a href="https://docquery.fec.gov/cgi-bin/fecimg/?'+r.image+'" target="_blank" rel="noopener noreferrer">FEC filing</a>':'—'].map(s=>'<td>'+s+'</td>').join('')+'</tr>').join('')+(matches.length?'':'<tr><td colspan="7">No matching records.</td></tr>')+'</tbody></table>';
  status.textContent='Page '+(page+1)+' of '+pages+' · '+matches.length.toLocaleString()+' records';previous.disabled=page===0;next.disabled=page===pages-1;
 }
 previous.onclick=()=>{page--;draw();};next.onclick=()=>{page++;draw();};search.oninput=()=>{page=0;draw();};parent.append(section);draw();
}
if(host)(async()=>{
 const data=networkData(host.dataset.network||'jeffries'),c=data.config.find(c=>c.key===host.dataset.committee);
 const [direct,memos,other]=await Promise.all(['direct','memo','other'].map(kind=>data.loadCommittee(c,kind)));
 const summary=document.getElementById('jvf-summary');if(summary)summary.textContent=money(direct.reduce((n,r)=>n+r.amount,0))+' · '+direct.length.toLocaleString()+' direct receipts';
 document.getElementById('jvf-status')?.remove();
 const details=document.querySelector('.original-receipts');if(!details)return;
 details.replaceChildren();const label=document.createElement('summary');label.textContent='Original receipt records and memos';details.append(label);
 receiptTable(details,'jvf-sectors','Original organization receipts',direct.filter(r=>r.type==='organization'));
 receiptTable(details,'jvf-individuals','Original individual receipts',direct.filter(r=>r.type==='individual'));
 const note=document.createElement('p');note.textContent=memos.length.toLocaleString()+' memo records, excluded from contribution totals.';details.append(note);
 receiptTable(details,'jvf-organization-memo','Organization memo records',memos.filter(r=>r.type==='organization'));
 receiptTable(details,'jvf-individual-memo','Individual memo records',memos.filter(r=>r.type==='individual'));
 if(other.length)receiptTable(details,'schumer-other-rows','Other receipts, excluded from contribution totals',other);
})().catch(e=>{const status=document.getElementById('jvf-status');if(status)status.textContent='Unable to load original receipts.';console.error(e);});
