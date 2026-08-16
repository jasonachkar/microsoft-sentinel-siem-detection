import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adrs } from '../data/adrs';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Collapsible } from '../components/ui/Collapsible';
import { RepoLink } from '../components/ui/RepoLink';

export default function ArchitectureDecisions() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
      <Link to="/architecture" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary">
        <ArrowLeft size={14} /> Architecture
      </Link>
      <div className="mt-4">
        <SectionHeading
          eyebrow="Architecture decision records"
          title="All architecture decisions"
          level={1}
          description={`${adrs.length} decisions. Full records live in docs/adr/.`}
        />
      </div>
      <div className="mt-6 divide-y divide-border rounded-lg border border-border px-4">
        {adrs.map((adr) => (
          <Collapsible
            key={adr.id}
            title={
              <span>
                <span className="mr-2 font-mono text-xs text-text-tertiary">{adr.id}</span>
                {adr.title}
              </span>
            }
          >
            <div className="space-y-2.5">
              <p><span className="font-medium text-text-primary">Context: </span>{adr.context}</p>
              <p><span className="font-medium text-text-primary">Decision: </span>{adr.decision}</p>
              <p><span className="font-medium text-warning">Tradeoff: </span>{adr.tradeoff}</p>
              <p><span className="font-medium text-success">Security: </span>{adr.security}</p>
              <p><span className="font-medium text-text-primary">Operations: </span>{adr.operations}</p>
              <p className="italic text-text-tertiary">"{adr.talkingPoint}"</p>
              <RepoLink path={adr.file} />
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
