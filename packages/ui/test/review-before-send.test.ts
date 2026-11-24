import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const src = join(__dirname, "..", "..", "..", "apps", "admin", "src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : name.endsWith(".tsx") ? [full] : [];
  });
}

/**
 * Forms that do not get the review step, and why. Anything else with a <form>
 * must be wrapped in <ReviewBeforeSend> (owner 24/11/26: a last look before
 * anything is sent).
 */
const EXEMPT: Record<string, string> = {
  "components/phone-auth.tsx": "sign-in: a phone number and PIN, nothing is sent to anyone",
  "components/set-pin-form.tsx": "choosing your own PIN; the PIN is typed twice already",
  "components/follow-up-confirm.tsx": "is itself a one-tap confirmation of a step",
  "components/staff-access-forms.tsx": "administrator access forms; revoking already needs an explicit tick",
  "components/home-link-button.tsx": "makes a link for the customer; the link is shown before it is shared",
  "components/customer-link-panel.tsx": "makes a link; nothing is sent",
  "components/plus-pay.tsx": "payment: the M-Pesa PIN prompt on the phone is the confirmation (payments off)",
  "app/dashboard/marketplace/break-even/page.tsx": "a calculator; nothing is sent",
  "app/dashboard/sales/commission-plan/page.tsx": "a calculator; nothing is sent",
  "app/dashboard/messages/[conversationId]/page.tsx": "the reply box is MessageComposer, which is reviewed"
};

describe("review before sending (owner 24/11/26)", () => {
  const withForms = files(src)
    .map((file) => ({ file: relative(src, file).split(sep).join("/"), text: readFileSync(file, "utf8") }))
    .filter(({ text }) => /<form\b/.test(text));

  it("wraps every form that sends in ReviewBeforeSend, or says why not", () => {
    for (const { file, text } of withForms) {
      if (EXEMPT[file]) continue;
      expect(text.includes("<ReviewBeforeSend"), `${file}: wrap it in <ReviewBeforeSend> or add it to EXEMPT with a reason`).toBe(true);
    }
  });

  it("has no stale exemptions", () => {
    const present = new Set(withForms.map(({ file }) => file));
    for (const file of Object.keys(EXEMPT)) expect(present.has(file), `${file} has no form any more`).toBe(true);
  });

  it("reviews the forms that reach other people: messages, claims, customers, policies, documents, news, contact", () => {
    for (const file of [
      "components/message-composer.tsx",
      "components/new-conversation.tsx",
      "app/c/[token]/reply-form.tsx",
      "app/contact/contact-form.tsx",
      "components/record-forms.tsx",
      "components/claim-steps.tsx",
      "components/document-form.tsx",
      "components/announcement-forms.tsx"
    ]) {
      expect(readFileSync(join(src, file), "utf8"), file).toContain("<ReviewBeforeSend");
    }
  });

  it("holds each claim photo for a look before it is sent", () => {
    const photos = readFileSync(join(src, "components/claim-photos.tsx"), "utf8");
    expect(photos).toContain("Send this photo");
    expect(photos).toMatch(/onChange=\{\(event\) => \{\s*void prepare\(/);
  });
});
