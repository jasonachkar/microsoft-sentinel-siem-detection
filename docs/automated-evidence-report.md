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
| `test:e2e` | Run all Playwright tests |
| `test:e2e:headed` | Run with visible browser |
| `evidence:screenshots` | Generate `evidence/ui/*` captures |
| `evidence:all` | Build + screenshots + e2e |

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
