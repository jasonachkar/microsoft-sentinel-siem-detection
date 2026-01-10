import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Search, User, Monitor, Globe, AlertTriangle,
  Clock, ChevronRight, Shield, Target, Eye,
  Copy, Check, ExternalLink, RefreshCw, Plus,
  Tag, MessageSquare, FileText, Download, X,
  Zap, Hash, Activity, Lock, Unlock, Flag
} from 'lucide-react';
import { cn, formatRelativeTime, getSeverityBadge, v4 as uuidv4 } from '../services/utils';
import { useAppStore } from '../store/appStore';
import { threatIntelService } from '../services/threatIntelService';

// OSINT Lookup Service
const osintLookup = {
  async lookupIP(ip) {
    // Simulate API call - in production, use real APIs
    const threatData = await threatIntelService.lookupIP(ip);
    return {
      ip,
      ...threatData,
      whois: {
        org: 'Example ISP',
        country: 'Unknown',
        asn: 'AS12345'
      },
      ports: [22, 80, 443],
      geoip: { city: 'Unknown', country: 'Unknown', lat: 0, lng: 0 },
      lastSeen: new Date().toISOString()
    };
  },

  async lookupDomain(domain) {
    const threatData = await threatIntelService.lookupDomain(domain);
    return {
      domain,
      ...threatData,
      registrar: 'Unknown Registrar',
      created: 'Unknown',
      nameservers: ['ns1.example.com', 'ns2.example.com'],
      ip: '0.0.0.0'
    };
  },

  async lookupHash(hash) {
    return {
      hash,
      reputation: hash.startsWith('a1') ? 'malicious' : 'unknown',
      detections: Math.floor(Math.random() * 50) + 20,
      totalEngines: 72,
      names: ['Trojan.Generic', 'Mal/Unknown-XYZ'],
      firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
      lastSeen: new Date().toISOString()
    };
  }
};

