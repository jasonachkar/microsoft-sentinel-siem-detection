import React, { useMemo, useState } from 'react';
import { Tag } from 'primereact/tag';
import infraSource from '../data/infra-source.json';

// --- Lightweight, dependency-free syntax highlighting ----------------------
// A per-line tokenizer (code / string / comment) that escapes content before
// rendering. Safe for read-only display of the repo's own committed source.
const COMMENT_TOKENS = {
  hcl: ['#', '//'],
  yaml: ['#'],
  python: ['#'],
  go: ['//'],
  sh: ['#'],
};

function tokenizeLine(line, language) {
  const starters = COMMENT_TOKENS[language] || ['#'];
  const tokens = [];
  let buf = '';
  let state = 'code';
  let quote = '';
  let i = 0;

  const flush = (type) => {
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
  flush(state === 'string' ? 'string' : 'code');
  return tokens;
}

const tokenClass = {
  code: 'text-gray-200',
  string: 'text-emerald-300',
  comment: 'text-gray-500 italic',
};

function CodeViewer({ file }) {
  const lines = useMemo(() => file.content.split(/\r?\n/), [file.content]);

  return (
    <div className="h-[calc(100vh-18rem)] min-h-[420px] overflow-auto rounded-lg border border-dark-700 bg-black/60 font-mono text-[13px] leading-relaxed">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              <td className="select-none border-r border-dark-700 px-3 text-right align-top text-gray-600">
                {idx + 1}
              </td>
              <td className="whitespace-pre px-4 align-top">
                {tokenizeLine(line, file.language).map((tok, ti) => (
                  <span key={ti} className={tokenClass[tok.type]}>
                    {tok.text}
                  </span>
                ))}
                {line.length === 0 ? ' ' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const langTag = {
  hcl: { label: 'Terraform', severity: 'info' },
  yaml: { label: 'GitHub Actions', severity: 'warning' },
  go: { label: 'Go', severity: 'info' },
  python: { label: 'Python', severity: 'success' },
};

export default function IaCExplorer() {
  const files = infraSource.files || [];
  const [activeId, setActiveId] = useState(files[0]?.id);

  const groups = useMemo(() => {
    const map = new Map();
    for (const f of files) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    }
    return [...map.entries()];
  }, [files]);

  const active = files.find((f) => f.id === activeId) || files[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
            <i className="pi pi-server text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-sky-200">Infrastructure as Code</h1>
            <p className="text-gray-400">
              The actual Terraform, pipelines, and Go tooling that back this platform &mdash; rendered live from the repo.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-gray-500">
          <span>{infraSource.modules} modules</span>
          <span>{infraSource.totalFiles} source files</span>
          <span>{infraSource.totalLines?.toLocaleString()} lines</span>
          <span>synced: {new Date(infraSource.generatedAt).toLocaleString()}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          {groups.map(([group, groupFiles]) => (
            <div key={group} className="rounded-lg border border-dark-700 bg-dark-900">
              <div className="border-b border-dark-700 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group}
              </div>
              <ul>
                {groupFiles.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(f.id)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        f.id === activeId ? 'bg-sky-900/30 text-sky-200' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate font-mono">
                        <i className="pi pi-file text-xs" />
                        {f.label}
                      </span>
                      <span className="text-[10px] text-gray-600">{f.lines}L</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="min-w-0 space-y-3">
          {active && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dark-700 bg-dark-900 px-4 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm text-gray-200">{active.id}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{active.deploys}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag value={langTag[active.language]?.label || active.language} severity={langTag[active.language]?.severity || 'info'} />
                  <Tag value={`${active.lines} lines`} severity="secondary" />
                </div>
              </div>
              <CodeViewer file={active} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
