# Sentinel Live API (Azure Functions)

Read-only Azure Functions API for live SIEM-style data using Log Analytics. Uses managed identity to query the workspace.

## Endpoints
- `GET /api/alerts` - SecurityAlert summary (last 24h)
- `GET /api/incidents` - SecurityIncident summary (last 14d, Sentinel only)
- `GET /api/table-freshness` - Usage table freshness (last 7d)

## Required settings
- `LOG_ANALYTICS_WORKSPACE_ID` (workspace customer ID)
- `LOG_ANALYTICS_QUERY_TIMEOUT_SECONDS` (optional)

## Local development
1. Copy `local.settings.json.example` to `local.settings.json` and fill in the workspace ID.
2. `func start`

## Azure deployment
1. Create a Function App (.NET 8 isolated, consumption or flex consumption).
2. Enable system-assigned managed identity.
3. Grant `Log Analytics Reader` on the workspace resource.
4. (Optional) Enable Sentinel and grant `Microsoft Sentinel Reader` for incidents.
5. Add app setting `LOG_ANALYTICS_WORKSPACE_ID`.

## Notes
- If `SecurityAlert` or `SecurityIncident` tables do not exist, the API returns an empty list with a warning.
