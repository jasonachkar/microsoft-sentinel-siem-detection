# ADR-0002: Terraform-Managed Sentinel Infrastructure

Status: Accepted

## Context

The lab needs cloud security infrastructure that can be inspected, reviewed, validated, and recreated. Manually clicking through Azure resources would make the architecture hard to trust.

## Decision

Use Terraform modules for Sentinel core resources, honeypot infrastructure, SOAR design, AWS CloudTrail connector design, and Azure Policy governance.

## Alternatives

- Manual portal setup.
- Azure CLI scripts.
- Bicep-only deployment.

## Tradeoffs

Terraform introduces provider setup and state management requirements. It is still a strong fit because it is cloud-neutral, reviewable, and aligns with multi-cloud IaC expectations.

## Security Implications

Infrastructure can be scanned with TFSec/Trivy, reviewed in pull requests, and checked for drift. Resource permissions and defaults are visible to reviewers.

## Operational Implications

Live apply requires a subscription, state backend, and provider credentials. The repository can still be evaluated without applying resources.

## Interview Talking Point

I used IaC so a reviewer can inspect the security posture, not just see a screenshot of a portal.
