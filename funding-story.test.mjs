import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {groupPeople,fundingRoutes} from './funding-story.js';
import {loadResearchRecords,config} from './research-data.js';
import {buildDirectory} from './business-directory-data.js';
test('funding routes and donor concentration reconcile to all eight source datasets',async()=>{
 globalThis.fetch=async path=>new Response(await fs.readFile(new URL(path,import.meta.url)));
 const records=await loadResearchRecords(),people=groupPeople(records);
 assert.equal(people.reduce((s,p)=>s+p.value,0),config.reduce((s,c)=>s+c.individual,0));
 for(const group of buildDirectory(records)){
  const routes=fundingRoutes(group.records);
  assert.equal(routes.reduce((s,r)=>s+r.value,0),group.organization+group.individual);
  for(const r of routes)assert.equal([...r.destinations.values()].reduce((a,b)=>a+b,0),r.value);
 }
 const top=people.slice(0,10).reduce((s,p)=>s+p.value,0);console.log({largest:people[0].name,topTenDollars:top/100});
});
test('memo amounts stay out; signed adjustments and separate donor types survive',()=>{
 const records=[{name:'Same',type:'individual',amount:100,committee:'a'},{name:'Same',type:'individual',amount:-20,committee:'a'},{name:'Same',type:'organization',amount:200,committee:'b'},{name:'Same',type:'individual',amount:500,committee:'a',memo:true}];
 assert.equal(groupPeople(records)[0].value,80);const routes=fundingRoutes(records);assert.equal(routes.length,2);assert.equal(routes.reduce((s,r)=>s+r.value,0),280);
});
