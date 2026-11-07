import { uniqueBy } from '@insuros/domain';

const field =
  'rounded-lg border border-line bg-paper/60 px-3 py-2 text-sm text-ink focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/20';

/**
 * Status filter for a list page. Submitted with the list's search as a GET
 * form, so the choice lives in the URL and the server applies it to the rows,
 * the summary cards and the CSV export alike. Each status appears once.
 */
export function StatusFilter({
  statuses,
  value,
  name = 'status',
  label = 'Status'
}: {
  statuses: readonly string[];
  value: string;
  name?: string;
  label?: string;
}) {
  const options = uniqueBy(statuses, (status) => status);
  return (
    <label className='flex items-center gap-2 text-sm text-dim'>
      <span className='sr-only'>{label}</span>
      <select name={name} defaultValue={options.includes(value) ? value : ''} className={field} aria-label={label}>
        <option value=''>All statuses</option>
        {options.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </label>
  );
}

/** Keep only rows whose status matches the filter (blank or unknown = all). */
export function applyStatusFilter<T extends { status: string }>(rows: readonly T[], statuses: readonly string[], status: string): T[] {
  return statuses.includes(status) ? rows.filter((row) => row.status === status) : [...rows];
}
