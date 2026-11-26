import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {extractPetitionCount} from '../functions/lib/petition-count.js';
import {onRequestGet} from '../functions/api/petition.js';
const page=(count,goal,id='491635572')=>`<script type="application/json" id="change-page-state">${JSON.stringify({route:{params:{slug:'put-voters-over-corporate-donors'}},petition:{id,signatureCount:{displayed:count,total:count+3,goal}}})}</script>`;
test('uses displayed count; reads changing counts and goals without hardcoding',()=>{
 assert.equal(extractPetitionCount(page(6,10)).count,6);
 assert.deepEqual([extractPetitionCount(page(17,25)).count,extractPetitionCount(page(17,25)).goal],[17,25]);
 assert.equal(extractPetitionCount(page(0,10)).count,0);
});
test('rejects wrong petitions, missing state and invalid counts',()=>{
 for(const html of [page(6,10,'other'),page(-1,10),page('6',10),page(6,0),'<html>Blocked</html>'])assert.throws(()=>extractPetitionCount(html));
});
test('endpoint returns source count and timestamp; upstream failure never returns zero',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(page(8,10));
  const ok=await onRequestGet();const data=await ok.json();assert.equal(data.count,8);assert(data.checkedAt);assert.equal(ok.status,200);
  globalThis.fetch=async()=>new Response('Blocked',{status:403});
  const bad=await onRequestGet();assert.equal(bad.status,503);assert.equal((await bad.json()).count,undefined);
 }finally{globalThis.fetch=original;}
});


test('routes include the petition API so the Pages Function is actually reachable', async()=>{
 const routes=JSON.parse(await fs.readFile(new URL('../_routes.json', import.meta.url),'utf8'));
 assert(routes.include.includes('/api/petition'));
});
