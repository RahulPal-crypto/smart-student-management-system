import bcrypt from 'bcryptjs';

export interface UserDoc {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
  phone?: string;
  avatar?: string;
  linkedId?: string; // studentId or teacherId
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface StudentDoc {
  id: string;
  userId: string;
  studentIdNumber: string; // e.g., 'STU-2024-001'
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
  address: string;
  guardianName: string;
  guardianPhone: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherDoc {
  id: string;
  userId: string;
  teacherIdNumber: string; // e.g., 'TCH-101'
  name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experienceYears: number;
  subjects: string[]; // subject IDs or names
  joiningDate: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CourseDoc {
  id: string;
  code: string;
  name: string;
  department: string;
  duration: string;
  description: string;
  totalSemesters: number;
  totalCredits: number;
  status: 'Active' | 'Archived';
  createdAt: string;
}

export interface SubjectDoc {
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

export interface ClassDoc {
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
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName: string;
  studentId: string; // references StudentDoc.id
  studentName: string;
  studentIdNumber: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  method: 'Manual' | 'QR';
  remarks?: string;
  createdAt: string;
}

export interface QRSession {
  id: string;
  token: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  date: string;
  expiresAt: string; // ISO string
  createdAt: string;
  isActive: boolean;
  scannedStudents: string[]; // studentIds
}

export interface AssignmentDoc {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or ISO
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxMarks: number;
  attachmentUrl?: string;
  createdAt: string;
}

export interface SubmissionDoc {
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
  gradedAt?: string;
}

export interface ExamDoc {
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
  weightage: number; // percentage in final GPA
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  syllabus: string;
  createdAt: string;
}

export interface ResultDoc {
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

export interface AnnouncementDoc {
  id: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  priority: 'Normal' | 'Important' | 'Urgent';
  audience: 'All' | 'Course' | 'Class' | 'Subject' | 'Teacher' | 'Student';
  targetId?: string;
  createdAt: string;
  expiryDate?: string;
}

export interface NotificationDoc {
  id: string;
  recipientUserId: string; // UserDoc.id or 'all'
  roleTarget?: 'admin' | 'teacher' | 'student' | 'all';
  title: string;
  message: string;
  type: 'assignment' | 'attendance' | 'exam' | 'result' | 'announcement' | 'achievement' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface FeeDoc {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  title: string; // e.g. "Semester 4 Tuition & Lab Fee"
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

export interface AchievementDoc {
  id: string;
  studentId: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'Attendance' | 'Academic' | 'Streak' | 'Assignment';
}

export interface StudyPlanDoc {
  id: string;
  studentId: string;
  availableHoursPerDay: number;
  preferredTime: string;
  weakSubjects: string[];
  examTargetDate?: string;
  generatedSchedule: Array<{
    day: string;
    sessions: Array<{
      time: string;
      subject: string;
      topic: string;
      focusType: 'Theory' | 'Practice' | 'Revision' | 'Assignment';
      priority: 'High' | 'Medium' | 'Low';
    }>;
  }>;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogDoc {
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

export interface SystemSettingsDoc {
  id: string;
  institutionName: string;
  institutionCode: string;
  contactEmail: string;
  contactPhone: string;
  academicYear: string;
  currentSemester: string;
  attendanceThresholdPercent: number; // default 75
  gradingRules: Array<{
    grade: string;
    minPercent: number;
    maxPercent: number;
    gradePoint: number;
    description: string;
  }>;
  allowStudentQRScan: boolean;
  developerName: string;
  updatedAt: string;
}

// In-Memory & High Performance Database Engine with persistence capability
class SmartDatabase {
  users: UserDoc[] = [];
  students: StudentDoc[] = [];
  teachers: TeacherDoc[] = [];
  courses: CourseDoc[] = [];
  subjects: SubjectDoc[] = [];
  classes: ClassDoc[] = [];
  attendance: AttendanceRecord[] = [];
  qrSessions: QRSession[] = [];
  assignments: AssignmentDoc[] = [];
  submissions: SubmissionDoc[] = [];
  exams: ExamDoc[] = [];
  results: ResultDoc[] = [];
  announcements: AnnouncementDoc[] = [];
  notifications: NotificationDoc[] = [];
  fees: FeeDoc[] = [];
  achievements: AchievementDoc[] = [];
  studyPlans: StudyPlanDoc[] = [];
  auditLogs: AuditLogDoc[] = [];
  settings: SystemSettingsDoc = {
    id: 'settings-1',
    institutionName: 'Apex Institute of Technology & Management',
    institutionCode: 'APEX-ITM',
    contactEmail: 'contact@smartedu.org',
    contactPhone: '8795280892',
    academicYear: '2026-2027',
    currentSemester: 'Even Semester (Spring 2026)',
    attendanceThresholdPercent: 75,
    gradingRules: [
      { grade: 'A+', minPercent: 90, maxPercent: 100, gradePoint: 10.0, description: 'Outstanding' },
      { grade: 'A', minPercent: 80, maxPercent: 89.99, gradePoint: 9.0, description: 'Excellent' },
      { grade: 'B+', minPercent: 75, maxPercent: 79.99, gradePoint: 8.0, description: 'Very Good' },
      { grade: 'B', minPercent: 70, maxPercent: 74.99, gradePoint: 7.0, description: 'Good' },
      { grade: 'C', minPercent: 60, maxPercent: 69.99, gradePoint: 6.0, description: 'Average' },
      { grade: 'D', minPercent: 50, maxPercent: 59.99, gradePoint: 5.0, description: 'Pass' },
      { grade: 'F', minPercent: 0, maxPercent: 49.99, gradePoint: 0.0, description: 'Fail' },
    ],
    allowStudentQRScan: true,
    developerName: 'Sonam Pal',
    updatedAt: new Date().toISOString(),
  };

  private initialized = false;

  async init() {
    if (this.initialized) return;
    await this.seedInitialData();
    this.initialized = true;
  }

  private async seedInitialData() {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const teacherHash = await bcrypt.hash('Teacher@123', salt);
    const studentHash = await bcrypt.hash('Student@123', salt);

    // 1. Initial Administrator: Sonam Pal (as specified in prompt #11 & #92)
    const adminUser: UserDoc = {
      id: 'usr-admin-1',
      email: 'sonampachb20p5@gmail.com',
      passwordHash: adminHash,
      role: 'admin',
      name: 'Sonam Pal',
      phone: '8795280892',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Active',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z',
    };
    this.users.push(adminUser);

    // 2. Teachers
    const teachersSeedData = [
      {
        id: 'tch-1',
        userId: 'usr-tch-1',
        teacherIdNumber: 'TCH-101',
        name: 'Prof. Marcus Vance',
        email: 'teacher@smartedu.org',
        phone: '9876543210',
        department: 'Computer Science & Engineering',
        qualification: 'Ph.D. in Computer Science',
        experienceYears: 12,
        subjects: ['Data Structures & Algorithms', 'Database Management Systems'],
        joiningDate: '2020-07-15',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        status: 'Active' as const,
      },
      {
        id: 'tch-2',
        userId: 'usr-tch-2',
        teacherIdNumber: 'TCH-102',
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@smartedu.org',
        phone: '9876543211',
        department: 'Computer Science & Engineering',
        qualification: 'Ph.D. in Artificial Intelligence',
        experienceYears: 8,
        subjects: ['Machine Learning', 'Computer Networks'],
        joiningDate: '2022-01-10',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        status: 'Active' as const,
      },
      {
        id: 'tch-3',
        userId: 'usr-tch-3',
        teacherIdNumber: 'TCH-103',
        name: 'Prof. David Kim',
        email: 'david.kim@smartedu.org',
        phone: '9876543212',
        department: 'Information Technology',
        qualification: 'M.Tech, Ph.D. (Pursuing)',
        experienceYears: 6,
        subjects: ['Web Technologies', 'Software Engineering'],
        joiningDate: '2023-08-01',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        status: 'Active' as const,
      },
    ];

    for (const t of teachersSeedData) {
      const user: UserDoc = {
        id: t.userId,
        email: t.email,
        passwordHash: teacherHash,
        role: 'teacher',
        name: t.name,
        phone: t.phone,
        avatar: t.avatar,
        linkedId: t.id,
        status: 'Active',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      };
      this.users.push(user);
      this.teachers.push({
        ...t,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      });
    }

    // 3. Courses
    this.courses = [
      {
        id: 'crs-1',
        code: 'BTECH-CSE',
        name: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        duration: '4 Years (8 Semesters)',
        description: 'Comprehensive curriculum covering foundational algorithms, system programming, database systems, AI, and cloud architectures.',
        totalSemesters: 8,
        totalCredits: 160,
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'crs-2',
        code: 'BTECH-IT',
        name: 'B.Tech in Information Technology',
        department: 'Information Technology',
        duration: '4 Years (8 Semesters)',
        description: 'Focuses on enterprise software engineering, web application development, network security, and data science.',
        totalSemesters: 8,
        totalCredits: 160,
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'crs-3',
        code: 'BCA',
        name: 'Bachelor of Computer Applications',
        department: 'Computer Applications',
        duration: '3 Years (6 Semesters)',
        description: 'Practical computing degree with emphasis on modern programming, database administration, and UI/UX engineering.',
        totalSemesters: 6,
        totalCredits: 120,
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'crs-4',
        code: 'MCA',
        name: 'Master of Computer Applications',
        department: 'Computer Applications',
        duration: '2 Years (4 Semesters)',
        description: 'Advanced postgraduate program with focus on distributed systems, AI, and scalable cloud systems.',
        totalSemesters: 4,
        totalCredits: 90,
        status: 'Active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    // 4. Subjects
    this.subjects = [
      {
        id: 'sub-1',
        code: 'CS401',
        name: 'Data Structures & Algorithms',
        courseId: 'crs-1',
        department: 'Computer Science & Engineering',
        semester: 4,
        credits: 4,
        teacherId: 'tch-1',
        teacherName: 'Prof. Marcus Vance',
      },
      {
        id: 'sub-2',
        code: 'CS402',
        name: 'Database Management Systems',
        courseId: 'crs-1',
        department: 'Computer Science & Engineering',
        semester: 4,
        credits: 4,
        teacherId: 'tch-1',
        teacherName: 'Prof. Marcus Vance',
      },
      {
        id: 'sub-3',
        code: 'CS403',
        name: 'Machine Learning',
        courseId: 'crs-1',
        department: 'Computer Science & Engineering',
        semester: 4,
        credits: 3,
        teacherId: 'tch-2',
        teacherName: 'Dr. Sarah Jenkins',
      },
      {
        id: 'sub-4',
        code: 'CS404',
        name: 'Computer Networks',
        courseId: 'crs-1',
        department: 'Computer Science & Engineering',
        semester: 4,
        credits: 3,
        teacherId: 'tch-2',
        teacherName: 'Dr. Sarah Jenkins',
      },
      {
        id: 'sub-5',
        code: 'CS405',
        name: 'Web Technologies & Cloud',
        courseId: 'crs-1',
        department: 'Computer Science & Engineering',
        semester: 4,
        credits: 3,
        teacherId: 'tch-3',
        teacherName: 'Prof. David Kim',
      },
    ];

    // 5. Classes
    this.classes = [
      {
        id: 'cls-1',
        name: 'CSE-4A (Batch 2024-28)',
        courseId: 'crs-1',
        semester: 4,
        section: 'A',
        academicYear: '2026-2027',
        roomNumber: 'Room 304, Tech Wing',
        classTeacherId: 'tch-1',
        totalStudents: 45,
      },
      {
        id: 'cls-2',
        name: 'CSE-4B (Batch 2024-28)',
        courseId: 'crs-1',
        semester: 4,
        section: 'B',
        academicYear: '2026-2027',
        roomNumber: 'Room 305, Tech Wing',
        classTeacherId: 'tch-2',
        totalStudents: 42,
      },
      {
        id: 'cls-3',
        name: 'IT-4A (Batch 2024-28)',
        courseId: 'crs-2',
        semester: 4,
        section: 'A',
        academicYear: '2026-2027',
        roomNumber: 'Room 202, IT Block',
        classTeacherId: 'tch-3',
        totalStudents: 38,
      },
    ];

    // 6. Students
    const studentsSeed = [
      {
        id: 'stu-1',
        userId: 'usr-stu-1',
        studentIdNumber: 'STU-2024-001',
        name: 'Alex Rivera',
        email: 'student@smartedu.org',
        phone: '9845123401',
        gender: 'Male' as const,
        dob: '2004-06-15',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 4,
        classSection: 'CSE-4A',
        admissionDate: '2024-08-01',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        address: '142 Oakridge Avenue, Silicon Heights',
        guardianName: 'Robert Rivera',
        guardianPhone: '9845123499',
        status: 'Active' as const,
      },
      {
        id: 'stu-2',
        userId: 'usr-stu-2',
        studentIdNumber: 'STU-2024-042',
        name: 'Elena Rostova',
        email: 'elena.rostova@smartedu.org',
        phone: '9845123402',
        gender: 'Female' as const,
        dob: '2005-02-18',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 4,
        classSection: 'CSE-4A',
        admissionDate: '2024-08-01',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        address: '88 Cyber Park Boulevard, Apt 4B',
        guardianName: 'Olga Rostova',
        guardianPhone: '9845123498',
        status: 'Active' as const,
      },
      {
        id: 'stu-3',
        userId: 'usr-stu-3',
        studentIdNumber: 'STU-2024-088',
        name: 'James Chen',
        email: 'james.chen@smartedu.org',
        phone: '9845123403',
        gender: 'Male' as const,
        dob: '2004-11-23',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 4,
        classSection: 'CSE-4A',
        admissionDate: '2024-08-01',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        address: '12 University Drive, North Campus',
        guardianName: 'Li Chen',
        guardianPhone: '9845123497',
        status: 'Active' as const,
      },
      {
        id: 'stu-4',
        userId: 'usr-stu-4',
        studentIdNumber: 'STU-2024-104',
        name: 'Priya Sharma',
        email: 'priya.sharma@smartedu.org',
        phone: '9845123404',
        gender: 'Female' as const,
        dob: '2004-09-05',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 4,
        classSection: 'CSE-4A',
        admissionDate: '2024-08-01',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        address: '77 Jasmine Gardens, Sector 4',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '9845123496',
        status: 'Active' as const,
      },
      {
        id: 'stu-5',
        userId: 'usr-stu-5',
        studentIdNumber: 'STU-2024-119',
        name: 'Michael Scott Jr.',
        email: 'michael.scott@smartedu.org',
        phone: '9845123405',
        gender: 'Male' as const,
        dob: '2003-12-12',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'Computer Science & Engineering',
        semester: 4,
        classSection: 'CSE-4A',
        admissionDate: '2024-08-01',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
        address: '172 Scranton Road, Tech City',
        guardianName: 'Michael Scott Sr.',
        guardianPhone: '9845123495',
        status: 'Active' as const,
      },
    ];

    for (const s of studentsSeed) {
      const user: UserDoc = {
        id: s.userId,
        email: s.email,
        passwordHash: studentHash,
        role: 'student',
        name: s.name,
        phone: s.phone,
        avatar: s.avatar,
        linkedId: s.id,
        status: 'Active',
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      };
      this.users.push(user);
      this.students.push({
        ...s,
        createdAt: '2026-01-10T08:00:00.000Z',
        updatedAt: '2026-01-10T08:00:00.000Z',
      });
    }

    // 7. Generate Rich Historical Attendance Records (Last 30 days)
    // Alex Rivera has ~84% attendance, Elena has 94%, James Chen has 64% (Early Warning trigger for risk calculation!)
    const dates = [
      '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05',
      '2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11', '2026-08-12',
      '2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19',
      '2026-08-22', '2026-08-23', '2026-08-24', '2026-08-25', '2026-08-26',
      '2026-08-29', '2026-08-30', '2026-08-31', '2026-09-01',
    ];

    let attId = 1;
    for (const d of dates) {
      for (const subj of this.subjects.filter((s) => s.courseId === 'crs-1')) {
        for (const stu of this.students) {
          let status: 'Present' | 'Absent' | 'Late' | 'Leave' = 'Present';

          if (stu.id === 'stu-3') {
            // James Chen has attendance issues (64% attendance)
            const rand = (attId + d.length + stu.name.length) % 10;
            if (rand < 4) status = 'Absent';
            else if (rand === 4) status = 'Late';
            else status = 'Present';
          } else if (stu.id === 'stu-1') {
            // Alex Rivera has 84% attendance
            const rand = (attId + d.length) % 10;
            if (rand === 1 || rand === 7) status = 'Absent';
            else if (rand === 3) status = 'Late';
            else status = 'Present';
          } else {
            // Others 92-96%
            const rand = (attId + stu.id.length) % 12;
            if (rand === 0) status = 'Absent';
            else if (rand === 1) status = 'Late';
            else status = 'Present';
          }

          this.attendance.push({
            id: `att-${attId++}`,
            classId: 'cls-1',
            subjectId: subj.id,
            subjectName: subj.name,
            date: d,
            teacherId: subj.teacherId || 'tch-1',
            teacherName: subj.teacherName || 'Prof. Marcus Vance',
            studentId: stu.id,
            studentName: stu.name,
            studentIdNumber: stu.studentIdNumber,
            status,
            method: (attId % 4 === 0) ? 'QR' : 'Manual',
            createdAt: `${d}T09:30:00.000Z`,
          });
        }
      }
    }

    // 8. Assignments
    this.assignments = [
      {
        id: 'asg-1',
        title: 'B-Tree & Red-Black Tree Implementation',
        subjectId: 'sub-1',
        subjectName: 'Data Structures & Algorithms',
        classId: 'cls-1',
        className: 'CSE-4A',
        teacherId: 'tch-1',
        teacherName: 'Prof. Marcus Vance',
        description: 'Design and implement a self-balancing B-Tree indexing engine in C++ or Java with search, insert, and visual debug print capabilities.',
        dueDate: '2026-09-04',
        difficulty: 'Hard',
        maxMarks: 50,
        createdAt: '2026-08-25T10:00:00.000Z',
      },
      {
        id: 'asg-2',
        title: 'Relational Schema Normalization (3NF & BCNF)',
        subjectId: 'sub-2',
        subjectName: 'Database Management Systems',
        classId: 'cls-1',
        className: 'CSE-4A',
        teacherId: 'tch-1',
        teacherName: 'Prof. Marcus Vance',
        description: 'Analyze the given unnormalized hospital management database relation. Decompose into BCNF while preserving all functional dependencies.',
        dueDate: '2026-09-02',
        difficulty: 'Medium',
        maxMarks: 30,
        createdAt: '2026-08-26T11:00:00.000Z',
      },
      {
        id: 'asg-3',
        title: 'Convolutional Neural Network Image Classifier',
        subjectId: 'sub-3',
        subjectName: 'Machine Learning',
        classId: 'cls-1',
        className: 'CSE-4A',
        teacherId: 'tch-2',
        teacherName: 'Dr. Sarah Jenkins',
        description: 'Train a CNN architecture on the CIFAR-10 dataset achieving at least 86% validation accuracy. Provide confusion matrix and loss curves.',
        dueDate: '2026-09-10',
        difficulty: 'Hard',
        maxMarks: 100,
        createdAt: '2026-08-28T09:00:00.000Z',
      },
      {
        id: 'asg-4',
        title: 'TCP Socket Client-Server Chat Architecture',
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        classId: 'cls-1',
        className: 'CSE-4A',
        teacherId: 'tch-2',
        teacherName: 'Dr. Sarah Jenkins',
        description: 'Implement multi-threaded asynchronous socket server with encrypted packet handshake and room broadcast mechanics.',
        dueDate: '2026-09-15',
        difficulty: 'Medium',
        maxMarks: 40,
        createdAt: '2026-08-29T14:00:00.000Z',
      },
    ];

    // 9. Submissions
    this.submissions = [
      {
        id: 'subm-1',
        assignmentId: 'asg-2',
        studentId: 'stu-1', // Alex Rivera
        studentName: 'Alex Rivera',
        studentIdNumber: 'STU-2024-001',
        submittedAt: '2026-08-30T16:20:00.000Z',
        content: 'Completed full decomposition with mathematical proofs for lossless join and dependency preservation across R1(A,B,C) and R2(C,D,E).',
        status: 'Graded',
        marksObtained: 28,
        feedback: 'Excellent rigor in proof formulation. Very clean notation.',
        gradedAt: '2026-08-31T10:00:00.000Z',
      },
      {
        id: 'subm-2',
        assignmentId: 'asg-2',
        studentId: 'stu-2', // Elena
        studentName: 'Elena Rostova',
        studentIdNumber: 'STU-2024-042',
        submittedAt: '2026-08-29T14:15:00.000Z',
        content: 'Submitted SQL script and normalization schemas for 3NF and BCNF normalization matrices.',
        status: 'Graded',
        marksObtained: 30,
        feedback: 'Flawless schema design and SQL triggers.',
        gradedAt: '2026-08-31T10:15:00.000Z',
      },
      {
        id: 'subm-3',
        assignmentId: 'asg-1',
        studentId: 'stu-2',
        studentName: 'Elena Rostova',
        studentIdNumber: 'STU-2024-042',
        submittedAt: '2026-08-31T20:00:00.000Z',
        content: 'GitHub repo attached with C++20 B-Tree implementation and benchmark suite.',
        status: 'Submitted',
      },
    ];

    // 10. Exams
    this.exams = [
      {
        id: 'exm-1',
        title: 'Mid-Semester Theory Assessment (DSA & DBMS)',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        semester: 4,
        subjectId: 'sub-1',
        subjectName: 'Data Structures & Algorithms',
        date: '2026-09-18',
        startTime: '09:30 AM',
        endTime: '12:30 PM',
        roomNumber: 'Auditorium Hall A',
        maxMarks: 100,
        weightage: 30,
        status: 'Upcoming',
        syllabus: 'Unit 1: Trees & Balanced Trees; Unit 2: Graph Algorithms (Dijkstra, Floyd-Warshall); Unit 3: Dynamic Programming.',
        createdAt: '2026-08-20T00:00:00.000Z',
      },
      {
        id: 'exm-2',
        title: 'Database Management Systems Midterm',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        semester: 4,
        subjectId: 'sub-2',
        subjectName: 'Database Management Systems',
        date: '2026-09-20',
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        roomNumber: 'Auditorium Hall B',
        maxMarks: 100,
        weightage: 30,
        status: 'Upcoming',
        syllabus: 'Relational Algebra, SQL Queries, ACID Transactions, Concurrency Control (2PL, Timestamp Ordering), Indexing (B+ Trees).',
        createdAt: '2026-08-20T00:00:00.000Z',
      },
      {
        id: 'exm-3',
        title: 'Unit Assessment 1 (Computer Networks)',
        courseId: 'crs-1',
        courseName: 'B.Tech in Computer Science & Engineering',
        semester: 4,
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        date: '2026-08-20',
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        roomNumber: 'Lab 402',
        maxMarks: 50,
        weightage: 15,
        status: 'Completed',
        syllabus: 'OSI 7-Layer Model, TCP/IP Suite, HDLC framing, Error correction Hamming codes.',
        createdAt: '2026-08-10T00:00:00.000Z',
      },
    ];

    // 11. Results
    this.results = [
      {
        id: 'res-1',
        examId: 'exm-3',
        examTitle: 'Unit Assessment 1 (Computer Networks)',
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        studentId: 'stu-1', // Alex Rivera
        studentName: 'Alex Rivera',
        studentIdNumber: 'STU-2024-001',
        marksObtained: 44,
        maxMarks: 50,
        percentage: 88,
        grade: 'A',
        gradePoint: 9.0,
        remarks: 'Great mastery of subnetting and protocol headers.',
        publishedAt: '2026-08-24T14:00:00.000Z',
      },
      {
        id: 'res-2',
        examId: 'exm-3',
        examTitle: 'Unit Assessment 1 (Computer Networks)',
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        studentId: 'stu-2', // Elena
        studentName: 'Elena Rostova',
        studentIdNumber: 'STU-2024-042',
        marksObtained: 48,
        maxMarks: 50,
        percentage: 96,
        grade: 'A+',
        gradePoint: 10.0,
        remarks: 'Outstanding conceptual clarity and network packet tracing.',
        publishedAt: '2026-08-24T14:00:00.000Z',
      },
      {
        id: 'res-3',
        examId: 'exm-3',
        examTitle: 'Unit Assessment 1 (Computer Networks)',
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        studentId: 'stu-3', // James Chen
        studentName: 'James Chen',
        studentIdNumber: 'STU-2024-088',
        marksObtained: 27,
        maxMarks: 50,
        percentage: 54,
        grade: 'D',
        gradePoint: 5.0,
        remarks: 'Struggled on sliding window protocol math. Needs tutoring.',
        publishedAt: '2026-08-24T14:00:00.000Z',
      },
      {
        id: 'res-4',
        examId: 'exm-3',
        examTitle: 'Unit Assessment 1 (Computer Networks)',
        subjectId: 'sub-4',
        subjectName: 'Computer Networks',
        studentId: 'stu-4', // Priya
        studentName: 'Priya Sharma',
        studentIdNumber: 'STU-2024-104',
        marksObtained: 42,
        maxMarks: 50,
        percentage: 84,
        grade: 'A',
        gradePoint: 9.0,
        remarks: 'Very well structured paper.',
        publishedAt: '2026-08-24T14:00:00.000Z',
      },
    ];

    // 12. Announcements
    this.announcements = [
      {
        id: 'anc-1',
        title: 'Mid-Semester Examination Schedule Published',
        message: 'The Mid-Semester theory examinations for all B.Tech and BCA semesters are slated to begin from September 18, 2026. Hall tickets and seating charts will be released through your digital student portal.',
        authorId: 'usr-admin-1',
        authorName: 'Sonam Pal (Administrator)',
        authorRole: 'admin',
        priority: 'Urgent',
        audience: 'All',
        createdAt: '2026-08-28T09:00:00.000Z',
      },
      {
        id: 'anc-2',
        title: 'Annual Tech Hackathon & Innovation Expo 2026',
        message: 'Registrations are now open for the 48-hour Smart Campus Hackathon. Top projects will be awarded research grants and industry mentorship. Register your team of 3-4 by Sept 12.',
        authorId: 'usr-admin-1',
        authorName: 'Sonam Pal (Administrator)',
        authorRole: 'admin',
        priority: 'Important',
        audience: 'All',
        createdAt: '2026-08-27T11:30:00.000Z',
      },
      {
        id: 'anc-3',
        title: 'Special Extra Tutorial for B-Tree Indexing in DBMS',
        message: 'Prof. Marcus Vance will conduct an interactive doubt-clearing and coding lab this Thursday from 4:00 PM - 5:30 PM in Lab 304 for CSE-4A.',
        authorId: 'usr-tch-1',
        authorName: 'Prof. Marcus Vance',
        authorRole: 'teacher',
        priority: 'Normal',
        audience: 'Class',
        targetId: 'cls-1',
        createdAt: '2026-08-30T15:00:00.000Z',
      },
    ];

    // 13. Smart Notifications
    this.notifications = [
      {
        id: 'ntf-1',
        recipientUserId: 'usr-stu-1', // Alex Rivera
        title: 'Assignment Due Soon',
        message: 'Relational Schema Normalization (3NF & BCNF) is due tomorrow at 11:59 PM.',
        type: 'assignment',
        isRead: false,
        link: '/student/assignments',
        createdAt: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'ntf-2',
        recipientUserId: 'usr-stu-1',
        title: 'Exam Schedule Announced',
        message: 'Mid-Semester Theory Assessment starts on Sept 18. Check exam room details in your portal.',
        type: 'exam',
        isRead: false,
        link: '/student/exams',
        createdAt: '2026-08-29T10:15:00.000Z',
      },
      {
        id: 'ntf-3',
        recipientUserId: 'usr-stu-1',
        title: 'Result Published',
        message: 'Your Computer Networks Unit Assessment result has been published: 88% (Grade A).',
        type: 'result',
        isRead: true,
        link: '/student/results',
        createdAt: '2026-08-24T14:05:00.000Z',
      },
      {
        id: 'ntf-4',
        recipientUserId: 'usr-stu-1',
        title: 'Achievement Unlocked! 🏆',
        message: 'You earned the "Early Submitter" badge for submitting assignments ahead of deadlines.',
        type: 'achievement',
        isRead: false,
        link: '/student/achievements',
        createdAt: '2026-08-30T17:00:00.000Z',
      },
      {
        id: 'ntf-5',
        recipientUserId: 'usr-admin-1', // Admin Sonam Pal
        title: 'Early Warning System Alert',
        message: 'Student James Chen (STU-2024-088) attendance dropped to 64% with 1 failing exam.',
        type: 'alert',
        isRead: false,
        link: '/admin/students',
        createdAt: '2026-09-01T07:30:00.000Z',
      },
    ];

    // 14. Fees
    this.fees = [
      {
        id: 'fee-1',
        studentId: 'stu-1',
        studentName: 'Alex Rivera',
        studentIdNumber: 'STU-2024-001',
        title: 'Semester 4 Tuition & Tech Lab Fee',
        academicYear: '2026-2027',
        semester: 4,
        amount: 45000,
        paidAmount: 45000,
        dueAmount: 0,
        dueDate: '2026-08-15',
        status: 'Paid',
        lastPaymentDate: '2026-08-10',
        receiptNumber: 'REC-2026-8841',
      },
      {
        id: 'fee-2',
        studentId: 'stu-2',
        studentName: 'Elena Rostova',
        studentIdNumber: 'STU-2024-042',
        title: 'Semester 4 Tuition & Tech Lab Fee',
        academicYear: '2026-2027',
        semester: 4,
        amount: 45000,
        paidAmount: 45000,
        dueAmount: 0,
        dueDate: '2026-08-15',
        status: 'Paid',
        lastPaymentDate: '2026-08-08',
        receiptNumber: 'REC-2026-8812',
      },
      {
        id: 'fee-3',
        studentId: 'stu-3',
        studentName: 'James Chen',
        studentIdNumber: 'STU-2024-088',
        title: 'Semester 4 Tuition & Tech Lab Fee',
        academicYear: '2026-2027',
        semester: 4,
        amount: 45000,
        paidAmount: 20000,
        dueAmount: 25000,
        dueDate: '2026-09-15',
        status: 'Partial',
        lastPaymentDate: '2026-08-14',
        receiptNumber: 'REC-2026-8902',
      },
    ];

    // 15. Achievements
    this.achievements = [
      {
        id: 'ach-1',
        studentId: 'stu-1',
        badgeId: 'early-bird',
        title: '⚡ Early Submitter',
        description: 'Submitted 3 consecutive major assignments at least 24 hours before deadline.',
        icon: 'Zap',
        unlockedAt: '2026-08-30T17:00:00.000Z',
        category: 'Assignment',
      },
      {
        id: 'ach-2',
        studentId: 'stu-1',
        badgeId: 'exam-excellence',
        title: '🎯 High Scorer',
        description: 'Scored above 85% in Computer Networks Unit Examination.',
        icon: 'Target',
        unlockedAt: '2026-08-24T14:00:00.000Z',
        category: 'Academic',
      },
      {
        id: 'ach-3',
        studentId: 'stu-2',
        badgeId: 'perfect-attendance',
        title: '🏆 Perfect Attendance Star',
        description: 'Maintained 95%+ attendance across all registered courses for the current month.',
        icon: 'Award',
        unlockedAt: '2026-08-31T23:59:00.000Z',
        category: 'Attendance',
      },
      {
        id: 'ach-4',
        studentId: 'stu-2',
        badgeId: 'streak-master',
        title: '🔥 14-Day Study Streak',
        description: 'Completed scheduled study planner goals for 14 consecutive days.',
        icon: 'Flame',
        unlockedAt: '2026-08-28T18:00:00.000Z',
        category: 'Streak',
      },
    ];

    // 16. Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-admin-1',
        userName: 'Sonam Pal',
        userRole: 'admin',
        action: 'INSTITUTION_INITIALIZED',
        module: 'System Setup',
        details: 'Smart Student Management System booted with 2026-2027 academic year configuration.',
        ipAddress: '127.0.0.1 (Cloud Node)',
        userAgent: 'Chrome / Linux System Agent',
        timestamp: '2026-08-01T08:00:00.000Z',
      },
      {
        id: 'aud-2',
        userId: 'usr-admin-1',
        userName: 'Sonam Pal',
        userRole: 'admin',
        action: 'COURSE_CONFIGURED',
        module: 'Academic Management',
        details: 'Configured course BTECH-CSE with 8 semesters and 5 core subjects.',
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome Browser',
        timestamp: '2026-08-05T09:12:00.000Z',
      },
      {
        id: 'aud-3',
        userId: 'usr-tch-1',
        userName: 'Prof. Marcus Vance',
        userRole: 'teacher',
        action: 'QR_ATTENDANCE_GENERATED',
        module: 'Attendance Engine',
        details: 'Generated 5-minute dynamic QR attendance session for CSE-4A (DBMS).',
        ipAddress: '192.168.1.44',
        userAgent: 'Safari / iPadOS',
        timestamp: '2026-08-28T09:30:00.000Z',
      },
      {
        id: 'aud-4',
        userId: 'usr-tch-2',
        userName: 'Dr. Sarah Jenkins',
        userRole: 'teacher',
        action: 'RESULT_PUBLISHED',
        module: 'Examinations',
        details: 'Published marks for Unit Assessment 1 (Computer Networks) for 42 students.',
        ipAddress: '192.168.1.52',
        userAgent: 'Firefox / macOS',
        timestamp: '2026-08-24T14:00:00.000Z',
      },
    ];
  }
}

export const db = new SmartDatabase();
