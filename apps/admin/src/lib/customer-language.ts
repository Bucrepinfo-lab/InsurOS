import { cookies } from 'next/headers';
import { DEFAULT_COUNTRY, clockFor, pickLanguage, type LanguageTag } from '@insuros/domain';

export const LANGUAGE_COOKIE = 'insuros-lang';

/**
 * The language for a customer page: the one they just picked (?lang=), else
 * the one they picked before on this phone, else the country's first language.
 */
export async function customerLanguage(requested: string | string[] | undefined, countryCode = DEFAULT_COUNTRY): Promise<LanguageTag> {
  const allowed = clockFor(countryCode).languages;
  const asked = Array.isArray(requested) ? requested[0] : requested;
  if (asked && allowed.includes(asked as LanguageTag)) return asked as LanguageTag;
  const saved = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return pickLanguage(saved, allowed);
}
