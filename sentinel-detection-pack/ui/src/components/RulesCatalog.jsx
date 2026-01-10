import { useState, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, ChevronRight, Clock,
  Target, AlertTriangle, Copy, Check, X, Play,
  TrendingUp, TrendingDown, BarChart3, Settings,
  Zap, Eye, ThumbsUp, ThumbsDown, GitBranch,
  Activity, Filter, Code, Terminal, CheckCircle,
  XCircle, Beaker, FileText, ExternalLink
} from 'lucide-react';
import { cn, getSeverityBadge, formatRelativeTime } from '../services/utils';
import rulesData from '../data/rules.json';

// Simulated rule effectiveness data
const generateRuleStats = (ruleId) => {
  const seed = ruleId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    alertsLast30d: Math.floor((seed % 100) * 3 + 50),
    alertsLast7d: Math.floor((seed % 50) * 2 + 10),
    trend: seed % 3 === 0 ? 'up' : seed % 3 === 1 ? 'down' : 'stable',
    trendPercent: Math.floor(seed % 25) + 5,
    falsePositiveRate: Math.floor(seed % 20) + 5,
    truePositiveRate: 100 - Math.floor(seed % 20) - 5,
    avgTimeToDetect: Math.floor(seed % 10) + 2,
    lastTriggered: new Date(Date.now() - (seed % 48) * 60 * 60 * 1000).toISOString(),
    tuningScore: Math.floor(seed % 30) + 70,
    testsRun: Math.floor(seed % 20) + 5,
    testsPassed: Math.floor(seed % 15) + 5,
  };
};

// Test Result Component
function TestResult({ passed, name }) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg text-sm",
      passed ? "bg-green-500/10" : "bg-red-500/10"
    )}>
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={passed ? "text-green-400" : "text-red-400"}>{name}</span>
    </div>
  );
}

// Effectiveness Gauge
function EffectivenessGauge({ value, label, color = 'cyber' }) {
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-dark-700"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={`${value * 2.2} 220`}
            className={`text-${color}-500`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{label}</p>
    </div>
  );
}

