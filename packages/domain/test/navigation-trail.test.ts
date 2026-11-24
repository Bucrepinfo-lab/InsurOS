import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { crumbsFor, isPage, parentPage, previousPage, recordVisit, TRAIL_LIMIT } from "../src";

const root = join(__dirname, "..", "..", "..");
const src = join(root, "apps", "admin", "src");
const appDir = join(src, "app");

function pageRoutes(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return pageRoutes(full);
    if (name !== "page.tsx") return [];
    const route = "/" + relative(appDir, dir).split(sep).join("/");
    return [route === "/" ? "/" : route.replace(/\/$/, "")];
  });
}

const ROUTES = (() => {
  const text = readFileSync(join(src, "lib", "page-routes.ts"), "utf8");
  return [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
})();

describe("the way back from any page (owner 24/11/26)", () => {
  it("keeps the app's route list in sync with the app folder", () => {
    const actual = pageRoutes(appDir).filter((r) => !r.includes("[[...")).sort();
    const listed = ROUTES.filter((r) => r !== "/sign-in").sort();
    expect(listed).toEqual(actual);
  });

  it("goes back to the previous page of this visit, and only within the app", () => {
    let trail: string[] = [];
    for (const p of ["/dashboard", "/dashboard/claims", "/dashboard/claims/CLM-2026-0001", "/dashboard/claims/CLM-2026-0001/settlement"]) {
      trail = recordVisit(trail, p);
    }
    expect(previousPage(trail, "/dashboard/claims/CLM-2026-0001/settlement")).toBe("/dashboard/claims/CLM-2026-0001");
    // Going back shortens the trail instead of growing it.
    trail = recordVisit(trail, "/dashboard/claims/CLM-2026-0001");
    expect(trail.at(-1)).toBe("/dashboard/claims/CLM-2026-0001");
    expect(previousPage(trail, "/dashboard/claims/CLM-2026-0001")).toBe("/dashboard/claims");
    // The first page of a visit (e.g. opened from a WhatsApp link) has nothing before it.
    expect(previousPage(["/my/abc"], "/my/abc")).toBeNull();
  });

  it("ignores reloads and query strings, and stays short", () => {
    let trail = recordVisit([], "/dashboard/claims?status=Open");
    trail = recordVisit(trail, "/dashboard/claims");
    expect(trail).toEqual(["/dashboard/claims"]);
    for (let i = 0; i < 100; i++) trail = recordVisit(trail, `/dashboard/claims/CLM-${i}`);
    expect(trail.length).toBe(TRAIL_LIMIT);
  });

  it("finds the real page above when there is no previous page", () => {
    expect(parentPage("/dashboard/claims/CLM-2026-0001/settlement", ROUTES, "/dashboard")).toBe("/dashboard/claims/CLM-2026-0001");
    expect(parentPage("/dashboard/claims/CLM-2026-0001", ROUTES, "/dashboard")).toBe("/dashboard/claims");
    // /dashboard/customers/x/policies is not a page, so it is skipped.
    expect(parentPage("/dashboard/customers/demo-customer/policies/POL-1/coverages", ROUTES, "/dashboard")).toBe("/dashboard/customers/demo-customer");
    expect(parentPage("/my/abc/receipts/T1", ROUTES, "/")).toBe("/my/abc");
    expect(parentPage("/privacy", ROUTES, "/")).toBe("/");
  });

  it("links breadcrumbs only to pages that exist, and names them like the menu", () => {
    const crumbs = crumbsFor("/dashboard/claims/CLM-2026-0001/settlement", ROUTES, { "/dashboard": "Home", "/dashboard/claims": "Claims" });
    expect(crumbs).toEqual([
      { label: "Home", href: "/dashboard" },
      { label: "Claims", href: "/dashboard/claims" },
      { label: "CLM-2026-0001", href: "/dashboard/claims/CLM-2026-0001" },
      { label: "Settlement", href: "/dashboard/claims/CLM-2026-0001/settlement" }
    ]);
    const deep = crumbsFor("/dashboard/customers/demo-customer/policies/POL-1/premium", ROUTES);
    expect(deep.find((c) => c.label === "Policies")?.href).toBeUndefined();
    expect(isPage("/dashboard/claims/new", ROUTES)).toBe(true);
    expect(crumbsFor("/dashboard/claims/new", ROUTES).at(-1)?.label).toBe("New");
  });

  it("downloads files instead of opening them in place, so the page (and its Back) stays", () => {
    const routes: string[] = [];
    const walk = (dir: string) =>
      readdirSync(dir).forEach((name) => {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (name === "route.ts") routes.push(full);
      });
    walk(appDir);
    const pdfs = routes.filter((file) => readFileSync(file, "utf8").includes("application/pdf"));
    expect(pdfs.length).toBeGreaterThanOrEqual(4);
    for (const file of pdfs) {
      expect(readFileSync(file, "utf8"), relative(appDir, file)).toMatch(/content-disposition['"]?\s*:\s*`?['"]?attachment/i);
    }
  });

  it("puts Back on the workspace, public, customer and account pages", () => {
    const read = (file: string) => readFileSync(join(src, file), "utf8");
    expect(read("components/dashboard-shell.tsx")).toContain("<WorkspaceNavBar />");
    expect(read("components/workspace-nav-bar.tsx")).toContain("<BackLink");
    expect(read("app/layout.tsx")).toContain("<TrailRecorder />");
    for (const file of ["components/public-page.tsx", "app/contact/page.tsx", "app/c/[token]/page.tsx", "app/why/page.tsx", "app/account/delete/page.tsx"]) {
      expect(read(file), file).toContain("<BackLink");
    }
    expect(read("app/my/[token]/receipts/[txnId]/page.tsx")).toContain("Back to my cover");
  });
});
