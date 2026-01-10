import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, ChevronRight, CheckCircle, Circle,
  Shield, Target, Search, Zap, BarChart3, Database,
  AlertTriangle, Map, User, Lock, Eye
} from 'lucide-react';
import { cn } from '../services/utils';

const TUTORIALS = {
  analyst: {
    id: 'analyst',
    title: "I'm a SOC Analyst",
    subtitle: 'Learn to investigate and respond to security incidents',
    icon: User,
    color: 'cyber',
    steps: [
      {
        id: 1,
        title: 'View the Dashboard',
        description: 'Start by exploring the security operations dashboard to see the current threat landscape.',
        link: '/',
        action: 'Go to Dashboard',
        tip: 'The dashboard shows real-time alerts, incidents, and MITRE coverage at a glance.',
      },
      {
        id: 2,
        title: 'Check Open Incidents',
        description: 'Review the incident queue to see security events that need investigation.',
        link: '/incidents',
        action: 'View Incidents',
        tip: 'Incidents are grouped and prioritized by severity. Critical incidents should be addressed first.',
      },
      {
        id: 3,
        title: 'Investigate an Incident',
        description: 'Select an incident and explore the entity graph, timeline, and evidence.',
        link: '/investigation',
        action: 'Start Investigation',
        tip: 'The entity graph shows relationships between users, IPs, devices, and applications involved.',
      },
      {
        id: 4,
        title: 'Run a KQL Query',
        description: 'Use the KQL playground to hunt for additional indicators of compromise.',
        link: '/kql',
        action: 'Open KQL Playground',
        tip: 'KQL (Kusto Query Language) is used to query logs in Microsoft Sentinel and Defender.',
      },
      {
        id: 5,
        title: 'Review Metrics',
        description: 'Check SOC metrics like MTTD, MTTR, and false positive rates.',
        link: '/metrics',
        action: 'View Metrics',
        tip: 'These metrics help measure and improve security operations efficiency.',
      },
    ],
  },
  attacker: {
    id: 'attacker',
    title: "I'm a Red Teamer",
    subtitle: 'See how attacks are detected from the defender perspective',
    icon: Target,
    color: 'red',
    steps: [
      {
        id: 1,
        title: 'Explore Detection Rules',
        description: 'Browse the detection rules catalog to see what attacks are detected.',
        link: '/rules',
        action: 'View Rules',
        tip: 'Each rule includes the KQL logic, MITRE mapping, and tuning guidance.',
      },
      {
        id: 2,
        title: 'View MITRE ATT&CK Coverage',
        description: 'See which tactics and techniques have detection coverage.',
        link: '/mitre',
        action: 'Open MITRE Navigator',
        tip: 'Green cells indicate coverage. Look for gaps to understand blind spots.',
      },
      {
        id: 3,
        title: 'Launch an Attack Simulation',
        description: 'Run a simulated attack to see how it triggers detection rules.',
        link: '/simulator',
        action: 'Open Simulator',
        tip: 'Watch the live event stream to see exactly what telemetry the attack generates.',
      },
      {
        id: 4,
        title: 'Study the Detection Logic',
        description: 'Review the KQL queries to understand what patterns trigger alerts.',
        link: '/kql',
        action: 'Analyze Queries',
        tip: 'Understanding detection logic helps identify potential bypasses.',
      },
      {
        id: 5,
        title: 'Check Threat Intelligence',
        description: 'Review the threat map to see global attack patterns and IOCs.',
        link: '/threat-map',
        action: 'View Threat Map',
        tip: 'Real-time threat intelligence feeds inform detection rules and blocklists.',
      },
    ],
  },
  engineer: {
    id: 'engineer',
    title: "I'm a Security Engineer",
    subtitle: 'Learn to build and tune detection rules',
    icon: Shield,
    color: 'purple',
    steps: [
      {
        id: 1,
        title: 'Study Existing Rules',
        description: 'Examine the production-ready detection rules and their structure.',
        link: '/rules',
        action: 'Browse Rules',
        tip: 'Pay attention to normalization patterns, thresholds, and false positive handling.',
      },
      {
        id: 2,
        title: 'Understand MITRE Mapping',
        description: 'Learn how rules map to MITRE ATT&CK tactics and techniques.',
        link: '/mitre',
        action: 'View Coverage',
        tip: 'Good coverage requires multiple detections per technique for defense in depth.',
      },
      {
        id: 3,
        title: 'Test with KQL Playground',
        description: 'Write and test detection queries against sample data.',
        link: '/kql',
        action: 'Write Queries',
        tip: 'Use templates from existing rules as starting points for new detections.',
      },
      {
        id: 4,
        title: 'Validate with Simulations',
        description: 'Run attack simulations to verify your detections fire correctly.',
        link: '/simulator',
        action: 'Test Detections',
        tip: 'Simulations help identify gaps and tune thresholds before production deployment.',
      },
      {
        id: 5,
        title: 'Monitor Performance',
        description: 'Review metrics to track detection quality and operational impact.',
        link: '/metrics',
        action: 'Check Metrics',
        tip: 'Balance detection rate with false positive rate for optimal SOC efficiency.',
      },
    ],
  },
};