// Custom Node Components
const nodeTypes = {
  user: ({ data }) => (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 min-w-[150px]",
      data.isSuspicious ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <User className={cn("w-5 h-5", data.isSuspicious ? 'text-red-400' : 'text-blue-400')} />
        <div>
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-xs text-gray-500">User</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  ),
  device: ({ data }) => (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 min-w-[150px]",
      data.isSuspicious ? 'bg-red-500/20 border-red-500' : 'bg-purple-500/20 border-purple-500'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Monitor className={cn("w-5 h-5", data.isSuspicious ? 'text-red-400' : 'text-purple-400')} />
        <div>
          <p className="font-medium text-sm">{data.label}</p>
          <p className="text-xs text-gray-500">Device</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  ),
  ip: ({ data }) => (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 min-w-[150px]",
      data.isMalicious ? 'bg-red-500/20 border-red-500' : 
      data.isSuspicious ? 'bg-yellow-500/20 border-yellow-500' :
      'bg-green-500/20 border-green-500'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <Globe className={cn(
          "w-5 h-5",
          data.isMalicious ? 'text-red-400' : 
          data.isSuspicious ? 'text-yellow-400' :
          'text-green-400'
        )} />
        <div>
          <p className="font-medium text-sm font-mono">{data.label}</p>
          <p className="text-xs text-gray-500">{data.country || 'IP Address'}</p>
        </div>
      </div>
      {data.reputation && (
        <div className={cn(
          "mt-2 text-xs px-2 py-0.5 rounded text-center",
          data.isMalicious ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
        )}>
          {data.reputation}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  ),
  alert: ({ data }) => (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 min-w-[180px]",
      data.severity === 'Critical' ? 'bg-red-500/20 border-red-500' :
      data.severity === 'High' ? 'bg-orange-500/20 border-orange-500' :
      'bg-yellow-500/20 border-yellow-500'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <AlertTriangle className={cn(
          "w-5 h-5",
          data.severity === 'Critical' ? 'text-red-400' :
          data.severity === 'High' ? 'text-orange-400' :
          'text-yellow-400'
        )} />
        <div>
          <p className="font-medium text-sm line-clamp-1">{data.label}</p>
          <p className="text-xs text-gray-500">{data.time || 'Alert'}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  ),
};

// Evidence Panel
function EvidencePanel({ evidence, onAdd, onRemove }) {
  const [newNote, setNewNote] = useState('');

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyber-500" />
          Evidence & Notes
        </h3>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
        {evidence.map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg group">
            {item.type === 'note' && <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />}
            {item.type === 'tag' && <Tag className="w-4 h-4 text-green-400 mt-0.5" />}
            {item.type === 'ioc' && <Target className="w-4 h-4 text-red-400 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm">{item.content}</p>
              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(item.timestamp)}</p>
            </div>
            <button 
              onClick={() => onRemove(index)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {evidence.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No evidence collected yet</p>
        )}
      </div>

      <div className="p-4 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm outline-none focus:border-cyber-500"
          />
          <button
            onClick={() => {
              if (newNote.trim()) {
                onAdd({ type: 'note', content: newNote, timestamp: new Date().toISOString() });
                setNewNote('');
              }
            }}
            className="px-3 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// OSINT Lookup Panel
function OSINTPanel({ selectedEntity, onLookup }) {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('ip');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedEntity) {
      setQuery(selectedEntity.label || '');
      setQueryType(selectedEntity.type || 'ip');
    }
  }, [selectedEntity]);

  const handleLookup = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let data;
      if (queryType === 'ip') {
        data = await osintLookup.lookupIP(query);
      } else if (queryType === 'domain') {
        data = await osintLookup.lookupDomain(query);
      } else if (queryType === 'hash') {
        data = await osintLookup.lookupHash(query);
      }
      setResult(data);
      if (onLookup) onLookup(data);
    } catch (error) {
      console.error('Lookup failed:', error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-medium flex items-center gap-2">
          <Search className="w-4 h-4 text-cyber-500" />
          OSINT Lookup
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm outline-none"
          >
            <option value="ip">IP</option>
            <option value="domain">Domain</option>
            <option value="hash">Hash</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder={`Enter ${queryType}...`}
            className="flex-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm outline-none focus:border-cyber-500 font-mono"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-cyber-500 text-white hover:bg-cyber-600 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Reputation Badge */}
            <div className={cn(
              "p-4 rounded-lg border",
              result.reputation === 'malicious' ? 'bg-red-500/10 border-red-500/30' :
              result.reputation === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-green-500/10 border-green-500/30'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.reputation === 'malicious' ? (
                    <Lock className="w-5 h-5 text-red-500" />
                  ) : result.reputation === 'suspicious' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-500" />
                  )}
                  <span className="font-medium capitalize">{result.reputation}</span>
                </div>
                {result.score !== undefined && (
                  <span className={cn(
                    "text-lg font-bold",
                    result.score >= 70 ? 'text-red-400' :
                    result.score >= 30 ? 'text-yellow-400' :
                    'text-green-400'
                  )}>
                    {result.score}/100
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {queryType === 'ip' && result.whois && (
                <>
                  <div className="p-2 rounded bg-dark-700/50">
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="font-mono text-xs">{result.whois.org}</p>
                  </div>
                  <div className="p-2 rounded bg-dark-700/50">
                    <p className="text-xs text-gray-500">ASN</p>
                    <p className="font-mono text-xs">{result.whois.asn}</p>
                  </div>
                </>
              )}
              {result.reports !== undefined && (
                <div className="p-2 rounded bg-dark-700/50">
                  <p className="text-xs text-gray-500">Reports</p>
                  <p className="font-bold">{result.reports}</p>
                </div>
              )}
              {result.lastSeen && (
                <div className="p-2 rounded bg-dark-700/50">
                  <p className="text-xs text-gray-500">Last Seen</p>
                  <p className="text-xs">{formatRelativeTime(result.lastSeen)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy JSON
              </button>
              <a
                href={`https://www.virustotal.com/gui/${queryType}/${query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                VirusTotal
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Timeline Panel
function TimelinePanel({ events }) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-500" />
          Investigation Timeline
        </h3>
      </div>

      <div className="p-4 max-h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  event.type === 'alert' ? 'bg-red-500' :
                  event.type === 'action' ? 'bg-blue-500' :
                  'bg-gray-500'
                )} />
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-dark-600 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                <p className="text-xs text-gray-600 mt-1">{formatRelativeTime(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sample investigation data
const generateInvestigationData = () => {
  const nodes = [
    { id: 'user-1', type: 'user', position: { x: 250, y: 0 }, data: { label: 'alice@contoso.com', isSuspicious: true } },
    { id: 'device-1', type: 'device', position: { x: 100, y: 150 }, data: { label: 'WORKSTATION-01' } },
    { id: 'ip-1', type: 'ip', position: { x: 400, y: 150 }, data: { label: '45.155.205.233', isMalicious: true, reputation: 'malicious', country: 'RU' } },
    { id: 'alert-1', type: 'alert', position: { x: 250, y: 300 }, data: { label: 'Password Spray Detected', severity: 'High', time: '10 min ago' } },
    { id: 'ip-2', type: 'ip', position: { x: 500, y: 300 }, data: { label: '10.0.1.15', reputation: 'internal', country: 'Internal' } },
  ];

  const edges = [
    { id: 'e1', source: 'user-1', target: 'device-1', animated: true },
    { id: 'e2', source: 'user-1', target: 'ip-1', animated: true, style: { stroke: '#ef4444' } },
    { id: 'e3', source: 'device-1', target: 'alert-1' },
    { id: 'e4', source: 'ip-1', target: 'alert-1', style: { stroke: '#ef4444' } },
    { id: 'e5', source: 'device-1', target: 'ip-2' },
  ];

  const events = [
    { type: 'alert', title: 'Password Spray Alert Triggered', description: 'Multiple failed logins from suspicious IP', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
    { type: 'action', title: 'Investigation Started', description: 'Auto-assigned to SOC queue', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
    { type: 'system', title: 'Entity Enrichment', description: 'IP reputation lookup completed', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  ];

  return { nodes, edges, events };
};

export default function Investigation() {
  const [searchParams] = useSearchParams();
  const { selectedEntities } = useAppStore();
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [events, setEvents] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Initialize with sample data
  useEffect(() => {
    const data = generateInvestigationData();
    setNodes(data.nodes);
    setEdges(data.edges);
    setEvents(data.events);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const addEvidence = useCallback((item) => {
    setEvidence(prev => [...prev, item]);
    setEvents(prev => [...prev, {
      type: 'action',
      title: 'Evidence Added',
      description: item.content.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const removeEvidence = useCallback((index) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleOSINTLookup = useCallback((result) => {
    setEvents(prev => [...prev, {
      type: 'action',
      title: 'OSINT Lookup Completed',
      description: `${result.ip || result.domain || result.hash}: ${result.reputation}`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Eye className="w-8 h-8 text-cyan-500" />
            Investigation Workbench
          </h1>
          <p className="text-gray-400 mt-1">
            Interactive entity graph with OSINT enrichment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-500 hover:bg-cyber-600 text-white text-sm">
            <Flag className="w-4 h-4" />
            Close Investigation
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Entity Graph */}
        <div className="xl:col-span-3">
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden" style={{ height: '500px' }}>
            <div className="p-3 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-500" />
                Entity Relationship Graph
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded hover:bg-dark-700" title="Add Entity">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-dark-700" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              className="bg-dark-900"
            >
              <Background color="#333" gap={16} />
              <Controls className="bg-dark-800 border-dark-700" />
              <MiniMap className="bg-dark-800" />
            </ReactFlow>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          <OSINTPanel 
            selectedEntity={selectedNode?.data}
            onLookup={handleOSINTLookup}
          />
          <EvidencePanel 
            evidence={evidence}
            onAdd={addEvidence}
            onRemove={removeEvidence}
          />
          <TimelinePanel events={events} />
        </div>
      </div>
    </div>
  );
}
