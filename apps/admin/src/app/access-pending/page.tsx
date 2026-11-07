import Link from "next/link";
import { redirect } from "next/navigation";
import { ServiceUnavailable } from "@/components/auth/service-unavailable";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthState } from "@/lib/auth/session";

export const metadata = { title: "Access pending" };
export const dynamic = "force-dynamic";

/**
 * Landing screen for a signed-in user who has no role yet. They see none of the
 * workspace — an administrator must grant a role to their login phone first.
 */
export default async function AccessPendingPage() {
  const state = await getAuthState();
  if (state.status === "misconfigured") return <ServiceUnavailable />;
  if (state.status === "signed-out") redirect("/sign-in");
  if (state.status === "active") redirect("/dashboard");

  const { principal } = state;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">InsurOS</p>
        <h1 className="text-xl font-semibold text-slate-900">Access pending</h1>
        <p className="text-sm text-slate-600">
          You are signed in{principal.phone ? <> as <strong>{principal.phone}</strong></> : null}, but
          your organisation has not given you a role yet. InsurOS is a staff tool for insurers,
          agencies and their agents — ask your administrator to grant access to this phone number,
          then reopen the app.
        </p>
        <div className="flex items-center justify-between pt-2">
          <Link href="/account/delete" className="text-sm text-slate-500 underline">
            Delete my account
          </Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
