import type { PermissionScope } from "./permission";

/**
 * Which permission each workspace page needs (standing rule 13, owner
 * 24/11/26 audit). The menu hides what a role may not open; this table is what
 * the SERVER checks, so typing an address cannot get around the menu.
 *
 * `null` means any active staff member (their own follow-ups, messages and
 * record). The longest matching prefix wins. A page under /dashboard that no
 * prefix covers is refused (fail closed); the coverage test lists every page.
 */
export const PAGE_SCOPES: ReadonlyArray<readonly [prefix: string, scope: PermissionScope | null]> = [
  ["/dashboard/tenants", "Platform"],
  ["/dashboard/legal", "Platform"],
  ["/dashboard/audit", "Platform"],
  ["/dashboard/identity", "Identity"],
  ["/dashboard/governance", "Identity"],
  ["/dashboard/marketplace", "Marketplace"],
  ["/dashboard/sales", "Marketplace"],
  ["/dashboard/subscribers", "Customers"],
  ["/dashboard/customers", "Customers"],
  ["/dashboard/policies", "Policies"],
  ["/dashboard/claims", "Claims"],
  ["/dashboard/finance", "Finance"],
  ["/dashboard/operations", "Operations"],
  ["/dashboard/activity", "Operations"],
  ["/dashboard/notifications", "Operations"],
  ["/dashboard/comments", "Operations"],
  ["/dashboard/attachments", "Operations"],
  ["/dashboard/follow-ups", null],
  ["/dashboard/messages", null],
  ["/dashboard/my-record", null]
];

export type PageScope =
  | { known: true; scope: PermissionScope | null }
  | { known: false };

const clean = (path: string) => (path.split(/[?#]/)[0] ?? "").replace(/\/+$/, "") || "/";

/** The permission a page needs, from its route (`/dashboard/claims/[claimId]`) or a real path. */
export function scopeForPage(path: string): PageScope {
  const p = clean(path);
  if (p === "/dashboard") return { known: true, scope: null };
  let best: (typeof PAGE_SCOPES)[number] | undefined;
  for (const entry of PAGE_SCOPES) {
    const [prefix] = entry;
    if ((p === prefix || p.startsWith(`${prefix}/`)) && (!best || prefix.length > best[0].length)) best = entry;
  }
  return best ? { known: true, scope: best[1] } : { known: false };
}
