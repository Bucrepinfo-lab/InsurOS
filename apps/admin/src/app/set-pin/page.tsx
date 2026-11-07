import { redirect } from "next/navigation";
import { SetPinForm } from "@/components/set-pin-form";
import { getSessionIdentity } from "@/lib/auth/session";
import { isPlayReviewPhone } from "@/lib/play-review";

export const metadata = { title: "Choose your PIN" };
export const dynamic = "force-dynamic";

/** After a verified SMS code: choose the 4-digit PIN for this trusted device. */
export default async function SetPinPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const identity = await getSessionIdentity();
  if (!identity) redirect("/sign-in");
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <SetPinForm next={safeNext} allowSkip={isPlayReviewPhone(identity.phone)} />
    </main>
  );
}
