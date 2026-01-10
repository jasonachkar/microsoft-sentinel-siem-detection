import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  AlertTriangle, Search, Clock, User, Target,
  ChevronRight, ChevronDown, Shield, Activity, X,
  CheckCircle, Users, Filter, Plus, MoreVertical,
  GripVertical, Eye, MessageSquare, Paperclip, Timer
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn, formatRelativeTime, getSeverityBadge, getStatusColor, v4 as uuidv4 } from '../services/utils';

// Kanban columns configuration
const KANBAN_COLUMNS = [
  { id: 'New', title: 'New', color: 'cyan', icon: AlertTriangle },
  { id: 'Triage', title: 'Triage', color: 'yellow', icon: Eye },
  { id: 'Investigating', title: 'Investigating', color: 'orange', icon: Search },
  { id: 'Contained', title: 'Contained', color: 'purple', icon: Shield },
  { id: 'Resolved', title: 'Resolved', color: 'green', icon: CheckCircle },
];

// Sample analysts
const ANALYSTS = [
  { id: 'analyst-1', name: 'Sarah Chen', avatar: 'SC', color: 'bg-blue-500' },
  { id: 'analyst-2', name: 'Mike Johnson', avatar: 'MJ', color: 'bg-green-500' },
  { id: 'analyst-3', name: 'Alex Rivera', avatar: 'AR', color: 'bg-purple-500' },
  { id: 'analyst-4', name: 'Emma Wilson', avatar: 'EW', color: 'bg-orange-500' },
];

// Generate sample incidents
const generateSampleIncidents = () => [
  {
    id: uuidv4(),
    title: 'Password Spray Attack from TOR Exit Node',
    description: 'Multiple failed authentication attempts from known TOR exit node targeting 15 accounts',
    severity: 'Critical',
    status: 'New',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    assignee: null,
    tactics: ['Credential Access', 'Initial Access'],
    techniques: ['T1110.003'],
    entities: { users: 15, ips: 1, devices: 0 },
    alertCount: 45,
    comments: 2,
    attachments: 1,
    slaMinutes: 60,
  },
  {
    id: uuidv4(),
    title: 'Suspicious Service Principal Activity',
    description: 'New service principal created with credential addition within 5 minutes',
    severity: 'High',
    status: 'Triage',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    assignee: ANALYSTS[0],
    tactics: ['Persistence', 'Privilege Escalation'],
    techniques: ['T1136.003'],
    entities: { users: 1, ips: 2, devices: 0 },
    alertCount: 3,
    comments: 5,
    attachments: 2,
    slaMinutes: 120,
  },
  {
    id: uuidv4(),
    title: 'Potential Data Exfiltration',
    description: 'Unusual outbound data volume (175MB) to rare external destination',
    severity: 'Critical',
    status: 'Investigating',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    assignee: ANALYSTS[1],
    tactics: ['Exfiltration'],
    techniques: ['T1041'],
    entities: { users: 0, ips: 2, devices: 1 },
    alertCount: 2,
    comments: 8,
    attachments: 3,
    slaMinutes: 30,
  },
  {
    id: uuidv4(),
    title: 'LSASS Memory Access Detected',
    description: 'Credential dumping attempt using procdump.exe on WORKSTATION-01',
    severity: 'Critical',
    status: 'Contained',
    createdAt: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    assignee: ANALYSTS[0],
    tactics: ['Credential Access'],
    techniques: ['T1003.001'],
    entities: { users: 1, ips: 0, devices: 1 },
    alertCount: 5,
    comments: 12,
    attachments: 4,
    slaMinutes: 30,
  },
  {
    id: uuidv4(),
    title: 'MFA Fatigue Attack',
    description: 'Multiple MFA denials (12) for erin@contoso.com from suspicious IP',
    severity: 'High',
    status: 'New',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    assignee: null,
    tactics: ['Credential Access'],
    techniques: ['T1621'],
    entities: { users: 1, ips: 1, devices: 0 },
    alertCount: 12,
    comments: 0,
    attachments: 0,
    slaMinutes: 45,
  },
  {
    id: uuidv4(),
    title: 'Suspicious Inbox Forwarding Rule',
    description: 'New inbox rule created forwarding all email to external domain',
    severity: 'High',
    status: 'Investigating',
    createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    assignee: ANALYSTS[2],
    tactics: ['Collection'],
    techniques: ['T1114.003'],
    entities: { users: 1, ips: 1, devices: 0 },
    alertCount: 1,
    comments: 4,
    attachments: 1,
    slaMinutes: 60,
  },
  {
    id: uuidv4(),
    title: 'Encoded PowerShell Execution',
    description: 'Base64 encoded PowerShell with download cradle detected',
    severity: 'High',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    assignee: ANALYSTS[3],
    tactics: ['Execution'],
    techniques: ['T1059.001'],
    entities: { users: 1, ips: 0, devices: 1 },
    alertCount: 3,
    comments: 15,
    attachments: 6,
    slaMinutes: 45,
  },
];

