import { Response } from 'express';
import { db, AssignmentDoc, SubmissionDoc, ExamDoc, ResultDoc, AttendanceRecord } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { AssignmentCreateSchema, ResultEntrySchema, AttendanceMarkSchema, QRAttendanceGenerateSchema } from '../validators/schemas';
import { QRService } from '../services/qrService';
import { AIService } from '../services/aiService';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';
import { SmartAnalyticsService } from '../services/smartAnalytics';

export class TeacherController {
  // Teacher Dashboard Stats
  static async getDashboardStats(req: AuthRequest, res: Response) {
    const teacherId = req.user?.linkedId || 'tch-1';
    const teacher = db.teachers.find((t) => t.id === teacherId);

    const myClasses = db.classes.filter((c) => c.classTeacherId === teacherId);
    const mySubjects = db.subjects.filter((s) => s.teacherId === teacherId);
    const myAssignments = db.assignments.filter((a) => a.teacherId === teacherId);

    const pendingSubmissions = db.submissions.filter(
      (sub) => myAssignments.some((a) => a.id === sub.assignmentId) && sub.status === 'Submitted'
    ).length;

    // Today's schedule
    const todaySchedule = [
      {
        id: 'sch-1',
        time: '09:30 AM - 10:30 AM',
        subject: 'Database Management Systems',
        className: 'CSE-4A',
        room: 'Room 304, Tech Wing',
        status: 'Completed',
        topic: 'BCNF Normalization & Lossless Decomposition',
      },
      {
        id: 'sch-2',
        time: '11:45 AM - 12:45 PM',
        subject: 'Data Structures & Algorithms',
        className: 'CSE-4A',
        room: 'Room 304, Tech Wing',
        status: 'Ongoing',
        topic: 'B-Tree Node Split & Balancing Algorithms',
      },
      {
        id: 'sch-3',
        time: '02:30 PM - 04:30 PM',
        subject: 'DBMS Advanced Lab',
        className: 'CSE-4A',
        room: 'Lab 402, Database Systems Lab',
        status: 'Upcoming',
        topic: 'PL/SQL Triggers and Transaction Isolation Test Cases',
      },
    ];

    // Early warning students in teacher's classes
    const earlyWarning = SmartAnalyticsService.getEarlyWarningStudents();

    // Teacher class performance stats
    const insights = AIService.generateTeacherInsights('cls-1');

    const pendingList = db.submissions.filter((s) => s.status === 'Submitted' || s.status === 'Late');

    return res.status(200).json({
      success: true,
      data: {
        teacher: {
          name: teacher?.name || 'Instructor',
          department: teacher?.department || 'Computer Science',
          teacherIdNumber: teacher?.teacherIdNumber || 'TCH-101',
          subjects: mySubjects.map((s) => s.name),
        },
        overview: {
          totalClasses: myClasses.length || 2,
          totalStudents: 80,
          pendingSubmissionsToGrade: pendingSubmissions,
          averageAttendanceRate: 85,
        },
        stats: {
          totalClasses: myClasses.length || 1,
          totalStudents: 45,
          pendingGrading: pendingSubmissions,
          upcomingExams: db.exams.filter((e) => e.status === 'Upcoming').length,
        },
        todaySchedule,
        todayClasses: todaySchedule.map((s) => ({
          ...s,
          subjectName: s.subject,
        })),
        pendingGrading: pendingList,
        earlyWarnings: earlyWarning,
        earlyWarningStudents: earlyWarning,
        insights,
      },
    });
  }

  // Teacher Classes & Students
  static async getMyClasses(req: AuthRequest, res: Response) {
    const teacherId = req.user?.linkedId || 'tch-1';
    const classes = db.classes.filter((c) => c.classTeacherId === teacherId);
    const subjects = db.subjects.filter((s) => s.teacherId === teacherId);

    return res.status(200).json({
      success: true,
      data: {
        classes: classes.length > 0 ? classes : db.classes,
        subjects: subjects.length > 0 ? subjects : db.subjects,
      },
    });
  }

