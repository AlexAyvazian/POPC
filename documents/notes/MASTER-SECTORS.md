# Master sectors

All Jeffries and Schumer tables, charts, research queries and memo views use `assets/js/master-sectors.js`.

The vocabulary contains 40 labels. Employer status and unresolved classification are separate from business industries.

Priority: explicit source-backed research sector; existing exact-name research overrides; consistent direct-receipt source classifications; researched business description; shared name rules; unresolved. Memo rows never supply classification hints. Original source datasets remain unchanged. Parent-company relationships are not aggregation keys.

The same type-aware resolver handles both networks and verified aliases. Source sectors with conflicting labels fall back to the shared research/rules instead of choosing a committee-specific label.

## Labels

- Aerospace & defense
- Agriculture, food & beverage
- Cannabis
- Construction & infrastructure
- Diversified business group
- Education
- Energy & utilities
- Facilities & environmental services
- Finance & investment
- Foreign policy & advocacy
- Furniture & woodworking
- Government & public sector
- Health insurance
- Healthcare
- Hospitality & gaming
- Insurance
- Labor unions
- Legal services
- Lobbying & public affairs
- Manufacturing & automotive
- Media & entertainment
- Metals & materials processing
- Nonprofit & philanthropy
- Civil rights & civic advocacy
- Environment & conservation
- Gun safety
- Public policy research
- Pharmaceuticals & biotechnology
- Political committees & advocacy
- Professional services
- Real estate & housing
- Retail & consumer
- Security services
- Technology
- Telecommunications
- Trade associations
- Transportation
- Tribal nations & governments
- Personal status / unreported employer
- Sector unresolved / ambiguous

## Broad category correction (2026-11-26)

The former “Other advocacy” label mixed political committees, social-welfare advocacy, healthcare, cultural organizations, educational nonprofits and philanthropy. It is no longer a valid master sector. Legacy mixed labels supply no industry hint; the resolver consults the shared research or named activity instead. Unidentified activities remain explicitly unresolved.

Forty existing source-backed identity entries received reviewed activity sectors, preserving their identity scope and original sources. Two exact employer identities, Solana Foundation and Brookings, received official-source classification evidence. Sector evidence is displayed in donor-table research details. A generic nonprofit hint can no longer outweigh a researched health plan, healthcare provider or other specific activity. Source-backed explicit sector reviews remain authoritative.

Examples: Majority Forward → Political committees & advocacy; Good Ventures → Nonprofit & philanthropy; CareOregon → Health insurance; The Century Foundation and Brookings → Public policy research; the Everytown gun-safety organizations → Gun safety; Satoshi Action Fund and Solana Foundation → Technology. The Economic Opportunity Fund classification uses the IRS-derived civil-rights/social-action NTEE label, without inventing a narrower program mission.

Additional official sources reviewed:
- https://www.fec.gov/files/legal/murs/8215/8215_06.pdf (Majority Forward advocacy/voter-registration mission)
- https://americanopportunityaction.org/ (multi-issue advocacy mission)
- https://wedefendthevote.org/ (the Action Fund’s election/voting-rights advocacy, separate from the PAC)
- https://campionadvocacyfund.org/about/ (direct political/legislative advocacy, separate from the charitable foundation)
- https://www.satoshiaction.io/ (Bitcoin/digital-asset activity)
- https://possiblezone.org/ (educational programming)
- https://solana.org/ (blockchain ecosystem foundation)
- https://www.brookings.edu/about-us/ (public-policy research)

These changes preserve contribution amounts, memo treatment, all original receipt rows and verified alias boundaries. Unknown sectors and missing employer/status records are retained, not folded into an invented industry.
