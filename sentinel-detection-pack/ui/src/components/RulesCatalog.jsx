import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Filter, ChevronRight, ChevronDown,
  Clock, Target, Database, AlertTriangle, Copy, Check,
  ExternalLink, Play, X
} from 'lucide-react';
import { cn, getSeverityBadge } from '../services/utils';
import rulesData from '../data/rules.json';

// Rule Card Component
function RuleCard({ rule, isSelected, onClick }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all",
        "bg-dark-800/50 hover:bg-dark-800",
        isSelected 
          ? 'border-cyber-500 ring-2 ring-cyber-500/20' 
          : 'border-dark-700 hover:border-dark-600'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
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
          </div>
          
          <h3 className="font-semibold mt-2 line-clamp-1">{rule.name}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{rule.description}</p>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{(rule.techniques || []).join(', ') || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{rule.queryFrequency}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

// Rule Detail View
function RuleDetail({ rule, onClose }) {
  const [copied, setCopied] = useState(false);

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
        <p className="text-gray-400 mt-2">{rule.description}</p>
      </div>

      {/* Details Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 border-b border-dark-700">
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
              <a 
                key={t}
                href={`https://attack.mitre.org/techniques/${t.replace('.', '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 rounded bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 font-mono"
              >
                {t}
              </a>
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

      {/* False Positives */}
      {rule.falsePositives && (
        <div className="p-6 border-b border-dark-700">
          <p className="text-xs text-gray-500 uppercase mb-2">Known False Positives</p>
          <p className="text-sm text-yellow-400/80">{rule.falsePositives}</p>
        </div>
      )}

      {/* KQL Query */}
      <div className="p-6">
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
        <pre className="bg-dark-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-gray-300 max-h-80">
          {rule.query}
        </pre>
      </div>

      {/* Actions */}
      <div className="p-6 bg-dark-900/50 flex gap-3">
        <Link
          to={`/simulator`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(rules.map(r => r.category));
    return ['All', ...Array.from(cats).sort()];
  }, [rules]);

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchQuery || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rule.techniques || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || rule.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'All' || rule.severity === selectedSeverity;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [rules, searchQuery, selectedCategory, selectedSeverity]);

  // Select rule from URL param
  useMemo(() => {
    if (ruleId) {
      const rule = rules.find(r => r.id === ruleId);
      if (rule) setSelectedRule(rule);
    }
  }, [ruleId, rules]);

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
            {rules.length} production-ready analytics rules with MITRE ATT&CK mapping
          </p>
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

      {/* Results info */}
      <div className="text-sm text-gray-400">
        Showing {filteredRules.length} of {rules.length} rules
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules List */}
        <div className="space-y-3">
          {filteredRules.map(rule => (
            <RuleCard
              key={rule.id}
              rule={rule}
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
                  Click on any rule to view its full configuration and KQL query
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
