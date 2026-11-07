/**
 * The one shared date formatter for InsurOS screens and CSV exports.
 *
 * Owner rule: dates are day-first (dd/mm/yy) everywhere, whatever the device or
 * browser locale. We never call `toLocaleDateString()` without a fixed pattern,
 * because Android Chrome follows the device locale and would show month-first.
 * Instead the parts are assembled by hand, so the order cannot change.
 *
 * Date-times are shown on the country's clock (default Africa/Nairobi, EAT).
 * Date-only values (`2026-11-07`) are calendar dates and are never shifted.
 */

export const DEFAULT_TIME_ZONE = 'Africa/Nairobi';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?$/;

export interface DateFormatOptions {
  /** IANA time zone for date-times; defaults to Africa/Nairobi. */
  timeZone?: string;
  /** `true` -> dd/mm/yyyy (default is dd/mm/yy). */
  fullYear?: boolean;
}

type DateInput = string | number | Date | null | undefined;

/** True for ISO calendar dates (`2026-11-07`) and ISO date-times. */
export function isIsoDateLike(value: unknown): value is string {
  return typeof value === 'string' && (DATE_ONLY.test(value) || ISO_DATE_TIME.test(value));
}

interface Parts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
}

function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === '') return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function zonedParts(date: Date, timeZone: string): Parts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return { day: get('day'), month: get('month'), year: get('year'), hour: get('hour'), minute: get('minute') };
}

function year(value: string, fullYear: boolean | undefined): string {
  return fullYear ? value : value.slice(-2);
}

/** `07/11/26` (or `07/11/2026` with fullYear). Empty string for missing/invalid input. */
export function formatDate(input: DateInput, options: DateFormatOptions = {}): string {
  if (typeof input === 'string') {
    const match = DATE_ONLY.exec(input);
    if (match) return `${match[3]}/${match[2]}/${year(match[1], options.fullYear)}`;
  }
  const date = toDate(input);
  if (!date) return typeof input === 'string' ? input : '';
  const parts = zonedParts(date, options.timeZone ?? DEFAULT_TIME_ZONE);
  return `${parts.day}/${parts.month}/${year(parts.year, options.fullYear)}`;
}

/** `07/11/26 14:05` (24-hour, on the country's clock). Date-only input -> date only. */
export function formatDateTime(input: DateInput, options: DateFormatOptions = {}): string {
  if (typeof input === 'string' && DATE_ONLY.test(input)) return formatDate(input, options);
  const date = toDate(input);
  if (!date) return typeof input === 'string' ? input : '';
  const parts = zonedParts(date, options.timeZone ?? DEFAULT_TIME_ZONE);
  return `${parts.day}/${parts.month}/${year(parts.year, options.fullYear)} ${parts.hour}:${parts.minute}`;
}

/** `14:05` (24-hour, on the country's clock). */
export function formatTime(input: DateInput, options: DateFormatOptions = {}): string {
  const date = toDate(input);
  if (!date) return '';
  const parts = zonedParts(date, options.timeZone ?? DEFAULT_TIME_ZONE);
  return `${parts.hour}:${parts.minute}`;
}

/**
 * Display text for a raw table/CSV value: ISO dates become day-first, other
 * values are stringified unchanged. Objects are JSON (CSV only).
 */
export function displayValue(value: unknown, options: DateFormatOptions = {}): string {
  if (value === null || value === undefined) return '';
  if (isIsoDateLike(value)) return formatDateTime(value, options);
  if (value instanceof Date) return formatDateTime(value, options);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
