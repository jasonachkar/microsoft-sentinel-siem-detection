# Pipeline notes

This repo is designed to be CI-friendly. Typical pipeline stages:
1. Run validation: `./scripts/validate-rules.sh --check-samples`.
2. Bundle rules: `./scripts/bundle-rules.sh`.
3. Publish `bundles/` as build artifacts for deployment.

If using GitHub Actions, ensure the runner has Python 3 with PyYAML installed for JSON bundling.
