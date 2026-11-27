import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {networkData,loadNetwork,sectorGroups,masterSectorForRecord} from '../assets/js/donor-data.js?v=claude1';
import {groupDonors} from '../assets/js/donor-groups.js?v=claude1';
import {buildVisualData} from '../assets/js/donor-visual-data.js?v=claude1';
import {buildDirectory} from '../assets/js/business-data.js?v=claude1';
const root=process.cwd();
globalThis.fetch=async url=>new Response(await fs.readFile(path.join(root,String(url).split('?')[0].replace(/^\//,''))));
const baseline={jeffries:{donors:11082,receipts:110817,total:2813110270,memos:111022,tables:[526,2822,7734]},schumer:{donors:13556,receipts:49305,total:31446265691,memos:27880,tables:[257,5092,8207]}};
for(const network of Object.keys(baseline))test(network+': every donor, receipt, chart sector and committee amount reconciles with ClaudeFiles',async()=>{
 const expected=baseline[network],data=networkData(network),metadata=await loadNetwork(network),records=await data.loadResearchRecords(),groups=groupDonors(records),all=Object.values(groups).flat();
 assert.equal(records.length,expected.receipts);assert.equal(records.reduce((n,r)=>n+r.amount,0),expected.total);
 assert.equal(metadata.donors.length,expected.donors);assert.deepEqual(Object.values(groups).map(g=>g.length),expected.tables);
 const source=new Map(metadata.donors.map(d=>[d.type+'|'+d.name,d]));
 for(const g of all){
  const d=source.get(g.type+'|'+g.name);assert(d,g.name);assert.equal(g.amount,d.amount);assert.equal(g.records.length,d.count);assert.deepEqual(Object.fromEntries([...g.committees].filter(([,v])=>v)),Object.fromEntries(Object.entries(d.committees).filter(([,v])=>v)));
  const expectedSector=sectorGroups[d.classification.researchedSector]?d.classification.researchedSector:d.classification.firstHand;
  assert.deepEqual([...g.sectors],[expectedSector]);assert(sectorGroups[expectedSector]);
  for(const r of g.records){assert.equal(masterSectorForRecord(r),expectedSector);assert.equal(r.sector,expectedSector);}
 }
 const visualTotals=new Map();
 for(const items of Object.values(groups)){
  const v=buildVisualData(items);assert.equal(v.total,items.reduce((n,g)=>n+g.amount,0));
  for(const s of v.sectors)visualTotals.set(s.name,(visualTotals.get(s.name)||0)+s.amount);
 }
 const sourceSectors=new Map();
 for(const d of metadata.donors){const sector=sectorGroups[d.classification.researchedSector]?d.classification.researchedSector:d.classification.firstHand;sourceSectors.set(sector,(sourceSectors.get(sector)||0)+d.amount);}
 assert.deepEqual([...visualTotals].sort(),[...sourceSectors].sort());
 const directory=buildDirectory(records);assert.equal(directory.reduce((n,g)=>n+g.individual+g.organization,0),expected.total);
 const memoParts=await Promise.all(data.config.map(c=>data.loadCommittee(c,'memo')));assert.equal(memoParts.flat().length,expected.memos);
 for(const rows of memoParts)assert.equal(Object.values(groupDonors(rows)).flat().length,0);
 const other=(await Promise.all(data.config.map(c=>data.loadCommittee(c,'other')))).flat();
 assert.equal(other.length,network==='schumer'?64:0);assert.equal(other.reduce((n,r)=>n+r.amount,0),network==='schumer'?18863800:0);
});
test('old donor directories, original spreadsheets and classifier modules are deleted',async()=>{
 for(const p of ['data/jeffries','data/schumer','data/sectors','documents/spreadsheets','assets/js/research-data.js','assets/js/schumer-research-data.js','assets/js/master-sectors.js','assets/js/business-directory-data.js','assets/js/schumer-business-directory-data.js'])await assert.rejects(fs.access(p));
 const modules=await fs.readdir('assets/js');
 for(const file of modules.filter(f=>f.endsWith('.js'))){
  const s=await fs.readFile('assets/js/'+file,'utf8');
  assert(!/data\/(?:jeffries|schumer|sectors)\/|(?:schumer-)?research-data\.js|master-sectors\.js|business-directory-data\.js/.test(s),file+' still uses an old source');
 }
});
test('canonical researched sector overrides a no-sector first-hand classification',()=>{
 const record={sector:'No sector: Retired',classification:{firstHand:'No sector: Retired',refined:'No sector: Retired',household:'No sector: Retired',researchedSector:'Technology'}};
 assert.equal(masterSectorForRecord(record),'Technology');
 const fallback={...record,classification:{...record.classification,researchedSector:'Free-form note that is not a taxonomy sector'}};
 assert.equal(masterSectorForRecord(fallback),'No sector: Retired');
});
test('career research is the default and individuals never match across networks',async()=>{
 const j=await loadNetwork('jeffries'),s=await loadNetwork('schumer');
 assert.equal(j.donors.filter(d=>d.classification.firstHand!==d.classification.refined).length,5);
 assert.equal(s.donors.filter(d=>d.classification.firstHand!==d.classification.refined).length,11);
 assert(j.donors.every(d=>d.id.startsWith('jeffries|')));assert(s.donors.every(d=>d.id.startsWith('schumer|')));
 for(const d of [...j.donors,...s.donors])assert(sectorGroups[d.classification.firstHand]);
});
test('public compiled data contains no review or confidence metadata',async()=>{
 const data=JSON.parse(await fs.readFile('data/donors.json','utf8'));
 for(const network of ['jeffries','schumer']){
  const d=await loadNetwork(network);
  for(const donor of d.donors)assert(!Object.keys(donor.classification).some(k=>/confidence|review/i.test(k)));
 }
 assert.deepEqual(Object.keys(data.networks),['jeffries','schumer']);
});

test('JFC receipts retain their actual filing image columns and memo notes',async()=>{
 const data=networkData('jeffries'),c=data.config.find(c=>c.key==='jfc'),direct=await data.loadCommittee(c),memo=await data.loadCommittee(c,'memo');
 const apter=direct.find(r=>r.name==='APTER, FREDRIC'&&r.date==='2026-01-14'&&r.amount===50000);assert.equal(apter.image,'202604159862860413');
 const org=direct.find(r=>r.name==='3M COMPANY PAC'&&r.date==='2026-03-27');assert.equal(org.image,'202604159862872121');assert.equal(org.entity,'PAC');
 const spouse=memo.find(r=>r.name==='CURTSINGER, JOLIE'&&r.amount===220000);assert.equal(spouse.image,'202604159862869887');assert(spouse.note.includes('REATTRIBUTION FROM SPOUSE GABRIEL SCHWARTZ'));
});
