# Business identity research — November 25, 2026

The second research checkpoint expands the donor business/organization identity directory while preserving the underlying FEC records and the table's location inside `transactions.html` (“See All Donor Transactions”).

## Verified directory status

The full eight-committee test run at commit `e789400a14add9223dd432be097024fa3c127bb9` produced:

- **2,643** listed business/organization groups
- **96** source-backed groups
- **8** researched-but-unresolved groups
- **2,539** not-yet-reviewed groups
- **221,839** underlying records: **110,817 direct** and **111,022 memo**

The prior directory had 2,645 listed groups, 71 source-backed, 20 unresolved, and 2,554 unreviewed. The two-name reduction is from source-supported identity consolidation; it does not remove donor records. All 221,839 records remain assigned to directory groups.

The research data now contains 97 source-backed identity definitions and 9 unresolved identity definitions. The directory counts are slightly lower because an identity definition can be absent from the current reported-name set or multiple supported reported forms can resolve to one directory group.

## Research completed in this checkpoint

Previously unresolved forms were re-researched with donor context and stronger entity-boundary rules:

- **Leifer Capital Advisers** → Leifer Capital Advisers, LLC.
- **Patrick Partners** → Patrick Partners, Inc.; the separate Sharon Patrick & Associates forms remain unresolved because former-name equivalence was not established.
- **Patterson Planning & Services** → Patterson Planning & Services, Inc., supported by Robert R. Dyson's Chairman/CEO context.
- **Stream Line Circle LLC** → exact LLC identity supported with Jon Stryker's FEC employer context.
- **Amazon.com Services, Inc.** → documented former corporate form of Amazon.com Services LLC; the subsidiary remains separate from Amazon.com, Inc.
- **Accenture** is identified at group/brand scope under Accenture plc; **Accenture Inc.** remains unresolved because that legal name exists in more than one jurisdiction.
- **Coinbase** remains a brand/group entry while **Coinbase, Inc.** is separately identified as a subsidiary of Coinbase Global, Inc.
- **Delaware North Companies** is identified at group/umbrella scope; **Delaware North Companies, Inc.** remains unresolved because the official structure distinguishes a qualified “– Boston” entity.
- **Siemens** remains a group/brand entry under Siemens AG; **Siemens Corporation** is separately identified as a U.S. legal entity held by Siemens USA Holdings, Inc.
- **NEP Group, Inc.** is source-backed, while bare **NEP** and **NEP Inc.** remain unresolved.
- **CREI**, **Mallard Investments**, and the **JRJ Construction** forms remain unresolved where donor/entity evidence is still insufficient for an exact merge.

A further previously-unreviewed batch was added for Pivotal Ventures, Spark Capital, Broadfin Capital, Linden Capital Partners, Davidson Kempner, Palantir Technologies, MacAndrews & Forbes, Black Economic Alliance, BC Partners, Zaremba Brown, Digital Sovereignty Alliance, Valcor Engineering, The Vistria Group, and Ariel Investments.

`business-identities.js` stores each supported mapping's exact reported aliases, canonical display name, identity scope, parent where established, evidence note, source URLs, and review date. Parent relationships are searchable context only and never aggregation keys.

## Entity-boundary rules retained

Subsidiaries are not aliases of their parents. Business-group and brand mappings do not assert the legal employing subsidiary of every individual donor. Raw reported employer/PAC names remain available in details and CSV exports. No fuzzy alias matching is used. “Not reviewed” and “Unresolved” remain separate research statuses.

Individual contributions and PAC/organization receipts remain separately totaled. Memo records remain visible for identity research, but memo amounts are excluded from direct contribution totals.

## Validation

GitHub Actions ran `node --test business-directory.test.mjs` against the full repository and all **5 tests passed**. The tests reconcile all eight committee datasets, preserve every record, verify each committee's direct individual and organization totals, confirm memo amounts do not increase direct totals, and exercise researched alias/parent separation.

Workflow run: https://github.com/AlexAyvazian/POPC/actions/runs/45575589333

Live deployment was **not** treated as verified by this repository test. Repository state and live Cloudflare Pages deployment remain separate verification steps.


## Transaction-page placement and default visibility — November 25, 2026

The business/organization identity research interface remains inside `transactions.html` (“See All Donor Transactions”). It is not a separate homepage tab and is not embedded in `combined-contributions.html`.

The directory preserves source links, research-status filtering, parent-name search, CSV export, original-record details, PAC / organization receipts separately from individual receipts, and memo records with memo amounts excluded from direct totals.



## Research prioritization — November 25, 2026

All unreviewed non-personal business, employer, association, organization and PAC identities remain in the research backlog and in the exported queue. No one-donor employer is counted as researched merely because it is lower priority.

For display and batch ordering only, the interface may prioritize PAC / organization receipt identities, already researched identities, and employers reported by at least two distinct individual donors. The checkpoint “unreviewed” count always means **every** preserved non-personal identity without research status.



## Executive-donor priority expansion — November 25, 2026

The master unreviewed backlog continues to preserve every non-personal unreviewed identity. The priority queue now also includes single-donor employers when at least one associated individual receipt reports a high-influence role in one of these existing occupation groups: chief executive officer; chair/board member/trustee; other C-suite officer; vice president; president; founder/business owner; partner/principal; or other executive/managing director.

This uses the same `occupationGroup()` classifier already used by Combined Total Contributions and Analysis. Ordinary one-person employer strings such as a staff-level hospital employer remain outside the priority view, while executive-linked employer identities move into the research queue without changing any underlying record or amount.


## Executive-priority identity research — batch 1 — November 25, 2026

The first executive-linked priority batch reviewed the highest-dollar single-donor employer identities using donor name and reported executive role as context. Nineteen new identity records were added in this commit; BHANDAL SECURITY had already been independently reviewed and retained as unresolved by a concurrent research commit.

Source-backed additions include Bed Bath & Beyond, Capitol City Group, Cibus at group/brand scope, Cityview Management Services, Everest Clinical Research Corporation, Firefly3 LLC, Forest Management Company LLC, Gjelaj Law PLLC, JSI at group/brand scope, Lightyear Capital LLC, Mapleton Investments LLC, Green Thumb Industries Inc., State of Colorado, Verano Holdings Corp., Centric Brands LLC, Eminence Capital LP, Empire Office Inc. and Mack Real Estate Group at group/brand scope.

STORY remains explicitly unresolved because available evidence connects Joe Sai to Story Cannabis Company LLC but does not establish which Story legal entity corresponds to the bare employer string in the donor record. No Story entities were merged.


## Executive-priority identity research — batch 2 completion — November 25, 2026

