// All public donor data comes from the build of ClaudeFiles. No legacy fallback.
import {networkConfig,sectorGroups,masterSectors,masterSectorGroups,dataVersion} from './donor-config.js?v=claude1';
export {sectorGroups,masterSectors,masterSectorGroups};
export const normalize=s=>String(s??'').trim().replace(/\s+/g,' ').toUpperCase();
export const personalCategories=["Retired","Not employed / unemployed","Students","Homemakers","Self-employed (role unspecified)","Occupation unreported"];
export function occupationGroup(raw){
 const t=normalize(raw).replace(/\./g,'').replace(/[-–]/g,' ').replace(/\s+/g,' ');
 if(!t||/^(N\/?A|NONE|UNKNOWN|NOT PROVIDED|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|REFUSED|REQUESTED|NULL|NOT AVAILABLE|NOT DISCLOSED|DECLINED)$/.test(t))return "Occupation unreported";
 if(/\bRETIRED\b/.test(t))return "Retired";
 if(/\b(HOMEMAKER|HOME MAKER|STAY AT HOME|HOUSEWIFE|HOUSEHUSBAND)\b/.test(t))return "Homemakers";
 if(/\bSTUDENT\b/.test(t))return "Students";
 if(/\b(NOT EMPLOYED|UNEMPLOYED|NOT WORKING)\b/.test(t))return "Not employed / unemployed";
 if(/\b(ASSISTANT TO|SECRETARY TO|AIDE TO|ADVISOR TO|ADVISER TO)\b/.test(t))return "Other reported occupations";
 for(const [label,expression]of [
 ["Chief executive officers",/\b(CEO|CO CEO|CHIEF EXECUTIVE OFFICER)\b/],
 ["Chairs / board members / trustees",/\b(CHAIRMAN|CHAIRWOMAN|CHAIRPERSON|CHAIR|CO CHAIR|BOARD MEMBER|BOARD DIRECTOR|TRUSTEE)\b/],
 ["Other C-suite officers",/\b(CFO|COO|CTO|CIO|CMO|CHRO|CLO|CSO|CPO|CRO|CHIEF (FINANCIAL|OPERATING|TECHNOLOGY|INFORMATION|INVESTMENT|MARKETING|LEGAL|STRATEGY|PEOPLE|PRODUCT|RISK|HUMAN RESOURCES) OFFICER)\b/],
 ["Vice presidents",/\b(VICE PRESIDENT|VP|SVP|EVP|AVP)\b/],["Presidents",/\bPRESIDENT\b/],
 ["Founders / business owners",/\b(FOUNDER|COFOUNDER|CO FOUNDER|OWNER|PROPRIETOR)\b/],
 ["Partners / principals",/\b(PARTNER|PRINCIPAL)\b/],["Other executives / managing directors",/\b(MANAGING DIRECTOR|EXECUTIVE DIRECTOR|EXECUTIVE|EXEC|GENERAL COUNSEL|CHIEF OF STAFF)\b/],
 ["Managers / directors",/\b(MANAGER|DIRECTOR|SUPERVISOR|HEAD OF)\b/],["Self-employed (role unspecified)",/\b(SELF EMPLOYED|SELF)\b/]
 ])if(expression.test(t))return label;
 return "Other reported occupations";
}
let catalogPromise;
const networks=new Map(),committees=new Map();
async function catalog(){
 if(!catalogPromise)catalogPromise=fetch('/data/donors.json?v='+dataVersion).then(r=>{if(!r.ok)throw Error('Donor data unavailable');return r.json();}).then(data=>{if(data.schema!==1||data.version!==dataVersion)throw Error('Donor build version mismatch');return data;}).catch(e=>{catalogPromise=undefined;throw e;});
 return catalogPromise;
}
async function unpack(block){
 if(!Array.isArray(block)||block.length!==2)throw Error('Invalid donor data block');
 const bytes=Uint8Array.from(atob(block[1]),c=>c.charCodeAt(0));
 const rows=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
 if(rows.length!==block[0])throw Error('Incomplete donor data block');
 return rows;
}
export async function loadNetwork(network){
 if(!networkConfig[network])throw Error('Unknown donor network');
 if(!networks.has(network))networks.set(network,(async()=>{
  const source=(await catalog()).networks[network]; const [donors,businessRows]=await Promise.all([unpack(source.donors),unpack(source.businesses)]);const businesses=new Map(businessRows.map(b=>[b.name,Object.freeze(b)]));
  const index=new Map(donors.map(d=>[d.id,Object.freeze(d)]));
  if(index.size!==donors.length)throw Error('Duplicate donor ID');
  return {source,donors,index,businesses};
 })().catch(e=>{networks.delete(network);throw e;}));
 return networks.get(network);
}
export function sectorAssignmentForRecord(record){return record.classification||null;}
function canonicalResearchedSector(classification){
 const researched=String(classification?.researchedSector??'').trim();
 return researched&&sectorGroups[researched]?researched:'';
}
export function masterSectorForRecord(record,view='firstHand'){
 const c=record.classification;
 if(!c)return record.sector||'';
 if(view==='household')return c.household;
 if(view==='refined')return c.refined;
 return canonicalResearchedSector(c)||c.firstHand;
}
export function networkData(network){
 const config=networkConfig[network];if(!config)throw Error('Unknown donor network');
 async function loadCommittee(c,kind='direct'){
  if(typeof kind!=='string')kind='direct';
  if(!['direct','memo','other'].includes(kind))throw Error('Unknown receipt category');
  const key=network+'|'+c.key+'|'+kind;
  if(!committees.has(key))committees.set(key,(async()=>{
   const {source,index,businesses}=await loadNetwork(network),part=source.committees[c.key];
   if(!part)throw Error('Unknown committee');
   const rows=await unpack(part[kind]);
   const records=rows.map(values=>{
    const r=Object.fromEntries(source.receiptFields.map((field,i)=>[field,values[i]]).filter(([,v])=>v!==null&&v!==undefined&&v!==''));
    const d=r.donor?index.get(r.donor):null;
    if(kind==='direct'&&!d)throw Error('Receipt has no ClaudeFiles donor');
    const classification=d?.classification||null,sector=classification?masterSectorForRecord({classification}):'';
    return {...r,employer:r.type==='individual'?(r.employer||'NOT REPORTED'):r.employer,occupation:r.type==='individual'?(r.occupation||'NOT REPORTED'):r.occupation,network,committee:c.key,donorName:d?.name||r.name,classification,identity:businesses.get(r.business)||null,sector,memo:kind==='memo'};
   });
   if(kind==='direct'&&(records.length!==c.individualCount+c.organizationCount||records.reduce((n,r)=>n+r.amount,0)!==c.individual+c.organization))throw Error('Committee reconciliation failed: '+c.name);
   if(kind==='memo'&&records.length!==c.memos)throw Error('Memo reconciliation failed: '+c.name);
   return records;
  })().catch(e=>{committees.delete(key);throw e;}));
  return committees.get(key);
 }
 const loadResearchRecords=async()=>(await Promise.all(config.map(c=>loadCommittee(c)))).flat();
 const loadDirectoryRecords=async()=>(await Promise.all(config.map(async c=>[...await loadCommittee(c),...await loadCommittee(c,'memo')]))).flat();
 return {config,normalize,occupationGroup,personalCategories,loadCommittee,loadResearchRecords,loadDirectoryRecords};
}
