# Detection Tuning Guide

Tuning is part of detection engineering, not an afterthought. This lab keeps tuning assumptions visible so a reviewer can see how the rule would be adapted to a real tenant.

## Identity Rules

- Use trusted egress IP watchlists for VPN, proxy, and corporate NAT ranges.
- Exclude known break-glass or automation accounts only with owner approval.
- Tune password spray thresholds by distinct accounts and failed attempts, not only total failures.
- Review user agent and client app patterns before suppressing MFA or sign-in detections.

## Endpoint Rules

- Validate process command-line logic against known admin tooling.
- Keep script execution detections scoped to suspicious flags, encodings, LOLBins, or known attack paths.
- Use device groups or watchlists for noisy management hosts.

## Cloud and Kubernetes Rules

- Use `column_ifexists()` for schemas that vary by connector version.
- Treat Key Vault and Kubernetes anomalies as high-signal only when paired with identity, IP, namespace, or resource context.
- For AKS audit detections, verify that API server audit logs are actually routed to Log Analytics.

## Network Rules

- Baseline high-volume data transfer by source, destination, and protocol.
- Allowlist known backup, update, and telemetry destinations.
- Prefer rare-destination logic over static byte thresholds when possible.

## Email Rules

- Tune by sender reputation, attachment type, recipient count, and forwarding target.
- Review mail-flow rules that were created by administrators separately from user mailbox rules.

## Review Checklist

- Does the rule explain why it is noisy or high-signal?
- Are thresholds visible and easy to modify?
- Is there a safe allowlist/watchlist path?
- Do entity mappings support triage?
- Is sample telemetry linked?
- Is the limitation of local validation clear?
