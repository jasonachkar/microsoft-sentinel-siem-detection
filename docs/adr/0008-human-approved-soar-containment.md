# ADR-0008: Human-Approved SOAR Containment

Status: Accepted

## Context

Automated containment can cause outages if a playbook isolates the wrong resource. The lab needs to show response automation without claiming unsafe autonomous remediation.

## Decision

Model SOAR as a human-approved containment design. The Logic App pattern parses incident entities, checks approved scope, requests approval, applies scoped action only after approval, notifies the SOC channel, and writes the outcome back to the incident.

## Alternatives

- Fully autonomous isolation.
- Documentation-only response guidance.
- Manual response with no playbook design.

## Tradeoffs

Human approval adds response latency. It is safer for a portfolio lab and more realistic for potentially destructive containment.

## Security Implications

Managed identity permissions remain scoped and opt-in. The playbook should not receive subscription-wide directory or network privileges.

## Operational Implications

Live proof requires sanitized Logic App run history and a rollback-tested lab target. Until then, the UI labels this as a design.

## Interview Talking Point

I know where automation should stop. For containment, I prefer human-approved action with tight scope and audit trail.
