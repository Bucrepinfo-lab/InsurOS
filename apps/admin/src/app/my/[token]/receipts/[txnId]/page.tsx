import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InsurOSLogo, LedgerSeal } from '@insuros/ui';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { customerReceipt } from '@/lib/premium-pay';

export const metadata = { title: 'Premium receipt', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const money = (amount: number, currency: string) => `${currency} ${Math.round(amount).toLocaleString('en-KE')}`;
const ddmmyy = (value: string) => `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(2, 4)}`;

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-dashed border-line py-2 last:border-0'>
      <dt className='text-sm text-dim'>{label}</dt>
      <dd className={`text-right text-sm font-medium text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

/**
 * The customer's receipt for a premium they paid: who received it, for which
 * policy and period, how much, and the M-Pesa confirmation code. Always free
 * (a receipt is the customer's right, not part of My Cover Plus).
 */
export default async function ReceiptPage({ params }: { params: Promise<{ token: string; txnId: string }> }) {
  const { token, txnId } = await params;
  if (!isCustomerToken(token)) notFound();
  const hash = hashCustomerToken(token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) notFound();
  const line = await customerReceipt(customer, decodeURIComponent(txnId));
  if (!line) notFound();
  const r = line.receipt;
  const pdf = `/my/${token}/receipts/${encodeURIComponent(line.txnId)}/pdf`;

  return (
    <main className='min-h-screen bg-paper px-4 py-6 sm:py-10'>
      <div className='mx-auto grid max-w-2xl gap-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Link href={`/my/${token}`} className='text-sm font-medium text-seal underline underline-offset-2'>
            ← Back to my cover
          </Link>
          <a href={pdf} className='rounded-lg bg-seal px-4 py-2 text-sm font-semibold text-white hover:bg-sealdark'>
            Download receipt (PDF)
          </a>
        </div>

        <article aria-label='Premium receipt' className='relative isolate overflow-hidden rounded-3xl border border-line bg-sheet shadow-[0_30px_60px_-40px_rgba(16,28,49,0.6)]'>
          <div aria-hidden='true' className='absolute -right-10 top-24 -z-10 opacity-[0.06]'>
            <LedgerSeal size={260} detailed title='' />
          </div>

          <header className='flex flex-wrap items-start justify-between gap-4 border-b border-line bg-[linear-gradient(140deg,#0f6e56_0%,#0b4a3c_60%,#101c31_100%)] px-6 py-5 text-white sm:px-8'>
            <div>
              <InsurOSLogo tone='dark' size={26} />
              <p className='mt-3 text-xs uppercase tracking-[0.18em] text-white/70'>Official receipt</p>
              <p className='font-mono text-lg'>{r.receiptNumber}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-white/70'>Issued by</p>
              <p className='font-semibold'>{r.issuedBy}</p>
              <p className='mt-2 text-xs text-white/70'>On behalf of</p>
              <p className='font-semibold'>{r.insurer}</p>
            </div>
          </header>

          {r.sample ? (
            <p className='border-b border-warnink/30 bg-warnsoft px-6 py-2 text-center text-xs font-semibold text-warnink sm:px-8'>
              Sample receipt for the demo. Not a real payment.
            </p>
          ) : null}

          <section className='grid gap-1 px-6 pt-6 sm:px-8'>
            <p className='text-sm text-dim'>Received with thanks from</p>
            <p className='font-display text-2xl text-ink'>{r.receivedFrom}</p>
            <div className='mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-sealsoft px-5 py-4'>
              <div>
                <p className='text-xs uppercase tracking-wider text-sealink'>Amount paid</p>
                <p className='font-mono text-3xl font-semibold text-ink'>{money(r.amount, r.currency)}</p>
              </div>
              <span className='rounded-full bg-seal px-3 py-1 text-xs font-semibold text-white'>Paid in full</span>
            </div>
          </section>

          <div className='grid gap-6 px-6 py-6 sm:grid-cols-2 sm:px-8'>
            <section aria-label='Policy'>
              <h2 className='text-xs font-semibold uppercase tracking-wider text-dim'>Policy</h2>
              <dl className='mt-2'>
                <Row label='Policy number' value={r.policyNumber} mono />
                <Row label='Type of cover' value={r.product} />
                {r.insuredItem ? <Row label='What is insured' value={r.insuredItem} /> : null}
                <Row label='Payment for' value={r.kind === 'Renewal' ? 'Renewal of cover' : 'New cover'} />
                <Row label='Cover period' value={`${ddmmyy(r.periodStart)} to ${ddmmyy(r.periodEnd)}`} />
              </dl>
            </section>
            <section aria-label='Payment'>
              <h2 className='text-xs font-semibold uppercase tracking-wider text-dim'>Payment</h2>
              <dl className='mt-2'>
                <Row label='Date and time' value={`${ddmmyy(r.paidAt)} ${r.paidAt.slice(11, 16)}`} />
                <Row label='Invoice number' value={r.invoiceNumber} mono />
                <Row label='Method' value={r.method} />
                {r.providerReference ? <Row label='M-Pesa code' value={r.providerReference} mono /> : null}
                {r.payer ? <Row label='Paid from' value={r.payer} mono /> : null}
              </dl>
            </section>
          </div>

          <footer className='border-t border-line px-6 py-4 text-xs text-dim sm:px-8'>
            Keep this receipt. Your cover runs for the period above once {r.insurer} confirms the policy. Questions: write to us from your
            cover page or call your agent.
          </footer>
        </article>
      </div>
    </main>
  );
}
