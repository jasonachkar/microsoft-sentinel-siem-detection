import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Activity, TrendingUp, TrendingDown,
  Clock, Users, Globe, Zap, Target, ChevronRight,
  Play, Eye, Radio, Server, Lock, Mail, RefreshCw,
  CheckCircle, Wifi, WifiOff, ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { threatIntelService } from '../services/threatIntelService';
import { attackSimulator } from '../services/attackSimulator';
import { cn, formatRelativeTime, getSeverityBadge, getStatusColor } from '../services/utils';
import rulesData from '../data/rules.json';

// Stat Card Component
function StatCard({ title, value, change, trend, icon: Icon, color, onClick, href }) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 sm:p-5 cursor-pointer transition-all",
        "bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700",
        "hover:border-cyber-500/50 hover:shadow-lg hover:shadow-cyber-500/10"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-400 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs sm:text-sm",
              trend === 'up' ? 'text-red-400' : 'text-green-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span>{change}% from last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-2 sm:p-3 rounded-lg flex-shrink-0", `bg-${color}-500/20`)}>
          <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", `text-${color}-500`)} />
        </div>
      </div>
      <div className={cn("absolute -right-10 -bottom-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full opacity-20 blur-2xl", `bg-${color}-500`)} />
    </motion.div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return <div onClick={onClick}>{content}</div>;
}

