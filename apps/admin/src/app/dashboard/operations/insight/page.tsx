import Link from 'next/link';
import { Card, CardContent, DomainModulePage } from '@insuros/ui';
import { UsageInsightService, type UsageLine } from '@insuros/services';

export const metadata = { title: 'What people use' };
export const dynamic = 'force-dynamic';

const WINDOWS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' }
];

function RankCard({ title, hint, empty, lines }: { title: string; hint: string; empty: string; lines: UsageLine[] }) {
  const top = lines[0]?.count ?? 0;
  return (
    <Card>
      <CardContent>
        <h2 className='font-display text-[19px] text-ink'>{title}</h2>
        <p className='mt-0.5 text-sm text-dim'>{hint}</p>
        {lines.length === 0 ? (
          <p className='mt-4 rounded-lg bg-paper px-3 py-3 text-sm text-dim'>{empty}</p>
        ) : (
          <ol className='mt-4 space-y-2.5'>
            {lines.map((line) => (
              <li key={line.key} className='min-w-0'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='min-w-0 truncate text-ink'>{line.label}</span>
                  <span className='font-mono text-[13px] text-dim'>{line.count.toLocaleString('en-GB')}</span>
                </div>
                <div className='mt-1 h-1.5 overflow-hidden rounded-full bg-paper' aria-hidden='true'>
                  <div className='h-full rounded-full bg-seal' style={{ width: `${Math.max(4, Math.round((line.count / top) * 100))}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default async function InsightPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const asked = Number(Array.isArray(params.days) ? params.days[0] : params.days);
  const days = WINDOWS.some((period) => period.days === asked) ? asked : 7;
  const summary = await new UsageInsightService().summary(days);

  return (
    <DomainModulePage
      title='What people use'
      description='Which sections your team opens, what they look for, and which next steps they follow. Counts only: no person, record or number is stored.'
    >
      <nav aria-label='Period' className='mb-5 flex flex-wrap gap-2'>
        {WINDOWS.map((period) =>
          period.days === days ? (
            <span key={period.days} aria-current='page' className='rounded-full bg-seal px-3.5 py-1.5 text-sm font-medium text-white'>
              {period.label}
            </span>
          ) : (
            <Link
              key={period.days}
              href={`/dashboard/operations/insight?days=${period.days}`}
              className='rounded-full border border-line bg-sheet px-3.5 py-1.5 text-sm font-medium text-dim transition hover:border-seal/50 hover:text-seal'
            >
              {period.label}
            </Link>
          )
        )}
      </nav>

      {summary.total === 0 ? (
        <p className='mb-5 rounded-xl border border-line bg-sheet px-4 py-3 text-sm text-dim'>
          Nothing has been counted in this period yet. Counting started when this page was added; open a few sections and
          come back.
        </p>
      ) : null}

      <div className='grid gap-4 lg:grid-cols-2'>
        <RankCard
          title='Most opened sections'
          hint='Where your team spends its day.'
          empty='No section views yet.'
          lines={summary.sections}
        />
        <RankCard
          title='Next steps followed'
          hint='Which link people take from a section banner.'
          empty='No banner links followed yet.'
          lines={summary.nextSteps}
        />
        <RankCard
          title='Looked for'
          hint='What people type in the search box at the top.'
          empty='No searches yet.'
          lines={summary.searches}
        />
        <RankCard
          title='Looked for and not found'
          hint='Words that matched no section: a sign of what people expect to find here.'
          empty='Every search found a section.'
          lines={summary.notFound}
        />
        <RankCard
          title='Shared'
          hint='Which value stories people pass on.'
          empty='Nothing shared yet.'
          lines={summary.shares}
        />
      </div>
    </DomainModulePage>
  );
}
