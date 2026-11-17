import type { NavLinkComponent } from '../navigation/SidebarNav';

export interface NotificationBellProps {
  count?: number;
  /** Where the bell goes. Without it nothing is rendered: no dead button. */
  href?: string;
  LinkComponent?: NavLinkComponent;
}

export function NotificationBell({ count = 0, href, LinkComponent }: NotificationBellProps) {
  if (!href) return null;
  const className =
    'relative inline-flex items-center gap-2 rounded-lg border border-line bg-sheet px-3 py-2 text-sm text-ink transition hover:border-seal/50 hover:text-seal focus-visible:outline-2 focus-visible:outline-seal';
  const body = (
    <>
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20a2 2 0 004 0' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
      <span className='hidden sm:inline'>Notifications</span>
      {count > 0 ? <span className='rounded-full bg-dangerink px-2 py-0.5 text-xs text-white'>{count}</span> : null}
    </>
  );
  return LinkComponent ? (
    <LinkComponent href={href} className={className}>
      {body}
    </LinkComponent>
  ) : (
    <a href={href} className={className}>
      {body}
    </a>
  );
}
