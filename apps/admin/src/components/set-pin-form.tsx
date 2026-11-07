"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { choosePin } from "@/lib/auth/sign-in-actions";

export function SetPinForm({ next, allowSkip }: { next: string; allowSkip: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await choosePin(pin, confirm, next).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(result.next);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-[0.6em] text-slate-900 outline-none focus:border-slate-900";

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Choose a 4-digit PIN</h1>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;ll use it to sign in on this device. A new device, a forgotten PIN or 5 wrong tries
          needs a new SMS code.
        </p>
      </div>
      <input type="password" inputMode="numeric" autoComplete="new-password" aria-label="New PIN" placeholder="••••" maxLength={4}
        value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} className={inputCls} autoFocus />
      <input type="password" inputMode="numeric" autoComplete="new-password" aria-label="Confirm PIN" placeholder="••••" maxLength={4}
        value={confirm} onChange={(event) => setConfirm(event.target.value.replace(/\D/g, ""))} className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || pin.length !== 4 || confirm.length !== 4}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-medium text-white disabled:opacity-60">
        {loading ? "Saving…" : "Save PIN"}
      </button>
      {allowSkip ? (
        <button type="button" onClick={() => { router.push(next); router.refresh(); }} className="w-full text-center text-sm text-slate-500 underline">
          Skip for now (demo access)
        </button>
      ) : null}
    </form>
  );
}
