export interface TenantSwitcherProps {
  tenantName: string;
  environment?: 'local' | 'development' | 'staging' | 'production';
}

export function TenantSwitcher({ tenantName, environment = 'development' }: TenantSwitcherProps) {
  return (
    <button className='rounded-md border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50'>
      <span className='block font-medium text-slate-950'>{tenantName}</span>
      <span className='block text-xs capitalize text-slate-500'>{environment}</span>
    </button>
  );
}
