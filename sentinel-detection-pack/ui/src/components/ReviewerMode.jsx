import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import rulesData from '../data/rules.json';
import { projectFacts } from '../data/projectFacts';
import {
  architectureNodesData,
  architectureEdgesData,
  flagshipScenario,
  fiveMinutePath,
  whatThisProves,
  topProofLinks,
} from '../data/reviewerJourney';
import StatusTag from './shared/StatusTag';
import RepoPath from './shared/RepoPath';
import SectionHeader from './shared/SectionHeader';
import RealVsSimulatedTable from './shared/RealVsSimulatedTable';
import LimitationsPanel from './shared/LimitationsPanel';

function ReviewNode({ data }) {
  return (
    <div className="w-48 rounded-xl border border-dark-600 bg-dark-900/95 p-2.5 shadow-lg">
      <Handle type="target" position={Position.Left} className="!border-0 !bg-blue-400" />
      <div className="text-sm font-semibold text-gray-100">{data.title}</div>
      <div className="mt-1.5"><StatusTag value={data.status} /></div>
      <Handle type="source" position={Position.Right} className="!border-0 !bg-blue-400" />
    </div>
  );
}

const nodeTypes = { review: ReviewNode };

export default function ReviewerMode() {
  const rules = rulesData.rules || [];
  const passwordSpray = rules.find((rule) => rule.id === flagshipScenario.ruleId)
    || rules.find((rule) => rule.name?.includes('Password Spray'))
    || {};

  const reviewNodes = useMemo(() => architectureNodesData.map((node) => ({
    id: node.id,
    type: 'review',
    position: { x: node.x * 0.85, y: node.y * 0.85 },
    data: { title: node.title, status: node.status },
  })), []);
  const reviewEdges = useMemo(() => architectureEdgesData.map(([source, target, label]) => ({
    id: `${source}-${target}`,
    source,
    target,
    label,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#64748b', strokeWidth: 1.4 },
    labelStyle: { fill: '#cbd5e1', fontSize: 9 },
    labelBgStyle: { fill: '#0f172a' },
  })), []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-dark-900 to-purple-950/30 p-8 shadow-2xl">
        <div className="max-w-3xl">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Start Here</div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">{projectFacts.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">{projectFacts.mission}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {projectFacts.safeBadges.map((badge) => <StatusTag key={badge} value={badge} />)}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="What this project proves"
          description="Four pillars a senior cloud security engineer can verify in the repository."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whatThisProves.map((item) => (
            <Card key={item.title} className="border border-dark-700 bg-dark-900">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-100">{item.title}</h3>
                  <StatusTag value={item.status} />
                </div>
                <p className="text-sm text-gray-400">{item.summary}</p>
                <RepoPath path={item.path} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="5-minute review path"
          description="Follow this sequence to evaluate the lab without reading every page."
        />
        <div className="grid gap-3 lg:grid-cols-5">
          {fiveMinutePath.map((item, index) => (
            <Link
              key={item.step}
              to={item.route}
              className="rounded-lg border border-dark-700 bg-dark-900 p-4 transition hover:border-blue-500/50"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">
                  {index + 1}
                </span>
                <Tag value={item.time} severity="info" />
              </div>
              <div className="font-semibold text-gray-100">{item.step}</div>
              <p className="mt-2 text-sm text-gray-400">{item.why}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Architecture preview"
          description="Compact view of the detection engineering pipeline. Open Architecture for the full narrative."
          action={(
            <Link to="/architecture" className="text-sm text-blue-300 hover:text-blue-200">
              Full architecture →
            </Link>
          )}
        />
        <div className="h-[320px] overflow-hidden rounded-xl border border-dark-700 bg-dark-950">
          <ReactFlow
            nodes={reviewNodes}
            edges={reviewEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.2}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Background color="#1e293b" gap={22} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Flagship scenario preview"
          description="Entra ID password spray — the end-to-end detection walkthrough."
          action={(
            <Link to="/scenario/password-spray" className="text-sm text-blue-300 hover:text-blue-200">
              Full scenario →
            </Link>
          )}
        />
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border border-dark-700 bg-dark-900">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag value={passwordSpray.severity || 'High'} severity="danger" />
                {(passwordSpray.tactics || []).slice(0, 2).map((tactic) => (
                  <Tag key={tactic} value={tactic} severity="info" />
                ))}
              </div>
              <p className="text-sm text-gray-300">{flagshipScenario.narrative}</p>
              <div className="flex flex-wrap gap-2">
                <RepoPath path={flagshipScenario.rulePath} />
                <RepoPath path={flagshipScenario.kqlPath} />
              </div>
            </div>
          </Card>
          <Card title="Triage at a glance" className="border border-dark-700 bg-dark-900">
            <div className="grid gap-2">
              {flagshipScenario.triageCards.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-dark-700 bg-dark-950 p-3">
                  <div className="text-sm font-bold text-gray-100">{title}</div>
                  <p className="mt-1 text-xs text-gray-400">{body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <RealVsSimulatedTable compact />

      <section className="space-y-4">
        <SectionHeader
          title="Top 5 proof links"
          description="Start inspecting these files — each maps to a verifiable claim."
          action={(
            <Link to="/evidence" className="text-sm text-blue-300 hover:text-blue-200">
              All evidence →
            </Link>
          )}
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topProofLinks.map((link) => (
            <div key={link.path} className="flex items-center justify-between gap-3 rounded-lg border border-dark-700 bg-dark-900 p-3">
              <div>
                <div className="text-sm font-semibold text-gray-100">{link.label}</div>
                <div className="mt-2"><RepoPath path={link.path} /></div>
              </div>
              <StatusTag value={link.status} />
            </div>
          ))}
        </div>
      </section>

      <LimitationsPanel compact />
    </div>
  );
}
