import QRCode from 'qrcode';
import { db, QRSession, AttendanceRecord } from '../db/database';
import { AuditService } from './auditService';
import { NotificationService } from './notificationService';

export class QRService {
  /**
   * Generates a temporary, time-expiring signed QR session for Teacher attendance
   */
  static async generateSession(
    classId: string,
    subjectId: string,
    teacherId: string,
    durationMinutes: number = 5
  ): Promise<{ session: QRSession; qrCodeDataUrl: string }> {
    const cls = db.classes.find((c) => c.id === classId);
    const subj = db.subjects.find((s) => s.id === subjectId);
    const teacher = db.teachers.find((t) => t.id === teacherId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const token = `QR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Deactivate previous active sessions for same class & subject
    for (const s of db.qrSessions) {
      if (s.classId === classId && s.subjectId === subjectId && s.isActive) {
        s.isActive = false;
      }
    }

    const session: QRSession = {
      id: `qrs-${Date.now()}`,
      token,
      classId,
      className: cls?.name || 'CSE-4A',
      subjectId,
      subjectName: subj?.name || 'Subject',
      teacherId,
      date: now.toISOString().split('T')[0],
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
      isActive: true,
      scannedStudents: [],
    };

    db.qrSessions.push(session);

    // Create QR Code payload containing verification JSON
    const qrPayload = JSON.stringify({
      token: session.token,
      classId: session.classId,
      subjectId: session.subjectId,
      expiresAt: session.expiresAt,
      type: 'SMART_SMS_ATTENDANCE',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    AuditService.log({
      userId: teacher?.userId || teacherId,
      userName: teacher?.name || 'Teacher',
      userRole: 'teacher',
      action: 'QR_SESSION_GENERATED',
      module: 'Attendance',
      details: `Generated QR attendance session for ${cls?.name || classId} (${subj?.name || subjectId}) valid for ${durationMinutes} minutes.`,
    });

    return { session, qrCodeDataUrl };
  }

  /**
   * Scans / verifies student QR attendance submission
   */
  static scanAndMark(token: string, studentId: string): { success: boolean; message: string; record?: AttendanceRecord } {
    const session = db.qrSessions.find((s) => s.token === token);
    const student = db.students.find((s) => s.id === studentId);

    if (!student) {
      return { success: false, message: 'Student record not found.' };
    }

    if (!session || !session.isActive) {
      return { success: false, message: 'Invalid or expired QR code session.' };
    }

    const now = new Date().getTime();
    const expiry = new Date(session.expiresAt).getTime();

    if (now > expiry) {
      session.isActive = false;
      return { success: false, message: 'This QR code has expired. Please ask your instructor for assistance.' };
    }

    // Check duplicate
    if (session.scannedStudents.includes(studentId)) {
      return { success: false, message: 'Attendance has already been marked for this session.' };
    }

    // Check if attendance already recorded today for this subject
    const existing = db.attendance.find(
      (a) => a.studentId === studentId && a.subjectId === session.subjectId && a.date === session.date
    );

    if (existing) {
      existing.status = 'Present';
      existing.method = 'QR';
      session.scannedStudents.push(studentId);
      return { success: true, message: 'Attendance updated to Present successfully.', record: existing };
    }

    const teacher = db.teachers.find((t) => t.id === session.teacherId);
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId: session.classId,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      date: session.date,
      teacherId: session.teacherId,
      teacherName: teacher?.name || 'Instructor',
      studentId: student.id,
      studentName: student.name,
      studentIdNumber: student.studentIdNumber,
      status: 'Present',
      method: 'QR',
      remarks: 'Verified via encrypted Smart QR Token',
      createdAt: new Date().toISOString(),
    };

    db.attendance.push(newRecord);
    session.scannedStudents.push(studentId);

    AuditService.log({
      userId: student.userId,
      userName: student.name,
      userRole: 'student',
      action: 'QR_ATTENDANCE_SCANNED',
      module: 'Attendance',
      details: `Student verified QR attendance for ${session.subjectName} on ${session.date}.`,
    });

    NotificationService.sendToUser(
      student.userId,
      'Attendance Verified ✅',
      `Your attendance for ${session.subjectName} has been recorded as Present.`,
      'attendance',
      '/student/attendance'
    );

    return {
      success: true,
      message: `Attendance marked successfully for ${session.subjectName}!`,
      record: newRecord,
    };
  }
}
