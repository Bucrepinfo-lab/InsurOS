import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'InsurOS — insurance operations for insurers and agencies',
  description:
    'Staff and agent workspace for insurers and agencies: customers, policies, claims and finance operations with role-based access.'
};

/**
 * Public landing. The installed Android app (TWA) opens /?source=twa and goes
 * straight to the workspace (which sends signed-out users to sign-in).
 */
export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  if (source === 'twa' || source === 'pwa') redirect('/dashboard');

  return (
    <main className='flex min-h-screen flex-col bg-slate-50 text-slate-800'>
      <section className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16'>
        <p className='font-mono text-xs uppercase tracking-[0.2em] text-slate-500'>Telpen Systems Ltd</p>
        <h1 className='mt-3 text-4xl font-semibold text-slate-900'>InsurOS</h1>
        <p className='mt-4 max-w-xl text-lg text-slate-600'>
          The operations workspace for insurance companies, agencies and their agents — customers,
          policies, claims and finance, with each person seeing only what their role allows.
        </p>
        <p className='mt-3 max-w-xl text-sm text-slate-500'>
          For staff and agents of organisations using InsurOS. Your administrator grants access to
          your phone number. InsurOS does not sell insurance to the public.
        </p>
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link href='/sign-in' className='rounded-xl bg-slate-900 px-5 py-3 font-medium text-white'>
            Sign in with your phone
          </Link>
          <a href='mailto:telpeninfo@gmail.com?subject=InsurOS' className='rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-800'>
            Contact us
          </a>
        </div>
      </section>
      <footer className='border-t border-slate-200 py-6 text-center text-sm text-slate-500'>
        <Link href='/privacy' className='underline'>Privacy</Link> ·{' '}
        <Link href='/terms' className='underline'>Terms</Link> ·{' '}
        <Link href='/delete-account' className='underline'>Delete account</Link>
      </footer>
    </main>
  );
}
