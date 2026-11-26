const byId=id=>document.getElementById(id);
const form=byId("letter-form"),button=byId("letter-submit"),status=byId("letter-status"),docStatus=byId("letter-document-status");
const originalUrl="/documents/letters/POPC%20-%20OPEN%20LETTER.pdf";
let token="",widget=null,ready=false,busy=false,objectUrl=null,generation=0,sitekey="";
const tell=(node,msg,error=false)=>{node.textContent=msg;node.dataset.error=String(error)};
function sync(){button.disabled=!(ready&&token&&!busy);}
async function getPage(query=""){const r=await fetch("/api/letter"+query,{cache:"no-store"});if(!r.ok)throw Error("Unable to load");return r.json();}
async function buildPDF(signatures){
 if(!signatures.length)return null;
 const {PDFDocument,StandardFonts,rgb}=await import("https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm");
 const bytes=await fetch(originalUrl).then(r=>{if(!r.ok)throw Error("PDF unavailable");return r.arrayBuffer()});
 const pdf=await PDFDocument.load(bytes),template=await PDFDocument.load(bytes);
 const font=await pdf.embedFont(StandardFonts.Helvetica),perPage=26;
 if(pdf.getPageCount()!==3)throw Error("Unexpected template page count");
 while(pdf.getPageCount()<1+Math.ceil(signatures.length/perPage)){const [page]=await pdf.copyPages(template,[2]);pdf.addPage(page);}
 for(let i=0;i<signatures.length;i++){
  const s=signatures[i],page=pdf.getPage(1+Math.floor(i/perPage)),row=i%perPage;
  const text=s.full_name+" — "+s.city+", "+s.zip;
  const y=720-25*row;
  try{const width=font.widthOfTextAtSize(text,11);page.drawText(text,{x:39,y,size:Math.min(11,534/width*11),font,color:rgb(.12,.12,.12)});}
  catch{
   const c=document.createElement("canvas");c.width=1602;c.height=48;const ctx=c.getContext("2d");ctx.font="33px Arial, sans-serif";ctx.fillStyle="#202020";ctx.textBaseline="middle";ctx.fillText(text,0,24,1602);
   const png=await pdf.embedPng(c.toDataURL("image/png"));page.drawImage(png,{x:39,y:y-3,width:534,height:16});
  }
 }
 return pdf.save();
}
function archiveList(items){
 const root=byId("letter-archive");root.replaceChildren();
 if(!items.length){root.textContent="No delivered letters have been archived yet.";return;}
 const list=document.createElement("ul");list.className="letter-archive-list";
 for(const item of items){const li=document.createElement("li"),a=document.createElement("a");a.href=item.file_path;a.textContent=new Date(item.delivered_at).toLocaleDateString()+" — "+Number(item.signature_count).toLocaleString()+" signatures";li.append(a);list.append(li);}root.append(list);
}
async function refresh(){
 const run=++generation;const first=await getPage();ready=first.ready;sitekey=first.sitekey;byId("letter-count").textContent=Number(first.count).toLocaleString();archiveList(first.archive);sync();
 const all=[...first.signatures];let cursor=first.next;
 while(cursor!==null){const p=await getPage("?after="+cursor+"&snapshot="+first.snapshot);all.push(...p.signatures);cursor=p.next;if(run!==generation)return;}
 if(run!==generation)return;
 try{
  const bytes=await buildPDF(all);if(run!==generation)return;
  const old=objectUrl;objectUrl=bytes?URL.createObjectURL(new Blob([bytes],{type:"application/pdf"})):null;
  const url=objectUrl||originalUrl;byId("letter-document").src=url+"#toolbar=0";byId("letter-download").href=url;
  if(old)URL.revokeObjectURL(old);
  tell(docStatus,Number(first.count).toLocaleString()+" signatures on the current letter.");
 }catch{tell(docStatus,"The signed PDF could not be generated. The original letter remains available.",true);}
}
function installChallenge(){
 if(!ready||!sitekey){tell(status,"Signing is temporarily unavailable.",true);return;}
 const script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;
 script.onload=()=>{widget=window.turnstile.render("#letter-challenge",{sitekey,action:"sign_letter",callback:value=>{token=value;sync();},"expired-callback":()=>{token="";sync();},"error-callback":()=>{token="";sync();tell(status,"Security verification unavailable. Please refresh.",true);}});tell(status,"");};
 script.onerror=()=>tell(status,"Security verification unavailable. Please refresh.",true);
 document.head.append(script);
}
form.addEventListener("submit",async e=>{
 e.preventDefault();if(busy||!token||!form.reportValidity())return;busy=true;sync();
 const data=new FormData(form);tell(status,"Saving your signature…");
 try{const r=await fetch("/api/letter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({full_name:data.get("full_name"),city:data.get("city"),zip:data.get("zip"),email:data.get("email"),consent:data.has("consent"),token})});const body=await r.json();if(!r.ok){tell(status,body.error||"Your signature could not be saved.",true);return;}form.reset();tell(status,"Your signature has been saved.");try{await refresh();}catch{tell(docStatus,"Signature saved; refresh the page to update the document.",true);}}
 catch{tell(status,"Unable to confirm the submission. Please try again.",true);}
 finally{busy=false;token="";if(widget!==null)window.turnstile.reset(widget);sync();}
});
refresh().then(installChallenge).catch(()=>{tell(status,"Signing service temporarily unavailable.",true);tell(docStatus,"The original letter is available; live signatures could not be loaded.",true);byId("letter-archive").textContent="Archive unavailable.";});
