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

## Automated reviewer evidence

Playwright tests and screenshot generation for the 5-minute reviewer path:

```bash
npm ci --ignore-scripts
npx playwright install --with-deps
npm run evidence:all
```

Scripts:

| Script | Purpose |
| --- | --- |
| `npm run test:e2e` | Build + run all Playwright tests (works from clean checkout) |
| `npm run test:e2e:built` | Run Playwright tests against existing `dist/` (CI uses this after build) |
| `npm run test:e2e:headed` | Build + run with visible browser |
| `npm run evidence:screenshots` | Generate `evidence/ui/*` captures |
| `npm run evidence:all` | Build once + screenshots + e2e (no double build) |

Output is written to `../../evidence/ui/`. GitHub Actions uploads artifacts as `portfolio-ui-screenshots` and `playwright-report`.

UI screenshots are automated reviewer evidence. Azure/Sentinel portal screenshots still need a real lab — this pipeline does not fake them.

## Positioning

Safe description: "A portfolio UI for a Microsoft Sentinel cloud security detection engineering lab."

Avoid describing this UI as production-ready, fully live, compliance-ready, or an enterprise SOC platform.
