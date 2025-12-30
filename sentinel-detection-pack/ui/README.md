# Sentinel Detection Pack UI

Vite + React UI that presents the detection pack like a SIEM console. Data is generated from the repo bundles and KQL metadata.

## Local development
1. From `sentinel-detection-pack/ui`:
   - `npm install`
   - `npm run dev`
2. Update data from the repo:
   - `npm run sync-data`

## Build
- `npm run build`
- Output: `ui/dist/`

## Vercel
- Set the root directory to `ui/`.
- Build command: `npm run build`
- Output directory: `dist`

## Live API (optional)
Set `VITE_API_BASE_URL` to your Azure Functions base URL, for example:
```
VITE_API_BASE_URL=https://siem-test-dchug8dffaa6fne6.canadacentral-01.azurewebsites.net
```
If unset, the UI uses simulated data derived from the rules catalog.

## Data pipeline
The UI uses `scripts/sync-data.js` to merge:
- `../bundles/sentinel-rules-bundle.json`
- `../rules/**.kql` metadata headers

This produces `src/data/rules.json` for the UI.
