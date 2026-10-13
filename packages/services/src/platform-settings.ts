import { mockPlatformSettings } from "@insuros/mocks";

export class PlatformSettingService {
  async getSettings() {
    return mockPlatformSettings;
  }

  async getSettingsByScope(scope: string) {
    return mockPlatformSettings.filter((setting) => setting.scope === scope);
  }

  async getSetting(key: string) {
    return mockPlatformSettings.find((setting) => setting.key === key);
  }
}
