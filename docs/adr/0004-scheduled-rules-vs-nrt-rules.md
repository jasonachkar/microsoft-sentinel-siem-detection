# ADR-0004: Scheduled Rules Before NRT Rules

Status: Accepted

## Context

Microsoft Sentinel supports different rule types. Near-real-time rules can reduce latency, but scheduled rules are broadly applicable and support richer tuning patterns for this lab.

## Decision

Use scheduled analytics rules as the primary detection type. Treat NRT rules as a future extension for specific low-latency use cases after the scheduled rule quality bar is met.

## Alternatives

- Prefer NRT rules for all high-severity detections.
- Build only hunting queries and skip alerting rules.
- Mix rule types before the schema and tests are mature.

## Tradeoffs

Scheduled rules add detection latency based on query frequency and lookback. They are easier to validate, tune, and document for portfolio review.

## Security Implications

Scheduled rules still provide alerting and incident creation while allowing explicit threshold, grouping, suppression, and lookback choices.

## Operational Implications

The YAML schema includes query frequency and period. Rules must document why those windows are appropriate.

## Interview Talking Point

I chose scheduled rules first because tuning and investigation quality matter more for this lab than claiming the lowest possible latency.
