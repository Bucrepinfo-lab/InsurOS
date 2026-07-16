import type { ReactNode } from 'react';
import { Card, CardContent } from '../components/Card';

export interface DataTableColumn<TData> {
  key: keyof TData | string;
  header: string;
  render?: (row: TData) => ReactNode;
}

export interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  empty?: ReactNode;
  footer?: ReactNode;
}

export function DataTable<TData>({
  columns,
  data,
  empty,
  footer
}: DataTableProps<TData>) {
  if (data.length === 0) {
    return <>{empty}</>;
  }

  return (
    <Card>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-line'>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className='py-3 pr-4 text-[11px] font-medium uppercase tracking-[0.12em] text-dim'
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className='border-b border-line transition last:border-0 hover:bg-paper/60'>
                  {columns.map((column) => (
                    <td key={String(column.key)} className='py-3.5 pr-4 text-[13px] leading-relaxed text-ink/80'>
                     {column.render
  ? column.render(row)
  : String((row as Record<string, unknown>)[String(column.key)] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {footer}
    </Card>
  );
}
