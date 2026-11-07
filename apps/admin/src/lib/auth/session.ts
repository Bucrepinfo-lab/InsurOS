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
import { createSupabaseServerClient } from "../supabase/server";
import { getAuthMode } from "./config";

/**
 * Server-side session + authorization. Every dashboard layout, server action and
 * route handler that touches staff data goes through here — menus only mirror it.
 */
export type AuthState =
  | { status: "misconfigured" }
  | { status: "signed-out" }
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

/** Supabase user for this request (or null). Only valid in "supabase" mode. */
export const getSupabaseUser = cache(async () => {
  if (getAuthMode() !== "supabase") return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
});

export const getAuthState = cache(async (): Promise<AuthState> => {
  const mode = getAuthMode();
  if (mode === "misconfigured") return { status: "misconfigured" };
  if (mode === "open-dev") return { status: "active", principal: LOCAL_DEV_PRINCIPAL };

  const user = await getSupabaseUser();
  if (!user) return { status: "signed-out" };

  const principal = await principals.resolveForSession(
    {
      userId: user.id,
      phone: user.phone || null,
      email: user.email || null,
      displayName: (user.user_metadata?.full_name as string | undefined) || undefined
    },
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
  if (state.status === "pending") return { ok: false, status: 403, error: "access_pending" };
  if (scope && !principalCan(state.principal, scope, action)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  return { ok: true, principal: state.principal };
}
