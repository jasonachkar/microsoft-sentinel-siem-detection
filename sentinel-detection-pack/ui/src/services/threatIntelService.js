// Threat Intelligence Service
// Aggregates data from multiple free threat intel sources

const THREAT_INTEL_SOURCES = {
  // Feodo Tracker - C2 servers (abuse.ch)
  feodoTracker: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
  // URLhaus - Malicious URLs
  urlhaus: 'https://urlhaus.abuse.ch/downloads/json_recent/',
  // MITRE ATT&CK
  mitreAttack: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
};

// Sample threat data for demo (when APIs are unavailable/CORS blocked)
const SAMPLE_THREAT_DATA = {
  maliciousIPs: [
    { ip: '185.220.101.1', country: 'DE', threat: 'TOR Exit Node', score: 95, lastSeen: new Date().toISOString() },
    { ip: '45.155.205.233', country: 'RU', threat: 'Botnet C2', score: 100, lastSeen: new Date().toISOString() },
    { ip: '194.26.192.64', country: 'NL', threat: 'Brute Force', score: 85, lastSeen: new Date().toISOString() },
    { ip: '89.248.165.52', country: 'NL', threat: 'Scanner', score: 70, lastSeen: new Date().toISOString() },
    { ip: '141.98.10.121', country: 'LT', threat: 'Ransomware', score: 100, lastSeen: new Date().toISOString() },
    { ip: '45.129.56.200', country: 'RU', threat: 'APT', score: 98, lastSeen: new Date().toISOString() },
    { ip: '31.184.198.23', country: 'UA', threat: 'Phishing', score: 80, lastSeen: new Date().toISOString() },
    { ip: '103.75.201.4', country: 'CN', threat: 'Cryptominer', score: 75, lastSeen: new Date().toISOString() },
    { ip: '178.128.23.9', country: 'SG', threat: 'DDoS', score: 90, lastSeen: new Date().toISOString() },
    { ip: '167.71.13.196', country: 'US', threat: 'Malware Hosting', score: 88, lastSeen: new Date().toISOString() },
  ],
  c2Servers: [
    { ip: '194.26.192.64', port: 443, malware: 'Emotet', firstSeen: '2024-01-15', status: 'online' },
    { ip: '45.155.205.233', port: 8080, malware: 'QakBot', firstSeen: '2024-01-10', status: 'online' },
    { ip: '141.98.10.121', port: 443, malware: 'IcedID', firstSeen: '2024-01-08', status: 'offline' },
    { ip: '89.248.165.52', port: 4443, malware: 'Cobalt Strike', firstSeen: '2024-01-05', status: 'online' },
    { ip: '103.75.201.4', port: 9001, malware: 'AsyncRAT', firstSeen: '2024-01-12', status: 'online' },
  ],
  malwareHashes: [
    { sha256: 'a1b2c3d4e5f6789012345678901234567890abcd', name: 'Emotet.dll', type: 'Trojan', detections: 58 },
    { sha256: 'b2c3d4e5f67890123456789012345678901abcde', name: 'QakBot.exe', type: 'Banking Trojan', detections: 62 },
    { sha256: 'c3d4e5f678901234567890123456789012abcdef', name: 'Cobalt.bin', type: 'Beacon', detections: 45 },
    { sha256: 'd4e5f6789012345678901234567890123abcdef0', name: 'Mimikatz.exe', type: 'Credential Stealer', detections: 67 },
    { sha256: 'e5f67890123456789012345678901234abcdef01', name: 'Ransomware.enc', type: 'Ransomware', detections: 71 },
  ],
  phishingDomains: [
    { domain: 'microsoft-security-alert.com', created: '2024-01-14', target: 'Microsoft', status: 'active' },
    { domain: 'office365-login-verify.net', created: '2024-01-13', target: 'Office 365', status: 'active' },
    { domain: 'azuread-signin.org', created: '2024-01-12', target: 'Azure AD', status: 'active' },
    { domain: 'sharepoint-document-view.com', created: '2024-01-11', target: 'SharePoint', status: 'takedown' },
    { domain: 'outlook-password-reset.net', created: '2024-01-10', target: 'Outlook', status: 'active' },
  ],
  recentAttacks: [
    { type: 'Ransomware', count: 1247, change: 12.5, trend: 'up' },
    { type: 'Phishing', count: 8923, change: -3.2, trend: 'down' },
    { type: 'BEC', count: 892, change: 8.7, trend: 'up' },
    { type: 'Credential Theft', count: 3456, change: 15.3, trend: 'up' },
    { type: 'DDoS', count: 567, change: -5.1, trend: 'down' },
    { type: 'Cryptojacking', count: 234, change: -12.4, trend: 'down' },
  ],
  geoAttacks: [
    { country: 'RU', code: 'RU', lat: 55.7558, lng: 37.6173, count: 2345, name: 'Russia' },
    { country: 'CN', code: 'CN', lat: 39.9042, lng: 116.4074, count: 1892, name: 'China' },
    { country: 'US', code: 'US', lat: 38.9072, lng: -77.0369, count: 1567, name: 'United States' },
    { country: 'NL', code: 'NL', lat: 52.3676, lng: 4.9041, count: 987, name: 'Netherlands' },
    { country: 'DE', code: 'DE', lat: 52.5200, lng: 13.4050, count: 876, name: 'Germany' },
    { country: 'BR', code: 'BR', lat: -15.7942, lng: -47.8825, count: 654, name: 'Brazil' },
    { country: 'IN', code: 'IN', lat: 28.6139, lng: 77.2090, count: 543, name: 'India' },
    { country: 'KR', code: 'KR', lat: 37.5665, lng: 126.9780, count: 432, name: 'South Korea' },
    { country: 'UA', code: 'UA', lat: 50.4501, lng: 30.5234, count: 398, name: 'Ukraine' },
    { country: 'IR', code: 'IR', lat: 35.6892, lng: 51.3890, count: 321, name: 'Iran' },
  ]
};

