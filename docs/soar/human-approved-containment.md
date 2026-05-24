# Human-Approved SOAR Containment

This lab does not claim autonomous containment. The safe pattern is human-approved response automation:

1. Sentinel incident triggers the Logic App.
2. Playbook parses incident entities and target resource context.
3. Playbook checks that the target is inside an approved lab containment scope.
4. Analyst approval is required before any network or identity containment action.
5. Approved action applies a scoped control, such as an NSG deny rule or quarantine tag.
6. Playbook notifies the SOC channel and writes the response outcome back to the incident.

## Why Approval Is Required

Network isolation, token revocation, and firewall blocks can cause business impact. A portfolio lab should show response design without pretending that destructive automation is safe by default.

## Current Implementation Status

| Component | Status | Notes |
| --- | --- | --- |
| Logic App workflow shell | Real IaC | `terraform-soar/main.tf` creates the workflow and managed identity |
| Workflow definition design | Repo-backed design | `terraform-soar/workflow-definition.json` shows scope check and approval placeholder |
| Network Contributor role | Opt-in | Disabled by default with `enable_network_containment_role = false` |
| Microsoft Graph token revocation | Design only | Requires Graph app role assignment outside Azure RBAC |
| Live containment test | Missing evidence | Requires tenant, approved test resource, and rollback plan |

## Reviewer Talking Point

The important engineering decision is restraint: containment should be scoped, approved, logged, and reversible before it is automated.
