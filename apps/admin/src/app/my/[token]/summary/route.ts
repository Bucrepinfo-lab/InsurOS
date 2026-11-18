import { DocumentService, getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';

export const dynamic = 'force-dynamic';

/** The customer downloads a summary of their cover (PDF). */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isCustomerToken(token)) return new Response('Not found', { status: 404 });
  const hash = hashCustomerToken(token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) return new Response('Not found', { status: 404 });
  const pdf = await new DocumentService().coverSummary(customer);
  return new Response(new Uint8Array(pdf), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="my-cover.pdf"', 'cache-control': 'private, no-store' }
  });
}
