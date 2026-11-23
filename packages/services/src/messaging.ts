import {
  afterMessage,
  canReply,
  canSeeConversation,
  checkMessage,
  checkSubject,
  inboxFor,
  type Conversation,
  type ConversationTopic,
  type FollowUpViewer,
  type InboxLine,
  type Message,
  type Participant
} from "@insuros/domain";
import { getPersistence } from "./persistence";

export type MessagingResult<T> = { ok: true; value: T } | { ok: false; error: string };

const newId = (prefix: string, now: Date) =>
  `${prefix}-${now.getTime().toString(36)}-${Math.floor(Math.random() * 36 ** 6).toString(36).padStart(6, "0")}`;

export interface StartColleaguesInput {
  subject: unknown;
  body: unknown;
  from: Participant;
  to: Participant[];
  topic?: ConversationTopic;
  reference?: string;
  aiAssisted?: boolean;
}

export interface StartCustomerInput {
  subject: unknown;
  /** The first message: from staff, or from the customer on the contact page. */
  body: unknown;
  topic: ConversationTopic;
  reference?: string;
  customerName: string;
  customerContact?: string;
  /** SHA-256 of the private link token, made by the caller. */
  customerAccessHash: string;
  /** The member of staff who answers. Unset = the area's supervisors pick it up. */
  owner?: Participant;
  /** Who writes the first message. */
  from: { kind: "staff"; who: Participant } | { kind: "customer" };
  aiAssisted?: boolean;
}

/**
 * Conversations between staff, and between a customer and the staff who own
 * their matter. Every check of who may see or write is made here, on the
 * stored conversation.
 */
export class MessagingService {
  private get db() {
    return getPersistence();
  }

  private async append(conversation: Conversation, author: Message["author"], body: string, now: Date, aiAssisted?: boolean): Promise<Message> {
    const message: Message = {
      id: newId("msg", now),
      conversationId: conversation.id,
      author,
      body,
      createdAt: now.toISOString(),
      ...(aiAssisted ? { aiAssisted: true } : {})
    };
    await this.db.messages.insert(message);
    await this.db.conversations.update(conversation.id, afterMessage(conversation, message));
    return message;
  }

  async startColleagues(input: StartColleaguesInput, now: Date = new Date()): Promise<MessagingResult<Conversation>> {
    const subject = checkSubject(input.subject);
    if (!subject.ok) return subject;
    const body = checkMessage(input.body);
    if (!body.ok) return body;
    const others = input.to.filter((participant) => participant.userId !== input.from.userId);
    if (others.length === 0) return { ok: false, error: "Choose at least one colleague." };
    if (others.length > 20) return { ok: false, error: "A conversation can have at most 20 colleagues." };
    const conversation: Conversation = {
      id: newId("conv", now),
      kind: "colleagues",
      topic: input.topic ?? "general",
      subject: subject.value,
      ...(input.reference ? { reference: input.reference } : {}),
      participants: [input.from, ...others],
      status: "open",
      createdAt: now.toISOString(),
      createdBy: input.from.userId,
      lastMessageAt: now.toISOString()
    };
    await this.db.conversations.insert(conversation);
    await this.append(conversation, { kind: "staff", id: input.from.userId, name: input.from.name }, body.value, now, input.aiAssisted);
    return { ok: true, value: (await this.db.conversations.findById(conversation.id)) ?? conversation };
  }

  async startCustomer(input: StartCustomerInput, now: Date = new Date()): Promise<MessagingResult<Conversation>> {
    const subject = checkSubject(input.subject);
    if (!subject.ok) return subject;
    const body = checkMessage(input.body);
    if (!body.ok) return body;
    const customerName = input.customerName.trim().replace(/\s+/g, " ");
    if (customerName.length < 2 || customerName.length > 120) return { ok: false, error: "Enter the customer's name." };
    if (!/^[0-9a-f]{64}$/.test(input.customerAccessHash)) return { ok: false, error: "The private link could not be made." };
    const owner = input.owner ?? (input.from.kind === "staff" ? input.from.who : undefined);
    const conversation: Conversation = {
      id: newId("conv", now),
      kind: "customer",
      topic: input.topic,
      subject: subject.value,
      ...(input.reference ? { reference: input.reference } : {}),
      participants: owner ? [owner] : [],
      ...(owner ? { ownerUserId: owner.userId, ownerName: owner.name } : {}),
      customerName,
      ...(input.customerContact ? { customerContact: input.customerContact } : {}),
      customerAccessHash: input.customerAccessHash,
      status: "open",
      createdAt: now.toISOString(),
      createdBy: input.from.kind === "staff" ? input.from.who.userId : "customer",
      lastMessageAt: now.toISOString()
    };
    await this.db.conversations.insert(conversation);
    const author: Message["author"] =
      input.from.kind === "staff"
        ? { kind: "staff", id: input.from.who.userId, name: input.from.who.name }
        : { kind: "customer", id: "customer", name: customerName };
    await this.append(conversation, author, body.value, now, input.aiAssisted);
    return { ok: true, value: (await this.db.conversations.findById(conversation.id)) ?? conversation };
  }

  async inbox(viewer: FollowUpViewer, now: Date = new Date()): Promise<InboxLine[]> {
    return inboxFor(viewer, await this.db.conversations.findAll(), now);
  }

