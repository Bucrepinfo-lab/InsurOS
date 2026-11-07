import Link from "next/link";
import { PhoneAuth } from "@/components/phone-auth";
import { signInMode } from "@/lib/auth/sign-in-actions";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;
  const resetPin = reset === "1";
  const mode = resetPin ? { mode: "sms" as const } : await signInMode();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
      <PhoneAuth
        initialMode={mode.mode}
        phoneHint={mode.mode === "pin" ? mode.phoneHint : undefined}
        next={next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"}
        resetPin={resetPin}
      />
      <p className="max-w-sm text-center text-xs text-slate-500">
        By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> and
        acknowledge the <Link href="/privacy" className="underline">Privacy policy</Link>.
      </p>
    </main>
  );
}
