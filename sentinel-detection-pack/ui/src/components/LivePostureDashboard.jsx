import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { liveApiService } from '../services/liveApiService';

export default function LivePostureDashboard() {
  const [resources, setResources] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      liveApiService.getInfrastructurePosture(),
      liveApiService.getPostureFindings(),
    ]).then(([resourceData, findingData]) => {
      if (!mounted) return;
      setResources(Array.isArray(resourceData) ? resourceData : []);
      setFindings(Array.isArray(findingData) ? findingData : []);
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
  const managedBodyTemplate = (rowData) => {
    const managed = rowData.TerraformManaged === true || rowData.terraformManaged === true;
    return <Tag value={managed ? 'Terraform' : 'Portal / Unknown'} severity={managed ? 'success' : 'warning'} />;
  };
  const severityBodyTemplate = (rowData) => {
    const severity = rowData.severity || rowData.Severity || 'Info';
    const tagSeverity = severity === 'High' ? 'danger' : severity === 'Medium' ? 'warning' : 'info';
    return <Tag value={severity} severity={tagSeverity} />;
  };

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

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">Azure Resources</div>
          <div className="mt-1 text-4xl font-black text-blue-300">{resources.length}</div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">Actual Findings</div>
          <div className="mt-1 text-4xl font-black text-red-300">{findings.length}</div>
        </Card>
        <Card className="border border-dark-700 bg-dark-900">
          <div className="text-sm text-gray-400">High Severity</div>
          <div className="mt-1 text-4xl font-black text-orange-300">
            {findings.filter((finding) => (finding.severity || finding.Severity) === 'High').length}
          </div>
        </Card>
      </div>

      <Card title="Actual Azure Posture Findings" className="border border-dark-700 bg-dark-900 shadow-lg">
        <DataTable
          value={findings}
          paginator
          rows={10}
          loading={loading}
          className="p-datatable-sm"
          emptyMessage="No live posture findings returned by Azure Resource Graph."
        >
          <Column header="Severity" body={severityBodyTemplate} sortable />
          <Column field="name" header="Resource" sortable className="font-mono text-sm" />
          <Column field="issue" header="Issue" sortable />
          <Column field="recommendation" header="Recommendation" />
          <Column field="resourceGroup" header="Resource Group" sortable />
        </DataTable>
      </Card>

      <Card title="Live Azure Resource Inventory" className="border border-dark-700 bg-dark-900 shadow-lg">
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
            <Column header="IaC Source" body={managedBodyTemplate} sortable />
            <Column header="State" body={statusBodyTemplate} />
          </DataTable>
        )}
      </Card>
    </div>
  );
}
