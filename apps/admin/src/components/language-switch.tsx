'use client';

import Link from 'next/link';
import { LANGUAGE_NAMES, type LanguageTag } from '@insuros/domain';

const COOKIE = 'insuros-lang';

/** English / Kiswahili for customer pages. The choice is remembered on this phone for a year. */
export function LanguageSwitch({ current, languages, path }: { current: LanguageTag; languages: readonly LanguageTag[]; path: string }) {
  if (languages.length < 2) return null;
  return (
    <nav aria-label='Lugha / Language' className='inline-flex rounded-lg border border-line bg-sheet p-0.5 text-xs'>
      {languages.map((lang) => (
        <Link
          key={lang}
          href={`${path}?lang=${lang}`}
          lang={lang}
          hrefLang={lang}
          aria-current={lang === current ? 'true' : undefined}
          onClick={() => {
            document.cookie = `${COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={`rounded-md px-2.5 py-1 font-medium ${lang === current ? 'bg-seal text-white' : 'text-dim hover:text-ink'}`}
        >
          {LANGUAGE_NAMES[lang]}
        </Link>
      ))}
    </nav>
  );
}
