import React, { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';

const initialPlaybooks = [
  {
    id: 1,
    name: 'Isolate Compromised VM',
    target: 'Azure Network Security Group',
    status: 'idle',
    lastRun: '2 hours ago',
    severity: 'High',
  },
  {
    id: 2,
    name: 'Revoke Entra ID Sessions',
    target: 'Microsoft Graph',
    status: 'idle',
    lastRun: '1 day ago',
    severity: 'Critical',
  },
  {
    id: 3,
    name: 'Block Malicious IP in Firewall',
    target: 'Azure Firewall policy',
    status: 'idle',
    lastRun: '5 mins ago',
    severity: 'Medium',
  },
];

const statusSeverity = {
  idle: 'info',
  running: 'warning',
  success: 'success',
};

export default function SoarDashboard() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [logs, setLogs] = useState([]);

  const runningCount = useMemo(() => playbooks.filter((playbook) => playbook.status === 'running').length, [playbooks]);
  const successCount = useMemo(() => playbooks.filter((playbook) => playbook.status === 'success').length, [playbooks]);

  const appendLog = (message, status = 'info') => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        message,
        status,
      },
      ...current,
    ]);
  };

  const triggerPlaybook = (id, name) => {
    setPlaybooks((current) => current.map((playbook) => (
      playbook.id === id ? { ...playbook, status: 'running' } : playbook
    )));
    appendLog(`Triggering Azure Logic App playbook: ${name}`, 'warning');

    window.setTimeout(() => {
      appendLog('Authenticating to Azure Resource Manager with managed identity.', 'info');
    }, 750);

    window.setTimeout(() => {
      appendLog('Applied containment action and wrote SOAR evidence to Sentinel.', 'success');
      setPlaybooks((current) => current.map((playbook) => (
        playbook.id === id ? { ...playbook, status: 'success', lastRun: 'Just now' } : playbook
      )));
    }, 2100);
  };

  const statusTemplate = (rowData) => (
    <Tag value={rowData.status.toUpperCase()} severity={statusSeverity[rowData.status]} />
  );

  const severityTemplate = (rowData) => {
    const severity = rowData.severity === 'Critical' ? 'danger' : rowData.severity === 'High' ? 'warning' : 'info';
    return <Tag value={rowData.severity} severity={severity} />;
  };

  const actionTemplate = (rowData) => (
    <Button
      icon={rowData.status === 'running' ? 'pi pi-spin pi-spinner' : 'pi pi-play'}
      label={rowData.status === 'running' ? 'Executing' : 'Run'}
      disabled={rowData.status === 'running'}
      severity={rowData.status === 'success' ? 'success' : 'info'}
      size="small"
      onClick={() => triggerPlaybook(rowData.id, rowData.name)}
    />
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-bolt text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Defense & SOAR</h1>
            <p className="text-gray-400">
              Serverless playbook orchestration panel for Azure Logic Apps, Entra ID, and network containment.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Available Playbooks</div>
              <div className="mt-1 text-4xl font-bold">{playbooks.length}</div>
            </div>
            <i className="pi pi-sitemap text-3xl text-blue-300" />
          </div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Executing Now</div>
              <div className="mt-1 text-4xl font-bold text-yellow-300">{runningCount}</div>
            </div>
            <i className="pi pi-spin pi-cog text-3xl text-yellow-300" />
          </div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Contained Sessions</div>
              <div className="mt-1 text-4xl font-bold text-emerald-300">{successCount}</div>
            </div>
            <i className="pi pi-shield text-3xl text-emerald-300" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="SOAR Playbook Control Plane" className="border border-dark-700 bg-dark-900 shadow-xl">
          <DataTable value={playbooks} dataKey="id" responsiveLayout="scroll" size="small">
            <Column field="name" header="Playbook" sortable />
            <Column field="target" header="Target System" />
            <Column header="Severity" body={severityTemplate} sortable />
            <Column header="Status" body={statusTemplate} sortable />
            <Column field="lastRun" header="Last Run" />
            <Column header="Action" body={actionTemplate} />
          </DataTable>

          <Divider />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <i className="pi pi-lock text-blue-300" />
                Managed Identity
              </div>
              <p className="text-sm text-gray-400">Logic Apps use system-assigned identity and least-privilege RBAC for containment actions.</p>
            </div>
            <div className="rounded-lg border border-dark-700 bg-dark-950 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <i className="pi pi-cloud text-emerald-300" />
                Azure Native Response
              </div>
              <p className="text-sm text-gray-400">Actions model token revocation, firewall deny rules, and Sentinel incident enrichment.</p>
            </div>
          </div>
        </Card>

        <Card title="SOAR Execution Logs" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="mb-4 rounded-lg border border-dark-700 bg-black p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-600">Waiting for playbook execution...</div>
            ) : (
              <Timeline
                value={logs}
                marker={(item) => (
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    item.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                    item.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    <i className={
                      item.status === 'success' ? 'pi pi-check' :
                      item.status === 'warning' ? 'pi pi-clock' :
                      'pi pi-info'
                    } />
                  </span>
                )}
                content={(item) => (
                  <div className="pb-3">
                    <div className="text-xs text-gray-500">{item.time}</div>
                    <div className="text-gray-300">{item.message}</div>
                  </div>
                )}
              />
            )}
          </div>
          <ProgressBar value={successCount ? Math.round((successCount / playbooks.length) * 100) : 0} />
        </Card>
      </div>
    </div>
  );
}
