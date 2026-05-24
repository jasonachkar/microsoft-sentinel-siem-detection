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
    name: 'Human-approved VM isolation',
    target: 'Scoped Azure Network Security Group',
    status: 'design',
    lastRun: 'Demo only',
    severity: 'High',
  },
  {
    id: 2,
    name: 'Review Entra ID session revocation',
    target: 'Microsoft Graph permission design',
    status: 'design',
    lastRun: 'Demo only',
    severity: 'Critical',
  },
  {
    id: 3,
    name: 'Malicious IP block approval',
    target: 'Approved firewall or NSG scope',
    status: 'design',
    lastRun: 'Demo only',
    severity: 'Medium',
  },
];

const workflowSteps = [
  { step: 'Incident trigger', status: 'repo-backed', detail: 'Sentinel incident payload starts the Logic App flow.' },
  { step: 'Entity parsing', status: 'design', detail: 'Host, IP, account, and resource fields are normalized for review.' },
  { step: 'Scope check', status: 'repo-backed', detail: 'Target must match the approved lab containment resource group.' },
  { step: 'Human approval', status: 'required', detail: 'Analyst confirms blast radius, target, and rollback path.' },
  { step: 'Containment action', status: 'design', detail: 'Approved path would apply NSG deny rule or quarantine tag.' },
  { step: 'Incident comment', status: 'design', detail: 'Outcome should be written back to Sentinel for evidence.' },
];

const statusSeverity = {
  design: 'info',
  approval: 'warning',
  simulated: 'success',
};

export default function SoarDashboard() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooks);
  const [logs, setLogs] = useState([]);

  const approvalCount = useMemo(() => playbooks.filter((playbook) => playbook.status === 'approval').length, [playbooks]);
  const simulatedCount = useMemo(() => playbooks.filter((playbook) => playbook.status === 'simulated').length, [playbooks]);

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

  const simulateApproval = (id, name) => {
    setPlaybooks((current) => current.map((playbook) => (
      playbook.id === id ? { ...playbook, status: 'approval' } : playbook
    )));
    appendLog(`Created approval request for playbook design: ${name}`, 'warning');

    window.setTimeout(() => {
      appendLog('Scope check passed for approved lab containment resource group.', 'info');
    }, 750);

    window.setTimeout(() => {
      appendLog('Demo approval recorded. A live workflow would apply a scoped action and write the outcome to Sentinel.', 'success');
      setPlaybooks((current) => current.map((playbook) => (
        playbook.id === id ? { ...playbook, status: 'simulated', lastRun: 'Simulated just now' } : playbook
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
      icon={rowData.status === 'approval' ? 'pi pi-spin pi-spinner' : 'pi pi-check-square'}
      label={rowData.status === 'approval' ? 'Awaiting approval' : 'Simulate approval'}
      disabled={rowData.status === 'approval'}
      severity={rowData.status === 'simulated' ? 'success' : 'info'}
      size="small"
      onClick={() => simulateApproval(rowData.id, rowData.name)}
    />
  );

  const stepStatusTemplate = (rowData) => {
    const severity = rowData.status === 'required' ? 'warning' : rowData.status === 'repo-backed' ? 'success' : 'info';
    return <Tag value={rowData.status} severity={severity} />;
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-bolt text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SOAR Response</h1>
            <p className="text-gray-400">
              Logic App containment pattern with scope checks, approval, least-privilege identity, and demo-only execution logs.
            </p>
          </div>
          <Tag value="Design walkthrough" severity="info" />
          <Tag value="No autonomous containment claim" severity="danger" />
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Playbook Designs</div>
              <div className="mt-1 text-4xl font-bold">{playbooks.length}</div>
            </div>
            <i className="pi pi-sitemap text-3xl text-blue-300" />
          </div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Pending Approval</div>
              <div className="mt-1 text-4xl font-bold text-yellow-300">{approvalCount}</div>
            </div>
            <i className="pi pi-clock text-3xl text-yellow-300" />
          </div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Approved Simulations</div>
              <div className="mt-1 text-4xl font-bold text-emerald-300">{simulatedCount}</div>
            </div>
            <i className="pi pi-check-circle text-3xl text-emerald-300" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="SOAR Playbook Designs" className="border border-dark-700 bg-dark-900 shadow-xl">
          <DataTable value={playbooks} dataKey="id" responsiveLayout="scroll" size="small">
            <Column field="name" header="Playbook" sortable />
            <Column field="target" header="Target System" />
            <Column header="Severity" body={severityTemplate} sortable />
            <Column header="Status" body={statusTemplate} sortable />
            <Column field="lastRun" header="Evidence" />
            <Column header="Action" body={actionTemplate} />
          </DataTable>

          <Divider />

          <DataTable value={workflowSteps} size="small">
            <Column field="step" header="Workflow Step" className="font-semibold text-blue-200" />
            <Column header="Status" body={stepStatusTemplate} />
            <Column field="detail" header="What happens" />
          </DataTable>
        </Card>

        <Card title="Approval Simulation Logs" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="mb-4 rounded-lg border border-dark-700 bg-black p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-600">Waiting for approval simulation...</div>
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
          <ProgressBar value={simulatedCount ? Math.round((simulatedCount / playbooks.length) * 100) : 0} />
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
            Live containment evidence is intentionally not claimed until sanitized Logic App run history is captured.
          </div>
        </Card>
      </div>
    </div>
  );
}
