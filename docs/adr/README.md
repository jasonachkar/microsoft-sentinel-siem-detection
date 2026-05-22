# Architecture Decision Records (ADRs)

This log captures the significant engineering decisions behind the platform — the
*why* and the trade-off accepted, not just the *what*. The same content is rendered
in-app under **Governance → Architecture Decisions** (`/decisions`).

| ADR | Decision | Area | Status |
|-----|----------|------|--------|
| 0001 | OIDC federation over stored cloud credentials | Identity | Accepted |
| 0002 | Resource-group-scoped RBAC for the SOAR identity | IAM / Least privilege | Accepted |
| 0003 | Customer-managed KMS over SSE-S3 for CloudTrail | Data protection | Accepted |
| 0004 | Detection-as-Code over portal authoring | Detection engineering | Accepted |
| 0005 | Blocking shift-left gate over advisory scanning | DevSecOps | Accepted |
| 0006 | Hot/cold SIEM tiering for cost control | FinOps | Accepted |
| 0007 | Prevention (Azure Policy) paired with detection (Sentinel) | Governance | Accepted |

---

## ADR-0001 — OIDC federation over stored cloud credentials
**Context:** CI/CD must authenticate to Azure to deploy detections and run drift checks.
**Decision:** Use GitHub OIDC federated credentials (`DefaultAzureCredential` / `azure/login`) instead of long-lived client secrets stored in GitHub.
**Why:** No standing secret to leak or rotate; tokens are short-lived and scoped per workflow run.
**Trade-off:** Requires federated-credential setup on the app registration — slightly more initial config than a secret.

## ADR-0002 — Resource-group-scoped RBAC for the SOAR identity
**Context:** The isolate-host Logic App needs to modify NSGs to contain a compromised host.
**Decision:** Grant the managed identity `Network Contributor` on the SOAR resource group only, not the subscription.
**Why:** Least privilege — a compromised playbook cannot touch networking outside its blast radius.
**Trade-off:** NSGs to be managed must live in (or be delegated to) that resource group.

## ADR-0003 — Customer-managed KMS over SSE-S3 for CloudTrail
**Context:** CloudTrail logs are security-critical evidence stored in S3.
**Decision:** Encrypt the bucket and trail with a customer-managed KMS key (rotation enabled) rather than default SSE-S3.
**Why:** Key custody, rotation and revocation under our control; satisfies CIS / MCSB CMK requirements.
**Trade-off:** KMS key + key-policy maintenance and minor per-request cost.

## ADR-0004 — Detection-as-Code over portal authoring
**Context:** Sentinel analytics rules must be reviewable, testable and reproducible.
**Decision:** Author rules as YAML, validate + assert in CI, deploy via a Go CLI that calls the ARM `ScheduledAlertRule` API.
**Why:** Version control, peer review, and Atomic Red Team assertion before any rule is trusted.
**Trade-off:** More upfront tooling than the portal; pays off in repeatability and audit trail.

## ADR-0005 — Blocking shift-left gate over advisory scanning
**Context:** IaC misconfigurations were scanned but never failed the build (`soft_fail`).
**Decision:** Fail the pipeline on HIGH/CRITICAL TFSec findings; report MEDIUM/LOW non-blocking.
**Why:** A gate that cannot fail is decoration; a HIGH threshold keeps signal high and noise low.
**Trade-off:** Modules must stay clean; a new HIGH finding blocks merges until fixed — by design.

## ADR-0006 — Hot/cold SIEM tiering for cost control
**Context:** Sentinel ingestion is billed per GB; verbose bulk logs are expensive in the hot tier.
**Decision:** Route high-fidelity security data to Sentinel (hot); send bulk/compliance logs to a cold tier (ADX / data lake).
**Why:** Preserves detection fidelity while materially cutting ingestion cost.
**Trade-off:** Cold-tier queries are slower; needs a routing pipeline (Logstash / Cribl).

## ADR-0007 — Prevention (Azure Policy) paired with detection (Sentinel)
**Context:** Detections alert after the fact; some misconfigurations should never be deployable.
**Decision:** Add Azure Policy deny/audit definitions + the Microsoft Cloud Security Benchmark initiative (`terraform-policy/`) alongside the KQL detections.
**Why:** Defense in depth — block at deploy time, detect anything that slips through at runtime.
**Trade-off:** Policy can block legitimate edge cases; needs an exemption process.
