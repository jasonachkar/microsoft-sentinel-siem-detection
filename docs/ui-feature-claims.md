# UI Feature Claim Classification

This file classifies each major UI route by what a reviewer should believe. It is intentionally conservative: demo data is labelled as demo data, repo-backed pages point to files, and planned work is not presented as implemented.

| Route | Page | Classification | Reviewer should trust | Limits |
| --- | --- | --- | --- | --- |
| `/` and `/reviewer` | Reviewer Mode | Repo-backed / real summary | Project positioning, proof paths, architecture narrative | Some metrics are summarized for review flow |
| `/evidence` | Evidence Center | Repo-backed / evidence inventory | File-backed proof cards, missing screenshot placeholders, real-vs-demo table | Screenshot placeholders are not proof until populated |
| `/scenario/password-spray` | Password Spray Scenario | Repo-backed + sample data | KQL/YAML metadata, triage guidance, sample telemetry walkthrough | Sample telemetry is not a live Sentinel alert |
| `/rules` | Detection Rules | Repo-backed / real code | Rule catalog generated from YAML/KQL files | Local validation does not execute KQL |
| `/detection-engineering` | Detection Deep-Dive | Repo-backed explanation | Tuning rationale, false positives, response steps | Not a production tuning claim |
| `/cloud-security-controls` | Cloud Security Controls | Repo-backed + design docs | Terraform modules, policy docs, OIDC, logging, cost-control story | No tenant-wide compliance claim |
| `/iac` | Infrastructure as Code | Repo-backed / source explorer | Terraform source and module structure | Does not prove resources are deployed |
| `/drift` | Drift Demo & Pipeline | Real workflow + demo incident data | Workflow design, exit-code handling, sample issue format | Live drift evidence requires configured remote state and Azure auth |
| `/soar` | SOAR Design | Terraform shell + design docs | Human-approved containment pattern and least-privilege intent | No autonomous containment claim |
| `/appsec` | AppSec & Supply Chain | Real workflow + demo findings | Security gates defined in GitHub Actions | Finding rows are examples unless SARIF artifacts are attached |
| `/command-center` | Lab Dashboard | Summary / mixed | High-level reviewer snapshot with labels | Secondary page; do not treat all values as live telemetry |
| `/incidents` | Demo Incidents | Simulated | Incident workflow visualization | Not a Sentinel incident queue |
| `/live-incidents` | API-Backed Sentinel Incidents | Optional API path | If configured, Azure Function results from Sentinel APIs | Empty results are expected without a workspace/API |
| `/posture` | IaC Posture Demo | Simulated Azure Resource Graph-shaped data | How posture findings would be displayed | Not live unless replaced with API artifact data |
| `/kubernetes` | Demo K8s Telemetry | Simulated AKS/EKS audit logs | Shape of Kubernetes audit telemetry and T1609 discussion | Not live cluster telemetry |
| `/copilot` | Copilot Concept Demo | Demo/concept | Possible triage workflow and report shape | Not a deployed AI SOC copilot |
| `/kql` | KQL Demo Playground | Local demo | Query reading and local demonstration | Not a full Kusto query engine |
| `/metrics` | Sample SOC Metrics | Simulated | Dashboard mechanics and workflow visualization | Not operational KPIs |
| `/simulator` | Attack Visualizer | Simulated scenario runner | ATT&CK narrative and expected artifacts | Does not prove Sentinel alert fired |
| `/investigation` | Demo Investigation | Simulated entity graph | Triage graph user experience | Not case evidence |
| `/threat-map` | Demo Threat Map | Demo/API depending source | Visualization concept and optional public OSINT status | Not authoritative threat intelligence |
| `/compliance` | Controls Mapping | Reference mapping | How repo artifacts map to security control themes | Not SOC 2, ISO 27001, or audit evidence |
| `/decisions` | Architecture Decisions | Repo-backed ADR summary | Engineering rationale and tradeoffs | UI is a summary; full ADRs live in `docs/adr/` |

## Pages Kept As Secondary Demos

The following pages remain useful for portfolio storytelling but must not be introduced as live security operations evidence: Demo Incidents, Demo K8s Telemetry, Copilot Concept, KQL Demo Playground, Sample SOC Metrics, Attack Visualizer, Demo Investigation, and Demo Threat Map.

## Pages To Prioritize In Review

1. Reviewer Mode
2. Evidence Center
3. Password Spray Scenario
4. Detection Rules
5. Cloud Security Controls
6. Drift Demo & Pipeline
7. SOAR Design
8. Architecture Decisions
