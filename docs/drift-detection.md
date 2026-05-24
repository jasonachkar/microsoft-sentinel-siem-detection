# Terraform Drift Detection

Drift detection catches manual cloud changes that bypass Terraform. In this lab, the nightly workflow runs a read-only Terraform plan and opens a GitHub issue when the live Azure environment differs from committed IaC.

## How It Works

1. GitHub Actions authenticates to Azure with OIDC.
2. Terraform initializes against the remote `azurerm` backend.
3. `terraform plan -detailed-exitcode` runs without applying changes.
4. Exit code is interpreted:
   - `0`: no changes, no drift.
   - `1`: Terraform error, workflow fails.
   - `2`: plan contains changes, drift is detected.
5. The workflow writes a plan summary and creates a GitHub issue labelled `security`, `drift`, and `incident`.

## Required Configuration

The workflow requires:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `TFSTATE_RG`
- `TFSTATE_STORAGE_ACCOUNT`
- `TFSTATE_CONTAINER`

The backend key is currently `sentinel-core.tfstate`.

## What This Proves

- Cloud posture changes should be reviewed through Git.
- Manual portal changes become visible security work.
- Terraform can be used as a control-plane integrity check.

## What Is Demo vs Real

| Area | Status | Notes |
| --- | --- | --- |
| Workflow YAML | Real CI | `.github/workflows/drift-detection.yaml` |
| Terraform detailed exit code | Real behavior | Exit code 2 indicates drift |
| UI drift table | Demo data | Shows expected reviewer flow without live Azure access |
| GitHub issue example | Sample | `docs/samples/drift-incident-example.md` |
| Live drift evidence | Missing until configured | Requires remote state and Azure credentials |
