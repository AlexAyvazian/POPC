import {config} from './research-data.js?v=1';
import {buildDirectory, selectDirectory, directoryCSV, loadDirectoryRecords} from './business-directory-data.js?v=26';

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n / 100);
const number = n => n.toLocaleString('en-US');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const size = 40;
let records = [], groups = [], filtered = [], page = 0, detailRows = [], detailPage = 0;

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
  for (const b of $('bd-rows').querySelectorAll('button')) b.addEventListener('click', () => showDetails(filtered[Number(b.dataset.index)]));
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
