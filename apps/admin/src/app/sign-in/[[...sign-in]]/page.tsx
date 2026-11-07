import Link from "next/link";
import { Suspense } from "react";
import { PhoneAuth } from "@/components/phone-auth";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4">
      <Suspense>
        <PhoneAuth />
      </Suspense>
      <p className="max-w-sm text-center text-xs text-slate-500">
        By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> and
        acknowledge the <Link href="/privacy" className="underline">Privacy policy</Link>.
      </p>
    </main>
  );
}
