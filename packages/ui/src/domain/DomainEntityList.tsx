import type { ReactNode } from 'react';
import { DataTable, TableShell, TableToolbar, type DataTableColumn } from '../data';
import { filterRows, listParamName, rowCells } from '../data/filter-rows';
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
  /**
   * Search text read from the URL by the page. When given, rows are filtered
   * on the server with the same rule the page uses for its summary cards, and
   * the CSV export contains exactly those rows.
   */
  query?: string;
  /** URL param for this list's search (default: derived from the title). */
  searchParam?: string;
  /** Extra filter controls (named inputs) submitted with the search. */
  filters?: ReactNode;
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
  actions,
  query,
  searchParam,
  filters
}: DomainEntityListProps<TData>) {
  const hasActiveFilter = Boolean(query) || Boolean(filters);
  if (data.length === 0 && !hasActiveFilter) {
    return (
      <>
        <TableToolbar title={title} description={description} />
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </>
    );
  }

  const rows = query !== undefined ? filterRows(data, columns, query) : data;

  return (
    <>
      <TableToolbar title={title} description={description} />

      <TableShell
        searchPlaceholder={searchPlaceholder}
        searchParam={searchParam ?? listParamName(title)}
        initialQuery={query}
        filters={filters}
        actions={actions}
        exportCsv={{
          filename: listParamName(title),
          headers: columns.map((column) => column.header),
          rows: rows.map((row) => rowCells(row, columns))
        }}
      >
        <DataTable
          columns={columns}
          data={rows}
          empty={
            hasActiveFilter ? (
              <EmptyState title='No matches' description='Nothing matches these filters. Clear the search or change a filter.' />
            ) : (
              <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
            )
          }
        />
      </TableShell>
    </>
  );
}
