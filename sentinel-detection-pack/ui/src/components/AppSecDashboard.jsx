import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { MeterGroup } from 'primereact/metergroup';
import { Tag } from 'primereact/tag';
import { telemetryEngine } from '../services/telemetryEngine';

const severityRank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const severityTag = (value) => {
  const map = { CRITICAL: 'danger', HIGH: 'danger', MEDIUM: 'warning', LOW: 'info' };
  return <Tag value={value} severity={map[value] || 'info'} />;
};

const scannerIcon = { Gitleaks: 'pi-key', TFSec: 'pi-server', Trivy: 'pi-box' };

export default function AppSecDashboard() {
  const [scan] = useState(() => telemetryEngine.generateAppSecScan());

  const counts = useMemo(() => {
    const all = [
      ...scan.cves.map((c) => c.severity),
      ...scan.iacFindings.map((f) => f.severity),
    ];
    return {
      critical: all.filter((s) => s === 'CRITICAL').length,
      high: all.filter((s) => s === 'HIGH').length,
      medium: all.filter((s) => s === 'MEDIUM').length,
      low: all.filter((s) => s === 'LOW').length,
      total: all.length,
    };
  }, [scan]);

  const meters = [
    { label: 'Critical', color: '#dc2626', value: counts.critical },
    { label: 'High', color: '#f97316', value: counts.high },
    { label: 'Medium', color: '#eab308', value: counts.medium },
    { label: 'Low', color: '#3b82f6', value: counts.low },
  ];

  const sortedIac = useMemo(
    () => [...scan.iacFindings].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]),
    [scan.iacFindings],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
            <i className="pi pi-verified text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-rose-200">AppSec &amp; Supply Chain</h1>
            <p className="text-gray-400">
              Shift-left scan results from the CI/CD pipeline &mdash; Gitleaks secrets, TFSec IaC, and Trivy dependency CVEs.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-gray-500">
          <span>workflow: DevSecOps CI/CD Pipeline</span>
          <span>commit: {scan.commit}</span>
          <span>last run: {new Date(scan.lastRun).toLocaleString()}</span>
        </div>
      </section>

      {!scan.gateBlocking && (
        <Message
          severity="warn"
          className="w-full justify-start"
          text="Pipeline gate is non-blocking: TFSec steps run with soft_fail: true, so these findings never fail the build. Set soft_fail: false to enforce."
        />
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Critical', value: counts.critical, color: 'text-red-300' },
          { label: 'High', value: counts.high, color: 'text-orange-300' },
          { label: 'Medium', value: counts.medium, color: 'text-yellow-300' },
          { label: 'Total Findings', value: counts.total, color: 'text-blue-300' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
            <div className="mb-1 text-xs uppercase text-gray-400">{stat.label}</div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <Card title="Scanner Coverage" className="border border-dark-700 bg-dark-900 shadow-xl">
        <MeterGroup values={meters} className="mb-5" />
        <div className="grid gap-4 md:grid-cols-3">
          {scan.scanners.map((s) => (
            <div key={s.name} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-gray-100">
                  <i className={`pi ${scannerIcon[s.name] || 'pi-shield'} mr-2 text-blue-300`} />
                  {s.name}
                </span>
                <Tag
                  value={s.status === 'pass' ? 'PASS' : `${s.findings} findings`}
                  severity={s.status === 'pass' ? 'success' : 'warning'}
                />
              </div>
              <div className="text-sm text-gray-400">{s.type}</div>
              <div className="mt-1 font-mono text-xs text-gray-500">{s.target}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="IaC Misconfigurations (TFSec)" className="border border-dark-700 bg-dark-900 shadow-xl">
        <p className="mb-4 text-sm text-gray-400">
          Live findings against the four Terraform modules. These map to real lines in this repo &mdash; treat them as the
          remediation backlog.
        </p>
        <div className="space-y-3">
          {sortedIac.map((f) => (
            <div key={`${f.rule}-${f.file}`} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm text-rose-300">{f.rule}</span>
                {severityTag(f.severity)}
              </div>
              <div className="text-sm text-gray-300">{f.detail}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 font-mono text-xs text-gray-500">
                <span><i className="pi pi-folder mr-1" />{f.module}</span>
                <span><i className="pi pi-code mr-1" />{f.resource}</span>
                <span><i className="pi pi-file mr-1" />{f.file}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Dependency Vulnerabilities (Trivy)" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={scan.cves} size="small" responsiveLayout="scroll" sortField="severity" className="p-datatable-sm">
          <Column field="id" header="CVE" className="font-mono text-blue-300" />
          <Column field="pkg" header="Package" className="font-mono" />
          <Column field="installed" header="Installed" className="font-mono text-red-300" />
          <Column field="fixed" header="Fixed In" className="font-mono text-emerald-300" />
          <Column header="Severity" body={(row) => severityTag(row.severity)} sortable sortField="severity" />
          <Column field="target" header="Manifest" className="font-mono text-xs text-gray-500" />
        </DataTable>
        <Divider />
        <div className="font-mono text-xs text-gray-500">
          Trivy scan-type: fs &middot; severity filter: CRITICAL,HIGH &middot; ignore-unfixed: true
        </div>
      </Card>
    </div>
  );
}
