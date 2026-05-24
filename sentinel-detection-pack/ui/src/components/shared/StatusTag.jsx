import React from 'react';
import { Tag } from 'primereact/tag';
import { evidenceStatusLabels } from '../../data/evidenceCatalog';
import { statusSeverity } from '../../data/projectFacts';

function resolveLabel(value) {
  if (!value) return '';
  return evidenceStatusLabels[value] || value;
}

export default function StatusTag({ value, status }) {
  const label = resolveLabel(value || status);
  return <Tag value={label} severity={statusSeverity[label] || 'info'} />;
}
