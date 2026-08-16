import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './labStyles.css';

/**
 * Experimental/demo pages are kept for technical value but are not part of
 * the public reviewer path. This banner makes that unmistakable rather than
 * letting simulated functionality blend in with the primary site.
 */
export default function LabLayout({ children }) {
  return (
    <div className="lab-shell">
      <div className="flex items-center gap-3 border-b border-dark-700 bg-dark-950 px-4 py-2.5 text-xs text-gray-400 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-gray-200">
          <ArrowLeft size={13} />
          Main site
        </Link>
        <span className="text-gray-600">|</span>
        <span>Lab sandbox — experimental/demo page, not part of the primary reviewer path.</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
