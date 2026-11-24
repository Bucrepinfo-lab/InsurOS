import Link from 'next/link';
import { DomainModulePage } from '@insuros/ui';
import { COUNTRY_PROFILES, POLICY_LINES, canSell, splitCommission } from '@insuros/domain';
import { CountryPills, CountryStatus, money, numberParam, pickCountry } from '@/components/country-pills';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Commission plan' };

const field =
  'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';

/**
 * The commission plan per country: the legal cap per kind of policy and how
 * each commission divides. Read-only: figures, not payments.
 */
export default async function CommissionPlanPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePageAccess("/dashboard/sales/commission-plan");
  const params = await searchParams;
  const profile = pickCountry(params.country, COUNTRY_PROFILES);
  const premium = numberParam(params.premium, profile.countryCode === 'KE' ? 60000 : 1000);
  const sell = canSell(profile);
  const s = profile.split;
  const lines = POLICY_LINES.filter((line) => profile.caps[line.id]);
  const pct = (value: number) => `${value}%`;

  return (
    <DomainModulePage
      title='Commission plan'
      description='What an agent earns on each kind of policy, country by country. The insurer pays commission within the legal cap; the agent keeps most of it, and is paid within 7 days of the insurer paying us.'
    >
      <CountryPills profiles={COUNTRY_PROFILES} current={profile.countryCode} basePath='/dashboard/sales/commission-plan' keep={{ premium: String(premium) }} />
      <CountryStatus profile={profile} sellReason={sell.ok ? null : sell.reason} />

      <section aria-labelledby='split' className='mb-8 grid gap-3 sm:grid-cols-3'>
        <h2 id='split' className='sr-only'>
          How each commission divides
        </h2>
        <div className='rounded-2xl border border-line bg-sheet p-5'>
          <p className='text-sm text-dim'>Selling agent</p>
          <p className='mt-1 font-display text-[28px] text-ink'>
            {pct(s.agentNew)} <span className='text-[15px] text-dim'>new, {pct(s.agentRenewal)} renewal</span>
          </p>
          <p className='mt-1 text-sm text-dim'>
            Gold agents: {pct(s.goldAgentNew)} new, {pct(s.goldAgentRenewal)} renewal.{' '}
            {profile.goldThresholdPerQuarter
              ? `Gold for the next quarter after ${money(profile.currency, profile.goldThresholdPerQuarter)} of premium in a quarter.`
              : 'Gold threshold: not set yet for this country.'}
          </p>
        </div>
        <div className='rounded-2xl border border-line bg-sheet p-5'>
          <p className='text-sm text-dim'>Team leader</p>
          <p className='mt-1 font-display text-[28px] text-ink'>{pct(s.teamLeader)}</p>
          <p className='mt-1 text-sm text-dim'>Override for the licensed supervisor who leads the agent.</p>
        </div>
        <div className='rounded-2xl border border-line bg-sheet p-5'>
          <p className='text-sm text-dim'>Agency</p>
          <p className='mt-1 font-display text-[28px] text-ink'>
            {pct(100 - s.agentNew - s.teamLeader)} <span className='text-[15px] text-dim'>new, {pct(100 - s.agentRenewal - s.teamLeader)} renewal</span>
          </p>
          <p className='mt-1 text-sm text-dim'>Only what it costs to run: licences, compliance, the platform and support.</p>
        </div>
      </section>

      <form method='get' className='mb-4 flex flex-wrap items-end gap-3'>
        <input type='hidden' name='country' value={profile.countryCode} />
        <label className='block text-sm font-medium text-ink'>
          Example premium ({profile.currency})
          <input name='premium' defaultValue={premium} inputMode='decimal' className={field} />
        </label>
        <button type='submit' className='rounded-lg bg-seal px-4 py-2 text-sm font-semibold text-white hover:bg-sealdark'>
          Work it out
        </button>
      </form>

      {lines.length === 0 ? (
        <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
          No commission rules are on file for {profile.country} yet, so nothing can be sold there. A local adviser has to
          confirm the caps and the referral rules first.
        </p>
      ) : (
        <div className='overflow-x-auto rounded-2xl border border-line bg-sheet'>
          <table className='w-full min-w-[760px] text-left text-sm'>
            <caption className='px-4 pt-4 text-left text-sm text-dim'>
              On a premium of {money(profile.currency, premium)}, a new policy at the legal cap.
            </caption>
            <thead>
              <tr className='border-b border-line text-dim'>
                <th className='px-4 py-3 font-medium'>Policy</th>
                <th className='px-4 py-3 font-medium'>Regulator&apos;s class</th>
                <th className='px-4 py-3 font-medium'>Legal cap</th>
                <th className='px-4 py-3 font-medium'>Commission</th>
                <th className='px-4 py-3 font-medium'>Agent</th>
                <th className='px-4 py-3 font-medium'>Team leader</th>
                <th className='px-4 py-3 font-medium'>Agency</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const cap = profile.caps[line.id]!;
                const split = splitCommission(profile, line.id, premium);
                return (
                  <tr key={line.id} className='border-b border-line last:border-0'>
                    <td className='px-4 py-3 text-ink'>
                      <Link
                        href={`/dashboard/marketplace/break-even?country=${profile.countryCode}&line=${line.id}`}
                        className='underline-offset-2 hover:text-seal hover:underline'
                      >
                        {line.name}
                      </Link>
                    </td>
                    <td className='px-4 py-3 text-dim'>
                      {cap.className}
                      {cap.note ? <span className='block text-xs'>{cap.note}</span> : null}
                    </td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>
                      {cap.firstYear === cap.renewal ? pct(cap.firstYear) : `${pct(cap.firstYear)} then ${pct(cap.renewal)}`}
                    </td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>{split ? money(profile.currency, split.commission) : '–'}</td>
                    <td className='px-4 py-3 font-mono text-[13px] font-semibold text-seal'>{split ? money(profile.currency, split.agent) : '–'}</td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>{split ? money(profile.currency, split.teamLeader) : '–'}</td>
                    <td className='px-4 py-3 font-mono text-[13px] text-ink'>{split ? money(profile.currency, split.agency) : '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ul className='mt-6 grid gap-2 text-sm text-ink'>
        <li>Never above the cap: the split is of what the insurer pays, and the insurer pays within the law of that country.</li>
        <li>Clawback in proportion: if a policy is cancelled and the insurer takes back commission, the same share comes off the next statement.</li>
        <li>Licensed only: commission goes only to licensed agents and team leaders. The public earns a referral token instead.</li>
      </ul>
    </DomainModulePage>
  );
}
