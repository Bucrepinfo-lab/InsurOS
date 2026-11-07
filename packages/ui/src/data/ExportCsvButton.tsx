'use client';

import { displayValue } from '../utils/date-format';

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportCsvButtonProps {
  filename: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
}

function cell(value: unknown): string {
  return `"${displayValue(value).replace(/"/g, '""')}"`;
}

/** CSV text from a header row and already-formatted cell rows. */
export function toCsv(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [headers, ...rows].map((line) => line.map(cell).join(',')).join('\n');
}

/** Starts a browser download of CSV text (UTF-8 with BOM so Excel keeps accents). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads the given rows as CSV (dates day-first). Lists built with
 * DomainEntityList export through TableShell instead, so the file always
 * matches the rows the search currently shows.
 */
export function ExportCsvButton({ filename, columns, rows }: ExportCsvButtonProps) {
  const handleExport = () => {
    downloadCsv(
      filename,
      toCsv(
        columns.map((column) => column.header),
        rows.map((row) => columns.map((column) => displayValue(row[column.key])))
      )
    );
  };

  return (
    <button
      type='button'
      onClick={handleExport}
      className='inline-flex items-center justify-center rounded-lg border border-ink/15 bg-sheet/60 px-4 py-2 text-sm font-medium text-ink transition-all duration-200 hover:-translate-y-px hover:border-seal/50 hover:text-seal'
    >
      Export CSV
    </button>
  );
}
