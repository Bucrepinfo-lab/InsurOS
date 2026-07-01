import { mockComments } from '@insuros/mocks';

export class CommentService {
  async getComments() {
    return mockComments;
  }

  async getCommentsByEntity(entityId: string) {
    return mockComments.filter((comment) => comment.entityId === entityId);
  }

  async getCommentsByModule(module: string) {
    return mockComments.filter((comment) => comment.module === module);
  }
}