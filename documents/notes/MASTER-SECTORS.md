# Master sector system

Both networks use the user-supplied 63 refined sectors and 17 sector groups. `assets/js/master-sectors.js` resolves these classifications for all 11 committee tabs, the two combined tabs, their charts, the research queries and direct/memo receipt views.

`data/sectors/jeffries.json` and `data/sectors/schumer.json` retain all 24,638 supplied donor classifications. `data/sectors/taxonomy.js` is the shared vocabulary. `source-manifest.json` records the seven input filenames and SHA-256 hashes. The importer reconciles every uploaded donor, contribution amount, receipt count and per-committee amount against the site exports before producing the shared data files.

Organizations and corporate PACs use the industry supplied in the new classifications. Individuals use the supplied donor-level refined sector within their network; common names are not matched across networks. The same classification applies to the donor's committee-level rows and combined total. Verified business aliases remain separate from parent-company relationships, and sector propagation does not merge identities or money.

The original refined sector remains the primary classification. The supplied donor-career and household views, relationship context and evidence are retained separately. Review flags, confidence fields and strong/weak labels are excluded from the public tables and downloads.

All 160,122 direct receipt records and 138,902 memo records retain their original amounts and treatment. Source receipt files remain unchanged. Refreshed workbooks include the three donor tables, 17-group and refined-sector summaries, and underlying direct receipts.

## Vocabulary

| Sector group | Refined sector |
|---|---|
| Consumer, Retail & Hospitality | Alcohol, Beverage & Tobacco |
| Consumer, Retail & Hospitality | Cannabis |
| Consumer, Retail & Hospitality | Hospitality, Gaming & Sports |
| Consumer, Retail & Hospitality | Retail, Restaurants & Consumer Goods |
| Defense & Aerospace | Defense & Aerospace Contractors |
| Education & Nonprofit | Education |
| Education & Nonprofit | Nonprofit & Philanthropy |
| Energy, Industry & Agriculture | Agriculture & Food |
| Energy, Industry & Agriculture | Clean Energy & Solar |
| Energy, Industry & Agriculture | Electric Utilities & Power |
| Energy, Industry & Agriculture | Energy (type not specified) |
| Energy, Industry & Agriculture | Manufacturing & Heavy Equipment |
| Energy, Industry & Agriculture | Mining, Metals & Chemicals |
| Energy, Industry & Agriculture | Oil, Gas & Fuels |
| Finance | Banking |
| Finance | Consumer Finance & Payments |
| Finance | Crypto & Digital Assets |
| Finance | Hedge Funds & Proprietary Trading |
| Finance | Investment, Asset Management & Securities |
| Finance | Mortgage & Title |
| Finance | Private Equity & Venture Capital |
| Government & Tribal Nations | Government & Public Sector |
| Government & Tribal Nations | Tribal Nations & Governments |
| Health & Pharma | Health Advocacy & Patient Groups |
| Health & Pharma | Healthcare (type not specified) |
| Health & Pharma | Hospitals, Health Providers & Telehealth |
| Health & Pharma | Nurses, PAs, Dental & Allied Health Professionals |
| Health & Pharma | Pharma, Pharmacy & Health Products |
| Health & Pharma | Physicians & Medical Specialty Societies |
| Insurance | Health Insurance |
| Insurance | Insurance (type not specified) |
| Insurance | Insurance Agents, Brokers & Advisors |
| Insurance | Life, Annuity & Benefits Insurance |
| Insurance | Property & Casualty Insurance |
| Labor Unions | Labor Unions |
| Legal, Lobbying & Professional Services | Accounting & Consulting |
| Legal, Lobbying & Professional Services | Facilities & Environmental Services |
| Legal, Lobbying & Professional Services | Law Firms & Legal Services |
| Legal, Lobbying & Professional Services | Lobbying & Public Affairs |
| Legal, Lobbying & Professional Services | Other Professional & Business Services |
| Legal, Lobbying & Professional Services | Security Services |
| Multi-industry & Diversified | Diversified Holding Companies |
| Multi-industry & Diversified | Multi-Industry Business Associations |
| No sector (individual) | No sector: Employer & occupation not reported |
| No sector (individual) | No sector: Not employed / homemaker / student |
| No sector (individual) | No sector: Retired |
| No sector (individual) | No sector: Self-employed (field not given) |
| Political, Advocacy & Civic | Civil Rights & Civic Advocacy |
| Political, Advocacy & Civic | Environment & Conservation |
| Political, Advocacy & Civic | Foreign Policy Advocacy |
| Political, Advocacy & Civic | Gun Safety |
| Political, Advocacy & Civic | Political Committees & Advocacy |
| Political, Advocacy & Civic | Public Policy Research |
| Real Estate & Construction | Construction & Engineering |
| Real Estate & Construction | Real Estate & Property Management |
| Technology, Telecom & Media | Media & Entertainment |
| Technology, Telecom & Media | Technology |
| Technology, Telecom & Media | Telecom & Cable |
| Transportation | Airlines |
| Transportation | Automotive & Marine |
| Transportation | Freight, Rail & Logistics |
| Transportation | Transportation (type not specified) |
| Unresolved | Unresolved / ambiguous |
