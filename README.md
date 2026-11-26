# POPC

## File organization

| Folder | Contents |
| --- | --- |
| `pages/` | Committee, transaction, research, petition and letter pages |
| `assets/css/` | Stylesheets |
| `assets/js/` | Browser code, shared committee renderer and research assistant |
| `assets/images/` | Illustrations, header assets and petition preview |
| `data/jeffries/` | Jeffries receipt datasets and business identities |
| `data/schumer/` | Schumer receipt datasets, manifest, reconciliation and identities |
| `data/petition/` | Petition preview metadata |
| `documents/` | Reports, letters, source spreadsheets and research notes |
| `scripts/` | Data exports and petition capture |
| `tests/` | Automated regression and site-link checks |

The homepage stays at `index.html`. Cloudflare requires `functions/`, `_routes.json`, and `_redirects` at their existing locations. GitHub workflows stay in `.github/workflows/`.

Existing public URLs redirect to their new locations. Internal links use the new paths directly. No build step or deployment-setting change is required.

Research engines and assistants share implementations while retaining separate Jeffries and Schumer data. The Battleground Protection and Clark Victory committee pages share a renderer with separate reconciliation totals.

Run all checks with `node --test tests/*.test.mjs` on Node 22. Run the research queue export with `node scripts/business-directory-unreviewed.mjs`.

The hourly petition workflow updates `assets/images/petition-change-org-live.png` and `data/petition/petition-change-org-live.json`.
