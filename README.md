# Microsoft Sentinel Cloud Security Detection Engineering Lab

Microsoft Sentinel Cloud Security Detection Engineering Lab showing Detection-as-Code, KQL analytics rules, Terraform-managed SIEM infrastructure, CI/CD security gates, drift detection, and SOAR response design.

Live demo: https://sentinel-detection-pack.vercel.app

This repository is a private lab and portfolio-grade implementation. It is designed to show how cloud security detections, infrastructure, validation, and reviewer evidence can be organized around Microsoft Sentinel. It is not presented as a production SOC platform.

## What This Project Proves

- Microsoft Sentinel Detection-as-Code using KQL and YAML rule definitions.
- KQL analytics rule engineering with MITRE ATT&CK metadata, entity mappings, and tuning notes.
- Terraform-managed Sentinel and cloud security infrastructure.
- Azure and AWS security telemetry ingestion patterns, including an AWS CloudTrail connector concept.
- CI/CD security gates for secrets, IaC, dependency, rule, and bundle validation.
- Drift detection using scheduled Terraform plan checks.
- SOAR playbook design with managed identity and scoped permissions.
- Cloud security evidence presentation through a React reviewer UI.
- Defender portal-aware Sentinel workflow positioning.

## What This Project Is Not

- Not a production SOC.
- Not a replacement for Microsoft Defender XDR or Microsoft Sentinel.
- Not SOC 2, ISO 27001, or NIST certified.
- Not real-time telemetry unless a page explicitly labels the data source as live.
- Not a full MDR, SIEM, ASPM, or CNAPP product.
- Not an autonomous containment system.
- Not an enterprise compliance reporting platform.

## Real vs Simulated

| Area | Status | Notes |
|------|--------|-------|
| Sentinel IaC | Real Terraform | Deployable with an Azure subscription and appropriate variables/secrets. |
| KQL/YAML rules | Real files | Located under `sentinel-detection-pack/rules/` and `sentinel-detection-pack/rules-yaml/`. |
| Go deployer | Real dry-run/apply path | Uses `DefaultAzureCredential`; deploys scheduled analytics rule definitions where configured. |
| CI/CD security gates | Real GitHub Actions workflow | Runs scans and validation in `.github/workflows/sentinel-ci-cd.yaml`. |
| Drift detection workflow | Real workflow | Requires Azure OIDC and remote state secrets to run against an environment. |
| UI incident/telemetry data | Demo/simulated unless labelled otherwise | Used to demonstrate reviewer flow without requiring a paid 24/7 lab. |
| Detection assertion | Local/mock unless live mode is implemented | `scripts/assert-detection.py` currently simulates the Sentinel alert confirmation path. |
| SOAR response | Terraform shell/design unless connected and tested live | The implementation must be treated as a human-reviewable playbook design until tested. |
| Threat intelligence UI | Demo/API-dependent | Public feeds may fail due to browser/CORS limits and fall back to demo data. |

## Repository Layout

| Path | Purpose |
|------|---------|
| `terraform/` | Sentinel core infrastructure: Log Analytics workspace and Sentinel enablement. |
| `terraform-aws-connector/` | AWS CloudTrail connector concept with S3, KMS, and IAM trust. |
| `terraform-soar/` | SOAR Logic App infrastructure shell and managed identity permissions. |
| `terraform-honeypot/` | Temporary honeypot lab infrastructure for safe validation exercises. |
| `terraform-policy/` | Azure Policy examples for cloud security posture guardrails. |
| `src-cli/` | Go-based Sentinel rule deployer. |
| `sentinel-detection-pack/rules-yaml/` | Sentinel analytics rule definitions. |
| `sentinel-detection-pack/rules/` | KQL source files with rule metadata. |
| `sentinel-detection-pack/ui/` | React + PrimeReact portfolio UI. |
| `.github/workflows/` | CI/CD and drift detection workflows. |
| `scripts/` | Validation, bundling, assertion, SOAR, and threat-intel demo scripts. |

## Local Development

```bash
cd sentinel-detection-pack/ui
npm install
npm run dev
```

Run rule validation in CI-compatible environments with:

```bash
./scripts/validate-rules.sh --check-samples
```

On Windows, the PowerShell validator is present but currently needs a small parser fix before it can run cleanly.

## Safe Interview Positioning

Safe claim: "I built a Microsoft Sentinel cloud security detection engineering lab with repo-backed KQL rules, Terraform modules, CI/CD validation, drift detection, SOAR design, and a UI that clearly separates real code from demo telemetry."

Do not claim: production SOC, enterprise MDR platform, autonomous containment, compliance certification, or fully live real-time telemetry.
