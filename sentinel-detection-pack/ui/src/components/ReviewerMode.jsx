import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import rulesData from '../data/rules.json';

const repoBase = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

const statusSeverity = {
  'Real IaC': 'success',
  'Real code': 'success',
  'Real CI': 'success',
  'Repo-backed': 'success',
  'Demo telemetry': 'warning',
  'Deployable lab': 'info',
  'Design': 'info',
  'Limitation': 'danger',
};

function StatusTag({ value }) {
  return <Tag value={value} severity={statusSeverity[value] || 'info'} />;
}

function RepoPath({ path }) {
  return (
    <a
      href={`${repoBase}${path.replaceAll('\\', '/')}`}
      target="_blank"
      rel="noreferrer"
      className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-200 transition-colors hover:bg-blue-500/20"
    >
      {path}
    </a>
  );
}

const proofPillars = [
  { label: 'Detection-as-Code', status: 'Repo-backed', path: 'sentinel-detection-pack/rules-yaml' },
  { label: 'Sentinel + KQL', status: 'Real code', path: 'sentinel-detection-pack/rules' },
  { label: 'Terraform Cloud Security', status: 'Real IaC', path: 'terraform' },
  { label: 'SOAR + Drift Detection', status: 'Design', path: '.github/workflows/drift-detection.yaml' },
];

const scorecards = [
  {
    title: 'Sentinel Detection Engineering',
    status: 'Real code',
    built: '16 KQL/YAML scheduled analytics rules with MITRE, severity, entity mappings, and tuning comments.',
    paths: ['sentinel-detection-pack/rules-yaml', 'sentinel-detection-pack/rules'],
    talkingPoint: 'I treat detections as deployable code, not portal-only artifacts.',
  },
  {
    title: 'Cloud Security / Terraform',
    status: 'Real IaC',
    built: 'Sentinel core, AWS CloudTrail connector, SOAR shell, Azure Policy examples, and honeypot lab modules.',
    paths: ['terraform/main.tf', 'terraform-aws-connector/main.tf', 'terraform-policy/main.tf'],
    talkingPoint: 'The repo shows prevention, logging, and detection infrastructure together.',
  },
  {
    title: 'DevSecOps Pipeline',
    status: 'Real CI',
    built: 'GitHub Actions security scans, rule validation, bundle artifact generation, deploy path, and drift workflow.',
    paths: ['.github/workflows/sentinel-ci-cd.yaml', '.github/workflows/drift-detection.yaml'],
    talkingPoint: 'Security gates run before Sentinel deployment, and drift is treated as an incident workflow.',
  },
  {
    title: 'SOAR Automation',
    status: 'Design',
    built: 'Logic App infrastructure shell and UI playbook visualization for containment workflow discussion.',
    paths: ['terraform-soar/main.tf', 'sentinel-detection-pack/ui/src/components/SoarDashboard.jsx'],
    talkingPoint: 'I would keep destructive containment behind approval until tested and scoped in a real tenant.',
  },
  {
    title: 'Evidence & Documentation',
    status: 'Repo-backed',
    built: 'README truth table, source-rendered IaC pages, architecture pages, and explicit limitations.',
    paths: ['README.md', 'sentinel-detection-pack/README.md'],
    talkingPoint: 'The project is positioned as a reviewable lab, with demo data labelled instead of hidden.',
  },
];

const realityRows = [
  { area: 'Sentinel IaC', status: 'Real IaC', notes: 'Deployable with Azure subscription, variables, and credentials.' },
  { area: 'KQL/YAML rules', status: 'Real code', notes: 'Repo-backed rules under rules/ and rules-yaml/.' },
  { area: 'Go deployer', status: 'Real code', notes: 'Dry-run/apply path uses DefaultAzureCredential.' },
  { area: 'CI/CD gates', status: 'Real CI', notes: 'GitHub Actions define scans, validation, bundling, and deploy path.' },
  { area: 'UI telemetry', status: 'Demo telemetry', notes: 'Used for reviewer flow unless a page says API-backed.' },
  { area: 'Detection assertion', status: 'Limitation', notes: 'Mock/local until live Sentinel validation is implemented.' },
  { area: 'SOAR response', status: 'Design', notes: 'Human-reviewed containment pattern until tested in a tenant.' },
];

