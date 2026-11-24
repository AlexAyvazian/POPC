(()=>{"use strict";
function backgroundMask(data,w,h){
 const seen=new Uint8Array(w*h),q=new Uint32Array(w*h);let head=0,tail=0;
 function add(i){if(seen[i])return;const p=i*4,r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];if(a>15&&(Math.min(r,g,b)<232||Math.max(r,g,b)-Math.min(r,g,b)>9))return;seen[i]=1;q[tail++]=i;}
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
 for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
 while(head<tail){const i=q[head++],x=i%w;if(x>0)add(i-1);if(x<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w);}
 return seen;
}

const hero=document.querySelector(".ca-roosevelt-hero"),image=hero?.querySelector(".coalition-header"),layer=hero?.querySelector(".ca-header-fireflies");
if(!hero||!image||!layer||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
let artworkMask;
function prepare(){
 if(!image.naturalWidth||!image.naturalHeight||!hero.clientWidth||!hero.clientHeight)return;
 try{
  if(!artworkMask){
   const w=Math.min(1000,image.naturalWidth),h=Math.round(w*image.naturalHeight/image.naturalWidth),source=document.createElement("canvas");
   source.width=w;source.height=h;const ctx=source.getContext("2d",{willReadFrequently:true});if(!ctx)return;
   ctx.drawImage(image,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h),mask=backgroundMask(pixels.data,w,h);
   if(!mask.some(Boolean))return;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,p=i*4;const safe=mask[i]&&(x===0||mask[i-1])&&(x===w-1||mask[i+1])&&(y===0||mask[i-w])&&(y===h-1||mask[i+w]);pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=255;pixels.data[p+3]=safe?255:0;}
   ctx.putImageData(pixels,0,0);artworkMask=source;
  }
  const bounds=hero.getBoundingClientRect(),rect=image.getBoundingClientRect(),w=Math.max(1,Math.round(bounds.width)),h=Math.max(1,Math.round(bounds.height)),canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const x=rect.left-bounds.left,y=rect.top-bounds.top;
  ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);ctx.clearRect(x,y,rect.width,rect.height);ctx.drawImage(artworkMask,x,y,rect.width,rect.height);
  const url="url("+canvas.toDataURL("image/png")+")";layer.style.maskImage=url;layer.style.webkitMaskImage=url;
  if(!layer.childElementCount){const n=window.innerWidth<600?55:120;for(let i=0;i<n;i++){const dot=document.createElement("i");const rand=(a,b)=>a+Math.random()*(b-a);const vars={"--x":rand(2,98)+"%","--y":rand(4,90)+"%","--size":rand(3,6.5)+"px","--dx":rand(-46,46)+"px","--dy":rand(-40,24)+"px","--time":rand(4,9)+"s","--delay":(-rand(0,11))+"s"};for(const [k,v] of Object.entries(vars))dot.style.setProperty(k,v);layer.append(dot);}}
  layer.classList.add("is-ready");
 }catch(e){console.warn("Header fireflies unavailable",e);}
}
if(image.complete)prepare();else image.addEventListener("load",prepare,{once:true});
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(prepare,100);}).observe(hero);
})();