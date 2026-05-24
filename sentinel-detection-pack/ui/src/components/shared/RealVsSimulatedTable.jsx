import React from 'react';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { realVsSimulated } from '../../data/projectFacts';
import StatusTag from './StatusTag';

export default function RealVsSimulatedTable({ title = 'Real vs Simulated', compact = false }) {
  return (
    <Card title={title} className="border border-dark-700 bg-dark-900 shadow-xl">
      <DataTable value={realVsSimulated} className="p-datatable-sm" size={compact ? 'small' : undefined}>
        <Column field="area" header="Area" />
        <Column header="Status" body={(row) => <StatusTag value={row.status} />} />
        <Column field="notes" header="Notes" />
      </DataTable>
    </Card>
  );
}
