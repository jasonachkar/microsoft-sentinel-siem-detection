# Overview

This repository provides a curated set of Microsoft Sentinel scheduled analytics rules covering identity, endpoint, cloud, email, and network detections. Rules are written in KQL with consistent normalization and thorough in-query comments for production use.

## Design goals
- Production-ready detections with clear tuning knobs and safe defaults.
- MITRE ATT&CK mappings with tactic and technique IDs.
- Strong documentation for deployment, testing, and tuning.
- Automation scripts to validate and bundle rules for deployment.

## Repository layout
- `rules/`: KQL queries (each with a required metadata header).
- `rules-yaml/`: Sentinel analytics rule definitions.
- `docs/`: Deployment, testing, tuning, and data-source guides.
- `sample-data/`: Synthetic JSONL samples for local schema checks.
- `scripts/`: Validation and bundling automation.
- `bundles/`: Compiled rule bundles.

## Normalization notes
Queries normalize key fields (`TimeGenerated`, `Account`, `IPAddress`, `DeviceName`, `AppDisplayName`, and similar) to maintain consistency and simplify entity mapping. Field naming follows ASIM-aligned conventions so you can swap in ASIM parsers where available.
