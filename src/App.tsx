import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { PublicVerifyPage } from './pages/common/PublicVerifyPage';
import { AnnouncementsPage } from './pages/common/AnnouncementsPage';
import { ProfilePage } from './pages/common/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentManagement } from './pages/admin/StudentManagement';
import { TeacherManagement } from './pages/admin/TeacherManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { AttendanceManagement } from './pages/admin/AttendanceManagement';
import { ExamManagement } from './pages/admin/ExamManagement';
import { FeeManagement } from './pages/admin/FeeManagement';
import { ReportManagement } from './pages/admin/ReportManagement';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherInsightsPage } from './pages/teacher/TeacherInsightsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentExamsPage } from './pages/student/StudentExamsPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentIdCardPage } from './pages/student/StudentIdCardPage';
import { StudentBadgesPage } from './pages/student/StudentBadgesPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify" element={<PublicVerifyPage />} />
              <Route path="/verify/:studentId" element={<PublicVerifyPage />} />

              {/* Protected App Routes wrapped in AppLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RootRedirect />} />

                {/* Common Routes */}
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="profile" element={<ProfilePage />} />

                {/* Admin Routes */}
                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/students"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StudentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/teachers"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <TeacherManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/courses"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CourseManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AttendanceManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/exams"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ExamManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/fees"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <FeeManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ReportManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Teacher Routes */}
                <Route
                  path="teacher/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherAttendancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/assignments"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherAssignmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/exams"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <ExamManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/insights"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <TeacherInsightsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/students"
                  element={
                    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                      <StudentManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes */}
                <Route
                  path="student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentAttendancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/assignments"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentAssignmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/exams"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentExamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/fees"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentFeesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/id-card"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentIdCardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/badges"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentBadgesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
