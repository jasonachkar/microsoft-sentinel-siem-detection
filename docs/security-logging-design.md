# Security Logging Design

The lab's detection story depends on reliable cloud telemetry routing.

## Azure Logging

- Entra ID sign-in and audit logs feed identity detections.
- Azure Activity logs support cloud control-plane detections.
- Key Vault diagnostic logs support secret access anomaly detection.
- NSG flow logs are a planned network hunting enhancement.
- Log Analytics retention and table-level cost controls should be set per lab budget.

## AWS Logging

- CloudTrail captures AWS control-plane events.
- S3 storage should use encryption, public access block, and versioning.
- Sentinel ingestion requires a trust relationship and external ID pattern.

## Kubernetes Logging

- AKS audit logs must be routed to Log Analytics for Kubernetes exec detections.
- EKS audit logging would need CloudWatch/CloudTrail routing before Sentinel ingestion.

## Current Limitation

The UI can show simulated telemetry for reviewer flow. Live logging evidence should be captured under `evidence/` only after the tenant is configured and sanitized.
