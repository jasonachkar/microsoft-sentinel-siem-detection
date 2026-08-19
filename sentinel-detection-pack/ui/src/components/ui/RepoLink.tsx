import { ExternalLink } from 'lucide-react';

const REPO_BASE = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection/blob/main/';

export function RepoLink({ path, label }: { path: string; label?: string }) {
  return (
    <a
      href={`${REPO_BASE}${path.replaceAll('\\', '/')}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-1.5 break-all rounded-md border border-border bg-surface-subtle px-2 py-1 font-mono text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
    >
      {label ?? path}
      <ExternalLink size={11} className="shrink-0" aria-hidden="true" />
    </a>
  );
}
