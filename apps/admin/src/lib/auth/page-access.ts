import { notFound, redirect } from "next/navigation";
import { scopeForPage, type SessionPrincipal } from "@insuros/domain";
import { getAuthState, principalCan } from "./session";

/**
 * First line of every workspace page (standing rule 13). Decides on the server,
 * from the session, whether this person may open the page; the menu only hides.
 *
 * - not signed in / no PIN / no role: sent to the matching screen (as the layout does);
 * - role lacks the page's View permission, or the page is not in PAGE_SCOPES:
 *   "not found" (the page's existence is not revealed).
 *
 * `route` is the page's own route as written in the app folder, e.g.
 * "/dashboard/claims/[claimId]/fnol"; a test checks every page passes its own.
 */
export async function requirePageAccess(route: string): Promise<SessionPrincipal> {
  const state = await getAuthState();
  if (state.status === "misconfigured" || state.status === "signed-out") redirect("/sign-in?next=/dashboard");
  if (state.status === "needs-pin") redirect("/set-pin");
  if (state.status === "pending") redirect("/access-pending");

  const page = scopeForPage(route);
  if (!page.known) notFound();
  if (page.scope && !principalCan(state.principal, page.scope, "View")) notFound();
  return state.principal;
}
