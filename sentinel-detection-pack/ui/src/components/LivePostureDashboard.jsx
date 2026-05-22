import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { telemetryEngine } from '../services/telemetryEngine';

export default function LivePostureDashboard() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    setResources(telemetryEngine.generateIaCPosture());
  }, []);

  const typeBodyTemplate = (rowData) => (
    <span className="font-mono text-sm text-blue-300">{rowData.type}</span>
  );

  const statusBodyTemplate = (rowData) => {
    const isDrift = rowData.state === 'Drift Detected';
    return (
      <Tag
        value={rowData.state}
        severity={isDrift ? 'danger' : 'success'}
        icon={isDrift ? 'pi pi-exclamation-triangle' : 'pi pi-check'}
      />
    );
  };

  return (
    <div className="mx-auto max-w-7xl animate-in space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-cloud text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-200">Infrastructure-as-Code Posture</h1>
            <p className="text-gray-400">Azure Resource Graph validation for Terraform deployments and multi-cloud resources.</p>
          </div>
        </div>
      </section>

      <Card className="border-none bg-gray-900 shadow-2xl">
        <DataTable value={resources} className="p-datatable-sm" emptyMessage="No resources found.">
          <Column field="name" header="Resource Name" sortable className="font-bold text-gray-200" />
          <Column header="Resource Provider" body={typeBodyTemplate} sortable />
          <Column field="location" header="Region" sortable />
          <Column header="State" body={statusBodyTemplate} />
          <Column field="lastDrift" header="Drift Analysis" className="text-sm text-gray-400" />
        </DataTable>
      </Card>
    </div>
  );
}
