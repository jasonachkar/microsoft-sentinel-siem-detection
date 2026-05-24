import React from 'react';

export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">{eyebrow}</div>
        )}
        <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-400 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
