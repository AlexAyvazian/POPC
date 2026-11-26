import {businessIdentities} from './business-identities.js?v=49';
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

const normalize=s=>String(s||"").trim().replace(/\s+/g," ").toUpperCase();
function harmonize(name,label){
const l=String(label||"");if(/unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(l))return "Sector unresolved / ambiguous";
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
const unknownSectorLabel=label=>!label||/unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(String(label));
const exactSectorOverrides=new Map(Object.entries({
"STREAM LINE CIRCLE LLC":"Transportation",
"LIBRA GROUP":"Diversified business group",
"BHANDAL SECURITY":"Security services",
"NW INTERNATIONAL WOMEN'S CONFERENCE":"Other advocacy",
"JSI":"Healthcare",
"HSK CONSULTING LLC":"Professional services",
"HSK CONSULTING":"Professional services",
"PAUL HASTINGS LLP":"Legal services",
"PAUL HASTINGS":"Legal services",
"BAKER HOSTETLER":"Legal services",
"CORKY HALE PRODUCTIONS":"Media & entertainment",
"CAPITOL COUNSEL LLC":"Lobbying & public affairs",
"CAPITOL COUNSEL":"Lobbying & public affairs",
"RAINWATER CONSULTING LLC":"Professional services",
"WOLFE RESEARCH, LLC":"Finance & investment",
"FRIEDMAN KAPLAN LLP":"Legal services",
"LIPA":"Government & public sector",
"BERKOWITZ DEVELOPMENT GROUP":"Real estate & housing",
"DACH STRATEGY GROUP LLC":"Professional services",
"WME":"Media & entertainment",
"VESTED":"Professional services",
"THE CORCORAN GROUP":"Real estate & housing",
"ORRICK":"Legal services",
"LAGUNA PALMS ORTHODONTICS":"Healthcare",
"VIVAGE":"Healthcare",
"CASSENA CARE":"Healthcare",
"GOVALIDATE":"Technology",
"JACKSON OFFSHORE OPERATORS LLC":"Transportation",
"WILLIAMS AND CONNOLLY LLP":"Legal services",
"RED ART CAPITAL":"Finance & investment",
"WEST AND FEINBERG, P.C.":"Legal services",
"HOUSTON INTERNATIONAL DANCE COALITION":"Media & entertainment",
"BERGER SINGERMAN LLP":"Legal services",
"BROOKINGS":"Other advocacy",
"WEINBERG & COMPANY P.C.":"Professional services",
"MARYLAND GENERAL ASSEMBLY":"Government & public sector",
"WASHINGTON INDEPENDENT PRODUCTIONS":"Media & entertainment",
"QXO":"Construction & infrastructure",
"VAN NESS FELDMAN LLP":"Legal services",
"KING & SPALDING":"Legal services",
"SILVER FREEDMAN TAFF & TIERNAN LLP":"Legal services",
"GROVER STRATEGIES LLC":"Professional services",
"REGAL DOMESTICS":"Professional services",
"C4T THERAPEUTICS, NEXTRNA, AI PROTEINS":"Healthcare",
"CUSHMAN AND WAKEFIELD":"Real estate & housing",
"CUSHMAN & WAKEFIELD":"Real estate & housing",
"FS PAC":"Political committees & advocacy",
"EISNER ADVISORY LLC":"Professional services",
"SILVER MARKETING INC.":"Professional services",
"ERNESTA HOME INC.":"Retail & consumer",
"HEART TO HEART HOSPICE":"Healthcare",
"GJELAJ LAW":"Legal services",
"PATTERSON PLANNING & SERVICES":"Professional services",
"PATTERSON PLANNING & SERVICES, INC.":"Professional services",
"TJ FARMS LLC":"Agriculture, food & beverage",
"EMPIRE OFFICE INC.":"Professional services",
"FOSTER GARVEY PC":"Legal services",
"WATERS KRAUS PAUL AND SIEGEL":"Legal services",
"MONTGOMERY COUNTY MARYLAND":"Government & public sector",
"LALIEWORKS CREATIVE CONTENT SERVICES":"Media & entertainment",
"RANDOM HOUSE":"Media & entertainment"
}).map(([name,label])=>[normalize(name),label]));

const identityIndex=new Map();
for(const entry of businessIdentities){
  for(const alias of [...(entry.aliases||[]),...(entry.name?[entry.name]:[])]) identityIndex.set(normalize(alias),entry);
}

function sectorFromIdentityScope(name){
  const entry=identityIndex.get(normalize(name));
  if(!entry||entry.status==='Reviewed label')return "";
  const s=String(entry.scope||"").toUpperCase();
  const scopeRules=[
    ["Political committees & advocacy",/\b(FEDERAL .*POLITICAL COMMITTEE|POLITICAL COMMITTEE|CAMPAIGN COMMITTEE|PAC\b)/],
    ["Government & public sector",/\b(PUBLIC AUTHORITY|GOVERNMENT|PUBLIC SECTOR|SOVEREIGN TRIBAL)\b/],
    ["Finance & investment",/\b(INVESTMENT|VENTURE[- ]CAPITAL|PRIVATE[- ]EQUITY|HEDGE FUND|ASSET|TRADING|BROKERAGE|FINANCIAL[- ]SERVICES|FAMILY OFFICE|PRIVATE[- ]CAPITAL)\b/],
    ["Legal services",/\b(LAW FIRM|LEGAL SERVICES|LEGAL PRACTICE)\b/],
    ["Real estate & housing",/\b(REAL[- ]ESTATE|REAL ESTATE|PROPERTY|HOUSING)\b/],
    ["Healthcare",/\b(HEALTHCARE|HEALTH CARE|MEDICAL|HEALTH SYSTEM|SENIOR[- ]CARE|BIOTECHNOLOGY|ANIMAL[- ]HEALTH|CLINICAL|HOSPICE)\b/],
    ["Lobbying & public affairs",/\b(LOBBYING|PUBLIC[- ]AFFAIRS|GOVERNMENT RELATIONS|PUBLIC AFFAIRS)\b/],
    ["Technology",/\b(TECHNOLOGY|SOFTWARE|CYBERSECURITY|DIGITAL[- ]IDENTITY|DIGITAL PLATFORM|AUTOMATION SYSTEMS)\b/],
    ["Education",/\b(EDUCATION|SCHOOL|UNIVERSITY|COLLEGE|RESEARCH AND EDUCATION)\b/],
    ["Media & entertainment",/\b(MEDIA|ENTERTAINMENT|FILM|PRODUCTION|PUBLISH|MUSIC|THEATER|THEATRE)\b/],
    ["Construction & infrastructure",/\b(CONSTRUCTION|CONTRACTOR|INFRASTRUCTURE|ENGINEERING|BUILDING[- ]PRODUCTS)\b/],
    ["Energy & utilities",/\b(ENERGY|UTILITY|RENEWABLE|POWER)\b/],
    ["Telecommunications",/\b(TELECOMMUNICATIONS|TELECOM|BROADBAND)\b/],
    ["Transportation",/\b(TRANSPORTATION|AVIATION|LOGISTICS|MARITIME|SHIPPING|OFFSHORE MARINE)\b/],
    ["Retail & consumer",/\b(RETAIL|CONSUMER|APPAREL|HOME FURNISHINGS)\b/],
    ["Hospitality & gaming",/\b(HOSPITALITY|HOTEL|RESTAURANT|GAMING)\b/],
    ["Cannabis",/\bCANNABIS\b/],
    ["Aerospace & defense",/\b(AEROSPACE|DEFENSE)\b/],
    ["Insurance",/\b(INSURANCE|RISK MANAGEMENT)\b/],
    ["Professional services",/\b(CONSULTING|CONSULTANCY|ADVISORY|STRATEGY|COMMUNICATIONS FIRM|INTERIOR[- ]DESIGN|INTERIOR DESIGN|PROFESSIONAL[- ]SERVICES|STAFFING|PLACEMENT)\b/],
    ["Manufacturing & automotive",/\b(MANUFACTURING|MANUFACTURER|INDUSTRIAL|AUTOMOTIVE)\b/],
    ["Agriculture, food & beverage",/\b(AGRICULTURAL|AGRICULTURE|FOOD|BEVERAGE|SEAFOOD|FARM)\b/],
    ["Other advocacy",/\b(NONPROFIT|PHILANTHROP|ADVOCACY|FOUNDATION|CIVIC INITIATIVE|WOMEN'S CONFERENCE)\b/]
  ];
  for(const [label,re] of scopeRules)if(re.test(s))return label;
  return "";
}

const globalSectorPaths=[
  "data/jeff-pac-employers.json",
  "data/jmf-employers.json",
  "data/jbpf-employers.json",
  "data/dvtlf-employers.json",
  "data/jcvf-employers.json"
];
let globalSectorPromise;
function loadGlobalSectorMap(){
  if(!globalSectorPromise)globalSectorPromise=Promise.all(globalSectorPaths.map(json)).then(files=>{
    const map=new Map(),conflicts=new Set();
    for(const rows of files)for(const row of rows){
      const name=normalize(row[0]),raw=row[1];
      if(!name||unknownSectorLabel(raw)||/personal|self.employ|not employed|non.employer|unreported|non.individual/i.test(String(raw)))continue;
      const label=harmonize(name,raw);
      if(conflicts.has(name))continue;
      if(map.has(name)&&map.get(name)!==label){map.delete(name);conflicts.add(name);}
      else map.set(name,label);
    }
    return map;
  }).catch(e=>{globalSectorPromise=undefined;throw e;});
  return globalSectorPromise;
}

function classifySectorLabel(name,mappedLabel="",globalSectors=new Map()){
  const n=normalize(name);
  if(!n||status.test(n))return "Personal status / unreported employer";
  const exact=exactSectorOverrides.get(n);
  if(exact)return exact;
  if(mappedLabel&&!unknownSectorLabel(mappedLabel))return harmonize(n,mappedLabel);
  const global=globalSectors.get(n);
  if(global)return global;
  const researched=sectorFromIdentityScope(n);
  if(researched)return researched;
  return harmonize(n,sector(n));
}

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
async function json(path){const r=await fetch(path);if(!r.ok)throw Error("Unable to load "+path);return r.json();}
async function unpack([count,base64]){const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const rows=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text());if(rows.length!==count)throw Error("Invalid compressed chunk");return rows;}
function paths(c,kind,n){return n?Array.from({length:n},(_,i)=>"data/"+c.key+"-"+kind+"-"+(i+1)+".json"):["data/"+c.key+"-"+kind+".json"];}
async function loadCommittee(c){
const globalSectors=await loadGlobalSectorMap();
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
const employerSector=name=>classifySectorLabel(name,emap.get(normalize(name))||"",globalSectors);
return [...org.map(r=>({name:r[0],type:"organization",sector:classifySectorLabel(r[0],c.key==="jfc"?"":r[1],globalSectors),amount:r[3],committee:c.key})),...ind.map(r=>({name:r[0],type:"individual",employer:r[1]||"NOT REPORTED",occupation:r[2]||"NOT REPORTED",sector:employerSector(r[1]),amount:r[4],committee:c.key}))];
}

let dataPromise;
function loadResearchRecords(){
 if(!dataPromise)dataPromise=Promise.all(config.map(loadCommittee)).then(parts=>parts.flat()).catch(e=>{dataPromise=undefined;throw e;});
 return dataPromise;
}
export {config,normalize,occupationGroup,personalCategories,classifySectorLabel,loadCommittee,loadResearchRecords};
