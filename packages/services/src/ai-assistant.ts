import { basicHelp, buildPrompt, canRun, type AiContext, type AiPrompt, type AiTask } from "@insuros/domain";
import { getPersistence } from "./persistence";

/**
 * AI help behind a provider-neutral adapter, with a monthly spend cap.
 *
 * Off by default: it switches on only when the server has AI_PROVIDER, the
 * provider's key and a monthly call limit above zero (AI_MONTHLY_CALL_LIMIT).
 * When off, or over the limit, or when the provider fails, the helper falls
 * back to plain rule-based help and says so. It returns text for a person to
 * edit; it never sends a message.
 */
export interface AiProvider {
  name: string;
  complete(prompt: AiPrompt): Promise<string>;
}

export interface AiResult {
  text: string;
  /** "ai" = written by the AI provider; "basic" = the plain fallback. */
  source: "ai" | "basic";
  /** Why the fallback was used, in plain words. */
  note?: string;
}

function env(): Record<string, string | undefined> {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

/** Anthropic's Messages API over fetch: no SDK, no key in the code. */
export class AnthropicProvider implements AiProvider {
  name = "anthropic";
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async complete(prompt: AiPrompt): Promise<string> {
    const response = await this.fetcher("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": this.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: this.model,
        max_tokens: prompt.maxTokens,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }]
      }),
      signal: AbortSignal.timeout(20_000)
    });
    if (!response.ok) throw new Error(`AI provider answered ${response.status}`);
    const data = (await response.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter((part) => part.type === "text").map((part) => part.text ?? "").join("").trim();
    if (!text) throw new Error("AI provider returned nothing");
    return text;
  }
}

/** The provider the server is set up with, or null when AI is off. */
export function configuredProvider(): AiProvider | null {
  const e = env();
  if (e.AI_PROVIDER === "anthropic" && e.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(e.ANTHROPIC_API_KEY, e.AI_MODEL || "claude-haiku-5-5");
  }
  return null;
}

export function monthlyLimit(): number {
  const limit = Number(env().AI_MONTHLY_CALL_LIMIT ?? "0");
  return Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 0;
}

const monthOf = (now: Date) => new Date(now.getTime() + 3 * 3_600_000).toISOString().slice(0, 7);

export class AiAssistantService {
  constructor(
    private readonly provider: AiProvider | null = configuredProvider(),
    private readonly limit: number = monthlyLimit()
  ) {}

  /** Whether real AI is available right now (switched on and under the limit). */
  async status(now: Date = new Date()): Promise<{ on: boolean; used: number; limit: number }> {
    const used = (await getPersistence().aiUsage.findById(monthOf(now)))?.calls ?? 0;
    return { on: Boolean(this.provider) && this.limit > 0 && used < this.limit, used, limit: this.limit };
  }

  async help(task: AiTask, context: AiContext, now: Date = new Date()): Promise<AiResult | null> {
    if (!canRun(task, context)) return null;
    const basic = (note: string): AiResult | null => {
      const text = basicHelp(task, context);
      return text ? { text, source: "basic", note } : null;
    };
    if (!this.provider || this.limit <= 0) return basic("AI is off; this is the basic helper.");

    // Count the call before making it, so the cap holds even if the provider is slow.
    const repo = getPersistence().aiUsage;
    const month = monthOf(now);
    const row = await repo.findById(month);
    const used = row?.calls ?? 0;
    if (used >= this.limit) return basic("This month's AI limit is used up; this is the basic helper.");
    if (row) await repo.update(month, { calls: used + 1 });
    else {
      try {
        await repo.insert({ id: month, calls: 1 });
      } catch {
        const again = await repo.findById(month);
        await repo.update(month, { calls: (again?.calls ?? 0) + 1 });
      }
    }

    try {
      const text = await this.provider.complete(buildPrompt(task, context));
      return { text: text.slice(0, 4000), source: "ai" };
    } catch {
      return basic("The AI service did not answer; this is the basic helper.");
    }
  }
}
