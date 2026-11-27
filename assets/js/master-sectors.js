import {businessIdentities} from '../../data/jeffries/business-identities.js?v=refined1';
import {schumerIdentities} from '../../data/schumer/schumer-identities.js?v=refined1';
import {masterSectors,sectorGroups,masterSectorGroups} from '../../data/sectors/taxonomy.js?v=refined1';
export {masterSectors,sectorGroups,masterSectorGroups};
const normalize=s=>String(s??'').trim().replace(/\s+/g,' ').toUpperCase();
const missing=/^(?:|N\/?A|NA|NONE|NULL|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|UNKNOWN|NOT AVAILABLE|REQUESTED|NOT PROVIDED|NOT DISCLOSED|DECLINED|REFUSED)$/;
const personal=name=>{
 const n=normalize(name);
 if(/\bRETIRED\b/.test(n))return 'No sector: Retired';
 if(/^(?:NOT EMPLOYED|UNEMPLOYED|HOMEMAKER|HOME MAKER|STUDENT|NOT WORKING)$/.test(n))return 'No sector: Not employed / homemaker / student';
 if(/^(?:SELF[ -]?EMPLOYED|SELF)$/.test(n))return 'No sector: Self-employed (field not given)';
 return missing.test(n)?'No sector: Employer & occupation not reported':'';
};
const legacy={
 'Aerospace & defense':'Defense & Aerospace Contractors','Agriculture, food & beverage':'Agriculture & Food','Construction & infrastructure':'Construction & Engineering','Diversified business group':'Diversified Holding Companies','Energy & utilities':'Energy (type not specified)','Facilities & environmental services':'Facilities & Environmental Services','Finance & investment':'Investment, Asset Management & Securities','Foreign policy & advocacy':'Foreign Policy Advocacy','Furniture & woodworking':'Manufacturing & Heavy Equipment','Government & public sector':'Government & Public Sector','Health insurance':'Health Insurance','Healthcare':'Healthcare (type not specified)','Hospitality & gaming':'Hospitality, Gaming & Sports','Insurance':'Insurance (type not specified)','Labor unions':'Labor Unions','Legal services':'Law Firms & Legal Services','Lobbying & public affairs':'Lobbying & Public Affairs','Manufacturing & automotive':'Manufacturing & Heavy Equipment','Media & entertainment':'Media & Entertainment','Metals & materials processing':'Mining, Metals & Chemicals','Nonprofit & philanthropy':'Nonprofit & Philanthropy','Civil rights & civic advocacy':'Civil Rights & Civic Advocacy','Environment & conservation':'Environment & Conservation','Gun safety':'Gun Safety','Public policy research':'Public Policy Research','Pharmaceuticals & biotechnology':'Pharma, Pharmacy & Health Products','Political committees & advocacy':'Political Committees & Advocacy','Professional services':'Other Professional & Business Services','Real estate & housing':'Real Estate & Property Management','Retail & consumer':'Retail, Restaurants & Consumer Goods','Security services':'Security Services','Telecommunications':'Telecom & Cable','Trade associations':'Multi-Industry Business Associations','Transportation':'Transportation (type not specified)','Tribal nations & governments':'Tribal Nations & Governments','Personal status / unreported employer':'No sector: Employer & occupation not reported','Sector unresolved / ambiguous':'Unresolved / ambiguous'
};
export function canonicalSector(name,label=''){
 const value=String(label||'').trim();if(masterSectors.includes(value))return value;if(legacy[value])return legacy[value];
 if(/cosmetics|personal care|electrical equipment/i.test(value))return 'Manufacturing & Heavy Equipment';
 if(/political|fundraising|earmark|candidate committee/i.test(value))return 'Political Committees & Advocacy';
 if(/unconfirmed|unverified|unclear|unresolved|ambiguous|^other advocacy$/i.test(value))return 'Unresolved / ambiguous';
 if(/personal|self.employ|not employed|unreported/i.test(value))return personal(name)||'No sector: Employer & occupation not reported';
 const mappings=[
 ['Tribal Nations & Governments',/tribal|indian nation|indian community/i],['Health Insurance',/health insurance|managed care/i],['Pharma, Pharmacy & Health Products',/pharma|biotech|medical products/i],['Hospitals, Health Providers & Telehealth',/hospital|telehealth/i],['Physicians & Medical Specialty Societies',/physician|medical association/i],['Healthcare (type not specified)',/healthcare|health care/i],['Real Estate & Property Management',/real estate|housing|property/i],['Mortgage & Title',/mortgage|title/i],['Banking',/bank/i],['Hedge Funds & Proprietary Trading',/hedge fund|proprietary trading/i],['Private Equity & Venture Capital',/private equity|venture capital/i],['Crypto & Digital Assets',/crypto|digital assets/i],['Investment, Asset Management & Securities',/financ|investment|asset management|securities/i],['Labor Unions',/labor|employee association/i],['Insurance Agents, Brokers & Advisors',/insurance.*(?:agent|broker|advisor)/i],['Insurance (type not specified)',/insurance/i],['Law Firms & Legal Services',/legal|law firm/i],['Defense & Aerospace Contractors',/aerospace|defense/i],['Construction & Engineering',/construction|engineering|infrastructure/i],['Clean Energy & Solar',/solar|clean energy/i],['Electric Utilities & Power',/electric|utilit/i],['Oil, Gas & Fuels',/oil|gas|fuel/i],['Energy (type not specified)',/energy|natural resources/i],['Telecom & Cable',/telecom|broadband/i],['Media & Entertainment',/\b(?:broadcast|media|arts|entertainment)\b/i],['Technology',/technology|software|electronics|digital transformation/i],['Manufacturing & Heavy Equipment',/manufacturing|cosmetics|personal care|furniture|woodworking/i],['Automotive & Marine',/automotive|automobile/i],['Mining, Metals & Chemicals',/metal|materials processing|chemical/i],['Airlines',/airline/i],['Freight, Rail & Logistics',/freight|rail|logistic/i],['Transportation (type not specified)',/transport|aviation/i],['Agriculture & Food',/agricultur|food & beverage/i],['Hospitality, Gaming & Sports',/hospitality|gaming|horse racing/i],['Retail, Restaurants & Consumer Goods',/retail|consumer|restaurant|foodservice/i],['Education',/school|education/i],['Foreign Policy Advocacy',/foreign policy/i],['Multi-Industry Business Associations',/trade association/i],['Lobbying & Public Affairs',/lobby|public affairs|government relations/i],['Government & Public Sector',/government|public sector/i],['Accounting & Consulting',/consulting|accounting/i],['Facilities & Environmental Services',/waste|landscaping|environmental services/i],['Nonprofit & Philanthropy',/nonprofit|philanthrop|religion|faith.based/i],['Civil Rights & Civic Advocacy',/civil rights|social action|civic/i],['Environment & Conservation',/environment|conservation/i],['Gun Safety',/gun safety|gun violence/i],['Public Policy Research',/think tank|public.policy research/i],['Political Committees & Advocacy',/political|fundraising|candidate|advocacy/i],['Other Professional & Business Services',/professional|business services/i]
 ];
 for(const [sector,re]of mappings)if(re.test(value))return sector;
 return 'Unresolved / ambiguous';
}
const indexes=new Map();
for(const [network,entries]of [['jeffries',businessIdentities],['schumer',[...businessIdentities,...schumerIdentities]]]){
 const index=new Map(),ambiguous=new Set();
 for(const e of entries)for(const type of e.recordTypes?.length?e.recordTypes:['*'])for(const alias of [...(e.aliases||[]),...(e.name&&!e.aliasOnly?[e.name]:[])]){
  const key=type+'|'+normalize(alias),old=index.get(key);
  if(old&&normalize(old.name)!==normalize(e.name)){index.delete(key);ambiguous.add(key);}else if(!ambiguous.has(key))index.set(key,e);
 }
 indexes.set(network,index);
}
function identity(name,type,network='schumer'){const index=indexes.get(network),n=normalize(name);return index.get(type+'|'+n)||index.get('*|'+n);}
function organizationName(name,network){
 const n=normalize(name),title=n.replace(/\s+\([^()]*\bPAC\)$/,'');
 const expression=network==='schumer'?/^(.+?)\s+(?:(?:EMPLOYEE|EMPLOYEES)\s+)?(?:POLITICAL ACTION COMMITTEE|SEPARATE SEGREGATED FUND|PAC)$/:/^(.+?)\s+(?:(?:EMPLOYEE|EMPLOYEES)(?:['’])?\s+)?(?:POLITICAL ACTION COMMITTEE|SEPARATE SEGREGATED FUND|PAC)$/;
 const match=title.match(expression),stem=match?.[1]?.replace(/^EMPLOYEES OF\s+/,'');
 const found=identity(n,'organization',network)||(stem&&identity(stem,'organization',network));
 return found?.status==='Source-backed'&&found.name?normalize(found.name):n;
}
const committees=new Map(['jeff-pac','jvf','jmf','jfc','jcvf','dvtlf','jcavf','jbpf'].map(k=>[k,'jeffries']).concat(['friends-of-schumer-pac','impact-pac','smp-pac'].map(k=>[k,'schumer'])));
let donorIndex=new Map(),businessIndex=new Map(),pending;
const recordCache=new WeakMap();
const add=(index,key,sector)=>{if(!index.has(key))index.set(key,new Set());index.get(key).add(sector);};
function addBusiness(index,type,name,sector){const found=identity(name,type),canonical=found?.status==='Source-backed'&&found.name?found.name:name;for(const n of [name,canonical])add(index,type+'|'+normalize(n),sector);}

function extendBusinessAliases(business){
 const parents=new Map(),root=k=>{if(!parents.has(k))parents.set(k,k);let n=k;while(parents.get(n)!==n)n=parents.get(n);while(parents.get(k)!==k){const next=parents.get(k);parents.set(k,n);k=next;}return n;};
 for(const e of [...businessIdentities,...schumerIdentities].filter(e=>e.status==='Source-backed'&&e.name))for(const type of e.recordTypes?.length?e.recordTypes:['individual','organization']){
  const keys=[e.name,...(e.aliases||[])].map(n=>type+'|'+normalize(n));for(const key of keys)parents.set(root(key),root(keys[0]));
 }
 const labels=new Map(),fallback=new Map();for(const[key,values]of business)for(const value of values)add(labels,root(key),value);
 for(const e of [...businessIdentities,...schumerIdentities].filter(e=>e.status==='Source-backed'&&e.name&&e.sector))for(const type of e.recordTypes?.length?e.recordTypes:['individual','organization']){const label=canonicalSector('',e.sector);if(label!=='Unresolved / ambiguous')add(fallback,root(type+'|'+normalize(e.name)),label);}
 for(const key of parents.keys()){const values=labels.get(root(key))||fallback.get(root(key));if(values)business.set(key,new Set(values));}
}
export async function loadMasterSectors(){
 if(!pending)pending=(async()=>{
  const donor=new Map(),business=new Map();
  const payloads=await Promise.all(['jeffries','schumer'].map(async network=>{const r=await fetch('/data/sectors/'+network+'.json');if(!r.ok)throw Error('Unable to load '+network+' sector classifications');return [network,await r.json()];}));
  for(const [network,payload]of payloads){
   if(payload.network!==network||payload.schema!==1)throw Error('Invalid sector classification file');
   for(const row of payload.rows){
    const [type,name,sector,basis,employers,research={}]=row;if(!masterSectors.includes(sector))throw Error('Unknown supplied sector: '+sector);
    const {sector:researchedSector='',basis:researchBasis='',...details}=research;
    const item=Object.freeze({network,type,name,sector,group:sectorGroups[sector],basis,...details,researchedSector,researchBasis,firstHand:research.firstHand||sector,household:research.household||sector});
    const key=network+'|'+type+'|'+normalize(name);if(donor.has(key))throw Error('Duplicate supplied donor classification');donor.set(key,item);
    if(type==='organization')addBusiness(business,'organization',name,sector);
    if(type==='individual'&&!sector.startsWith('No sector:')&&sector!=='Unresolved / ambiguous'&&(/employer:|original sector \(employer:/.test(basis))){
     const names=employers.filter(n=>!personal(n));
     if(names.length===1)addBusiness(business,'individual',names[0],sector);
    }
   }
  }
  extendBusinessAliases(business);donorIndex=donor;businessIndex=business;return businessIndex;
 })().catch(error=>{pending=undefined;throw error;});
 return pending;
}
export function sectorAssignmentForRecord(record){
 if(recordCache.has(record))return recordCache.get(record);
 const network=record.network||committees.get(record.committee);if(!network)return null;
 const n=normalize(record.name),name=record.type==='organization'?organizationName(n,network):n;
 const found=donorIndex.get(network+'|'+record.type+'|'+n)||donorIndex.get(network+'|'+record.type+'|'+name)||null;
 if(found)recordCache.set(record,found);return found;
}
export function classifySectorLabel(name,mappedLabel='',globalSectors=new Map(),type='*'){
 const entry=identity(name,type),canonical=entry?.status==='Source-backed'&&entry.name?normalize(entry.name):normalize(name);
 const candidates=new Set();
 for(const t of type==='*'?['individual','organization']:[type]){const forms=t==='organization'?[canonical,normalize(name),organizationName(name,'jeffries'),organizationName(name,'schumer')]:[canonical,normalize(name)];for(const n of forms)for(const sector of businessIndex.get(t+'|'+n)||[])candidates.add(sector);}
 if(candidates.size===1)return [...candidates][0];
 const p=personal(canonical);if(p)return p;
 if(candidates.size>1)return 'Unresolved / ambiguous';
 const supplied=globalSectors.get(normalize(name));
 const valid=value=>value&&!/unconfirmed|unresolved|ambiguous/i.test(value);
 return canonicalSector(canonical,valid(mappedLabel)?mappedLabel:entry?.sector||supplied||'');
}
export function masterSectorForRecord(record,view='refined'){
 const assigned=sectorAssignmentForRecord(record);if(assigned)return view==='firstHand'?assigned.firstHand:view==='household'?assigned.household:assigned.sector;
 const business=classifySectorLabel(record.type==='individual'?record.employer:record.name,'',new Map(),record.type);
 if(record.type!=='individual'||(!business.startsWith('No sector:')&&business!=='Unresolved / ambiguous'))return business;
 return personal(record.occupation)||business;
}
export function normalizeSectorRows(rows,path){
 if(!Array.isArray(rows))return rows;
 const type=path.includes('-employers')?'individual':path.includes('-organizations')?'organization':null;
 if(!type)return rows;
 return rows.map(row=>{const copy=[...row];copy[1]=classifySectorLabel(row[0],'',new Map(),type);return copy;});
}
