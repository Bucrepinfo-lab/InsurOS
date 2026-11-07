"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/sign-in-actions";

/** Ends the session on this device; the device stays trusted (next time: PIN). */
export function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button
      onClick={onSignOut}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
    >
      Sign out
    </button>
  );
}
