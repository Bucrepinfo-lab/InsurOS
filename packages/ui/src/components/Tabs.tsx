import type { ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { NavLinkComponent, NavLinkProps } from '../navigation/SidebarNav';
import { ActiveTabIntoView } from './ActiveTabIntoView';

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
  /** The app's router link, so switching tabs does not reload the page. */
  LinkComponent?: NavLinkComponent;
}

function PlainLink({ href, className, children, ...rest }: NavLinkProps) {
  return (
    <a href={href} className={className} {...rest}>
      {children}
    </a>
  );
}

/** Pure: the tabs that are drawn, and whether there is any choice to make. */
export function visibleTabs(items: TabItem[], activeId: string): { shown: TabItem[]; hasChoice: boolean } {
  const shown = items.filter((item) => item.id === activeId || Boolean(item.href));
  return { shown, hasChoice: shown.some((item) => item.id !== activeId) };
}

const TAB =
  'relative shrink-0 snap-start whitespace-nowrap rounded-t-md px-3 py-3 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-sealbright/60';

/**
 * Tabs are links. A tab that leads nowhere is left out, and when only the
 * current tab would remain the strip is not drawn at all: no dead controls.
 * On a phone the strip scrolls sideways (no visible scrollbar, a soft fade on
 * the right edge) and the current tab is brought into view.
 */
export function Tabs({ items, activeId, children, LinkComponent }: TabsProps) {
  const Link = LinkComponent ?? PlainLink;
  const { shown, hasChoice } = visibleTabs(items, activeId);

  return (
    <div>
      {hasChoice ? (
        <div className='border-b border-line'>
          <nav className='tab-strip -mb-px flex snap-x gap-1 overflow-x-auto' aria-label='Record sections'>
            {shown.map((item) =>
              item.id === activeId ? (
                <span key={item.id} aria-current='page' className={cn(TAB, 'text-ink')}>
                  {item.label}
                  <span aria-hidden='true' className='absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-seal' />
                </span>
              ) : (
                <Link
                  key={item.id}
                  href={item.href as string}
                  className={cn(TAB, 'group text-dim hover:bg-ink/[0.04] hover:text-ink')}
                >
                  {item.label}
                  <span
                    aria-hidden='true'
                    className='absolute inset-x-2 bottom-0 h-[2px] origin-left scale-x-0 rounded-full bg-seal/40 transition-transform duration-200 group-hover:scale-x-100'
                  />
                </Link>
              )
            )}
            <ActiveTabIntoView />
          </nav>
        </div>
      ) : null}

      {children ? <div className={hasChoice ? 'pt-6' : undefined}>{children}</div> : null}
    </div>
  );
}
