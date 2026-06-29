import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  children?: ReactNode;
}

export function Tabs({ items, activeId, children }: TabsProps) {
  return (
    <div>
      <div className='border-b'>
        <nav className='flex gap-4'>
          {items.map((item) => (
            <button
              key={item.id}
              type='button'
              className={cn(
                'border-b-2 px-1 py-3 text-sm font-medium',
                item.id === activeId
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-500 hover:text-slate-950'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {children ? <div className='pt-6'>{children}</div> : null}
    </div>
  );
}