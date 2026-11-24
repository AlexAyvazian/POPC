import {config,normalize,occupationGroup,loadResearchRecords} from "./research-data.js?v=1";
const aliases={
 "ceos":"Chief executive officers","ceo":"Chief executive officers","chief executive officers":"Chief executive officers","presidents":"Presidents","president":"Presidents","chairs":"Chairs / board members / trustees","chairmen":"Chairs / board members / trustees","board members":"Chairs / board members / trustees","vice presidents":"Vice presidents","founders":"Founders / business owners","business owners":"Founders / business owners","partners":"Partners / principals","retired":"Retired","retirees":"Retired","unemployed":"Not employed / unemployed","not employed":"Not employed / unemployed","students":"Students","homemakers":"Homemakers","self employed":"Self-employed (role unspecified)","self-employed":"Self-employed (role unspecified)","unreported occupation":"Occupation unreported","occupation unreported":"Occupation unreported"
};
const currency=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n/100);
const number=n=>n.toLocaleString("en-US");
export function localIntent(question){
 const q=question.toLowerCase().trim().replace(/[?!.]+$/,"").replace(/\s+/g," ");
 if(/^(total contributions|total receipts|how much (was contributed|did all eight committees receive)|how much money was raised|how much did the committees receive)$/.test(q))return {};
 if(/^(how many (individual )?(donor names|donors|people) (are there|donated)|how many individuals donated|individual donor count)$/.test(q))return {type:"individual"};
 if(/^(how much did individuals contribute|individual contributions|total individual contributions)$/.test(q))return {type:"individual"};
 if(/^(how much did (pacs|organizations|pacs and organizations) contribute|pac contributions|organization contributions)$/.test(q))return {type:"organization"};
 if(/^(which (industries|sectors) contributed the most|top sectors|top industries|contributions by sector)$/.test(q))return {groupBy:"sector"};
 if(/^(which committees received the most|contributions by committee|committee totals)$/.test(q))return {groupBy:"committee"};
 if(/^(contributions by (role|occupation group)|top roles|professional roles)$/.test(q))return {type:"individual",groupBy:"role"};
 const m=q.match(/^how much did (.+?)(?: (?:donors|individuals))? contribute$/);
 if(m&&aliases[m[1]])return {type:"individual",role:aliases[m[1]]};
 if(m&&/^(attorneys|lawyers|teachers|physicians|engineers|nurses)$/.test(m[1]))return {type:"individual",occupation:m[1].slice(0,-1)};
 return null;
}
export function catalog(rows){
 return {committees:config.map(c=>({key:c.key,name:c.name})),sectors:[...new Set(rows.map(r=>r.sector))].sort(),roles:[...new Set(rows.filter(r=>r.type==="individual").map(r=>occupationGroup(r.occupation)))].sort()};
}
export function evaluate(rows,query,options=catalog(rows)){
 if(!query||typeof query!=="object"||Array.isArray(query))throw Error("No supported data query.");
 const allowed=["type","committee","sector","role","occupation","groupBy"];
 for(const [k,v] of Object.entries(query)){if(!allowed.includes(k)||typeof v!=="string"||!v.trim()||v.length>100)throw Error("Unsupported query filter.");}
 if(query.type&&!["individual","organization"].includes(query.type))throw Error("Unknown receipt type.");
 if(query.committee&&!options.committees.some(c=>c.key===query.committee))throw Error("Unknown committee.");
 if(query.sector&&!options.sectors.includes(query.sector))throw Error("Unknown sector.");
 if(query.role&&!options.roles.includes(query.role))throw Error("Unknown role.");
 if(query.groupBy&&!["sector","committee","role","occupation","type"].includes(query.groupBy))throw Error("Unsupported grouping.");
 if(query.type==="organization"&&(query.role||query.occupation||["role","occupation"].includes(query.groupBy)))throw Error("Occupation filters apply to individual receipts.");
 const individual=Boolean(query.role||query.occupation||["role","occupation"].includes(query.groupBy));
 const matched=rows.filter(r=>(!individual||r.type==="individual")&&(!query.type||r.type===query.type)&&(!query.committee||r.committee===query.committee)&&(!query.sector||r.sector===query.sector)&&(!query.role||occupationGroup(r.occupation)===query.role)&&(!query.occupation||normalize(r.occupation)===normalize(query.occupation)));
 const amount=matched.reduce((n,r)=>n+r.amount,0),names=new Set(matched.map(r=>r.type+":"+normalize(r.name))).size;
 const labels=[query.committee?options.committees.find(c=>c.key===query.committee).name:"All eight committees",query.type==="organization"?"Direct PAC / organization receipts":query.type==="individual"||individual?"Individual receipts":"All direct receipts",query.sector,query.role,query.occupation&&"Exact occupation: "+normalize(query.occupation)].filter(Boolean);
 const out={heading:labels.join(" · "),amount:currency(amount),records:number(matched.length),names:number(names),rows:[]};
 if(query.groupBy){const m=new Map();for(const r of matched){const k=query.groupBy==="role"?occupationGroup(r.occupation):query.groupBy==="occupation"?normalize(r.occupation):query.groupBy==="committee"?options.committees.find(c=>c.key===r.committee).name:r[query.groupBy];m.set(k,(m.get(k)||0)+r.amount);}out.rows=[...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10).map(([label,n])=>({label,amount:currency(n)}));}
 return out;
}
export {loadResearchRecords};
