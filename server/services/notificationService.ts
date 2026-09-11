import { db, NotificationDoc } from '../db/database';

export class NotificationService {
  static sendToUser(
    recipientUserId: string,
    title: string,
    message: string,
    type: 'assignment' | 'attendance' | 'exam' | 'result' | 'announcement' | 'achievement' | 'alert',
    link?: string
  ): NotificationDoc {
    const notif: NotificationDoc = {
      id: `ntf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientUserId,
      title,
      message,
      type,
      isRead: false,
      link,
      createdAt: new Date().toISOString(),
    };

    db.notifications.unshift(notif);
    return notif;
  }

  static broadcastRole(
    roleTarget: 'admin' | 'teacher' | 'student' | 'all',
    title: string,
    message: string,
    type: 'assignment' | 'attendance' | 'exam' | 'result' | 'announcement' | 'achievement' | 'alert',
    link?: string
  ) {
    const targetUsers = roleTarget === 'all'
      ? db.users
      : db.users.filter((u) => u.role === roleTarget);

    for (const u of targetUsers) {
      this.sendToUser(u.id, title, message, type, link);
    }
  }
}
