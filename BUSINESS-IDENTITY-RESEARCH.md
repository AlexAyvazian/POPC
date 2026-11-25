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



## Research-backlog qualification — November 25, 2026

The unreviewed backlog now counts only names that qualify as research identities:

- any identity with a direct or memo PAC / organization receipt;
- any identity already researched (source-backed or unresolved); or
- an employer reported by at least **two distinct individual donors**.

An unreviewed employer reported by only one distinct individual donor no longer inflates the research backlog, even when that donor has multiple receipt records. Those employer strings and every underlying contribution/memo record remain preserved and searchable; they are excluded from prioritization, not deleted or merged.

The queue exporter and the default research view use the same qualification rule so the visible backlog and exported unreviewed count stay consistent.
