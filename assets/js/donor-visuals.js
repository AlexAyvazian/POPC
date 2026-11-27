import {chartSwatches,balancedColors} from './chart-palette.js?v=regroup3';
import {buildVisualData,dotData,researchedSectorData} from './donor-visual-data.js?v=sectorview4';
const NS='http://www.w3.org/2000/svg';
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n/100);
const compactMoney=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(n/100);
function node(tag,attrs={},textValue){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(textValue!==undefined)n.textContent=textValue;return n;}
function svg(width,height,label){const n=node('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':label});n.append(node('title',{},label));return n;}
function text(s,x,y,value,attrs={}){const n=node('text',{x,y,'font-size':11,fill:'#554b3f',...attrs},value);s.append(n);return n;}
function twoLines(value,max=38){
 const words=String(value).split(/\s+/);if(String(value).length<=max||words.length<2)return [String(value)];
 let best=1,diff=Infinity,acc='';
 for(let i=0;i<words.length-1;i++){acc+=(i?' ':'')+words[i];const rest=words.slice(i+1).join(' '),d=Math.abs(acc.length-rest.length);if(acc.length<=max+12&&d<diff){best=i+1;diff=d;}}
 return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
}
function wrappedText(s,x,y,value,attrs={}){
 const lines=twoLines(value),n=node('text',{x,y,'font-size':10,fill:'#554b3f',...attrs});
 lines.forEach((line,i)=>n.append(node('tspan',{x,dy:i===0?(lines.length===2?-5:0):12},line)));s.append(n);return n;
}
function mark(s,tag,attrs,label,readout,focus=true){const n=node(tag,{...attrs,...(focus?{tabindex:0,role:'button','aria-label':label}:{})});n.append(node('title',{},label));const inspect=()=>{readout.textContent=label;};n.addEventListener('pointerenter',inspect);n.addEventListener('focus',inspect);n.addEventListener('click',inspect);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect();}});s.append(n);return n;}
function legend(card,items,colors){const details=document.createElement('details');details.className='dv-legend';details.open=true;const summary=document.createElement('summary');summary.textContent='Sector key and exact values';const ul=document.createElement('ul');for(const item of items){const li=document.createElement('li'),swatch=document.createElement('span');swatch.className='dv-swatch';swatch.dataset.sector=item.name;swatch.style.background=colors.get(item.name);const button=document.createElement('button');button.type='button';button.textContent=item.label;button.addEventListener('click',()=>{card.querySelector('.dv-readout').textContent=item.label;});li.append(swatch,button);ul.append(li);}details.append(summary,ul);card.append(details);}
function card(host,kind,title,description){const f=document.createElement('figure');f.className='donor-visual-card';f.dataset.chart=kind;const cap=document.createElement('figcaption'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=description;cap.append(h,p);const plot=document.createElement('div');plot.className='dv-plot';const readout=document.createElement('p');readout.className='dv-readout';readout.setAttribute('aria-live','polite');readout.textContent='Tap, focus or hover over a mark for details.';f.append(cap,plot,readout);host.append(f);return {card:f,plot,readout};}
function empty(target,message){target.plot.textContent=message;target.readout.textContent='';}
function horizontalBars(target,items,colors,label,format,domain){
 const w=920,left=338,right=105,top=24,rowH=34,bottom=28,h=Math.max(150,top+items.length*rowH+bottom),plotW=w-left-right;
 const rawMin=domain?.[0]??Math.min(0,...items.map(d=>d.value)),rawMax=domain?.[1]??Math.max(0,...items.map(d=>d.value));
 let min=rawMin,max=rawMax;if(min===max){if(max===0)max=1;else if(max>0)min=0;else max=0;}
 const range=max-min||1,x=v=>left+(v-min)/range*plotW,zero=x(0),s=svg(w,h,label);
 target.plot.dataset.barOrientation='horizontal';
 for(let i=0;i<=4;i++){const value=min+(max-min)*i/4,xx=x(value);s.append(node('line',{x1:xx,x2:xx,y1:top-8,y2:h-bottom+4,stroke:i===0||i===4?'#d9cfbf':'#ebe4d9','stroke-width':.8}));text(s,xx,h-6,format(value),{'text-anchor':'middle','font-size':9});}
 s.append(node('line',{x1:zero,x2:zero,y1:top-8,y2:h-bottom+4,stroke:'#b69b79','stroke-width':1.2}));
 items.forEach((d,i)=>{const cy=top+i*rowH+rowH/2,xx=x(d.value),barX=Math.min(zero,xx),barW=Math.max(1,Math.abs(xx-zero));wrappedText(s,left-12,cy+2,d.name,{'text-anchor':'end','font-size':10,'font-weight':600});mark(s,'rect',{x:barX,y:cy-8,width:barW,height:16,rx:2,fill:colors.get(d.sector||d.name),'data-bar-value':d.value},d.label,target.readout);const tx=d.value>=0?Math.min(w-right+4,xx+7):Math.max(left-4,xx-7);text(s,tx,cy+4,format(d.value),{'text-anchor':d.value>=0?'start':'end','font-size':10,'font-weight':700});});
 target.plot.append(s);
}
function sectorBars(target,model){
 target.plot.dataset.barOrientation='horizontal';
 const view=researchedSectorData(model),data=view.sectors.map(d=>({...d,share:view.total?d.amount/view.total:0})).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));
 if(!view.total||data.some(d=>d.share<0)||view.total<0){empty(target,'No positive researched-sector total is available for this selection.');return;}
 const colors=balancedColors(data.map(d=>d.name)),max=Math.max(...data.map(d=>d.share),0);
 horizontalBars(target,data.map(d=>({...d,sector:d.name,value:d.share,label:`${d.name}: ${(d.share*100).toFixed(2)}% of researched-sector dollars · ${money(d.amount)}`})),colors,'Horizontal bar graph: researched sector shares',v=>(v*100).toFixed(1)+'%',[0,max*1.08||1]);
}
function donorBars(target,model){
 target.plot.dataset.barOrientation='horizontal';
 const view=researchedSectorData(model);if(!view.sectors.length){empty(target,'No researched-sector donor allocations in this selection.');return;}
 const control=document.createElement('label');control.className='dv-sector-control';control.textContent='Inspect a researched sector ';
 const select=document.createElement('select');select.setAttribute('aria-label','Donor bar graph researched sector');select.add(new Option('All researched sectors',''));
 for(const sector of view.sectors)select.add(new Option(sector.name,sector.name));control.append(select);target.plot.before(control);
 const pager=document.createElement('div'),previous=document.createElement('button'),next=document.createElement('button'),status=document.createElement('span');pager.className='dv-donor-pages';previous.type=next.type='button';previous.textContent='Previous donors';next.textContent='Next donors';status.setAttribute('role','status');pager.append(previous,status,next);target.plot.after(pager);
 const colors=balancedColors(view.sectors.map(s=>s.name));let page=0;
 function draw(){
  const selected=select.value?view.sectors.filter(s=>s.name===select.value):view.sectors;
  const leaves=selected.flatMap(s=>s.leaves.map(l=>({...l,sector:s.name,originalSector:l.sector}))).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name)||a.originalSector.localeCompare(b.originalSector));
  const domain=leaves.reduce(([mn,mx],d)=>[Math.min(mn,d.amount),Math.max(mx,d.amount)],[0,0]),start=page*20;target.plot.replaceChildren();target.plot.dataset.donorBarCount=leaves.length;
  if(!leaves.length)empty(target,'No researched-sector donors in this selection.');else{const rows=leaves.slice(start,start+20).map(d=>({...d,value:d.amount,name:d.name,label:`${d.name} · ${d.originalSector}: ${money(d.amount)}`}));horizontalBars(target,rows,colors,'Horizontal bar graph: signed donor allocations in researched sectors',compactMoney,domain);}
  status.textContent=leaves.length?`${start+1}–${Math.min(start+20,leaves.length)} of ${leaves.length.toLocaleString()} donor allocations with researched sectors`:'0 researched-sector donor allocations';previous.disabled=page===0;next.disabled=start+20>=leaves.length;
 }
 previous.addEventListener('click',()=>{page--;draw();});next.addEventListener('click',()=>{page++;draw();});select.addEventListener('change',()=>{page=0;draw();});draw();
}
function bubbles(target,model,w){
 const view=researchedSectorData(model),data=[...view.sectors].sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name));if(!data.length){empty(target,'No researched-sector contributions in this selection.');return;}
 const colors=balancedColors(data.map(d=>d.name)),maxAbs=Math.max(1,...data.map(d=>Math.abs(d.amount))),maxCols=w>=900?4:w>=650?3:2,cols=Math.max(2,Math.min(maxCols,Math.ceil(Math.sqrt(data.length)))),cellW=w/cols,maxR=Math.min(58,cellW*.28),rowH=maxR*2+82,rows=Math.ceil(data.length/cols),h=rows*rowH+12,s=svg(w,h,'Bubble chart: contribution dollars by researched sector');
 data.forEach((d,i)=>{const col=i%cols,row=Math.floor(i/cols),cx=(col+.5)*cellW,cy=row*rowH+maxR+10,radius=Math.sqrt(Math.abs(d.amount)/maxAbs)*maxR,label=`${d.name}: ${money(d.amount)} in net contributions`;mark(s,'circle',{cx,cy,r:radius,'data-bubble-dollars':d.amount,fill:colors.get(d.name),'fill-opacity':1,stroke:d.amount<0?chartSwatches.red6:chartSwatches.blue6,'stroke-width':1},label,target.readout,radius>=5);wrappedText(s,cx,cy+maxR+24,d.name,{'text-anchor':'middle','font-size':10,'font-weight':600});text(s,cx,cy+maxR+51,money(d.amount),{'text-anchor':'middle','font-size':10});});
 target.plot.append(s);legend(target.card,data.map(d=>({name:d.name,label:`${d.name} · ${money(d.amount)}`})),colors);
}
function matrix(target,model,w){
 const view=researchedSectorData(model),dots=dotData({sectors:view.sectors,donors:view.donorRows});if(!dots.length){empty(target,'No donors with researched sector assignments in this selection.');return;}
 const colors=balancedColors(view.sectors.map(d=>d.name)),columns=Math.max(1,Math.ceil(Math.sqrt(dots.length*(w-24)/300))),step=Math.min(16,(w-24)/columns),rows=Math.ceil(dots.length/columns),s=svg(w,rows*step+24,'Dot matrix: one circle per donor with a researched sector assignment'),first=new Set(),labels=new WeakMap();
 dots.forEach((d,i)=>{const attrs={cx:12+(i%columns+.5)*step,cy:12+(Math.floor(i/columns)+.5)*step,r:step*.4,fill:colors.get(d.sector),'data-donor-count':1},label=d.name+' · '+d.sector+' · '+money(d.amount);if(!first.has(d.sector)){attrs.tabindex=0;attrs['aria-label']=label;first.add(d.sector);}const circle=node('circle',attrs);labels.set(circle,label);s.append(circle);});
 const inspect=e=>{if(labels.has(e.target))target.readout.textContent=labels.get(e.target);};for(const event of ['pointerover','focusin','click'])s.addEventListener(event,inspect);target.plot.append(s);legend(target.card,view.sectors.filter(d=>d.primaryDonors).map(d=>({name:d.name,label:d.name+' · '+d.primaryDonors.toLocaleString()+' donors'})),colors);
}
export function mountDonorVisuals(host){
 let model=null,width=0;host.className='donor-visuals';
 function render(){if(!model)return;host.replaceChildren();const view=researchedSectorData(model);host.dataset.groups=model.groups;host.dataset.totalCents=model.total;host.dataset.sectorDetail='sectors';host.dataset.sectorDonors=view.donors;
  const summary=document.createElement('p');summary.className='dv-scope';summary.textContent=`${model.groups.toLocaleString()} donors · ${money(model.total)} total`;host.append(summary);
  const coverage=document.createElement('p');coverage.className='dv-coverage';coverage.textContent=`Researched-sector coverage: ${view.donors.toLocaleString()} donors · ${money(view.total)}. ${view.unclassifiedDonors.toLocaleString()} donors · ${money(view.unclassifiedTotal)} remain without a researched sector assignment in the current ClaudeFiles and are kept in the tables, not plotted as sectors.`;host.append(coverage);
  const grid=document.createElement('div');grid.className='dv-grid';host.append(grid);const w=Math.max(300,Math.floor((width||host.clientWidth||700)-44));
  const specs=[['sector-bars','Sector share bar graph','Horizontal bars compare only actual researched sector assignments. Percentages use researched-sector dollars as the denominator.',sectorBars],['donor-bars','Donor contribution bar graph','Horizontal bars compare named donor allocations that have researched sector assignments.',donorBars],['bubble','Sector donation bubbles','Each bubble is one researched sector. Bubble area represents that sector’s net contribution dollars.',bubbles],['dot-matrix','Dot matrix','Each dot is one consolidated donor with a researched sector assignment, grouped and colored by researched sector.',matrix]];
  for(const [kind,title,description,draw]of specs){const target=card(grid,kind,title,description);draw(target,model,Math.max(300,Math.floor(target.plot.clientWidth||w)));}
  if(model.adjustments<0){const p=document.createElement('p');p.className='dv-adjustments';p.textContent=`Signed adjustments: ${money(model.adjustments)}. Net table total: ${money(model.total)}.`;host.append(p);}host.dataset.ready='true';
 }
 const observer=new ResizeObserver(entries=>{const next=Math.floor(entries[0].contentRect.width);if(Math.abs(next-width)>2){width=next;render();}});observer.observe(host);
 return {update(groups){model=buildVisualData(groups);render();},disconnect(){observer.disconnect();}};
}
