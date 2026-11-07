import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { PermissionScope } from "@insuros/domain";
import { getAuthState, principalCan } from "@/lib/auth/session";
import { ServiceUnavailable } from "./service-unavailable";

/**
 * Server-side section gate. Each dashboard section layout wraps its pages in
 * this, so a user without `<scope>:View` never receives that section's data —
 * regardless of what the menu shows or what URL they type.
 */
export async function ScopeGate({ scope, children }: { scope: PermissionScope; children: ReactNode }) {
  const state = await getAuthState();
  if (state.status === "misconfigured") return <ServiceUnavailable />;
  if (state.status === "signed-out") redirect("/sign-in");
  if (state.status === "needs-pin") redirect("/set-pin");
  if (state.status === "pending") redirect("/access-pending");

  if (!principalCan(state.principal, scope, "View")) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-ink/10 bg-sheet/70 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">403 · {scope}</p>
        <h1 className="mt-3 text-xl font-semibold text-ink">Not part of your role</h1>
        <p className="mt-2 text-sm text-ink/70">
          Your role does not include the {scope.toLowerCase()} area. Ask your administrator if you
          need it.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
