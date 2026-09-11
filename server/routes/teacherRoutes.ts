import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Protect all teacher endpoints
router.use(requireAuth, requireRole('teacher', 'admin'));

// Dashboard
router.get('/dashboard', TeacherController.getDashboardStats);

// Classes & Students
router.get('/classes', TeacherController.getMyClasses);
router.get('/students', TeacherController.getStudentsForClass);

// Attendance & QR
router.post('/attendance', TeacherController.markAttendance);
router.post('/attendance/qr', TeacherController.generateQRSession);

// Assignments & Grading
router.get('/assignments', TeacherController.getAssignments);
router.post('/assignments', TeacherController.createAssignment);
router.post('/submissions/grade', TeacherController.gradeSubmission);

// Exams & Results
router.get('/exams', TeacherController.getExams);
router.post('/results', TeacherController.enterResults);

// Insights
router.get('/insights', TeacherController.getClassInsights);

export default router;
