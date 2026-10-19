import { mockAttachments } from '@insuros/mocks';

export class AttachmentService {
  async getAttachments() {
    return mockAttachments;
  }

  async getAttachmentsByEntity(entityId: string) {
    return mockAttachments.filter((attachment) => attachment.entityId === entityId);
  }

  async getAttachmentsByModule(module: string) {
    return mockAttachments.filter((attachment) => attachment.module === module);
  }
}