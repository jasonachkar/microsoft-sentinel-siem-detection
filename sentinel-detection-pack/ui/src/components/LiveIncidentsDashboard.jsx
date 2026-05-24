import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { liveApiService } from '../services/liveApiService';

export default function LiveIncidentsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([liveApiService.getIncidents(), liveApiService.getAlerts()]).then(([incidentData, alertData]) => {
      if (!mounted) return;
      setIncidents(Array.isArray(incidentData) ? incidentData : []);
      setAlerts(Array.isArray(alertData) ? alertData : []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => ({
    incidents: incidents.length,
    alerts: alerts.reduce((sum, alert) => sum + Number(alert.alertCount || alert.AlertCount || 1), 0),
    high: incidents.filter((incident) => ['High', 'Critical'].includes(incident.severity || incident.Severity)).length,
  }), [alerts, incidents]);

  const severityTemplate = (rowData) => {
    const severity = rowData.severity || rowData.Severity || 'Informational';
    const tagSeverity = severity === 'Critical' || severity === 'High' ? 'danger' : severity === 'Medium' ? 'warning' : 'info';
    return <Tag value={severity} severity={tagSeverity} />;
  };

  const titleTemplate = (rowData) => rowData.title || rowData.Title || rowData.name || rowData.Name || 'Untitled incident';
  const ownerTemplate = (rowData) => rowData.owner || rowData.Owner || 'Unassigned';
  const lastSeenTemplate = (rowData) => rowData.lastSeen || rowData.LastSeen || 'Unknown';
  const statusTemplate = (rowData) => <Tag value={rowData.status || rowData.Status || 'New'} severity="info" />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/15 text-red-300">
            <i className="pi pi-shield text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-200">API-Backed Sentinel Incidents</h1>
            <p className="text-gray-400">Optional Azure Function path for incidents and alerts when a Sentinel workspace is configured.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">Open Incidents</div>
          <div className="mt-1 text-4xl font-black text-blue-300">{metrics.incidents}</div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">Alert Volume</div>
          <div className="mt-1 text-4xl font-black text-yellow-300">{metrics.alerts}</div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">High/Critical Queue</div>
          <div className="mt-1 text-4xl font-black text-red-300">{metrics.high}</div>
        </Card>
      </div>

      <Card title="Sentinel Incident API Results" className="border border-dark-700 bg-dark-900 shadow-lg">
        <DataTable value={incidents} loading={loading} paginator rows={10} className="p-datatable-sm" emptyMessage="No incidents returned by the optional API.">
          <Column header="Incident" body={titleTemplate} sortable />
          <Column header="Severity" body={severityTemplate} sortable />
          <Column header="Status" body={statusTemplate} sortable />
          <Column header="Owner" body={ownerTemplate} sortable />
          <Column header="Last Seen" body={lastSeenTemplate} sortable />
        </DataTable>
      </Card>
    </div>
  );
}
