"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { chooseFirstPin, redeemJoiningCode, signInWithPin, startDemoVisit } from "@/lib/auth/sign-in-actions";

/**
 * Sign-in without SMS or codes (owner 20/11/26, 26/11/26): phone + 4-digit
 * PIN on any device. The first time, choose the PIN here. A forgotten PIN or
 * 5 wrong PINs: the person who manages your access clears it, then choose a
 * new one here. The "code" step is only the platform owner's emergency
 * recovery (unlinked /sign-in?reset=1). All checks run on the server.
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
  const [step, setStep] = useState<"pin" | "first" | "code">(startWithCode ? "code" : "pin");
  const [phoneInput, setPhoneInput] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
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
      if ("needsPin" in result && result.needsPin) setStep("first");
      setError(result.error);
      return;
    }
    go(result.next);
  }

  async function lookAround() {
    setError(null);
    setLoading(true);
    const result = await startDemoVisit().catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    go(result.next);
  }

  async function chooseFirst(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await chooseFirstPin(phoneInput, pin, confirm, next).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Owner recovery</h1>
          <p className="mt-1 text-sm text-slate-500">
            For the platform owner only. Staff: ask the person who manages your access to clear your PIN, then choose a new one.
          </p>
        </div>
        {phoneField}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Recovery code</span>
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

  if (step === "first") {
    const pinInput = (label: string, value: string, set: (v: string) => void) => (
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">{label}</span>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          placeholder="••••"
          maxLength={4}
          value={value}
          onChange={(event) => set(event.target.value.replace(/\D/g, ""))}
          className={`${inputCls} text-center tracking-[0.6em]`}
        />
      </label>
    );
    return (
      <form onSubmit={chooseFirst} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Choose your PIN</h1>
          <p className="mt-1 text-sm text-slate-500">
            First time here, or your administrator cleared your PIN? Enter the phone number you were added with and choose
            4 digits. No code is sent and you never type one.
          </p>
        </div>
        {phoneField}
        {pinInput("New 4-digit PIN", pin, setPin)}
        {pinInput("Repeat the PIN", confirm, setConfirm)}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading || pin.length !== 4 || confirm.length !== 4} className={btnCls}>
          {loading ? "Saving…" : "Save PIN and sign in"}
        </button>
        <button type="button" onClick={() => { setStep("pin"); setError(null); setPin(""); setConfirm(""); }} className={linkCls}>
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
      <button type="button" onClick={() => { setStep("first"); setError(null); setPin(""); setConfirm(""); }} className={linkCls}>
        First time here? Choose your PIN
      </button>
      <p className="text-center text-xs text-slate-500">
        Forgot your PIN? Ask the person who manages your access to clear it, then choose a new one here.
      </p>
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={lookAround}
          disabled={loading}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Look around the demo
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          No account needed. A sample insurance office with made-up policies, customers and claims. You can look at
          everything but change nothing.
        </p>
      </div>
    </form>
  );
}
