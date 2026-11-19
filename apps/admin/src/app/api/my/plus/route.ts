import { NextResponse } from 'next/server';
import { plusPaymentReference, toE164, type PlusPlan } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { plusFor, plusRails } from '@/lib/customer-plus';
import { requestPremiumCheckout } from '@/lib/payments';
import { paymentsEnabled } from '@/lib/payments-gate';

export const dynamic = 'force-dynamic';

const recent = new Map<string, number[]>();
function allowed(key: string, now = Date.now()): boolean {
  const hits = (recent.get(key) ?? []).filter((at) => now - at < 3_600_000);
  if (hits.length >= 3) return false;
  recent.set(key, [...hits, now]);
  return true;
}

/**
 * The customer pays for My Cover Plus, a month or a year from this month: an M-Pesa prompt to the
 * phone they type, which they confirm with their own PIN. Nothing is taken
 * without that. Only from this month, only the server's price, only through the
 * money gate; the months unlock when the confirmed result comes back.
 */
export async function POST(req: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: 'payments_disabled' }, { status: 403 });
  // Owner rules 19/11/26: M-Pesa wherever it is a way to pay (it leads in Kenya); elsewhere Plus is paid by card.
  if (!plusRails().includes('MPESA')) return NextResponse.json({ error: 'Plus is paid by card here. Use the card buttons.' }, { status: 409 });
  const body = (await req.json().catch(() => null)) as { token?: unknown; phone?: unknown; plan?: unknown } | null;
  if (!body || !isCustomerToken(body.token)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const hash = hashCustomerToken(body.token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const phone = typeof body.phone === 'string' ? toE164(body.phone) : null;
  if (!phone || !/^\+254[17]\d{8}$/.test(phone)) return NextResponse.json({ error: 'Enter a Safaricom number, for example 0712 345 678.' }, { status: 400 });
  const status = await plusFor(customer);
  if (status.state === 'paid') return NextResponse.json({ error: 'This month is already paid.' }, { status: 409 });
  if (!allowed(customer.id)) return NextResponse.json({ error: 'Too many tries this hour. Please try again later.' }, { status: 429 });
  const plan: PlusPlan = body.plan === 'YEAR' ? 'YEAR' : 'MONTH';
  // The price is the server's (this customer's locked founding price or today's list price), never the page's.
  const amount = plan === 'YEAR' ? status.price.yearly : status.price.monthly;
  const result = await requestPremiumCheckout({ phone, amount, policyReference: plusPaymentReference(customer.id, status.month, plan) });
  if (!result.ok) return NextResponse.json({ error: 'M-Pesa could not be reached. Please try again in a few minutes.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
