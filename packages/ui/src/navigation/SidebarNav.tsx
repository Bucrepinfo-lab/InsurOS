"use client";

import { useState, type ComponentType, type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { LedgerSeal } from '../brand/LedgerSeal';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export interface SidebarNavGroup {
  id: string;
  title: string;
  items: SidebarNavItem[];
}

/** A link element: the app passes its router link so moving between sections does not reload the page. */
export interface NavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
  onClick?: () => void;
}

export type NavLinkComponent = ComponentType<NavLinkProps>;

export interface SidebarNavProps {
  title?: string;
  /** Flat list (kept for callers that have no groups). */
  items?: SidebarNavItem[];
  /** Grouped menu: each group collapses; the group holding the current page starts open. */
  groups?: SidebarNavGroup[];
  footer?: ReactNode;
  LinkComponent?: NavLinkComponent;
  onNavigate?: () => void;
}

function PlainLink({ href, className, children, onClick, ...rest }: NavLinkProps) {
  return (
    <a href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

export function SidebarNav({ title = 'InsurOS', items, groups, footer, LinkComponent, onNavigate }: SidebarNavProps) {
  const Link = LinkComponent ?? PlainLink;
  const allGroups: SidebarNavGroup[] = groups ?? [{ id: 'all', title: '', items: items ?? [] }];
  // A group is open when it holds the current page, or when the person opened it.
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const isOpen = (group: SidebarNavGroup, index: number) =>
    opened[group.id] ?? (group.title === '' || index === 0 || group.items.some((item) => item.isActive));

  const link = (item: SidebarNavItem) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      aria-current={item.isActive ? 'page' : undefined}
      className={cn(
        'nav-link group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-sealbright/70',
        item.isActive
          ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
      )}
    >
      {/* The seal bar marks the current page; on hover a faint one previews it. */}
      <span
        aria-hidden='true'
        className={cn(
          'absolute inset-y-1.5 left-0 w-[3px] origin-center rounded-full transition-transform duration-200',
          item.isActive ? 'scale-y-100 bg-sealbright' : 'scale-y-0 bg-white/30 group-hover:scale-y-75'
        )}
      />
      {item.icon ? (
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-200',
            item.isActive
              ? 'bg-sealbright/15 text-sealbright'
              : 'text-white/45 group-hover:scale-110 group-hover:text-sealbright'
          )}
        >
          {item.icon}
        </span>
      ) : null}
      <span className='truncate transition-transform duration-200 group-hover:translate-x-0.5'>{item.label}</span>
    </Link>
  );

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
          <LedgerSeal size={34} title='' />
          <p className='font-display text-[22px] tracking-tight text-white'>{title}</p>
          <span className='seal-dot ml-auto inline-block h-2 w-2 rounded-full bg-sealbright' aria-hidden='true' />
        </div>
        <p className='mt-1 text-[11px] text-sealbright'>Insurance operations</p>
      </div>

      <nav aria-label='Sections' className='relative flex-1 overflow-y-auto p-3'>
        {allGroups.map((group, index) =>
          group.title === '' ? (
            <div key={group.id} className='space-y-0.5'>
              {group.items.map(link)}
            </div>
          ) : (
            <div key={group.id} className='mb-1'>
              <button
                type='button'
                aria-expanded={isOpen(group, index)}
                onClick={() => setOpened((state) => ({ ...state, [group.id]: !isOpen(group, index) }))}
                className='flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-white/80 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-sealbright'
              >
                <span>{group.title}</span>
                <svg
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  aria-hidden='true'
                  className={cn('transition-transform duration-200', isOpen(group, index) ? 'rotate-90' : '')}
                >
                  <path d='M9 6l6 6-6 6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </button>
              {isOpen(group, index) ? <div className='mt-0.5 space-y-0.5 pb-1'>{group.items.map(link)}</div> : null}
            </div>
          )
        )}
      </nav>

      {footer ? <div className='relative border-t border-white/10 p-4'>{footer}</div> : null}
    </div>
  );
}
