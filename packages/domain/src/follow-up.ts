/**
 * Follow-ups and escalation — PURE.
 *
 * Each area with real records has an ordered flow of steps. Opening a record
 * opens its first step as a follow-up with an owner and a time to respond. If
 * nobody responds in time the follow-up escalates to the supervisor role for
 * that area, and if the supervisor does not respond either, to the
 * administrator. Escalation is worked out from the clock whenever a queue is
 * read, so nothing depends on a background job having run.
 *
 * A follow-up records who confirmed a step and when. It moves no money and
 * decides no claim.
 */
export type FlowArea = "customers" | "policies" | "claims" | "documents";

export interface FlowStep {
  id: string;
  /** What has to happen, in plain words. */
  label: string;
  /** The button that confirms it. */
  confirm: string;
  /** Hours (by the clock) the owner has to respond before it escalates. */
  respondWithinHours: number;
}

export interface SectionFlow {
  area: FlowArea;
  title: string;
  /** The list this flow belongs to. */
  href: string;
  steps: FlowStep[];
  /** Supervisor role ids, first level then second. */
  ladder: [string[], string[]];
}

/** After escalating to the supervisor, hours before it goes one level higher. */
export const SECOND_ESCALATION_HOURS = 48;

export const SECTION_FLOWS: SectionFlow[] = [
  {
    area: "customers",
    title: "New customer",
    href: "/dashboard/customers",
    steps: [{ id: "confirm", label: "Confirm the customer's details", confirm: "Details confirmed", respondWithinHours: 72 }],
    ladder: [["role-underwriter"], ["role-platform-admin"]]
  },
  {
    area: "policies",
    title: "Pending policy",
    href: "/dashboard/policies",
    steps: [{ id: "complete", label: "Complete the policy and put it in force", confirm: "Policy completed", respondWithinHours: 72 }],
    ladder: [["role-underwriter"], ["role-platform-admin"]]
  },
  {
    area: "claims",
    title: "Claim",
    href: "/dashboard/claims",
    steps: [
      { id: "acknowledge", label: "Acknowledge the claim to the customer", confirm: "Acknowledged", respondWithinHours: 48 },
      { id: "documents", label: "Check the documents are complete", confirm: "Documents checked", respondWithinHours: 72 },
      { id: "review", label: "Review the claim", confirm: "Review done", respondWithinHours: 120 },
      { id: "decide", label: "Record the decision and give the customer the reasons in writing", confirm: "Decision given", respondWithinHours: 120 },
      { id: "close", label: "Close the claim", confirm: "Closed", respondWithinHours: 48 }
    ],
    ladder: [["role-claims-manager"], ["role-platform-admin"]]
  },
  {
    area: "documents",
    title: "Document needing review",
    href: "/dashboard/operations/documents",
    steps: [{ id: "review", label: "Get the missing detail and complete the record", confirm: "Record completed", respondWithinHours: 48 }],
    ladder: [["role-claims-manager", "role-operations"], ["role-platform-admin"]]
  }
];

export function flowFor(area: FlowArea): SectionFlow {
  return SECTION_FLOWS.find((flow) => flow.area === area)!;
}

export interface FollowUp {
  id: string;
  area: FlowArea;
  /** The record it is about, e.g. a claim number. */
  reference: string;
  /** A short human label, e.g. the customer's name. */
  subject: string;
  stepId: string;
  ownerUserId: string;
  ownerName: string;
  openedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  respondedByName?: string;
}

/** 0 = with its owner, 1 = escalated to the supervisor, 2 = escalated to the administrator. */
export type EscalationLevel = 0 | 1 | 2;

const HOUR = 3_600_000;

export function stepOf(item: Pick<FollowUp, "area" | "stepId">): { step: FlowStep; index: number; total: number } {
  const flow = flowFor(item.area);
  const index = Math.max(0, flow.steps.findIndex((step) => step.id === item.stepId));
  return { step: flow.steps[index]!, index, total: flow.steps.length };
}

