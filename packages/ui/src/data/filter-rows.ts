import { displayValue } from '../utils/date-format';

/** Minimal column shape needed to read a cell as text (matches DataTableColumn). */
export interface TextColumn<TData> {
  key: keyof TData | string;
  header: string;
  render?: (row: TData) => unknown;
}

/**
 * The text a cell shows (and exports): a column's render output when it is
 * plain text, otherwise the raw value with ISO dates shown day-first.
 */
export function cellText<TData>(row: TData, column: TextColumn<TData>): string {
  if (column.render) {
    const rendered = column.render(row);
    if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered);
  }
  return displayValue((row as Record<string, unknown>)[String(column.key)]);
}

/** One row as the list of cell texts, in column order. */
export function rowCells<TData>(row: TData, columns: readonly TextColumn<TData>[]): string[] {
  return columns.map((column) => cellText(row, column));
}

/** Case-insensitive text match over every visible cell (blank query = all rows). */
export function filterRows<TData>(rows: readonly TData[], columns: readonly TextColumn<TData>[], query?: string | null): TData[] {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return [...rows];
  return rows.filter((row) => rowCells(row, columns).join(' ').toLowerCase().includes(q));
}

/** Read one string search param from Next's `searchParams` (first value wins). */
export function readParam(params: Record<string, string | string[] | undefined> | undefined, name: string): string {
  const value = params?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return (first ?? '').trim();
}

/** URL-safe search-param name for a list, derived from its title. */
export function listParamName(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'q';
}
