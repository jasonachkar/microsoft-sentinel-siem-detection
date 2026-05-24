# SOAR Least-Privilege Identity

The Logic App uses a system-assigned managed identity. This avoids long-lived client secrets and lets permissions be scoped to the workflow identity.

## Azure RBAC Pattern

- Default state: no network containment role is assigned.
- Optional lab state: `Network Contributor` can be assigned only to an approved containment resource group.
- Avoid: subscription-wide `Network Contributor`.
- Avoid: assigning broad directory roles through Azure RBAC for Microsoft Graph actions.

## Microsoft Graph Pattern

Revoking Entra ID sessions is a Microsoft Graph permission problem, not an Azure subscription RBAC problem. A production implementation would need a carefully reviewed app role such as session revocation scope, assigned to the managed identity and approved through tenant governance.

## Audit Requirements

Every playbook run should record:

- Incident ID.
- Actor approving containment.
- Target entity and resource ID.
- Action taken.
- Rollback path.
- Success or failure.
- Link to Sentinel incident comments.

## Current Lab Limitation

The repository shows the identity and permission design. It does not prove that Graph session revocation or network containment was executed in a tenant.
