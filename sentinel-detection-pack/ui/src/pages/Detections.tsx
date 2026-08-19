import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import rulesData from '../data/rules.json';
import { SectionHeading } from '../components/ui/SectionHeading';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Rule {
  id: string;
  name: string;
  category: string;
  severity: string;
  dataSources: string[];
  techniques: string[];
  version?: string;
  status?: string;
}

const rules = (rulesData.rules || []) as Rule[];
const domains = Array.from(new Set(rules.map((r) => r.category))).sort();

const severityRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const severityTone: Record<string, string> = {
  High: 'text-danger',
  Medium: 'text-warning',
  Low: 'text-text-secondary',
};

export default function Detections() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rules
      .filter((rule) => domain === 'all' || rule.category === domain)
      .filter((rule) => severity === 'all' || rule.severity === severity)
      .filter(
        (rule) =>
          !q ||
          rule.name.toLowerCase().includes(q) ||
          rule.techniques.some((t) => t.toLowerCase().includes(q)) ||
          rule.category.toLowerCase().includes(q),
      )
      .sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9));
  }, [query, domain, severity]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Detection engineering"
        title="Detections"
        level={1}
        description={`${rules.length} KQL/YAML scheduled analytics rules, generated from sentinel-detection-pack/rules-yaml at build time.`}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
          <Search size={14} className="text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, domain, or technique…"
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          aria-label="Filter by domain"
        >
          <option value="all">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d[0].toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          aria-label="Filter by severity"
        >
          <option value="all">All severities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-xs uppercase tracking-wide text-text-tertiary">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Data source</th>
              <th className="px-4 py-3 font-medium">MITRE</th>
              <th className="px-4 py-3 font-medium">Validation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rule) => (
              <tr key={rule.id} className="border-b border-border last:border-b-0 hover:bg-surface-subtle">
                <td className="px-4 py-3">
                  <Link to={`/detections/${rule.id}`} className="font-medium text-text-primary hover:text-accent">
                    {rule.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">{rule.category}</td>
                <td className={`px-4 py-3 font-medium ${severityTone[rule.severity] ?? 'text-text-secondary'}`}>
                  {rule.severity}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {(rule.dataSources || []).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{rule.techniques.join(', ')}</td>
                <td className="px-4 py-3">
                  <StatusBadge value="validated" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-tertiary">
                  No detections match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-text-tertiary">
        Validation status reflects schema and sample-data checks in CI (
        <code className="font-mono">scripts/test-detections.py</code>), not live Sentinel execution. See the Evidence
        page for the full status vocabulary.
      </p>
    </div>
  );
}
