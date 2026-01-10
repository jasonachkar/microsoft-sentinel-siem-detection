import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, Filter, Clock, User, Target,
  ChevronRight, ChevronDown, Shield, Activity, X,
  CheckCircle, XCircle, Pause, Play
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn, formatRelativeTime, getSeverityBadge, getStatusColor } from '../services/utils';

// Sample incidents for demo
const SAMPLE_INCIDENTS = [
  {
    id: 'inc-001',
    title: 'Password Spray Attack from TOR Exit Node',
    description: 'Multiple failed authentication attempts detected from known TOR exit node targeting 15 accounts',
    severity: 'Critical',
    status: 'Investigating',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    assignee: 'Analyst-01',
    tactics: ['Credential Access', 'Initial Access'],
    techniques: ['T1110.003'],
    entities: { users: 15, ips: 1, devices: 0 },
    alertCount: 45,
  },
  {
    id: 'inc-002',
    title: 'Suspicious Service Principal Activity',
    description: 'New service principal created with credential addition within 5 minutes',
    severity: 'High',
    status: 'Triage',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignee: 'Analyst-02',
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1136.003'],
    entities: { users: 1, ips: 2, devices: 0 },
    alertCount: 3,
  },
  {
    id: 'inc-003',
    title: 'Potential Data Exfiltration',
    description: 'Unusual outbound data volume (175MB) to rare external destination in Russia',
    severity: 'Critical',
    status: 'New',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    assignee: null,
    tactics: ['Exfiltration'],
    techniques: ['T1041'],
    entities: { users: 0, ips: 2, devices: 1 },
    alertCount: 2,
  },
  {
    id: 'inc-004',
    title: 'LSASS Memory Access Detected',
    description: 'Credential dumping attempt using procdump.exe on WORKSTATION-01',
    severity: 'Critical',
    status: 'Contained',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    assignee: 'Analyst-01',
    tactics: ['Credential Access'],
    techniques: ['T1003.001'],
    entities: { users: 1, ips: 0, devices: 1 },
    alertCount: 5,
  },
  {
    id: 'inc-005',
    title: 'MFA Fatigue Attack',
    description: 'Multiple MFA denials (12) for erin@contoso.com from suspicious IP',
    severity: 'High',
    status: 'Investigating',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    assignee: 'Analyst-03',
    tactics: ['Credential Access'],
    techniques: ['T1621'],
    entities: { users: 1, ips: 1, devices: 0 },
    alertCount: 12,
  },
];

const STATUS_OPTIONS = ['New', 'Triage', 'Investigating', 'Contained', 'Resolved', 'Closed'];

// Incident Row Component
function IncidentRow({ incident, isSelected, onClick }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "p-4 border-b border-dark-700 cursor-pointer transition-all",
        "hover:bg-dark-800/50",
        isSelected && 'bg-dark-800 border-l-2 border-l-cyber-500'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Severity Indicator */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          incident.severity === 'Critical' ? 'bg-red-500/20' :
          incident.severity === 'High' ? 'bg-orange-500/20' :
          'bg-yellow-500/20'
        )}>
          <AlertTriangle className={cn(
            "w-5 h-5",
            incident.severity === 'Critical' ? 'text-red-500' :
            incident.severity === 'High' ? 'text-orange-500' :
            'text-yellow-500'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-0.5 rounded-full", getSeverityBadge(incident.severity))}>
              {incident.severity}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(incident.status))}>
              {incident.status}
            </span>
            <span className="text-xs text-gray-500">#{incident.id}</span>
          </div>
          
          <h3 className="font-semibold mt-2 line-clamp-1">{incident.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">{incident.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(incident.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {incident.assignee || 'Unassigned'}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {incident.alertCount} alerts
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 mt-2" />
      </div>
    </motion.div>
  );
}

