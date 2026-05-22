import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Play, ChevronRight, CheckCircle, Circle,
  Shield, Target, Server, User, Map, Zap, Award,
} from 'lucide-react';
import { cn } from '../services/utils';

// Static class maps (literal strings so Tailwind's JIT keeps them in the build).
const ACCENTS = {
  cyber: { tile: 'bg-cyan-500/10 border-cyan-500', iconWrap: 'bg-cyan-500/20', icon: 'text-cyan-400', bar: 'from-cyan-500 to-emerald-500' },
  purple: { tile: 'bg-purple-500/10 border-purple-500', iconWrap: 'bg-purple-500/20', icon: 'text-purple-400', bar: 'from-purple-500 to-blue-500' },
  blue: { tile: 'bg-blue-500/10 border-blue-500', iconWrap: 'bg-blue-500/20', icon: 'text-blue-400', bar: 'from-blue-500 to-cyan-500' },
  red: { tile: 'bg-red-500/10 border-red-500', iconWrap: 'bg-red-500/20', icon: 'text-red-400', bar: 'from-red-500 to-orange-500' },
};

const TUTORIALS = {
  analyst: {
    id: 'analyst',
    title: "SOC Analyst",
    subtitle: 'Investigate and respond to security incidents',
    icon: User,
    color: 'cyber',
    cert: 'Aligns with SC-200',
    steps: [
      { id: 1, title: 'Read the Command Center', description: 'Start with the single pane of glass: live posture, AppSec gate status, and threat intel.', link: '/', action: 'Open Command Center', tip: 'Everything an on-call analyst needs at a glance.', why: 'Situational awareness is the first move of any shift.' },
      { id: 2, title: 'Triage Incidents', description: 'Work the incident queue, sorted by severity and SLA.', link: '/incidents', action: 'View Incidents', why: 'Prioritization under SLA pressure is the core SOC skill.' },
      { id: 3, title: 'Investigate the Entity Graph', description: 'Pivot across users, IPs, devices and processes to scope the blast radius.', link: '/investigation', action: 'Open Investigation', why: 'Scoping determines whether one box or the whole tenant is compromised.' },
      { id: 4, title: 'Hunt with KQL', description: 'Query telemetry for additional indicators of compromise.', link: '/kql', action: 'Open KQL Playground', why: 'KQL fluency separates button-clickers from real analysts.' },
      { id: 5, title: 'Measure Operations', description: 'Review MTTD, MTTR and false-positive rate.', link: '/metrics', action: 'View Metrics', why: 'You manage what you measure — outcomes, not activity.' },
    ],
  },
  engineer: {
    id: 'engineer',
    title: "Detection Engineer",
    subtitle: 'Build, validate and tune detections as code',
    icon: Shield,
    color: 'purple',
    cert: 'Aligns with SC-200',
    steps: [
      { id: 1, title: 'Study the Rule Catalog', description: 'Examine 16 production KQL detections, their normalization, thresholds and FP handling.', link: '/rules', action: 'Browse Rules', why: 'Good detections are explicit about noise, not just signal.' },
      { id: 2, title: 'Map to MITRE ATT&CK', description: 'See tactic/technique coverage and the gaps.', link: '/mitre', action: 'View Coverage', why: 'Coverage-driven engineering beats ad-hoc rule writing.' },
      { id: 3, title: 'Prototype in KQL', description: 'Write and test queries against sample tables.', link: '/kql', action: 'Write Queries', why: 'Iterate on logic before it ever reaches production.' },
      { id: 4, title: 'Validate with Simulation', description: 'Run an attack and confirm the detection fires (Detection-as-Code assertion).', link: '/simulator', action: 'Test Detections', why: 'Untested detections are hope, not engineering.' },
      { id: 5, title: 'Ship via Pipeline', description: 'Watch the Go CLI deploy rules to Sentinel through the CI/CD gate.', link: '/drift', action: 'See the Pipeline', why: 'Detections belong in version control and CI, like any code.' },
    ],
  },
  cloudsec: {
    id: 'cloudsec',
    title: "Cloud Security / DevSecOps",
    subtitle: 'Secure multi-cloud infrastructure as code',
    icon: Server,
    color: 'blue',
    cert: 'Aligns with AZ-500',
    steps: [
      { id: 1, title: 'Understand the Architecture', description: 'Trace telemetry from Entra ID, M365, Defender, Kubernetes and AWS into Sentinel and out to containment.', link: '/architecture', action: 'View Architecture', why: 'Design fluency is what a cloud security lead probes first.' },
      { id: 2, title: 'Read the Real IaC', description: 'KMS-encrypted CloudTrail, public-access blocks, least-privilege RBAC, OIDC trust — all live Terraform.', link: '/iac', action: 'Explore IaC', why: 'Misconfiguration prevention and secrets hygiene start at provisioning.' },
      { id: 3, title: 'Enforce Shift-Left AppSec', description: 'Gitleaks, TFSec and Trivy gate the build on HIGH/CRITICAL findings.', link: '/appsec', action: 'View AppSec', why: 'Policy-as-code in CI is how cloud teams scale security.' },
      { id: 4, title: 'Catch Configuration Drift', description: 'A nightly terraform plan detects out-of-band changes and opens an incident.', link: '/drift', action: 'View Drift', why: '"ClickOps" drift is one of the top cloud-breach root causes.' },
      { id: 5, title: 'Optimize Cost (FinOps)', description: 'Model SIEM ingestion cost and hot/cold tiering trade-offs.', link: '/finops', action: 'Open FinOps', why: 'Security that ignores spend does not survive a budget review.' },
      { id: 6, title: 'Map to Compliance', description: 'See CIS Azure and NIST CSF controls mapped to the real implementation, with remediation evidence.', link: '/compliance', action: 'Open Compliance', why: 'Audit-ready control mapping is what turns "I built it" into "I can prove it".' },
    ],
  },
  attacker: {
    id: 'attacker',
    title: "Red Teamer",
    subtitle: 'See attacks from the defender perspective',
    icon: Target,
    color: 'red',
    cert: 'Adversary emulation',
    steps: [
      { id: 1, title: 'Explore Detections', description: 'Browse what is detected and how.', link: '/rules', action: 'View Rules', why: 'Know the tripwires before you move.' },
      { id: 2, title: 'Find Coverage Gaps', description: 'Use the MITRE matrix to spot blind spots.', link: '/mitre', action: 'Open MITRE', why: 'Gaps are where real adversaries operate.' },
      { id: 3, title: 'Run a Simulation', description: 'Emulate an attack and watch the telemetry it generates.', link: '/simulator', action: 'Open Simulator', why: 'Understanding telemetry is half of evasion and half of detection.' },
      { id: 4, title: 'Study Detection Logic', description: 'Read the KQL to understand triggering patterns.', link: '/kql', action: 'Analyze Queries', why: 'The logic reveals both strengths and bypasses.' },
      { id: 5, title: 'Review Threat Intel', description: 'See global IOCs and attack patterns.', link: '/threat-map', action: 'View Threat Map', why: 'Intel-informed emulation mirrors real campaigns.' },
    ],
  },
};

