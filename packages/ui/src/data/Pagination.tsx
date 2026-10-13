export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  onPrevious,
  onNext
}: PaginationProps) {
  const totalText = typeof totalItems === 'number' ? ' - ' + totalItems + ' total' : '';

  return (
    <div className='flex flex-col gap-3 border-t px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-slate-500'>
        Page {page} of {totalPages}{totalText}
      </p>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={onPrevious}
          disabled={page <= 1}
          className='rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'
        >
          Previous
        </button>

        <button
          type='button'
          onClick={onNext}
          disabled={page >= totalPages}
          className='rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
}
