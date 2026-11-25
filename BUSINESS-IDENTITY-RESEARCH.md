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
