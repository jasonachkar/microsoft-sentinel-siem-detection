import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Clock, Shield,
  AlertTriangle, Target, Activity, Calendar, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { cn } from '../services/utils';
import { useAppStore } from '../store/appStore';
import rulesData from '../data/rules.json';

// Sample metrics data
const ALERTS_TREND = [
  { date: 'Mon', critical: 12, high: 25, medium: 45, low: 20 },
  { date: 'Tue', critical: 8, high: 32, medium: 52, low: 18 },
  { date: 'Wed', critical: 15, high: 28, medium: 48, low: 22 },
  { date: 'Thu', critical: 10, high: 35, medium: 55, low: 25 },
  { date: 'Fri', critical: 18, high: 40, medium: 60, low: 30 },
  { date: 'Sat', critical: 5, high: 15, medium: 25, low: 12 },
  { date: 'Sun', critical: 3, high: 10, medium: 18, low: 8 },
];

const INCIDENT_RESPONSE = [
  { hour: '00:00', mttd: 5, mttr: 45 },
  { hour: '04:00', mttd: 8, mttr: 60 },
  { hour: '08:00', mttd: 3, mttr: 25 },
  { hour: '12:00', mttd: 4, mttr: 30 },
  { hour: '16:00', mttd: 6, mttr: 40 },
  { hour: '20:00', mttd: 7, mttr: 55 },
];

const DETECTION_CATEGORIES = [
  { name: 'Identity', value: 5, color: '#14b8a6' },
  { name: 'Endpoint', value: 3, color: '#f97316' },
  { name: 'Cloud', value: 3, color: '#8b5cf6' },
  { name: 'Email', value: 2, color: '#ec4899' },
  { name: 'Network', value: 2, color: '#3b82f6' },
];

const TOP_DETECTIONS = [
  { name: 'Password Spray', count: 156, severity: 'High' },
  { name: 'Impossible Travel', count: 89, severity: 'Medium' },
  { name: 'Service Principal Abuse', count: 45, severity: 'Critical' },
  { name: 'Encoded PowerShell', count: 38, severity: 'High' },
  { name: 'MFA Fatigue', count: 32, severity: 'High' },
];

const FALSE_POSITIVE_TREND = [
  { week: 'W1', rate: 28 },
  { week: 'W2', rate: 24 },
  { week: 'W3', rate: 22 },
  { week: 'W4', rate: 18 },
  { week: 'W5', rate: 15 },
  { week: 'W6', rate: 12 },
];

// Metric Card Component
function MetricCard({ title, value, change, trend, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              trend === 'up' ? (color === 'green' ? 'text-green-400' : 'text-red-400') : 
                              (color === 'green' ? 'text-red-400' : 'text-green-400')
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(change)}% vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          `bg-${color}-500/20`
        )}>
          <Icon className={cn("w-6 h-6", `text-${color}-500`)} />
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 shadow-xl">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Metrics() {
  const [timeRange, setTimeRange] = useState('7d');
  const { liveEvents, incidents } = useAppStore();
  const rules = rulesData.rules || [];

  // Calculate real-time metrics
  const metrics = useMemo(() => {
    const alertsLast24h = liveEvents.filter(e => {
      const time = new Date(e.timestamp);
      return (Date.now() - time.getTime()) < 24 * 60 * 60 * 1000;
    }).length;

    const openIncidents = incidents.filter(i => 
      ['New', 'Triage', 'Investigating'].includes(i.status)
    ).length;

    return {
      alertsLast24h: alertsLast24h || 142,
      openIncidents: openIncidents || 8,
      mttd: 4.2,
      mttr: 32,
      falsePositiveRate: 12,
      coverageScore: 78
    };
  }, [liveEvents, incidents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyber-500" />
            Security Metrics
          </h1>
          <p className="text-gray-400 mt-1">
            Performance analytics and operational insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Alerts (24h)"
          value={metrics.alertsLast24h}
          change={12}
          trend="up"
          icon={AlertTriangle}
          color="orange"
        />
        <MetricCard
          title="Open Incidents"
          value={metrics.openIncidents}
          change={-15}
          trend="down"
          icon={Activity}
          color="red"
        />
        <MetricCard
          title="MTTD"
          value={`${metrics.mttd}m`}
          subtitle="Mean Time to Detect"
          change={-8}
          trend="down"
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="MTTR"
          value={`${metrics.mttr}m`}
          subtitle="Mean Time to Respond"
          change={-12}
          trend="down"
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="False Positive Rate"
          value={`${metrics.falsePositiveRate}%`}
          change={-3}
          trend="down"
          icon={Target}
          color="green"
        />
        <MetricCard
          title="MITRE Coverage"
          value={`${metrics.coverageScore}%`}
          change={5}
          trend="up"
          icon={Shield}
          color="cyber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Trend */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">Alert Volume by Severity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ALERTS_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} name="Critical" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="High" />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="Medium" />
                <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Low" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">Detection & Response Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INCIDENT_RESPONSE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="mttd" stroke="#14b8a6" strokeWidth={2} name="MTTD (min)" dot={{ fill: '#14b8a6' }} />
                <Line type="monotone" dataKey="mttr" stroke="#8b5cf6" strokeWidth={2} name="MTTR (min)" dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Categories */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">Rules by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DETECTION_CATEGORIES}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DETECTION_CATEGORIES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Detections */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">Top Firing Detections</h3>
          <div className="space-y-3">
            {TOP_DETECTIONS.map((detection, index) => (
              <div key={detection.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-4">{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{detection.name}</span>
                    <span className="text-sm text-gray-400">{detection.count}</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(detection.count / TOP_DETECTIONS[0].count) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        detection.severity === 'Critical' ? 'bg-red-500' :
                        detection.severity === 'High' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* False Positive Trend */}
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">False Positive Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FALSE_POSITIVE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" fill="#14b8a6" radius={[4, 4, 0, 0]} name="FP Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyber-900/50 to-cyber-800/30 rounded-xl border border-cyber-700/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-cyber-400" />
            <div>
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-sm text-gray-400">Active Rules</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Production-ready detection coverage</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl border border-purple-700/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold">14</p>
              <p className="text-sm text-gray-400">MITRE Tactics</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Full enterprise framework coverage</p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-xl border border-orange-700/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm text-gray-400">Uptime</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Detection pipeline reliability</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl border border-green-700/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold">&lt;5min</p>
              <p className="text-sm text-gray-400">Avg Detection</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Time from event to alert</p>
        </div>
      </div>
    </div>
  );
}
