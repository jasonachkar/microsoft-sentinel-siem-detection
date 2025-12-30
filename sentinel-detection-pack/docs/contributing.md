# Contributing

Thanks for considering a contribution.

## Guidelines
- Follow the KQL metadata header requirements in `rules/RULE_TEMPLATE.md`.
- Add clear comments to any non-trivial query logic.
- Provide tuning guidance and recommended actions in the YAML description.
- Keep rule names and filenames consistent across `rules/` and `rules-yaml/`.
- Run `./scripts/validate-rules.sh` or `./scripts/validate-rules.ps1` before submitting.

## Pull requests
- Include a brief rationale for the detection.
- Reference any relevant MITRE ATT&CK technique updates.
- Update documentation when adding new data sources or categories.
