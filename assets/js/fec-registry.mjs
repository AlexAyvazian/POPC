// IDs are candidates for the one-time import; names are checked against the FEC before data are published.
export const cycle=2026;
export const committees=[
  {
    "id": "C90012998",
    "name": "Center Forward",
    "type": "independent-expenditure",
    "relation": "Center Forward Inc.",
    "expected": "CENTER FORWARD"
  },
  {
    "id": "C00568444",
    "name": "Center Forward Committee",
    "type": "pac",
    "relation": "Center Forward Inc.",
    "expected": "CENTER FORWARD COMMITTEE"
  },
  {
    "id": "C00804823",
    "name": "Mainstream Democrats PAC",
    "type": "pac",
    "relation": "Directly requested",
    "expected": "MAINSTREAM DEMOCRATS PAC"
  },
  {
    "id": "C00417733",
    "name": "Democrats for Education Reform",
    "type": "pac",
    "relation": "DFER / Education Reform Now Advocacy network",
    "expected": "DEMOCRATS FOR EDUCATION REFORM"
  },
  {
    "id": "C00903880",
    "name": "Abundance PAC",
    "type": "pac",
    "relation": "Directly requested",
    "expected": "ABUNDANCE PAC"
  },
  {
    "id": "C00799031",
    "name": "United Democracy Project",
    "type": "pac",
    "relation": "Directly requested",
    "expected": "UNITED DEMOCRACY PROJECT"
  },
  {
    "id": "C00710848",
    "name": "DMFI PAC",
    "type": "pac",
    "relation": "Democratic Majority for Israel",
    "expected": "DMFI PAC"
  },
  {
    "id": "C00908707",
    "name": "BDA PAC",
    "type": "pac",
    "relation": "Blue Dog Action PAC",
    "expected": "BDA PAC"
  },
  {
    "id": "C00911321",
    "name": "MD PAC",
    "type": "pac",
    "relation": "Majority Democrats",
    "expected": "MD PAC"
  },
  {
    "id": "C00409730",
    "name": "New Democrat Coalition Action Fund",
    "type": "pac",
    "relation": "Directly requested",
    "expected": "NEW DEMOCRAT COALITION ACTION FUND"
  },
  {
    "id": "C90016593",
    "name": "Education Reform Now Advocacy",
    "type": "independent-expenditure",
    "relation": "Directly requested",
    "expected": "EDUCATION REFORM NOW ADVOCACY"
  },
  {
    "id": "C00786830",
    "name": "WelcomePAC",
    "type": "pac",
    "relation": "Welcome Party / Welcome Democracy Institute network",
    "expected": "WELCOMEPAC"
  },
  {
    "id": "C00875450",
    "name": "Center Forward Initiative Inc. (CFI)",
    "type": "pac",
    "relation": "Funding-linked to Center Forward",
    "expected": "CENTER FORWARD INITIATIVE"
  },
  {
    "id": "C00952259",
    "name": "A Stronger Michigan",
    "type": "pac",
    "relation": "Funding-linked to Center Forward",
    "expected": "A STRONGER MICHIGAN"
  },
  {
    "id": "C90022864",
    "name": "Democratic Majority for Israel",
    "type": "independent-expenditure",
    "relation": "Directly requested",
    "expected": "DEMOCRATIC MAJORITY FOR ISRAEL"
  },
  {
    "id": "C00951160",
    "name": "Jewish Democracy Project",
    "type": "pac",
    "relation": "DMFI PAC connection",
    "expected": "JEWISH DEMOCRACY PROJECT"
  },
  {
    "id": "C00904607",
    "name": "Majority Fund",
    "type": "pac",
    "relation": "MD PAC joint fundraising connection",
    "expected": "MAJORITY FUND"
  },
  {
    "id": "C00844795",
    "name": "Defend Democracy NOW PAC",
    "type": "pac",
    "relation": "New Democrat Coalition Action Fund connection",
    "expected": "DEFEND DEMOCRACY NOW"
  },
  {
    "id": "C00797670",
    "name": "American Israel Public Affairs Committee PAC",
    "type": "pac",
    "relation": "United Democracy Project network",
    "expected": "AMERICAN ISRAEL PUBLIC AFFAIRS"
  },
  {
    "id": "C00859660",
    "name": "New Democrat Majority",
    "type": "pac",
    "relation": "Opportunity Forward Alliance funding recipient",
    "expected": "NEW DEMOCRAT MAJORITY"
  },
  {
    "id": "C00854299",
    "name": "BOLD America",
    "type": "pac",
    "relation": "Opportunity Forward Alliance funding recipient",
    "expected": "BOLD AMERICA"
  },
  {
    "id": "C00931774",
    "name": "Article One PAC",
    "type": "pac",
    "relation": "Opportunity Forward Alliance funding recipient",
    "expected": "ARTICLE ONE"
  },
  {
    "id": "C00751503",
    "name": "New Leadership PAC",
    "type": "pac",
    "relation": "Opportunity Forward Alliance funding recipient",
    "expected": "NEW LEADERSHIP PAC"
  },
  {
    "id": "C00914838",
    "name": "Valley-Westside United PAC",
    "type": "pac",
    "relation": "Opportunity Forward Alliance funding recipient",
    "expected": "VALLEY-WESTSIDE UNITED"
  }
];
export const unresolved=["Promise to America","Progressive Policy Institute","Next American Era","Abundance Elected Network","Welcome Democracy Institute","Welcome Party Inc.","Opportunity Forward Alliance"];
export const datasets=['receipts','disbursements','independent','notices'];
export const committeeById=id=>committees.find(c=>c.id===id);
