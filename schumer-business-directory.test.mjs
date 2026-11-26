import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {schumerIdentities} from './schumer-identities.js';
import {businessIdentities} from './business-identities.js';

const normalize=s=>String(s??'').trim().replace(/\s+/g,' ').toUpperCase();
function parseCSV(text){const rows=[];let row=[],cell='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')q=false;else cell+=c;}else if(c==='"')q=true;else if(c===','){row.push(cell);cell='';}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}if(cell.length||row.length){row.push(cell);rows.push(row);}const h=rows[0].map(x=>x.replace(/^\uFEFF/,''));return rows.slice(1).filter(r=>r.length>1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));}

test('completed Schumer research CSV is fully represented',async()=>{const csv=parseCSV(await fs.readFile(new URL('./spreadsheets/schumer_remaining_entity_research_COMPLETED.csv',import.meta.url),'utf8'));assert.equal(csv.length,379);for(const row of csv){const reported=normalize(row['Reported Name']);const matches=schumerIdentities.filter(e=>(e.aliases||[]).some(a=>normalize(a)===reported));assert.equal(matches.length,1,'mapping for '+row['Reported Name']);assert.equal(matches[0].status,row['Match Result']==='Reviewed Label'?'Reviewed label':'Source-backed','status for '+row['Reported Name']);}});
test('Schumer identity completion counts are stable',()=>{const counts=schumerIdentities.reduce((m,e)=>(m[e.status]=(m[e.status]||0)+1,m),{});assert.equal(schumerIdentities.length,425);assert.equal(counts['Source-backed'],413);assert.equal(counts['Reviewed label'],12);assert.equal(counts['Unresolved']||0,0);});
test('global plus Schumer aliases have no duplicate runtime keys',()=>{const seen=new Map();for(const entry of [...businessIdentities,...schumerIdentities]){const types=entry.recordTypes?.length?entry.recordTypes:['*'];const aliases=[...(entry.aliases||[]),...(entry.name&&!entry.aliasOnly?[entry.name]:[])];for(const alias of aliases)for(const type of types){const key=type+'|'+normalize(alias);assert(!seen.has(key)||seen.get(key)===entry,'duplicate researched alias: '+key);seen.set(key,entry);}}});