// MITRE ATT&CK Tactics
export const MITRE_TACTICS = [
  { id: 'TA0043', name: 'Reconnaissance', shortName: 'Recon', color: '#8b5cf6' },
  { id: 'TA0042', name: 'Resource Development', shortName: 'Resource Dev', color: '#a855f7' },
  { id: 'TA0001', name: 'Initial Access', shortName: 'Initial Access', color: '#ec4899' },
  { id: 'TA0002', name: 'Execution', shortName: 'Execution', color: '#f43f5e' },
  { id: 'TA0003', name: 'Persistence', shortName: 'Persistence', color: '#f97316' },
  { id: 'TA0004', name: 'Privilege Escalation', shortName: 'Priv Esc', color: '#eab308' },
  { id: 'TA0005', name: 'Defense Evasion', shortName: 'Defense Evasion', color: '#84cc16' },
  { id: 'TA0006', name: 'Credential Access', shortName: 'Cred Access', color: '#22c55e' },
  { id: 'TA0007', name: 'Discovery', shortName: 'Discovery', color: '#14b8a6' },
  { id: 'TA0008', name: 'Lateral Movement', shortName: 'Lateral Mov', color: '#06b6d4' },
  { id: 'TA0009', name: 'Collection', shortName: 'Collection', color: '#0ea5e9' },
  { id: 'TA0011', name: 'Command and Control', shortName: 'C2', color: '#3b82f6' },
  { id: 'TA0010', name: 'Exfiltration', shortName: 'Exfil', color: '#6366f1' },
  { id: 'TA0040', name: 'Impact', shortName: 'Impact', color: '#dc2626' },
];

