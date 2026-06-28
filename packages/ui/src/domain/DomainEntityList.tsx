import type { ReactNode } from 'react';
import { DataTable, FilterBar, Pagination, SearchInput, TableToolbar, type DataTableColumn } from '../data';
import { EmptyState } from '../enterprise/EmptyState';

export interface DomainEntityListProps<TData extends Record<string, unknown>> {
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

export function DomainEntityList<TData extends Record<string, unknown>>({
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

      <FilterBar search={<SearchInput placeholder={searchPlaceholder} />} actions={actions} />

      <DataTable
        columns={columns}
        data={data}
        empty={<EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />}
        footer={<Pagination page={1} totalPages={1} totalItems={data.length} />}
      />
    </>
  );
}
