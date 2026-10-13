import { mockPlatformEvents } from "@insuros/mocks";

export class PlatformEventService {
  async getPlatformEvents() {
    return mockPlatformEvents;
  }

  async getPlatformEventsBySource(sourceModule: string) {
    return mockPlatformEvents.filter((event) => event.sourceModule === sourceModule);
  }

  async getPlatformEventsByStatus(status: string) {
    return mockPlatformEvents.filter((event) => event.status === status);
  }
}
