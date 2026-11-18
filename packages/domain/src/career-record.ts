import { ADMIN_LEVEL_RANK, type AdminAppointment, type AdminRegion } from "./admin-hierarchy";
import { findStaffRole } from "./access-control";
import type { Conversation, Message } from "./messaging";
import type { FollowUp } from "./follow-up";
import { dueAt } from "./follow-up";

/**
 * A member of staff's career record — PURE.
 *
 * Built only from what they did in InsurOS: where they worked and in which
 * role, the customers, policies and claims they handled, and how promptly
 * they answered. Nothing is typed in by hand, so it can be trusted, and it
 * downloads as a PDF they can take to their next job.
 */
export interface CareerRole {
  role: string;
  level: string;
  region: string;
  from: string;
  status: string;
}

export interface CareerFigures {
  customers: number;
  policies: number;
  premium: number;
  claimsRegistered: number;
  claimsHandled: number;
  stepsConfirmed: number;
  stepsOnTime: number;
  customerReplies: number;
  customerRepliesWithin4h: number;
}

export interface CareerRecord {
  name: string;
  company: string;
  since: string | null;
  roles: CareerRole[];
  figures: CareerFigures;
  /** Plain sentences of what they achieved, from the figures. */
  highlights: string[];
}

const kesNumber = (text: string) => Number(text.replace(/[^\d.]/g, "")) || 0;

export function buildCareerRecord(input: {
  name: string;
  company: string;
  userIds: string[];
  appointments: readonly AdminAppointment[];
  regions: readonly AdminRegion[];
  customers: readonly { ownerUserId?: string }[];
  policies: readonly { ownerUserId?: string; premium: string }[];
  claims: readonly { registeredByUserId?: string; assignedToUserId?: string }[];
  followUps: readonly FollowUp[];
  conversations: readonly Conversation[];
  messages: readonly Message[];
}): CareerRecord {
  const mine = (id?: string) => id !== undefined && input.userIds.includes(id);
  const roles = input.appointments
    .filter((appointment) => mine(appointment.userId))
    .sort((a, b) => b.appointedAt.localeCompare(a.appointedAt) || ADMIN_LEVEL_RANK[b.level] - ADMIN_LEVEL_RANK[a.level])
    .map((appointment) => ({
      role: findStaffRole(appointment.roleId)?.name ?? appointment.roleId,
      level: appointment.level,
      region: input.regions.find((region) => region.id === appointment.regionId)?.name ?? appointment.regionId,
      from: appointment.appointedAt,
      status: appointment.status
    }));

  const policies = input.policies.filter((policy) => mine(policy.ownerUserId));
  const confirmed = input.followUps.filter((item) => mine(item.respondedBy) && item.respondedAt);
  const onTime = confirmed.filter((item) => new Date(item.respondedAt!).getTime() <= dueAt(item).getTime());

  // Customer replies: each reply by this person that answered a waiting customer message.
  let replies = 0;
  let within = 0;
  const byConversation = new Map<string, Message[]>();
  for (const message of input.messages) byConversation.set(message.conversationId, [...(byConversation.get(message.conversationId) ?? []), message]);
  for (const conversation of input.conversations.filter((c) => c.kind === "customer")) {
    const thread = (byConversation.get(conversation.id) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let waitingSince: string | null = null;
    for (const message of thread) {
      if (message.author.kind === "customer") waitingSince ??= message.createdAt;
      else {
        if (waitingSince && mine(message.author.id)) {
          replies += 1;
          if (new Date(message.createdAt).getTime() - new Date(waitingSince).getTime() <= 4 * 3_600_000) within += 1;
        }
        waitingSince = null;
      }
    }
  }

  const figures: CareerFigures = {
    customers: input.customers.filter((customer) => mine(customer.ownerUserId)).length,
    policies: policies.length,
    premium: policies.reduce((sum, policy) => sum + kesNumber(policy.premium), 0),
    claimsRegistered: input.claims.filter((claim) => mine(claim.registeredByUserId)).length,
    claimsHandled: input.claims.filter((claim) => mine(claim.assignedToUserId)).length,
    stepsConfirmed: confirmed.length,
    stepsOnTime: onTime.length,
    customerReplies: replies,
    customerRepliesWithin4h: within
  };

  const pct = (part: number, whole: number) => Math.round((part / whole) * 100);
  const highlights: string[] = [];
  if (figures.policies > 0) highlights.push(`Placed ${figures.policies} ${figures.policies === 1 ? "policy" : "policies"} worth KES ${figures.premium.toLocaleString("en-GB")} in premium.`);
  if (figures.customers > 0) highlights.push(`Brought in and looked after ${figures.customers} ${figures.customers === 1 ? "customer" : "customers"}.`);
  if (figures.claimsRegistered + figures.claimsHandled > 0) highlights.push(`Registered ${figures.claimsRegistered} and handled ${figures.claimsHandled} claims.`);
  if (figures.stepsConfirmed >= 5) highlights.push(`Completed ${pct(figures.stepsOnTime, figures.stepsConfirmed)}% of ${figures.stepsConfirmed} workflow steps within their time limit.`);
  if (figures.customerReplies >= 5) highlights.push(`Answered customers within 4 hours ${pct(figures.customerRepliesWithin4h, figures.customerReplies)}% of the time (${figures.customerReplies} replies).`);

  const since = roles.length ? roles.map((role) => role.from).sort()[0]! : null;
  return { name: input.name, company: input.company, since, roles, figures, highlights };
}
