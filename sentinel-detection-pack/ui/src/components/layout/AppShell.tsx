import { useEffect, useState, type ReactNode } from 'react';
import { TooltipProvider } from '../ui/Tooltip';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background text-text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-contrast"
        >
          Skip to content
        </a>
        <TopNav onOpenPalette={() => setPaletteOpen(true)} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </TooltipProvider>
  );
}
