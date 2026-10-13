import type { PlatformSetting } from "@insuros/domain";

export const mockPlatformSettings: PlatformSetting[] = [
  {
    id: "setting-platform-name",
    scope: "Platform",
    key: "platform.name",
    label: "Platform Name",
    description: "Display name used across the InsurOS admin experience.",
    valueType: "String",
    value: "InsurOS",
    updatedAt: "2026-07-04T14:00:00Z"
  },
  {
    id: "setting-workflow-actions-enabled",
    scope: "Workflow",
    key: "workflow.actions.enabled",
    label: "Workflow Actions Enabled",
    description: "Controls whether workflow actions can be executed from the admin UI.",
    valueType: "Boolean",
    value: "false",
    updatedAt: "2026-07-04T14:15:00Z"
  },
  {
    id: "setting-security-session-timeout",
    scope: "Security",
    key: "security.session.timeoutMinutes",
    label: "Session Timeout",
    description: "Session timeout duration in minutes.",
    valueType: "Number",
    value: "60",
    updatedAt: "2026-07-04T14:30:00Z"
  }
];
