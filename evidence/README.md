# Evidence Collection Guide

This folder is for sanitized screenshots that prove the lab was deployed or validated in a real tenant. Do not commit raw sensitive screenshots.

## What To Capture

Expected screenshot filenames:

| File | What it proves | UI page |
| --- | --- | --- |
| `azure/sentinel-enabled.example.png` | Sentinel enabled on the lab workspace | Evidence Center |
| `azure/analytics-rules-deployed.example.png` | Analytics rules deployed in Sentinel or Defender portal | Evidence Center, Detection Rules |
| `azure/logic-app-run-history.example.png` | Human-approved SOAR playbook ran in a tenant | SOAR, Evidence Center |
| `azure/log-analytics-workspace.example.png` | Log Analytics workspace exists and receives lab telemetry | Cloud Security Controls |
| `github/ci-pipeline-success.example.png` | GitHub Actions validation passed | Evidence Center, Drift |
| `github/code-scanning-results.example.png` | Code scanning or Trivy/CodeQL findings are published | AppSec |
| `github/drift-issue.example.png` | Drift detection created an issue | Drift |
| `defender/defender-portal-sentinel.example.png` | Sentinel is visible from the Defender portal | Reviewer Mode |
| `defender/secure-score.example.png` | Defender for Cloud posture evidence | Cloud Security Controls |

## Redaction Checklist

Before committing any screenshot:

- Blur tenant IDs, subscription IDs, object IDs, workspace IDs, and resource IDs if they are not already dummy values.
- Blur user principal names, public IP addresses, internal hostnames, and emails.
- Blur secrets, connection strings, tokens, webhook URLs, and account numbers.
- Crop browser profile names and bookmarks.
- Keep enough visible context to prove the feature, date, and relevant service page.

## Evidence Status

The UI intentionally shows missing evidence placeholders until real sanitized screenshots exist. Do not replace placeholders with generated images.

## Automated UI screenshots

Playwright can capture **UI reviewer evidence** for the portfolio app:

```bash
cd sentinel-detection-pack/ui
npm ci --ignore-scripts
npx playwright install --with-deps
npm run evidence:screenshots
```

Generated files (repo root):

```text
evidence/ui/start-here.png
evidence/ui/architecture.png
evidence/ui/password-spray-scenario.png
evidence/ui/evidence.png
evidence/ui/interview-prep.png
evidence/ui/mobile-start-here.png
evidence/ui/evidence-index.md
```

These are React UI captures only. They do **not** prove Sentinel deployment, analytics rule firing, or SOAR execution in a tenant. Azure/Sentinel portal screenshots still require a real lab environment and the redaction checklist above.

CI uploads the same files as the `portfolio-ui-screenshots` artifact from `.github/workflows/portfolio-evidence.yml`.

## Suggested Capture Order

1. CI pipeline success.
2. Detection validation artifact.
3. Sentinel workspace enabled.
4. Analytics rules deployed.
5. Optional Logic App run history.
6. Optional Defender portal and secure score screenshots.
