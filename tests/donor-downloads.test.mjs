import test from 'node:test';
import assert from 'node:assert/strict';
import {donorSheet,csvText,receiptSheet} from '../scripts/generate-donor-downloads.mjs';

test('downloads preserve all donor rows, numeric totals, employers, sectors, research and committee amounts',()=>{
 const record={name:'REPORTED, NAME',employer:'REPORTED EMPLOYER',occupation:'CEO',sector:'Technology',date:'2026-01-01',amount:12345,committee:'a',image:'202510159790813436'};
 const group={name:'Canonical donor',amount:12345,records:[record],sectors:new Set(['Technology']),employers:new Set(['Researched employer']),reportedEmployers:new Set(['REPORTED EMPLOYER']),occupations:new Set(['CEO']),reportedNames:new Set(['REPORTED, NAME']),committees:new Map([['a',12345]]),businessResearch:new Map([['x',{name:'Researched employer',research:{status:'Source-backed',parent:'Parent',scope:'Legal entity',evidence:'Evidence',sources:['https://example.org/']}}]])};
 const config=[{key:'a',name:'Committee A'},{key:'b',name:'Committee B'}],sheet=donorSheet(Array.from({length:75},()=>group),config,'indirect');
 assert.equal(sheet.rows.length,75);
 assert.equal(sheet.rows[0][1],123.45);
 assert.equal(sheet.rows[0][3],'Researched employer');
 assert.equal(sheet.rows[0][4],'REPORTED EMPLOYER');
 assert.equal(sheet.rows[0][8],'Parent');
 assert.equal(sheet.rows[0][15],123.45);
 assert.equal(sheet.rows[0][16],0);
 assert.equal(sheet.totalCents,75*12345);
 assert.equal(sheet.receiptCount,75);
 const receipts=receiptSheet({indirect:[group]},config);assert.equal(receipts.rows.length,1);assert.equal(receipts.rows[0][4],123.45);assert(receipts.rows[0][9].includes(record.image));
});
test('CSV quotes multiline text and literal formula-like names while retaining signed numeric amounts',()=>{
 const csv=csvText({headers:['Name','Amount'],moneyColumns:[1],rows:[['=SUM(A1:A3)',-1.25],['A "quoted"\nname',123.45]]});
 assert(csv.startsWith('\ufeff'));
 assert(csv.includes('"\'=SUM(A1:A3)","-1.25"'));
 assert(csv.includes('"A ""quoted""\nname","123.45"'));
 const empty=csvText({headers:['Name'],moneyColumns:[],rows:[]});assert.equal(empty,'\ufeff"Name"\r\n');
});

test('classification exports contain refined sectors, groups and connection evidence without review or confidence fields',()=>{
 const g={name:'Donor',amount:50000,records:[],sectors:new Set(['Banking']),employers:new Set(),reportedEmployers:new Set(),occupations:new Set(),reportedNames:new Set(['Donor']),committees:new Map(),businessResearch:new Map(),classification:{group:'Finance',basis:'employer name',firstHand:'Banking',household:'Banking'}};
 const s=donorSheet([g],[],'indirect');assert.equal(s.rows[0][s.headers.indexOf('Sector group')],'Finance');assert.equal(s.rows[0][s.headers.indexOf('Sector(s)')],'Banking');assert(!s.headers.some(h=>/confidence|review.?flag/i.test(h)));
});
