import { describe, expect, it } from "vitest";
import { escalationLevel, inboxFor, queueFor, type FollowUpViewer } from "@insuros/domain";
import { mockClaims, mockConversations, mockCustomers, mockFollowUps, mockMessages, mockPolicies } from "@insuros/mocks";
import { DATASETS, seedsInto } from "../src/persistence/datasets";

// The store reviewer's viewer: their session id, no supervisor roles.
const reviewer: FollowUpViewer = { userIds: ["play-review"], roleIds: [], isPlatformOwner: false };
const now = new Date("2026-11-24T12:00:00.000Z");

describe("demo tenant: worked examples for Follow-ups, Escalations and Messages (owner 24/11/26)", () => {
  it("are seeded into the demo tenant only", () => {
    for (const key of ["followUps", "conversations", "messages"] as const) {
      expect(DATASETS[key].kind).toBe("sample");
      expect(seedsInto("play-review", DATASETS[key].kind)).toBe(true);
      expect(seedsInto("default", DATASETS[key].kind)).toBe(false);
    }
  });

  it("gives Escalations at least three overdue steps, one per area", () => {
    expect(mockFollowUps.length).toBeGreaterThanOrEqual(3);
    expect(mockFollowUps.every((item) => escalationLevel(item, now) > 0)).toBe(true);
    expect(new Set(mockFollowUps.map((item) => item.area)).size).toBe(3);
  });

  it("puts them in the reviewer's Follow-ups so a tester can confirm them", () => {
    expect(queueFor(reviewer, mockFollowUps, now)).toHaveLength(mockFollowUps.length);
  });

  it("points every example at a record that exists in the demo book", () => {
    const ids = new Set([...mockClaims.map((c) => c.id), ...mockPolicies.map((p) => p.id), ...mockCustomers.map((c) => c.id)]);
    for (const item of mockFollowUps) expect(ids.has(item.reference), item.reference).toBe(true);
    for (const conversation of mockConversations) if (conversation.reference) expect(ids.has(conversation.reference), conversation.reference).toBe(true);
  });

  it("gives the reviewer at least three conversations, each with a message", () => {
    expect(inboxFor(reviewer, mockConversations, now).length).toBeGreaterThanOrEqual(3);
    for (const conversation of mockConversations) {
      expect(mockMessages.some((message) => message.conversationId === conversation.id), conversation.id).toBe(true);
    }
  });
});
