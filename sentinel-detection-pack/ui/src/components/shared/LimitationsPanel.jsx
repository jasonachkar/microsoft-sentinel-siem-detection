import React from 'react';
import { Card } from 'primereact/card';
import { projectLimitations } from '../../data/limitations';

export default function LimitationsPanel({ id, title = 'Limitations', compact = false }) {
  return (
    <Card id={id} title={title} className="border border-red-500/30 bg-red-950/10">
      <div className={`grid gap-3 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
        {projectLimitations.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-lg border border-red-500/20 bg-black/20 p-3 text-sm text-red-100">
            <i className="pi pi-exclamation-triangle mt-0.5 shrink-0 text-red-300" />
            <span>{item.summary}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
