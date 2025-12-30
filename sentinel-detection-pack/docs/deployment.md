# Deployment

## Option 1: Azure Portal manual import
1. Open Microsoft Sentinel in the Azure Portal.
2. Go to `Analytics` > `Rules` > `Create` > `Scheduled query rule`.
3. Copy the KQL from `rules/<category>/<RuleName>.kql` (excluding the metadata comment block).
4. Fill in the rule settings using the matching YAML file in `rules-yaml/`.
5. Save and enable the rule.

## Option 2: GitHub repo integration (recommended)
1. Connect your Sentinel workspace to a GitHub repo using the Content Hub or automation.
2. Use the files in `rules-yaml/` as the source of truth for rule definitions.
3. Run `./scripts/bundle-rules.sh` or `./scripts/bundle-rules.ps1` to generate bundles for deployment pipelines.

## Option 3: ARM or Bicep (optional)
- Use the YAML bundle from `bundles/sentinel-rules-bundle.yml` to drive deployment via ARM/Bicep templates.
- Keep parameters (schedule, thresholds, suppression) aligned with the YAML definitions.

## Minimum connectors
See `docs/data-sources.md` for required data connectors and tables.
