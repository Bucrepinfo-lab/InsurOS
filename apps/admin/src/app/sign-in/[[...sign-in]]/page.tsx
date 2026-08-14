import { Suspense } from "react";
import { PhoneAuth } from "@/components/phone-auth";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense>
        <PhoneAuth />
      </Suspense>
    </main>
  );
}
