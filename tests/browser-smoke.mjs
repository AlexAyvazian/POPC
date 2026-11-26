import {chromium} from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd(), rules=new Map((await fs.readFile('_redirects','utf8')).trim().split('\n').map(l=>l.split(/\s+/)));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname==='/api/letter'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({count:0,signatures:[],archive:[],ready:false,next:null,snapshot:0,sitekey:''}));return;}
 const red=rules.get(u.pathname);if(red){res.writeHead(301,{Location:red+u.search});res.end();return;}
 let p=decodeURIComponent(u.pathname).replace(/^\//,'')||'index.html';
 if(!path.extname(p))p+='.html';
 try{const data=await fs.readFile(path.join(root,p));res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{} )});
try{
 const pages=['index.html',...(await fs.readdir('pages')).filter(p=>p.endsWith('.html')).map(p=>'pages/'+p)];
 for(const file of pages){
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto(base+'/'+file,{waitUntil:'networkidle'});
  await page.waitForTimeout(300);
  assert.deepEqual(errors,[],file);
  if(await page.locator('[data-donor-tables]').count()){
   await page.waitForSelector('[data-donor-tables][data-ready="true"]',{timeout:60000});
   assert.equal(await page.locator('[data-donor-group]').count(),3,file+' requires three donor tables');
   const host=page.locator('[data-donor-tables]');
   assert.equal(await host.locator('table').count(),3);
   for(const key of ['indirect','small']){
    const section=host.locator('[data-donor-group='+key+']');
    assert((await section.locator('thead').innerText()).includes('Reported employer'));
   }
   const small=host.locator('[data-donor-group=small]');
   await small.locator('input').fill('ZZZ no matching donor ZZZ');
   assert((await small.locator('tbody').innerText()).includes('No matching donors'));
   await small.locator('input').fill('');
   const receipt=host.locator('tbody details').first();
   if(await receipt.count()){await receipt.locator('summary').click();assert(await receipt.locator('p').count()>0);}
  }
  const text=await page.locator('body').innerText();
  assert(!text.includes('Unable to load the contribution tables'),file+' failed loading');
  if(['jbpf','jcvf'].some(k=>file.includes(k==='jbpf'?'battleground':'clark-victory'))){
   assert(await page.locator('#jvf-individuals tbody tr').count()>0,file+' missing donor rows');
   assert.equal(await page.locator('#jvf-status').count(),0);
  }
  if(file==='index.html'||file==='pages/schumer-transactions.html'){
   await page.locator('.popc-ai-launcher').click();
   await page.getByRole('button',{name:'Total contributions',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('.popc-ai-state')?.textContent==='Answer ready',{},{timeout:60000});
   assert((await page.locator('.popc-ai-messages').innerText()).includes(file==='index.html'?'All eight committees':'All three committees'));
  }
  console.log('PASS browser '+file);
  await page.close();
 }
 for(const file of pages.filter(p=>p.startsWith('pages/'))){
  for(const old of [path.basename(file),path.basename(file,'.html')]){
   const r=await fetch(base+'/'+old);assert(r.ok,old);assert(r.url.includes('/pages/'),old);
  }
 }
 console.log('PASS legacy page URLs');
}finally{await browser.close();await new Promise(r=>server.close(r));}
