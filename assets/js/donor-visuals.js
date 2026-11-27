import {chartSwatches} from './chart-palette.js?v=selected-swatches1';
import {hierarchy,pack} from './vendor/d3-hierarchy.js';
import {buildVisualData,radarData,packingData,dotData,sectorColor} from './donor-visual-data.js?v=selected-swatches1';
const NS='http://www.w3.org/2000/svg';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const shortMoney=n=>'$'+compact(n/100);
function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;}
function svg(width,height,label){const n=node('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':label});n.append(node('title',{},label));return n;}
function text(s,x,y,value,attrs={}){s.append(node('text',{x,y,'font-size':11,fill:'#554b3f',...attrs},value));}
function mark(s,tag,attrs,label,readout,focus=true){const n=node(tag,{...attrs,...(focus?{tabindex:0,role:'button','aria-label':label}:{})});n.append(node('title',{},label));const inspect=()=>{readout.textContent=label;};n.addEventListener('pointerenter',inspect);n.addEventListener('focus',inspect);n.addEventListener('click',inspect);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}});s.append(n);return n;}
function legend(card,items){const details=document.createElement('details');details.className='dv-legend';const summary=document.createElement('summary');summary.textContent='Sector key and exact values';const ul=document.createElement('ul');for(const item of items){const li=document.createElement('li'),swatch=document.createElement('span');swatch.className='dv-swatch';swatch.style.background=sectorColor(item.name);const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>{card.querySelector('.dv-readout').textContent=item.label;});li.append(swatch,button);ul.append(li);}details.append(summary,ul);card.append(details);}
function card(host,kind,title,description){const f=document.createElement('figure');f.className='donor-visual-card';f.dataset.chart=kind;const cap=document.createElement('figcaption'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=description;cap.append(h,p);const plot=document.createElement('div');plot.className='dv-plot';const readout=document.createElement('p');readout.className='dv-readout';readout.setAttribute('aria-live','polite');readout.textContent='Tap, focus or hover over a mark for details.';f.append(cap,plot,readout);host.append(f);return {card:f,plot,readout};}
function empty(target,message){target.plot.textContent=message;target.readout.textContent='';}
function radar(target,model,w){
 const data=radarData(model);if(!data.length){empty(target,'No positive contribution amounts in this selection.');return;}
 const h=Math.min(330,w),cx=w/2,cy=h/2,r=Math.min(w,h)*.36,max=Math.max(.25,...data.map(d=>d.share));
 const s=svg(w,h,'Radar chart: sector shares of positive net contributions'),point=(i,v)=>{const a=i/data.length*Math.PI*2-Math.PI/2;return [cx+Math.cos(a)*r*v,cy+Math.sin(a)*r*v];};
 for(let level=1;level<=4;level++){s.append(node('polygon',{points:data.map((d,i)=>point(i,level/4).join(',')).join(' '),fill:'none',stroke:'#e1d8ca','stroke-width':.75}));text(s,cx+4,cy-r*level/4+10,Math.round(max*level/4*100)+'%',{'font-size':10});}
 data.forEach((d,i)=>{const p=point(i,1),label=point(i,1.14);s.append(node('line',{x1:cx,y1:cy,x2:p[0],y2:p[1],stroke:'#ded5c7','stroke-width':.75}));text(s,label[0],label[1]+4,i+1,{'text-anchor':'middle','font-size':12,'font-weight':600});});
 s.append(node('polygon',{points:data.map((d,i)=>point(i,d.share/max).join(',')).join(' '),fill:chartSwatches.blue1,'fill-opacity':1,stroke:chartSwatches.blue6,'stroke-width':2}));
 data.forEach((d,i)=>{const p=point(i,d.share/max);mark(s,'circle',{cx:p[0],cy:p[1],r:5,fill:sectorColor(d.name),stroke:chartSwatches.blue6,'stroke-width':.7},`${d.name}: ${(d.share*100).toFixed(2)}% · ${money(d.amount)}`,target.readout);});target.plot.append(s);
 const key=document.createElement('ol');key.className='dv-radar-key';for(const d of data){const li=document.createElement('li');li.textContent=`${d.name} · ${(d.share*100).toFixed(1)}%`;key.append(li);}target.card.append(key);
}
function packing(target,model,w){
 const data=packingData(model);if(!data.children.length){empty(target,'No positive net donor amounts in this selection.');return;}
 const h=Math.min(w,440),root=hierarchy(data).sum(d=>d.value||0).sort((a,b)=>b.value-a.value);pack().size([w,h]).padding(3)(root);const s=svg(w,h,'Circle packing: sectors containing donors, sized by positive net dollars');
 for(const n of root.descendants().slice(1)){
  const sector=n.depth===1?n.data.name:n.parent.data.name,label=n.children?`${sector}: ${money(n.value)}`:`${n.data.name} · ${sector}: ${money(n.value)}`;
  mark(s,'circle',{cx:n.x,cy:n.y,r:n.r,fill:n.children?'none':sectorColor(sector),'fill-opacity':1,stroke:n.children?sectorColor(sector):chartSwatches.blue6,'stroke-width':n.children?1:.5},label,target.readout,n.depth===1||n.r>13);
  if(!n.children&&n.r>24){const maxChars=Math.max(3,Math.floor(n.r/3.6)),name=n.data.name.length>maxChars?n.data.name.slice(0,maxChars-1)+'…':n.data.name;text(s,n.x,n.y-2,name,{'text-anchor':'middle',fill:'#211b15',stroke:'#fffdf9','stroke-width':2,'paint-order':'stroke','font-size':11,'font-weight':600,'pointer-events':'none'});if(n.r>33)text(s,n.x,n.y+13,shortMoney(n.value),{'text-anchor':'middle',fill:'#211b15',stroke:'#fffdf9','stroke-width':2,'paint-order':'stroke','font-size':11,'pointer-events':'none'});}
 }
 target.plot.append(s);legend(target.card,model.sectors.filter(s=>s.leaves.length).map(s=>({name:s.name,label:`${s.name} · ${money(s.leaves.reduce((n,l)=>n+l.amount,0))}`})));
}
function bubbles(target,model,w){
 if(!model.sectors.length){empty(target,'No donors in this selection.');return;}
 const h=320,left=62,right=26,top=25,bottom=55,xMin=Math.min(0,...model.sectors.map(s=>s.amount)),xMax=Math.max(1,...model.sectors.map(s=>s.amount)),maxReceipts=Math.max(1,...model.sectors.map(s=>s.receipts)),maxDonors=Math.max(1,...model.sectors.map(s=>s.donorCount));
 const x=n=>left+(n-xMin)/(xMax-xMin)*(w-left-right),y=n=>h-bottom-Math.sqrt(n/maxReceipts)*(h-top-bottom),s=svg(w,h,'Bubble chart: sector dollars, receipt counts and donor counts');
 for(let i=0;i<4;i++){const value=xMin+(xMax-xMin)*i/3,xx=x(value);s.append(node('line',{x1:xx,x2:xx,y1:top,y2:h-bottom,stroke:'#e6dfd4','stroke-width':.75}));text(s,xx,h-bottom+18,shortMoney(value),{'text-anchor':'middle','font-size':10});const count=Math.round(maxReceipts*(i/3)**2),yy=y(count);if(i>0&&count===Math.round(maxReceipts*((i-1)/3)**2))continue;s.append(node('line',{x1:left,x2:w-right,y1:yy,y2:yy,stroke:'#e6dfd4','stroke-width':.75}));text(s,left-8,yy+4,compact(count),{'text-anchor':'end','font-size':10});}
 text(s,(left+w-right)/2,h-10,'Total contributions ($)',{'text-anchor':'middle','font-size':11});text(s,12,h/2,'Receipts (square-root scale)',{transform:`rotate(-90 12 ${h/2})`,'text-anchor':'middle','font-size':11});
 for(const d of model.sectors){const radius=Math.sqrt(d.donorCount/maxDonors)*22;mark(s,'circle',{cx:x(d.amount),cy:y(d.receipts),r:radius,'data-bubble-donors':d.donorCount,fill:sectorColor(d.name),'fill-opacity':1,stroke:d.amount<0?chartSwatches.red6:chartSwatches.blue6,'stroke-width':1},`${d.name}: ${money(d.amount)} · ${d.receipts.toLocaleString()} receipts · ${d.donorCount.toLocaleString()} donors`,target.readout);}
 target.plot.append(s);legend(target.card,model.sectors.map(d=>({name:d.name,label:`${d.name} · ${money(d.amount)} · ${d.donorCount.toLocaleString()} donors`})));
}
function matrix(target,model,w){
 const {unit,dots}=dotData(model);if(!dots.length){empty(target,'No donors in this selection.');return;}
 const columns=Math.max(10,Math.floor((w-24)/16)),step=(w-24)/columns,h=Math.max(180,Math.ceil(dots.length/columns)*step+20),s=svg(w,h,`Dot matrix: ${model.groups} donors; each full dot represents ${unit} donors`),focusSectors=new Set();
 dots.forEach((d,i)=>{const cx=12+(i%columns+.5)*step,cy=12+(Math.floor(i/columns)+.5)*step,r=step*.36,label=`${d.sector}: this dot represents ${d.count} ${d.count===1?'donor':'donors'}`;let tag='circle',attrs={cx,cy,r,fill:sectorColor(d.sector),stroke:chartSwatches.blue6,'stroke-width':.3};
  if(d.fraction<1){s.append(node('circle',{cx,cy,r,fill:'#fff',stroke:chartSwatches.blue6,'stroke-width':.3}));const a=d.fraction*2*Math.PI-Math.PI/2,ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r;tag='path';attrs={d:`M ${cx} ${cy} L ${cx} ${cy-r} A ${r} ${r} 0 ${d.fraction>.5?1:0} 1 ${ex} ${ey} Z`,fill:sectorColor(d.sector),stroke:chartSwatches.blue6,'stroke-width':.3};}
  const first=!focusSectors.has(d.sector);focusSectors.add(d.sector);mark(s,tag,{...attrs,'data-donor-count':d.count},label,target.readout,first);
 });target.plot.append(s);const scale=document.createElement('p');scale.className='dv-scale';scale.textContent=`Each full dot = ${unit.toLocaleString()} ${unit===1?'donor':'donors'}. Partial dots show the exact remainder. Donors are assigned to their largest sector by contribution magnitude.`;target.card.append(scale);legend(target.card,model.sectors.filter(d=>d.primaryDonors).map(d=>({name:d.name,label:`${d.name} · ${d.primaryDonors.toLocaleString()} donors`})));
}
export function mountDonorVisuals(host){
 let model=null,width=0;host.className='donor-visuals';
 function render(){if(!model)return;host.replaceChildren();host.dataset.groups=model.groups;host.dataset.totalCents=model.total;
  const summary=document.createElement('p');summary.className='dv-scope';summary.textContent=`${model.groups.toLocaleString()} donors · ${money(model.total)} · all matching rows across every table page`;host.append(summary);
  const grid=document.createElement('div');grid.className='dv-grid';host.append(grid);const w=Math.max(240,Math.floor((width||host.clientWidth||600)-(width>=760?44:0))/(width>=760?2:1));
  const specs=[['radar','Radar chart','Sector shares of positive net contributions.',radar],['circle-packing','Circle packing','Sectors contain donors. Leaf circle area represents positive net dollars; smaller donors are grouped and labeled.',packing],['bubble','Bubble chart','X: total dollars · Y: receipt count · bubble area: donor count.',bubbles],['dot-matrix','Dot matrix','The distribution of donors across sectors.',matrix]];
  for(const [kind,title,description,draw]of specs){const target=card(grid,kind,title,description);draw(target,model,Math.max(240,Math.floor(target.plot.clientWidth||w)));}
  if(model.adjustments<0){const p=document.createElement('p');p.className='dv-adjustments';p.textContent=`Signed adjustments: ${money(model.adjustments)}. Net table total: ${money(model.total)}. Radar and packed-circle areas use positive net donor amounts within each sector.`;host.append(p);}
  host.dataset.ready='true';
 }
 const observer=new ResizeObserver(entries=>{const next=Math.floor(entries[0].contentRect.width);if(Math.abs(next-width)>2){width=next;render();}});observer.observe(host);
 return {update(groups){model=buildVisualData(groups);render();},disconnect(){observer.disconnect();}};
}
