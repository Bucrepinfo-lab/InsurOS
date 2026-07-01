import { mockAuditRecords } from '@insuros/mocks';

export class AuditService {
  async getAuditRecords() {
    return mockAuditRecords;
  }

  async getAuditRecordsByEntity(entityId: string) {
    return mockAuditRecords.filter(
      (record) => record.entityId === entityId
    );
  }

  async getAuditRecordsByModule(module: string) {
    return mockAuditRecords.filter(
      (record) => record.module === module
    );
  }
}