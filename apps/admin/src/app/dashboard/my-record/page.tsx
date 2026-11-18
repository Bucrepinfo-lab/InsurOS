import { formatDate } from '@insuros/ui';
import { CareerService } from '@insuros/services';
import { getAuthState } from '@/lib/auth/session';
import { followUpViewerFor } from '@/lib/follow-up-viewer';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = { title: 'My career record' };
export const dynamic = 'force-dynamic';

const kes = (value: number) => `KES ${Math.round(value).toLocaleString('en-GB')}`;
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : 'none yet');

/**
 * The signed-in person's own record: where they worked, in which role, and
 * what they handled. Built from their work here, so it can be trusted; they
 * download it to take to their next job.
 */
export default async function MyRecordPage() {
  const state = await getAuthState();
  if (state.status !== 'active') return null;
  const record = await new CareerService().recordFor({ name: state.principal.name, userIds: followUpViewerFor(state.principal).userIds });
  const f = record.figures;
  const tiles: [string, string, string][] = [
    ['Customers brought in', String(f.customers), 'Customers you added'],
    ['Policies placed', String(f.policies), f.premium > 0 ? `${kes(f.premium)} in premium` : 'No premium yet'],
    ['Claims', String(f.claimsRegistered + f.claimsHandled), `${f.claimsRegistered} registered, ${f.claimsHandled} handled`],
    ['Steps on time', pct(f.stepsOnTime, f.stepsConfirmed), `${f.stepsConfirmed} workflow steps completed`],
    ['Customers answered within 4 hours', pct(f.customerRepliesWithin4h, f.customerReplies), `${f.customerReplies} replies to customers`]
  ];

  return (
    <div className='grid max-w-4xl gap-7'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='text-sm text-dim'>My career record</p>
          <h1 className='mt-1 text-[30px] leading-tight text-ink'>{record.name}</h1>
          <p className='mt-1 text-[15px] text-ink'>
            {record.company}
            {record.since ? `, since ${formatDate(record.since)}` : ''}
          </p>
        </div>
        <a href='/api/my-record' className='rounded-lg bg-seal px-4 py-2.5 text-sm font-semibold text-white hover:bg-sealdark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'>
          Download my record (PDF)
        </a>
      </header>

      <p className='max-w-2xl text-sm text-dim'>
        Built automatically from your work here; nobody types it in, so an employer can trust it. Each PDF carries a fingerprint the
        agency can confirm. Only you can see or download yours.
      </p>

      <section aria-labelledby='figures' className='grid gap-3'>
        <h2 id='figures' className='text-[20px] text-ink'>What you have handled</h2>
        <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {tiles.map(([label, value, note]) => (
            <li key={label} className='rounded-2xl border border-line bg-sheet p-4'>
              <p className='text-sm text-dim'>{label}</p>
              <p className='mt-1 font-display text-[28px] leading-none text-ink'>{value}</p>
              <p className='mt-1.5 text-xs text-dim'>{note}</p>
            </li>
          ))}
        </ul>
      </section>

      {record.highlights.length ? (
        <section aria-labelledby='highlights' className='grid gap-2 rounded-2xl border border-seal/30 bg-sealsoft p-5'>
          <h2 id='highlights' className='text-[20px] text-ink'>Highlights</h2>
          <ul className='grid list-disc gap-1 pl-5 text-[15px] text-ink'>
            {record.highlights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby='timeline' className='grid gap-3'>
        <h2 id='timeline' className='text-[20px] text-ink'>Roles held</h2>
        {record.roles.length === 0 ? (
          <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>No role appointments are on record yet. Your supervisor appoints you to a role and area.</p>
        ) : (
          <ol className='grid gap-0 border-l-2 border-line pl-5'>
            {record.roles.map((role) => (
              <li key={`${role.role}-${role.region}-${role.from}`} className='relative pb-5 last:pb-0'>
                <span aria-hidden className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ${role.status === 'Active' ? 'bg-seal' : 'bg-faint'}`} />
                <p className='text-[16px] font-medium text-ink'>
                  {role.role}, {role.region}
                </p>
                <p className='text-sm text-dim'>
                  {role.level} level, from {formatDate(role.from)} · {role.status === 'Active' ? 'Current' : role.status}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby='display' className='grid gap-2'>
        <h2 id='display' className='text-[20px] text-ink'>Display</h2>
        <p className='text-sm text-dim'>Light, dark, or follow your phone. Remembered on this device.</p>
        <ThemeToggle className='justify-self-start' />
      </section>
    </div>
  );
}
