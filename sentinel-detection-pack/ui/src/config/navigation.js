// Single source of truth for primary navigation, shared by the sidebar (Layout)
// and the command palette so they never drift apart.
export const navSections = [
  {
    section: 'Executive View',
    items: [
      { path: '/', icon: 'pi-globe', label: 'Command Center', keywords: 'home overview dashboard' },
      { path: '/architecture', icon: 'pi-share-alt', label: 'Reference Architecture', keywords: 'topology diagram flow' },
      { path: '/finops', icon: 'pi-dollar', label: 'Security FinOps', keywords: 'cost ingestion savings' },
      { path: '/posture', icon: 'pi-cloud', label: 'IaC Posture', keywords: 'azure findings' },
    ],
  },
  {
    section: 'Active Defense',
    items: [
      { path: '/incidents', icon: 'pi-shield', label: 'Live Incidents', keywords: 'alerts queue triage' },
      { path: '/kubernetes', icon: 'pi-box', label: 'K8s Telemetry', keywords: 'kubernetes aks eks container' },
      { path: '/copilot', icon: 'pi-bolt', label: 'AI Copilot', keywords: 'genai assistant triage' },
      { path: '/soar', icon: 'pi-sitemap', label: 'SOAR Playbooks', keywords: 'logic app automation remediation' },
    ],
  },
  {
    section: 'DevSecOps',
    items: [
      { path: '/appsec', icon: 'pi-verified', label: 'AppSec & Supply Chain', keywords: 'trivy tfsec gitleaks cve scan' },
      { path: '/drift', icon: 'pi-sync', label: 'IaC Drift & Pipeline', keywords: 'terraform drift ci cd deploy' },
      { path: '/iac', icon: 'pi-server', label: 'Infrastructure as Code', keywords: 'terraform source code modules' },
    ],
  },
  {
    section: 'Engineering',
    items: [
      { path: '/rules', icon: 'pi-list', label: 'Detection Rules', keywords: 'kql detections catalog' },
      { path: '/detection-engineering', icon: 'pi-search-plus', label: 'Detection Deep-Dive', keywords: 'tuning false positive logic password spray' },
      { path: '/kql', icon: 'pi-database', label: 'KQL Playground', keywords: 'kusto query hunt' },
      { path: '/mitre', icon: 'pi-th-large', label: 'MITRE ATT&CK', keywords: 'tactics techniques coverage navigator' },
      { path: '/simulator', icon: 'pi-exclamation-triangle', label: 'Attack Simulator', keywords: 'simulate adversary emulation' },
      { path: '/investigation', icon: 'pi-share-alt', label: 'Investigation', keywords: 'graph entities workbench' },
      { path: '/threat-map', icon: 'pi-map', label: 'Threat Map', keywords: 'global ioc intel' },
    ],
  },
  {
    section: 'Learn',
    items: [
      { path: '/tutorial', icon: 'pi-compass', label: 'Learning Paths', keywords: 'tutorial guide onboarding' },
    ],
  },
];

export const allCommands = navSections.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.section })),
);
