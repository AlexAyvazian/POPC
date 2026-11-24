(()=>{"use strict";
function backgroundMask(data,w,h){
 const seen=new Uint8Array(w*h),q=new Uint32Array(w*h);let head=0,tail=0;
 function add(i){if(seen[i])return;const p=i*4,r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];if(a>15&&(Math.min(r,g,b)<232||Math.max(r,g,b)-Math.min(r,g,b)>9))return;seen[i]=1;q[tail++]=i;}
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
 for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
 while(head<tail){const i=q[head++],x=i%w;if(x>0)add(i-1);if(x<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w);}
 return seen;
}
const image=document.querySelector(".ca-roosevelt-hero .coalition-header"),overlay=document.querySelector(".ca-background-shimmer");
if(!image||!overlay||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
function prepare(){
 if(!image.naturalWidth||!image.naturalHeight)return;
 try{
 const canvas=document.createElement("canvas");const w=Math.min(900,image.naturalWidth),h=Math.round(w*image.naturalHeight/image.naturalWidth);canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)return;ctx.drawImage(image,0,0,w,h);
 const pixels=ctx.getImageData(0,0,w,h),mask=backgroundMask(pixels.data,w,h);if(!mask.some(Boolean))return;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,p=i*4;const interior=mask[i]&&(x===0||mask[i-1])&&(x===w-1||mask[i+1])&&(y===0||mask[i-w])&&(y===h-1||mask[i+w]);pixels.data[p]=pixels.data[p+1]=pixels.data[p+2]=255;pixels.data[p+3]=interior?255:0;}
 ctx.putImageData(pixels,0,0);
 const url="url("+canvas.toDataURL("image/png")+")";overlay.style.maskImage=url;overlay.style.webkitMaskImage=url;overlay.style.aspectRatio=image.naturalWidth+" / "+image.naturalHeight;overlay.classList.add("is-ready");
 }catch(e){console.warn("Header background shimmer unavailable",e);}
}
if(image.complete)prepare();else image.addEventListener("load",prepare,{once:true});
})();