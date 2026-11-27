import {classifySectorLabel,loadMasterSectors} from './master-sectors.js?v=categories1';
const config=[{"name":"Friends of Schumer PAC","slug":"friends-of-schumer-pac","key":"friends-of-schumer-pac","id":"C00346312","individual":40833975,"organization":17337500,"individualCount":12681,"organizationCount":58,"memos":12669,"memoAmount":39551075,"otherCount":0,"otherAmount":0,"uniqueRecords":25408},{"name":"IMPACT PAC","slug":"impact-pac","key":"impact-pac","id":"C00348607","individual":5962500,"organization":105332500,"individualCount":20,"organizationCount":258,"memos":7,"memoAmount":2800000,"otherCount":0,"otherAmount":0,"uniqueRecords":285},{"name":"SMP PAC","slug":"smp-pac","key":"smp-pac","id":"C00484642","individual":9802117139,"organization":21474682077,"individualCount":36135,"organizationCount":153,"memos":15204,"memoAmount":293471964,"otherCount":64,"otherAmount":18863800,"uniqueRecords":51556}];
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

const pending=new Map();
function category(r){return r[5]?"memo":!["11AI","11C"].includes(r[11])?"other":r[8]==="IND"?"individual":"organization";}
function rowSector(r){const type=r[8]==="IND"?"individual":"organization";return classifySectorLabel(type==="individual"?r[1]:r[0],"",new Map(),type);}
async function loadRows(c){await loadMasterSectors();if(!pending.has(c.key))pending.set(c.key,(async()=>{const path="/data/schumer/"+c.key+".json";const res=await fetch(path);if(!res.ok)throw Error("Schumer dataset unavailable: "+path);const rows=await res.json();if(!Array.isArray(rows)||rows.length!==c.uniqueRecords)throw Error("Incomplete dataset: "+c.name);const keys=new Set(),counts={individual:0,organization:0,memo:0,other:0},sums={individual:0,organization:0,memo:0,other:0};for(const r of rows){if(!Array.isArray(r)||r.length!==18||!Number.isSafeInteger(r[4])||typeof r[5]!=="boolean"||!r[9]||!r[10])throw Error("Invalid receipt: "+c.name);const k=JSON.stringify([r[9],r[10]]);if(keys.has(k))throw Error("Duplicate receipt: "+c.name);keys.add(k);const kind=category(r);counts[kind]++;sums[kind]+=r[4];}for(const [k,count,amount] of [["individual",c.individualCount,c.individual],["organization",c.organizationCount,c.organization],["memo",c.memos,c.memoAmount],["other",c.otherCount,c.otherAmount]])if(counts[k]!==count||sums[k]!==amount)throw Error("Receipt reconciliation failed: "+c.name+" / "+k);return rows;})().catch(e=>{pending.delete(c.key);throw e;}));return pending.get(c.key);}
function toRecord(r,c){return {name:r[0],type:r[8]==="IND"?"individual":"organization",employer:r[1]||"NOT REPORTED",occupation:r[2]||"NOT REPORTED",sector:rowSector(r),amount:r[4],committee:c.key,memo:r[5],date:r[3],entity:r[8],image:r[7],filing:r[9],transaction:r[10]};}
async function loadCommittee(c){return (await loadRows(c)).filter(r=>["individual","organization"].includes(category(r))).map(r=>toRecord(r,c));}
async function loadResearchRecords(){return (await Promise.all(config.map(loadCommittee))).flat();}
async function loadDirectoryRecords(){return (await Promise.all(config.map(async c=>(await loadRows(c)).filter(r=>category(r)!=="other").map(r=>toRecord(r,c))))).flat();}
export {config,normalize,occupationGroup,personalCategories,loadCommittee,loadResearchRecords,loadDirectoryRecords,loadRows,category,rowSector};