A concurrent research commit completed most of the next executive-linked tier while this batch was being prepared. The remaining priority identities added here are Edward Jones, Satoshi Action Fund, Abundant Venture Partners, American Jewish Committee, Associated Agencies, Austin Sports Academy and Benenson Capital.

Austin Sports Academy remains explicitly unresolved because the operating business and founder/owner are supported but multiple same/similar Texas entities prevent a verified legal-entity match. Abundant Venture Partners and Benenson Capital are source-backed only at firm/group scope. Edward Jones is retained as a brokerage brand identity separate from Edward D. Jones & Co., L.P., parent The Jones Financial Companies, L.L.L.P., and any political committee.


## Executive-priority identity research — batch 3 — November 25, 2026

The next 20 highest-dollar executive-linked priority identities were reviewed: CityBridge Foundation, Cornerstone Automation Systems, DADA, DraftKings, Drink Willie's, Eisner Advisory LLC, Embrace Inc, Estée Lauder, Fox Searchlight Pictures, Fried Companies, Future Standard, Hunt Companies, Ignite Medical Resorts, Jackson Offshore Operators, Jain Global, Jushi, Leadership Now Project, LIPA, Marquis Health and Marquis Limited LLC.

Eisner Advisory LLC and Marquis Health remain explicitly unresolved because the donor strings cannot be safely equated to one exact legal entity. Drink Willie's, DADA, Future Standard, Fox Searchlight Pictures and Ignite Medical Resorts are source-backed only at brand/group/label scope. Marquis Limited LLC remains separate from Marquis Health. All parent, subsidiary and affiliate boundaries remain non-aggregating context.


## Executive-priority identity research — batch 4 — November 25, 2026

The next 20 executive-linked priority identities were reviewed from MG Capital Holdings through Mortgage Bankers Association. MG Capital Holdings remains unresolved because the exact reported company name could not be tied to the donor without relying on a same-name inference.

Molecule Ventures, Niagara Bottling, NOLA Education, PAFCO, Saba Capital Management, Standard Wellness Holdings, SunMed Growers, The Raben Group, Vistria PRG, Trulieve Cannabis, Wolfe Research, Spellman High Voltage Electronics and The Millstone Evans Group were resolved to source-backed entities. Monumental Sports & Entertainment, Rosen Harbottle and The Premier Companies remain source-backed at firm/group/brand scope. Union Plaza Care Center is linked to the government-listed operator Union Plaza Nursing Home Inc. Mortgage Bankers Association remains separate from its PAC.


## Executive-priority identity research — batch 5 — November 25, 2026

The next 20 priority identities in the roughly $330k–$363k executive-linked tier were reviewed. Womble Bond Dickinson (US), Ascend Wellness Holdings, Beach Walk Media, Buckeye Relief, C3 Industries, Freedom Mortgage Corporation, Lone Pine Capital, MBS Associates, Omega Overseas Investments, Principal Building Services and SL Green Realty were resolved to source-backed entities.

Chelsea Piers, ExxonMobil, Fisher Brothers and Hilton are retained at business-group or brand scope because the reported employer does not identify one exact operating entity. Amrock Holdings, Kieloch Consulting, Silver Rabbit and Super Niche Inc. remain unresolved. Glazer's Inc. is retained as a historical legal-employer identity and not merged into later distributor structures.


## Executive-priority identity research — batch 6 — November 25, 2026

This batch reviewed the next executive-linked tier from Air Ventures through GSIHealth. The two reported strings “NFP AN AON COMPANY” and “NFP AND AON COMPANY” were verified as variants of the same NFP employer identity and consolidated at the directory-identity layer only; all underlying receipts remain unchanged.

Capitol Hill Consulting Group, GoValidate and GSIHealth remain unresolved because the reviewed evidence does not support one exact employing legal entity. Lilette Advisors and PWR are source-backed at firm/brand scope. Air Ventures, Ark Restaurants, Empire State Realty Trust, Host Hotels & Resorts, Maximus, RLJ Lodging Trust, Thomas Safran & Associates, QP Health Care Services d/b/a Vivage, Veterans Services Corporation and ZMC Advisors were resolved to source-backed entities. The National Association of Broadcasters remains separate from NABPAC.


## Executive-priority identity research — batch 7 — November 25, 2026

The next 20 executive-linked priority identities were reviewed from Family Gateway through Sherman Residential. ICIC, Rocket LLC and IHS remain explicitly unresolved because their acronyms or legal-entity forms cannot be tied to one exact employer without inference.

Family Gateway, Chartwell Strategy Group, Entertainment Software Association, Excel Security, Resolution Public Affairs, Wachtell Lipton, OHBALTO Media, American Defense International, Cabinetry & Construction, 3D Molecular Designs, The Berger Company, Goddard Riverside and MEMA were resolved to source-backed identities. T:PZ was resolved to The Possible Zone using Mark Levin's matching board-chair context, and DCA was resolved to Digital Citizens Alliance using Tom Galvin's matching executive-director context. Hillel International remains a public-facing nonprofit identity of Hillel The Foundation for Jewish Campus Life. Sherman Residential remains a division/brand with Benj. E. Sherman & Sons, Inc. shown only as parent context.


## Executive-priority identity research — batch 8 — November 25, 2026

The next 20 priority identities from K & M Office through DREAM were reviewed. Killer Mexican Management LLC, Marysia LLC, TXP Services and Brunswick Group remain unresolved rather than being matched through brand similarity or a donor-name assumption.

K & M Office, Parkway Corporation, Jewish Federation of Cleveland, Novartis Pharmaceuticals Corporation, Authors Guild, QXO, 50CAN, Access Leasing, Anisa International, Apple Hospitality REIT, Ascend Learning, Bellwether Enterprise, Blue Star Strategies and Harlem RBI d/b/a DREAM were source-backed. Advent International and Coastal Construction remain source-backed only at firm/group scope. Ascend Learning is specifically the Brooklyn charter-school organization associated with Maryann Li and is not merged with the unrelated commercial Ascend Learning company.


## Executive-priority identity research — batch 9 — November 25, 2026

The next 20 priority identities from Exelon through SoLo Funds were reviewed. GNE and Holt Hospitality LLC remain unresolved because the donor-name/employer context points to multiple plausible identities and does not support a safe merge.

Exelon Corporation, Fontheim International, Fried Frank, G&C Equipment Corporation, Genentech, H&M Strategies, Holistic Solutions, Integrated Logistical Support, Kennedy Democrats, LDR Equities, LeveragED Foundation, Millennium Management, Northeast Charter Schools Network, Northern Compass Group, Penn Avenue Partners, B&G Regal Domestics and SoLo Funds were source-backed. The Moinian Group remains at real-estate group/brand scope. Genentech remains separate from its Roche-group parent context and all political committees remain separate from connected organizations.


