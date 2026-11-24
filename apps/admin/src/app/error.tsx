"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Last-resort screen when a page fails on the server or in the browser.
 * Says what happened and how to carry on; never shows the technical error
 * (it may hold internal details). The error reference helps support find
 * the server log entry.
 */
export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("InsurOS page error", error.digest ?? "");
  }, [error]);

  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-sheet p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">InsurOS</p>
        <h1 className="text-xl font-semibold text-slate-900">This page didn&apos;t load</h1>
        <p className="text-sm text-slate-600">
          Something went wrong on our side. Try again; if it keeps
          happening, email telpeninfo@gmail.com
          {error.digest ? <> and quote reference <strong className="font-mono">{error.digest}</strong></> : null}.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-seal px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
          <Link href="/dashboard" className="text-sm text-slate-600 underline">
            Back to my workspace
          </Link>
        </div>
      </div>
    </main>
  );
}
