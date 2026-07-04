import { mockNotificationEvents } from "@insuros/mocks";

export class NotificationEventService {
  async getNotificationEvents() {
    return mockNotificationEvents;
  }

  async getNotificationEventsByEntity(entityId: string) {
    return mockNotificationEvents.filter((event) => event.entityId === entityId);
  }

  async getNotificationEventsByStatus(status: string) {
    return mockNotificationEvents.filter((event) => event.status === status);
  }
}
