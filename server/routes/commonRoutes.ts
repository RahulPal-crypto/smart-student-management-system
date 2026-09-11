import { Router } from 'express';
import { CommonController } from '../controllers/commonController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public Student Verification (No auth required for verifying QR scan by campus officers)
router.get('/public/verify-student/:studentId', CommonController.verifyStudentPublic);
router.get('/public/verify/:studentId', CommonController.verifyStudentPublic);
router.get('/common/public/verify/:studentId', CommonController.verifyStudentPublic);

// Authenticated common routes
router.get('/announcements', requireAuth, CommonController.getAnnouncements);
router.get('/common/announcements', requireAuth, CommonController.getAnnouncements);
router.post('/announcements', requireAuth, CommonController.createAnnouncement);
router.post('/common/announcements', requireAuth, CommonController.createAnnouncement);

router.get('/notifications', requireAuth, CommonController.getNotifications);
router.put('/notifications/:id/read', requireAuth, CommonController.markNotificationAsRead);
router.put('/notifications/read-all', requireAuth, CommonController.markAllNotificationsAsRead);

export default router;