  static async getStudentsForClass(req: AuthRequest, res: Response) {
    const { classSection = 'CSE-4A' } = req.query;
    const students = db.students.filter((s) => !classSection || s.classSection === classSection);

    const enriched = students.map((s) => {
      const risk = SmartAnalyticsService.calculateStudentAttendanceRisk(s.id);
      const health = SmartAnalyticsService.calculateAcademicHealthScore(s.id);
      return {
        ...s,
        attendancePercent: risk.currentPercent,
        attendanceStatus: risk.status,
        academicHealthScore: health.score,
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  }

  // Attendance Marking
  static async markAttendance(req: AuthRequest, res: Response) {
    const parsed = AttendanceMarkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const { classId, subjectId, date, records } = parsed.data;
    const teacherId = req.user?.linkedId || 'tch-1';
    const teacher = db.teachers.find((t) => t.id === teacherId);
    const subj = db.subjects.find((s) => s.id === subjectId);

    for (const r of records) {
      const student = db.students.find((s) => s.id === r.studentId);
      const existing = db.attendance.find(
        (a) => a.studentId === r.studentId && a.subjectId === subjectId && a.date === date
      );

      if (existing) {
        existing.status = r.status;
        existing.remarks = r.remarks;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          classId,
          subjectId,
          subjectName: subj?.name || 'Course Subject',
          date,
          teacherId,
          teacherName: teacher?.name || 'Instructor',
          studentId: r.studentId,
          studentName: student?.name || 'Student',
          studentIdNumber: student?.studentIdNumber || 'N/A',
          status: r.status,
          method: 'Manual',
          remarks: r.remarks,
          createdAt: new Date().toISOString(),
        };
        db.attendance.push(newRecord);
      }
    }

    AuditService.log({
      userId: req.user?.id || teacherId,
      userName: teacher?.name || 'Teacher',
      userRole: 'teacher',
      action: 'ATTENDANCE_MARKED',
      module: 'Attendance',
      details: `Saved manual attendance roster for ${records.length} students on ${date}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Attendance for ${records.length} students recorded successfully.`,
    });
  }

  // Generate QR Code Attendance Session
  static async generateQRSession(req: AuthRequest, res: Response) {
    const parsed = QRAttendanceGenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const teacherId = req.user?.linkedId || 'tch-1';
    const result = await QRService.generateSession(
      parsed.data.classId,
      parsed.data.subjectId,
      teacherId,
      parsed.data.durationMinutes
    );

    return res.status(200).json({
      success: true,
      message: 'QR Attendance session launched.',
      data: result,
    });
  }

  // Assignments & Grading
  static async getAssignments(req: AuthRequest, res: Response) {
    const teacherId = req.user?.linkedId || 'tch-1';
    const assignments = db.assignments;
    const submissions = db.submissions;

    const list = assignments.map((a) => {
      const subs = submissions.filter((s) => s.assignmentId === a.id);
      const graded = subs.filter((s) => s.status === 'Graded').length;
      return {
        ...a,
        totalSubmissions: subs.length,
        gradedSubmissions: graded,
        pendingSubmissions: subs.length - graded,
        submissions: subs,
      };
    });

    return res.status(200).json({ success: true, data: list });
  }

  static async createAssignment(req: AuthRequest, res: Response) {
    const parsed = AssignmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const teacherId = req.user?.linkedId || 'tch-1';
    const teacher = db.teachers.find((t) => t.id === teacherId);
    const subj = db.subjects.find((s) => s.id === parsed.data.subjectId);
    const cls = db.classes.find((c) => c.id === parsed.data.classId);

    const asg: AssignmentDoc = {
      id: `asg-${Date.now()}`,
      title: parsed.data.title,
      subjectId: parsed.data.subjectId,
      subjectName: subj?.name || 'Subject',
      classId: parsed.data.classId,
      className: cls?.name || 'CSE-4A',
      teacherId,
      teacherName: teacher?.name || 'Instructor',
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
      difficulty: parsed.data.difficulty,
      maxMarks: parsed.data.maxMarks,
      attachmentUrl: parsed.data.attachmentUrl,
      createdAt: new Date().toISOString(),
    };
    db.assignments.unshift(asg);

    NotificationService.broadcastRole(
      'student',
      'New Assignment Created 📝',
      `${asg.title} (${asg.subjectName}) is due on ${asg.dueDate}.`,
      'assignment',
      '/student/assignments'
    );

    AuditService.log({
      userId: req.user?.id || teacherId,
      userName: teacher?.name || 'Teacher',
      userRole: 'teacher',
      action: 'ASSIGNMENT_CREATED',
      module: 'Assignments',
      details: `Created assignment "${asg.title}" due on ${asg.dueDate}.`,
    });

    return res.status(201).json({ success: true, message: 'Assignment published successfully.', data: asg });
  }

  static async gradeSubmission(req: AuthRequest, res: Response) {
    const { submissionId, marksObtained, feedback } = req.body;
    const sub = db.submissions.find((s) => s.id === submissionId);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const asg = db.assignments.find((a) => a.id === sub.assignmentId);
    if (asg && Number(marksObtained) > asg.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks obtained (${marksObtained}) cannot exceed maximum marks (${asg.maxMarks}).`,
      });
    }

    sub.marksObtained = Number(marksObtained);
    sub.feedback = feedback || 'Graded by instructor.';
    sub.status = 'Graded';
    sub.gradedAt = new Date().toISOString();

    const student = db.students.find((s) => s.id === sub.studentId);
    if (student) {
      NotificationService.sendToUser(
        student.userId,
        'Assignment Graded 🌟',
        `Your submission for "${asg?.title || 'Assignment'}" has been graded: ${sub.marksObtained}/${asg?.maxMarks || 50}`,
        'assignment',
        '/student/assignments'
      );
    }

    return res.status(200).json({ success: true, message: 'Submission graded successfully.', data: sub });
  }

  // Examinations & Results Entry
  static async getExams(req: AuthRequest, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        exams: db.exams,
        results: db.results,
      },
    });
  }

  static async enterResults(req: AuthRequest, res: Response) {
    const parsed = ResultEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message });
    }

    const { examId, subjectId, entries } = parsed.data;
    const exam = db.exams.find((e) => e.id === examId);
    const subj = db.subjects.find((s) => s.id === subjectId);

    for (const entry of entries) {
      const student = db.students.find((s) => s.id === entry.studentId);
      const percentage = Math.round((entry.marksObtained / entry.maxMarks) * 100);

      let grade = 'F';
      let gradePoint = 0;
      for (const rule of db.settings.gradingRules) {
        if (percentage >= rule.minPercent && percentage <= rule.maxPercent) {
          grade = rule.grade;
          gradePoint = rule.gradePoint;
          break;
        }
      }

      const existing = db.results.find((r) => r.examId === examId && r.studentId === entry.studentId);
      if (existing) {
        existing.marksObtained = entry.marksObtained;
        existing.maxMarks = entry.maxMarks;
        existing.percentage = percentage;
        existing.grade = grade;
        existing.gradePoint = gradePoint;
        existing.remarks = entry.remarks;
      } else {
        const resultDoc: ResultDoc = {
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          examId,
          examTitle: exam?.title || 'Examination',
          subjectId,
          subjectName: subj?.name || 'Subject',
          studentId: entry.studentId,
          studentName: student?.name || 'Student',
          studentIdNumber: student?.studentIdNumber || 'N/A',
          marksObtained: entry.marksObtained,
          maxMarks: entry.maxMarks,
          percentage,
          grade,
          gradePoint,
          remarks: entry.remarks,
          publishedAt: new Date().toISOString(),
        };
        db.results.push(resultDoc);
      }

      if (student) {
        NotificationService.sendToUser(
          student.userId,
          'Exam Result Published 📊',
          `Your result for ${exam?.title || 'Exam'} (${subj?.name}) has been published: ${percentage}% (Grade: ${grade}).`,
          'result',
          '/student/results'
        );
      }
    }

    AuditService.log({
      userId: req.user?.id || 'teacher',
      userName: req.user?.name || 'Teacher',
      userRole: 'teacher',
      action: 'RESULTS_PUBLISHED',
      module: 'Examinations',
      details: `Published exam marks for ${entries.length} students in ${subj?.name || 'Course'}.`,
    });

    return res.status(200).json({ success: true, message: `Results published for ${entries.length} students.` });
  }

  // Teacher Class Insights
  static async getClassInsights(req: AuthRequest, res: Response) {
    const { classId = 'cls-1', subjectId } = req.query;
    const insights = AIService.generateTeacherInsights(classId as string, subjectId as string);
    return res.status(200).json({ success: true, data: insights });
  }
}
