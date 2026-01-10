import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, ChevronRight, AlertTriangle,
  Shield, Target, Clock, Zap, CheckCircle, Radio,
  Activity, Eye, ChevronDown
} from 'lucide-react';
import { attackSimulator, ATTACK_SCENARIOS } from '../services/attackSimulator';
import { useAppStore } from '../store/appStore';
import { cn, formatRelativeTime, getSeverityBadge } from '../services/utils';

// Scenario Card Component
function ScenarioCard({ scenario, isSelected, isRunning, onSelect, onStart }) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(scenario)}
      className={cn(
        "relative p-5 rounded-xl border cursor-pointer transition-all",
        "bg-dark-800/50 hover:bg-dark-800",
        isSelected 
          ? 'border-cyber-500 ring-2 ring-cyber-500/20' 
          : 'border-dark-700 hover:border-dark-600'
      )}
    >
      {/* Severity indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-3 h-3 rounded-full",
        scenario.severity === 'Critical' ? 'bg-red-500 animate-pulse' :
        scenario.severity === 'High' ? 'bg-orange-500' :
        'bg-yellow-500'
      )} />

      <div className="flex items-start gap-4">
        <div className="text-4xl">{scenario.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{scenario.name}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{scenario.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={cn("text-xs px-2 py-1 rounded-full", getSeverityBadge(scenario.severity))}>
              {scenario.severity}
            </span>
            {scenario.tactics.map(tactic => (
              <span 
                key={tactic}
                className="text-xs px-2 py-1 rounded-full bg-dark-700 text-gray-300"
              >
                {tactic}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.round(scenario.duration / 1000)}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>{scenario.techniques.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {isSelected && !isRunning && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onStart(scenario);
          }}
          className={cn(
            "w-full mt-4 py-3 rounded-lg font-medium transition-all",
            "bg-cyber-500 hover:bg-cyber-600 text-white",
            "flex items-center justify-center gap-2"
          )}
        >
          <Play className="w-5 h-5" />
          Launch Attack Simulation
        </motion.button>
      )}
    </motion.div>
  );
}

// Progress Timeline Component
function ProgressTimeline({ phases, currentPhase, progress }) {
  return (
    <div className="space-y-2">
      {phases.map((phase, index) => {
        const isComplete = progress > phase.progress;
        const isCurrent = currentPhase?.name === phase.name;
        
        return (
          <div key={phase.name} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              isComplete ? 'bg-green-500' :
              isCurrent ? 'bg-cyber-500 animate-pulse' :
              'bg-dark-700'
            )}>
              {isComplete ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                isCurrent ? 'text-cyber-400' : isComplete ? 'text-green-400' : 'text-gray-500'
              )}>
                {phase.name}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(phase.progress)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Live Event Stream Component
function LiveEventStream({ events }) {
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-dark-700 bg-dark-800">
        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
        <span className="font-medium">Live Event Stream</span>
        <span className="ml-auto text-sm text-gray-500">{events.length} events</span>
      </div>
      <div className="h-80 overflow-y-auto font-mono text-xs">
        <AnimatePresence mode="popLayout">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(20, 184, 166, 0.2)' }}
              animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-2 p-2 border-b border-dark-800",
                event.severity === 'Critical' ? 'bg-red-500/5' :
                event.severity === 'High' ? 'bg-orange-500/5' :
                ''
              )}
            >
              <span className="text-gray-600 flex-shrink-0">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn(
                "flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] uppercase",
                event.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                event.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                event.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              )}>
                {event.type}
              </span>
              <span className="text-gray-300 flex-1">{event.title}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-600">
            Waiting for events...
          </div>
        )}
      </div>
    </div>
  );
}

// Generated Incident Component
function GeneratedIncident({ incident }) {
  const [expanded, setExpanded] = useState(false);

  if (!incident) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-dark-800 rounded-xl border border-red-500/30 overflow-hidden"
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-dark-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Incident Generated</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", getSeverityBadge(incident.severity))}>
              {incident.severity}
            </span>
          </div>
          <p className="text-sm text-gray-400">{incident.title}</p>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 transition-transform",
          expanded && "rotate-180"
        )} />
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-dark-700 space-y-3">
              <p className="text-sm text-gray-400">{incident.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Tactics</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {incident.tactics.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-dark-700">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Techniques</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {incident.techniques.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-dark-700 font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors text-sm font-medium">
                  Investigate Incident
                </button>
                <button className="flex-1 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-medium">
                  View in MITRE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AttackSimulator() {
  const [searchParams] = useSearchParams();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [events, setEvents] = useState([]);
  const [generatedIncident, setGeneratedIncident] = useState(null);
  const { setAttackMode, addLiveEvent, addIncident } = useAppStore();

  const scenarios = Object.values(ATTACK_SCENARIOS);

  // Auto-select scenario from URL
  useEffect(() => {
    const scenarioId = searchParams.get('scenario');
    if (scenarioId) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) setSelectedScenario(scenario);
    }
  }, [searchParams, scenarios]);

  // Subscribe to simulator events
  useEffect(() => {
    const unsubEvent = attackSimulator.onEvent((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100));
      addLiveEvent(event);
      
      // Check for incident
      if (event.incident) {
        setGeneratedIncident(event.incident);
        addIncident(event.incident);
      }
    });

    const unsubProgress = attackSimulator.onProgress((p) => {
      setProgress(p);
    });

    const unsubPhase = attackSimulator.onPhase((phase) => {
      setCurrentPhase(phase);
    });

    return () => {
      unsubEvent();
      unsubProgress();
      unsubPhase();
    };
  }, [addLiveEvent, addIncident]);

  const handleStart = useCallback(async (scenario) => {
    setIsRunning(true);
    setProgress(0);
    setEvents([]);
    setGeneratedIncident(null);
    setCurrentPhase(null);
    setAttackMode(true, scenario);

    try {
      const incident = await attackSimulator.startSimulation(scenario.id);
      setGeneratedIncident(incident);
    } finally {
      setIsRunning(false);
      setAttackMode(false);
    }
  }, [setAttackMode]);

  const handleStop = useCallback(() => {
    attackSimulator.stopSimulation();
    setIsRunning(false);
    setAttackMode(false);
  }, [setAttackMode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyber-500" />
            Attack Simulator
          </h1>
          <p className="text-gray-400 mt-1">
            Launch realistic attack scenarios to see how detections work
          </p>
        </div>
        
        {isRunning && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop Simulation
          </button>
        )}
      </div>

      {/* Running Simulation View */}
      <AnimatePresence>
        {isRunning && selectedScenario && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Progress Panel */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedScenario.icon}</div>
                <div>
                  <h2 className="font-semibold text-lg">{selectedScenario.name}</h2>
                  <p className="text-sm text-gray-400">Attack in progress...</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyber-500 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Phase Timeline */}
              <ProgressTimeline 
                phases={selectedScenario.phases} 
                currentPhase={currentPhase}
                progress={progress}
              />
            </div>

            {/* Event Stream */}
            <div className="lg:col-span-2">
              <LiveEventStream events={events} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Incident */}
      {generatedIncident && !isRunning && (
        <GeneratedIncident incident={generatedIncident} />
      )}

      {/* Scenario Selection */}
      {!isRunning && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-500" />
            Available Attack Scenarios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario?.id === scenario.id}
                isRunning={isRunning}
                onSelect={setSelectedScenario}
                onStart={handleStart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyber-500" />
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center">
              <span className="text-cyber-500 font-bold">1</span>
            </div>
            <h4 className="font-medium">Select Scenario</h4>
            <p className="text-sm text-gray-400">
              Choose from realistic attack scenarios mapped to MITRE ATT&CK techniques.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center">
              <span className="text-cyber-500 font-bold">2</span>
            </div>
            <h4 className="font-medium">Watch Detection</h4>
            <p className="text-sm text-gray-400">
              See events generated in real-time as the attack progresses through phases.
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-cyber-500/20 flex items-center justify-center">
              <span className="text-cyber-500 font-bold">3</span>
            </div>
            <h4 className="font-medium">Investigate Incident</h4>
            <p className="text-sm text-gray-400">
              Explore the generated incident with timeline, entities, and remediation steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
