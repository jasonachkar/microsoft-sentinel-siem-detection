# Cloud Security Controls Story

This project is more than a Sentinel dashboard. It connects detection engineering with cloud posture, identity, logging, governance, and cost awareness.

## Control Areas

| Area | Repo evidence | Status | Why it matters |
| --- | --- | --- | --- |
| Sentinel core | `terraform/main.tf` | Real IaC | Log Analytics and Sentinel are the detection foundation |
| Azure Policy | `terraform-policy/main.tf` | Real IaC | Prevents or audits risky cloud configurations |
| AWS CloudTrail connector | `terraform-aws-connector/main.tf` | Real IaC pattern | Shows multi-cloud telemetry ingestion design |
| GitHub OIDC | `.github/workflows/sentinel-ci-cd.yaml` | Real CI design | Avoids long-lived deployment secrets |
| Drift detection | `.github/workflows/drift-detection.yaml` | Real CI design | Finds manual cloud changes outside Terraform |
| SOAR containment | `terraform-soar/` | Human-approved design | Keeps destructive response scoped and reviewed |
| Detection validation | `scripts/test-detections.py` | Real local validation | Checks rule metadata and sample telemetry coverage |

## Azure Policy Controls

The policy module includes examples for:

- Denying storage accounts without secure transfer.
- Denying public storage network access.
- Denying anonymous public blob container access.
- Auditing public IP resources.
- Auditing weak storage TLS.
- Auditing VMs without encryption at host.
- Auditing missing owner/environment tags.
- Auditing Key Vault resources for diagnostic settings review.

## What Is Not Claimed

This lab does not claim tenant-wide compliance, production enforcement, or complete CNAPP coverage. The goal is to show how a cloud security engineer thinks across prevention, logging, detection, response, drift, and cost.
