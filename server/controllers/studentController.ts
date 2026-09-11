import { Response } from 'express';
import { db, SubmissionDoc, StudyPlanDoc } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { SmartAnalyticsService } from '../services/smartAnalytics';
import { AIService } from '../services/aiService';
import { QRService } from '../services/qrService';
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';

export class StudentController {
  // Student Dashboard
  static async getDashboard(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const student = db.students.find((s) => s.id === studentId);

    // Smart Analytics: Risk & Health
    const attRisk = SmartAnalyticsService.calculateStudentAttendanceRisk(studentId);
    const healthScore = SmartAnalyticsService.calculateAcademicHealthScore(studentId);

    // Assignments & Priority
    const submissions = db.submissions.filter((s) => s.studentId === studentId);
    const assignmentsWithStatus = db.assignments.map((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id);
      const priority = SmartAnalyticsService.getAssignmentPriority(a, studentId);
      return {
        ...a,
        submissionStatus: sub ? sub.status : 'Pending',
        submittedAt: sub?.submittedAt,
        marksObtained: sub?.marksObtained,
        feedback: sub?.feedback,
        priority,
      };
    });

    const pendingAssignments = assignmentsWithStatus.filter((a) => a.submissionStatus === 'Pending');

    // Upcoming Exams
    const upcomingExams = db.exams.filter((e) => e.status === 'Upcoming');

    // Recent Results
    const studentResults = db.results.filter((r) => r.studentId === studentId);
    const totalMarksPct = studentResults.length > 0
      ? Math.round(studentResults.reduce((a, b) => a + b.percentage, 0) / studentResults.length)
      : 88;
    const gpa = Math.round(((totalMarksPct / 10) + 0.5) * 10) / 10;

    // Today's classes
    const todayClasses = [
      {
        id: 'cls-sch-1',
        time: '09:30 AM - 10:30 AM',
        subject: 'Database Management Systems',
        room: 'Room 304',
        teacher: 'Prof. Marcus Vance',
        status: 'Completed',
      },
      {
        id: 'cls-sch-2',
        time: '11:45 AM - 12:45 PM',
        subject: 'Data Structures & Algorithms',
        room: 'Room 304',
        teacher: 'Prof. Marcus Vance',
        status: 'Ongoing',
      },
      {
        id: 'cls-sch-3',
        time: '02:30 PM - 04:30 PM',
        subject: 'DBMS Advanced Lab',
        room: 'Lab 402',
        teacher: 'Prof. Marcus Vance',
        status: 'Upcoming',
      },
    ];

    // Academic Timeline (Unified Chronology)
    const timeline = [
      {
        id: 'tl-1',
        date: 'Today, 09:30 AM',
        title: 'Attended Database Management Systems',
        category: 'attendance',
        icon: 'CheckCircle2',
        color: 'emerald',
        description: 'Marked Present via Smart QR Scanner verification.',
      },
      {
        id: 'tl-2',
        date: 'Aug 30, 2026',
        title: 'Submitted DBMS Normalization Coursework',
        category: 'assignment',
        icon: 'FileText',
        color: 'blue',
        description: 'Score: 28/30 (Grade: A+). Feedback: "Excellent rigor in proofs".',
      },
      {
        id: 'tl-3',
        date: 'Aug 24, 2026',
        title: 'Computer Networks Result Published',
        category: 'result',
        icon: 'Award',
        color: 'indigo',
        description: 'Score: 44/50 (88%, Grade A). Performance ranked top 10% of batch.',
      },
      {
        id: 'tl-4',
        date: 'Aug 20, 2026',
        title: 'Completed Computer Networks Unit Assessment',
        category: 'exam',
        icon: 'PenTool',
        color: 'purple',
        description: 'Examination completed in Lab 402 with no irregularities.',
      },
    ];

    // Achievements unlocked
    const achievements = db.achievements.filter((a) => a.studentId === studentId);

