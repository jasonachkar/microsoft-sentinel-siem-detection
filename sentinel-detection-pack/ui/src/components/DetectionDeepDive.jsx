import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';

const KQL = `let QueryPeriod = 1h;
let BinSize = 15m;
let MinDistinctAccounts = 8;   // breadth: spray hits many accounts
let MinFailures = 20;          // volume: high failure count from one source
let AllowedIPs = dynamic([]);  // trusted egress / VPN allowlist
let FailedSignins = SigninLogs
| where TimeGenerated >= ago(QueryPeriod)
| extend ResultTypeStr = tostring(ResultType)
// invalid-credential / locked / disabled outcomes only
| where ResultTypeStr in ("50126","50125","50053","50055","50057")
| extend Account = tostring(UserPrincipalName), IPAddress = tostring(IPAddress)
| where IPAddress !in (AllowedIPs);
FailedSignins
| summarize FailedCount=count(), DistinctAccounts=dcount(Account),
            Accounts=make_set(Account, 25)
    by bin(TimeGenerated, BinSize), IPAddress, AppDisplayName
| where FailedCount >= MinFailures and DistinctAccounts >= MinDistinctAccounts`;

const tuningParams = [
  { param: 'MinDistinctAccounts', value: '8', rationale: 'Spray is wide-and-shallow. Distinct accounts is the strongest spray signal vs. a single-account brute force.' },
  { param: 'MinFailures', value: '20', rationale: 'Volume floor per 15-min bin from one source/app. Raise in noisy tenants, lower for high-value apps.' },
  { param: 'BinSize', value: '15m', rationale: 'Short enough to catch bursts, long enough to aggregate a slow spray. Pair with QueryFrequency PT5M for overlap.' },
  { param: 'ResultType filter', value: '50126, 50125, 50053, 50055, 50057', rationale: 'Invalid credentials, locked, disabled, expired - the outcomes a spray actually produces. Excludes benign MFA prompts.' },
  { param: 'AllowedIPs', value: 'dynamic([])', rationale: 'Allowlist corporate egress / VPN concentrators that legitimately generate bulk failures.' },
];

const falsePositives = [
  { source: 'VPN / NAT egress', detail: 'Many users behind one corporate IP can look like one source spraying many accounts.', mitigation: 'Add the egress range to AllowedIPs; pivot on AppDisplayName + UserAgent.' },
  { source: 'Misconfigured app / cached creds', detail: 'A service or device replaying stale credentials drives failures for one account, not many.', mitigation: 'DistinctAccounts >= 8 already filters single-account noise.' },
  { source: 'Load / pen tests', detail: 'Authorized testing generates spray-shaped telemetry.', mitigation: 'Allowlist the test source and coordinate change windows.' },
  { source: 'Legacy auth protocols', detail: 'Basic-auth clients fail in bursts after a password change.', mitigation: 'Correlate ClientAppUsed; drive toward blocking legacy auth via Conditional Access.' },
];

const runbook = [
  'Confirm the source IP is not a known corporate egress; enrich with threat intel and geo.',
  'Pull the targeted account set; check whether any sign-in later succeeded from the same IP (spray → success = compromise).',
  'Force password reset + revoke sessions for any account with a subsequent success.',
  'Trigger the SOAR playbook to block the IP and require step-up MFA for targeted users.',
  'If success occurred, escalate to incident and pivot to the Investigation graph for blast-radius scoping.',
];

function KqlBlock({ code }) {
  return (
    <div className="h-72 overflow-auto rounded-lg border border-dark-700 bg-black/60 p-4 font-mono text-[13px] leading-relaxed">
      {code.split('\n').map((line, i) => {
        const commentIdx = line.indexOf('//');
        const hasComment = commentIdx >= 0;
        return (
          <div key={i} className="whitespace-pre">
            <span className="text-gray-200">{hasComment ? line.slice(0, commentIdx) : line}</span>
            {hasComment && <span className="italic text-gray-500">{line.slice(commentIdx)}</span>}
            {line.length === 0 ? ' ' : ''}
          </div>
        );
      })}
    </div>
  );
}

export default function DetectionDeepDive() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
            <i className="pi pi-search-plus text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-200">Detection Engineering Deep-Dive</h1>
            <p className="text-gray-400">
              How a deployable Sentinel detection is reasoned about: logic, tuning, false positives, validation, and response.
            </p>
          </div>
        </div>
      </section>

      <Card className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Entra ID Password Spray</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-400">
              Detects wide-and-shallow credential attacks: a single source producing high-volume invalid-credential
              failures across many distinct accounts within a short window.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag severity="danger" value="High" />
            <Tag value="T1110.003" />
            <Tag severity="info" value="SigninLogs" />
            <Tag severity="warning" value="Credential Access" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Detection Logic (KQL)" className="border border-dark-700 bg-dark-900 shadow-xl">
          <KqlBlock code={KQL} />
          <Link to="/kql" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">
            <i className="pi pi-play" /> Try it in the KQL Playground
          </Link>
        </Card>

        <Card title="How it works" className="border border-dark-700 bg-dark-900 shadow-xl">
          <ol className="space-y-3 text-sm text-gray-300">
            {[
              'Filter SigninLogs to invalid-credential outcomes only — the failure types a spray actually produces, not benign MFA noise.',
              'Drop trusted egress IPs (AllowedIPs) to suppress VPN/NAT false positives at the source.',
              'Bin events into 15-minute windows and aggregate by source IP and application.',
              'Alert only when both volume (FailedCount >= 20) and breadth (DistinctAccounts >= 8) cross threshold - the two-signal AND is what distinguishes spray from a single-account brute force.',
              'Emit the targeted account set so the analyst can immediately check for a subsequent success.',
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="Tuning Parameters" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={tuningParams} size="small" className="p-datatable-sm">
          <Column field="param" header="Parameter" className="font-mono text-purple-200" />
          <Column field="value" header="Default" className="font-mono text-emerald-300" />
          <Column field="rationale" header="Why this value" className="text-sm text-gray-400" />
        </DataTable>
      </Card>

      <Card title="False-Positive Analysis" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-3 md:grid-cols-2">
          {falsePositives.map((fp) => (
            <div key={fp.source} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="font-semibold text-amber-300">{fp.source}</div>
              <p className="mt-1 text-sm text-gray-400">{fp.detail}</p>
              <p className="mt-2 text-xs text-emerald-300">
                <span className="font-semibold">Mitigation: </span>
                {fp.mitigation}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Validation (Detection-as-Code)" className="border border-dark-700 bg-dark-900 shadow-xl">
          <p className="text-sm text-gray-400">
            The rule is validated locally with metadata and sample telemetry via
            <span className="font-mono text-gray-300"> scripts/test-detections.py</span>. Live Sentinel alert assertion remains optional.
          </p>
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-dark-950 p-3 font-mono text-sm text-emerald-300">
            <i className="pi pi-check-circle mr-2" />
            metadata/sample validation: positive and benign samples present
          </div>
          <Link to="/simulator" className="mt-3 inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">
            <i className="pi pi-bolt" /> Run the matching attack simulation
          </Link>
        </Card>

        <Card title="Response Runbook" className="border border-dark-700 bg-dark-900 shadow-xl">
          <ol className="space-y-2 text-sm text-gray-300">
            {runbook.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-xs text-gray-500">{String(i + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
