(()=>{"use strict";
const config=[{"name":"JEFF PAC","slug":"jeff-pac","key":"jeff-pac","ni":4,"no":3,"individual":11430000,"organization":76000000,"individualCount":28,"organizationCount":171,"memos":200},{"name":"Jeffries Victory Fund","slug":"jeffries-victory-fund","key":"jvf","ni":6,"no":0,"individual":1383246082,"organization":66810000,"individualCount":530,"organizationCount":30,"memos":16},{"name":"Jeffries Majority Fund","slug":"jeffries-majority-fund","key":"jmf","ni":3,"no":3,"individual":74460000,"organization":6899900,"individualCount":178,"organizationCount":19,"memos":156},{"name":"Jeffries for Congress","slug":"jeffries-for-congress","key":"jfc","ni":0,"no":0,"individual":431228139,"organization":282420000,"individualCount":107722,"organizationCount":774,"memos":110585},{"name":"Jeffries Clark Victory Fund","slug":"jeffries-clark-victory-fund","key":"jcvf","ni":0,"no":0,"individual":11850000,"organization":500000,"individualCount":12,"organizationCount":1,"memos":11},{"name":"Defend the Vote Leadership Fund","slug":"defend-the-vote-leadership-fund","key":"dvtlf","ni":13,"no":0,"individual":4067000,"organization":0,"individualCount":1262,"organizationCount":0,"memos":5},{"name":"Jeffries Clark Aguilar Victory Fund","slug":"jeffries-clark-aguilar-victory-fund","key":"jcavf","ni":0,"no":0,"individual":500000,"organization":0,"individualCount":1,"organizationCount":0,"memos":0},{"name":"Jeffries Battleground Protection Fund","slug":"jeffries-battleground-protection-fund","key":"jbpf","ni":0,"no":0,"individual":437599149,"organization":26100000,"individualCount":78,"organizationCount":11,"memos":49}];
const status=/^(NOT EMPLOYED|RETIRED|SELF[ -]?EMPLOYED|SELF|N\/A|NA|NONE|NULL|NOT REPORTED|INFORMATION REQUESTED|INFORMATION REQUESTED PER BEST EFFORTS|UNEMPLOYED|HOMEMAKER|STUDENT|UNKNOWN|NOT AVAILABLE|REQUESTED)$/i;
const rules=[
["Tribal Nations & Governments",/\b(TRIBE|TRIBAL|INDIAN NATION|INDIAN COMMUNITY|BAND OF (?:INDIANS|MIWOK)|POTAWATOMI|POTTAWATOMI|CHICKASAW NATION|ONEIDA NATION|CHEROKEE NATION|SEMINOLE TRIBE|POARCH BAND|YOCHA DEHE|PECHANGA)\b/],
["Labor Unions & Employee Associations",/\b(UNION|BROTHERHOOD|AFL-CIO|SEIU|AFSCME|TEAMSTERS|MACHINISTS|PILOTS ASSOCIATION|PILOTS' ASSOCIATION|FIREFIGHTERS|FIRE FIGHTERS|NATIONAL AIR TRAFFIC CONTROLLERS|COMMUNICATIONS WORKERS|CWA-COMMITTEE|AMERICAN FEDERATION OF|ACTORS' EQUITY|DIRECTORS GUILD|MASTERS, MATES AND PILOTS|PROFESSIONAL AVIATION SAFETY|PLASTERERS'|SHEET METAL WORKERS|OPERATING ENGINEERS|D\.R\.I\.V\.E\.|NEA FUND|NATIONAL ASSOCIATION OF LETTER CARRIERS|NATIONAL ASSOCIATION OF POSTAL SUPERVISORS|NATIONAL TREASURY EMPLOYEES)\b/],
["Health Insurance & Managed Care",/\b(BLUE CROSS|BLUE SHIELD|BLUEPAC|AETNA|CENTENE|CIGNA|HUMANA|ELEVANCE|UNITEDHEALTH|MOLINA HEALTHCARE|CARESOURCE|GUIDEWELL|HIGHMARK|CAMBIA HEALTH|UNISON HEALTH PLANS|HEALTH INSURANCE|HEALTH PLANS|KAISER PERMANENTE|AMERICA'S HEALTH INSURANCE PLANS|AHIP)\b/],
["Pharmaceuticals, Biotechnology & Medical Products",/\b(ABBVIE|AMGEN|ASTRAZENECA|PFIZER|MERCK|ELI LILLY|NOVARTIS|BRISTOL.MYERS|JOHNSON & JOHNSON|GILEAD|GENENTECH|BIOGEN|MODERNA|SANOFI|BAXTER|MEDTRONIC|BOSTON SCIENTIFIC|CARDINAL HEALTH|PHARMACEUTICAL|PHARMACY|PHARMACISTS|BIOTECH|GRAIL|ZOETIS|CONSUMER HEALTHCARE PRODUCTS|MCKESSON|WALGREEN|CVS HEALTH|PHARMA|BIOLOGICS|AVVIO MEDICAL)\b/],
["Healthcare & Medical Associations",/\b(HEALTHCARE|HEALTH CARE|HOSPITAL|HOSPITALS|HEALTH SYSTEMS|MEDICAL|PHYSICIAN|PHYSICIANS|NURSE|NURSES|NURSING|DENTAL|DENTISTRY|CARDIOLOGY|DERMATOLOGY|NEUROLOGY|OPHTHALMOLOGY|OTOLARYNGOLOGY|SURGEONS|SURGERY|ANESTHESIOLOGISTS|ANESTHETISTS|RADIOLOGY|RADIOLOGIC|ONCOLOGY|ORTHOPAEDIC|ORTHOPEDIC|RHEUMATOLOGY|PEDIATRICS|PEDIATRIC|PODIATRIC|PSYCHIATRIC|PSYCHOLOGICAL|PSYCHOLOGY|PHYSICAL THERAPY|OCCUPATIONAL THERAPY|OB.GYN|MIDWIVES|PATHOLOGISTS|OPTOMETRIC|AUDIOLOGY|SPEECH.LANGUAGE.HEARING|CHIROPRACTIC|FAMILY THERAPY|FRESENIUS|DAVITA|RENAL CARE|TELADOC|VILLAGEMD|LIFEPOINT|ALZHEIMERS|CINQCARE|VSP HOLDING|ENT PAC|OB-GYN|AMERICAN COLLEGE OF EMERGENCY PHYSICIANS|AOTPAC|SKINPAC|BRAINPAC|RHEUMPAC|EYEPAC|HEALTH SERVICES|HEALTH SOLUTIONS|AMERICAN ACADEMY OF FAMILY|PA PAC|CLINIC|HEALTH CENTER)\b/],
["Real Estate, Housing & Property",/\b(REAL ESTATE|REALTY|REALTORS|APARTMENT|MULTIFAMILY|HOUSING|HOME BUILDERS|HOMES 4 RENT|MORTGAGE|PROPERTY MANGERS|PROPERTY MANAGERS|PROPERTY MANAGEMENT|LAND TITLE|APPRAISAL INSTITUTE|NAIOP|NAREIT|ZILLOW|SHOPPING CENTERS|EXCHANGE ACCOMODATORS|FIRST AMERICAN FINANCIAL|ANNALY CAPITAL|RADCO|GFPRE|TWO TREES MANAGEMENT|RLJ DEVELOPMENT|MERITAGE GROUP|ROCK HOLDINGS)\b/],
["Insurance & Risk Management",/\b(INSURANCE|INSURERS|AFLAC|ALLSTATE|CHUBB|ARCH CAPITAL|GUARDIAN LIFE|NEW YORK LIFE|NORTHWESTERN MUTUAL|MASSACHUSETTS MUTUAL|MUTUAL OF OMAHA|LIBERTY MUTUAL|NATIONWIDE MUTUAL|STATE FARM|UNUM|USAA|ZURICH|TRAVELERS COMPANIES|PROTECTIVE LIFE|PACIFIC LIFE|JOHN HANCOCK|LOCKTON|MARSH & MCLENNAN|AMFAM|AMERICAN FIDELITY|PRIMERICA|FINSECA|NABIP|STERLINGRISK|THRIVENT|PRUDENTIAL|PRINCIPAL LIFE)\b/],
["Finance, Banking & Investment",/\b(BANK|BANKERS|BANKING|BANCORP|BANCORPORATION|FINANCIAL|FINANCE|CAPITAL MANAGEMENT|CAPITAL GROUP|CAPITAL PARTNERS|CAPITAL LLC|INVESTMENT|INVESTMENTS|INVESTOR|VENTURE CAPITAL|VENTURES|SECURITIES|CREDIT UNION|CREDIT COUNCIL|CREDIT CARD|ASSET MANAGEMENT|BLACKSTONE|BLACKROCK|GOLDMAN SACHS|JPMORGAN|JP MORGAN|MORGAN STANLEY|WELLS FARGO|CITIGROUP|BARCLAYS|HSBC|SANTANDER|AMERICAN EXPRESS|VISA|MASTERCARD|ALLY FINANCIAL|CME GROUP|INTERCONTINENTAL EXCHANGE|DEPOSITORY TRUST|DTCC|FMR LLC|FIDELITY|VANGUARD|INVESCO|EDWARD JONES|LSEG|SIFMA|MIZUHO|UBS|RBC USA|TRUIST|STATE STREET|NORTHERN TRUST|VOYA|TIAA|ONEMAIN|NELNET|EXPERIAN|CULAC|DAVIDSON KEMPNER|BAIN CAPITAL|WARBURG PINCUS|SV ANGEL|ARISTEIA CAPITAL|SESSA CAPITAL|Q INVESTMENTS|GTS|OBERLAND CAPITAL|BROADFIN CAPITAL|THE VISTRIA GROUP|COINBASE|GREYLOCK|KLEINER, PERKINS|LIFE YIELD)\b/],
["Lobbying, Government Relations & Public Affairs",/\b(LOBBYING|GOVERNMENT AFFAIRS|GOVERNMENT RELATIONS|PUBLIC AFFAIRS|BGR GROUP|THEGROUP|TIBER CREEK|INVARIANT|FGS GLOBAL|GLOVER PARK|MINDSET|LSN PARTNERS|EMPIRE CONSULTING GROUP|THE DASCHLE GROUP|MEHLMAN CONSULTING|PECK MADIGAN JONES|CORNERSTONE GOVERNMENT|CAPITOL CITY GROUP|ENVISION STRATEGY|BGR GOVERNMENT|WILLIAMS AND JENSEN)\b/],
["Legal Services",/\b(LAW FIRM|LAW OFFICE|LAW GROUP|LAW LLP|ATTORNEYS|LLP CIVIC|LLP PAC|LLP POLITICAL|PLLC|AKIN GUMP|BALLARD SPAHR|BROWNSTEIN|COVINGTON & BURLING|COZEN O'CONNOR|FOLEY & LARDNER|HOLLAND & KNIGHT|K&L GATES|MCGUIREWOODS|SQUIRE PATTON BOGGS|STEPTOE|TAFT STETTINIUS|KIRKLAND|SUSMAN GODFREY|ZAREMBA BROWN|ELEFTERAKIS|WILLIAMS HART|INTELLECTUAL PROPERTY LAW|TRADEMARK ASSOCIATION|AAJ PAC)\b/],
["Accounting & Professional Services",/\b(ACCOUNTANTS|ACCOUNTING|PRICEWATERHOUSECOOPERS|PWC|DELOITTE|ERNST & YOUNG|KPMG|CROWE|GRANT THORNTON|H&R BLOCK|MCKINSEY|ACCENTURE|ANALYSIS GROUP|ALIXPARTNERS)\b/],
["Aerospace & Defense",/\b(BOEING|AIRBUS|BAE SYSTEMS|BLUE ORIGIN|NORTHROP GRUMMAN|RAYTHEON|GENERAL DYNAMICS|GE AEROSPACE|GENERAL ELECTRIC COMPANY AEROSPACE|LOCKHEED MARTIN|L3HARRIS|HUNTINGTON INGALLS|LEIDOS|SCIENCE APPLICATIONS INTERNATIONAL|TRANSDIGM|TEXTRON|ROLLS.ROYCE|ANDURIL|DEFENSE|AEROSPACE|PALANTIR)\b/],
["Construction, Engineering & Infrastructure",/\b(CONSTRUCTION|ENGINEERING|CONTRACTORS|CONTRACTING|CONCRETE|CEMENT|ASPHALT|ARCHITECTS|AECOM|HNTB|HDR INC|HERZOG|PARSONS CORPORATION|QUANTA SERVICES|CATERPILLAR|CARRIER GLOBAL|ELECTRICAL CONTRACTORS|UTILITY CONTRACTORS|BUILDING SERVICES|BUILDING MATERIALS|SUPERIOR TEST & BALANCE|ARCHIPAC)\b/],
["Energy, Utilities & Natural Resources",/\b(ENERGY|ELECTRIC COOPERATIVES|POWER ASSOCIATION|NUCLEAR|OIL AND GAS|PETROLEUM|UTILITIES|UTILITY|GE VERNOVA|AVANTUS|GROWTH ENERGY|POET PAC|LIQUID TERMINALS|SOLAR|WIND POWER|XCEL|CHEVRON|EXXON|CONOCOPHILLIPS|OCCIDENTAL)\b/],
["Technology, Internet & Software",/\b(TECHNOLOGY|TECHNOLOGIES|SOFTWARE|GOOGLE|AMAZON|META PLATFORMS|MICROSOFT|APPLE INC|ORACLE|INTEL|CISCO|DELL|DROPBOX|EBAY|HEWLETT PACKARD|MICRON|SAMSUNG|SYNOPSYS|COGNIZANT|INFORMATION TECHNOLOGY|CONSUMER TECHNOLOGY|Y COMBINATOR|INTERSYSTEMS|SLACK|LINKEDIN|DIGITAL SOVEREIGNTY|TRISOLARIS|IBM|NVIDIA|SALESFORCE)\b/],
["Telecommunications & Broadband",/\b(TELECOMMUNICATIONS|TELECOM|AT&T|VERIZON|T-MOBILE|CHARTER COMMUNICATIONS|COMCAST|CABLE &|WIRELESS ASSOCIATION|CTIA|ECHOSTAR|DISH NETWORK|ERICSSON|LUMEN TECHNOLOGIES|GRANITE TELECOM)\b/],
["Media, Arts & Entertainment",/\b(MUSIC|MUSICIANS|MEDIA|BROADCASTERS|MOTION PICTURE|ENTERTAINMENT|NEWS CORP|NEWS CORPORATION|FOX CORPORATION|PARAMOUNT GLOBAL|VIACOM|DISNEY|NBC UNIVERSAL|NETFLIX|NIELSEN|ASCAP|BMI LEGISLATIVE|SESAME WORKSHOP|AURORA PICTURES|NEWSWEB|AMERICANS FOR THE ARTS|RELX)\b/],
["Transportation, Logistics & Aviation",/\b(AIRLINES|AIR LINES|AIR WORLDWIDE|FEDERAL EXPRESS|FEDEX|UNITED PARCEL|CSX|RAILROAD|RAILWAYS|RAILWAY|TRUCKING|TRANSPORTATION|TRANSPORT WORKERS|WATERWAYS|BARGE|SCHNEIDER NATIONAL|TTX PAC|LYFT|UBER|SEAFARERS|AIR CARGO|AIR TRAFFIC|ROYAL CARIBBEAN)\b/],
["Automotive & Industrial Manufacturing",/\b(AUTOMOBILE|AUTOMOTIVE|GENERAL MOTORS|FORD MOTOR|TOYOTA|ALCOA|CUMMINS|DEERE|CASE NEW HOLLAND|COMMERCIAL METALS|CORNING|DOW INC|SIEMENS|HONEYWELL|INTERNATIONAL PAPER|PLASTICS INDUSTRY|RIO TINTO|3M COMPANY|SOLSTICE ADVANCED MATERIALS|LKQ CORPORATION|EQUIPMENT DEALERS|EQUIPMENT DISTRIBUTORS|MARINE MANUFACTURERS|STANDARD TEXTILE|GENERAL ELECTRIC|PITNEY BOWES|SAMMONS ENTERPRISES)\b/],
["Agriculture, Food & Beverage",/\b(AGRICULTURE|FARMERS|FARM CREDIT|SOYBEAN|SUGAR COMPANY|BEVERAGE|BREW|BEER|WINE & SPIRITS|ANHEUSER.BUSCH|BROWN.FORMAN|SAZERAC|TYSON FOODS|LAND O'LAKES|SYNGENTA|THE WONDERFUL COMPANY|NIAGARA BOTTLING|GLAZER'S|FOODS|NATIONAL GROCERS)\b/],
["Hospitality, Restaurants & Gaming",/\b(HOTEL|HOTELS|LODGING|HILTON|MARRIOTT|DELAWARE NORTH|MGM RESORTS|RESTAURANT|MCDONALDS|DOORDASH|DRAFTKINGS|SPORTS|MAJOR LEAGUE BASEBALL|JOCKEY CLUB|HOSPITALITY|GAMING|LOTTERY|FRANCHISE ASSOCIATION|ARP LLC)\b/],
["Retail & Consumer Goods",/\b(RETAIL|GROCERY|CONVENIENCE STORES|WALMART|TARGETCITIZENS|BEST BUY|HOME DEPOT|LOWE'S|GAP INC|TRACTOR SUPPLY|PROCTER & GAMBLE|CONSUMER BRANDS|COUPANG|ALBERTSONS|WAWA|AWAY|ORCHID BAY|LTD X LIZZIE TISCH)\b/],
["Cannabis",/\b(CANNABIS|DUTCHIE|GREEN THUMB INDUSTRIES|TRULIEVE|VERANO|NABIS|JUSHI|C3 INDUSTRIES|BUCKEYE RELIEF)\b/],
["Education & School Choice",/\b(UNIVERSITY|COLLEGE|SCHOOL DISTRICT|SCHOOLS|SCHOOL|KIPP|EDUCATION REFORM|DEMOCRATS FOR EDUCATION REFORM|TEACHERS|EDUCATION|ACADEMY|CHARTER SCHOOL|UNIV\.)\b/],
["Civil Rights, Environment & Other Advocacy",/\b(HUMAN RIGHTS CAMPAIGN|GIFFORDS|JSTREET|J STREET|END CITIZENS UNITED|SIERRA CLUB|LEAGUE OF CONSERVATION VOTERS|HUMANE SOCIETY|HUMANE WORLD|PLANNED PARENTHOOD|NATIONAL ORGANIZATION FOR WOMEN|DISABILITY REPRESENTATIVES|SOCIAL WORKERS|MURMURATION|CHICAGO CRED|ARNOLD VENTURES|PIVOTAL VENTURES|FOUNDATION|NONPROFIT|CHARITY)\b/],
["Government & Public Sector",/\b(CITY OF|COUNTY OF|STATE OF|U\.S\. DEPARTMENT|US DEPARTMENT|GOVERNMENT OF|GOVERNMENT AGENCY|DEPARTMENT OF|PUBLIC SECTOR|US GOVERNMENT|FEDERAL GOVERNMENT|NATIONAL WEATHER SERVICE|NARFE)\b/],
["Political Committees & Fundraising Intermediaries",/\b(ACTBLUE|DEMOCRATIC|DEMOCRATS|DEMINGS PAC|CROSSPARTISAN|LEADERSHIP PAC|VICTORY FUND|POLITICAL PARTY|POLITICAL COMMITTEES|CAMPAIGN COMMITTEE)\b/]
];
function sector(name){const n=String(name||"").toUpperCase().trim();if(!n||status.test(n))return "Self-employment / Personal or Unreported Status";for(const [s,re] of rules){if(re.test(n))return s;}return "Sector unconfirmed / Further research";}

const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n/100),num=n=>n.toLocaleString("en-US"),sum=(a,k)=>a.reduce((n,r)=>n+r[k],0),gross=r=>r.individual+r.organization,pct=(n,d)=>d?((n/d)*100).toFixed(2)+"%":"0.00%";
// Chart colors sampled from the supplied palette, converted to sRGB.
const chartPalette={"blue":["#ecfeff","#74cbf5","#66a8e5","#5ca6f1","#599aee","#4063c7"],"teal":["#f2feff","#acfaf1","#a2f2ea","#7fdfd1","#65c9bd"],"green":["#f5fef2","#c0fb74","#b6f16e","#86ec4f","#7fe148","#5a9e31"],"orange":["#f2a43b","#ec722f","#f09638"],"red":["#f1a38a","#e74a41","#ea3a2e","#ed7147","#e04033"],"pink":["#f9d9ef","#f19dc7","#e46cac","#ea8cae"],"purple":["#f9dafa","#dc64d4","#dc69d1"]};
const committeeColors={"jvf":"#ecfeff","jfc":"#74cbf5","jbpf":"#66a8e5","jeff-pac":"#5ca6f1","jmf":"#599aee","jcvf":"#4063c7","dvtlf":"#f2feff","jcavf":"#acfaf1"};
const sequence=[...chartPalette.blue,...chartPalette.teal,...chartPalette.green,...chartPalette.orange,...chartPalette.red,...chartPalette.pink,...chartPalette.purple];
const indColor=chartPalette.blue[4],orgColor=chartPalette.teal[4];
function sequentialItems(items){return [...items].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)).map((item,i)=>({...item,color:sequence[i%sequence.length]}));}
let selected="",sectorSelected="",query="",page=0,allRecords=null,mode="organization",loadFailures=[],loadedCommittees=0;
const pageSize=50;
const normalize=s=>String(s||"").trim().replace(/\s+/g," ").toUpperCase();
function harmonize(name,label){
const l=String(label||"");if(/unconfirmed|unverified|unclear/i.test(l))return "Sector unconfirmed";
if(/personal|self.employ|not employed|non.employer|unreported|non.individual/i.test(l))return "Personal status / unreported employer";
if(/tribal/i.test(l))return "Tribal nations & governments";
if(/health insurance|managed care/i.test(l))return "Health insurance";
if(/pharma|biotech|medical products/i.test(l))return "Pharmaceuticals & biotechnology";
if(/healthcare|health care|medical association/i.test(l))return "Healthcare";
if(/real estate|housing|property/i.test(l))return "Real estate & housing";
if(/bank|financ|investment/i.test(l))return "Finance & investment";
if(/labor|employee association/i.test(l))return "Labor unions";
if(/insurance/i.test(l))return "Insurance";
if(/legal/i.test(l))return "Legal services";
if(/aerospace|defense/i.test(l))return "Aerospace & defense";
if(/construction|engineering|infrastructure/i.test(l))return "Construction & infrastructure";
if(/energy|utilit|natural resources/i.test(l))return "Energy & utilities";
if(/telecom|broadband/i.test(l))return "Telecommunications";
if(/broadcast|media|arts|entertainment/i.test(l))return "Media & entertainment";
if(/technology|software|electronics/i.test(l))return "Technology";
if(/automotive|manufacturing/i.test(l))return "Manufacturing & automotive";
if(/airline|transport|logistic|aviation/i.test(l))return "Transportation";
if(/agricultur|food & beverage/i.test(l))return "Agriculture, food & beverage";
if(/hospitality|horse racing|gaming/i.test(l))return "Hospitality & gaming";
if(/retail|consumer|foodservice/i.test(l))return "Retail & consumer";
if(/cannabis/i.test(l))return "Cannabis";
if(/school|education/i.test(l))return "Education";
if(/political|candidate|fundraising/i.test(l))return "Political committees & advocacy";
if(/foreign policy/i.test(l))return "Foreign policy & advocacy";
if(/lobby|public affairs|government relations/i.test(l))return "Lobbying & public affairs";
if(/government|public sector/i.test(l))return "Government & public sector";
if(/professional|accounting/i.test(l))return "Professional services";
if(/civil rights|advocacy/i.test(l))return "Other advocacy";
return l||"Sector unconfirmed";}
function aggregateDonors(rows,mode){
 const m=new Map();
 for(const r of rows){
   if(mode==="organization"&&r.type!=="organization"||mode!=="organization"&&r.type!=="individual")continue;
   const key=normalize(mode==="employer"?r.employer||"NOT REPORTED":r.name||"NOT REPORTED");
   let v=m.get(key);if(!v){v={name:key,value:0,count:0,committees:new Map(),sectors:new Set(),employers:new Set()};m.set(key,v);}
   v.value+=r.amount;v.count++;v.committees.set(r.committee,(v.committees.get(r.committee)||0)+r.amount);
   v.sectors.add(r.sector);if(r.type==="individual")v.employers.add(normalize(r.employer||"NOT REPORTED"));
 }
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function aggregateSectors(rows){
 const m=new Map();
 for(const r of rows){let v=m.get(r.sector);if(!v){v={name:r.sector,key:r.sector,value:0,individual:0,organization:0,count:0};m.set(r.sector,v);}v.value+=r.amount;v[r.type]+=r.amount;v.count++;}
 return [...m.values()].sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
}
function donut(host,items,onSelect,active,label){host.replaceChildren();const positive=items.filter(x=>x.value>0),den=sum(positive,"value");if(!den){host.textContent="No positive receipts in this selection.";return;}const wrap=document.createElement("div");wrap.className="ca-chart";const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 220 220");svg.setAttribute("class","ca-donut");svg.setAttribute("role","group");svg.setAttribute("aria-label",label);const radius=84,circ=2*Math.PI*radius;let off=0;const legend=document.createElement("div");legend.className="ca-legend";
positive.forEach((item,i)=>{const color=item.color||sequence[i%sequence.length],c=document.createElementNS(svg.namespaceURI,"circle"),frac=item.value/den;for(const [k,v] of Object.entries({cx:110,cy:110,r:radius,fill:"none",stroke:color,"stroke-width":34,"stroke-dasharray":Math.max(frac*circ-Math.min(1.8,frac*circ*.15),0.01)+" "+circ,"stroke-dashoffset":-off,transform:"rotate(-90 110 110)"}))c.setAttribute(k,v);off+=frac*circ;const desc=item.name+": "+money(item.value)+" ("+pct(item.value,den)+")";const title=document.createElementNS(svg.namespaceURI,"title");title.textContent=desc;c.append(title);if(onSelect){c.setAttribute("role","button");c.setAttribute("tabindex","0");c.setAttribute("aria-label",desc);c.addEventListener("click",()=>onSelect(item));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelect(item);}});}svg.append(c);
const b=document.createElement(onSelect?"button":"div");if(onSelect){b.type="button";b.addEventListener("click",()=>onSelect(item));b.setAttribute("aria-pressed",String(active===item.key));}else{b.style.display="flex";b.style.alignItems="center";b.style.gap="9px";b.style.padding="7px";}if(active===item.key&&onSelect)b.classList.add("ca-selected");b.innerHTML='<span class="ca-swatch" style="background:'+color+'"></span><span class="ca-legend-name">'+esc(item.name)+'</span><span class="ca-legend-value">'+money(item.value)+'<small>'+pct(item.value,den)+'</small></span>';legend.append(b);});
const text=document.createElementNS(svg.namespaceURI,"text");text.setAttribute("x",110);text.setAttribute("y",105);text.setAttribute("text-anchor","middle");text.setAttribute("font-size","11");text.textContent="TOTAL";svg.append(text);const val=document.createElementNS(svg.namespaceURI,"text");val.setAttribute("x",110);val.setAttribute("y",124);val.setAttribute("text-anchor","middle");val.setAttribute("font-size","12");val.setAttribute("font-weight","700");val.textContent=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(den/100);svg.append(val);wrap.append(svg,legend);host.append(wrap);
const nonPositive=items.filter(x=>x.value<=0);if(nonPositive.length){const p=document.createElement("p");p.className="ca-muted";p.textContent="Zero or negative groups are excluded from pie slices; amounts remain in the tables.";host.append(p);}}
function chooseCommittee(key){selected=selected===key?"":key;$("ca-committee").value=selected;sectorSelected="";page=0;render();}
function chooseSector(key){sectorSelected=sectorSelected===key?"":key;$("ca-sector").value=sectorSelected;page=0;renderOrganizations();}
function activeCommittees(){return selected?config.filter(x=>x.key===selected):config;}
function render(){const active=activeCommittees(),ic=sum(active,"individual"),oc=sum(active,"organization"),total=ic+oc,all=sum(config,"individual")+sum(config,"organization");
$("ca-total").textContent=money(total);$("ca-scope").textContent=selected?active[0].name:"All eight committees";$("ca-ind").textContent=money(ic);$("ca-org").textContent=money(oc);$("ca-count").textContent=num(sum(active,"individualCount")+sum(active,"organizationCount"));
const ordered=[...config].sort((a,b)=>gross(b)-gross(a));donut($("ca-committee-pie"),ordered.map((x,i)=>({name:x.name,key:x.key,value:gross(x),color:committeeColors[x.key]})),x=>chooseCommittee(x.key),selected,"Combined receipts by committee");
donut($("ca-source-pie"),[{name:"Individual receipts",key:"ind",value:ic,color:indColor},{name:"PAC / organization receipts",key:"org",value:oc,color:orgColor}],null,"","Receipt sources");
const bars=$("ca-bars");bars.replaceChildren();const key=document.createElement("div");key.className="ca-bar-key";key.innerHTML='<span><i class="ca-swatch" style="background:'+indColor+'"></i>Individual</span><span><i class="ca-swatch" style="background:'+orgColor+'"></i>PAC / organization</span>';bars.append(key);const max=gross(ordered[0]);for(const x of ordered){const b=document.createElement("button");b.type="button";b.className="ca-bar"+(x.key===selected?" ca-selected":"");b.setAttribute("aria-pressed",String(x.key===selected));b.title=x.name+": "+money(gross(x));b.innerHTML='<span>'+esc(x.name)+'</span><span class="ca-track"><span style="background:'+indColor+';width:'+100*x.individual/max+'%"></span><span style="background:'+orgColor+';width:'+100*x.organization/max+'%"></span></span><span class="ca-bar-amount">'+money(gross(x))+'</span>';b.addEventListener("click",()=>chooseCommittee(x.key));bars.append(b);}
$("ca-committee-rows").innerHTML=ordered.map(x=>'<tr><td><a href="'+x.slug+'.html">'+esc(x.name)+'</a></td><td class="jvf-money">'+money(x.individual)+'</td><td class="jvf-money">'+money(x.organization)+'</td><td class="jvf-money"><strong>'+money(gross(x))+'</strong></td><td>'+pct(gross(x),all)+'</td></tr>').join("")+'<tr><th scope="row">Combined total</th><td>'+money(sum(config,"individual"))+'</td><td>'+money(sum(config,"organization"))+'</td><td><strong>'+money(all)+'</strong></td><td>100.00%</td></tr>';
renderOrganizations();}
function renderOrganizations(){
if(!allRecords){$("ca-org-rows").innerHTML='<tr><td colspan="5">Loading all eight committee datasets…</td></tr>';$("ca-prev").disabled=$("ca-next").disabled=true;return;}
const records=selected?allRecords.filter(x=>x.committee===selected):allRecords;
const groups=aggregateSectors(records),opt=$("ca-sector");opt.replaceChildren(new Option("All sectors",""));for(const x of [...groups].sort((a,b)=>a.name.localeCompare(b.name)))opt.add(new Option(x.name,x.name));if(!groups.some(x=>x.name===sectorSelected))sectorSelected="";opt.value=sectorSelected;
const combinedColored=sequentialItems(groups);
const combinedColors=new Map(combinedColored.filter(x=>x.value>0).map(x=>[x.name,x.color]));
donut($("ca-all-sector-pie"),combinedColored,x=>chooseSector(x.key),sectorSelected,"All direct receipts by sector");
donut($("ca-sector-pie"),sequentialItems(groups.filter(x=>x.organization!==0).map(x=>({...x,value:x.organization}))),x=>{mode="organization";$("ca-mode").value=mode;chooseSector(x.key);},sectorSelected,"Direct organizations by sector");
donut($("ca-ind-sector-pie"),sequentialItems(groups.filter(x=>x.individual!==0).map(x=>({...x,value:x.individual}))),x=>{mode="individual";$("ca-mode").value=mode;chooseSector(x.key);},sectorSelected,"Individual receipts by employer sector");
const denominator=sum(groups,"value");
$("ca-sector-rows").innerHTML=groups.map(x=>'<tr><td><button type="button" class="ca-sector-link" data-sector="'+esc(x.name)+'"><span class="ca-swatch ca-sector-swatch" style="background:'+(combinedColors.get(x.name)||'transparent')+'" aria-hidden="true"></span>'+esc(x.name)+'</button></td><td class="jvf-money">'+money(x.organization)+'</td><td class="jvf-money">'+money(x.individual)+'</td><td class="jvf-money"><strong>'+money(x.value)+'</strong></td><td>'+pct(x.value,denominator)+'</td></tr>').join("")+'<tr><th scope="row">'+(loadFailures.length?"Loaded subtotal":"Total")+'</th><td>'+money(sum(groups,"organization"))+'</td><td>'+money(sum(groups,"individual"))+'</td><td><strong>'+money(denominator)+'</strong></td><td>'+(denominator?"100.00%":"—")+'</td></tr>';
for(const b of $("ca-sector-rows").querySelectorAll("button"))b.addEventListener("click",()=>chooseSector(b.dataset.sector));
$("ca-name-heading").textContent=mode==="organization"?"Organization / PAC":mode==="individual"?"Individual donor":"Reported employer";
const candidates=aggregateDonors(records,mode);
const donors=candidates.filter(x=>(!sectorSelected||x.sectors.has(sectorSelected))&&(!query||x.name.includes(query)||[...x.employers].some(v=>v.includes(query))));
const max=Math.max(1,Math.ceil(donors.length/pageSize));page=Math.max(0,Math.min(page,max-1));const rows=donors.slice(page*pageSize,(page+1)*pageSize);
$("ca-org-rows").innerHTML=rows.length?rows.map(x=>'<tr><td class="jvf-contributor">'+esc(x.name)+'</td><td>'+esc([...x.sectors].sort().join("; "))+(mode==="individual"?'<small class="jvf-row-note">'+esc([...x.employers].sort().join("; "))+'</small>':"")+'</td><td><details><summary>'+x.committees.size+' '+(x.committees.size===1?"committee":"committees")+'</summary><div class="ca-breakdown">'+[...x.committees].sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=config.find(y=>y.key===k);return '<div><a href="'+c.slug+'.html">'+esc(c.name)+'</a><strong>'+money(v)+'</strong></div>';}).join("")+'</div></details></td><td>'+num(x.count)+'</td><td class="jvf-money"><strong>'+money(x.value)+'</strong></td></tr>').join(""):'<tr><td colspan="5">No matching donors.</td></tr>';
$("ca-result-count").textContent=num(donors.length)+" reported names · "+money(sum(donors,"value"))+(sectorSelected?" · Full donor totals within selected committees":"");$("ca-page").textContent="Page "+(page+1)+" of "+max;$("ca-prev").disabled=page===0;$("ca-next").disabled=page>=max-1;
}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Unable to load "+path);return r.json();}
async function unpack([count,base64]){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const rows=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text());if(rows.length!==count)throw Error("Invalid compressed chunk");return rows;}
function paths(c,kind,n){return n?Array.from({length:n},(_,i)=>"data/"+c.key+"-"+kind+"-"+(i+1)+".json"):["data/"+c.key+"-"+kind+".json"];}
async function loadCommittee(c){
let org=[],ind=[],emp=[];
if(c.key==="jcavf"){ind=[["VRADENBURG, GEORGE","NOT EMPLOYED","RETIRED","2025-09-16",500000]];}
else if(c.key==="jfc"){
const m=await json("data/jfc-manifest.json");
async function load(g){const blocks=(await Promise.all(g.paths.map(json))).flat();const chunks=await Promise.all(blocks.map(unpack));const r=chunks.flat();if(r.length!==g.count)throw Error("Incomplete compressed data: "+c.name);return r;}
[org,ind]=await Promise.all([load(m.groups.organization),load(m.groups.individual)]);
}else{
const sources=await Promise.all([Promise.all(paths(c,"organizations",c.no).map(json)),Promise.all(paths(c,"individuals",c.ni).map(json)),c.key==="jvf"?Promise.resolve([]):json("data/"+c.key+"-employers.json")]);
org=sources[0].flat().filter(r=>!r[4]);ind=sources[1].flat().filter(r=>!r[5]);emp=sources[2];
}
if(org.length!==c.organizationCount||org.reduce((n,r)=>n+r[3],0)!==c.organization)throw Error("Organization totals mismatch: "+c.name);
if(ind.length!==c.individualCount||ind.reduce((n,r)=>n+r[4],0)!==c.individual)throw Error("Individual totals mismatch: "+c.name);
const emap=new Map(emp.filter(r=>typeof r[1]==="string").map(r=>[normalize(r[0]),r[1]]));
const employerSector=name=>{const n=normalize(name);if(!n||status.test(n))return "Personal status / unreported employer";return harmonize(n,emap.get(n)||sector(n));};
return [...org.map(r=>({name:r[0],type:"organization",sector:harmonize(r[0],c.key==="jfc"?sector(r[0]):r[1]),amount:r[3],committee:c.key})),...ind.map(r=>({name:r[0],type:"individual",employer:r[1]||"NOT REPORTED",sector:employerSector(r[1]),amount:r[4],committee:c.key}))];
}
async function start(){
for(const c of config)$("ca-committee").add(new Option(c.name,c.key));
$("ca-committee").addEventListener("change",e=>{selected=e.target.value;sectorSelected="";page=0;render();});
$("ca-sector").addEventListener("change",e=>{sectorSelected=e.target.value;page=0;renderOrganizations();});
$("ca-mode").addEventListener("change",e=>{mode=e.target.value;page=0;renderOrganizations();});
$("ca-search").addEventListener("input",e=>{query=normalize(e.target.value);page=0;renderOrganizations();});
$("ca-reset").addEventListener("click",()=>{selected=sectorSelected=query="";mode="organization";page=0;$("ca-committee").value=$("ca-search").value="";$("ca-mode").value=mode;render();});
$("ca-prev").addEventListener("click",()=>{page--;renderOrganizations();});$("ca-next").addEventListener("click",()=>{page++;renderOrganizations();});
$("ca-status").textContent="Reconciling all eight committees…";render();
const results=await Promise.allSettled(config.map(loadCommittee));allRecords=[];loadFailures=[];
results.forEach((r,i)=>{if(r.status==="fulfilled"){allRecords.push(...r.value);loadedCommittees++;}else{loadFailures.push(config[i].name+": "+String(r.reason?.message||r.reason));console.error(r.reason);}});
const expected=sum(config,"individual")+sum(config,"organization"),actual=sum(allRecords,"amount");
if(!loadFailures.length&&(actual!==expected||allRecords.length!==sum(config,"individualCount")+sum(config,"organizationCount")))loadFailures.push("Combined source reconciliation failed");
$("ca-status").textContent=loadFailures.length?"PARTIAL DATA: "+loadedCommittees+" of 8 committees loaded. "+loadFailures.join("; "):"All 8 committees reconciled · "+num(allRecords.length)+" direct records";
if(loadFailures.length){for(const id of ["ca-all-sector-pie","ca-sector-pie","ca-ind-sector-pie","ca-sector-rows","ca-org-rows"]){$(id).closest("section")?.classList.add("ca-partial");}}
renderOrganizations();
}
start().catch(e=>{$("ca-status").textContent="Dashboard error: "+e.message;console.error(e);});})();