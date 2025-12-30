# sentinel-detection-pack

Production-ready Microsoft Sentinel analytics rules with MITRE ATT&CK mappings, tuning guidance, testing notes, and deployment tooling.

## Quick start
1. Review the rule catalog below and connector requirements in `docs/data-sources.md`.
2. Run validation:
   - Bash: `./scripts/validate-rules.sh`
   - PowerShell: `./scripts/validate-rules.ps1`
3. Bundle rules for deployment:
   - Bash: `./scripts/bundle-rules.sh`
   - PowerShell: `./scripts/bundle-rules.ps1`
4. Deploy using one of the options in `docs/deployment.md`.

## Rule catalog
| Name | Category | Severity | Tactics | Techniques | DataSources |
| --- | --- | --- | --- | --- | --- |
| Entra ID Password Spray | identity | High | Credential Access, Initial Access | T1110.003 | SigninLogs |
| Entra ID Impossible Travel Sign-in | identity | Medium | Initial Access, Credential Access | T1078.004 | SigninLogs |
| Entra ID MFA Fatigue | identity | Medium | Credential Access | T1621 | SigninLogs |
| Entra ID Risky Sign-in from TOR or Watchlist | identity | High | Initial Access, Command and Control | T1090.003, T1078.004 | SigninLogs |
| Entra ID Privileged Role Assignment | identity | High | Persistence, Privilege Escalation | T1098.003 | AuditLogs |
| Suspicious PowerShell Encoded Command | endpoint | High | Execution, Command and Control | T1059.001, T1105 | DeviceProcessEvents |
| Credential Dumping via LSASS Access | endpoint | High | Credential Access | T1003.001 | DeviceProcessEvents |
| Local Admin Group Changes | endpoint | Medium | Privilege Escalation, Persistence | T1098 | SecurityEvent |
| Service Principal Creation with Credential Addition | cloud | High | Persistence, Privilege Escalation | T1136.003 | AuditLogs |
| Key Vault Secret Access Anomaly | cloud | High | Credential Access, Collection | T1552.004 | AzureDiagnostics |
| Rare Admin Operations (Entra ID + Azure Activity) | cloud | Medium | Defense Evasion | T1562 | AuditLogs, AzureActivity |
| Suspicious Inbox Rule External Forward | email | High | Collection | T1114.003 | OfficeActivity |
| Phishing Attachment Patterns | email | Medium | Initial Access | T1566.001 | EmailEvents, EmailAttachmentInfo |
| Unusual Outbound Data Volume to Rare Destination | network | High | Exfiltration | T1041 | CommonSecurityLog |
| Unusual RDP/SMB Lateral Movement | network | Medium | Lateral Movement | T1021.001, T1021.002 | SecurityEvent |

## Deployment options
- Manual import via Azure Portal.
- GitHub integration with Sentinel (recommended for CI/CD).
- ARM/Bicep (optional, see `docs/deployment.md`).

## Testing and tuning
- See `docs/testing.md` for safe testing guidance and sample data references.
- See `docs/tuning.md` for allowlists, watchlists, and false positive reduction.

## UI showcase (Vite + React)
A SIEM-style console UI is available under `ui/` and is designed for Vercel hosting.

Quick start:
1. `cd ui`
2. `npm install`
3. `npm run dev`

Vercel:
- Root directory: `ui/`
- Build command: `npm run build`
- Output directory: `dist`

Live data (optional):
- Deploy the Azure Functions API in `functions/SentinelLiveApi` and set `VITE_API_BASE_URL`.

## Disclaimers
- Use in a test workspace first.
- Tune thresholds and allowlists per environment.
- Follow your organization's security and privacy policies.
