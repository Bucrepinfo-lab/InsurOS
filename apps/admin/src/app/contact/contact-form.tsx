'use client';

import { useActionState } from 'react';
import { MESSAGE_MAX, t, type LanguageTag } from '@insuros/domain';
import { contactUs } from '../c/actions';
import { ReviewBeforeSend } from '@/components/review-before-send';

const field = 'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';

export function ContactForm({ topic = 'claim', reference = '', referral = '', lang = 'en' }: { topic?: string; reference?: string; referral?: string; lang?: LanguageTag }) {
  const [result, action, pending] = useActionState(contactUs, null);
  return (
    <ReviewBeforeSend lang={lang}><form action={action} lang={lang} className='grid gap-4 rounded-2xl border border-line bg-sheet p-5'>
      <label className={label}>{t('yourName', lang)}<input name='name' required minLength={2} maxLength={120} autoComplete='name' className={field} /></label>
      <label className={label}>{t('phoneOrEmail', lang)}<input name='contact' required minLength={5} maxLength={80} autoComplete='tel' className={field} /></label>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className={label}>
          {t('about', lang)}
          <select name='topic' defaultValue={topic} className={field}>
            <option value='claim'>{t('aClaim', lang)}</option>
            <option value='policy'>{t('aPolicy', lang)}</option>
            <option value='general'>{t('somethingElse', lang)}</option>
          </select>
        </label>
        <label className={label}>{t('claimOrPolicyNumber', lang)}<input name='reference' maxLength={40} defaultValue={reference} autoComplete='off' className={field} /></label>
      </div>
      <label className={label}>{t('message', lang)}<textarea name='body' required rows={5} maxLength={MESSAGE_MAX} className={field} /></label>
      {referral ? <input type='hidden' name='ref' value={referral} /> : null}
      {/* Left empty by people; robots that fill every field give themselves away. */}
      <input type='text' name='website' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>{pending ? t('sending', lang) : t('send', lang)}</button>
        {result && !result.ok ? <span role='status' className='text-sm text-red-800'>{result.message}</span> : null}
      </div>
    </form></ReviewBeforeSend>
  );
}