  /** A conversation and its messages, only if the viewer may see it. */
  async open(id: string, viewer: FollowUpViewer): Promise<MessagingResult<{ conversation: Conversation; messages: Message[] }>> {
    const conversation = await this.db.conversations.findById(id);
    if (!conversation || !canSeeConversation(viewer, conversation)) return { ok: false, error: "That conversation is not one of yours." };
    return { ok: true, value: { conversation, messages: await this.messagesOf(conversation.id) } };
  }

  async messagesOf(conversationId: string): Promise<Message[]> {
    const messages = await this.db.messages.findWhere((message) => message.conversationId === conversationId);
    return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** A member of staff replies. A supervisor who replies to a customer they do not own joins the conversation. */
  async reply(
    id: string,
    viewer: FollowUpViewer,
    who: Participant,
    rawBody: unknown,
    options: { aiAssisted?: boolean } = {},
    now: Date = new Date()
  ): Promise<MessagingResult<Message>> {
    const conversation = await this.db.conversations.findById(id);
    if (!conversation || !canReply(viewer, conversation)) return { ok: false, error: "That conversation is not one of yours." };
    if (conversation.status === "closed") return { ok: false, error: "This conversation is closed. Reopen it to reply." };
    const body = checkMessage(rawBody);
    if (!body.ok) return body;
    if (!conversation.participants.some((participant) => participant.userId === who.userId)) {
      // Build the list once: the stored row and this copy may be the same
      // object (memory store), so appending twice listed the person twice.
      const participants = [...conversation.participants, who];
      await this.db.conversations.update(id, { participants });
      conversation.participants = participants;
    }
    return { ok: true, value: await this.append(conversation, { kind: "staff", id: who.userId, name: who.name }, body.value, now, options.aiAssisted) };
  }

  /** Assign or reassign the member of staff who answers a customer conversation. */
  async assign(id: string, viewer: FollowUpViewer, owner: Participant): Promise<MessagingResult<Conversation>> {
    const conversation = await this.db.conversations.findById(id);
    if (!conversation || conversation.kind !== "customer" || !canReply(viewer, conversation)) {
      return { ok: false, error: "That conversation is not one of yours." };
    }
    const participants = conversation.participants.some((participant) => participant.userId === owner.userId)
      ? conversation.participants
      : [...conversation.participants, owner];
    const updated = await this.db.conversations.update(id, { ownerUserId: owner.userId, ownerName: owner.name, participants });
    return updated ? { ok: true, value: updated } : { ok: false, error: "Could not assign it." };
  }

  async setStatus(id: string, viewer: FollowUpViewer, status: Conversation["status"]): Promise<MessagingResult<Conversation>> {
    const conversation = await this.db.conversations.findById(id);
    if (!conversation || !canReply(viewer, conversation)) return { ok: false, error: "That conversation is not one of yours." };
    const updated = await this.db.conversations.update(id, status === "closed" ? { status, awaitingSince: undefined, awaitingFrom: undefined } : { status });
    return updated ? { ok: true, value: updated } : { ok: false, error: "Could not update it." };
  }

  /** Replace the customer's private link (the old one stops working). */
  async replaceCustomerLink(id: string, viewer: FollowUpViewer, newHash: string): Promise<MessagingResult<Conversation>> {
    const conversation = await this.db.conversations.findById(id);
    if (!conversation || conversation.kind !== "customer" || !canReply(viewer, conversation)) {
      return { ok: false, error: "That conversation is not one of yours." };
    }
    if (!/^[0-9a-f]{64}$/.test(newHash)) return { ok: false, error: "The private link could not be made." };
    const updated = await this.db.conversations.update(id, { customerAccessHash: newHash });
    return updated ? { ok: true, value: updated } : { ok: false, error: "Could not replace the link." };
  }

  /* ----- the customer's side: reached only by the hash of their private link ----- */

  async forCustomer(accessHash: string): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    if (!/^[0-9a-f]{64}$/.test(accessHash)) return null;
    const [conversation] = await this.db.conversations.findWhere(
      (candidate) => candidate.kind === "customer" && candidate.customerAccessHash === accessHash
    );
    if (!conversation) return null;
    return { conversation, messages: await this.messagesOf(conversation.id) };
  }

  /** The customer writes. At most 20 customer messages an hour, to stop flooding. A closed conversation reopens. */
  async customerReply(accessHash: string, rawBody: unknown, now: Date = new Date()): Promise<MessagingResult<Message>> {
    const found = await this.forCustomer(accessHash);
    if (!found) return { ok: false, error: "This link does not work any more. Ask your agent for a new one." };
    const body = checkMessage(rawBody);
    if (!body.ok) return body;
    const hourAgo = now.getTime() - 3_600_000;
    const recent = found.messages.filter((message) => message.author.kind === "customer" && new Date(message.createdAt).getTime() > hourAgo);
    if (recent.length >= 20) return { ok: false, error: "You have sent a lot of messages in the last hour. Please wait for a reply." };
    const message = await this.append(
      found.conversation,
      { kind: "customer", id: "customer", name: found.conversation.customerName ?? "Customer" },
      body.value,
      now
    );
    return { ok: true, value: message };
  }

  /** Counts for the home page. */
  async counts(viewer: FollowUpViewer, now: Date = new Date()): Promise<{ waiting: number; escalated: number; late: number }> {
    const inbox = await this.inbox(viewer, now);
    return {
      waiting: inbox.filter((line) => line.standing === "waiting-on-you").length,
      escalated: inbox.filter((line) => line.standing === "escalated-to-you").length,
      late: inbox.filter((line) => line.standing === "waiting-on-you" && line.late > 0).length
    };
  }
}
