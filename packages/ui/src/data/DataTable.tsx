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

export function DataTable<TData extends Record<string, unknown>>({
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
              <tr className='border-b text-slate-500'>
                {columns.map((column) => (
                  <th key={String(column.key)} className='py-3 font-medium'>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className='border-b last:border-0'>
                  {columns.map((column) => (
                    <td key={String(column.key)} className='py-4 text-slate-600'>
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
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
