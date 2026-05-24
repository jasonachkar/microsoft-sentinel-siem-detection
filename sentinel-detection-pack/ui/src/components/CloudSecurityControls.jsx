import React from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

const repoBase = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

const controls = [
  {
    area: 'Sentinel core',
    status: 'Real IaC',
    file: 'terraform/main.tf',
    skill: 'Log Analytics workspace, Sentinel enablement, retention and deployment structure.',
  },
  {
    area: 'Azure Policy governance',
    status: 'Real IaC',
    file: 'terraform-policy/main.tf',
    skill: 'Deny/audit controls for storage, public IPs, tags, TLS, diagnostics, and VM encryption.',
  },
  {
    area: 'AWS CloudTrail ingestion pattern',
    status: 'Real IaC',
    file: 'terraform-aws-connector/main.tf',
    skill: 'Multi-cloud logging, S3 control plane log storage, and Sentinel trust design.',
  },
  {
    area: 'GitHub Actions OIDC',
    status: 'Real CI',
    file: '.github/workflows/sentinel-ci-cd.yaml',
    skill: 'Short-lived deployment identity instead of static client secrets.',
  },
  {
    area: 'Security logging design',
    status: 'Repo-backed',
    file: 'docs/security-logging-design.md',
    skill: 'Entra, Azure Activity, Key Vault, AKS, CloudTrail, and future NSG flow log coverage.',
  },
  {
    area: 'Cost control',
    status: 'Repo-backed',
    file: 'docs/cost-control.md',
    skill: 'Sentinel ingestion awareness, teardown workflow, and safe demo mode.',
  },
];

const policyHighlights = [
  'Deny storage without HTTPS secure transfer',
  'Deny public storage network access',
  'Deny anonymous public blob access',
  'Audit public IP resources',
  'Audit weak storage TLS',
  'Audit missing owner/environment tags',
  'Audit Key Vault diagnostic settings',
  'Audit VMs without encryption at host',
];

const posturePillars = [
  { title: 'Posture', icon: 'pi pi-shield', detail: 'Azure Policy and Defender for Cloud guidance make prevention visible.' },
  { title: 'Identity', icon: 'pi pi-key', detail: 'OIDC deployment trust avoids long-lived cloud secrets.' },
  { title: 'Logging', icon: 'pi pi-database', detail: 'Cloud telemetry sources are tied to Sentinel rule coverage.' },
  { title: 'Cost', icon: 'pi pi-dollar', detail: 'Lab mode, retention, teardown, and ingestion routing are explicit.' },
];

const defenderMapping = [
  { task: 'Incidents', location: 'Unified incident queue / Investigation and response' },
  { task: 'Advanced hunting', location: 'Investigation and response > Hunting' },
  { task: 'Analytics rules', location: 'Microsoft Sentinel > Configuration > Analytics' },
  { task: 'Automation', location: 'Microsoft Sentinel > Configuration > Automation' },
  { task: 'Content hub', location: 'Microsoft Sentinel > Content management > Content hub' },
];

function RepoPath({ path }) {
  return (
    <a
      href={`${repoBase}${path.replaceAll('\\', '/')}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-200 hover:bg-blue-500/20"
    >
      {path}
    </a>
  );
}

function statusTemplate(row) {
  const severity = row.status === 'Real IaC' || row.status === 'Real CI' ? 'success' : 'info';
  return <Tag value={row.status} severity={severity} />;
}

function fileTemplate(row) {
  return <RepoPath path={row.file} />;
}

export default function CloudSecurityControls() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-dark-900 to-blue-950/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Cloud Security Controls</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Posture, identity, logging, cost, and detection in one lab story
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              This page connects the Sentinel rule catalog to cloud security engineering work: Terraform-managed controls, Azure Policy,
              OIDC trust, multi-cloud telemetry, Defender guidance, and Security FinOps.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Tag value="Repo-backed controls" severity="success" />
              <Tag value="Defender-aware design" severity="info" />
              <Tag value="Cost-conscious lab" severity="warning" />
              <Tag value="No compliance certification claim" severity="danger" />
            </div>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            {posturePillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-dark-700 bg-dark-950 p-4">
                <i className={`${pillar.icon} text-xl text-emerald-300`} />
                <div className="mt-2 font-semibold text-white">{pillar.title}</div>
                <div className="mt-1 text-xs text-gray-400">{pillar.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card title="Control Evidence Matrix" className="border border-dark-700 bg-dark-900">
        <DataTable value={controls} className="p-datatable-sm">
          <Column field="area" header="Control Area" className="font-semibold text-blue-200" />
          <Column header="Status" body={statusTemplate} />
          <Column header="Proof Path" body={fileTemplate} />
          <Column field="skill" header="What it demonstrates" />
        </DataTable>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Azure Policy Posture Controls" className="border border-dark-700 bg-dark-900">
          <div className="grid gap-3 md:grid-cols-2">
            {policyHighlights.map((control) => (
              <div key={control} className="rounded-lg border border-dark-700 bg-dark-950 p-3 text-sm text-gray-300">
                <i className="pi pi-check-circle mr-2 text-emerald-300" />
                {control}
              </div>
            ))}
          </div>
          <Divider />
          <div className="text-sm text-gray-400">
            Deploy-diagnostics remediation is intentionally documented as a design pattern because workspace IDs, managed identity permissions,
            and target resource scopes are tenant-specific.
          </div>
        </Card>

        <Card title="Defender and Logging Alignment" className="border border-dark-700 bg-dark-900">
          <div className="space-y-4 text-sm text-gray-300">
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="font-semibold text-white">Defender for Cloud</div>
              <p className="mt-1 text-gray-400">Optional plans can feed posture findings and workload alerts into Sentinel/Defender workflows.</p>
              <div className="mt-3"><RepoPath path="docs/defender-for-cloud.md" /></div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="font-semibold text-white">Security logging</div>
              <p className="mt-1 text-gray-400">Entra, Azure Activity, Key Vault, AKS, and CloudTrail are mapped to detection coverage and evidence needs.</p>
              <div className="mt-3"><RepoPath path="docs/security-logging-design.md" /></div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="font-semibold text-white">OIDC identity governance</div>
              <p className="mt-1 text-gray-400">Deployment trust uses short-lived federated credentials instead of static secrets.</p>
              <div className="mt-3"><RepoPath path="docs/identity-governance-oidc.md" /></div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Defender Portal Readiness" className="border border-dark-700 bg-dark-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-3xl text-sm text-gray-400">
            Microsoft Sentinel is generally available in the Microsoft Defender portal, and Microsoft states that Azure portal support
            for Sentinel ends after March 31, 2027. This lab is written as Sentinel / Defender portal-aware rather than Azure-portal-only.
          </p>
          <RepoPath path="docs/defender-portal-transition.md" />
        </div>
        <DataTable value={defenderMapping} className="p-datatable-sm">
          <Column field="task" header="Reviewer Task" className="font-semibold text-blue-200" />
          <Column field="location" header="Defender Portal Mapping" />
        </DataTable>
      </Card>
    </div>
  );
}
