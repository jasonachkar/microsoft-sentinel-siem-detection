import { Link } from 'react-router-dom';
import { GITHUB_URL } from '../../config/navigation';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-text-tertiary sm:px-6">
        <span>Portfolio lab — not a production SOC.</span>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Secondary">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-text-secondary">
            Source on GitHub
          </a>
          <Link to="/interview" className="hover:text-text-secondary">
            Candidate brief
          </Link>
          <Link to="/lab" className="hover:text-text-secondary">
            Lab sandbox
          </Link>
        </nav>
      </div>
    </footer>
  );
}
