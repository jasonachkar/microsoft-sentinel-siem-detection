# UI Evidence Screenshots

Generated: 2026-05-24T19:30:55.402Z

These are **automated UI reviewer evidence** captures from the portfolio React app.
They are **not** Azure tenant or Sentinel portal screenshots.
Real cloud deployment proof still requires a configured lab environment.

| Screenshot | Route | What it proves |
| --- | --- | --- |
| [start-here.png](./start-here.png) | `/` | Guided reviewer entry point with mission, proof pillars, and 5-minute path. |
| [architecture.png](./architecture.png) | `/architecture` | End-to-end architecture narrative for detection engineering and cloud security. |
| [password-spray-scenario.png](./password-spray-scenario.png) | `/scenario/password-spray` | Flagship Entra ID detection walkthrough with KQL, entities, and triage context. |
| [evidence.png](./evidence.png) | `/evidence` | Repo-backed proof inventory separating real code, demo data, and limitations. |
| [interview-prep.png](./interview-prep.png) | `/interview` | Skills matrix, hard questions, and safe claims for hiring conversations. |
| [mobile-start-here.png](./mobile-start-here.png) | `/` | Mobile layout of the Start Here reviewer journey. |

## Regenerate locally

```bash
cd sentinel-detection-pack/ui
npm run build
npm run evidence:screenshots
```

## CI artifacts

GitHub Actions uploads `portfolio-ui-screenshots` and `playwright-report` on each run.

