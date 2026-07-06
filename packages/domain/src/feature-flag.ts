export type FeatureFlagScope =
  | "Platform"
  | "Tenant"
  | "Module";

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  scope: FeatureFlagScope;
  enabled: boolean;
  updatedAt: string;
}
