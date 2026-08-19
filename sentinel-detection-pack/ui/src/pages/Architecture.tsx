import { Link } from 'react-router-dom';
import manifest from '../data/projectManifest.json';
import { featuredAdrs } from '../data/adrs';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Panel } from '../components/ui/Panel';
import { RepoLink } from '../components/ui/RepoLink';
import { Tabs } from '../components/ui/Tabs';
import { DetailedDiagram } from '../components/architecture/DetailedDiagram';
import { SourceExplorer } from '../components/architecture/SourceExplorer';

const policyHighlights = [
  'Deny storage without HTTPS secure transfer',
  'Deny public storage network access',
  'Deny anonymous public blob access',
  'Audit public IP resources',
  'Audit weak storage TLS',
  'Audit missing owner/environment tags',
  'Audit Key Vault diagnostic settings',
  'Audit VMs without encryption at host',
];

function OverviewTab() {
  return (
    <div className="space-y-8">
      <DetailedDiagram />
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="Telemetry → Sentinel">
          <p className="text-sm text-text-secondary">
            Entra ID, Microsoft 365, Defender for Endpoint, AKS/EKS, and AWS CloudTrail feed a Log Analytics workspace
            that Microsoft Sentinel is onboarded onto.
          </p>
        </Panel>
        <Panel title="Delivery pipeline">
          <p className="text-sm text-text-secondary">
            GitHub Actions validates and scans every rule change, then the Go CLI deploys scheduled analytics rules
            via <code className="font-mono text-xs">DefaultAzureCredential</code>.
          </p>
        </Panel>
        <Panel title="Response">
          <p className="text-sm text-text-secondary">
            Incidents trigger an Automation Rule → Logic App playbook. Destructive containment stays behind human
            approval. Full lifecycle on the{' '}
            <Link to="/operations" className="text-accent hover:underline">Delivery &amp; Response</Link> page.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function TrustTab() {
  return (
    <div className="space-y-6">
      <Panel title="Identity & authentication path">
        <p className="text-sm text-text-secondary">
          GitHub Actions authenticates to Azure via OIDC federation — no long-lived client secrets stored in the
          repository or in CI. A workflow presents a short-lived, federated token that Entra ID exchanges for an
          Azure access token, which <code className="font-mono text-xs">DefaultAzureCredential</code> picks up
          in the Go deployer.
        </p>
        <div className="mt-3">
          <RepoLink path=".github/workflows/sentinel-ci-cd.yaml" label="OIDC-authenticated deploy job" />
        </div>
      </Panel>
      <Panel title="Trust boundaries">
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>— CI identity is scoped to the resource group it deploys into, not the subscription.</li>
          <li>— The SOAR Logic App's managed identity holds Network Contributor at resource-group scope, not subscription-wide.</li>
          <li>— The AWS CloudTrail connector uses IAM AssumeRole with an external ID, not static access keys.</li>
          <li>— Terraform state is remote and separate from source; secrets never live in `.tf` files (e.g. the honeypot's password is generated at apply time).</li>
        </ul>
      </Panel>
      <Panel title="Governance: Azure Policy">
        <div className="grid gap-2 sm:grid-cols-2">
          {policyHighlights.map((item) => (
            <div key={item} className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <RepoLink path="terraform-policy/main.tf" />
        </div>
      </Panel>
    </div>
  );
}

function InfrastructureTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {manifest.terraform.modules} Terraform modules and the Go/GitHub Actions delivery tooling, rendered directly
        from the committed source below.
      </p>
      <SourceExplorer />
    </div>
  );
}

function DecisionsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        {featuredAdrs.length} of {manifest.adrs.length} architecture decisions, selected for reviewer relevance.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {featuredAdrs.map((adr) => (
          <Panel key={adr.id} title={
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-tertiary">{adr.id}</span>
              {adr.title}
            </span>
          }>
            <div className="space-y-2.5 text-sm">
              <p><span className="font-medium text-text-primary">Decision: </span><span className="text-text-secondary">{adr.decision}</span></p>
              <p><span className="font-medium text-warning">Tradeoff: </span><span className="text-text-secondary">{adr.tradeoff}</span></p>
              <p><span className="font-medium text-success">Security: </span><span className="text-text-secondary">{adr.security}</span></p>
            </div>
            <div className="mt-3">
              <RepoLink path={adr.file} label="Full ADR" />
            </div>
          </Panel>
        ))}
      </div>
      <Link to="/architecture/decisions" className="inline-flex text-sm font-medium text-accent hover:underline">
        See all {manifest.adrs.length} architecture decisions →
      </Link>
    </div>
  );
}

export default function Architecture() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Reference architecture"
        title="Architecture"
        level={1}
        description="Telemetry sources, Sentinel, the delivery pipeline, trust boundaries, and the decisions behind them."
      />
      <div className="mt-8">
        <Tabs
          tabs={[
            { value: 'overview', label: 'Overview', content: <OverviewTab /> },
            { value: 'trust', label: 'Trust & identity', content: <TrustTab /> },
            { value: 'infrastructure', label: 'Infrastructure source', content: <InfrastructureTab /> },
            { value: 'decisions', label: 'Decisions', content: <DecisionsTab /> },
          ]}
        />
      </div>
    </div>
  );
}
