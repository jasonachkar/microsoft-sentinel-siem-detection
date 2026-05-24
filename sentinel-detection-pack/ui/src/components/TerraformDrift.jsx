import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { telemetryEngine } from '../services/telemetryEngine';

const repoBase = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

const runResultTag = (result) => {
  const map = {
    success: { severity: 'success', label: 'SUCCESS' },
    drift: { severity: 'warning', label: 'DRIFT' },
    failed: { severity: 'danger', label: 'FAILED' },
  };
  const cfg = map[result] || { severity: 'info', label: result.toUpperCase() };
  return <Tag value={cfg.label} severity={cfg.severity} />;
};

const logColor = {
  ok: 'text-emerald-300',
  step: 'text-blue-300',
  info: 'text-gray-400',
  warn: 'text-yellow-300',
};

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

export default function TerraformDrift() {
  const [report] = useState(() => telemetryEngine.generateDriftReport());
  const [runs] = useState(() => telemetryEngine.generatePipelineRuns());
  const [deployLog] = useState(() => telemetryEngine.generateDeployerLog());

  const summary = useMemo(() => {
    const drifted = report.resources.filter((r) => r.state === 'Drift Detected');
    return {
      tracked: report.resources.length,
      synced: report.resources.length - drifted.length,
      drifted: drifted.length,
    };
  }, [report.resources]);

  const stateTemplate = (row) => (
    <Tag
      value={row.state}
      severity={row.state === 'Synced' ? 'success' : 'warning'}
      icon={row.state === 'Synced' ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
    />
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <i className="pi pi-sync text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-violet-200">CI/CD &amp; Drift Demo</h1>
            <p className="text-gray-400">
              Repo-backed nightly Terraform drift workflow with sample resource state and sample incidentization output.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag value="Workflow is real CI" severity="success" />
              <Tag value="Resource table is demo data" severity="warning" />
              <Tag value="Requires remote state secrets" severity="info" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-gray-500">
          <span>last drift check: {new Date(report.lastCheck).toLocaleString()}</span>
          <span>next: {report.nextCheck}</span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
          <div className="mb-1 text-xs uppercase text-gray-400">Resources Tracked</div>
          <div className="text-3xl font-black text-blue-300">{summary.tracked}</div>
        </div>
        <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
          <div className="mb-1 text-xs uppercase text-gray-400">In Sync</div>
          <div className="text-3xl font-black text-emerald-300">{summary.synced}</div>
        </div>
        <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
          <div className="mb-1 text-xs uppercase text-gray-400">Drift Detected</div>
          <div className="text-3xl font-black text-yellow-300">{summary.drifted}</div>
        </div>
      </div>

      <Card title="Workflow Proof Paths" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="mb-2 text-sm font-semibold text-gray-200">Workflow</div>
            <RepoPath path=".github/workflows/drift-detection.yaml" />
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="mb-2 text-sm font-semibold text-gray-200">Runbook</div>
            <RepoPath path="docs/drift-detection.md" />
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="mb-2 text-sm font-semibold text-gray-200">Sample issue</div>
            <RepoPath path="docs/samples/drift-incident-example.md" />
          </div>
        </div>
      </Card>

      <Card title="Sample Drift State" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={report.resources} size="small" responsiveLayout="scroll" className="p-datatable-sm">
          <Column field="name" header="Resource" className="font-mono text-blue-300" />
          <Column field="type" header="Type" className="text-sm text-gray-400" />
          <Column field="module" header="Module" className="font-mono text-xs text-gray-500" />
          <Column field="location" header="Region" />
          <Column header="State" body={stateTemplate} />
          <Column field="drift" header="Detail" className="text-sm text-gray-400" />
        </DataTable>
        {summary.drifted > 0 && (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            <i className="pi pi-exclamation-triangle mr-2" />
            {summary.drifted} resource(s) drifted from the committed state. The nightly job opens a GitHub issue labelled
            <span className="font-mono"> security / drift / incident</span> when this happens in a configured Azure environment.
            This table is demo data for reviewer flow.
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Recent Pipeline Runs" className="border border-dark-700 bg-dark-900 shadow-xl">
          <DataTable value={runs} size="small" responsiveLayout="scroll" className="p-datatable-sm">
            <Column field="id" header="Run" body={(r) => <span className="font-mono text-gray-400">#{r.id}</span>} />
            <Column field="workflow" header="Workflow" className="text-sm" />
            <Column field="trigger" header="Trigger" className="font-mono text-xs text-gray-500" />
            <Column field="branch" header="Branch" className="font-mono text-xs text-blue-300" />
            <Column header="Result" body={(r) => runResultTag(r.result)} />
            <Column field="duration" header="Duration" className="font-mono text-xs text-gray-500" />
            <Column field="when" header="When" className="text-xs text-gray-500" />
          </DataTable>
        </Card>

        <Card title="Go Deployment CLI" className="border border-dark-700 bg-dark-900 shadow-xl">
          <p className="mb-3 text-sm text-gray-400">
            Example output from <span className="font-mono text-gray-300">src-cli</span> walking YAML rules and validating
            Sentinel scheduled-rule mappings. Live apply requires configured Azure credentials.
          </p>
          <div className="h-64 overflow-auto rounded-lg border border-dark-700 bg-black p-4 font-mono text-xs leading-relaxed">
            {deployLog.map((line, i) => (
              <div key={i} className={logColor[line.level] || 'text-gray-300'}>
                {line.text}
              </div>
            ))}
          </div>
          <Divider />
          <div className="font-mono text-xs text-gray-500">
            $ go run . -sub $SUB -rg rg-secops-core -workspace law-sentinel-prod -dir ../rules-yaml
          </div>
        </Card>
      </div>
    </div>
  );
}
