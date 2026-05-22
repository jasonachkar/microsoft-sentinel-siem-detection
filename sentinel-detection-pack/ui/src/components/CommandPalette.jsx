import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { allCommands } from '../config/navigation';

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        (c.keywords || '').toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const c = results[active];
        if (c) {
          navigate(c.path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, navigate, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-dark-700 bg-dark-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-dark-700 px-4">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a view…  (type to filter)"
                className="w-full bg-transparent py-4 text-sm text-gray-100 outline-none placeholder:text-gray-600"
              />
              <kbd className="rounded border border-dark-600 px-1.5 py-0.5 text-[10px] text-gray-500">ESC</kbd>
            </div>

            <ul className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-gray-500">No matching views</li>
              )}
              {results.map((c, idx) => (
                <li key={c.path}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => {
                      navigate(c.path);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      idx === active ? 'bg-blue-900/30 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <i className={`pi ${c.icon} text-blue-300`} />
                      {c.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">{c.section}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-t border-dark-700 px-4 py-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> open
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
