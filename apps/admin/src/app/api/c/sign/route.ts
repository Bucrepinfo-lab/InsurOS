import { NextResponse } from 'next/server';
import { DocumentService, MessagingService } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';

export const dynamic = 'force-dynamic';

/** The customer signs the claim declaration through their private link. */
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? '0') > 1024 * 1024) return NextResponse.json({ error: 'Too large.' }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const token = form?.get('token');
  if (!form || !isCustomerToken(token)) return NextResponse.json({ error: 'This link does not work any more.' }, { status: 403 });
  const found = await new MessagingService().forCustomer(hashCustomerToken(token));
  if (!found) return NextResponse.json({ error: 'This link does not work any more.' }, { status: 403 });
  const image = form.get('signature');
  if (!(image instanceof Blob)) return NextResponse.json({ error: 'Sign in the box first.' }, { status: 400 });
  const result = await new DocumentService().signClaimDeclaration(found.conversation, {
    name: form.get('name'),
    agreed: form.get('agreed'),
    image: new Uint8Array(await image.arrayBuffer())
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
