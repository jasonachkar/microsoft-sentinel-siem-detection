import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Shield, ChevronRight, ExternalLink, Search,
  Filter, Download, Eye, AlertTriangle, CheckCircle
} from 'lucide-react';
import { MITRE_TACTICS, MITRE_TECHNIQUES } from '../services/threatIntelService';
import { cn, getSeverityBadge } from '../services/utils';
import rulesData from '../data/rules.json';

// Technique Card Component
function TechniqueCard({ technique, techniqueId, rules, isSelected, onSelect }) {
  const coveredRules = rules.filter(r => 
    (r.techniques || []).some(t => t === techniqueId || t.startsWith(techniqueId + '.'))
  );
  const isCovered = coveredRules.length > 0;
  const highSeverityCount = coveredRules.filter(r => 
    r.severity === 'High' || r.severity === 'Critical'
  ).length;

  return (
    <motion.div
      layout
      onClick={() => onSelect(isCovered ? { id: techniqueId, ...technique, rules: coveredRules } : null)}
      className={cn(
        "relative p-2 rounded-lg text-xs cursor-pointer transition-all",
        "border border-transparent",
        isCovered 
          ? 'bg-cyber-500/20 hover:bg-cyber-500/30 hover:border-cyber-500/50' 
          : 'bg-dark-800/50 hover:bg-dark-800 text-gray-500',
        isSelected && 'border-cyber-500 ring-2 ring-cyber-500/20'
      )}
    >
      <div className="font-mono text-[10px] text-gray-500">{techniqueId}</div>
      <div className={cn(
        "font-medium mt-0.5 line-clamp-2",
        isCovered ? 'text-white' : 'text-gray-600'
      )}>
        {technique.name}
      </div>
      
      {isCovered && (
        <div className="flex items-center gap-1 mt-1">
          <Shield className="w-3 h-3 text-cyber-500" />
          <span className="text-cyber-400">{coveredRules.length}</span>
          {highSeverityCount > 0 && (
            <span className="ml-1 px-1 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px]">
              {highSeverityCount} high
            </span>
          )}
        </div>
      )}
      
      {!isCovered && (
        <div className="flex items-center gap-1 mt-1 text-gray-600">
          <AlertTriangle className="w-3 h-3" />
          <span>No coverage</span>
        </div>
      )}
    </motion.div>
  );
}

// Tactic Column Component
function TacticColumn({ tactic, techniques, rules, selectedTechnique, onSelectTechnique }) {
  const tacticTechniques = Object.entries(techniques).filter(([id, tech]) => 
    tech.tactic === tactic.id || 
    (tech.tactic && tech.tactic.includes && tactic.name.toLowerCase().includes(tech.tactic.toLowerCase()))
  );

  const coverage = useMemo(() => {
    let covered = 0;
    tacticTechniques.forEach(([id]) => {
      const hasCoverage = rules.some(r => 
        (r.techniques || []).some(t => t === id || t.startsWith(id + '.'))
      );
      if (hasCoverage) covered++;
    });
    return tacticTechniques.length > 0 
      ? Math.round((covered / tacticTechniques.length) * 100) 
      : 0;
  }, [tacticTechniques, rules]);

  return (
    <div className="flex flex-col min-w-[160px]">
      {/* Tactic Header */}
      <div 
        className="p-3 rounded-t-lg text-center font-medium text-sm"
        style={{ backgroundColor: tactic.color + '20', borderBottom: `2px solid ${tactic.color}` }}
      >
        <div className="text-white">{tactic.shortName}</div>
        <div className="text-xs text-gray-400 mt-1">{tactic.id}</div>
        <div className="flex items-center justify-center gap-1 mt-2">
          <div className="h-1.5 w-16 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ width: `${coverage}%`, backgroundColor: tactic.color }}
            />
          </div>
          <span className="text-xs text-gray-400">{coverage}%</span>
        </div>
      </div>

      {/* Techniques */}
      <div className="flex-1 space-y-2 p-2 bg-dark-900/50 rounded-b-lg overflow-y-auto max-h-[500px]">
        {tacticTechniques.map(([id, technique]) => (
          <TechniqueCard
            key={id}
            techniqueId={id}
            technique={technique}
            rules={rules}
            isSelected={selectedTechnique?.id === id}
            onSelect={onSelectTechnique}
          />
        ))}
        {tacticTechniques.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-4">
            No techniques mapped
          </div>
        )}
      </div>
    </div>
  );
}

