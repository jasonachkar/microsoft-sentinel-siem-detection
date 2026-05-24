import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import rulesData from '../data/rules.json';
import { projectFacts, realVsSimulated, statusSeverity as projectStatusSeverity } from '../data/projectFacts';
import { projectLimitations } from '../data/limitations';
import {
  proofPillars as journeyProofPillars,
  scorecards as journeyScorecards,
  architectureNodesData,
  architectureEdgesData,
  detectionFlow as journeyDetectionFlow,
  ciRows as journeyCiRows,
  cloudSecurityControls,
  flagshipScenario,
} from '../data/reviewerJourney';

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
  return <Tag value={value} severity={projectStatusSeverity[value] || statusSeverity[value] || 'info'} />;
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

export default function ReviewerMode() {
  const rules = rulesData.rules || [];
  const passwordSpray = rules.find((rule) => rule.id === flagshipScenario.ruleId) || rules.find((rule) => rule.name?.includes('Password Spray')) || {};

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

  const rulePath = flagshipScenario.rulePath;
  const kqlPath = flagshipScenario.kqlPath;
  const reviewNodes = useMemo(() => architectureNodesData.map((node) => ({
    id: node.id,
    type: 'review',
    position: { x: node.x, y: node.y },
    data: {
      title: node.title,
      status: node.status,
      path: node.path,
      why: node.why,
    },
  })), []);
  const reviewEdges = useMemo(() => architectureEdgesData.map(([source, target, label]) => ({
    id: `${source}-${target}`,
    source,
    target,
    label,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#64748b', strokeWidth: 1.6 },
    labelStyle: { fill: '#cbd5e1', fontSize: 10 },
    labelBgStyle: { fill: '#0f172a' },
  })), []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-dark-900 to-purple-950/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Cloud Security Reviewer Mode</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              {projectFacts.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              {projectFacts.mission}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {projectFacts.safeBadges.map((badge) => <StatusTag key={badge} value={badge} />)}
            </div>
          </div>
          <div className="grid min-w-[260px] gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            {journeyProofPillars.map((pillar) => (
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
          {journeyScorecards.map((item) => (
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
        <DataTable value={realVsSimulated} className="p-datatable-sm">
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
            nodes={reviewNodes}
            edges={reviewEdges}
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
            value={journeyDetectionFlow}
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
              <p className="text-gray-300">{flagshipScenario.narrative}</p>
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
          {flagshipScenario.triageCards.map(([title, body]) => (
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
            {cloudSecurityControls.map(([title, detail, path]) => (
              <div key={title} className="rounded-lg border border-dark-700 bg-dark-950 p-3">
                <div className="font-semibold text-gray-100">{title}</div>
                <div className="my-2 text-sm text-gray-400">{detail}</div>
                <RepoPath path={path} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="CI/CD Evidence" className="border border-dark-700 bg-dark-900">
          <DataTable value={journeyCiRows} className="p-datatable-sm">
            <Column field="gate" header="Gate" />
            <Column header="Status" body={(row) => <StatusTag value={row.status} />} />
            <Column field="proof" header="What it proves" />
            <Column header="Path" body={(row) => <RepoPath path={row.file} />} />
          </DataTable>
        </Card>
      </section>

      <Card title="Limitations" className="border border-red-500/30 bg-red-950/10">
        <div className="grid gap-3 md:grid-cols-2">
          {projectLimitations.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border border-red-500/20 bg-black/20 p-3 text-sm text-red-100">
              <i className="pi pi-exclamation-triangle mt-0.5 text-red-300" />
              <span>{item.summary}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
