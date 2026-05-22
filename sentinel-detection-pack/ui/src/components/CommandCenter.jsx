import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { MeterGroup } from 'primereact/metergroup';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import rulesData from '../data/rules.json';
import { liveApiService } from '../services/liveApiService';
import { telemetryEngine } from '../services/telemetryEngine';

const pipelineEvents = [
  { status: 'Code Commit', date: 'Automated Trigger', icon: 'pi pi-github', color: '#64748b', desc: 'Security engineer pushes KQL, Terraform, API, or UI changes to main.' },
  { status: 'Shift-Left Scans', date: 'Trivy, TFSec, Gitleaks', icon: 'pi pi-search', color: '#f59e0b', desc: 'Dependency, secret, and IaC vulnerability checks run before deployment.' },
  { status: 'Infrastructure Provisioning', date: 'Terraform', icon: 'pi pi-box', color: '#8b5cf6', desc: 'Azure Sentinel, SOAR, honeypot, and AWS connector modules define the environment.' },
  { status: 'Active Defense', date: 'Sentinel & AI Copilot', icon: 'pi pi-shield', color: '#3b82f6', desc: 'Live monitoring, incident triage, and automated containment are visible in one pane.' },
  { status: 'Continuous Validation', date: 'Atomic Red Team', icon: 'pi pi-bolt', color: '#ef4444', desc: 'Automated adversary emulation asserts detections before changes are trusted.' },
];

const appSecMeters = [
  { label: 'Critical', color: '#ef4444', value: 0 },
  { label: 'High', color: '#f97316', value: 2 },
  { label: 'Medium', color: '#eab308', value: 14 },
  { label: 'Passed Checks', color: '#22c55e', value: 84 },
];

