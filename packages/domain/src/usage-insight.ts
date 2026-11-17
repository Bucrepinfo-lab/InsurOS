import { VALUE_STORIES, storyForPath } from "./value-story";

/**
 * Usage insight: what people open, look for and click, counted per day.
 *
 * Counts only. No person, phone, record id or free text about a customer is
 * kept: a section view is stored as its section, a click as the banner it
 * came from, and a search only as a short lower-case phrase with no digits.
 */
export type UsageKind = "section" | "search" | "search-miss" | "click";

export const USAGE_KINDS: readonly UsageKind[] = ["section", "search", "search-miss", "click"];

export interface UsageCounter {
  /** `${kind}|${key}|${day}`: one row per thing per day. */
  id: string;
  kind: UsageKind;
  key: string;
  /** Day in East Africa Time, yyyy-mm-dd. */
  day: string;
  count: number;
}

const EAT_OFFSET_MS = 3 * 3_600_000;

/** The calendar day in East Africa Time (UTC+3, no daylight saving). */
export function usageDay(at: Date): string {
  return new Date(at.getTime() + EAT_OFFSET_MS).toISOString().slice(0, 10);
}

export function usageCounterId(kind: UsageKind, key: string, day: string): string {
  return `${kind}|${key}|${day}`;
}

/**
 * A search phrase safe to count: lower case, letters and spaces only, at most
 * three words and 30 characters. Anything with a digit is dropped, so a phone,
 * policy or ID number typed into the box is never stored.
 */
export function cleanSearchTerm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const term = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (term.length < 2 || term.length > 30) return null;
  if (!/^[a-z][a-z '&-]*$/.test(term)) return null;
  if (term.split(" ").length > 3) return null;
  return term;
}

export const CLICK_ACTIONS = ["share", "hide", "show"] as const;

/**
 * Turn what the browser reports into a key that is safe to store, or null to
 * ignore it. Nothing from the browser is stored as sent.
 */
export function usageKeyFor(kind: UsageKind, value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200) return null;
  if (kind === "section") return storyForPath(value)?.id ?? null;
  if (kind === "search" || kind === "search-miss") return cleanSearchTerm(value);
  // click: "<storyId>><action or next href>"
  const [storyId, target] = value.split(">");
  const story = VALUE_STORIES.find((candidate) => candidate.id === storyId);
  if (!story || !target) return null;
  const allowed = [...CLICK_ACTIONS, ...story.next.map((link) => link.href)] as string[];
  return allowed.includes(target) ? `${story.id}>${target}` : null;
}

export interface UsageRank {
  key: string;
  count: number;
}

/** Totals per key for one kind since a day (inclusive), highest first. */
export function rankUsage(counters: UsageCounter[], kind: UsageKind, sinceDay: string, limit = 10): UsageRank[] {
  const totals = new Map<string, number>();
  for (const counter of counters) {
    if (counter.kind !== kind || counter.day < sinceDay) continue;
    totals.set(counter.key, (totals.get(counter.key) ?? 0) + counter.count);
  }
  return [...totals.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

/** The first day of a window of `days` days ending today. */
export function usageSinceDay(now: Date, days: number): string {
  return usageDay(new Date(now.getTime() - (Math.max(1, days) - 1) * 86_400_000));
}

/** A plain label for a counted key. */
export function usageLabel(kind: UsageKind, key: string): string {
  if (kind === "search" || kind === "search-miss") return key;
  const [storyId, target] = key.split(">");
  const story = VALUE_STORIES.find((candidate) => candidate.id === storyId);
  const area = story?.area ?? storyId ?? key;
  if (kind === "section") return area;
  if (target === "share") return `${area}: shared`;
  if (target === "hide") return `${area}: banner folded`;
  if (target === "show") return `${area}: banner reopened`;
  const next = story?.next.find((link) => link.href === target);
  return `${area} → ${next?.label ?? target}`;
}
