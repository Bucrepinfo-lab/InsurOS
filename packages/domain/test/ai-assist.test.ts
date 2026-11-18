import { describe, expect, it } from "vitest";
import { basicHelp, buildPrompt, canRun, redact, type AiContext } from "../src";

const context = (extra: Partial<AiContext> = {}): AiContext => ({
  audience: "customer",
  subject: "Car claim",
  messages: [
    { author: { kind: "customer", id: "customer", name: "Jane" }, body: "My phone is 0712 345 678 and my ID 12345678. Email jane@example.com", createdAt: "2026-11-18T06:00:00Z" }
  ],
  writerName: "Agent A",
  ...extra
});

describe("AI assist", () => {
  it("hides phone, ID and account numbers and email addresses before anything leaves the server", () => {
    expect(redact("Call +254 712 345 678 or 0712-345-678, ID 12345678, acc 1234567890123, mail a.b@c.co.ke")).toBe(
      "Call [number] or [number], ID [number], acc [number], mail [email]"
    );
    expect(redact("Claim of 120,000 on 18/11/26")).toBe("Claim of 120,000 on 18/11/26");
    for (const task of ["draft-reply", "summarise", "translate"] as const) {
      const prompt = buildPrompt(task, context());
      expect(prompt.user).not.toMatch(/0712|12345678|jane@example/);
    }
  });

  it("tells the model never to promise payments or approval, and never to send", () => {
    const prompt = buildPrompt("draft-reply", context());
    expect(prompt.system).toMatch(/never send/i);
    expect(prompt.system).toMatch(/Never promise a payment/);
    expect(prompt.maxTokens).toBeLessThanOrEqual(500);
  });

  it("only runs a task that has something to work on", () => {
    expect(canRun("improve", context())).toBe(false);
    expect(canRun("improve", context({ draft: "hi" }))).toBe(true);
    expect(canRun("summarise", context({ messages: [] }))).toBe(false);
    expect(canRun("draft-reply", context({ messages: [] }))).toBe(true);
  });

  it("offers plain help when AI is off, and says nothing it cannot do", () => {
    expect(basicHelp("draft-reply", context())).toMatch(/^Thank you for your message about Car claim/);
    expect(basicHelp("draft-reply", context())).toMatch(/Agent A$/);
    expect(basicHelp("draft-reply", context({ audience: "colleague" }))).toMatch(/^Thanks, I have this/);
    expect(basicHelp("summarise", context())).toMatch(/1 message, 1 from the customer/);
    expect(basicHelp("improve", context({ draft: "  ok   thanks !! we will call " }))).toBe("Ok thanks. we will call");
    expect(basicHelp("translate", context())).toBeNull();
    // The plain helper never promises money or approval either.
    expect(basicHelp("draft-reply", context())).not.toMatch(/pay|approv|guarantee/i);
  });
});
