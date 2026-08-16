import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  level = 2,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Use level={1} exactly once per page, for the top-of-page title. */
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? 'h1' : 'h2';
  const headingSize = level === 1 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-[28px]';

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-tertiary">{eyebrow}</div>
        )}
        <Heading className={`font-semibold tracking-tight text-text-primary ${headingSize}`}>{title}</Heading>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-text-secondary sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