// Live Event Feed Component
function LiveEventFeed({ events }) {
  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-green-500 animate-pulse" />
          <h3 className="font-semibold text-sm sm:text-base">Live Event Feed</h3>
        </div>
        <span className="text-xs sm:text-sm text-gray-400">{events.length} events</span>
      </div>
      
      <div className="h-64 sm:h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 20).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border-b border-dark-700/50",
                "hover:bg-dark-700/30 transition-colors cursor-pointer"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0",
                event.severity === 'Critical' ? 'bg-red-500' :
                event.severity === 'High' ? 'bg-orange-500' :
                event.severity === 'Medium' ? 'bg-yellow-500' :
                'bg-green-500'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{event.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{event.type}</p>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                {formatRelativeTime(event.timestamp)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
            <p className="text-sm text-center">No events yet</p>
            <Link to="/simulator" className="text-xs sm:text-sm text-cyber-400 hover:underline mt-2">
              Run an attack simulation →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  const scenarios = attackSimulator.getScenarios().slice(0, 4);
  
  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyber-500" />
        Quick Attack Simulations
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            to={`/simulator?scenario=${scenario.id}`}
            className={cn(
              "flex items-center gap-2 p-2 sm:p-3 rounded-lg transition-all",
              "bg-dark-700/50 hover:bg-dark-700 border border-transparent",
              "hover:border-cyber-500/30"
            )}
          >
            <span className="text-lg sm:text-xl">{scenario.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{scenario.name}</p>
              <p className={cn(
                "text-[10px] sm:text-xs",
                scenario.severity === 'Critical' ? 'text-red-400' :
                scenario.severity === 'High' ? 'text-orange-400' :
                'text-yellow-400'
              )}>
                {scenario.severity}
              </p>
            </div>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
          </Link>
        ))}
      </div>
      
      <Link
        to="/simulator"
        className="flex items-center justify-center gap-2 mt-3 p-2 rounded-lg text-xs sm:text-sm text-cyber-400 hover:bg-cyber-500/10 transition-colors"
      >
        <span>View All Scenarios</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// Threat Intelligence Summary with live status
function ThreatIntelSummary({ threatData, isLoading, isRealData }) {
  const items = [
    { label: 'Malicious IPs', value: threatData.maliciousIPs?.length || 0, icon: Globe, color: 'red' },
    { label: 'C2 Servers', value: threatData.c2Servers?.length || 0, icon: Server, color: 'orange' },
    { label: 'Malware Hashes', value: threatData.malwareHashes?.length || 0, icon: Lock, color: 'yellow' },
    { label: 'Phishing Domains', value: threatData.phishingDomains?.length || 0, icon: Mail, color: 'purple' },
  ];

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyber-500" />
          Threat Intelligence
        </h3>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin text-gray-500" />
          ) : isRealData ? (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-400">
              <Wifi className="w-3 h-3" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
              <WifiOff className="w-3 h-3" />
              Demo
            </span>
          )}
          <Link to="/threat-map" className="text-[10px] sm:text-xs text-cyber-400 hover:underline">
            Map →
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-dark-700/30"
            >
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0", `text-${item.color}-400`)} />
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold">{item.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {threatData.sources && (
        <div className="mt-3 pt-3 border-t border-dark-700">
          <p className="text-[10px] text-gray-500">
            Sources: {threatData.sources.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// MITRE Coverage Preview
function MitreCoveragePreview({ rules }) {
  const tactics = useMemo(() => {
    const tacticCounts = {};
    rules.forEach(rule => {
      (rule.tactics || []).forEach(tactic => {
        tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1;
      });
    });
    return Object.entries(tacticCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [rules]);

  const maxCount = Math.max(...tactics.map(t => t.count), 1);

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-cyber-500" />
          MITRE Coverage
        </h3>
        <Link to="/mitre" className="text-[10px] sm:text-xs text-cyber-400 hover:underline">
          Matrix →
        </Link>
      </div>
      
      <div className="space-y-2">
        {tactics.slice(0, 5).map((tactic) => (
          <div key={tactic.name} className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400 truncate">{tactic.name}</span>
              <span className="font-medium flex-shrink-0">{tactic.count}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(tactic.count / maxCount) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-full bg-gradient-to-r from-cyber-500 to-cyber-400 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Incidents
function RecentIncidents({ incidents }) {
  const navigate = useNavigate();

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-dark-700">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Recent Incidents
        </h3>
        <Link to="/incidents" className="text-[10px] sm:text-xs text-cyber-400 hover:underline">
          View All →
        </Link>
      </div>
      
      <div className="divide-y divide-dark-700/50">
        {incidents.slice(0, 5).map((incident) => (
          <div
            key={incident.id}
            onClick={() => navigate(`/incidents?highlight=${incident.id}`)}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-dark-700/30 transition-colors cursor-pointer"
          >
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              incident.severity === 'Critical' ? 'bg-red-500/20' :
              incident.severity === 'High' ? 'bg-orange-500/20' :
              'bg-yellow-500/20'
            )}>
              <AlertTriangle className={cn(
                "w-4 h-4 sm:w-5 sm:h-5",
                incident.severity === 'Critical' ? 'text-red-500' :
                incident.severity === 'High' ? 'text-orange-500' :
                'text-yellow-500'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{incident.title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 rounded-full", getSeverityBadge(incident.severity))}>
                  {incident.severity}
                </span>
                <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 rounded-full", getStatusColor(incident.status))}>
                  {incident.status}
                </span>
                {incident.isFromSimulator && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-500/20 text-cyber-400">
                    Simulated
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-sm text-gray-400">
                {formatRelativeTime(incident.createdAt)}
              </p>
            </div>
          </div>
        ))}
        
        {incidents.length === 0 && (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No incidents detected</p>
            <Link to="/simulator" className="text-xs sm:text-sm text-cyber-400 hover:underline mt-2 inline-block">
              Run an attack simulation →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Top Detection Rules
function TopRules({ rules }) {
  const topRules = useMemo(() => {
    return rules
      .filter(r => r.severity === 'High' || r.severity === 'Critical')
      .slice(0, 5);
  }, [rules]);

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyber-500" />
          High-Value Detections
        </h3>
        <Link to="/rules" className="text-[10px] sm:text-xs text-cyber-400 hover:underline">
          View All →
        </Link>
      </div>
      
      <div className="space-y-1 sm:space-y-2">
        {topRules.map((rule) => (
          <Link
            key={rule.id}
            to={`/rules/${rule.id}`}
            className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
          >
            <span className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              rule.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'
            )} />
            <span className="text-xs sm:text-sm flex-1 truncate">{rule.name}</span>
            <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">{rule.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { liveEvents, incidents, setConnectionStatus, setThreatIntel, threatIntel } = useAppStore();
  const [threatData, setThreatData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const rules = rulesData.rules || [];

  // Load threat intelligence data
  useEffect(() => {
    const loadThreatData = async () => {
      setIsLoading(true);
      try {
        const data = await threatIntelService.getThreatData();
        setThreatData(data);
        setThreatIntel(data);
        setConnectionStatus(data.isRealData ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Failed to load threat data:', error);
        setConnectionStatus('disconnected');
      }
      setIsLoading(false);
    };

    loadThreatData();
    const interval = setInterval(loadThreatData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [setConnectionStatus, setThreatIntel]);

  // Calculate stats
  const stats = useMemo(() => {
    const alertsLast24h = liveEvents.filter(e => {
      const time = new Date(e.timestamp);
      const now = new Date();
      return (now - time) < 24 * 60 * 60 * 1000;
    }).length;

    const openIncidents = incidents.filter(i => 
      i.status === 'New' || i.status === 'Triage' || i.status === 'Investigating'
    ).length;

    const criticalIncidents = incidents.filter(i => i.severity === 'Critical').length;

    return {
      alertsLast24h: alertsLast24h || 0,
      openIncidents: openIncidents,
      criticalIncidents: criticalIncidents,
      totalRules: rules.length,
      coverage: Math.round((new Set(rules.flatMap(r => r.techniques || [])).size / 50) * 100)
    };
  }, [liveEvents, incidents, rules]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Security Operations Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time threat monitoring and detection</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Live Data Status Banner */}
      {threatData.isRealData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4 flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-400">Live Threat Intelligence Active</p>
            <p className="text-xs text-gray-400">
              Fetching real data from {threatData.sources?.join(', ')}
            </p>
          </div>
          <Link to="/threat-map" className="text-xs text-cyber-400 hover:underline flex items-center gap-1">
            View Details <ExternalLink className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Alerts (24h)"
          value={stats.alertsLast24h}
          change={12}
          trend="up"
          icon={AlertTriangle}
          color="orange"
          href="/incidents"
        />
        <StatCard
          title="Open Incidents"
          value={stats.openIncidents}
          change={-5}
          trend="down"
          icon={Activity}
          color="red"
          href="/incidents"
        />
        <StatCard
          title="Active Rules"
          value={stats.totalRules}
          icon={Shield}
          color="cyber"
          href="/rules"
        />
        <StatCard
          title="MITRE Coverage"
          value={`${stats.coverage}%`}
          icon={Target}
          color="purple"
          href="/mitre"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <LiveEventFeed events={liveEvents} />
          <RecentIncidents incidents={incidents} />
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <ThreatIntelSummary 
            threatData={threatData} 
            isLoading={isLoading}
            isRealData={threatData.isRealData}
          />
          <MitreCoveragePreview rules={rules} />
          <TopRules rules={rules} />
        </div>
      </div>
    </div>
  );
}
