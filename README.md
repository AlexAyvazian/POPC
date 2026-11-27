# POPC

Donor data starts in **ClaudeFiles/**. Its six researched CSVs and workbook supply all donor names, employer research, sector assignments, donor totals and committee allocations.

**ClaudeFiles/receipt-details.json** contains only information those aggregate files lack: the original receipt history and filing links, memos, other receipts, additional FEC fields, and missing identity evidence. It contains no old sector classifications. The superseded donor datasets, spreadsheets and classification modules have been deleted.

Run `python scripts/build-donors.py` to generate **data/donors.json** and its small configuration module. Every donor table, chart and research assistant reads that build through **assets/js/donor-data.js**. The default sector is Claude's supplied donor career view. Household relationships remain explicitly identified in the supplied research.

Run `node scripts/generate-donor-downloads.mjs` to rebuild both Excel workbooks and all six CSV downloads from the same dataset.

The donor workflow rebuilds and verifies these outputs when ClaudeFiles changes. No hosting configuration change is required.

| Folder | Contents |
| --- | --- |
| ClaudeFiles/ | Authoritative researched inputs and missing receipt details |
| data/ | Generated donor data, downloads and petition metadata |
| pages/ | Committee, combined analysis, research, petition and letter pages |
| assets/ | Browser code, styles and images |
| documents/ | Reports, letters and project notes |
| scripts/ | Donor build, downloads and petition capture |
| tests/ | Data reconciliation, chart, link and browser checks |

Use Node 22 and Python 3.12 with openpyxl 3.1.5. Run all data and link checks with `node --test tests/*.test.mjs`, then `node tests/browser-smoke.mjs` with Playwright installed.

The hourly petition preview workflow remains separate.