## Executive-priority identity research — batch 10 — November 25, 2026

The next 20 priority identities from Strategic Marketing Innovations through National Bankers Association were reviewed. The Future Forum, SimplyEz HDM LLC and Unified Resources remain unresolved because the exact legal/employer identity could not be established without relying on generic names or inconsistent role context.

Strategic Marketing Innovations, Strategic Resources, Suburban Street News, Sullivan-Palatek, The A.M. Fund, The Moriah Fund, Clear Capital, Legacy Medical Consultants, Vesta Corporation, Bay Aire and National Bankers Association were resolved to source-backed entities. StudentsFirstNY, The Gart Companies, Theodore's Books and AdeptAg are source-backed at organization/brand/group scope. Idol Minds is retained as the historical studio identity that became Deck Nine Games. The reported K & M OFFICE string was added as a verified alias of the already researched K & M Office LLC identity; underlying receipts remain unchanged.


## Executive-priority identity research — batch 11 — November 25, 2026

The next 20 priority identities from XSB through the Port Authority of New York and New Jersey were reviewed. Emerald Peak Entertainment and JD Dove Farms remain unresolved because the reviewed sources do not establish one exact employer entity tied to the donor context.

XSB, Dyniftic Corporation, Blue Sky Enterprises d/b/a FS Medical Technology, Acutonix, SCR Medical Transportation, Able Business Services, The Fremont Street Experience, Akira Wood, D'Addario & Co., Hackensack Meridian Health, Los Barrios Unidos Community Clinic, Leon N. Weiner & Associates, Phoenix Tailings and the Port Authority were source-backed. Gardner Pie and Intuit Art Museum are source-backed at business/organization scope. JerseyCAN is retained as a 50CAN campaign/brand with 50CAN shown only as parent/umbrella context.


## Executive-priority identity research — batch 12 — November 25, 2026

The next 20 priority identities from S2Insight through PC Development Group were reviewed. United General Bakeries, Showtime Exhibits, Skylight, FIN and Redberri Innovation remain unresolved because the reviewed public evidence does not establish one exact employer identity tied to the donor context.

S2Insight, Oliver & Company, Oregon Lions Sight & Hearing Foundation, San Luis Valley Health, Tricorp Group, White Management, National Council on Compensation Insurance, Nearly Bros d/b/a Bodo's Bagels, The Noel Pointer Foundation, H. P. Kopplemann, Applied Behavior Consultants, Franklin Young International, Kennington, MindPlace and historical PC Development Group, Inc. were source-backed. PC Development Group, Inc. remains distinct from the later/current LLC; no successor entity is merged into the historical donor employer.


## Executive-priority identity research — batch 13 — November 25, 2026

The next 20 priority identities from Broadspire through Noodle Partners were reviewed. Broadspire, GW Retil Consulting, Alternative Living Concepts, Brown Brown Ins, Human Solutions and LalieWorks Creative Content Services remain unresolved because the reported shorthand or generic name does not identify one exact employer.

Alsco, WPG International, Bitter Root RC&D, Beatrice Advisors, CareOregon, Eastern Yacht Sales, Garney, The Hanley Foundation, Highlander Partners, Jumburrito, Level One Partners, NAADAC and New Mexico Cancer Center were source-backed at the legal or organization scope supported by evidence. New Mexico Cancer Center remains a practice brand operated by New Mexico Oncology Hematology Consultants Ltd. Noodle Partners PBC is retained as an alias under the source-backed Noodle operating brand.


## Executive-priority identity research — batch 14 — November 25, 2026

The next 20 priority identities from PDX Gallery through Greater New York Hospital Association were reviewed. PDX Gallery Inc, Settlement Systems Arbitration and Mediation, KermitsPad, Fox Hollow Ventures LLC, IAG Ltd. and RSS-TGP remain unresolved because the reported strings do not identify one exact employer without inference.

SRAM Corporation, The ALS Association, Westcoast Black Theatre Troupe of Florida, Corpus Christi Housing Authority, ASCAP, Citizens Union, Sip N Chat Cocktail Lounge, T K Group and Greater New York Hospital Association were source-backed. Xcel Energy–Colorado, Teachers Pay Teachers, The Doctors Company and uSherpa are retained at operating-company, brand or business-group scope rather than being over-normalized into a parent or affiliate. Williams-Sonoma, Inc. is retained as the public-company employer.


## Executive-priority identity research — batch 15 — November 25, 2026

The next 20 priority identities from XXV Holdings through Claymont Society were reviewed. XXV Holdings, Cambia, Eusclid Systems Corp and Elm Park Group remain unresolved because the exact employer cannot be established from the reported shorthand without inference.

Hartford Distributors, Automated Food Systems, Swan Packaging, Greater Spokane Inc., Robert W. Woodruff Arts Center, Pennsylvania Medical Billing, Cargille-Sacher Laboratories, RM Electric, Data Net Solutions, Shanahan Leadership Strategies, Canterbury Capital and Claymont Society were source-backed. Human Energy Resources, Diageo North America and Lumanity remain source-backed only at business/brand or operating-region scope. Precision Auto Glass is source-backed as the employer business, but public business records conflict with the donor's OWNER/OPERATOR title, so the title is not treated as verified. The CANTEBURY spelling was resolved to Canterbury Capital through the named owner's SEC employment history.


## Executive-priority identity research — batch 16 — November 25, 2026

The next executive-linked priority batch reviewed Nonna's Kitchen Chair through Bridge Philanthropic Consulting. Calvert Systems, Orbit Movers and Erectors, and McCreery Inc. remain unresolved because the reported employer cannot be tied to one exact entity without inference.

RABEN was added as a verified shorthand alias of the already researched The Raben Group, LLC identity. Superior Test & Balance, East Coast Abstract, Sheppard Mullin, Tylie Jones & Associates, Lamesa Delinting Company, Advanced Scientific Concepts and Bridge Philanthropic Consulting were resolved to source-backed entities. Viejas Casino, Kohl's, Alive Hospice, Learning Exchange, Mostardi Nursery and DSB Group New York are retained at the business or organization scope supported by public evidence.

The STATE FARM record is intentionally not treated as an individual contribution from a State Farm corporate employee: State Farm's own agent page identifies Rey Polanco as an independent contractor operating Reynaldo Polanco Insurance Agency, Inc. The reported employer remains searchable as STATE FARM while the research evidence records the agency/legal-employer boundary.


