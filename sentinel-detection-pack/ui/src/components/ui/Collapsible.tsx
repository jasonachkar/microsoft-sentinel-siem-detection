import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <RadixCollapsible.Root open={open} onOpenChange={setOpen} className="border-b border-border last:border-b-0">
      <RadixCollapsible.Trigger className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-text-primary">
        {title}
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="pb-4 text-sm text-text-secondary">{children}</RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
}
