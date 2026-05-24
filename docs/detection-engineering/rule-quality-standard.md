# Detection Rule Quality Standard

This lab treats Microsoft Sentinel analytics rules as Detection-as-Code artifacts. A rule is considered review-ready only when it has enough context for another security engineer to understand, tune, test, and deploy it safely.

## Required Rule Metadata

Each YAML rule should include:

- Stable GUID `id`.
- Clear `name` and `description`.
- `severity` with rationale in the description or documentation.
- `requiredDataConnectors` with connector IDs and data types.
- `queryFrequency`, `queryPeriod`, `triggerOperator`, and `triggerThreshold`.
- MITRE `tactics` and `techniques`.
- `entityMappings` for investigation context.
- `kind: Scheduled`.
- Semver `version`.
- Owner/status information in the KQL header when available.

## Required Detection Notes

Every detection should answer:

- Threat hypothesis: what attacker behavior this rule is meant to catch.
- Data source: which Sentinel table or ASIM parser powers the logic.
- Required connector: which connector must be configured.
- Query rationale: why the lookback and frequency were chosen.
- Entity mappings: which investigation entities should appear in the alert.
- False positives: expected legitimate sources of noise.
- Tuning knobs: thresholds, watchlists, allowlists, and exclusions.
- Response guidance: what a first responder should check.
- Sample telemetry: positive and benign examples where feasible.

## KQL Quality Expectations

- Prefer explicit tables or ASIM parsers over broad `search *` or `union *`.
- Use `column_ifexists()` where connector schemas vary across tenants.
- Avoid brittle parsing when structured fields exist.
- Keep allowlist/watchlist placeholders close to the tuning logic.
- Project alert fields intentionally so entity mappings and custom details are available.
- Add short comments for thresholds and tuning choices.

## Local Test Scope

`scripts/test-detections.py` performs metadata and sample-data validation. It does not execute KQL locally and must not be described as proof that a Sentinel rule fired. Optional live verification belongs in `scripts/validate-live-sentinel.py` and requires Azure credentials plus a configured workspace.
