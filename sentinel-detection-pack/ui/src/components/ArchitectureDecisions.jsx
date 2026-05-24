import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

const decisions = [
  {
    id: 'ADR-0001',
    title: 'Detection-as-Code YAML schema and Go deployer',
    area: 'Detection engineering',
    file: 'docs/adr/0001-detection-as-code-schema-and-go-deployer.md',
    context: 'Sentinel rules need metadata beyond KQL: entities, custom details, alert overrides, timing, and incident settings.',
    decision: 'Author rules as YAML/KQL and validate/deploy them through a Go CLI with dry-run and validation output.',
    tradeoff: 'More tooling to maintain, but rules become reviewable and testable.',
    security: 'Bad metadata is caught before deployment.',
    operations: 'CI can publish validation reports for reviewer evidence.',
    talkingPoint: 'I modeled investigation quality, not just KQL text.',
  },
  {
    id: 'ADR-0002',
    title: 'Terraform-managed Sentinel infrastructure',
    area: 'Cloud security / IaC',
    file: 'docs/adr/0002-terraform-managed-sentinel-infrastructure.md',
    context: 'The lab needs reproducible infrastructure that can be reviewed and scanned.',
    decision: 'Use Terraform modules for Sentinel, honeypot, SOAR, AWS connector, and policy governance.',
    tradeoff: 'Requires provider setup and state management.',
    security: 'IaC can be scanned and reviewed before deployment.',
    operations: 'Resources can be recreated or torn down intentionally.',
    talkingPoint: 'Portal screenshots are not enough; the architecture has source code.',
  },
  {
    id: 'ADR-0003',
    title: 'GitHub Actions OIDC instead of client secrets',
    area: 'Identity / CI/CD',
    file: 'docs/adr/0003-github-actions-oidc.md',
    context: 'CI needs Azure access without creating long-lived deployment secrets.',
    decision: 'Use GitHub OIDC federation with Azure login and DefaultAzureCredential patterns.',
    tradeoff: 'Federated credentials take more setup than a static secret.',
    security: 'Short-lived tokens reduce secret exposure risk.',
    operations: 'Workflow identity and role assignments must be documented.',
    talkingPoint: 'I designed the pipeline around avoiding standing secrets.',
  },
  {
    id: 'ADR-0004',
    title: 'Scheduled rules before NRT rules',
    area: 'Sentinel engineering',
    file: 'docs/adr/0004-scheduled-rules-vs-nrt-rules.md',
    context: 'NRT can reduce latency, but scheduled rules are richer for tuning and portfolio validation.',
    decision: 'Use scheduled analytics rules first; treat NRT as a future extension for specific use cases.',
    tradeoff: 'Scheduled rules add latency based on frequency/lookback.',
    security: 'Tuning, grouping, and suppression are explicit.',
    operations: 'Rule metadata documents frequency and query period rationale.',
    talkingPoint: 'I prioritized defensible tuning over claiming lowest latency.',
  },
  {
    id: 'ADR-0005',
    title: 'Native tables with ASIM strategy',
    area: 'KQL engineering',
    file: 'docs/adr/0005-native-tables-vs-asim.md',
    context: 'ASIM improves portability, but native Azure tables can be clearer for targeted cloud detections.',
    decision: 'Use native tables where clearer, and document ASIM migration opportunities.',
    tradeoff: 'Native tables can be less portable across tenants.',
    security: 'Required connectors and schema assumptions are documented.',
    operations: 'Future ASIM variants can be added where portability matters.',
    talkingPoint: 'I can explain when ASIM helps and when native fields matter.',
  },
  {
    id: 'ADR-0006',
    title: 'Demo telemetry vs live Sentinel telemetry in UI',
    area: 'Product / evidence',
    file: 'docs/adr/0006-demo-telemetry-vs-live-sentinel-ui.md',
    context: 'The UI must work without an always-on Azure tenant but cannot imply demo data is live.',
    decision: 'Use explicit status badges and evidence models for real code, demo data, planned work, and limitations.',
    tradeoff: 'Truthful labels reduce drama but increase reviewer trust.',
    security: 'No fake operational evidence is presented as proof.',
    operations: 'Optional API pages can be empty without looking broken.',
    talkingPoint: 'I separated evidence from simulation on purpose.',
  },
  {
    id: 'ADR-0007',
    title: 'Drift detection with Terraform plan',
    area: 'Governance',
    file: 'docs/adr/0007-drift-detection-with-terraform-plan.md',
    context: 'Manual cloud changes can bypass IaC review.',
    decision: 'Use scheduled Terraform plan with detailed exit codes and issue creation on drift.',
    tradeoff: 'Requires remote state and cloud credentials to be meaningful live.',
    security: 'Manual changes become a visible security signal.',
    operations: 'Exit codes and issue templates support incidentization.',
    talkingPoint: 'I treat drift as operational security evidence.',
  },
  {
    id: 'ADR-0008',
    title: 'Human-approved SOAR containment',
    area: 'Incident response',
    file: 'docs/adr/0008-human-approved-soar-containment.md',
    context: 'Automated containment can disrupt systems if it targets the wrong entity.',
    decision: 'Model containment as a human-approved Logic App workflow with scoped permissions.',
    tradeoff: 'Human approval adds response latency.',
    security: 'No autonomous containment claim; permissions stay least-privilege.',
    operations: 'Live proof requires sanitized run history and rollback-tested lab targets.',
    talkingPoint: 'I know where automation should stop.',
  },
  {
    id: 'ADR-0009',
    title: 'AWS CloudTrail connector trust model',
    area: 'Multi-cloud logging',
    file: 'docs/adr/0009-aws-cloudtrail-connector-trust-model.md',
    context: 'Cloud security teams need AWS logs in Sentinel without static keys.',
    decision: 'Model CloudTrail, hardened S3 storage, and IAM AssumeRole trust scoped by external ID.',
    tradeoff: 'Live use requires tenant-specific connector values.',
    security: 'External ID and hardened log storage reduce trust and evidence risks.',
    operations: 'The module remains reviewable even without live AWS deployment.',
    talkingPoint: 'I can explain the cross-cloud logging trust boundary.',
  },
  {
    id: 'ADR-0010',
    title: 'Defender portal alignment',
    area: 'Sentinel operations',
    file: 'docs/adr/0010-defender-portal-alignment.md',
    context: 'Microsoft Sentinel operations are moving into the Microsoft Defender portal.',
    decision: 'Use Sentinel / Defender portal-aware wording and mapping.',
    tradeoff: 'Docs must handle tenants still using Azure portal screens.',
    security: 'Incident, hunting, automation, and content-hub language stays current.',
    operations: 'Evidence screenshots may come from either portal depending on tenant setup.',
    talkingPoint: 'I am aware of Microsoft Sentinel direction in 2026/2027.',
  },
  {
    id: 'ADR-0011',
    title: 'Cost-control strategy for portfolio lab',
    area: 'Security FinOps',
    file: 'docs/adr/0011-cost-control-strategy.md',
    context: 'Sentinel ingestion and retention cost can get expensive in a personal lab.',
    decision: 'Default to demo mode, document teardown, and show hot/cold routing concepts.',
    tradeoff: 'Always-on live telemetry would look flashier but cost more and risk empty data.',
    security: 'Cost-aware logging is less likely to be disabled later.',
    operations: 'Live validation should be intentional, captured, and torn down.',
    talkingPoint: 'Security architecture has budget constraints.',
  },
  {
    id: 'ADR-0012',
    title: 'Evidence-first portfolio UI design',
    area: 'Reviewer experience',
    file: 'docs/adr/0012-evidence-first-portfolio-ui.md',
    context: 'Reviewers need to understand the project quickly without reverse-engineering the repo.',
    decision: 'Make Start Here, Evidence, and Interview Prep primary experiences.',
    tradeoff: 'Evidence-first UX is less flashy than a generic command center.',
    security: 'Claims are tied to proof paths, docs, tests, or limitations.',
    operations: 'Screenshots and artifacts can be added over time without changing the UX model.',
    talkingPoint: 'The UI answers what was actually built and where the proof is.',
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
              Engineering tradeoffs behind the lab. Full records live in <span className="font-mono text-gray-300">docs/adr/</span>.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {decisions.map((d) => (
          <Card key={d.id} className="border border-dark-700 bg-dark-900 shadow-lg">
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
              <Field label="Tradeoff" accent="text-amber-300">{d.tradeoff}</Field>
              <Field label="Security" accent="text-emerald-300">{d.security}</Field>
              <Field label="Operations" accent="text-cyan-300">{d.operations}</Field>
              <Field label="Interview talking point" accent="text-purple-300">{d.talkingPoint}</Field>
              <div className="rounded border border-dark-700 bg-dark-950 px-3 py-2 font-mono text-xs text-gray-500">
                {d.file}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
