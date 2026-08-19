import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';

interface Item {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
}

export function DropdownMenu({ trigger, items }: { trigger: ReactNode; items: Item[] }) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-lg border border-border bg-surface-elevated p-1 shadow-lg"
        >
          {items.map((item) => (
            <RadixDropdown.Item
              key={item.label}
              onSelect={item.onSelect}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-text-primary outline-none data-[highlighted]:bg-surface-subtle"
            >
              {item.icon}
              {item.label}
            </RadixDropdown.Item>
          ))}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}
