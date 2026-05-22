import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { liveApiService } from '../services/liveApiService';

export default function KubernetesDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    liveApiService.getKubernetesEvents().then((data) => {
      if (!mounted) return;
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const verbTemplate = (rowData) => {
    const verb = rowData.Verb || rowData.verb || 'unknown';
    const severity = verb === 'create' ? 'warning' : 'info';
    return <Tag value={verb} severity={severity} />;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
            <i className="pi pi-box text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-200">Kubernetes Live Telemetry</h1>
            <p className="text-gray-400">Streaming AKS/EKS API server audit logs through the Log Analytics KQL interface.</p>
          </div>
        </div>
      </section>

      <Card className="border border-dark-700 bg-dark-900 shadow-lg">
        <DataTable
          value={events}
          paginator
          rows={10}
          loading={loading}
          className="p-datatable-sm"
          emptyMessage="No container events detected in the last 24 hours."
        >
          <Column field="TimeGenerated" header="Timestamp" sortable />
          <Column field="User" header="Identity" sortable className="text-blue-300" />
          <Column header="Action" body={verbTemplate} />
          <Column field="Resource" header="K8s Resource" sortable className="font-mono" />
          <Column field="SourceIP" header="Source IP" sortable />
        </DataTable>
      </Card>
    </div>
  );
}
