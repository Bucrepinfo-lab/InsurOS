import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MARKET_STRENGTHS, publicStrengths } from "../src";

const appDir = join(__dirname, "..", "..", "..", "apps", "admin", "src", "app");
const pageExists = (href: string) => existsSync(join(appDir, ...href.split("/").filter(Boolean), "page.tsx"));

describe("market strengths", () => {
  it("never shows in public a strength that is not built", () => {
    expect(publicStrengths().every((item) => item.status !== "not-yet")).toBe(true);
    expect(publicStrengths().length).toBeGreaterThanOrEqual(8);
  });

  it("points every strength we claim at a real page", () => {
    for (const item of publicStrengths()) {
      expect(item.href, item.id).toBeTruthy();
      expect(pageExists(item.href!), `${item.id} -> ${item.href}`).toBe(true);
    }
  });

  it("says plainly what is missing when a strength is only partly there or not built", () => {
    for (const item of MARKET_STRENGTHS.filter((candidate) => candidate.status !== "here")) {
      expect(item.today, item.id).toMatch(/not built|no customer sign-in|switched off|needs links/i);
    }
  });

  it("keeps the same honesty rules as the value stories", () => {
    const banned = [/paid in (hours|minutes|seconds)/i, /\binstant(ly)?\b/i, /pays? (out )?automatically|auto-?approv/i, /\bguarantee/i, /cheapest|lowest price/i, /!/, /\d+ ?%/];
    const ids = MARKET_STRENGTHS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of MARKET_STRENGTHS) {
      const text = `${item.strength} ${item.gain} ${item.today}`;
      for (const pattern of banned) expect(text, `${item.id} ${pattern}`).not.toMatch(pattern);
      expect(item.gain.length, item.id).toBeLessThanOrEqual(140);
      expect(item.today.length, item.id).toBeLessThanOrEqual(200);
    }
  });
});
