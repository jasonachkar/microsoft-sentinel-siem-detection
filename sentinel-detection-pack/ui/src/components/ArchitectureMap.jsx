import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  KeyRound, Mail, ShieldCheck, Box, Cloud, Bug, Network,
  ShieldAlert, FileCode, GitBranch, Bot, Workflow, Siren, Lock,
} from 'lucide-react';

const ICONS = {
  entra: KeyRound,
  m365: Mail,
  defender: ShieldCheck,
  aks: Box,
  aws: Cloud,
  honeypot: Bug,
  connectors: Network,
  sentinel: ShieldAlert,
  rules: FileCode,
  cicd: GitBranch,
  copilot: Bot,
  soar: Workflow,
  incidents: Siren,
  containment: Lock,
};

const ACCENTS = {
  blue: 'border-blue-500/60 text-blue-300',
  purple: 'border-purple-500/60 text-purple-300',
  orange: 'border-orange-500/60 text-orange-300',
  red: 'border-red-500/60 text-red-300',
  emerald: 'border-emerald-500/60 text-emerald-300',
  cyan: 'border-cyan-500/60 text-cyan-300',
  amber: 'border-amber-500/60 text-amber-300',
};

function InfraNode({ data }) {
  const Icon = ICONS[data.kind] || Network;
  const accent = ACCENTS[data.accent] || ACCENTS.blue;
  const [borderClass, textClass] = accent.split(' ');

  return (
    <div
      className={`min-w-[180px] rounded-xl border-2 bg-dark-900/95 px-4 py-3 shadow-lg backdrop-blur ${borderClass} ${
        data.primary ? 'ring-2 ring-blue-500/40' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-gray-500" />
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 ${textClass}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-100">{data.title}</div>
          <div className="truncate text-[11px] text-gray-400">{data.sub}</div>
        </div>
      </div>
      {data.tag && (
        <div className="mt-2 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-gray-400">
          {data.tag}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-gray-500" />
    </div>
  );
}

const nodeTypes = { infra: InfraNode };

const N = (id, x, y, data) => ({ id, type: 'infra', position: { x, y }, data });

const initialNodes = [
  N('entra', 0, 20, { kind: 'entra', title: 'Microsoft Entra ID', sub: 'Sign-in & audit logs', accent: 'blue' }),
  N('m365', 0, 110, { kind: 'm365', title: 'Microsoft 365', sub: 'OfficeActivity', accent: 'blue' }),
  N('defender', 0, 200, { kind: 'defender', title: 'Defender for Endpoint', sub: 'DeviceProcessEvents', accent: 'purple' }),
  N('aks', 0, 290, { kind: 'aks', title: 'AKS / EKS', sub: 'Kube audit logs', accent: 'cyan' }),
  N('aws', 0, 380, { kind: 'aws', title: 'AWS CloudTrail', sub: 'S3 + OIDC AssumeRole', accent: 'orange' }),
  N('honeypot', 0, 470, { kind: 'honeypot', title: 'Ephemeral Honeypot', sub: 'Attack telemetry', accent: 'red' }),

  N('connectors', 300, 245, { kind: 'connectors', title: 'Data Connectors', sub: 'Normalize & ingest', accent: 'cyan' }),

  N('cicd', 300, -80, { kind: 'cicd', title: 'GitHub Actions', sub: 'Scan · validate · deploy', accent: 'amber', tag: 'Gitleaks/TFSec/Trivy' }),
  N('rules', 580, 40, { kind: 'rules', title: '16 KQL Detections', sub: 'Detection-as-Code', accent: 'emerald', tag: 'Go CLI → ARM' }),

  N('sentinel', 580, 250, { kind: 'sentinel', title: 'Microsoft Sentinel', sub: 'Log Analytics workspace', accent: 'blue', primary: true }),

  N('copilot', 880, 120, { kind: 'copilot', title: 'AI SOC Copilot', sub: 'Triage & summarize', accent: 'purple' }),
  N('soar', 880, 250, { kind: 'soar', title: 'SOAR Logic App', sub: 'Auto-remediation', accent: 'emerald' }),
  N('incidents', 880, 380, { kind: 'incidents', title: 'Incident Queue', sub: 'Analyst console', accent: 'red' }),

  N('containment', 1180, 250, { kind: 'containment', title: 'Containment', sub: 'NSG isolate · revoke sessions', accent: 'orange' }),
];

const edge = (id, source, target, opts = {}) => ({
  id,
  source,
  target,
  markerEnd: { type: MarkerType.ArrowClosed, color: opts.color || '#475569' },
  style: { stroke: opts.color || '#475569', strokeWidth: opts.width || 1.5 },
  animated: !!opts.animated,
  label: opts.label,
  labelStyle: { fill: '#94a3b8', fontSize: 10 },
  labelBgStyle: { fill: '#0f172a' },
});

const initialEdges = [
  edge('e-entra', 'entra', 'connectors', { color: '#3b82f6' }),
  edge('e-m365', 'm365', 'connectors', { color: '#3b82f6' }),
  edge('e-defender', 'defender', 'connectors', { color: '#a855f7' }),
  edge('e-aks', 'aks', 'connectors', { color: '#06b6d4' }),
  edge('e-aws', 'aws', 'connectors', { color: '#f97316', label: 'OIDC / S3' }),
  edge('e-honeypot', 'honeypot', 'connectors', { color: '#ef4444', label: 'attack data' }),
  edge('e-ingest', 'connectors', 'sentinel', { color: '#22d3ee', animated: true, width: 2, label: 'ingest' }),
  edge('e-cicd-rules', 'cicd', 'rules', { color: '#f59e0b', animated: true, label: 'validate + deploy' }),
  edge('e-rules', 'rules', 'sentinel', { color: '#10b981', animated: true, label: 'scheduled alert rules' }),
  edge('e-copilot', 'sentinel', 'copilot', { color: '#a855f7', animated: true, label: 'AI triage' }),
  edge('e-soar', 'sentinel', 'soar', { color: '#10b981', animated: true, label: 'incident trigger' }),
  edge('e-incidents', 'sentinel', 'incidents', { color: '#ef4444', label: 'alerts' }),
  edge('e-contain', 'soar', 'containment', { color: '#f97316', animated: true, label: 'auto-isolate' }),
];

const legend = [
  { label: 'Telemetry sources', color: 'bg-blue-500' },
  { label: 'Ingestion', color: 'bg-cyan-500' },
  { label: 'Detection-as-Code', color: 'bg-emerald-500' },
  { label: 'Active response', color: 'bg-orange-500' },
];

export default function ArchitectureMap() {
  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo(() => initialEdges, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-share-alt text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-200">Reference Architecture</h1>
            <p className="text-gray-400">
              End-to-end multi-cloud detection &amp; response flow &mdash; from telemetry ingestion to automated containment.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-dark-700 bg-dark-950" style={{ height: '640px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background color="#1e293b" gap={22} size={1} />
          <Controls className="rounded-lg border border-dark-700 bg-dark-800" showInteractive={false} />
          <MiniMap
            className="rounded-lg border border-dark-700 bg-dark-800"
            maskColor="rgba(2, 6, 23, 0.6)"
            nodeColor={(node) => {
              const map = { blue: '#3b82f6', purple: '#a855f7', orange: '#f97316', red: '#ef4444', emerald: '#10b981', cyan: '#06b6d4', amber: '#f59e0b' };
              return map[node.data?.accent] || '#475569';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
