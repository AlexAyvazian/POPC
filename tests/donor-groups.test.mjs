import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {groupDonors} from '../assets/js/donor-groups.js';
const r=(name,amount,extra={})=>({name,type:'individual',amount,committee:'a',employer:'WORKPLACE',...extra});
test('repeat gifts cross the cutoff only after consolidation; $500 belongs in indirect',()=>{
 const groups=groupDonors([r('Repeat',30000),r(' REPEAT ',25000,{employer:'NEW WORKPLACE',committee:'b'}),r('Small',49999),r('Boundary',50000),r('Repeat',90000,{memo:true}),r('Repeat',70000,{type:'organization'})]);
 assert.deepEqual(groups.indirect.map(g=>[g.name,g.amount]),[['Repeat',55000],['Boundary',50000]]);
 assert.equal(groups.small[0].amount,49999);assert.equal(groups.organizations[0].amount,70000);
 assert.equal(groups.indirect[0].employers.size,2);assert.equal(groups.indirect[0].committees.size,2);
 assert.equal(groups.indirect[0].records.length,2);
});
test('signed adjustments reconcile, missing names remain separate, employers do not merge people',()=>{
 const g=groupDonors([r('Person',60000),r('Person',-20000),r('Other',10000),r('',200),r('',300)]);
 assert.equal(g.small.length,4);assert.equal(g.indirect.length,0);
 assert.equal(g.small.reduce((s,g)=>s+g.amount,0),50500);
});
test('all Jeffries and Schumer contributions reconcile in exactly one of three tables',async()=>{
 globalThis.fetch=async path=>new Response(await fs.readFile(new URL('../'+String(path).replace(/^\//,''),import.meta.url)));
 for(const filename of ['research-data.js','schumer-research-data.js']){
  const data=await import('../assets/js/'+filename),all=await data.loadResearchRecords();
  for(const records of [all,...data.config.map(c=>all.filter(r=>r.committee===c.key))]){
   const groups=groupDonors(records),flat=Object.values(groups).flat();
   assert.equal(flat.reduce((n,g)=>n+g.amount,0),records.reduce((n,r)=>n+r.amount,0));
   assert.equal(flat.reduce((n,g)=>n+g.records.length,0),records.length);
   assert(groups.small.every(g=>g.amount<50000));assert(groups.indirect.every(g=>g.amount>=50000));
   assert.equal(new Set(flat.map(g=>g.key)).size,flat.length);
  }
  console.log(filename,Object.fromEntries(Object.entries(groupDonors(all)).map(([k,v])=>[k,{donors:v.length,cents:v.reduce((n,g)=>n+g.amount,0)}])));
 }
});
