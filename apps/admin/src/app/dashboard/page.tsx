import Link from 'next/link';
import { KPICard, WorkspaceHeader } from '@insuros/ui';
import { VALUE_STORIES, storyForPath, type ValueStory } from '@insuros/domain';
import { ClaimService, CustomerService, FollowUpService, MessagingService, PolicyService } from '@insuros/services';
import { ACCENT_SOLID, Motif } from '@/components/value/motif';
import { getAuthState } from '@/lib/auth/session';
import { followUpViewerFor } from '@/lib/follow-up-viewer';
import { reachFor } from '@/lib/record-scope';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Home' };

/** The areas a person may open, in the order the work flows. */
const FLOW: { href: string; permission: string }[] = [
  { href: '/dashboard/customers', permission: 'Customers:View' },
  { href: '/dashboard/policies', permission: 'Policies:View' },
  { href: '/dashboard/claims', permission: 'Claims:View' },
  { href: '/dashboard/claims/automation', permission: 'Claims:View' },
  { href: '/dashboard/operations/documents', permission: 'Operations:View' },
  { href: '/dashboard/marketplace/pricing-engine', permission: 'Marketplace:View' },
  { href: '/dashboard/sales/commissions', permission: 'Marketplace:View' },
  { href: '/dashboard/finance/tax', permission: 'Finance:View' },
  { href: '/dashboard/finance/analytics', permission: 'Finance:View' },
  { href: '/dashboard/audit', permission: 'Platform:View' }
];

export default async function DashboardHomePage() {
  await requirePageAccess("/dashboard");
  const state = await getAuthState();
  const principal = state.status === 'active' ? state.principal : null;
  const can = (permission: string) => principal?.permissions.includes(permission) ?? false;

  // Real figures from the person's own records (least privilege), never sample numbers.
  const [customers, policies, claims] = principal
    ? await Promise.all([
        can('Customers:View') ? new CustomerService().getCustomersFor(reachFor(principal, 'Customers')) : null,
        can('Policies:View') ? new PolicyService().getPoliciesFor(reachFor(principal, 'Policies')) : null,
        can('Claims:View') ? new ClaimService().getClaimsFor(reachFor(principal, 'Claims')) : null
      ])
    : [null, null, null];
  const owed = principal ? await new FollowUpService().counts(followUpViewerFor(principal)) : null;
  const inbox = principal ? await new MessagingService().counts(followUpViewerFor(principal)) : null;
  const openClaims = claims?.filter((claim) => claim.status === 'Open' || claim.status === 'In Review').length;
  const activePolicies = policies?.filter((policy) => policy.status === 'Active').length;

  const cards = FLOW.filter((step) => can(step.permission))
    .map((step) => ({ href: step.href, story: storyForPath(step.href) }))
    .filter((card): card is { href: string; story: ValueStory } => card.story !== null);
  const firstName = principal?.name?.split(' ')[0];

  return (
    <div>
      <WorkspaceHeader
        title={firstName ? `Welcome, ${firstName}` : 'Welcome'}
        description='Your records, and the path the work follows: customer, policy, claim, money, proof.'
      />

      {owed && owed.yours + owed.escalated > 0 ? (
        <Link
          href='/dashboard/follow-ups'
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition focus-visible:outline-2 focus-visible:outline-seal ${
            owed.escalated + owed.late > 0 ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-seal/30 bg-sealsoft hover:border-seal/60'
          }`}
        >
          <span className='min-w-0 text-[15px] text-ink'>
            <strong>
              {owed.yours} {owed.yours === 1 ? 'step is' : 'steps are'} waiting on you
            </strong>
            {owed.late > 0 ? `, ${owed.late} past its time` : ''}
            {owed.escalated > 0 ? `. ${owed.escalated} escalated to you by your team` : ''}.
          </span>
          <span className='text-sm font-semibold text-seal'>Open follow-ups</span>
        </Link>
      ) : null}

      {inbox && inbox.waiting + inbox.escalated > 0 ? (
        <Link
          href='/dashboard/messages?show=waiting'
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition focus-visible:outline-2 focus-visible:outline-seal ${
            inbox.escalated + inbox.late > 0 ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-seal/30 bg-sealsoft hover:border-seal/60'
          }`}
        >
          <span className='min-w-0 text-[15px] text-ink'>
            <strong>
              {inbox.waiting} {inbox.waiting === 1 ? 'conversation is' : 'conversations are'} waiting for your reply
            </strong>
            {inbox.late > 0 ? `, ${inbox.late} late` : ''}
            {inbox.escalated > 0 ? `. ${inbox.escalated} escalated to you` : ''}.
          </span>
          <span className='text-sm font-semibold text-seal'>Open messages</span>
        </Link>
      ) : null}

      {customers || policies || claims ? (
        <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {customers ? (
            <Link href='/dashboard/customers' className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-seal'>
              <KPICard title='Customers' value={String(customers.length)} change='Open the list' />
            </Link>
          ) : null}
          {policies ? (
            <Link href='/dashboard/policies?status=Active' className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-seal'>
              <KPICard title='Active policies' value={String(activePolicies)} change={`${policies.length} in total`} />
            </Link>
          ) : null}
          {claims ? (
            <Link href='/dashboard/claims' className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-seal'>
              <KPICard title='Claims open or in review' value={String(openClaims)} change='Each needs an owner' />
            </Link>
          ) : null}
          {claims ? (
            <Link href='/dashboard/claims' className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-seal'>
              <KPICard title='All claims' value={String(claims.length)} change='Search, filter, export' />
            </Link>
          ) : null}
        </div>
      ) : null}

      <h2 className='font-display text-[22px] text-ink'>Where to go next</h2>
      <p className='mt-1 max-w-2xl text-sm text-dim'>
        Each area answers one problem the industry lives with. Open any card; each page points to the next.
      </p>
      {cards.length === 0 ? (
        <p className='mt-4 rounded-xl border border-line bg-sheet p-4 text-sm text-dim'>
          Your role has no areas yet. Ask your administrator to give you access.
        </p>
      ) : (
        <ul className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {cards.map(({ href, story }) => (
            <li key={href} className='min-w-0'>
              <Link
                href={href}
                className='group flex h-full flex-col rounded-2xl border border-line bg-sheet p-5 shadow-[0_1px_2px_rgba(18,28,49,0.04),0_12px_32px_-20px_rgba(18,28,49,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(18,28,49,0.05),0_22px_44px_-18px_rgba(18,28,49,0.32)] focus-visible:outline-2 focus-visible:outline-seal'
              >
                <div className='flex items-center gap-3'>
                  <span
                    className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white'
                    style={{ backgroundColor: ACCENT_SOLID[story.accent] }}
                  >
                    <Motif motif={story.motif} size={26} />
                  </span>
                  <h3 className='font-display text-[18px] leading-tight text-ink'>{story.area}</h3>
                </div>
                <p className='mt-3 text-sm leading-relaxed text-dim'>{story.pain}</p>
                <p className='mt-3 text-sm font-semibold' style={{ color: ACCENT_SOLID[story.accent] }}>
                  See the answer
                  <span aria-hidden='true' className='ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1'>
                    ›
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className='mt-8 text-sm text-dim'>
        {VALUE_STORIES.length} areas in all.{' '}
        <Link href='/why' className='font-medium text-seal underline underline-offset-2'>
          Read the whole case on one page
        </Link>{' '}
        and share it with a colleague.
      </p>
    </div>
  );
}
