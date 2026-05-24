# Sentinel Deployer CLI

This Go CLI validates Microsoft Sentinel scheduled analytics rule YAML, explains what each rule would deploy, and can create or update rules with Azure `DefaultAzureCredential` when `-apply` is used.

Default mode is dry-run. It does not require Azure credentials unless `-apply` is set.

```powershell
go run . -dir ..\sentinel-detection-pack\rules-yaml -dry-run -explain
go run . -dir ..\sentinel-detection-pack\rules-yaml -validate-json -output validation-report.json
go run . -dir ..\sentinel-detection-pack\rules-yaml -apply -sub <subscription-id> -rg <resource-group> -workspace <workspace-name>
```

## Supported YAML Schema

The deployer is scoped to `kind: Scheduled` analytics rules. It validates and maps the scheduled-rule fields exposed by the Azure Go SDK:

| YAML field | Purpose | ARM mapping |
| --- | --- | --- |
| `id` | Stable analytics rule GUID | Alert rule name/id |
| `name` | Analyst-facing rule title | `displayName` |
| `description` | Investigation context | `description` |
| `severity` | `Informational`, `Low`, `Medium`, `High` | `severity` |
| `status` / `enabled` | Disable or enable deployment state | `enabled` |
| `requiredDataConnectors` | Required connector/table metadata | Validated and shown in dry-run |
| `query` | KQL scheduled rule query | `query` |
| `queryFrequency` | ISO8601 run frequency, for example `PT5M` | `queryFrequency` |
| `queryPeriod` | ISO8601 lookback, for example `PT1H` | `queryPeriod` |
| `triggerOperator` | `Equal`, `GreaterThan`, `LessThan`, `NotEqual` | `triggerOperator` |
| `triggerThreshold` | Numeric threshold | `triggerThreshold` |
| `tactics` | Sentinel ATT&CK tactics | `tactics` |
| `techniques` | MITRE techniques such as `T1110.003` | Validated and shown in dry-run |
| `entityMappings` | Account/IP/Host/etc. entity mappings | `entityMappings` |
| `customDetails` | Key/value alert enrichment columns | `customDetails` |
| `alertDetailsOverride` | Dynamic display name, description, severity, tactics columns | `alertDetailsOverride` |
| `incidentConfiguration` | Incident creation and grouping settings | `incidentConfiguration` |
| `eventGroupingSettings` | Alert-per-result or single-alert grouping | `eventGroupingSettings` |
| `suppressionDuration` | ISO8601 suppression duration | `suppressionDuration` |
| `suppressionEnabled` | Enable/disable suppression | `suppressionEnabled` |
| `version` | Semver schema/content version | `templateVersion` |

Microsoft documents scheduled-rule enrichment features such as entity mapping, custom details, alert details override, incident settings, event grouping, and suppression. The CLI keeps unsupported SDK fields visible in validation output rather than pretending they are deployed.

## Validation Rules

The CLI fails validation when:

- `id` is not a GUID.
- `name` or `query` is empty.
- `severity` is outside Sentinel scheduled-rule severity values.
- `queryFrequency` or `queryPeriod` is not ISO8601 duration format.
- `queryFrequency` is greater than `queryPeriod`.
- `triggerOperator` is unsupported.
- `requiredDataConnectors` is missing connector/table metadata.
- tactics are not supported Sentinel ATT&CK tactic names.
- techniques do not use MITRE `T####` or `T####.###` format.
- `version` is not semver.

The CLI warns when entity mapping, custom detail, or alert override columns are not obviously present in the KQL query text. This is a local static check, not full KQL execution.
