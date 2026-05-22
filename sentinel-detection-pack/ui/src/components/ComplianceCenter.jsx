import React, { useMemo } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';

const outcomes = [
  { label: 'Controls mapped', value: '20+', sub: 'CIS Azure + NIST CSF' },
  { label: 'HIGH/CRITICAL fixed', value: '5', sub: 'IaC findings remediated' },
  { label: 'Secrets removed', value: '1', sub: 'scrubbed from git history' },
  { label: 'Blast radius cut', value: 'Sub → RG', sub: 'SOAR RBAC re-scoped' },
];

const nistFunctions = [
  {
    fn: 'Identify',
    pct: 85,
    color: 'bg-blue-500',
    controls: ['IaC asset inventory (terraform/*)', 'Nightly Terraform drift detection', 'Cloud posture findings'],
  },
  {
    fn: 'Protect',
    pct: 90,
    color: 'bg-emerald-500',
    controls: ['KMS encryption + key rotation', 'S3 public-access block', 'Least-privilege RBAC (RG-scoped)', 'Secrets via random_password + OIDC', 'Shift-left IaC / dependency scanning'],
  },
  {
    fn: 'Detect',
    pct: 80,
    color: 'bg-purple-500',
    controls: ['16 KQL detections (MITRE-mapped)', 'Threat-intel ingestion', 'Detection-as-Code CI assertion'],
  },
  {
    fn: 'Respond',
    pct: 70,
    color: 'bg-orange-500',
    controls: ['SOAR isolate-host playbook', 'Investigation entity graph', 'Per-rule response runbooks'],
  },
  {
    fn: 'Recover',
    pct: 45,
    color: 'bg-cyan-500',
    controls: ['S3 object versioning (tamper / rollback)', 'IaC enables reproducible rebuild'],
  },
];

const statusTag = (status) => {
  const map = { Pass: 'success', Partial: 'warning', Detect: 'info', Gap: 'danger' };
  return <Tag value={status} severity={map[status] || 'info'} />;
};

const cisControls = [
  { id: '1.1', area: 'Identity', control: 'Detect MFA abuse / enforce MFA for privileged users', status: 'Detect', evidence: 'EntraID_MFA_Fatigue.yaml, EntraID_Password_Spray.yaml' },
  { id: '1.22', area: 'Identity', control: 'Least-privilege role assignment', status: 'Pass', evidence: 'terraform-soar/main.tf — RG-scoped Network Contributor' },
  { id: '3.1', area: 'Storage', control: 'Encryption at rest for log storage (CMK)', status: 'Pass', evidence: 'terraform-aws-connector — aws_kms_key + SSE config' },
  { id: '3.6', area: 'Storage', control: 'Block public access to log buckets', status: 'Pass', evidence: 'aws_s3_bucket_public_access_block (all true)' },
  { id: '3.7', area: 'Storage', control: 'Object versioning for tamper protection', status: 'Pass', evidence: 'aws_s3_bucket_versioning' },
  { id: '5.1', area: 'Logging', control: 'Centralized log retention', status: 'Pass', evidence: 'terraform/main.tf — Log Analytics, 90-day retention' },
  { id: '3.10', area: 'Logging', control: 'CloudTrail multi-region + log-file validation', status: 'Pass', evidence: 'aws_cloudtrail — multi-region, log-file validation' },
  { id: '8.1', area: 'Key mgmt', control: 'KMS key rotation enabled', status: 'Pass', evidence: 'aws_kms_key.enable_key_rotation = true' },
  { id: 'CI.1', area: 'DevSecOps', control: 'No secrets in source; IaC scanned pre-merge', status: 'Pass', evidence: 'Gitleaks + TFSec gate (blocking HIGH), random_password' },
  { id: '6.1', area: 'Network', control: 'Restrict NSG ingress / isolate on incident', status: 'Partial', evidence: 'SOAR isolate-host playbook (response control)' },
];

const remediations = [
  { item: 'Honeypot credential', severity: 'CRITICAL', before: 'Plaintext password committed in main.tf', after: 'random_password at apply time; scrubbed from git history' },
  { item: 'CloudTrail S3 bucket', severity: 'HIGH', before: 'No encryption, public-capable, no versioning', after: 'KMS CMK + rotation, public-access block, versioning' },
  { item: 'SOAR identity', severity: 'HIGH', before: 'User Administrator at subscription scope', after: 'Network Contributor scoped to the resource group' },
  { item: 'CI security gate', severity: 'HIGH', before: 'TFSec soft_fail (advisory only)', after: 'Blocking build on HIGH/CRITICAL findings' },
  { item: 'Deployment auth', severity: 'MEDIUM', before: 'Implied static credentials', after: 'OIDC federated credentials — nothing stored' },
];

const sevTag = (sev) => <Tag value={sev} severity={sev === 'CRITICAL' || sev === 'HIGH' ? 'danger' : 'warning'} />;

export default function ComplianceCenter() {
  const overall = useMemo(
    () => Math.round(nistFunctions.reduce((sum, f) => sum + f.pct, 0) / nistFunctions.length),
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
              <i className="pi pi-check-square text-xl" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-teal-200">Compliance &amp; Controls</h1>
              <p className="text-gray-400">
                CIS Microsoft Azure Foundations &amp; NIST CSF coverage, mapped to the controls actually implemented in this repo.
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-teal-300">{overall}%</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">CSF coverage</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {outcomes.map((o) => (
          <div key={o.label} className="rounded-lg border border-dark-700 bg-dark-900 p-4">
            <div className="text-xs uppercase text-gray-400">{o.label}</div>
            <div className="mt-1 text-2xl font-black text-teal-200">{o.value}</div>
            <div className="mt-0.5 text-xs text-gray-500">{o.sub}</div>
          </div>
        ))}
      </div>

      <Card title="NIST Cybersecurity Framework" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {nistFunctions.map((f) => (
            <div key={f.fn} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-100">{f.fn}</span>
                <span className="font-mono text-sm text-gray-300">{f.pct}%</span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-dark-700">
                <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.pct}%` }} />
              </div>
              <ul className="space-y-1">
                {f.controls.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-gray-400">
                    <i className="pi pi-check mt-0.5 text-[10px] text-emerald-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card title="CIS Azure Foundations Benchmark — Control Mapping" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={cisControls} size="small" className="p-datatable-sm" responsiveLayout="scroll">
          <Column field="id" header="#" className="font-mono text-gray-500" />
          <Column field="area" header="Area" />
          <Column field="control" header="Control" className="text-sm" />
          <Column header="Status" body={(row) => statusTag(row.status)} sortable sortField="status" />
          <Column field="evidence" header="Implemented by" className="font-mono text-xs text-blue-300" />
        </DataTable>
        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-200">
          <span className="font-semibold text-blue-300">Detect vs Prevent: </span>
          Controls marked <span className="font-semibold">Detect</span> provide detection coverage, not hard prevention. A
          production rollout pairs them with Azure Policy and Conditional Access for enforcement — the distinction matters when
          you report posture to an auditor.
        </div>
      </Card>

      <Card title="Remediations Applied (before → after)" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="space-y-3">
          {remediations.map((r) => (
            <div key={r.item} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-gray-100">{r.item}</span>
                {sevTag(r.severity)}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded border border-red-500/25 bg-red-500/5 p-3 text-sm">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-red-300">Before</div>
                  <div className="text-gray-400">{r.before}</div>
                </div>
                <div className="rounded border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-emerald-300">After</div>
                  <div className="text-gray-300">{r.after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
