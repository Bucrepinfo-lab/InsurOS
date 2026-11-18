import { DocumentService, MessagingService } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';

export const dynamic = 'force-dynamic';

/** The customer downloads their claim pack (PDF). */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isCustomerToken(token)) return new Response('Not found', { status: 404 });
  const found = await new MessagingService().forCustomer(hashCustomerToken(token));
  if (!found || found.conversation.topic !== 'claim') return new Response('Not found', { status: 404 });
  const pdf = await new DocumentService().claimPack(found.conversation);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="claim-${(found.conversation.reference ?? 'pack').replace(/[^A-Za-z0-9-]/g, '')}.pdf"`,
      'cache-control': 'private, no-store'
    }
  });
}