function PathCard({ tutorial, isSelected, onSelect }) {
  const Icon = tutorial.icon;
  const a = ACCENTS[tutorial.color];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(tutorial.id)}
      className={cn(
        'w-full rounded-xl border p-6 text-left transition-all',
        isSelected ? a.tile : 'border-dark-700 bg-dark-800/50 hover:border-dark-600',
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('rounded-lg p-3', a.iconWrap)}>
          <Icon className={cn('h-7 w-7', a.icon)} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{tutorial.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{tutorial.subtitle}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-300">
            <Award className="h-3 w-3" /> {tutorial.cert}
          </span>
        </div>
        <ChevronRight className={cn('h-5 w-5 transition-transform', isSelected && 'rotate-90')} />
      </div>
    </motion.button>
  );
}

function StepCard({ step, index, isComplete, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'rounded-xl border p-5 transition-all',
        isComplete ? 'border-green-500/30 bg-green-500/10' : 'border-dark-700 bg-dark-800/50',
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onComplete(step.id)}
          className={cn('rounded-full p-2 transition-colors', isComplete ? 'bg-green-500 text-white' : 'bg-dark-700 hover:bg-dark-600')}
        >
          {isComplete ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </button>

        <div className="flex-1">
          <span className="text-sm text-gray-500">Step {step.id}</span>
          <h4 className="mt-1 font-semibold">{step.title}</h4>
          <p className="mt-2 text-sm text-gray-400">{step.description}</p>

          {step.why && (
            <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-200">
              <span className="font-semibold text-blue-300">Why it matters: </span>
              {step.why}
            </div>
          )}

          {step.tip && (
            <div className="mt-2 rounded-lg border border-dark-600 bg-dark-700/50 p-3">
              <p className="text-xs text-gray-400">
                <span className="font-medium text-cyan-400">Tip: </span>
                {step.tip}
              </p>
            </div>
          )}

          <Link
            to={step.link}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/30"
          >
            {step.action}
            <ChevronRight className="h-4 w-4" />
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
    setCompletedSteps((prev) => ({ ...prev, [`${selectedPath}-${stepId}`]: !prev[`${selectedPath}-${stepId}`] }));
  };

  const tutorial = selectedPath ? TUTORIALS[selectedPath] : null;
  const progress = tutorial ? tutorial.steps.filter((s) => completedSteps[`${selectedPath}-${s.id}`]).length : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-b border-dark-700 pb-5">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
            <BookOpen className="h-6 w-6" />
          </span>
          Learning Paths
        </h1>
        <p className="mt-1 text-gray-400">
          Role-based, hands-on tours of the platform — each step links to a live view and explains the cloud-security skill it demonstrates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.values(TUTORIALS).map((t) => (
          <PathCard key={t.id} tutorial={t} isSelected={selectedPath === t.id} onSelect={setSelectedPath} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tutorial && (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-dark-700 bg-dark-800/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{tutorial.title} path</h3>
                <span className="text-sm text-gray-400">{progress} / {tutorial.steps.length} completed</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-dark-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / tutorial.steps.length) * 100}%` }}
                  className={cn('h-full rounded-full bg-gradient-to-r', ACCENTS[tutorial.color].bar)}
                />
              </div>
            </div>

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

            {progress === tutorial.steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/20 to-cyan-500/20 p-8 text-center"
              >
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="text-xl font-bold">Path complete</h3>
                <p className="mt-2 text-gray-400">You finished the {tutorial.title} path.</p>
                <div className="mt-6 flex justify-center gap-4">
                  <button onClick={() => setCompletedSteps({})} className="rounded-lg bg-dark-700 px-6 py-2 transition-colors hover:bg-dark-600">
                    Reset Progress
                  </button>
                  <Link to="/simulator" className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2 text-white transition-colors hover:bg-cyan-600">
                    <Play className="h-4 w-4" /> Try the Simulator
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedPath && (
        <div className="rounded-xl border border-dark-700 bg-dark-800/50 p-6">
          <h3 className="mb-4 font-semibold">Quick start</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { to: '/architecture', icon: Server, color: 'text-blue-400', label: 'Architecture' },
              { to: '/simulator', icon: Zap, color: 'text-yellow-400', label: 'Attack Simulator' },
              { to: '/rules', icon: Shield, color: 'text-cyan-400', label: 'Detection Rules' },
              { to: '/threat-map', icon: Map, color: 'text-red-400', label: 'Threat Map' },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="flex flex-col items-center gap-2 rounded-lg bg-dark-700/50 p-4 transition-colors hover:bg-dark-700">
                <q.icon className={cn('h-8 w-8', q.color)} />
                <span className="text-sm font-medium">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
