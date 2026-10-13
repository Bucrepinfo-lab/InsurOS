'use client';

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
  const text =
    value === null || value === undefined
      ? ''
      : typeof value === 'object'
        ? JSON.stringify(value)
        : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

/** Downloads the table's current data as CSV. Works fully client-side. */
export function ExportCsvButton({ filename, columns, rows }: ExportCsvButtonProps) {
  const handleExport = () => {
    const header = columns.map((column) => cell(column.header)).join(',');
    const body = rows
      .map((row) => columns.map((column) => cell(row[column.key])).join(','))
      .join('\n');

    const blob = new Blob([`${header}\n${body}`], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
