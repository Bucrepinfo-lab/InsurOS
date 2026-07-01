import { mockActivityEvents } from '@insuros/mocks';

export class PlatformActivityService {
  async getActivityEvents() {
    return mockActivityEvents;
  }

  async getActivityEventsByEntity(entityId: string) {
    return mockActivityEvents.filter((event) => event.entityId === entityId);
  }

  async getActivityEventsByModule(module: string) {
    return mockActivityEvents.filter((event) => event.module === module);
  }
}