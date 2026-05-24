import React from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import rulesData from '../data/rules.json';

const repoBase = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

const sampleTelemetry = [
  { TimeGenerated: '2026-05-24T13:00:00Z', UserPrincipalName: 'alice@contoso.com', IPAddress: '203.0.113.10', ResultType: '50126', ExpectedResult: 'positive' },
  { TimeGenerated: '2026-05-24T13:01:00Z', UserPrincipalName: 'bob@contoso.com', IPAddress: '203.0.113.10', ResultType: '50126', ExpectedResult: 'positive' },
  { TimeGenerated: '2026-05-24T13:02:00Z', UserPrincipalName: 'carol@contoso.com', IPAddress: '203.0.113.10', ResultType: '50053', ExpectedResult: 'positive' },
  { TimeGenerated: '2026-05-24T13:10:00Z', UserPrincipalName: 'dana@contoso.com', IPAddress: '198.51.100.44', ResultType: '0', ExpectedResult: 'negative' },
];

const expectedOutput = [
  {
    TimeGenerated: '2026-05-24T13:00:00Z',
    Account: 'Multiple',
    PrimaryAccount: 'alice@contoso.com',
    IPAddress: '203.0.113.10',
    FailedCount: '20+',
    DistinctAccounts: '8+',
  },
];

const triageSteps = [
  'Confirm whether the source IP belongs to corporate VPN, proxy, or known testing infrastructure.',
  'Review all targeted accounts and identify privileged users or service principals in the spray window.',
  'Check sign-in risk, MFA outcomes, user agents, client apps, and impossible travel correlation.',
  'Look for successful sign-ins from the same IP after the failed spray activity.',
  'Document whether threshold tuning or allowlist changes are justified.',
];

const responseSteps = [
  'Block malicious IP only if ownership and business impact are understood.',
  'Force password reset for accounts with suspicious successful authentication.',
  'Enforce MFA or Conditional Access for targeted accounts where gaps exist.',
  'Review authentication methods and revoke sessions for confirmed compromise.',
  'Create a tuning issue if the alert is benign but repeatable.',
];

const tradeoffs = [
  'Low thresholds catch attacks earlier but create false positives behind NAT or proxy infrastructure.',
  'Ingestion delay means a scheduled rule may not fire immediately after the last failed sign-in.',
  'Trusted egress IP allowlists need ownership and periodic review.',
  'User agent and client app fields help triage but should not be the only decision point.',
];

