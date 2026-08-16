import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: 'left' | 'center';
}

/** Accessible dialog used for the mobile navigation drawer and the command palette. */
export function Dialog({ open, onOpenChange, title, children, side = 'center' }: DialogProps) {
  const positionClass =
    side === 'left'
      ? 'inset-y-0 left-0 h-full w-[85vw] max-w-xs animate-none data-[state=open]:animate-none'
      : 'left-1/2 top-24 w-[min(560px,92vw)] -translate-x-1/2 rounded-xl';

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content
          className={`fixed z-50 border border-border bg-surface p-0 shadow-lg focus:outline-none ${positionClass}`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <RadixDialog.Title className="text-sm font-semibold text-text-primary">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-subtle hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </RadixDialog.Close>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
