import { CareerService } from '@insuros/services';
import { authorizeRequest } from '@/lib/auth/session';
import { followUpViewerFor } from '@/lib/follow-up-viewer';

export const dynamic = 'force-dynamic';

/** The signed-in person's own career record as a PDF. Nobody can fetch anyone else's. */
export async function GET() {
  const auth = await authorizeRequest(null);
  if (!auth.ok) return new Response(auth.error, { status: auth.status });
  const service = new CareerService();
  const record = await service.recordFor({ name: auth.principal.name, userIds: followUpViewerFor(auth.principal).userIds });
  const slug = record.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'staff';
  return new Response(new Uint8Array(service.pdf(record)), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="career-record-${slug}.pdf"`,
      'cache-control': 'private, no-store'
    }
  });
}
