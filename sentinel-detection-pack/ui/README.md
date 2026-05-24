# Sentinel Detection Lab UI

React + PrimeReact interface for the Microsoft Sentinel Cloud Security Detection Engineering Lab.

This UI is built for portfolio review. It shows repo-backed evidence where possible and explicitly labels demo/simulated telemetry. It should not be described as a production SOC console.

## What It Shows

- Reviewer-friendly cloud security architecture.
- Detection-as-Code rule catalog sourced from repository data.
- Infrastructure-as-Code views generated from repo files.
- CI/CD, AppSec, drift detection, SOAR, and FinOps concepts.
- Demo incident, KQL, threat-map, and telemetry views for explaining workflows.

## Real vs Demo

| UI Area | Status | Notes |
|---------|--------|-------|
| Rule catalog | Repo-backed | Generated from `rules-yaml/` and KQL metadata. |
| IaC explorer | Repo-backed | Generated from Terraform, workflow, Go, and script sources. |
| Live incidents page | Optional live path | Requires the Azure Functions API and Sentinel workspace config. |
| Incident board | Demo/simulated | Demonstrates triage workflow only. |
| KQL playground | Local demo | Uses sample data and simplified query handling. |
| Threat map | Demo/API-dependent | Public feeds may fall back to representative demo data. |
| Copilot concept | Demo-only | Shows possible triage output, not a deployed SOC analyst. |

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

`npm run sync-data` refreshes UI data files from repository source content.

## Positioning

Safe description: "A portfolio UI for a Microsoft Sentinel cloud security detection engineering lab."

Avoid describing this UI as production-ready, fully live, compliance-ready, or an enterprise SOC platform.
