import {config} from './research-data.js?v=5';
import {buildDirectory, selectDirectory, directoryCSV, loadDirectoryRecords, businessMoneyGroups} from './business-directory-data.js?v=52';

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n / 100);
const number = n => n.toLocaleString('en-US');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const size = 40;
let records = [], groups = [], filtered = [], page = 0, detailRows = [], detailPage = 0, vizMode = 'organization', vizSelected = '';

function updateGroups() {
  groups = buildDirectory(records.filter(r => !$('bd-committee').value || r.committee === $('bd-committee').value));
  const previous = $('bd-sector').value;
  $('bd-sector').replaceChildren(new Option('All sectors', ''));
  for (const sector of [...new Set(groups.flatMap(g => [...g.sectors]))].sort()) $('bd-sector').add(new Option(sector, sector));
  $('bd-sector').value = [...$('bd-sector').options].some(o => o.value === previous) ? previous : '';
  page = 0;
  closeDetails();
  render();
}

function render() {
  filtered = selectDirectory(groups, {query:$('bd-search').value, sector:$('bd-sector').value, view:$('bd-view').value, research:$('bd-research').value});
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  page = Math.min(page, pages - 1);
  const totals = filtered.reduce((s, g) => ({organization:s.organization+g.organization, individual:s.individual+g.individual, count:s.count+g.count,memos:s.memos+g.memoCount}), {organization:0,individual:0,count:0,memos:0});
  $('bd-summary').textContent = `${number(filtered.length)} listed names · ${number(totals.count)} direct records · ${number(totals.memos)} memo records`;
  $('bd-rows').innerHTML = filtered.slice(page*size, (page+1)*size).map((g, i) => `<tr><td><button class="bd-name" type="button" data-index="${page*size+i}">${escape(g.name)}</button></td><td>${escape([...g.sectors].sort().join('; '))}</td><td>${escape(g.research?.status || 'Not reviewed')}<br>${escape([...g.methods].join('; '))}${g.research?.parent ? '<br>Parent: '+escape(g.research.parent) : ''}</td><td>${money(g.organization)}</td><td>${money(g.individual)}</td><td>${number(g.count)} direct<br>${number(g.memoCount)} memo</td></tr>`).join('') || '<tr><td colspan="6">No matching names.</td></tr>';
  $('bd-total').innerHTML = `<tr><th scope="row" colspan="3">Filtered totals</th><td>${money(totals.organization)}</td><td>${money(totals.individual)}</td><td>${number(totals.count)} direct<br>${number(totals.memos)} memo</td></tr>`;
  $('bd-page').textContent = `Page ${page+1} of ${pages}`;
  $('bd-prev').disabled = page === 0;
  $('bd-next').disabled = page === pages-1;
  for (const b of $('bd-rows').querySelectorAll('button')) b.addEventListener('click', () => { const group=filtered[Number(b.dataset.index)]; vizSelected=group.name; showDetails(group); renderMoneyViz(); });
  renderMoneyViz();
}


function vizBaseGroups() {
  return selectDirectory(groups, {
    query: $('bd-search').value,
    sector: $('bd-sector').value,
    view: 'names',
    research: $('bd-research').value
  });
}

function vizRecordCount(group) {
  if (vizMode === 'individual') return group.individualCount;
  if (vizMode === 'combined') return group.count;
  return group.organizationCount;
}

function vizModeLabel() {
  if (vizMode === 'individual') return 'individual receipts tied to reported employers';
  if (vizMode === 'combined') return 'direct PAC / organization receipts plus employer-linked individual receipts';
  return 'direct PAC / organization receipts';
}

function niceDotUnit(total) {
  const raw=Math.max(100, total/150);
  const power=10**Math.floor(Math.log10(raw));
  const scaled=raw/power;
  const step=scaled<=1?1:scaled<=2.5?2.5:scaled<=5?5:10;
  return step*power;
}

function visualTop(all, count) {
  const top=all.slice(0,count);
  const shown=top.reduce((n,g)=>n+g.visualAmount,0);
  return {top,shown,total:all.reduce((n,g)=>n+g.visualAmount,0)};
}

function attachVizInteractions(host) {
  for (const node of host.querySelectorAll('[data-viz-name]')) {
    const activate=()=> {
      vizSelected=node.dataset.vizName;
      renderMoneyViz();
    };
    node.addEventListener('click',activate);
    node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
  }
}

