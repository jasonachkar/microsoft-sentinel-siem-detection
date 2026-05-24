# ADR-0012: Evidence-First Portfolio UI Design

Status: Accepted

## Context

Reviewers do not have time to reverse-engineer every directory. A good portfolio UI should show what was built and where the proof lives.

## Decision

Make Reviewer Mode, Evidence Center, and Interview Mode the primary UI experiences. Secondary demo pages remain available but clearly labelled.

## Alternatives

- Lead with a generic SOC dashboard.
- Hide limitations in docs only.
- Remove UI and rely on README/code review.

## Tradeoffs

Evidence-first UX is less flashy than an all-demo command center. It is more credible to senior reviewers.

## Security Implications

Claims are tied to proof paths, docs, tests, or explicit limitations. This reduces accidental misrepresentation of simulated data.

## Operational Implications

Screenshots and workflow artifacts can be added over time without changing the UI architecture.

## Interview Talking Point

I built the UI around evidence because a cloud security reviewer needs to know what is real, what is simulated, and where to inspect it.
