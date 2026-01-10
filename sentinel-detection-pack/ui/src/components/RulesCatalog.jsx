import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Filter, ChevronRight, Clock,
  Target, AlertTriangle, Copy, Check, X, Play,
  TrendingUp, TrendingDown, BarChart3, Settings,
  Zap, Eye, ThumbsUp, ThumbsDown, GitBranch
} from 'lucide-react';
import { cn, getSeverityBadge } from '../services/utils';
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
  };
};

// Rule Card Component
function RuleCard({ rule, stats, isSelected, onClick }) {
  return (
    <motion.div
      layout
      onClick={onClick}
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
            "w-5 h-5",
            rule.severity === 'Critical' ? 'text-red-500' :
            rule.severity === 'High' ? 'text-orange-500' :
            rule.severity === 'Medium' ? 'text-yellow-500' :
            'text-green-500'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-0.5 rounded-full", getSeverityBadge(rule.severity))}>
              {rule.severity}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-300">
              {rule.category}
            </span>
            {/* Effectiveness indicator */}
            <div className={cn(
              "flex items-center gap-1 text-xs",
              stats.tuningScore >= 85 ? 'text-green-400' :
              stats.tuningScore >= 70 ? 'text-yellow-400' :
              'text-orange-400'
            )}>
              <BarChart3 className="w-3 h-3" />
              {stats.tuningScore}%
            </div>
          </div>
          
          <h3 className="font-semibold mt-2 line-clamp-1">{rule.name}</h3>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.alertsLast7d} alerts/7d</span>
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
              <Clock className="w-3 h-3" />
              <span>{stats.avgTimeToDetect}m TTD</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// Rule Detail View
function RuleDetail({ rule, stats, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const copyQuery = () => {
    navigator.clipboard.writeText(rule.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(rule.severity))}>
              {rule.severity}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-dark-700 text-gray-300">
              {rule.category}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              {rule.status || 'Production'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-xl font-bold mt-3">{rule.name}</h2>
        <p className="text-gray-400 mt-2 text-sm">{rule.description}</p>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-dark-700">
        <div className="flex gap-4">
          {['overview', 'effectiveness', 'tuning', 'query'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 text-sm font-medium border-b-2 transition-colors capitalize",
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
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Tactics</p>
              <div className="flex flex-wrap gap-1">
                {(rule.tactics || []).map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-dark-700">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Techniques</p>
              <div className="flex flex-wrap gap-1">
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
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Query Frequency</p>
              <p className="text-sm">{rule.queryFrequency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Query Period</p>
              <p className="text-sm">{rule.queryPeriod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Trigger</p>
              <p className="text-sm">{rule.triggerOperator} {rule.triggerThreshold}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Data Sources</p>
              <p className="text-sm">{(rule.dataTypes || []).join(', ')}</p>
            </div>
          </div>
        )}

        {activeTab === 'effectiveness' && (
          <div className="space-y-6">
            {/* Alert Volume */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyber-500" />
                Alert Volume
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <p className="text-2xl font-bold">{stats.alertsLast7d}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <p className="text-2xl font-bold">{stats.alertsLast30d}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>

            {/* Detection Quality */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyber-500" />
                Detection Quality
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-xl font-bold text-green-400">{stats.truePositiveRate}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">True Positive Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                    <span className="text-xl font-bold text-red-400">{stats.falsePositiveRate}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">False Positive Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span className="text-xl font-bold">{stats.avgTimeToDetect}m</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Avg Time to Detect</p>
                </div>
              </div>
            </div>

            {/* Tuning Score */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyber-500" />
                Tuning Score
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Health</span>
                  <span className={cn(
                    "font-medium",
                    stats.tuningScore >= 85 ? 'text-green-400' :
                    stats.tuningScore >= 70 ? 'text-yellow-400' :
                    'text-orange-400'
                  )}>{stats.tuningScore}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      stats.tuningScore >= 85 ? 'bg-green-500' :
                      stats.tuningScore >= 70 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    )}
                    style={{ width: `${stats.tuningScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tuning' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <h4 className="font-medium text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Known False Positives
              </h4>
              <p className="text-sm text-gray-400 mt-2">{rule.falsePositives || 'None documented'}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tuning Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-cyber-500 flex-shrink-0 mt-0.5" />
                  Adjust threshold values based on your environment baseline
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-cyber-500 flex-shrink-0 mt-0.5" />
                  Add known service accounts to allowlist
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-cyber-500 flex-shrink-0 mt-0.5" />
                  Consider time-based exclusions for maintenance windows
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Version History</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">v1.0.0</span>
                  <span className="text-xs text-gray-600">Initial release</span>
                </div>
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
                  <Play className="w-3 h-3" />
                  Try in Playground
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
            <pre className="bg-dark-950 rounded-lg p-4 overflow-x-auto text-xs font-mono text-green-400 max-h-80">
              {rule.query}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-dark-900/50 flex gap-3">
        <Link
          to={`/simulator`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          Test Detection
        </Link>
        <Link
          to={`/mitre`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-medium"
        >
          <Target className="w-4 h-4" />
          View in MITRE
        </Link>
      </div>
    </motion.div>
  );
}

export default function RulesCatalog() {
  const { ruleId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedRule, setSelectedRule] = useState(null);
  
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
    return { avgTuning, totalAlerts, avgFP };
  }, [rulesWithStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyber-500" />
            Detection Rules Catalog
          </h1>
          <p className="text-gray-400 mt-1">
            {rules.length} production-ready analytics rules with effectiveness metrics
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold">{rules.length}</p>
          <p className="text-sm text-gray-400">Total Rules</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className="text-3xl font-bold text-cyan-400">{overallStats.totalAlerts}</p>
          <p className="text-sm text-gray-400">Alerts (7d)</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className={cn("text-3xl font-bold", overallStats.avgTuning >= 80 ? 'text-green-400' : 'text-yellow-400')}>
            {overallStats.avgTuning}%
          </p>
          <p className="text-sm text-gray-400">Avg Tuning Score</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <p className={cn("text-3xl font-bold", overallStats.avgFP <= 15 ? 'text-green-400' : 'text-orange-400')}>
            {overallStats.avgFP}%
          </p>
          <p className="text-sm text-gray-400">Avg FP Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
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
          className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm outline-none"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules List */}
        <div className="space-y-3">
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
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-12 text-center"
              >
                <Shield className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400">Select a Rule</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any rule to view effectiveness metrics and tuning options
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
