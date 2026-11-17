import { describe, expect, it } from "vitest";
import {
  VALUE_STORIES,
  cleanSearchTerm,
  rankUsage,
  usageCounterId,
  usageDay,
  usageKeyFor,
  usageLabel,
  usageSinceDay,
  type UsageCounter
} from "../src";

describe("usage insight", () => {
  it("counts by the East Africa day", () => {
    expect(usageDay(new Date("2026-11-17T20:59:59Z"))).toBe("2026-11-17");
    expect(usageDay(new Date("2026-11-17T21:00:00Z"))).toBe("2026-11-18");
    expect(usageSinceDay(new Date("2026-11-17T09:00:00Z"), 7)).toBe("2026-11-11");
    expect(usageSinceDay(new Date("2026-11-17T09:00:00Z"), 1)).toBe("2026-11-17");
  });

  it("never keeps a number typed into the search box", () => {
    expect(cleanSearchTerm("  Claims  ")).toBe("claims");
    expect(cleanSearchTerm("tax returns")).toBe("tax returns");
    expect(cleanSearchTerm("0712345678")).toBeNull();
    expect(cleanSearchTerm("POL-KE-2026-00123")).toBeNull();
    expect(cleanSearchTerm("id 12345678")).toBeNull();
    expect(cleanSearchTerm("a")).toBeNull();
    expect(cleanSearchTerm("one two three four")).toBeNull();
    expect(cleanSearchTerm("x".repeat(31))).toBeNull();
    expect(cleanSearchTerm("name@example.com")).toBeNull();
    expect(cleanSearchTerm(42)).toBeNull();
  });

  it("stores a section view as its section, never the path with a record id", () => {
    expect(usageKeyFor("section", "/dashboard/claims/CLM-KE-2026-0001/assessment")).toBe("claims");
    expect(usageKeyFor("section", "/dashboard/customers/cus-123?q=jane")).toBe("customers");
    expect(usageKeyFor("section", "/why")).toBeNull();
    expect(usageKeyFor("section", "https://example.com/dashboard")).toBeNull();
  });

  it("accepts only clicks that exist on a banner", () => {
    const claims = VALUE_STORIES.find((story) => story.id === "claims")!;
    expect(usageKeyFor("click", "claims>share")).toBe("claims>share");
    expect(usageKeyFor("click", `claims>${claims.next[0].href}`)).toBe(`claims>${claims.next[0].href}`);
    expect(usageKeyFor("click", "claims>https://example.com")).toBeNull();
    expect(usageKeyFor("click", "nope>share")).toBeNull();
    expect(usageKeyFor("click", "claims")).toBeNull();
    expect(usageKeyFor("click", "x".repeat(201))).toBeNull();
  });

  it("ranks totals inside the window, highest first", () => {
    const row = (kind: UsageCounter["kind"], key: string, day: string, count: number): UsageCounter => ({
      id: usageCounterId(kind, key, day),
      kind,
      key,
      day,
      count
    });
    const counters = [
      row("section", "claims", "2026-11-16", 4),
      row("section", "claims", "2026-11-17", 3),
      row("section", "tax", "2026-11-17", 5),
      row("section", "tax", "2026-11-01", 50),
      row("search", "claims", "2026-11-17", 9)
    ];
    expect(rankUsage(counters, "section", "2026-11-11")).toEqual([
      { key: "claims", count: 7 },
      { key: "tax", count: 5 }
    ]);
    expect(rankUsage(counters, "section", "2026-11-11", 1)).toHaveLength(1);
  });

  it("labels keys in plain words", () => {
    expect(usageLabel("section", "claims")).toBe("Claims desk");
    expect(usageLabel("click", "claims>share")).toBe("Claims desk: shared");
    expect(usageLabel("search-miss", "payroll")).toBe("payroll");
    const claims = VALUE_STORIES.find((story) => story.id === "claims")!;
    expect(usageLabel("click", `claims>${claims.next[0].href}`)).toBe(`Claims desk → ${claims.next[0].label}`);
  });
});
