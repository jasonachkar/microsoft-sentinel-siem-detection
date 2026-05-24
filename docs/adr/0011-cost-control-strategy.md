# ADR-0011: Cost-Control Strategy for Portfolio Lab

Status: Accepted

## Context

Microsoft Sentinel and Log Analytics can become expensive if verbose telemetry is ingested without controls. A portfolio lab should show cost awareness.

## Decision

Keep demo mode as the default, document teardown steps, model hot/cold telemetry routing, and show Security FinOps considerations in the UI.

## Alternatives

- Keep all Azure resources running continuously.
- Remove cost discussion from the project.
- Claim cost optimization is fully implemented.

## Tradeoffs

Demo mode is less impressive than always-on live telemetry, but it avoids unnecessary spend and avoids misleading empty dashboards.

## Security Implications

Cost controls reduce the chance that security logging is disabled later because it is too expensive.

## Operational Implications

Live validation should be run intentionally, captured as evidence, and torn down when no longer needed.

## Interview Talking Point

I can talk about Sentinel ingestion cost, retention, hot/cold routing, and safe teardown because security architecture has budget constraints.
