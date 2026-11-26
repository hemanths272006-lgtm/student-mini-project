import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Layouts
import { AdminLayout } from './components/AdminLayout';
import { LecturerLayout } from './components/LecturerLayout';
import { StudentLayout } from './components/StudentLayout';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLecturers } from './pages/admin/AdminLecturers';
import { AdminSections } from './pages/admin/AdminSections';
import { AdminDoubts } from './pages/admin/AdminDoubts';
import { AdminMaterials } from './pages/admin/AdminMaterials';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Lecturer Pages
import { LecturerDashboard } from './pages/lecturer/LecturerDashboard';
import { LecturerClassification } from './pages/lecturer/LecturerClassification';
import { LecturerMarks } from './pages/lecturer/LecturerMarks';
import { LecturerProofs } from './pages/lecturer/LecturerProofs';
import { LecturerDoubts } from './pages/lecturer/LecturerDoubts';
import { LecturerMaterials } from './pages/lecturer/LecturerMaterials';
import { LecturerTests } from './pages/lecturer/LecturerTests';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentOnlineTests } from './pages/student/StudentOnlineTests';
import { StudentStudyProofs } from './pages/student/StudentStudyProofs';
import { StudentMaterials } from './pages/student/StudentMaterials';
import { StudentQuestionPapers } from './pages/student/StudentQuestionPapers';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentDoubts } from './pages/student/StudentDoubts';
import { StudentReportCard } from './pages/student/StudentReportCard';

// Shared Detailed Printable Student Report
import StudentReport from './pages/StudentReport';

// Root Redirect component based on authenticated role
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/welcome" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'lecturer') return <Navigate to="/lecturer" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Welcome and Auth Routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Root dynamic redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Shared Printable Student Report (Accessible by Admin and Faculty) */}
          <Route path="/reports" element={<Navigate to="/report/1" replace />} />
          <Route path="/report" element={<Navigate to="/report/1" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/students" element={<Navigate to="/admin/students" replace />} />
          <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

          <Route
            path="/report/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'lecturer']}>
                <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                  <StudentReport />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'lecturer']}>
                <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                  <StudentReport />
                </div>
              </ProtectedRoute>
            }
          />

          {/* 1. ADMIN PORTAL ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="lecturers" element={<AdminLecturers />} />
            <Route path="sections" element={<AdminSections />} />
            <Route path="doubts" element={<AdminDoubts />} />
            <Route path="materials" element={<AdminMaterials />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 2. LECTURER PORTAL ROUTES */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                <LecturerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LecturerDashboard />} />
            <Route path="classification" element={<LecturerClassification />} />
            <Route path="marks" element={<LecturerMarks />} />
            <Route path="proofs" element={<LecturerProofs />} />
            <Route path="doubts" element={<LecturerDoubts />} />
            <Route path="materials" element={<LecturerMaterials />} />
            <Route path="tests" element={<LecturerTests />} />
          </Route>

          {/* 3. STUDENT PORTAL ROUTES */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="tests" element={<StudentOnlineTests />} />
            <Route path="proofs" element={<StudentStudyProofs />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="question-papers" element={<StudentQuestionPapers />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="doubts" element={<StudentDoubts />} />
            <Route path="report-card" element={<StudentReportCard />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
