# MITRE ATT&CK mapping

Each rule includes MITRE ATT&CK tactics and techniques in both the KQL metadata header and the YAML definition.

## Techniques covered
- T1110.003 Password Spraying
- T1078.004 Valid Accounts: Cloud Accounts
- T1621 Multi-Factor Authentication Request Generation
- T1090.003 Proxy: Multi-hop Proxy
- T1098.003 Account Manipulation: Additional Cloud Roles
- T1059.001 PowerShell
- T1105 Ingress Tool Transfer
- T1003.001 OS Credential Dumping: LSASS Memory
- T1136.003 Create Account: Cloud Account
- T1552.004 Unsecured Credentials: Private Keys
- T1562 Impair Defenses
- T1114.003 Email Collection: Email Forwarding Rule
- T1566.001 Phishing: Spearphishing Attachment
- T1041 Exfiltration Over C2 Channel
- T1021.001 Remote Services: Remote Desktop Protocol
- T1021.002 Remote Services: SMB/Windows Admin Shares

## Review process
- Validate tactics and techniques against your threat model.
- Adjust mappings if your detection scope changes after tuning.
