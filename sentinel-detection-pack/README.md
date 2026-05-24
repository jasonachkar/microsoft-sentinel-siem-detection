# Sentinel Detection Pack

This folder contains the Microsoft Sentinel content for the Cloud Security Detection Engineering Lab. It includes KQL detections, Sentinel YAML rule definitions, sample telemetry, documentation, an optional Azure Functions API, and the React reviewer UI.

The goal is to demonstrate a defensible Detection-as-Code workflow for a portfolio lab. Demo telemetry is labelled as demo telemetry. Live Azure/Sentinel data requires explicit configuration.

## What This Project Proves

- Microsoft Sentinel Detection-as-Code.
- KQL analytics rule engineering.
- Rule metadata, entity mapping, MITRE mapping, and tuning documentation.
- CI/CD validation and bundle generation.
- Terraform-managed cloud security infrastructure from the repository root.
- SOAR and drift-detection design patterns.
- A reviewer UI that points back to source files.

## What This Project Is Not

- Not a production SOC.
- Not a replacement for Microsoft Defender XDR or Sentinel.
- Not SOC 2, ISO 27001, or NIST certified.
- Not real-time telemetry unless explicitly labelled.
- Not a full MDR/SIEM product.
- Not an enterprise ASPM/CNAPP platform.
- Not an autonomous containment system.

## Real vs Simulated

| Area | Status | Notes |
|------|--------|-------|
| KQL rules | Real files | `rules/**/*.kql` contains the detection logic and metadata headers. |
| Sentinel YAML rules | Real files | `rules-yaml/**/*.yaml` contains deployable scheduled analytics rule definitions. |
| Bundles | Generated artifacts | `bundles/` is generated from the YAML/KQL content. |
| Sample telemetry | Sample/demo | JSONL files support local metadata/sample validation; they are not live Sentinel exports. |
| UI incident workflow | Demo/simulated | Used to show triage flow without pretending to be a production incident queue. |
| KQL playground | Local demo | Uses local sample tables and simplified parsing, not the Log Analytics query engine. |
| Optional Azure Functions API | Real code path | Can query Sentinel/Log Analytics when credentials and workspace configuration exist. |
| Detection assertion | Mock/local by default | The current assertion script simulates an alert being found unless live mode is implemented. |

## Rule Content

Rules are organized by security domain:

| Domain | Rules |
|--------|-------|
| Identity | Password spray, impossible travel, MFA fatigue, risky sign-in, privileged role assignment |
| Cloud | Service principal credential addition, Key Vault anomaly, rare admin operations, Kubernetes exec |
| Endpoint | Suspicious PowerShell, LSASS access, local admin group changes |
| Email | Phishing attachment patterns, external inbox forwarding |
| Network | Rare outbound volume, unusual RDP/SMB movement |

## Local UI

```bash
cd ui
npm install
npm run dev
```

The UI is a portfolio reviewer experience. Some pages use repo-backed evidence, while others use demo data. Pages must make that distinction clear.

## Validation

CI uses the repository-level Bash validator:

```bash
./scripts/validate-rules.sh --check-samples
```

The Windows PowerShell validator currently needs parser cleanup before it can run as a reliable local equivalent.

## Documentation

- `docs/overview.md`
- `docs/data-sources.md`
- `docs/deployment.md`
- `docs/testing.md`
- `docs/tuning.md`
- `docs/mitre-mapping.md`

## Safe Interview Positioning

This is a Microsoft Sentinel cloud security detection engineering lab. It proves structure, engineering judgment, and deployable patterns. It should not be described as a production-ready SOC platform.