/** When the owner's time runs out. */
export function dueAt(item: FollowUp): Date {
  return new Date(new Date(item.openedAt).getTime() + stepOf(item).step.respondWithinHours * HOUR);
}

export function escalationLevel(item: FollowUp, now: Date): EscalationLevel {
  if (item.respondedAt) return 0;
  const late = now.getTime() - dueAt(item).getTime();
  if (late <= 0) return 0;
  return late > SECOND_ESCALATION_HOURS * HOUR ? 2 : 1;
}

/** Who is looking at the queue. */
export interface FollowUpViewer {
  userIds: string[];
  roleIds: string[];
  isPlatformOwner: boolean;
}

/** The viewer's place on an area's ladder: 0 none, 1 supervisor, 2 administrator. */
export function ladderRank(viewer: FollowUpViewer, area: FlowArea): 0 | 1 | 2 {
  const [first, second] = flowFor(area).ladder;
  if (viewer.isPlatformOwner || second.some((role) => viewer.roleIds.includes(role))) return 2;
  return first.some((role) => viewer.roleIds.includes(role)) ? 1 : 0;
}

/**
 * Least privilege: a person sees the follow-ups they own; a supervisor sees
 * their area's; an administrator sees every area's.
 */
export function canSeeFollowUp(viewer: FollowUpViewer, item: FollowUp): boolean {
  return viewer.userIds.includes(item.ownerUserId) || ladderRank(viewer, item.area) > 0;
}

export type FollowUpStanding = "yours" | "escalated-to-you" | "watching";

/**
 * Why an open follow-up is in this viewer's queue: it is theirs, it has
 * escalated to their level, or they supervise the area and can see it.
 */
export function standingFor(viewer: FollowUpViewer, item: FollowUp, now: Date): FollowUpStanding | null {
  if (!canSeeFollowUp(viewer, item)) return null;
  const level = escalationLevel(item, now);
  const rank = ladderRank(viewer, item.area);
  // Level 1 is the supervisor's to answer; level 2 is the administrator's.
  if (level > 0 && rank === level) return "escalated-to-you";
  if (viewer.userIds.includes(item.ownerUserId)) return "yours";
  return "watching";
}

export interface QueueLine {
  item: FollowUp;
  standing: FollowUpStanding;
  level: EscalationLevel;
  due: string;
  stepNumber: number;
  stepTotal: number;
  stepLabel: string;
  confirm: string;
}

const STANDING_ORDER: Record<FollowUpStanding, number> = { "escalated-to-you": 0, yours: 1, watching: 2 };

/** The viewer's open follow-ups: escalated to them first, then their own, each oldest due first. */
export function queueFor(viewer: FollowUpViewer, items: readonly FollowUp[], now: Date): QueueLine[] {
  const lines: QueueLine[] = [];
  for (const item of items) {
    if (item.respondedAt) continue;
    const standing = standingFor(viewer, item, now);
    if (!standing) continue;
    const { step, index, total } = stepOf(item);
    lines.push({
      item,
      standing,
      level: escalationLevel(item, now),
      due: dueAt(item).toISOString(),
      stepNumber: index + 1,
      stepTotal: total,
      stepLabel: step.label,
      confirm: step.confirm
    });
  }
  return lines.sort(
    (a, b) => STANDING_ORDER[a.standing] - STANDING_ORDER[b.standing] || b.level - a.level || a.due.localeCompare(b.due)
  );
}

/** The step after this one, or null when the flow is finished. */
export function nextStep(item: Pick<FollowUp, "area" | "stepId">): FlowStep | null {
  const { index } = stepOf(item);
  return flowFor(item.area).steps[index + 1] ?? null;
}

export function followUpId(area: FlowArea, reference: string, stepId: string): string {
  return `${area}|${reference}|${stepId}`;
}

/** "Escalates to the Claims Manager, then the Platform Admin", from role names. */
export function ladderLabel(area: FlowArea, roleName: (roleId: string) => string): string {
  const [first, second] = flowFor(area).ladder;
  return `${first.map(roleName).join(" or ")}, then ${second.map(roleName).join(" or ")}`;
}
