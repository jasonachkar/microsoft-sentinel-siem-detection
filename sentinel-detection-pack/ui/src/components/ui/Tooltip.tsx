import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={250} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="bottom"
          sideOffset={6}
          className="z-50 max-w-xs rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary shadow-sm"
        >
          {label}
          <RadixTooltip.Arrow className="fill-surface-elevated" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
