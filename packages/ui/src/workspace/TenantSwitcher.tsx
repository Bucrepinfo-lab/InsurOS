export interface TenantSwitcherProps {
  tenantName: string;
  environment?: 'local' | 'development' | 'staging' | 'production';
}

/** The organisation you are working in. A label, not a button: there is nothing to switch here. */
export function TenantSwitcher({ tenantName }: TenantSwitcherProps) {
  return (
    <div className='text-left text-sm'>
      <span className='block font-display text-[15px] leading-tight text-ink'>{tenantName}</span>
      <span className='block text-xs text-dim'>Your workspace</span>
    </div>
  );
}
