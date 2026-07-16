import type { ReactNode } from 'react';
import { DataTable, ExportCsvButton, FilterBar, Pagination, SearchInput, TableToolbar, type DataTableColumn } from '../data';
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
  return (
    <>
      <TableToolbar title={title} description={description} />

      <FilterBar
        search={<SearchInput placeholder={searchPlaceholder} />}
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
      />

      <DataTable
        columns={columns}
        data={data}
        empty={<EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
        footer={<Pagination page={1} totalPages={1} totalItems={data.length} />}
      />
    </>
  );
}
