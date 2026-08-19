import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import rulesData from '../data/rules.json';
import { detectionNarratives } from '../data/detectionNarratives';
import { getRuleEvidence } from '../data/ruleEvidence';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Panel } from '../components/ui/Panel';
import { RepoLink } from '../components/ui/RepoLink';
import { StatusBadge } from '../components/ui/StatusBadge';
import { KqlViewer } from '../components/kql/KqlViewer';

interface Rule {
  id: string;
  name: string;
  description?: string;
  category: string;
  severity: string;
  dataSources: string[];
  tactics: string[];
  techniques: string[];
  entityMappings?: { entityType?: string; fieldMappings?: unknown }[];
  queryFrequency?: string;
  queryPeriod?: string;
  triggerOperator?: string;
  triggerThreshold?: number | string;
  falsePositives?: string;
  query: string;
  version?: string;
}

export default function DetectionDetail() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const rule = (rulesData.rules as Rule[]).find((r) => r.id === ruleId);

  if (!rule) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <p className="text-sm text-text-secondary">Detection not found.</p>
        <Link to="/detections" className="mt-2 inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
          <ArrowLeft size={14} /> Back to detections
        </Link>
      </div>
    );
  }

  const narrative = detectionNarratives[rule.id];
  const evidence = getRuleEvidence(rule.id, rule.category, rule.name.replace(/[^a-zA-Z0-9]+/g, '_'));
  const isFlagship = rule.id === '0710c724-a738-4b0f-af52-947ba4f01c0d';

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <Link to="/detections" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary">
        <ArrowLeft size={14} /> All detections
      </Link>

      <div className="mt-4 border-b border-border pb-6">
        {isFlagship && (
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">Flagship scenario</div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{rule.name}</h1>
          <span className={`text-sm font-medium ${rule.severity === 'High' ? 'text-danger' : 'text-warning'}`}>
            {rule.severity}
          </span>
        </div>
        <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-text-secondary">{rule.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-tertiary">
          <span>Domain: <span className="text-text-secondary">{rule.category}</span></span>
          <span>Version: <span className="font-mono text-text-secondary">{rule.version ?? '1.0.0'}</span></span>
          <span>Frequency / period: <span className="font-mono text-text-secondary">{rule.queryFrequency} / {rule.queryPeriod}</span></span>
        </div>
      </div>

      <div className="grid gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Detection logic (KQL)">
          <KqlViewer query={rule.query} githubPath={evidence.kqlPath} height={rule.query.split('\n').length > 20 ? 420 : 260} />
        </Panel>

        <Panel title="Required telemetry & ATT&CK">
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">Data sources</div>
              <div className="mt-1 font-mono text-text-primary">
                {(evidence.requiredTables.length ? evidence.requiredTables : rule.dataSources).join(', ') || '—'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">Tactics</div>
              <div className="mt-1 text-text-primary">{rule.tactics.join(', ')}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">Techniques</div>
              <div className="mt-1 font-mono text-text-primary">{rule.techniques.join(', ')}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">Trigger</div>
              <div className="mt-1 font-mono text-text-primary">
                {rule.triggerOperator} {rule.triggerThreshold}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">Entity mappings</div>
              <div className="mt-1 space-y-0.5 font-mono text-xs text-text-primary">
                {(rule.entityMappings ?? []).map((m, i) => (
                  <div key={i}>{m.entityType}</div>
                ))}
                {!(rule.entityMappings ?? []).length && <div className="text-text-tertiary">None declared</div>}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 border-t border-border py-8 lg:grid-cols-2">
        <Panel title="Tuning & known false positives">
          {narrative ? (
            <div className="space-y-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-text-tertiary">
                    <th className="pb-2 pr-3 font-medium">Parameter</th>
                    <th className="pb-2 pr-3 font-medium">Default</th>
                    <th className="pb-2 font-medium">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {narrative.tuningParams.map((p) => (
                    <tr key={p.param} className="align-top">
                      <td className="py-1.5 pr-3 font-mono text-accent">{p.param}</td>
                      <td className="py-1.5 pr-3 font-mono text-text-primary">{p.value}</td>
                      <td className="py-1.5 text-text-secondary">{p.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-2">
                {narrative.falsePositives.map((fp) => (
                  <div key={fp.source} className="rounded-md border border-border p-2.5 text-xs">
                    <div className="font-medium text-warning">{fp.source}</div>
                    <p className="mt-0.5 text-text-secondary">{fp.detail}</p>
                    <p className="mt-1 text-success">Mitigation: {fp.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">{rule.falsePositives ?? 'Review and tune for environment.'}</p>
          )}
        </Panel>

        <Panel title="Sample-data validation & operational response">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium text-text-primary">Static validation</div>
                <div className="text-xs text-text-tertiary">Schema, MITRE format, entity/query cross-reference</div>
              </div>
              <StatusBadge value="validated" />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium text-text-primary">Sample-data validation</div>
                <div className="text-xs text-text-tertiary">
                  {evidence.sample ? evidence.sample.description : 'No linked flagship sample for this rule'}
                </div>
              </div>
              <StatusBadge value={evidence.sample ? 'validated' : 'planned'} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="font-medium text-text-primary">Live Sentinel assertion</div>
                <div className="text-xs text-text-tertiary">Requires a configured Azure workspace</div>
              </div>
              <StatusBadge value="planned" />
            </div>
            {narrative && (
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-text-tertiary">Response runbook</div>
                <ol className="space-y-1.5">
                  {narrative.runbook.map((step, i) => (
                    <li key={i} className="flex gap-2 text-text-secondary">
                      <span className="font-mono text-xs text-text-tertiary">{String(i + 1).padStart(2, '0')}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {narrative && (
        <div className="border-t border-border py-8">
          <SectionHeading title="Tradeoffs" description="What tuning this rule actually involves." />
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            {narrative.tradeoffs.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-text-tertiary">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-border py-8">
        <SectionHeading title="Repository evidence" description="Change history lives in git log for these files." />
        <div className="mt-4 flex flex-wrap gap-2">
          <RepoLink path={evidence.yamlPath} label="Rule metadata (YAML)" />
          <RepoLink path={evidence.kqlPath} label="KQL source (.kql)" />
          {evidence.sample && <RepoLink path={evidence.sample.path} label="Sample telemetry (JSONL)" />}
          <RepoLink path="scripts/test-detections.py" label="Validation script" />
        </div>
      </div>
    </div>
  );
}
