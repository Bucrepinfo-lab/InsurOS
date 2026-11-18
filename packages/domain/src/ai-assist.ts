import type { Message } from "./messaging";

/**
 * AI help for people who write — PURE (prompts, redaction, fallbacks).
 *
 * Where it helps: drafting a reply to a customer or colleague, summarising a
 * long conversation for whoever takes it over (a supervisor after an
 * escalation, a colleague covering leave), translating between English and
 * Kiswahili, and tidying the wording of a message or comment.
 *
 * Rules: the AI never sends, decides or promises anything. It writes a
 * draft into the box; a person reads it, changes it and sends it. Numbers
 * that could identify someone (phones, ID and account numbers) and email
 * addresses are masked before any text leaves the server. It is off unless
 * the owner sets a provider key and a monthly limit.
 */
export type AiTask = "draft-reply" | "summarise" | "translate" | "improve";

export const AI_TASK_LABELS: Record<AiTask, string> = {
  "draft-reply": "Draft a reply",
  summarise: "Summarise",
  translate: "English ↔ Kiswahili",
  improve: "Improve wording"
};

/** Replace phone, ID and account numbers (6+ digits, allowing spaces or dashes) and email addresses. */
export function redact(text: string): string {
  return text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/g, "[email]")
    .replace(/\+?\d(?:[\s-]?\d){5,}/g, "[number]");
}

export interface AiContext {
  /** Who the reply goes to. */
  audience: "customer" | "colleague";
  subject: string;
  /** Oldest first. Only the last few are sent. */
  messages: Pick<Message, "author" | "body" | "createdAt">[];
  /** What the person has typed so far. */
  draft?: string;
  /** The writer's first name, to sign off. */
  writerName?: string;
}

export interface AiPrompt {
  system: string;
  user: string;
  maxTokens: number;
}

const HOUSE_RULES = [
  "You help staff of an insurance agency write. You never send anything; a person reads and edits what you write.",
  "Write plainly and kindly, in short sentences. No emoji, no exclamation marks.",
  "Never promise a payment, an amount, a date of payment, approval of a claim or cover. Never invent facts, figures, policy terms or names.",
  "If something is unknown, say a person will confirm it.",
  "Text in square brackets such as [number] was hidden for privacy; leave it as it is."
].join(" ");

const transcript = (context: AiContext, last: number) =>
  context.messages
    .slice(-last)
    .map((message) => `${message.author.kind === "customer" ? "Customer" : message.author.name}: ${redact(message.body)}`)
    .join("\n");

/** The prompt for a task, with personal numbers masked. */
export function buildPrompt(task: AiTask, context: AiContext): AiPrompt {
  const subject = redact(context.subject);
  const draft = context.draft ? redact(context.draft) : "";
  switch (task) {
    case "draft-reply":
      return {
        system: HOUSE_RULES,
        user: `Conversation about "${subject}" with a ${context.audience}.\n\n${transcript(context, 8)}\n\n${
          draft ? `The writer has started: "${draft}". Finish it.` : "Draft the next reply from staff."
        } Reply in the language the ${context.audience} used. Under 120 words. ${
          context.writerName ? `Sign off as ${context.writerName}.` : ""
        } Reply with the message only.`,
        maxTokens: 400
      };
    case "summarise":
      return {
        system: HOUSE_RULES,
        user: `Summarise this conversation about "${subject}" for a colleague taking it over: what is asked, what has been done, what is still open and who is waiting. At most five short lines.\n\n${transcript(context, 30)}`,
        maxTokens: 300
      };
    case "translate":
      return {
        system: HOUSE_RULES,
        user: `Translate between English and Kiswahili: if the text is English, give Kiswahili; otherwise give English. Keep the meaning exactly; reply with the translation only.\n\n${
          draft || redact(context.messages.at(-1)?.body ?? "")
        }`,
        maxTokens: 500
      };
    case "improve":
      return {
        system: HOUSE_RULES,
        user: `Improve the wording of this message to a ${context.audience}: clearer, kinder, shorter, same meaning, same language. Do not add facts. Reply with the message only.\n\n${draft}`,
        maxTokens: 400
      };
  }
}

/** Whether a task has something to work on. */
export function canRun(task: AiTask, context: AiContext): boolean {
  if (task === "improve") return Boolean(context.draft?.trim());
  if (task === "translate") return Boolean(context.draft?.trim() || context.messages.length > 0);
  return context.messages.length > 0 || task === "draft-reply";
}

/**
 * What the helper offers when AI is off: plain, rule-based help so the
 * buttons still do something useful. Honest about being basic.
 */
export function basicHelp(task: AiTask, context: AiContext): string | null {
  const last = context.messages.at(-1);
  const sign = context.writerName ? `\n\n${context.writerName}` : "";
  switch (task) {
    case "draft-reply":
      if (context.audience === "customer") {
        return `Thank you for your message about ${context.subject}. I have it, and I am looking into it now. I will come back to you with an answer or the next step${
          last ? "" : " shortly"
        }. If anything else is needed from you, I will say exactly what.${sign}`;
      }
      return `Thanks, I have this. I will look at it and come back to you.${sign}`;
    case "summarise": {
      if (context.messages.length === 0) return null;
      const customerTurns = context.messages.filter((message) => message.author.kind === "customer").length;
      const first = context.messages[0]!;
      return [
        `Subject: ${context.subject}.`,
        `${context.messages.length} ${context.messages.length === 1 ? "message" : "messages"}, ${customerTurns} from the customer.`,
        `Started: ${first.body.slice(0, 140)}${first.body.length > 140 ? "…" : ""}`,
        last ? `Latest, from ${last.author.kind === "customer" ? "the customer" : last.author.name}: ${last.body.slice(0, 140)}${last.body.length > 140 ? "…" : ""}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "improve": {
      const draft = context.draft?.trim();
      if (!draft) return null;
      const tidy = draft.replace(/\s+/g, " ").replace(/!+/g, ".").replace(/\s+([.,?])/g, "$1");
      return tidy.charAt(0).toUpperCase() + tidy.slice(1);
    }
    case "translate":
      return null;
  }
}
