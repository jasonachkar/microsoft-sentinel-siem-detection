import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navSections } from '../config/navigation';
import CommandPalette from './CommandPalette';
import WelcomeTour from './WelcomeTour';

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || '');

export default function Layout({ children }) {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tourRun, setTourRun] = useState(false);

  // First-visit auto-start of the guided tour.
  useEffect(() => {
    try {
      if (!localStorage.getItem('sentinel-tour-seen')) setTourRun(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Global ⌘K / Ctrl+K command palette shortcut.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeTour = () => {
    setTourRun(false);
    try {
      localStorage.setItem('sentinel-tour-seen', '1');
    } catch {
      /* ignore */
    }
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-soc-bg">
      <aside className="z-20 flex w-64 flex-shrink-0 flex-col border-r border-soc-border bg-soc-panel">
        <div className="flex h-16 items-center border-b border-soc-border px-6">
          <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
            <i className="pi pi-shield text-sm text-white" />
          </span>
          <span className="text-lg font-bold tracking-wider text-white">
            SENTINEL<span className="text-blue-500"> LAB</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {navSections.map((group) => (
            <div key={group.section} className="mb-6">
              <div className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-soc-muted">
                {group.section}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`relative flex items-center px-6 py-2.5 text-sm transition-colors ${
                          active ? 'bg-blue-900/20 text-white' : 'text-soc-muted hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {active && <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-blue-500" />}
                        <i className={`pi ${item.icon} mr-3 ${active ? 'text-blue-400' : ''}`} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-soc-border p-4 text-center text-xs text-soc-muted">
          portfolio lab
        </div>
      </aside>

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 items-center justify-between gap-4 border-b border-soc-border bg-soc-panel/50 px-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="group flex w-72 items-center gap-3 rounded-lg border border-soc-border bg-soc-bg/60 px-3 py-2 text-sm text-soc-muted transition-colors hover:border-blue-500/40 hover:text-gray-300"
          >
            <i className="pi pi-search text-xs" />
            <span className="flex-1 text-left">Search or jump to...</span>
            <kbd className="rounded border border-soc-border px-1.5 py-0.5 text-[10px]">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTourRun(true)}
              className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm text-blue-300 transition-colors hover:bg-blue-400/20"
            >
              <i className="pi pi-compass" />
              <span className="hidden sm:inline">Take a tour</span>
            </button>
            <span className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-sm text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="hidden md:inline">Evidence Mode</span>
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-blue-500 to-purple-500 font-bold text-white shadow-lg">
              JA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-soc-bg p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <WelcomeTour run={tourRun} onClose={closeTour} />
    </div>
  );
}
