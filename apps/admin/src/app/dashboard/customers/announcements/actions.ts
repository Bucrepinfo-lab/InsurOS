'use server';

import { revalidatePath } from 'next/cache';
import { getPersistence } from '@insuros/services';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';

const clean = (value: FormDataEntryValue | null, max: number) => String(value ?? '').trim().replace(/\r\n/g, '\n').slice(0, max);

/**
 * Post news or an offer to every customer's own page. Operations leads only
 * (checked on the server). Plain text; a link must be https.
 */
export async function postAnnouncement(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Operations', 'Create');
  if (!auth.ok) return auth.result;
  const headline = clean(formData.get('headline'), 90);
  const body = clean(formData.get('body'), 1000);
  const link = clean(formData.get('link'), 300);
  const until = clean(formData.get('until'), 10);
  if (headline.length < 4) return fail('Not posted', 'Give the news a headline of at least 4 characters.');
  if (body.length < 10) return fail('Not posted', 'Write at least a sentence for customers to read.');
  if (link && !/^https:\/\/[^\s]+$/.test(link)) return fail('Not posted', 'A link must start with https://');
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) return fail('Not posted', 'Pick the last day from the calendar, or leave it empty.');
  const id = `news-${Date.now().toString(36)}`;
  await getPersistence().marketingContent.insert({
    id,
    title: headline,
    headline,
    body,
    cta: link ? 'Read more' : '',
    ...(link ? { ctaHref: link } : {}),
    insuranceLine: 'All',
    placement: 'CustomerHome',
    audience: 'Policyholder',
    locale: 'en',
    status: 'Active',
    startsAt: new Date().toISOString(),
    ...(until ? { endsAt: `${until}T20:59:59.000Z` } : {})
  });
  revalidatePath('/dashboard/customers/announcements');
  return ok('Posted', 'It now shows on every customer’s own page.', { reference: id });
}

/** Take a post down. It stays on record, archived. */
export async function archiveAnnouncement(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Operations', 'Create');
  if (!auth.ok) return auth.result;
  const id = clean(formData.get('id'), 60);
  const db = getPersistence().marketingContent;
  const item = await db.findById(id);
  if (!item || item.placement !== 'CustomerHome') return fail('Not changed', 'That post was not found.');
  await db.update(id, { status: 'Archived' });
  revalidatePath('/dashboard/customers/announcements');
  return ok('Taken down', 'Customers no longer see it. It stays on record.', { reference: id });
}
