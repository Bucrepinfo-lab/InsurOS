import {
  ALL_REACH,
  NO_REACH,
  principalStaffIds,
  recordReach,
  type RecordArea,
  type RecordReach,
  type SessionPrincipal
} from "@insuros/domain";
import { getAuthState } from "./auth/session";
import { isPlayReviewPhone } from "./play-review";

/**
 * Record-level least privilege for pages and server actions. The rules live in
 * `packages/domain/src/record-scope.ts`; this only adapts the signed-in
 * principal. The store reviewer is confined to the isolated demo tenant by the
 * tenant resolver, so inside it they keep the demo tenant's full (read-mostly)
 * view.
 */
export function reachFor(principal: SessionPrincipal, area: RecordArea): RecordReach {
  if (isPlayReviewPhone(principal.phone)) {
    return principal.permissions.includes(`${area}:View`) ? ALL_REACH : NO_REACH;
  }
  return recordReach(principal, area);
}

/** The id stamped on records a user captures (staff id; owner/dev fall back to their login). */
export function actorIdFor(principal: SessionPrincipal): string {
  return (
    principalStaffIds(principal)[0] ??
    (isPlayReviewPhone(principal.phone) ? "play-review" : undefined) ??
    principal.clerkUserId ??
    principal.phone ??
    principal.email
  );
}

/** Reach of the current session (fails closed when not signed in / not active). */
export async function currentReach(area: RecordArea): Promise<RecordReach> {
  const state = await getAuthState();
  return state.status === "active" ? reachFor(state.principal, area) : NO_REACH;
}
