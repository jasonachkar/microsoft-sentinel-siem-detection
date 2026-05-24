# Identity Governance and GitHub OIDC

The preferred deployment model is GitHub Actions OIDC into Azure, not long-lived client secrets.

## Why OIDC

- No client secret is stored in the repository or GitHub Actions secrets.
- Azure federated credentials can be scoped to repository, branch, and workflow.
- Role assignments can be limited to the resource group or workspace deployment scope.
- Credential rotation risk is reduced because GitHub mints short-lived tokens.

## Least-Privilege Pattern

1. Create an Azure app registration or managed identity for deployment.
2. Configure a federated identity credential for this repository and branch.
3. Assign only the roles needed for Terraform or Sentinel rule deployment.
4. Keep SOAR runtime identity separate from CI/CD deployment identity.
5. Review role assignments after every new capability.

## Reviewer Talking Point

OIDC is a security control, not just a convenience. It removes static cloud credentials from the pipeline and creates an auditable trust boundary.