// SLA Timer Component
function SLATimer({ createdAt, slaMinutes, status }) {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  const remaining = slaMinutes - elapsed;
  const percentage = Math.min((elapsed / slaMinutes) * 100, 100);
  const isBreached = remaining <= 0;
  const isWarning = remaining > 0 && remaining <= slaMinutes * 0.25;

  if (status === 'Resolved') return null;

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
      isBreached ? 'bg-red-500/20 text-red-400' :
      isWarning ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-dark-700 text-gray-400'
    )}>
      <Timer className="w-3 h-3" />
      <span>{isBreached ? 'BREACHED' : `${remaining}m`}</span>
    </div>
  );
}

// Incident Card for Kanban
function IncidentCard({ incident, onSelect, onAssign }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      layoutId={incident.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(incident)}
      className={cn(
        "bg-dark-800 rounded-lg border p-3 cursor-pointer group",
        "hover:border-cyber-500/50 transition-all",
        incident.severity === 'Critical' ? 'border-l-4 border-l-red-500 border-dark-700' :
        incident.severity === 'High' ? 'border-l-4 border-l-orange-500 border-dark-700' :
        'border-dark-700'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs px-1.5 py-0.5 rounded", getSeverityBadge(incident.severity))}>
            {incident.severity}
          </span>
          <SLATimer createdAt={incident.createdAt} slaMinutes={incident.slaMinutes} status={incident.status} />
        </div>
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded hover:bg-dark-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 w-40 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700">View Details</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700">Assign</button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700 text-red-400">Close</button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mt-2 line-clamp-2">{incident.title}</h4>

      {/* Techniques */}
      <div className="flex flex-wrap gap-1 mt-2">
        {incident.techniques.map(tech => (
          <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-gray-400 font-mono">
            {tech}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-700">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {incident.alertCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {incident.comments}
          </span>
          {incident.attachments > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              {incident.attachments}
            </span>
          )}
        </div>

        {incident.assignee ? (
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white",
            incident.assignee.color
          )} title={incident.assignee.name}>
            {incident.assignee.avatar}
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAssign(incident); }}
            className="w-6 h-6 rounded-full border border-dashed border-gray-600 flex items-center justify-center hover:border-cyber-500 hover:text-cyber-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Time */}
      <p className="text-[10px] text-gray-600 mt-2">{formatRelativeTime(incident.createdAt)}</p>
    </motion.div>
  );
}

// Kanban Column
function KanbanColumn({ column, incidents, onSelect, onAssign, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const Icon = column.icon;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const incidentId = e.dataTransfer.getData('incidentId');
    if (incidentId) {
      onDrop(incidentId, column.id);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col min-w-[300px] max-w-[350px] bg-dark-900/50 rounded-xl border transition-colors",
        isDragOver ? 'border-cyber-500 bg-cyber-500/5' : 'border-dark-700'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", `text-${column.color}-500`)} />
            <h3 className="font-medium">{column.title}</h3>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              `bg-${column.color}-500/20 text-${column.color}-400`
            )}>
              {incidents.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        <AnimatePresence mode="popLayout">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('incidentId', incident.id)}
            >
              <IncidentCard
                incident={incident}
                onSelect={onSelect}
                onAssign={onAssign}
              />
            </div>
          ))}
        </AnimatePresence>
        
        {incidents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-600">
            <Icon className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-xs">No incidents</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Incident Detail Modal
function IncidentDetail({ incident, onClose, onUpdateStatus, analysts }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!incident) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-dark-800 rounded-xl border border-dark-700 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(incident.severity))}>
                  {incident.severity}
                </span>
                <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor(incident.status))}>
                  {incident.status}
                </span>
                {incident.techniques.map(tech => (
                  <span key={tech} className="text-xs px-2 py-1 rounded bg-dark-700 font-mono">{tech}</span>
                ))}
              </div>
              <h2 className="text-xl font-bold mt-3">{incident.title}</h2>
              <p className="text-gray-400 mt-2">{incident.description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Actions */}
        <div className="px-6 py-3 border-b border-dark-700 flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-400 mr-2">Move to:</span>
          {KANBAN_COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => onUpdateStatus(incident.id, col.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                incident.status === col.id
                  ? `bg-${col.color}-500 text-white`
                  : 'bg-dark-700 hover:bg-dark-600'
              )}
            >
              {col.title}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-dark-700">
          <div className="flex gap-4">
            {['overview', 'timeline', 'entities', 'evidence'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === tab
                    ? 'border-cyber-500 text-cyber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span>{formatRelativeTime(incident.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assignee</span>
                    <span>{incident.assignee?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alert Count</span>
                    <span>{incident.alertCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tactics</span>
                    <span>{incident.tactics.join(', ')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Entities</h4>
                <div className="grid grid-cols-3 gap-3">
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
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {[
                { time: incident.createdAt, action: 'Incident created', actor: 'System' },
                { time: new Date(new Date(incident.createdAt).getTime() + 5 * 60000).toISOString(), action: 'Alerts correlated', actor: 'System' },
                { time: new Date(new Date(incident.createdAt).getTime() + 10 * 60000).toISOString(), action: 'Enrichment completed', actor: 'System' },
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyber-500 mt-2" />
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="text-xs text-gray-500">{event.actor} • {formatRelativeTime(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Entity details would appear here</p>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Evidence and attachments would appear here</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-700 flex justify-between">
          <Link
            to={`/investigation?incident=${incident.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Open Investigation
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Incidents() {
  const { incidents: storeIncidents, updateIncident, addIncident } = useAppStore();
  const [localIncidents, setLocalIncidents] = useState(generateSampleIncidents);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModal, setAssignModal] = useState(null);

  // Combine store and local incidents
  const allIncidents = useMemo(() => {
    const combined = [...storeIncidents, ...localIncidents];
    if (!searchQuery) return combined;
    return combined.filter(inc =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [storeIncidents, localIncidents, searchQuery]);

  // Group by status
  const incidentsByStatus = useMemo(() => {
    const grouped = {};
    KANBAN_COLUMNS.forEach(col => { grouped[col.id] = []; });
    allIncidents.forEach(inc => {
      if (grouped[inc.status]) {
        grouped[inc.status].push(inc);
      } else {
        grouped['New'].push(inc);
      }
    });
    // Sort by severity within each column
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.severity] || 4) - (order[b.severity] || 4);
      });
    });
    return grouped;
  }, [allIncidents]);

  // Stats
  const stats = useMemo(() => ({
    total: allIncidents.length,
    critical: allIncidents.filter(i => i.severity === 'Critical').length,
    unassigned: allIncidents.filter(i => !i.assignee).length,
    breached: allIncidents.filter(i => {
      const elapsed = (Date.now() - new Date(i.createdAt).getTime()) / 60000;
      return elapsed > i.slaMinutes && i.status !== 'Resolved';
    }).length,
  }), [allIncidents]);

  const handleDrop = useCallback((incidentId, newStatus) => {
    setLocalIncidents(prev => prev.map(inc =>
      inc.id === incidentId ? { ...inc, status: newStatus } : inc
    ));
    updateIncident(incidentId, { status: newStatus });
  }, [updateIncident]);

  const handleUpdateStatus = useCallback((incidentId, newStatus) => {
    setLocalIncidents(prev => prev.map(inc =>
      inc.id === incidentId ? { ...inc, status: newStatus } : inc
    ));
    updateIncident(incidentId, { status: newStatus });
    setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
  }, [updateIncident]);

  const handleAssign = useCallback((incident) => {
    setAssignModal(incident);
  }, []);

  const confirmAssign = useCallback((analyst) => {
    if (assignModal) {
      setLocalIncidents(prev => prev.map(inc =>
        inc.id === assignModal.id ? { ...inc, assignee: analyst } : inc
      ));
      setAssignModal(null);
    }
  }, [assignModal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Incident Management
          </h1>
          <p className="text-gray-400 mt-1">
            Drag and drop incidents to update status • SOC Kanban Board
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-400">Total Incidents</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
          <p className="text-sm text-gray-400">Critical</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold text-yellow-400">{stats.unassigned}</p>
          <p className="text-sm text-gray-400">Unassigned</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold text-orange-400">{stats.breached}</p>
          <p className="text-sm text-gray-400">SLA Breached</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            incidents={incidentsByStatus[column.id] || []}
            onSelect={setSelectedIncident}
            onAssign={handleAssign}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Incident Detail Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetail
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onUpdateStatus={handleUpdateStatus}
            analysts={ANALYSTS}
          />
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-dark-800 rounded-xl border border-dark-700 p-6"
            >
              <h3 className="font-bold text-lg mb-4">Assign Incident</h3>
              <div className="space-y-2">
                {ANALYSTS.map(analyst => (
                  <button
                    key={analyst.id}
                    onClick={() => confirmAssign(analyst)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white", analyst.color)}>
                      {analyst.avatar}
                    </div>
                    <span>{analyst.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAssignModal(null)}
                className="w-full mt-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
