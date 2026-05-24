import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import StatusTag from './StatusTag';
import RepoPath from './RepoPath';

export default function ProofCard({ title, summary, status, skill, repoPaths = [], talkingPoint, children }) {
  return (
    <Card className="border border-dark-700 bg-dark-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {summary && <p className="mt-2 text-sm leading-relaxed text-gray-400">{summary}</p>}
        </div>
        {status && <StatusTag status={status} />}
      </div>
      {(skill || repoPaths.length > 0 || talkingPoint || children) && <Divider />}
      <div className="space-y-3">
        {skill && (
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Skill demonstrated</div>
            <div className="text-sm text-gray-200">{skill}</div>
          </div>
        )}
        {repoPaths.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Repo files</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {repoPaths.map((path) => <RepoPath key={path} path={path} />)}
            </div>
          </div>
        )}
        {talkingPoint && (
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">What a reviewer should notice</div>
            <div className="text-sm text-gray-200">{talkingPoint}</div>
          </div>
        )}
        {children}
      </div>
    </Card>
  );
}
