import { cleanReferralCode } from '@insuros/domain';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** A friend's share link: straight to "Talk to your agent", carrying who referred them. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = cleanReferralCode(code);
  const target = new URL('/contact', SITE_URL);
  target.searchParams.set('topic', 'general');
  if (clean) target.searchParams.set('ref', clean);
  return Response.redirect(target, 302);
}
