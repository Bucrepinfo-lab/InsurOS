import Link from "next/link";

export const metadata = { title: "Page not found" };

/**
 * Shown for any address that does not exist, and for a record the signed-in
 * person may not open (the server answers "not found" rather than revealing
 * that the record exists).
 */
export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-sheet p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">InsurOS</p>
        <h1 className="text-xl font-semibold text-slate-900">We can&apos;t find that page</h1>
        <p className="text-sm text-slate-600">
          The link may be old, the record may have been removed, or your role may not cover it.
          Go back to your workspace and pick it from the menu, or ask your administrator for access.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg bg-seal px-4 py-2 text-sm font-medium text-white"
        >
          Back to my workspace
        </Link>
      </div>
    </main>
  );
}
