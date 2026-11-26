import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {buildDirectory, identifyName, isResearchEligibleGroup, researchPriorityReasons, selectDirectory, directoryCSV, loadDirectoryRecords} from './business-directory-data.js';
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

test('priority queue includes executive single-donor employers but excludes ordinary one-person employer noise', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Small Donor',employer:'CLOVIS HOSPITAL',occupation:'NURSE',sector:'Healthcare',committee:'a',amount:3000},
    {type:'individual',name:'Small Donor',employer:'CLOVIS HOSPITAL',occupation:'NURSE',sector:'Healthcare',committee:'b',amount:2500},
    {type:'individual',name:'Employee One',employer:'MULTI EMPLOYER',occupation:'STAFF',sector:'Services',committee:'a',amount:1000},
    {type:'individual',name:'Employee Two',employer:'MULTI EMPLOYER',occupation:'STAFF',sector:'Services',committee:'a',amount:1200},
    {type:'individual',name:'Executive Donor',employer:'ONE PERSON EXEC CO',occupation:'CHIEF FINANCIAL OFFICER',sector:'Finance',committee:'a',amount:5000},
    {type:'organization',name:'TINY COMMUNITY PAC',sector:'Advocacy',committee:'a',amount:1000}
  ]);
  const clovis=groups.find(g=>g.name==='CLOVIS HOSPITAL');
  const multi=groups.find(g=>g.name==='MULTI EMPLOYER');
  const exec=groups.find(g=>g.name==='ONE PERSON EXEC CO');
  assert.equal(clovis.individualDonors.size,1);
  assert.equal(isResearchEligibleGroup(clovis),false);
  assert.equal(multi.individualDonors.size,2);
  assert.equal(isResearchEligibleGroup(multi),true);
  assert.equal(exec.individualDonors.size,1);
  assert.equal(isResearchEligibleGroup(exec),true);
  assert(researchPriorityReasons(exec).includes('Executive donor: Other C-suite officers'));
  const promoted=selectDirectory(groups,{view:'promoted'});
  assert(!promoted.some(g=>g.name==='CLOVIS HOSPITAL'));
  assert(promoted.some(g=>g.name==='MULTI EMPLOYER'));
  assert(promoted.some(g=>g.name==='ONE PERSON EXEC CO'));
  assert(promoted.some(g=>g.organizationCount===1));
  assert(selectDirectory(groups,{view:'promoted',query:'CLOVIS HOSPITAL'}).some(g=>g.name==='CLOVIS HOSPITAL'));
  assert(selectDirectory(groups,{view:'employers'}).some(g=>g.name==='CLOVIS HOSPITAL'));
});

test('business research directory remains inside See All Donor Transactions', async () => {
  const [combined,transactions]=await Promise.all([
    fs.readFile(new URL('./combined-contributions.html', import.meta.url),'utf8'),
    fs.readFile(new URL('./transactions.html', import.meta.url),'utf8')
  ]);
  assert(transactions.includes('id="business-directory"'));
  assert(transactions.includes('business-directory.js'));
  assert(transactions.includes('BUSINESS &amp; ORGANIZATION NAMES'));
  assert(!combined.includes('id="business-directory"'));
  assert(!combined.includes('business-directory.js'));
  assert(transactions.includes('<option>Reviewed label</option>'));
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
    reviewedLabels:listed.filter(g=>g.research?.status==='Reviewed label').length,
    unreviewed:listed.filter(g=>!g.research).length,
    priorityUnreviewed:listed.filter(g=>!g.research&&isResearchEligibleGroup(g)).length,
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
  assert.equal(groups.find(g=>g.name==='ARBELLA CONSULTING').research.status,'Source-backed');
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

  assert.equal(groups.find(g=>g.name==="THE CHILDREN'S RESEARCH AND EDUCATION INSTITUTE, INC.").research.status,'Source-backed');

  const amazonServices=groups.find(g=>g.name==='AMAZON.COM SERVICES LLC');
  assert.equal(amazonServices.research.status,'Source-backed');
  assert.equal(amazonServices.research.parent,'Amazon.com, Inc.');
  assert(groups.some(g=>g.name==='AMAZON.COM, INC.'));

  assert.equal(groups.find(g=>g.name==='LINKEDIN CORPORATION').research.parent,'Microsoft Corporation');
  assert.equal(groups.filter(g=>g.research?.parent==='Warner Music Group Corp.').length,2);

  assert.equal(groups.find(g=>g.name==='ACCENTURE').research.scope,'Business group / brand');
  assert.equal(groups.find(g=>g.name==='ACCENTURE INC.').research.status,'Source-backed');

  assert.equal(groups.find(g=>g.name==='COINBASE').research.parent,'Coinbase Global, Inc.');
  assert.equal(groups.find(g=>g.name==='COINBASE, INC.').research.parent,'Coinbase Global, Inc.');
  assert.notEqual(groups.find(g=>g.name==='COINBASE').key,groups.find(g=>g.name==='COINBASE, INC.').key);

  assert.equal(groups.find(g=>g.name==='SIEMENS').research.parent,'Siemens AG');
  assert.equal(groups.find(g=>g.name==='SIEMENS CORPORATION').research.parent,'Siemens USA Holdings, Inc.');
  assert.notEqual(groups.find(g=>g.name==='SIEMENS').key,groups.find(g=>g.name==='SIEMENS CORPORATION').key);

  assert.equal(groups.find(g=>g.name==='DELAWARE NORTH').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='DELAWARE NORTH COMPANIES, INC.').research.status,'Source-backed');

  assert(directoryCSV(groups).includes('https://adviserinfo.sec.gov/firm/summary/135986'));
});


