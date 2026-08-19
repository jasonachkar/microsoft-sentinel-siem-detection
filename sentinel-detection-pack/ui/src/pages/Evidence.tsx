import { evidenceCatalog } from '../data/evidenceCatalog';
import { projectLimitations } from '../data/limitations';
import { ciRows } from '../data/reviewerJourney';
import manifest from '../data/projectManifest.json';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Panel } from '../components/ui/Panel';
import { RepoLink } from '../components/ui/RepoLink';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toStatus } from '../data/statusVocabulary';

const controlsMapping = [
  { area: 'Identity', control: 'Detect credential-spray / MFA-fatigue attacks', evidence: 'rules-yaml/identity/EntraID_Password_Spray.yaml, EntraID_MFA_Fatigue.yaml' },
  { area: 'Identity', control: 'Least-privilege role assignment', evidence: 'terraform-soar/main.tf — resource-group-scoped Network Contributor' },
  { area: 'Storage', control: 'Encryption at rest for log storage (CMK)', evidence: 'terraform-aws-connector/main.tf — aws_kms_key + SSE' },
  { area: 'Storage', control: 'Block public access to log buckets', evidence: 'terraform-aws-connector/main.tf — aws_s3_bucket_public_access_block' },
  { area: 'Logging', control: 'Centralized log retention', evidence: 'terraform/main.tf — Log Analytics, 90-day retention' },
  { area: 'Key management', control: 'KMS key rotation enabled', evidence: 'terraform-aws-connector/main.tf — enable_key_rotation = true' },
  { area: 'DevSecOps', control: 'No secrets in source; IaC scanned pre-merge', evidence: '.github/workflows/sentinel-ci-cd.yaml — Gitleaks + TFSec' },
  { area: 'Storage', control: 'Enforce HTTPS-only / deny public network access', evidence: 'terraform-policy/main.tf' },
  { area: 'Governance', control: 'Continuous baseline (Microsoft Cloud Security Benchmark)', evidence: 'terraform-policy/main.tf — MCSB initiative assignment' },
];

const evidenceCounts = manifest.evidence;

export default function Evidence() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Proof index"
        title="Evidence"
        level={1}
        description="Every claim below maps to a repository file, a test, a CI workflow, or an explicit limitation."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {evidenceCatalog.map((item) => (
          <Panel key={item.id} title={item.title} action={<StatusBadge value={item.status} />}>
            <p className="text-sm text-text-secondary">{item.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.repoPaths.map((p) => (
                <RepoLink key={p} path={p} />
              ))}
            </div>
            {item.limitations?.length > 0 && (
              <p className="mt-3 text-xs text-text-tertiary">{item.limitations[0]}</p>
            )}
          </Panel>
        ))}
      </div>

      <div className="mt-10">
        <SectionHeading title="CI validation" description="What the pipeline checks today, and what it doesn't." />
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-subtle text-xs uppercase tracking-wide text-text-tertiary">
                <th className="px-4 py-2.5 font-medium">Gate</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">What it proves</th>
                <th className="px-4 py-2.5 font-medium">Path</th>
              </tr>
            </thead>
            <tbody>
              {ciRows.map((row) => (
                <tr key={row.gate} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 font-medium text-text-primary">{row.gate}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={toStatus(row.status) === 'validated' ? 'validated' : 'simulated'} /></td>
                  <td className="px-4 py-2.5 text-text-secondary">{row.proof}</td>
                  <td className="px-4 py-2.5"><RepoLink path={row.file} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Controls mapping" description="Cloud security controls mapped to repository artifacts — a reference, not a certification or audit report." />
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-subtle text-xs uppercase tracking-wide text-text-tertiary">
                <th className="px-4 py-2.5 font-medium">Area</th>
                <th className="px-4 py-2.5 font-medium">Control</th>
                <th className="px-4 py-2.5 font-medium">Implemented by</th>
              </tr>
            </thead>
            <tbody>
              {controlsMapping.map((row) => (
                <tr key={row.control} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 text-text-secondary">{row.area}</td>
                  <td className="px-4 py-2.5 text-text-primary">{row.control}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Project scope" description="What requires Azure credentials, and what uses sample or demo telemetry." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {projectLimitations.map((item) => (
            <div key={item.id} className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium text-text-primary">{item.title}</div>
              <p className="mt-1 text-sm text-text-secondary">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Screenshot & artifact index" description="What's populated vs. still a placeholder, generated from the evidence directory." />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(evidenceCounts).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-border p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-text-tertiary">{key}</div>
              <div className="mt-1 text-2xl font-semibold text-text-primary">{value.real}<span className="text-sm text-text-tertiary">/{value.total || '—'}</span></div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          UI screenshots are populated. Live Azure/Defender tenant screenshots are placeholders (
          <code className="font-mono">evidence/azure</code>, <code className="font-mono">evidence/defender</code>,{' '}
          <code className="font-mono">evidence/github</code>) until captured against a configured subscription.
        </p>
      </div>
    </div>
  );
}
