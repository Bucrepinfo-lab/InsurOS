export interface NotificationBellProps {
  count?: number;
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <button className='relative rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50'>
      Notifications
      {count > 0 ? (
        <span className='ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white'>{count}</span>
      ) : null}
    </button>
  );
}