// Incident Detail Panel
function IncidentDetail({ incident, onClose, onUpdateStatus }) {
  const [expanded, setExpanded] = useState({ timeline: true, entities: false });

  if (!incident) return null;

  const timeline = [
    { time: incident.createdAt, action: 'Incident created', actor: 'System' },
    { time: new Date(new Date(incident.createdAt).getTime() + 5 * 60000).toISOString(), action: 'Alerts correlated', actor: 'System' },
    ...(incident.assignee ? [{ 
      time: new Date(new Date(incident.createdAt).getTime() + 15 * 60000).toISOString(), 
      action: `Assigned to ${incident.assignee}`, 
      actor: 'Analyst-Lead' 
    }] : []),
    ...(incident.status === 'Investigating' || incident.status === 'Contained' ? [{
      time: new Date(new Date(incident.createdAt).getTime() + 30 * 60000).toISOString(),
      action: 'Investigation started',
      actor: incident.assignee
    }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden h-fit"
    >
      {/* Header */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(incident.severity))}>
              {incident.severity}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor(incident.status))}>
              {incident.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-lg font-bold mt-3">{incident.title}</h2>
        <p className="text-sm text-gray-400 mt-2">{incident.description}</p>
      </div>

      {/* Status Actions */}
      <div className="p-4 border-b border-dark-700 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            onClick={() => onUpdateStatus(incident.id, status)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              incident.status === status
                ? 'bg-cyber-500 text-white'
                : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Details */}
      <div className="p-4 border-b border-dark-700 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase">Created</p>
          <p>{formatRelativeTime(incident.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Assignee</p>
          <p>{incident.assignee || 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Alerts</p>
          <p>{incident.alertCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">MITRE</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {incident.techniques.map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-dark-700 font-mono">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Entities */}
      <div className="border-b border-dark-700">
        <button
          onClick={() => setExpanded(prev => ({ ...prev, entities: !prev.entities }))}
          className="w-full p-4 flex items-center justify-between hover:bg-dark-700/50"
        >
          <span className="font-medium">Entities</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded.entities && "rotate-180")} />
        </button>
        <AnimatePresence>
          {expanded.entities && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl font-bold">{incident.entities.users}</p>
                  <p className="text-xs text-gray-500">Users</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl font-bold">{incident.entities.ips}</p>
                  <p className="text-xs text-gray-500">IPs</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl font-bold">{incident.entities.devices}</p>
                  <p className="text-xs text-gray-500">Devices</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <div>
        <button
          onClick={() => setExpanded(prev => ({ ...prev, timeline: !prev.timeline }))}
          className="w-full p-4 flex items-center justify-between hover:bg-dark-700/50"
        >
          <span className="font-medium">Timeline</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", expanded.timeline && "rotate-180")} />
        </button>
        <AnimatePresence>
          {expanded.timeline && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyber-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.actor} • {formatRelativeTime(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4 bg-dark-900/50 flex gap-2">
        <Link
          to={`/investigation?incident=${incident.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          Investigate
        </Link>
        <Link
          to={`/mitre`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-medium"
        >
          <Target className="w-4 h-4" />
          View MITRE
        </Link>
      </div>
    </motion.div>
  );
}

export default function Incidents() {
  const { incidents: storeIncidents, updateIncident } = useAppStore();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');

  // Combine sample and store incidents
  const allIncidents = useMemo(() => {
    return [...storeIncidents, ...SAMPLE_INCIDENTS];
  }, [storeIncidents]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return allIncidents.filter(incident => {
      const matchesSearch = !searchQuery ||
        incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
      const matchesSeverity = filterSeverity === 'All' || incident.severity === filterSeverity;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [allIncidents, searchQuery, filterStatus, filterSeverity]);

  // Stats
  const stats = useMemo(() => ({
    total: allIncidents.length,
    critical: allIncidents.filter(i => i.severity === 'Critical').length,
    open: allIncidents.filter(i => ['New', 'Triage', 'Investigating'].includes(i.status)).length,
    unassigned: allIncidents.filter(i => !i.assignee).length,
  }), [allIncidents]);

  const handleUpdateStatus = (id, status) => {
    updateIncident(id, { status });
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => ({ ...prev, status }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Incidents
          </h1>
          <p className="text-gray-400 mt-1">
            Manage and investigate security incidents
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
          <p className="text-sm text-gray-400">Critical</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{stats.open}</p>
          <p className="text-sm text-gray-400">Open</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.unassigned}</p>
          <p className="text-sm text-gray-400">Unassigned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents List */}
        <div className="bg-dark-800/30 rounded-xl border border-dark-700 overflow-hidden">
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <span className="font-medium">Incident Queue</span>
            <span className="text-sm text-gray-400">{filteredIncidents.length} incidents</span>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredIncidents.map(incident => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onClick={() => setSelectedIncident(incident)}
              />
            ))}
            {filteredIncidents.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incidents match your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              <IncidentDetail
                key={selectedIncident.id}
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-12 text-center"
              >
                <AlertTriangle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400">Select an Incident</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any incident to view details and take action
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
