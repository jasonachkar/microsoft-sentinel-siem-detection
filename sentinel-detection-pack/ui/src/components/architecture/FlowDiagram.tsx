import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface FlowNode {
  label: string;
  sub?: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
}

/**
 * Restrained horizontal flow of labelled nodes connected by arrows. Wraps on
 * narrow viewports instead of requiring drag/zoom controls — used for the
 * homepage architecture preview (no ReactFlow there, per the design brief)
 * and reused on the Architecture page for the two top-level lifecycles.
 */
export function FlowDiagram({ nodes, label }: { nodes: FlowNode[]; label: string }) {
  return (
    <ol className="flex flex-wrap items-stretch gap-x-1 gap-y-3" aria-label={label}>
      {nodes.map((node, index) => {
        const Icon = node.icon;
        const content = (
          <div className="flex h-full min-w-[128px] flex-col items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-3 text-center transition-colors hover:border-border-strong">
            <Icon size={17} className="text-accent" aria-hidden="true" />
            <span className="text-xs font-medium leading-tight text-text-primary">{node.label}</span>
            {node.sub && <span className="text-[11px] leading-tight text-text-tertiary">{node.sub}</span>}
          </div>
        );
        return (
          <li key={node.label} className="flex items-center gap-1">
            {node.to ? (
              <Link to={node.to} className="h-full">
                {content}
              </Link>
            ) : node.href ? (
              <a href={node.href} target="_blank" rel="noreferrer" className="h-full">
                {content}
              </a>
            ) : (
              content
            )}
            {index < nodes.length - 1 && (
              <ArrowRight size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
