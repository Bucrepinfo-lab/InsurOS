import { ADMIN_LEVEL_RANK, type AdminAppointment, type AdminRegion } from "./admin-hierarchy";
import { isWithinJurisdiction } from "./jurisdiction-access";
import { flowFor, ladderRank, type FlowArea, type FollowUpViewer } from "./follow-up";

/**
 * Messaging — PURE.
 *
 * Two kinds of conversation:
 * - colleagues: staff to staff, following the administrative hierarchy (your
 *   supervisors, your team, your peers). Private to its participants.
 * - customer: a customer and the member of staff who owns their matter (the
 *   agent, or the claims officer for a claim). The customer reaches it through
 *   a private link, with no account. If the owner does not reply in time it
 *   goes to the supervisor for that area, then to the administrator, as
 *   follow-ups do.
 *
 * No message is ever sent by software on its own: AI may draft, a person sends.
 */
export type ConversationKind = "colleagues" | "customer";
export type ConversationTopic = "claim" | "policy" | "general";

export const TOPIC_LABELS: Record<ConversationTopic, string> = {
  claim: "A claim",
  policy: "A policy",
  general: "Something else"
};

/** Which supervisor ladder a customer conversation climbs. */
const TOPIC_AREA: Record<ConversationTopic, FlowArea> = { claim: "claims", policy: "policies", general: "customers" };

export function topicArea(topic: ConversationTopic): FlowArea {
  return TOPIC_AREA[topic];
}

export interface Participant {
  userId: string;
  name: string;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  topic: ConversationTopic;
  subject: string;
  /** Claim or policy number, when there is one. */
  reference?: string;
  /** Staff in the conversation. For a customer conversation: the owner and anyone added. */
  participants: Participant[];
  /** Customer conversations: the member of staff who answers. Unset = waiting for a supervisor to assign. */
  ownerUserId?: string;
  ownerName?: string;
  customerName?: string;
  /** How to call the customer back, as they gave it. Shown to staff who can see the conversation. */
  customerContact?: string;
  /** SHA-256 of the customer's private link token. The token itself is never stored. */
  customerAccessHash?: string;
  status: "open" | "closed";
  createdAt: string;
  createdBy: string;
  lastMessageAt: string;
  /** Set when the other side is waiting for staff: a customer wrote, or a colleague wrote to you. */
  awaitingSince?: string;
  /** Who is waiting: the customer, or the staff id of the colleague who wrote last. */
  awaitingFrom?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  author: { kind: "staff" | "customer"; id: string; name: string };
  body: string;
  createdAt: string;
  /** The person used the AI helper while writing it. They still wrote and sent it. */
  aiAssisted?: boolean;
}

/** Hours staff have to answer a customer before a supervisor sees it as late. */
export const CUSTOMER_REPLY_HOURS = 4;
/** Hours after that before it goes to the administrator. */
export const CUSTOMER_SECOND_ESCALATION_HOURS = 4;
/** Hours a colleague's message waits before it is shown as late. Colleague messages do not escalate. */
export const COLLEAGUE_REPLY_HOURS = 8;

export const MESSAGE_MAX = 2000;
export const SUBJECT_MAX = 120;

const HOUR = 3_600_000;

export type MessageCheck = { ok: true; value: string } | { ok: false; error: string };

/** Tidy and check a message body. */
export function checkMessage(raw: unknown): MessageCheck {
  if (typeof raw !== "string") return { ok: false, error: "Write a message." };
  const body = raw.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (body.length === 0) return { ok: false, error: "Write a message." };
  if (body.length > MESSAGE_MAX) return { ok: false, error: `Keep a message under ${MESSAGE_MAX} characters.` };
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(body)) return { ok: false, error: "The message has characters that cannot be shown." };
  return { ok: true, value: body };
}