// Selected Technique Detail Panel
function TechniqueDetail({ technique, onClose }) {
  if (!technique) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-400">{technique.id}</span>
            <a 
              href={`https://attack.mitre.org/techniques/${technique.id.replace('.', '/')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-400 hover:text-cyber-300"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <h3 className="text-xl font-bold mt-1">{technique.name}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-dark-700 rounded"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-400 font-medium">
          {technique.rules.length} Detection Rule{technique.rules.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-400 uppercase">Covering Rules</h4>
        {technique.rules.map(rule => (
          <Link
            key={rule.id}
            to={`/rules/${rule.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
          >
            <Shield className="w-5 h-5 text-cyber-500" />
            <div className="flex-1">
              <p className="font-medium">{rule.name}</p>
              <p className="text-sm text-gray-400">{rule.category}</p>
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(rule.severity))}>
              {rule.severity}
            </span>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-dark-700">
        <a
          href={`https://attack.mitre.org/techniques/${technique.id.replace('.', '/')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm"
        >
          View on MITRE ATT&CK
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

// Coverage Stats
function CoverageStats({ rules, techniques }) {
  const stats = useMemo(() => {
    const allTechniqueIds = Object.keys(techniques);
    const coveredTechniques = new Set();
    
    rules.forEach(rule => {
      (rule.techniques || []).forEach(t => coveredTechniques.add(t));
    });

    const coverage = Math.round((coveredTechniques.size / allTechniqueIds.length) * 100);
    
    const bySeverity = {
      Critical: rules.filter(r => r.severity === 'Critical').length,
      High: rules.filter(r => r.severity === 'High').length,
      Medium: rules.filter(r => r.severity === 'Medium').length,
      Low: rules.filter(r => r.severity === 'Low').length,
    };

    return {
      totalRules: rules.length,
      coveredTechniques: coveredTechniques.size,
      totalTechniques: allTechniqueIds.length,
      coverage,
      bySeverity
    };
  }, [rules, techniques]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
        <p className="text-3xl font-bold text-cyber-400">{stats.totalRules}</p>
        <p className="text-sm text-gray-400">Total Rules</p>
      </div>
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
        <p className="text-3xl font-bold text-green-400">{stats.coveredTechniques}</p>
        <p className="text-sm text-gray-400">Techniques Covered</p>
      </div>
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
        <p className="text-3xl font-bold">{stats.coverage}%</p>
        <p className="text-sm text-gray-400">Coverage Score</p>
      </div>
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
        <p className="text-3xl font-bold text-red-400">{stats.bySeverity.Critical + stats.bySeverity.High}</p>
        <p className="text-sm text-gray-400">High+ Severity</p>
      </div>
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 text-center">
        <p className="text-3xl font-bold text-orange-400">{stats.totalTechniques - stats.coveredTechniques}</p>
        <p className="text-sm text-gray-400">Gaps</p>
      </div>
    </div>
  );
}

export default function MitreNavigator() {
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoveredOnly, setShowCoveredOnly] = useState(false);
  const rules = rulesData.rules || [];

  // Filter techniques based on search
  const filteredTechniques = useMemo(() => {
    if (!searchQuery) return MITRE_TECHNIQUES;
    
    const query = searchQuery.toLowerCase();
    return Object.fromEntries(
      Object.entries(MITRE_TECHNIQUES).filter(([id, tech]) =>
        id.toLowerCase().includes(query) ||
        tech.name.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-cyber-500" />
            MITRE ATT&CK Navigator
          </h1>
          <p className="text-gray-400 mt-1">
            Visualize detection coverage across the ATT&CK framework
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search techniques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm w-64"
            />
          </div>
          
          <button
            onClick={() => setShowCoveredOnly(!showCoveredOnly)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              showCoveredOnly 
                ? 'bg-cyber-500/20 border-cyber-500 text-cyber-400' 
                : 'bg-dark-800 border-dark-700 hover:border-dark-600'
            )}
          >
            <Filter className="w-4 h-4" />
            Covered Only
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Coverage Stats */}
      <CoverageStats rules={rules} techniques={MITRE_TECHNIQUES} />

      {/* Matrix and Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* MITRE Matrix */}
        <div className="xl:col-span-3 overflow-x-auto">
          <div className="flex gap-2 pb-4 min-w-max">
            {MITRE_TACTICS.map(tactic => (
              <TacticColumn
                key={tactic.id}
                tactic={tactic}
                techniques={filteredTechniques}
                rules={rules}
                selectedTechnique={selectedTechnique}
                onSelectTechnique={setSelectedTechnique}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTechnique ? (
              <TechniqueDetail 
                key={selectedTechnique.id}
                technique={selectedTechnique} 
                onClose={() => setSelectedTechnique(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-6 text-center"
              >
                <Eye className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <h3 className="font-medium text-gray-400">Select a Technique</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any technique in the matrix to view coverage details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
        <h3 className="font-medium mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyber-500/30 border border-cyber-500" />
            <span className="text-sm">Covered by detection rules</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-dark-800 border border-dark-700" />
            <span className="text-sm text-gray-500">No coverage (gap)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs">high</span>
            <span className="text-sm">Contains high/critical severity rules</span>
          </div>
        </div>
      </div>
    </div>
  );
}
