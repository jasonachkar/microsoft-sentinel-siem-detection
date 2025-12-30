# Data sources

This pack uses common Microsoft Sentinel tables and connectors. Enable the minimum connectors listed below for full coverage.

## Minimum required connectors
- Microsoft Entra ID (Azure AD)
  - Tables: `SigninLogs`, `AuditLogs`
- Microsoft Defender for Endpoint
  - Tables: `DeviceProcessEvents`
- Office 365
  - Tables: `OfficeActivity`
- Microsoft 365 Defender
  - Tables: `EmailEvents`, `EmailAttachmentInfo`
- Azure Activity
  - Tables: `AzureActivity`
- Azure Diagnostics (Key Vault)
  - Tables: `AzureDiagnostics`
- CommonSecurityLog (CEF/Syslog)
  - Tables: `CommonSecurityLog`
- Security Events
  - Tables: `SecurityEvent`

## Optional integrations
- Watchlists: used to allowlist VIPs or flag risky IPs.
- Identity Protection risk signals: enrich `SigninLogs` with risk level fields.

## Table usage by category
- Identity: `SigninLogs`, `AuditLogs`
- Endpoint: `DeviceProcessEvents`, `SecurityEvent`
- Cloud: `AuditLogs`, `AzureActivity`, `AzureDiagnostics`
- Email: `OfficeActivity`, `EmailEvents`, `EmailAttachmentInfo`
- Network: `CommonSecurityLog`, `SecurityEvent`