test('generic labels are reviewed separately while source-backed business names are not left unresolved', () => {
  const rows=[
    {type:'individual',name:'Stavis',employer:'VENTURE CAPITAL',occupation:'BESSEMER VENTURE PARTNERS',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Cecil',employer:'EAGLE KNOLLS CAPITAL',occupation:'CHAIRMAN AND CHIEF EXECUTIVE OFFICER',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Rubio',employer:'AWAY',occupation:'EXECUTIVE',sector:'Retail',committee:'a',amount:500},
    {type:'individual',name:'Murphy',employer:"BLOCK O'TOOLE & MURPHY LLP",occupation:'ATTORNEY',sector:'Legal',committee:'a',amount:600}
  ];
  const groups=buildDirectory(rows);
  assert.equal(groups.find(g=>g.name==='VENTURE CAPITAL').research.status,'Reviewed label');
  assert.equal(groups.find(g=>g.name==='EAGLE KNOLLS CAPITAL').research.status,'Source-backed');
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
  assert.equal(groups.find(g=>g.name==='HBJ INVESTMENTS, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='KAUFMAN, HALL & ASSOCIATES, LLC').research.parent,'Vizient, Inc.');
});


test('raw PAC receipts stay separate from connected companies in researched identities', () => {
  const rows=[
    {type:'organization',name:'VERIZON COMMUNICATIONS, INC. POLITICAL ACTION COMMITTEE (VERIZON PAC)',sector:'Technology',committee:'a',amount:1000},
    {type:'individual',name:'Person',employer:'VERIZON COMMUNICATIONS, INC.',occupation:'EXECUTIVE',sector:'Technology',committee:'a',amount:200},
    {type:'organization',name:'POET PAC',sector:'Energy',committee:'a',amount:300},
    {type:'individual',name:'Broin',employer:'POET',occupation:'CEO',sector:'Energy',committee:'a',amount:400},
    {type:'organization',name:'AMERICAN EXPRESS COMPANY POLITICAL ACTION COMMITTEE',sector:'Finance',committee:'a',amount:500},
    {type:'individual',name:'Person 2',employer:'AMERICAN EXPRESS COMPANY',occupation:'EXECUTIVE',sector:'Finance',committee:'a',amount:600}
  ];
  const groups=buildDirectory(rows);
  const vpac=groups.find(g=>g.name==='VERIZON COMMUNICATIONS, INC. POLITICAL ACTION COMMITTEE (VERIZON PAC)');
  const vcorp=groups.find(g=>g.name==='VERIZON COMMUNICATIONS INC.');
  assert(vpac);assert(vcorp);assert.notEqual(vpac.key,vcorp.key);
  assert.equal(vpac.organization,1000);assert.equal(vcorp.individual,200);
  const poetPac=groups.find(g=>g.name==='POET PAC'), poet=groups.find(g=>g.name==='POET, LLC');
  assert(poetPac);assert(poet);assert.notEqual(poetPac.key,poet.key);
  assert.equal(poetPac.organization,300);assert.equal(poet.individual,400);
  const axpPac=groups.find(g=>g.name==='AMERICAN EXPRESS COMPANY POLITICAL ACTION COMMITTEE (AXPPAC)');
  const axp=groups.find(g=>g.name==='AMERICAN EXPRESS COMPANY');
  assert(axpPac);assert(axp);assert.notEqual(axpPac.key,axp.key);
});


test('PAC former-name batch preserves current FEC identity and union/company boundaries', () => {
  const rows=[
    {type:'organization',name:'ROCK HOLDINGS INC. PAC',sector:'Finance',committee:'a',amount:100},
    {type:'organization',name:'TD BANK N.A. POLITICAL ACTION COMMITTEE',sector:'Finance',committee:'a',amount:200},
    {type:'organization',name:'NATIONAL TREASURY EMPLOYEES UNION POLITICAL ACTION COMMITTEE',sector:'Labor',committee:'a',amount:300},
    {type:'individual',name:'Member',employer:'NATIONAL TREASURY EMPLOYEES UNION',occupation:'STAFF',sector:'Labor',committee:'a',amount:400},
    {type:'organization',name:'CISCO SYSTEMS, INC. FEDERAL PAC, AKA CISCO SYSTEMS EPAC',sector:'Technology',committee:'a',amount:500},
    {type:'individual',name:'Exec',employer:'CISCO',occupation:'OPERATIONS EXECUTIVE',sector:'Technology',committee:'a',amount:600}
  ];
  const g=buildDirectory(rows);
  assert(g.some(x=>x.name==='ROCKET LIMITED PARTNERSHIP PAC (ROCKET PAC)'));
  assert(g.some(x=>x.name==='TD BANK US HOLDING COMPANY POLITICAL ACTION COMMITTEE (TD BANK PAC)'));
  const nteuPac=g.find(x=>x.name==='NATIONAL TREASURY EMPLOYEES UNION POLITICAL ACTION COMMITTEE');
  const nteu=g.find(x=>x.name==='NATIONAL TREASURY EMPLOYEES UNION');
  assert(nteuPac&&nteu&&nteuPac.key!==nteu.key);
  assert(g.some(x=>x.name==='CISCO SYSTEMS, INC. FEDERAL PAC (AKA CISCO SYSTEMS E-PAC)'));
  assert(g.some(x=>x.name==='CISCO'));
});


test('executive-priority research batch resolves exact identities without forcing ambiguous brands', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Harrington',employer:'CAP CITY GROUP',occupation:'PRESIDENT',sector:'Lobbying',committee:'a',amount:100},
    {type:'individual',name:'Burton',employer:'CITYVIEW',occupation:'CEO',sector:'Finance',committee:'a',amount:200},
    {type:'individual',name:'Freston',employer:'FIREFLY3',occupation:'PRINCIPAL',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Nathanson',employer:'MAPLETON INVESTMENTS',occupation:'CHAIR',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Sai',employer:'STORY',occupation:'COO',sector:'Cannabis',committee:'a',amount:500},
    {type:'individual',name:'Crotty',employer:'JSI',occupation:'CEO',sector:'Services',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='CAPITOL CITY GROUP, LTD.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CITYVIEW MANAGEMENT SERVICES, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FIREFLY3 LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MAPLETON INVESTMENTS, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='STORY').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='JSI').research.scope,'Business group / brand covering related entities');
});


test('remaining executive batch preserves PAC, brand and unresolved boundaries', () => {
  const rows=[
    {type:'organization',name:'HUMAN RIGHTS CAMPAIGN PAC',sector:'Advocacy',committee:'a',amount:100},
    {type:'individual',name:'Staff',employer:'HUMAN RIGHTS CAMPAIGN',occupation:'STAFF',sector:'Advocacy',committee:'a',amount:200},
    {type:'individual',name:'Lawrence',employer:'FELDMAN DEVELOPMENT',occupation:'CEO',sector:'Real Estate',committee:'a',amount:300},
    {type:'individual',name:'Consultant',employer:'BRIDGE 360 ADVISORY',occupation:'ADVISOR',sector:'Professional',committee:'a',amount:400},
    {type:'organization',name:'POLITICAL ACTION COMMITTEE OF THE INTERNATIONAL ALLIANCE OF THEATRICAL STAGE EMPLOYES',sector:'Labor',committee:'a',amount:500}
  ];
  const g=buildDirectory(rows);
  const hp=g.find(x=>x.name==='HUMAN RIGHTS CAMPAIGN PAC'),h=g.find(x=>x.name==='HUMAN RIGHTS CAMPAIGN');
  assert(hp&&h&&hp.key!==h.key);
  assert.equal(g.find(x=>x.name==='FELDMAN DEVELOPMENT').research.status,'Source-backed');
  assert.equal(g.find(x=>x.name==='BRIDGE 360 ADVISORY').research.status,'Unresolved');
  assert(g.some(x=>x.name==='POLITICAL ACTION COMMITTEE OF THE INTERNATIONAL ALLIANCE OF THEATRICAL STAGE EMPLOYEES'));
});


test('executive-priority follow-up preserves brand scope and unresolved Austin employer', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Clunie',employer:'EDWARD JONES',occupation:'PRINCIPAL',sector:'Finance',committee:'a',amount:100},
    {type:'individual',name:'Miller',employer:'ABUNDANT VENTURE PARTNERS',occupation:'OPERATING PARTNER/BOARD MEMBER',sector:'Finance',committee:'a',amount:200},
    {type:'individual',name:'OKelley',employer:'AUSTIN SPORTS ACADEMY',occupation:'OWNER',sector:'Sports',committee:'a',amount:300},
    {type:'individual',name:'Benenson',employer:'BENENSON CAPITAL',occupation:'PARTNER',sector:'Real Estate',committee:'a',amount:400}
  ]);
  assert.equal(groups.find(g=>g.name==='EDWARD JONES').research.parent,'The Jones Financial Companies, L.L.L.P.');
  assert.equal(groups.find(g=>g.name==='ABUNDANT VENTURE PARTNERS').research.scope,'Venture-capital firm / brand; exact employing legal entity not established');
  assert.equal(groups.find(g=>g.name==='AUSTIN SPORTS ACADEMY').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='BENENSON CAPITAL').research.scope,'Real-estate business group / brand');
});


test('third executive-priority batch preserves labels, legal entities and unresolved boundaries', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Boland',employer:'DADA',occupation:'CIO',sector:'Finance',committee:'a',amount:100},
    {type:'individual',name:'Serrao',employer:"DRINK WILLIE'S",occupation:'CEO',sector:'Consumer',committee:'a',amount:200},
    {type:'individual',name:'Leonard',employer:'EISNER ADVISORY LLC',occupation:'CPA, PARTNER',sector:'Professional',committee:'a',amount:300},
    {type:'individual',name:'Forman',employer:'FUTURE STANDARD',occupation:'EXECUTIVE CHAIRMAN',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Munk',employer:'MARQUIS HEALTH',occupation:'CEO',sector:'Healthcare',committee:'a',amount:500},
    {type:'individual',name:'Rokeach',employer:'MARQUIS LIMITED LLC',occupation:'PRESIDENT AND FOUNDER',sector:'Healthcare',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='DADA HOLDINGS').research.scope,'Investment and management group / brand');
  assert.equal(groups.find(g=>g.name==="WILLIE'S REMEDY+").research.scope,'Consumer beverage brand; exact employing legal entity not established');
  assert.equal(groups.find(g=>g.name==='EISNER ADVISORY GROUP LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FUTURE STANDARD').research.scope,'Alternative-asset-management brand / business group');
  assert.equal(groups.find(g=>g.name==='MARQUIS HEALTH CONSULTING SERVICES').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MARQUIS LIMITED LLC').research.status,'Source-backed');
});


