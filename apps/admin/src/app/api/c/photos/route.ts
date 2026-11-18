import { NextResponse } from 'next/server';
import { ClaimPhotoService, MessagingService } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { readPhotoForm, tooBig } from '@/lib/photo-upload';

export const dynamic = 'force-dynamic';

/** A customer adds a claim photo through their private conversation link. */
export async function POST(request: Request) {
  if (tooBig(request)) return NextResponse.json({ error: 'The photo is too large.' }, { status: 413 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Nothing was received.' }, { status: 400 });
  const token = form.get('token');
  if (!isCustomerToken(token)) return NextResponse.json({ error: 'This link does not work any more.' }, { status: 403 });
  const found = await new MessagingService().forCustomer(hashCustomerToken(token));
  if (!found) return NextResponse.json({ error: 'This link does not work any more.' }, { status: 403 });
  const input = await readPhotoForm(form);
  if (!input) return NextResponse.json({ error: 'Nothing was received.' }, { status: 400 });

  const c = found.conversation;
  const result = await new ClaimPhotoService().add({
    ...input,
    claimReference: c.reference ?? c.id,
    conversationId: c.id,
    uploadedBy: { kind: 'customer', id: 'customer', name: c.customerName ?? 'Customer' }
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, id: result.photo.id, onTheSpot: result.photo.liveCapture });
}
