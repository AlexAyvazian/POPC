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
  assert.equal(company.organization,50000);assert.equal(company.individual,19000);
  assert(company.names.has('MICROSOFT CORPORATION PAC'));
  assert.equal(groups.length,2);
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
  const listed=groups.filter(g=>!g.personal);
  console.log(JSON.stringify({
    allRecords:rows.length,
    listedNames:listed.length,
    sourceBacked:listed.filter(g=>g.research?.status==='Source-backed').length,
    unresolved:listed.filter(g=>g.research?.status==='Unresolved').length,
    unreviewed:listed.filter(g=>!g.research).length,
    memoOnlyNames:groups.filter(g=>!directNames.has(g.key)).length
  }));
});

test('researched PAC titles remain separate from their connected organizations', () => {
  const rows=[
    {type:'organization',name:'AMERICAN ISRAEL PUBLIC AFFAIRS COMMITTEE POLITICAL ACTION COMMITTEE',sector:'Advocacy',committee:'one',amount:50000},
    {type:'individual',name:'Donor',employer:'AMERICAN ISRAEL PUBLIC AFFAIRS COMMITTEE',occupation:'Employee',sector:'Advocacy',committee:'one',amount:10000},
    {type:'organization',name:'AMERICAN HEALTH CARE ASSOCIATION PAC',sector:'Healthcare',committee:'one',amount:50000},
    {type:'individual',name:'Donor 2',employer:'AMERICAN HEALTH CARE ASSOCIATION',occupation:'Employee',sector:'Healthcare',committee:'one',amount:10000}
  ];
  const groups=buildDirectory(rows);
  assert.equal(groups.length,4);
  assert(groups.some(g=>g.name==='AMERICAN ISRAEL PUBLIC AFFAIRS COMMITTEE POLITICAL ACTION COMMITTEE'));
  assert(groups.some(g=>g.name==='AMERICAN ISRAEL PUBLIC AFFAIRS COMMITTEE'));
  assert(groups.some(g=>g.name==='AMERICAN HEALTH CARE ASSOCIATION POLITICAL ACTION COMMITTEE'));
  assert(groups.some(g=>g.name==='AMERICAN HEALTH CARE ASSOCIATION'));
});

test('FedEx parent and operating subsidiary remain separate', () => {
  const groups=buildDirectory([
    {type:'individual',name:'One',employer:'FEDERAL EXPRESS',sector:'Transport',committee:'x',amount:100},
    {type:'individual',name:'Two',employer:'FEDEX CORPORATION',sector:'Transport',committee:'x',amount:100}
  ]);
  const operating=groups.find(g=>g.name==='FEDERAL EXPRESS CORPORATION');
  const parent=groups.find(g=>g.name==='FEDEX CORPORATION');
  assert(operating);assert(parent);
  assert.equal(operating.research.parent,'FedEx Corporation');
  assert.notEqual(operating.key,parent.key);
});

test('Illinois government aliases merge without losing records', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Pritzker A',employer:'THE STATE OF ILLINOIS',sector:'Government',committee:'a',amount:100},
    {type:'individual',name:'Pritzker B',employer:'STATE OF IL',sector:'Government',committee:'b',amount:200}
  ]);
  assert.equal(groups.length,1);
  assert.equal(groups[0].name,'STATE OF ILLINOIS');
  assert.equal(groups[0].individual,300);
  assert.equal(groups[0].names.size,2);
});

test('Bloomberg parent remains context, not an aggregation key', () => {
  const groups=buildDirectory([
    {type:'individual',name:'A',employer:'BLOOMBERG LP',sector:'Media',committee:'a',amount:100},
    {type:'individual',name:'B',employer:'BLOOMBERG INC.',sector:'Media',committee:'a',amount:200},
    {type:'individual',name:'C',employer:'ARBELLA CONSULTING',sector:'Consulting',committee:'a',amount:300}
  ]);
  const lp=groups.find(g=>g.name==='BLOOMBERG L.P.');
  assert(lp);
  assert.equal(lp.research.parent,'Bloomberg Inc.');
  assert(groups.some(g=>g.name==='BLOOMBERG INC.'));
  assert.equal(groups.find(g=>g.name==='ARBELLA CONSULTING').research.status,'Unresolved');
});

