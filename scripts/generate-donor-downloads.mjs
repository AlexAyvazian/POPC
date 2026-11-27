import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

export const tableNames={organizations:'PACs & Organizations',indirect:'Indirect Donors',small:'Small Donors'};
const clean=value=>String(value??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
const joined=values=>[...new Set(values||[])].filter(Boolean).sort().map(clean).join('; ');
export function donorSheet(groups,config,key){
 const headers=['Donor / organization','Total donated (USD)','Sector(s)','Employer(s)','Reported employer(s)','Reported occupation(s)','Reported donor name(s)','Business identity / research status','Parent / related organization','Research scope','Research evidence','Research sources','Receipt count','First receipt','Last receipt',...config.map(c=>c.name+' (USD)')];
 const rows=groups.map(g=>{
  const identities=[...g.businessResearch.values()],research=identities.filter(i=>i.research),dates=g.records.map(r=>r.date).filter(Boolean).sort();
  return [clean(g.name),g.amount/100,joined(g.sectors),joined(g.employers),joined(g.reportedEmployers),joined(g.occupations),joined(g.reportedNames),
   identities.map(i=>clean(i.name)+' · '+(i.research?.status||'Not reviewed')).join('\n'),
   joined(research.map(i=>i.research.parent)),
   research.map(i=>clean(i.name)+': '+clean(i.research.scope)).join('\n'),
   research.map(i=>clean(i.name)+': '+clean(i.research.evidence)+(i.research.sectorEvidence?'\nSector: '+clean(i.research.sectorEvidence):'')).join('\n'),
   joined(research.flatMap(i=>i.research.sources||[])),g.records.length,dates[0]||'',dates.at(-1)||'',...config.map(c=>(g.committees.get(c.key)||0)/100)];
 });
 return {key,name:tableNames[key],headers,rows,moneyColumns:[1,...config.map((_,i)=>15+i)],widths:[38,22,34,40,40,34,40,52,40,55,80,72,16,18,18,...config.map(()=>26)],totalCents:groups.reduce((n,g)=>n+g.amount,0),donors:groups.length,receiptCount:groups.reduce((n,g)=>n+g.records.length,0)};
}
export function csvText(sheet){
 const numeric=new Set(sheet.moneyColumns),cell=(value,column)=>{
  let s=numeric.has(column)&&typeof value==='number'?value.toFixed(2):String(value??'');
  if(typeof value==='string'&&/^[\s]*[=+\-@]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
 };
 return '\ufeff'+[sheet.headers,...sheet.rows].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
export function receiptSheet(groups,config){
 const names=new Map(config.map(c=>[c.key,c.name])),rows=[];
 for(const [key,items]of Object.entries(groups))for(const g of items)for(const r of g.records){
  if(r.memo)throw Error('Memo record reached the direct-receipt export');
  rows.push([tableNames[key],clean(g.name),clean(r.name),clean(r.date),r.amount/100,names.get(r.committee)||r.committee,clean(r.employer),clean(r.occupation),clean(r.sector),/^\d{15,20}$/.test(String(r.image))?'https://docquery.fec.gov/cgi-bin/fecimg/?'+r.image:'',clean(r.filing),clean(r.transaction)]);
 }
 return {name:'Receipts',headers:['Donor table','Consolidated donor / organization','Reported donor','Date','Amount (USD)','Receiving committee','Reported employer','Reported occupation','Sector','FEC filing','FEC report ID','FEC transaction ID'],rows,moneyColumns:[4],widths:[28,40,40,18,22,40,42,38,36,70,24,28]};
}
export async function generate(){
 const root=fileURLToPath(new URL('../',import.meta.url)),output=path.join(root,'data/downloads'),temporary=await fs.mkdtemp(path.join(os.tmpdir(),'popc-donor-downloads-'));
 globalThis.fetch=async url=>{
  const pathname=String(url).split('?')[0];
  if(!pathname.startsWith('/data/')||pathname.includes('..'))throw Error('Unexpected data path: '+url);
  return new Response(await fs.readFile(path.join(root,pathname.slice(1))));
 };
 const {groupDonors}=await import('../assets/js/donor-groups.js?v=categories1');
 await fs.mkdir(output,{recursive:true});
 const manifest={schemaVersion:1,sourceCommit:process.env.GITHUB_SHA||'',networks:{}};
 try{
  for(const network of ['jeffries','schumer']){
   const prefix=network==='schumer'?'schumer-':'',data=await import('../assets/js/'+prefix+'research-data.js?v=categories1'),identities=await import('../assets/js/'+prefix+'business-directory-data.js?v=categories1');
   const records=await data.loadResearchRecords(),groups=groupDonors(records,identities.identifyName),sheets=Object.entries(groups).map(([key,items])=>donorSheet(items,data.config,key));
   const totalCents=data.config.reduce((n,c)=>n+c.individual+c.organization,0),receiptCount=data.config.reduce((n,c)=>n+c.individualCount+c.organizationCount,0);
   if(sheets.reduce((n,s)=>n+s.totalCents,0)!==totalCents||sheets.reduce((n,s)=>n+s.receiptCount,0)!==receiptCount)throw Error(network+' exports do not reconcile');
   const payload={network,label:network==='jeffries'?'Hakeem Jeffries network':'Chuck Schumer network',sourceCommit:manifest.sourceCommit,totalCents,receiptCount,sheets,receipts:receiptSheet(groups,data.config)};
   const payloadPath=path.join(temporary,network+'.json');await fs.writeFile(payloadPath,JSON.stringify(payload));
   for(const sheet of sheets)await fs.writeFile(path.join(output,network+'-'+sheet.key+'.csv'),csvText(sheet),'utf8');
   const result=spawnSync('python',['scripts/write-donor-workbook.py',payloadPath,path.join(output,network+'-combined-donors.xlsx')],{cwd:root,encoding:'utf8',maxBuffer:1024*1024});
   if(result.status!==0)throw Error(result.stderr||result.stdout||'Workbook generation failed');
   console.log(result.stdout.trim());
   manifest.networks[network]={totalCents,receiptCount,workbook:network+'-combined-donors.xlsx',tables:sheets.map(s=>({key:s.key,name:s.name,donors:s.donors,totalCents:s.totalCents,receiptCount:s.receiptCount,csv:network+'-'+s.key+'.csv'}))};
  }
  const paths=(await fs.readdir(output)).filter(p=>/\.(xlsx|csv)$/.test(p)).sort();
  manifest.files=[];
  for(const name of paths){const buffer=await fs.readFile(path.join(output,name));if(buffer.length>24*1024*1024)throw Error('Download exceeds the site file limit: '+name);manifest.files.push({name,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});}
  if(manifest.files.length!==8)throw Error('Expected two workbooks and six CSVs');
  await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify(manifest));
 }finally{await fs.rm(temporary,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await generate();