## Executive-priority identity research — batch 17 — November 25, 2026

The remaining single-donor executive-priority names from Druck Enterprises through RADCO Management were reviewed. This batch intentionally preserves historical and legal boundaries rather than merging on a shared founder or brand.

Noodle Education Inc. is source-backed as its own historical Delaware corporation and remains separate from the already researched Noodle Partners PBC / NOODLE identity. World Trade Center Performing Arts Center, Inc. is the source-backed historical PACWTC nonprofit. Guac-Lock, Pajarito Powder, Bhinder Hospitality, Transition Express, Pennsylvania Housing Finance Agency and RADCO Management were resolved to source-backed entities. R/GA, Galindo Group and Mariposa Labs remain source-backed at agency/group/business scope. The UW HEALTH donor record is specifically mapped to SwedishAmerican Hospital d/b/a UW Health because that filing directly identifies Patricia DeWane as CFO and Treasurer.


## PAC / organization priority research — batch 18 — November 25, 2026

The first post-executive priority batch reviewed the 20 highest-dollar remaining PAC / organization identities, each with $7,500 in direct receipts in the donor dataset.

Every federal PAC remains a distinct identity from its connected company, association or labor organization. Historical recipient-file names for Cardinal Health, Fresenius Medical Care and the marine-industry BOAT PAC were mapped through their durable FEC committee IDs to the current FEC committee names rather than merged into the connected organizations.

The raw donor string “INTERNATIONAL ASSOCIATION OF FIRE FIGHTERS” is organization-record shorthand for FIREPAC (FEC C00029447) in these Jeffries committee receipts. Its research alias is explicitly restricted to organization records; an individual who reports International Association of Fire Fighters as an employer remains an employer record and does not get reclassified as the PAC.


## PAC / multi-donor priority research — batch 19 — November 25, 2026

The next 20 highest-dollar priority identities were reviewed after batch 18. Federal PACs remain separate from connected companies and associations. The Toyota/Lexus PAC, Invesco PAC, Leidos PAC, Liberty Mutual PAC, Lifepoint PAC, Northwestern Mutual PAC, Tyson TYPAC, U.S. Bancorp PAC, Alterman Management Group PAC and HII committee were mapped through FEC committee identities rather than collapsed into their connected organizations.

The HII raw SHIPPAC spelling is treated as a historical-name alias of durable FEC committee C00325092, whose current name is HII Employees Political Action Committee (HIIPAC). Independence Blue Cross LLC PAC is recorded as the separate segregated fund of AmeriHealth, Inc. under the relationship described in FEC Advisory Opinion 2024-04; the PAC title is not used to infer Independence Blue Cross LLC as its SSF sponsor.

BlackRock and TD Bank are source-backed only at reported employer business/brand scope so they remain distinct from BlackRock Capital Management, Inc., TD Bank N.A., and the separate TD Bank PAC. The Catawba Nation, Pokagon Band of Potawatomi Indians and Saginaw Chippewa Indian Tribe are preserved as sovereign tribal-government identities. Arnold & Porter is resolved to Arnold & Porter Kaye Scholer LLP; Avoq is retained as the operating firm with Coral Tree Partners recorded as directly documented parent context.

## PAC / multi-donor priority research — batch 20 — November 25, 2026

The next 20 highest-dollar priority groups after batch 19 were reviewed from AECOM through Mutual of Omaha. This batch adds 21 source-backed identity definitions because the pre-research AECOM group contained two different identities: organization receipts from AECOM PAC and an individual donor whose reported employer is AECOM.

AECOM PAC is now restricted to organization records and kept separate from the AECOM employer identity; all original receipts remain unchanged. The remaining federal PACs are likewise kept distinct from connected companies, trade associations and membership organizations.

The donor-file name American Osteopathic Association PAC is mapped through durable FEC committee ID C00113803 to the current American Osteopathic Information Association - Osteopathic Political Action Committee. The Mastercard donor-file name is similarly mapped through C00410274 to the current committee name while preserving the reported recipient-file form as an alias. American Soybean Association PAC currently lists no connected organization on its FEC committee page, and the Holland & Knight and K&L Gates committee pages do not list connected organizations; no relationship is inferred where the FEC record does not state one.

## PAC / organization priority research — batch 21 — November 25, 2026

The next $5,000 priority tier was reviewed through American Council of Life Insurers. Nineteen source-backed identity definitions resolve 21 queue groups because two pairs were duplicate report-name forms of the same durable committee identities.

OB- GYN PAC and American College of OB-GYNS PAC (OB-GYN PAC) resolve to FEC committee C00364158. A historical FEC recipient filing reports OB-GYN PAC with that same committee ID, while the current FEC committee name is American College of OB-GYNS PAC (OB-GYN PAC). The local space-after-hyphen form is retained as a donor-file spelling alias.

The Walt Disney Productions Employees PAC is a historical name of durable FEC committee C00197749; the current committee name is the TWDC Enterprises 18 Corp./Disney PAC name. The two American Council of Life Insurers rows also resolve to one FEC committee, C00147066; one local row simply omits the space between INSURERS and POLITICAL. That malformed spelling is preserved as an alias rather than promoted as a second organization.

The Chickasaw Nation remains a sovereign tribal-government identity rather than being collapsed into a political committee. Schneider National Inc., TRANSPAC is kept at its FEC committee identity, and no connected organization is inferred because the current FEC committee page does not list one.

## PAC / organization priority research — batch 22 — November 25, 2026

Twenty additional $5,000 priority groups were reviewed from American Crystal Sugar Company through Dow Inc. PAC. Federal political committees are keyed to their FEC committee identities and kept separate from connected companies, associations and unions.

Three donor-file normalization cases were resolved without fuzzy merging. ARCHIPAC's donor-file spacing variants resolve to FEC committee C00139071 and the registered name ARCHIPAC - THE AMERICAN INSTITUTE OF ARCHITECTS. Covington & Burling LLP PAC resolves to FEC committee C00462630, whose registered name spells out AND. Democrats for Education Reform PAC resolves to FEC committee C00417733, whose registered committee name is DEMOCRATS FOR EDUCATION REFORM; the generic PAC suffix in the reported donor string does not create a second identity.

The Cow Creek Band of Umpqua Tribe of Indians remains classified as a sovereign federally recognized tribal government based on the Tribe's official government materials, rather than being reclassified as a PAC.

## PAC / organization priority research — batch 23 — November 25, 2026

Twenty additional $5,000 priority queue groups were reviewed from EchoStar/DISH through the International Brotherhood of Boilermakers Campaign Assistance Fund. They resolve to eighteen source-backed identities because two pairs are verified historical/current committee-name changes under durable FEC IDs.