// Technique to Tactic mapping
export const MITRE_TECHNIQUES = {
  'T1110': { name: 'Brute Force', tactic: 'TA0006', subtechniques: ['T1110.001', 'T1110.002', 'T1110.003', 'T1110.004'] },
  'T1110.003': { name: 'Password Spraying', tactic: 'TA0006' },
  'T1078': { name: 'Valid Accounts', tactic: 'TA0001', subtechniques: ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'] },
  'T1078.004': { name: 'Cloud Accounts', tactic: 'TA0001' },
  'T1621': { name: 'Multi-Factor Authentication Request Generation', tactic: 'TA0006' },
  'T1098': { name: 'Account Manipulation', tactic: 'TA0003', subtechniques: ['T1098.001', 'T1098.002', 'T1098.003', 'T1098.004', 'T1098.005'] },
  'T1098.003': { name: 'Additional Cloud Roles', tactic: 'TA0003' },
  'T1090': { name: 'Proxy', tactic: 'TA0011', subtechniques: ['T1090.001', 'T1090.002', 'T1090.003', 'T1090.004'] },
  'T1090.003': { name: 'Multi-hop Proxy', tactic: 'TA0011' },
  'T1059': { name: 'Command and Scripting Interpreter', tactic: 'TA0002', subtechniques: ['T1059.001', 'T1059.003', 'T1059.005', 'T1059.006', 'T1059.007'] },
  'T1059.001': { name: 'PowerShell', tactic: 'TA0002' },
  'T1105': { name: 'Ingress Tool Transfer', tactic: 'TA0011' },
  'T1003': { name: 'OS Credential Dumping', tactic: 'TA0006', subtechniques: ['T1003.001', 'T1003.002', 'T1003.003', 'T1003.004', 'T1003.005', 'T1003.006', 'T1003.007', 'T1003.008'] },
  'T1003.001': { name: 'LSASS Memory', tactic: 'TA0006' },
  'T1136': { name: 'Create Account', tactic: 'TA0003', subtechniques: ['T1136.001', 'T1136.002', 'T1136.003'] },
  'T1136.003': { name: 'Cloud Account', tactic: 'TA0003' },
  'T1552': { name: 'Unsecured Credentials', tactic: 'TA0006', subtechniques: ['T1552.001', 'T1552.002', 'T1552.004', 'T1552.005', 'T1552.006', 'T1552.007'] },
  'T1552.004': { name: 'Private Keys', tactic: 'TA0006' },
  'T1562': { name: 'Impair Defenses', tactic: 'TA0005', subtechniques: ['T1562.001', 'T1562.002', 'T1562.004', 'T1562.006', 'T1562.007', 'T1562.008'] },
  'T1114': { name: 'Email Collection', tactic: 'TA0009', subtechniques: ['T1114.001', 'T1114.002', 'T1114.003'] },
  'T1114.003': { name: 'Email Forwarding Rule', tactic: 'TA0009' },
  'T1566': { name: 'Phishing', tactic: 'TA0001', subtechniques: ['T1566.001', 'T1566.002', 'T1566.003'] },
  'T1566.001': { name: 'Spearphishing Attachment', tactic: 'TA0001' },
  'T1041': { name: 'Exfiltration Over C2 Channel', tactic: 'TA0010' },
  'T1021': { name: 'Remote Services', tactic: 'TA0008', subtechniques: ['T1021.001', 'T1021.002', 'T1021.003', 'T1021.004', 'T1021.005', 'T1021.006'] },
  'T1021.001': { name: 'Remote Desktop Protocol', tactic: 'TA0008' },
  'T1021.002': { name: 'SMB/Windows Admin Shares', tactic: 'TA0008' },
};

class ThreatIntelService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getThreatData() {
    const cacheKey = 'threatData';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // For demo purposes, return sample data
    // In production, this would fetch from real APIs
    const data = {
      ...SAMPLE_THREAT_DATA,
      lastUpdated: new Date().toISOString()
    };

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getMaliciousIPs() {
    const data = await this.getThreatData();
    return data.maliciousIPs;
  }

  async getC2Servers() {
    const data = await this.getThreatData();
    return data.c2Servers;
  }

  async getMalwareHashes() {
    const data = await this.getThreatData();
    return data.malwareHashes;
  }

  async getPhishingDomains() {
    const data = await this.getThreatData();
    return data.phishingDomains;
  }

  async getGeoAttacks() {
    const data = await this.getThreatData();
    return data.geoAttacks;
  }

  async getRecentAttacks() {
    const data = await this.getThreatData();
    return data.recentAttacks;
  }

  getMitreTactics() {
    return MITRE_TACTICS;
  }

  getMitreTechniques() {
    return MITRE_TECHNIQUES;
  }

  // Lookup IP reputation
  async lookupIP(ip) {
    const data = await this.getThreatData();
    const found = data.maliciousIPs.find(item => item.ip === ip);
    if (found) {
      return { ...found, reputation: 'malicious' };
    }
    return { ip, reputation: 'unknown', score: 0 };
  }

  // Lookup domain reputation
  async lookupDomain(domain) {
    const data = await this.getThreatData();
    const found = data.phishingDomains.find(item => item.domain === domain);
    if (found) {
      return { ...found, reputation: 'malicious' };
    }
    return { domain, reputation: 'unknown' };
  }
}

export const threatIntelService = new ThreatIntelService();
export default threatIntelService;
