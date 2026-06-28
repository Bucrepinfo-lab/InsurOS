import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export interface SidebarNavProps {
  title?: string;
  items: SidebarNavItem[];
  footer?: ReactNode;
}

export function SidebarNav({ title = 'InsurOS', items, footer }: SidebarNavProps) {
  return (
    <div className='flex h-full flex-col'>
      <div className='border-b px-5 py-4'>
        <p className='text-lg font-semibold text-slate-950'>{title}</p>
        <p className='text-xs text-slate-500'>Control Plane</p>
      </div>

      <nav className='flex-1 space-y-1 p-3'>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
              item.isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
            )}
          >
            {item.icon ? <span className='text-base'>{item.icon}</span> : null}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {footer ? <div className='border-t p-4'>{footer}</div> : null}
    </div>
  );
}
