export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: string;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export const adminNavigation: NavigationSection[] = [
  {
    id: 'platform',
    title: 'Platform',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'tenants', label: 'Tenants', href: '/dashboard/tenants' },
      { id: 'identity', label: 'Identity', href: '/dashboard/identity' },
      {
        id: 'clerk-sync',
        label: 'Clerk Sync',
        href: '/dashboard/identity/clerk-sync'
      }
    ]
  },
  {
    id: 'governance',
    title: 'Governance',
    items: [
      { id: 'governance', label: 'Regions', href: '/dashboard/governance' },
      {
        id: 'appointments',
        label: 'Admin Appointments',
        href: '/dashboard/governance/appointments'
      },
      {
        id: 'access',
        label: 'Jurisdiction Access',
        href: '/dashboard/governance/access'
      },
      { id: 'legal', label: 'Legal & Terms', href: '/dashboard/legal' }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Operations',
    items: [
      { id: 'marketplace', label: 'Marketplace', href: '/dashboard/marketplace' },
      { id: 'customers', label: 'Customers', href: '/dashboard/customers' },
      { id: 'policies', label: 'Policies', href: '/dashboard/policies' },
      { id: 'claims', label: 'Claims', href: '/dashboard/claims' },
      { id: 'finance', label: 'Finance', href: '/dashboard/finance' },
      { id: 'tax', label: 'Tax Remittance', href: '/dashboard/finance/tax' },
      {
        id: 'regional-tax',
        label: 'Regional Tax',
        href: '/dashboard/finance/tax/regional'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales',
    items: [
      { id: 'sales', label: 'Sales Portal', href: '/dashboard/sales' },
      {
        id: 'sales-assignments',
        label: 'Assignments',
        href: '/dashboard/sales/assignments'
      },
      {
        id: 'sales-commissions',
        label: 'Commissions',
        href: '/dashboard/sales/commissions'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'operations', label: 'Operations', href: '/dashboard/operations' },
      { id: 'activity', label: 'Activity', href: '/dashboard/activity' },
      { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications' },
      { id: 'audit', label: 'Audit', href: '/dashboard/audit' }
    ]
  }
];