const architectureNodes = [
  { id: 'repo', position: { x: 0, y: 120 }, data: { title: 'GitHub Repository', status: 'Repo-backed', path: 'sentinel-detection-pack/rules-yaml', why: 'Version-controlled detections and infrastructure.' }, type: 'review' },
  { id: 'ci', position: { x: 260, y: 120 }, data: { title: 'GitHub Actions CI/CD', status: 'Real CI', path: '.github/workflows/sentinel-ci-cd.yaml', why: 'Validates rules, scans IaC, and bundles artifacts.' }, type: 'review' },
  { id: 'tf', position: { x: 520, y: 10 }, data: { title: 'Terraform Modules', status: 'Real IaC', path: 'terraform/main.tf', why: 'Defines Sentinel and cloud security infrastructure.' }, type: 'review' },
  { id: 'law', position: { x: 800, y: 10 }, data: { title: 'Log Analytics Workspace', status: 'Deployable lab', path: 'terraform/main.tf', why: 'Telemetry lands here before Sentinel analytics.' }, type: 'review' },
  { id: 'sentinel', position: { x: 800, y: 170 }, data: { title: 'Microsoft Sentinel / Defender Portal', status: 'Deployable lab', path: 'src-cli/deployer.go', why: 'Scheduled rules become operational detections.' }, type: 'review' },
  { id: 'aws', position: { x: 520, y: 280 }, data: { title: 'AWS CloudTrail Connector', status: 'Real IaC', path: 'terraform-aws-connector/main.tf', why: 'Shows multi-cloud logging and cross-account trust.' }, type: 'review' },
  { id: 'soar', position: { x: 1080, y: 170 }, data: { title: 'SOAR Logic App', status: 'Design', path: 'terraform-soar/main.tf', why: 'Human-reviewable containment pattern.' }, type: 'review' },
  { id: 'drift', position: { x: 260, y: 300 }, data: { title: 'Drift Detection Issues', status: 'Real CI', path: '.github/workflows/drift-detection.yaml', why: 'ClickOps drift becomes a tracked issue.' }, type: 'review' },
  { id: 'ui', position: { x: 1080, y: 20 }, data: { title: 'UI Evidence Layer', status: 'Demo telemetry', path: 'sentinel-detection-pack/ui/src/components/ReviewerMode.jsx', why: 'Guides reviewers to proof paths and limitations.' }, type: 'review' },
];

const architectureEdges = [
  ['repo', 'ci', 'validate + bundle'],
  ['ci', 'tf', 'scan IaC'],
  ['tf', 'law', 'provision'],
  ['law', 'sentinel', 'workspace'],
  ['ci', 'sentinel', 'deploy rules'],
  ['aws', 'sentinel', 'CloudTrail pattern'],
  ['sentinel', 'soar', 'incident trigger'],
  ['ci', 'drift', 'nightly plan'],
  ['sentinel', 'ui', 'evidence/API optional'],
].map(([source, target, label]) => ({
  id: `${source}-${target}`,
  source,
  target,
  label,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
  style: { stroke: '#64748b', strokeWidth: 1.6 },
  labelStyle: { fill: '#cbd5e1', fontSize: 10 },
  labelBgStyle: { fill: '#0f172a' },
}));

function ReviewNode({ data }) {
  return (
    <div className="w-56 rounded-xl border border-dark-600 bg-dark-900/95 p-3 shadow-lg">
      <Handle type="target" position={Position.Left} className="!border-0 !bg-blue-400" />
      <div className="font-semibold text-gray-100">{data.title}</div>
      <div className="mt-2"><StatusTag value={data.status} /></div>
      <div className="mt-2 text-xs text-gray-400">{data.why}</div>
      <div className="mt-2 truncate font-mono text-[10px] text-blue-300">{data.path}</div>
      <Handle type="source" position={Position.Right} className="!border-0 !bg-blue-400" />
    </div>
  );
}

