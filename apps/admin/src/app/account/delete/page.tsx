"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteMyAccount } from "@/lib/delete-account";

const ERRORS: Record<string, string> = {
  unauthenticated: "Your session has ended. Sign in again, then retry.",
  not_configured:
    "Deletion is temporarily unavailable on this server. Email telpeninfo@gmail.com from your registered details and we will delete the account manually.",
  provider_error: "We could not delete your account just now. Please try again, or email telpeninfo@gmail.com."
};

/**
 * In-app account deletion (Google Play User Data policy), for signed-in users.
 * The public instructions page is /delete-account (the Play "deletion URL").
 */
export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteMyAccount();
    if (!result.ok) {
      setError(ERRORS[result.reason] ?? ERRORS.provider_error);
      setLoading(false);
      return;
    }
    router.replace("/delete-account?status=deleted");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-red-700">Delete your account</h1>
        <p className="text-sm text-slate-600">
          This permanently deletes your InsurOS sign-in account and erases your staff
          profile (name, phone and role grants). Payment-ledger entries are kept as
          anonymous financial records. Policy and claim records belong to the insurer
          you worked for and are kept under their retention rules. This cannot be undone.
        </p>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Type DELETE to confirm</span>
          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="DELETE"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-600"
          />
        </label>
        <button
          type="button"
          disabled={loading || confirm !== "DELETE"}
          onClick={onDelete}
          className="w-full rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Permanently delete my account"}
        </button>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-slate-500">
          More detail: <Link href="/privacy" className="underline">Privacy policy</Link> ·{" "}
          <Link href="/delete-account" className="underline">Deletion help</Link>
        </p>
      </div>
    </main>
  );
}
