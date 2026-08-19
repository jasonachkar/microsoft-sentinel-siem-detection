import { useState } from 'react';
import Editor, { loader, type BeforeMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { kustoLanguageDefinition } from '@kusto/monaco-kusto/release/esm/syntaxHighlighting/kustoMonarchLanguageDefinition';
import { themes as kustoThemes } from '@kusto/monaco-kusto/release/esm/syntaxHighlighting/themes';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

// Use the app's own monaco-editor package instance instead of fetching one
// from a CDN, so the Kusto language contribution below registers against the
// same instance the <Editor> renders with.
loader.config({ monaco });

let kustoRegistered = false;
function registerKustoLanguageOnce() {
  if (kustoRegistered) return;
  kustoRegistered = true;
  monaco.languages.register({ id: 'kusto' });
  monaco.languages.setMonarchTokensProvider('kusto', kustoLanguageDefinition as monaco.languages.IMonarchLanguage);
  monaco.languages.setLanguageConfiguration('kusto', {
    comments: { lineComment: '//' },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
  });
  for (const theme of kustoThemes) {
    monaco.editor.defineTheme(theme.name, theme.data as monaco.editor.IStandaloneThemeData);
  }
}

const handleBeforeMount: BeforeMount = () => {
  registerKustoLanguageOnce();
};

export function KqlViewer({ query, githubPath, height = 320 }: { query: string; githubPath: string; height?: number }) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-subtle px-3 py-2">
        <span className="text-xs font-medium text-text-tertiary">KQL — read-only source, not a live query runner</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a
            href={`https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/${githubPath}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface"
          >
            <ExternalLink size={12} />
            View source
          </a>
        </div>
      </div>
      <Editor
        height={height}
        language="kusto"
        theme={resolvedTheme === 'dark' ? 'kusto-dark' : 'kusto-light'}
        value={query}
        beforeMount={handleBeforeMount}
        options={{
          readOnly: true,
          domReadOnly: true,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          scrollbar: { alwaysConsumeMouseWheel: false },
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
