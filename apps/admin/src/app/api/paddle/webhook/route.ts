import { NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { PLUS_PADDLE_PRICES, paddleConfig, paidItemFromPaddleEvent, verifyPaddleSignature } from '@insuros/domain';
import { recordPlusCardPayment } from '@/lib/customer-plus';

export const dynamic = 'force-dynamic';

const hmac = (secret: string, data: string) => createHmac('sha256', secret).update(data).digest('hex');

/**
 * Paddle notifications for My Cover Plus card payments (Paddle is the merchant
 * of record for cards and handles the tax). Records a payment the customer
 * already made at Paddle's own checkout; it never starts or moves money and
 * never touches premiums or claims. Signature-checked over the raw body;
 * unlocking is idempotent, so a repeated delivery changes nothing.
 */
export async function POST(req: Request) {
  const cfg = paddleConfig(process.env, PLUS_PADDLE_PRICES);
  if (!cfg) return NextResponse.json({ error: 'not enabled' }, { status: 404 });

  const raw = await req.text();
  if (!verifyPaddleSignature(raw, req.headers.get('paddle-signature'), cfg.webhookSecret, hmac)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 });
  }
  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const paid = paidItemFromPaddleEvent(event, cfg.prices, 'plusReference');
  if (!paid) return NextResponse.json({ ok: true, ignored: true });

  try {
    const applied = await recordPlusCardPayment(paid.customId, paid.key);
    if (!applied) console.error('[paddle] Plus payment not applied', paid.transactionId);
    return NextResponse.json({ ok: true, applied });
  } catch (err) {
    console.error('[paddle] could not apply', paid.transactionId, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'apply failed' }, { status: 500 });
  }
}
