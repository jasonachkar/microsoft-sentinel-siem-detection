# Microsoft Sentinel — Multi-Cloud Detection & Response Platform

A full **DevSecOps + Detection-as-Code** platform for Microsoft Sentinel: multi-cloud
Terraform, a Go deployment CLI, a policy-gated CI/CD pipeline, nightly IaC drift
detection, and an enterprise SOC control-plane UI that renders the **real** infrastructure
backing it.

> The in-app **Reference Architecture** and **Infrastructure as Code** views visualize
> everything below directly from this repository — no mock-ups.

---

## Architecture

```
 Telemetry sources            Ingestion        SIEM                Active response
 ────────────────────         ──────────       ──────────────      ──────────────────
 Entra ID · M365 · Defender                                        AI SOC Copilot (triage)
 AKS/EKS · AWS CloudTrail ──▶ Data         ──▶ Microsoft       ──▶ SOAR Logic App ──▶ NSG /
 Honeypot                     Connectors        Sentinel            Entra containment
                                                  ▲
              GitHub Actions CI/CD ──────────────┘  (validate + OIDC deploy of KQL rules)
```

## Repository layout

| Path | What it is |
|------|-----------|
| `terraform/` | Sentinel core: Log Analytics workspace + SecurityInsights, remote `azurerm` state |
| `terraform-aws-connector/` | KMS-encrypted CloudTrail S3 bucket + OIDC AssumeRole for cross-cloud ingestion |
| `terraform-soar/` | Isolate-host Logic App with system-assigned identity, **RG-scoped** least-privilege RBAC |
| `terraform-honeypot/` | Throwaway Windows VM; admin credential **generated at apply time**, never committed |
| `src-cli/` | Go CLI that maps YAML detections to ARM `ScheduledAlertRule` and deploys them |
| `sentinel-detection-pack/rules-yaml/` | 16 KQL detections (Detection-as-Code), MITRE-mapped |
| `sentinel-detection-pack/ui/` | React + PrimeReact SOC control plane |
| `.github/workflows/` | Policy-gated CI/CD pipeline + nightly drift detection |
| `scripts/` | Rule validation, bundling, Atomic Red Team assertion, threat-intel ingest |

## DevSecOps pipeline (`.github/workflows/sentinel-ci-cd.yaml`)

1. **Shift-left scans** — Gitleaks (secrets), TFSec across all four Terraform modules, Trivy (deps).
   The TFSec gate is **blocking at HIGH/CRITICAL** (`soft_fail: false`, `--minimum-severity HIGH`);
   MEDIUM/LOW are reported but non-blocking.
2. **Validate & bundle** the detection rules.
3. **Detection-as-Code assertion** against Atomic Red Team sample telemetry.
4. **Deploy** — builds and runs the Go CLI with `-apply` under OIDC federated auth (no stored secrets).

### Nightly drift detection (`.github/workflows/drift-detection.yaml`)
Runs `terraform plan -detailed-exitcode` against remote state every night. Exit code `2`
(drift) opens a labelled `security/drift/incident` issue with the plan summary.

## Go deployment CLI (`src-cli/`)

```bash
cd src-cli
go build -o sentinel-deployer .

# Safe dry-run (default): validate + map every rule, no API calls
./sentinel-deployer -sub <SUB> -rg <RG> -workspace <WS> -dir ../sentinel-detection-pack/rules-yaml

# Apply: create/update the Scheduled Alert Rules in Sentinel
./sentinel-deployer -sub <SUB> -rg <RG> -workspace <WS> -apply
```

Auth uses `DefaultAzureCredential` (OIDC, Managed Identity, or `az login`).

## Required GitHub configuration

| Secret | Used by | Purpose |
|--------|---------|---------|
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` | deploy + drift | OIDC federated login |
| `SENTINEL_RESOURCE_GROUP` / `SENTINEL_WORKSPACE_NAME` | deploy | target workspace for the Go CLI |
| `TFSTATE_RG` / `TFSTATE_STORAGE_ACCOUNT` / `TFSTATE_CONTAINER` | drift | `azurerm` remote-state backend |

## SOC control plane (`sentinel-detection-pack/ui/`)

```bash
cd sentinel-detection-pack/ui
npm install
npm run dev      # http://localhost:3000
```

Views include the **Command Center**, **Reference Architecture** (live topology),
**AppSec & Supply Chain** (Gitleaks/TFSec/Trivy results), **IaC Drift & Pipeline**,
**Infrastructure as Code** (renders the real Terraform/Go/workflow source),
**Security FinOps**, **SOAR Playbooks**, **AI Copilot**, and the detection/threat tooling.
`npm run sync-data` bundles the live repo source into the UI at build time.

## Security hardening highlights

- Honeypot admin credential generated via `random_password` (was a committed plaintext password).
- CloudTrail S3 bucket: customer-managed **KMS** encryption + key rotation, public-access block,
  versioning, and a scoped CloudTrail bucket policy.
- SOAR identity scoped to **Network Contributor on the resource group**, not subscription-wide.
- CI security scans **fail the build** on HIGH/CRITICAL findings.

## License

MIT — see [`sentinel-detection-pack/LICENSE`](sentinel-detection-pack/LICENSE).
