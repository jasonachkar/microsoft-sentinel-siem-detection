# Cost Control for the Lab

Security labs can become expensive if Sentinel, Defender, AKS, or VM resources run continuously. This project treats cost as part of cloud security engineering.

## Cost Controls

- Keep the UI in demo mode unless live telemetry is needed.
- Use short Log Analytics retention for lab tables.
- Deploy honeypot resources only for test windows and destroy them afterward.
- Prefer dry-run deployer mode during development.
- Enable Defender plans only for the scenario being captured.
- Route low-value logs to cheaper storage in a real architecture.
- Capture evidence screenshots, then tear down expensive resources.

## Teardown Checklist

1. Destroy temporary Terraform modules.
2. Disable unused Defender plans.
3. Stop or delete VMs and AKS clusters.
4. Verify Log Analytics ingestion is not unexpectedly high.
5. Review Azure cost analysis after every live scenario.

## Safe Claim

This repository demonstrates Security FinOps thinking. It does not claim a fully implemented enterprise cost-optimization platform.
