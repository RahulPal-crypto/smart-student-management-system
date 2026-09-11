import { Request, Response } from 'express';
import { db, AnnouncementDoc } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { AnnouncementCreateSchema } from '../validators/schemas';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';

export class CommonController {
  // Announcements
  static async getAnnouncements(req: AuthRequest, res: Response) {
    const role = req.user?.role || 'student';
    let list = db.announcements;

    // Filter by audience if student
    if (role === 'student') {
      list = list.filter((a) => a.audience === 'All' || a.audience === 'Student' || a.audience === 'Class');
    }

    return res.status(200).json({ success: true, data: list });
  }

  static async createAnnouncement(req: AuthRequest, res: Response) {
    const parsed = AnnouncementCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const user = req.user;
    const anc: AnnouncementDoc = {
      id: `anc-${Date.now()}`,
      title: parsed.data.title,
      message: parsed.data.message,
      authorId: user?.id || 'admin',
      authorName: user?.name || 'Administrator',
      authorRole: (user?.role as 'admin' | 'teacher') || 'admin',
      priority: parsed.data.priority,
      audience: parsed.data.audience,
      targetId: parsed.data.targetId,
      expiryDate: parsed.data.expiryDate,
      createdAt: new Date().toISOString(),
    };

    db.announcements.unshift(anc);

    NotificationService.broadcastRole(
      'all',
      `📢 ${anc.priority === 'Urgent' ? 'URGENT: ' : ''}${anc.title}`,
      anc.message.slice(0, 120) + '...',
      'announcement',
      '/announcements'
    );

    AuditService.log({
      userId: user?.id || 'admin',
      userName: user?.name || 'Admin',
      userRole: user?.role || 'admin',
      action: 'ANNOUNCEMENT_PUBLISHED',
      module: 'Announcements',
      details: `Published announcement "${anc.title}" to audience [${anc.audience}].`,
    });

    return res.status(201).json({ success: true, message: 'Announcement broadcasted successfully.', data: anc });
  }

  // Notifications
  static async getNotifications(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const notifs = db.notifications.filter((n) => n.recipientUserId === userId || n.recipientUserId === 'all');
    return res.status(200).json({
      success: true,
      data: {
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.isRead).length,
      },
    });
  }

  static async markNotificationAsRead(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  }

  static async markAllNotificationsAsRead(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    for (const n of db.notifications) {
      if (n.recipientUserId === userId || n.recipientUserId === 'all') {
        n.isRead = true;
      }
    }
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  }

  // Public Student ID Verification (for camera / QR scan verification by campus security)
  static async verifyStudentPublic(req: Request, res: Response) {
    const { studentId } = req.params;
    const student = db.students.find((s) => s.id === studentId || s.studentIdNumber === studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Invalid digital student credentials. Record not found on institutional registry.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        verified: true,
        institution: db.settings.institutionName,
        institutionCode: db.settings.institutionCode,
        student: {
          name: student.name,
          studentIdNumber: student.studentIdNumber,
          course: student.courseName,
          department: student.department,
          semester: student.semester,
          status: student.status,
          admissionDate: student.admissionDate,
          avatar: student.avatar,
        },
        verifiedAt: new Date().toISOString(),
      },
    });
  }
}
