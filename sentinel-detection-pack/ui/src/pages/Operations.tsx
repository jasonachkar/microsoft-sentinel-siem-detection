import {
  GitBranch, CheckCircle2, ShieldCheck, FileDiff, ThumbsUp, Terminal,
  RefreshCw, GitCompareArrows, ShieldHalf, Siren, Workflow, UserCheck, Play, FileClock,
} from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Panel } from '../components/ui/Panel';
import { RepoLink } from '../components/ui/RepoLink';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FlowDiagram, type FlowNode } from '../components/architecture/FlowDiagram';

const deliveryLifecycle: FlowNode[] = [
  { label: 'PR', icon: GitBranch },
  { label: 'Validate', sub: 'Schema + samples', icon: CheckCircle2 },
  { label: 'Scan', sub: 'Gitleaks, TFSec, Trivy, CodeQL', icon: ShieldCheck },
  { label: 'Explain / diff', sub: 'Change report', icon: FileDiff },
  { label: 'Approve', icon: ThumbsUp },
  { label: 'Deploy', sub: 'Go CLI, OIDC', icon: Terminal },
  { label: 'Observe drift', sub: 'Nightly terraform plan', icon: RefreshCw },
  { label: 'Reconcile', icon: GitCompareArrows },
];

const responseLifecycle: FlowNode[] = [
  { label: 'Detection', icon: ShieldHalf },
  { label: 'Incident', icon: Siren },
  { label: 'Automation rule', icon: Workflow },
  { label: 'Playbook', sub: 'Logic App', icon: Play },
  { label: 'Human approval', sub: 'If destructive', icon: UserCheck },
  { label: 'Action', icon: CheckCircle2 },
  { label: 'Audit trail', sub: 'Incident update', icon: FileClock },
];

const scanners = [
  { name: 'Gitleaks', purpose: 'Secret scanning across the full git history on every push.' },
  { name: 'TFSec', purpose: 'IaC misconfiguration scan across all 5 Terraform modules, blocking on HIGH+.' },
  { name: 'Trivy', purpose: 'Filesystem and config vulnerability scan, ignoring already-fixed CVEs.' },
  { name: 'CodeQL', purpose: 'Static analysis across JS/TS, Python, and Go.' },
];

const soarSteps = [
  { step: 'Incident trigger', detail: 'A Sentinel incident payload starts the Logic App flow.', status: 'implemented' },
  { step: 'Entity parsing', detail: 'Host, IP, account, and resource fields are normalized for review.', status: 'designed' },
  { step: 'Scope check', detail: 'Target must match the approved lab containment resource group.', status: 'implemented' },
  { step: 'Human approval', detail: 'An analyst confirms blast radius, target, and rollback path before anything destructive runs.', status: 'designed' },
  { step: 'Containment action', detail: 'Approved path applies an NSG deny rule or quarantine tag — never automatic.', status: 'designed' },
  { step: 'Incident comment', detail: 'Outcome is written back to Sentinel as the audit trail.', status: 'designed' },
];

export default function Operations() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Delivery & response"
        title="Delivery & Response"
        level={1}
        description="How a rule change reaches Sentinel, how drift is caught, and how an incident is handled."
      />

      <div className="mt-8 space-y-3 overflow-x-auto">
        <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Delivery lifecycle</div>
        <FlowDiagram nodes={deliveryLifecycle} label="Delivery lifecycle" />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Panel title="Security gates">
          <ul className="space-y-3 text-sm">
            {scanners.map((s) => (
              <li key={s.name}>
                <div className="font-medium text-text-primary">{s.name}</div>
                <p className="text-text-secondary">{s.purpose}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <RepoLink path=".github/workflows/sentinel-ci-cd.yaml" />
          </div>
        </Panel>

        <Panel title="Go deployer">
          <p className="text-sm text-text-secondary">
            The CLI walks every rule under <code className="font-mono text-xs">rules-yaml/</code>, validates schema and
            entity-mapping/query cross-references, and — with credentials — applies via{' '}
            <code className="font-mono text-xs">DefaultAzureCredential</code>.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-surface-subtle p-3 font-mono text-xs leading-relaxed text-text-secondary">
{`# dry run + validation report
go run . -dir ../rules-yaml

# deploy via DefaultAzureCredential
go run . -dir ../rules-yaml -apply`}
          </pre>
          <div className="mt-3">
            <RepoLink path="src-cli/deployer.go" />
          </div>
        </Panel>

        <Panel title="Drift detection">
          <p className="text-sm text-text-secondary">
            A nightly workflow runs <code className="font-mono text-xs">terraform plan -detailed-exitcode</code>{' '}
            against remote state. On drift, it correlates against any existing open drift issue instead of opening a
            new one every night.
          </p>
          <div className="mt-3">
            <RepoLink path=".github/workflows/drift-detection.yaml" />
          </div>
        </Panel>
      </div>

      <div className="mt-10 space-y-3 overflow-x-auto">
        <div className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Response lifecycle</div>
        <FlowDiagram nodes={responseLifecycle} label="Incident response lifecycle" />
      </div>

      <div className="mt-6">
        <Panel title="SOAR: human-approved containment">
          <p className="mb-4 text-sm text-text-secondary">
            Aligned to Sentinel's current model: an Automation Rule invokes a Logic App playbook. This project keeps
            destructive actions behind an explicit human-approval step rather than claiming autonomous containment.
          </p>
          <div className="space-y-2">
            {soarSteps.map((s) => (
              <div key={s.step} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-text-primary">{s.step}</div>
                  <div className="text-xs text-text-secondary">{s.detail}</div>
                </div>
                <StatusBadge value={s.status} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <RepoLink path="terraform-soar/main.tf" />
            <RepoLink path="docs/soar/human-approved-containment.md" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
