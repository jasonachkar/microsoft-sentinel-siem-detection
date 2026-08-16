/**
 * Six-state status vocabulary used across the primary reviewer surfaces
 * (Home, Detections, Architecture, Operations, Evidence). Distinct from the
 * older ad hoc "Real IaC / Demo data" labels in data/projectFacts.js and
 * data/evidenceCatalog.js, which this maps onto so existing curated content
 * doesn't need to be rewritten by hand.
 */
export type Status = 'implemented' | 'validated' | 'live-tested' | 'simulated' | 'designed' | 'planned';

export const statusLabel: Record<Status, string> = {
  implemented: 'Implemented',
  validated: 'Validated',
  'live-tested': 'Live-tested',
  simulated: 'Simulated',
  designed: 'Designed',
  planned: 'Planned',
};

export const statusDescription: Record<Status, string> = {
  implemented: 'The code or configuration exists in the repository.',
  validated: 'An automated check (schema validation, terraform validate, unit tests, CI) confirms this works.',
  'live-tested': 'Run against a real Azure/Sentinel tenant and confirmed there.',
  simulated: 'Uses synthetic or sample data, not live telemetry.',
  designed: 'A documented pattern with a partial implementation, not yet fully tested end to end.',
  planned: 'Not built yet.',
};

/** Legacy status strings used in data/evidenceCatalog.js and data/projectFacts.js. */
const legacyToStatus: Record<string, Status> = {
  'real-iac': 'validated',
  'real-code': 'validated',
  'real-ci': 'validated',
  'Real IaC': 'validated',
  'Real code': 'validated',
  'Real CI': 'validated',
  'Repo-backed': 'implemented',
  'repo-backed': 'implemented',
  'demo-data': 'simulated',
  'Demo data': 'simulated',
  'Demo telemetry': 'simulated',
  'Demo telemetry labelled': 'simulated',
  simulated: 'simulated',
  Simulated: 'simulated',
  planned: 'planned',
  Planned: 'planned',
  Design: 'designed',
  design: 'designed',
  limitation: 'simulated',
  Limitation: 'simulated',
  'Deployable lab': 'implemented',
  'Not a production SOC': 'planned',
};

const canonicalStatuses = new Set<string>(Object.keys(statusLabel));

export function toStatus(value: string | undefined): Status {
  if (!value) return 'planned';
  if (canonicalStatuses.has(value)) return value as Status;
  return legacyToStatus[value] ?? 'designed';
}
