import fs from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import * as jeffries from '../assets/js/research-data.js?v=refined1';
import * as schumer from '../assets/js/schumer-research-data.js?v=refined1';
import * as jidentity from '../assets/js/business-directory-data.js?v=refined1';
import * as sidentity from '../assets/js/schumer-business-directory-data.js?v=refined1';
import {groupDonors} from '../assets/js/donor-groups.js?v=refined1';
import {businessIdentities} from '../data/jeffries/business-identities.js?v=refined1';
import {schumerIdentities} from '../data/schumer/schumer-identities.js?v=refined1';
globalThis.fetch=async url=>new Response(await fs.readFile(path.resolve(String(url).split('?')[0].replace(/^\//,''))));
const read=async p=>JSON.parse(await fs.readFile(p.replace(/^\//,''),'utf8'));
const normalized=s=>String(s||'').trim().replace(/\s+/g,' ').toUpperCase();
const result={networks:{},identities:[...businessIdentities,...schumerIdentities]};
for(const [network,data,identity]of [['jeffries',jeffries,jidentity],['schumer',schumer,sidentity]]){
 const direct=await data.loadResearchRecords(), grouped=groupDonors(direct,identity.identifyName), donors=Object.entries(grouped).flatMap(([table,groups])=>groups.map(g=>({table,name:g.name,type:g.type,amount:g.amount,count:g.records.length,committees:Object.fromEntries(g.committees),reportedNames:[...g.reportedNames]})));
 const nameIndex=new Map(donors.flatMap(d=>d.reportedNames.map(n=>[d.type+'|'+normalized(n),d.name])));
 const rows=[];
 for(const c of data.config){
  let records=[];
  if(network==='schumer'){
   for(const r of await read('data/schumer/'+c.key+'.json'))records.push({name:r[0],employer:r[1],occupation:r[2],date:r[3],amount:r[4],memo:r[5],note:r[6],image:r[7],entity:r[8],filing:r[9],transaction:r[10],line:r[11],receiptType:r[12],contributorId:r[13],backReference:r[14],conduit:r[15],subId:r[16],receiptDescription:r[17],type:r[8]==='IND'?'individual':'organization',category:schumer.category(r)});
  }else if(c.key==='jcavf'){records=direct.filter(r=>r.committee===c.key).map(r=>({...r,category:r.type}));}
  else{
   let org=[],ind=[];
   if(c.key==='jfc'){
    const manifest=await read('data/jeffries/jfc-manifest.json');
    for(const [kind,group]of Object.entries(manifest.groups)){
     if(kind==='employers')continue;
     const blocks=(await Promise.all(group.paths.map(read))).flat();
     const unpacked=blocks.flatMap(([count,encoded])=>{const decoded=JSON.parse(gunzipSync(Buffer.from(encoded,'base64')));if(decoded.length!==count)throw Error('Chunk count');return decoded;});
     if(unpacked.length!==group.count)throw Error('Group count');
     (kind.startsWith('organization')?org:ind).push(...unpacked);
    }
   }else{
    const paths=(kind,n)=>n?Array.from({length:n},(_,i)=>'data/jeffries/'+c.key+'-'+kind+'-'+(i+1)+'.json'):['data/jeffries/'+c.key+'-'+kind+'.json'];
    org=(await Promise.all(paths('organizations',c.no).map(read))).flat();ind=(await Promise.all(paths('individuals',c.ni).map(read))).flat();
   }
   records=[...org.map(r=>({name:r[0],date:r[2],amount:r[3],memo:r[4],note:r[5],image:r[6],form:r[7],entity:r[8],type:'organization',category:r[4]?'memo':'organization'})),...ind.map(r=>({name:r[0],employer:r[1],occupation:r[2],date:r[3],amount:r[4],memo:r[5],note:r[6],image:r[7],type:'individual',category:r[5]?'memo':'individual'}))];
  }
  for(const r of records){
   delete r.sector;
   const d=r.category==='individual'||r.category==='organization'?nameIndex.get(r.type+'|'+normalized(r.name)):null;
   if(!r.memo&&r.category!=='other'&&!d)throw Error('Unmatched direct receipt '+r.name);
   rows.push({...r,committee:c.key,donor:d||null});
  }
 }
 if(rows.filter(r=>!r.memo&&r.category!=='other').length!==direct.length)throw Error('Direct count differs');
 result.networks[network]={config:data.config,donors,records:rows};
}
await fs.writeFile('/tmp/popc-legacy.json',JSON.stringify(result));
console.log(JSON.stringify(Object.fromEntries(Object.entries(result.networks).map(([n,v])=>[n,{donors:v.donors.length,records:v.records.length}]))));
