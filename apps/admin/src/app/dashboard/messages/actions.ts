'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AI_TASK_LABELS,
  checkMessage,
  type AiTask,
  type ConversationTopic
} from '@insuros/domain';
import { AiAssistantService, MessagingService } from '@insuros/services';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';
import { newCustomerLink } from '@/lib/customer-link';
import { directoryForPrincipal, messengerFor } from '@/lib/messaging';

const TOPICS: ConversationTopic[] = ['claim', 'policy', 'general'];
const topicOf = (raw: FormDataEntryValue | null): ConversationTopic =>
  TOPICS.find((topic) => topic === raw) ?? 'general';
const referenceOf = (raw: FormDataEntryValue | null): string | undefined => {
  const value = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  return /^[A-Z0-9-]{3,40}$/.test(value) ? value : undefined;
};

/** Start a conversation with colleagues. Only people in your line of the hierarchy can be picked. */
export async function startColleagueConversation(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const { me } = messengerFor(auth.principal);
  const allowed = await directoryForPrincipal(auth.principal);
  const picked = formData.getAll('to').filter((value): value is string => typeof value === 'string');
  const to = allowed
    .filter((entry) => picked.includes(entry.appointment.userId))
    .map((entry) => ({ userId: entry.appointment.userId, name: entry.appointment.userName }));
  if (to.length === 0) return fail('Not sent', 'Choose at least one colleague from the list.');

  const result = await new MessagingService().startColleagues({
    subject: formData.get('subject'),
    body: formData.get('body'),
    from: me,
    to,
    topic: topicOf(formData.get('topic')),
    reference: referenceOf(formData.get('reference')),
    aiAssisted: formData.get('aiAssisted') === 'yes'
  });
  if (!result.ok) return fail('Not sent', result.error);
  revalidatePath('/dashboard/messages');
  redirect(`/dashboard/messages/${result.value.id}`);
}

/** Start a conversation with a customer: you write first, and the customer gets a private link to reply. */
export async function startCustomerConversation(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const { me } = messengerFor(auth.principal);
  const customerName = typeof formData.get('customerName') === 'string' ? String(formData.get('customerName')) : '';
  const contact = typeof formData.get('customerContact') === 'string' ? String(formData.get('customerContact')).trim().slice(0, 80) : '';
  const link = newCustomerLink();
  const result = await new MessagingService().startCustomer({
    subject: formData.get('subject'),
    body: formData.get('body'),
    topic: topicOf(formData.get('topic')),
    reference: referenceOf(formData.get('reference')),
    customerName,
    ...(contact ? { customerContact: contact } : {}),
    customerAccessHash: link.hash,
    from: { kind: 'staff', who: me },
    aiAssisted: formData.get('aiAssisted') === 'yes'
  });
  if (!result.ok) return fail('Not started', result.error);
  revalidatePath('/dashboard/messages');
  // The link is shown once, here. Only its fingerprint is stored.
  return ok('Conversation started', 'Send this private link to the customer so they can read and reply. It is shown only now; you can make a new one later.', {
    reference: result.value.id,
    link: link.url
  });
}

export async function replyToConversation(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const { viewer, me } = messengerFor(auth.principal);
  const id = String(formData.get('conversationId') ?? '');
  const result = await new MessagingService().reply(id, viewer, me, formData.get('body'), {
    aiAssisted: formData.get('aiAssisted') === 'yes'
  });
  if (!result.ok) return fail('Not sent', result.error);
  revalidatePath(`/dashboard/messages/${id}`);
  revalidatePath('/dashboard/messages');
  return ok('Sent', 'Your reply is in the conversation.');
}

/** AI help for the person writing. Returns text for the box; never sends. */
export async function aiHelp(input: {
  task: AiTask;
  conversationId?: string;
  draft?: string;
  subject?: string;
  audience?: 'customer' | 'colleague';
}): Promise<{ ok: true; text: string; source: 'ai' | 'basic'; note?: string } | { ok: false; error: string }> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return { ok: false, error: auth.result.message };
  if (!(input.task in AI_TASK_LABELS)) return { ok: false, error: 'Unknown helper.' };
  const { viewer, me } = messengerFor(auth.principal);
  const draft = input.draft ? checkMessage(input.draft) : null;

  let context;
  if (input.conversationId) {
    const opened = await new MessagingService().open(input.conversationId, viewer);
    if (!opened.ok) return { ok: false, error: opened.error };
    context = {
      audience: opened.value.conversation.kind === 'customer' ? ('customer' as const) : ('colleague' as const),
      subject: opened.value.conversation.subject,
      messages: opened.value.messages,
      draft: draft?.ok ? draft.value : undefined,
      writerName: me.name.split(' ')[0]
    };
  } else {
    context = {
      audience: input.audience === 'colleague' ? ('colleague' as const) : ('customer' as const),
      subject: (input.subject ?? '').slice(0, 120) || 'your message',
      messages: [],
      draft: draft?.ok ? draft.value : undefined,
      writerName: me.name.split(' ')[0]
    };
  }
  const result = await new AiAssistantService().help(input.task, context);
  if (!result) return { ok: false, error: input.task === 'improve' ? 'Write something first, then improve it.' : 'Nothing to work on yet.' };
  if (result.source === 'basic' && input.task === 'translate') return { ok: false, error: 'Translation needs AI, which is off.' };
  return { ok: true, ...result };
}

export async function assignConversation(formData: FormData): Promise<void> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return;
  const { viewer } = messengerFor(auth.principal);
  const id = String(formData.get('conversationId') ?? '');
  const allowed = await directoryForPrincipal(auth.principal);
  const ownerId = String(formData.get('ownerUserId') ?? '');
  const { me } = messengerFor(auth.principal);
  const pick = ownerId === me.userId ? me : allowed.find((entry) => entry.appointment.userId === ownerId);
  if (!pick) return;
  const owner = 'appointment' in pick ? { userId: pick.appointment.userId, name: pick.appointment.userName } : pick;
  await new MessagingService().assign(id, viewer, owner);
  revalidatePath(`/dashboard/messages/${id}`);
}

export async function setConversationStatus(formData: FormData): Promise<void> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return;
  const { viewer } = messengerFor(auth.principal);
  const id = String(formData.get('conversationId') ?? '');
  const status = formData.get('status') === 'closed' ? 'closed' : 'open';
  await new MessagingService().setStatus(id, viewer, status);
  revalidatePath(`/dashboard/messages/${id}`);
  revalidatePath('/dashboard/messages');
}

/** Make a new private link for the customer; the old one stops working. The new one is shown once. */
export async function replaceLink(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const { viewer } = messengerFor(auth.principal);
  const id = String(formData.get('conversationId') ?? '');
  const link = newCustomerLink();
  const result = await new MessagingService().replaceCustomerLink(id, viewer, link.hash);
  if (!result.ok) return fail('No new link', result.error);
  return ok('New link made', 'Send this to the customer. The old link no longer works.', { link: link.url });
}