General Electric Company Political Action Committee and General Electric Company Aerospace Employee Political Action Committee (GE Aerospace PAC) are the same FEC committee, C00024869. Historical FEC cycles show the General Electric Company Political Action Committee/GEPAC names; the 2026 record uses the GE Aerospace PAC name. Both donor-file names are retained as aliases of the current committee identity.

Humane Society Legislative Fund Political Action Committee and Humane World Action Fund Political Action Committee are likewise the same durable FEC committee, C00466813. The 2024 FEC record uses the former name and the 2026 record uses the latter, so the two donor-file rows are consolidated without deleting either reported name.

HNTB HOLDINGS PAC is retained as the exact donor-file shorthand for FEC committee C00386029, whose registered name is HNTB HOLDINGS LTD. PAC. Federation of Exchange Accomodators 1031 PAC retains the FEC's own ACCOMODATORS spelling rather than silently correcting it.

## PAC / organization priority research — batch 24 — November 25, 2026

Twenty additional $5,000 priority groups were reviewed from International Trademark Association through the NetJets Association of Shared Aircraft Pilots PAC. Nineteen new source-backed identity definitions were added, and the existing source-backed JStreetPAC identity was expanded with the donor-file alias JSTREET PAC.

JSTREET PAC is mapped to durable FEC committee C00441949, whose current registered name is JSTREETPAC. A 2026 FEC filing for that same committee ID uses the spaced JStreet PAC form. Micron Technology, Inc. PAC is a historical name of FEC committee C00443671; the current 2026 name is Micron Technology, Inc. Employee PAC.

National Association of Professional Employer Organizations PAC (NAPEO PAC) is a recipient-file form of C00447284, currently registered as National Association of Professional Employer Organizations (NAPEO PAC). National Ready Mixed Concrete Assn. PAC is likewise a recipient-file shortened form of C00114025, currently registered with the additional (CONCRETEPAC) designation. National Thoroughbred Racing Association PAC is retained as a donor-file shorthand for C00360008, whose registered name is National Thoroughbred Racing Association Political Action Committee/HORSE PAC.

No raw donor transaction is rewritten by these mappings; the original reported names remain searchable and visible in the detail records.

## PAC / multi-donor employer priority research — batch 25 — November 25, 2026

Twenty additional $5,000 priority groups were reviewed: sixteen PAC/organization receipts and four multi-donor reported employers. The four employers — PNL Companies, Precision NeuroMed Inc., Property Group Partners and Taconic Partners — are restricted to individual records so future organization receipts with similar names cannot be collapsed into the employer identities.

Several PAC donor-file names resolve through durable FEC committee IDs rather than string similarity. Office and Professional Employees International Union (OPEIU VOTES) is a recipient-file shorthand for C00007898, currently registered as Office and Professional Employees International Union (OPEIU) JB Moss Voice of the Electorate (VOTE). Planned Parenthood's donor-file form differs from the C00314617 registered name only by punctuation after INC.

Plasterers' and Cement Masons' Action Committee is a historical name of C00134742; current FEC records use Operative Plasterers' and Cement Masons' Intl Association Action Committee. Real Estate Roundtable Political Action Committee (REALPAC) without the leading THE appears in earlier C00033779 records; current records use The Real Estate Roundtable Political Action Committee (REALPAC).

The donor-file Seafarers NA-AGLIWD/NMU form and the current NA-AGLIW form are both tied to C00004325. SEIU COPE is the recipient-file shorthand for C00004036, currently registered as SEIU COPE (Service Employees International Union Committee on Political Education). Raw transaction names remain preserved and searchable.

## PAC priority research — batch 26 — November 25, 2026

Twenty additional priority organization receipts were reviewed: eighteen $5,000 rows followed by the next two $4,500 rows. All twenty are mapped as organization-only identities using federal committee records.

TargetCitizens Political Forum is a donor-file shorthand for C00098061, currently registered as Target Corporation Citizens Political Forum (TargetCitizens Political Forum). The Grant Thornton donor-file name is part of a verified name history for C00408260: older filings used The Grant Thornton LLP Political Action Committee LLC, a 2026 recipient filing uses The Grant Thornton LLC Political Action Committee, and the current committee registration is The Grant Thornton Advisors LLC Political Action Committee.

Universal Music Group Political Action Committee is the historical 2018 name of C00392464, now registered as Universal Music Group Employee Action Fund. US Travel Association PAC is the punctuation-normalized donor form of C00457754, currently U.S. Travel Association PAC. VEN-PAC is the shorthand for C00369660, Venable PAC (VEN-PAC), and Walgreen Co PAC is the shortened donor form of C00160770, Walgreen Co PAC (WalgreensPAC).

The UA Union Plumbers & Pipefitters row maps to C00012476 because that committee's registered name exactly matches the donor string. It is deliberately kept separate from C00331918, a different committee whose registered name adds a trailing PAC. Three Rivers Holdings Inc Dobbs Unison Health Plans Federal PAC is preserved as its own terminated federal committee, C00418491, rather than being attached to a present-day company identity. Raw transaction names remain unchanged.

## Mixed priority identity research — batch 27 — November 25, 2026

The next twenty priority groups were reviewed as eleven PACs, five sovereign tribal governments, three multi-donor reported employers, and one direct law-firm organization receipt. Nineteen new identity definitions were added and the existing source-backed SIFMA committee identity was expanded with the exact donor-file alias SIFMA-PAC.

Cummins Inc PAC resolves to durable FEC committee C00377952, currently registered as Cummins Inc. Political Action Committee (CIPAC). The donor-file Motion Picture Association of America Inc Political Action Committee resolves through C00139519 to the current Motion Picture Association Inc Political Action Committee (MPAAMERICA PAC). SIFMA-PAC is a shorthand recipient-file name for C00431312, whose full registered name is Securities Industry and Financial Markets Association Political Action Committee.

The Match-E-Be-Nash-She-Wish Band of Pottawatomi Indians, Puyallup Tribe of Indians, Seminole Tribe of Florida, Shingle Springs Band of Miwok Indians and Snoqualmie Indian Tribe are retained as sovereign tribal-government identities, not PACs or companies. Snoqualmie Tribe is preserved as the donor-file shorthand alias for the official Snoqualmie Indian Tribe name.

The Century Foundation and Mayo Clinic are restricted to individual employer records. Forbes Tate Partners is likewise restricted to individual records and mapped to its current FTP brand; the firm's official materials document the April 2026 name change, and Public Policy Holding Company filings identify Forbes Tate Partners LLC as a wholly owned subsidiary. Pond Lehocky Giordano Disability LLC remains a direct organization identity based on the firm's own legal-entity disclosures.

