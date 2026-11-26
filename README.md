# POPC

## File organization

- `reports/`: research report PDFs shown on the research page.
- `spreadsheets/`: source spreadsheets and CSV research files.
- `images/`: illustrations, header image data, and the generated petition preview.
- `letters/`: downloadable open-letter PDFs.
- `data/`: processed Jeffries transaction JSON files used by the app.

The Schumer transaction JSON files and app code remain at the repository root.
Asset links point to the folders above. `_redirects` preserves existing root-level asset URLs.
The petition preview workflow writes and publishes `images/petition-change-org-live.png`.
