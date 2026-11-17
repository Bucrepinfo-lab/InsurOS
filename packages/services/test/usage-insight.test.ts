import { describe, expect, it } from "vitest";
import { UsageInsightService, getPersistence } from "../src";

const service = new UsageInsightService();
const at = (iso: string) => new Date(iso);

describe("UsageInsightService", () => {
  it("counts a section view once per day row and adds to it", async () => {
    const now = at("2031-03-04T09:00:00Z");
    expect(await service.record("section", "/dashboard/claims/CLM-1/assessment", now)).toBe(true);
    expect(await service.record("section", "/dashboard/claims", now)).toBe(true);
    const row = await getPersistence().usageCounters.findById("section|claims|2031-03-04");
    expect(row?.count).toBe(2);
  });

  it("stores nothing for values it does not count", async () => {
    const now = at("2031-03-05T09:00:00Z");
    expect(await service.record("search", "0712345678", now)).toBe(false);
    expect(await service.record("click", "claims>https://example.com", now)).toBe(false);
    expect(await service.record("section", "/why", now)).toBe(false);
    const rows = await getPersistence().usageCounters.findWhere((row) => row.day === "2031-03-05");
    expect(rows).toEqual([]);
  });

  it("summarises the window: sections, next steps, shares, searches and misses", async () => {
    const now = at("2031-04-10T09:00:00Z");
    const earlier = at("2031-04-01T09:00:00Z");
    await service.record("section", "/dashboard/finance/tax", now);
    await service.record("section", "/dashboard/finance/tax", now);
    await service.record("section", "/dashboard/customers", now);
    await service.record("section", "/dashboard/customers", earlier);
    await service.record("click", "claims>share", now);
    await service.record("click", "claims>hide", now);
    await service.record("search", "Tax", now);
    await service.record("search-miss", "payroll", now);

    const week = await service.summary(7, now);
    expect(week.sinceDay).toBe("2031-04-04");
    expect(week.sections).toEqual([
      { key: "tax", label: "Levies and tax", count: 2 },
      { key: "customers", label: "Customers", count: 1 }
    ]);
    expect(week.shares).toEqual([{ key: "claims>share", label: "Claims desk: shared", count: 1 }]);
    expect(week.nextSteps).toEqual([]);
    expect(week.searches).toEqual([{ key: "tax", label: "tax", count: 1 }]);
    expect(week.notFound).toEqual([{ key: "payroll", label: "payroll", count: 1 }]);
    expect(week.total).toBe(7);

    const month = await service.summary(30, now);
    expect(month.sections.find((line) => line.key === "customers")?.count).toBe(2);
  });
});