function RepoPath({ path }) {
  return (
    <a
      href={`${repoBase}${path.replaceAll('\\', '/')}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-200 hover:bg-blue-500/20"
    >
      {path}
    </a>
  );
}

function resultTemplate(row) {
  return <Tag value={row.ExpectedResult} severity={row.ExpectedResult === 'positive' ? 'danger' : 'success'} />;
}

export default function PasswordSprayScenario() {
  const rule = (rulesData.rules || []).find((item) => item.id === '0710c724-a738-4b0f-af52-947ba4f01c0d') || {};
  const dataSources = rule.dataSources || rule.dataTypes || ['SigninLogs'];
  const entityMappings = rule.entityMappings || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-dark-900 to-blue-950/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Flagship Scenario</div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Entra ID Password Spray to Sentinel Detection
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-300">
              An attacker attempts a password spray from one IP across many Entra ID accounts. The scheduled KQL rule groups failed
              sign-ins, maps account and IP entities, and gives an analyst the fields needed for triage and response.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Tag value="Repo-backed rule" severity="success" />
              <Tag value="Demo sample telemetry" severity="warning" />
              <Tag value="Metadata/sample validation" severity="info" />
              <Tag value="Not live Sentinel proof" severity="danger" />
            </div>
          </div>
          <div className="grid min-w-[280px] gap-3">
            <div className="rounded-xl border border-dark-700 bg-dark-950 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Rule</div>
              <div className="mt-1 text-lg font-bold text-white">{rule.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-dark-700 bg-dark-950 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Severity</div>
                <div className="mt-1"><Tag value={rule.severity || 'High'} severity="danger" /></div>
              </div>
              <div className="rounded-xl border border-dark-700 bg-dark-950 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">Lookback</div>
                <div className="mt-1 font-mono text-blue-200">{rule.queryPeriod || 'PT1H'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Threat Narrative" className="border border-dark-700 bg-dark-900 lg:col-span-2">
          <p className="text-sm leading-relaxed text-gray-300">
            Password spraying avoids account lockout by trying a small number of common passwords across many accounts. In cloud identity
            environments, this can lead to successful authentication against a weak account, followed by token abuse, mailbox access,
            or privilege escalation. This scenario uses Entra ID `SigninLogs` and aggregates failed invalid-credential outcomes by source IP.
          </p>
          <Divider />
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs uppercase text-gray-500">Data source</div>
              <div className="mt-1 font-mono text-blue-200">{dataSources.join(', ')}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Frequency</div>
              <div className="mt-1 font-mono text-blue-200">{rule.queryFrequency}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Trigger</div>
              <div className="mt-1 font-mono text-blue-200">{rule.triggerOperator} {rule.triggerThreshold}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">MITRE</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(rule.techniques || []).map((technique) => <Tag key={technique} value={technique} severity="warning" />)}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Evidence Paths" className="border border-dark-700 bg-dark-900">
          <div className="space-y-3">
            <RepoPath path="sentinel-detection-pack/rules-yaml/identity/EntraID_Password_Spray.yaml" />
            <RepoPath path="sentinel-detection-pack/rules/identity/EntraID_Password_Spray.kql" />
            <RepoPath path="sentinel-detection-pack/sample-data/signinlogs-password-spray.jsonl" />
            <RepoPath path="scripts/test-detections.py" />
            <RepoPath path="docs/detection-engineering/coverage-matrix.md" />
          </div>
        </Card>
      </div>

      <Card title="Detection Rule Metadata" className="border border-dark-700 bg-dark-900">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="text-xs uppercase text-gray-500">Tactics</div>
            <div className="mt-2 flex flex-wrap gap-2">{(rule.tactics || []).map((tactic) => <Tag key={tactic} value={tactic} severity="info" />)}</div>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="text-xs uppercase text-gray-500">Techniques</div>
            <div className="mt-2 flex flex-wrap gap-2">{(rule.techniques || []).map((technique) => <Tag key={technique} value={technique} severity="warning" />)}</div>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="text-xs uppercase text-gray-500">Entity mappings</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-blue-200">
              {entityMappings.map((mapping, idx) => <div key={`${mapping.entityType}-${idx}`}>{mapping.entityType}</div>)}
            </div>
          </div>
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
            <div className="text-xs uppercase text-gray-500">Validation status</div>
            <div className="mt-2"><Tag value="metadata/sample pass" severity="success" /></div>
          </div>
        </div>
      </Card>

      <Card title="KQL Detection Logic" className="border border-dark-700 bg-dark-900">
        <pre className="max-h-[520px] overflow-auto rounded-xl border border-dark-700 bg-black/50 p-4 text-xs leading-relaxed text-gray-200">
          <code>{rule.query}</code>
        </pre>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Sample Telemetry" className="border border-dark-700 bg-dark-900">
          <p className="mb-4 text-sm text-gray-400">
            Local JSONL samples show positive and benign examples. They validate schema coverage but do not prove KQL execution.
          </p>
          <DataTable value={sampleTelemetry} className="p-datatable-sm" rows={5}>
            <Column field="TimeGenerated" header="Time" />
            <Column field="UserPrincipalName" header="Account" className="font-mono text-blue-200" />
            <Column field="IPAddress" header="Source IP" className="font-mono" />
            <Column field="ResultType" header="Result" />
            <Column header="Expected" body={resultTemplate} />
          </DataTable>
        </Card>

        <Card title="Expected Alert Output" className="border border-dark-700 bg-dark-900">
          <DataTable value={expectedOutput} className="p-datatable-sm">
            <Column field="PrimaryAccount" header="Primary Account" className="font-mono text-blue-200" />
            <Column field="IPAddress" header="Source IP" className="font-mono" />
            <Column field="FailedCount" header="Failed Count" />
            <Column field="DistinctAccounts" header="Distinct Accounts" />
          </DataTable>
          <Divider />
          <div className="text-sm text-gray-400">
            In live Sentinel, this should enrich the incident with account and IP entities, failed count, distinct account count,
            user agent, client app, and targeted account set.
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Triage Steps" className="border border-dark-700 bg-dark-900">
          <ol className="space-y-3 text-sm text-gray-300">
            {triageSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </Card>
        <Card title="Response Guidance" className="border border-dark-700 bg-dark-900">
          <ol className="space-y-3 text-sm text-gray-300">
            {responseSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </Card>
        <Card title="What I Learned / Tradeoffs" className="border border-dark-700 bg-dark-900">
          <ul className="space-y-3 text-sm text-gray-300">
            {tradeoffs.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}