Raw transaction names and the 221,839 underlying donor records remain unchanged; these mappings operate only in the identity layer.

## Priority research — batches 28–38 — November 25, 2026

The remaining 218 priority-unreviewed groups after batch 27 were reviewed on one consolidated finish branch so independent research could proceed in parallel without unsafe concurrent writes to the same identity file. The review still follows the original twenty-row batch boundaries: batches 28 through 37 contain twenty priority rows each and batch 38 contains the final eighteen.

Across the remaining organization/PAC side, 127 priority groups were reviewed. Source-backed entries were tied to durable FEC committee IDs or authoritative organization records where the evidence supported a unique identity. Where the reported organization/PAC string could not be tied confidently to one durable committee or legal entity, the exact reported name was marked **Unresolved** rather than being normalized by guesswork.

The employer/public-entity side was reviewed under the same rule. Exact institutions, governments, health systems, universities, firms and business brands were source-backed where official or donor-specific evidence supported the match. Generic or non-unique labels such as STATE, ARMY, VA, CSU, IU, USG, FREELANCE and INDEPENDENT were explicitly marked **Unresolved** when they could not safely serve as reusable entity aliases.

Critical boundaries preserved in this finish include: AbbVie Political Action Committee kept separate from the AbbVie reported employer; the local NORTH AMERICA'S BUILDING TRADES UNION donor string mapped to federal committee C00003160, North America's Building Trades Unions Political Educational Fund; AIRBUS GROUP, INC. PAC mapped to the current C00421230 Airbus Americas PAC identity; the historical Alcoa PAC form mapped to C00501106; the donor-file PROTECTPAC form mapped to C00161414's current PROTECTIVEPAC name; and TRI-STATE MAXED OUT WOMEN mapped to C00488387's registered TRI-STATE MAXED-OUT WOMEN name.

Institutional aliases were also normalized only where the relationship was source-backed: LAUSD to Los Angeles Unified School District; NYC DOE to New York City Department of Education; USPS and US POSTAL SERVICE to United States Postal Service; DOD and DEPT OF DEFENSE to the U.S. Department of Defense; STATE OF CA to State of California; and the MD Anderson shorthand forms to The University of Texas MD Anderson Cancer Center.

The two `- UNITEMIZED` rows are documented as internal bookkeeping rollups rather than donor legal entities. The memo-only KRAMER DILLOF LIVINGSTON & MOORE ESQS. employer form is mapped to Kramer, Dillof, Livingston & Moore from the firm's own materials.

### Batch 28
ABBVIE; NORTH AMERICA'S BUILDING TRADES UNION; AMERICAN ASSOCIATION OF INDEPENDENT MUSIC, INC.; AFFORDABLE HOUSING TAX CREDIT COALITION; AIRBUS GROUP, INC.; ALCOA INC. EMPLOYEES' VOLUNTARY FEDERAL; ALLY FINANCIAL INC ADVOCACY; AMERICAN ACADEMY OF AUDIOLOGY, INC.; AMERICAN ACADEMY OF PEDIATRIC DENTISTRY; AMERICAN BEVERAGE ASSOCIATION; AMERICAN CEMENT ASSOCIATION (CEMENT PAC); AMERICAN COLLEGE OF RADIOLOGY ASSOCIATION; AMERICAN COLLEGE OF RHEUMATOLOGY (RHEUMPAC); AMERICAN FAMILY MUTUAL INSURANCE COMPANY, S.I. FEDERAL; AMERICAN FEDERATION OF MUSICIANS OF THE UNITED STATES AND CANADA - LEGISLATIVE ACTION FUND; AMERICAN FIDELITY CORPORATION; AMERICAN HOMES 4 RENT TRS, LLC; AMERICAN INVESTMENT COUNCIL; AMERICAN ROAD & TRANSPORTATION BUILDERS ASSOCIATION; AMERICAN SOCIETY FOR RADIATION ONCOLOGY PAC (''ASTRO-PAC'').

### Batch 29
AMERICAN WATERWAYS OPERATORS-PAC; ARCH CAPITAL GROUP (US) INC.; ATLAS AIR WORLDWIDE HOLDINGS, INC.; BLUEPAC - BLUE CROSS BLUE SHIELD ASSOCIATION; CARESOURCE MISSION; CARRIER GLOBAL CORPORATION; CASE NEW HOLLAND INDUSTRIAL INC. EXCELLENCE IN GOVERNMENT FUND (CNH INDUSTRIAL EXCELLENCE IN GOVERNMENT FUND); CHUBB GROUP HOLDINGS INC.; COINBASE, INC. INNOVATION; COMMERCIAL METALS COMPANY; CONSUMER HEALTHCARE PRODUCTS ASSOCIATION; CROSSPARTISAN PAC I; D.R.I.V.E. - DEMOCRAT, REPUBLICAN, INDEPENDENT VOTER EDUCATION; DRAFTKINGS INC. POLITICAL ACTION COMMITTEE DBA DRAFTKINGS; DROPBOX INC; EBAY INC-COMMITTEE FOR RESPONSIBLE INTERNET COMMERCE; ENDEAVOR ACTION; FGS GLOBAL (US) LLC; FOX CORPORATION; HB STRATEGIES.

### Batch 30
HIGHMARK PAC OF HIGHMARK INC.; HSBC NORTH AMERICA FEDERAL, STATE AND LOCAL; INGRAM BARGE COMPANY; INTEL CORPORATION; INTERCONTINENTAL EXCHANGE INC; INTERNATIONAL LIQUID TERMINALS ASSOCIATION; INTERNATIONAL PAPER; JOHN HANCOCK LIFE INSURANCE COMPANY (USA) FEDERAL; KEY TO THE KEYSTONE; LAND O'LAKES, INC.; LEAGUE OF CONSERVATION VOTERS ACTION FUND; LKQ CORPORATION EMPLOYEE GOOD GOVERNMENT FUND; LSEG US HOLDCO INC.; LUMEN TECHNOLOGIES, INC.; MASTERS, MATES AND PILOTS POLITICAL CONTRIBUTION FUND; NATIONAL ASPHALT PAVEMENT ASSOCIATION; NATIONAL ASSOCIATION OF DISABILITY REPRESENTATIVES; NATIONAL ASSOCIATION OF SPECIALTY PHARMACY; NATIONAL FARMERS UNION; NATIONAL GROCERS ASSOCIATION GROCERS.

