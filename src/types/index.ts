export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  linkedId?: string;
}

export interface Student {
  id: string;
  userId: string;
  studentIdNumber: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  courseId: string;
  courseName: string;
  department: string;
  semester: number;
  classSection: string;
  admissionDate: string;
  avatar: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  attendancePercent?: number;
  attendanceStatus?: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL';
  academicHealthScore?: number;
  academicHealthStatus?: string;
}

export interface Teacher {
  id: string;
  userId: string;
  teacherIdNumber: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experienceYears: number;
  subjects: string[];
  joiningDate: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  duration: string;
  description: string;
  totalSemesters: number;
  totalCredits: number;
  status: 'Active' | 'Archived';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  courseId: string;
  department: string;
  semester: number;
  credits: number;
  teacherId?: string;
  teacherName?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  courseId: string;
  semester: number;
  section: string;
  academicYear: string;
  roomNumber: string;
  classTeacherId: string;
  totalStudents: number;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  date: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  method: 'Manual' | 'QR';
  remarks?: string;
}

export interface AttendanceRiskData {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  lateClasses: number;
  currentPercent: number;
  requiredPercent: number;
  status: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL';
  statusExplanation: string;
  classesNeededToReachThreshold: number;
  maxClassesCanMiss: number;
  subjectWise: Array<{
    subjectId: string;
    subjectName: string;
    total: number;
    attended: number;
    percent: number;
    status: 'SAFE' | 'WARNING' | 'AT RISK' | 'CRITICAL';
  }>;
}

export interface AcademicHealthData {
  score: number;
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  summary: string;
  factors: {
    attendance: { weight: number; score: number; percent: number; comment: string };
    assignments: { weight: number; score: number; completionRate: number; avgGrade: number; comment: string };
    exams: { weight: number; score: number; avgPercentage: number; comment: string };
    consistency: { weight: number; score: number; streakDays: number; comment: string };
  };
  recommendations: string[];
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  description: string;
  dueDate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxMarks: number;
  attachmentUrl?: string;
  priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  submissionStatus?: 'Pending' | 'Submitted' | 'Late' | 'Graded';
  marksObtained?: number;
  feedback?: string;
  submittedAt?: string;
  totalSubmissions?: number;
  gradedSubmissions?: number;
  pendingSubmissions?: number;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  submittedAt: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  status: 'Submitted' | 'Late' | 'Graded';
  marksObtained?: number;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  semester: number;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxMarks: number;
  weightage: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  syllabus: string;
}

export interface Result {
  id: string;
  examId: string;
  examTitle: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
  publishedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  priority: 'Normal' | 'Important' | 'Urgent';
  audience: 'All' | 'Course' | 'Class' | 'Subject' | 'Teacher' | 'Student';
  createdAt: string;
  expiryDate?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'exam' | 'result' | 'announcement' | 'achievement' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface FeeItem {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  title: string;
  academicYear: string;
  semester: number;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  lastPaymentDate?: string;
  receiptNumber?: string;
}

export interface AchievementItem {
  badgeId: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SystemSettings {
  id: string;
  institutionName: string;
  institutionCode: string;
  contactEmail: string;
  contactPhone: string;
  academicYear: string;
  currentSemester: string;
  attendanceThresholdPercent: number;
  gradingRules: Array<{
    grade: string;
    minPercent: number;
    maxPercent: number;
    gradePoint: number;
    description: string;
  }>;
  allowStudentQRScan: boolean;
  developerName: string;
}
