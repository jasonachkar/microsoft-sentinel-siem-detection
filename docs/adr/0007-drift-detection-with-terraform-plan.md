# ADR-0007: Drift Detection With Terraform Plan

Status: Accepted

## Context

Cloud environments often drift when admins make manual portal changes outside IaC. A cloud security lab should show how drift would be detected and incidentized.

## Decision

Use a scheduled GitHub Actions workflow that runs Terraform plan with detailed exit codes and creates an issue when drift is detected.

## Alternatives

- Manual drift reviews.
- Azure Resource Graph only.
- Commercial posture management only.

## Tradeoffs

Terraform drift detection depends on correct remote state and provider credentials. It does not replace full CSPM coverage.

## Security Implications

Manual changes become visible and reviewable instead of silently bypassing code review.

## Operational Implications

Exit code 0 means no drift, 1 means plan error, and 2 means drift/change detected. Issue creation creates an auditable response path.

## Interview Talking Point

I treat drift as an operational security signal, not just an IaC inconvenience.
