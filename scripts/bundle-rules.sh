#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [[ -d "$REPO_ROOT/sentinel-detection-pack/rules-yaml" ]]; then
  ROOT_DIR="$REPO_ROOT/sentinel-detection-pack"
else
  ROOT_DIR="$REPO_ROOT"
fi
export ROOT_DIR

if command -v python3 >/dev/null 2>&1 && python3 --version >/dev/null 2>&1; then
  PYTHON_BIN=python3
elif command -v python >/dev/null 2>&1 && python --version >/dev/null 2>&1; then
  PYTHON_BIN=python
else
  echo "Python 3 is required but was not found."
  exit 1
fi

"$PYTHON_BIN" - <<'PY'
import json
import os
from pathlib import Path
import yaml

root = Path(os.environ["ROOT_DIR"])
yaml_files = [p for p in sorted(root.joinpath("rules-yaml").rglob("*.yaml")) if not p.name.startswith("._")]
if not yaml_files:
    raise SystemExit("No YAML files found under rules-yaml")

rules = []
for path in yaml_files:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if data:
        rules.append(data)

bundle = {"rules": rules}

out_yaml = root / "bundles" / "sentinel-rules-bundle.yml"
out_json = root / "bundles" / "sentinel-rules-bundle.json"

out_yaml.write_text(yaml.safe_dump(bundle, sort_keys=False), encoding="utf-8")
out_json.write_text(json.dumps(bundle, indent=2), encoding="utf-8")

print(f"Wrote {out_yaml}")
print(f"Wrote {out_json}")
PY
