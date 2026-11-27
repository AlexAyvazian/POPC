import {approvedChartColors,chartSequence} from '../assets/js/chart-palette.js';
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
  if(/(?:^|[-/])transactions\.html$/.test(file))assert.equal(await page.locator('[data-donor-tables],[data-donor-visuals]').count(),0);
  if(await page.locator('[data-donor-tables]').count()){
   await page.waitForSelector('[data-donor-tables][data-ready="true"]',{timeout:60000});
   assert.equal(await page.locator('[data-donor-group]').count(),3,file+' requires three donor tables');
   const host=page.locator('[data-donor-tables]');
   assert.equal(await host.locator('table').count(),3);
   assert.equal(await host.locator('[data-chart]').count(),12,file+' needs four visuals before each of three tables');
   for(const section of await host.locator('[data-donor-group]').all()){
    assert.equal(await section.locator('[data-chart]').count(),4);
    for(const chart of await section.locator('[data-chart]').all()){
     const colors=await chart.locator('.dv-swatch').evaluateAll(nodes=>nodes.map(n=>n.style.background));
     const expected=await page.evaluate(hex=>hex.map(color=>{const e=document.createElement('span');e.style.background=color;return e.style.background;}),Array.from({length:colors.length},(_,i)=>chartSequence[i%chartSequence.length]));
     assert.deepEqual(colors,expected,'chart uses the palette consecutively from Blue 1');
    }

    const packed=section.locator('[data-chart=circle-packing]');
    const plot=packed.locator('.dv-plot');
    if(await plot.getAttribute('data-packed-leaves')){
     const allLeaves=Number(await plot.getAttribute('data-packed-leaves'));
     assert.equal(await packed.locator('[data-packed-node=donor]').count(),allLeaves,'every packed donor is rendered');
     const options=await packed.locator('select option').evaluateAll(nodes=>nodes.map(n=>n.value));
     if(options.length>1){
      await packed.locator('select').selectOption(options[1]);
      assert(Number(await plot.getAttribute('data-packed-leaves'))<=allLeaves);
      await packed.locator('.dv-donors summary').click();
      assert(await packed.locator('.dv-donors li button').count()>0);
      await packed.locator('.dv-donors li button').first().focus();
      await page.keyboard.press('Enter');
      assert((await packed.locator('.dv-readout').innerText()).includes('$'));
      await packed.locator('.dv-donors summary').click();
      await packed.locator('select').selectOption('');
      assert.equal(Number(await plot.getAttribute('data-packed-leaves')),allLeaves);
     }
    }
    assert(!/Other sectors|Other [\d,]+ donors/.test(await section.locator('[data-donor-visuals]').innerText()),'no synthetic Other buckets');

    const marks=await section.locator('[data-chart] svg circle,[data-chart] svg polygon,[data-chart] svg path').evaluateAll(nodes=>nodes.map(n=>({fill:n.getAttribute('fill'),opacity:n.getAttribute('fill-opacity')})));
    for(const mark of marks){if(mark.fill&&!['none','#fff'].includes(mark.fill))assert(approvedChartColors.includes(mark.fill),'selected swatch only: '+mark.fill);if(mark.opacity!==null)assert.equal(Number(mark.opacity),1);}
    const before=await section.evaluate(el=>Boolean(el.querySelector('[data-donor-visuals]').compareDocumentPosition(el.querySelector('table')) & Node.DOCUMENT_POSITION_FOLLOWING));assert(before);
    const visual=section.locator('[data-donor-visuals]');
    assert.equal(await visual.getAttribute('data-sector-detail'),'groups');
    const overflow=await section.locator('.jvf-table-wrap').evaluate(el=>el.scrollWidth>el.clientWidth+2);
    assert.equal(overflow,false,file+' table fits without hidden amount columns');
    for(const cell of await section.locator('tbody tr:first-child td').all()){
     const inside=await cell.evaluate(el=>{const frame=el.closest('.jvf-table-wrap').getBoundingClientRect(),r=el.getBoundingClientRect();return r.left>=frame.left-2&&r.right<=frame.right+2;});
     assert(inside,file+' keeps every column in view');
    }
    const dots=await visual.locator('[data-donor-count]').evaluateAll(nodes=>nodes.reduce((n,d)=>n+Number(d.dataset.donorCount),0));
    assert.equal(dots,Number(await visual.getAttribute('data-groups')));
    assert.equal(await visual.locator('[data-donor-count="1"]').count(),dots);
    const bubbleAreas=await visual.locator('[data-bubble-donors]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('r'))**2/Number(n.dataset.bubbleDonors)));
    if(bubbleAreas.length)assert(bubbleAreas.every(v=>Math.abs(v-bubbleAreas[0])<1e-8),'bubble area scales with donor count');
   }
   if(!await host.getAttribute('data-committee')){
    const network=await host.getAttribute('data-network');
    const workbook=host.locator('[data-workbook-download]');
    assert.equal(await workbook.count(),1);
    const [excelDownload]=await Promise.all([page.waitForEvent('download'),workbook.click()]);
    assert.equal(await excelDownload.failure(),null);
    assert.equal(excelDownload.suggestedFilename(),network+'-combined-donors.xlsx');
    const excel=await fs.readFile(await excelDownload.path());assert.equal(excel.subarray(0,4).toString('hex'),'504b0304');
    for(const section of await host.locator('[data-donor-group]').all()){
     const key=await section.getAttribute('data-donor-group'),link=section.locator('[data-table-download]');
     assert.equal(await link.count(),1);
     const [csvDownload]=await Promise.all([page.waitForEvent('download'),link.click()]);
     assert.equal(await csvDownload.failure(),null);
     assert.equal(csvDownload.suggestedFilename(),network+'-'+key+'.csv');
     const csv=await fs.readFile(await csvDownload.path(),'utf8');assert(csv.startsWith('\ufeff"Donor / organization","Total donated (USD)"'));
    }
   }
   assert.equal(await host.locator('thead').first().locator('th').count(),4,'organization table uses four readable columns');
   for(const key of ['indirect','small']){
    const section=host.locator('[data-donor-group='+key+']');
    assert((await section.locator('thead').innerText()).includes('Reported employer'));
   }
   assert(!/review flag|confidence/i.test(await host.locator('thead').allInnerTexts().then(v=>v.join(' '))));
   if(file==='pages/combined-contributions.html'||file==='pages/schumer-combined-contributions.html'){
    const organizations=host.locator('[data-donor-group=organizations]');
    await organizations.locator('input').fill('HONEYWELL');
    assert((await organizations.locator('tbody').innerText()).includes('Defense & Aerospace Contractors'));
    assert((await organizations.locator('tbody').innerText()).includes('Defense & Aerospace'));
    await organizations.locator('input').fill('');
   }
   const small=host.locator('[data-donor-group=small]');
   await small.locator('input').fill('ZZZ no matching donor ZZZ');
   assert((await small.locator('tbody').innerText()).includes('No matching donors'));
   assert.equal(await small.locator('[data-donor-visuals]').getAttribute('data-groups'),'0');
   await small.locator('input').fill('');
   const receipt=host.locator('tbody tr td:last-child details').first();
   if(await receipt.count()){await receipt.locator('summary').click();await receipt.locator('p').first().waitFor({state:'visible'});}
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
   const answer=await page.locator('.popc-ai-messages').innerText();assert(answer.includes(file==='index.html'?'All eight committees':'All three committees'),file+': '+answer);
  }
  if(file==='pages/combined-contributions.html'){
   const storyBeforeTables=await page.evaluate(()=>Boolean(document.querySelector('#funding-title').compareDocumentPosition(document.querySelector('[data-donor-tables]')) & Node.DOCUMENT_POSITION_FOLLOWING));assert(storyBeforeTables,'funding overview precedes long donor tables');
   const charts=page.locator('[data-donor-visuals]').first(),originalTotal=await charts.getAttribute('data-total-cents');
   await charts.locator('.dv-detail-control select').selectOption('sectors');assert.equal(await charts.getAttribute('data-sector-detail'),'sectors');assert.equal(await charts.getAttribute('data-total-cents'),originalTotal);
   await charts.locator('.dv-detail-control select').selectOption('groups');assert.equal(await charts.getAttribute('data-total-cents'),originalTotal);
   await page.setViewportSize({width:390,height:844});
   await page.waitForTimeout(150);
   assert(await page.locator('[data-donor-visuals]').first().evaluate(el=>el.scrollWidth<=el.clientWidth+2),'charts fit mobile width');
   assert(await page.locator('[data-donor-tables]').evaluate(el=>el.scrollWidth<=el.clientWidth+2),'tables fit mobile width');
   for(const table of await page.locator('[data-donor-tables] table').all())assert(await table.evaluate(el=>getComputedStyle(el).display==='block'),'mobile rows use readable cards');
   await page.locator('[data-chart=bubble] [tabindex]').first().focus();
   assert(!(await page.locator('[data-chart=bubble] .dv-readout').first().innerText()).startsWith('Tap, focus'));
  }
  assert.deepEqual(errors,[],file+' finished without chart errors');
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
