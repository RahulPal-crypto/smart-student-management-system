import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('student', 'admin'));

// Dashboard
router.get('/dashboard', StudentController.getDashboard);

// Attendance & QR Scanner
router.get('/attendance', StudentController.getAttendance);
router.post('/attendance/scan', StudentController.scanQRAttendance);

// Assignments & Submissions
router.get('/assignments', StudentController.getAssignments);
router.post('/assignments/submit', StudentController.submitAssignment);

// Exams & Results
router.get('/exams', StudentController.getExams);

// Smart AI Study Planner
router.post('/study-plan', StudentController.generateStudyPlan);

// Digital Student ID Card
router.get('/id-card', StudentController.getDigitalIdCard);

// Achievements
router.get('/achievements', StudentController.getAchievements);

export default router;
