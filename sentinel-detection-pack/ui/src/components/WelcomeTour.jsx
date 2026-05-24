import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft, X } from 'lucide-react';

// Navigation-driven portfolio tour. Each step explains what is repo-backed,
// what is demo-only, and why it matters to a cloud security reviewer.
const STEPS = [
  {
    route: '/',
    title: 'Welcome to the Sentinel Detection Lab',
    body: 'A Microsoft Sentinel cloud security detection engineering lab: repo-backed KQL rules, Terraform modules, CI/CD gates, drift detection, and clearly labelled demo telemetry.',
    why: 'Takes about 60 seconds. You can reopen this tour anytime from the header.',
  },
  {
    route: '/architecture',
    title: 'Reference Architecture',
    body: 'Review the intended flow from Entra ID, Microsoft 365, Defender, Kubernetes, and AWS CloudTrail into Sentinel, then to triage and SOAR response design.',
    why: 'Shows end-to-end detection and response thinking without claiming a production SOC.',
  },
  {
    route: '/iac',
    title: 'Infrastructure as Code',
    body: 'Every module is real Terraform rendered from the repo: Sentinel core, AWS CloudTrail connector, SOAR shell, policy guardrails, and lab honeypot infrastructure.',
    why: 'Cloud security is IaC-first: misconfiguration prevention and secrets hygiene belong in provisioning.',
  },
  {
    route: '/appsec',
    title: 'AppSec & Supply Chain',
    body: 'Gitleaks, TFSec, Trivy, validation, and bundling are represented through the GitHub Actions workflow.',
    why: 'Supply-chain security and policy checks are part of a credible cloud security pipeline.',
  },
  {
    route: '/drift',
    title: 'IaC Drift & Pipeline',
    body: 'A nightly terraform plan workflow is designed to catch out-of-band "ClickOps" changes and open a tracked issue. The Go CLI shows the Sentinel rule deployment path.',
    why: 'Configuration drift and least-privilege deployment automation are core cloud-security concerns.',
  },
  {
    route: '/compliance',
    title: 'Controls Mapping',
    body: 'Cloud security controls are mapped to repo artifacts as lab evidence, not certification or audit reporting.',
    why: 'A reviewer can see governance thinking while the UI stays honest about scope.',
  },
  {
    route: '/rules',
    title: 'Detection Rules',
    body: '16 MITRE ATT&CK-mapped KQL detections are managed as code and validated in the pipeline.',
    why: 'Detection engineering should include tuning, false-positive awareness, and reviewable metadata.',
  },
  {
    route: '/simulator',
    title: 'Attack Visualizer',
    body: 'Launch a simulated attack scenario and inspect the expected telemetry and detection workflow.',
    why: 'Validation matters, but this lab separates local simulation from live Sentinel assertion.',
  },
  {
    route: '/tutorial',
    title: 'Learning Paths',
    body: 'Guided, role-based paths for SOC analysts, detection engineers, and cloud security engineers.',
    why: 'Explore deeper at your own pace. The lab is built to be reviewed, questioned, and improved.',
  },
];

export default function WelcomeTour({ run, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (run) setStep(0);
  }, [run]);

  useEffect(() => {
    if (run) navigate(STEPS[step].route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, step]);

  if (!run) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-[55] w-[370px] rounded-2xl border border-blue-500/30 bg-dark-900/95 p-5 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
              <ShieldCheck size={18} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Guided tour</div>
              <div className="text-xs text-gray-400">
                Step {step + 1} of {STEPS.length}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-100">{current.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{current.body}</p>

        <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs text-blue-200">
          <span className="font-semibold text-blue-300">Why it matters: </span>
          {current.why}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-blue-400' : 'w-1.5 bg-dark-600'}`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 transition-colors hover:text-gray-300"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={() => setStep((previous) => Math.max(0, previous - 1))}
                className="flex items-center gap-1 rounded-lg border border-dark-600 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/5"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setStep((previous) => Math.min(STEPS.length - 1, previous + 1)))}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
