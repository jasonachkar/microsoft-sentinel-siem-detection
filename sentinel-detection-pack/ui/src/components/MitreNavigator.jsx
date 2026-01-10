import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Shield, AlertTriangle, Users, Globe,
  ChevronRight, Search, Eye, Zap, Info, X,
  CheckCircle, XCircle, Map as MapIcon, Clock
} from 'lucide-react';
import { cn, getSeverityBadge } from '../services/utils';
import { MITRE_TACTICS, MITRE_TECHNIQUES, THREAT_ACTORS } from '../services/threatIntelService';
import rulesData from '../data/rules.json';

// Build technique to rules mapping
const buildTechniqueRulesMap = () => {
  const map = {};
  (rulesData.rules || []).forEach(rule => {
    (rule.techniques || []).forEach(tech => {
      if (!map[tech]) map[tech] = [];
      map[tech].push(rule);
    });
  });
  return map;
};

// Technique Cell Component
function TechniqueCell({ technique, hasCoverage, selectedTechnique, onClick, actorTechniques }) {
  const isActorTech = actorTechniques.includes(technique.id);
  
  return (
    <button
      onClick={() => onClick(technique)}
      className={cn(
        "p-2 rounded-lg text-xs font-medium transition-all text-left relative",
        "border min-h-[60px]",
        selectedTechnique?.id === technique.id && "ring-2 ring-cyber-500",
        hasCoverage
          ? 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
          : 'bg-dark-800/50 border-dark-700 hover:bg-dark-700',
        isActorTech && !hasCoverage && 'bg-red-500/20 border-red-500/30',
        isActorTech && hasCoverage && 'bg-yellow-500/20 border-yellow-500/30'
      )}
    >
      <span className="text-[10px] text-gray-500 font-mono">{technique.id}</span>
      <p className="line-clamp-2 mt-0.5">{technique.name}</p>
      
      {/* Coverage/Actor indicator */}
      <div className="absolute top-1 right-1 flex gap-0.5">
        {hasCoverage && (
          <div className="w-2 h-2 rounded-full bg-green-500" title="Has Detection" />
        )}
        {isActorTech && (
          <div className="w-2 h-2 rounded-full bg-red-500" title="Used by Selected Threat Actor" />
        )}
      </div>
    </button>
  );
}

// Tactic Column Component
function TacticColumn({ tactic, techniques, techniqueRules, selectedTechnique, onSelectTechnique, actorTechniques }) {
  const covered = techniques.filter(t => techniqueRules[t.id]).length;
  const total = techniques.length;
  const coverage = total > 0 ? Math.round((covered / total) * 100) : 0;

  return (
    <div className="flex flex-col min-w-[160px] max-w-[180px]">
      {/* Tactic Header */}
      <div 
        className="p-3 rounded-t-lg border-b-2 mb-2"
        style={{ backgroundColor: `${tactic.color}20`, borderColor: tactic.color }}
      >
        <h3 className="font-semibold text-sm" style={{ color: tactic.color }}>
          {tactic.shortName}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-gray-500">{tactic.id}</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            coverage === 100 ? 'bg-green-500/20 text-green-400' :
            coverage >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {coverage}% coverage
          </span>
        </div>
      </div>

      {/* Techniques */}
      <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-400px)] pr-1">
        {techniques.map(tech => (
          <TechniqueCell
            key={tech.id}
            technique={tech}
            hasCoverage={!!techniqueRules[tech.id]}
            selectedTechnique={selectedTechnique}
            onClick={onSelectTechnique}
            actorTechniques={actorTechniques}
          />
        ))}
      </div>
    </div>
  );
}

