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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('sentinel-tour-seen')) setTourRun(true);
    } catch {
      /* ignore */
    }
  }, []);

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
    if (path === '/') return location.pathname === '/' || location.pathname === '/reviewer';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-soc-bg">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-soc-border bg-soc-panel transition-transform duration-200 lg:static lg:z-20 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-soc-border px-6">
          <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
            <i className="pi pi-shield text-sm text-white" />
          </span>
          <span className="text-lg font-bold tracking-wider text-white">
            SENTINEL<span className="text-blue-500"> LAB</span>
          </span>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-soc-muted transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <i className="pi pi-times" />
          </button>
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
                        <i className={`pi ${item.icon} mr-3 ${active ? 'text-blue-400' : ''}`} aria-hidden="true" />
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

      <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-soc-border bg-soc-panel/50 px-3 backdrop-blur-md sm:gap-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-soc-border text-soc-muted transition-colors hover:text-white lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <i className="pi pi-bars" />
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-soc-border bg-soc-bg/60 px-3 py-2 text-sm text-soc-muted transition-colors hover:border-blue-500/40 hover:text-gray-300 sm:max-w-sm lg:max-w-md xl:max-w-xs xl:flex-none xl:w-72"
            >
              <i className="pi pi-search shrink-0 text-xs" />
              <span className="truncate text-left">Search or jump to...</span>
              <kbd className="hidden shrink-0 rounded border border-soc-border px-1.5 py-0.5 text-[10px] md:inline">
                {isMac ? 'Cmd' : 'Ctrl'} K
              </kbd>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTourRun(true)}
              className="flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-sm text-blue-300 transition-colors hover:bg-blue-400/20 sm:px-3"
            >
              <i className="pi pi-compass" />
              <span className="hidden sm:inline">Take a tour</span>
            </button>
            <span className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-sm text-green-400 sm:px-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="hidden md:inline">Evidence Mode</span>
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-blue-500 to-purple-500 text-sm font-bold text-white shadow-lg">
              JA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-soc-bg p-4 sm:p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <WelcomeTour run={tourRun} onClose={closeTour} />
    </div>
  );
}
