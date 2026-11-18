import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@insuros/ui';
import { estimateVehicleValue, expiryStatus, policiesOfCustomer, type ExpiryLevel } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';

export const metadata = { title: 'My cover', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const TONE: Record<ExpiryLevel, string> = {
  expired: 'bg-red-50 text-red-800',
  'due-soon': 'bg-warnink/10 text-warnink',
  'in-force': 'bg-sealsoft text-seal',
  unknown: 'bg-paper text-dim'
};
const kes = (value: number) => `KES ${Math.round(value).toLocaleString('en-GB')}`;

/**
 * The customer's own page: what they have insured, for how much, when cover
 * ends, and their claims. Reached by a private link, no account needed.
 */
export default async function MyCoverPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isCustomerToken(token)) notFound();
  const hash = hashCustomerToken(token);
  const db = getPersistence();
  const [customer] = await db.customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) notFound();
  const policies = policiesOfCustomer(await db.policies.findAll(), customer);
  const numbers = new Set(policies.map((policy) => policy.policyNumber));
  const claims = (await db.claims.findAll()).filter((claim) => numbers.has(claim.policyNumber));
  const now = new Date();
  const lines = policies
    .map((policy) => ({ policy, expiry: expiryStatus(policy.expiryDate, now), value: policy.registration || policy.yearOfManufacture ? estimateVehicleValue(policy, now) : null }))
    .sort((a, b) => (a.expiry.days ?? 99999) - (b.expiry.days ?? 99999));
  const due = lines.filter((line) => line.expiry.level === 'due-soon' || line.expiry.level === 'expired');
  const insuredTotal = policies.reduce((sum, policy) => sum + (policy.sumInsured ?? 0), 0);

  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div className='mx-auto grid max-w-3xl gap-6'>
        <header>
          <p className='text-sm text-dim'>My cover</p>
          <h1 className='mt-1 font-display text-[32px] leading-tight text-ink'>Hello, {customer.name.split(' ')[0]}</h1>
          <p className='mt-1 text-[15px] text-ink'>
            {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
            {insuredTotal > 0 ? `, ${kes(insuredTotal)} insured in all` : ''}. Add this page to your home screen to keep it at hand.
          </p>
        </header>

        {due.length > 0 ? (
          <section className='grid gap-2 rounded-2xl border border-warnink/40 bg-warnink/5 p-4'>
            <h2 className='font-display text-[19px] text-ink'>Reminders</h2>
            {due.map(({ policy, expiry }) => (
              <p key={policy.id} className='text-sm text-ink'>
                <strong>{policy.insuredItem ?? policy.product}</strong>: {expiry.words.toLowerCase()}.{' '}
                <Link href={`/contact?topic=policy&reference=${encodeURIComponent(policy.policyNumber)}`} className='font-medium text-seal underline underline-offset-2'>
                  Ask your agent to renew
                </Link>
              </p>
            ))}
          </section>
        ) : null}

        <section aria-labelledby='policies' className='grid gap-3'>
          <h2 id='policies' className='font-display text-[22px] text-ink'>What you have insured</h2>
          {lines.length === 0 ? (
            <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>No policies are on record yet. Your agent will add them here.</p>
          ) : (
            <ul className='grid gap-3 sm:grid-cols-2'>
              {lines.map(({ policy, expiry, value }) => (
                <li key={policy.id} className='grid gap-2 rounded-2xl border border-line bg-sheet p-5'>
                  <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[expiry.level]}`}>{expiry.words}</span>
                  <p className='font-display text-[20px] leading-snug text-ink'>{policy.insuredItem ?? policy.product}</p>
                  <dl className='grid gap-1 text-sm'>
                    <div className='flex justify-between gap-3'><dt className='text-dim'>Policy</dt><dd className='text-right text-ink'>{policy.product}, {policy.policyNumber}</dd></div>
                    {policy.registration ? <div className='flex justify-between gap-3'><dt className='text-dim'>Registration</dt><dd className='font-mono text-ink'>{policy.registration}</dd></div> : null}
                    {policy.sumInsured ? <div className='flex justify-between gap-3'><dt className='text-dim'>Value insured</dt><dd className='font-mono text-ink'>{kes(policy.sumInsured)}</dd></div> : null}
                    {value?.estimateToday ? (
                      <div className='flex justify-between gap-3'>
                        <dt className='text-dim'>Estimated value today</dt>
                        <dd className='font-mono text-ink'>
                          {kes(value.estimateToday)} <span className={value.change! < 0 ? 'text-warnink' : 'text-seal'}>({value.change! < 0 ? '' : '+'}{kes(value.change!)})</span>
                        </dd>
                      </div>
                    ) : null}
                    <div className='flex justify-between gap-3'><dt className='text-dim'>Premium</dt><dd className='font-mono text-ink'>{policy.premium}</dd></div>
                    {policy.startDate && policy.expiryDate ? (
                      <div className='flex justify-between gap-3'><dt className='text-dim'>Cover</dt><dd className='text-right text-ink'>{formatDate(policy.startDate)} to {formatDate(policy.expiryDate)}</dd></div>
                    ) : null}
                  </dl>
                  {value?.note ? <p className='text-xs text-dim'>{value.note}</p> : null}
                  <div className='flex flex-wrap gap-2 pt-1'>
                    <Link href={`/contact?topic=claim&reference=${encodeURIComponent(policy.policyNumber)}`} className='rounded-lg bg-seal px-3 py-2 text-sm font-semibold text-white hover:bg-sealdark'>Report a claim</Link>
                    <Link href={`/contact?topic=policy&reference=${encodeURIComponent(policy.policyNumber)}`} className='rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal'>Ask about this policy</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {claims.length > 0 ? (
          <section aria-labelledby='claims' className='grid gap-3'>
            <h2 id='claims' className='font-display text-[22px] text-ink'>Your claims</h2>
            <ul className='grid gap-2'>
              {claims.map((claim) => (
                <li key={claim.id} className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-sheet px-4 py-3 text-sm'>
                  <span className='text-ink'>{claim.claimNumber} on {claim.policyNumber}, {claim.amount}</span>
                  <span className='rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink'>{claim.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className='text-xs text-dim'>This page is private to you: anyone with the link can see it, so do not share it. Figures are as your agent recorded them; your policy schedule decides.</p>
      </div>
    </main>
  );
}
