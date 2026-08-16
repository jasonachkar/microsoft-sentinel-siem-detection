import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

export interface TabDef {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs, defaultValue }: { tabs: TabDef[]; defaultValue?: string }) {
  return (
    <RadixTabs.Root defaultValue={defaultValue ?? tabs[0]?.value} className="w-full">
      <RadixTabs.List className="flex flex-wrap gap-1 border-b border-border" aria-label="Sections">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className="rounded-t-md px-3 py-2 text-sm font-medium text-text-secondary outline-none data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent hover:text-text-primary"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((tab) => (
        <RadixTabs.Content key={tab.value} value={tab.value} className="pt-6 focus:outline-none">
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
