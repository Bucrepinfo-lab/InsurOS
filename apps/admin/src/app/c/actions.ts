'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkMessage, cleanReferralCode, referralCodeFor, type ConversationTopic, type OwnedClaim, type OwnedCustomer, type OwnedPolicy } from '@insuros/domain';
import { MessagingService, getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken, newCustomerLink } from '@/lib/customer-link';

export interface CustomerFormState {
  ok: boolean;
  message: string;
}

/** The customer replies in their conversation. The token is the only key. */
export async function customerReply(_prev: CustomerFormState | null, formData: FormData): Promise<CustomerFormState> {
  const token = formData.get('token');
  if (!isCustomerToken(token)) return { ok: false, message: 'This link does not work. Ask your agent for a new one.' };
  const result = await new MessagingService().customerReply(hashCustomerToken(token), formData.get('body'));
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath(`/c/${token}`);
  return { ok: true, message: 'Sent. Your agent has it and will reply here.' };
}

// A few contact-form submissions per address per hour, kept in memory. Enough to stop casual flooding.
const recent = new Map<string, number[]>();
function allowed(key: string, now = Date.now()): boolean {
  const hourAgo = now - 3_600_000;
  const times = (recent.get(key) ?? []).filter((time) => time > hourAgo);
  if (times.length >= 5) return false;
  times.push(now);
  recent.set(key, times);
  if (recent.size > 5000) recent.clear();
  return true;
}

/**
 * A customer with no link writes to us from the public contact page. If they
 * give a policy or claim number we know, the agent or claims officer who owns
 * it answers; otherwise the area's supervisors pick it up. Either way the
 * customer lands on their own private conversation page.
 */
export async function contactUs(_prev: CustomerFormState | null, formData: FormData): Promise<CustomerFormState> {
  if (formData.get('website')) return { ok: true, message: 'Sent.' }; // a form-filling robot filled the hidden field
  const h = await headers();
  const ip = h.get('fly-client-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allowed(ip)) return { ok: false, message: 'Too many messages from here in the last hour. Please try again later.' };

  const name = String(formData.get('name') ?? '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) return { ok: false, message: 'Enter your name.' };
  const contact = String(formData.get('contact') ?? '').trim().slice(0, 80);
  if (contact.length < 5) return { ok: false, message: 'Enter a phone number or email so we can reach you.' };
  const body = checkMessage(formData.get('body'));
  if (!body.ok) return { ok: false, message: body.error };
  const topic: ConversationTopic = formData.get('topic') === 'claim' ? 'claim' : formData.get('topic') === 'policy' ? 'policy' : 'general';
  const raw = String(formData.get('reference') ?? '').trim().toUpperCase();
  const reference = /^[A-Z0-9-]{3,40}$/.test(raw) ? raw : undefined;

  // Find who owns the matter. The customer is never told whether the number matched.
  let ownerId: string | undefined;
  if (reference) {
    const db = getPersistence();
    if (topic === 'claim') {
      const [claim] = (await db.claims.findWhere((c) => c.claimNumber === reference)) as OwnedClaim[];
      ownerId = claim?.assignedToUserId ?? claim?.registeredByUserId;
    } else {
      const [policy] = (await db.policies.findWhere((p) => p.policyNumber === reference)) as OwnedPolicy[];
      ownerId = policy?.ownerUserId;
    }
  }
  // A friend's share link: the enquiry goes to the agent who looks after the friend.
  const referral = cleanReferralCode(formData.get('ref'));
  if (referral && !ownerId) {
    const [referrer] = (await getPersistence().customers.findWhere((c) => referralCodeFor(referral.slice(0, 2), c.id) === referral)) as OwnedCustomer[];
    ownerId = referrer?.ownerUserId;
  }
  const ownerAppointment = ownerId
    ? (await getPersistence().appointments.findWhere((a) => a.userId === ownerId && a.status === 'Active'))[0]
    : undefined;

  const link = newCustomerLink();
  const result = await new MessagingService().startCustomer({
    subject: topic === 'claim' ? `Claim enquiry${reference ? ` ${reference}` : ''}` : topic === 'policy' ? `Policy enquiry${reference ? ` ${reference}` : ''}` : 'Enquiry',
    body: referral ? `Referred by a customer (code ${referral}).\n\n${body.value}` : body.value,
    topic,
    ...(reference ? { reference } : {}),
    customerName: name,
    customerContact: contact,
    customerAccessHash: link.hash,
    ...(ownerId ? { owner: { userId: ownerId, name: ownerAppointment?.userName ?? 'Your agent' } } : {}),
    from: { kind: 'customer' }
  });
  if (!result.ok) return { ok: false, message: result.error };
  redirect(`/c/${link.token}?new=1`);
}
