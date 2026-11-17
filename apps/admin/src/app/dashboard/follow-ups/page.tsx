import Link from 'next/link';
import { DomainModulePage, formatDateTime } from '@insuros/ui';
import {
  SECOND_ESCALATION_HOURS,
  SECTION_FLOWS,
  findStaffRole,
  flowFor,
  ladderLabel,
  ladderRank,
  type FlowArea,
  type QueueLine
} from '@insuros/domain';
import { FollowUpService } from '@insuros/services';
import { FollowUpConfirm } from '@/components/follow-up-confirm';
import { getAuthState } from '@/lib/auth/session';
import { followUpViewerFor } from '@/lib/follow-up-viewer';

export const metadata = { title: 'Follow-ups' };
export const dynamic = 'force-dynamic';

const roleName = (roleId: string) => findStaffRole(roleId)?.name ?? roleId;
const hoursLabel = (hours: number) => (hours % 24 === 0 ? `${hours / 24} ${hours === 24 ? 'day' : 'days'}` : `${hours} hours`);

function LevelBadge({ line }: { line: QueueLine }) {
  if (line.level === 0) return <span className='rounded-full bg-sealsoft px-2.5 py-0.5 text-xs font-semibold text-seal'>On time</span>;
  const [first, second] = flowFor(line.item.area).ladder;
  const to = (line.level === 1 ? first : second).map(roleName).join(' or ');
  return <span className='rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800'>Late: escalated to the {to}</span>;
}

function Lines({ title, hint, lines }: { title: string; hint: string; lines: QueueLine[] }) {
  if (lines.length === 0) return null;
  return (
    <section className='mb-8'>
      <h2 className='font-display text-[20px] text-ink'>
        {title} <span className='font-mono text-[14px] text-dim'>{lines.length}</span>
      </h2>
      <p className='mt-0.5 text-sm text-dim'>{hint}</p>
      <ul className='mt-3 grid gap-3'>
        {lines.map((line) => (
          <li key={line.item.id} className='rounded-2xl border border-line bg-sheet p-4 sm:p-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <LevelBadge line={line} />
              <span className='text-xs text-dim'>
                {flowFor(line.item.area).title}, step {line.stepNumber} of {line.stepTotal}
              </span>
            </div>
            <p className='mt-2 text-[16px] font-medium leading-snug text-ink'>{line.stepLabel}</p>
            <p className='mt-1 text-sm text-dim'>
              <Link href={flowFor(line.item.area).href} className='font-mono text-[13px] text-seal underline underline-offset-2'>
                {line.item.reference}
              </Link>{' '}
              {line.item.subject}. Owner: {line.item.ownerName}. {line.level === 0 ? 'Due' : 'Was due'} {formatDateTime(line.due)}.
            </p>
            <div className='mt-3'>
              <FollowUpConfirm id={line.item.id} label={line.confirm} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function FollowUpsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const asked = Array.isArray(params.area) ? params.area[0] : params.area;
  const area = SECTION_FLOWS.find((flow) => flow.area === asked)?.area as FlowArea | undefined;

  const state = await getAuthState();
  const viewer = state.status === 'active' ? followUpViewerFor(state.principal) : null;
  const all = viewer ? await new FollowUpService().queue(viewer) : [];
  const queue = area ? all.filter((line) => line.item.area === area) : all;
  const supervises = viewer ? SECTION_FLOWS.some((flow) => ladderRank(viewer, flow.area) > 0) : false;

  const pill = (active: boolean) =>
    active
      ? 'rounded-full bg-seal px-3.5 py-1.5 text-sm font-medium text-white'
      : 'rounded-full border border-line bg-sheet px-3.5 py-1.5 text-sm font-medium text-dim transition hover:border-seal/50 hover:text-seal';

  return (
    <DomainModulePage
      title='Follow-ups'
      description='What is owed next on each record, who owes it and by when. A step nobody answers in time goes to the supervisor, and then to the administrator.'
    >
      <nav aria-label='Area' className='mb-6 flex flex-wrap gap-2'>
        {area ? (
          <Link href='/dashboard/follow-ups' className={pill(false)}>
            All areas
          </Link>
        ) : (
          <span aria-current='page' className={pill(true)}>
            All areas
          </span>
        )}
        {SECTION_FLOWS.map((flow) =>
          flow.area === area ? (
            <span key={flow.area} aria-current='page' className={pill(true)}>
              {flow.title}
            </span>
          ) : (
            <Link key={flow.area} href={`/dashboard/follow-ups?area=${flow.area}`} className={pill(false)}>
              {flow.title}
            </Link>
          )
        )}
      </nav>

      {queue.length === 0 ? (
        <p className='mb-8 rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
          Nothing is waiting on you{area ? ' in this area' : ''}. A follow-up opens when you add a customer, record a
          pending policy, register a claim or save a document with a detail missing.
        </p>
      ) : null}

      <Lines
        title='Escalated to you'
        hint='The owner did not respond in time. Answer it yourself or get it answered.'
        lines={queue.filter((line) => line.standing === 'escalated-to-you')}
      />
      <Lines title='Yours' hint='Steps you owe, the one due soonest first.' lines={queue.filter((line) => line.standing === 'yours')} />
      {supervises ? (
        <Lines
          title='Your team’s'
          hint='Open steps in the areas you supervise. You can confirm one on the owner’s behalf.'
          lines={queue.filter((line) => line.standing === 'watching')}
        />
      ) : null}

      <section aria-labelledby='order'>
        <h2 id='order' className='font-display text-[20px] text-ink'>
          The order of events
        </h2>
        <p className='mt-0.5 text-sm text-dim'>
          Each step has a time to respond. When it runs out the step goes to the supervisor; {hoursLabel(SECOND_ESCALATION_HOURS)}{' '}
          later, to the administrator. Times are by the clock, weekends included.
        </p>
        <div className='mt-3 grid gap-3 lg:grid-cols-2'>
          {SECTION_FLOWS.filter((flow) => !area || flow.area === area).map((flow) => (
            <details key={flow.area} open={flow.area === area} className='rounded-2xl border border-line bg-sheet p-4 sm:p-5'>
              <summary className='cursor-pointer text-[15px] font-medium text-ink'>
                {flow.title}: {flow.steps.length} {flow.steps.length === 1 ? 'step' : 'steps'}
              </summary>
              <ol className='mt-3 list-decimal space-y-2 pl-5 text-sm text-ink'>
                {flow.steps.map((step) => (
                  <li key={step.id}>
                    {step.label} <span className='text-dim'>(within {hoursLabel(step.respondWithinHours)})</span>
                  </li>
                ))}
              </ol>
              <p className='mt-3 border-t border-line pt-3 text-sm text-dim'>
                If nobody responds: {ladderLabel(flow.area, roleName)}.
              </p>
            </details>
          ))}
        </div>
      </section>
    </DomainModulePage>
  );
}
