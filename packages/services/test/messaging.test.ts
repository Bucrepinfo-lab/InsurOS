import { describe, expect, it } from "vitest";
import type { FollowUpViewer } from "@insuros/domain";
import { AiAssistantService, MessagingService, getPersistence, type AiProvider } from "../src";

const service = new MessagingService();
const at = (iso: string) => new Date(iso);
const agent: FollowUpViewer = { userIds: ["ms-agent"], roleIds: ["role-agent"], isPlatformOwner: false };
const stranger: FollowUpViewer = { userIds: ["ms-other"], roleIds: ["role-agent"], isPlatformOwner: false };
const manager: FollowUpViewer = { userIds: ["ms-cm"], roleIds: ["role-claims-manager"], isPlatformOwner: false };
const hash = (c: string) => c.repeat(64);

describe("MessagingService", () => {
  it("lets a customer reach their agent by link, escalates if unanswered, and clears when staff reply", async () => {
    const started = await service.startCustomer(
      {
        subject: "Windscreen claim",
        body: "Hello, how do I claim for my windscreen?",
        topic: "claim",
        customerName: "Jane Doe",
        customerAccessHash: hash("b"),
        owner: { userId: "ms-agent", name: "Agent A" },
        from: { kind: "customer" }
      },
      at("2033-01-10T06:00:00Z")
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const id = started.value.id;
    expect(started.value.awaitingFrom).toBe("customer");

    expect((await service.inbox(agent, at("2033-01-10T07:00:00Z"))).find((l) => l.conversation.id === id)?.standing).toBe("waiting-on-you");
    expect((await service.inbox(manager, at("2033-01-10T11:00:00Z"))).find((l) => l.conversation.id === id)?.standing).toBe("escalated-to-you");
    expect((await service.inbox(stranger, at("2033-01-10T11:00:00Z"))).some((l) => l.conversation.id === id)).toBe(false);
    expect(await service.open(id, stranger)).toMatchObject({ ok: false });
    expect(await service.reply(id, stranger, { userId: "ms-other", name: "Other" }, "hi")).toMatchObject({ ok: false });

    // The supervisor answers and joins the conversation.
    const reply = await service.reply(id, manager, { userId: "ms-cm", name: "Manager M" }, "We have it. Please send a photo.", { aiAssisted: true }, at("2033-01-10T11:05:00Z"));
    expect(reply).toMatchObject({ ok: true, value: { aiAssisted: true } });
    const opened = await service.open(id, manager);
    expect(opened.ok && opened.value.conversation.awaitingSince).toBeUndefined();
    expect(opened.ok && opened.value.conversation.participants.map((p) => p.userId)).toEqual(["ms-agent", "ms-cm"]);

    // The customer sees the thread through the link only.
    expect(await service.forCustomer(hash("c"))).toBeNull();
    const customerView = await service.forCustomer(hash("b"));
    expect(customerView?.messages.map((m) => m.author.kind)).toEqual(["customer", "staff"]);
    expect(await service.customerReply(hash("b"), "Photo sent.", at("2033-01-10T12:00:00Z"))).toMatchObject({ ok: true });
  });

  it("limits a customer to 20 messages an hour and refuses an old link", async () => {
    const started = await service.startCustomer(
      { subject: "Policy question", body: "Hi", topic: "policy", customerName: "Flood Test", customerAccessHash: hash("d"), from: { kind: "customer" } },
      at("2033-02-01T06:00:00Z")
    );
    expect(started.ok && started.value.ownerUserId).toBeUndefined();
    for (let i = 0; i < 19; i += 1) await service.customerReply(hash("d"), `m${i}`, at("2033-02-01T06:10:00Z"));
    expect(await service.customerReply(hash("d"), "one more", at("2033-02-01T06:20:00Z"))).toMatchObject({ ok: false });
    expect(await service.customerReply(hash("d"), "next hour", at("2033-02-01T07:30:00Z"))).toMatchObject({ ok: true });

    if (!started.ok) return;
    const underwriter: FollowUpViewer = { userIds: ["ms-uw"], roleIds: ["role-underwriter"], isPlatformOwner: false };
    expect(await service.replaceCustomerLink(started.value.id, underwriter, hash("e"))).toMatchObject({ ok: true });
    expect(await service.customerReply(hash("d"), "old link", at("2033-02-01T08:00:00Z"))).toMatchObject({ ok: false });
    expect(await service.assign(started.value.id, underwriter, { userId: "ms-agent", name: "Agent A" })).toMatchObject({ ok: true, value: { ownerUserId: "ms-agent" } });
  });

  it("keeps colleague conversations private and waiting on the people written to", async () => {
    const started = await service.startColleagues(
      { subject: "Cover for Friday", body: "Can you take my desk on Friday?", from: { userId: "ms-agent", name: "Agent A" }, to: [{ userId: "ms-cm", name: "Manager M" }] },
      at("2033-03-01T06:00:00Z")
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const admin: FollowUpViewer = { userIds: ["ms-admin"], roleIds: ["role-platform-admin"], isPlatformOwner: false };
    expect(await service.open(started.value.id, admin)).toMatchObject({ ok: false });
    expect((await service.counts(manager, at("2033-03-01T07:00:00Z"))).waiting).toBeGreaterThanOrEqual(1);
    expect(await service.startColleagues({ subject: "Me", body: "x", from: { userId: "a", name: "A" }, to: [{ userId: "a", name: "A" }] })).toMatchObject({ ok: false });
  });
});

describe("AiAssistantService", () => {
  const context = { audience: "customer" as const, subject: "Claim", messages: [{ author: { kind: "customer" as const, id: "customer", name: "J" }, body: "Call 0712345678", createdAt: "2033-01-01T00:00:00Z" }] };

  it("falls back to the basic helper when AI is off", async () => {
    const result = await new AiAssistantService(null, 0).help("draft-reply", context);
    expect(result).toMatchObject({ source: "basic", note: expect.stringContaining("AI is off") });
  });

  it("uses the provider within the monthly limit, never sends personal numbers, then falls back", async () => {
    const seen: string[] = [];
    const provider: AiProvider = { name: "fake", complete: async (prompt) => (seen.push(prompt.user), "Draft from AI") };
    const ai = new AiAssistantService(provider, 2);
    const now = at("2034-05-10T06:00:00Z");
    expect(await ai.help("summarise", context, now)).toEqual({ text: "Draft from AI", source: "ai" });
    expect(await ai.help("summarise", context, now)).toMatchObject({ source: "ai" });
    expect(await ai.help("summarise", context, now)).toMatchObject({ source: "basic", note: expect.stringContaining("limit") });
    expect(seen.join(" ")).not.toContain("0712345678");
    expect((await getPersistence().aiUsage.findById("2034-05"))?.calls).toBe(2);
    expect(await ai.status(now)).toEqual({ on: false, used: 2, limit: 2 });
  });

  it("falls back when the provider fails", async () => {
    const provider: AiProvider = { name: "down", complete: async () => { throw new Error("down"); } };
    expect(await new AiAssistantService(provider, 5).help("draft-reply", context, at("2034-06-01T06:00:00Z"))).toMatchObject({ source: "basic" });
  });
});
