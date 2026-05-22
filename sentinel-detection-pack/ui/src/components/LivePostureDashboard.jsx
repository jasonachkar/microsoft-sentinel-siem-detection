import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { liveApiService } from '../services/liveApiService';

export default function LivePostureDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    liveApiService.getInfrastructurePosture().then((data) => {
      if (!mounted) return;
      setResources(Array.isArray(data) ? data : []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const typeBodyTemplate = (rowData) => {
    const type = rowData.type || rowData.Type || 'unknown';
    return <Tag value={type.split('/').pop()} severity="info" />;
  };

  const statusBodyTemplate = () => <Tag value="Active" severity="success" icon="pi pi-check" />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <i className="pi pi-cloud text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-200">Live IaC Posture</h1>
            <p className="text-gray-400">
              Real-time resource state queried from Azure Resource Graph to validate Terraform-managed infrastructure.
            </p>
          </div>
        </div>
      </section>

      <Card className="border border-dark-700 bg-dark-900 shadow-lg">
        {loading ? (
          <div className="flex justify-center p-8">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={resources}
            paginator
            rows={10}
            className="p-datatable-sm"
            emptyMessage="No Terraform-managed resources found in the live environment."
          >
            <Column field="name" header="Resource Name" sortable className="font-mono text-sm" />
            <Column header="Type" body={typeBodyTemplate} sortable />
            <Column field="resourceGroup" header="Resource Group" sortable />
            <Column field="location" header="Region" sortable />
            <Column header="State" body={statusBodyTemplate} />
          </DataTable>
        )}
      </Card>
    </div>
  );
}
