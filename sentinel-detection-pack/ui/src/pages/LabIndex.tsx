import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { labNav } from '../config/navigation';

export default function LabIndex() {
  const items = labNav.filter((item) => item.path !== '/lab');

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary">
        <ArrowLeft size={14} /> Main site
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-text-primary">Lab sandbox</h1>
      <p className="mt-2 max-w-[640px] text-sm text-text-secondary">
        Experimental and concept pages kept for technical value — demo telemetry, local simulations, and early
        prototypes. None of these are part of the primary reviewer path, and each is explicitly labeled as demo or
        concept work.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-lg border border-border p-4 text-sm font-medium text-text-primary hover:border-border-strong"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
