import { describe, expect, it } from "vitest";
import {
  afterMessage,
  canSeeConversation,
  checkMessage,
  checkSubject,
  directoryFor,
  findStaffRole,
  escalationPath,
  inboxFor,
  inboxStanding,
  lateness,
  replyDueAt,
  type AdminAppointment,
  type AdminRegion,
  type Conversation,
  type FollowUpViewer,
  type Message
} from "../src";

const at = (iso: string) => new Date(iso);
const agent: FollowUpViewer = { userIds: ["u-agent"], roleIds: ["role-agent"], isPlatformOwner: false };
const otherAgent: FollowUpViewer = { userIds: ["u-other"], roleIds: ["role-agent"], isPlatformOwner: false };
const claimsManager: FollowUpViewer = { userIds: ["u-cm"], roleIds: ["role-claims-manager"], isPlatformOwner: false };
const underwriter: FollowUpViewer = { userIds: ["u-uw"], roleIds: ["role-underwriter"], isPlatformOwner: false };
const admin: FollowUpViewer = { userIds: ["u-admin"], roleIds: ["role-platform-admin"], isPlatformOwner: false };

const customerConv = (extra: Partial<Conversation> = {}): Conversation => ({
  id: "c1",
  kind: "customer",
  topic: "claim",
  subject: "My car claim",
  participants: [{ userId: "u-agent", name: "Agent A" }],
  ownerUserId: "u-agent",
  ownerName: "Agent A",
  customerName: "Jane Doe",
  customerAccessHash: "a".repeat(64),
  status: "open",
  createdAt: "2026-11-18T06:00:00.000Z",
  createdBy: "u-agent",
  lastMessageAt: "2026-11-18T06:00:00.000Z",
  awaitingSince: "2026-11-18T06:00:00.000Z",
  awaitingFrom: "customer",
  ...extra
});
const colleagues = (extra: Partial<Conversation> = {}): Conversation => ({
  id: "c2",
  kind: "colleagues",
  topic: "general",
  subject: "Roster",
  participants: [
    { userId: "u-agent", name: "Agent A" },
    { userId: "u-cm", name: "Manager M" }
  ],
  status: "open",
  createdAt: "2026-11-18T06:00:00.000Z",
  createdBy: "u-agent",
  lastMessageAt: "2026-11-18T06:00:00.000Z",
  ...extra
});

describe("message checks", () => {
  it("tidies and limits messages and subjects", () => {
    expect(checkMessage("  Hello \r\n\n\n\nthere  ")).toEqual({ ok: true, value: "Hello\n\nthere" });
    expect(checkMessage("   ")).toMatchObject({ ok: false });
    expect(checkMessage("x".repeat(2001))).toMatchObject({ ok: false });
    expect(checkMessage("bad\u0007bell")).toMatchObject({ ok: false });
    expect(checkMessage(5)).toMatchObject({ ok: false });
    expect(checkSubject("  Car   claim ")).toEqual({ ok: true, value: "Car claim" });
    expect(checkSubject("ab")).toMatchObject({ ok: false });
  });
});

describe("who sees a conversation", () => {
  it("keeps colleague conversations private to their participants", () => {
    expect(canSeeConversation(agent, colleagues())).toBe(true);
    expect(canSeeConversation(claimsManager, colleagues())).toBe(true);
    expect(canSeeConversation(admin, colleagues())).toBe(false);
    expect(canSeeConversation(otherAgent, colleagues())).toBe(false);
  });

  it("lets the owner and the area's supervisors see a customer conversation, nobody else", () => {
    expect(canSeeConversation(agent, customerConv())).toBe(true);
    expect(canSeeConversation(claimsManager, customerConv())).toBe(true);
    expect(canSeeConversation(admin, customerConv())).toBe(true);
    expect(canSeeConversation(otherAgent, customerConv())).toBe(false);
    // A policy question climbs the underwriter's ladder, not the claims manager's.
    expect(canSeeConversation(claimsManager, customerConv({ topic: "policy" }))).toBe(false);
    expect(canSeeConversation(underwriter, customerConv({ topic: "policy" }))).toBe(true);
  });
});

