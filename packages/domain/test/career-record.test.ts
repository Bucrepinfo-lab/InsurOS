import { describe, expect, it } from "vitest";
import { buildCareerRecord, type AdminAppointment, type Conversation, type FollowUp, type Message } from "../src";

const appt = (extra: Partial<AdminAppointment>): AdminAppointment =>
  ({ id: "a", userId: "me", userName: "Agent A", email: "", regionId: "nbi", level: "County", roleId: "role-agent", appointedBy: "x", appointedAt: "2026-01-10", status: "Active", ...extra }) as AdminAppointment;
const msg = (conversationId: string, kind: "staff" | "customer", id: string, createdAt: string): Message => ({ id: createdAt, conversationId, author: { kind, id, name: id }, body: "x", createdAt });

describe("career record", () => {
  const record = buildCareerRecord({
    name: "Agent A",
    company: "Telpen Insurance Agency",
    userIds: ["me"],
    appointments: [appt({}), appt({ id: "b", level: "Constituency", appointedAt: "2025-06-01", status: "Revoked" }), appt({ id: "c", userId: "someone-else" })],
    regions: [{ id: "nbi", name: "Nairobi" } as never],
    customers: [{ ownerUserId: "me" }, { ownerUserId: "me" }, { ownerUserId: "other" }],
    policies: [{ ownerUserId: "me", premium: "KES 42,000" }, { ownerUserId: "me", premium: "KES 8,000" }, { ownerUserId: "other", premium: "KES 1" }],
    claims: [{ registeredByUserId: "me" }, { assignedToUserId: "me" }, { assignedToUserId: "me" }],
    followUps: Array.from({ length: 6 }, (_, i): FollowUp => ({
      id: `f${i}`,
      area: "customers",
      reference: `C${i}`,
      subject: "s",
      stepId: "confirm",
      ownerUserId: "me",
      ownerName: "A",
      openedAt: "2026-02-01T06:00:00.000Z",
      respondedBy: "me",
      respondedAt: i < 5 ? "2026-02-01T07:00:00.000Z" : "2026-02-02T07:00:00.000Z"
    })),
    conversations: [{ id: "c1", kind: "customer" } as Conversation, { id: "c2", kind: "colleagues" } as Conversation],
    messages: [
      msg("c1", "customer", "customer", "2026-03-01T06:00:00.000Z"),
      msg("c1", "customer", "customer", "2026-03-01T06:30:00.000Z"),
      msg("c1", "staff", "me", "2026-03-01T08:00:00.000Z"),
      msg("c1", "customer", "customer", "2026-03-02T06:00:00.000Z"),
      msg("c1", "staff", "me", "2026-03-02T12:00:00.000Z"),
      msg("c2", "staff", "me", "2026-03-02T12:00:00.000Z")
    ]
  });

  it("lists only this person's roles, newest first, from their earliest start", () => {
    expect(record.roles.map((role) => `${role.level}:${role.status}`)).toEqual(["County:Active", "Constituency:Revoked"]);
    expect(record.roles[0]).toMatchObject({ role: "Agent", region: "Nairobi" });
    expect(record.since).toBe("2025-06-01");
  });

  it("counts only their own work", () => {
    expect(record.figures).toEqual({
      customers: 2,
      policies: 2,
      premium: 50000,
      claimsRegistered: 1,
      claimsHandled: 2,
      stepsConfirmed: 6,
      stepsOnTime: 5,
      customerReplies: 2,
      customerRepliesWithin4h: 1
    });
  });

  it("states highlights in plain words, and only with enough to go on", () => {
    expect(record.highlights).toContain("Placed 2 policies worth KES 50,000 in premium.");
    expect(record.highlights).toContain("Completed 83% of 6 workflow steps within their time limit.");
    expect(record.highlights.some((h) => h.startsWith("Answered customers"))).toBe(false);
  });
});
