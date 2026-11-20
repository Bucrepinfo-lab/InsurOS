import Link from "next/link";
import { InsurOSLogo } from "@insuros/ui";
import { PhoneAuth } from "@/components/phone-auth";
import { signInHint } from "@/lib/auth/sign-in-actions";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;
  const startWithCode = reset === "1";
  const { phoneHint } = await signInHint();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-4">
      <Link href="/" aria-label="InsurOS home">
        <InsurOSLogo size={44} tagline />
      </Link>
      <PhoneAuth
        phoneHint={phoneHint}
        next={next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"}
        startWithCode={startWithCode}
      />
      <p className="max-w-sm text-center text-xs text-slate-500">
        By signing in you agree to the <Link href="/terms" className="underline">Terms</Link> and
        acknowledge the <Link href="/privacy" className="underline">Privacy policy</Link>.
      </p>
    </main>
  );
}