describe("timeliness and escalation", () => {
  it("gives staff 4 hours to answer a customer, then the supervisor, then 4 hours later the administrator", () => {
    expect(replyDueAt(customerConv())?.toISOString()).toBe("2026-11-18T10:00:00.000Z");
    expect(lateness(customerConv(), at("2026-11-18T10:00:00Z"))).toBe(0);
    expect(lateness(customerConv(), at("2026-11-18T10:00:01Z"))).toBe(1);
    expect(lateness(customerConv(), at("2026-11-18T14:00:01Z"))).toBe(2);
    expect(lateness(customerConv({ status: "closed" }), at("2026-11-19T00:00:00Z"))).toBe(0);
    expect(lateness(customerConv({ awaitingSince: undefined }), at("2026-11-19T00:00:00Z"))).toBe(0);
  });

  it("puts a late customer in front of the right person", () => {
    const early = at("2026-11-18T07:00:00Z");
    const late = at("2026-11-18T11:00:00Z");
    const veryLate = at("2026-11-18T15:00:00Z");
    expect(inboxStanding(agent, customerConv(), early)).toBe("waiting-on-you");
    expect(inboxStanding(claimsManager, customerConv(), early)).toBe("watching");
    expect(inboxStanding(claimsManager, customerConv(), late)).toBe("escalated-to-you");
    expect(inboxStanding(admin, customerConv(), late)).toBe("watching");
    expect(inboxStanding(admin, customerConv(), veryLate)).toBe("escalated-to-you");
    expect(inboxStanding(agent, customerConv(), veryLate)).toBe("waiting-on-you");
  });

  it("sends a customer with no assigned agent straight to the supervisors", () => {
    const unassigned = customerConv({ ownerUserId: undefined, ownerName: undefined, participants: [] });
    expect(inboxStanding(claimsManager, unassigned, at("2026-11-18T06:30:00Z"))).toBe("escalated-to-you");
    expect(canSeeConversation(agent, unassigned)).toBe(false);
  });

  it("shows a colleague's message as waiting on the others, not on the writer", () => {
    const conv = colleagues({ awaitingSince: "2026-11-18T06:00:00.000Z", awaitingFrom: "u-agent" });
    expect(inboxStanding(agent, conv, at("2026-11-18T07:00:00Z"))).toBe("waiting-on-them");
    expect(inboxStanding(claimsManager, conv, at("2026-11-18T07:00:00Z"))).toBe("waiting-on-you");
    expect(lateness(conv, at("2026-11-18T14:00:01Z"))).toBe(1);
  });

  it("orders the inbox: escalated, then waiting on you (oldest first), then the rest", () => {
    const lines = inboxFor(
      claimsManager,
      [
        colleagues({ id: "x", lastMessageAt: "2026-11-18T09:00:00.000Z" }),
        customerConv({ id: "late", awaitingSince: "2026-11-18T01:00:00.000Z" }),
        colleagues({ id: "wait", awaitingSince: "2026-11-18T08:00:00.000Z", awaitingFrom: "u-agent" }),
        customerConv({ id: "fresh", awaitingSince: "2026-11-18T08:30:00.000Z" })
      ],
      at("2026-11-18T09:00:00Z")
    );
    expect(lines.map((line) => `${line.conversation.id}:${line.standing}`)).toEqual([
      "late:escalated-to-you",
      "wait:waiting-on-you",
      "x:waiting-on-them",
      "fresh:watching"
    ]);
  });

  it("starts, keeps and clears the wait as messages arrive", () => {
    const msg = (kind: "staff" | "customer", id: string, createdAt: string): Message => ({
      id: "m",
      conversationId: "c1",
      author: { kind, id, name: id },
      body: "hi",
      createdAt
    });
    const waiting = customerConv();
    // A second customer message keeps the original wait time.
    expect(afterMessage(waiting, msg("customer", "customer", "2026-11-18T07:00:00.000Z"))).toMatchObject({
      awaitingSince: "2026-11-18T06:00:00.000Z",
      awaitingFrom: "customer"
    });
    expect(afterMessage(waiting, msg("staff", "u-agent", "2026-11-18T07:00:00.000Z"))).toMatchObject({ awaitingSince: undefined });
    expect(afterMessage(customerConv({ awaitingSince: undefined, awaitingFrom: undefined, status: "closed" }), msg("customer", "customer", "2026-11-18T08:00:00.000Z"))).toMatchObject({
      awaitingSince: "2026-11-18T08:00:00.000Z",
      status: "open"
    });
    expect(afterMessage(colleagues(), msg("staff", "u-cm", "2026-11-18T08:00:00.000Z"))).toMatchObject({ awaitingFrom: "u-cm" });
  });

  it("names the escalation path in plain words", () => {
    expect(escalationPath("claim", (id) => findStaffRole(id)?.name ?? id)).toBe("Claims Manager, then Platform Admin");
  });
});

