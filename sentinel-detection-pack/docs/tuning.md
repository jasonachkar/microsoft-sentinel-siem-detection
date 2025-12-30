# Tuning guidance

Tuning is essential for high signal-to-noise. Start with the default thresholds, then adjust based on your environment's baseline and business processes.

## General tuning steps
1. Review allowlists for trusted IPs, service accounts, and automation tools.
2. Adjust thresholds (counts, time windows) based on historical activity.
3. Verify entity mappings and confirm enrichment fields populate as expected.
4. Add suppression where routine administrative actions are expected.

## Recommended allowlists
- Known corporate egress IPs and VPN ranges.
- Managed service accounts and automation principals.
- Approved third-party security tooling.

## Watchlists
Use watchlists to reduce noise or add high-fidelity context.
- `HighRiskIPs`: list of TOR exits, known suspicious IPs, or threat intel feeds.
- `VIPAccounts`: executive or high-risk users to prioritize in triage.
- `TrustedAdminAccounts`: change control accounts to suppress known admin actions.

## Category-specific notes
- Identity rules: tune per-tenant login patterns and MFA behavior; exclude break-glass accounts carefully.
- Endpoint rules: allowlist approved admin tooling and signed IT automation.
- Cloud rules: tune for scheduled deployments and infrastructure-as-code pipelines.
- Email rules: add trusted external partners and bulk-mail systems.
- Network rules: adjust byte thresholds based on typical backup or data-transfer jobs.
