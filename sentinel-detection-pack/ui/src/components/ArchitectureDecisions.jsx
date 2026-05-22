import React from 'react';
import { Tag } from 'primereact/tag';

const decisions = [
  {
    id: 'ADR-0001',
    title: 'OIDC federation over stored cloud credentials',
    area: 'Identity',
    context: 'CI/CD must authenticate to Azure to deploy detections and run drift checks.',
    decision: 'Use GitHub OIDC federated credentials (DefaultAzureCredential / azure-login) instead of long-lived client secrets in GitHub.',
    why: 'No standing secret to leak or rotate; tokens are short-lived and scoped per workflow run.',
    tradeoff: 'Requires federated-credential setup on the app registration — slightly more initial config than a secret.',
  },
  {
    id: 'ADR-0002',
    title: 'Resource-group-scoped RBAC for the SOAR identity',
    area: 'IAM / Least privilege',
    context: 'The isolate-host playbook needs to modify NSGs to contain a compromised host.',
    decision: 'Grant the Logic App managed identity Network Contributor on the SOAR resource group only — not the subscription.',
    why: 'Least privilege: a compromised playbook cannot touch networking outside its blast radius.',
    tradeoff: 'NSGs to be managed must live in (or be delegated to) that resource group.',
  },
  {
    id: 'ADR-0003',
    title: 'Customer-managed KMS over SSE-S3 for CloudTrail',
    area: 'Data protection',
    context: 'CloudTrail logs are security-critical evidence stored in S3.',
    decision: 'Encrypt the bucket and trail with a customer-managed KMS key (rotation enabled) rather than default SSE-S3.',
    why: 'Key custody, rotation and revocation under our control; satisfies CIS / MCSB CMK requirements.',
    tradeoff: 'KMS key + key-policy maintenance and minor per-request cost.',
  },
  {
    id: 'ADR-0004',
    title: 'Detection-as-Code over portal authoring',
    area: 'Detection engineering',
    context: 'Sentinel analytics rules must be reviewable, testable and reproducible.',
    decision: 'Author rules as YAML, validate + assert in CI, deploy via a Go CLI that calls the ARM ScheduledAlertRule API.',
    why: 'Version control, peer review, and Atomic Red Team assertion before any rule is trusted.',
    tradeoff: 'More upfront tooling than clicking in the portal; pays off in repeatability and audit trail.',
  },
  {
    id: 'ADR-0005',
    title: 'Blocking shift-left gate over advisory scanning',
    area: 'DevSecOps',
    context: 'IaC misconfigurations were scanned but never failed the build (soft_fail).',
    decision: 'Fail the pipeline on HIGH/CRITICAL TFSec findings; report MEDIUM/LOW non-blocking.',
    why: 'A gate that cannot fail is decoration; a HIGH threshold keeps signal high and noise low.',
    tradeoff: 'Modules must stay clean; a new HIGH finding blocks merges until fixed — by design.',
  },
  {
    id: 'ADR-0006',
    title: 'Hot/cold SIEM tiering for cost control',
    area: 'FinOps',
    context: 'Sentinel ingestion is billed per GB; verbose bulk logs are expensive in the hot tier.',
    decision: 'Route high-fidelity security data to Sentinel (hot) and bulk/compliance logs to a cold tier (ADX / data lake).',
    why: 'Preserves detection fidelity while materially cutting ingestion cost.',
    tradeoff: 'Cold-tier queries are slower; needs a routing pipeline (Logstash / Cribl).',
  },
  {
    id: 'ADR-0007',
    title: 'Prevention (Azure Policy) paired with detection (Sentinel)',
    area: 'Governance',
    context: 'Detections alert after the fact; some misconfigurations should never be deployable.',
    decision: 'Add Azure Policy deny/audit definitions + the Microsoft Cloud Security Benchmark initiative alongside the KQL detections.',
    why: 'Defense in depth: block at deploy time, detect anything that slips through at runtime.',
    tradeoff: 'Policy can block legitimate edge cases; needs an exemption process.',
  },
];

function Field({ label, children, accent }) {
  return (
    <div>
      <div className={`text-[10px] font-semibold uppercase tracking-wider ${accent}`}>{label}</div>
      <p className="mt-0.5 text-sm text-gray-300">{children}</p>
    </div>
  );
}

export default function ArchitectureDecisions() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
            <i className="pi pi-book text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-200">Architecture Decisions</h1>
            <p className="text-gray-400">
              The reasoning behind the platform — context, decision, why, and the trade-off accepted. Mirrored in
              <span className="font-mono text-gray-300"> docs/adr/</span>.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {decisions.map((d) => (
          <div key={d.id} className="rounded-xl border border-dark-700 bg-dark-900 p-5 shadow-lg">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-300">{d.id}</span>
                <Tag value="Accepted" severity="success" />
              </div>
              <Tag value={d.area} severity="info" />
            </div>
            <h3 className="text-lg font-semibold text-gray-100">{d.title}</h3>
            <div className="mt-3 space-y-3">
              <Field label="Context" accent="text-gray-500">{d.context}</Field>
              <Field label="Decision" accent="text-blue-300">{d.decision}</Field>
              <Field label="Why" accent="text-emerald-300">{d.why}</Field>
              <Field label="Trade-off" accent="text-amber-300">{d.tradeoff}</Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
