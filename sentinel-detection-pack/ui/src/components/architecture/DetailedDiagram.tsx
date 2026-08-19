import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position, MarkerType, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  KeyRound, Mail, ShieldCheck, Box, Cloud, Bug, Network,
  ShieldAlert, FileCode, GitBranch, Workflow, Siren, Lock, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
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
  soar: Workflow,
  incidents: Siren,
  containment: Lock,
};

// Fixed categorical palette for this diagram's legend — distinguishing kinds
// of nodes, not a branding gradient. Stays constant across light/dark.
const ACCENTS: Record<string, string> = {
  blue: '#3b82f6',
  orange: '#d97706',
  red: '#dc2626',
  emerald: '#059669',
  cyan: '#0891b2',
  amber: '#b45309',
};

interface NodeData {
  kind: string;
  title: string;
  sub: string;
  accent: keyof typeof ACCENTS;
  tag?: string;
}

function InfraNode({ data }: { data: NodeData }) {
  const Icon = ICONS[data.kind] || Network;
  const accent = ACCENTS[data.accent] || ACCENTS.blue;
  return (
    <div
      className="min-w-[180px] rounded-lg border-2 bg-surface px-4 py-3 shadow-sm"
      style={{ borderColor: accent }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-text-tertiary" />
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-subtle" style={{ color: accent }}>
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-text-primary">{data.title}</div>
          <div className="truncate text-[11px] text-text-tertiary">{data.sub}</div>
        </div>
      </div>
      {data.tag && (
        <div className="mt-2 inline-block rounded bg-surface-subtle px-2 py-0.5 font-mono text-[10px] text-text-tertiary">
          {data.tag}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-text-tertiary" />
    </div>
  );
}

const nodeTypes = { infra: InfraNode };
const N = (id: string, x: number, y: number, data: NodeData): Node => ({ id, type: 'infra', position: { x, y }, data });

const initialNodes: Node[] = [
  N('entra', 0, 20, { kind: 'entra', title: 'Microsoft Entra ID', sub: 'Sign-in & audit logs', accent: 'blue' }),
  N('m365', 0, 110, { kind: 'm365', title: 'Microsoft 365', sub: 'OfficeActivity', accent: 'blue' }),
  N('defender', 0, 200, { kind: 'defender', title: 'Defender for Endpoint', sub: 'DeviceProcessEvents', accent: 'cyan' }),
  N('aks', 0, 290, { kind: 'aks', title: 'AKS / EKS', sub: 'Kube audit logs', accent: 'cyan' }),
  N('aws', 0, 380, { kind: 'aws', title: 'AWS CloudTrail', sub: 'S3 + OIDC AssumeRole', accent: 'orange' }),
  N('honeypot', 0, 470, { kind: 'honeypot', title: 'Ephemeral honeypot', sub: 'Attack telemetry', accent: 'red' }),
  N('connectors', 300, 245, { kind: 'connectors', title: 'Data connectors', sub: 'Normalize & ingest', accent: 'cyan' }),
  N('cicd', 300, -80, { kind: 'cicd', title: 'GitHub Actions', sub: 'Scan, validate, deploy', accent: 'amber', tag: 'Gitleaks / TFSec / Trivy' }),
  N('rules', 580, 40, { kind: 'rules', title: '16 KQL detections', sub: 'Detection-as-Code', accent: 'emerald', tag: 'Go CLI → ARM' }),
  N('sentinel', 580, 250, { kind: 'sentinel', title: 'Microsoft Sentinel', sub: 'Log Analytics workspace', accent: 'blue' }),
  N('soar', 880, 200, { kind: 'soar', title: 'SOAR Logic App', sub: 'Human-reviewed design', accent: 'emerald' }),
  N('incidents', 880, 330, { kind: 'incidents', title: 'Incident workflow', sub: 'Analyst triage', accent: 'red' }),
  N('containment', 1150, 265, { kind: 'containment', title: 'Containment', sub: 'NSG isolate / revoke sessions', accent: 'orange' }),
];

const edge = (id: string, source: string, target: string, opts: { color?: string; width?: number; animated?: boolean; label?: string } = {}): Edge => ({
  id,
  source,
  target,
  markerEnd: { type: MarkerType.ArrowClosed, color: opts.color || '#94a3b8' },
  style: { stroke: opts.color || '#94a3b8', strokeWidth: opts.width || 1.5 },
  animated: !!opts.animated,
  label: opts.label,
  labelStyle: { fill: '#64748b', fontSize: 10 },
});

const initialEdges: Edge[] = [
  edge('e-entra', 'entra', 'connectors', { color: ACCENTS.blue }),
  edge('e-m365', 'm365', 'connectors', { color: ACCENTS.blue }),
  edge('e-defender', 'defender', 'connectors', { color: ACCENTS.cyan }),
  edge('e-aks', 'aks', 'connectors', { color: ACCENTS.cyan }),
  edge('e-aws', 'aws', 'connectors', { color: ACCENTS.orange, label: 'OIDC / S3' }),
  edge('e-honeypot', 'honeypot', 'connectors', { color: ACCENTS.red, label: 'attack data' }),
  edge('e-ingest', 'connectors', 'sentinel', { color: ACCENTS.cyan, width: 2, label: 'ingest' }),
  edge('e-cicd-rules', 'cicd', 'rules', { color: ACCENTS.amber, label: 'validate + deploy' }),
  edge('e-rules', 'rules', 'sentinel', { color: ACCENTS.emerald, label: 'scheduled alert rules' }),
  edge('e-soar', 'sentinel', 'soar', { color: ACCENTS.emerald, label: 'incident trigger' }),
  edge('e-incidents', 'sentinel', 'incidents', { color: ACCENTS.red, label: 'alerts' }),
  edge('e-contain', 'soar', 'containment', { color: ACCENTS.orange, label: 'approval then isolate' }),
];

const legend = [
  { label: 'Identity & endpoint telemetry', color: ACCENTS.blue },
  { label: 'Multi-cloud telemetry', color: ACCENTS.cyan },
  { label: 'Delivery pipeline', color: ACCENTS.amber },
  { label: 'Detection-as-Code', color: ACCENTS.emerald },
  { label: 'Active response', color: ACCENTS.orange },
];

export function DetailedDiagram() {
  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo(() => initialEdges, []);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-text-tertiary">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface-subtle" style={{ height: '560px' }}>
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
          <Background color="#94a3b8" gap={22} size={0.6} />
          <Controls showInteractive={false} />
          <MiniMap
            maskColor="rgba(100,116,139,0.15)"
            nodeColor={(node) => ACCENTS[(node.data as NodeData)?.accent] || '#94a3b8'}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
