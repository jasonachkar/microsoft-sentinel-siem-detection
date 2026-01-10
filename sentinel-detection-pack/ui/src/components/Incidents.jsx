import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, Clock, User, Target,
  ChevronRight, Shield, Activity, X,
  CheckCircle, Users, Filter, Plus, MoreVertical,
  Eye, MessageSquare, Paperclip, Timer, Zap,
  Trash2, RefreshCw, ExternalLink, Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn, formatRelativeTime, getSeverityBadge, getStatusColor, v4 as uuidv4 } from '../services/utils';

// Kanban columns configuration
const KANBAN_COLUMNS = [
  { id: 'New', title: 'New', color: 'cyan', icon: AlertTriangle, bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30' },
  { id: 'Triage', title: 'Triage', color: 'yellow', icon: Eye, bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/30' },
  { id: 'Investigating', title: 'Investigating', color: 'orange', icon: Search, bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30' },
  { id: 'Contained', title: 'Contained', color: 'purple', icon: Shield, bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30' },
  { id: 'Resolved', title: 'Resolved', color: 'green', icon: CheckCircle, bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30' },
];

// Sample analysts
const ANALYSTS = [
  { id: 'analyst-1', name: 'Sarah Chen', avatar: 'SC', color: 'bg-blue-500' },
  { id: 'analyst-2', name: 'Mike Johnson', avatar: 'MJ', color: 'bg-green-500' },
  { id: 'analyst-3', name: 'Alex Rivera', avatar: 'AR', color: 'bg-purple-500' },
  { id: 'analyst-4', name: 'Emma Wilson', avatar: 'EW', color: 'bg-orange-500' },
];

// SLA Timer Component
function SLATimer({ createdAt, slaMinutes, status }) {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'Resolved') return null;

  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  const remaining = slaMinutes - elapsed;
  const isBreached = remaining <= 0;
  const isWarning = remaining > 0 && remaining <= slaMinutes * 0.25;

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
      isBreached ? 'bg-red-500/20 text-red-400 animate-pulse' :
      isWarning ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-dark-700 text-gray-400'
    )}>
      <Timer className="w-3 h-3" />
      <span>{isBreached ? 'BREACHED' : `${remaining}m`}</span>
    </div>
  );
}

// Incident Card for Kanban
function IncidentCard({ incident, isHighlighted, onSelect, onAssign, onUpdateStatus }) {
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
        "bg-dark-800 rounded-lg border p-3 cursor-pointer group relative",
        "hover:border-cyber-500/50 transition-all",
        isHighlighted && "ring-2 ring-cyber-500 ring-offset-2 ring-offset-dark-900",
        incident.isFromSimulator && "border-l-4 border-l-cyber-500",
        incident.severity === 'Critical' && !incident.isFromSimulator && 'border-l-4 border-l-red-500 border-dark-700',
        incident.severity === 'High' && !incident.isFromSimulator && 'border-l-4 border-l-orange-500 border-dark-700',
        !incident.isFromSimulator && incident.severity !== 'Critical' && incident.severity !== 'High' && 'border-dark-700'
      )}
    >
      {/* Simulator badge */}
      {incident.isFromSimulator && (
        <div className="absolute -top-2 -right-2 bg-cyber-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          NEW
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getSeverityBadge(incident.severity))}>
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
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-6 z-20 w-44 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1"
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelect(incident); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAssign(incident); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Assign
                </button>
                <div className="border-t border-dark-700 my-1" />
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'Resolved'); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dark-700 flex items-center gap-2 text-green-400"
                >
                  <CheckCircle className="w-4 h-4" /> Resolve
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mt-2 line-clamp-2">{incident.title}</h4>

      {/* Techniques */}
      {incident.techniques?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {incident.techniques.slice(0, 2).map(tech => (
            <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-gray-400 font-mono">
              {tech}
            </span>
          ))}
          {incident.techniques.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-gray-500">
              +{incident.techniques.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dark-700">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {incident.alertCount || 1}
          </span>
          {incident.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {incident.comments}
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
function KanbanColumn({ column, incidents, highlightedId, onSelect, onAssign, onDrop, onUpdateStatus }) {
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
        "flex flex-col min-w-[280px] sm:min-w-[300px] lg:min-w-[320px] bg-dark-900/50 rounded-xl border transition-colors flex-shrink-0",
        isDragOver ? 'border-cyber-500 bg-cyber-500/5' : 'border-dark-700'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={cn("p-3 border-b rounded-t-xl", column.borderClass, column.bgClass)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", `text-${column.color}-500`)} />
            <h3 className="font-medium text-sm">{column.title}</h3>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              `bg-${column.color}-500/20 text-${column.color}-400`
            )}>
              {incidents.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('incidentId', incident.id)}
            >
              <IncidentCard
                incident={incident}
                isHighlighted={incident.id === highlightedId}
                onSelect={onSelect}
                onAssign={onAssign}
                onUpdateStatus={onUpdateStatus}
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
function IncidentDetail({ incident, onClose, onUpdateStatus, onNavigateToInvestigation }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!incident) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
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
        <div className="p-4 sm:p-6 border-b border-dark-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(incident.severity))}>
                  {incident.severity}
                </span>
                <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor(incident.status))}>
                  {incident.status}
                </span>
                {incident.isFromSimulator && (
                  <span className="text-xs px-2 py-1 rounded-full bg-cyber-500/20 text-cyber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Simulated
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-3 line-clamp-2">{incident.title}</h2>
              <p className="text-gray-400 mt-2 text-sm line-clamp-2">{incident.description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Actions */}
        <div className="px-4 sm:px-6 py-3 border-b border-dark-700 flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-400 mr-2 flex-shrink-0">Move to:</span>
          {KANBAN_COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => onUpdateStatus(incident.id, col.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
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
        <div className="px-4 sm:px-6 pt-4 border-b border-dark-700 overflow-x-auto">
          <div className="flex gap-4">
            {['overview', 'timeline', 'entities', 'evidence'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
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
        <div className="p-4 sm:p-6 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Created</span>
                    <span>{formatRelativeTime(incident.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Assignee</span>
                    <span>{incident.assignee?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Alert Count</span>
                    <span>{incident.alertCount || 1}</span>
                  </div>
                  {incident.tactics && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tactics</span>
                      <span className="text-right">{incident.tactics.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Entities</h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 rounded-lg bg-dark-700/50 text-center">
                    <p className="text-lg sm:text-xl font-bold">{incident.entities?.users || 0}</p>
                    <p className="text-xs text-gray-500">Users</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-dark-700/50 text-center">
                    <p className="text-lg sm:text-xl font-bold">{incident.entities?.ips || 0}</p>
                    <p className="text-xs text-gray-500">IPs</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-dark-700/50 text-center">
                    <p className="text-lg sm:text-xl font-bold">{incident.entities?.devices || 0}</p>
                    <p className="text-xs text-gray-500">Devices</p>
                  </div>
                </div>
              </div>

              {/* IOCs from simulator */}
              {incident.iocs && (
                <div className="sm:col-span-2">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Indicators of Compromise</h4>
                  <div className="flex flex-wrap gap-2">
                    {incident.iocs.ips?.map(ip => (
                      <code key={ip} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 font-mono">
                        {ip}
                      </code>
                    ))}
                    {incident.iocs.techniques?.map(tech => (
                      <code key={tech} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                        {tech}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation steps */}
              {incident.remediation && (
                <div className="sm:col-span-2">
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Remediation Steps</h4>
                  <ol className="space-y-1">
                    {incident.remediation.map((step, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
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
                  <div className="w-2 h-2 rounded-full bg-cyber-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{event.action}</p>
                    <p className="text-xs text-gray-500">{event.actor} • {formatRelativeTime(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Entity details available in Investigation</p>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Evidence and attachments</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-dark-700 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <button
            onClick={() => onNavigateToInvestigation(incident)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Open Investigation
          </button>
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
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const [searchParams] = useSearchParams();
  const { incidents, updateIncident, removeIncident, clearSimulatorIncidents } = useAppStore();
  
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  // Highlight incident from URL or navigation
  useEffect(() => {
    const incId = incidentId || searchParams.get('highlight');
    if (incId) {
      setHighlightedId(incId);
      const incident = incidents.find(inc => inc.id === incId);
      if (incident) {
        setSelectedIncident(incident);
        // Scroll to the incident after a short delay
        setTimeout(() => {
          const element = document.querySelector(`[data-incident-id="${incId}"]`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [incidentId, searchParams, incidents]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    if (!searchQuery) return incidents;
    const query = searchQuery.toLowerCase();
    return incidents.filter(inc =>
      inc.title.toLowerCase().includes(query) ||
      inc.description?.toLowerCase().includes(query) ||
      inc.techniques?.some(t => t.toLowerCase().includes(query))
    );
  }, [incidents, searchQuery]);

  // Group by status
  const incidentsByStatus = useMemo(() => {
    const grouped = {};
    KANBAN_COLUMNS.forEach(col => { grouped[col.id] = []; });
    
    filteredIncidents.forEach(inc => {
      const status = inc.status || 'New';
      if (grouped[status]) {
        grouped[status].push(inc);
      } else {
        grouped['New'].push(inc);
      }
    });
    
    // Sort by severity and time within each column
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        const severityDiff = (order[a.severity] || 4) - (order[b.severity] || 4);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
    
    return grouped;
  }, [filteredIncidents]);

  // Stats
  const stats = useMemo(() => ({
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'Critical').length,
    unassigned: incidents.filter(i => !i.assignee).length,
    fromSimulator: incidents.filter(i => i.isFromSimulator).length,
    breached: incidents.filter(i => {
      const elapsed = (Date.now() - new Date(i.createdAt).getTime()) / 60000;
      return elapsed > (i.slaMinutes || 60) && i.status !== 'Resolved';
    }).length,
  }), [incidents]);

  const handleDrop = useCallback((incidentId, newStatus) => {
    updateIncident(incidentId, { status: newStatus });
  }, [updateIncident]);

  const handleUpdateStatus = useCallback((incidentId, newStatus) => {
    updateIncident(incidentId, { status: newStatus });
    setSelectedIncident(prev => prev?.id === incidentId ? { ...prev, status: newStatus } : prev);
  }, [updateIncident]);

  const handleAssign = useCallback((incident) => {
    setAssignModal(incident);
  }, []);

  const confirmAssign = useCallback((analyst) => {
    if (assignModal) {
      updateIncident(assignModal.id, { assignee: analyst });
      setAssignModal(null);
    }
  }, [assignModal, updateIncident]);

  const handleNavigateToInvestigation = useCallback((incident) => {
    setSelectedIncident(null);
    navigate(`/investigation?incident=${incident.id}`);
  }, [navigate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-6 sm:w-8 h-6 sm:h-8 text-orange-500" />
            Incident Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Drag and drop to update status • {incidents.length} total incidents
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm"
            />
          </div>
          {stats.fromSimulator > 0 && (
            <button
              onClick={() => clearSimulatorIncidents()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm text-gray-400"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Simulated</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
          <p className="text-xs sm:text-sm text-gray-400">Total</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <p className="text-2xl sm:text-3xl font-bold text-red-400">{stats.critical}</p>
          <p className="text-xs sm:text-sm text-gray-400">Critical</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{stats.fromSimulator}</p>
          <p className="text-xs sm:text-sm text-gray-400">From Simulator</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <p className="text-2xl sm:text-3xl font-bold text-orange-400">{stats.breached}</p>
          <p className="text-xs sm:text-sm text-gray-400">SLA Breached</p>
        </div>
      </div>

      {/* Empty State */}
      {incidents.length === 0 && (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-8 sm:p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No Incidents Yet</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Run an attack simulation to generate incidents, or they will appear here when detected by your detection rules.
          </p>
          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-cyber-500 text-white font-medium hover:bg-cyber-600 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Launch Attack Simulator
          </Link>
        </div>
      )}

      {/* Kanban Board */}
      {incidents.length > 0 && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              incidents={incidentsByStatus[column.id] || []}
              highlightedId={highlightedId}
              onSelect={setSelectedIncident}
              onAssign={handleAssign}
              onDrop={handleDrop}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {/* Incident Detail Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <IncidentDetail
            incident={selectedIncident}
            onClose={() => {
              setSelectedIncident(null);
              setHighlightedId(null);
            }}
            onUpdateStatus={handleUpdateStatus}
            onNavigateToInvestigation={handleNavigateToInvestigation}
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
