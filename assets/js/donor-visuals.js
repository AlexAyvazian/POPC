import {chartSwatches,sequentialColors} from './chart-palette.js?v=categories1';
import {hierarchy,pack} from './vendor/d3-hierarchy.js';
import {buildVisualData,radarData,packingData,dotData} from './donor-visual-data.js?v=categories1';
const NS='http://www.w3.org/2000/svg';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const shortMoney=n=>'$'+compact(n/100);
function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function svg(width,height,label){const n=node('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':label});n.append(node('title',{},label));return n;}
function text(s,x,y,value,attrs={}){s.append(node('text',{x,y,'font-size':11,fill:'#554b3f',...attrs},value));}
function mark(s,tag,attrs,label,readout,focus=true){const n=node(tag,{...attrs,...(focus?{tabindex:0,role:'button','aria-label':label}:{})});n.append(node('title',{},label));const inspect=()=>{readout.textContent=label;};n.addEventListener('pointerenter',inspect);n.addEventListener('focus',inspect);n.addEventListener('click',inspect);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}});s.append(n);return n;}
function legend(card,items,colors){const details=document.createElement('details');details.className='dv-legend';const summary=document.createElement('summary');summary.textContent='Sector key and exact values';const ul=document.createElement('ul');for(const item of items){const li=document.createElement('li'),swatch=document.createElement('span');swatch.className='dv-swatch';swatch.style.background=colors.get(item.name);const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>{card.querySelector('.dv-readout').textContent=item.label;});li.append(swatch,button);ul.append(li);}details.append(summary,ul);card.append(details);}
function card(host,kind,title,description){const f=document.createElement('figure');f.className='donor-visual-card';f.dataset.chart=kind;const cap=document.createElement('figcaption'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=description;cap.append(h,p);const plot=document.createElement('div');plot.className='dv-plot';const readout=document.createElement('p');readout.className='dv-readout';readout.setAttribute('aria-live','polite');readout.textContent='Tap, focus or hover over a mark for details.';f.append(cap,plot,readout);host.append(f);return {card:f,plot,readout};}
function empty(target,message){target.plot.textContent=message;target.readout.textContent='';}
function radar(target,model,w){
 const data=radarData(model),colors=sequentialColors(data.map(d=>d.name));if(!data.length){empty(target,'No positive contribution amounts in this selection.');return;}
 const h=Math.min(330,w),cx=w/2,cy=h/2,r=Math.min(w,h)*.36,max=Math.max(.25,...data.map(d=>d.share));
 const axes=Math.max(3,data.length);
 const s=svg(w,h,'Radar chart: sector shares of positive net contributions'),point=(i,v)=>{const a=i/axes*Math.PI*2-Math.PI/2;return [cx+Math.cos(a)*r*v,cy+Math.sin(a)*r*v];};
 for(let level=1;level<=4;level++){s.append(node('polygon',{points:Array.from({length:axes},(_,i)=>point(i,level/4).join(',')).join(' '),fill:'none',stroke:'#e1d8ca','stroke-width':.75}));text(s,cx+4,cy-r*level/4+10,Math.round(max*level/4*100)+'%',{'font-size':10});}
 data.forEach((d,i)=>{const p=point(i,1),label=point(i,1.14);s.append(node('line',{x1:cx,y1:cy,x2:p[0],y2:p[1],stroke:'#ded5c7','stroke-width':.75}));text(s,label[0],label[1]+4,i+1,{'text-anchor':'middle','font-size':12,'font-weight':600});});
 s.append(node('polygon',{points:Array.from({length:axes},(_,i)=>point(i,(data[i]?.share||0)/max).join(',')).join(' '),fill:chartSwatches.blue1,'fill-opacity':1,stroke:chartSwatches.blue6,'stroke-width':2}));
 data.forEach((d,i)=>{const p=point(i,d.share/max);mark(s,'circle',{cx:p[0],cy:p[1],r:5,fill:colors.get(d.name),stroke:chartSwatches.blue6,'stroke-width':.7},`${d.name}: ${(d.share*100).toFixed(2)}% · ${money(d.amount)}`,target.readout);});target.plot.append(s);
 const key=document.createElement('ol');key.className='dv-radar-key';for(const d of data){const li=document.createElement('li');li.textContent=`${d.name} · ${(d.share*100).toFixed(1)}%`;key.append(li);}target.card.append(key);
}
function packing(target,model,w){
 const data=packingData(model);if(!data.children.length){empty(target,'No positive net donor amounts in this selection.');return;}
 data.children.sort((a,b)=>b.children.reduce((v,n)=>v+n.value,0)-a.children.reduce((v,n)=>v+n.value,0)||a.name.localeCompare(b.name));
 const control=document.createElement('label');control.className='dv-sector-control';control.textContent='Inspect a sector ';
 const select=document.createElement('select');select.setAttribute('aria-label','Circle packing sector');select.add(new Option('All sectors',''));
 for(const sector of data.children)select.add(new Option(sector.name,sector.name));control.append(select);target.plot.before(control);
 const details=document.createElement('details');details.className='dv-donors';const summary=document.createElement('summary'),list=document.createElement('ul'),pager=document.createElement('div'),previous=document.createElement('button'),next=document.createElement('button'),status=document.createElement('span');
 pager.className='dv-donor-pages';previous.type=next.type='button';previous.textContent='Previous donors';next.textContent='Next donors';status.setAttribute('role','status');pager.append(previous,status,next);details.append(summary,list,pager);target.card.append(details);
 let page=0,leaves=[];
 function donorList(){
  list.replaceChildren();const start=page*20;for(const donor of leaves.slice(start,start+20)){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=`${donor.name} · ${donor.sector} · ${money(donor.value)}`;button.addEventListener('click',()=>{target.readout.textContent=button.textContent;});li.append(button);list.append(li);}
  summary.textContent=`All ${leaves.length.toLocaleString()} named donor allocations`;
  status.textContent=`${start+1}–${Math.min(start+20,leaves.length)} of ${leaves.length.toLocaleString()}`;previous.disabled=page===0;next.disabled=start+20>=leaves.length;
 }
 previous.addEventListener('click',()=>{page--;donorList();});next.addEventListener('click',()=>{page++;donorList();});
 function draw(){
  target.plot.replaceChildren();target.card.querySelector('.dv-legend')?.remove();
  const selected=select.value?data.children.filter(d=>d.name===select.value):data.children;
  const h=Math.min(w,440),root=hierarchy({name:'All sectors',children:selected}).sum(d=>d.value||0).sort((a,b)=>b.value-a.value||a.data.name.localeCompare(b.data.name));pack().size([w,h]).padding(1)(root);
  const colors=sequentialColors(root.children.map(n=>n.data.name)),s=svg(w,h,'Circle packing: every named donor within the displayed sectors, sized by positive net dollars'),labels=new WeakMap();
  target.plot.dataset.packedLeaves=root.leaves().length;target.plot.dataset.packedCents=root.value;
  for(const n of root.descendants().slice(1)){
   const sector=n.depth===1?n.data.name:n.parent.data.name,label=n.children?`${sector}: ${money(n.value)}. Select to inspect sector.`:`${n.data.name} · ${sector}: ${money(n.value)}`,focus=n.depth===1||n.r>13;
   const circle=node('circle',{cx:n.x,cy:n.y,r:n.r,fill:n.children?'none':colors.get(sector),'fill-opacity':1,stroke:n.children?colors.get(sector):chartSwatches.blue6,'stroke-width':n.children?1:Math.min(.5,n.r/5),...(focus?{tabindex:0,role:'button','aria-label':label}:{}),'data-packed-node':n.children?'sector':'donor'});
   labels.set(circle,{label,sector:n.children?sector:null});s.append(circle);
   if(!n.children&&n.r>24){const maxChars=Math.max(3,Math.floor(n.r/3.6)),name=n.data.name.length>maxChars?n.data.name.slice(0,maxChars-1)+'…':n.data.name;text(s,n.x,n.y-2,name,{'text-anchor':'middle',fill:'#211b15',stroke:'#fffdf9','stroke-width':2,'paint-order':'stroke','font-size':11,'font-weight':600,'pointer-events':'none'});if(n.r>33)text(s,n.x,n.y+13,shortMoney(n.value),{'text-anchor':'middle',fill:'#211b15',stroke:'#fffdf9','stroke-width':2,'paint-order':'stroke','font-size':11,'pointer-events':'none'});}
  }
  const inspect=e=>{const datum=labels.get(e.target);if(datum)target.readout.textContent=datum.label;};
  const activate=e=>{const datum=labels.get(e.target);if(!datum)return;target.readout.textContent=datum.label;if(datum.sector){select.value=datum.sector;draw();select.focus();}};
  s.addEventListener('pointerover',inspect);s.addEventListener('focusin',inspect);s.addEventListener('click',activate);s.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(e);}});
  target.plot.append(s);legend(target.card,root.children.map(n=>({name:n.data.name,label:`${n.data.name} · ${money(n.value)}`})),colors);
  leaves=selected.flatMap(d=>d.children).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));page=0;donorList();
 }
 select.addEventListener('change',()=>{draw();target.readout.textContent=select.value?`Showing every named donor in ${select.value}.`:'Showing every named donor across all sectors.';});draw();
}
function bubbles(target,model,w){
 if(!model.sectors.length){empty(target,'No donors in this selection.');return;}
 const colors=sequentialColors(model.sectors.map(d=>d.name));
 const h=320,left=62,right=26,top=25,bottom=55,xMin=Math.min(0,...model.sectors.map(s=>s.amount)),xMax=Math.max(1,...model.sectors.map(s=>s.amount)),maxReceipts=Math.max(1,...model.sectors.map(s=>s.receipts)),maxDonors=Math.max(1,...model.sectors.map(s=>s.donorCount));
 const x=n=>left+(n-xMin)/(xMax-xMin)*(w-left-right),y=n=>h-bottom-Math.sqrt(n/maxReceipts)*(h-top-bottom),s=svg(w,h,'Bubble chart: sector dollars, receipt counts and donor counts');
 for(let i=0;i<4;i++){const value=xMin+(xMax-xMin)*i/3,xx=x(value);s.append(node('line',{x1:xx,x2:xx,y1:top,y2:h-bottom,stroke:'#e6dfd4','stroke-width':.75}));text(s,xx,h-bottom+18,shortMoney(value),{'text-anchor':'middle','font-size':10});const count=Math.round(maxReceipts*(i/3)**2),yy=y(count);if(i>0&&count===Math.round(maxReceipts*((i-1)/3)**2))continue;s.append(node('line',{x1:left,x2:w-right,y1:yy,y2:yy,stroke:'#e6dfd4','stroke-width':.75}));text(s,left-8,yy+4,compact(count),{'text-anchor':'end','font-size':10});}
 text(s,(left+w-right)/2,h-10,'Total contributions ($)',{'text-anchor':'middle','font-size':11});text(s,12,h/2,'Receipts (square-root scale)',{transform:`rotate(-90 12 ${h/2})`,'text-anchor':'middle','font-size':11});
 for(const d of model.sectors){const radius=Math.sqrt(d.donorCount/maxDonors)*22;mark(s,'circle',{cx:x(d.amount),cy:y(d.receipts),r:radius,'data-bubble-donors':d.donorCount,fill:colors.get(d.name),'fill-opacity':1,stroke:d.amount<0?chartSwatches.red6:chartSwatches.blue6,'stroke-width':1},`${d.name}: ${money(d.amount)} · ${d.receipts.toLocaleString()} receipts · ${d.donorCount.toLocaleString()} donors`,target.readout);}
 target.plot.append(s);legend(target.card,model.sectors.map(d=>({name:d.name,label:`${d.name} · ${money(d.amount)} · ${d.donorCount.toLocaleString()} donors`})),colors);
}
function matrix(target,model,w){
 const {unit,dots}=dotData(model),colors=sequentialColors(dots.map(d=>d.sector));if(!dots.length){empty(target,'No donors in this selection.');return;}
 const columns=Math.max(10,Math.floor((w-24)/16)),step=(w-24)/columns,h=Math.max(180,Math.ceil(dots.length/columns)*step+20),s=svg(w,h,`Dot matrix: ${model.groups} donors; each full dot represents ${unit} donors`),focusSectors=new Set();
 dots.forEach((d,i)=>{const cx=12+(i%columns+.5)*step,cy=12+(Math.floor(i/columns)+.5)*step,r=step*.36,label=`${d.sector}: this dot represents ${d.count} ${d.count===1?'donor':'donors'}`;let tag='circle',attrs={cx,cy,r,fill:colors.get(d.sector),stroke:chartSwatches.blue6,'stroke-width':.3};
  if(d.fraction<1){s.append(node('circle',{cx,cy,r,fill:'#fff',stroke:chartSwatches.blue6,'stroke-width':.3}));const a=d.fraction*2*Math.PI-Math.PI/2,ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r;tag='path';attrs={d:`M ${cx} ${cy} L ${cx} ${cy-r} A ${r} ${r} 0 ${d.fraction>.5?1:0} 1 ${ex} ${ey} Z`,fill:colors.get(d.sector),stroke:chartSwatches.blue6,'stroke-width':.3};}
  const first=!focusSectors.has(d.sector);focusSectors.add(d.sector);mark(s,tag,{...attrs,'data-donor-count':d.count},label,target.readout,first);
 });target.plot.append(s);const scale=document.createElement('p');scale.className='dv-scale';scale.textContent=`Each full dot = ${unit.toLocaleString()} ${unit===1?'donor':'donors'}. Partial dots show the exact remainder. Donors are assigned to their largest sector by contribution magnitude.`;target.card.append(scale);legend(target.card,model.sectors.filter(d=>d.primaryDonors).map(d=>({name:d.name,label:`${d.name} · ${d.primaryDonors.toLocaleString()} donors`})),colors);
}
export function mountDonorVisuals(host){
 let model=null,width=0;host.className='donor-visuals';
 function render(){if(!model)return;host.replaceChildren();host.dataset.groups=model.groups;host.dataset.totalCents=model.total;
  const summary=document.createElement('p');summary.className='dv-scope';summary.textContent=`${model.groups.toLocaleString()} donors · ${money(model.total)} · all matching rows across every table page`;host.append(summary);
  const grid=document.createElement('div');grid.className='dv-grid';host.append(grid);const w=Math.max(240,Math.floor((width||host.clientWidth||600)-(width>=760?44:0))/(width>=760?2:1));
  const specs=[['radar','Radar chart','Sector shares of positive net contributions.',radar],['circle-packing','Circle packing','Every donor is shown within its sector. Circle area represents positive net dollars. Select a sector to enlarge it.',packing],['bubble','Bubble chart','X: total dollars · Y: receipt count · bubble area: donor count.',bubbles],['dot-matrix','Dot matrix','The distribution of donors across sectors.',matrix]];
  for(const [kind,title,description,draw]of specs){const target=card(grid,kind,title,description);draw(target,model,Math.max(240,Math.floor(target.plot.clientWidth||w)));}
  if(model.adjustments<0){const p=document.createElement('p');p.className='dv-adjustments';p.textContent=`Signed adjustments: ${money(model.adjustments)}. Net table total: ${money(model.total)}. Radar and packed-circle areas use positive net donor amounts within each sector.`;host.append(p);}
  host.dataset.ready='true';
 }
 const observer=new ResizeObserver(entries=>{const next=Math.floor(entries[0].contentRect.width);if(Math.abs(next-width)>2){width=next;render();}});observer.observe(host);
 return {update(groups){model=buildVisualData(groups);render();},disconnect(){observer.disconnect();}};
}
