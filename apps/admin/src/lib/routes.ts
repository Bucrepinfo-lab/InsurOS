export const routes = {
  dashboard: '/dashboard',

  tenants: '/dashboard/tenants',
  identity: '/dashboard/identity',
  operations: '/dashboard/operations',
  operationsTasks: '/dashboard/operations/tasks',
  operationsApprovals: '/dashboard/operations/approvals',
  operationsEscalations: '/dashboard/operations/escalations',
  operationsTemplates: '/dashboard/operations/templates',
  activity: '/dashboard/activity',

  marketplace: {
    index: '/dashboard/marketplace',
    new: '/dashboard/marketplace/new',
    product: (productId: string) => `/dashboard/marketplace/${productId}`,
    coverages: (productId: string) => `/dashboard/marketplace/${productId}/coverages`,
    pricing: (productId: string) => `/dashboard/marketplace/${productId}/pricing`,
    publishing: (productId: string) => `/dashboard/marketplace/${productId}/publishing`
  },

  customers: {
    index: '/dashboard/customers',
    customer: (customerId: string) => `/dashboard/customers/${customerId}`,
    profile: (customerId: string) => `/dashboard/customers/${customerId}/profile`,
    contacts: (customerId: string) => `/dashboard/customers/${customerId}/contacts`,
    policies: (customerId: string) => `/dashboard/customers/${customerId}/policies`,
    claims: (customerId: string) => `/dashboard/customers/${customerId}/claims`,
    payments: (customerId: string) => `/dashboard/customers/${customerId}/payments`,
    timeline: (customerId: string) => `/dashboard/customers/${customerId}/timeline`
  },

  policies: {
    index: '/dashboard/policies',
    policy: (policyId: string) => `/dashboard/policies/${policyId}`,
    holder: (policyId: string) => `/dashboard/policies/${policyId}/holder`,
    coverages: (policyId: string) => `/dashboard/policies/${policyId}/coverages`,
    premium: (policyId: string) => `/dashboard/policies/${policyId}/premium`,
    documents: (policyId: string) => `/dashboard/policies/${policyId}/documents`,
    timeline: (policyId: string) => `/dashboard/policies/${policyId}/timeline`
  },

  claims: {
    index: '/dashboard/claims',
    claim: (claimId: string) => `/dashboard/claims/${claimId}`,
    fnol: (claimId: string) => `/dashboard/claims/${claimId}/fnol`,
    assessment: (claimId: string) => `/dashboard/claims/${claimId}/assessment`,
    settlement: (claimId: string) => `/dashboard/claims/${claimId}/settlement`,
    documents: (claimId: string) => `/dashboard/claims/${claimId}/documents`,
    timeline: (claimId: string) => `/dashboard/claims/${claimId}/timeline`
  },

  finance: {
    index: '/dashboard/finance',
    invoice: (invoiceId: string) => `/dashboard/finance/invoices/${invoiceId}`,
    payout: (payoutId: string) => `/dashboard/finance/payouts/${payoutId}`,
    reconciliation: '/dashboard/finance/reconciliation'
  }
} as const;
