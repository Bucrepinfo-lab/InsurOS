"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestSmsCode, unlockWithPin, verifySmsCode } from "@/lib/auth/sign-in-actions";

/**
 * Sign-in: phone → 6-digit SMS code on a new device (or after a forgotten /
 * locked PIN); 4-digit PIN on a trusted device. All checks run on the server.
 */
export function PhoneAuth({
  initialMode,
  phoneHint,
  next = "/dashboard",
  resetPin = false
}: {
  initialMode: "pin" | "sms";
  phoneHint?: string;
  next?: string;
  resetPin?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "phone" | "code">(initialMode === "pin" ? "pin" : "phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [reset, setReset] = useState(resetPin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function go(to: string) {
    router.push(to);
    router.refresh();
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestSmsCode(phoneInput).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    if (!result.ok || !("phone" in result) || !result.phone) {
      setError(result.error ?? "Something went wrong. Try again.");
      return;
    }
    setPhone(result.phone);
    setStep("code");
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await verifySmsCode(phone, code, { resetPin: reset, next }).catch(
      () => ({ ok: false, error: "Something went wrong. Try again." }) as const
    );
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    go(result.next);
  }

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await unlockWithPin(pin, next).catch(() => ({ ok: false, error: "Something went wrong. Try again." }) as const);
    setLoading(false);
    setPin("");
    if (!result.ok) {
      setError(result.error);
      if ("lockedOut" in result && result.lockedOut) {
        setReset(true);
        setStep("phone");
      }
      return;
    }
    go(result.next);
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
  const btnCls =
    "w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-medium text-white transition hover:bg-slate-800 disabled:opacity-60";
  const linkCls = "w-full text-center text-sm text-slate-500 underline";

  if (step === "pin") {
    return (
      <form onSubmit={unlock} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Enter your PIN</h1>
          <p className="mt-1 text-sm text-slate-500">Signed in on this device as {phoneHint}</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          aria-label="4-digit PIN"
          placeholder="••••"
          maxLength={4}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
          className={`${inputCls} text-center tracking-[0.6em]`}
          autoFocus
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading || pin.length !== 4} className={btnCls}>
          {loading ? "Checking…" : "Unlock"}
        </button>
        <button
          type="button"
          onClick={() => {
            setReset(true);
            setStep("phone");
            setError(null);
          }}
          className={linkCls}
        >
          Forgot PIN? Get an SMS code
        </button>
        <button
          type="button"
          onClick={() => {
            setReset(false);
            setStep("phone");
            setError(null);
          }}
          className={linkCls}
        >
          Use a different number
        </button>
      </form>
    );
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            {reset ? "Verify your number to choose a new PIN." : "InsurOS — staff and agents"}
          </p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Phone number</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712 345 678"
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
            className={inputCls}
            autoFocus
          />
        </label>
        <p className="text-xs text-slate-500">
          We&apos;ll text you a 6-digit code (valid for 5 minutes). On this device you&apos;ll then use a 4-digit PIN.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="w-full max-w-sm space-y-4">
      <p className="text-sm text-slate-600">
        Enter the 6-digit code sent to <span className="font-medium text-slate-900">{phone}</span>.
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        maxLength={6}
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
        className={`${inputCls} text-center tracking-[0.4em]`}
        autoFocus
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || code.length !== 6} className={btnCls}>
        {loading ? "Verifying…" : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setCode("");
          setError(null);
        }}
        className={linkCls}
      >
        Use a different number or resend
      </button>
    </form>
  );
}
