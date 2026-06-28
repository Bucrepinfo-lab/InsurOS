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
      { id: 'organizations', label: 'Organizations', href: '/organizations' },
      { id: 'identity', label: 'Identity', href: '/identity' }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance Operations',
    items: [
      { id: 'marketplace', label: 'Marketplace', href: '/marketplace' },
      { id: 'customers', label: 'Customers', href: '/customers' },
      { id: 'policies', label: 'Policies', href: '/policies' },
      { id: 'claims', label: 'Claims', href: '/claims' },
      { id: 'finance', label: 'Finance', href: '/finance' }
    ]
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    items: [
      { id: 'ai', label: 'AI Platform', href: '/ai' },
      { id: 'knowledge', label: 'Knowledge Platform', href: '/knowledge' },
      { id: 'workflow', label: 'Workflow', href: '/workflow' },
      { id: 'events', label: 'Events', href: '/events' }
    ]
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      { id: 'observability', label: 'Observability', href: '/observability' },
      { id: 'configuration', label: 'Configuration', href: '/configuration' }
    ]
  }
];
