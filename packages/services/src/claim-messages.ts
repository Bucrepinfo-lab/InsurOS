import type {
  AdjudicationDecision,
  ClaimDecisionMessage,
  ClaimMessageGenerate,
  ClaimMessageLanguage
} from "@insuros/domain";
import {
  buildClaimDecisionMessage,
  CLAIM_MESSAGE_MAX_TOKENS,
  CLAIM_MESSAGE_MODEL,
  templateClaimDecisionMessage
} from "@insuros/domain";

/**
 * Claimant decision messages — the services side of the provider-neutral
 * pattern. The default is the free deterministic template from
 * @insuros/domain. An Anthropic generator can be switched on per environment
 * to polish the wording (English or Kiswahili); it is OFF unless the caller
 * passes provider "anthropic" with a key, fails closed without a key, and its
 * output is screened in the domain before use.
 *
 * Config is passed in (no process.env here) so this package stays free of Node
 * typings; the app reads its environment and hands the values over.
 */

export interface ClaimMessageProviderConfig {
  /** "anthropic" | "live" enables the AI pass; anything else keeps the template. */
  provider?: string;
  apiKey?: string;
  model?: string;
}

type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  }
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

const LIVE_PROVIDERS = new Set(["anthropic", "live"]);
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const REQUEST_TIMEOUT_MS = 12_000;

/** First non-empty text block — skips a leading 5.x `thinking` block. */
function extractText(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }
  const content = (body as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    return "";
  }
  for (const block of content) {
    if (block && typeof block === "object" && (block as { type?: unknown }).type === "text") {
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text;
      }
    }
  }
  return "";
}

/**
 * Returns an AI generator when explicitly enabled with a key, else undefined
 * (the template is used). Never throws on a bad provider name: anything not
 * explicitly live stays on the free template.
 */
export function createClaimMessageGenerator(
  config: ClaimMessageProviderConfig,
  fetchImpl: FetchLike = fetch
): ClaimMessageGenerate | undefined {
  const provider = (config.provider ?? "").trim().toLowerCase();
  const apiKey = (config.apiKey ?? "").trim();
  if (!LIVE_PROVIDERS.has(provider) || !apiKey) {
    return undefined;
  }
  const model = (config.model ?? "").trim() || CLAIM_MESSAGE_MODEL;

  return async (prompt: string): Promise<string | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchImpl(ANTHROPIC_MESSAGES_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model,
          max_tokens: CLAIM_MESSAGE_MAX_TOKENS,
          messages: [{ role: "user", content: prompt }]
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        return null;
      }
      return extractText(await response.json()) || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
}

/** The free, deterministic claimant message for a decision (no AI, no cost). */
export function claimantMessageFor(
  decision: Pick<AdjudicationDecision, "claimReference" | "outcome" | "slaHours">,
  language: ClaimMessageLanguage = "en"
): string {
  return templateClaimDecisionMessage({
    claimReference: decision.claimReference,
    outcome: decision.outcome,
    slaHours: decision.slaHours,
    language
  });
}

/**
 * The claimant message with the optional AI polish. Pass a generator from
 * `createClaimMessageGenerator` to enable it; without one this is the template.
 * Call it on demand (e.g. when a notice is sent), never per page view.
 */
export function buildClaimantMessage(
  decision: Pick<AdjudicationDecision, "claimReference" | "outcome" | "slaHours">,
  language: ClaimMessageLanguage,
  generate?: ClaimMessageGenerate
): Promise<ClaimDecisionMessage> {
  return buildClaimDecisionMessage(
    {
      claimReference: decision.claimReference,
      outcome: decision.outcome,
      slaHours: decision.slaHours,
      language
    },
    generate
  );
}
