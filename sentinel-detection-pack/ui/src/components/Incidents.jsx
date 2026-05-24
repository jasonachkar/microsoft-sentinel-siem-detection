import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

export default function Incidents() {
  const [incidents] = useState([
    {
      id: 'INC-98234',
      title: 'Suspicious PowerShell Encoded Command',
      severity: 'High',
      status: 'New',
      time: '10 mins ago',
      entity: 'vm-honeypot-01',
    },
    {
      id: 'INC-98233',
      title: 'Multiple Failed Logins',
      severity: 'Medium',
      status: 'Triaged',
      time: '2 hours ago',
      entity: 'socadmin',
    },
    {
      id: 'INC-98232',
      title: 'Kubernetes Exec Anomaly',
      severity: 'High',
      status: 'Closed',
      time: '1 day ago',
      entity: 'kube-system/pod-nginx',
    },
  ]);

  const severityTemplate = (rowData) => (
    <Tag value={rowData.severity} severity={rowData.severity === 'High' ? 'danger' : 'warning'} />
  );

  const statusTemplate = (rowData) => {
    const severityMap = { New: 'danger', Triaged: 'info', Closed: 'success' };

    return <Tag value={rowData.status} severity={severityMap[rowData.status]} />;
  };

  const actionTemplate = () => (
    <Button
      label="Investigate"
      icon="pi pi-search"
      size="small"
      className="p-button-outlined p-button-info text-xs py-1"
    />
  );

  return (
    <div className="animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="pi pi-shield text-red-500"></i> Active Incidents
        </h1>
        <p className="text-soc-muted mt-1">Simulated incident workflow for demonstrating triage and response flow.</p>
        <span className="mt-2 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-200">
          Simulated incident workflow
        </span>
      </div>

      <div className="soc-panel p-4">
        <DataTable value={incidents} className="p-datatable-sm" emptyMessage="No active incidents.">
          <Column field="id" header="Incident ID" className="font-mono text-soc-muted" />
          <Column header="Severity" body={severityTemplate} />
          <Column field="title" header="Detection Title" className="font-bold text-white" />
          <Column field="entity" header="Target Entity" className="font-mono text-blue-400" />
          <Column header="Status" body={statusTemplate} />
          <Column field="time" header="Time" className="text-soc-muted" />
          <Column body={actionTemplate} header="Actions" />
        </DataTable>
      </div>
    </div>
  );
}