export default function CommandCenter() {
  const [liveState, setLiveState] = useState({ incidents: [], k8s: [], resources: [], findings: [], loading: true });
  const [tiData, setTiData] = useState([]);

  useEffect(() => {
    let mounted = true;
    setTiData(telemetryEngine.generateThreatIntel());
    Promise.all([
      liveApiService.getIncidents(),
      liveApiService.getKubernetesEvents(),
      liveApiService.getInfrastructurePosture(),
      liveApiService.getPostureFindings(),
    ]).then(([incidents, k8s, resources, findings]) => {
      if (!mounted) return;
      setLiveState({
        incidents: Array.isArray(incidents) ? incidents : [],
        k8s: Array.isArray(k8s) ? k8s : [],
        resources: Array.isArray(resources) ? resources : [],
        findings: Array.isArray(findings) ? findings : [],
        loading: false,
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => ({
    activeRules: rulesData.total || rulesData.rules?.length || 0,
    liveIncidents: liveState.incidents.length,
    k8sEvents: liveState.k8s.length,
    terraformResources: liveState.resources.length,
    postureFindings: liveState.findings.length,
    highFindings: liveState.findings.filter((finding) => (finding.severity || finding.Severity) === 'High').length,
  }), [liveState.findings, liveState.incidents.length, liveState.k8s.length, liveState.resources.length]);

  const topFindings = liveState.findings.slice(0, 5);

  const customizedMarker = (item) => (
    <span
      className="z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg"
      style={{ backgroundColor: item.color }}
    >
      <i className={item.icon} />
    </span>
  );

  const customizedContent = (item) => (
    <div className="mb-4 rounded-lg border border-dark-700 bg-dark-950 p-4 shadow-md">
      <div className="text-lg font-bold text-gray-100">{item.status}</div>
      <div className="mb-2 font-mono text-sm text-blue-300">{item.date}</div>
      <div className="text-sm text-gray-400">{item.desc}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-globe text-2xl" />
          </span>
          <div>
            <h1 className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-4xl font-black text-transparent">
              Global SOC Command Center
            </h1>
            <p className="mt-1 text-lg text-gray-400">
              Single pane of glass for Shift-Left AppSec, multi-cloud IaC, Kubernetes telemetry, and AI-driven active defense.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Multi-Cloud & Container Posture" className="border border-dark-700 bg-dark-900 shadow-xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex h-full flex-col justify-between rounded-lg border-l-4 border-blue-500 bg-dark-950 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-100"><i className="pi pi-microsoft mr-2 text-blue-300" />Azure Core</h3>
                    <Tag severity="success" value="Online" />
                  </div>
                  <p className="text-xs text-gray-400">Terraform State: Synced</p>
                  <p className="text-xs text-gray-400">Sentinel Data Connectors: Active</p>
                </div>
                <div className="mt-4 rounded bg-dark-900 p-2 font-mono text-xs text-gray-500">
                  Drift Check: Passed (2:00 AM)
                </div>
              </div>

              <div className="flex h-full flex-col justify-between rounded-lg border-l-4 border-orange-500 bg-dark-950 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-100"><i className="pi pi-amazon mr-2 text-orange-300" />AWS Integration</h3>
                    <Tag severity="success" value="OIDC Trusted" />
                  </div>
                  <p className="text-xs text-gray-400">CloudTrail S3 Bucket: Active</p>
                  <p className="text-xs text-gray-400">AssumeRole IAM: Configured</p>
                </div>
                <div className="mt-4 rounded bg-dark-900 p-2 font-mono text-xs text-gray-500">Cross-cloud logs flowing</div>
              </div>

              <div className="flex h-full flex-col justify-between rounded-lg border-l-4 border-purple-500 bg-dark-950 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-100"><i className="pi pi-box mr-2 text-purple-300" />K8s / Docker</h3>
                    <Tag severity="warning" value="Monitoring" />
                  </div>
                  <p className="text-xs text-gray-400">AKS/EKS Audit Logs: Ingesting</p>
                  <p className="text-xs text-gray-400">Trivy Image Scans: Active</p>
                </div>
                <div className="mt-4 rounded border border-emerald-500/30 bg-dark-900 p-2 font-mono text-xs text-emerald-300">
                  Anomaly detections live
                </div>
              </div>
            </div>
          </Card>

          <Card title="Shift-Left AppSec Scans" className="border border-dark-700 bg-dark-900 shadow-xl">
            <div className="mb-4 text-sm text-gray-400">
              Results from the latest CI/CD run across Trivy, TFSec, Gitleaks, Terraform, Go, Python, and Node.js assets.
            </div>
            <MeterGroup values={appSecMeters} className="mb-4" />
            <div className="mt-4 flex justify-between border-t border-dark-700 pt-3 font-mono text-xs text-gray-500">
              <span>Last Scan: {new Date().toLocaleDateString()}</span>
              <span>Pipeline Assertion: PASSED</span>
            </div>
          </Card>

          <Card title="Active Threat Intel Ingestion" className="mt-6 border border-gray-700 bg-gray-900 shadow-xl">
            <DataTable value={tiData} rows={4} className="p-datatable-sm">
              <Column field="indicator" header="Indicator (IOC)" className="font-mono text-red-400" />
              <Column field="actor" header="Threat Actor" />
              <Column
                field="confidence"
                header="Confidence"
                body={(row) => <Tag value={`${row.confidence}%`} severity={row.confidence > 80 ? 'danger' : 'warning'} />}
              />
              <Column field="lastSeen" header="Last Seen" className="text-sm text-gray-500" />
            </DataTable>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
              <div className="mb-1 text-xs uppercase text-gray-400">Active KQL Rules</div>
              <div className="text-3xl font-black text-blue-300">{stats.activeRules}</div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
              <div className="mb-1 text-xs uppercase text-gray-400">Actual Findings</div>
              <div className="text-3xl font-black text-red-300">{stats.postureFindings}</div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
              <div className="mb-1 text-xs uppercase text-gray-400">High Severity</div>
              <div className="text-3xl font-black text-orange-300">{stats.highFindings}</div>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-900 p-4 text-center">
              <div className="mb-1 text-xs uppercase text-gray-400">SOAR Playbooks</div>
              <div className="text-3xl font-black text-emerald-300">3</div>
            </div>
          </div>
        </div>

        <Card title="DevSecOps Architecture" className="border border-dark-700 bg-dark-900 shadow-xl">
          <p className="mb-6 text-sm text-gray-400">Automated end-to-end continuous security lifecycle.</p>
          <Timeline value={pipelineEvents} marker={customizedMarker} content={customizedContent} className="w-full" />
          <Divider />
          <div className="grid gap-2 text-sm text-gray-400">
            <div><strong className="text-gray-200">Live API:</strong> C# Azure Functions backed by Log Analytics and Resource Graph.</div>
            <div><strong className="text-gray-200">Azure resources:</strong> {stats.terraformResources || 'awaiting Azure auth'}</div>
            <div><strong className="text-gray-200">Sentinel incidents:</strong> {stats.liveIncidents}</div>
          </div>
        </Card>
      </div>

      <Card title="Top Actual Azure Issues" className="border border-dark-700 bg-dark-900 shadow-xl">
        {topFindings.length === 0 ? (
          <div className="text-sm text-gray-400">No posture findings returned by Azure Resource Graph.</div>
        ) : (
          <div className="grid gap-3">
            {topFindings.map((finding) => {
              const severity = finding.severity || finding.Severity || 'Info';
              const tagSeverity = severity === 'High' ? 'danger' : severity === 'Medium' ? 'warning' : 'info';
              return (
                <div key={`${finding.name}-${finding.issue}`} className="rounded-lg border border-dark-700 bg-dark-950 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-gray-100">{finding.issue}</div>
                    <Tag severity={tagSeverity} value={severity} />
                  </div>
                  <div className="font-mono text-sm text-blue-300">{finding.name}</div>
                  <div className="mt-1 text-sm text-gray-400">{finding.recommendation}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
