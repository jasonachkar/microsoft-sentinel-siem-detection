# ADR-0001: Detection-as-Code YAML Schema and Go Deployer

Status: Accepted

## Context

Microsoft Sentinel analytics rules need more than a KQL query. Investigation quality depends on entity mappings, custom details, alert details, frequency, lookback, incident settings, MITRE mappings, and connector requirements. Portal-only authoring hides those decisions from code review.

## Decision

Author Sentinel scheduled analytics rules as YAML/KQL files and deploy them through a Go CLI that validates the schema, supports dry-run output, and maps rule metadata to ScheduledAlertRule properties where supported.

## Alternatives

- Create rules manually in the Sentinel / Defender portal.
- Deploy raw ARM templates only.
- Use a Python-only deployment script.

## Tradeoffs

The Go CLI adds maintenance cost, but it makes the detection contract explicit and testable. ARM-only deployment is closer to the API but less ergonomic for rule authors.

## Security Implications

Rule changes become reviewable before deployment. Invalid severity, GUID, timing, MITRE, and entity mapping metadata can be caught before a bad detection reaches Sentinel.

## Operational Implications

The CLI can generate dry-run and validation reports for CI and UI evidence. Live deployment still requires Azure credentials and workspace configuration.

## Interview Talking Point

I did not treat KQL as a loose snippet. I modeled Sentinel rule metadata because entity mappings, custom details, and incident configuration materially affect analyst workflow.
