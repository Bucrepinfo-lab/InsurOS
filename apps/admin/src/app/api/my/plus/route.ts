import { NextResponse } from 'next/server';
import { PLUS_UNITS_PER_MONTH, plusPaymentReference, toE164 } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { plusFor } from '@/lib/customer-plus';
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
 * The customer pays for this month of My Cover Plus: an M-Pesa prompt to the
 * phone they type, which they confirm with their own PIN. Nothing is taken
 * without that. Only this month, only the fixed price, only through the money
 * gate; the month unlocks when the confirmed result comes back.
 */
export async function POST(req: Request) {
  if (!paymentsEnabled()) return NextResponse.json({ error: 'payments_disabled' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { token?: unknown; phone?: unknown } | null;
  if (!body || !isCustomerToken(body.token)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const hash = hashCustomerToken(body.token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const phone = typeof body.phone === 'string' ? toE164(body.phone) : null;
  if (!phone || !/^\+254[17]\d{8}$/.test(phone)) return NextResponse.json({ error: 'Enter a Safaricom number, for example 0712 345 678.' }, { status: 400 });
  const status = await plusFor(customer);
  if (status.state === 'paid') return NextResponse.json({ error: 'This month is already paid.' }, { status: 409 });
  if (!allowed(customer.id)) return NextResponse.json({ error: 'Too many tries this hour. Please try again later.' }, { status: 429 });
  const result = await requestPremiumCheckout({ phone, amount: PLUS_UNITS_PER_MONTH, policyReference: plusPaymentReference(customer.id, status.month) });
  if (!result.ok) return NextResponse.json({ error: 'M-Pesa could not be reached. Please try again in a few minutes.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
