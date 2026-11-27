import {chartSwatches,approvedChartColors,chartSequence,colorAt,sequentialColors} from '../assets/js/chart-palette.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {groupDonors} from '../assets/js/donor-groups.js';
import {buildVisualData,groupedVisualData,sectorShareData,packingData,dotData} from '../assets/js/donor-visual-data.js';
import {masterSectorGroups,masterSectors,networkData} from '../assets/js/donor-data.js?v=claude1';
import {hierarchy,pack} from '../assets/js/vendor/d3-hierarchy.js';
const sum=(items,field)=>items.reduce((n,d)=>n+d[field],0);
const read=async path=>new Response(await fs.readFile(new URL('../'+String(path).split('?')[0].replace(/^\//,''),import.meta.url)));
test('all three table datasets in all 13 tabs reconcile to their four visual models',async()=>{
 globalThis.fetch=read;let tables=0;
 for(const network of ['jeffries','schumer']){
  const data=networkData(network);
  const all=await data.loadResearchRecords();
  for(const rows of [all,...data.config.map(c=>all.filter(r=>r.committee===c.key))])for(const groups of Object.values(groupDonors(rows))){
   const model=buildVisualData(groups),shares=sectorShareData(model),packed=packingData(model),dots=dotData(model);tables++;
   assert.equal(model.total,sum(groups,'amount'));
   assert.equal(sum(model.sectors,'amount'),model.total);
   assert.equal(model.positive+model.adjustments,model.total);
   assert.equal(model.receipts,groups.reduce((n,g)=>n+g.records.length,0));
   assert.equal(sum(model.sectors,'primaryDonors'),groups.length);
   assert.equal(dots.length,groups.length);assert.deepEqual(new Set(dots.map(d=>d.key)),new Set(groups.map(g=>g.key)));
   assert.equal(sum(shares,'amount'),model.total);
   assert.equal(packed.children.flatMap(s=>s.children).reduce((n,l)=>n+l.value,0),model.areaTotal);
   assert.deepEqual(packed.children.map(s=>[s.name,s.children.length]),model.sectors.filter(s=>s.leaves.length).map(s=>[s.name,s.leaves.length]));
   assert.deepEqual(shares.map(s=>s.name),model.sectors.map(s=>s.name));assert(shares.every(s=>masterSectors.includes(s.name)));assert(packed.children.every(s=>s.children.every(l=>l.key&&!l.aggregate)));assert.deepEqual(new Set(packed.children.flatMap(s=>s.children.map(d=>d.key))),new Set(groups.map(g=>g.key)));
   assert(model.sectors.every(s=>masterSectors.includes(s.name)));
   if(packed.children.length){const tree=pack().size([300,300]).padding(3)(hierarchy(packed).sum(d=>d.value||0));for(const leaf of tree.leaves())assert(Number.isFinite(leaf.r)&&leaf.r>=0);}
  }
 }
 assert.equal(tables,39);console.log({tables,charts:tables*4});
});
test('negative adjustments, split sectors, empty tables and single donors stay exact',()=>{
 const records=[{type:'individual',name:'A',employer:'APPLE INC',sector:'Technology',amount:80000,committee:'a'},{type:'individual',name:'A',employer:'APPLE INC',sector:'Technology',amount:-10000,committee:'a'},{type:'individual',name:'A',employer:'PFIZER',sector:'Pharma, Pharmacy & Health Products',amount:10000,committee:'b'},{type:'individual',name:'B',employer:'RETIRED',sector:'No sector: Retired',amount:-100,committee:'a'}];
 const groups=Object.values(groupDonors(records)).flat(),m=buildVisualData(groups);
 assert.equal(m.groups,2);assert.equal(m.total,79900);assert.equal(m.adjustments,-10100);assert.equal(m.areaTotal,80000);
 assert.equal(dotData(m).length,2);assert.equal(sum(sectorShareData(m),'amount'),79900);
 const empty=buildVisualData([]);assert.equal(sectorShareData(empty).length,0);assert.equal(packingData(empty).children.length,0);assert.equal(dotData(empty).length,0);
 assert.deepEqual(chartSequence,approvedChartColors);
 const selected=['blue2','blue3','blue4','blue5','blue6','blue7','blue8','blue9','teal2','teal3','teal4','teal5','teal6','teal7','teal8','teal9','green2','green3','green4','green5','green6','green7','green8','green9','yellow2','yellow3','yellow4','yellow5','yellow6','yellow7','yellow8','yellow9','orange2','orange3','orange4','orange5','orange6','orange7','orange8','orange9','red2','red3','red4','red5','red6','red7','red8','red9','pink2','pink3','pink4','pink5','pink6','pink7','pink8','pink9','purple2','purple3','purple4','purple5','purple6','purple7','purple8','purple9'];
 assert.deepEqual(Object.keys(chartSwatches),selected);assert.equal(approvedChartColors.length,64);
 assert(Object.keys(chartSwatches).every(k=>!k.endsWith('1')),'all row-1 colors are excluded');
 const order=sequentialColors(Array.from({length:12},(_,i)=>'Sector '+(i+1)));assert.deepEqual([...order.values()],approvedChartColors.slice(0,12));assert.equal(colorAt(0),chartSwatches.blue2);assert.equal(colorAt(7),chartSwatches.blue9);assert.equal(colorAt(8),chartSwatches.teal2);
 assert.equal(chartSwatches.blue2,'#89c9f1');assert.equal(chartSwatches.purple9,'#4d1365');assert.equal(new Set(chartSequence).size,64);
});

test('sector-share visuals use Claude researched first-hand sectors by default',()=>{
 const row={type:'individual',name:'A',sector:'Banking',amount:300,committee:'a'};
 const groups=Object.values(groupDonors([row,{...row,name:'B',sector:'Technology',amount:100}])).flat();
 const shares=sectorShareData(buildVisualData(groups));
 assert.deepEqual(shares.map(d=>d.name),['Banking','Technology']);
 assert.equal(shares.find(d=>d.name==='Banking').share,.75);
 const broad=sectorShareData(groupedVisualData(buildVisualData(groups)));
 assert.deepEqual(broad.map(d=>d.name),['Finance','Technology, Telecom & Media']);
});

test('sector group display preserves every dollar, receipt, donor allocation and original sector',()=>{
 const records=[{type:'individual',name:'A',sector:'Banking',employer:'Bank',amount:80000,committee:'a'},{type:'individual',name:'B',sector:'Hedge Funds & Proprietary Trading',employer:'Fund',amount:20000,committee:'a'},{type:'organization',name:'C',sector:'Technology',amount:30000,committee:'b'}];
 const detailed=buildVisualData(Object.values(groupDonors(records)).flat()),groups=groupedVisualData(detailed);
 assert.equal(groups.total,detailed.total);assert.equal(groups.receipts,detailed.receipts);assert.equal(groups.areaTotal,detailed.areaTotal);assert.equal(sum(groups.sectors,'amount'),detailed.total);assert.equal(sum(groups.sectors,'primaryDonors'),detailed.groups);
 assert.equal(groups.sectors.find(s=>s.name==='Finance').amount,100000);assert.deepEqual(groups.sectors.flatMap(s=>s.leaves).map(d=>d.sector).sort(),detailed.sectors.flatMap(s=>s.leaves).map(d=>d.sector).sort());
});
