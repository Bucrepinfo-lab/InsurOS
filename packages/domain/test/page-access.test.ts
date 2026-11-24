import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { PAGE_SCOPES, scopeForPage } from "../src";

const root = join(__dirname, "..", "..", "..");
const dashboardDir = join(root, "apps", "admin", "src", "app", "dashboard");

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return pages(full);
    return name === "page.tsx" ? [full] : [];
  });
}

const routeOf = (file: string) =>
  "/" + relative(join(root, "apps", "admin", "src", "app"), file).split(sep).slice(0, -1).join("/");

describe("every workspace page checks access on the server (standing rule 13, audit 24/11/26)", () => {
  const files = pages(dashboardDir);

  it("finds the workspace pages", () => {
    expect(files.length).toBeGreaterThan(60);
  });

  it("calls requirePageAccess with its own route as its first step", () => {
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      const route = routeOf(file);
      expect(src, route).toContain(`await requirePageAccess("${route}");`);
      // Nothing is loaded before the check: the guard is the page's first await.
      const body = src.slice(src.indexOf("export default async function"));
      expect(body.indexOf("await "), `${route}: guard must come first`).toBe(body.indexOf(`await requirePageAccess("${route}")`));
    }
  });

  it("knows the permission of every page (none falls through to refused by accident)", () => {
    for (const file of files) expect(scopeForPage(routeOf(file)).known, routeOf(file)).toBe(true);
  });
});

describe("scopeForPage", () => {
  it("uses the longest matching prefix and ignores ids, queries and trailing slashes", () => {
    expect(scopeForPage("/dashboard")).toEqual({ known: true, scope: null });
    expect(scopeForPage("/dashboard/claims/CLM-2026-0001/settlement")).toEqual({ known: true, scope: "Claims" });
    expect(scopeForPage("/dashboard/claims/[claimId]/fnol")).toEqual({ known: true, scope: "Claims" });
    expect(scopeForPage("/dashboard/finance/tax/regional?x=1")).toEqual({ known: true, scope: "Finance" });
    expect(scopeForPage("/dashboard/customers/")).toEqual({ known: true, scope: "Customers" });
    expect(scopeForPage("/dashboard/follow-ups")).toEqual({ known: true, scope: null });
  });

  it("does not let a look-alike prefix borrow another page's rule", () => {
    expect(scopeForPage("/dashboard/claimsx")).toEqual({ known: false });
    expect(scopeForPage("/dashboard/something-new")).toEqual({ known: false });
  });

  it("keeps platform and identity administration away from ordinary roles", () => {
    expect(scopeForPage("/dashboard/tenants")).toEqual({ known: true, scope: "Platform" });
    expect(scopeForPage("/dashboard/audit")).toEqual({ known: true, scope: "Platform" });
    expect(scopeForPage("/dashboard/governance/access")).toEqual({ known: true, scope: "Identity" });
  });

  it("lets the Play reviewer open every page in its menu (demo data only)", () => {
    const reviewer = new Set(["Claims", "Policies", "Customers", "Marketplace", "Finance", "Operations"]);
    for (const href of [
      "/dashboard",
      "/dashboard/follow-ups",
      "/dashboard/messages",
      "/dashboard/marketplace",
      "/dashboard/customers",
      "/dashboard/customers/home-links",
      "/dashboard/policies",
      "/dashboard/claims",
      "/dashboard/finance",
      "/dashboard/operations/escalations",
      "/dashboard/operations/approvals"
    ]) {
      const page = scopeForPage(href);
      expect(page.known, href).toBe(true);
      if (page.known && page.scope) expect(reviewer.has(page.scope), href).toBe(true);
    }
  });

  it("has no duplicate prefixes", () => {
    const prefixes = PAGE_SCOPES.map(([p]) => p);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});
