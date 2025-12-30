#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export ROOT_DIR

python3 - <<'PY'
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
