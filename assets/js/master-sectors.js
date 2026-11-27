import {businessIdentities} from '../../data/jeffries/business-identities.js?v=categories1';
import {schumerIdentities} from '../../data/schumer/schumer-identities.js?v=categories1';
export const masterSectors=Object.freeze(["Aerospace & defense","Agriculture, food & beverage","Cannabis","Construction & infrastructure","Diversified business group","Education","Energy & utilities","Facilities & environmental services","Finance & investment","Foreign policy & advocacy","Furniture & woodworking","Government & public sector","Health insurance","Healthcare","Hospitality & gaming","Insurance","Labor unions","Legal services","Lobbying & public affairs","Manufacturing & automotive","Media & entertainment","Metals & materials processing","Nonprofit & philanthropy","Civil rights & civic advocacy","Environment & conservation","Gun safety","Public policy research","Pharmaceuticals & biotechnology","Political committees & advocacy","Professional services","Real estate & housing","Retail & consumer","Security services","Technology","Telecommunications","Trade associations","Transportation","Tribal nations & governments","Personal status / unreported employer","Sector unresolved / ambiguous"]);
const status=/^(NOT EMPLOYED|RETIRED|SELF[ -]?EMPLOYED|SELF|N\/A|NA|NONE|NULL|NOT REPORTED|INFORMATION REQUESTED|INFORMATION REQUESTED PER BEST EFFORTS|UNEMPLOYED|HOMEMAKER|HOME MAKER|STUDENT|UNKNOWN|NOT AVAILABLE|REQUESTED|NOT PROVIDED|NOT DISCLOSED|DECLINED|REFUSED)$/i;
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
["Gun safety",/\b(EVERYTOWN|GIFFORDS|GUN SAFETY|GUN VIOLENCE)\b/],
["Environment & conservation",/\b(SIERRA CLUB|LEAGUE OF CONSERVATION VOTERS|HUMANE SOCIETY|HUMANE WORLD|RESOURCE CONSERVATION|CONSERVATION AND DEVELOPMENT)\b/],
["Civil rights & civic advocacy",/\b(HUMAN RIGHTS CAMPAIGN|ANTI-DEFAMATION LEAGUE|CITIZENS UNION|NATIONAL ORGANIZATION FOR WOMEN|DISABILITY REPRESENTATIVES|SOCIAL WORKERS|CHICAGO CRED|LEADERSHIP NOW PROJECT|INTERNATIONAL WOMEN'S CONFERENCE)\b/],
["Public policy research",/\b(BROOKINGS|CENTURY FOUNDATION|THINK TANK)\b/],
["Foreign policy & advocacy",/\b(JSTREET|J STREET|AMERICAN JEWISH COMMITTEE)\b/],
["Healthcare",/\b(PLANNED PARENTHOOD|ALS ASSOCIATION|HEMOPHILIA|MENTAL HYGIENE)\b/],
["Nonprofit & philanthropy",/\b(ARNOLD VENTURES|PIVOTAL VENTURES|FOUNDATION|NONPROFIT|CHARITY)\b/],
["Political committees & advocacy",/\b(END CITIZENS UNITED)\b/],
["Government & Public Sector",/\b(CITY OF|COUNTY OF|STATE OF|U\.S\. DEPARTMENT|US DEPARTMENT|GOVERNMENT OF|GOVERNMENT AGENCY|DEPARTMENT OF|PUBLIC SECTOR|US GOVERNMENT|FEDERAL GOVERNMENT|NATIONAL WEATHER SERVICE|NARFE)\b/],
["Political Committees & Fundraising Intermediaries",/\b(ACTBLUE|DEMOCRATIC|DEMOCRATS|DEMINGS PAC|CROSSPARTISAN|LEADERSHIP PAC|VICTORY FUND|POLITICAL PARTY|POLITICAL COMMITTEES|CAMPAIGN COMMITTEE)\b/]
];
function sector(name){const n=String(name||"").toUpperCase().trim();if(!n||status.test(n))return "Self-employment / Personal or Unreported Status";for(const [s,re] of rules){if(re.test(n))return s;}return "Sector unconfirmed / Further research";}

const normalize=s=>String(s||"").trim().replace(/\s+/g," ").toUpperCase();
export function canonicalSector(name,label){
const l=String(label||"").trim(), lower=l.toLowerCase();
if(masterSectors.includes(l))return l;
if(/^(Other advocacy|Civil Rights, Environment & Other Advocacy)$/i.test(l))return name?canonicalSector(name,sector(name)):"Sector unresolved / ambiguous";
if(/cosmetics|personal care|electrical equipment|^manufacturing$/i.test(l))return "Manufacturing & automotive";
if(/landscaping|waste|environmental services/i.test(l))return "Facilities & environmental services";
if(/window coverings|commercial shade contractor/i.test(l))return "Construction & infrastructure";
if(/religion|faith.based/i.test(l))return "Nonprofit & philanthropy";
if(/marketing services|digital transformation|management \/|sales \/|business services/i.test(l))return "Professional services";
if(/restaurants|food service|hospitality.*travel/i.test(l))return "Hospitality & gaming";
if(/^government$/i.test(l))return "Government & public sector";
if(/^agriculture$|^food & beverage$/i.test(l))return "Agriculture, food & beverage";
if(/^consumer products$/i.test(l))return "Retail & consumer";
if(/unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(l))return "Sector unresolved / ambiguous";
if(/personal|self.employ|not employed|non.employer|unreported|non.individual/i.test(l))return "Personal status / unreported employer";
if(/security service/i.test(l))return "Security services";
if(/earmark|political fundraising|political advocacy|candidate|fundraising intermediar|political committee/i.test(l))return "Political committees & advocacy";
if(/diversified business group/i.test(l))return "Diversified business group";
if(/tribal|indian nation|indian community/i.test(l))return "Tribal nations & governments";
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
if(/metals?\s*&|materials processing/i.test(l))return "Metals & materials processing";
if(/airline|transport|logistic|aviation/i.test(l))return "Transportation";
if(/agricultur|food & beverage/i.test(l))return "Agriculture, food & beverage";
if(/hospitality|horse racing|gaming/i.test(l))return "Hospitality & gaming";
if(/retail|consumer|foodservice/i.test(l))return "Retail & consumer";
if(/furniture|woodworking/i.test(l))return "Furniture & woodworking";
if(/cannabis/i.test(l))return "Cannabis";
if(/school|education/i.test(l))return "Education";
if(/foreign policy/i.test(l))return "Foreign policy & advocacy";
if(/earmark|political fundraising|political advocacy|candidate|fundraising intermediar|political committee/i.test(l))return "Political committees & advocacy";
if(/trade association/i.test(l))return "Trade associations";
if(/lobby|public affairs|government relations/i.test(l))return "Lobbying & public affairs";
if(/government|public sector/i.test(l))return "Government & public sector";
if(/consulting|professional|accounting/i.test(l))return "Professional services";
if(/nonprofit|philanthrop/i.test(l))return "Nonprofit & philanthropy";
if(/civil rights|social action|civic/i.test(l))return "Civil rights & civic advocacy";
if(/environment|conservation/i.test(l))return "Environment & conservation";
if(/gun safety|gun violence/i.test(l))return "Gun safety";
if(/think tank|public.policy research/i.test(l))return "Public policy research";
if(/advocacy/i.test(l))return "Political committees & advocacy";
if(!l){
  const inferred=sector(name);
  return /unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(inferred)?"Sector unresolved / ambiguous":canonicalSector(name,inferred);
}
const inferred=sector(name);
if(!/unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(inferred))return canonicalSector(name,inferred);
return "Sector unresolved / ambiguous";
}
const unknownSectorLabel=label=>!label||/unconfirmed|unverified|unclear|unresolved|ambiguous/i.test(String(label));
const exactSectorOverrides=new Map(Object.entries({
"STREAM LINE CIRCLE LLC":"Transportation",
"LIBRA GROUP":"Diversified business group",
"BHANDAL SECURITY":"Security services",
"NW INTERNATIONAL WOMEN'S CONFERENCE":"Civil rights & civic advocacy",
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
"BROOKINGS":"Public policy research",
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

function sectorFromIdentityScope(name,type="*"){
  const entry=lookupIdentity(name,type);
  if(!entry||entry.status!=="Source-backed")return "";
  const s=String(entry.scope||"").toUpperCase();
  const scopeRules=[
    ["Public policy research",/\b(THINK TANK|PUBLIC[- ]POLICY RESEARCH)\b/],
    ["Health insurance",/\b(HEALTH[- ]PLAN|HEALTH INSURANCE|MANAGED CARE)\b/],
    ["Gun safety",/\b(GUN SAFETY|GUN VIOLENCE)\b/],
    ["Environment & conservation",/\b(RESOURCE[- ]CONSERVATION|ENVIRONMENTAL ADVOCACY)\b/],
    ["Civil rights & civic advocacy",/\b(CIVIL[- ]RIGHTS|CIVIC[- ]REFORM|CIVIC INITIATIVE|WOMEN'S CONFERENCE)\b/],
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
    ["Nonprofit & philanthropy",/\b(NONPROFIT|PHILANTHROP|FOUNDATION)\b/]
  ];
  for(const [label,re] of scopeRules)if(re.test(s))return label;
  return "";
}


const researchIndex=new Map(), ambiguousKeys=new Set();
for(const entry of [...businessIdentities,...schumerIdentities]){
 for(const type of entry.recordTypes?.length?entry.recordTypes:['*']){
  for(const alias of [...(entry.aliases||[]),...(entry.name?[entry.name]:[])]){
   const key=type+'|'+normalize(alias),prior=researchIndex.get(key);
   if(prior&&normalize(prior.name)!==normalize(entry.name)){researchIndex.delete(key);ambiguousKeys.add(key);}
   else if(!ambiguousKeys.has(key))researchIndex.set(key,entry);
  }
 }
}
function lookupIdentity(name,type='*'){
 const key=normalize(name);
 return researchIndex.get(type+'|'+key)||researchIndex.get('*|'+key);
}
function refineBroadSector(name,label,type){
 if(label==="Political committees & advocacy"){
  const focused=canonicalSector(name,sector(name));
  return ["Gun safety","Environment & conservation","Civil rights & civic advocacy","Foreign policy & advocacy"].includes(focused)?focused:label;
 }
 if(label!=="Nonprofit & philanthropy")return label;
 const activity=sectorFromIdentityScope(name,type);
 if(activity)return activity;
 const named=canonicalSector(name,sector(name));
 return named!=="Sector unresolved / ambiguous"&&named!=="Personal status / unreported employer"?named:label;
}
function hintKey(name,type){const entry=lookupIdentity(name,type);return type+'|'+normalize(entry?.status==='Source-backed'?entry.name:name);}
let masterHints=new Map(),conflictingHints=new Set(),pending;
export async function loadMasterSectors(){
 if(!pending)pending=(async()=>{
  const paths=["/data/jeffries/dvtlf-employers.json","/data/jeffries/dvtlf-organizations.json","/data/jeffries/jbpf-employers.json","/data/jeffries/jbpf-organizations.json","/data/jeffries/jcvf-employers.json","/data/jeffries/jcvf-organizations.json","/data/jeffries/jeff-pac-employers.json","/data/jeffries/jeff-pac-organizations-1.json","/data/jeffries/jeff-pac-organizations-2.json","/data/jeffries/jeff-pac-organizations-3.json","/data/jeffries/jmf-employers.json","/data/jeffries/jmf-organizations-1.json","/data/jeffries/jmf-organizations-2.json","/data/jeffries/jmf-organizations-3.json","/data/jeffries/jvf-organizations.json"];
  const hints=new Map(),conflicts=new Set();
  for(const [path,rows]of await Promise.all(paths.map(async path=>{const r=await fetch(path);if(!r.ok)throw Error('Unable to load master sectors: '+path);return [path,await r.json()];}))){
   const type=path.includes('-employers')?'individual':'organization';
   for(const row of rows){
    if(type==='organization'&&row[4])continue;
    const label=canonicalSector('',row[1]);
    if(unknownSectorLabel(label)||label==='Personal status / unreported employer')continue;
    const key=hintKey(row[0],type);
    if(hints.has(key)&&hints.get(key)!==label){conflicts.add(key);hints.delete(key);}
    else if(!conflicts.has(key))hints.set(key,label);
   }
  }
  masterHints=hints;conflictingHints=conflicts;return masterHints;
 })().catch(e=>{pending=undefined;throw e;});
 return pending;
}
export function classifySectorLabel(name,mappedLabel='',globalSectors=new Map(),type='*'){
 const n=normalize(name);
 if(!n||status.test(n))return "Personal status / unreported employer";
 const matched=lookupIdentity(n,type);
 const canonicalEntry=matched?.status==='Source-backed'?lookupIdentity(matched.name,type):null;
 const entry=canonicalEntry?.status==='Source-backed'&&normalize(canonicalEntry.name)===normalize(matched.name)?canonicalEntry:matched;
 if(entry?.status==='Unresolved')return "Sector unresolved / ambiguous";
 if(entry?.status==='Source-backed'&&entry.sector){
  const explicit=canonicalSector('',entry.sector);
  if(!unknownSectorLabel(explicit))return explicit;
 }
 const canonical=entry?.status==='Source-backed'?normalize(entry.name):n;
 const aliasOverrides=entry?.status==='Source-backed'?[entry.name,...(entry.aliases||[])].map(a=>exactSectorOverrides.get(normalize(a))).filter(Boolean):[];
 const overrideLabels=new Set(aliasOverrides);
 const exact=overrideLabels.size===1?[...overrideLabels][0]:overrideLabels.size>1?null:exactSectorOverrides.get(n);
 if(exact)return canonicalSector('',exact);
 // Shared direct-receipt hints are loaded once; memo rows never contribute hints.
 const key=hintKey(n,type),shared=masterHints.get(key);
 if(shared)return refineBroadSector(canonical,shared,type);
 if(type==='*'){
  const labels=new Set(['individual','organization'].map(t=>masterHints.get(hintKey(n,t))).filter(Boolean));
  if(labels.size===1)return refineBroadSector(canonical,[...labels][0],type);
 }
 const supplied=globalSectors.get(n);
 if(supplied&&!unknownSectorLabel(supplied))return refineBroadSector(canonical,canonicalSector(n,supplied),type);
 if(mappedLabel&&!unknownSectorLabel(mappedLabel)&&!conflictingHints.has(key))return refineBroadSector(canonical,canonicalSector(n,mappedLabel),type);
 const researched=sectorFromIdentityScope(canonical,type);
 if(researched)return refineBroadSector(canonical,researched,type);
 return canonicalSector(canonical,sector(canonical));
}
export function masterSectorForRecord(record){
 return classifySectorLabel(record.type==='individual'?record.employer:record.name,'',new Map(),record.type);
}

export function normalizeSectorRows(rows,path){
 if(!Array.isArray(rows))return rows;
 const type=path.includes('-employers')?'individual':path.includes('-organizations')?'organization':null;
 if(!type)return rows;
 return rows.map(row=>{const copy=[...row];copy[1]=classifySectorLabel(row[0],'',new Map(),type);return copy;});
}
