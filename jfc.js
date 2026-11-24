(() => {
"use strict";
const $=id=>document.getElementById(id);
const money=c=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const source=n=>/^\d{15,20}$/.test(String(n))?'<a class="jvf-fec-link" href="https://docquery.fec.gov/cgi-bin/fecimg/?'+n+'" target="_blank" rel="noopener noreferrer">FEC filing</a>':"—";
const sum=(r,i)=>r.reduce((a,x)=>a+x[i],0);
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
function table(headers,rows){return '<div class="jvf-table-wrap"><table class="jvf-table"><thead><tr>'+headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';}
const cell=x=>'<td>'+esc(x||"—")+'</td>';
const amt=x=>'<td class="jvf-money">'+money(x)+'</td>';
const orgrow=r=>'<tr><td class="jvf-contributor">'+esc(r[0])+(r[4]?'<small class="jvf-row-note">'+esc(r[4])+'</small>':"")+'</td>'+cell(r[1]==="PAC"?"Political Action Committee":r[1]==="CCM"?"Candidate Committee":"Organization")+cell(r[2])+amt(r[3])+'<td>'+source(r[5])+'</td></tr>';
const indrow=r=>'<tr><td class="jvf-contributor">'+esc(r[0])+(r[5]?'<small class="jvf-row-note">'+esc(r[5])+'</small>':"")+'</td>'+cell(r[1])+cell(r[2])+cell(r[3])+amt(r[4])+'<td>'+source(r[6])+'</td></tr>';
const emprow=r=>'<tr><td class="jvf-contributor">'+esc(r[0])+'</td><td>'+r[2].toLocaleString()+'</td>'+amt(r[1])+'</tr>';
function groups(rows){const m=new Map();for(const r of rows){const s=sector(r[0]);if(!m.has(s))m.set(s,[]);m.get(s).push(r);}return [...m].sort(([a],[b])=>a.localeCompare(b));}
function paged(id,rows,headers,render,{sectors=false,amountIndex=3,pageSize=100,placeholder="Search names…"}={}){
 const host=$(id);host.replaceChildren();let page=0;
 const bar=document.createElement("div");bar.className="jfc-toolbar";
 const search=document.createElement("input");search.type="search";search.placeholder=placeholder;search.setAttribute("aria-label",placeholder);bar.append(search);
 const select=document.createElement("select");select.setAttribute("aria-label","Filter sector");
 if(sectors){select.add(new Option("All sectors",""));for(const [s] of groups(rows))select.add(new Option(s,s));bar.append(select);}
 const result=document.createElement("div");const nav=document.createElement("div");nav.className="jfc-pagination";
 const count=document.createElement("span");count.className="jfc-count";count.setAttribute("aria-live","polite");
 const prev=document.createElement("button"),next=document.createElement("button");for(const b of [prev,next]){b.type="button";b.className="jfc-control";}prev.textContent="Previous";next.textContent="Next";nav.append(count,prev,next);host.append(bar,result,nav);
 function draw(){const q=search.value.trim().toLowerCase(),s=sectors?select.value:"";
  const filtered=rows.filter(r=>(!s||sector(r[0])===s)&&(!q||r.slice(0,3).some(v=>String(v).toLowerCase().includes(q))));
  const ordered=sectors?groups(filtered).flatMap(([k,rr])=>rr):filtered;
  const max=Math.max(1,Math.ceil(ordered.length/pageSize));page=Math.min(page,max-1);
  const slice=ordered.slice(page*pageSize,(page+1)*pageSize);
  if(!slice.length)result.textContent="No matching records.";
  else if(sectors){const totals=new Map(groups(ordered).map(([k,rs])=>[k,[rs.length,sum(rs,amountIndex)]]));result.innerHTML=groups(slice).map(([k,rs])=>'<section class="jvf-sector-section"><h2>'+esc(k)+'</h2><p class="jvf-section-meta">'+totals.get(k)[0].toLocaleString()+' records · '+money(totals.get(k)[1])+'</p>'+table(headers,rs.map(render))+'</section>').join("");}
  else result.innerHTML=table(headers,slice.map(render));
  count.textContent=ordered.length?((page*pageSize+1).toLocaleString()+"–"+Math.min((page+1)*pageSize,ordered.length).toLocaleString()+" of "+ordered.length.toLocaleString()+" · Page "+(page+1)+" of "+max):"0 records";prev.disabled=page===0;next.disabled=page>=max-1;
 }
 search.addEventListener("input",()=>{page=0;draw();});select.addEventListener("change",()=>{page=0;draw();});prev.addEventListener("click",()=>{page--;draw();});next.addEventListener("click",()=>{page++;draw();});draw();
}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Unable to load "+path);return r.json();}
async function unpack([count,base64]){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));const rows=JSON.parse(await new Response(stream).text());if(!Array.isArray(rows)||rows.length!==count)throw Error("Corrupt data chunk");return rows;}
async function load(g){const blocks=(await Promise.all(g.paths.map(json))).flat();const rows=(await Promise.all(blocks.map(unpack))).flat();if(rows.length!==g.count)throw Error("Incomplete records");return rows;}
const orgheaders=["Organization / committee","FEC classification","Date","Amount","Source"],indheaders=["Individual donor","Reported employer","Reported occupation","Date","Amount","Source"];
async function start(){
 try{const m=await json("data/jfc-manifest.json");if(m.committee!=="C00503052")throw Error("Wrong committee");
 const [org,emp,ind,im]=await Promise.all(["organization","employers","individual","individual-memo"].map(k=>load(m.groups[k])));
 if(sum(org,3)!==m.directOrganizationCents||sum(ind,4)!==m.directIndividualCents||sum(emp,1)!==m.directIndividualCents||sum(emp,2)!==ind.length)throw Error("Direct receipts do not reconcile");
 $("jvf-summary").textContent=org.length.toLocaleString()+" organization/committee records ("+money(sum(org,3))+") · "+ind.length.toLocaleString()+" individual records ("+money(sum(ind,4))+") · Total direct receipts "+money(sum(org,3)+sum(ind,4));
 paged("jvf-sectors",org,orgheaders,orgrow,{sectors:true,amountIndex:3,placeholder:"Search organizations or PACs…"});
 paged("jmf-employers",emp,["Reported employer / status","Direct individual receipts","Individual receipt total"],emprow,{sectors:true,amountIndex:1,placeholder:"Search reported employers…"});
 paged("jvf-individuals",ind,indheaders,indrow,{placeholder:"Search individual donors, employers or occupations…"});
 paged("jvf-individual-memo",im,indheaders,indrow,{placeholder:"Search individual memo records…"});
 $("jvf-memo-summary").textContent=im.length.toLocaleString()+" individual memo records and "+m.groups["organization-memo"].count.toLocaleString()+" organization/intermediary memo records. These are not added to the direct-receipt totals.";
 const btn=$("jfc-load-org-memos");btn.addEventListener("click",async()=>{btn.disabled=true;btn.textContent="Loading organization memos…";try{const rows=await load(m.groups["organization-memo"]);paged("jvf-organization-memo",rows,orgheaders,orgrow,{placeholder:"Search intermediary or organization…"});btn.remove();}catch(err){btn.disabled=false;btn.textContent="Retry loading organization memo records";console.error(err);}});
 $("jvf-status").remove();
 }catch(err){$("jvf-status").textContent="Unable to load or reconcile contribution data. Please reload the page.";console.error(err);}
}
start();
})();