const nodeTypes = { review: ReviewNode };

const detectionFlow = [
  { status: 'YAML Rule', opposite: 'rules-yaml/identity/EntraID_Password_Spray.yaml', icon: 'pi pi-file', color: '#3b82f6' },
  { status: 'Validation Script', opposite: 'scripts/validate-rules.sh', icon: 'pi pi-check-circle', color: '#10b981' },
  { status: 'Bundle Artifact', opposite: 'sentinel-detection-pack/bundles', icon: 'pi pi-box', color: '#f59e0b' },
  { status: 'Go CLI Dry-run/Apply', opposite: 'src-cli/deployer.go', icon: 'pi pi-code', color: '#8b5cf6' },
  { status: 'Sentinel Scheduled Rule', opposite: 'Requires configured workspace', icon: 'pi pi-shield', color: '#06b6d4' },
  { status: 'Alert / Incident / SOAR', opposite: 'Optional live validation', icon: 'pi pi-sitemap', color: '#ef4444' },
];

const ciRows = [
  { gate: 'Gitleaks', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'Secret scanning before validation/deploy', status: 'Real CI' },
  { gate: 'TFSec', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'IaC scan across Terraform modules', status: 'Real CI' },
  { gate: 'Trivy', file: '.github/workflows/sentinel-ci-cd.yaml', proof: 'Filesystem and config scanning', status: 'Real CI' },
  { gate: 'Rule validation', file: 'scripts/validate-rules.sh', proof: 'Metadata and sample-data checks in CI', status: 'Real code' },
  { gate: 'Detection assertion', file: 'scripts/assert-detection.py', proof: 'Currently mock/local unless live mode is added', status: 'Limitation' },
  { gate: 'Drift detection', file: '.github/workflows/drift-detection.yaml', proof: 'Terraform detailed exit code creates issue on drift', status: 'Real CI' },
];

const limitations = [
  'Some UI telemetry is demo data so reviewers can see the journey without a paid 24/7 lab.',
  'Detection assertion is mock/local unless live Sentinel validation is explicitly enabled.',
  'No external penetration test, SOC certification, production SLA, or autonomous containment claim is made.',
  'SOAR containment is a lab pattern until tested in a configured tenant with approval and rollback controls.',
  'Public threat-intel feeds may fail due to browser/CORS restrictions and fall back to demo data.',
];

