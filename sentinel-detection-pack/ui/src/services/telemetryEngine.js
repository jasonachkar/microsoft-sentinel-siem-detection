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
};