// Rule Card Component
function RuleCard({ rule, stats, isSelected, onClick }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "p-3 sm:p-4 rounded-xl border cursor-pointer transition-all",
        "bg-dark-800/50 hover:bg-dark-800",
        isSelected 
          ? 'border-cyber-500 ring-2 ring-cyber-500/20' 
          : 'border-dark-700 hover:border-dark-600'
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          rule.severity === 'Critical' ? 'bg-red-500/20' :
          rule.severity === 'High' ? 'bg-orange-500/20' :
          rule.severity === 'Medium' ? 'bg-yellow-500/20' :
          'bg-green-500/20'
        )}>
          <Shield className={cn(
            "w-4 h-4 sm:w-5 sm:h-5",
            rule.severity === 'Critical' ? 'text-red-500' :
            rule.severity === 'High' ? 'text-orange-500' :
            rule.severity === 'Medium' ? 'text-yellow-500' :
            'text-green-500'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 rounded-full", getSeverityBadge(rule.severity))}>
              {rule.severity}
            </span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-300">
              {rule.category}
            </span>
            {/* Health indicator */}
            <div className={cn(
              "flex items-center gap-1 text-[10px] sm:text-xs ml-auto",
              stats.tuningScore >= 85 ? 'text-green-400' :
              stats.tuningScore >= 70 ? 'text-yellow-400' :
              'text-orange-400'
            )}>
              <Activity className="w-3 h-3" />
              {stats.tuningScore}%
            </div>
          </div>
          
          <h3 className="font-semibold text-sm sm:text-base mt-2 line-clamp-1">{rule.name}</h3>
          
          {/* Quick stats */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2 text-[10px] sm:text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.alertsLast7d}/7d</span>
            </div>
            <div className={cn(
              "flex items-center gap-1",
              stats.trend === 'up' ? 'text-red-400' : 
              stats.trend === 'down' ? 'text-green-400' : 
              'text-gray-400'
            )}>
              {stats.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
               stats.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {stats.trend !== 'stable' && `${stats.trendPercent}%`}
            </div>
            <div className="flex items-center gap-1">
              <Beaker className="w-3 h-3" />
              <span>{stats.testsPassed}/{stats.testsRun}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// Rule Detail View
function RuleDetail({ rule, stats, onClose, onTest }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyQuery = () => {
    navigator.clipboard.writeText(rule.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTest = async () => {
    setIsTesting(true);
    // Simulate test execution
    await new Promise(r => setTimeout(r, 2000));
    setTestResults([
      { name: 'Syntax validation', passed: true },
      { name: 'Schema compatibility', passed: true },
      { name: 'Sample data detection', passed: Math.random() > 0.2 },
      { name: 'Performance threshold', passed: Math.random() > 0.3 },
      { name: 'False positive check', passed: Math.random() > 0.4 },
    ]);
    setIsTesting(false);
  };

  if (!rule) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-dark-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(rule.severity))}>
              {rule.severity}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-gray-300">
              {rule.category}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              Production
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-lg sm:text-xl font-bold mt-3">{rule.name}</h2>
        <p className="text-gray-400 mt-2 text-sm">{rule.description}</p>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 border-b border-dark-700 overflow-x-auto">
        <div className="flex gap-4">
          {['overview', 'effectiveness', 'testing', 'query'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
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
      <div className="p-4 sm:p-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">MITRE ATT&CK</p>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-400">Tactics</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(rule.tactics || []).map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded bg-dark-700">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Techniques</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(rule.techniques || []).map(t => (
                      <Link 
                        key={t}
                        to={`/mitre?technique=${t}`}
                        className="text-xs px-2 py-1 rounded bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 font-mono"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Configuration</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency</span>
                  <span className="font-mono text-xs">{rule.queryFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lookback</span>
                  <span className="font-mono text-xs">{rule.queryPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trigger</span>
                  <span className="font-mono text-xs">{rule.triggerOperator} {rule.triggerThreshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Sources</span>
                  <span className="text-xs">{(rule.dataTypes || []).join(', ')}</span>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase mb-2">Recent Activity</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl sm:text-2xl font-bold">{stats.alertsLast7d}</p>
                  <p className="text-xs text-gray-500">Alerts (7d)</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl sm:text-2xl font-bold">{stats.alertsLast30d}</p>
                  <p className="text-xs text-gray-500">Alerts (30d)</p>
                </div>
                <div className="p-3 rounded-lg bg-dark-700/50 text-center">
                  <p className="text-xl sm:text-2xl font-bold">{stats.avgTimeToDetect}m</p>
                  <p className="text-xs text-gray-500">Avg TTD</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effectiveness' && (
          <div className="space-y-6">
            {/* Gauges */}
            <div className="flex justify-around">
              <EffectivenessGauge value={stats.truePositiveRate} label="True Positive Rate" color="green" />
              <EffectivenessGauge value={stats.tuningScore} label="Tuning Score" color="cyber" />
              <EffectivenessGauge value={100 - stats.falsePositiveRate} label="Accuracy" color="blue" />
            </div>

            {/* Metrics bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Detection Rate</span>
                  <span className="text-green-400 font-medium">{stats.truePositiveRate}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.truePositiveRate}%` }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">False Positive Rate</span>
                  <span className="text-red-400 font-medium">{stats.falsePositiveRate}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.falsePositiveRate}%` }}
                    className="h-full bg-red-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Tuning Recommendations */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h4 className="font-medium text-yellow-400 flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Tuning Recommendations
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  Add service accounts to allowlist to reduce FPs
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  Consider time-based exclusions for maintenance windows
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-4">
            {/* Run test button */}
            <button
              onClick={runTest}
              disabled={isTesting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyber-500 hover:bg-cyber-600 text-white font-medium disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Beaker className="w-5 h-5" />
                  </motion.div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Detection Test
                </>
              )}
            </button>

            {/* Test results */}
            {testResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Test Results</span>
                  <span className={cn(
                    "font-medium",
                    testResults.filter(r => r.passed).length === testResults.length ? 'text-green-400' : 'text-yellow-400'
                  )}>
                    {testResults.filter(r => r.passed).length}/{testResults.length} passed
                  </span>
                </div>
                {testResults.map((result, i) => (
                  <TestResult key={i} {...result} />
                ))}
              </motion.div>
            )}

            {/* Sample data */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Test Against Sample Data</p>
              <div className="grid grid-cols-2 gap-2">
                {['SigninLogs', 'AuditLogs', 'DeviceProcessEvents', 'OfficeActivity'].map(table => (
                  <button
                    key={table}
                    className="p-2 rounded-lg bg-dark-700/50 hover:bg-dark-700 text-sm text-left flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    {table}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'query' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase">KQL Query</p>
              <div className="flex items-center gap-2">
                <Link
                  to={`/kql?query=${encodeURIComponent(rule.query)}`}
                  className="flex items-center gap-1 text-xs text-cyber-400 hover:text-cyber-300"
                >
                  <Terminal className="w-3 h-3" />
                  Open in Playground
                </Link>
                <button
                  onClick={copyQuery}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="bg-dark-950 rounded-lg p-4 overflow-x-auto text-xs font-mono text-green-400 max-h-60 sm:max-h-80">
              {rule.query}
            </pre>
            
            {/* Query Analysis */}
            <div className="mt-4 p-3 rounded-lg bg-dark-700/50">
              <p className="text-xs text-gray-500 uppercase mb-2">Query Analysis</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tables Used</span>
                  <span className="font-mono text-xs">{(rule.dataTypes || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Complexity</span>
                  <span className="text-yellow-400">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Cost</span>
                  <span className="text-green-400">Low</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Runtime</span>
                  <span className="font-mono text-xs">~2.3s</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-6 bg-dark-900/50 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link
          to={`/simulator`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          Trigger with Simulator
        </Link>
        <Link
          to={`/mitre`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-medium"
        >
          <Target className="w-4 h-4" />
          View in MITRE Matrix
        </Link>
      </div>
    </motion.div>
  );
}

export default function RulesCatalog() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedRule, setSelectedRule] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  const rules = rulesData.rules || [];

  // Generate stats for each rule
  const rulesWithStats = useMemo(() => {
    return rules.map(rule => ({
      ...rule,
      stats: generateRuleStats(rule.id)
    }));
  }, [rules]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(rules.map(r => r.category));
    return ['All', ...Array.from(cats).sort()];
  }, [rules]);

  // Filter rules
  const filteredRules = useMemo(() => {
    return rulesWithStats.filter(rule => {
      const matchesSearch = !searchQuery || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rule.techniques || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'All' || rule.severity === selectedSeverity;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [rulesWithStats, searchQuery, selectedCategory, selectedSeverity]);

  // Select rule from URL param
  useMemo(() => {
    if (ruleId) {
      const rule = rulesWithStats.find(r => r.id === ruleId);
      if (rule) setSelectedRule(rule);
    }
  }, [ruleId, rulesWithStats]);

  // Overall stats
  const overallStats = useMemo(() => {
    const avgTuning = Math.round(rulesWithStats.reduce((a, r) => a + r.stats.tuningScore, 0) / rulesWithStats.length);
    const totalAlerts = rulesWithStats.reduce((a, r) => a + r.stats.alertsLast7d, 0);
    const avgFP = Math.round(rulesWithStats.reduce((a, r) => a + r.stats.falsePositiveRate, 0) / rulesWithStats.length);
    const totalTests = rulesWithStats.reduce((a, r) => a + r.stats.testsRun, 0);
    const passedTests = rulesWithStats.reduce((a, r) => a + r.stats.testsPassed, 0);
    return { avgTuning, totalAlerts, avgFP, totalTests, passedTests };
  }, [rulesWithStats]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-500" />
            Detection Rules
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {rules.length} production rules with effectiveness metrics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-2xl sm:text-3xl font-bold">{rules.length}</p>
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyber-500" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Total Rules</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{overallStats.totalAlerts}</p>
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Alerts (7d)</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className={cn("text-2xl sm:text-3xl font-bold", overallStats.avgTuning >= 80 ? 'text-green-400' : 'text-yellow-400')}>
              {overallStats.avgTuning}%
            </p>
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Avg Health</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">
              {Math.round((overallStats.passedTests / overallStats.totalTests) * 100)}%
            </p>
            <Beaker className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Tests Pass</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-4">
        <div className="relative flex-1 min-w-[200px] sm:min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search rules, techniques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 sm:px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 sm:px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Rules List */}
        <div className="space-y-2 sm:space-y-3">
          {filteredRules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
              stats={rule.stats}
              isSelected={selectedRule?.id === rule.id}
              onClick={() => setSelectedRule(rule)}
            />
          ))}
          
          {filteredRules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rules match your filters</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedRule ? (
              <RuleDetail 
                key={selectedRule.id}
                rule={selectedRule}
                stats={selectedRule.stats}
                onClose={() => setSelectedRule(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-8 sm:p-12 text-center"
              >
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400">Select a Rule</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any rule to view effectiveness metrics, run tests, and explore the query
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
