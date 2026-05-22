import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    {
      section: 'Executive View',
      items: [
        { path: '/', icon: 'pi-globe', label: 'Command Center' },
        { path: '/finops', icon: 'pi-dollar', label: 'Security FinOps' },
        { path: '/posture', icon: 'pi-cloud', label: 'IaC Posture' },
      ],
    },
    {
      section: 'Active Defense',
      items: [
        { path: '/incidents', icon: 'pi-shield', label: 'Live Incidents' },
        { path: '/kubernetes', icon: 'pi-box', label: 'K8s Telemetry' },
        { path: '/copilot', icon: 'pi-bolt', label: 'AI Copilot' },
        { path: '/soar', icon: 'pi-sitemap', label: 'SOAR Playbooks' },
      ],
    },
    {
      section: 'Engineering',
      items: [
        { path: '/rules', icon: 'pi-list', label: 'Detection Rules' },
        { path: '/simulator', icon: 'pi-exclamation-triangle', label: 'Attack Simulator' },
        { path: '/threat-map', icon: 'pi-map', label: 'Threat Map' },
      ],
    },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-soc-bg overflow-hidden">
      <aside className="w-64 bg-soc-panel border-r border-soc-border flex-shrink-0 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-soc-border">
          <i className="pi pi-shield text-blue-500 text-2xl mr-3"></i>
          <span className="text-xl font-bold tracking-wider text-white">
            SENTINEL<span className="text-blue-500">OS</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((group) => (
            <div key={group.section} className="mb-6">
              <div className="px-6 mb-2 text-xs font-semibold text-soc-muted uppercase tracking-wider">
                {group.section}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isActivePath(item.path);

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-6 py-2.5 text-sm transition-colors relative ${
                          isActive
                            ? 'text-white bg-blue-900/20'
                            : 'text-soc-muted hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
                        )}
                        <i className={`pi ${item.icon} mr-3 ${isActive ? 'text-blue-400' : ''}`}></i>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-soc-border text-xs text-soc-muted text-center">
          v2.4.0-enterprise
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-soc-panel/50 backdrop-blur-md border-b border-soc-border flex items-center justify-between px-6 z-10">
          <div className="text-sm text-soc-muted">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Live Telemetry Active
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 flex items-center justify-center text-white font-bold shadow-lg">
              JA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-soc-bg p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
