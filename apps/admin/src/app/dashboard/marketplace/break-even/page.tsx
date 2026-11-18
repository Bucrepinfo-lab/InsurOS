import Link from 'next/link';
import { DomainModulePage } from '@insuros/ui';
import {
  COUNTRY_PROFILES,
  POLICY_LINES,
  breakEvenPremium,
  canSell,
  splitCommission,
  withLevies,
  type PolicyLineId
} from '@insuros/domain';
import { CountryPills, CountryStatus, money, numberParam, pickCountry } from '@/components/country-pills';

export const metadata = { title: 'Break-even price' };

const field =
  'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';
const hint = 'mt-0.5 block text-xs font-normal text-dim';

/**
 * The lowest premium that still pays the claims, the commission and the
 * running costs: the floor for a scheme rate negotiated with an insurer.
 * A calculator only: the insurer files and charges the premium.
 */
export default async function BreakEvenPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const profile = pickCountry(params.country, COUNTRY_PROFILES);
  const lines = POLICY_LINES.filter((line) => profile.caps[line.id]);
  const asked = Array.isArray(params.line) ? params.line[0] : params.line;
  const line = lines.find((candidate) => candidate.id === asked) ?? lines[0];
  const cap = line ? profile.caps[line.id as PolicyLineId] : undefined;

  const kenyaCar = profile.countryCode === 'KE' && line?.id === 'motor-private';
  const marketPremium = numberParam(params.market, kenyaCar ? 60000 : 1000);
  const lossRatio = numberParam(params.loss, 70.36, 100);
  const commission = Math.min(numberParam(params.commission, cap?.firstYear ?? 10, 100), cap?.firstYear ?? 0);
  const running = numberParam(params.running, 12, 100);
  const margin = numberParam(params.margin, 3, 100);

  const expectedClaims = (marketPremium * lossRatio) / 100;
  const target = breakEvenPremium({ expectedClaims, commissionRate: commission, runningCostRate: running, margin });
  const strict = breakEvenPremium({ expectedClaims, commissionRate: commission, runningCostRate: running, margin: 0 });
  const total = target ? withLevies(profile, target) : null;
  const split = line && target ? splitCommission(profile, line.id as PolicyLineId, target, { insurerRate: commission }) : null;
  const saving = target ? 1 - target / marketPremium : 0;
  const sell = canSell(profile);

  return (
    <DomainModulePage
      title='Break-even price'
      description='The lowest premium that still pays the expected claims, the commission and the running costs. Use it to agree a lower filed rate with an insurer; never sell below it.'
    >
      <CountryPills profiles={COUNTRY_PROFILES} current={profile.countryCode} basePath='/dashboard/marketplace/break-even' />
      <CountryStatus profile={profile} sellReason={sell.ok ? null : sell.reason} />

      {!line ? (
        <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
          No commission rules are on file for {profile.country} yet, so there is nothing to price here.
        </p>
      ) : (
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
          <form method='get' className='grid gap-4 rounded-2xl border border-line bg-sheet p-5'>
            <input type='hidden' name='country' value={profile.countryCode} />
            <label className={label}>
              Kind of policy
              <select name='line' defaultValue={line.id} className={field}>
                {lines.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={label}>
              Market premium today ({profile.currency})
              <span className={hint}>What the customer would pay elsewhere for the same cover.</span>
              <input name='market' defaultValue={marketPremium} inputMode='decimal' className={field} />
            </label>
            <label className={label}>
              Claims paid, % of premium
              <span className={hint}>The insurer&apos;s loss ratio for this class. Kenya&apos;s non-life market: 70.36% in 2024.</span>
              <input name='loss' defaultValue={lossRatio} inputMode='decimal' className={field} />
            </label>
            <label className={label}>
              Commission, % of premium
              <span className={hint}>At most the legal cap: {cap?.firstYear}%.</span>
              <input name='commission' defaultValue={commission} inputMode='decimal' className={field} />
            </label>
            <label className={label}>
              Insurer&apos;s other running costs, % of premium
              <span className={hint}>Kenya&apos;s market spent 32.41% in 2024 including commission; a digital channel aims for about 12% besides it.</span>
              <input name='running' defaultValue={running} inputMode='decimal' className={field} />
            </label>
            <label className={label}>
              Safety margin, % of premium
              <span className={hint}>A buffer against a bad year, not profit.</span>
              <input name='margin' defaultValue={margin} inputMode='decimal' className={field} />
            </label>
            <button type='submit' className='justify-self-start rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark'>
              Work it out
            </button>
          </form>

          <div className='grid content-start gap-3'>
            {target && strict && total ? (
              <>
                <div className='rounded-2xl border border-seal/30 bg-sealsoft p-5'>
                  <p className='text-sm text-dim'>Target premium</p>
                  <p className='mt-1 font-display text-[34px] text-ink'>{money(profile.currency, target)}</p>
                  <p className='mt-1 text-sm text-ink'>
                    {saving > 0
                      ? `${Math.round(saving * 1000) / 10}% below the market premium of ${money(profile.currency, marketPremium)}.`
                      : `Not below the market premium: at these costs, a lower price would lose money.`}
                  </p>
                </div>
                <dl className='grid gap-2 rounded-2xl border border-line bg-sheet p-5 text-sm'>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-dim'>Expected claims</dt>
                    <dd className='font-mono text-ink'>{money(profile.currency, expectedClaims)}</dd>
                  </div>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-dim'>Strict break-even, no margin</dt>
                    <dd className='font-mono text-ink'>{money(profile.currency, strict)}</dd>
                  </div>
                  <div className='flex justify-between gap-3'>
                    <dt className='text-dim'>{profile.levies.label}</dt>
                    <dd className='font-mono text-ink'>{money(profile.currency, total.levies)}</dd>
                  </div>
                  <div className='flex justify-between gap-3 border-t border-line pt-2 font-semibold'>
                    <dt className='text-ink'>Customer pays</dt>
                    <dd className='font-mono text-ink'>{money(profile.currency, total.total)}</dd>
                  </div>
                  {split ? (
                    <div className='flex justify-between gap-3'>
                      <dt className='text-dim'>Of which the agent earns</dt>
                      <dd className='font-mono text-seal'>{money(profile.currency, split.agent)}</dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : (
              <p className='rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-900'>
                These rates leave too little to pay claims. Lower the costs or the margin.
              </p>
            )}
            <p className='text-sm text-dim'>
              An agency cannot lower a premium itself, and in Kenya cannot give commission back as a discount (Insurance Act
              s.73). This figure is for agreeing a filed scheme rate with the insurer.{' '}
              <Link href={`/dashboard/sales/commission-plan?country=${profile.countryCode}`} className='text-seal underline underline-offset-2'>
                See the commission plan
              </Link>
            </p>
          </div>
        </div>
      )}
    </DomainModulePage>
  );
}
