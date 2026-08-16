import type { HTMLAttributes, ReactNode } from 'react';

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/** Flat, bordered surface. No blur, no hover-lift, no gradient — per the design rules. */
export function Panel({ title, action, children, className = '', ...rest }: PanelProps) {
  return (
    <div className={`min-w-0 rounded-xl border border-border bg-surface p-5 ${className}`} {...rest}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
