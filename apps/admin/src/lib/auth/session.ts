import { cache } from "react";
import {
  ALL_PERMISSION_KEYS,
  hasPermission,
  parsePhoneAllowlist,
  toE164,
  type PermissionAction,
  type PermissionScope,
  type SessionPrincipal
} from "@insuros/domain";
import { PrincipalService } from "@insuros/services";
import { fail, type ActionResult } from "../action-result";
import { isPlayReviewPhone } from "../play-review";
import "../tenant-context";
import { getAuthMode } from "./config";
import { getSessionIdentity } from "./session-user";
import { getDeviceAuth } from "./device-auth";

/**
 * Server-side session + authorization. Every dashboard layout, server action and
 * route handler that touches staff data goes through here — menus only mirror it.
 */
export type AuthState =
  | { status: "misconfigured" }
  | { status: "signed-out" }
  /** Verified by SMS, but must choose a 4-digit PIN before using the app. */
  | { status: "needs-pin" }
  | { status: "pending"; principal: SessionPrincipal }
  | { status: "active"; principal: SessionPrincipal };

const principals = new PrincipalService();

/** Bootstrap allowlist for the first platform owner(s). Names only in logs. */
export function platformOwnerPhones(): string[] {
  return parsePhoneAllowlist(process.env.PLATFORM_OWNER_PHONES, (value) => toE164(value));
}

const LOCAL_DEV_PRINCIPAL: SessionPrincipal = {
  email: "dev@insuros.local",
  name: "Local developer",
  assignments: [],
  permissions: [...ALL_PERMISSION_KEYS],
  accessibleRegionIds: [],
  isUnmapped: false,
  isPlatformOwner: true
};

export { getSessionIdentity };

/**
 * Store reviewer (Google Play): read-mostly demo access, routed to the isolated
 * demo tenant by lib/tenant-context.ts. No identity/platform administration.
 */
const PLAY_REVIEWER_PERMISSIONS = [
  "Claims:View", "Claims:Create",
  "Policies:View", "Policies:Create",
  "Customers:View", "Customers:Create",
  "Marketplace:View", "Finance:View", "Operations:View"
];

export const getAuthState = cache(async (): Promise<AuthState> => {
  const mode = getAuthMode();
  if (mode === "misconfigured") return { status: "misconfigured" };
  if (mode === "open-dev") return { status: "active", principal: LOCAL_DEV_PRINCIPAL };

  const user = await getSessionIdentity();
  if (!user) return { status: "signed-out" };

  if (isPlayReviewPhone(user.phone)) {
    return {
      status: "active",
      principal: {
        clerkUserId: user.userId,
        email: "play-review@demo.insuros",
        phone: user.phone,
        name: "Store reviewer (demo data)",
        assignments: [],
        permissions: PLAY_REVIEWER_PERMISSIONS,
        accessibleRegionIds: [],
        isUnmapped: false
      }
    };
  }

  if (!(await getDeviceAuth().hasPin(user.userId))) return { status: "needs-pin" };

  const principal = await principals.resolveForSession(
    { userId: user.userId, phone: user.phone },
    platformOwnerPhones()
  );

  return principal.isUnmapped ? { status: "pending", principal } : { status: "active", principal };
});

export function principalCan(
  principal: SessionPrincipal,
  scope: PermissionScope,
  action: PermissionAction
): boolean {
  return hasPermission(principal.permissions, scope, action);
}

export type ActionAuthorization =
  | { ok: true; principal: SessionPrincipal }
  | { ok: false; result: ActionResult };

/**
 * Server-action guard. Pass `null` for scope to require only an active (mapped)
 * staff session. Never trusts anything sent by the client.
 */
export async function authorizeAction(
  scope: PermissionScope | null,
  action: PermissionAction = "View"
): Promise<ActionAuthorization> {
  const state = await getAuthState();
  if (state.status === "misconfigured") {
    return { ok: false, result: fail("Service unavailable", "Sign-in is not configured on this server.") };
  }
  if (state.status === "signed-out") {
    return { ok: false, result: fail("Sign in required", "Your session has ended — sign in again.") };
  }
  if (state.status === "needs-pin") {
    return { ok: false, result: fail("Set your PIN", "Choose a 4-digit PIN to finish signing in.") };
  }
  if (state.status === "pending") {
    return { ok: false, result: fail("Access pending", "An administrator has not granted you a role yet.") };
  }
  if (scope && !principalCan(state.principal, scope, action)) {
    return {
      ok: false,
      result: fail("Not permitted", `Your role does not allow ${scope}:${action}.`)
    };
  }
  return { ok: true, principal: state.principal };
}

/** Convenience for actions: returns a denial receipt, or null when allowed. */
export async function denyUnless(
  scope: PermissionScope | null,
  action: PermissionAction = "View"
): Promise<ActionResult | null> {
  const auth = await authorizeAction(scope, action);
  return auth.ok ? null : auth.result;
}

export type RouteAuthorization =
  | { ok: true; principal: SessionPrincipal }
  | { ok: false; status: 401 | 403 | 503; error: string };

/** Route-handler guard (JSON APIs): 503 misconfigured, 401 no session, 403 no permission. */
export async function authorizeRequest(
  scope: PermissionScope | null,
  action: PermissionAction = "View"
): Promise<RouteAuthorization> {
  const state = await getAuthState();
  if (state.status === "misconfigured") return { ok: false, status: 503, error: "auth_not_configured" };
  if (state.status === "signed-out") return { ok: false, status: 401, error: "unauthenticated" };
  if (state.status === "needs-pin") return { ok: false, status: 401, error: "pin_required" };
  if (state.status === "pending") return { ok: false, status: 403, error: "access_pending" };
  if (scope && !principalCan(state.principal, scope, action)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  return { ok: true, principal: state.principal };
}
