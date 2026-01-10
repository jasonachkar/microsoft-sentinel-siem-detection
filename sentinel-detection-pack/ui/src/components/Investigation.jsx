import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Search, User, Monitor, Globe, AlertTriangle,
  Clock, ChevronRight, Shield, Target, Eye,
  Copy, Check, ExternalLink, RefreshCw, Plus,
  Tag, MessageSquare, FileText, Download, X,
  Zap, Hash, Activity, Lock, Unlock, Flag,
  File, Terminal, Database, Mail, Link2, Cpu,
  TrendingUp, Wifi, Server, Key, Filter
} from 'lucide-react';
import { cn, formatRelativeTime, getSeverityBadge, v4 as uuidv4 } from '../services/utils';
import { useAppStore } from '../store/appStore';
import { threatIntelService } from '../services/threatIntelService';

// Risk score colors
const getRiskColor = (score) => {
  if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' };
  if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
  if (score >= 20) return { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' };
  return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
};

// Custom Node Components with enhanced visuals
const UserNode = ({ data, selected }) => {
  const riskColors = getRiskColor(data.riskScore || 0);
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[160px] transition-all",
      "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
      selected ? 'border-cyber-500 ring-2 ring-cyber-500/30' : riskColors.border,
      data.isCompromised && "animate-pulse"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", riskColors.bg + '/30')}>
          <User className={cn("w-5 h-5", riskColors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">{data.department || 'User'}</p>
        </div>
      </div>
      {data.riskScore > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">Risk Score</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", riskColors.bg)} style={{ width: `${data.riskScore}%` }} />
            </div>
            <span className={cn("text-xs font-bold", riskColors.text)}>{data.riskScore}</span>
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
    </div>
  );
};

const DeviceNode = ({ data, selected }) => {
  const riskColors = getRiskColor(data.riskScore || 0);
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[160px] transition-all",
      "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
      selected ? 'border-cyber-500 ring-2 ring-cyber-500/30' : riskColors.border,
      data.isolated && "border-dashed"
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-500" />
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", riskColors.bg + '/30')}>
          <Monitor className={cn("w-5 h-5", riskColors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">{data.os || 'Device'}</p>
        </div>
      </div>
      {data.isolated && (
        <div className="mt-2 px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-[10px] text-center">
          ISOLATED
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
    </div>
  );
};

const IPNode = ({ data, selected }) => {
  const riskColors = getRiskColor(data.riskScore || 0);
  const isMalicious = data.reputation === 'malicious';
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[150px] transition-all",
      isMalicious ? "bg-gradient-to-br from-red-500/20 to-red-600/10" : "bg-gradient-to-br from-green-500/20 to-green-600/10",
      selected ? 'border-cyber-500 ring-2 ring-cyber-500/30' : isMalicious ? 'border-red-500' : 'border-green-500'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-500" />
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isMalicious ? 'bg-red-500/30' : 'bg-green-500/30'
        )}>
          <Globe className={cn("w-5 h-5", isMalicious ? 'text-red-400' : 'text-green-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">{data.country || data.asn || 'IP Address'}</p>
        </div>
      </div>
      {data.reputation && (
        <div className={cn(
          "mt-2 px-2 py-1 rounded text-[10px] text-center font-medium uppercase",
          isMalicious ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        )}>
          {data.reputation}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-500" />
    </div>
  );
};

const ProcessNode = ({ data, selected }) => {
  const isSuspicious = data.suspicious;
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[160px] transition-all",
      isSuspicious ? "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500" : "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500",
      selected && 'ring-2 ring-cyber-500/30'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-cyan-500" />
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isSuspicious ? 'bg-orange-500/30' : 'bg-cyan-500/30'
        )}>
          <Terminal className={cn("w-5 h-5", isSuspicious ? 'text-orange-400' : 'text-cyan-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">PID: {data.pid || '????'}</p>
        </div>
      </div>
      {data.commandLine && (
        <div className="mt-2 p-1.5 bg-dark-900 rounded text-[10px] font-mono text-gray-400 truncate">
          {data.commandLine}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-cyan-500" />
    </div>
  );
};

const FileNode = ({ data, selected }) => {
  const isMalicious = data.malicious;
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[150px] transition-all",
      isMalicious ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500" : "bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500",
      selected && 'ring-2 ring-cyber-500/30'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-500" />
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isMalicious ? 'bg-red-500/30' : 'bg-gray-500/30'
        )}>
          <File className={cn("w-5 h-5", isMalicious ? 'text-red-400' : 'text-gray-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">{data.size || 'File'}</p>
        </div>
      </div>
      {data.hash && (
        <div className="mt-2 p-1 bg-dark-900 rounded text-[9px] font-mono text-gray-500 truncate">
          {data.hash.substring(0, 16)}...
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-500" />
    </div>
  );
};

const AlertNode = ({ data, selected }) => {
  const severityColors = {
    Critical: 'from-red-500/20 to-red-600/10 border-red-500',
    High: 'from-orange-500/20 to-orange-600/10 border-orange-500',
    Medium: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500',
    Low: 'from-blue-500/20 to-blue-600/10 border-blue-500'
  };
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all bg-gradient-to-br",
      severityColors[data.severity] || severityColors.Medium,
      selected && 'ring-2 ring-cyber-500/30'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-orange-500" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/30">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", getSeverityBadge(data.severity))}>
              {data.severity}
            </span>
            <span className="text-[10px] text-gray-500">{data.time}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-orange-500" />
    </div>
  );
};

const DomainNode = ({ data, selected }) => {
  const isMalicious = data.malicious;
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[150px] transition-all",
      isMalicious ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500" : "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border-indigo-500",
      selected && 'ring-2 ring-cyber-500/30'
    )}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-indigo-500" />
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isMalicious ? 'bg-red-500/30' : 'bg-indigo-500/30'
        )}>
          <Link2 className={cn("w-5 h-5", isMalicious ? 'text-red-400' : 'text-indigo-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm truncate">{data.label}</p>
          <p className="text-xs text-gray-400">{data.registrar || 'Domain'}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-indigo-500" />
    </div>
  );
};

const nodeTypes = {
  user: UserNode,
  device: DeviceNode,
  ip: IPNode,
  process: ProcessNode,
  file: FileNode,
  alert: AlertNode,
  domain: DomainNode,
};

// Entity Details Panel
function EntityDetailsPanel({ entity, onClose, onLookup }) {
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!entity) return;
    setLoading(true);
    try {
      let result;
      if (entity.type === 'ip') {
        result = await threatIntelService.lookupIP(entity.data.label);
      } else if (entity.type === 'domain') {
        result = await threatIntelService.lookupDomain(entity.data.label);
      }
      setLookupResult(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!entity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden"
    >
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyber-500" />
          Entity Details
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Entity Info */}
        <div className="p-3 rounded-lg bg-dark-700/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              entity.type === 'user' ? 'bg-blue-500/30' :
              entity.type === 'device' ? 'bg-purple-500/30' :
              entity.type === 'ip' ? 'bg-green-500/30' :
              entity.type === 'process' ? 'bg-cyan-500/30' :
              'bg-gray-500/30'
            )}>
              {entity.type === 'user' && <User className="w-6 h-6 text-blue-400" />}
              {entity.type === 'device' && <Monitor className="w-6 h-6 text-purple-400" />}
              {entity.type === 'ip' && <Globe className="w-6 h-6 text-green-400" />}
              {entity.type === 'process' && <Terminal className="w-6 h-6 text-cyan-400" />}
              {entity.type === 'file' && <File className="w-6 h-6 text-gray-400" />}
              {entity.type === 'alert' && <AlertTriangle className="w-6 h-6 text-orange-400" />}
              {entity.type === 'domain' && <Link2 className="w-6 h-6 text-indigo-400" />}
            </div>
            <div>
              <p className="font-semibold">{entity.data.label}</p>
              <p className="text-sm text-gray-400 capitalize">{entity.type}</p>
            </div>
          </div>
        </div>

        {/* Risk Score */}
        {entity.data.riskScore !== undefined && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Risk Assessment</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${entity.data.riskScore}%` }}
                  className={cn("h-full rounded-full", getRiskColor(entity.data.riskScore).bg)}
                />
              </div>
              <span className={cn("text-lg font-bold", getRiskColor(entity.data.riskScore).text)}>
                {entity.data.riskScore}
              </span>
            </div>
          </div>
        )}

        {/* Properties */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">Properties</p>
          <div className="space-y-2">
            {Object.entries(entity.data).filter(([k]) => !['label', 'riskScore'].includes(k)).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-mono text-xs truncate max-w-[150px]">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OSINT Lookup */}
        {(entity.type === 'ip' || entity.type === 'domain') && (
          <div>
            <button
              onClick={handleLookup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 text-sm font-medium"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lookup Reputation
            </button>
            
            {lookupResult && (
              <div className={cn(
                "mt-3 p-3 rounded-lg border",
                lookupResult.reputation === 'malicious' ? 'bg-red-500/10 border-red-500/30' :
                lookupResult.reputation === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-green-500/10 border-green-500/30'
              )}>
                <div className="flex items-center gap-2">
                  {lookupResult.reputation === 'malicious' ? <Lock className="w-4 h-4 text-red-400" /> :
                   lookupResult.reputation === 'suspicious' ? <AlertTriangle className="w-4 h-4 text-yellow-400" /> :
                   <Unlock className="w-4 h-4 text-green-400" />}
                  <span className="font-medium capitalize">{lookupResult.reputation}</span>
                  {lookupResult.score !== undefined && (
                    <span className="ml-auto font-bold">{lookupResult.score}/100</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Entities */}
        <div>
          <p className="text-xs text-gray-500 uppercase mb-2">Related Entities</p>
          <p className="text-sm text-gray-400">Click edges in the graph to explore connections</p>
        </div>
      </div>
    </motion.div>
  );
}

// Timeline Panel
function TimelinePanel({ events }) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-500" />
          Attack Timeline
        </h3>
      </div>

      <div className="p-4 max-h-[300px] overflow-y-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-dark-600" />
          
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 relative"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0",
                  event.type === 'alert' ? 'bg-red-500' :
                  event.type === 'action' ? 'bg-blue-500' :
                  event.type === 'system' ? 'bg-gray-500' :
                  'bg-cyber-500'
                )}>
                  {event.type === 'alert' && <AlertTriangle className="w-3 h-3 text-white" />}
                  {event.type === 'action' && <Activity className="w-3 h-3 text-white" />}
                  {event.type === 'system' && <Cpu className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                  <p className="text-[10px] text-gray-600 mt-1">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Legend Panel
function LegendPanel() {
  const items = [
    { type: 'User', color: 'bg-blue-500', icon: User },
    { type: 'Device', color: 'bg-purple-500', icon: Monitor },
    { type: 'IP Address', color: 'bg-green-500', icon: Globe },
    { type: 'Process', color: 'bg-cyan-500', icon: Terminal },
    { type: 'File', color: 'bg-gray-500', icon: File },
    { type: 'Alert', color: 'bg-orange-500', icon: AlertTriangle },
    { type: 'Domain', color: 'bg-indigo-500', icon: Link2 },
  ];

  return (
    <div className="bg-dark-800/80 rounded-lg border border-dark-700 p-3 backdrop-blur-sm">
      <p className="text-xs text-gray-500 uppercase mb-2">Entity Types</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.type} className="flex items-center gap-2 text-xs">
              <div className={cn("w-4 h-4 rounded flex items-center justify-center", item.color + '/30')}>
                <Icon className={cn("w-2.5 h-2.5", item.color.replace('bg-', 'text-').replace('-500', '-400'))} />
              </div>
              <span className="text-gray-400">{item.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Generate investigation data
const generateInvestigationData = () => {
  const nodes = [
    { id: 'user-1', type: 'user', position: { x: 400, y: 50 }, data: { label: 'alice@contoso.com', department: 'Finance', riskScore: 85, isCompromised: true } },
    { id: 'device-1', type: 'device', position: { x: 150, y: 200 }, data: { label: 'WORKSTATION-01', os: 'Windows 11', riskScore: 70, isolated: false } },
    { id: 'device-2', type: 'device', position: { x: 650, y: 200 }, data: { label: 'LAPTOP-ALICE', os: 'Windows 11', riskScore: 45 } },
    { id: 'ip-1', type: 'ip', position: { x: 100, y: 400 }, data: { label: '45.155.205.233', country: 'Russia', reputation: 'malicious', riskScore: 95 } },
    { id: 'ip-2', type: 'ip', position: { x: 400, y: 350 }, data: { label: '10.0.1.15', country: 'Internal', reputation: 'clean', riskScore: 10 } },
    { id: 'process-1', type: 'process', position: { x: 300, y: 500 }, data: { label: 'powershell.exe', pid: '4532', commandLine: '-enc SQBFAFgA...', suspicious: true } },
    { id: 'file-1', type: 'file', position: { x: 550, y: 500 }, data: { label: 'payload.ps1', size: '4.2 KB', hash: 'a1b2c3d4e5f6789...', malicious: true } },
    { id: 'alert-1', type: 'alert', position: { x: 750, y: 350 }, data: { label: 'Credential Theft Detected', severity: 'Critical', time: '10m ago' } },
    { id: 'domain-1', type: 'domain', position: { x: 50, y: 550 }, data: { label: 'evil-c2.ru', registrar: 'Unknown', malicious: true } },
  ];

  const edges = [
    { id: 'e1', source: 'user-1', target: 'device-1', animated: true, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e2', source: 'user-1', target: 'device-2', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
    { id: 'e3', source: 'device-1', target: 'ip-1', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, label: 'C2 Connection', markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
    { id: 'e4', source: 'device-1', target: 'ip-2', style: { stroke: '#22c55e' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
    { id: 'e5', source: 'device-1', target: 'process-1', animated: true, style: { stroke: '#f97316' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } },
    { id: 'e6', source: 'process-1', target: 'file-1', style: { stroke: '#f97316' }, label: 'Downloaded', markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } },
    { id: 'e7', source: 'ip-1', target: 'domain-1', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
    { id: 'e8', source: 'device-2', target: 'alert-1', animated: true, style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
    { id: 'e9', source: 'process-1', target: 'domain-1', animated: true, style: { stroke: '#ef4444', strokeDasharray: '5,5' }, label: 'DNS Query', markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  ];

  const events = [
    { type: 'alert', title: 'Initial Phishing Email Received', description: 'User clicked malicious link in email', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
    { type: 'system', title: 'Malicious Macro Executed', description: 'Word document macro triggered PowerShell', timestamp: new Date(Date.now() - 55 * 60000).toISOString() },
    { type: 'alert', title: 'Suspicious Process Detected', description: 'Encoded PowerShell command executed', timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
    { type: 'system', title: 'C2 Connection Established', description: 'Outbound connection to 45.155.205.233', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
    { type: 'alert', title: 'Credential Theft Detected', description: 'LSASS memory access detected', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
    { type: 'action', title: 'Investigation Started', description: 'Incident assigned to SOC analyst', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
  ];

  return { nodes, edges, events };
};

export default function Investigation() {
  const [searchParams] = useSearchParams();
  const { incidents } = useAppStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [events, setEvents] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // Initialize with sample data
  useEffect(() => {
    const data = generateInvestigationData();
    setNodes(data.nodes);
    setEdges(data.edges);
    setEvents(data.events);
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedEntity(node);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500" />
            Investigation Workbench
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Interactive entity graph • Click nodes to inspect • Drag to rearrange
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              showLegend ? 'bg-cyber-500/20 text-cyber-400' : 'bg-dark-700 text-gray-400'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Legend</span>
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-cyber-500 text-white hover:bg-cyber-600 text-sm">
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Close Case</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Entity Graph */}
        <div className="xl:col-span-3">
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden relative" style={{ height: '600px' }}>
            {/* Legend overlay */}
            <AnimatePresence>
              {showLegend && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-4 left-4 z-10"
                >
                  <LegendPanel />
                </motion.div>
              )}
            </AnimatePresence>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              className="bg-dark-900"
              minZoom={0.3}
              maxZoom={2}
            >
              <Background color="#333" gap={20} size={1} />
              <Controls className="bg-dark-800 border-dark-700 rounded-lg overflow-hidden" />
              <MiniMap 
                className="bg-dark-800 border border-dark-700 rounded-lg"
                nodeColor={(node) => {
                  if (node.type === 'user') return '#3b82f6';
                  if (node.type === 'device') return '#a855f7';
                  if (node.type === 'ip') return node.data?.reputation === 'malicious' ? '#ef4444' : '#22c55e';
                  if (node.type === 'process') return '#06b6d4';
                  if (node.type === 'alert') return '#f97316';
                  return '#6b7280';
                }}
              />
            </ReactFlow>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedEntity ? (
              <EntityDetailsPanel
                key="details"
                entity={selectedEntity}
                onClose={() => setSelectedEntity(null)}
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-8 text-center"
              >
                <Target className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <h3 className="font-medium text-gray-400">Select an Entity</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any node to view details and perform OSINT lookups
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <TimelinePanel events={events} />
        </div>
      </div>
    </div>
  );
}
