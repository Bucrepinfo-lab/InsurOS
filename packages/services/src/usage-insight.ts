import {
  rankUsage,
  usageCounterId,
  usageDay,
  usageKeyFor,
  usageLabel,
  usageSinceDay,
  type UsageKind
} from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface UsageLine {
  key: string;
  label: string;
  count: number;
}

export interface UsageSummary {
  days: number;
  sinceDay: string;
  sections: UsageLine[];
  nextSteps: UsageLine[];
  shares: UsageLine[];
  searches: UsageLine[];
  notFound: UsageLine[];
  total: number;
}

/**
 * What people open, look for and click, per tenant per day. Counts only: see
 * `packages/domain/src/usage-insight.ts` for what is never stored.
 */
export class UsageInsightService {
  private get db() {
    return getPersistence();
  }

  /** Count one event. Returns false when the value is not something we count. */
  async record(kind: UsageKind, value: unknown, now: Date = new Date()): Promise<boolean> {
    const key = usageKeyFor(kind, value);
    if (!key) return false;
    const day = usageDay(now);
    const id = usageCounterId(kind, key, day);
    const repo = this.db.usageCounters;
    const existing = await repo.findById(id);
    if (existing) {
      await repo.update(id, { count: existing.count + 1 });
      return true;
    }
    try {
      await repo.insert({ id, kind, key, day, count: 1 });
    } catch {
      // Another request created today's row first: add to it instead.
      const row = await repo.findById(id);
      if (!row) return false;
      await repo.update(id, { count: row.count + 1 });
    }
    return true;
  }

  async summary(days: number, now: Date = new Date()): Promise<UsageSummary> {
    const sinceDay = usageSinceDay(now, days);
    const counters = await this.db.usageCounters.findWhere((row) => row.day >= sinceDay);
    const lines = (kind: UsageKind, limit: number, keep: (key: string) => boolean = () => true): UsageLine[] =>
      rankUsage(counters, kind, sinceDay, 200)
        .filter((rank) => keep(rank.key))
        .slice(0, limit)
        .map((rank) => ({ ...rank, label: usageLabel(kind, rank.key) }));
    const isShare = (key: string) => key.endsWith(">share");
    const isFold = (key: string) => key.endsWith(">hide") || key.endsWith(">show");

    return {
      days,
      sinceDay,
      sections: lines("section", 10),
      nextSteps: lines("click", 10, (key) => !isShare(key) && !isFold(key)),
      shares: lines("click", 10, isShare),
      searches: lines("search", 10),
      notFound: lines("search-miss", 10),
      total: counters.reduce((sum, row) => sum + row.count, 0)
    };
  }
}
