import { DEFAULT_TENANT_ID, DEMO_TENANT_ID } from "@insuros/domain";
import { setTenantResolver } from "@insuros/services";
import { getAuthMode } from "./auth/config";
import { isPlayReviewPhone } from "./play-review";
import { getSupabaseUser } from "./auth/session-user";

/**
 * Registers the request → tenant resolver used by persistence. The tenant is
 * derived from the SERVER session only: the Play reviewer's session is routed
 * to the isolated demo tenant; everyone else to the production tenant.
 * Outside a request (build time) it falls back to the default tenant.
 */
setTenantResolver(async () => {
  if (getAuthMode() !== "supabase") return DEFAULT_TENANT_ID;
  try {
    const user = await getSupabaseUser();
    return isPlayReviewPhone(user?.phone) ? DEMO_TENANT_ID : DEFAULT_TENANT_ID;
  } catch {
    return DEFAULT_TENANT_ID;
  }
});

export const tenantContextRegistered = true;
