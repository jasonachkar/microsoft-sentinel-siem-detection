# Detection Coverage Matrix

This matrix summarizes the current Sentinel rule catalog. It is a portfolio lab view of coverage, not a complete production coverage claim.

| Rule | Data source | MITRE | Severity | Entity focus | Sample status | Quality notes |
| --- | --- | --- | --- | --- | --- | --- |
| Entra ID Password Spray | SigninLogs | T1110.003 | High | Account, IP | Positive and benign sample | Tune by distinct accounts, failures, and trusted egress IPs |
| Entra ID Privileged Role Assignment | AuditLogs | T1098.003 | High | Account | Positive and benign sample | Validate PIM/change window before response |
| Key Vault Secret Access Anomaly | AzureDiagnostics | T1552.004 | High | Account, IP, AzureResource | Positive and benign sample | Baseline identity/IP pairs and allowlist pipelines |
| Kubernetes Suspicious Container Execution | AKSAuditAdmin | T1609 | High | Account, IP | Positive and benign sample | Verify audit log ingestion and namespace context |
| Suspicious Inbox Rule External Forward | OfficeActivity | T1114.003 | High | Account, IP | Positive and benign sample | Allowlist approved forwarding domains |
| Service Principal Creation with Credential Addition | AuditLogs | T1136.003 | High | Account, CloudApplication | Metadata validated | Correlates creation and credential addition |
| Entra ID Risky Sign-in from TOR or Watchlist | SigninLogs | T1090.003, T1078.004 | High | Account, IP | Existing generic sign-in sample | Requires watchlist maintenance |
| Entra ID MFA Fatigue | SigninLogs | T1621 | Medium | Account, IP | Existing generic sign-in sample | Tune prompt thresholds by tenant behavior |
| Entra ID Impossible Travel Sign-in | SigninLogs | T1078.004 | Medium | Account, IP | Existing generic sign-in sample | Requires geolocation quality review |
| Rare Admin Operations | AuditLogs, AzureActivity | T1562 | Medium | Account | Metadata validated | Needs environment-specific allowlists |
| Suspicious PowerShell Encoded Command | DeviceProcessEvents | T1059.001, T1105 | High | Account, Host | Existing device process sample | Allowlist signed admin tooling |
| Credential Dumping via LSASS Access | DeviceProcessEvents | T1003.001 | High | Account, Host | Existing device process sample | Validate EDR schema and process context |
| Local Admin Group Changes | SecurityEvent | T1098 | Medium | Account, Host | Existing security event sample | Tune admin/service accounts |
| Unusual RDP/SMB Lateral Movement | SecurityEvent | T1021.001, T1021.002 | Medium | Account, Host, IP | Existing security event sample | Baseline admin workstations |
| Unusual Outbound Data Volume to Rare Destination | CommonSecurityLog | T1041 | High | IP | Existing common security log sample | Baseline backup and update paths |
| Phishing Attachment Patterns | EmailEvents, EmailAttachmentInfo | T1566.001 | Medium | Account, Mailbox | Metadata validated | Requires Defender XDR email tables |

## Flagship Sample Scenarios

The local sample-data validation currently covers these end-to-end reviewer scenarios:

- Password spray against Entra ID sign-ins.
- Privileged role assignment in Entra ID audit logs.
- Key Vault secret access anomaly.
- Kubernetes `exec` audit event.
- M365 external inbox forwarding.
- AWS CloudTrail root login concept sample for multi-cloud ingestion.

## Local Validation Limit

The local runner validates metadata, JSONL shape, required sample fields, MITRE fields, table references, and entity mapping columns. It does not execute KQL or query Microsoft Sentinel unless optional live validation is configured separately.
