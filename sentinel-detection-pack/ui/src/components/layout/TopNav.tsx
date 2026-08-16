import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, Monitor, Moon, Search, ShieldHalf, Sun } from 'lucide-react';
import { GITHUB_URL, primaryNav } from '../../config/navigation';
import { useTheme } from '../../hooks/useTheme';
import { Dialog } from '../ui/Dialog';
import { Tooltip } from '../ui/Tooltip';

function isActive(pathname: string, path: string) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

const themeIcon = { system: Monitor, light: Sun, dark: Moon } as const;
const themeLabel = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' } as const;

export function TopNav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { preference, cycleTheme } = useTheme();
  const ThemeIcon = themeIcon[preference];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} />
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2 text-text-primary">
          <ShieldHalf size={20} className="text-accent" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">Sentinel Detection Lab</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isActive(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden items-center gap-2 rounded-md border border-border bg-surface-subtle px-2.5 py-1.5 text-xs text-text-tertiary hover:border-border-strong sm:flex"
          >
            <Search size={13} />
            <span>Search</span>
            <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘K</kbd>
          </button>
          <Tooltip label={`Theme: ${themeLabel[preference]} (click to change)`}>
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={`Theme: ${themeLabel[preference]}. Click to change.`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle"
            >
              <ThemeIcon size={16} />
            </button>
          </Tooltip>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            <Github size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen} title="Menu" side="left">
        <nav className="flex flex-col p-2" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isActive(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                  active ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                <item.icon size={17} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-text-secondary hover:bg-surface-subtle"
          >
            <Github size={17} />
            GitHub
          </a>
        </nav>
      </Dialog>
    </header>
  );
}
