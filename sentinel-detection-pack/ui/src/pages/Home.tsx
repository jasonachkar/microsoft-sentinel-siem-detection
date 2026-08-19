import { Link } from 'react-router-dom';
import {
  ArrowRight, Radio, ShieldHalf, FileCode, Siren, Workflow,
  GitBranch, CheckCircle2, ShieldCheck, Terminal, RefreshCw, Github,
} from 'lucide-react';
import manifest from '../data/projectManifest.json';
import rulesData from '../data/rules.json';
import { flagshipScenario } from '../data/reviewerJourney';
import { GITHUB_URL } from '../config/navigation';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Panel } from '../components/ui/Panel';
import { RepoLink } from '../components/ui/RepoLink';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FlowDiagram, type FlowNode } from '../components/architecture/FlowDiagram';

const detectionFlow: FlowNode[] = [
  { label: 'Telemetry sources', sub: 'Entra ID, M365, endpoint', icon: Radio, to: '/architecture' },
  { label: 'Microsoft Sentinel', sub: 'Log Analytics workspace', icon: ShieldHalf, to: '/architecture' },
  { label: 'Analytics rules', sub: `${manifest.rules.total} KQL detections`, icon: FileCode, to: '/detections' },
  { label: 'Alerts / incidents', sub: 'Entity-enriched', icon: Siren, to: '/operations' },
  { label: 'Automation / response', sub: 'Human-approved', icon: Workflow, to: '/operations' },
];

const deliveryFlow: FlowNode[] = [
  { label: 'Git', sub: 'YAML + KQL source', icon: GitBranch, href: GITHUB_URL },
  { label: 'Validation', sub: 'Schema + samples', icon: CheckCircle2, to: '/operations' },
  { label: 'Security gates', sub: 'Gitleaks, TFSec, Trivy', icon: ShieldCheck, to: '/operations' },
  { label: 'Go deployer', sub: 'DefaultAzureCredential', icon: Terminal, to: '/architecture' },
  { label: 'Sentinel', sub: 'Scheduled alert rules', icon: ShieldHalf, to: '/architecture' },
  { label: 'Drift detection', sub: 'Nightly terraform plan', icon: RefreshCw, to: '/operations' },
];

const proofStrip = [
  { label: `${manifest.rules.total} analytics rules`, detail: `${Object.keys(manifest.rules.byDomain).length} domains, MITRE-mapped` },
  { label: `${manifest.terraform.modules} Terraform modules`, detail: 'Sentinel, policy, SOAR, connectors' },
  { label: 'OIDC CI/CD', detail: `${manifest.workflows.total} GitHub Actions workflows` },
  { label: 'Automated drift detection', detail: 'Nightly terraform plan, issue-tracked' },
];

export default function Home() {
  const rule = (rulesData.rules || []).find((item: any) => item.id === flagshipScenario.ruleId) ?? ({} as any);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero */}
      <section className="border-b border-border pb-10">
        <div className="max-w-[720px]">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Microsoft Sentinel · Detection Engineering
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Detection engineering, built as code.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-text-secondary">
            A hands-on Microsoft Sentinel lab where analytics rules, cloud-security infrastructure, validation,
            deployment, and drift detection are managed through source control.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast hover:opacity-90"
            >
              Explore the architecture
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/detections"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:border-border-strong"
            >
              View detections
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              <Github size={15} />
              GitHub
            </a>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {proofStrip.map((item) => (
            <div key={item.label}>
              <dt className="text-sm font-semibold text-text-primary">{item.label}</dt>
              <dd className="mt-0.5 text-xs text-text-tertiary">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Architecture preview */}
      <section className="border-b border-border py-10">
        <SectionHeading
          eyebrow="How it fits together"
          title="Detection and delivery, end to end"
          description="Telemetry becomes an analytics rule; a rule change becomes a deployment. Both paths are source-controlled."
          action={
            <Link to="/architecture" className="text-sm font-medium text-accent hover:underline">
              Full architecture →
            </Link>
          }
        />
        <div className="mt-6 space-y-8 overflow-x-auto">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">Detection &amp; response</div>
            <FlowDiagram nodes={detectionFlow} label="Detection and response pipeline" />
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">Engineering delivery</div>
            <FlowDiagram nodes={deliveryFlow} label="Engineering delivery pipeline" />
          </div>
        </div>
      </section>

      {/* Flagship scenario */}
      <section className="border-b border-border py-10">
        <SectionHeading
          eyebrow="Flagship detection"
          title="Entra ID password spray"
          description="The end-to-end case study: hypothesis, telemetry, KQL, tuning, and response."
          action={
            <Link to={`/detections/${flagshipScenario.ruleId}`} className="text-sm font-medium text-accent hover:underline">
              Open full detection →
            </Link>
          }
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="Threat hypothesis">
            <p className="text-sm leading-relaxed text-text-secondary">{flagshipScenario.narrative}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-text-tertiary">Data source</div>
                <div className="mt-0.5 font-mono text-text-primary">{(rule.dataSources || ['SigninLogs']).join(', ')}</div>
              </div>
              <div>
                <div className="text-text-tertiary">MITRE</div>
                <div className="mt-0.5 font-mono text-text-primary">{(rule.techniques || ['T1110.003']).join(', ')}</div>
              </div>
              <div>
                <div className="text-text-tertiary">Frequency / period</div>
                <div className="mt-0.5 font-mono text-text-primary">{rule.queryFrequency} / {rule.queryPeriod}</div>
              </div>
              <div>
                <div className="text-text-tertiary">Validation</div>
                <div className="mt-0.5"><StatusBadge value="validated" /></div>
              </div>
            </div>
          </Panel>
          <Panel title="Triage at a glance">
            <div className="space-y-3">
              {flagshipScenario.triageCards.map(([title, body]) => (
                <div key={title}>
                  <div className="text-sm font-medium text-text-primary">{title}</div>
                  <p className="mt-0.5 text-sm text-text-secondary">{body}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Project scope */}
      <section className="py-10">
        <SectionHeading
          eyebrow="Project scope"
          title="What's real vs. simulated"
          description="Detection code and infrastructure are real and validated. Live tenant telemetry requires Azure credentials this environment doesn't run continuously."
          action={
            <Link to="/evidence" className="text-sm font-medium text-accent hover:underline">
              Full evidence index →
            </Link>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Detection rules', status: 'validated', path: 'sentinel-detection-pack/rules-yaml' },
            { label: 'Terraform infrastructure', status: 'validated', path: 'terraform/main.tf' },
            { label: 'CI/CD security gates', status: 'validated', path: '.github/workflows/sentinel-ci-cd.yaml' },
            { label: 'Live Sentinel telemetry', status: 'simulated', path: 'sentinel-detection-pack/ui/src/services/telemetryEngine.js' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{item.label}</span>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-2">
                <RepoLink path={item.path} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
