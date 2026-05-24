# SOAR Failure Modes

SOAR playbooks fail in ways that can create security and operational risk. This lab documents the failure modes instead of hiding them.

| Failure mode | Impact | Mitigation |
| --- | --- | --- |
| Entity parsing fails | Wrong or missing target | Validate entity type and require manual review |
| Target outside scope | Accidental production impact | Enforce approved lab resource group scope |
| Approval skipped | Destructive automation risk | Human approval step before containment |
| RBAC too broad | Lateral control-plane impact | Scope managed identity to minimal resource group |
| Graph permission missing | Token revocation fails | Separate Graph role design and test evidence |
| NSG rule conflicts | Application outage | Pre-flight check and rollback plan |
| Notification webhook down | SOC misses response status | Write outcome to Sentinel incident comments |
| Logic App retry storm | Duplicate containment actions | Idempotency keys and incident run correlation |

## Safe Demo Behavior

The UI simulates the approval and containment path. It should be described as a SOAR design walkthrough unless tenant run-history evidence is captured under `evidence/azure/logic-app-run-history.example.png`.
