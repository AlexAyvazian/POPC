import {chartSwatches,chartSequence,sequentialColors} from './chart-palette.js?v=claude1';
import {buildVisualData,groupedVisualData,radarData,dotData} from './donor-visual-data.js?v=readable1';
const NS='http://www.w3.org/2000/svg';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function svg(width,height,label){const n=node('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':label});n.append(node('title',{},label));return n;}
function text(s,x,y,value,attrs={}){s.append(node('text',{x,y,'font-size':11,fill:'#554b3f',...attrs},value));}
function mark(s,tag,attrs,label,readout,focus=true){const n=node(tag,{...attrs,...(focus?{tabindex:0,role:'button','aria-label':label}:{})});n.append(node('title',{},label));const inspect=()=>{readout.textContent=label;};n.addEventListener('pointerenter',inspect);n.addEventListener('focus',inspect);n.addEventListener('click',inspect);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}});s.append(n);return n;}
function legend(card,items,colors){const details=document.createElement('details');details.className='dv-legend';details.open=true;const summary=document.createElement('summary');summary.textContent='Sector key and exact values';const ul=document.createElement('ul');for(const item of items){const li=document.createElement('li'),swatch=document.createElement('span');swatch.className='dv-swatch';swatch.style.background=colors.get(item.name);const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>{card.querySelector('.dv-readout').textContent=item.label;});li.append(swatch,button);ul.append(li);}details.append(summary,ul);card.append(details);}
function card(host,kind,title,description){const f=document.createElement('figure');f.className='donor-visual-card';f.dataset.chart=kind;const cap=document.createElement('figcaption'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=description;cap.append(h,p);const plot=document.createElement('div');plot.className='dv-plot';const readout=document.createElement('p');readout.className='dv-readout';readout.setAttribute('aria-live','polite');readout.textContent='Tap, focus or hover over a mark for details.';f.append(cap,plot,readout);host.append(f);return {card:f,plot,readout};}
function empty(target,message){target.plot.textContent=message;target.readout.textContent='';}
function horizontalBars(target,items,colors,label,format,domain){
 const w=600,h=items.length*48+28,left=12,right=12,span=w-left-right;
 const min=domain?.[0]??Math.min(0,...items.map(d=>d.value)),max=domain?.[1]??Math.max(0,...items.map(d=>d.value)),range=max-min||1;
 const x=v=>left+(v-min)/range*span,s=svg(w,h,label);
 s.append(node('line',{x1:x(0),x2:x(0),y1:22,y2:h-6,stroke:'#b69b79','stroke-width':1}));
 items.forEach((d,i)=>{
  const y=i*48+8;
  text(s,left,y+12,d.name,{'font-size':13,'font-weight':600});
  text(s,w-right,y+12,format(d.value),{'font-size':13,'text-anchor':'end'});
  const bar=mark(s,'rect',{x:Math.min(x(0),x(d.value)),y:y+19,width:Math.abs(x(d.value)-x(0)),height:15,fill:colors.get(d.sector||d.name),'data-bar-value':d.value},d.label,target.readout);
 });
 target.plot.append(s);
}
function sectorBars(target,model){
 const data=radarData(model).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
 if(!model.total||data.some(d=>d.share<0||d.share>1)||model.total<0){empty(target,'Sector percentages require a positive total and nonnegative sector amounts.');return;}
 const colors=sequentialColors(data.map(d=>d.name));
 horizontalBars(target,data.map(d=>({...d,name:d.name.length>48?d.name.slice(0,47)+'…':d.name,sector:d.name,value:d.share,label:`${d.name}: ${(d.share*100).toFixed(2)}% · ${money(d.amount)}`})),colors,'Bar graph: sector shares of net contributions',v=>(v*100).toFixed(1)+'%',[0,1]);
}
function donorBars(target,model){
 if(!model.sectors.length){empty(target,'No donors in this selection.');return;}
 const control=document.createElement('label');control.className='dv-sector-control';control.textContent='Inspect a sector ';
 const select=document.createElement('select');select.setAttribute('aria-label','Donor bar graph sector');select.add(new Option('All sectors',''));
 for(const sector of model.sectors)select.add(new Option(sector.name,sector.name));control.append(select);target.plot.before(control);
 const pager=document.createElement('div'),previous=document.createElement('button'),next=document.createElement('button'),status=document.createElement('span');
 pager.className='dv-donor-pages';previous.type=next.type='button';previous.textContent='Previous donors';next.textContent='Next donors';status.setAttribute('role','status');pager.append(previous,status,next);target.plot.after(pager);
 const colors=sequentialColors(model.sectors.map(s=>s.name));let page=0;
 function draw(){
  const selected=select.value?model.sectors.filter(s=>s.name===select.value):model.sectors;
  const leaves=selected.flatMap(s=>s.leaves.map(l=>({...l,sector:s.name,originalSector:l.sector}))).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name)||a.originalSector.localeCompare(b.originalSector));
  const domain=leaves.reduce(([min,max],d)=>[Math.min(min,d.amount),Math.max(max,d.amount)],[0,0]);
  const start=page*20;target.plot.replaceChildren();target.plot.dataset.donorBarCount=leaves.length;
  if(!leaves.length){empty(target,'No donors in this selection.');}else{
   const rows=leaves.slice(start,start+20).map(d=>({...d,value:d.amount,name:d.name.length>48?d.name.slice(0,47)+'…':d.name,label:`${d.name} · ${d.originalSector}: ${money(d.amount)}`}));
   horizontalBars(target,rows,colors,'Bar graph: signed net donor allocations',money,domain);
  }
  status.textContent=leaves.length?`${start+1}–${Math.min(start+20,leaves.length)} of ${leaves.length.toLocaleString()} donor allocations`:'0 donor allocations';previous.disabled=page===0;next.disabled=start+20>=leaves.length;
 }
 previous.addEventListener('click',()=>{page--;draw();});next.addEventListener('click',()=>{page++;draw();});select.addEventListener('change',()=>{page=0;draw();});draw();
}
function bubbles(target,model,w){
 const data=[...model.sectors].sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
 if(!data.length){empty(target,'No sector contributions in this selection.');return;}
 const colors=sequentialColors(data.map(d=>d.name));
 const maxAbs=Math.max(1,...data.map(d=>Math.abs(d.amount)));
 const cols=Math.max(2,Math.min(4,Math.ceil(Math.sqrt(data.length))));
 const cellW=w/cols,maxR=Math.min(54,cellW*.34),rowH=maxR*2+58,rows=Math.ceil(data.length/cols),h=rows*rowH+8;
 const s=svg(w,h,'Bubble chart: total contribution dollars by sector');
 data.forEach((d,i)=>{
  const col=i%cols,row=Math.floor(i/cols),cx=(col+.5)*cellW,cy=row*rowH+maxR+8;
  const radius=Math.sqrt(Math.abs(d.amount)/maxAbs)*maxR;
  const label=`${d.name}: ${money(d.amount)} in net contributions`;
  mark(s,'circle',{cx,cy,r:radius,'data-bubble-dollars':d.amount,fill:colors.get(d.name),'fill-opacity':1,stroke:d.amount<0?chartSwatches.red6:chartSwatches.blue6,'stroke-width':1},label,target.readout,radius>=5);
  const display=d.name.length>24?d.name.slice(0,23)+'…':d.name;
  text(s,cx,cy+maxR+20,display,{'text-anchor':'middle','font-size':11,'font-weight':600});
  text(s,cx,cy+maxR+36,money(d.amount),{'text-anchor':'middle','font-size':11});
 });
 target.plot.append(s);
 legend(target.card,data.map(d=>({name:d.name,label:`${d.name} · ${money(d.amount)}`})),colors);
}
function matrix(target,model,w){
 const dots=dotData(model);
 if(!dots.length){empty(target,'No donors in this selection.');return;}
 const dotPalette=chartSequence.filter(color=>color!==chartSwatches.blue1&&color!==chartSwatches.green1);
 const colors=new Map([...new Set(dots.map(d=>d.sector))].map((name,index)=>[name,dotPalette[index%dotPalette.length]]));
 const columns=Math.max(1,Math.ceil(Math.sqrt(dots.length*(w-24)/300)));
 const step=Math.min(16,(w-24)/columns),rows=Math.ceil(dots.length/columns);
 const s=svg(w,rows*step+24,'Dot matrix: one circle per consolidated donor');
 const first=new Set(), labels=new WeakMap();
 dots.forEach((d,i)=>{
  const attrs={cx:12+(i%columns+.5)*step,cy:12+(Math.floor(i/columns)+.5)*step,r:step*.4,fill:colors.get(d.sector),'data-donor-count':1};
  const label=d.name+' · '+d.sector+' · '+money(d.amount);
  if(!first.has(d.sector)){attrs.tabindex=0;attrs['aria-label']=label;first.add(d.sector);}
  const circle=node('circle',attrs);labels.set(circle,label);s.append(circle);
 });
 const inspect=e=>{if(labels.has(e.target))target.readout.textContent=labels.get(e.target);};
 for(const event of ['pointerover','focusin','click'])s.addEventListener(event,inspect);
 target.plot.append(s);
 legend(target.card,model.sectors.filter(d=>d.primaryDonors).map(d=>({name:d.name,label:d.name+' · '+d.primaryDonors.toLocaleString()+' donors'})),colors);
}
export function mountDonorVisuals(host){
 let detailedModel=null,model=null,width=0,detail='groups';host.className='donor-visuals';
 function render(){if(!model)return;host.replaceChildren();host.dataset.groups=model.groups;host.dataset.totalCents=model.total;
  const summary=document.createElement('p');summary.className='dv-scope';summary.textContent=`${model.groups.toLocaleString()} donors · ${money(model.total)} · all matching donors`;host.append(summary);
  const control=document.createElement('label');control.className='dv-detail-control';control.textContent='Sector detail for donor bars, bubbles and dots ';
  const select=document.createElement('select');select.setAttribute('aria-label','Chart sector detail');select.add(new Option('Sector groups','groups'));select.add(new Option('Detailed sectors','sectors'));select.value=detail;control.append(select);host.append(control);host.dataset.sectorDetail=detail;
  select.addEventListener('change',()=>{detail=select.value;model=detail==='groups'?groupedVisualData(detailedModel):detailedModel;render();});
  const grid=document.createElement('div');grid.className='dv-grid';host.append(grid);const w=Math.max(240,Math.floor((width||host.clientWidth||600)-(width>=760?44:0))/(width>=760?2:1));
  const specs=[['sector-bars','Sector share bar graph','Share of net contributions across the same sector groups on every tab.',sectorBars],['donor-bars','Donor contribution bar graph','Signed net dollars for every named donor allocation, with sector filtering and pagination.',donorBars],['bubble','Sector donation bubbles','Each bubble is one sector. Bubble area represents that sector’s total net contribution dollars. Larger bubble = more money.',bubbles],['dot-matrix','Dot matrix','Each dot is one consolidated donor, colored by sector.',matrix]];
  for(const [kind,title,description,draw]of specs){const target=card(grid,kind,title,description);draw(target,model,Math.max(240,Math.floor(target.plot.clientWidth||w)));}
  if(model.adjustments<0){const p=document.createElement('p');p.className='dv-adjustments';p.textContent=`Signed adjustments: ${money(model.adjustments)}. Net table total: ${money(model.total)}. `;host.append(p);}
  host.dataset.ready='true';
 }
 const observer=new ResizeObserver(entries=>{const next=Math.floor(entries[0].contentRect.width);if(Math.abs(next-width)>2){width=next;render();}});observer.observe(host);
 return {update(groups){detailedModel=buildVisualData(groups);model=detail==='groups'?groupedVisualData(detailedModel):detailedModel;render();},disconnect(){observer.disconnect();}};
}
