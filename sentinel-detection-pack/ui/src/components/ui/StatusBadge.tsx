import { statusDescription, statusLabel, toStatus, type Status } from '../../data/statusVocabulary';
import { Tooltip } from './Tooltip';

const toneClasses: Record<Status, string> = {
  implemented: 'bg-accent-subtle text-accent border-accent/30',
  validated: 'bg-success-subtle text-success border-success/30',
  'live-tested': 'bg-success-subtle text-success border-success/40 font-semibold',
  simulated: 'bg-warning-subtle text-warning border-warning/30',
  designed: 'bg-surface-subtle text-text-secondary border-border-strong',
  planned: 'bg-surface-subtle text-text-tertiary border-border',
};

export function StatusBadge({ value, describe = true }: { value: string; describe?: boolean }) {
  const status = toStatus(value);
  const label = statusLabel[status];
  const badge = (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[status]}`}
    >
      {label}
    </span>
  );
  if (!describe) return badge;
  return <Tooltip label={statusDescription[status]}>{badge}</Tooltip>;
}
