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
    <div className='relative flex h-full flex-col'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-44'
        style={{
          backgroundImage:
            'radial-gradient(320px 180px at 30% -20%, rgba(23,163,126,0.28), transparent 70%)'
        }}
      />

      <div className='relative border-b border-white/10 px-6 py-6'>
        <div className='flex items-center gap-2.5'>
          <span className='seal-dot inline-block h-2.5 w-2.5 rounded-full bg-sealbright' />
          <p className='font-display text-[22px] tracking-tight text-white'>{title}</p>
        </div>
        <p className='mt-1 text-[10px] uppercase tracking-[0.24em] text-sealbright'>
          Control plane
        </p>
      </div>

      <nav className='relative flex-1 space-y-0.5 overflow-y-auto p-3'>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-[13px] font-medium transition-all duration-200',
              item.isActive
                ? 'border-sealbright bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'border-transparent text-white/55 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            {item.icon ? <span className='text-base'>{item.icon}</span> : null}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {footer ? <div className='relative border-t border-white/10 p-4'>{footer}</div> : null}
    </div>
  );
}
