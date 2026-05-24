export const telemetryEngine = {
  generateKubernetesLogs: (count = 15) => {
    const namespaces = ['kube-system', 'default', 'ingress-nginx', 'payment-processor', 'auth-service'];
    const users = ['system:admin', 'system:serviceaccount:default:sa-deploy', 'developer-x', 'soc-admin'];
    const actions = ['create', 'update', 'delete', 'patch', 'exec'];
    const resources = ['pods', 'deployments', 'secrets', 'configmaps', 'roles'];

    return Array.from({ length: count }).map(() => ({
      id: `k8s-${Math.random().toString(36).substr(2, 9)}`,
      TimeGenerated: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      Category: 'kube-audit',
      Verb: actions[Math.floor(Math.random() * actions.length)],
      Resource: resources[Math.floor(Math.random() * resources.length)],
      Namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
      User: users[Math.floor(Math.random() * users.length)],
      SourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.10.5`,
      Severity: Math.random() > 0.8 ? 'High' : 'Low',
    })).sort((a, b) => new Date(b.TimeGenerated) - new Date(a.TimeGenerated));
  },

  generateIaCPosture: () => [
    { name: 'law-sentinel-prod', type: 'Microsoft.OperationalInsights/workspaces', location: 'eastus', state: 'Synced', lastDrift: 'None' },
    { name: 'rg-secops-core', type: 'Microsoft.Resources/resourceGroups', location: 'eastus', state: 'Synced', lastDrift: 'None' },
    { name: 'logicapp-soar-isolate', type: 'Microsoft.Logic/workflows', location: 'eastus', state: 'Synced', lastDrift: 'None' },
    { name: 'aws-cloudtrail-connector', type: 'AWS.IAM/Role', location: 'us-east-1', state: 'Synced', lastDrift: 'None' },
    { name: 'aks-cluster-prod', type: 'Microsoft.ContainerService/managedClusters', location: 'eastus', state: 'Drift Detected', lastDrift: '2 hours ago' },
  ],

  generateThreatIntel: () => Array.from({ length: 8 }).map(() => ({
    indicator: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`,
    type: 'IPv4',
    confidence: Math.floor(Math.random() * 40) + 60,
    actor: ['APT29', 'Lazarus Group', 'Scattered Spider', 'Unknown'][Math.floor(Math.random() * 4)],
    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toLocaleTimeString(),
  })),

  // ---------------------------------------------------------------------------
  // DevSecOps pipeline demo telemetry.
  // NOTE: this is illustrative demo data for the portfolio UI. The shapes mirror
  // the real output of the scanners wired in .github/workflows/sentinel-ci-cd.yaml
  // (Gitleaks, TFSec, Trivy) and the nightly job in
  // .github/workflows/drift-detection.yaml. These examples are intentionally
  // labelled as demo data; use workflow SARIF/artifact parsing before treating
  // them as current scan output.
  // ---------------------------------------------------------------------------

  generateAppSecScan: () => {
    const scanners = [
      { name: 'Gitleaks', type: 'Secret scanning', status: 'pass', findings: 0, target: 'full repository history' },
      { name: 'TFSec', type: 'IaC misconfiguration', status: 'pass', findings: 0, target: '5 Terraform modules, HIGH+ blocking gate' },
      { name: 'Trivy', type: 'Dependency CVE (fs)', status: 'warn', findings: 2, target: 'go.sum, package-lock.json' },
    ];

    const cves = [
      { id: 'CVE-2024-45337', pkg: 'golang.org/x/crypto', installed: 'v0.17.0', fixed: 'v0.31.0', severity: 'CRITICAL', target: 'src-cli/go.sum' },
      { id: 'CVE-2023-39325', pkg: 'golang.org/x/net', installed: 'v0.10.0', fixed: 'v0.17.0', severity: 'HIGH', target: 'src-cli/go.sum' },
      { id: 'CVE-2024-4068', pkg: 'braces', installed: '3.0.2', fixed: '3.0.3', severity: 'HIGH', target: 'ui/package-lock.json' },
      { id: 'CVE-2025-22868', pkg: 'golang.org/x/oauth2', installed: 'v0.7.0', fixed: 'v0.27.0', severity: 'MEDIUM', target: 'src-cli/go.sum' },
      { id: 'CVE-2024-4067', pkg: 'micromatch', installed: '4.0.5', fixed: '4.0.8', severity: 'MEDIUM', target: 'ui/package-lock.json' },
    ];

    // Historical/demo examples used to explain what the shift-left gate catches.
    const iacFindings = [
      { rule: 'general-secret-in-code', severity: 'CRITICAL', module: 'terraform-honeypot', resource: 'azurerm_windows_virtual_machine.honeypot_vm', file: 'terraform-honeypot/main.tf', detail: 'Historical issue: hard-coded admin password. Current module uses random_password.' },
      { rule: 'aws-s3-enable-bucket-encryption', severity: 'HIGH', module: 'terraform-aws-connector', resource: 'aws_s3_bucket.sentinel_cloudtrail', file: 'terraform-aws-connector/main.tf', detail: 'Historical issue: unencrypted CloudTrail log bucket. Current module uses a KMS CMK.' },
      { rule: 'aws-s3-no-public-access-block', severity: 'HIGH', module: 'terraform-aws-connector', resource: 'aws_s3_bucket.sentinel_cloudtrail', file: 'terraform-aws-connector/main.tf', detail: 'Historical issue: missing S3 public access block. Current module blocks public access.' },
      { rule: 'azure-rbac-least-privilege', severity: 'HIGH', module: 'terraform-soar', resource: 'azurerm_role_assignment.soar_network_contributor', file: 'terraform-soar/main.tf', detail: 'Historical issue: broad SOAR permissions. Current role assignment is opt-in and resource-group scoped.' },
      { rule: 'aws-s3-enable-bucket-logging', severity: 'MEDIUM', module: 'terraform-aws-connector', resource: 'aws_s3_bucket.sentinel_cloudtrail', file: 'terraform-aws-connector/main.tf', detail: 'Design tradeoff: S3 server access logging is documented as out of scope for the demo module.' },
    ];

    return {
      lastRun: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      commit: '1ab9e4f',
      gateBlocking: true,
      scanners,
      cves,
      iacFindings,
    };
  },

  generateDriftReport: () => ({
    lastCheck: new Date(new Date().setHours(2, 0, 0, 0)).toISOString(),
    nextCheck: '02:00 UTC (cron 0 2 * * *)',
    resources: [
      { name: 'law-sentinel-prod', type: 'OperationalInsights/workspaces', module: 'terraform', location: 'eastus', state: 'Synced', drift: 'None' },
      { name: 'rg-secops-core', type: 'Resources/resourceGroups', module: 'terraform', location: 'eastus', state: 'Synced', drift: 'None' },
      { name: 'logicapp-soar-isolate', type: 'Logic/workflows', module: 'terraform-soar', location: 'eastus', state: 'Synced', drift: 'None' },
      { name: 'AzureSentinelAWSIntegrationRole', type: 'AWS.IAM/Role', module: 'terraform-aws-connector', location: 'us-east-1', state: 'Synced', drift: 'None' },
      { name: 'sentinel-multi-cloud-trail-logs', type: 'AWS.S3/Bucket', module: 'terraform-aws-connector', location: 'us-east-1', state: 'Drift Detected', drift: 'Bucket policy modified outside Terraform (1 attribute).' },
      { name: 'aks-cluster-prod', type: 'ContainerService/managedClusters', module: 'terraform', location: 'eastus', state: 'Drift Detected', drift: 'Node pool count changed in portal (3 -> 5).' },
    ],
  }),

  generatePipelineRuns: () => [
    { id: 4821, workflow: 'DevSecOps CI/CD', trigger: 'push', actor: 'jasonachkardiab', branch: 'main', result: 'success', duration: '4m 12s', when: '12 min ago' },
    { id: 4818, workflow: 'Nightly IaC Drift Detection', trigger: 'schedule', actor: 'github-actions', branch: 'main', result: 'drift', duration: '1m 02s', when: '8 hours ago' },
    { id: 4814, workflow: 'DevSecOps CI/CD', trigger: 'pull_request', actor: 'jasonachkardiab', branch: 'feat/soar', result: 'success', duration: '3m 58s', when: '1 day ago' },
    { id: 4809, workflow: 'DevSecOps CI/CD', trigger: 'push', actor: 'jasonachkardiab', branch: 'main', result: 'failed', duration: '2m 09s', when: '2 days ago' },
  ],

  generateDeployerLog: () => [
    { level: 'info', text: '🚀 Initializing Sentinel Deployment Tool (Go-SecOps)' },
    { level: 'info', text: 'Authenticating via DefaultAzureCredential (OIDC / federated token)' },
    { level: 'step', text: '📦 Processing Rule: EntraID_Password_Spray.yaml' },
    { level: 'ok', text: '   -> Validated schema for: Entra ID Password Spray (Severity: High)' },
    { level: 'step', text: '📦 Processing Rule: Credential_Dumping_LSASS_Access.yaml' },
    { level: 'ok', text: '   -> Validated schema for: LSASS Credential Dumping (Severity: High)' },
    { level: 'step', text: '📦 Processing Rule: Kubernetes_Suspicious_Exec.yaml' },
    { level: 'ok', text: '   -> Validated schema for: Kubernetes Suspicious Exec (Severity: Medium)' },
    { level: 'ok', text: '✅ Deployment execution completed. (16 rules processed)' },
  ],
};
