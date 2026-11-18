import {
  canSeeFollowUp,
  flowFor,
  followUpId,
  nextStep,
  queueFor,
  type FlowArea,
  type FollowUp,
  type FollowUpViewer,
  type QueueLine
} from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface OpenFollowUpInput {
  area: FlowArea;
  reference: string;
  subject: string;
  ownerUserId: string;
  ownerName: string;
  /** Defaults to the first step of the area's flow. */
  stepId?: string;
}

export type RespondResult =
  | { ok: true; done: FollowUp; next: FollowUp | null }
  | { ok: false; error: string };

/**
 * Follow-ups: who owes the next step on a record, by when, and who it goes to
 * if they do not respond. Records confirmations only; moves no money and
 * decides nothing.
 */
export class FollowUpService {
  private get repo() {
    return getPersistence().followUps;
  }

  /** Open a step. Opening the same step for the same record twice keeps the first. */
  async open(input: OpenFollowUpInput, now: Date = new Date()): Promise<FollowUp> {
    const stepId = input.stepId ?? flowFor(input.area).steps[0]!.id;
    const id = followUpId(input.area, input.reference, stepId);
    const existing = await this.repo.findById(id);
    if (existing) return existing;
    return this.repo.insert({
      id,
      area: input.area,
      reference: input.reference,
      subject: input.subject,
      stepId,
      ownerUserId: input.ownerUserId,
      ownerName: input.ownerName,
      openedAt: now.toISOString()
    });
  }

  /** The viewer's open follow-ups, most urgent first. */
  async queue(viewer: FollowUpViewer, now: Date = new Date()): Promise<QueueLine[]> {
    const open = await this.repo.findWhere((item) => !item.respondedAt);
    return queueFor(viewer, open, now);
  }

  /** Every open follow-up that has escalated, for an operations overview (no actions). */
  async escalated(now: Date = new Date()): Promise<QueueLine[]> {
    const open = await this.repo.findWhere((item) => !item.respondedAt);
    const everyone: FollowUpViewer = { userIds: [], roleIds: [], isPlatformOwner: true };
    return queueFor(everyone, open, now).filter((line) => line.level > 0);
  }

  /**
   * Confirm a step. Only the owner or a supervisor of the area may; the check
   * is made here, on the stored record. Opens the next step, if there is one,
   * for the same owner.
   */
  async respond(
    id: string,
    viewer: FollowUpViewer,
    responder: { userId: string; name: string },
    now: Date = new Date()
  ): Promise<RespondResult> {
    const item = await this.repo.findById(id);
    if (!item || !canSeeFollowUp(viewer, item)) return { ok: false, error: "That follow-up is not one of yours." };
    if (item.respondedAt) return { ok: false, error: "Someone has already confirmed that step." };
    const done = await this.repo.update(id, {
      respondedAt: now.toISOString(),
      respondedBy: responder.userId,
      respondedByName: responder.name
    });
    if (!done) return { ok: false, error: "That follow-up could not be updated." };
    const following = nextStep(item);
    const next = following
      ? await this.open(
          {
            area: item.area,
            reference: item.reference,
            subject: item.subject,
            ownerUserId: item.ownerUserId,
            ownerName: item.ownerName,
            stepId: following.id
          },
          now
        )
      : null;
    return { ok: true, done, next };
  }

  /** Counts for the home page. */
  async counts(viewer: FollowUpViewer, now: Date = new Date()): Promise<{ yours: number; escalated: number; late: number }> {
    const queue = await this.queue(viewer, now);
    return {
      yours: queue.filter((line) => line.standing === "yours").length,
      escalated: queue.filter((line) => line.standing === "escalated-to-you").length,
      late: queue.filter((line) => line.standing === "yours" && line.level > 0).length
    };
  }
}