describe("the hierarchy of administration", () => {
  const regions: AdminRegion[] = [
    { id: "af", name: "Africa", code: "AF", level: "Continental", continentCode: "AF", status: "Active" },
    { id: "ke", name: "Kenya", code: "KE", level: "National", parentRegionId: "af", countryCode: "KE", continentCode: "AF", status: "Active" },
    { id: "nbi", name: "Nairobi", code: "KE-047", level: "County", parentRegionId: "ke", countryCode: "KE", continentCode: "AF", status: "Active" },
    { id: "msa", name: "Mombasa", code: "KE-001", level: "County", parentRegionId: "ke", countryCode: "KE", continentCode: "AF", status: "Active" },
    { id: "ug", name: "Uganda", code: "UG", level: "National", parentRegionId: "af", countryCode: "UG", continentCode: "AF", status: "Active" }
  ] as AdminRegion[];
  const appt = (userId: string, level: AdminAppointment["level"], regionId: string, status: AdminAppointment["status"] = "Active") =>
    ({ id: `a-${userId}`, userId, userName: userId, email: "", regionId, level, roleId: "role-agent", appointedBy: "x", appointedAt: "2026-01-01", status }) as AdminAppointment;
  const all = [
    appt("top", "SuperAdmin", "af"),
    appt("africa", "Continental", "af"),
    appt("kenya", "National", "ke"),
    appt("uganda", "National", "ug"),
    appt("nairobi", "County", "nbi"),
    appt("nairobi-2", "County", "nbi"),
    appt("mombasa", "County", "msa"),
    appt("nairobi-gone", "County", "nbi", "Revoked")
  ];

  it("lists a county officer's supervisors, peers and nobody outside their line", () => {
    const me = all.find((a) => a.userId === "nairobi")!;
    const list = directoryFor(me, all, regions).map((entry) => `${entry.group}:${entry.appointment.userId}`);
    expect(list).toEqual(["supervisors:top", "supervisors:africa", "supervisors:kenya", "peers:nairobi-2"]);
  });

  it("lists a national manager's team inside their country only", () => {
    const me = all.find((a) => a.userId === "kenya")!;
    const list = directoryFor(me, all, regions).map((entry) => `${entry.group}:${entry.appointment.userId}`);
    expect(list).toEqual(["supervisors:top", "supervisors:africa", "team:mombasa", "team:nairobi", "team:nairobi-2"]);
  });

  it("lets the top level and the platform owner reach everyone active", () => {
    const top = all.find((a) => a.userId === "top")!;
    expect(directoryFor(top, all, regions)).toHaveLength(6);
    expect(directoryFor(null, all, regions, { isPlatformOwner: true })).toHaveLength(7);
    expect(directoryFor(null, all, regions)).toEqual([]);
  });
});
