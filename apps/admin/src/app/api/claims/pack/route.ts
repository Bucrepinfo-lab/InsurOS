import { DocumentService, MessagingService } from '@insuros/services';
import { authorizeRequest } from '@/lib/auth/session';
import { messengerFor } from '@/lib/messaging';

export const dynamic = 'force-dynamic';

/** Staff download the claim pack of a customer conversation they can see. */
export async function GET(request: Request) {
  const auth = await authorizeRequest(null);
  if (!auth.ok) return new Response(auth.error, { status: auth.status });
  const id = new URL(request.url).searchParams.get('conversation') ?? '';
  const opened = await new MessagingService().open(id, messengerFor(auth.principal).viewer);
  if (!opened.ok || opened.value.conversation.kind !== 'customer') return new Response('Not found', { status: 404 });
  const pdf = await new DocumentService().claimPack(opened.value.conversation);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="claim-${(opened.value.conversation.reference ?? 'pack').replace(/[^A-Za-z0-9-]/g, '')}.pdf"`,
      'cache-control': 'private, no-store'
    }
  });
}
