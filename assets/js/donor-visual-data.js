import {masterSectorForRecord} from './master-sectors.js?v=refined1';
const sort=(a,b)=>b.amount-a.amount||a.name.localeCompare(b.name);
export function buildVisualData(groups){
 const sectors=new Map();let total=0,receipts=0,positive=0,adjustments=0;
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
  for(const [name,leaf]of allocations)if(leaf.amount>0)sectors.get(name).leaves.push(leaf);
  // Exactly one dot-matrix category per donor, including donors with adjustments.
  const primary=[...allocations].sort((a,b)=>Math.abs(b[1].amount)-Math.abs(a[1].amount)||a[0].localeCompare(b[0]))[0];
  if(primary)sectors.get(primary[0]).primaryDonors++;
 }
 const result=[...sectors.values()].map(s=>({...s,donorCount:s.donors.size,leaves:s.leaves.sort(sort)})).sort(sort);
 return {groups:groups.length,total,receipts,positive,adjustments,sectors:result,areaTotal:result.reduce((n,s)=>n+s.leaves.reduce((a,l)=>a+l.amount,0),0)};
}
export function radarData(model){
 return model.sectors.map(s=>({name:s.name,amount:s.leaves.reduce((n,l)=>n+l.amount,0)})).filter(s=>s.amount>0).sort(sort).map(s=>({...s,share:model.areaTotal?s.amount/model.areaTotal:0}));
}
export function packingData(model){
 return {name:'All sectors',children:model.sectors.filter(s=>s.leaves.length).map(s=>({name:s.name,children:s.leaves.map(l=>({...l,value:l.amount}))}))};
}
export function dotData(model){
 const unit=Math.max(1,Math.ceil(model.groups/400)),dots=[];
 for(const s of model.sectors)for(let n=s.primaryDonors;n>0;n-=unit)dots.push({sector:s.name,count:Math.min(unit,n),fraction:Math.min(unit,n)/unit});
 return {unit,dots};
}
