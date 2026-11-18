import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SECOND_ESCALATION_HOURS,
  SECTION_FLOWS,
  SERVICE_PROMISE,
  canSeeFollowUp,
  dueAt,
  escalationLevel,
  findStaffRole,
  flowHours,
  followUpId,
  ladderLabel,
  ladderRank,
  nextStep,
  queueFor,
  standingFor,
  stepOf,
  type FollowUp,
  type FollowUpViewer
} from "../src";

const appDir = join(__dirname, "..", "..", "..", "apps", "admin", "src", "app");
const at = (iso: string) => new Date(iso);
const item = (extra: Partial<FollowUp> = {}): FollowUp => ({
  id: followUpId("claims", "CLM-1", "acknowledge"),
  area: "claims",
  reference: "CLM-1",
  subject: "Jane Doe",
  stepId: "acknowledge",
  ownerUserId: "staff-agent",
  ownerName: "Agent A",
  openedAt: "2026-11-10T06:00:00.000Z",
  ...extra
});
const agent: FollowUpViewer = { userIds: ["staff-agent"], roleIds: ["role-agent"], isPlatformOwner: false };
const otherAgent: FollowUpViewer = { userIds: ["staff-other"], roleIds: ["role-agent"], isPlatformOwner: false };
const manager: FollowUpViewer = { userIds: ["staff-mgr"], roleIds: ["role-claims-manager"], isPlatformOwner: false };
const admin: FollowUpViewer = { userIds: ["staff-adm"], roleIds: ["role-platform-admin"], isPlatformOwner: false };
const owner: FollowUpViewer = { userIds: [], roleIds: [], isPlatformOwner: true };

describe("section flows", () => {
  it("are well formed: real pages, real roles, ordered steps with a time limit", () => {
    expect(SECTION_FLOWS.map((flow) => flow.area).sort()).toEqual(["claims", "customers", "documents", "policies"]);
    for (const flow of SECTION_FLOWS) {
      expect(existsSync(join(appDir, ...flow.href.split("/").filter(Boolean), "page.tsx")), flow.href).toBe(true);
      expect(flow.steps.length).toBeGreaterThan(0);
      expect(new Set(flow.steps.map((step) => step.id)).size).toBe(flow.steps.length);
      for (const step of flow.steps) {
        expect(step.respondWithinHours).toBeGreaterThanOrEqual(4);
        expect(step.respondWithinHours).toBeLessThanOrEqual(24);
      }
      for (const role of flow.ladder.flat()) expect(findStaffRole(role), role).toBeTruthy();
      expect(flow.ladder[0].length).toBeGreaterThan(0);
      expect(flow.ladder[1]).toContain("role-platform-admin");
    }
  });

  it("keeps the service promise: a policy in 24 hours, a claim decision in 48", () => {
    // Acknowledgement is well inside the draft guidelines' two working days.
    expect(stepOf(item()).step.respondWithinHours).toBe(4);
    expect(flowHours("policies")).toBeLessThanOrEqual(SERVICE_PROMISE.policyHours);
    // From complete documents to the decision handed over.
    expect(flowHours("claims", "documents")).toBeLessThanOrEqual(SERVICE_PROMISE.claimDecisionHours);
    // A step that escalates still leaves the administrator time inside the promise.
    expect(SECOND_ESCALATION_HOURS).toBeLessThanOrEqual(4);
  });

  it("names the ladder in plain words", () => {
    expect(ladderLabel("claims", (id) => findStaffRole(id)?.name ?? id)).toBe("Claims Manager, then Platform Admin");
  });
});