test('fourth executive-priority batch keeps legal, brand and unresolved identity scopes distinct', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Goodman',employer:'MG CAPITAL HOLDINGS INC.',occupation:'CHAIRMAN',sector:'Finance',committee:'a',amount:100},
    {type:'individual',name:'Dixon',employer:'MONUMENTAL SPORTS',occupation:'PRESIDENT',sector:'Sports',committee:'a',amount:200},
    {type:'individual',name:'Rosen',employer:'ROSEN HARBOTTLE COMMERCIAL REAL ESTATE',occupation:'PRINCIPAL',sector:'Real Estate',committee:'a',amount:300},
    {type:'individual',name:'Samuels',employer:'THE VISTRIA GROUP PRG',occupation:'PARTNER AND CO-HEAD',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Pelman',employer:'UNION PLAZA CARE CENTER',occupation:'CEO',sector:'Healthcare',committee:'a',amount:500},
    {type:'individual',name:'Grace',employer:'MORTGAGE BANKERS ASSOCIATION',occupation:'SENIOR EXECUTIVE',sector:'Real Estate',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='MG CAPITAL HOLDINGS, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MONUMENTAL SPORTS & ENTERTAINMENT').research.scope,'Sports and entertainment business group / operating brand');
  assert.equal(groups.find(g=>g.name==='ROSEN HARBOTTLE COMMERCIAL REAL ESTATE').research.scope,'Commercial real-estate firm / brand; exact legal entity not established');
  assert.equal(groups.find(g=>g.name==='VISTRIA PRG, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='UNION PLAZA NURSING HOME INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MORTGAGE BANKERS ASSOCIATION').research.scope,'National real-estate-finance trade association');
});


test('fifth executive-priority batch separates exact entities from brands and unresolved employers', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Eisenshtadt',employer:'AMROCK HOLDINGS',occupation:'EXECUTIVE',sector:'Finance',committee:'a',amount:100},
    {type:'individual',name:'Bernstein',employer:'CHELSEA PIERS',occupation:'BUSINESS OWNER',sector:'Sports',committee:'a',amount:200},
    {type:'individual',name:'Furman',employer:'EXXONMOBIL',occupation:'VICE PRESIDENT',sector:'Energy',committee:'a',amount:300},
    {type:'individual',name:'Kieloch',employer:'KIELOCH CONSULTING',occupation:'FOUNDER',sector:'Professional',committee:'a',amount:400},
    {type:'individual',name:'Jacobs',employer:'SILVER RABBIT',occupation:'PRESIDENT',sector:'Other',committee:'a',amount:500},
    {type:'individual',name:'Dash',employer:'SUPER NICHE INC.',occupation:'FOUNDER',sector:'Media',committee:'a',amount:600},
    {type:'individual',name:'Mandel',employer:'LONE PINE CAPITAL',occupation:'FOUNDER',sector:'Finance',committee:'a',amount:700}
  ]);
  assert.equal(groups.find(g=>g.name==='AMROCK HOLDINGS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CHELSEA PIERS').research.scope,'Sports and recreation business group / brand');
  assert.equal(groups.find(g=>g.name==='EXXONMOBIL').research.scope,'Energy business group / brand; exact employing legal entity not established');
  assert.equal(groups.find(g=>g.name==='KIELOCH CONSULTING').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SILVER RABBIT').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SUPER NICHE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='LONE PINE CAPITAL LLC').research.status,'Source-backed');
});


test('sixth executive-priority batch consolidates verified variants without collapsing ambiguous employers', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Meltzer',employer:'NFP AN AON COMPANY',occupation:'CEO',sector:'Insurance',committee:'a',amount:100},
    {type:'individual',name:'Meltzer',employer:'NFP AND AON COMPANY',occupation:'CEO',sector:'Insurance',committee:'b',amount:200},
    {type:'individual',name:'Ashy',employer:'GOVALIDATE',occupation:'OWNER',sector:'Technology',committee:'a',amount:300},
    {type:'individual',name:'Davis',employer:'CAPITOL HILL CONSULTING GROUP',occupation:'SENIOR VICE PRESIDENT',sector:'Lobbying',committee:'a',amount:400},
    {type:'individual',name:'Bernstein',employer:'GSIHEALTH',occupation:'EXECUTIVE',sector:'Healthcare',committee:'a',amount:500},
    {type:'individual',name:'Moskowitz',employer:'VIVAGE',occupation:'CEO',sector:'Healthcare',committee:'a',amount:600}
  ]);
  const nfp=groups.find(g=>g.name==='NFP');
  assert.equal(nfp.count,2);
  assert.equal(nfp.names.size,2);
  assert.equal(groups.find(g=>g.name==='GOVALIDATE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CAPITOL HILL CONSULTING GROUP').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='GSI HEALTH').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='QP HEALTH CARE SERVICES, LLC').research.status,'Source-backed');
});


test('seventh executive-priority batch resolves contextual acronyms without forcing ambiguous ones', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Grossman',employer:'ICIC',occupation:'CEO',sector:'Advocacy',committee:'a',amount:100},
    {type:'individual',name:'Vida',employer:'ROCKET LLC',occupation:'SVP',sector:'Finance',committee:'a',amount:200},
    {type:'individual',name:'McGuire',employer:'IHS',occupation:'CEO',sector:'Healthcare',committee:'a',amount:300},
    {type:'individual',name:'Levin',employer:'T:PZ',occupation:'CHAIR - NON PROFIT',sector:'Education',committee:'a',amount:400},
    {type:'individual',name:'Galvin',employer:'DCA',occupation:'EXEC DIR',sector:'Advocacy',committee:'a',amount:500},
    {type:'individual',name:'Frymoyer',employer:'MEMA',occupation:'VICE PRESIDENT PUBLIC POLICY',sector:'Manufacturing',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='INITIATIVE FOR A COMPETITIVE INNER CITY, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='ROCKET').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='INNOVATIONS HEALTH SYSTEMS, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='THE POSSIBLE ZONE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='DIGITAL CITIZENS ALLIANCE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MOTOR & EQUIPMENT MANUFACTURERS ASSOCIATION').research.status,'Source-backed');
});


test('eighth executive-priority batch keeps ambiguous names separate from supported legal and brand identities', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Coker',employer:'KILLER MEXICAN MANAGEMENT LLC',occupation:'RESTAURANT EXECUTIVE',sector:'Hospitality',committee:'a',amount:100},
    {type:'individual',name:'Reeves',employer:'MARYSIA LLC',occupation:'CFO',sector:'Retail',committee:'a',amount:200},
    {type:'individual',name:'Roncalli',employer:'TXP SERVICES',occupation:'EXECUTIVE',sector:'Services',committee:'a',amount:300},
    {type:'individual',name:'Doyle',employer:'BRUNSWICK GROUP',occupation:'PARTNER',sector:'Consulting',committee:'a',amount:400},
    {type:'individual',name:'Li',employer:'ASCEND LEARNING',occupation:'CEO',sector:'Education',committee:'a',amount:500},
    {type:'individual',name:'Murphy',employer:'COASTAL CONSTRUCTION',occupation:'EXECUTIVE VICE PRESIDENT',sector:'Construction',committee:'a',amount:600},
    {type:'individual',name:'Berlin',employer:'DREAM',occupation:'CEO',sector:'Education',committee:'a',amount:700}
  ]);
  assert.equal(groups.find(g=>g.name==='KILLER MEXICAN MANAGEMENT, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MARYSIA, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='TXP SERVICES').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='BRUNSWICK GROUP').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='ASCEND LEARNING, INC.').research.scope,'Brooklyn charter-school nonprofit organization');
  assert.equal(groups.find(g=>g.name==='COASTAL CONSTRUCTION').research.scope,'Florida construction business group / brand');
  assert.equal(groups.find(g=>g.name==='HARLEM RBI, INC. D/B/A DREAM').research.status,'Source-backed');
});


