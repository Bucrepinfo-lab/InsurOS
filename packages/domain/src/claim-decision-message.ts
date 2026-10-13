import type { AdjudicationOutcome } from "./claim-automation";

/**
 * Claimant-safe claim decision message — PURE core (no network, no secrets).
 *
 * Turns an adjudication outcome into a short, plain message for the claimant in
 * English or Swahili. It deliberately does NOT use the decision's internal
 * `reasons`: those carry rule names, fraud scores and signal codes, which must
 * never reach a claimant (it would tip off fraud checks and read as an
 * accusation). Staff keep seeing the reasons; claimants get this message.
 *
 * Provider-neutral: the deterministic templates are the always-on, zero-cost
 * output. An optional AI pass (wired in @insuros/services, off by default) may
 * only polish the wording in the chosen language; its output is screened and
 * falls back to the template if it adds anything it must not. Nothing here
 * approves, declines or pays a claim — denials always stay with a human.
 */

export type ClaimMessageLanguage = "en" | "sw";

export interface ClaimDecisionMessageInput {
  claimReference: string;
  outcome: AdjudicationOutcome;
  /** Payout target in hours, only meaningful for an approval. */
  slaHours?: number;
  language: ClaimMessageLanguage;
}

/** Keep it short enough for an SMS-sized notice. */
export const CLAIM_MESSAGE_MAX_CHARS = 320;

/** Cheapest suitable tier; override via the services adapter config. */
export const CLAIM_MESSAGE_MODEL = "claude-haiku-5-5";

/**
 * Output ceiling. Current (5.x) models emit a `thinking` block before the text,
 * so a tight budget leaves no room for the message. `max_tokens` only caps
 * output — billing is per token actually produced.
 */
export const CLAIM_MESSAGE_MAX_TOKENS = 1024;

function clamp(value: string, max: number): string {
  const text = value.trim().replace(/\s+/g, " ");
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function hasSla(slaHours: number | undefined): slaHours is number {
  return typeof slaHours === "number" && Number.isFinite(slaHours) && slaHours > 0;
}

/** The deterministic, claimant-safe message. Always available, costs nothing. */
export function templateClaimDecisionMessage(input: ClaimDecisionMessageInput): string {
  const ref = input.claimReference.trim();

  if (input.language === "sw") {
    if (input.outcome === "AutoApproved") {
      const timing = hasSla(input.slaHours)
        ? `Tunalenga kukamilisha malipo ndani ya saa ${input.slaHours}.`
        : "Tutakujulisha muda wa malipo hivi karibuni.";
      return clamp(`Habari njema — dai lako ${ref} limeidhinishwa. ${timing}`, CLAIM_MESSAGE_MAX_CHARS);
    }
    if (input.outcome === "ManualReview") {
      return clamp(
        `Dai lako ${ref} linakaguliwa na afisa wa madai. Uamuzi utafanywa na mtu, na tutawasiliana nawe iwapo tutahitaji maelezo zaidi.`,
        CLAIM_MESSAGE_MAX_CHARS
      );
    }
    return clamp(
      `Dai lako ${ref} limepelekwa kwa afisa wa madai kwa uamuzi wa mwisho. Tutawasiliana nawe kuhusu matokeo.`,
      CLAIM_MESSAGE_MAX_CHARS
    );
  }

  if (input.outcome === "AutoApproved") {
    const timing = hasSla(input.slaHours)
      ? `We aim to complete payment within ${input.slaHours} hours.`
      : "We will confirm the payment timeline shortly.";
    return clamp(`Good news — your claim ${ref} has been approved. ${timing}`, CLAIM_MESSAGE_MAX_CHARS);
  }
  if (input.outcome === "ManualReview") {
    return clamp(
      `Your claim ${ref} is being reviewed by a claims officer. A person will make the decision, and we will contact you if we need anything else.`,
      CLAIM_MESSAGE_MAX_CHARS
    );
  }
  return clamp(
    `Your claim ${ref} has been passed to a claims officer for a final decision. We will contact you with the outcome.`,
    CLAIM_MESSAGE_MAX_CHARS
  );
}

/**
 * The instruction for the optional AI pass: polish the template's wording in
 * the same language, adding nothing.
 */
export function claimDecisionMessagePrompt(input: ClaimDecisionMessageInput): string {
  const languageName = input.language === "sw" ? "Kiswahili" : "English";
  return [
    `Rewrite this insurance claim notice for the claimant in warm, plain ${languageName}.`,
    "Rules:",
    `- Write in ${languageName} only. At most ${CLAIM_MESSAGE_MAX_CHARS} characters. Plain text, no markdown.`,
    "- Keep the claim reference exactly as written and keep the meaning exactly the same.",
    "- Add NO facts: no amounts, no dates or deadlines beyond the ones given, no promises.",
    "- Never mention fraud, risk scores, rules, checks or investigations.",
    "- Do not say the claim is declined or rejected.",
    "",
    "Notice to rewrite:",
    templateClaimDecisionMessage(input)
  ].join("\n");
}

/** Words the claimant message must never contain (English + Kiswahili). */
const FORBIDDEN_TERMS = [
  "fraud",
  "score",
  "rule",
  "investigat",
  "suspic",
  "reject",
  "declin",
  "udanganyifu",
  "ulaghai",
  "kukataliwa",
  "limekataliwa"
];

/**
 * Screen and clean the AI reply. Returns null — so the caller uses the template
 * — when the reply is empty, drops the claim reference, introduces numbers that
 * were not given, or uses a forbidden term.
 */
export function parseClaimDecisionMessage(
  text: string,
  input: ClaimDecisionMessageInput
): string | null {
  if (!text) {
    return null;
  }
  const cleaned = clamp(text.replace(/^["'\s]+|["'\s]+$/g, ""), CLAIM_MESSAGE_MAX_CHARS);
  if (!cleaned) {
    return null;
  }
  if (!cleaned.includes(input.claimReference.trim())) {
    return null;
  }
  const lower = cleaned.toLowerCase();
  if (FORBIDDEN_TERMS.some((term) => lower.includes(term))) {
    return null;
  }
  // Every number in the reply must already be in the reference or the SLA.
  const allowed = new Set<string>([
    ...(input.claimReference.match(/\d+/g) ?? []),
    ...(hasSla(input.slaHours) ? [String(input.slaHours)] : [])
  ]);
  const numbers = cleaned.match(/\d+/g) ?? [];
  if (numbers.some((value) => !allowed.has(value))) {
    return null;
  }
  return cleaned;
}

/** The optional AI text generator: returns the model's raw reply, or null. */
export type ClaimMessageGenerate = (prompt: string) => Promise<string | null>;

export interface ClaimDecisionMessage {
  text: string;
  /** True when the AI pass produced the text; false when the template was used. */
  usedModel: boolean;
}

/**
 * Build the claimant message. With no generator (the default) this is the
 * deterministic template; with one, the AI polish is screened and any failure
 * falls back to the template, so a claimant always gets a correct, safe notice.
 */
export async function buildClaimDecisionMessage(
  input: ClaimDecisionMessageInput,
  generate?: ClaimMessageGenerate
): Promise<ClaimDecisionMessage> {
  const fallback = templateClaimDecisionMessage(input);
  if (!generate) {
    return { text: fallback, usedModel: false };
  }
  try {
    const raw = await generate(claimDecisionMessagePrompt(input));
    const parsed = raw ? parseClaimDecisionMessage(raw, input) : null;
    return parsed ? { text: parsed, usedModel: true } : { text: fallback, usedModel: false };
  } catch {
    return { text: fallback, usedModel: false };
  }
}
