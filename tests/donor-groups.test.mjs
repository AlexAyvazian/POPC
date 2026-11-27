import test from 'node:test';
import assert from 'node:assert/strict';
import {groupDonors} from '../assets/js/donor-groups.js?v=claude1';
const r=(name,amount,extra={})=>({name,donorName:name,type:'individual',employer:'Employer',occupation:'Engineer',sector:'Technology',committee:'a',amount,...extra});
test('repeat gifts are consolidated before the threshold; search cannot split a donor',()=>{
 const g=groupDonors([r('A',25000),r('A',25000),r('B',49999),r('C',60000),r('C',-10001)]);
 assert.deepEqual(g.indirect.map(g=>[g.name,g.amount]),[['A',50000]]);
 assert.deepEqual(g.small.map(g=>[g.name,g.amount]),[['B',49999],['C',49999]]);
});
test('only canonical source mappings consolidate organizations, without merging their parent',()=>{
 const g=groupDonors([r('Reported 1',100,{type:'organization',donorName:'Canonical'}),r('Reported 2',200,{type:'organization',donorName:'Canonical'}),r('Subsidiary',300,{type:'organization',donorName:'Subsidiary',identity:{name:'Subsidiary',parent:'Canonical'}})]);
 assert.deepEqual(g.organizations.map(g=>[g.name,g.amount]),[['Canonical',300],['Subsidiary',300]]);
});
test('memos and other receipts never enter contribution totals',()=>{
 const g=groupDonors([r('A',100),r('A',90000,{memo:true}),r('Other',90000,{category:'other'})]);assert.equal(g.small[0].amount,100);assert.equal(g.small[0].records.length,1);
});
