import {masterSectorForRecord,sectorAssignmentForRecord,normalize} from './donor-data.js?v=claude1';
import {identifyName} from './business-data.js?v=claude1';
// Consolidate the complete page before the $500 threshold or search.
export function groupDonors(records){
 const groups=new Map();
 for(const [index,r]of records.entries()){
  if(r.memo||!['individual','organization'].includes(r.type)||r.category==='other')continue;
  if(!Number.isSafeInteger(r.amount))throw Error('Invalid contribution amount');
  const identity=identifyName(r),displayName=r.donorName||r.name,name=normalize(displayName),key=JSON.stringify([r.type,name||'unreported-'+index]);
  if(!groups.has(key))groups.set(key,{key,name:displayName||'Not reported',reportedNames:new Set(),reportedEmployers:new Set(),businessResearch:new Map(),type:r.type,classification:sectorAssignmentForRecord(r),amount:0,employers:new Set(),occupations:new Set(),sectors:new Set(),committees:new Map(),records:[]});
  const g=groups.get(key);g.amount+=r.amount;g.reportedNames.add(r.name||'Not reported');
  if(r.employer){g.reportedEmployers.add(normalize(r.employer));g.employers.add(identity.name);}
  if(!identity.personal)g.businessResearch.set(identity.reported,identity);
  if(r.occupation)g.occupations.add(normalize(r.occupation));
  const sector=masterSectorForRecord(r);if(sector)g.sectors.add(sector);
  g.committees.set(r.committee,(g.committees.get(r.committee)||0)+r.amount);g.records.push(r);
 }
 const sorted=[...groups.values()].sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
 return {organizations:sorted.filter(g=>g.type==='organization'),indirect:sorted.filter(g=>g.type==='individual'&&g.amount>=50000),small:sorted.filter(g=>g.type==='individual'&&g.amount<50000)};
}
