import { mockFeatureFlags } from "@insuros/mocks";

export class FeatureFlagService {
  async getFeatureFlags() {
    return mockFeatureFlags;
  }

  async getFeatureFlagsByScope(scope: string) {
    return mockFeatureFlags.filter((flag) => flag.scope === scope);
  }

  async isEnabled(key: string) {
    return mockFeatureFlags.find((flag) => flag.key === key)?.enabled ?? false;
  }
}
