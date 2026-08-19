# UI Evidence Screenshots

Generated: 2026-08-16T17:11:03.685Z

These are **automated UI reviewer evidence** captures from the portfolio React app.
They are **not** Azure tenant or Sentinel portal screenshots.
Real cloud deployment proof still requires a configured lab environment.

| Screenshot | Route | What it proves |
| --- | --- | --- |
| [overview.png](./overview.png) | `/` | Homepage answers what/why/where in the first viewport, with a repo-derived proof strip. |
| [architecture.png](./architecture.png) | `/architecture` | Reference architecture, trust boundaries, infrastructure source, and featured ADRs. |
| [detections.png](./detections.png) | `/detections` | Filterable detection catalog generated from rules-yaml at build time. |
| [password-spray-detail.png](./password-spray-detail.png) | `/detections/0710c724-a738-4b0f-af52-947ba4f01c0d` | Flagship detection case study: KQL, tuning, false positives, and response runbook. |
| [delivery-and-response.png](./delivery-and-response.png) | `/operations` | PR-to-Sentinel delivery lifecycle and the detection-to-response lifecycle. |
| [evidence.png](./evidence.png) | `/evidence` | Repo-backed proof inventory with a six-state status vocabulary and project scope. |
| [mobile-overview.png](./mobile-overview.png) | `/` | Mobile layout of the homepage. |

## Regenerate locally

```bash
cd sentinel-detection-pack/ui
npm run build
npm run evidence:screenshots
```

## CI artifacts

GitHub Actions uploads `portfolio-ui-screenshots` and `playwright-report` on each run.

