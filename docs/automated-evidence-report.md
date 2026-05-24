# Automated Evidence Report

Branch: `refactor/cloud-security-reviewer-experience`

Date: 2026-05-24

## What was automated

| Capability | Implementation |
|---|---|
| Reviewer path smoke tests | `sentinel-detection-pack/ui/tests/reviewer-path.spec.js` |
| Forbidden overclaiming guard | `sentinel-detection-pack/ui/tests/no-overclaiming.spec.js` |
| Internal nav route checks | `sentinel-detection-pack/ui/tests/nav-routes.spec.js` |
| Accessibility smoke checks | `sentinel-detection-pack/ui/tests/accessibility.spec.js` (+ `@axe-core/playwright`) |
| UI screenshot generation | `sentinel-detection-pack/ui/scripts/generate-evidence-screenshots.mjs` |
| CI evidence pipeline | `.github/workflows/portfolio-evidence.yml` |

## Commands run

```bash
cd sentinel-detection-pack/ui
npm ci --ignore-scripts
npx playwright install chromium
npm run build
npm run test:e2e          # 74 passed
npm run evidence:screenshots

# repo root
python scripts/test-detections.py   # 16 rules, 0 failures
cd src-cli && go test ./...         # pass
```

## Generated files

```text
evidence/ui/start-here.png
evidence/ui/architecture.png
evidence/ui/password-spray-scenario.png
evidence/ui/evidence.png
evidence/ui/interview-prep.png
evidence/ui/mobile-start-here.png
evidence/ui/evidence-index.md
```

Screenshots are **UI reviewer evidence** only. They do not prove Azure/Sentinel tenant deployment.

## CI workflow

`.github/workflows/portfolio-evidence.yml` triggers on:

- pull requests to `main`
- pushes to `main` and `refactor/cloud-security-reviewer-experience`
- manual `workflow_dispatch` (optional `commit_screenshots: true`)

Artifacts uploaded:

- `portfolio-ui-screenshots` — PNG captures + `evidence-index.md`
- `playwright-report` — HTML test report

Parallel jobs also run `scripts/test-detections.py` and `src-cli` Go tests.

## npm scripts added

| Script | Purpose |
|---|---|
| `test:e2e` | Build + run all Playwright tests (clean checkout safe) |
| `test:e2e:built` | Run Playwright against existing `dist/` (CI step after build) |
| `test:e2e:headed` | Build + run with visible browser |
| `evidence:screenshots` | Generate `evidence/ui/*` captures |
| `evidence:all` | Build once + screenshots + e2e (uses `test:e2e:built`) |

## Limitations

- Screenshots capture the React UI, not Sentinel/Defender portal pages.
- `networkidle` waits can be slow on `/threat-map` (~17s); tests pass but CI may need patience.
- Color-contrast axe rules are disabled to avoid noisy false positives; serious structural a11y issues are still checked.
- External GitHub URLs are format-checked, not fetched (avoids rate limits).
- Optional screenshot auto-commit requires manual `workflow_dispatch` with `commit_screenshots: true`.

## What still requires manual proof

- Sanitized Azure/Sentinel portal screenshots (`evidence/azure/`, `evidence/defender/`)
- Live Sentinel deployment validation in a real tenant
- Subjective “does this feel impressive?” portfolio review
- 2–3 minute walkthrough recording

## Safe to merge?

**Yes**, pending green CI on the branch. The automation:

- does not add product features,
- preserves the reviewer journey,
- guards against overclaiming language,
- validates all sidebar routes load,
- generates reproducible UI evidence artifacts.

Merge when `.github/workflows/portfolio-evidence.yml` passes on the PR.

## Final merge-safety validation

Date: 2026-05-24 (reliability pass)

### Scripts changed

| File | Change |
|---|---|
| `sentinel-detection-pack/ui/package.json` | `test:e2e` now runs `build` first; added `test:e2e:built`; `evidence:all` uses `test:e2e:built` to avoid double build |
| `.github/workflows/portfolio-evidence.yml` | Playwright step uses `npm run test:e2e:built`; invalid action SHAs replaced with repo-verified SHAs from `sentinel-ci-cd.yaml` |

### Commands run

```bash
cd sentinel-detection-pack/ui
npm ci --ignore-scripts
npx playwright install --with-deps chromium
npm run build
npm run test:e2e:built
Remove-Item -Recurse -Force dist; npm run test:e2e   # clean-checkout simulation
npm run evidence:screenshots

# repo root
python scripts/test-detections.py
cd src-cli && go test ./...
```

### Pass/fail results

| Command | Result |
|---|---|
| `npm run build` | Pass |
| `npm run test:e2e:built` | Pass (74 tests) |
| `npm run test:e2e` (after deleting `dist/`) | Pass (builds then tests) |
| `npm run evidence:screenshots` | Pass |
| `python scripts/test-detections.py` | Pass |
| `go test ./...` | Pass |

### Pinned action SHA verification

Verified via GitHub REST API (`api.github.com/repos/actions/<action>/commits/<sha>`). `gh` CLI was not available locally.

| Action | Pinned SHA | Verified | Notes |
|---|---|---|---|
| `actions/checkout` | `34e114876b0b11c390a56381ad16ebd13914f8d5` | Yes | Valid commit; matches `sentinel-ci-cd.yaml` |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | Yes | **Replaced** invalid SHA; matches `sentinel-ci-cd.yaml` v4.4.0 |
| `actions/upload-artifact` | `ea165f8d65b6e75b540449e92b4886f43607fa02` | Yes | **Replaced** invalid SHA; matches `sentinel-ci-cd.yaml` |
| `actions/setup-python` | `a26af69be951a213d495a4c3e4e4022e16d87065` | Yes | **Replaced** invalid SHA; matches `sentinel-ci-cd.yaml` |
| `actions/setup-go` | `40f1582b2485089dde7abd97c1529aa768e1baff` | Yes | **Replaced** invalid SHA; matches `sentinel-ci-cd.yaml` |
| `actions/download-artifact` | `d3f86a106a0bac45b974a628896c90dbdf5c8093` | Yes | **Replaced** invalid SHA; matches `sentinel-ci-cd.yaml` |

Original portfolio-evidence SHAs for setup-node, upload-artifact, setup-python, setup-go, and download-artifact returned HTTP 422 (not found) and would have failed the workflow before tests ran.

### Remaining risks

- `/threat-map` nav test takes ~17s due to `networkidle`; total suite ~60s in CI.
- Screenshot PNGs may differ slightly across OS/font rendering.
- Optional `commit_screenshots` dispatch job needs `contents: write` and should only be used on trusted branches.
- First green run on GitHub Actions is still required to confirm Ubuntu + `--with-deps chromium` in CI.

### Final merge recommendation

**Yes — safe to merge** after one green **Portfolio UI Evidence** workflow run on GitHub Actions confirms the corrected SHAs and Playwright job succeed in CI.
