export function validateSignature(input){
 if(!input||typeof input!=="object"||input.consent!==true)return null;
 const clean=(v,max)=>typeof v==="string"&&v.length<=max&&!/[\x00-\x1f\x7f]/.test(v)?v.normalize("NFC").trim().replace(/\s+/g," "):"";
 const full_name=clean(input.full_name,100),city=clean(input.city,80),email=clean(input.email,254).toLowerCase(),zip=clean(input.zip,5);
 if(!full_name||!city||!/\p{L}/u.test(full_name)||!/\p{L}/u.test(city)||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\d{5}$/.test(zip))return null;
 if(typeof input.token!=="string"||!input.token||input.token.length>2048)return null;
 return {full_name,city,email,zip,token:input.token};
}
export function pageNumber(v){return /^\d{1,15}$/.test(v||"")?Math.max(0,Number(v)):0;}
export const VERSION="7df37e06172ac2ae5f03e9d995a053ab343722e4";