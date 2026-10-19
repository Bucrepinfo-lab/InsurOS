import type { ReactNode } from 'react';

export interface UserMenuProps {
  name?: string;
  email?: string;
  avatar?: ReactNode;
  actions?: ReactNode;
}

export function UserMenu({ name = 'User', email, avatar, actions }: UserMenuProps) {
  return (
    <div className='flex items-center gap-3'>
      <div className='hidden text-right sm:block'>
        <p className='text-sm font-medium text-slate-950'>{name}</p>
        {email ? <p className='text-xs text-slate-500'>{email}</p> : null}
      </div>

      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white'>
        {avatar ?? name.slice(0, 1).toUpperCase()}
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
