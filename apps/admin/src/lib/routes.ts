export const routes = {
  dashboard: "/dashboard",

  tenants: "/dashboard/tenants",
  identity: "/dashboard/identity",
  activity: "/dashboard/activity",
  notifications: "/dashboard/notifications",
  comments: "/dashboard/comments",
  attachments: "/dashboard/attachments",
  audit: "/dashboard/audit",

  marketplace: {
    index: "/dashboard/marketplace",
    new: "/dashboard/marketplace/new",
    product: (productId: string) => `/dashboard/marketplace/${productId}`,
    coverages: (productId: string) => `/dashboard/marketplace/${productId}/coverages`,
    pricing: (productId: string) => `/dashboard/marketplace/${productId}/pricing`,
    publishing: (productId: string) => `/dashboard/marketplace/${productId}/publishing`
  },

  customers: {
    index: "/dashboard/customers",
    customer: (customerId: string) => `/dashboard/customers/${customerId}`,
    profile: (customerId: string) => `/dashboard/customers/${customerId}/profile`,
    contacts: (customerId: string) => `/dashboard/customers/${customerId}/contacts`,
    policies: (customerId: string) => `/dashboard/customers/${customerId}/policies`,
    claims: (customerId: string) => `/dashboard/customers/${customerId}/claims`,
    payments: (customerId: string) => `/dashboard/customers/${customerId}/payments`,
    timeline: (customerId: string) => `/dashboard/customers/${customerId}/timeline`
  },

  claims: {
    index: "/dashboard/claims",
    workflows: "/dashboard/claims/workflows",
    claim: (claimId: string) => `/dashboard/claims/${claimId}`,
    fnol: (claimId: string) => `/dashboard/claims/${claimId}/fnol`,
    assessment: (claimId: string) => `/dashboard/claims/${claimId}/assessment`,
    documents: (claimId: string) => `/dashboard/claims/${claimId}/documents`,
    settlement: (claimId: string) => `/dashboard/claims/${claimId}/settlement`,
    timeline: (claimId: string) => `/dashboard/claims/${claimId}/timeline`
  },

  finance: {
    index: "/dashboard/finance",
    invoice: (invoiceId: string) => `/dashboard/finance/invoices/${invoiceId}`,
    payout: (payoutId: string) => `/dashboard/finance/payouts/${payoutId}`,
    reconciliation: "/dashboard/finance/reconciliation"
  },

  policies: {
    index: "/dashboard/policies",
    holder: (policyId: string) => `/dashboard/policies/${policyId}/holder`
  },

  operations: {
    index: "/dashboard/operations",
    tasks: "/dashboard/operations/tasks",
    approvals: "/dashboard/operations/approvals",
    escalations: "/dashboard/operations/escalations",
    templates: "/dashboard/operations/templates",
    transitions: "/dashboard/operations/transitions",
    rules: "/dashboard/operations/rules",
    policies: "/dashboard/operations/policies"
  }
};
