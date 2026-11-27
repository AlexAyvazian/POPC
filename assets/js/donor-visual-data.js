import {masterSectorForRecord,sectorGroups} from './donor-data.js?v=researched2';
const sort=(a,b)=>b.amount-a.amount||a.name.localeCompare(b.name);
export const isResearchedSectorName=name=>Boolean(name)&&!String(name).startsWith('No sector:')&&String(name)!=='Unresolved / ambiguous';
export function buildVisualData(groups){
 const sectors=new Map(), donors=[];let total=0,receipts=0,positive=0,adjustments=0;
 for(const g of groups){
  total+=g.amount;receipts+=g.records.length;
  const allocations=new Map();
  for(const r of g.records){
   if(r.memo)continue;
   const name=masterSectorForRecord(r);
   if(!sectors.has(name))sectors.set(name,{name,amount:0,positive:0,adjustments:0,receipts:0,donors:new Set(),leaves:[],primaryDonors:0});
   const s=sectors.get(name);s.amount+=r.amount;s.receipts++;s.donors.add(g.key);
   if(r.amount>0){s.positive+=r.amount;positive+=r.amount;}else{s.adjustments+=r.amount;adjustments+=r.amount;}
   if(!allocations.has(name))allocations.set(name,{name:g.name,key:g.key,sector:name,amount:0});allocations.get(name).amount+=r.amount;
  }
  for(const [name,leaf]of allocations)sectors.get(name).leaves.push(leaf);
  // Exactly one dot-matrix category per donor, including donors with adjustments.
  const primary=[...allocations].sort((a,b)=>Math.abs(b[1].amount)-Math.abs(a[1].amount)||a[0].localeCompare(b[0]))[0];
  if(primary){
   sectors.get(primary[0]).primaryDonors++;
   donors.push({key:g.key,name:g.name,sector:primary[0],amount:g.amount});
  }
 }
 const result=[...sectors.values()].map(s=>({...s,donorCount:s.donors.size,leaves:s.leaves.sort(sort)})).sort(sort);
 return {donors,groups:groups.length,total,receipts,positive,adjustments,sectors:result,areaTotal:result.reduce((n,s)=>n+s.leaves.reduce((a,l)=>a+Math.max(0,l.amount),0),0)};
}
export function sectorShareData(model){
 return model.sectors.map(sector=>({name:sector.name,amount:sector.amount,share:model.total?sector.amount/model.total:0}));
}
export function researchedSectorData(model){
 const sectors=model.sectors.filter(s=>isResearchedSectorName(s.name));
 const names=new Set(sectors.map(s=>s.name)),donors=model.donors.filter(d=>names.has(d.sector));
 const total=sectors.reduce((n,s)=>n+s.amount,0);
 return {sectors,donorRows:donors,total,donors:donors.length,unclassifiedTotal:model.total-total,unclassifiedDonors:model.donors.length-donors.length};
}
// A presentation level from Claude's taxonomy; donor assignments remain unchanged.
export function groupedVisualData(model){
 const groups=new Map();
 for(const s of model.sectors){
  const name=sectorGroups[s.name]||s.name;
  if(!groups.has(name))groups.set(name,{name,amount:0,positive:0,adjustments:0,receipts:0,donors:new Set(),leaves:[],primaryDonors:0});
  const g=groups.get(name);for(const key of ['amount','positive','adjustments','receipts','primaryDonors'])g[key]+=s[key];
  for(const donor of s.donors)g.donors.add(donor);g.leaves.push(...s.leaves);
 }
 return {...model,grouped:true,donors:model.donors.map(d=>({...d,sector:sectorGroups[d.sector]||d.sector})),sectors:[...groups.values()].map(g=>({...g,donorCount:g.donors.size,leaves:g.leaves.sort(sort)})).sort(sort)};
}
export function packingData(model){
 const children=model.sectors.filter(s=>s.leaves.length).map(s=>{
  const donors=s.leaves.map(l=>({...l,value:Math.max(0,l.amount)}));
  if(!model.grouped)return {name:s.name,children:donors};
  const sectors=new Map();
  for(const donor of donors){
   if(!sectors.has(donor.sector))sectors.set(donor.sector,{name:donor.sector,children:[]});
   sectors.get(donor.sector).children.push(donor);
  }
  return {name:s.name,children:[...sectors.values()]};
 });
 return {name:'All sectors',children};
}
export function dotData(model){
 const order=new Map(model.sectors.map((s,i)=>[s.name,i]));
 return [...model.donors].sort((a,b)=>order.get(a.sector)-order.get(b.sector)||a.name.localeCompare(b.name));
}
