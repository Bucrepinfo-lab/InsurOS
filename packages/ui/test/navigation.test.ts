import { describe, expect, it } from "vitest";
import { adminNavigation } from "../src/navigation/navigation-config";
import { filterNavigationByPermissions } from "../src/navigation/permission-filter";

const ALL = ["Platform:View", "Identity:View", "Marketplace:View", "Customers:View", "Policies:View", "Claims:View", "Finance:View", "Operations:View"];
const visibleHrefs = (permissions: string[]) =>
  filterNavigationByPermissions(adminNavigation, { permissions }).flatMap((s) => s.items.map((i) => i.href));

describe("menu shows the working flow only (owner 24/11/26)", () => {
  it("keeps hidden pages out of the menu for every role", () => {
    const shown = visibleHrefs(ALL);
    for (const item of adminNavigation.flatMap((s) => s.items).filter((i) => i.hidden)) {
      expect(shown, item.href).not.toContain(item.href);
    }
  });

  it("shows the core flow: customer, policy, claim, escalation, approval, proof", () => {
    const shown = visibleHrefs(ALL);
    for (const href of [
      "/dashboard",
      "/dashboard/follow-ups",
      "/dashboard/customers",
      "/dashboard/policies",
      "/dashboard/claims",
      "/dashboard/finance",
      "/dashboard/operations/escalations",
      "/dashboard/operations/approvals",
      "/dashboard/audit"
    ]) {
      expect(shown, href).toContain(href);
    }
  });

  it("still filters by permission: a claims-only role sees no finance or platform pages", () => {
    const shown = visibleHrefs(["Claims:View"]);
    expect(shown).toContain("/dashboard/claims");
    expect(shown).not.toContain("/dashboard/finance");
    expect(shown).not.toContain("/dashboard/tenants");
  });
});
