import { NextResponse } from 'next/server';
import { toE164 } from '@insuros/domain';
import { PaymentLedgerService, getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { requestPremiumCheckout } from '@/lib/payments';
import { invoiceForCustomer, payablePolicies, premiumPaymentsEnabled } from '@/lib/premium-pay';

export const dynamic = 'force-dynamic';

/*
  One tap to pay a premium (owner, 23/11/26). The customer's page sends only
  the policy and the phone; the server works out the invoice and the amount,
  then sends an M-Pesa prompt that the customer confirms with their own PIN.
  Nothing is taken without that PIN. Behind PAYMENTS_ENABLED and
  PREMIUM_PAYMENTS_ENABLED; the result is recorded from the provider's callback.
*/

const recent = new Map<string, number[]>();
function allowed(key: string, now = Date.now()): boolean {
  const hits = (recent.get(key) ?? []).filter((at) => now - at < 3_600_000);
  if (hits.length >= 3) return false;
  recent.set(key, [...hits, now]);
  return true;
}

async function customerFor(token: unknown) {
  if (!isCustomerToken(token)) return undefined;
  const hash = hashCustomerToken(token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  return customer;
}

export async function POST(req: Request) {
  if (!premiumPaymentsEnabled()) return NextResponse.json({ error: 'Paying here is not switched on yet. Please pay your agent as usual.' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { token?: unknown; policyId?: unknown; phone?: unknown } | null;
  const customer = await customerFor(body?.token);
  if (!customer || typeof body?.policyId !== 'string') return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const phone = typeof body.phone === 'string' ? toE164(body.phone) : null;
  if (!phone || !/^\+254[17]\d{8}$/.test(phone)) {
    return NextResponse.json({ error: 'Enter your M-Pesa number, for example 0712 345 678.' }, { status: 400 });
  }
  const row = await invoiceForCustomer(customer, body.policyId);
  if (!row) return NextResponse.json({ error: 'Nothing is due on this policy right now.' }, { status: 409 });
  if (row.state === 'paid') return NextResponse.json({ error: 'This premium is already paid.', state: 'paid', txnId: row.txnId }, { status: 409 });
  if (row.state === 'waiting') return NextResponse.json({ ok: true, state: 'waiting', txnId: row.txnId });
  if (!allowed(customer.id)) return NextResponse.json({ error: 'Too many tries this hour. Please try again later.' }, { status: 429 });

  // The amount is the invoice's, worked out from the policy on the server.
  const result = await requestPremiumCheckout({ phone, amount: row.invoice.amount, policyReference: row.invoice.reference });
  if (!result.ok) return NextResponse.json({ error: 'M-Pesa could not be reached. Please try again in a few minutes.' }, { status: 502 });
  return NextResponse.json({ ok: true, state: 'waiting', txnId: result.txnId });
}

/** The page asks how its payment is going: waiting, paid or failed. Only for this customer's own payments. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const customer = await customerFor(url.searchParams.get('token'));
  const txnId = url.searchParams.get('txn') ?? '';
  if (!customer || !txnId) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const payment = await new PaymentLedgerService().get(txnId);
  const mine = (await payablePolicies(customer)).some((row) => row.invoice.reference === payment?.policyReference);
  if (!payment || !mine) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const state = payment.status === 'SUCCESS' ? 'paid' : payment.status === 'FAILED' ? 'failed' : 'waiting';
  return NextResponse.json({ state, txnId: payment.id }, { headers: { 'cache-control': 'no-store' } });
}
