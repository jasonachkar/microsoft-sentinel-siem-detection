# ADR-0009: AWS CloudTrail Connector Trust Model

Status: Accepted

## Context

Enterprise cloud security is often multi-cloud. The lab should demonstrate an AWS-to-Sentinel logging pattern without hard-coding secrets or broad trust.

## Decision

Model the AWS side with Terraform: CloudTrail, encrypted S3 storage, public access block, object versioning, log-file validation, and an IAM role scoped by external ID for Sentinel ingestion.

## Alternatives

- Keep the lab Azure-only.
- Use static AWS access keys.
- Model CloudTrail without storage hardening.

## Tradeoffs

The connector requires tenant/workspace-specific configuration before live use. Terraform remains valuable as a reviewable trust-model example.

## Security Implications

External ID trust reduces confused deputy risk. Encrypted and versioned logs improve evidentiary integrity.

## Operational Implications

The AWS account ID and external ID must be configured for the target Sentinel connector. The default placeholder must be replaced before live deployment.

## Interview Talking Point

I can explain the trust boundary between AWS CloudTrail, S3, IAM AssumeRole, and Microsoft Sentinel ingestion.
