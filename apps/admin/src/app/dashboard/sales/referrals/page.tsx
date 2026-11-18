import Link from 'next/link';
import { DomainModulePage } from '@insuros/ui';
import { COUNTRY_PROFILES, canSell, referralCodeFor, tokensFor, usageDay, type ReferralRecord } from '@insuros/domain';
import { CustomerService } from '@insuros/services';
import { CountryPills, CountryStatus, money, pickCountry } from '@/components/country-pills';
import { getAuthState } from '@/lib/auth/session';
import { actorIdFor, reachFor } from '@/lib/record-scope';

export const metadata = { title: 'Referrals' };
export const dynamic = 'force-dynamic';

/**
 * Who referred whom, and the tokens earned this month. Every person has a
 * code; the code entered when a customer is added records who referred them.
 * Tokens are a fixed amount per verified sign-up, never tied to a sale, and
 * only for referrers who are not licensed (licensed agents earn commission).
 * Figures only: finance pays.
 */
export default async function ReferralsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const profile = pickCountry(params.country, COUNTRY_PROFILES);
  const state = await getAuthState();
  const principal = state.status === 'active' ? state.principal : null;
  const myCode = principal ? referralCodeFor(profile.countryCode, `staff:${actorIdFor(principal)}`) : null;
  const customers = principal ? await new CustomerService().getCustomersFor(reachFor(principal, 'Customers')) : [];
  const month = usageDay(new Date()).slice(0, 7);
  const sell = canSell(profile);

  // Each customer's own code, so they can refer others.
  const codeOf = new Map(customers.map((customer) => [referralCodeFor(profile.countryCode, `customer:${customer.id}`), customer]));
  const records: ReferralRecord[] = customers
    .filter((customer) => customer.referredBy)
    .map((customer) => ({ personId: customer.id, referredBy: customer.referredBy!, verifiedAt: customer.verifiedAt }));

  const referrers = [...new Set(records.map((record) => record.referredBy))].map((code) => {
    const owner = codeOf.get(code);
    const ownerId = owner?.id ?? '';
    const statement = tokensFor(profile, code, ownerId, records, month);
    const signUps = records.filter((record) => record.referredBy === code).length;
    return {
      code,
      who: owner ? owner.name : code === myCode ? 'You' : 'A member of staff or another office',
      isCustomer: Boolean(owner),
      signUps,
      statement
    };
  });
  referrers.sort((a, b) => b.statement.verified - a.statement.verified || b.signUps - a.signUps);

  return (
    <DomainModulePage
      title='Referrals'
      description='Who referred whom. A customer who refers others earns a small fixed token for each one whose details are confirmed, whether or not they buy. Licensed agents earn commission instead.'
    >
      <CountryPills profiles={COUNTRY_PROFILES} current={profile.countryCode} basePath='/dashboard/sales/referrals' />
      <CountryStatus profile={profile} sellReason={sell.ok ? null : sell.reason} />

      <div className='mb-8 grid gap-3 sm:grid-cols-2'>
        <div className='rounded-2xl border border-line bg-sheet p-5'>
          <p className='text-sm text-dim'>Your referral code</p>
          <p className='mt-1 font-mono text-[26px] tracking-wide text-ink'>{myCode ?? 'Sign in to see it'}</p>
          <p className='mt-1 text-sm text-dim'>Give it to a new agent you recruit: you become their team leader. A customer you bring in earns you commission, not a token.</p>
        </div>
        <div className='rounded-2xl border border-line bg-sheet p-5'>
          <p className='text-sm text-dim'>Token per confirmed sign-up in {profile.country}</p>
          <p className='mt-1 font-display text-[28px] text-ink'>
            {profile.referralToken ? money(profile.currency, profile.referralToken.amount) : 'None yet'}
          </p>
          <p className='mt-1 text-sm text-dim'>
            {profile.referralToken
              ? `At most ${profile.referralToken.monthlyLimit} a month per person. Paid by the company from marketing, never from premium or commission. Self-referral and repeat phone numbers earn nothing.`
              : 'No token until the rules for this country are confirmed and approved.'}
          </p>
        </div>
      </div>

      <section aria-labelledby='referrers' className='mb-8'>
        <h2 id='referrers' className='font-display text-[20px] text-ink'>
          Referrals, {month}
        </h2>
        {referrers.length === 0 ? (
          <p className='mt-2 rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
            No referrals yet among your customers. Enter the referral code when you{' '}
            <Link href='/dashboard/customers/new' className='text-seal underline underline-offset-2'>
              add a customer
            </Link>
            ; it counts once their details are confirmed on Follow-ups.
          </p>
        ) : (
          <div className='mt-3 overflow-x-auto rounded-2xl border border-line bg-sheet'>
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead>
                <tr className='border-b border-line text-dim'>
                  <th className='px-4 py-3 font-medium'>Referrer</th>
                  <th className='px-4 py-3 font-medium'>Code</th>
                  <th className='px-4 py-3 font-medium'>Signed up (all time)</th>
                  <th className='px-4 py-3 font-medium'>Confirmed this month</th>
                  <th className='px-4 py-3 font-medium'>Token due</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((row) => (
                  <tr key={row.code} className='border-b border-line last:border-0'>
                    <td className='px-4 py-3 text-ink'>{row.who}</td>
                    <td className='px-4 py-3 font-mono text-[13px] text-dim'>{row.code}</td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>{row.signUps}</td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>
                      {row.statement.verified}
                      {row.statement.overLimit > 0 ? <span className='text-dim'> ({row.statement.overLimit} over the limit)</span> : null}
                    </td>
                    <td className='px-4 py-3 font-mono text-[13px] font-semibold text-seal'>
                      {row.isCustomer && sell.ok ? money(row.statement.currency, row.statement.amount) : row.isCustomer ? 'Once selling starts' : 'Commission instead'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby='codes'>
        <h2 id='codes' className='font-display text-[20px] text-ink'>
          Codes to give your customers
        </h2>
        <p className='mt-0.5 text-sm text-dim'>Each customer has their own code to pass on to friends and family.</p>
        {customers.length === 0 ? (
          <p className='mt-2 text-sm text-ink'>You have no customers yet.</p>
        ) : (
          <ul className='mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {customers.slice(0, 60).map((customer) => (
              <li key={customer.id} className='flex min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-sheet px-4 py-2.5 text-sm'>
                <span className='min-w-0 truncate text-ink'>{customer.name}</span>
                <span className='font-mono text-[13px] text-dim'>{referralCodeFor(profile.countryCode, `customer:${customer.id}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DomainModulePage>
  );
}
