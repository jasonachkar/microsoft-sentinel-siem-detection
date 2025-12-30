# Live data (Azure Functions + Log Analytics)

This project includes an optional read-only Azure Functions API that streams live data into the UI.

## What it provides
- Alerts: aggregated `SecurityAlert` signals (last 24 hours).
- Incidents: aggregated `SecurityIncident` signals (last 14 days, Sentinel only).
- Table freshness: `Usage` table summary for last-ingested time per data type.

## Free-tier friendly
- Uses the Log Analytics workspace directly (no Sentinel required).
- If Sentinel is not enabled, the incidents endpoint returns an empty list with a warning.

## Configuration
Set the following app settings in the Function App:
- `LOG_ANALYTICS_WORKSPACE_ID` (workspace customer ID)
- `LOG_ANALYTICS_QUERY_TIMEOUT_SECONDS` (optional)

## Permissions
Assign the Function App managed identity:
- `Log Analytics Reader` on the workspace resource
- `Microsoft Sentinel Reader` on the workspace (only if you enable Sentinel)

## UI wiring
In the Vercel UI environment, set:
```
VITE_API_BASE_URL=https://<your-function-app>.azurewebsites.net
```
The UI falls back to simulated data if the API is unavailable.