test('ninth executive-priority batch resolves organizations while retaining ambiguous acronym and employer matches', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Russell',employer:'GNE',occupation:'VICE PRESIDENT',sector:'Technology',committee:'a',amount:100},
    {type:'individual',name:'Holt',employer:'HOLT HOSPITALITY LLC',occupation:'EXECUTIVE',sector:'Hospitality',committee:'a',amount:200},
    {type:'individual',name:'Mackay',employer:'LEVERAGED',occupation:'EXECUTIVE DIRECTOR',sector:'Education',committee:'a',amount:300},
    {type:'individual',name:'Berkovitz',employer:'MILLENNIUM MANAGEMENT',occupation:'VICE CHAIR',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Landau',employer:'PENN AVENUE',occupation:'PARTNER',sector:'Lobbying',committee:'a',amount:500},
    {type:'individual',name:'Holoway',employer:'SOLO FUNDS',occupation:'CEO',sector:'Finance',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='GENENTECH, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='HOLT HOSPITALITY, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='LEVERAGED FOUNDATION').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MILLENNIUM MANAGEMENT LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PENN AVENUE PARTNERS LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SOLO FUNDS, INC.').research.status,'Source-backed');
});


test('tenth executive-priority batch resolves supported identities and consolidates K & M Office alias', () => {
  const groups=buildDirectory([
    {type:'individual',name:'K Williams',employer:'K & M OFFICE',occupation:'CEO',sector:'Services',committee:'a',amount:100},
    {type:'individual',name:'K Williams',employer:'K&M OFFICE LLC',occupation:'CEO/CPA',sector:'Services',committee:'b',amount:200},
    {type:'individual',name:'Kinnari',employer:'THE FUTURE FORUM',occupation:'EXECUTIVE DIRECTOR',sector:'Advocacy',committee:'a',amount:300},
    {type:'individual',name:'Granter',employer:'SIMPLYEZ HDM LLC',occupation:'OWNER',sector:'Healthcare',committee:'a',amount:400},
    {type:'individual',name:'Edelman',employer:'UNIFIED RESOURCES',occupation:'C LEVEL EXECUTIVE',sector:'Retail',committee:'a',amount:500},
    {type:'individual',name:'Pellizzon',employer:'CLEAR CAPITAL',occupation:'PARTNER',sector:'Real Estate',committee:'a',amount:600},
    {type:'individual',name:'Elam',employer:'NATIONAL BANKERS ASSOCIATION',occupation:'EXECUTIVE',sector:'Finance',committee:'a',amount:700}
  ]);
  const km=groups.find(g=>g.name==='K & M OFFICE LLC');
  assert.equal(km.count,2);
  assert.equal(km.names.size,2);
  assert.equal(groups.find(g=>g.name==='THE FUTURE FORUM').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SIMPLYEZ HOME DELIVERED MEALS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='UNIFIED RESOURCES IN DISPLAY').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CLEAR CAPITAL, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL BANKERS ASSOCIATION, INC.').research.status,'Source-backed');
});


test('eleventh executive-priority batch preserves unresolved farm and entertainment names while resolving public and nonprofit entities', () => {
  const groups=buildDirectory([
    {type:'individual',name:'DAmbrosio',employer:'EMERALD PEAK ENTERTAINMENT',occupation:'EXECUTIVE PRODUCER',sector:'Media',committee:'a',amount:100},
    {type:'individual',name:'Smith',employer:'JD DOVE FARMS',occupation:'PRESIDENT/COO',sector:'Agriculture',committee:'a',amount:200},
    {type:'individual',name:'White',employer:'JERSEYCAN',occupation:'NONPROFIT EXECUTIVE',sector:'Education',committee:'a',amount:300},
    {type:'individual',name:'Marquez',employer:'LBUCC',occupation:'HEALTH CARE CEO',sector:'Healthcare',committee:'a',amount:400},
    {type:'individual',name:'Cotton',employer:'PORT AUTHORITY OF NY AND NJ',occupation:'EXECUTIVE',sector:'Government',committee:'a',amount:500},
    {type:'individual',name:'Shitama',employer:'AKIRA',occupation:'CEO',sector:'Manufacturing',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='EMERALD PEAK ENTERTAINMENT').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='JD DOVE FARMS').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='JERSEYCAN').research.parent,'50CAN, Inc.');
  assert.equal(groups.find(g=>g.name==='LOS BARRIOS UNIDOS COMMUNITY CLINIC, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='THE PORT AUTHORITY OF NEW YORK AND NEW JERSEY').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='AKIRA WOOD, INC.').research.status,'Source-backed');
});


test('twelfth executive-priority batch resolves exact employers while keeping generic acronyms unresolved', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Navidi',employer:'UNITED GENERAL BAKERIES',occupation:'VP// PRODUCTION',sector:'Food',committee:'a',amount:100},
    {type:'individual',name:'De Onis',employer:'SKYLIGHT',occupation:'EXECUTIVE DIRECTOR',sector:'Media',committee:'a',amount:200},
    {type:'individual',name:'Sears',employer:'FIN',occupation:'PRESIDENT',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Carter',employer:'NCCIINC',occupation:'EXECUTIVE',sector:'Insurance',committee:'a',amount:400},
    {type:'individual',name:'Darrah',employer:'PC DEVELOPMENT GROUP INC.',occupation:'BIZ OWNER',sector:'Real Estate',committee:'a',amount:500},
    {type:'individual',name:'Pointer',employer:'NOEL POINTER FOUNDATION INC',occupation:'FOUNDER/DIRECTOR',sector:'Nonprofit',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='UNITED GENERAL BAKERY INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SKYLIGHT ENGAGEMENT, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FINANCIAL INFORMATION NETWORK, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL COUNCIL ON COMPENSATION INSURANCE, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PC DEVELOPMENT GROUP, INC.').research.scope,'Historical Florida legal entity / development company');
  assert.equal(groups.find(g=>g.name==='THE NOEL POINTER FOUNDATION, INC.').research.status,'Source-backed');
});


