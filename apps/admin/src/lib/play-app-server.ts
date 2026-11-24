import 'server-only';
import { cookies, headers } from 'next/headers';
import { PLAY_APP_COOKIE, digitalPurchasesAllowed } from '@insuros/domain';

/** Server check: may this request buy My Cover Plus? (Google Play payments policy.) */
export async function digitalPurchasesAllowedHere(): Promise<boolean> {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  return digitalPurchasesAllowed({ cookie: jar.get(PLAY_APP_COOKIE)?.value ?? null, referrer: h.get('referer') });
}
