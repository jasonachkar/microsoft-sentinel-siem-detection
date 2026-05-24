// Single source of truth for primary navigation, shared by the sidebar (Layout)
// and the command palette so they never drift apart.
export const navSections = [
  {
    section: 'Start Here',
    items: [
      { path: '/', icon: 'pi-compass', label: 'Start Here', keywords: 'home overview reviewer mission proof path' },
    ],
  },
  {
    section: 'Architecture',
    items: [
      { path: '/architecture', icon: 'pi-share-alt', label: 'Reference Architecture', keywords: 'topology diagram flow' },
      { path: '/iac', icon: 'pi-server', label: 'Infrastructure as Code', keywords: 'terraform source code modules' },
      { path: '/decisions', icon: 'pi-book', label: 'Architecture Decisions', keywords: 'adr rationale why trade-off design' },
    ],
  },
  {
    section: 'Detection Engineering',
    items: [
      { path: '/rules', icon: 'pi-list', label: 'Detection Rules', keywords: 'kql detections catalog' },
      { path: '/detection-engineering', icon: 'pi-search-plus', label: 'Detection Deep-Dive', keywords: 'tuning false positive logic password spray' },
      { path: '/scenario/password-spray', icon: 'pi-lock', label: 'Password Spray Scenario', keywords: 'entra id password spray scenario investigation' },
      { path: '/mitre', icon: 'pi-th-large', label: 'MITRE ATT&CK', keywords: 'tactics techniques coverage navigator' },
    ],
  },
  {
    section: 'Cloud Security Controls',
    items: [
      { path: '/cloud-security-controls', icon: 'pi-shield', label: 'Cloud Security Controls', keywords: 'azure policy defender oidc logging cost governance' },
      { path: '/finops', icon: 'pi-dollar', label: 'Security FinOps', keywords: 'cost ingestion savings' },
      { path: '/compliance', icon: 'pi-check-square', label: 'Controls Mapping', keywords: 'cis nist csf benchmark audit controls lab' },
      { path: '/posture', icon: 'pi-cloud', label: 'IaC Posture Demo', keywords: 'azure findings demo resource graph demo' },
    ],
  },
  {
    section: 'CI/CD & Drift',
    items: [
      { path: '/appsec', icon: 'pi-verified', label: 'CI/CD Security', keywords: 'trivy tfsec gitleaks cve scan supply chain' },
      { path: '/drift', icon: 'pi-sync', label: 'CI/CD & Drift', keywords: 'terraform drift ci cd deploy demo pipeline' },
    ],
  },
  {
    section: 'SOAR Response',
    items: [
      { path: '/soar', icon: 'pi-sitemap', label: 'SOAR Response', keywords: 'logic app automation remediation human approval' },
    ],
  },
  {
    section: 'Evidence',
    items: [
      { path: '/evidence', icon: 'pi-folder-open', label: 'Evidence', keywords: 'proof files screenshots real simulated limitations' },
    ],
  },
  {
    section: 'Lab Sandbox',
    items: [
      { path: '/threat-map', icon: 'pi-map', label: 'Demo Threat Map', keywords: 'global ioc intel demo' },
      { path: '/incidents', icon: 'pi-shield', label: 'Demo Incidents', keywords: 'alerts queue triage simulated' },
      { path: '/live-incidents', icon: 'pi-bolt', label: 'Demo Live Incidents', keywords: 'live incidents demo api' },
      { path: '/investigation', icon: 'pi-share-alt', label: 'Demo Investigation', keywords: 'graph entities workbench demo' },
      { path: '/kql', icon: 'pi-database', label: 'KQL Demo Playground', keywords: 'kusto query hunt sample demo' },
      { path: '/metrics', icon: 'pi-chart-bar', label: 'Demo Metrics', keywords: 'metrics dashboard demo' },
      { path: '/simulator', icon: 'pi-exclamation-triangle', label: 'Attack Visualizer Demo', keywords: 'simulate adversary emulation demo' },
      { path: '/copilot', icon: 'pi-bolt', label: 'Copilot Concept Demo', keywords: 'genai assistant triage demo concept' },
      { path: '/kubernetes', icon: 'pi-box', label: 'Demo K8s Telemetry', keywords: 'kubernetes aks eks container demo' },
      { path: '/tutorial', icon: 'pi-compass', label: 'Learning Paths', keywords: 'tutorial guide onboarding' },
      { path: '/command-center', icon: 'pi-desktop', label: 'Lab Dashboard Demo', keywords: 'command center summary dashboard demo' },
    ],
  },
];

export const allCommands = navSections.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.section })),
);
