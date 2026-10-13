export const PlatformEventTypes = {
  ClaimWorkflowSubmitted: "Claim.WorkflowSubmitted",
  ClaimWorkflowApproved: "Claim.WorkflowApproved",

  PolicyWorkflowApproved: "Policy.WorkflowApproved",

  FinanceWorkflowReviewed: "Finance.WorkflowReviewed",

  CustomerRegistered: "Customer.Registered",

  IdentityVerified: "Identity.Verified",

  NotificationQueued: "Notification.Queued",

  AuditRecorded: "Audit.Recorded"
} as const;

export type PlatformEventType =
  (typeof PlatformEventTypes)[keyof typeof PlatformEventTypes];
