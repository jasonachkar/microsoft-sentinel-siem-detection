# Architecture Decision Records

These ADRs capture the engineering decisions behind this Microsoft Sentinel cloud security detection engineering lab. They explain the why, alternatives, tradeoffs, security implications, operational implications, and interview talking points.

The same themes are summarized in the UI under **Governance -> Architecture Decisions** (`/decisions`).

| ADR | Decision | Area | Status |
| --- | --- | --- | --- |
| [0001](0001-detection-as-code-schema-and-go-deployer.md) | Detection-as-Code YAML schema and Go deployer | Detection engineering | Accepted |
| [0002](0002-terraform-managed-sentinel-infrastructure.md) | Terraform-managed Sentinel infrastructure | Cloud security / IaC | Accepted |
| [0003](0003-github-actions-oidc.md) | GitHub Actions OIDC instead of client secrets | Identity / CI/CD | Accepted |
| [0004](0004-scheduled-rules-vs-nrt-rules.md) | Scheduled rules before NRT rules | Sentinel engineering | Accepted |
| [0005](0005-native-tables-vs-asim.md) | Native tables with ASIM strategy | KQL engineering | Accepted |
| [0006](0006-demo-telemetry-vs-live-sentinel-ui.md) | Demo telemetry vs live Sentinel telemetry in UI | Product / evidence | Accepted |
| [0007](0007-drift-detection-with-terraform-plan.md) | Drift detection with Terraform plan | Governance | Accepted |
| [0008](0008-human-approved-soar-containment.md) | Human-approved SOAR containment | Incident response | Accepted |
| [0009](0009-aws-cloudtrail-connector-trust-model.md) | AWS CloudTrail connector trust model | Multi-cloud logging | Accepted |
| [0010](0010-defender-portal-alignment.md) | Defender portal alignment | Microsoft Sentinel operations | Accepted |
| [0011](0011-cost-control-strategy.md) | Cost-control strategy for portfolio lab | Security FinOps | Accepted |
| [0012](0012-evidence-first-portfolio-ui.md) | Evidence-first portfolio UI design | Reviewer experience | Accepted |