// Threat Actor Card
function ThreatActorCard({ actor, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border text-left transition-all w-full",
        isSelected
          ? 'bg-red-500/20 border-red-500'
          : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
      )}
    >
      <div className="flex items-center gap-2">
        <Users className={cn("w-5 h-5", isSelected ? 'text-red-500' : 'text-gray-500')} />
        <span className="font-medium">{actor.name}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {actor.aliases.slice(0, 2).map(alias => (
          <span key={alias} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-gray-400">
            {alias}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <Globe className="w-3 h-3" />
        <span>{actor.origin}</span>
      </div>
    </button>
  );
}

// Technique Detail Panel
function TechniqueDetail({ technique, rules, onClose }) {
  if (!technique) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden"
    >
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-gray-500">{technique.id}</span>
            <h3 className="text-lg font-bold mt-1">{technique.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
        {/* Coverage Status */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyber-500" />
            Detection Coverage
          </h4>
          {rules.length > 0 ? (
            <div className="space-y-2">
              {rules.map(rule => (
                <Link
                  key={rule.id}
                  to={`/rules/${rule.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{rule.name}</p>
                    <p className="text-xs text-gray-500">{rule.category}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", getSeverityBadge(rule.severity))}>
                    {rule.severity}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-4 h-4" />
                <span className="font-medium">No Detection Coverage</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                This technique is not currently covered by any detection rule in this pack.
              </p>
            </div>
          )}
        </div>

        {/* Related Threat Actors */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            Known Threat Actors
          </h4>
          <div className="flex flex-wrap gap-2">
            {THREAT_ACTORS.filter(a => a.techniques.includes(technique.id)).map(actor => (
              <span key={actor.id} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                {actor.name}
              </span>
            ))}
            {!THREAT_ACTORS.some(a => a.techniques.includes(technique.id)) && (
              <span className="text-xs text-gray-500">No known actors mapped to this technique</span>
            )}
          </div>
        </div>

        {/* MITRE Link */}
        <div>
          <a
            href={`https://attack.mitre.org/techniques/${technique.id.replace('.', '/')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-cyber-400 hover:text-cyber-300"
          >
            <Info className="w-4 h-4" />
            View on MITRE ATT&CK
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-dark-900/50 flex gap-3">
        <Link
          to={`/simulator`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          Simulate Attack
        </Link>
        <Link
          to={`/kql`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          Build Detection
        </Link>
      </div>
    </motion.div>
  );
}

export default function MitreNavigator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [showActors, setShowActors] = useState(false);

  // Build mappings
  const techniqueRulesMap = useMemo(() => buildTechniqueRulesMap(), []);
  
  // Build full technique list from MITRE_TECHNIQUES
  const allTechniques = useMemo(() => {
    return Object.entries(MITRE_TECHNIQUES).map(([id, tech]) => ({
      id,
      name: tech.name,
      tactic: tech.tactic
    }));
  }, []);

  // Group techniques by tactic
  const techniquesByTactic = useMemo(() => {
    const grouped = {};
    MITRE_TACTICS.forEach(tactic => {
      grouped[tactic.id] = allTechniques.filter(t => t.tactic === tactic.id);
    });
    return grouped;
  }, [allTechniques]);

  // Actor techniques
  const actorTechniques = useMemo(() => {
    if (!selectedActor) return [];
    return selectedActor.techniques;
  }, [selectedActor]);

  // Coverage stats
  const coverageStats = useMemo(() => {
    const covered = Object.keys(techniqueRulesMap).length;
    const total = allTechniques.length;
    return {
      covered,
      total,
      percentage: total > 0 ? Math.round((covered / total) * 100) : 0
    };
  }, [techniqueRulesMap, allTechniques]);

  // Gap analysis
  const gaps = useMemo(() => {
    return allTechniques.filter(t => !techniqueRulesMap[t.id]);
  }, [allTechniques, techniqueRulesMap]);

  // Handle URL params
  useEffect(() => {
    const techId = searchParams.get('technique');
    if (techId) {
      const tech = allTechniques.find(t => t.id === techId);
      if (tech) setSelectedTechnique(tech);
    }
  }, [searchParams, allTechniques]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-500" />
            MITRE ATT&CK Navigator
          </h1>
          <p className="text-gray-400 mt-1">
            Interactive attack matrix with detection coverage analysis
          </p>
        </div>
        
        <button
          onClick={() => setShowActors(!showActors)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
            showActors 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-dark-700 hover:bg-dark-600'
          )}
        >
          <Users className="w-4 h-4" />
          Threat Actors
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-green-400">{coverageStats.covered}</p>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-sm text-gray-400">Techniques Covered</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-red-400">{gaps.length}</p>
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-400">Detection Gaps</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">{coverageStats.percentage}%</p>
            <Shield className="w-6 h-6 text-cyber-500" />
          </div>
          <p className="text-sm text-gray-400">Overall Coverage</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold">{THREAT_ACTORS.length}</p>
            <Users className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-sm text-gray-400">Threat Actors Tracked</p>
        </div>
      </div>

      {/* Threat Actors Panel */}
      <AnimatePresence>
        {showActors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                Threat Actor Tracking
                <span className="text-xs text-gray-500">
                  (Select to highlight their techniques)
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {THREAT_ACTORS.map(actor => (
                  <ThreatActorCard
                    key={actor.id}
                    actor={actor}
                    isSelected={selectedActor?.id === actor.id}
                    onClick={() => setSelectedActor(selectedActor?.id === actor.id ? null : actor)}
                  />
                ))}
              </div>
              
              {selectedActor && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-medium text-red-400">{selectedActor.name}</h4>
                      <p className="text-xs text-gray-400">
                        Origin: {selectedActor.origin} | Targets: {selectedActor.targets.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500">Known Techniques:</span>
                    {selectedActor.techniques.map(tech => (
                      <span 
                        key={tech}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-mono",
                          techniqueRulesMap[tech] 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search techniques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:border-cyber-500 outline-none text-sm"
        />
      </div>

      {/* Matrix + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* MITRE Matrix */}
        <div className="xl:col-span-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-4">
            {MITRE_TACTICS.map(tactic => (
              <TacticColumn
                key={tactic.id}
                tactic={tactic}
                techniques={techniquesByTactic[tactic.id] || []}
                techniqueRules={techniqueRulesMap}
                selectedTechnique={selectedTechnique}
                onSelectTechnique={setSelectedTechnique}
                actorTechniques={actorTechniques}
              />
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:sticky xl:top-24 xl:self-start">
          <AnimatePresence mode="wait">
            {selectedTechnique ? (
              <TechniqueDetail
                key={selectedTechnique.id}
                technique={selectedTechnique}
                rules={techniqueRulesMap[selectedTechnique.id] || []}
                onClose={() => setSelectedTechnique(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 p-8 text-center"
              >
                <MapIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <h3 className="font-medium text-gray-400">Select a Technique</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click on any technique to view detection coverage and related threat actors
                </p>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-dark-700 space-y-2">
                  <p className="text-xs text-gray-500 uppercase mb-3">Legend</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Has Detection Coverage</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Used by Selected Threat Actor</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Covered + Actor Match</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
