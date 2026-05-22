import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import rulesData from '../data/rules.json';

export default function RulesCatalog() {
  const [rules, setRules] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const normalizedRules = (rulesData.rules || []).map((rule) => ({
      ...rule,
      category: rule.category || rule.dataSources?.[0] || 'sentinel',
    }));

    setRules(normalizedRules);
  }, []);

  const severityTemplate = (rowData) => {
    const severity = rowData.severity?.toLowerCase();
    const severityMap = { high: 'danger', medium: 'warning', low: 'info' };

    return <Tag value={rowData.severity || 'Unknown'} severity={severityMap[severity] || 'info'} />;
  };

  const mitreTemplate = (rowData) => {
    const tactics = rowData.tactics || [];
    const techniques = rowData.techniques || [];

    return (
      <div className="flex flex-wrap gap-1">
        {[...tactics, ...techniques].map((value) => (
          <span key={value} className="text-xs bg-gray-800 border border-gray-600 px-2 py-1 rounded">
            {value}
          </span>
        ))}
      </div>
    );
  };

  const header = (
    <div className="flex justify-between items-center gap-4">
      <h2 className="m-0 text-xl text-white">Detection Engineering Catalog</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(event) => setGlobalFilter(event.target.value)}
          placeholder="Search rules..."
          className="p-inputtext-sm bg-soc-bg"
        />
      </span>
    </div>
  );

  return (
    <div className="animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <i className="pi pi-list text-blue-500"></i> Detection Rules
        </h1>
        <p className="text-soc-muted mt-1">
          Repository of active Sentinel Analytics Rules deployed via CI/CD.
        </p>
      </div>

      <div className="soc-panel">
        <DataTable
          value={rules}
          paginator
          rows={15}
          dataKey="id"
          globalFilter={globalFilter}
          header={header}
          className="p-datatable-sm"
          emptyMessage="No detection rules found."
        >
          <Column
            field="name"
            header="Rule Name"
            sortable
            style={{ width: '25%' }}
            className="font-medium text-blue-300"
          />
          <Column
            field="category"
            header="Data Source"
            sortable
            style={{ width: '15%' }}
            className="uppercase text-xs"
          />
          <Column header="Severity" body={severityTemplate} sortable style={{ width: '10%' }} />
          <Column header="MITRE ATT&CK" body={mitreTemplate} style={{ width: '30%' }} />
          <Column
            field="id"
            header="Rule GUID"
            style={{ width: '20%' }}
            className="font-mono text-xs text-soc-muted"
          />
        </DataTable>
      </div>
    </div>
  );
}