function packNodes(items,width=520,height=430) {
  const maxValue=Math.max(1,...items.map(g=>g.visualAmount));
  const placed=[];
  for (let i=0;i<items.length;i++) {
    const item=items[i];
    let r=22+Math.sqrt(item.visualAmount/maxValue)*50;
    let found=null;
    if (!i) found={x:width/2,y:height/2};
    for (let step=0;!found&&step<8000;step++) {
      const angle=step*.43, distance=4.4*Math.sqrt(step);
      const x=width/2+Math.cos(angle)*distance, y=height/2+Math.sin(angle)*distance;
      if(x-r<5||x+r>width-5||y-r<5||y+r>height-5) continue;
      if(placed.every(p=>Math.hypot(p.x-x,p.y-y)>=p.r+r+3)) found={x,y};
    }
    if(!found){r=Math.max(18,r*.75);found={x:30+(i%7)*70,y:height-30-Math.floor(i/7)*58};}
    placed.push({...item,...found,r});
  }
  return placed;
}

function shortVizName(name,max=18) {
  return name.length>max ? name.slice(0,max-1)+'…' : name;
}

function renderCircles(all,host) {
  const {top}=visualTop(all,16), nodes=packNodes(top);
  const fills=['#ecfeff','#acfaf1','#c0fb74','#fcef6e','#f1a38a','#f19dc7','#dc69d1'];
  host.innerHTML='<div class="bd-viz-caption">Top '+number(top.length)+' businesses / organizations by dollars</div><svg viewBox="0 0 520 430" role="img" aria-label="Packed circles sized by business money">'+nodes.map((n,i)=>{
    const selected=n.name===vizSelected,name=shortVizName(n.name,n.r>56?22:15);
    return '<g class="bd-viz-node" tabindex="0" role="button" data-viz-name="'+escape(n.name)+'"><title>'+escape(n.name)+' · '+money(n.visualAmount)+'</title><circle cx="'+n.x.toFixed(1)+'" cy="'+n.y.toFixed(1)+'" r="'+n.r.toFixed(1)+'" fill="'+fills[i%fills.length]+'" stroke="'+(selected?'#6b4b20':'#b99b6a')+'" stroke-width="'+(selected?3:1)+'"></circle>'+(n.r>39?'<text class="bd-viz-label" x="'+n.x.toFixed(1)+'" y="'+(n.y-3).toFixed(1)+'" text-anchor="middle">'+escape(name)+'</text><text class="bd-viz-amount" x="'+n.x.toFixed(1)+'" y="'+(n.y+11).toFixed(1)+'" text-anchor="middle">'+money(n.visualAmount)+'</text>':'')+'</g>';
  }).join('')+'</svg>';
  attachVizInteractions(host);
}

