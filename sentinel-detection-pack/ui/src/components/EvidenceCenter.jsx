import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { evidenceCatalog } from '../data/evidenceCatalog';
import { projectFacts } from '../data/projectFacts';
import { ciRows as journeyCiRows } from '../data/reviewerJourney';
import EvidenceCard from './shared/EvidenceCard';
import StatusTag from './shared/StatusTag';
import SectionHeader from './shared/SectionHeader';
import RealVsSimulatedTable from './shared/RealVsSimulatedTable';
import LimitationsPanel from './shared/LimitationsPanel';

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

function artifactMarker() {
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
  const verifiedProof = evidenceCatalog.filter((item) => ['real-iac', 'real-code', 'real-ci'].includes(item.status));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-dark-900 to-purple-950/30 p-8 shadow-2xl">
        <div className="max-w-3xl">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Evidence</div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Repo-backed proof for {projectFacts.shortName}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">
            Verified source files first, then CI validation summaries, then demo/planned items.
            Every claim links to a path you can inspect in GitHub.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag value="Repo-backed proof" severity="success" />
            <Tag value="Demo data labelled" severity="warning" />
            <Tag value="Not a production SOC" severity="danger" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Verified proof cards"
          description="Real IaC, real code, and real CI — inspect these files first."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {verifiedProof.map((item) => <EvidenceCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="CI validation and detection validation"
          description="What the pipeline proves today and where validation is still mock/local."
        />
        <Card className="border border-dark-700 bg-dark-900">
          <DataTable value={journeyCiRows} className="p-datatable-sm">
            <Column field="gate" header="Gate" />
            <Column header="Status" body={(row) => <StatusTag value={row.status} />} />
            <Column field="proof" header="What it proves" />
            <Column
              header="Path"
              body={(row) => (
                <a
                  href={`${projectFacts.repoUrl}/blob/main/${row.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-blue-300 hover:text-blue-200"
                >
                  {row.file}
                </a>
              )}
            />
          </DataTable>
        </Card>
      </section>

      <RealVsSimulatedTable title="Real vs Demo inventory" />

      <section className="space-y-4">
        <SectionHeader
          title="Interview talking points"
          description="Quick reference for what to say about each area. Full skills matrix lives on Interview Prep."
          action={(
            <Link to="/interview" className="text-sm text-blue-300 hover:text-blue-200">
              Interview Prep →
            </Link>
          )}
        />
        <Card className="border border-dark-700 bg-dark-900">
          <DataTable value={evidenceCatalog} className="p-datatable-sm" rows={8} paginator>
            <Column field="title" header="Area" className="font-semibold text-blue-200" />
            <Column header="Status" body={(row) => <StatusTag status={row.status} />} />
            <Column field="cloudSecuritySkill" header="Skill" />
            <Column field="interviewTalkingPoint" header="Talking point" />
          </DataTable>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Demo, planned, and limitation items"
          description="Secondary evidence — clearly labelled and not presented as live production proof."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {evidenceCatalog
            .filter((item) => !['real-iac', 'real-code', 'real-ci'].includes(item.status))
            .map((item) => (
              <EvidenceCard key={item.id} item={item} />
            ))}
        </div>
      </section>

      <LimitationsPanel id="limitations" />

      <section className="space-y-4">
        <SectionHeader
          title="Missing screenshots and optional live-lab evidence"
          description="Placeholder paths for sanitized tenant screenshots. This page does not fake cloud portal captures."
        />
        <Card className="border border-dark-700 bg-dark-900">
          <Timeline value={evidenceArtifacts} marker={artifactMarker} content={artifactContent} />
        </Card>
      </section>
    </div>
  );
}
