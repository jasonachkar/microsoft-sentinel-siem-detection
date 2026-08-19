# ADR-0013: Custom Go Deployer vs. Microsoft Sentinel Repositories

Status: Accepted

## Context

Microsoft Sentinel Repositories can connect a GitHub or Azure DevOps repository and sync custom content — including YAML-authored analytics rules — on every commit, using the external repository as the source of truth. A 2026 "smart deployments" update tracks per-file modifications in a `.sentinel` manifest so unchanged content is not redeployed on every sync. This is a lower-effort, fully native way to run detection-as-code against Sentinel: connect the repo, and content-hub-style sync does the rest.

This repository instead ships a custom Go CLI (`src-cli/deployer.go`) that parses the same YAML rule files, validates them against a stricter schema than Sentinel's native content sync enforces, and calls the `AlertRulesClient.CreateOrUpdate` API directly via `DefaultAzureCredential`.

## Decision

Keep the custom Go deployer for this project, and document Sentinel Repositories as the lower-maintenance native alternative most teams should reach for first.

The Go deployer's validation is stricter than native sync: it checks GUID format, ISO 8601 duration fields, MITRE tactic/technique ID format, and cross-references entity-mapping and custom-detail column names against the actual KQL query text — catching a rule that references a column that doesn't exist in its own query, for example. It also produces a machine-readable `ValidationReport` (pass/fail/warning counts) that CI and this UI both consume, and supports a dry-run/explain mode with no Azure credentials at all.

## Alternatives

- Connect Sentinel Repositories directly to this GitHub repo and drop the custom deployer entirely.
- Use Sentinel Repositories for sync and keep a separate, offline linter for pre-merge validation.
- Deploy via raw ARM/Bicep templates in the pipeline instead of either option.

## Tradeoffs

The custom deployer is more code to maintain than pointing Sentinel at the repo, and it only covers scheduled analytics rules — no data connectors, workbooks, or playbooks, which native sync does handle. In exchange, it validates rule metadata *before* anything reaches Sentinel, works completely offline for CI and local dry-runs, and its `ValidationReport` output is something this project's UI and CI can render directly. Native Sentinel Repositories sync would give up that pre-deploy validation depth and the CLI's dry-run ergonomics, but would remove `src-cli` entirely and cover more content types with far less code.

## Security Implications

Because validation runs before any API call, a malformed entity mapping, an invalid MITRE technique ID, or a query/column mismatch is caught in CI rather than silently deploying a broken analytics rule. Sentinel's native sync will still deploy syntactically valid-but-semantically-broken YAML; it does not perform this level of cross-field validation today.

## Operational Implications

A team without this project's specific validation requirements would get equivalent git-sync behavior from Sentinel Repositories with a fraction of the code, and would additionally get connectors/workbooks/playbooks synced the same way. That is the right default recommendation for most teams. This project keeps the custom path because the validation depth and CI-native tooling were themselves worth demonstrating.

## Interview Talking Point

I didn't build the Go deployer because native sync doesn't exist — it does, and for most teams it's the better default. I built it because I wanted stricter pre-deploy validation and an offline dry-run story than native sync provides today, and I can explain that tradeoff rather than assume the custom path is automatically superior.
