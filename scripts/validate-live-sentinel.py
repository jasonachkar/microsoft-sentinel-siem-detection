#!/usr/bin/env python3
"""
Optional live Sentinel validation.

This script is intentionally separate from local detection tests. It requires
Azure credentials and a Log Analytics workspace. Use it only when a lab tenant is
configured and you want to verify that deployed detections produced alerts or
incidents. The local CI path should not pretend to perform this live check.
"""

from __future__ import annotations

import argparse
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Optionally query Log Analytics/Sentinel for expected live detection evidence.")
    parser.add_argument("--workspace-id", required=True, help="Log Analytics workspace ID.")
    parser.add_argument("--query", required=True, help="KQL query used to verify alert or incident evidence.")
    parser.add_argument("--timespan-hours", type=int, default=24)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        from azure.identity import DefaultAzureCredential
        from azure.monitor.query import LogsQueryClient, LogsQueryStatus
    except ImportError:
        print("Azure SDK packages are not installed. Install azure-identity and azure-monitor-query for live mode.", file=sys.stderr)
        return 2

    from datetime import timedelta

    credential = DefaultAzureCredential()
    client = LogsQueryClient(credential)
    response = client.query_workspace(args.workspace_id, args.query, timespan=timedelta(hours=args.timespan_hours))

    if response.status == LogsQueryStatus.PARTIAL:
        print("Live query returned partial results.", file=sys.stderr)
        return 1
    row_count = sum(len(table.rows) for table in response.tables)
    print(f"Live Sentinel validation returned {row_count} row(s).")
    return 0 if row_count > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
