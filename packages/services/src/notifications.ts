import { mockNotifications } from '@insuros/mocks';

export class NotificationService {
  async getNotifications() {
    return mockNotifications;
  }

  async getUnreadNotifications() {
    return mockNotifications.filter(
      (notification) => notification.status === 'Unread'
    );
  }

  async getNotificationsByModule(module: string) {
    return mockNotifications.filter(
      (notification) => notification.module === module
    );
  }
}