// Tutorial Path Card
function PathCard({ tutorial, isSelected, onSelect }) {
  const Icon = tutorial.icon;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(tutorial.id)}
      className={cn(
        "w-full text-left p-6 rounded-xl border transition-all",
        isSelected
          ? `bg-${tutorial.color}-500/10 border-${tutorial.color}-500`
          : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-lg",
          `bg-${tutorial.color}-500/20`
        )}>
          <Icon className={cn("w-8 h-8", `text-${tutorial.color}-500`)} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{tutorial.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{tutorial.subtitle}</p>
        </div>
        <ChevronRight className={cn(
          "w-5 h-5 transition-transform",
          isSelected && "rotate-90"
        )} />
      </div>
    </motion.button>
  );
}

// Step Card
function StepCard({ step, index, isComplete, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "p-5 rounded-xl border transition-all",
        isComplete
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-dark-800/50 border-dark-700'
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onComplete(step.id)}
          className={cn(
            "p-2 rounded-full transition-colors",
            isComplete
              ? 'bg-green-500 text-white'
              : 'bg-dark-700 hover:bg-dark-600'
          )}
        >
          {isComplete ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Step {step.id}</span>
          </div>
          <h4 className="font-semibold mt-1">{step.title}</h4>
          <p className="text-sm text-gray-400 mt-2">{step.description}</p>
          
          {step.tip && (
            <div className="mt-3 p-3 rounded-lg bg-dark-700/50 border border-dark-600">
              <p className="text-xs text-gray-400">
                <span className="text-cyber-400 font-medium">💡 Tip:</span> {step.tip}
              </p>
            </div>
          )}
          
          <Link
            to={step.link}
            className={cn(
              "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30"
            )}
          >
            {step.action}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Tutorial() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  const handleComplete = (stepId) => {
    setCompletedSteps(prev => ({
      ...prev,
      [`${selectedPath}-${stepId}`]: !prev[`${selectedPath}-${stepId}`]
    }));
  };

  const tutorial = selectedPath ? TUTORIALS[selectedPath] : null;
  const progress = tutorial 
    ? tutorial.steps.filter(s => completedSteps[`${selectedPath}-${s.id}`]).length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyber-500" />
          Interactive Tutorial
        </h1>
        <p className="text-gray-400 mt-1">
          Choose your path to explore the Sentinel Detection Pack
        </p>
      </div>

      {/* Path Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(TUTORIALS).map((tutorial) => (
          <PathCard
            key={tutorial.id}
            tutorial={tutorial}
            isSelected={selectedPath === tutorial.id}
            onSelect={setSelectedPath}
          />
        ))}
      </div>

      {/* Selected Tutorial */}
      <AnimatePresence mode="wait">
        {tutorial && (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{tutorial.title} Learning Path</h3>
                <span className="text-sm text-gray-400">
                  {progress} / {tutorial.steps.length} completed
                </span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / tutorial.steps.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-cyber-500 to-green-500 rounded-full"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {tutorial.steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isComplete={completedSteps[`${selectedPath}-${step.id}`]}
                  onComplete={handleComplete}
                />
              ))}
            </div>

            {/* Completion */}
            {progress === tutorial.steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500/20 to-cyber-500/20 rounded-xl border border-green-500/30 p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold">Congratulations!</h3>
                <p className="text-gray-400 mt-2">
                  You've completed the {tutorial.title} learning path.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => setCompletedSteps({})}
                    className="px-6 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                  >
                    Reset Progress
                  </button>
                  <Link
                    to="/simulator"
                    className="px-6 py-2 rounded-lg bg-cyber-500 hover:bg-cyber-600 text-white transition-colors flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Try Attack Simulator
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Links */}
      {!selectedPath && (
        <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-6">
          <h3 className="font-semibold mb-4">Quick Start</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/simulator"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Zap className="w-8 h-8 text-yellow-500" />
              <span className="text-sm font-medium">Attack Simulator</span>
            </Link>
            <Link
              to="/rules"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Shield className="w-8 h-8 text-cyber-500" />
              <span className="text-sm font-medium">Detection Rules</span>
            </Link>
            <Link
              to="/mitre"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Target className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium">MITRE ATT&CK</span>
            </Link>
            <Link
              to="/threat-map"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Map className="w-8 h-8 text-red-500" />
              <span className="text-sm font-medium">Threat Map</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