test('thirteenth executive-priority batch separates exact organizations from ambiguous shorthand', () => {
  const groups=buildDirectory([
    {type:'individual',name:'McElroy',employer:'BROADSPIRE',occupation:'ACCOUNT EXECUTIVE',sector:'Insurance',committee:'a',amount:100},
    {type:'individual',name:'White',employer:'GW RETIL CONSULTING',occupation:'CEO',sector:'Consulting',committee:'a',amount:200},
    {type:'individual',name:'Brown',employer:'BROWN BROWN INS',occupation:'INSURANCE AGENT/PRINCIPAL',sector:'Insurance',committee:'a',amount:300},
    {type:'individual',name:'Hunter',employer:'CAREOREGON',occupation:'EXECUTIVE',sector:'Healthcare',committee:'a',amount:400},
    {type:'individual',name:'Walton',employer:'NAADAC THE ASSN FOR ADDICTION PROFESSI',occupation:'CEO',sector:'Nonprofit',committee:'a',amount:500},
    {type:'individual',name:'McAneny',employer:'NEW MEXICO CANCER CENTER',occupation:'PHYSICIAN CEO',sector:'Healthcare',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='BROADSPIRE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='GW RETAIL CONSULTING').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='BROWN BROWN INSURANCE SERVICES, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CAREOREGON, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NAADAC, THE ASSOCIATION FOR ADDICTION PROFESSIONALS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NEW MEXICO CANCER CENTER').research.scope,'Cancer-care practice brand operated by New Mexico Oncology Hematology Consultants, Ltd.');
});


test('fourteenth executive-priority batch keeps generic shorthand unresolved and scopes operating brands correctly', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Beebe',employer:'PDX GALLERY INC',occupation:'GALLERY OWNER',sector:'Arts',committee:'a',amount:100},
    {type:'individual',name:'Greer',employer:'FOX HOLLOW VENTURES LLC',occupation:'PRESIDENT',sector:'Finance',committee:'a',amount:200},
    {type:'individual',name:'Schoedler',employer:'RSS-TGP',occupation:'CO-OWNER',sector:'Business',committee:'a',amount:300},
    {type:'individual',name:'Leach',employer:'WESTCOAST BLACK THEATRE TROUPE',occupation:'EXECUTIVE DIRECTOR',sector:'Arts',committee:'a',amount:400},
    {type:'individual',name:'Kenney',employer:'XCEL ENERGY COLORADO',occupation:'PRESIDENT',sector:'Energy',committee:'a',amount:500},
    {type:'individual',name:'Mingo',employer:'SIP N CHAT',occupation:'BUSINESS EXECUTIVE',sector:'Hospitality',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='PDX GALLERY, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FOX HOLLOW VENTURES LLC').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='RSS-TGP').research.status,'Unresolved');
  assert.equal(groups.find(g=>g.name==='WESTCOAST BLACK THEATRE TROUPE OF FLORIDA, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='XCEL ENERGY – COLORADO').research.scope,'Colorado operating-company / public-facing utility identity');
  assert.equal(groups.find(g=>g.name==='SIP N CHAT COCKTAIL LOUNGE INC.').research.status,'Source-backed');
});


test('fifteenth executive-priority batch records role conflicts and supported spelling corrections without over-merging', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Dhaliwal',employer:'CAMBIA',occupation:'ACCOUNT EXECUTIVE',sector:'Healthcare',committee:'a',amount:100},
    {type:'individual',name:'Glady',employer:'EUSCLID SYSTEMS CORP',occupation:'EXECUTIVE',sector:'Technology',committee:'a',amount:200},
    {type:'individual',name:'Willingham',employer:'ELM PARK GROUP',occupation:'BUSINESS OWNER',sector:'Finance',committee:'a',amount:300},
    {type:'individual',name:'Terry',employer:'PRECISION AUTO GLASS',occupation:'OWNER/OPERATOR',sector:'Auto',committee:'a',amount:400},
    {type:'individual',name:'Carpenter',employer:'CANTEBURY CAPITAL INC.',occupation:'OWNER',sector:'Finance',committee:'a',amount:500},
    {type:'individual',name:'Silver',employer:'CLAYMONT SOC.',occupation:'EXEC. DIRECTOR',sector:'Nonprofit',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='CAMBIA HEALTH SOLUTIONS, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='EUCLID SYSTEMS CORPORATION').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='ELM PARK GROUP LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PRECISION AUTO GLASS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CANTERBURY CAPITAL, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CLAYMONT SOCIETY FOR CONTINUOUS EDUCATION').research.status,'Source-backed');
});


test('sixteenth executive-priority batch consolidates Raben shorthand and preserves independent-agent boundaries', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Raben',employer:'RABEN',occupation:'PRESIDENT',sector:'Lobbying',committee:'a',amount:100},
    {type:'individual',name:'Polanco',employer:'STATE FARM',occupation:'INSURANCE AGENCY OWNER',sector:'Insurance',committee:'a',amount:200},
    {type:'individual',name:'Stettner',employer:'ASC',occupation:'PHYSICIST/BOARD CHAIRMAN',sector:'Technology',committee:'a',amount:300},
    {type:'individual',name:'Nelson',employer:'CALVERT SYSTEMS',occupation:'EXECUTIVE',sector:'Technology',committee:'a',amount:400},
    {type:'individual',name:'Arnett',employer:'ORBIT MOVERS AND ERECTORS',occupation:'BUSINESS OWNER',sector:'Services',committee:'a',amount:500},
    {type:'individual',name:'McCreery',employer:'MCCREERY INC.',occupation:'CHAIRMAN',sector:'Services',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='THE RABEN GROUP, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='STATE FARM').research.scope,'Insurance brand / independent-agent relationship; not the donor\'s legal employing entity');
  assert.equal(groups.find(g=>g.name==='ADVANCED SCIENTIFIC CONCEPTS, LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CALVERT SYSTEMS ENGINEERING, INCORPORATED').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='ORBIT MOVERS & ERECTORS, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MCCREERY INC.').research.status,'Source-backed');
});


test('seventeenth executive-priority batch keeps Noodle legal identities separate and preserves role discrepancies', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Katzman',employer:'NOODLE EDUCATION',occupation:'FOUNDER AND CEO',sector:'Education',committee:'a',amount:100},
    {type:'individual',name:'Katzman',employer:'NOODLE PARTNERS PBC',occupation:'CEO',sector:'Education',committee:'b',amount:200},
    {type:'individual',name:'Rich',employer:'TRANSITION EXPRESS INC',occupation:'NONPROFIT CEO',sector:'Nonprofit',committee:'a',amount:300},
    {type:'individual',name:'Boepple',employer:'PACWTC',occupation:'PRESIDENT',sector:'Arts',committee:'a',amount:400},
    {type:'individual',name:'Polanco',employer:'STATE FARM',occupation:'INSURANCE AGENCY OWNER',sector:'Insurance',committee:'a',amount:500},
    {type:'individual',name:'Radow',employer:'RADCO MANAGEMENT',occupation:'CEO',sector:'Real Estate',committee:'a',amount:600}
  ]);
  assert(groups.some(g=>g.name==='NOODLE EDUCATION INC.'));
  assert(groups.some(g=>g.name==='NOODLE'));
  assert.notEqual(groups.find(g=>g.name==='NOODLE EDUCATION INC.').key,groups.find(g=>g.name==='NOODLE').key);
  assert.equal(groups.find(g=>g.name==='TRANSITION EXPRESS INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='WORLD TRADE CENTER PERFORMING ARTS CENTER, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='STATE FARM').research.scope,'Insurance brand / independent-agent relationship; not the donor\'s legal employing entity');
  assert.equal(groups.find(g=>g.name==='RADCO MANAGEMENT, INC.').research.status,'Source-backed');
});


test('PAC research keeps federal committees separate from connected organizations and employer strings', () => {
  const groups=buildDirectory([
    {type:'organization',name:'LPL FINANCIAL LLC POLITICAL ACTION COMMITTEE (LPL PAC)',sector:'Finance',committee:'a',amount:750000},
    {type:'individual',name:'Employee',employer:'LPL FINANCIAL LLC',occupation:'STAFF',sector:'Finance',committee:'a',amount:100},
    {type:'organization',name:'INTERNATIONAL ASSOCIATION OF FIRE FIGHTERS',sector:'Labor',committee:'a',amount:500000},
    {type:'individual',name:'Fire Fighter',employer:'INTERNATIONAL ASSOCIATION OF FIRE FIGHTERS',occupation:'STAFF',sector:'Labor',committee:'a',amount:100}
  ]);
  const lplPac=groups.find(g=>g.name==='LPL FINANCIAL LLC POLITICAL ACTION COMMITTEE (LPL PAC)');
  const lplEmployer=groups.find(g=>g.name==='LPL FINANCIAL LLC');
  const iaffPac=groups.find(g=>g.name==='INTERNATIONAL ASSOCIATION OF FIREFIGHTERS INTERESTED IN REGISTRATION AND EDUCATION PAC');
  const iaffEmployer=groups.find(g=>g.name==='INTERNATIONAL ASSOCIATION OF FIRE FIGHTERS');
  assert.equal(lplPac.organizationCount,1);
  assert.equal(lplEmployer.individualCount,1);
  assert.equal(iaffPac.organizationCount,1);
  assert.equal(iaffPac.research.status,'Source-backed');
  assert.equal(iaffEmployer.individualCount,1);
  assert.equal(iaffEmployer.research,null);
});

