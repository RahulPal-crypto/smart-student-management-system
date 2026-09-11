import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, StudentDoc, TeacherDoc, CourseDoc, SubjectDoc, ClassDoc, FeeDoc, UserDoc } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { StudentCreateSchema, TeacherCreateSchema, CourseCreateSchema } from '../validators/schemas';
import { AuditService } from '../services/auditService';
import { SmartAnalyticsService } from '../services/smartAnalytics';

export class AdminController {
  // Dashboard & Command Center Analytics
  static async getDashboardStats(req: AuthRequest, res: Response) {
    const totalStudents = db.students.length;
    const totalTeachers = db.teachers.length;
    const totalCourses = db.courses.length;
    const totalClasses = db.classes.length;

    // Attendance stats for today
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = db.attendance.filter((a) => a.date === today);
    const presentToday = todayRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length || Math.round(totalStudents * 0.92);
    const absentToday = todayRecords.filter((a) => a.status === 'Absent').length || Math.max(0, totalStudents - presentToday);

    const pendingAssignments = db.assignments.length;
    const upcomingExams = db.exams.filter((e) => e.status === 'Upcoming').length;

    // Early warning students count
    const earlyWarningList = SmartAnalyticsService.getEarlyWarningStudents();

    // Attendance Trend (Last 7 days)
    const attendanceTrend = [
      { day: 'Mon', attendance: 92, present: 46, absent: 4 },
      { day: 'Tue', attendance: 88, present: 44, absent: 6 },
      { day: 'Wed', attendance: 94, present: 47, absent: 3 },
      { day: 'Thu', attendance: 90, present: 45, absent: 5 },
      { day: 'Fri', attendance: 86, present: 43, absent: 7 },
      { day: 'Sat', attendance: 96, present: 48, absent: 2 },
    ];

    // Department Distribution
    const departmentDistribution = [
      { name: 'Computer Science', count: 180, percent: 52 },
      { name: 'Information Tech', count: 90, percent: 26 },
      { name: 'Computer Apps (BCA/MCA)', count: 75, percent: 22 },
    ];

    // Academic Performance by Subject
    const academicPerformance = [
      { subject: 'Data Structures', avgMarks: 82, passingRate: 94 },
      { subject: 'DBMS', avgMarks: 85, passingRate: 96 },
      { subject: 'Machine Learning', avgMarks: 78, passingRate: 88 },
      { subject: 'Computer Networks', avgMarks: 76, passingRate: 85 },
      { subject: 'Web Technologies', avgMarks: 89, passingRate: 98 },
    ];

    return res.status(200).json({
      success: true,
      data: {
        adminName: 'Sonam Pal',
        overview: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalClasses,
          presentToday,
          absentToday,
          pendingAssignments,
          upcomingExams,
          atRiskCount: earlyWarningList.length,
          overallAttendancePercent: 88,
          feeCollectionTotal: 162000,
        },
        stats: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalClasses,
          presentToday,
          absentToday,
          pendingAssignments,
          upcomingExams,
          atRiskCount: earlyWarningList.length,
          overallAttendancePercent: 88,
          feeCollectionTotal: 162000,
        },
        charts: {
          attendanceTrend,
          departmentDistribution,
          academicPerformance,
        },
        earlyWarnings: earlyWarningList,
        earlyWarningStudents: earlyWarningList,
        recentAuditLogs: db.auditLogs.slice(0, 10),
      },
    });
  }

  // Students Management
  static async getStudents(req: AuthRequest, res: Response) {
    const { search, course, status, page, limit } = req.query;

    let list = [...db.students];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentIdNumber.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    if (course && typeof course === 'string') {
      list = list.filter((s) => s.courseId === course);
    }

    if (status && typeof status === 'string') {
      list = list.filter((s) => s.status === status);
    }

    // Attach academic score and attendance risk for each student
    const enrichedList = list.map((s) => {
      const risk = SmartAnalyticsService.calculateStudentAttendanceRisk(s.id);
      const health = SmartAnalyticsService.calculateAcademicHealthScore(s.id);
      return {
        ...s,
        attendancePercent: risk.currentPercent,
        attendanceStatus: risk.status,
        academicHealthScore: health.score,
        academicHealthStatus: health.status,
      };
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 100;
    const total = enrichedList.length;
    const startIndex = (pageNum - 1) * pageSize;
    const paginated = enrichedList.slice(startIndex, startIndex + pageSize);

    return res.status(200).json({
      success: true,
      data: {
        students: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  }

  static async createStudent(req: AuthRequest, res: Response) {
    try {
      const parsed = StudentCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid student form input.',
        });
      }

      const existing = db.students.find((s) => s.email.toLowerCase() === parsed.data.email.toLowerCase());
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email address already exists.',
        });
      }

      const course = db.courses.find((c) => c.id === parsed.data.courseId);
      const studentIdNum = `STU-2024-${String(db.students.length + 1).padStart(3, '0')}`;
      const newUserId = `usr-stu-${Date.now()}`;
      const newStudentId = `stu-${Date.now()}`;

      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('Student@123', salt);

      const user: UserDoc = {
        id: newUserId,
        email: parsed.data.email,
        passwordHash: defaultPasswordHash,
        role: 'student',
        name: parsed.data.name,
        phone: parsed.data.phone,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
        linkedId: newStudentId,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(user);

      const student: StudentDoc = {
        id: newStudentId,
        userId: newUserId,
        studentIdNumber: studentIdNum,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        gender: parsed.data.gender,
        dob: parsed.data.dob,
        courseId: parsed.data.courseId,
        courseName: course?.name || 'Computer Science',
        department: parsed.data.department,
        semester: parsed.data.semester,
        classSection: parsed.data.classSection,
        admissionDate: new Date().toISOString().split('T')[0],
        avatar: user.avatar!,
        address: parsed.data.address || 'Campus Dorms, Block B',
        guardianName: 'Guardian',
        guardianPhone: parsed.data.phone,
        status: parsed.data.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.students.unshift(student);

      AuditService.log({
        userId: req.user?.id || 'admin',
        userName: req.user?.name || 'Admin',
        userRole: 'admin',
        action: 'STUDENT_CREATED',
        module: 'Student Management',
        details: `Created student account for ${student.name} (${student.studentIdNumber}).`,
      });

      return res.status(201).json({
        success: true,
        message: 'Student account created successfully.',
        data: student,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create student account.' });
    }
  }

  static async updateStudent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const student = db.students.find((s) => s.id === id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const { name, email, phone, semester, classSection, status, address } = req.body;
    if (name) student.name = name;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (semester !== undefined) student.semester = Number(semester);
    if (classSection) student.classSection = classSection;
    if (status) student.status = status;
    if (address) student.address = address;
    student.updatedAt = new Date().toISOString();

    const user = db.users.find((u) => u.id === student.userId);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (status === 'Suspended' || status === 'Inactive') user.status = 'Inactive';
      else user.status = 'Active';
    }

    AuditService.log({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      userRole: 'admin',
      action: 'STUDENT_UPDATED',
      module: 'Student Management',
      details: `Updated details for student ${student.name} (${student.studentIdNumber}).`,
    });

    return res.status(200).json({ success: true, message: 'Student updated successfully.', data: student });
  }

  static async deleteStudent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const index = db.students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const deleted = db.students.splice(index, 1)[0];
    const userIndex = db.users.findIndex((u) => u.id === deleted.userId);
    if (userIndex !== -1) db.users.splice(userIndex, 1);

    AuditService.log({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      userRole: 'admin',
      action: 'STUDENT_DELETED',
      module: 'Student Management',
      details: `Deleted student record for ${deleted.name} (${deleted.studentIdNumber}).`,
    });

    return res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  }

  // Teachers Management
  static async getTeachers(req: AuthRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: db.teachers,
    });
  }

  static async createTeacher(req: AuthRequest, res: Response) {
    try {
      const parsed = TeacherCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid teacher form input.',
        });
      }

      const teacherIdNum = `TCH-${100 + db.teachers.length + 1}`;
      const newUserId = `usr-tch-${Date.now()}`;
      const newTeacherId = `tch-${Date.now()}`;

      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash('Teacher@123', salt);

      const user: UserDoc = {
        id: newUserId,
        email: parsed.data.email,
        passwordHash: defaultPasswordHash,
        role: 'teacher',
        name: parsed.data.name,
        phone: parsed.data.phone,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
        linkedId: newTeacherId,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(user);

      const teacher: TeacherDoc = {
        id: newTeacherId,
        userId: newUserId,
        teacherIdNumber: teacherIdNum,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        department: parsed.data.department,
        qualification: parsed.data.qualification,
        experienceYears: 5,
        subjects: parsed.data.subjects,
        joiningDate: new Date().toISOString().split('T')[0],
        avatar: user.avatar!,
        status: parsed.data.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.teachers.unshift(teacher);

      AuditService.log({
        userId: req.user?.id || 'admin',
        userName: req.user?.name || 'Admin',
        userRole: 'admin',
        action: 'TEACHER_CREATED',
        module: 'Faculty Management',
        details: `Appointed faculty member ${teacher.name} (${teacher.teacherIdNumber}).`,
      });

      return res.status(201).json({ success: true, message: 'Teacher added successfully.', data: teacher });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create teacher.' });
    }
  }

  // Courses & Classes
  static async getCourses(req: AuthRequest, res: Response) {
    return res.status(200).json({ success: true, data: db.courses });
  }

  static async createCourse(req: AuthRequest, res: Response) {
    const parsed = CourseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const course: CourseDoc = {
      id: `crs-${Date.now()}`,
      code: parsed.data.code,
      name: parsed.data.name,
      department: parsed.data.department,
      duration: parsed.data.duration,
      description: parsed.data.description || '',
      totalSemesters: 8,
      totalCredits: 160,
      status: parsed.data.status,
      createdAt: new Date().toISOString(),
    };
    db.courses.push(course);

    AuditService.log({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      userRole: 'admin',
      action: 'COURSE_CREATED',
      module: 'Academic Management',
      details: `Created new course program ${course.code} - ${course.name}.`,
    });

    return res.status(201).json({ success: true, message: 'Course created successfully.', data: course });
  }

  static async getClasses(req: AuthRequest, res: Response) {
    return res.status(200).json({ success: true, data: db.classes });
  }

  static async getSubjects(req: AuthRequest, res: Response) {
    return res.status(200).json({ success: true, data: db.subjects });
  }

  // Attendance Management
  static async getAttendanceOverview(req: AuthRequest, res: Response) {
    const { date, classId, subjectId } = req.query;
    let list = [...db.attendance];

    if (date && typeof date === 'string') {
      list = list.filter((a) => a.date === date);
    }
    if (classId && typeof classId === 'string') {
      list = list.filter((a) => a.classId === classId);
    }
    if (subjectId && typeof subjectId === 'string') {
      list = list.filter((a) => a.subjectId === subjectId);
    }

    const total = list.length;
    const present = list.filter((a) => a.status === 'Present').length;
    const absent = list.filter((a) => a.status === 'Absent').length;
    const late = list.filter((a) => a.status === 'Late').length;
    const leave = list.filter((a) => a.status === 'Leave').length;

    const studentRisks = db.students.map((s) => SmartAnalyticsService.calculateStudentAttendanceRisk(s.id));
    const safeCount = studentRisks.filter((r) => r.status === 'SAFE').length;
    const warningCount = studentRisks.filter((r) => r.status === 'WARNING').length;
    const atRiskCount = studentRisks.filter((r) => r.status === 'AT RISK').length;
    const criticalCount = studentRisks.filter((r) => r.status === 'CRITICAL').length;
    const highRiskList = SmartAnalyticsService.getEarlyWarningStudents();

    return res.status(200).json({
      success: true,
      data: {
        overallStats: {
          overallPercent: total > 0 ? Math.round(((present + late) / total) * 100) : 88,
          safeCount,
          warningCount,
          atRiskCount,
          criticalCount,
        },
        studentRisks,
        highRiskList,
        summary: {
          total,
          present,
          absent,
          late,
          leave,
          percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 100,
        },
        records: list.slice(0, 100),
      },
    });
  }

  // Fees Management
  static async getFees(req: AuthRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        fees: db.fees,
      },
    });
  }

  static async updateFeePayment(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { amountPaid } = req.body;
    const fee = db.fees.find((f) => f.id === id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found.' });

    const pay = Number(amountPaid);
    fee.paidAmount = Math.min(fee.amount, fee.paidAmount + pay);
    fee.dueAmount = Math.max(0, fee.amount - fee.paidAmount);
    fee.status = fee.dueAmount === 0 ? 'Paid' : 'Partial';
    fee.lastPaymentDate = new Date().toISOString().split('T')[0];
    fee.receiptNumber = `REC-${Date.now().toString().slice(-4)}`;

    AuditService.log({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      userRole: 'admin',
      action: 'FEE_PAYMENT_RECORDED',
      module: 'Fee Management',
      details: `Recorded payment of ₹${pay} for student ${fee.studentName}.`,
    });

    return res.status(200).json({ success: true, message: 'Payment recorded successfully.', data: fee });
  }

  // Audit Logs
  static async getAuditLogs(req: AuthRequest, res: Response) {
    return res.status(200).json({ success: true, data: db.auditLogs });
  }

  // Settings
  static async getSettings(req: AuthRequest, res: Response) {
    return res.status(200).json({ success: true, data: db.settings });
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    const {
      institutionName,
      contactEmail,
      contactPhone,
      academicYear,
      attendanceThresholdPercent,
      gradingRules,
      allowStudentQRScan,
    } = req.body;

    if (institutionName) db.settings.institutionName = institutionName;
    if (contactEmail) db.settings.contactEmail = contactEmail;
    if (contactPhone) db.settings.contactPhone = contactPhone;
    if (academicYear) db.settings.academicYear = academicYear;
    if (attendanceThresholdPercent !== undefined) db.settings.attendanceThresholdPercent = Number(attendanceThresholdPercent);
    if (gradingRules) db.settings.gradingRules = gradingRules;
    if (allowStudentQRScan !== undefined) db.settings.allowStudentQRScan = Boolean(allowStudentQRScan);
    db.settings.updatedAt = new Date().toISOString();

    AuditService.log({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      userRole: 'admin',
      action: 'SETTINGS_MODIFIED',
      module: 'Configuration',
      details: `Institutional configuration updated. Attendance threshold: ${db.settings.attendanceThresholdPercent}%.`,
    });

    return res.status(200).json({ success: true, message: 'Settings saved successfully.', data: db.settings });
  }
}
