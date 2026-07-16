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
      <div className='border-b border-white/10 px-6 py-5'>
        <p className='font-display text-xl tracking-tight text-paper'>{title}</p>
        <p className='mt-0.5 text-[11px] uppercase tracking-[0.18em] text-seal'>
          Control plane
        </p>
      </div>

      <nav className='flex-1 space-y-0.5 p-3'>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-[13px] font-medium transition',
              item.isActive
                ? 'border-seal bg-white/10 text-white'
                : 'border-transparent text-paper/60 hover:bg-white/5 hover:text-paper'
            )}
          >
            {item.icon ? <span className='text-base'>{item.icon}</span> : null}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {footer ? <div className='border-t border-white/10 p-4'>{footer}</div> : null}
    </div>
  );
}
