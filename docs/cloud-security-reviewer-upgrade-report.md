# Cloud Security Reviewer Upgrade Report

Date: 2026-05-24
Branch: `refactor/cloud-security-reviewer-experience`

## 1. Summary of Changes

Repositioned the repository as a Microsoft Sentinel Cloud Security Detection Engineering Lab instead of an operations platform. The UI now leads with reviewer flow, evidence, limitations, a flagship password spray scenario, cloud security controls, ADRs, and Interview Mode. Detection validation, Go deployer metadata support, sample telemetry, CI hardening, SOAR design, drift documentation, Defender portal alignment, and evidence structure were added or strengthened.

## 2. Files Changed

Major areas changed:

- Root `README.md`
- `sentinel-detection-pack/README.md`
- `sentinel-detection-pack/ui/src/components/`
- `sentinel-detection-pack/ui/src/data/`
- `src-cli/`
- `scripts/`
- `.github/workflows/`
- `terraform-*` modules
- `docs/detection-engineering/`
- `docs/soar/`
- `docs/adr/`
- `docs/cloud-security-controls.md`
- `docs/drift-detection.md`
- `docs/defender-portal-transition.md`
- `evidence/`

## 3. UI Pages Added, Removed, or Renamed

Added:

- `/reviewer` - Cloud Security Reviewer Mode
- `/evidence` - Evidence Center
- `/interview` - Interview Mode
- `/scenario/password-spray` - flagship detection walkthrough
- `/cloud-security-controls` - cloud security controls story

Relabelled:

- K8s Telemetry -> Demo K8s Telemetry
- IaC Posture -> IaC Posture Demo
- SOAR Playbooks -> SOAR Design
- Investigation -> Demo Investigation
- Drift -> Drift Demo & Pipeline

Removed:

- No useful page was removed. Demo pages remain secondary and labelled.

## 4. Claims Downgraded

Downgraded or clarified:

- "Production SOC" language removed or converted to explicit non-claim.
- "Live telemetry" replaced with demo/optional API language.
- "AI Copilot" reframed as Copilot Concept Demo.
- "Autonomous containment" replaced with human-approved SOAR design.
- "Compliance reporting" reframed as control reference mapping, not certification.
- Detection assertion clarified as metadata/sample validation locally unless optional live mode is configured.

## 5. Real vs Simulated Inventory

| Area | Status | Notes |
| --- | --- | --- |
| Sentinel IaC | Real Terraform | Requires Azure subscription and configured variables. |
| Detection rules | Real YAML/KQL | 16 rules validated locally. |
| Go deployer | Real code | Dry-run, explain, validation output, tests. |
| CI/CD | Real workflow | Validates security scans, Terraform, Go, UI, rules. |
| Drift detection | Real workflow design | Requires remote state and Azure auth for live checks. |
| UI telemetry | Demo unless labelled | Used to keep reviewer flow reliable. |
| Optional API pages | Optional live path | Empty without local Azure Function/workspace. |
| SOAR | Design + Terraform shell | No autonomous containment claim. |

## 6. Detection Schema Improvements

The Go deployer now validates and maps more Sentinel rule metadata:

- `requiredDataConnectors`
- `entityMappings`
- `customDetails`
- `alertDetailsOverride`
- `incidentConfiguration`
- `eventGroupingSettings`
- suppression settings
- enabled/status mapping
- query frequency and query period
- trigger operator and threshold
- tactics and techniques

Tests cover invalid GUIDs, missing queries, invalid severity, timing mismatch, connector parsing, custom details, alert override, entity mapping warnings, and disabled-rule handling.

## 7. KQL Validation Improvements

Added detection engineering docs, sample JSONL telemetry, and `scripts/test-detections.py`. Local validation checks rule metadata, table references, projected columns, entity mapping columns, MITRE mapping, and sample coverage. It does not execute KQL locally and is labelled accordingly.

## 8. CI/CD Improvements

Main workflow now includes:

- Gitleaks
- TFSec
- Trivy filesystem/config scans
- CodeQL
- Terraform fmt/init/validate matrix
- Go format/vet/test
- UI clean install/build
- detection metadata/sample validation
- bundle and validation artifacts
- OIDC-aware deploy placeholder

