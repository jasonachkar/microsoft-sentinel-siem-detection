import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, ChevronRight, AlertTriangle,
  Shield, Target, Clock, Zap, CheckCircle, Radio,
  Activity, Eye, Terminal, Code, FileText,
  AlertCircle, Copy, Check, Skull, ArrowRight, ExternalLink
} from 'lucide-react';
import { attackSimulator, ATTACK_SCENARIOS } from '../services/attackSimulator';
import { useAppStore } from '../store/appStore';
import { cn, getSeverityBadge, v4 as uuidv4 } from '../services/utils';

// Syntax highlighting for code
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="text-xs text-gray-500 bg-dark-800 px-2 py-0.5 rounded">{language}</span>
        <button onClick={copyCode} className="p-1 bg-dark-800 rounded hover:bg-dark-700">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <pre className="bg-dark-950 rounded-lg p-3 sm:p-4 overflow-x-auto text-[10px] sm:text-xs font-mono text-green-400 max-h-48 sm:max-h-64 overflow-y-auto">
        {code}
      </pre>
    </div>
  );
}

// Terminal output component
function TerminalOutput({ content, stream = 'stdout' }) {
  return (
    <div className={cn(
      "font-mono text-[10px] sm:text-xs p-2 sm:p-3 rounded-lg",
      stream === 'stdout' ? 'bg-dark-950 text-gray-300' :
      stream === 'stderr' ? 'bg-red-950/50 text-red-300' :
      'bg-blue-950/50 text-blue-300'
    )}>
      <pre className="whitespace-pre-wrap break-all">{content}</pre>
    </div>
  );
}

