export type PlatformSettingScope =
  | "Platform"
  | "Tenant"
  | "Module"
  | "Workflow"
  | "Security";

export type PlatformSettingValueType =
  | "String"
  | "Number"
  | "Boolean"
  | "Json";

export interface PlatformSetting {
  id: string;
  scope: PlatformSettingScope;
  key: string;
  label: string;
  description: string;
  valueType: PlatformSettingValueType;
  value: string;
  updatedAt: string;
}
