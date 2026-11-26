export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: string;
  /**
   * Kept out of the menu for now (owner 24/11/26: the menu shows only the
   * working flow: customer, policy, claim, decision or escalation, proof).
   * The page still exists and still checks access; delete this flag to bring
   * it back.
   */
  hidden?: boolean;
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
      { id: 'follow-ups', label: 'Follow-ups', href: '/dashboard/follow-ups' },
      { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
      { id: 'my-record', label: 'My career record', href: '/dashboard/my-record', hidden: true },
      { id: 'tenants', label: 'Tenants', href: '/dashboard/tenants', requiredPermission: 'Platform:View' },
      { id: 'identity', label: 'Identity', href: '/dashboard/identity', requiredPermission: 'Identity:View' }
    ]
  },
  {
    id: 'governance',
    title: 'Governance',
    items: [
      { id: 'governance', label: 'Regions', href: '/dashboard/governance', requiredPermission: 'Identity:View', hidden: true },
      {
        id: 'appointments',
        label: 'Admin Appointments',
        href: '/dashboard/governance/appointments', requiredPermission: 'Identity:View',
        hidden: true
      },
      {
        id: 'access',
        label: 'Jurisdiction Access',
        href: '/dashboard/governance/access', requiredPermission: 'Identity:View'
      },
      { id: 'legal', label: 'Legal & Terms', href: '/dashboard/legal', requiredPermission: 'Platform:View', hidden: true }
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
        href: '/dashboard/marketplace/pricing-engine', requiredPermission: 'Marketplace:View',
        hidden: true
      },
      {
        id: 'micro',
        label: 'Microinsurance',
        href: '/dashboard/marketplace/micro', requiredPermission: 'Marketplace:View',
        hidden: true
      },
      { id: 'customers', label: 'Customers', href: '/dashboard/customers', requiredPermission: 'Customers:View' },
      { id: 'customer-home-links', label: 'Customer home links', href: '/dashboard/customers/home-links', requiredPermission: 'Customers:View' },
      { id: 'customer-news', label: 'News for customers', href: '/dashboard/customers/announcements', requiredPermission: 'Customers:View', hidden: true },
      { id: 'policies', label: 'Policies', href: '/dashboard/policies', requiredPermission: 'Policies:View' },
      { id: 'claims', label: 'Claims', href: '/dashboard/claims', requiredPermission: 'Claims:View' },
      {
        id: 'claims-automation',
        label: 'Claims Automation',
        href: '/dashboard/claims/automation', requiredPermission: 'Claims:View',
        hidden: true
      },
      {
        id: 'claims-evidence',
        label: 'Scene Evidence',
        href: '/dashboard/claims/evidence', requiredPermission: 'Claims:View',
        hidden: true
      },
      { id: 'finance', label: 'Finance', href: '/dashboard/finance', requiredPermission: 'Finance:View' },
      { id: 'tax', label: 'Tax Remittance', href: '/dashboard/finance/tax', requiredPermission: 'Finance:View', hidden: true },
      {
        id: 'regional-tax',
        label: 'Regional Tax',
        href: '/dashboard/finance/tax/regional', requiredPermission: 'Finance:View',
        hidden: true
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/dashboard/finance/analytics', requiredPermission: 'Finance:View',
        hidden: true
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
        href: '/dashboard/subscribers', requiredPermission: 'Customers:View',
        hidden: true
      },
      { id: 'sales', label: 'Sales Portal', href: '/dashboard/sales', requiredPermission: 'Marketplace:View', hidden: true },
      {
        id: 'sales-assignments',
        label: 'Assignments',
        href: '/dashboard/sales/assignments', requiredPermission: 'Marketplace:View',
        hidden: true
      },
      {
        id: 'sales-commissions',
        label: 'Commissions',
        href: '/dashboard/sales/commissions', requiredPermission: 'Marketplace:View',
        hidden: true
      },
      { id: 'commission-plan', label: 'Commission plan', href: '/dashboard/sales/commission-plan', requiredPermission: 'Marketplace:View', hidden: true },
      { id: 'break-even', label: 'Break-even price', href: '/dashboard/marketplace/break-even', requiredPermission: 'Marketplace:View', hidden: true },
      { id: 'referrals', label: 'Referrals', href: '/dashboard/sales/referrals', requiredPermission: 'Marketplace:View', hidden: true }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'operations', label: 'Operations', href: '/dashboard/operations', requiredPermission: 'Operations:View', hidden: true },
      {
        id: 'documents',
        label: 'Documents',
        href: '/dashboard/operations/documents', requiredPermission: 'Operations:View',
        hidden: true
      },
      { id: 'crm', label: 'CRM Content', href: '/dashboard/operations/crm', requiredPermission: 'Operations:View', hidden: true },
      { id: 'insight', label: 'What people use', href: '/dashboard/operations/insight', requiredPermission: 'Operations:View', hidden: true },
      { id: 'activity', label: 'Activity', href: '/dashboard/activity', requiredPermission: 'Operations:View', hidden: true },
      { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', requiredPermission: 'Operations:View', hidden: true },
      { id: 'escalations', label: 'Escalations', href: '/dashboard/operations/escalations', requiredPermission: 'Operations:View' },
      { id: 'approvals', label: 'Approvals', href: '/dashboard/operations/approvals', requiredPermission: 'Operations:View' },
      { id: 'audit', label: 'Audit', href: '/dashboard/audit', requiredPermission: 'Platform:View' }
    ]
  }
];