export function checkSubject(raw: unknown): MessageCheck {
  const subject = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (subject.length < 3) return { ok: false, error: "Give the conversation a short subject." };
  if (subject.length > SUBJECT_MAX) return { ok: false, error: `Keep the subject under ${SUBJECT_MAX} characters.` };
  return { ok: true, value: subject };
}

/** 0 = within time, 1 = late (customer: with the supervisor), 2 = very late (customer: with the administrator). */
export function lateness(conversation: Conversation, now: Date): 0 | 1 | 2 {
  if (!conversation.awaitingSince || conversation.status === "closed") return 0;
  const waited = now.getTime() - new Date(conversation.awaitingSince).getTime();
  if (conversation.kind === "colleagues") return waited > COLLEAGUE_REPLY_HOURS * HOUR ? 1 : 0;
  if (waited <= CUSTOMER_REPLY_HOURS * HOUR) return 0;
  return waited > (CUSTOMER_REPLY_HOURS + CUSTOMER_SECOND_ESCALATION_HOURS) * HOUR ? 2 : 1;
}

/** When a reply is due, or null when nobody is waiting. */
export function replyDueAt(conversation: Conversation): Date | null {
  if (!conversation.awaitingSince) return null;
  const hours = conversation.kind === "colleagues" ? COLLEAGUE_REPLY_HOURS : CUSTOMER_REPLY_HOURS;
  return new Date(new Date(conversation.awaitingSince).getTime() + hours * HOUR);
}

const isParticipant = (viewer: FollowUpViewer, conversation: Conversation) =>
  conversation.participants.some((participant) => viewer.userIds.includes(participant.userId)) ||
  (conversation.ownerUserId !== undefined && viewer.userIds.includes(conversation.ownerUserId));

/**
 * Least privilege: colleague conversations are private to their participants.
 * A customer conversation is seen by its owner and participants, and by the
 * supervisors and administrators of its area (who must be able to step in).
 */
export function canSeeConversation(viewer: FollowUpViewer, conversation: Conversation): boolean {
  if (isParticipant(viewer, conversation)) return true;
  if (conversation.kind === "colleagues") return false;
  return ladderRank(viewer, topicArea(conversation.topic)) > 0;
}

/** Who may reply: anyone who can see it. A supervisor replying on a late customer conversation is the point. */
export const canReply = canSeeConversation;

/** Whose turn it is from this viewer's point of view. */
export type InboxStanding = "waiting-on-you" | "escalated-to-you" | "waiting-on-them" | "watching";

export function inboxStanding(viewer: FollowUpViewer, conversation: Conversation, now: Date): InboxStanding {
  const mine = isParticipant(viewer, conversation);
  const waitingOnStaff =
    conversation.awaitingSince !== undefined &&
    conversation.status === "open" &&
    !(conversation.awaitingFrom && viewer.userIds.includes(conversation.awaitingFrom));
  if (conversation.kind === "customer" && waitingOnStaff) {
    const level = lateness(conversation, now);
    const rank = ladderRank(viewer, topicArea(conversation.topic));
    if (level > 0 && rank === level) return "escalated-to-you";
    // Nobody assigned yet: the area's supervisors own it from the start.
    if (!conversation.ownerUserId && rank === 1) return "escalated-to-you";
  }
  if (mine && waitingOnStaff) return "waiting-on-you";
  return mine ? "waiting-on-them" : "watching";
}

export interface InboxLine {
  conversation: Conversation;
  standing: InboxStanding;
  late: 0 | 1 | 2;
}

const STANDING_ORDER: Record<InboxStanding, number> = {
  "escalated-to-you": 0,
  "waiting-on-you": 1,
  "waiting-on-them": 2,
  watching: 3
};

