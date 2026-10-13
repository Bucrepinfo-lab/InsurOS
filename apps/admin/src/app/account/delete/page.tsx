"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMyAccount } from "@/lib/delete-account";

/**
 * In-app account deletion (Google Play User Data policy). At /account/delete — use
 * this URL for the Play Data-safety "account deletion" link.
 */
export default function DeleteAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    setLoading(true);
    await deleteMyAccount();
    router.replace("/sign-in?status=deleted");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-red-700">Delete your account</h1>
        <p className="text-sm text-slate-600">
          This removes your InsurOS login and personal sign-in data. Your policies and
          claims are held by the insurer under their data-retention policy. This
          cannot be undone.
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
      </div>
    </main>
  );
}
