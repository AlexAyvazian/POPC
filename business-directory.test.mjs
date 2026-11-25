import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {buildDirectory, identifyName, selectDirectory, directoryCSV, loadDirectoryRecords} from './business-directory-data.js';
import {loadResearchRecords, config} from './research-data.js';

test('all eight datasets reconcile; every receipt remains in one directory group', async () => {
  globalThis.fetch = async path => new Response(await fs.readFile(new URL(path, import.meta.url)));
  const rows = await loadResearchRecords();
  const groups = buildDirectory(rows);
  assert.equal(groups.reduce((n,g)=>n+g.count,0),rows.length);
  assert.equal(new Set(groups.flatMap(g=>g.records)).size,rows.length);
  for (const c of config) {
    const entries = groups.flatMap(g=>g.records).filter(r=>r.committee===c.key);
    for (const type of ['individual','organization']) {
      assert.equal(entries.filter(r=>r.type===type).reduce((n,r)=>n+r.amount,0),c[type]);
      assert.equal(entries.filter(r=>r.type===type).length,c[type+'Count']);
    }
  }
  assert.equal(selectDirectory(groups,{view:'names'}).length+selectDirectory(groups,{view:'personal'}).length,groups.length);
  assert.equal(directoryCSV(groups).split('\r\n').length,groups.length+1);
});

test('explicit PAC titles retain originals, legal suffixes and separate amounts', () => {
  const rows = [
    {type:'organization',name:'MICROSOFT CORPORATION PAC',sector:'Technology',committee:'one',amount:50000},
    {type:'individual',name:'DONOR',employer:' microsoft corporation ',sector:'Technology',committee:'two',amount:20000},
    {type:'individual',name:'OTHER',employer:'MICROSOFT',sector:'Technology',committee:'two',amount:-1000},
    {type:'individual',name:'RETIREE',employer:'RETIRED',sector:'Personal',committee:'one',amount:1000},
  ];
  const groups=buildDirectory(rows), company=groups.find(g=>g.name==='MICROSOFT CORPORATION');
  assert.equal(company.organization,50000);assert.equal(company.individual,20000);
  assert(company.names.has('MICROSOFT CORPORATION PAC'));
  assert.equal(groups.length,3);
  assert.equal(selectDirectory(groups,{query:'CORPORATION PAC'}).length,1);
  assert.equal(selectDirectory(groups,{view:'personal'}).length,1);
  assert.equal(selectDirectory(groups,{sector:'Missing'}).length,0);
  assert.equal(identifyName({type:'organization',name:'ABC SEPARATE SEGREGATED FUND (ABC PAC)'}).name,'ABC');
  assert.equal(identifyName({type:'organization',name:'BUILD POLITICAL ACTION COMMITTEE OF XYZ'}).name,'BUILD POLITICAL ACTION COMMITTEE OF XYZ');
  assert.equal(identifyName({type:'individual',employer:'STUDENTSFIRSTNY'}).personal,false);
  assert.equal(identifyName({type:'individual',employer:'SELF EMPLOYED - A BUSINESS'}).personal,false);
});

test('CSV preserves quotes and neutralizes spreadsheet formulas', () => {
  const groups=buildDirectory([{type:'individual',name:'Donor',employer:'=FORMULA("x")',occupation:'Role',sector:'Unknown',committee:'a',amount:100}]);
  assert(directoryCSV(groups).includes("\"'=FORMULA(\"\"X\"\")\""));
});

test('memo-only names survive and memo amounts never increase direct totals', async () => {
  globalThis.fetch = async path => new Response(await fs.readFile(new URL(path, import.meta.url)));
  const rows = await loadDirectoryRecords(), groups = buildDirectory(rows);
  assert.equal(rows.filter(r=>r.memo).length, config.reduce((n,c)=>n+c.memos,0));
  assert.equal(groups.reduce((n,g)=>n+g.count+g.memoCount,0),rows.length);
  for(const type of ['individual','organization']) assert.equal(groups.reduce((n,g)=>n+g[type],0),config.reduce((n,c)=>n+c[type],0));
  assert(groups.some(g=>g.memoCount>0&&g.count===0));
  const directNames = new Set(buildDirectory(rows.filter(r=>!r.memo)).map(g=>g.key));
  console.log(JSON.stringify({allRecords:rows.length,listedNames:groups.filter(g=>!g.personal).length,memoOnlyNames:groups.filter(g=>!directNames.has(g.key)).length}));
});