// Script visualization panel
function ScriptPanel({ scripts }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [scripts]);

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden h-full">
      <div className="flex items-center gap-2 p-2 sm:p-3 border-b border-dark-700 bg-dark-800">
        <Terminal className="w-4 h-4 text-green-500" />
        <span className="font-medium text-xs sm:text-sm">Attack Script Execution</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
        </div>
      </div>
      
      <div ref={containerRef} className="p-2 sm:p-4 space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {scripts.map((script, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {script.type === 'command' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                    <span className="text-cyan-400">$</span>
                    <span className="text-green-400 font-mono break-all">{script.command}</span>
                  </div>
                  {script.output && <TerminalOutput content={script.output} />}
                </div>
              )}
              
              {script.type === 'script' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                    <Code className="w-3 h-3" />
                    <span>{script.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700">{script.language}</span>
                  </div>
                  <CodeBlock code={script.code} language={script.language} />
                </div>
              )}
              
              {script.type === 'output' && <TerminalOutput content={script.content} stream={script.stream} />}
              
              {script.type === 'info' && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-blue-400 bg-blue-950/30 p-2 rounded">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{script.message}</span>
                </div>
              )}
              
              {script.type === 'log' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-orange-400">
                    <FileText className="w-3 h-3" />
                    <span>Log captured: {script.source}</span>
                  </div>
                  <pre className="bg-dark-950 rounded p-2 text-[10px] font-mono text-gray-400 overflow-x-auto break-all">
                    {script.raw}
                  </pre>
                </div>
              )}
              
              {script.type === 'alert' && (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border",
                    script.severity === 'Critical' ? 'bg-red-950/50 border-red-500/50' :
                    script.severity === 'High' ? 'bg-orange-950/50 border-orange-500/50' :
                    'bg-yellow-950/50 border-yellow-500/50'
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
                    script.severity === 'Critical' ? 'text-red-500' :
                    script.severity === 'High' ? 'text-orange-500' :
                    'text-yellow-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{script.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Detection triggered</p>
                  </div>
                  <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 rounded-full flex-shrink-0", getSeverityBadge(script.severity))}>
                    {script.severity}
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {scripts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 sm:h-48 text-gray-600">
            <Terminal className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">Waiting for attack execution...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// IOCs Panel
function IOCsPanel({ iocs }) {
  if (!iocs) return null;

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Skull className="w-4 h-4 text-red-500" />
        Indicators of Compromise
      </h3>
      <div className="space-y-3">
        {iocs.ips?.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase mb-1">IP Addresses</p>
            <div className="flex flex-wrap gap-1">
              {iocs.ips.map(ip => (
                <code key={ip} className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
                  {ip}
                </code>
              ))}
            </div>
          </div>
        )}
        {iocs.techniques?.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase mb-1">MITRE Techniques</p>
            <div className="flex flex-wrap gap-1">
              {iocs.techniques.map(tech => (
                <code key={tech} className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  {tech}
                </code>
              ))}
            </div>
          </div>
        )}
        {iocs.indicators?.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase mb-1">Behavioral Indicators</p>
            <ul className="text-[10px] sm:text-xs text-gray-400 space-y-1">
              {iocs.indicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Remediation Panel
function RemediationPanel({ steps }) {
  if (!steps?.length) return null;

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-500" />
        Remediation Steps
      </h3>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-2 sm:gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-xs sm:text-sm text-gray-300">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Scenario Card Component
function ScenarioCard({ scenario, isSelected, isRunning, onSelect, onStart }) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(scenario)}
      className={cn(
        "relative p-3 sm:p-5 rounded-xl border cursor-pointer transition-all",
        "bg-dark-800/50 hover:bg-dark-800",
        isSelected 
          ? 'border-cyber-500 ring-2 ring-cyber-500/20' 
          : 'border-dark-700 hover:border-dark-600'
      )}
    >
      <div className={cn(
        "absolute top-2 sm:top-3 right-2 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full",
        scenario.severity === 'Critical' ? 'bg-red-500 animate-pulse' :
        scenario.severity === 'High' ? 'bg-orange-500' :
        'bg-yellow-500'
      )} />

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-2xl sm:text-4xl">{scenario.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-lg line-clamp-1">{scenario.name}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">{scenario.description}</p>
          
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
            <span className={cn("text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full", getSeverityBadge(scenario.severity))}>
              {scenario.severity}
            </span>
            {scenario.techniques.slice(0, 2).map(tech => (
              <span key={tech} className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full bg-dark-700 text-gray-300 font-mono">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{Math.round(scenario.duration / 1000)}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Live scripts</span>
            </div>
          </div>
        </div>
      </div>

      {isSelected && !isRunning && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={(e) => { e.stopPropagation(); onStart(scenario); }}
          className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 rounded-lg font-medium bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 text-sm sm:text-base"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          Launch Attack
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
          <div key={phase.name} className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              isComplete ? 'bg-green-500' :
              isCurrent ? 'bg-cyber-500 animate-pulse' :
              'bg-dark-700'
            )}>
              {isComplete ? <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" /> : <span className="text-[10px] sm:text-sm font-medium">{index + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs sm:text-sm font-medium transition-colors truncate",
                isCurrent ? 'text-cyber-400' : isComplete ? 'text-green-400' : 'text-gray-500'
              )}>{phase.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AttackSimulator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [iocs, setIOCs] = useState(null);
  const [remediation, setRemediation] = useState(null);
  const [generatedIncident, setGeneratedIncident] = useState(null);
  
  const { setAttackMode, addLiveEvent, addIncident } = useAppStore();

  const scenarios = Object.values(ATTACK_SCENARIOS);

  useEffect(() => {
    const scenarioId = searchParams.get('scenario');
    if (scenarioId) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (scenario) setSelectedScenario(scenario);
    }
  }, [searchParams, scenarios]);

  useEffect(() => {
    const unsubEvent = attackSimulator.onEvent((event) => { addLiveEvent(event); });
    const unsubProgress = attackSimulator.onProgress((p) => { setProgress(p); });
    const unsubPhase = attackSimulator.onPhase((phase) => { setCurrentPhase(phase); });
    const unsubScript = attackSimulator.onScript((script) => { setScripts(prev => [...prev, script]); });
    const unsubDetail = attackSimulator.onDetail((detail) => {
      if (detail.type === 'iocs') setIOCs(detail.data);
      if (detail.type === 'remediation') setRemediation(detail.data);
      if (detail.type === 'incident') {
        // Create a proper incident with all required fields
        const fullIncident = {
          ...detail.data,
          id: uuidv4(),
          alertCount: Math.floor(Math.random() * 10) + 5,
          entities: {
            users: Math.floor(Math.random() * 5) + 1,
            ips: Math.floor(Math.random() * 3) + 1,
            devices: Math.floor(Math.random() * 2) + 1
          },
          comments: 0,
          attachments: 0,
          slaMinutes: detail.data.severity === 'Critical' ? 30 : detail.data.severity === 'High' ? 60 : 120,
        };
        setGeneratedIncident(fullIncident);
        addIncident(fullIncident);
      }
    });

    return () => { unsubEvent(); unsubProgress(); unsubPhase(); unsubScript(); unsubDetail(); };
  }, [addLiveEvent, addIncident]);

  const handleStart = useCallback(async (scenario) => {
    setIsRunning(true);
    setProgress(0);
    setScripts([]);
    setIOCs(null);
    setRemediation(null);
    setGeneratedIncident(null);
    setCurrentPhase(null);
    setAttackMode(true, scenario);

    try {
      await attackSimulator.startSimulation(scenario.id);
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

  const handleViewIncident = useCallback(() => {
    if (generatedIncident) {
      navigate(`/incidents?highlight=${generatedIncident.id}`);
    }
  }, [generatedIncident, navigate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            Attack Simulator
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Execute realistic attack scenarios with live script visualization
          </p>
        </div>
        
        {isRunning && (
          <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors text-sm">
            <Square className="w-4 h-4" />
            Stop
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
            className="space-y-4 sm:space-y-6"
          >
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-4xl">{selectedScenario.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
                    <span className="text-[10px] sm:text-sm text-red-400 font-medium">ATTACK IN PROGRESS</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold mt-1 truncate">{selectedScenario.name}</h2>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl sm:text-3xl font-bold">{Math.round(progress)}%</p>
                  <p className="text-[10px] sm:text-sm text-gray-400">Progress</p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Script Panel */}
              <div className="xl:col-span-2">
                <ScriptPanel scripts={scripts} />
              </div>

              {/* Side Panel */}
              <div className="space-y-4">
                <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-3 sm:p-4">
                  <h3 className="font-semibold text-sm mb-3">Execution Progress</h3>
                  <ProgressTimeline phases={selectedScenario.phases} currentPhase={currentPhase} progress={progress} />
                </div>
                <IOCsPanel iocs={iocs} />
                <RemediationPanel steps={remediation} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Incident */}
      {generatedIncident && !isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/30 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">Incident Created</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", getSeverityBadge(generatedIncident.severity))}>
                  {generatedIncident.severity}
                </span>
              </div>
              <p className="text-gray-400 mt-1 text-sm line-clamp-2">{generatedIncident.title}</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <button
                  onClick={handleViewIncident}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyber-500 text-white hover:bg-cyber-600 text-sm font-medium transition-colors"
                >
                  View in Incidents
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to={`/investigation?incident=${generatedIncident.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Investigate
                </Link>
              </div>
            </div>
          </div>

          {/* Post-attack details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <IOCsPanel iocs={iocs} />
            <RemediationPanel steps={remediation} />
          </div>
        </motion.div>
      )}

      {/* Scenario Selection */}
      {!isRunning && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-500" />
            Select Attack Scenario
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
    </div>
  );
}
