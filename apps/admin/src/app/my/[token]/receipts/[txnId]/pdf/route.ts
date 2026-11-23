import { makePdf, premiumReceiptPdf } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { customerReceipt } from '@/lib/premium-pay';

export const dynamic = 'force-dynamic';

/** The customer downloads the receipt for a premium they paid (PDF). Always free. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string; txnId: string }> }) {
  const { token, txnId } = await params;
  if (!isCustomerToken(token)) return new Response('Not found', { status: 404 });
  const hash = hashCustomerToken(token);
  const [customer] = await getPersistence().customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) return new Response('Not found', { status: 404 });
  const line = await customerReceipt(customer, decodeURIComponent(txnId));
  if (!line) return new Response('Not found', { status: 404 });
  const pdf = makePdf(premiumReceiptPdf(line.receipt));
  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${line.receipt.receiptNumber}.pdf"`,
      'cache-control': 'private, no-store'
    }
  });
}
