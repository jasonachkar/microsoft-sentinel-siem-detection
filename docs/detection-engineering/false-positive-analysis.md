# False Positive Analysis

This document lists expected benign causes for the lab's main detection families. It is intended to support interview discussion and rule tuning, not to claim production tuning is complete.

| Rule family | Common false positives | Tuning approach |
| --- | --- | --- |
| Entra ID password spray | Corporate NAT, password reset waves, legacy apps, scanners | Allowlist trusted egress IPs and tune distinct-account thresholds |
| Privileged role assignment | Approved admin changes, PIM activation, onboarding automation | Require change ticket, role allowlist, and initiator review |
| Key Vault secret access anomaly | Deployment pipelines, backup jobs, break-glass recovery | Allowlist managed identities and known service IPs |
| Kubernetes exec | SRE troubleshooting, incident response, cluster bootstrap scripts | Scope to risky namespaces, unexpected users, and shell/network tools |
| CloudTrail root login | Emergency break-glass access, security audit drills | Require MFA context and authorized change window |
| Inbox forwarding | User-created legitimate forwarding, migration projects | Allowlist approved domains and migration accounts |
| Encoded PowerShell | Device management tooling, software deployment agents | Allowlist signed tooling and known management hosts |
| Lateral movement | Admin RDP/SMB activity, vulnerability scanners | Baseline admin hosts and service accounts |

## Triage Questions

- Is the actor expected to perform this action?
- Did the event occur during an approved change window?
- Is the source IP owned by the organization?
- Are the target accounts or resources sensitive?
- Did related Sentinel or Defender signals occur nearby?
- Would suppression hide a future true positive?

## Documentation Rule

If a false-positive class is suppressed, the rule should document the business owner, reason, and review date. Suppression without ownership is operational debt.