/** The viewer's inbox: what is waiting on them first, oldest wait first; then the rest, newest first. */
export function inboxFor(viewer: FollowUpViewer, conversations: readonly Conversation[], now: Date): InboxLine[] {
  return conversations
    .filter((conversation) => canSeeConversation(viewer, conversation))
    .map((conversation) => ({ conversation, standing: inboxStanding(viewer, conversation, now), late: lateness(conversation, now) }))
    .sort((a, b) => {
      const order = STANDING_ORDER[a.standing] - STANDING_ORDER[b.standing];
      if (order !== 0) return order;
      if (a.standing === "escalated-to-you" || a.standing === "waiting-on-you") {
        return (a.conversation.awaitingSince ?? "").localeCompare(b.conversation.awaitingSince ?? "");
      }
      return b.conversation.lastMessageAt.localeCompare(a.conversation.lastMessageAt);
    });
}

/**
 * The state of a conversation after a message. Staff answering clears the
 * wait; a customer writing starts (or keeps) it; a colleague writing starts a
 * wait for the others.
 */
export function afterMessage(conversation: Conversation, message: Message): Partial<Conversation> {
  const base = { lastMessageAt: message.createdAt };
  if (message.author.kind === "customer") {
    return { ...base, awaitingSince: conversation.awaitingFrom === "customer" ? conversation.awaitingSince ?? message.createdAt : message.createdAt, awaitingFrom: "customer", status: "open" };
  }
  if (conversation.kind === "customer") return { ...base, awaitingSince: undefined, awaitingFrom: undefined };
  return { ...base, awaitingSince: message.createdAt, awaitingFrom: message.author.id };
}

/* ------------------------------------------------------------ hierarchy */

export type DirectoryGroup = "supervisors" | "team" | "peers" | "others";

export const DIRECTORY_LABELS: Record<DirectoryGroup, string> = {
  supervisors: "Your supervisors",
  team: "Your team",
  peers: "Colleagues at your level",
  others: "Everyone else"
};

export interface DirectoryEntry {
  appointment: AdminAppointment;
  group: DirectoryGroup;
}

/**
 * Who a member of staff may start a conversation with, by the hierarchy of
 * administration: their supervisors (a higher level whose region covers
 * theirs), their team (a lower level inside their region) and their peers
 * (same level, same region). The top level (SuperAdmin) and the platform
 * owner may reach everyone. Others are not listed.
 */
export function directoryFor(
  me: AdminAppointment | null,
  appointments: readonly AdminAppointment[],
  regions: readonly AdminRegion[],
  options: { isPlatformOwner?: boolean } = {}
): DirectoryEntry[] {
  const active = appointments.filter((appointment) => appointment.status === "Active" && appointment.userId !== me?.userId);
  const everyone = options.isPlatformOwner || me?.level === "SuperAdmin";
  const entries: DirectoryEntry[] = [];
  for (const appointment of active) {
    let group: DirectoryGroup | null = null;
    if (me) {
      const mine = ADMIN_LEVEL_RANK[me.level];
      const theirs = ADMIN_LEVEL_RANK[appointment.level];
      if (theirs > mine && isWithinJurisdiction(appointment.regionId, me.regionId, [...regions])) group = "supervisors";
      else if (theirs < mine && isWithinJurisdiction(me.regionId, appointment.regionId, [...regions])) group = "team";
      else if (theirs === mine && appointment.regionId === me.regionId) group = "peers";
    }
    if (!group && everyone) group = "others";
    if (group) entries.push({ appointment, group });
  }
  const order: DirectoryGroup[] = ["supervisors", "team", "peers", "others"];
  return entries.sort(
    (a, b) =>
      order.indexOf(a.group) - order.indexOf(b.group) ||
      ADMIN_LEVEL_RANK[b.appointment.level] - ADMIN_LEVEL_RANK[a.appointment.level] ||
      a.appointment.userName.localeCompare(b.appointment.userName)
  );
}

/** Plain words for who answers when a customer conversation escalates. */
export function escalationPath(topic: ConversationTopic, roleName: (roleId: string) => string): string {
  const [first, second] = flowFor(topicArea(topic)).ladder;
  return `${first.map(roleName).join(" or ")}, then ${second.map(roleName).join(" or ")}`;
}
