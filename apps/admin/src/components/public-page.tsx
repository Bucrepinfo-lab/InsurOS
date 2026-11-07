import Link from "next/link";
import type { ReactNode } from "react";

/** Plain, readable shell for public pages (no sign-in required). */
export function PublicPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold text-slate-900">
            InsurOS
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/delete-account">Delete account</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {updated ? <p className="mt-1 text-sm text-slate-500">Last updated {updated}</p> : null}
        <div className="prose-public mt-6 space-y-4 text-[15px] leading-7">{children}</div>
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        InsurOS is a product of Telpen Systems Ltd, Kenya · telpeninfo@gmail.com
      </footer>
    </div>
  );
}