test('historical PAC report names resolve by durable FEC committee identity', () => {
  const groups=buildDirectory([
    {type:'organization',name:'CARDINAL HEALTH INC. PAC A/K/A CARDINAL HEALTH COMPANIES PAC',sector:'Healthcare',committee:'a',amount:100},
    {type:'organization',name:'FRESENIUS MEDICAL CARE NORTH AMERICA PAC',sector:'Healthcare',committee:'a',amount:200},
    {type:'organization',name:"NATIONAL MARINE MANUFACTURERS ASSOCIATION'S BOAT POLITICAL ACTION COMMITTEE",sector:'Trade',committee:'a',amount:300}
  ]);
  assert.equal(groups.find(g=>g.name==='CARDINAL HEALTH INC. PAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FRESENIUS MEDICAL CARE HOLDINGS, INC. POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL MARINE MANUFACTURERS ASSOCIATION AND MARINE RETAILERS ASSOCIATION BOAT PAC').research.status,'Source-backed');
});


test('nineteenth priority batch preserves PAC, subsidiary, tribal and employer-brand boundaries', () => {
  const groups=buildDirectory([
    {type:'organization',name:'TOYOTA MOTOR NORTH AMERICA INC PAC AKA TOYOTA/LEXUS PAC',sector:'Automotive',committee:'a',amount:100},
    {type:'organization',name:'INDEPENDENCE BLUE CROSS LLC PAC',sector:'Healthcare',committee:'a',amount:200},
    {type:'organization',name:'HUNTINGTON INGALLS INDUSTRIES POLITICAL ACTION COMMITTE (SHIPPAC)',sector:'Defense',committee:'a',amount:300},
    {type:'individual',name:'Fink',employer:'BLACKROCK',occupation:'CEO',sector:'Finance',committee:'a',amount:400},
    {type:'individual',name:'Banker',employer:'TD BANK',occupation:'EXECUTIVE',sector:'Finance',committee:'a',amount:500},
    {type:'individual',name:'Lawyer',employer:'ARNOLD & PORTER',occupation:'PARTNER',sector:'Legal',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='TOYOTA MOTOR NORTH AMERICA, INC POLITICAL ACTION COMMITTEE (TOYOTA/LEXUS PAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='INDEPENDENCE BLUE CROSS LLC PAC').research.scope,'Federal corporate political committee / separate segregated fund of AmeriHealth, Inc.');
  assert.equal(groups.find(g=>g.name==='HUNTINGTON INGALLS INDUSTRIES, INC. EMPLOYEES POLITICAL ACTION COMMITTEE (HIIPAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='BLACKROCK').research.scope,'Global investment-management business / reported employer brand');
  assert.equal(groups.find(g=>g.name==='TD BANK').research.parent,'The Toronto-Dominion Bank');
  assert.equal(groups.find(g=>g.name==='ARNOLD & PORTER KAYE SCHOLER LLP').research.status,'Source-backed');
});


test('twentieth priority batch keeps PAC receipts separate from connected employer identities', () => {
  const groups=buildDirectory([
    {type:'organization',name:'AECOM PAC',sector:'Engineering',committee:'a',amount:100},
    {type:'individual',name:'Feldsher, Ted',employer:'AECOM',occupation:'EXECUTIVE',sector:'Engineering',committee:'a',amount:200},
    {type:'organization',name:'AMERICAN OSTEOPATHIC ASSOCIATION PAC',sector:'Healthcare',committee:'a',amount:300},
    {type:'organization',name:"MASTERCARD INTERNATIONAL INC. EMPLOYEES' PAC",sector:'Finance',committee:'a',amount:400},
    {type:'organization',name:'AMERICAN CHIROPRACTIC ASSOCIATION POLITICAL ACTION COMMITTEE',sector:'Healthcare',committee:'a',amount:500}
  ]);
  const aecomPac=groups.find(g=>g.name==='AECOM PAC');
  const aecomEmployer=groups.find(g=>g.name==='AECOM');
  assert.equal(aecomPac.organization,100);
  assert.equal(aecomPac.individual,0);
  assert.equal(aecomPac.research.status,'Source-backed');
  assert.equal(aecomEmployer.individual,200);
  assert.equal(aecomEmployer.organization,0);
  assert.equal(aecomEmployer.research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='AMERICAN OSTEOPATHIC INFORMATION ASSOCIATION - OSTEOPATHIC POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MASTERCARD INTERNATIONAL INC. EMPLOYEE PAC (MASTERCARD PAC) OR (MASTERCARD EMPLOYEE PAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='AMERICAN CHIROPRACTIC ASSOCIATION POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
});

test('twenty-first priority batch consolidates durable PAC aliases without merging connected organizations', () => {
  const groups=buildDirectory([
    {type:'organization',name:'OB- GYN PAC',sector:'Healthcare',committee:'a',amount:100},
    {type:'organization',name:'AMERICAN COLLEGE OF OB-GYNS PAC (OB-GYN PAC)',sector:'Healthcare',committee:'a',amount:200},
    {type:'organization',name:'THE WALT DISNEY PRODUCTIONS EMPLOYEES PAC',sector:'Entertainment',committee:'a',amount:300},
    {type:'organization',name:'AMERICAN COUNCIL OF LIFE INSURERS POLITICAL ACTION COMMITTEE',sector:'Insurance',committee:'a',amount:400},
    {type:'organization',name:'AMERICAN COUNCIL OF LIFE INSURERSPOLITICAL ACTION COMMITTEE',sector:'Insurance',committee:'a',amount:500}
  ]);
  const obgyn=groups.find(g=>g.name==='AMERICAN COLLEGE OF OB-GYNS PAC (OB-GYN PAC)');
  assert.equal(obgyn.organization,300);
  assert.equal(obgyn.organizationCount,2);
  assert.equal(obgyn.research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==="TWDC ENTERPRISES 18 CORP. EMPLOYEES PAC AKA 'THE WALT DISNEY COMPANY EMPLOYEES PAC' OR 'DISNEY PAC'").research.status,'Source-backed');
  const life=groups.find(g=>g.name==='AMERICAN COUNCIL OF LIFE INSURERS POLITICAL ACTION COMMITTEE');
  assert.equal(life.organization,900);
  assert.equal(life.organizationCount,2);
  assert.equal(life.research.status,'Source-backed');
});

test('twenty-second priority batch resolves PAC spelling variants without collapsing tribal governments', () => {
  const groups=buildDirectory([
    {type:'organization',name:'ARCHIPAC  -THE AMERICAN INSTITUTE OF ARCHITECTS',sector:'Professional Services',committee:'a',amount:100},
    {type:'organization',name:'COVINGTON & BURLING LLP PAC',sector:'Legal',committee:'a',amount:200},
    {type:'organization',name:'DEMOCRATS FOR EDUCATION REFORM PAC',sector:'Education',committee:'a',amount:300},
    {type:'organization',name:'COW CREEK BAND OF UMPQUA TRIBE OF INDIANS',sector:'Tribal Government',committee:'a',amount:400}
  ]);
  assert.equal(groups.find(g=>g.name==='ARCHIPAC - THE AMERICAN INSTITUTE OF ARCHITECTS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='COVINGTON AND BURLING LLP PAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='DEMOCRATS FOR EDUCATION REFORM').research.status,'Source-backed');
  const cowCreek=groups.find(g=>g.name==='COW CREEK BAND OF UMPQUA TRIBE OF INDIANS');
  assert.equal(cowCreek.organization,400);
  assert.equal(cowCreek.research.scope,'Sovereign tribal government / federally recognized tribe');
});

test('twenty-third priority batch consolidates durable GE and Humane PAC renames', () => {
  const groups=buildDirectory([
    {type:'organization',name:'GENERAL ELECTRIC COMPANY POLITICAL ACTION COMMITTEE',sector:'Manufacturing',committee:'a',amount:100},
    {type:'organization',name:'GENERAL ELECTRIC COMPANY AEROSPACE EMPLOYEE POLITICAL ACTION COMMITTEE (GE AEROSPACE PAC)',sector:'Manufacturing',committee:'a',amount:200},
    {type:'organization',name:'HUMANE SOCIETY LEGISLATIVE FUND POLITICAL ACTION COMMITTEE',sector:'Advocacy',committee:'a',amount:300},
    {type:'organization',name:'HUMANE WORLD ACTION FUND POLITICAL ACTION COMMITTEE',sector:'Advocacy',committee:'a',amount:400},
    {type:'organization',name:'HNTB HOLDINGS PAC',sector:'Engineering',committee:'a',amount:500}
  ]);
  const ge=groups.find(g=>g.name==='GENERAL ELECTRIC COMPANY AEROSPACE EMPLOYEE POLITICAL ACTION COMMITTEE (GE AEROSPACE PAC)');
  assert.equal(ge.organization,300);
  assert.equal(ge.organizationCount,2);
  assert.equal(ge.research.status,'Source-backed');
  const humane=groups.find(g=>g.name==='HUMANE WORLD ACTION FUND POLITICAL ACTION COMMITTEE');
  assert.equal(humane.organization,700);
  assert.equal(humane.organizationCount,2);
  assert.equal(humane.research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='HNTB HOLDINGS LTD. PAC').research.status,'Source-backed');
});

test('twenty-fourth priority batch resolves donor-file PAC names through durable committee identities', () => {
  const groups=buildDirectory([
    {type:'organization',name:'JSTREET PAC',sector:'Advocacy',committee:'a',amount:100},
    {type:'organization',name:'MICRON TECHNOLOGY, INC. PAC',sector:'Technology',committee:'a',amount:200},
    {type:'organization',name:'NATIONAL ASSOCIATION OF PROFESSIONAL EMPLOYER ORGANIZATIONS PAC (NAPEO PAC)',sector:'Professional Services',committee:'a',amount:300},
    {type:'organization',name:'NATIONAL READY MIXED CONCRETE ASSN. PAC',sector:'Construction',committee:'a',amount:400},
    {type:'organization',name:'NATIONAL THOROUGHBRED RACING ASSOCIATION PAC',sector:'Trade Association',committee:'a',amount:500}
  ]);
  assert.equal(groups.find(g=>g.name==='JSTREETPAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MICRON TECHNOLOGY, INC. EMPLOYEE PAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL ASSOCIATION OF PROFESSIONAL EMPLOYER ORGANIZATIONS (NAPEO PAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL READY MIXED CONCRETE ASSN. PAC (CONCRETEPAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NATIONAL THOROUGHBRED RACING ASSOCIATION POLITICAL ACTION COMMITTEE/HORSE PAC').research.status,'Source-backed');
});

test('twenty-fifth priority batch resolves PAC name variants and multi-donor employers', () => {
  const groups=buildDirectory([
    {type:'organization',name:'OFFICE AND PROFESSIONAL EMPLOYEES INTERNATIONAL UNION (OPEIU VOTES)',sector:'Labor',committee:'a',amount:100},
    {type:'organization',name:"PLASTERERS' AND CEMENT MASONS' ACTION COMMITTEE",sector:'Labor',committee:'a',amount:200},
    {type:'organization',name:'PLANNED PARENTHOOD ACTION FUND INC. PAC, DBA PLANNED PARENTHOOD FEDERAL PAC',sector:'Advocacy',committee:'a',amount:300},
    {type:'organization',name:'REAL ESTATE ROUNDTABLE POLITICAL ACTION COMMITTEE (REALPAC)',sector:'Real Estate',committee:'a',amount:400},
    {type:'organization',name:'SEAFARERS POLITICAL ACTIVITY DONATION - SEAFARERS INTERNATIONAL UNION OF NA-AGLIWD/NMU',sector:'Labor',committee:'a',amount:500},
    {type:'organization',name:'SEIU COPE',sector:'Labor',committee:'a',amount:600},
    {type:'individual',name:'PORTER, DAVID M.',employer:'PNL COMPANIES',occupation:'FOUNDING PARTNER',sector:'Real Estate',committee:'a',amount:700}
  ]);
  assert.equal(groups.find(g=>g.name==='OFFICE AND PROFESSIONAL EMPLOYEES INTERNATIONAL UNION (OPEIU) JB MOSS VOICE OF THE ELECTORATE (VOTE)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==="OPERATIVE PLASTERERS' AND CEMENT MASONS' INTL ASSOCIATION ACTION COMMITTEE").research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PLANNED PARENTHOOD ACTION FUND INC PAC, DBA PLANNED PARENTHOOD FEDERAL PAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='THE REAL ESTATE ROUNDTABLE POLITICAL ACTION COMMITTEE (REALPAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SEAFARERS POLITICAL ACTIVITY DONATION - SEAFARERS INTERNATIONAL UNION OF NA-AGLIW').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SEIU COPE (SERVICE EMPLOYEES INTERNATIONAL UNION COMMITTEE ON POLITICAL EDUCATION)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PNL COMPANIES').research.status,'Source-backed');
});

test('twenty-sixth priority batch resolves PAC historical and shorthand names through durable committee identities', () => {
  const groups=buildDirectory([
    {type:'organization',name:'TARGETCITIZENS POLITICAL FORUM',sector:'Retail',committee:'a',amount:100},
    {type:'organization',name:'THE GRANT THORNTON LLP POLITICAL ACTION COMMITTEE LLC',sector:'Professional Services',committee:'a',amount:200},
    {type:'organization',name:'UNIVERSAL MUSIC GROUP POLITICAL ACTION COMMITTEE',sector:'Entertainment',committee:'a',amount:300},
    {type:'organization',name:'US TRAVEL ASSOCIATION PAC',sector:'Travel',committee:'a',amount:400},
    {type:'organization',name:'VEN-PAC',sector:'Legal',committee:'a',amount:500},
    {type:'organization',name:'WALGREEN CO PAC',sector:'Healthcare',committee:'a',amount:600}
  ]);
  assert.equal(groups.find(g=>g.name==='TARGET CORPORATION CITIZENS POLITICAL FORUM (TARGETCITIZENS POLITICAL FORUM)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='THE GRANT THORNTON ADVISORS LLC POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='UNIVERSAL MUSIC GROUP EMPLOYEE ACTION FUND').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='U.S. TRAVEL ASSOCIATION PAC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='VENABLE PAC (VEN-PAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='WALGREEN CO PAC (WALGREENSPAC)').research.status,'Source-backed');
});

test('twenty-seventh priority batch separates PACs, tribes, employers, and direct organizations', () => {
  const groups=buildDirectory([
    {type:'organization',name:'CUMMINS INC PAC',sector:'Manufacturing',committee:'a',amount:100},
    {type:'organization',name:'MOTION PICTURE ASSOCIATION OF AMERICA INC POLITICAL ACTION COMMITTEE',sector:'Entertainment',committee:'a',amount:200},
    {type:'organization',name:'SIFMA-PAC',sector:'Finance',committee:'a',amount:300},
    {type:'organization',name:'GE VERNOVA INC. POLITICAL ACTION COMMITTEE',sector:'Energy',committee:'a',amount:400},
    {type:'organization',name:'MATCH-E-BE-NASH-SHE-WISH BAND OF POTTAWATOMI INDIANS',sector:'Tribal Government',committee:'a',amount:500},
    {type:'organization',name:'POND LEHOCKY GIORDANO DISABILITY LLC',sector:'Legal',committee:'a',amount:600},
    {type:'individual',name:'ZUCKERMAN, MARK',employer:'THE CENTURY FOUNDATION',occupation:'PRESIDENT',sector:'Nonprofit',committee:'a',amount:700},
    {type:'individual',name:'KAUR, RAVINDER JEET',employer:'MAYO CLINIC',occupation:'FACULTY',sector:'Healthcare',committee:'a',amount:800},
    {type:'individual',name:'TATE JR., DANIEL',employer:'FORBES TATE PARTNERS',occupation:'CONSULTANT',sector:'Professional Services',committee:'a',amount:900}
  ]);
  assert.equal(groups.find(g=>g.name==='CUMMINS INC. POLITICAL ACTION COMMITTEE (CIPAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MOTION PICTURE ASSOCIATION INC POLITICAL ACTION COMMITTEE (MPAAMERICA PAC)').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='SECURITIES INDUSTRY AND FINANCIAL MARKETS ASSOCIATION POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='GE VERNOVA INC. POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MATCH-E-BE-NASH-SHE-WISH BAND OF POTTAWATOMI INDIANS').research.scope,'Sovereign tribal government / federally recognized tribe');
  assert.equal(groups.find(g=>g.name==='POND LEHOCKY GIORDANO DISABILITY LLC').organization,600);
  assert.equal(groups.find(g=>g.name==='THE CENTURY FOUNDATION').individual,700);
  assert.equal(groups.find(g=>g.name==='MAYO CLINIC').individual,800);
  assert.equal(groups.find(g=>g.name==='FTP').individual,900);
});

test('remaining priority batches preserve PAC/employer boundaries and explicitly review ambiguous labels', () => {
  const groups=buildDirectory([
    {type:'organization',name:'ABBVIE POLITICAL ACTION COMMITTEE',sector:'Healthcare',committee:'a',amount:100},
    {type:'individual',name:'TEST, EMPLOYEE',employer:'ABBVIE',occupation:'EMPLOYEE',sector:'Healthcare',committee:'a',amount:200},
    {type:'organization',name:"NORTH AMERICA'S BUILDING TRADES UNION",sector:'Labor',committee:'a',amount:300},
    {type:'organization',name:'AIRBUS GROUP, INC. PAC',sector:'Aerospace',committee:'a',amount:400},
    {type:'organization',name:'ALCOA INC. EMPLOYEES\' VOLUNTARY FEDERAL POLITICAL ACTION COMMITTEE',sector:'Manufacturing',committee:'a',amount:500},
    {type:'organization',name:"PROTECTIVE LIFE CORPORATION FEDERAL POLITICAL ACTION COMMITTEE ('PROTECTPAC')",sector:'Insurance',committee:'a',amount:600},
    {type:'organization',name:'TRI-STATE MAXED OUT WOMEN',sector:'Advocacy',committee:'a',amount:700},
    {type:'individual',name:'GENERIC, ONE',employer:'STATE',occupation:'EMPLOYEE',sector:'Public',committee:'a',amount:800},
    {type:'individual',name:'GENERIC, TWO',employer:'FREELANCE',occupation:'EDITOR',sector:'Other',committee:'a',amount:900},
    {type:'individual',name:'GENERIC, THREE',employer:'INDEPENDENT',occupation:'CONSULTANT',sector:'Other',committee:'a',amount:1000},
    {type:'individual',name:'TEACHER, ONE',employer:'LAUSD',occupation:'TEACHER',sector:'Education',committee:'a',amount:1100},
    {type:'individual',name:'TEACHER, TWO',employer:'NYC DOE',occupation:'TEACHER',sector:'Education',committee:'a',amount:1200},
    {type:'individual',name:'POSTAL, ONE',employer:'USPS',occupation:'MAILHANDLER',sector:'Public',committee:'a',amount:1300},
    {type:'individual',name:'POSTAL, TWO',employer:'US POSTAL SERVICE',occupation:'MAILHANDLER',sector:'Public',committee:'a',amount:1400}
  ]);
  const abbviePac=groups.find(g=>g.name==='ABBVIE POLITICAL ACTION COMMITTEE');
  const abbvieEmployer=groups.find(g=>g.name==='ABBVIE');
  assert.equal(abbviePac.organization,100);
  assert.equal(abbviePac.individual,0);
  assert.equal(abbvieEmployer.organization,0);
  assert.equal(abbvieEmployer.individual,200);
  assert.equal(abbviePac.research.status,'Source-backed');
  assert.equal(abbvieEmployer.research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==="NORTH AMERICA'S BUILDING TRADES UNIONS POLITICAL EDUCATIONAL FUND").research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='AIRBUS AMERICAS, INC. POLITICAL ACTION COMMITTEE').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==="ALCOA CORPORATION EMPLOYEES' POLITICAL ACTION COMMITTEE").research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==="PROTECTIVE LIFE CORPORATION FEDERAL POLITICAL ACTION COMMITTEE ('PROTECTIVEPAC')").research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='TRI-STATE MAXED-OUT WOMEN').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='STATE').research.status,'Reviewed label');
  assert.equal(groups.find(g=>g.name==='FREELANCE').research.status,'Reviewed label');
  assert.equal(groups.find(g=>g.name==='INDEPENDENT').research.status,'Reviewed label');
  assert.equal(groups.find(g=>g.name==='LOS ANGELES UNIFIED SCHOOL DISTRICT').individual,1100);
  assert.equal(groups.find(g=>g.name==='NEW YORK CITY DEPARTMENT OF EDUCATION').individual,1200);
  const usps=groups.find(g=>g.name==='UNITED STATES POSTAL SERVICE');
  assert.equal(usps.individual,2700);
  assert.equal(usps.count,2);
});

