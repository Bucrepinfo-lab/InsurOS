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
      { id: 'tenants', label: 'Tenants', href: '/dashboard/tenants', requiredPermission: 'Platform:View' },
      { id: 'identity', label: 'Identity', href: '/dashboard/identity', requiredPermission: 'Identity:View' },
      {
        id: 'clerk-sync',
        label: 'Clerk Sync',
        href: '/dashboard/identity/clerk-sync', requiredPermission: 'Identity:View'
      }
    ]
  },
  {
    id: 'governance',
    title: 'Governance',
    items: [
      { id: 'governance', label: 'Regions', href: '/dashboard/governance', requiredPermission: 'Identity:View' },
      {
        id: 'appointments',
        label: 'Admin Appointments',
        href: '/dashboard/governance/appointments', requiredPermission: 'Identity:View'
      },
      {
        id: 'access',
        label: 'Jurisdiction Access',
        href: '/dashboard/governance/access', requiredPermission: 'Identity:View'
      },
      { id: 'legal', label: 'Legal & Terms', href: '/dashboard/legal', requiredPermission: 'Platform:View' }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Operations',
    items: [
      { id: 'marketplace', label: 'Marketplace', href: '/dashboard/marketplace', requiredPermission: 'Marketplace:View' },
      {
        id: 'pricing-engine',
        label: 'Pricing Engine',
        href: '/dashboard/marketplace/pricing-engine', requiredPermission: 'Marketplace:View'
      },
      {
        id: 'micro',
        label: 'Microinsurance',
        href: '/dashboard/marketplace/micro', requiredPermission: 'Marketplace:View'
      },
      { id: 'customers', label: 'Customers', href: '/dashboard/customers', requiredPermission: 'Customers:View' },
      { id: 'policies', label: 'Policies', href: '/dashboard/policies', requiredPermission: 'Policies:View' },
      { id: 'claims', label: 'Claims', href: '/dashboard/claims', requiredPermission: 'Claims:View' },
      {
        id: 'claims-automation',
        label: 'Claims Automation',
        href: '/dashboard/claims/automation', requiredPermission: 'Claims:View'
      },
      {
        id: 'claims-evidence',
        label: 'Scene Evidence',
        href: '/dashboard/claims/evidence', requiredPermission: 'Claims:View'
      },
      { id: 'finance', label: 'Finance', href: '/dashboard/finance', requiredPermission: 'Finance:View' },
      { id: 'tax', label: 'Tax Remittance', href: '/dashboard/finance/tax', requiredPermission: 'Finance:View' },
      {
        id: 'regional-tax',
        label: 'Regional Tax',
        href: '/dashboard/finance/tax/regional', requiredPermission: 'Finance:View'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/dashboard/finance/analytics', requiredPermission: 'Finance:View'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Growth',
    items: [
      {
        id: 'subscribers',
        label: 'Subscribers',
        href: '/dashboard/subscribers', requiredPermission: 'Customers:View'
      },
      { id: 'sales', label: 'Sales Portal', href: '/dashboard/sales', requiredPermission: 'Marketplace:View' },
      {
        id: 'sales-assignments',
        label: 'Assignments',
        href: '/dashboard/sales/assignments', requiredPermission: 'Marketplace:View'
      },
      {
        id: 'sales-commissions',
        label: 'Commissions',
        href: '/dashboard/sales/commissions', requiredPermission: 'Marketplace:View'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'operations', label: 'Operations', href: '/dashboard/operations', requiredPermission: 'Operations:View' },
      {
        id: 'documents',
        label: 'Document Intelligence',
        href: '/dashboard/operations/documents', requiredPermission: 'Operations:View'
      },
      { id: 'crm', label: 'CRM Content', href: '/dashboard/operations/crm', requiredPermission: 'Operations:View' },
      { id: 'activity', label: 'Activity', href: '/dashboard/activity', requiredPermission: 'Operations:View' },
      { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', requiredPermission: 'Operations:View' },
      { id: 'audit', label: 'Audit', href: '/dashboard/audit', requiredPermission: 'Platform:View' }
    ]
  }
];
