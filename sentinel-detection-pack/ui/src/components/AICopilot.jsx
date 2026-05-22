import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';

const mockIncident = {
  id: 'INC-98234',
  title: 'Suspicious PowerShell Encoded Command',
  severity: 'High',
  entity: 'vm-honeypot-01',
  account: 'socadmin',
  time: 'Just now',
};

const modelSteps = [
  'Collect Sentinel incident entities and KQL context',
  'Map process telemetry to MITRE ATT&CK tactics',
  'Generate analyst summary and response recommendation',
  'Append triage report to Sentinel incident comments',
];

export default function AICopilot() {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    setReport(null);

    window.setTimeout(() => {
      setAnalyzing(false);
      setReport({
        confidence: 94,
        summary:
          "The encoded PowerShell command matches known lateral movement patterns via Atomic Red Team validation. The account 'socadmin' executed a Base64 payload from vm-honeypot-01.",
        action: "Trigger SOAR playbook 'Isolate Compromised Host' and revoke socadmin sessions.",
        mitre: ['T1059.001 - PowerShell', 'T1059 - Command and Scripting Interpreter'],
      });
    }, 2200);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
            <i className="pi pi-sparkles text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GenAI SOC Analyst Copilot</h1>
            <p className="text-gray-400">
              LLM-powered Sentinel incident triage, MITRE mapping, and SOAR response recommendation.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card title="Untriaged Incident Queue" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="rounded-lg border border-red-500/30 bg-dark-950 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <Tag value={mockIncident.severity} severity="danger" />
              <span className="text-sm text-gray-500">{mockIncident.time}</span>
            </div>
            <h2 className="text-xl font-semibold">{mockIncident.title}</h2>
            <div className="mt-4 grid gap-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <i className="pi pi-desktop text-blue-300" />
                Entity: {mockIncident.entity}
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-user text-yellow-300" />
                Account: {mockIncident.account}
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-code text-purple-300" />
                KQL: SecurityEvent where CommandLine contains -enc
              </div>
            </div>
          </div>

          <Button
            className="mt-5 w-full justify-center"
            icon={analyzing ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'}
            label={analyzing ? 'AI is analyzing context...' : 'Request GenAI Triage'}
            severity="help"
            disabled={analyzing}
            onClick={runAnalysis}
          />

          <Divider />

          <Timeline
            value={modelSteps}
            marker={(item, index) => (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
                {index + 1}
              </span>
            )}
            content={(item) => <div className="pb-3 text-sm text-gray-300">{item}</div>}
          />
        </Card>

        <Card title="Copilot Analysis Report" className="relative overflow-hidden border border-dark-700 bg-dark-900 shadow-xl">
          {analyzing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-950/85 backdrop-blur">
              <i className="pi pi-spin pi-cog mb-4 text-5xl text-purple-300" />
              <div className="font-mono text-purple-200">Querying LLM SecOps model...</div>
            </div>
          )}

          {report ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm uppercase tracking-wide text-emerald-200">Malicious Confidence Score</div>
                    <div className="text-5xl font-black text-emerald-300">{report.confidence}%</div>
                  </div>
                  <i className="pi pi-verified text-4xl text-emerald-300" />
                </div>
                <ProgressBar value={report.confidence} showValue={false} />
              </div>

              <div>
                <h3 className="mb-2 text-sm uppercase tracking-wide text-gray-400">Executive Summary</h3>
                <p className="rounded-lg border-l-4 border-purple-500 bg-dark-950 p-4 leading-relaxed text-gray-200">
                  {report.summary}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm uppercase tracking-wide text-gray-400">Mapped MITRE Techniques</h3>
                <div className="flex flex-wrap gap-2">
                  {report.mitre.map((technique) => (
                    <Tag key={technique} value={technique} severity="danger" />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-200">
                  <i className="pi pi-check-circle" />
                  Automated Remediation
                </div>
                <p className="text-sm text-gray-300">{report.action}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-dark-700 bg-dark-950 text-gray-600">
              Awaiting incident analysis...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
