import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  /** Where the tab goes. A tab with nowhere to go is not shown. */
  href?: string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  children?: ReactNode;
}

/**
 * Tabs are links. A tab that leads nowhere is left out, and when only the
 * current tab would remain the strip is not drawn at all: no dead controls.
 */
export function Tabs({ items, activeId, children }: TabsProps) {
  const shown = items.filter((item) => item.id === activeId || Boolean(item.href));
  const hasChoice = shown.some((item) => item.id !== activeId);

  return (
    <div>
      {hasChoice ? (
        <div className='border-b'>
          <nav className='flex gap-4 overflow-x-auto' aria-label='Sections'>
            {shown.map((item) =>
              item.id === activeId ? (
                <span
                  key={item.id}
                  aria-current='page'
                  className='border-b-2 border-slate-950 px-1 py-3 text-sm font-medium text-slate-950'
                >
                  {item.label}
                </span>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'border-b-2 border-transparent px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-950'
                  )}
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
        </div>
      ) : null}

      {children ? <div className={hasChoice ? 'pt-6' : undefined}>{children}</div> : null}
    </div>
  );
}
