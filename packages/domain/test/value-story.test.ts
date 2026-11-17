import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VALUE_STORIES, publicStories, storyForPath, storyShareText, storyShareUrl } from "../src";

const root = join(__dirname, "..", "..", "..");
const appDir = join(root, "apps", "admin", "src", "app");
const pageExists = (href: string) => existsSync(join(appDir, ...href.split("/").filter(Boolean), "page.tsx"));

describe("value story (owner brief 17/11/26): a pain and an answer on every section", () => {
  it("covers every section in the menu", () => {
    const nav = readFileSync(join(root, "packages/ui/src/navigation/navigation-config.ts"), "utf8");
    const hrefs = [...nav.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]!);
    expect(hrefs.length).toBeGreaterThan(20);
    for (const href of hrefs) expect(storyForPath(href), href).not.toBeNull();
  });

  it("gives the most specific story for a path", () => {
    expect(storyForPath("/dashboard")?.id).toBe("one-ledger");
    expect(storyForPath("/dashboard/claims")?.id).toBe("claims");
    expect(storyForPath("/dashboard/claims/abc-123")?.id).toBe("claims");
    expect(storyForPath("/dashboard/claims/automation")?.id).toBe("claims-intake");
    expect(storyForPath("/dashboard/finance/tax/regional")?.id).toBe("tax");
    expect(storyForPath("/dashboard/marketplace/pricing-engine?x=1")?.id).toBe("pricing");
    expect(storyForPath("/dashboard/something-new")?.id).toBe("one-ledger");
    expect(storyForPath("/privacy")).toBeNull();
  });

  it("only links to sections that exist, never back to itself, so there is no dead button", () => {
    for (const story of VALUE_STORIES) {
      for (const prefix of story.paths) expect(pageExists(prefix), `${story.id} path ${prefix}`).toBe(true);
      for (const link of story.next) {
        expect(pageExists(link.href), `${story.id} → ${link.href}`).toBe(true);
        expect(story.paths, `${story.id} links to itself`).not.toContain(link.href);
        expect(link.label.length).toBeGreaterThan(3);
      }
      expect(story.next[0].href).not.toBe(story.next[1].href);
    }
  });

  it("lets a reader reach every public story by following the links from the workspace home", () => {
    const seen = new Set<string>();
    const queue = ["one-ledger"];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const story = VALUE_STORIES.find((s) => s.id === id)!;
      for (const link of story.next) queue.push(storyForPath(link.href)!.id);
    }
    for (const story of publicStories()) expect(seen.has(story.id), `${story.id} is unreachable`).toBe(true);
  });

  it("promises nothing this release does not deliver", () => {
    const banned = [
      /paid in (hours|minutes|seconds)/i,
      /\binstant(ly)?\b/i,
      /pays? (out )?automatically|auto-?approv/i,
      /\*\d{3}#/,
      /\bguarantee/i,
      /\bOCR\b|reads? every/i,
      /cheapest|lowest price/i,
      /!/
    ];
    for (const story of VALUE_STORIES) {
      const text = [story.area, story.pain, story.answer, story.gain, story.doNow, ...story.next.map((n) => n.label)].join(" ");
      for (const pattern of banned) expect(text, `${story.id} ${pattern}`).not.toMatch(pattern);
    }
    const claims = VALUE_STORIES.find((s) => s.id === "claims-intake")!;
    expect(claims.answer).toMatch(/person makes every decision/i);
    expect(VALUE_STORIES.find((s) => s.id === "finance")!.answer).toMatch(/does not move money/i);
    expect(VALUE_STORIES.find((s) => s.id === "tax")!.answer).toMatch(/confirm them with the authority/i);
  });

  it("keeps each story short enough to read at a glance, with unique ids", () => {
    const ids = VALUE_STORIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const story of VALUE_STORIES) {
      expect(story.pain.length, story.id).toBeLessThanOrEqual(190);
      expect(story.answer.length, story.id).toBeLessThanOrEqual(260);
      // Every story says what is gained, not only what is fixed.
      expect(story.gain.length, story.id).toBeGreaterThan(30);
      expect(story.gain.length, story.id).toBeLessThanOrEqual(170);
      expect(story.gain, story.id).not.toMatch(/\d+ ?%|\b\d+x\b/);
      expect(story.id).toMatch(/^[a-z][a-z-]+$/);
    }
  });

  it("shares a public link with the pain and the answer, never a sign-in-only page", () => {
    const story = storyForPath("/dashboard/claims")!;
    expect(storyShareUrl(story, "https://getinsuros.com/")).toBe("https://getinsuros.com/why#claims");
    const text = storyShareText(story, "https://getinsuros.com");
    expect(text).toContain(story.pain);
    expect(text).toContain(story.answer);
    expect(text).not.toContain("/dashboard");
    expect(pageExists("/why")).toBe(true);
  });
});
