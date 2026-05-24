#!/usr/bin/env python3
"""
Metadata and sample-data validation for the Sentinel Detection-as-Code lab.

This is not a KQL execution engine. It validates rule metadata, table references,
entity mapping columns, MITRE fields, and linked JSONL samples so reviewers can
trust the repository structure without overclaiming local detection execution.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys
from datetime import datetime, timezone

try:
    import yaml
except ImportError as exc:  # pragma: no cover - exercised in environments without PyYAML
    raise SystemExit("PyYAML is required. Install with: pip install pyyaml") from exc


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_RULES_DIR = REPO_ROOT / "sentinel-detection-pack" / "rules-yaml"
DEFAULT_SAMPLE_DIR = REPO_ROOT / "sentinel-detection-pack" / "sample-data"

VALID_SEVERITIES = {"Informational", "Low", "Medium", "High"}
VALID_TRIGGER_OPERATORS = {"Equal", "GreaterThan", "LessThan", "NotEqual"}
VALID_TACTICS = {
    "Reconnaissance",
    "ResourceDevelopment",
    "InitialAccess",
    "Execution",
    "Persistence",
    "PrivilegeEscalation",
    "DefenseEvasion",
    "CredentialAccess",
    "Discovery",
    "LateralMovement",
    "Collection",
    "CommandAndControl",
    "Exfiltration",
    "Impact",
    "ImpairProcessControl",
    "InhibitResponseFunction",
    "PreAttack",
}

REQUIRED_RULE_FIELDS = {
    "id",
    "name",
    "description",
    "severity",
    "requiredDataConnectors",
    "query",
    "queryFrequency",
    "queryPeriod",
    "triggerOperator",
    "triggerThreshold",
    "tactics",
    "techniques",
    "entityMappings",
    "kind",
    "version",
}

SAMPLE_REQUIRED_FIELDS = {
    "SigninLogs": {"TimeGenerated", "UserPrincipalName", "IPAddress", "ResultType"},
    "AuditLogs": {"TimeGenerated", "OperationName", "InitiatedBy", "TargetResources"},
    "AzureDiagnostics": {"TimeGenerated", "ResourceProvider", "OperationName", "ResourceId"},
    "AKSAuditAdmin": {"TimeGenerated", "Category", "Log"},
    "OfficeActivity": {"TimeGenerated", "Operation", "UserId", "Parameters"},
    "CloudTrail": {"eventTime", "eventSource", "eventName", "userIdentity", "sourceIPAddress"},
    "AzureActivity": {"TimeGenerated", "OperationNameValue", "Caller", "ActivityStatusValue"},
    "SecurityEvent": {"TimeGenerated", "EventID", "Computer"},
    "DeviceProcessEvents": {"TimeGenerated", "ActionType", "FileName", "DeviceName"},
    "CommonSecurityLog": {"TimeGenerated", "SourceIP", "DestinationIP"},
    "EmailEvents": {"TimeGenerated", "NetworkMessageId", "SenderFromAddress", "RecipientEmailAddress", "EmailDirection"},
    "EmailAttachmentInfo": {"TimeGenerated", "NetworkMessageId", "AttachmentName", "AttachmentFileExtension"},
}

FLAGSHIP_SCENARIOS = {
    "EntraID_Password_Spray.yaml": {
        "sample": "signinlogs-password-spray.jsonl",
        "description": "Entra ID password spray with positive and benign sign-in samples.",
    },
    "EntraID_Privileged_Role_Assignment.yaml": {
        "sample": "auditlogs-privileged-role-assignment.jsonl",
        "description": "Privileged Entra ID role assignment audit samples.",
    },
    "KeyVault_Secret_Access_Anomaly.yaml": {
        "sample": "keyvault-secret-access.jsonl",
        "description": "Key Vault secret access anomaly samples.",
    },
    "Kubernetes_Suspicious_Exec.yaml": {
        "sample": "aks-audit-exec.jsonl",
        "description": "Kubernetes exec audit samples.",
    },
    "Suspicious_Inbox_Rule_External_Forward.yaml": {
        "sample": "m365-inbox-forwarding.jsonl",
        "description": "M365 inbox forwarding samples.",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Sentinel rule metadata and linked sample telemetry.")
    parser.add_argument("--rules-dir", type=pathlib.Path, default=DEFAULT_RULES_DIR)
    parser.add_argument("--sample-dir", type=pathlib.Path, default=DEFAULT_SAMPLE_DIR)
    parser.add_argument("--output", type=pathlib.Path, help="Optional JSON report path.")
    return parser.parse_args()


def load_yaml(path: pathlib.Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    if not isinstance(data, dict):
        raise ValueError("YAML root must be an object")
    return data


def load_jsonl(path: pathlib.Path) -> list[dict]:
    records: list[dict] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, 1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number} invalid JSON: {exc}") from exc
            record["_line"] = line_number
            records.append(record)
    return records


def iso_duration(value: str) -> bool:
    return bool(re.match(r"^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$", str(value or "")))


def query_references(query: str, column: str) -> bool:
    if not column:
        return False
    return re.search(rf"(^|[^A-Za-z0-9_]){re.escape(column)}([^A-Za-z0-9_]|$)", query, re.IGNORECASE) is not None


def collect_required_tables(rule: dict) -> set[str]:
    tables: set[str] = set()
    for connector in rule.get("requiredDataConnectors") or []:
        for data_type in connector.get("dataTypes") or []:
            tables.add(str(data_type))
    return tables


def validate_rule(path: pathlib.Path, rule: dict) -> dict:
    errors: list[str] = []
    warnings: list[str] = []

    missing = sorted(REQUIRED_RULE_FIELDS - set(rule.keys()))
    if missing:
        errors.append(f"missing required fields: {', '.join(missing)}")

    if not re.match(r"(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", str(rule.get("id", ""))):
        errors.append("id must be a GUID")
    if rule.get("severity") not in VALID_SEVERITIES:
        errors.append("severity must be Informational, Low, Medium, or High")
    if rule.get("triggerOperator") not in VALID_TRIGGER_OPERATORS:
        errors.append("triggerOperator is unsupported")
    if not iso_duration(rule.get("queryFrequency")):
        errors.append("queryFrequency must be ISO8601 duration")
    if not iso_duration(rule.get("queryPeriod")):
        errors.append("queryPeriod must be ISO8601 duration")
    if rule.get("kind") != "Scheduled":
        errors.append("kind must be Scheduled")
    if not re.match(r"^\d+\.\d+\.\d+$", str(rule.get("version", ""))):
        errors.append("version must be semver")

    query = str(rule.get("query") or "")
    required_tables = collect_required_tables(rule)
    if not required_tables:
        errors.append("requiredDataConnectors must include at least one data type")
    elif not any(query_references(query, table) for table in required_tables):
        warnings.append("query does not obviously reference any required connector data type")

    for tactic in rule.get("tactics") or []:
        if tactic not in VALID_TACTICS:
            errors.append(f"invalid MITRE tactic: {tactic}")
    for technique in rule.get("techniques") or []:
        if not re.match(r"^T\d{4}(\.\d{3})?$", str(technique)):
            errors.append(f"invalid MITRE technique: {technique}")

    entity_mappings = []
    for mapping in rule.get("entityMappings") or []:
        entity_type = mapping.get("entityType")
        for field in mapping.get("fieldMappings") or []:
            column = field.get("columnName")
            identifier = field.get("identifier")
            entity_mappings.append(f"{entity_type}.{identifier}={column}")
            if not query_references(query, str(column)):
                warnings.append(f"entity mapping column is not obviously present in query: {column}")

    return {
        "file": str(path.relative_to(REPO_ROOT)),
        "name": rule.get("name"),
        "id": rule.get("id"),
        "severity": rule.get("severity"),
        "requiredTables": sorted(required_tables),
        "entityMappings": entity_mappings,
        "tactics": rule.get("tactics") or [],
        "techniques": rule.get("techniques") or [],
        "errors": errors,
        "warnings": warnings,
    }


def validate_samples(sample_dir: pathlib.Path) -> tuple[list[dict], list[str]]:
    sample_reports: list[dict] = []
    errors: list[str] = []
    for path in sorted(sample_dir.glob("*.jsonl")):
        try:
            records = load_jsonl(path)
        except ValueError as exc:
            errors.append(str(exc))
            continue
        positives = sum(1 for record in records if record.get("ExpectedResult") == "positive")
        negatives = sum(1 for record in records if record.get("ExpectedResult") in {"negative", "benign"})
        tables = sorted({str(record.get("SampleTable")) for record in records if record.get("SampleTable")})
        for record in records:
            table = record.get("SampleTable")
            required = SAMPLE_REQUIRED_FIELDS.get(table)
            if not required:
                errors.append(f"{path}:{record['_line']} unknown SampleTable {table!r}")
                continue
            missing = sorted(required - set(record.keys()))
            if missing:
                errors.append(f"{path}:{record['_line']} missing fields for {table}: {', '.join(missing)}")
        sample_reports.append({
            "file": str(path.relative_to(REPO_ROOT)),
            "records": len(records),
            "tables": tables,
            "positiveSamples": positives,
            "negativeSamples": negatives,
        })
    return sample_reports, errors


def validate_flagship_scenarios(rule_reports: list[dict], sample_reports: list[dict], rules_dir: pathlib.Path, sample_dir: pathlib.Path) -> list[dict]:
    by_file = {pathlib.Path(report["file"]).name: report for report in rule_reports}
    by_sample = {pathlib.Path(report["file"]).name: report for report in sample_reports}
    scenario_reports: list[dict] = []

    for rule_name, scenario in FLAGSHIP_SCENARIOS.items():
        errors: list[str] = []
        rule_report = by_file.get(rule_name)
        sample_report = by_sample.get(scenario["sample"])
        if rule_report is None:
            errors.append(f"missing flagship rule {rule_name}")
        if sample_report is None:
            errors.append(f"missing sample file {scenario['sample']}")
        else:
            if sample_report["positiveSamples"] == 0:
                errors.append("sample file has no positive samples")
            if sample_report["negativeSamples"] == 0:
                errors.append("sample file has no negative/benign samples")
        scenario_reports.append({
            "rule": rule_name,
            "sample": scenario["sample"],
            "description": scenario["description"],
            "status": "pass" if not errors else "fail",
            "errors": errors,
        })

    return scenario_reports


def main() -> int:
    args = parse_args()
    rule_paths = sorted(args.rules_dir.rglob("*.yaml"))
    if not rule_paths:
        print(f"No YAML rules found under {args.rules_dir}", file=sys.stderr)
        return 1

    rule_reports: list[dict] = []
    for path in rule_paths:
        try:
            rule = load_yaml(path)
        except ValueError as exc:
            rule_reports.append({"file": str(path.relative_to(REPO_ROOT)), "errors": [str(exc)], "warnings": []})
            continue
        rule_reports.append(validate_rule(path, rule))

    sample_reports, sample_errors = validate_samples(args.sample_dir)
    scenario_reports = validate_flagship_scenarios(rule_reports, sample_reports, args.rules_dir, args.sample_dir)

    rule_failures = sum(1 for report in rule_reports if report.get("errors"))
    rule_warnings = sum(len(report.get("warnings") or []) for report in rule_reports)
    scenario_failures = sum(1 for report in scenario_reports if report["status"] != "pass")
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "scope": "metadata-and-sample-data-validation",
        "notKqlExecution": True,
        "summary": {
            "rules": len(rule_reports),
            "ruleFailures": rule_failures,
            "ruleWarnings": rule_warnings,
            "sampleFiles": len(sample_reports),
            "sampleErrors": len(sample_errors),
            "flagshipScenarios": len(scenario_reports),
            "flagshipScenarioFailures": scenario_failures,
        },
        "rules": rule_reports,
        "samples": sample_reports,
        "flagshipScenarios": scenario_reports,
        "sampleErrors": sample_errors,
    }

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(report["summary"], indent=2))
    if rule_failures or sample_errors or scenario_failures:
        print("Detection metadata/sample validation failed.", file=sys.stderr)
        return 1
    print("Detection metadata/sample validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
