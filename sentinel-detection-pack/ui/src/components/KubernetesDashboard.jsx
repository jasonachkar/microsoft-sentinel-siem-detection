import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { telemetryEngine } from '../services/telemetryEngine';

export default function KubernetesDashboard() {
  const [events, setEvents] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setEvents(telemetryEngine.generateKubernetesLogs(25));
  }, []);

  const actionBodyTemplate = (rowData) => {
    const getSeverity = (verb) => {
      switch (verb) {
        case 'exec':
          return 'danger';
        case 'delete':
          return 'warning';
        case 'create':
          return 'success';
        default:
          return 'info';
      }
    };

    return <Tag value={rowData.Verb.toUpperCase()} severity={getSeverity(rowData.Verb)} />;
  };

  const timeTemplate = (rowData) => new Date(rowData.TimeGenerated).toLocaleString();

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 text-xl font-bold text-gray-200">Cluster Audit Trail</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(event) => setGlobalFilter(event.target.value)}
          placeholder="Filter logs..."
          className="p-inputtext-sm border-gray-700 bg-gray-800 text-white"
        />
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl animate-in space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
            <i className="pi pi-box text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-200">Cloud-Native Kubernetes Telemetry</h1>
            <p className="text-gray-400">Streaming simulated AKS/EKS API server audit logs mapping to MITRE T1609.</p>
            <div className="mt-2">
              <Tag value="Simulated telemetry" severity="warning" />
            </div>
          </div>
        </div>
      </section>

      <Card className="border-none bg-gray-900 shadow-2xl">
        <DataTable
          value={events}
          paginator
          rows={10}
          globalFilter={globalFilter}
          header={header}
          className="p-datatable-sm"
          emptyMessage="No container events detected."
        >
          <Column body={timeTemplate} header="Timestamp" sortable style={{ width: '15%' }} />
          <Column header="Action" body={actionBodyTemplate} style={{ width: '10%' }} />
          <Column field="User" header="Identity" sortable style={{ width: '20%' }} className="font-mono text-sm text-blue-400" />
          <Column field="Namespace" header="Namespace" sortable style={{ width: '15%' }} />
          <Column field="Resource" header="Resource" sortable style={{ width: '15%' }} className="font-mono text-sm" />
          <Column field="SourceIP" header="Source IP" sortable style={{ width: '15%' }} />
        </DataTable>
      </Card>
    </div>
  );
}
