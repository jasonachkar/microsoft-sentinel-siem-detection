export const proofPillars = [
  { label: 'Detection-as-Code', status: 'Repo-backed', path: 'sentinel-detection-pack/rules-yaml' },
  { label: 'Sentinel + KQL', status: 'Real code', path: 'sentinel-detection-pack/rules' },
  { label: 'Terraform Cloud Security', status: 'Real IaC', path: 'terraform' },
  { label: 'SOAR + Drift Detection', status: 'Design', path: '.github/workflows/drift-detection.yaml' },
];

export const scorecards = [
  {
    title: 'Sentinel Detection Engineering',
    evidenceId: 'sentinel-rule-catalog',
    status: 'Real code',
    built: '16 KQL/YAML scheduled analytics rules with MITRE, severity, entity mappings, and tuning comments.',
    paths: ['sentinel-detection-pack/rules-yaml', 'sentinel-detection-pack/rules'],
    talkingPoint: 'I treat detections as deployable code, not portal-only artifacts.',
  },
  {
    title: 'Cloud Security / Terraform',
    evidenceId: 'sentinel-terraform-core',
    status: 'Real IaC',
    built: 'Sentinel core, AWS CloudTrail connector, SOAR shell, Azure Policy examples, and honeypot lab modules.',
    paths: ['terraform/main.tf', 'terraform-aws-connector/main.tf', 'terraform-policy/main.tf'],
    talkingPoint: 'The repo shows prevention, logging, and detection infrastructure together.',
  },
  {
    title: 'DevSecOps Pipeline',
    evidenceId: 'github-actions-security-gates',
    status: 'Real CI',
    built: 'GitHub Actions security scans, rule validation, bundle artifact generation, deploy path, and drift workflow.',
    paths: ['.github/workflows/sentinel-ci-cd.yaml', '.github/workflows/drift-detection.yaml'],
    talkingPoint: 'Security gates run before Sentinel deployment, and drift is treated as an incident workflow.',
  },
  {
    title: 'SOAR Automation',
    evidenceId: 'soar-containment-design',
    status: 'Design',
    built: 'Logic App infrastructure shell and UI playbook visualization for containment workflow discussion.',
    paths: ['terraform-soar/main.tf', 'sentinel-detection-pack/ui/src/components/SoarDashboard.jsx'],
    talkingPoint: 'I would keep destructive containment behind approval until tested and scoped in a real tenant.',
  },
  {
    title: 'Evidence & Documentation',
    evidenceId: 'ui-demo-telemetry',
    status: 'Repo-backed',
    built: 'README truth table, source-rendered IaC pages, architecture pages, and explicit limitations.',
    paths: ['README.md', 'sentinel-detection-pack/README.md'],
    talkingPoint: 'The project is positioned as a reviewable lab, with demo data labelled instead of hidden.',
  },
];

export const architectureNodesData = [
  { id: 'repo', x: 0, y: 120, title: 'GitHub Repository', status: 'Repo-backed', path: 'sentinel-detection-pack/rules-yaml', why: 'Version-controlled detections and infrastructure.' },
  { id: 'ci', x: 260, y: 120, title: 'GitHub Actions CI/CD', status: 'Real CI', path: '.github/workflows/sentinel-ci-cd.yaml', why: 'Validates rules, scans IaC, and bundles artifacts.' },
  { id: 'tf', x: 520, y: 10, title: 'Terraform Modules', status: 'Real IaC', path: 'terraform/main.tf', why: 'Defines Sentinel and cloud security infrastructure.' },
  { id: 'law', x: 800, y: 10, title: 'Log Analytics Workspace', status: 'Deployable lab', path: 'terraform/main.tf', why: 'Telemetry lands here before Sentinel analytics.' },
  { id: 'sentinel', x: 800, y: 170, title: 'Microsoft Sentinel / Defender Portal', status: 'Deployable lab', path: 'src-cli/deployer.go', why: 'Scheduled rules become operational detections.' },
  { id: 'aws', x: 520, y: 280, title: 'AWS CloudTrail Connector', status: 'Real IaC', path: 'terraform-aws-connector/main.tf', why: 'Shows multi-cloud logging and cross-account trust.' },
  { id: 'soar', x: 1080, y: 170, title: 'SOAR Logic App', status: 'Design', path: 'terraform-soar/main.tf', why: 'Human-reviewable containment pattern.' },
  { id: 'drift', x: 260, y: 300, title: 'Drift Detection Issues', status: 'Real CI', path: '.github/workflows/drift-detection.yaml', why: 'ClickOps drift becomes a tracked issue.' },
  { id: 'ui', x: 1080, y: 20, title: 'UI Evidence Layer', status: 'Demo telemetry', path: 'sentinel-detection-pack/ui/src/components/ReviewerMode.jsx', why: 'Guides reviewers to proof paths and limitations.' },
];