describe("escalation", () => {
  it("stays with the owner until the time runs out, then climbs one level at a time", () => {
    expect(dueAt(item()).toISOString()).toBe("2026-11-10T10:00:00.000Z");
    expect(escalationLevel(item(), at("2026-11-10T10:00:00Z"))).toBe(0);
    expect(escalationLevel(item(), at("2026-11-10T10:00:01Z"))).toBe(1);
    expect(escalationLevel(item(), at("2026-11-10T14:00:00Z"))).toBe(1);
    expect(escalationLevel(item(), at("2026-11-10T14:00:01Z"))).toBe(2);
  });

  it("never escalates a follow-up that was answered", () => {
    expect(escalationLevel(item({ respondedAt: "2026-11-11T06:00:00.000Z" }), at("2026-12-01T00:00:00Z"))).toBe(0);
  });

  it("shows a follow-up only to its owner and the area's supervisors", () => {
    expect(canSeeFollowUp(agent, item())).toBe(true);
    expect(canSeeFollowUp(otherAgent, item())).toBe(false);
    expect(canSeeFollowUp(manager, item())).toBe(true);
    expect(canSeeFollowUp(admin, item())).toBe(true);
    expect(canSeeFollowUp(owner, item())).toBe(true);
    // A claims manager does not supervise new customers.
    expect(canSeeFollowUp(manager, item({ area: "customers", stepId: "confirm" }))).toBe(false);
    expect(ladderRank(manager, "claims")).toBe(1);
    expect(ladderRank(admin, "claims")).toBe(2);
    expect(ladderRank(agent, "claims")).toBe(0);
  });

  it("puts a late follow-up in front of the right level", () => {
    const onTime = at("2026-11-10T08:00:00Z");
    const late = at("2026-11-10T12:00:00Z");
    const veryLate = at("2026-11-20T06:00:00Z");
    expect(standingFor(agent, item(), onTime)).toBe("yours");
    expect(standingFor(manager, item(), onTime)).toBe("watching");
    expect(standingFor(manager, item(), late)).toBe("escalated-to-you");
    expect(standingFor(admin, item(), late)).toBe("watching");
    expect(standingFor(admin, item(), veryLate)).toBe("escalated-to-you");
    expect(standingFor(owner, item(), veryLate)).toBe("escalated-to-you");
    expect(standingFor(manager, item(), veryLate)).toBe("watching");
    // The owner still sees it as theirs, however late.
    expect(standingFor(agent, item(), veryLate)).toBe("yours");
    expect(standingFor(otherAgent, item(), veryLate)).toBeNull();
  });

  it("orders a queue: escalated to you first, then your own, oldest due first; answered ones drop out", () => {
    const items = [
      item({ id: "a", reference: "CLM-A", openedAt: "2026-11-12T22:00:00.000Z", ownerUserId: "staff-mgr" }),
      item({ id: "b", reference: "CLM-B", openedAt: "2026-11-01T06:00:00.000Z" }),
      item({ id: "c", reference: "CLM-C", openedAt: "2026-11-12T18:00:00.000Z" }),
      item({ id: "d", reference: "CLM-D", respondedAt: "2026-11-11T00:00:00.000Z" })
    ];
    const queue = queueFor(manager, items, at("2026-11-13T00:00:00Z"));
    expect(queue.map((line) => `${line.item.reference}:${line.standing}:${line.level}`)).toEqual([
      "CLM-C:escalated-to-you:1",
      "CLM-A:yours:0",
      "CLM-B:watching:2"
    ]);
    expect(queue[0]).toMatchObject({ stepNumber: 1, stepTotal: 5, confirm: "Acknowledged" });
    expect(queueFor(otherAgent, items, at("2026-11-13T00:00:00Z"))).toEqual([]);
  });

  it("walks the claim flow in order and stops at the end", () => {
    const order = ["acknowledge"];
    let current = item();
    for (let step = nextStep(current); step; step = nextStep(current)) {
      order.push(step.id);
      current = item({ stepId: step.id });
    }
    expect(order).toEqual(["acknowledge", "documents", "review", "decide", "close"]);
    expect(nextStep(item({ area: "customers", stepId: "confirm" }))).toBeNull();
  });
});
