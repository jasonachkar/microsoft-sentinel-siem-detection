import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, CornerDownLeft, Search } from 'lucide-react';
import { allCommands } from '../../config/navigation';
import { Dialog } from '../ui/Dialog';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[active];
        if (item) {
          navigate(item.path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, navigate, onClose]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} title="Jump to a view">
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search size={15} className="text-text-tertiary" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages…"
          className="w-full bg-transparent py-3.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>
      <ul className="max-h-80 overflow-y-auto py-2">
        {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-text-tertiary">No matching pages</li>}
        {results.map((item, idx) => (
          <li key={item.path}>
            <button
              type="button"
              onMouseEnter={() => setActive(idx)}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                idx === active ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-subtle'
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={15} aria-hidden="true" />
                {item.label}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
                {item.path.startsWith('/lab') ? 'Lab' : 'Primary'}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1">
          <ArrowUp size={11} />
          <ArrowDown size={11} /> navigate
        </span>
        <span className="flex items-center gap-1">
          <CornerDownLeft size={11} /> open
        </span>
      </div>
    </Dialog>
  );
}
