/**
 * The way back from any page (owner 24/11/26: "whoever finds they are lost
 * must find the back tab to take them back"). PURE.
 *
 * - The trail is the pages visited in this browser tab, newest last. "Back"
 *   returns to the previous page in the trail, so it never leaves the app.
 * - With no previous page (opened from a WhatsApp link, a new tab, the Play
 *   app's first screen), "Back" goes to the page above this one instead.
 * - Breadcrumbs name every level, and only levels that are real pages link.
 */

export const TRAIL_LIMIT = 30;

const clean = (path: string) => {
  const bare = (path.split(/[?#]/)[0] ?? "").replace(/\/+$/, "");
  return bare || "/";
};

/** Add a visit to the trail. Coming back to the page before the last counts as going back. */
export function recordVisit(trail: readonly string[], path: string): string[] {
  const p = clean(path);
  const last = trail[trail.length - 1];
  if (last === p) return [...trail];
  if (trail.length >= 2 && trail[trail.length - 2] === p) return trail.slice(0, -1);
  return [...trail, p].slice(-TRAIL_LIMIT);
}

/** The previous page of this visit, or null when this is where the visit began. */
export function previousPage(trail: readonly string[], current: string): string | null {
  const p = clean(current);
  const at = trail.lastIndexOf(p);
  const before = at > 0 ? trail[at - 1] : null;
  return before && before !== p ? before : null;
}

const isParam = (segment: string) => segment.startsWith("[") && segment.endsWith("]");

/** The app route a path is served by, if any (e.g. "/dashboard/claims/[claimId]"). */
function routeFor(path: string, routes: readonly string[]): string | null {
  const parts = clean(path).split("/").filter(Boolean);
  // Prefer a fixed route over one with a placeholder ("new" before "[claimId]").
  let best: { route: string; params: number } | null = null;
  for (const route of routes) {
    const segs = route.split("/").filter(Boolean);
    if (segs.length !== parts.length) continue;
    if (!segs.every((seg, i) => isParam(seg) || seg === parts[i])) continue;
    const params = segs.filter(isParam).length;
    if (!best || params < best.params) best = { route, params };
  }
  return best?.route ?? null;
}

/** Whether a path is a page that exists (against the app's own route list). */
export function isPage(path: string, routes: readonly string[]): boolean {
  return routeFor(path, routes) !== null;
}

/** The nearest real page above this one; the home page of its area if none. */
export function parentPage(path: string, routes: readonly string[], home: string): string {
  const parts = clean(path).split("/").filter(Boolean);
  for (let n = parts.length - 1; n > 0; n--) {
    const candidate = `/${parts.slice(0, n).join("/")}`;
    if (isPage(candidate, routes)) return candidate;
  }
  return home;
}

export interface Crumb {
  label: string;
  /** Set when that level is a page someone can open. */
  href?: string;
}

const WORDS: Record<string, string> = {
  dashboard: "Home",
  fnol: "Claim notice",
  "home-links": "Customer home links",
  "follow-ups": "Follow-ups",
  "my-record": "My career record",
  operations: "Operations",
  marketplace: "Marketplace",
  governance: "Governance",
  new: "New"
};

const titleCase = (segment: string) =>
  WORDS[segment] ?? segment.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * Breadcrumbs for a workspace path. `labels` maps known pages to their menu
 * names; a record id (a claim number, a customer) is shown as it is.
 */
export function crumbsFor(path: string, routes: readonly string[], labels: Readonly<Record<string, string>> = {}): Crumb[] {
  const parts = clean(path).split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  for (let n = 1; n <= parts.length; n++) {
    const href = `/${parts.slice(0, n).join("/")}`;
    const segment = parts[n - 1]!;
    const route = routeFor(href, routes);
    // An id where the route has a placeholder is shown as typed; a fixed word gets its name.
    const routeSegment = route?.split("/").filter(Boolean)[n - 1];
    const isId = routeSegment ? isParam(routeSegment) : !routes.some((r) => r.split("/").filter(Boolean)[n - 1] === segment);
    const label = labels[href] ?? (isId ? decodeURIComponent(segment) : titleCase(segment));
    crumbs.push(route ? { label, href } : { label });
  }
  return crumbs;
}
