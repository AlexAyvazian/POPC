import {chartSwatches,approvedChartColors,chartSequence,colorAt,sequentialColors} from '../assets/js/chart-palette.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {groupDonors} from '../assets/js/donor-groups.js';
import {buildVisualData,radarData,packingData,dotData} from '../assets/js/donor-visual-data.js';
import {masterSectors,networkData} from '../assets/js/donor-data.js?v=claude1';
import {hierarchy,pack} from '../assets/js/vendor/d3-hierarchy.js';
const sum=(items,field)=>items.reduce((n,d)=>n+d[field],0);
const read=async path=>new Response(await fs.readFile(new URL('../'+String(path).split('?')[0].replace(/^\//,''),import.meta.url)));
test('all three table datasets in all 13 tabs reconcile to their four visual models',async()=>{
 globalThis.fetch=read;let tables=0;
 for(const network of ['jeffries','schumer']){
  const data=networkData(network);
  const all=await data.loadResearchRecords();
  for(const rows of [all,...data.config.map(c=>all.filter(r=>r.committee===c.key))])for(const groups of Object.values(groupDonors(rows))){
   const model=buildVisualData(groups),radar=radarData(model),packed=packingData(model),dots=dotData(model);tables++;
   assert.equal(model.total,sum(groups,'amount'));
   assert.equal(sum(model.sectors,'amount'),model.total);
   assert.equal(model.positive+model.adjustments,model.total);
   assert.equal(model.receipts,groups.reduce((n,g)=>n+g.records.length,0));
   assert.equal(sum(model.sectors,'primaryDonors'),groups.length);
   assert.equal(sum(dots.dots,'count'),groups.length);
   assert.equal(sum(radar,'amount'),model.areaTotal);
   assert.equal(packed.children.flatMap(s=>s.children).reduce((n,l)=>n+l.value,0),model.areaTotal);
   assert.deepEqual(packed.children.map(s=>[s.name,s.children.length]),model.sectors.filter(s=>s.leaves.length).map(s=>[s.name,s.leaves.length]));
   assert(radar.every(s=>masterSectors.includes(s.name)));assert(packed.children.every(s=>s.children.every(l=>l.key&&!l.aggregate)));assert(dots.dots.length<=440);
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
 assert.equal(sum(dotData(m).dots,'count'),2);assert.equal(sum(radarData(m),'amount'),80000);
 const empty=buildVisualData([]);assert.deepEqual(radarData(empty),[]);assert.equal(packingData(empty).children.length,0);assert.equal(dotData(empty).dots.length,0);
 assert.deepEqual(chartSequence,approvedChartColors);
 const selected=['blue1','blue2','blue3','blue4','blue5','blue6','teal2','teal3','teal4','teal5','green1','green2','green3','green4','green5','green6','yellow1','yellow2','yellow3','yellow4','orange1','orange2','orange3','orange4','orange5','red1','red2','red3','red4','red6','pink1','pink2','pink3','pink4','purple1','purple2','purple3','purple4'];
 assert.deepEqual(Object.keys(chartSwatches),selected);assert.equal(approvedChartColors.length,38);
 const order=sequentialColors(['Largest','Second','Third','Fourth','Fifth','Sixth','Seventh']);assert.deepEqual([...order.values()],approvedChartColors.slice(0,7));assert.equal(colorAt(0),chartSwatches.blue1);assert.equal(colorAt(6),chartSwatches.teal2);
 assert.equal(chartSwatches.blue6,'#3c57d3');assert.equal(chartSwatches.green6,'#62b036');assert.equal(new Set(chartSequence).size,38);
});

 test('radar and packing retain named categories beyond the former seven-sector and twelve-donor limits',()=>{
 const sectors=Array.from({length:10},(_,i)=>({name:'Named sector '+i,leaves:Array.from({length:30},(_,j)=>({name:'Donor '+j,key:i+'|'+j,amount:100,sector:'Named sector '+i}))}));
 const model={sectors,areaTotal:30000};assert.equal(radarData(model).length,10);assert.equal(packingData(model).children.flatMap(s=>s.children).length,300);
 assert.equal(sum(radarData(model),'amount'),30000);assert.equal(radarData({sectors:[sectors[0]],areaTotal:3000}).length,1);
});