function renderBubbles(all,host) {
  const {top}=visualTop(all,25), width=520,height=410,left=58,right=18,topPad=18,bottom=42;
  const maxAmount=Math.max(...top.map(g=>g.visualAmount),1),maxCount=Math.max(...top.map(vizRecordCount),1);
  const innerW=width-left-right,innerH=height-topPad-bottom;
  const fills=['#74cbf5','#7fdfd1','#86ec4f','#f4e14a','#ed7147','#ea8cae','#dc64d4'];
  const grid=[.25,.5,.75,1].map(t=>{const y=topPad+innerH*(1-t);return '<line class="bd-bubble-grid" x1="'+left+'" x2="'+(width-right)+'" y1="'+y+'" y2="'+y+'"></line><text class="bd-bubble-axis-label" x="'+(left-6)+'" y="'+(y+3)+'" text-anchor="end">'+money(maxAmount*t)+'</text>';}).join('');
  const bubbles=top.map((g,i)=>{const count=Math.max(1,vizRecordCount(g)),x=left+(Math.log1p(count)/Math.log1p(maxCount))*innerW,y=topPad+(1-g.visualAmount/maxAmount)*innerH,r=8+Math.sqrt(g.visualAmount/maxAmount)*26,selected=g.name===vizSelected;return '<g class="bd-viz-node" tabindex="0" role="button" data-viz-name="'+escape(g.name)+'"><title>'+escape(g.name)+' · '+money(g.visualAmount)+' · '+number(count)+' receipt records</title><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+fills[i%fills.length]+'" fill-opacity=".72" stroke="'+(selected?'#6b4b20':'#836c4d')+'" stroke-width="'+(selected?3:1)+'"></circle></g>';}).join('');
  host.innerHTML='<div class="bd-viz-caption">Top '+number(top.length)+' businesses / organizations · hover for names and amounts</div><svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Bubble chart of receipt records and business money">'+grid+'<line class="bd-bubble-axis" x1="'+left+'" x2="'+left+'" y1="'+topPad+'" y2="'+(height-bottom)+'"></line><line class="bd-bubble-axis" x1="'+left+'" x2="'+(width-right)+'" y1="'+(height-bottom)+'" y2="'+(height-bottom)+'"></line>'+bubbles+'<text class="bd-bubble-axis-label" x="'+(left+innerW/2)+'" y="'+(height-10)+'" text-anchor="middle">Receipt records →</text><text class="bd-bubble-axis-label" x="13" y="'+(topPad+innerH/2)+'" transform="rotate(-90 13 '+(topPad+innerH/2)+')" text-anchor="middle">Dollar amount →</text></svg>';
  attachVizInteractions(host);
}

function renderDots(all,host) {
  const {top}=visualTop(all,12), total=top.reduce((n,g)=>n+g.visualAmount,0),unit=niceDotUnit(total);
  host.innerHTML='<div class="bd-dot-key">Top '+number(top.length)+' · each dot = '+money(unit)+'</div>'+top.map(g=>{
    const whole=Math.floor(g.visualAmount/unit),remainder=(g.visualAmount%unit)/unit,count=Math.min(40,whole+(remainder?1:0));
    const dots=Array.from({length:count},(_,i)=>'<span class="bd-dot'+(i===count-1&&remainder?' partial':'')+'"'+(i===count-1&&remainder?' style="opacity:'+Math.max(.2,remainder).toFixed(2)+'"':'')+'></span>').join('');
    return '<button type="button" class="bd-dot-row bd-viz-node" data-viz-name="'+escape(g.name)+'"><span class="bd-dot-name">'+escape(g.name)+'<span>'+money(g.visualAmount)+'</span></span><span class="bd-dot-field" aria-hidden="true">'+dots+'</span></button>';
  }).join('');
  attachVizInteractions(host);
}

function treemapLayout(items,x,y,w,h,out=[]) {
  if(!items.length||w<=0||h<=0)return out;
  if(items.length===1){out.push({...items[0],x,y,w,h});return out;}
  const total=items.reduce((n,g)=>n+g.visualAmount,0),half=total/2;
  let acc=0,split=1;
  for(let i=0;i<items.length-1;i++){acc+=items[i].visualAmount;if(acc>=half){split=i+1;break;}}
  const a=items.slice(0,split),b=items.slice(split),aTotal=a.reduce((n,g)=>n+g.visualAmount,0),ratio=aTotal/total;
  if(w>=h){const aw=w*ratio;treemapLayout(a,x,y,aw,h,out);treemapLayout(b,x+aw,y,w-aw,h,out);}
  else{const ah=h*ratio;treemapLayout(a,x,y,w,ah,out);treemapLayout(b,x,y+ah,w,h-ah,out);}
  return out;
}

function renderTreemap(all,host) {
  let items=all.slice(0,23);
  if(all.length>23){const rest=all.slice(23),amount=rest.reduce((n,g)=>n+g.visualAmount,0);items=[...items,{name:'Other businesses',visualAmount:amount,other:true}];}
  const rects=treemapLayout(items,0,0,520,420),fills=['#ecfeff','#acfaf1','#c0fb74','#fffed9','#f1a38a','#f9d9ef','#f9dafa'];
  host.innerHTML='<div class="bd-viz-caption">Largest businesses / organizations by dollar share</div><svg viewBox="0 0 520 420" role="img" aria-label="Treemap sized by business money">'+rects.map((r,i)=>{
    const pad=2,x=r.x+pad,y=r.y+pad,w=Math.max(0,r.w-pad*2),h=Math.max(0,r.h-pad*2),selected=r.name===vizSelected,canLabel=w>76&&h>36,name=shortVizName(r.name,22);
    const attrs=r.other?'':' tabindex="0" role="button" data-viz-name="'+escape(r.name)+'"';
    return '<g class="'+(r.other?'':'bd-viz-node')+'"'+attrs+'><title>'+escape(r.name)+' · '+money(r.visualAmount)+'</title><rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="7" fill="'+fills[i%fills.length]+'" stroke="'+(selected?'#6b4b20':'#b99b6a')+'" stroke-width="'+(selected?3:1)+'"></rect>'+(canLabel?'<text class="bd-treemap-label" x="'+(x+7).toFixed(1)+'" y="'+(y+15).toFixed(1)+'">'+escape(name)+'</text><text class="bd-treemap-amount" x="'+(x+7).toFixed(1)+'" y="'+(y+28).toFixed(1)+'">'+money(r.visualAmount)+'</text>':'')+'</g>';
  }).join('')+'</svg>';
  attachVizInteractions(host);
}

function renderMoneyViz() {
  const circleHost=$('bd-viz-circles'),bubbleHost=$('bd-viz-bubbles'),dotHost=$('bd-viz-dots'),treemapHost=$('bd-viz-treemap');
  if (!circleHost || !groups.length) return;
  const all=businessMoneyGroups(vizBaseGroups(),{mode:vizMode}),total=all.reduce((n,g)=>n+g.visualAmount,0);
  $('bd-money-viz-summary').textContent=all.length
    ? number(all.length)+' businesses / organizations · '+money(total)+' in '+vizModeLabel()
    : 'No matching dollar records for this selection.';
  if(!all.length){
    for(const host of [circleHost,bubbleHost,dotHost,treemapHost]) host.innerHTML='<div class="bd-viz-empty">No matching business money to visualize.</div>';
    return;
  }
  renderCircles(all,circleHost);
  renderBubbles(all,bubbleHost);
  renderDots(all,dotHost);
  renderTreemap(all,treemapHost);
}

function showDetails(group) {
  const rows = new Map();
  for (const r of group.records) {
    const key = JSON.stringify([r.type,r.name,r.employer,r.occupation,r.committee,!!r.memo]);
    if (!rows.has(key)) rows.set(key, {...r,amount:0,count:0});
    const item = rows.get(key); item.amount += r.amount; item.count++;
  }
  detailRows = [...rows.values()].sort((a,b) => b.amount-a.amount || a.name.localeCompare(b.name));
  detailPage = 0;
  $('bd-detail-title').textContent = group.name;
  $('bd-originals').textContent = 'Original employer / organization names: ' + [...group.names].join('; ');
  $('bd-evidence').innerHTML = group.research
    ? `<strong>${escape(group.research.status)}</strong> · ${escape(group.research.scope)} · Reviewed ${escape(group.research.reviewed)}${group.research.parent ? '<br>Parent company: '+escape(group.research.parent) : ''}<p>${escape(group.research.evidence)}</p><p>Sources: ${group.research.sources.map((url,i)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${i+1}. ${escape(new URL(url).hostname)}</a>`).join(' · ')}</p>`
    : 'Not yet researched. Name is taken from the reported employer or organization.';
  $('bd-detail').hidden = false;
  renderDetails();
  $('bd-detail-title').focus();
}

function closeDetails() { $('bd-detail').hidden = true; }
function renderDetails() {
  const pages = Math.max(1, Math.ceil(detailRows.length / size));
  $('bd-detail-rows').innerHTML = detailRows.slice(detailPage*size,(detailPage+1)*size).map(r => {
    const c = config.find(c => c.key === r.committee);
    return `<tr><td>${escape(r.name)}</td><td>${escape(r.employer || '—')}</td><td>${escape(r.occupation || '—')}</td><td>${r.type === 'individual' ? 'Individual' : 'PAC / organization'}${r.memo ? ' — memo, excluded from totals' : ''}</td><td><a href="${c.slug}.html">${escape(c.name)}</a></td><td>${number(r.count)}</td><td>${money(r.amount)}</td></tr>`;
  }).join('');
  $('bd-detail-page').textContent = `Page ${detailPage+1} of ${pages}`;
  $('bd-detail-prev').disabled = detailPage === 0;
  $('bd-detail-next').disabled = detailPage === pages-1;
}

$('bd-viz-money').addEventListener('change', e => {vizMode=e.target.value;vizSelected='';renderMoneyViz();});
$('bd-committee').addEventListener('change', updateGroups);
for (const id of ['bd-search','bd-sector','bd-view','bd-research']) $(id).addEventListener(id === 'bd-search' ? 'input' : 'change', () => {page=0;closeDetails();render();});
$('bd-prev').addEventListener('click', () => {page--;render();});
$('bd-next').addEventListener('click', () => {page++;render();});
$('bd-detail-prev').addEventListener('click', () => {detailPage--;renderDetails();});
$('bd-detail-next').addEventListener('click', () => {detailPage++;renderDetails();});
$('bd-close').addEventListener('click', () => {closeDetails();$('bd-search').focus();});
$('bd-reset').addEventListener('click', () => {$('bd-search').value=$('bd-sector').value=$('bd-committee').value=$('bd-research').value='';$('bd-view').value='promoted';updateGroups();});
$('bd-download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob(['\uFEFF'+directoryCSV(filtered)],{type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a');a.href=url;a.download='popc-business-organization-names.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});

try {
  records = await loadDirectoryRecords();
  for (const c of config) $('bd-committee').add(new Option(c.name,c.key));
  updateGroups();
  $('bd-status').textContent = `All eight committees loaded · ${number(records.filter(r=>!r.memo).length)} direct records and ${number(records.filter(r=>r.memo).length)} memo records accounted for. Single-donor employer-only names remain preserved. The priority queue also includes single-donor employers when the donor reports a high-influence executive role; all preserved employer names remain available by search or from the Show menu.`;
  for (const el of document.querySelectorAll('.ca-controls input,.ca-controls select,#bd-reset,#bd-download')) el.disabled=false;
} catch (error) {
  $('bd-status').textContent = 'Unable to load all committee records. Reload to retry.';
  console.error(error);
}
