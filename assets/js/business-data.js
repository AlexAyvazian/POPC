import {normalize,occupationGroup} from './donor-data.js?v=claude1';
const personal=/^(?:NOT EMPLOYED|RETIRED|SELF[ -]?EMPLOYED|SELF|N\/?A|NONE|NULL|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|UNEMPLOYED|HOMEMAKER|HOME MAKER|STUDENT|UNKNOWN|NOT AVAILABLE|REQUESTED|NOT PROVIDED|NOT DISCLOSED|DECLINED|REFUSED)$/;
export function identifyName(r){
 const reported=normalize(r.type==='individual'?r.employer:r.name)||'NOT REPORTED',isPersonal=r.type==='individual'&&personal.test(reported);
 const research=isPersonal?null:r.identity;
 return {reported,personal:isPersonal,name:research?.name||reported,method:r.type==='individual'?'Reported employer':'Reported organization / PAC',research};
}
export const connectedBusinessName=r=>identifyName(r).name;
export function buildDirectory(records){
 const groups=new Map();
 for(const r of records){
  if(r.category==='other')continue;
  const identity=identifyName(r),key=JSON.stringify([identity.personal,identity.name]);
  if(!groups.has(key))groups.set(key,{key,name:identity.name,personal:identity.personal,names:new Set(),methods:new Set(),sectors:new Set(),directSectors:new Set(),memoSectors:new Set(),committees:new Set(),individualDonors:new Set(),individual:0,organization:0,individualCount:0,organizationCount:0,individualMemoCount:0,organizationMemoCount:0,count:0,memoCount:0,records:[],research:identity.research});
  const g=groups.get(key);g.names.add(identity.reported);g.methods.add(identity.method);g.committees.add(r.committee);
  if(r.sector)(r.memo?g.memoSectors:g.directSectors).add(r.sector);
  if(r.type==='individual')g.individualDonors.add(normalize(r.name));
  if(r.memo){g.memoCount++;g[r.type+'MemoCount']++;}else{g[r.type]+=r.amount;g[r.type+'Count']++;g.count++;}
  g.records.push(r);
 }
 for(const g of groups.values())g.sectors=new Set(g.directSectors.size?g.directSectors:g.memoSectors);
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function researchPriorityReasons(g){
 if(g.personal)return [];
 const result=[];
 if(g.research)result.push('Research sources available');
 if(g.organizationCount||g.organizationMemoCount)result.push('PAC / organization receipt');
 if(g.individualDonors.size>=2)result.push('2+ individual donors');
 const roles=new Set(g.records.filter(r=>r.type==='individual').map(r=>occupationGroup(r.occupation)).filter(s=>/executive|C-suite|president|Presidents|Founders|Partners|Chairs/.test(s)));
 return [...result,...roles];
}
export const isResearchEligibleGroup=g=>researchPriorityReasons(g).length>0;
export function selectDirectory(groups,{query='',sector='',view='promoted'}={}){
 const q=normalize(query);
 return groups.filter(g=>(view==='all'||view==='personal'&&g.personal||!g.personal&&(view==='organizations'?(g.organizationCount||g.organizationMemoCount):view==='employers'?(g.individualCount||g.individualMemoCount):view==='names'||isResearchEligibleGroup(g)||q))&&(!sector||g.sectors.has(sector))&&(!q||[g.name,...g.names,g.research?.parent||''].some(n=>normalize(n).includes(q))));
}
export function directoryCSV(groups){
 const quote=v=>'"'+String(v??'').replace(/^[\s]*[=+@-]/,"'$&").replaceAll('"','""')+'"';
 return [['Business / organization','Reported names','Sectors','Parent / related organization','Research evidence','Sources','Organization donations (USD)','Individual donations (USD)','Receipts','Memos'],...groups.map(g=>[g.name,[...g.names].join('; '),[...g.sectors].join('; '),g.research?.parent||'',g.research?.evidence||'',(g.research?.sources||[]).join('; '),(g.organization/100).toFixed(2),(g.individual/100).toFixed(2),g.count,g.memoCount])].map(row=>row.map(quote).join(',')).join('\r\n');
}
