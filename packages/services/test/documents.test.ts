import { describe, expect, it } from "vitest";
import type { Conversation } from "@insuros/domain";
import { DocumentService, MemoryPhotoStorage, MessagingService } from "../src";

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x10, 0x00, 0x20, 0x03, ...new Array(400).fill(5)]);
const text = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join("");

describe("DocumentService", () => {
  it("records a signed declaration, tells the agent, and builds the claim pack", async () => {
    const started = await new MessagingService().startCustomer({
      subject: "Windscreen",
      body: "My windscreen cracked.",
      topic: "claim",
      reference: "CLM-DOC-1",
      customerName: "Jane Doe",
      customerAccessHash: "f".repeat(64),
      from: { kind: "customer" }
    });
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const docs = new DocumentService(new MemoryPhotoStorage());
    const signed = await docs.signClaimDeclaration(started.value, { name: "Jane Doe", agreed: "yes", image: jpeg }, new Date("2036-01-01T10:00:00Z"));
    expect(signed).toMatchObject({ ok: true, record: { signerName: "Jane Doe", reference: "CLM-DOC-1" } });
    const messages = await new MessagingService().messagesOf(started.value.id);
    expect(messages.at(-1)?.body).toBe("I have signed the claim declaration as Jane Doe.");

    const pack = text(await docs.claimPack(started.value));
    expect(pack.startsWith("%PDF")).toBe(true);
    expect(pack).toContain("Claim pack: Windscreen");
    expect(pack).toContain("Signed by");
  });

  it("refuses to sign anything but a customer claim", async () => {
    const docs = new DocumentService(new MemoryPhotoStorage());
    const policyChat = { kind: "customer", topic: "policy" } as Conversation;
    expect(await docs.signClaimDeclaration(policyChat, { name: "Jane Doe", agreed: "yes", image: jpeg })).toMatchObject({ ok: false });
  });
});
