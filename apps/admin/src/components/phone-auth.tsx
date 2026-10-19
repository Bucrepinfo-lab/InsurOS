"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toE164 } from "@insuros/domain";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Phone → SMS-OTP auth. One flow covers sign-up AND sign-in (Supabase creates the
 * user on first OTP). The verified phone becomes the login + M-Pesa identity.
 */
export function PhoneAuth({ afterAuthUrl = "/dashboard" }: { afterAuthUrl?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || afterAuthUrl;
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const e164 = toE164(phoneInput);
    if (!e164) {
      setError("Enter a valid phone number, e.g. 0712 345 678.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPhone(e164);
    setStep("otp");
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: code.trim(), type: "sms" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
  const btnCls =
    "w-full rounded-xl bg-slate-900 px-4 py-3 text-lg font-medium text-white transition hover:bg-slate-800 disabled:opacity-60";

  if (step === "phone") {
    return (
      <form onSubmit={sendCode} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">InsurOS — the underwriter&apos;s ledger</p>
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
          We&apos;ll text you a 6-digit code. This number is also your M-Pesa number for premiums.
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
        Enter the code sent to <span className="font-medium text-slate-900">{phone}</span>.
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
      <button type="submit" disabled={loading || code.length < 4} className={btnCls}>
        {loading ? "Verifying…" : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setCode("");
          setError(null);
        }}
        className="w-full text-center text-sm text-slate-500 underline"
      >
        Use a different number
      </button>
    </form>
  );
}
