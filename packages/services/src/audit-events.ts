import { mockAuditEvents } from "@insuros/mocks";

export class AuditEventService {
  async getAuditEvents() {
    return mockAuditEvents;
  }

  async getAuditEventsByEntity(entityId: string) {
    return mockAuditEvents.filter((event) => event.entityId === entityId);
  }

  async getAuditEventsByEntityType(entityType: string) {
    return mockAuditEvents.filter((event) => event.entityType === entityType);
  }
}
