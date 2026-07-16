import type { ReactNode } from 'react';
import { DataTable, ExportCsvButton, TableShell, TableToolbar, type DataTableColumn } from '../data';
import { EmptyState } from '../enterprise/EmptyState';

export interface DomainEntityListProps<TData> {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  columns: DataTableColumn<TData>[];
  data: TData[];
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  actions?: ReactNode;
}

export function DomainEntityList<TData>({
  title,
  description,
  searchPlaceholder = 'Search...',
  columns,
  data,
  emptyTitle,
  emptyDescription,
  emptyAction,
  actions
}: DomainEntityListProps<TData>) {
  if (data.length === 0) {
    return (
      <>
        <TableToolbar title={title} description={description} />
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </>
    );
  }

  return (
    <>
      <TableToolbar title={title} description={description} />

      <TableShell
        searchPlaceholder={searchPlaceholder}
        actions={
          <>
            {actions}
            <ExportCsvButton
              filename={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              columns={columns.map((column) => ({
                key: String(column.key),
                header: column.header
              }))}
              rows={data as unknown as Record<string, unknown>[]}
            />
          </>
        }
      >
        <DataTable
          columns={columns}
          data={data}
          empty={<EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
        />
      </TableShell>
    </>
  );
}
