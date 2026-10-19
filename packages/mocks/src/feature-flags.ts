import type { FeatureFlag } from "@insuros/domain";

export const mockFeatureFlags: FeatureFlag[] = [
  {
    id: "flag-workflow-execution",
    key: "workflow.execution.enabled",
    name: "Workflow Execution",
    description: "Controls whether workflow actions can be executed from the admin UI.",
    scope: "Platform",
    enabled: false,
    updatedAt: "2026-07-04T15:00:00Z"
  },
  {
    id: "flag-marketplace-publishing",
    key: "marketplace.publishing.enabled",
    name: "Marketplace Publishing",
    description: "Controls whether marketplace products can be published.",
    scope: "Module",
    enabled: true,
    updatedAt: "2026-07-04T15:15:00Z"
  },
  {
    id: "flag-tenant-custom-branding",
    key: "tenant.customBranding.enabled",
    name: "Tenant Custom Branding",
    description: "Allows tenants to customize branding in the admin experience.",
    scope: "Tenant",
    enabled: false,
    updatedAt: "2026-07-04T15:30:00Z"
  }
];
