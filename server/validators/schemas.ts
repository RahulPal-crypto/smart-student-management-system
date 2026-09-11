import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'teacher', 'student']),
});

export const StudentCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().min(1, 'Date of birth is required'),
  courseId: z.string().min(1, 'Course is required'),
  department: z.string().min(1, 'Department is required'),
  semester: z.number().min(1).max(8),
  classSection: z.string().min(1, 'Class section is required'),
  address: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Graduated', 'Suspended']).default('Active'),
});

export const TeacherCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(1, 'Department is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const CourseCreateSchema = z.object({
  code: z.string().min(2, 'Course code is required'),
  name: z.string().min(2, 'Course name is required'),
  department: z.string().min(2, 'Department is required'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Archived']).default('Active'),
});

export const AttendanceMarkSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(['Present', 'Absent', 'Late', 'Leave']),
      remarks: z.string().optional(),
    })
  ),
});

export const QRAttendanceGenerateSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().min(1).max(30).default(5),
});

export const QRAttendanceScanSchema = z.object({
  qrToken: z.string().min(1, 'QR Token is required'),
  studentId: z.string().optional(), // Inferred from JWT if student
});

export const AssignmentCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subjectId: z.string().min(1, 'Subject is required'),
  classId: z.string().min(1, 'Class is required'),
  description: z.string().min(5, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  maxMarks: z.number().min(1, 'Max marks must be greater than 0'),
  attachmentUrl: z.string().optional(),
});

export const ResultEntrySchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  entries: z.array(
    z.object({
      studentId: z.string(),
      marksObtained: z.number().min(0, 'Marks cannot be negative'),
      maxMarks: z.number().min(1, 'Max marks must be greater than 0'),
      remarks: z.string().optional(),
    })
  ).refine(
    (items) => items.every((item) => item.marksObtained <= item.maxMarks),
    { message: 'Marks obtained cannot exceed maximum marks' }
  ),
});

export const AnnouncementCreateSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  message: z.string().min(5, 'Message is required'),
  priority: z.enum(['Normal', 'Important', 'Urgent']).default('Normal'),
  audience: z.enum(['All', 'Course', 'Class', 'Subject', 'Teacher', 'Student']).default('All'),
  targetId: z.string().optional(),
  expiryDate: z.string().optional(),
});
