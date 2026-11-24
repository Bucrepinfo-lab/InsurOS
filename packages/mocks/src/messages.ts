import type { Conversation, Message } from '@insuros/domain';

/**
 * Worked examples for Messages in the DEMO tenant only (owner 24/11/26: three
 * examples on every page, for testing). Customer conversations owned by the
 * store reviewer ("play-review"), about records in the demo book. No customer
 * link is attached (no access hash), so nothing is reachable from outside.
 */
const REVIEWER = { userId: 'play-review', name: 'Store reviewer (demo data)' };

const conversation = (
  id: string,
  topic: Conversation['topic'],
  subject: string,
  customerName: string,
  lastMessageAt: string,
  reference?: string,
  awaiting = false
): Conversation => ({
  id,
  kind: 'customer',
  topic,
  subject,
  ...(reference ? { reference } : {}),
  participants: [REVIEWER],
  ownerUserId: REVIEWER.userId,
  ownerName: REVIEWER.name,
  customerName,
  status: 'open',
  createdAt: lastMessageAt,
  createdBy: 'customer',
  lastMessageAt,
  ...(awaiting ? { awaitingSince: lastMessageAt, awaitingFrom: 'customer' } : {})
});

export const mockConversations: Conversation[] = [
  conversation('demo-conv-claim', 'claim', 'When will my claim be decided?', 'Demo Customer', '2026-11-22T08:10:00.000Z', 'CLM-2026-0001', true),
  conversation('demo-conv-policy', 'policy', 'Adding a second driver to my cover', 'Amina Hassan', '2026-11-21T12:40:00.000Z', 'POL-2026-0001'),
  conversation('demo-conv-general', 'general', 'Renewal reminder for our matatu fleet', 'Rongai Shuttle Sacco', '2026-11-20T09:05:00.000Z')
];

const customer = (name: string) => ({ kind: 'customer' as const, id: 'customer', name });
const staff = { kind: 'staff' as const, id: REVIEWER.userId, name: REVIEWER.name };

export const mockMessages: Message[] = [
  { id: 'demo-msg-1', conversationId: 'demo-conv-claim', author: customer('Demo Customer'), body: 'I sent the police abstract and photos on Monday. When will the claim be decided?', createdAt: '2026-11-22T08:10:00.000Z' },
  { id: 'demo-msg-2', conversationId: 'demo-conv-policy', author: customer('Amina Hassan'), body: 'My husband will also drive the Axio from next month. What do you need from us?', createdAt: '2026-11-21T11:55:00.000Z' },
  { id: 'demo-msg-3', conversationId: 'demo-conv-policy', author: staff, body: 'Please send a copy of his driving licence. We will add him and send the updated certificate.', createdAt: '2026-11-21T12:40:00.000Z' },
  { id: 'demo-msg-4', conversationId: 'demo-conv-general', author: staff, body: 'Your fleet cover renews on 01/12/26. Reply here if any vehicle has changed.', createdAt: '2026-11-20T09:05:00.000Z' }
];
