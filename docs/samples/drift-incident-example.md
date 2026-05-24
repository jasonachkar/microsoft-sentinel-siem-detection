# URGENT: Infrastructure drift detected (2026-05-24)

Terraform detected changes between the committed configuration and the live Azure environment.

This usually means a manual portal or CLI change was made outside Git. Reconcile by either reverting the manual change or codifying it in Terraform.

## Labels

- `security`
- `drift`
- `incident`

## Example Plan Summary

```text
# azurerm_network_security_rule.allow_rdp will be updated in-place
~ resource "azurerm_network_security_rule" "allow_rdp" {
    destination_port_range = "3389"
  ~ source_address_prefix  = "*" -> "10.0.0.0/24"
}
```

## Analyst Actions

1. Identify who changed the resource and when.
2. Confirm whether the change had an approved ticket.
3. If unauthorized, revert the portal change.
4. If approved, codify it in Terraform and run CI validation.
5. Close the issue with the workflow run and pull request links.

This is a sample incident issue. It is not evidence that live drift was detected in a tenant.