    return res.status(200).json({
      success: true,
      data: {
        student,
        studentProfile: student,
        overview: {
          attendancePercent: attRisk.currentPercent,
          requiredAttendance: attRisk.requiredPercent,
          attendanceStatus: attRisk.status,
          attendanceRisk: attRisk,
          healthScore,
          gpa,
          overallPercentage: totalMarksPct,
          pendingAssignmentsCount: pendingAssignments.length,
          upcomingExamsCount: upcomingExams.length,
        },
        attendanceRisk: attRisk,
        academicHealth: healthScore,
        todayClasses,
        pendingAssignments,
        upcomingExams,
        recentResults: studentResults,
        timeline,
        achievements,
        badges: achievements,
        earlyWarnings: attRisk.status === 'AT RISK' || attRisk.status === 'CRITICAL' ? [attRisk] : [],
      },
    });
  }

  // Detailed Attendance
  static async getAttendance(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const risk = SmartAnalyticsService.calculateStudentAttendanceRisk(studentId);
    const records = db.attendance.filter((a) => a.studentId === studentId);

    const overallStats = {
      overallPercent: risk.currentPercent,
      totalLectures: risk.totalClasses,
      attendedLectures: risk.attendedClasses,
      status: risk.status,
      classesNeeded: risk.classesNeededToReachThreshold,
      safeAbsencesRemaining: risk.maxClassesCanMiss,
    };

    const subjectBreakdown = risk.subjectWise.map((s) => ({
      subjectName: s.subjectName,
      attended: s.attended,
      total: s.total,
      percent: s.percent,
      status: s.status,
    }));

    // Monthly attendance trend
    const monthlyTrend = [
      { month: 'Jun', percent: 92 },
      { month: 'Jul', percent: 88 },
      { month: 'Aug', percent: 84 },
      { month: 'Sep (Current)', percent: risk.currentPercent },
    ];

    return res.status(200).json({
      success: true,
      data: {
        risk,
        overallStats,
        subjectBreakdown,
        records: records.slice(-30).reverse(),
        recentLogs: records.slice(-30).reverse(),
        monthlyTrend,
      },
    });
  }

  // Assignments & Submissions
  static async getAssignments(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const submissions = db.submissions.filter((s) => s.studentId === studentId);

    const list = db.assignments.map((a) => {
      const sub = submissions.find((s) => s.assignmentId === a.id);
      const priority = SmartAnalyticsService.getAssignmentPriority(a, studentId);
      return {
        ...a,
        submissionStatus: sub ? sub.status : 'Pending',
        submission: sub || null,
        priority,
      };
    });

    return res.status(200).json({ success: true, data: list });
  }

  static async submitAssignment(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const student = db.students.find((s) => s.id === studentId);
    const { assignmentId, content, fileUrl, fileName } = req.body;

    const asg = db.assignments.find((a) => a.id === assignmentId);
    if (!asg) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    const existingIndex = db.submissions.findIndex((s) => s.assignmentId === assignmentId && s.studentId === studentId);

    const submissionDoc: SubmissionDoc = {
      id: existingIndex !== -1 ? db.submissions[existingIndex].id : `subm-${Date.now()}`,
      assignmentId,
      studentId,
      studentName: student?.name || 'Student',
      studentIdNumber: student?.studentIdNumber || 'N/A',
      submittedAt: new Date().toISOString(),
      content: content || 'Assignment submitted via web portal.',
      fileUrl,
      fileName: fileName || 'Solution_Document.pdf',
      status: 'Submitted',
    };

    if (existingIndex !== -1) {
      db.submissions[existingIndex] = submissionDoc;
    } else {
      db.submissions.push(submissionDoc);
    }

    AuditService.log({
      userId: req.user?.id || studentId,
      userName: student?.name || 'Student',
      userRole: 'student',
      action: 'ASSIGNMENT_SUBMITTED',
      module: 'Assignments',
      details: `Submitted work for assignment "${asg.title}".`,
    });

    return res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully!',
      data: submissionDoc,
    });
  }

  // QR Attendance Scanning
  static async scanQRAttendance(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR Token string is required.' });
    }

    const result = QRService.scanAndMark(qrToken, studentId);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.record,
    });
  }

  // Exams & Results
  static async getExams(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const exams = db.exams;
    const results = db.results.filter((r) => r.studentId === studentId);

    const subjectComparison = db.subjects.map((s) => {
      const resForSubj = results.find((r) => r.subjectId === s.id);
      return {
        subject: s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || ''),
        fullName: s.name,
        score: resForSubj ? resForSubj.percentage : 82,
        classAverage: 76,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        exams,
        upcomingExams: exams.filter((e) => e.status === 'Upcoming'),
        results,
        subjectComparison,
        gpaSummary: {
          cgpa: 8.7,
          totalCredits: 64,
          earnedCredits: 64,
          rank: 'Top 5%',
        },
      },
    });
  }

  // AI Study Planner
  static async generateStudyPlan(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const { availableHoursPerDay = 3, preferredTime = 'Evening', weakSubjects = [], examTargetDate } = req.body;

    const plan = await AIService.generateStudyPlan({
      studentId,
      availableHoursPerDay: Number(availableHoursPerDay),
      preferredTime,
      weakSubjects: Array.isArray(weakSubjects) ? weakSubjects : [weakSubjects],
      examTargetDate,
    });

    // Save study plan
    const existingIndex = db.studyPlans.findIndex((p) => p.studentId === studentId);
    const planDoc: StudyPlanDoc = {
      id: `sp-${Date.now()}`,
      studentId,
      availableHoursPerDay: Number(availableHoursPerDay),
      preferredTime,
      weakSubjects: Array.isArray(weakSubjects) ? weakSubjects : [weakSubjects],
      examTargetDate,
      generatedSchedule: plan.weeklyPlan,
      aiGenerated: plan.aiGenerated,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) db.studyPlans[existingIndex] = planDoc;
    else db.studyPlans.push(planDoc);

    return res.status(200).json({
      success: true,
      message: plan.aiGenerated ? 'AI Study Plan generated using Gemini!' : 'Study Plan generated successfully.',
      data: plan,
    });
  }

  // Digital ID Card
  static async getDigitalIdCard(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const student = db.students.find((s) => s.id === studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found.' });

    const verificationPayload = JSON.stringify({
      studentId: student.id,
      studentIdNumber: student.studentIdNumber,
      name: student.name,
      course: student.courseName,
      department: student.department,
      semester: student.semester,
      institution: db.settings.institutionName,
      validThrough: 'July 2028',
      verified: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        student,
        institution: db.settings.institutionName,
        institutionCode: db.settings.institutionCode,
        academicYear: db.settings.academicYear,
        verificationPayload,
        validThrough: 'July 2028',
      },
    });
  }

  // Achievements
  static async getAchievements(req: AuthRequest, res: Response) {
    const studentId = req.user?.linkedId || 'stu-1';
    const studentBadges = db.achievements.filter((a) => a.studentId === studentId);

    const allBadgesCatalog = [
      {
        badgeId: 'early-bird',
        title: '⚡ Early Submitter',
        description: 'Submit 3 major assignments at least 24h prior to deadline.',
        category: 'Assignment',
        icon: 'Zap',
        unlocked: studentBadges.some((b) => b.badgeId === 'early-bird'),
        unlockedAt: studentBadges.find((b) => b.badgeId === 'early-bird')?.unlockedAt,
      },
      {
        badgeId: 'exam-excellence',
        title: '🎯 High Scorer',
        description: 'Score 85%+ in any semester examination.',
        category: 'Academic',
        icon: 'Target',
        unlocked: studentBadges.some((b) => b.badgeId === 'exam-excellence'),
        unlockedAt: studentBadges.find((b) => b.badgeId === 'exam-excellence')?.unlockedAt,
      },
      {
        badgeId: 'perfect-attendance',
        title: '🏆 Perfect Attendance',
        description: 'Achieve 95%+ attendance across all courses for the active term.',
        category: 'Attendance',
        icon: 'Award',
        unlocked: studentBadges.some((b) => b.badgeId === 'perfect-attendance'),
        unlockedAt: studentBadges.find((b) => b.badgeId === 'perfect-attendance')?.unlockedAt,
      },
      {
        badgeId: 'streak-master',
        title: '🔥 Study Streak Master',
        description: 'Complete scheduled study planner sessions for 14 continuous days.',
        category: 'Streak',
        icon: 'Flame',
        unlocked: studentBadges.some((b) => b.badgeId === 'streak-master'),
        unlockedAt: studentBadges.find((b) => b.badgeId === 'streak-master')?.unlockedAt,
      },
      {
        badgeId: 'code-wizard',
        title: '💻 Algorithm Ace',
        description: 'Attain maximum marks in Data Structures code benchmarks.',
        category: 'Academic',
        icon: 'Code',
        unlocked: false,
      },
    ];

    return res.status(200).json({ success: true, data: allBadgesCatalog });
  }
}
