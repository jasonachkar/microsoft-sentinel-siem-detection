# Rule template

Use this template for new rules. Every KQL file must start with the metadata header block below.

```
/*
RuleId: <uuid>
Name: <rule name>
Category: <identity|endpoint|cloud|email|network>
Severity: <Low|Medium|High|Critical>
Tactics: <comma separated>
Techniques: <comma separated technique IDs>
DataSources: <tables used>
QueryFrequency: <e.g., PT5M>
QueryPeriod: <e.g., PT1H>
TriggerOperator: <GreaterThan>
TriggerThreshold: <number or 0>
Version: 1.0.0
Author: Jason Achkar Diab (template)
Status: Production
Description: <1-2 lines>
FalsePositives: <bullets in one line>
*/
```

KQL style guidance:
- Use `let` statements for thresholds and allowlists.
- Normalize to consistent fields (`TimeGenerated`, `Account`, `IPAddress`, `DeviceName`).
- Comment every non-trivial step (joins, thresholds, filters).
- Keep queries scoped to the query period and avoid expensive scans.
