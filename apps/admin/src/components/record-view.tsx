import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@insuros/ui';

/** One labelled value on a record page. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent>
        <p className='text-sm text-dim'>{label}</p>
        <div className='mt-2 font-medium text-ink'>{children}</div>
      </CardContent>
    </Card>
  );
}

/** A section with a heading, used on record pages. */
export function Section({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <Card>
      <CardContent>
        <h2 className='text-sm font-semibold text-ink'>{title}</h2>
        <div className='mt-3'>{children}</div>
        {note ? <p className='mt-4 text-sm text-dim'>{note}</p> : null}
      </CardContent>
    </Card>
  );
}

/** Plain statement shown where a step has not been recorded yet. */
export function NotYet({ children }: { children: ReactNode }) {
  return <p className='text-sm text-dim'>{children}</p>;
}

/** An inline link in the house style. */
export function RecordLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className='font-medium text-seal underline underline-offset-2 hover:text-sealdark'>
      {children}
    </Link>
  );
}

/** A row of label/value pairs (definition list). */
export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className='divide-y divide-line text-sm'>
      {rows.map(([label, value]) => (
        <div key={label} className='flex flex-wrap items-baseline justify-between gap-2 py-2'>
          <dt className='text-dim'>{label}</dt>
          <dd className='text-right font-medium text-ink'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