## 9. Cloud Security Improvements

Added or strengthened:

- Azure Policy module controls
- AWS CloudTrail connector hardening pattern
- OIDC identity governance docs
- Security logging design docs
- Cost-control docs
- Defender portal transition docs
- Drift detection docs and sample issue
- Human-approved SOAR containment docs

## 10. Remaining Risks

- `npm ci` reports 4 moderate npm audit findings. These should be reviewed before presenting dependency hygiene as complete.
- Local `bash ./scripts/validate-rules.sh --check-samples` could not run because this Windows environment routes `bash` to WSL without `/bin/bash`. PowerShell and Python validators passed.
- `tfsec`, `checkov`, and `trivy` were not installed locally, so local runs were not performed. The GitHub Actions workflow still defines those scans.
- Optional live Sentinel validation requires Azure credentials, workspace ID, deployed rules, and test telemetry.
- Evidence screenshots are not yet populated.
- Gitleaks full-history scan passes using `.gitleaks.toml` allowlisting historical non-secret demo credential strings from the attack simulator. Current source strings were changed to placeholders.
- UI bundle size warning remains due the current all-in-one route bundle.

## 11. What Jason Can Now Safely Claim

- Built a Microsoft Sentinel cloud security detection engineering lab.
- Authored repo-backed KQL/YAML Sentinel rules.
- Implemented Detection-as-Code validation and Go deployer dry-run/testing.
- Added Terraform modules for Sentinel, policy, SOAR design, honeypot, and AWS CloudTrail connector patterns.
- Hardened CI to validate rules, Go code, UI, and Terraform modules.
- Added drift detection workflow design and documentation.
- Built a reviewer UI that separates real code from demo telemetry.
- Documented Defender portal alignment and evidence collection process.

## 12. What Jason Must Still Not Claim

- Not a production SOC.
- Not a replacement for Microsoft Defender XDR or Microsoft Sentinel.
- Not fully live telemetry.
- Not SOC 2, ISO 27001, or NIST certified.
- Not autonomous containment.
- Not proof that every detection fired in a live tenant.
- Not a full MDR, SIEM, ASPM, or CNAPP product.

## 13. Validation Results

Passed:

- `git status --short` checked before validation.
- Terraform files listed successfully.
- `terraform fmt -check`, `terraform init -backend=false`, and `terraform validate` passed for:
  - `terraform`
  - `terraform-honeypot`
  - `terraform-soar`
  - `terraform-aws-connector`
  - `terraform-policy`
- `gofmt -l .` returned no files.
- `go vet ./...` passed.
- `go test ./...` passed.
- PowerShell rule validation passed.
- `python scripts/test-detections.py` passed with 16 rules, 0 failures, 0 warnings, 11 sample files, and 5 flagship scenarios.
- GitHub Actions workflow YAML parsed successfully for both workflows.
- `npm ci --ignore-scripts` completed.
- `npm run build` completed.
- `gitleaks detect --source . --redact` passed after replacing current demo credentials with placeholders and allowlisting historical non-secret demo strings.

Unavailable or caveated:

- Bash wrapper validation failed due missing WSL `/bin/bash`; PowerShell/Python equivalents passed.
- `tfsec`, `checkov`, and `trivy` were unavailable locally.
- `npm ci` reported 4 moderate audit findings.

## 14. Next 10 Tasks

1. Review and remediate the 4 moderate npm audit findings.
2. Add sanitized Reviewer Mode and Evidence Center screenshots.
3. Capture a GitHub Actions successful run screenshot after push.
4. Capture Sentinel analytics rule deployment screenshots after a safe lab deploy.
5. Configure optional live Sentinel validation against a dedicated lab workspace.
6. Parse SARIF/Actions artifacts into the AppSec UI instead of demo examples.
7. Add ASIM variants for the highest-value identity and network detections.
8. Add remote Terraform state documentation and least-privilege Azure role assignment examples.
9. Add a small live teardown checklist for cost control.
10. Split the UI bundle with route-level lazy loading.
