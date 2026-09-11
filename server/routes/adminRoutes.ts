import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with admin role
router.use(requireAuth, requireRole('admin'));

// Analytics & Dashboard
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/analytics', AdminController.getDashboardStats);

// Students CRUD
router.get('/students', AdminController.getStudents);
router.post('/students', AdminController.createStudent);
router.put('/students/:id', AdminController.updateStudent);
router.delete('/students/:id', AdminController.deleteStudent);

// Teachers CRUD
router.get('/teachers', AdminController.getTeachers);
router.post('/teachers', AdminController.createTeacher);

// Courses & Classes
router.get('/courses', AdminController.getCourses);
router.post('/courses', AdminController.createCourse);
router.get('/classes', AdminController.getClasses);
router.get('/subjects', AdminController.getSubjects);

// Attendance Management
router.get('/attendance', AdminController.getAttendanceOverview);

// Fee Management
router.get('/fees', AdminController.getFees);
router.put('/fees/:id/pay', AdminController.updateFeePayment);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

// System Settings
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

export default router;
