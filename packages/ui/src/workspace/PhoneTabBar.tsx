"use client";

import { cn } from '../utils/cn';
import { NavIcon } from '../navigation/nav-icons';
import type { NavLinkComponent, NavLinkProps } from '../navigation/SidebarNav';

export interface PhoneTab {
  id: string;
  label: string;
  href: string;
}

/** The busiest sections, in order (owner 24/11/26). Short names fit a phone. */
export const PHONE_TAB_ORDER: { id: string; label: string }[] = [
  { id: 'dashboard', label: 'Home' },
  { id: 'claims', label: 'Claims' },
  { id: 'policies', label: 'Policies' },
  { id: 'follow-ups', label: 'Follow-ups' }
];

/** Used only when a role cannot see one of the four (so the bar never shows a locked tab). */
const FALLBACK_ORDER: { id: string; label: string }[] = [
  { id: 'messages', label: 'Messages' },
  { id: 'customers', label: 'Customers' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'approvals', label: 'Approvals' }
];

/**
 * Pure: the four tabs for this person, from the menu items their role can
 * see. The usual four come first; a section the role cannot see is replaced
 * by the next one it can, so every tab opens a page the person may use.
 */
export function phoneTabs(visible: { id: string; href: string }[], limit = 4): PhoneTab[] {
  const byId = new Map(visible.map((item) => [item.id, item.href]));
  const tabs: PhoneTab[] = [];
  for (const choice of [...PHONE_TAB_ORDER, ...FALLBACK_ORDER]) {
    const href = byId.get(choice.id);
    if (href && tabs.length < limit && !tabs.some((tab) => tab.href === href)) tabs.push({ ...choice, href });
  }
  return tabs;
}

function PlainLink({ href, className, children, ...rest }: NavLinkProps) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

export interface PhoneTabBarProps {
  tabs: PhoneTab[];
  /** The menu href of the page on screen (longest match), so a claim's page lights Claims. */
  currentHref: string | null;
  onOpenMenu: () => void;
  LinkComponent?: NavLinkComponent;
}

const TAB =
  'group relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sealbright/70';

/** Phones only: the four busiest sections and the full menu, one thumb away. */
export function PhoneTabBar({ tabs, currentHref, onOpenMenu, LinkComponent }: PhoneTabBarProps) {
  const Link = LinkComponent ?? PlainLink;
  return (
    <nav
      aria-label='Quick sections'
      className='fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-line bg-sheet/90 px-2 pt-1.5 backdrop-blur-md lg:hidden'
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {tabs.map((tab) => {
        const current = tab.href === currentHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? 'page' : undefined}
            className={cn(TAB, current ? 'text-seal' : 'text-dim hover:text-ink')}
          >
            <span
              className={cn(
                'flex h-8 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-200 group-active:scale-90',
                current ? 'bg-sealsoft' : 'group-hover:bg-ink/5'
              )}
            >
              <NavIcon id={tab.id} size={20} />
            </span>
            <span className={current ? 'font-semibold' : undefined}>{tab.label}</span>
          </Link>
        );
      })}
      <button type='button' onClick={onOpenMenu} className={cn(TAB, 'text-dim hover:text-ink')}>
        <span className='flex h-8 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-200 group-hover:bg-ink/5 group-active:scale-90'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
            <path d='M4 7h16M4 12h16M4 17h16' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
          </svg>
        </span>
        <span>Menu</span>
      </button>
    </nav>
  );
}