test('post-finish identity audit resolves independently corroborated employer shorthand', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Pennington',employer:'PROPER',occupation:'REAL ESTATE',sector:'Cannabis',committee:'a',amount:100},
    {type:'individual',name:'Sears',employer:'FIN',occupation:'PRESIDENT',sector:'Technology',committee:'a',amount:200},
    {type:'individual',name:'Cox',employer:'PIET RETIEF INC',occupation:'OWNER MANAGER',sector:'Services',committee:'a',amount:300}
  ]);
  assert.equal(groups.find(g=>g.name==='PROPER BRANDS').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='FINANCIAL INFORMATION NETWORK, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='PIET RETIEF, INC.').research.status,'Source-backed');
});


test('deep unresolved-identity lookup resolves documented companies and separates non-unique labels', () => {
  const groups=buildDirectory([
    {type:'individual',name:'Russell',employer:'GNE',occupation:'VICE PRESIDENT',sector:'Healthcare',committee:'a',amount:100},
    {type:'individual',name:'Dhaliwal',employer:'CAMBIA',occupation:'ACCOUNT EXECUTIVE',sector:'Healthcare',committee:'a',amount:200},
    {type:'individual',name:'McCreery',employer:'MCCREERY INC.',occupation:'CHAIRMAN',sector:'Services',committee:'a',amount:300},
    {type:'individual',name:'Evans',employer:'XXV HOLDINGS INC',occupation:'BUSINESS OWNER',sector:'Real Estate',committee:'a',amount:400},
    {type:'individual',name:'Generic',employer:'CSU',occupation:'STAFF',sector:'Education',committee:'a',amount:500}
  ]);
  assert.equal(groups.find(g=>g.name==='GENENTECH, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CAMBIA HEALTH SOLUTIONS, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='MCCREERY INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='XXV DYNASTY HOLDINGS INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='CSU').research.status,'Reviewed label');
});


test('final hard-name pass resolves Skylight and Elm Park while classifying bare NEP as ambiguous shorthand', () => {
  const groups=buildDirectory([
    {type:'individual',name:'De Onis',employer:'SKYLIGHT',occupation:'EXECUTIVE DIRECTOR',sector:'Media',committee:'a',amount:100},
    {type:'individual',name:'Willingham',employer:'ELM PARK GROUP',occupation:'BUSINESS OWNER',sector:'Services',committee:'a',amount:200},
    {type:'individual',name:'Unknown',employer:'NEP',occupation:'EXECUTIVE',sector:'Services',committee:'a',amount:300}
  ]);
  assert.equal(groups.find(g=>g.name==='SKYLIGHT ENGAGEMENT, INC.').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='ELM PARK GROUP LLC').research.status,'Source-backed');
  assert.equal(groups.find(g=>g.name==='NEP').research.status,'Reviewed label');
});
