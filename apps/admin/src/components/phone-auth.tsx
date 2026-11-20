"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { redeemJoiningCode, signInWithPin } from "@/lib/auth/sign-in-actions";

/**
 * Sign-in without SMS (owner 20/11/26): phone + 4-digit PIN on any device.
 * The first time, a forgotten PIN or 5 wrong PINs: the joining code from the
 * person who manages your access, then a new PIN. All checks run on the server.
 */
export function PhoneAuth({
  phoneHint,
  next = "/dashboard",
  startWithCode = false
}: {
  phoneHint?: string;
  next?: string;
  startWithCode?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "code">(startWithCode ? "code" : "pin");
  const [phoneInput, setPhoneInput] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function go(to: string) {
    router.push(to);
    router.refresh();
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signInWithPin(phoneInput, pin, next).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    setPin("");
    if (!result.ok) {
      setError(result.error);
      if ("lockedOut" in result && result.lockedOut) setStep("code");
      return;
    }
    go(result.next);
  }

  async function redeem(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await redeemJoiningCode(phoneInput, code, next).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    go(result.next);
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
  const btnCls =
    "w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-medium text-white transition hover:bg-slate-800 disabled:opacity-60";
  const linkCls = "w-full text-center text-sm text-slate-500 underline";
  const phoneField = (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-600">Phone number</span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={phoneHint ? `${phoneHint} (last used here)` : "0712 345 678"}
        value={phoneInput}
        onChange={(event) => setPhoneInput(event.target.value)}
        className={inputCls}
        autoFocus
      />
    </label>
  );

  if (step === "code") {
    return (
      <form onSubmit={redeem} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Use your joining code</h1>
          <p className="mt-1 text-sm text-slate-500">
            First time, or forgot your PIN? The person who manages your access gives you a 6-digit joining code.
          </p>
        </div>
        {phoneField}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Joining code</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="482913"
            maxLength={7}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/[^\d ]/g, ""))}
            className={`${inputCls} text-center tracking-[0.4em]`}
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading || code.replace(/\D/g, "").length !== 6} className={btnCls}>
          {loading ? "Checking…" : "Continue"}
        </button>
        <button type="button" onClick={() => { setStep("pin"); setError(null); }} className={linkCls}>
          I already have a PIN
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={signIn} className="w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">InsurOS — staff and agents</p>
      </div>
      {phoneField}
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">4-digit PIN</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="••••"
          maxLength={4}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
          className={`${inputCls} text-center tracking-[0.6em]`}
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || pin.length !== 4} className={btnCls}>
        {loading ? "Checking…" : "Sign in"}
      </button>
      <button type="button" onClick={() => { setStep("code"); setError(null); }} className={linkCls}>
        First time, or forgot your PIN? Use a joining code
      </button>
    </form>
  );
}
