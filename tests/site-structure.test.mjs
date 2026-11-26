import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as jeffries from '../assets/js/research-engine.js';
import * as schumer from '../assets/js/schumer-research-engine.js';

const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir){const out=[];for(const e of await fs.readdir(path.join(root,dir),{withFileTypes:true})){const p=path.posix.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const publicFiles=['index.html',...await walk('pages'),...await walk('assets'),...await walk('data'),...await walk('documents')];
const known=new Set(publicFiles);
function localTarget(file,url){if(/^(https?:|data:|mailto:|#)/.test(url))return null;const p=decodeURIComponent(url.split(/[?#]/)[0]);return path.posix.normalize(p.startsWith('/')?p.slice(1):path.posix.join(path.posix.dirname(file),p));}
test('every local page link, image, script and stylesheet exists',async()=>{
 for(const file of publicFiles.filter(p=>p.endsWith('.html'))){const s=await fs.readFile(path.join(root,file),'utf8');for(const match of s.matchAll(/(?:href|src)=["']([^"']+)["']/g)){const target=localTarget(file,match[1]);if(target)assert(known.has(target),file+' references missing '+target);}}
});
test('all static module dependencies exist after relocation',async()=>{
 for(const file of publicFiles.filter(p=>p.endsWith('.js'))){const s=await fs.readFile(path.join(root,file),'utf8');for(const match of s.matchAll(/(?:from\s*|import\s*\()\s*["']([^"']+)["']/g)){if(!match[1].startsWith('.'))continue;assert(known.has(localTarget(file,match[1])),file+' imports missing '+match[1]);}}
});
test('legacy URLs redirect directly to existing files',async()=>{
 const s=await fs.readFile(path.join(root,'_redirects'),'utf8'),seen=new Set();
 for(const line of s.trim().split('\n')){const [from,to,status]=line.split(/\s+/);assert(!seen.has(from),'duplicate '+from);seen.add(from);assert.equal(status,'301');if(from.includes('*'))continue;assert(known.has(decodeURIComponent(to.slice(1))),'missing redirect target '+to);}
 for(const page of publicFiles.filter(p=>p.startsWith('pages/')&&p.endsWith('.html'))){assert(seen.has('/'+path.basename(page)));assert(seen.has('/'+path.basename(page,'.html')));}
});
test('both research engines keep their own totals and committee labels',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async p=>new Response(await fs.readFile(path.join(root,String(p).replace(/^\//,''))));
 try{
  for(const [engine,label] of [[jeffries,'All eight committees'],[schumer,'All three committees']]){
   const rows=await engine.loadResearchRecords(), result=engine.evaluate(rows,{});
   assert(result.heading.startsWith(label));assert(rows.length>0);
   assert.deepEqual(engine.localIntent('Total contributions'),{});
   assert.equal(engine.evaluate(rows,{type:'individual'}).records,rows.filter(r=>r.type==='individual').length.toLocaleString('en-US'));
  }
 }finally{globalThis.fetch=original;}
});