test('researched aliases merge while subsidiaries, brands and unresolved names stay separate', () => {
  const employers=[
    'ARISTEIA CAPITAL','ARISTEIA CAPITAL LLC',
    'MICROSOFT','LINKEDIN CORP',
    'CREI',
    'AMAZON.COM SERVICES, INC.','AMAZON',
    'WARNER RECORDS','WARNER MUSIC INC.',
    'ACCENTURE','ACCENTURE INC.',
    'COINBASE','COINBASE INC.',
    'SIEMENS','SIEMENS CORPORATION',
    'DELAWARE NORTH COMPANIES','DELAWARE NORTH COMPANIES, INC.'
  ];
  const groups=buildDirectory(employers.map(employer=>({type:'individual',name:'Donor',employer,sector:'Test',committee:'one',amount:100})));
  const aristeia=groups.find(g=>g.name==='ARISTEIA CAPITAL, LLC');
  assert.equal(aristeia.count,2);assert.equal(aristeia.names.size,2);

  assert.equal(groups.find(g=>g.name==='CREI').research.status,'Unresolved');

  const amazonServices=groups.find(g=>g.name==='AMAZON.COM SERVICES LLC');
  assert.equal(amazonServices.research.status,'Source-backed');
  assert.equal(amazonServices.research.parent,'Amazon.com, Inc.');
  assert(groups.some(g=>g.name==='AMAZON.COM, INC.'));

  assert.equal(groups.find(g=>g.name==='LINKEDIN CORPORATION').research.parent,'Microsoft Corporation');
  assert.equal(groups.filter(g=>g.research?.parent==='Warner Music Group Corp.').length,2);

  assert.equal(groups.find(g=>g.name==='ACCENTURE').research.scope,'Business group / brand');
  assert.equal(groups.find(g=>g.name==='ACCENTURE INC.').research.status,'Unresolved');

  assert.equal(groups.find(g=>g.name==='COINBASE').research.parent,'Coinbase Global, Inc.');
  assert.equal(groups.find(g=>g.name==='COINBASE, INC.').research.parent,'Coinbase Global, Inc.');
  assert.notEqual(groups.find(g=>g.name==='COINBASE').key,groups.find(g=>g.name==='COINBASE, INC.').key);

  assert.equal(groups.find(g=>g.name==='SIEMENS').research.parent,'Siemens AG');
  assert.equal(groups.find(g=>g.name==='SIEMENS CORPORATION').research.parent,'Siemens USA Holdings, Inc.');
  assert.notEqual(groups.find(g=>g.name==='SIEMENS').key,groups.find(g=>g.name==='SIEMENS CORPORATION').key);

  assert.equal(groups.find(g=>g.name==='DELAWARE NORTH').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='DELAWARE NORTH COMPANIES, INC.').research.status,'Unresolved');

  assert(directoryCSV(groups).includes('https://adviserinfo.sec.gov/firm/summary/135986'));
});


test('generic employer labels remain unresolved after donor-context review', () => {
  const rows=[
    {type:'individual',name:'Stavis',employer:'VENTURE CAPITAL',occupation:'BESSEMER VENTURE PARTNERS',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Cecil',employer:'EAGLE KNOLLS CAPITAL',occupation:'CHAIRMAN AND CHIEF EXECUTIVE OFFICER',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Rubio',employer:'AWAY',occupation:'EXECUTIVE',sector:'Retail',committee:'a',amount:500},
    {type:'individual',name:'Murphy',employer:"BLOCK O'TOOLE & MURPHY LLP",occupation:'ATTORNEY',sector:'Legal',committee:'a',amount:600}
  ];
  const groups=buildDirectory(rows);
  assert.equal(groups.find(g=>g.name==='VENTURE CAPITAL').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='EAGLE KNOLLS CAPITAL').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='AWAY').research.scope,'Consumer brand / travel company');
  assert.equal(groups.find(g=>g.name==="BLOCK O'TOOLE & MURPHY, LLP").research.status,'Source-backed');
});


test('next research batch preserves PAC boundaries and unresolved same-name employers', () => {
  const rows=[
    {type:'organization',name:'VISA, INC. POLITICAL ACTION COMMITTEE',sector:'Finance',committee:'a',amount:1000},
    {type:'individual',name:'Donor',employer:'TRISOLARIS LLC',occupation:'CEO',sector:'Energy',committee:'a',amount:200},
    {type:'individual',name:'Donor',employer:'HBJ INVESTMENTS, LLC',occupation:'EXECUTIVE',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Donor',employer:'KAUFMAN HALL',occupation:'CONSULTANT',sector:'Professional',committee:'a',amount:400}
  ];
  const groups=buildDirectory(rows);
  const visa=groups.find(g=>g.name==='VISA INC.');
  assert.equal(visa.organization,1000);
  assert.equal(visa.research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='TRISOLARIS, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='HBJ INVESTMENTS, LLC').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='KAUFMAN, HALL & ASSOCIATES, LLC').research.parent,'Vizient, Inc.');
});
