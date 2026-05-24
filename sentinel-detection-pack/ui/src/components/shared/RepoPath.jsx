import React from 'react';
import { projectFacts } from '../../data/projectFacts';

const repoBase = `${projectFacts.repoUrl}/blob/main/`;

export default function RepoPath({ path }) {
  return (
    <a
      href={`${repoBase}${path.replaceAll('\\', '/')}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex rounded border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-200 transition-colors hover:bg-blue-500/20"
    >
      {path}
    </a>
  );
}
