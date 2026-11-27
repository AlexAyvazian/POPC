import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {masterSectors,canonicalSector,classifySectorLabel,masterSectorForRecord,loadMasterSectors,normalizeSectorRows} from '../assets/js/master-sectors.js';
import * as jeffries from '../assets/js/research-data.js';
import * as schumer from '../assets/js/schumer-research-data.js';

const read=async path=>new Response(await fs.readFile(new URL('../'+String(path).replace(/^\//,''),import.meta.url)));
test('legacy labels normalize into the supplied 63-sector and 17-group vocabulary',()=>{
 for(const [raw,want]of [['Arts & entertainment','Media & Entertainment'],['Financial services','Investment, Asset Management & Securities'],['Personal care / cosmetics manufacturing','Manufacturing & Heavy Equipment'],['Political Fundraising Intermediaries','Political Committees & Advocacy'],['Religion / faith-based nonprofit','Nonprofit & Philanthropy'],['Waste & environmental services','Facilities & Environmental Services'],['Restaurants / food service','Retail, Restaurants & Consumer Goods'],['Tribal Governments & Organizations','Tribal Nations & Governments']])assert.equal(canonicalSector('',raw),want);
 assert.equal(new Set(masterSectors).size,63);for(const label of masterSectors)assert.equal(canonicalSector('',label),label);
});
test('all direct and memo records use the same master labels and reconcile across both networks',async()=>{
 globalThis.fetch=read;await loadMasterSectors();
 const directory=await import('../assets/js/business-directory-data.js');
 const j=await directory.loadDirectoryRecords(),s=await schumer.loadDirectoryRecords();
 const seen=new Map();let shared=0;
 for(const rows of [j,s]){
  for(const r of rows){
   const expected=masterSectorForRecord(r);
   assert(masterSectors.includes(expected),expected);
   assert.equal(r.sector,expected,JSON.stringify([r.type,r.name,r.employer,r.sector,expected]));
   const name=String(r.type==='individual'?r.employer:r.name).trim().replace(/\s+/g,' ').toUpperCase();
   const key=r.committee+'|'+r.type+'|'+String(r.name).trim().toUpperCase();
   if(seen.has(key)){assert.equal(r.sector,seen.get(key));shared++;}else seen.set(key,r.sector);
  }
 }
 for(const [data,rows]of [[jeffries,j],[schumer,s]])for(const c of data.config)for(const type of ['individual','organization']){
  const direct=rows.filter(r=>r.committee===c.key&&r.type===type&&!r.memo);
  assert.equal(direct.reduce((n,r)=>n+r.amount,0),c[type]);
  assert.equal(direct.length,c[type+'Count']);
 }
 assert(shared>0);
 console.log({recordsChecked:j.length+s.length,masterSectorCount:masterSectors.length,sharedNameChecks:shared});
});
test('raw committee source tables normalize without changing receipt amounts or memo flags',async()=>{
 globalThis.fetch=read;await loadMasterSectors();
 const rows=[['ARISTEIA CAPITAL LLC','Old label','2026-01-01',10000,false],['ARISTEIA CAPITAL LLC','Different memo label','2026-01-01',10000,true]];
 const normalized=normalizeSectorRows(rows,'/data/jeffries/example-organizations.json');
 assert.equal(normalized[0][1],normalized[1][1]);
 assert.equal(normalized[0][1],classifySectorLabel('ARISTEIA CAPITAL LLC','',new Map(),'organization'));
 assert.equal(normalized[0][3],10000);assert.equal(normalized[1][4],true);
 assert.equal(rows[0][1],'Old label');
});
test('Schumer business directory keeps memo-only sectors out of direct-dollar filters',async()=>{
 const {buildDirectory,selectDirectory}=await import('../assets/js/schumer-business-directory-data.js');
 const groups=buildDirectory([{type:'organization',name:'TEST ORGANIZATION',sector:'Technology',committee:'a',amount:100},{type:'organization',name:'TEST ORGANIZATION',sector:'Healthcare',committee:'a',amount:500,memo:true}]);
 assert.deepEqual([...groups[0].sectors],['Technology']);
 assert.equal(selectDirectory(groups,{view:'all',sector:'Healthcare'}).length,0);
});

test('verified aliases receive the same sector as their canonical identity',async()=>{
 globalThis.fetch=read;await loadMasterSectors();
 const {businessIdentities}=await import('../data/jeffries/business-identities.js');
 const {schumerIdentities}=await import('../data/schumer/schumer-identities.js');
 for(const entry of [...businessIdentities,...schumerIdentities].filter(e=>e.status==='Source-backed'&&e.name)){
  for(const type of entry.recordTypes?.length?entry.recordTypes:['individual','organization']){
   const expected=classifySectorLabel(entry.name,'',new Map(),type);
   for(const alias of entry.aliases)assert.equal(classifySectorLabel(alias,'',new Map(),type),expected,alias+' / '+entry.name+' / '+type);
  }
 }
});

test('every supplied donor classification is applied exactly to both networks and all committee scopes',async()=>{
 globalThis.fetch=read;await loadMasterSectors();
 const {groupDonors}=await import('../assets/js/donor-groups.js');const {sectorGroups,masterSectorGroups}=await import('../assets/js/master-sectors.js');assert.equal(masterSectorGroups.length,17);
 let checked=0;
 for(const [network,prefix]of [['jeffries',''],['schumer','schumer-']]){
  const source=JSON.parse(await fs.readFile(new URL('../data/sectors/'+network+'.json',import.meta.url)));
  const index=new Map(source.rows.map(r=>[JSON.stringify([r[0],r[1].trim().toUpperCase()]),r]));
  const data=await import('../assets/js/'+prefix+'research-data.js'),identities=await import('../assets/js/'+prefix+'business-directory-data.js'),records=await data.loadResearchRecords();
  for(const scope of [records,...data.config.map(c=>records.filter(r=>r.committee===c.key))]){
   for(const g of Object.values(groupDonors(scope,identities.identifyName)).flat()){
    const supplied=index.get(JSON.stringify([g.type,g.name.trim().toUpperCase()]));assert(supplied,g.name);assert.deepEqual([...g.sectors],[supplied[2]],g.name);assert.equal(g.classification.group,sectorGroups[supplied[2]]);assert(!Object.keys(g.classification).some(k=>/confidence|review.?flag/i.test(k)));
   }
  }
  checked+=source.rows.length;
 }
 assert.equal(checked,24638);
});
test('career and household views retain the separate assignments supplied in the workbook',async()=>{
 globalThis.fetch=read;await loadMasterSectors();
 const a={type:'individual',committee:'smp-pac',name:'LAUFER, MARSHA Z.'};
 assert.equal(masterSectorForRecord(a),'No sector: Retired');
 assert.equal(masterSectorForRecord(a,'firstHand'),'No sector: Retired');
 assert.equal(masterSectorForRecord(a,'household'),'Hedge Funds & Proprietary Trading');
 const b={type:'organization',committee:'impact-pac',name:'HONEYWELL INTERNATIONAL POLITICAL ACTION COMMITTEE'};
 assert.equal(masterSectorForRecord(b),'Defense & Aerospace Contractors');
 const c={type:'organization',committee:'jeff-pac',name:'THE FARM CREDIT COUNCIL POLITICAL ACTION COMMITTEE'};
 assert.equal(masterSectorForRecord(c),'Banking');
});
