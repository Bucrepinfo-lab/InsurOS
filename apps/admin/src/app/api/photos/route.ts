import { NextResponse } from 'next/server';
import { ClaimPhotoService, MessagingService } from '@insuros/services';
import { authorizeRequest } from '@/lib/auth/session';
import { messengerFor } from '@/lib/messaging';
import { readPhotoForm, tooBig } from '@/lib/photo-upload';

export const dynamic = 'force-dynamic';

/** A member of staff adds a claim photo to a customer conversation they can see. */
export async function POST(request: Request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (tooBig(request)) return NextResponse.json({ error: 'The photo is too large.' }, { status: 413 });
  const auth = await authorizeRequest(null);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Nothing was received.' }, { status: 400 });

  const { viewer, me } = messengerFor(auth.principal);
  const opened = await new MessagingService().open(String(form.get('conversationId') ?? ''), viewer);
  if (!opened.ok) return NextResponse.json({ error: opened.error }, { status: 403 });
  const input = await readPhotoForm(form);
  if (!input) return NextResponse.json({ error: 'Nothing was received.' }, { status: 400 });

  const c = opened.value.conversation;
  const result = await new ClaimPhotoService().add({
    ...input,
    claimReference: c.reference ?? c.id,
    conversationId: c.id,
    uploadedBy: { kind: 'staff', id: me.userId, name: me.name }
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, id: result.photo.id, onTheSpot: result.photo.liveCapture });
}
