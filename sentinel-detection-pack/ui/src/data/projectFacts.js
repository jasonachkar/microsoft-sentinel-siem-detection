export const projectFacts = {
  name: 'Microsoft Sentinel Cloud Security Detection Engineering Lab',
  shortName: 'Sentinel Detection Lab',
  mission:
    'Portfolio-grade lab showing Detection-as-Code, KQL analytics rules, Terraform-managed SIEM infrastructure, CI/CD security gates, drift detection, and SOAR response design.',
  repoUrl: 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection',
  safeBadges: ['Repo-backed', 'Demo telemetry labelled', 'Deployable lab', 'Not a production SOC'],
  counts: {
    sentinelRules: '16',
    terraformModules: '5',
    workflows: '2',
    flagshipScenario: 'Password spray',
  },
};

export const realVsSimulated = [
  { area: 'Sentinel IaC', status: 'Real IaC', notes: 'Deployable with Azure subscription, variables, and credentials.' },
  { area: 'KQL/YAML rules', status: 'Real code', notes: 'Repo-backed rules under rules/ and rules-yaml/.' },
  { area: 'Go deployer', status: 'Real code', notes: 'Dry-run/apply path uses DefaultAzureCredential.' },
  { area: 'CI/CD gates', status: 'Real CI', notes: 'GitHub Actions define scans, validation, bundling, and deploy path.' },
  { area: 'Drift detection', status: 'Real CI', notes: 'Workflow requires remote state and Azure OIDC secrets to run live.' },
  { area: 'UI incidents and telemetry', status: 'Demo data', notes: 'Used for reviewer flow unless a page explicitly says API-backed.' },
  { area: 'Detection assertion', status: 'Limitation', notes: 'Mock/local until live Sentinel validation is implemented.' },
  { area: 'SOAR response', status: 'Planned', notes: 'Human-reviewed containment pattern until tested in a tenant.' },
];

export const statusSeverity = {
  'Real IaC': 'success',
  'Real code': 'success',
  'Real CI': 'success',
  'Repo-backed': 'success',
  'Demo data': 'warning',
  'Demo telemetry': 'warning',
  'Demo telemetry labelled': 'warning',
  Simulated: 'warning',
  'Deployable lab': 'info',
  Design: 'info',
  Planned: 'info',
  Limitation: 'danger',
  'Not a production SOC': 'danger',
};
