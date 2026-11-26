const config=[{"name":"Friends of Schumer PAC","slug":"friends-of-schumer-pac","key":"friends-of-schumer-pac","id":"C00346312","individual":40833975,"organization":17337500,"individualCount":12681,"organizationCount":58,"memos":12669,"memoAmount":39551075,"otherCount":0,"otherAmount":0,"uniqueRecords":25408},{"name":"IMPACT PAC","slug":"impact-pac","key":"impact-pac","id":"C00348607","individual":5962500,"organization":105332500,"individualCount":20,"organizationCount":258,"memos":7,"memoAmount":2800000,"otherCount":0,"otherAmount":0,"uniqueRecords":285},{"name":"SMP PAC","slug":"smp-pac","key":"smp-pac","id":"C00484642","individual":9802117139,"organization":21474682077,"individualCount":36135,"organizationCount":153,"memos":15204,"memoAmount":293471964,"otherCount":64,"otherAmount":18863800,"uniqueRecords":51556}];
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
const personalCategories=["Retired","Not employed / unemployed","Students","Homemakers","Self-employed (role unspecified)","Occupation unreported"];
function personalRole(t){
 if(!t||/^(N\/?A|NONE|UNKNOWN|NOT PROVIDED|NOT REPORTED|INFORMATION REQUESTED(?: PER BEST EFFORTS)?|REFUSED|REQUESTED|NULL|NOT AVAILABLE|NOT DISCLOSED|DECLINED)$/.test(t))return "Occupation unreported";
 if(/\bRETIRED\b/.test(t))return "Retired";
 if(/\b(HOMEMAKER|HOME MAKER|STAY AT HOME|HOUSEWIFE|HOUSEHUSBAND)\b/.test(t))return "Homemakers";
 if(/\bSTUDENT\b/.test(t))return "Students";
 if(/\b(NOT EMPLOYED|UNEMPLOYED|NOT WORKING)\b/.test(t))return "Not employed / unemployed";
 return "";
}
function occupationGroup(raw){
 const t=String(raw??"").toUpperCase().trim().replace(/\./g,"").replace(/[-–]/g," ").replace(/\s+/g," ");
 const personal=personalRole(t);if(personal)return personal;
 if(/\b(ASSISTANT TO|SECRETARY TO|AIDE TO|ADVISOR TO|ADVISER TO)\b/.test(t))return "Other reported occupations";
 if(/\b(CEO|CO CEO|CHIEF EXECUTIVE OFFICER)\b/.test(t))return "Chief executive officers";
 if(/\b(CHAIRMAN|CHAIRWOMAN|CHAIRPERSON|CHAIR|CO CHAIR|BOARD MEMBER|BOARD DIRECTOR|TRUSTEE)\b/.test(t))return "Chairs / board members / trustees";
 if(/\b(CFO|COO|CTO|CIO|CMO|CHRO|CLO|CSO|CPO|CRO|CHIEF (FINANCIAL|OPERATING|TECHNOLOGY|INFORMATION|INVESTMENT|MARKETING|LEGAL|STRATEGY|PEOPLE|PRODUCT|RISK|HUMAN RESOURCES) OFFICER)\b/.test(t))return "Other C-suite officers";
 if(/\b(VICE PRESIDENT|VP|SVP|EVP|AVP)\b/.test(t))return "Vice presidents";
 if(/\bPRESIDENT\b/.test(t))return "Presidents";
 if(/\b(FOUNDER|COFOUNDER|CO FOUNDER|OWNER|PROPRIETOR)\b/.test(t))return "Founders / business owners";
 if(/\b(PARTNER|PRINCIPAL)\b/.test(t))return "Partners / principals";
 if(/\b(MANAGING DIRECTOR|EXECUTIVE DIRECTOR|EXECUTIVE|EXEC|GENERAL COUNSEL|CHIEF OF STAFF)\b/.test(t))return "Other executives / managing directors";
 if(/\b(MANAGER|DIRECTOR|SUPERVISOR|HEAD OF)\b/.test(t))return "Managers / directors";
 if(/\b(SELF EMPLOYED|SELF)\b/.test(t))return "Self-employed (role unspecified)";
 return "Other reported occupations";
}

const pending=new Map();
function category(r){return r[5]?"memo":!["11AI","11C"].includes(r[11])?"other":r[8]==="IND"?"individual":"organization";}
function rowSector(r){const n=r[8]==="IND"?r[1]:r[0];return harmonize(n,sector(n));}
async function loadRows(c){if(!pending.has(c.key))pending.set(c.key,(async()=>{const path="/"+c.key+".json";const res=await fetch(path);if(!res.ok)throw Error("Schumer dataset unavailable: "+path);const rows=await res.json();if(!Array.isArray(rows)||rows.length!==c.uniqueRecords)throw Error("Incomplete dataset: "+c.name);const keys=new Set(),counts={individual:0,organization:0,memo:0,other:0},sums={individual:0,organization:0,memo:0,other:0};for(const r of rows){if(!Array.isArray(r)||r.length!==18||!Number.isSafeInteger(r[4])||typeof r[5]!=="boolean"||!r[9]||!r[10])throw Error("Invalid receipt: "+c.name);const k=JSON.stringify([r[9],r[10]]);if(keys.has(k))throw Error("Duplicate receipt: "+c.name);keys.add(k);const kind=category(r);counts[kind]++;sums[kind]+=r[4];}for(const [k,count,amount] of [["individual",c.individualCount,c.individual],["organization",c.organizationCount,c.organization],["memo",c.memos,c.memoAmount],["other",c.otherCount,c.otherAmount]])if(counts[k]!==count||sums[k]!==amount)throw Error("Receipt reconciliation failed: "+c.name+" / "+k);return rows;})().catch(e=>{pending.delete(c.key);throw e;}));return pending.get(c.key);}
function toRecord(r,c){return {name:r[0],type:r[8]==="IND"?"individual":"organization",employer:r[1]||"NOT REPORTED",occupation:r[2]||"NOT REPORTED",sector:rowSector(r),amount:r[4],committee:c.key,memo:r[5],image:r[7],filing:r[9],transaction:r[10]};}
async function loadCommittee(c){return (await loadRows(c)).filter(r=>["individual","organization"].includes(category(r))).map(r=>toRecord(r,c));}
async function loadResearchRecords(){return (await Promise.all(config.map(loadCommittee))).flat();}
async function loadDirectoryRecords(){return (await Promise.all(config.map(async c=>(await loadRows(c)).filter(r=>category(r)!=="other").map(r=>toRecord(r,c))))).flat();}
export {config,normalize,occupationGroup,personalCategories,loadCommittee,loadResearchRecords,loadDirectoryRecords,loadRows,category,rowSector};