export const architectureEdgesData = [
  ['repo', 'ci', 'validate + bundle'],
  ['ci', 'tf', 'scan IaC'],
  ['tf', 'law', 'provision'],
  ['law', 'sentinel', 'workspace'],
  ['ci', 'sentinel', 'deploy rules'],
  ['aws', 'sentinel', 'CloudTrail pattern'],
  ['sentinel', 'soar', 'incident trigger'],
  ['ci', 'drift', 'nightly plan'],
  ['sentinel', 'ui', 'evidence/API optional'],
];

export const detectionFlow = [
  { status: 'YAML Rule', opposite: 'rules-yaml/identity/EntraID_Password_Spray.yaml', icon: 'pi pi-file', color: '#3b82f6' },
  { status: 'Validation Script', opposite: 'scripts/validate-rules.sh', icon: 'pi pi-check-circle', color: '#10b981' },
  { status: 'Bundle Artifact', opposite: 'sentinel-detection-pack/bundles', icon: 'pi pi-box', color: '#f59e0b' },
  { status: 'Go CLI Dry-run/Apply', opposite: 'src-cli/deployer.go', icon: 'pi pi-code', color: '#8b5cf6' },
  { status: 'Sentinel Scheduled Rule', opposite: 'Requires configured workspace', icon: 'pi pi-shield', color: '#06b6d4' },
  { status: 'Alert / Incident / SOAR', opposite: 'Optional live validation', icon: 'pi pi-sitemap', color: '#ef4444' },
];

export const ciRows = [
  { gate: 'Gitleaks', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'Secret scanning before validation/deploy', status: 'Real CI' },
  { gate: 'TFSec', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'IaC scan across Terraform modules', status: 'Real CI' },
  { gate: 'Trivy', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'Filesystem and config scanning', status: 'Real CI' },
  { gate: 'Rule validation', file: 'scripts/validate-rules.sh', proof: 'Metadata and sample-data checks in CI', status: 'Real code' },
  { gate: 'Detection assertion', file: 'scripts/assert-detection.py', proof: 'Currently mock/local unless live mode is added', status: 'Limitation' },
  { gate: 'Drift detection', file: '.github/workflows/drift-detection.yaml', proof: 'Terraform detailed exit code creates issue on drift', status: 'Real CI' },
];

export const cloudSecurityControls = [
  ['Sentinel core', 'Log Analytics workspace, Sentinel enablement, retention/cost considerations.', 'terraform/main.tf'],
  ['AWS CloudTrail', 'KMS encryption, S3 public access block, validation, scoped trust pattern.', 'terraform-aws-connector/main.tf'],
  ['Identity governance', 'GitHub OIDC instead of long-lived deployment secrets.', '.github/workflows/sentinel-ci-cd.yaml'],
  ['Drift detection', 'Terraform plan detailed exit code creates issue when state diverges.', '.github/workflows/drift-detection.yaml'],
  ['Azure Policy', 'Deny/audit guardrail examples for posture management.', 'terraform-policy/main.tf'],
];

export const flagshipScenario = {
  title: 'Entra ID Password Spray',
  ruleId: '0710c724-a738-4b0f-af52-947ba4f01c0d',
  rulePath: 'sentinel-detection-pack/rules-yaml/identity/EntraID_Password_Spray.yaml',
  kqlPath: 'sentinel-detection-pack/rules/identity/EntraID_Password_Spray.kql',
  narrative:
    'An attacker attempts many username/password combinations from one source IP. The detection identifies invalid credential outcomes across distinct accounts in Entra ID SigninLogs.',
  triageCards: [
    ['Triage', 'Confirm source IP ownership, targeted accounts, client app, and user agent patterns.'],
    ['False positives', 'Shared VPN/proxy egress, stale app credentials, authorized load testing.'],
    ['Response', 'Enforce MFA/Conditional Access, reset credentials if confirmed, block source IP when appropriate.'],
    ['Tradeoff', 'Lower thresholds detect faster but increase noisy enterprise egress false positives.'],
  ],
};
