// Single source of truth for primary navigation, shared by the sidebar (Layout)
// and the command palette so they never drift apart.
export const navSections = [
  {
    section: 'Executive View',
    items: [
      { path: '/', icon: 'pi-globe', label: 'Reviewer Mode', keywords: 'home overview dashboard reviewer lab evidence' },
      { path: '/evidence', icon: 'pi-folder-open', label: 'Evidence Center', keywords: 'proof files screenshots real simulated limitations' },
      { path: '/command-center', icon: 'pi-desktop', label: 'Lab Dashboard', keywords: 'command center summary dashboard' },
      { path: '/architecture', icon: 'pi-share-alt', label: 'Reference Architecture', keywords: 'topology diagram flow' },
      { path: '/finops', icon: 'pi-dollar', label: 'Security FinOps', keywords: 'cost ingestion savings' },
      { path: '/posture', icon: 'pi-cloud', label: 'IaC Posture', keywords: 'azure findings' },
    ],
  },
  {
    section: 'Governance',
    items: [
      { path: '/compliance', icon: 'pi-check-square', label: 'Controls Mapping', keywords: 'cis nist csf benchmark audit controls lab' },
      { path: '/decisions', icon: 'pi-book', label: 'Architecture Decisions', keywords: 'adr rationale why trade-off design' },
    ],
  },
  {
    section: 'Active Defense',
    items: [
      { path: '/incidents', icon: 'pi-shield', label: 'Demo Incidents', keywords: 'alerts queue triage simulated' },
      { path: '/kubernetes', icon: 'pi-box', label: 'K8s Telemetry', keywords: 'kubernetes aks eks container' },
      { path: '/copilot', icon: 'pi-bolt', label: 'Copilot Concept', keywords: 'genai assistant triage demo' },
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
      { path: '/scenario/password-spray', icon: 'pi-lock', label: 'Password Spray Scenario', keywords: 'entra id password spray scenario investigation' },
      { path: '/kql', icon: 'pi-database', label: 'KQL Demo Playground', keywords: 'kusto query hunt sample' },
      { path: '/mitre', icon: 'pi-th-large', label: 'MITRE ATT&CK', keywords: 'tactics techniques coverage navigator' },
      { path: '/simulator', icon: 'pi-exclamation-triangle', label: 'Attack Visualizer', keywords: 'simulate adversary emulation demo' },
      { path: '/investigation', icon: 'pi-share-alt', label: 'Investigation', keywords: 'graph entities workbench' },
      { path: '/threat-map', icon: 'pi-map', label: 'Demo Threat Map', keywords: 'global ioc intel demo' },
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
