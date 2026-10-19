export type SystemConfigurationCategory =
  | "General"
  | "Security"
  | "Maintenance"
  | "Monitoring"
  | "Integration";

export interface SystemConfiguration {
  id: string;
  category: SystemConfigurationCategory;
  key: string;
  name: string;
  description: string;
  value: string;
  updatedAt: string;
}
