# ADR-0006: Demo Telemetry vs Live Sentinel Telemetry in UI

Status: Accepted

## Context

A portfolio UI must be useful even when no Azure tenant, Sentinel workspace, AKS cluster, or incidents are available. But implying demo data is live telemetry damages trust.

## Decision

Use explicit evidence models and status badges to separate repo-backed code, optional API-backed views, demo telemetry, planned work, and limitations.

## Alternatives

- Require live Azure telemetry for every UI page.
- Hide all demo pages.
- Show synthetic data without labels.

## Tradeoffs

Labels reduce some visual drama, but they make the project defensible in a technical review.

## Security Implications

No fake operational evidence is presented as proof. Sensitive live data does not need to be committed for the UI to tell the reviewer story.

## Operational Implications

Optional API-backed pages can return empty results without making the demo look broken. Evidence screenshots can be added later under `evidence/`.

## Interview Talking Point

I intentionally separated demo telemetry from evidence because overclaiming is worse than showing a smaller but truthful lab.
