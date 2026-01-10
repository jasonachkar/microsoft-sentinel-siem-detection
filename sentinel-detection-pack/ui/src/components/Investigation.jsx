import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Search, User, Globe, Monitor, Mail, Shield, Clock,
  AlertTriangle, ChevronRight, FileText, Activity,
  Eye, Lock, Server, Zap
} from 'lucide-react';
import { cn, formatRelativeTime, getSeverityBadge } from '../services/utils';

// Sample investigation data
const SAMPLE_INVESTIGATION = {
  incident: {
    id: 'inc-001',
    title: 'Password Spray Attack from TOR Exit Node',
    severity: 'Critical',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  entities: {
    users: [
      { id: 'user-1', name: 'alice@contoso.com', type: 'user', risk: 'high', failed: 12 },
      { id: 'user-2', name: 'bob@contoso.com', type: 'user', risk: 'medium', failed: 8 },
      { id: 'user-3', name: 'carol@contoso.com', type: 'user', risk: 'high', failed: 15 },
      { id: 'user-4', name: 'david@contoso.com', type: 'user', risk: 'low', failed: 3 },
    ],
    ips: [
      { id: 'ip-1', address: '45.155.205.233', type: 'ip', country: 'RU', threat: 'TOR Exit Node', risk: 'critical' },
      { id: 'ip-2', address: '185.220.101.1', type: 'ip', country: 'DE', threat: 'TOR Exit Node', risk: 'high' },
    ],
    devices: [
      { id: 'device-1', name: 'WORKSTATION-01', type: 'device', os: 'Windows 11', risk: 'medium' },
    ],
    apps: [
      { id: 'app-1', name: 'Office 365', type: 'app', attempts: 45 },
      { id: 'app-2', name: 'Azure Portal', type: 'app', attempts: 12 },
    ],
  },
  timeline: [
    { id: 't1', time: new Date(Date.now() - 130 * 60000).toISOString(), event: 'First failed login attempt', entity: 'alice@contoso.com', severity: 'Medium' },
    { id: 't2', time: new Date(Date.now() - 125 * 60000).toISOString(), event: 'Multiple accounts targeted', entity: '45.155.205.233', severity: 'High' },
    { id: 't3', time: new Date(Date.now() - 120 * 60000).toISOString(), event: 'TOR exit node identified', entity: '45.155.205.233', severity: 'Critical' },
    { id: 't4', time: new Date(Date.now() - 115 * 60000).toISOString(), event: 'Password spray pattern detected', entity: 'System', severity: 'Critical' },
    { id: 't5', time: new Date(Date.now() - 110 * 60000).toISOString(), event: 'Alert generated', entity: 'System', severity: 'High' },
    { id: 't6', time: new Date(Date.now() - 100 * 60000).toISOString(), event: 'Incident created', entity: 'System', severity: 'Critical' },
    { id: 't7', time: new Date(Date.now() - 90 * 60000).toISOString(), event: 'Assigned to Analyst-01', entity: 'SOC Lead', severity: 'Low' },
    { id: 't8', time: new Date(Date.now() - 60 * 60000).toISOString(), event: 'Investigation started', entity: 'Analyst-01', severity: 'Low' },
  ],
  evidence: [
    { id: 'e1', type: 'SigninLogs', count: 45, description: 'Failed authentication attempts' },
    { id: 'e2', type: 'AuditLogs', count: 3, description: 'Account lockout events' },
    { id: 'e3', type: 'ThreatIntel', count: 2, description: 'Known malicious IP matches' },
  ],
};

// Entity type icons
const entityIcons = {
  user: User,
  ip: Globe,
  device: Monitor,
  app: Server,
};

// Entity type colors
const entityColors = {
  user: '#3b82f6',
  ip: '#ef4444',
  device: '#22c55e',
  app: '#8b5cf6',
};

// Risk colors
const riskColors = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

// Custom Node Component
function EntityNode({ data }) {
  const Icon = entityIcons[data.type] || Shield;
  const color = entityColors[data.type];
  const riskColor = riskColors[data.risk] || '#64748b';

  return (
    <div 
      className={cn(
        "px-4 py-3 rounded-lg border-2 bg-dark-800 min-w-[150px]",
        "hover:shadow-lg transition-shadow cursor-pointer"
      )}
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{data.label}</p>
          <p className="text-xs text-gray-500">{data.type}</p>
        </div>
      </div>
      {data.risk && (
        <div 
          className="mt-2 text-xs px-2 py-0.5 rounded-full text-center"
          style={{ backgroundColor: `${riskColor}20`, color: riskColor }}
        >
          {data.risk} risk
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

// Build graph from investigation data
function buildGraph(investigation) {
  const nodes = [];
  const edges = [];
  let yOffset = 0;

  // Center incident node
  nodes.push({
    id: 'incident',
    type: 'entity',
    position: { x: 400, y: 200 },
    data: { 
      label: investigation.incident.title.substring(0, 30) + '...', 
      type: 'incident',
      risk: 'critical'
    },
  });

  // Add IP nodes (attackers)
  investigation.entities.ips.forEach((ip, i) => {
    nodes.push({
      id: ip.id,
      type: 'entity',
      position: { x: 100, y: 100 + i * 120 },
      data: { label: ip.address, type: 'ip', risk: ip.risk },
    });
    edges.push({
      id: `edge-${ip.id}`,
      source: ip.id,
      target: 'incident',
      animated: true,
      style: { stroke: '#ef4444' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    });
  });

  // Add user nodes (targets)
  investigation.entities.users.forEach((user, i) => {
    nodes.push({
      id: user.id,
      type: 'entity',
      position: { x: 700, y: 50 + i * 100 },
      data: { label: user.name, type: 'user', risk: user.risk },
    });
    edges.push({
      id: `edge-${user.id}`,
      source: 'incident',
      target: user.id,
      style: { stroke: '#3b82f6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    });
  });

  // Add app nodes
  investigation.entities.apps.forEach((app, i) => {
    nodes.push({
      id: app.id,
      type: 'entity',
      position: { x: 400, y: 450 + i * 80 },
      data: { label: app.name, type: 'app' },
    });
    edges.push({
      id: `edge-${app.id}`,
      source: 'incident',
      target: app.id,
      style: { stroke: '#8b5cf6' },
    });
  });

  return { nodes, edges };
}

// Timeline Component
function InvestigationTimeline({ events }) {
  return (
    <div className="space-y-3">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-start gap-3"
        >
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-3 h-3 rounded-full flex-shrink-0",
              event.severity === 'Critical' ? 'bg-red-500' :
              event.severity === 'High' ? 'bg-orange-500' :
              event.severity === 'Medium' ? 'bg-yellow-500' :
              'bg-gray-500'
            )} />
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-dark-700 min-h-[40px]" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{event.event}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>{event.entity}</span>
              <span>•</span>
              <span>{formatRelativeTime(event.time)}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Evidence Card Component
function EvidenceCard({ evidence }) {
  return (
    <div className="p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyber-400" />
          <div>
            <p className="font-medium">{evidence.type}</p>
            <p className="text-sm text-gray-400">{evidence.description}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-cyber-400">{evidence.count}</span>
      </div>
    </div>
  );
}

export default function Investigation() {
  const [searchParams] = useSearchParams();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const investigation = SAMPLE_INVESTIGATION;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(investigation),
    [investigation]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event, node) => {
    setSelectedEntity(node);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Incident #{investigation.incident.id}</span>
            <ChevronRight className="w-4 h-4" />
            <span>Investigation</span>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-3 mt-2">
            <Search className="w-8 h-8 text-cyber-500" />
            {investigation.incident.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(investigation.incident.severity))}>
              {investigation.incident.severity}
            </span>
            <span className="text-sm text-gray-400">
              Created {formatRelativeTime(investigation.incident.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity Graph */}
        <div className="lg:col-span-2 bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden" style={{ height: '600px' }}>
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-500" />
              Entity Relationship Graph
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>IP Address</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>User</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Application</span>
              </div>
            </div>
          </div>
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-dark-900"
          >
            <Controls className="bg-dark-800 border-dark-700 rounded-lg" />
            <MiniMap 
              className="bg-dark-800 border border-dark-700 rounded-lg"
              nodeColor={(node) => entityColors[node.data?.type] || '#64748b'}
            />
            <Background color="#334155" gap={20} />
          </ReactFlow>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-500" />
              Investigation Timeline
            </h3>
            <div className="max-h-80 overflow-y-auto pr-2">
              <InvestigationTimeline events={investigation.timeline} />
            </div>
          </div>

          {/* Evidence */}
          <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyber-500" />
              Evidence Collected
            </h3>
            <div className="space-y-2">
              {investigation.evidence.map(evidence => (
                <EvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          </div>

          {/* Entity Details */}
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-xl border border-cyber-500/30 p-4"
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyber-500" />
                Entity Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="font-mono">{selectedEntity.data.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="capitalize">{selectedEntity.data.type}</span>
                </div>
                {selectedEntity.data.risk && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="capitalize" style={{ color: riskColors[selectedEntity.data.risk] }}>
                      {selectedEntity.data.risk}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-cyber-900/30 to-purple-900/30 rounded-xl border border-cyber-700/30 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyber-400" />
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-red-400" />
              <span className="font-medium">Block Source IPs</span>
            </div>
            <p className="text-sm text-gray-400">Add TOR exit nodes to block list</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-orange-400" />
              <span className="font-medium">Reset Credentials</span>
            </div>
            <p className="text-sm text-gray-400">Force password reset for targeted accounts</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-medium">Enable MFA</span>
            </div>
            <p className="text-sm text-gray-400">Enforce multi-factor authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
