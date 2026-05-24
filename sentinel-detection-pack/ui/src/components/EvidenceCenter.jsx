import React from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { evidenceCatalog, evidenceStatusLabels } from '../data/evidenceCatalog';
import { projectFacts, realVsSimulated, statusSeverity } from '../data/projectFacts';

const repoBase = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

const evidenceArtifacts = [
  {
    title: 'Sentinel enabled in workspace',
    path: 'evidence/azure/sentinel-enabled.example.png',
    status: 'Evidence missing',
    proves: 'Microsoft Sentinel was enabled against the lab workspace.',
  },
  {
    title: 'Analytics rules deployed',
    path: 'evidence/azure/analytics-rules-deployed.example.png',
    status: 'Evidence missing',
    proves: 'YAML/KQL rules were deployed into Sentinel or Defender portal.',
  },
  {
    title: 'CI pipeline success',
    path: 'evidence/github/ci-pipeline-success.example.png',
    status: 'Evidence missing',
    proves: 'Validation, scans, tests, and UI build completed in GitHub Actions.',
  },
  {
    title: 'Drift issue example',
    path: 'evidence/github/drift-issue.example.png',
    status: 'Evidence missing',
    proves: 'Terraform drift was converted into a tracked work item.',
  },
  {
    title: 'Logic App run history',
    path: 'evidence/azure/logic-app-run-history.example.png',
    status: 'Evidence missing',
    proves: 'SOAR playbook execution was tested in a configured tenant.',
  },
];

const proofSummary = [
  { label: 'Sentinel rules', value: `${projectFacts.counts.sentinelRules}+`, detail: 'YAML and KQL Detection-as-Code' },
  { label: 'Terraform modules', value: projectFacts.counts.terraformModules, detail: 'Azure, AWS, SOAR, policy, honeypot' },
  { label: 'Go deployer', value: '1', detail: 'Dry-run, apply, explain, JSON validation' },
  { label: 'CI workflows', value: projectFacts.counts.workflows, detail: 'CI/CD and drift detection' },
  { label: 'Sample scenarios', value: '5+', detail: 'Positive and benign JSONL telemetry' },
  { label: 'Evidence mode', value: 'On', detail: 'Claims are labelled Real, Demo, Planned, or Limitation' },
];

function statusLabel(status) {
  return evidenceStatusLabels[status] || status;
}

function StatusTag({ status }) {
  const label = statusLabel(status);
  return <Tag value={label} severity={statusSeverity[label] || (label.includes('missing') ? 'warning' : 'info')} />;
}

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

function artifactMarker(item) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-400/10 text-yellow-300">
      <i className="pi pi-image" />
    </span>
  );
}

function artifactContent(item) {
  return (
    <div className="mb-4 rounded-xl border border-dark-700 bg-dark-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-100">{item.title}</div>
          <div className="mt-1 text-sm text-gray-400">{item.proves}</div>
        </div>
        <Tag value={item.status} severity="warning" />
      </div>
      <div className="mt-3 rounded border border-dashed border-gray-700 bg-dark-900 p-3 font-mono text-xs text-gray-500">
        {item.path}
      </div>
    </div>
  );
}

export default function EvidenceCenter() {
  const realEvidence = evidenceCatalog.filter((item) => ['real-iac', 'real-code', 'real-ci'].includes(item.status));
  const demoOrLimitations = evidenceCatalog.filter((item) => !['real-iac', 'real-code', 'real-ci'].includes(item.status));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-dark-900 to-purple-950/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Evidence Center</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              What Jason actually built, and where the proof lives
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              A file-backed reviewer page for {projectFacts.name}. It separates repo-backed work, demo telemetry, planned patterns,
              and missing external screenshots so the project is impressive without overstating evidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Tag value="Repo-backed proof" severity="success" />
              <Tag value="Demo data labelled" severity="warning" />
              <Tag value="Missing screenshots shown honestly" severity="info" />
              <Tag value="Not a production SOC" severity="danger" />
            </div>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-3">
            {proofSummary.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-xl border border-dark-700 bg-dark-950/80 p-4">
                <div className="text-xs uppercase text-gray-500">{item.label}</div>
                <div className="mt-1 text-3xl font-black text-blue-300">{item.value}</div>
                <div className="mt-1 text-xs text-gray-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {proofSummary.map((item) => (
          <div key={item.label} className="rounded-xl border border-dark-700 bg-dark-900 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
            <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
            <div className="mt-2 text-sm text-gray-400">{item.detail}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">File-Backed Proof Cards</h2>
          <p className="mt-1 text-gray-400">Each card points to source files a reviewer can inspect.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {realEvidence.map((item) => (
            <Card key={item.id} className="border border-dark-700 bg-dark-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.summary}</p>
                </div>
                <StatusTag status={item.status} />
              </div>
              <Divider />
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Skill demonstrated</div>
                  <div className="text-sm text-gray-200">{item.cloudSecuritySkill}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Repo files</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.repoPaths.map((path) => <RepoPath key={path} path={path} />)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">What a reviewer should notice</div>
                  <div className="text-sm text-gray-200">{item.interviewTalkingPoint}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card title="Evidence Timeline" className="border border-dark-700 bg-dark-900 xl:col-span-2">
          <p className="mb-5 text-sm text-gray-400">
            External screenshots are placeholders until sanitized evidence is captured. This page does not fake cloud screenshots.
          </p>
          <Timeline value={evidenceArtifacts} marker={artifactMarker} content={artifactContent} />
        </Card>

        <Card title="Demo, Planned, and Limitations" className="border border-dark-700 bg-dark-900">
          <div className="space-y-4">
            {demoOrLimitations.map((item) => (
              <div key={item.id} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-100">{item.title}</div>
                  <StatusTag status={item.status} />
                </div>
                <p className="text-sm text-gray-400">{item.summary}</p>
                <div className="mt-3 text-xs text-gray-500">{item.limitations[0]}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card title="Real vs Demo Inventory" className="border border-dark-700 bg-dark-900">
        <DataTable value={realVsSimulated} className="p-datatable-sm">
          <Column field="area" header="Area" className="font-semibold text-gray-100" />
          <Column header="Status" body={(row) => <Tag value={row.status} severity={statusSeverity[row.status] || 'info'} />} />
          <Column field="notes" header="Notes" />
        </DataTable>
      </Card>

      <Card title="Interview Talking Points" className="border border-dark-700 bg-dark-900">
        <DataTable value={evidenceCatalog} className="p-datatable-sm" rows={8}>
          <Column field="title" header="Area" className="font-semibold text-blue-200" />
          <Column header="Status" body={(row) => <StatusTag status={row.status} />} />
          <Column field="cloudSecuritySkill" header="Skill" />
          <Column field="interviewTalkingPoint" header="Talking Point" />
        </DataTable>
      </Card>
    </div>
  );
}
