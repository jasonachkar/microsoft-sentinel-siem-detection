# UI Consolidation Report

Branch: `refactor/cloud-security-reviewer-experience`

Date: 2026-05-24

## Navigation before / after

### Before (6 sections, 24 first-class sidebar items)

| Section | Items |
|---|---|
| Executive View | Reviewer Mode, Evidence Center, Interview Mode, Lab Dashboard, Reference Architecture, Cloud Security Controls, Security FinOps, IaC Posture Demo |
| Governance | Controls Mapping, Architecture Decisions |
| Active Defense | Demo Incidents, Demo K8s Telemetry, Copilot Concept, SOAR Design |
| DevSecOps | AppSec & Supply Chain, Drift Demo & Pipeline, Infrastructure as Code |
| Engineering | Detection Rules, Detection Deep-Dive, Password Spray Scenario, KQL Demo Playground, MITRE ATT&CK, Attack Visualizer, Demo Investigation, Demo Threat Map |
| Learn | Learning Paths |

### After (9 sections, 27 items — primary journey first, demos demoted)

| Section | Items |
|---|---|
| Start Here | Start Here (`/` or `/reviewer`) |
| Architecture | Reference Architecture, Infrastructure as Code |
| Detection Engineering | Detection Rules, Detection Deep-Dive, Password Spray Scenario, MITRE ATT&CK |
| Cloud Security Controls | Cloud Security Controls, Security FinOps, Controls Mapping, IaC Posture Demo |
| CI/CD & Drift | CI/CD Security, CI/CD & Drift |
| SOAR Response | SOAR Response |
| Evidence | Evidence |
| Interview Prep | Interview Prep, Architecture Decisions |
| Lab Sandbox | Demo Threat Map, Demo Incidents, Demo Live Incidents, Demo Investigation, KQL Demo Playground, Demo Metrics, Attack Visualizer Demo, Copilot Concept Demo, Demo K8s Telemetry, Learning Paths, Lab Dashboard Demo |

Routes not in sidebar but still reachable: `/dashboard`, `/infrastructure`, `/live-posture`, `/ai-copilot`, `/metrics` (also in sandbox).

## Pages consolidated

| Change | Detail |
|---|---|
| Start Here (was Reviewer Mode) | Dense dashboard replaced with guided 5-minute case study: mission, 4 proof cards, review path, compact architecture, flagship preview, real vs simulated, top 5 proof links, limitations |
| Evidence (was Evidence Center) | Reordered: verified proof → CI validation → inventory → talking points → demo/planned → limitations → missing screenshots |
| Interview Prep (was Interview Mode) | Kept skills matrix, hard questions, resume bullets, claims not made; removed duplicate proof tables; links to Evidence |
| Lab Sandbox | 11 demo/secondary pages moved out of primary nav |
| Label renames | Reviewer Mode → Start Here; Evidence Center → Evidence; Interview Mode → Interview Prep; AppSec & Supply Chain → CI/CD Security; Drift Demo & Pipeline → CI/CD & Drift; SOAR Design → SOAR Response |

No pages deleted. All routes in `App.jsx` preserved.

## Components extracted

New shared components under `sentinel-detection-pack/ui/src/components/shared/`:

| Component | Purpose |
|---|---|
| `StatusTag` | Unified badge for Real IaC, Real code, Real CI, Demo data, Planned, Limitation |
| `RepoPath` | GitHub link to repo file paths |
| `SectionHeader` | Consistent section eyebrow, title, description, optional action |
| `ProofCard` | Generic proof card with status, skill, repo paths, talking point |
| `EvidenceCard` | ProofCard wrapper for `evidenceCatalog` items |
| `RealVsSimulatedTable` | Shared real vs demo inventory table |
| `LimitationsPanel` | Shared limitations grid from `limitations.js` |

Refactored consumers: `ReviewerMode.jsx`, `EvidenceCenter.jsx`, `InterviewMode.jsx`.

Shared data added to `reviewerJourney.js`: `fiveMinutePath`, `whatThisProves`, `topProofLinks`.

## Duplicate content removed

| Removed from | Moved to / replaced by |
|---|---|
| Start Here — 5-card reviewer scorecard | Condensed into 4 “What this project proves” cards |
| Start Here — full architecture narrative (540px flow) | Compact 320px preview + link to Architecture |
| Start Here — detection-as-code timeline | Evidence CI validation table |
| Start Here — rule coverage snapshot / severity table | Detection Engineering pages |
| Start Here — cloud security controls grid | Cloud Security Controls section |
| Start Here — CI/CD evidence table | Evidence page CI validation section |
| Start Here — duplicate real vs simulated (inline) | Shared `RealVsSimulatedTable` |
| Evidence — duplicate proof summary stat grids | Single verified proof cards section |
| Evidence — talking points before proof | Reordered; Interview Prep links back |
| Interview Prep — duplicate 5-min path wording | Shared `fiveMinutePath` from `reviewerJourney.js` |
| Interview Prep — “Evidence” status column on skills | Link to Evidence page instead |

## Remaining UI risks

1. **Lab Sandbox still has 11 items** — grouped under one section but may feel long on smaller screens; command palette (`Cmd/Ctrl+K`) is the primary jump shortcut.
2. **Hash anchor `/evidence#limitations`** — works when navigating from Start Here; direct load may need scroll-into-view if UX feedback requests it.
3. **Hidden routes** — `/dashboard`, `/infrastructure`, `/live-posture` remain in `App.jsx` but not in nav; intentional to reduce clutter.
4. **Demo pages still use local Tag helpers** — only the three primary reviewer pages use shared `StatusTag`; sandbox pages unchanged (scope limit).
5. **Missing screenshot placeholders** — still visible at bottom of Evidence; honest but may look unfinished to some reviewers.

## What a reviewer should click first

1. **Start Here** (`/`) — 5-minute mission, proof pillars, and guided review path.
2. **Architecture** — full topology and narrative.
3. **Password Spray Scenario** — flagship detection walkthrough.
4. **Evidence** — repo-backed proof cards and CI validation summary.
5. **Interview Prep** — skills matrix and safe claims if hiring context.

Honest scope reminder: demo telemetry, mock detection assertion, and SOAR containment remain labelled as Demo data, Limitation, or Planned throughout.

## Validation

Run on branch:

```bash
cd sentinel-detection-pack/ui && npm ci --ignore-scripts && npm run build
python scripts/test-detections.py
cd src-cli && go test ./...
terraform fmt -check -recursive terraform terraform-aws-connector terraform-policy terraform-soar terraform-honeypot
```

Results (2026-05-24, branch `refactor/cloud-security-reviewer-experience`):

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | Pass |
| `npm run build` | Pass |
| `python scripts/test-detections.py` | Pass (16 rules, 0 failures) |
| `go test ./...` (src-cli) | Pass |
| `terraform fmt -check -recursive` (5 modules) | Pass |
