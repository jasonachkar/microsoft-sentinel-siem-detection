import { useMemo, useState } from 'react';
import infraSource from '../../data/infra-source.json';

interface InfraFile {
  id: string;
  label: string;
  group: string;
  language: string;
  deploys: string;
  lines: number;
  content: string;
}

const COMMENT_TOKENS: Record<string, string[]> = {
  hcl: ['#', '//'],
  yaml: ['#'],
  python: ['#'],
  go: ['//'],
  sh: ['#'],
};

function tokenizeLine(line: string, language: string) {
  const starters = COMMENT_TOKENS[language] || ['#'];
  const tokens: { type: 'code' | 'string' | 'comment'; text: string }[] = [];
  let buf = '';
  let state: 'code' | 'string' = 'code';
  let quote = '';
  let i = 0;

  const flush = (type: 'code' | 'string') => {
    if (buf) tokens.push({ type, text: buf });
    buf = '';
  };

  while (i < line.length) {
    const ch = line[i];
    if (state === 'code') {
      const starter = starters.find((s) => line.startsWith(s, i));
      if (starter) {
        flush('code');
        tokens.push({ type: 'comment', text: line.slice(i) });
        buf = '';
        i = line.length;
        break;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        flush('code');
        state = 'string';
        quote = ch;
        buf = ch;
        i += 1;
        continue;
      }
      buf += ch;
      i += 1;
    } else {
      buf += ch;
      if (ch === quote && line[i - 1] !== '\\') {
        flush('string');
        state = 'code';
      }
      i += 1;
    }
  }
  flush(state);
  return tokens;
}

const tokenClass = {
  code: 'text-text-primary',
  string: 'text-success',
  comment: 'italic text-text-tertiary',
};

function CodeViewer({ file }: { file: InfraFile }) {
  const lines = useMemo(() => file.content.split(/\r?\n/), [file.content]);
  return (
    <div className="h-[420px] overflow-auto rounded-lg border border-border bg-surface-subtle font-mono text-[13px] leading-relaxed">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx}>
              <td className="select-none border-r border-border px-3 text-right align-top text-text-tertiary">{idx + 1}</td>
              <td className="whitespace-pre px-4 align-top">
                {tokenizeLine(line, file.language).map((tok, ti) => (
                  <span key={ti} className={tokenClass[tok.type]}>
                    {tok.text}
                  </span>
                ))}
                {line.length === 0 ? ' ' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SourceExplorer() {
  const files = (infraSource.files || []) as InfraFile[];
  const [activeId, setActiveId] = useState(files[0]?.id);

  const groups = useMemo(() => {
    const map = new Map<string, InfraFile[]>();
    for (const f of files) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group)!.push(f);
    }
    return [...map.entries()];
  }, [files]);

  const active = files.find((f) => f.id === activeId) || files[0];
  if (!active) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        {groups.map(([group, groupFiles]) => (
          <div key={group} className="rounded-lg border border-border">
            <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              {group}
            </div>
            <ul>
              {groupFiles.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(f.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                      f.id === activeId ? 'bg-accent-subtle text-accent' : 'text-text-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    <span className="truncate font-mono text-xs">{f.label}</span>
                    <span className="text-[10px] text-text-tertiary">{f.lines}L</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
          <span className="truncate font-mono text-xs text-text-secondary">{active.id}</span>
          <span className="text-xs text-text-tertiary">{active.deploys}</span>
        </div>
        <CodeViewer file={active} />
      </div>
    </div>
  );
}