export default function ReviewerMode() {
  const rules = rulesData.rules || [];
  const passwordSpray = rules.find((rule) => rule.id === '0710c724-a738-4b0f-af52-947ba4f01c0d') || rules.find((rule) => rule.name?.includes('Password Spray')) || {};

  const severityRows = useMemo(() => {
    const counts = rules.reduce((acc, rule) => {
      acc[rule.severity] = (acc[rule.severity] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
  }, [rules]);

  const dataSources = useMemo(() => {
    const sourceSet = new Set();
    rules.forEach((rule) => (rule.dataSources || rule.dataTypes || []).forEach((source) => sourceSet.add(source)));
    return [...sourceSet].slice(0, 8);
  }, [rules]);

  const mitreCoverage = useMemo(() => {
    const tacticSet = new Set();
    const techniqueSet = new Set();
    rules.forEach((rule) => {
      (rule.tactics || []).forEach((tactic) => tacticSet.add(tactic));
      (rule.techniques || []).forEach((technique) => techniqueSet.add(technique));
    });
    return { tactics: tacticSet.size, techniques: techniqueSet.size };
  }, [rules]);

  const rulePath = 'sentinel-detection-pack/rules-yaml/identity/EntraID_Password_Spray.yaml';
  const kqlPath = 'sentinel-detection-pack/rules/identity/EntraID_Password_Spray.kql';

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-dark-900 to-purple-950/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Cloud Security Reviewer Mode</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Microsoft Sentinel Cloud Security Detection Engineering Lab
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              A portfolio-grade lab showing how Sentinel detections, Terraform cloud security infrastructure, CI/CD gates,
              drift detection, and SOAR response design fit together with honest evidence labels.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusTag value="Repo-backed" />
              <StatusTag value="Demo telemetry" />
              <StatusTag value="Deployable lab" />
              <StatusTag value="Limitation" />
            </div>
          </div>
          <div className="grid min-w-[260px] gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            {proofPillars.map((pillar) => (
              <div key={pillar.label} className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-100">{pillar.label}</div>
                  <div className="font-mono text-[11px] text-gray-500">{pillar.path}</div>
                </div>
                <StatusTag value={pillar.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviewer Scorecard</h2>
          <p className="text-gray-400">What was built, where to inspect it, and how to talk about it without overclaiming.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {scorecards.map((item) => (
            <Card key={item.title} className="border border-dark-700 bg-dark-900">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-100">{item.title}</h3>
                  <StatusTag value={item.status} />
                </div>
                <p className="text-sm text-gray-400">{item.built}</p>
                <div className="flex flex-wrap gap-2">
                  {item.paths.map((path) => <RepoPath key={path} path={path} />)}
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-100">
                  {item.talkingPoint}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card title="Real vs Simulated" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={realityRows} className="p-datatable-sm">
          <Column field="area" header="Area" />
          <Column header="Status" body={(row) => <StatusTag value={row.status} />} />
          <Column field="notes" header="Notes" />
        </DataTable>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Architecture Narrative</h2>
          <p className="text-gray-400">Each node includes its status, proof path, and why it matters for cloud security.</p>
        </div>
        <div className="h-[540px] overflow-hidden rounded-xl border border-dark-700 bg-dark-950">
          <ReactFlow
            nodes={architectureNodes}
            edges={architectureEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            minZoom={0.35}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Background color="#1e293b" gap={22} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Detection-as-Code Flow" className="border border-dark-700 bg-dark-900 shadow-xl">
          <Timeline
            value={detectionFlow}
            align="alternate"
            marker={(item) => (
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: item.color }}>
                <i className={item.icon} />
              </span>
            )}
            content={(item) => (
              <div className="rounded-lg border border-dark-700 bg-dark-950 p-3">
                <div className="font-semibold text-gray-100">{item.status}</div>
                <div className="mt-1 font-mono text-xs text-blue-300">{item.opposite}</div>
              </div>
            )}
          />
        </Card>
        <Card title="Rule Coverage Snapshot" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4 text-center">
              <div className="text-xs uppercase text-gray-500">Rules</div>
              <div className="text-3xl font-black text-blue-300">{rules.length}</div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4 text-center">
              <div className="text-xs uppercase text-gray-500">Tactics</div>
              <div className="text-3xl font-black text-purple-300">{mitreCoverage.tactics}</div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4 text-center">
              <div className="text-xs uppercase text-gray-500">Techniques</div>
              <div className="text-3xl font-black text-emerald-300">{mitreCoverage.techniques}</div>
            </div>
          </div>
          <DataTable value={severityRows} className="p-datatable-sm mt-4">
            <Column field="severity" header="Severity" body={(row) => <Tag value={row.severity} severity={row.severity === 'High' ? 'danger' : row.severity === 'Medium' ? 'warning' : 'info'} />} />
            <Column field="count" header="Count" />
          </DataTable>
          <div className="mt-4 flex flex-wrap gap-2">
            {dataSources.map((source) => <Tag key={source} value={source} severity="info" />)}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Flagship Scenario: Entra ID Password Spray</h2>
          <p className="text-gray-400">A senior reviewer can evaluate the detection logic, expected entities, triage path, and response tradeoffs.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border border-dark-700 bg-dark-900">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag value={passwordSpray.severity || 'High'} severity="danger" />
                {(passwordSpray.tactics || []).map((tactic) => <Tag key={tactic} value={tactic} severity="info" />)}
                {(passwordSpray.techniques || []).map((technique) => <Tag key={technique} value={technique} severity="warning" />)}
              </div>
              <p className="text-gray-300">
                An attacker attempts many username/password combinations from one source IP. The detection identifies invalid
                credential outcomes across distinct accounts in Entra ID SigninLogs.
              </p>
              <div className="grid gap-3 text-sm">
                <div><strong className="text-gray-100">Data source:</strong> SigninLogs</div>
                <div><strong className="text-gray-100">Frequency/lookback:</strong> {passwordSpray.queryFrequency || 'PT5M'} / {passwordSpray.queryPeriod || 'PT1H'}</div>
                <div><strong className="text-gray-100">Threshold:</strong> {passwordSpray.triggerOperator || 'GreaterThan'} {passwordSpray.triggerThreshold ?? 0}</div>
                <div><strong className="text-gray-100">Expected entities:</strong> PrimaryAccount, IPAddress</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <RepoPath path={rulePath} />
                <RepoPath path={kqlPath} />
              </div>
            </div>
          </Card>
          <Card title="KQL Excerpt" className="border border-dark-700 bg-dark-900">
            <pre className="max-h-[360px] overflow-auto rounded-lg border border-dark-700 bg-black/50 p-4 text-xs text-emerald-200">
              {(passwordSpray.query || '').split('\n').slice(0, 24).join('\n')}
            </pre>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Triage', 'Confirm source IP ownership, targeted accounts, client app, and user agent patterns.'],
            ['False positives', 'Shared VPN/proxy egress, stale app credentials, authorized load testing.'],
            ['Response', 'Enforce MFA/Conditional Access, reset credentials if confirmed, block source IP when appropriate.'],
            ['Tradeoff', 'Lower thresholds detect faster but increase noisy enterprise egress false positives.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-dark-700 bg-dark-900 p-4">
              <div className="font-bold text-gray-100">{title}</div>
              <p className="mt-2 text-sm text-gray-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card title="Cloud Security Controls" className="border border-dark-700 bg-dark-900">
          <div className="grid gap-3">
            {[
              ['Sentinel core', 'Log Analytics workspace, Sentinel enablement, retention/cost considerations.', 'terraform/main.tf'],
              ['AWS CloudTrail', 'KMS encryption, S3 public access block, validation, scoped trust pattern.', 'terraform-aws-connector/main.tf'],
              ['Identity governance', 'GitHub OIDC instead of long-lived deployment secrets.', '.github/workflows/sentinel-ci-cd.yaml'],
              ['Drift detection', 'Terraform plan detailed exit code creates issue when state diverges.', '.github/workflows/drift-detection.yaml'],
              ['Azure Policy', 'Deny/audit guardrail examples for posture management.', 'terraform-policy/main.tf'],
            ].map(([title, detail, path]) => (
              <div key={title} className="rounded-lg border border-dark-700 bg-dark-950 p-3">
                <div className="font-semibold text-gray-100">{title}</div>
                <div className="my-2 text-sm text-gray-400">{detail}</div>
                <RepoPath path={path} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="CI/CD Evidence" className="border border-dark-700 bg-dark-900">
          <DataTable value={ciRows} className="p-datatable-sm">
            <Column field="gate" header="Gate" />
            <Column header="Status" body={(row) => <StatusTag value={row.status} />} />
            <Column field="proof" header="What it proves" />
            <Column header="Path" body={(row) => <RepoPath path={row.file} />} />
          </DataTable>
        </Card>
      </section>

      <Card title="Limitations" className="border border-red-500/30 bg-red-950/10">
        <div className="grid gap-3 md:grid-cols-2">
          {limitations.map((item) => (
            <div key={item} className="flex gap-3 rounded-lg border border-red-500/20 bg-black/20 p-3 text-sm text-red-100">
              <i className="pi pi-exclamation-triangle mt-0.5 text-red-300" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
