#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK_SAMPLES=false

if [[ "${1:-}" == "--check-samples" ]]; then
  CHECK_SAMPLES=true
fi

fail=0

KQL_FILES=()
while IFS= read -r file; do
  if [[ "$(basename "$file")" == ._* ]]; then
    continue
  fi
  KQL_FILES+=("$file")
done < <(rg --files -g "*.kql" "$ROOT_DIR/rules")

if [[ ${#KQL_FILES[@]} -eq 0 ]]; then
  echo "No KQL files found under $ROOT_DIR/rules"
  exit 1
fi

RULE_IDS=()
RULE_ID_FILES=()

required_kql_fields=(
  RuleId Name Category Severity Tactics Techniques DataSources QueryFrequency QueryPeriod
  TriggerOperator TriggerThreshold Version Author Status Description FalsePositives
)
required_yaml_fields=(
  id name description severity query queryFrequency queryPeriod triggerOperator
  triggerThreshold tactics techniques entityMappings kind
)

for kql in "${KQL_FILES[@]}"; do
  if [[ "$(head -n 1 "$kql")" != "/*" ]]; then
    echo "Missing metadata header start in $kql"
    fail=1
  fi
  for field in "${required_kql_fields[@]}"; do
    if ! rg -q "^${field}:" "$kql"; then
      echo "Missing ${field} in $kql"
      fail=1
    fi
  done

  rule_id=$(rg -m1 "^RuleId:" "$kql" | sed 's/RuleId:[[:space:]]*//')
  if [[ -z "$rule_id" ]]; then
    echo "Missing RuleId value in $kql"
    fail=1
  else
    duplicate_found=false
    for i in "${!RULE_IDS[@]}"; do
      if [[ "${RULE_IDS[$i]}" == "$rule_id" ]]; then
        echo "Duplicate RuleId ${rule_id} in $kql and ${RULE_ID_FILES[$i]}"
        fail=1
        duplicate_found=true
        break
      fi
    done
    if [[ "$duplicate_found" == false ]]; then
      RULE_IDS+=("$rule_id")
      RULE_ID_FILES+=("$kql")
    fi
  fi

  rel_path="${kql#$ROOT_DIR/rules/}"
  base_name="${rel_path%.kql}"
  yaml_path="$ROOT_DIR/rules-yaml/${base_name}.yaml"

  if [[ ! -f "$yaml_path" ]]; then
    echo "Missing YAML for $kql at $yaml_path"
    fail=1
    continue
  fi

  for field in "${required_yaml_fields[@]}"; do
    if ! rg -q "^${field}:" "$yaml_path"; then
      echo "Missing ${field} in $yaml_path"
      fail=1
    fi
  done

  yaml_id=$(rg -m1 "^id:" "$yaml_path" | sed 's/id:[[:space:]]*//')
  if [[ -n "$rule_id" && -n "$yaml_id" && "$yaml_id" != "$rule_id" ]]; then
    echo "RuleId mismatch between $kql ($rule_id) and $yaml_path ($yaml_id)"
    fail=1
  fi

done

# Basic hygiene checks
if rg -n $'\t' "$ROOT_DIR"; then
  echo "Tabs found in repository"
  fail=1
fi
if rg -n "[ \t]+$" "$ROOT_DIR"; then
  echo "Trailing whitespace found in repository"
  fail=1
fi
if rg -n "\r$" "$ROOT_DIR"; then
  echo "CRLF line endings found in repository"
  fail=1
fi
if rg -n -g '!scripts/**' "BEGIN (RSA|OPENSSH|PRIVATE) KEY|AKIA[0-9A-Z]{16}|-----BEGIN" "$ROOT_DIR"; then
  echo "Potential secret material found in repository"
  fail=1
fi

if $CHECK_SAMPLES; then
  export ROOT_DIR
  python3 - <<'PY'
import json
import os
import pathlib

root = pathlib.Path(os.environ["ROOT_DIR"])

required_fields = {
    "SigninLogs": {"TimeGenerated", "UserPrincipalName", "IPAddress", "ResultType"},
    "AuditLogs": {"TimeGenerated", "OperationName", "InitiatedBy", "TargetResources"},
    "SecurityEvent": {"TimeGenerated", "EventID", "Computer"},
    "DeviceProcessEvents": {"TimeGenerated", "ActionType", "FileName", "DeviceName"},
    "OfficeActivity": {"TimeGenerated", "Operation", "UserId", "Parameters"},
    "EmailEvents": {"TimeGenerated", "NetworkMessageId", "SenderFromAddress", "RecipientEmailAddress", "EmailDirection"},
    "EmailAttachmentInfo": {"TimeGenerated", "NetworkMessageId", "AttachmentName", "AttachmentFileExtension"},
    "CommonSecurityLog": {"TimeGenerated", "SourceIP", "DestinationIP"},
    "AzureDiagnostics": {"TimeGenerated", "ResourceProvider", "OperationName", "ResourceId"},
    "AzureActivity": {"TimeGenerated", "OperationNameValue", "Caller", "ActivityStatusValue"},
}

sample_dir = root / "sample-data"
errors = []

for path in sample_dir.glob("*.jsonl"):
    if path.name.startswith("._"):
        continue
    with path.open("r", encoding="utf-8") as fh:
        for idx, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                errors.append(f"{path}:{idx} invalid JSON: {exc}")
                continue
            table = obj.get("SampleTable")
            if not table:
                errors.append(f"{path}:{idx} missing SampleTable")
                continue
            expected = required_fields.get(table)
            if not expected:
                errors.append(f"{path}:{idx} unknown SampleTable '{table}'")
                continue
            missing = sorted(expected - set(obj.keys()))
            if missing:
                errors.append(f"{path}:{idx} missing fields for {table}: {', '.join(missing)}")

if errors:
    print("Sample data validation failed:")
    for err in errors:
        print(f"- {err}")
    raise SystemExit(1)
print("Sample data validation passed.")
PY
fi

if [[ $fail -ne 0 ]]; then
  echo "Validation failed."
  exit 1
fi

echo "Validation passed."
