# ADR-0005: Native Tables With ASIM Strategy

Status: Accepted

## Context

ASIM parsers improve portability across data sources, but many cloud detections are initially easier to express against native tables such as `SigninLogs`, `AuditLogs`, `AzureActivity`, `AKSAuditAdmin`, and `AWSCloudTrail`.

## Decision

Use native tables where they make the rule clearer and document ASIM migration or parser opportunities in detection engineering docs.

## Alternatives

- Force every rule through ASIM immediately.
- Use only native tables with no ASIM strategy.
- Keep only generic hunting queries.

## Tradeoffs

Native tables can be more brittle across tenants. ASIM can add abstraction but may hide table-specific fields that are useful for Azure-focused detections.

## Security Implications

Rules must handle schema variability with patterns such as `column_ifexists()` where appropriate and must document required connectors.

## Operational Implications

Future work can add ASIM variants for rules that need cross-source portability. The current catalog remains readable and tied to concrete sample data.

## Interview Talking Point

I can explain when I would use ASIM for portability and when native tables are clearer for a targeted Azure detection.