### Batch 31
NATIONAL VENTURE CAPITAL ASSOCIATION VENTUREPAC; NELNET INC; NORTH AMERICAN EQUIPMENT DEALERS ASSOCIATION; NORTHERN TRUST CORPORATION; PACIFIC LIFE INSURANCE COMPANY; PRIMERICA INC; PRINCIPAL LIFE INSURANCE COMPANY; PROFESSIONAL AVIATION SAFETY SPECIALISTS (PASS PAC); PROTECTIVE LIFE CORPORATION FEDERAL POLITICAL ACTION COMMITTEE ('PROTECTPAC'); PRUDENTIAL FINANCIAL INC. FEDERAL POLITICAL ACTION COMMITTEE (AKA - PRUDENTIAL FEDERAL; RBC USA HOLDCO CORPORATION FEDERAL; RELX INC.; RETAIL INDUSTRY LEADERS ASSOCIATION POLITICAL ACTION COMMITTEE AKA RETAIL LEADERS; RIO TINTO AMERICA INC.; ROLLS-ROYCE NORTH AMERICA HOLDINGS INC.; SANTANDER; SCIENCE APPLICATIONS INTERNATIONAL CORPORATION VOLUNTARY; SIERRA CLUB POLITICAL COMMITTEE; SOUTHWEST AIRLINES CO. FREEDOM FUND; SOUTHWEST AIRLINES CO. POLITICAL ACTION COMMITTEE (SWAPAC).

### Batch 32
STATE FARM MUTUAL AUTOMOBILE INSURANCE COMPANY FEDERAL; TAFT STETTINIUS & HOLLISTER LLP; TELADOC HEALTH, INC.; THE ALBERTSONS COMPANIES, INC.; THE AMERICAN SOCIETY OF PENSION PROFESSIONALS AND ACTUARIES; THE FARM CREDIT COUNCIL; THE NIELSEN COMPANY (US), LLC FEDERAL; TRANSPORTATION TRADES DEPARTMENT AFL-CIO; TRI-STATE MAXED OUT WOMEN; UNITED FOOD & COMMERCIAL WORKERS INTERNATIONAL UNION ACTIVE BALLOT CLUB; UNIVERSAL HEALTH SERVICES, INC. GOOD GOVERNMENT FUND (UHS GOOD GOVERNMENT FUND); US RENAL CARE; VILLAGEMD; VSP HOLDING COMPANY INC; Y COMBINATOR MANAGEMENT, LLC POLITICAL COMMITTEE (LITTLE TECH PAC); ZILLOW GROUP, INC.; JAN LISA HUTTNER; ISAAC RAY CENTER - RUSH HC; STATE OF MARYLAND; COMPASS.

### Batch 33
22BEACON; ELEVATE GOVERNMENT AFFAIRS; MASON CONSULTING LLC; PROSPECT SCHOOLS; THE COCHRAN FIRM; APPRAISAL INSTITUTE; AUSTIN INDUSTRIES COMPANIES; BEST BUY CO., INC EMPLOYEE POLITICAL FORUM; BGR GOVERNMENT AFFAIRS, LLC; ERICSSON INC. U.S. EMPLOYEES POLITICAL ACTION COMMITTEE ('ERICSSON PAC'); HIGHLAND ELECTRIC FLEETS, INC.; SONY MUSIC ENTERTAINMENT EMPLOYEE ACTION FUND; THE RECORDING INDUSTRY ASSOCIATION OF AMERICA; TORCH TECHNOLOGIES, INC; WAWA, INC.; UNIVERSITY OF MICHIGAN; BST; BHFS; UNIVERSITY OF OREGON; WILLIG WILLIAMS & DAVIDSON.

### Batch 34
GAP INC. POLITICAL ACTION COMMITTEE; THE; INFORMATION TECHNOLOGY INDUSTRY COUNCIL; VOYA FINANCIAL, INC.; STATE; RAYTHEON; ARMY; AON; UCSF; MOBILEGIS LTD; BROWN BROWN INSURANCE; AMERICAN ASSN. FOR MARRIAGE & FAMILY THERAPY COMM. ADVNCMNT OF MARITAL & FAMILY THERAPY; CALIFORNIA ASSOCIATION OF MARRIAGE & FAMILY THERAPISTS; UCLA; USC; COAXUM ENTERPRISES INC.; COLUMBIA; MONDELEZ; AMERICAN FINANCIAL SERVICES ASSOCIATION; AMERICAN INTELLECTUAL PROPERTY LAW ASSOCIATION INTELLECTUAL PROPERTY; AMERICANS FOR THE ARTS ACTION FUND.

### Batch 35
AVANTUS LLC; CROWE; EMPLOYEES OF QUANTA SERVICES, INC.; FOLEY & LARDNER POLITICAL FUND, INC.; ICE MILLER; JONATHAN ROSE COMPANIES; KLEIN/JOHNSON GROUP; LYFT, INC. FEDERAL; PLASTICS INDUSTRY ASSOCIATION; PRICE FOR CONGRESS; STEPTOE AND JOHNSON LLP; THE JOCKEY CLUB; THE PRIVATE INVESTOR COALITION, INC.; TLC BEATRICE LLC; STATE OF TEXAS; CITY OF MINNEAPOLIS; STATE OF CA; ALBERT EINSTEIN COLLEGE OF MEDICINE; USPS; MD ANDERSON CANCER CENTER.

### Batch 36
PPI; RANDOM HOUSE; DULY; VA; STATE OF CALIFORNIA; TEXAS TECH UNIVERSITY; OREGON STATE UNIVERSITY; NYU; UNIVERSITY OF CALIFORNIA; LOS ANGELES UNIFIED SCHOOL DISTRICT; SAINT PETER'S UNIVERSITY; TRINITY HEALTH; COLUMBIA UNIVERSITY; UCSD; NOBLIS; RUTGERS UNIVERSITY; STANFORD UNIVERSITY; CSU; UNIVERSITY OF IOWA; FDA.

### Batch 37
ACTORS' EQUITY ASSOCIATION; CHARTER SCHOOLS NOW; ORCHID BAY REALTY LLC; FREELANCE; DEPARTMENT OF STATE; C3 LEADERSHIP; FORDHAM UNIVERSITY; USG; UNIVERSITY OF KENTUCKY; CUNY; DOD; WATSON CLINIC; US ARMY; EMORY UNIVERSITY; UT MD ANDERSON CANCER CENTER; KAISER PERMANENTE; INDEPENDENT; GEORGE NAKASHIMA WOODWORKERS; WALMART; CORCORAN.

### Batch 38
CORNELL UNIVERSITY; ST. GABRIEL CHURCH; DEPT OF DEFENSE; IU; UNIVERSITY OF WASHINGTON; UNIVERSITY OF VIRGINIA; LAUSD; PIET RETIEF INC; NYC DOE; NYCTA; DELTA; DIOCESE OF NY AND HOULIHAN LAWRENCE; US POSTAL SERVICE; UPS; NOVANT HEALTH; JEFFRIES MAJORITY FUND - UNITEMIZED; JEFFRIES VICTORY FUND - UNITEMIZED; KRAMER DILLOF LIVINGSTON & MOORE ESQS.

### Verified finish checkpoint

The regenerated business-directory queue after these mappings reports **0 priority-unreviewed groups** and **0 single-donor executive priorities**, while preserving all **221,839 underlying transaction records**. Ambiguous researched names remain explicitly visible as **Unresolved** instead of being dropped or guessed.



## Post-batch unresolved-identity audit — November 25, 2026

This audit supersedes the earlier finish-state unresolved count. The repository actually contained **140 identity definitions marked Unresolved**, not 139.

Every one of those 140 definitions was re-audited. The corrected identity-definition state is now:

- **1160 Source-backed**
- **37 Unresolved**
- **11 Reviewed label**
- **1208 total researched identity definitions**

The reduction from 140 unresolved definitions to 37 came from correcting source-backed PACs and employers that had been held to an unnecessarily strict legal-suffix standard, separating generic/self/composite/internal labels into the non-identity **Reviewed label** status, and consolidating the two Brown Brown Insurance reported variants after donor/address evidence established the same local agency. No transaction rows were deleted by these identity-status corrections.

The remaining 37 definitions are the cases for which the audit still did not establish one sufficiently supported reusable identity. They remain visible and intentionally unmerged:

ACCENTURE INC.; DELAWARE NORTH COMPANIES, INC.; NEP; NEP INC.; SHARON PATRICK & ASSOCIATES, INC. / SHARON PATRICK ASSOCIATES, INC.; JRJ CONSTRUCTION; JRJ CONSTRUCTION LLC; ARBELLA CONSULTING; NW INTERNATIONAL WOMEN'S CONFERENCE; TJ FARMS LLC; BRIDGE 360 ADVISORY; SILVER RABBIT; ROCKET LLC; TXP SERVICES; GNE; JD DOVE FARMS; UNITED GENERAL BAKERIES; SKYLIGHT; REDBERRI INNOVATION; LALIEWORKS CREATIVE CONTENT SERVICES; KERMITSPAD; FOX HOLLOW VENTURES LLC; RSS-TGP; XXV HOLDINGS INC; CAMBIA; ELM PARK GROUP; MCCREERY INC.; BST; BHFS; COLUMBIA; PPI; VA; CSU; C3 LEADERSHIP; USG; ST. GABRIEL CHURCH; IU

Examples of why these remain unresolved include non-unique acronyms (for example NEP, GNE, BST, PPI, VA, CSU, USG and IU), same-name legal entities in multiple jurisdictions, generic or truncated employer strings, and donor records that lack enough location/entity context to choose safely among plausible organizations.

This audit also corrected stale regression assertions that still expected already-resolved identities to remain Unresolved. The browser cache chain for the business-directory identity data was bumped so the transaction-page directory loads the corrected research state.


## Deep lookup of the remaining 37 unresolved identities — November 25, 2026

The 37-definition unresolved queue was re-researched using broad live-web searches, official company pages, FEC/SEC records, state-registration-derived records, professional biographies, historical business records and campaign-finance donor context. Parallel's high-effort Research endpoint and Liner's deep-research endpoint were both unavailable because the connected accounts had insufficient research/search credits, so the successful lookup used Parallel Search plus direct source verification.

This pass resolved or reclassified **26 of the 37 definitions**. The researched identity-definition state is now:

- **1176 Source-backed**
- **11 Unresolved**
- **19 Reviewed label**
- **1206 total researched identity definitions**

New source-backed resolutions include Accenture Inc.; Delaware North Companies, Inc.; Patrick Partners, Inc. historical names Sharon Patrick Associates / Sharon Patrick & Associates; Arbella Consulting; Northwest International Women's Conference; Silver Rabbit; Rocket; TXP Services; GNE → Genentech; United General Bakery Inc.; Redberri; LalieWorks Creative Services; Kermit's Pad; XXV Dynasty Holdings Inc.; Cambia Health Solutions, Inc.; McCreery Inc.; BHFS → Brownstein Hyatt Farber Schreck, LLP; and C3 Leadership, LLC.

The following non-unique shorthand labels were moved out of the unresolved-identity count and into **Reviewed label** because the reported string itself does not identify one reusable entity without donor-specific context: BST; COLUMBIA; PPI; VA; CSU; USG; ST. GABRIEL CHURCH; IU.

The remaining **11** specific identity definitions still lack enough evidence to select one employer/entity without guessing:

1. NEP
2. NEP INC.
3. JRJ CONSTRUCTION
4. JRJ CONSTRUCTION LLC
5. TJ FARMS LLC
6. BRIDGE 360 ADVISORY
7. JD DOVE FARMS
8. SKYLIGHT
9. FOX HOLLOW VENTURES LLC
10. RSS-TGP
11. ELM PARK GROUP

Those remaining records stay visible in the directory and are intentionally unmerged.


### Final hard-name follow-up — November 25, 2026

A donor-context follow-up on the 11 remaining cases produced three further corrections:

- **SKYLIGHT → Skylight Engagement, Inc.** The earlier Juan de Onis lead was incorrect; campaign-finance and nonprofit records identify Paco de Onís with Skylight and the Executive Director role.
- **ELM PARK GROUP → Elm Park Group LLC.** New York licensing records place Elm Park Group LLC at 5 Renaissance Square, White Plains; Paul T. Willingham is independently tied to that same address and to the predecessor investigations business Gryphon Strategies.
- **NEP → Reviewed label.** Live searches established at least two plausible U.S. employer meanings (Norwest Equity Partners in Minneapolis and the separate NEP broadcast group in Pittsburgh), so the bare acronym is not one reusable identity without the specific donor/location context.

After the full 37-name lookup, the remaining **8 explicit unresolved identities** are:

1. NEP INC.
2. JRJ CONSTRUCTION
3. JRJ CONSTRUCTION LLC
4. TJ FARMS LLC
5. BRIDGE 360 ADVISORY
6. JD DOVE FARMS
7. FOX HOLLOW VENTURES LLC
8. RSS-TGP

These are the names for which the search still found multiple plausible exact entities or no independent donor-to-entity link strong enough to select one without guessing.
