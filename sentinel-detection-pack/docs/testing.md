# Testing guidance

Use a test workspace whenever possible. The sample data files are synthetic and intended for local schema validation only; they do not simulate real alerts.

## Required logs
Enable the connectors listed in `docs/data-sources.md` before testing in a live workspace.

## Local sample-data harness
The validation scripts can perform a lightweight schema check against the JSONL files in `sample-data/`.

- Bash: `./scripts/validate-rules.sh --check-samples`
- PowerShell: `./scripts/validate-rules.ps1 -CheckSamples`

Limitations:
- This is not a KQL engine.
- It only verifies that expected fields exist in the sample data and can be parsed.

## Rule-by-rule testing

### Identity / Entra ID

**Entra ID Password Spray**
- Expect: multiple failed logins from one IP across many accounts in a short window.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: SigninLogs).
- Safe test: run repeated failed logins against test accounts from a single test IP.

**Entra ID Impossible Travel Sign-in**
- Expect: successful sign-ins from different countries within a short timeframe.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: SigninLogs).
- Safe test: sign in to a test account from two distinct geographic locations in a lab tenant.

**Entra ID MFA Fatigue**
- Expect: multiple MFA denials/timeouts for the same account and IP.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: SigninLogs).
- Safe test: trigger repeated MFA prompts on a test account and deny them.

**Entra ID Risky Sign-in from TOR/Watchlist**
- Expect: sign-ins flagged as medium/high risk or matching a configured risky IP list.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: SigninLogs).
- Safe test: use a test account with Identity Protection enabled or add a lab IP to a watchlist and sign in from it.

**Entra ID Privileged Role Assignment**
- Expect: role assignment to a privileged directory role.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: AuditLogs).
- Safe test: assign a high-privileged role to a test user in a lab tenant and remove it afterward.

### Endpoint

**Suspicious PowerShell Encoded Command**
- Expect: PowerShell with encoded commands or download cradle patterns.
- Sample data: `sample-data/deviceprocess_sample.jsonl` (SampleTable: DeviceProcessEvents).
- Safe test: run a benign encoded PowerShell command in a lab (for example, one that only writes output).

**Credential Dumping LSASS Access**
- Expect: processes with command lines indicating LSASS access or dump attempts.
- Sample data: `sample-data/deviceprocess_sample.jsonl` (SampleTable: DeviceProcessEvents).
- Safe test: validate with test telemetry from known security tooling in a controlled lab environment.

**Local Admin Group Changes**
- Expect: local user creation and/or additions to the Administrators group.
- Sample data: `sample-data/securityevent_auth_sample.jsonl` (SampleTable: SecurityEvent).
- Safe test: create a local test user and add it to the local Administrators group on a test VM.

### Cloud / Azure

**Service Principal Creation + Credential Addition**
- Expect: a new service principal followed by credential addition within a short window.
- Sample data: `sample-data/identity_signins_sample.jsonl` (SampleTable: AuditLogs).
- Safe test: create a test service principal in a lab tenant and add a credential.

**Key Vault Secret Access Anomaly**
- Expect: secret access from a new IP for a given identity and a burst of secret gets.
- Sample data: `sample-data/commonsecuritylog_sample.jsonl` (SampleTable: AzureDiagnostics).
- Safe test: access a test Key Vault secret from a new client IP using a lab identity.

**Rare Admin Operations (Entra ID + Azure Activity)**
- Expect: high-impact operations that are rare for the initiating actor.
- Sample data: `sample-data/commonsecuritylog_sample.jsonl` (SampleTable: AzureActivity) and `sample-data/identity_signins_sample.jsonl` (SampleTable: AuditLogs).
- Safe test: modify a conditional access policy or perform a high-impact Azure resource change in a lab tenant.

### Email / M365

**Suspicious Inbox Rule External Forward**
- Expect: inbox rules forwarding or redirecting to external domains.
- Sample data: `sample-data/officeactivity_sample.jsonl` (SampleTable: OfficeActivity).
- Safe test: create a rule in a test mailbox that forwards to an external lab address you control.

**Phishing Attachment Patterns**
- Expect: inbound mail from external senders with suspicious attachment types.
- Sample data: `sample-data/officeactivity_sample.jsonl` (SampleTable: EmailEvents, EmailAttachmentInfo).
- Safe test: send a benign email with a non-executable test attachment in a lab environment.

### Network

**Unusual Outbound Data Volume to Rare Destination**
- Expect: high outbound bytes to a destination not seen in the baseline period.
- Sample data: `sample-data/commonsecuritylog_sample.jsonl` (SampleTable: CommonSecurityLog).
- Safe test: transfer a large file to a lab-controlled destination over an approved channel.

**Unusual RDP/SMB Lateral Movement**
- Expect: new RDP/SMB source-destination host pairs for an account.
- Sample data: `sample-data/securityevent_auth_sample.jsonl` (SampleTable: SecurityEvent).
- Safe test: initiate an RDP session or SMB access between two lab hosts that do not normally communicate.
