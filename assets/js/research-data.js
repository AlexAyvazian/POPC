import {classifySectorLabel,loadMasterSectors} from './master-sectors.js?v=categories1';
import {businessIdentities} from '../../data/jeffries/business-identities.js?v=categories1';
const config=[{"name":"JEFF PAC","slug":"jeff-pac","key":"jeff-pac","ni":4,"no":3,"individual":11430000,"organization":76000000,"individualCount":28,"organizationCount":171,"memos":200},{"name":"Jeffries Victory Fund","slug":"jeffries-victory-fund","key":"jvf","ni":6,"no":0,"individual":1383246082,"organization":66810000,"individualCount":530,"organizationCount":30,"memos":16},{"name":"Jeffries Majority Fund","slug":"jeffries-majority-fund","key":"jmf","ni":3,"no":3,"individual":74460000,"organization":6899900,"individualCount":178,"organizationCount":19,"memos":156},{"name":"Jeffries for Congress","slug":"jeffries-for-congress","key":"jfc","ni":0,"no":0,"individual":431228139,"organization":282420000,"individualCount":107722,"organizationCount":774,"memos":110585},{"name":"Jeffries Clark Victory Fund","slug":"jeffries-clark-victory-fund","key":"jcvf","ni":0,"no":0,"individual":11850000,"organization":500000,"individualCount":12,"organizationCount":1,"memos":11},{"name":"Defend the Vote Leadership Fund","slug":"defend-the-vote-leadership-fund","key":"dvtlf","ni":13,"no":0,"individual":4067000,"organization":0,"individualCount":1262,"organizationCount":0,"memos":5},{"name":"Jeffries Clark Aguilar Victory Fund","slug":"jeffries-clark-aguilar-victory-fund","key":"jcavf","ni":0,"no":0,"individual":500000,"organization":0,"individualCount":1,"organizationCount":0,"memos":0},{"name":"Jeffries Battleground Protection Fund","slug":"jeffries-battleground-protection-fund","key":"jbpf","ni":0,"no":0,"individual":437599149,"organization":26100000,"individualCount":78,"organizationCount":11,"memos":49}];
const normalize=s=>String(s||"").trim().replace(/\s+/g," ").toUpperCase();
const personalCategories=["Retired","Not employed / unemployed","Students","Homemakers","Self-employed (role unspecified)","Occupation unreported"];
function personalRole(t){
 if(!t||/^(N\/?A|NONE|UNKNOWN|NOT PROVIDED|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|REFUSED|REQUESTED|NULL|NOT AVAILABLE|NOT DISCLOSED|DECLINED)$/.test(t))return "Occupation unreported";
 if(/\bRETIRED\b/.test(t))return "Retired";
 if(/\b(HOMEMAKER|HOME MAKER|STAY AT HOME|HOUSEWIFE|HOUSEHUSBAND)\b/.test(t))return "Homemakers";
 if(/\bSTUDENT\b/.test(t))return "Students";
 if(/\b(NOT EMPLOYED|UNEMPLOYED|NOT WORKING)\b/.test(t))return "Not employed / unemployed";
 return "";
}
function occupationGroup(raw){
 const t=String(raw??"").toUpperCase().trim().replace(/\./g,"").replace(/[-–]/g," ").replace(/\s+/g," ");
 const personal=personalRole(t);if(personal)return personal;
 if(/\b(ASSISTANT TO|SECRETARY TO|AIDE TO|ADVISOR TO|ADVISER TO)\b/.test(t))return "Other reported occupations";
 if(/\b(CEO|CO CEO|CHIEF EXECUTIVE OFFICER)\b/.test(t))return "Chief executive officers";
 if(/\b(CHAIRMAN|CHAIRWOMAN|CHAIRPERSON|CHAIR|CO CHAIR|BOARD MEMBER|BOARD DIRECTOR|TRUSTEE)\b/.test(t))return "Chairs / board members / trustees";
 if(/\b(CFO|COO|CTO|CIO|CMO|CHRO|CLO|CSO|CPO|CRO|CHIEF (FINANCIAL|OPERATING|TECHNOLOGY|INFORMATION|INVESTMENT|MARKETING|LEGAL|STRATEGY|PEOPLE|PRODUCT|RISK|HUMAN RESOURCES) OFFICER)\b/.test(t))return "Other C-suite officers";
 if(/\b(VICE PRESIDENT|VP|SVP|EVP|AVP)\b/.test(t))return "Vice presidents";
 if(/\bPRESIDENT\b/.test(t))return "Presidents";
 if(/\b(FOUNDER|COFOUNDER|CO FOUNDER|OWNER|PROPRIETOR)\b/.test(t))return "Founders / business owners";
 if(/\b(PARTNER|PRINCIPAL)\b/.test(t))return "Partners / principals";
 if(/\b(MANAGING DIRECTOR|EXECUTIVE DIRECTOR|EXECUTIVE|EXEC|GENERAL COUNSEL|CHIEF OF STAFF)\b/.test(t))return "Other executives / managing directors";
 if(/\b(MANAGER|DIRECTOR|SUPERVISOR|HEAD OF)\b/.test(t))return "Managers / directors";
 if(/\b(SELF EMPLOYED|SELF)\b/.test(t))return "Self-employed (role unspecified)";
 return "Other reported occupations";
}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Unable to load "+path);return r.json();}
async function unpack([count,base64]){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const rows=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text());if(rows.length!==count)throw Error("Invalid compressed chunk");return rows;}
function paths(c,kind,n){return n?Array.from({length:n},(_,i)=>"/data/jeffries/"+c.key+"-"+kind+"-"+(i+1)+".json"):["/data/jeffries/"+c.key+"-"+kind+".json"];}
async function loadCommittee(c){
const globalSectors=await loadMasterSectors();
let org=[],ind=[],emp=[];
if(c.key==="jcavf"){ind=[["VRADENBURG, GEORGE","NOT EMPLOYED","RETIRED","2025-09-16",500000]];}
else if(c.key==="jfc"){
const m=await json("/data/jeffries/jfc-manifest.json");
async function load(g){const blocks=(await Promise.all(g.paths.map(json))).flat();const chunks=await Promise.all(blocks.map(unpack));const r=chunks.flat();if(r.length!==g.count)throw Error("Incomplete compressed data: "+c.name);return r;}
[org,ind]=await Promise.all([load(m.groups.organization),load(m.groups.individual)]);
}else{
const sources=await Promise.all([Promise.all(paths(c,"organizations",c.no).map(json)),Promise.all(paths(c,"individuals",c.ni).map(json)),c.key==="jvf"?Promise.resolve([]):json("/data/jeffries/"+c.key+"-employers.json")]);
org=sources[0].flat().filter(r=>!r[4]);ind=sources[1].flat().filter(r=>!r[5]);emp=sources[2];
}
if(org.length!==c.organizationCount||org.reduce((n,r)=>n+r[3],0)!==c.organization)throw Error("Organization totals mismatch: "+c.name);
if(ind.length!==c.individualCount||ind.reduce((n,r)=>n+r[4],0)!==c.individual)throw Error("Individual totals mismatch: "+c.name);
const emap=new Map(emp.filter(r=>typeof r[1]==="string").map(r=>[normalize(r[0]),r[1]]));
const employerSector=name=>classifySectorLabel(name,"",new Map(),"individual");
return [...org.map(r=>({name:r[0],type:"organization",sector:classifySectorLabel(r[0],"",new Map(),"organization"),amount:r[3],committee:c.key,date:r[2],image:r[6],entity:r[8]})),...ind.map(r=>({name:r[0],type:"individual",employer:r[1]||"NOT REPORTED",occupation:r[2]||"NOT REPORTED",sector:employerSector(r[1]),amount:r[4],committee:c.key,date:r[3],image:c.key==="jcavf"?"202510159790813436":r[7]}))];
}

let dataPromise;
function loadResearchRecords(){
 if(!dataPromise)dataPromise=Promise.all(config.map(loadCommittee)).then(parts=>parts.flat()).catch(e=>{dataPromise=undefined;throw e;});
 return dataPromise;
}
export {config,normalize,occupationGroup,personalCategories,classifySectorLabel,loadCommittee,loadResearchRecords};
