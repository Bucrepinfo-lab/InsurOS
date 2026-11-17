import { describe, expect, it } from "vitest";
import type { FollowUpViewer } from "@insuros/domain";
import { FollowUpService } from "../src";

const service = new FollowUpService();
const at = (iso: string) => new Date(iso);
const agent: FollowUpViewer = { userIds: ["fu-agent"], roleIds: ["role-agent"], isPlatformOwner: false };
const stranger: FollowUpViewer = { userIds: ["fu-other"], roleIds: ["role-agent"], isPlatformOwner: false };
const manager: FollowUpViewer = { userIds: ["fu-mgr"], roleIds: ["role-claims-manager"], isPlatformOwner: false };
const open = (reference: string, when: string) =>
  service.open({ area: "claims", reference, subject: "Test Holder", ownerUserId: "fu-agent", ownerName: "Agent A" }, at(when));

describe("FollowUpService", () => {
  it("opens the first step once, however often it is asked", async () => {
    const first = await open("FU-CLM-1", "2032-01-05T06:00:00Z");
    const again = await open("FU-CLM-1", "2032-01-09T06:00:00Z");
    expect(first.stepId).toBe("acknowledge");
    expect(again.openedAt).toBe(first.openedAt);
  });

  it("escalates to the supervisor when the owner does not respond", async () => {
    await open("FU-CLM-2", "2032-02-01T06:00:00Z");
    const early = await service.queue(manager, at("2032-02-02T06:00:00Z"));
    expect(early.find((line) => line.item.reference === "FU-CLM-2")?.standing).toBe("watching");
    const late = await service.queue(manager, at("2032-02-03T07:00:00Z"));
    expect(late.find((line) => line.item.reference === "FU-CLM-2")).toMatchObject({ standing: "escalated-to-you", level: 1 });
    expect((await service.escalated(at("2032-02-03T07:00:00Z"))).some((line) => line.item.reference === "FU-CLM-2")).toBe(true);
    expect((await service.counts(agent, at("2032-02-03T07:00:00Z"))).late).toBeGreaterThanOrEqual(1);
  });

  it("refuses a response from someone who is neither the owner nor a supervisor", async () => {
    const item = await open("FU-CLM-3", "2032-03-01T06:00:00Z");
    const result = await service.respond(item.id, stranger, { userId: "fu-other", name: "Other" }, at("2032-03-01T07:00:00Z"));
    expect(result).toEqual({ ok: false, error: "That follow-up is not one of yours." });
    expect((await service.queue(stranger, at("2032-03-01T07:00:00Z"))).some((line) => line.item.reference === "FU-CLM-3")).toBe(false);
  });

  it("confirms a step, opens the next one for the same owner, and will not confirm twice", async () => {
    const item = await open("FU-CLM-4", "2032-04-01T06:00:00Z");
    const result = await service.respond(item.id, manager, { userId: "fu-mgr", name: "Manager M" }, at("2032-04-04T06:00:00Z"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.done).toMatchObject({ respondedBy: "fu-mgr", respondedByName: "Manager M" });
    expect(result.next).toMatchObject({ stepId: "documents", ownerUserId: "fu-agent", openedAt: "2032-04-04T06:00:00.000Z" });
    const twice = await service.respond(item.id, agent, { userId: "fu-agent", name: "Agent A" });
    expect(twice).toEqual({ ok: false, error: "Someone has already confirmed that step." });
  });

  it("finishes a one-step flow with nothing left open", async () => {
    const item = await service.open(
      { area: "customers", reference: "FU-CUS-1", subject: "New Customer", ownerUserId: "fu-agent", ownerName: "Agent A" },
      at("2032-05-01T06:00:00Z")
    );
    const result = await service.respond(item.id, agent, { userId: "fu-agent", name: "Agent A" }, at("2032-05-01T08:00:00Z"));
    expect(result.ok && result.next).toBeNull();
    expect((await service.queue(agent, at("2032-05-01T09:00:00Z"))).some((line) => line.item.reference === "FU-CUS-1")).toBe(false);
  });
});
