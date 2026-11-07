/** Shown when a production server is missing its sign-in settings (fail closed). */
export function ServiceUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">InsurOS is temporarily unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign-in is not configured on this server, so access is closed. Please try again later.
        </p>
      </div>
    </main>
  );
}
