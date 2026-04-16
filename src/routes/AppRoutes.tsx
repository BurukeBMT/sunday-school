import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('../components/LandingPage'));
const LoginPage = lazy(() => import('../components/LoginPage'));
const Dashboard = lazy(() => import('../components/Dashboard'));
const Registration = lazy(() => import('../components/Registration'));
const StudentList = lazy(() => import('../components/StudentList'));
const CourseManagement = lazy(() => import('../components/CourseManagement'));
const Scanner = lazy(() => import('../components/Scanner'));
const AttendanceLogs = lazy(() => import('../components/AttendanceLogs'));
const AdminManagement = lazy(() => import('../components/AdminManagement'));
const ManualAttendance = lazy(() => import('../components/ManualAttendance'));
const TeacherDashboard = lazy(() => import('../components/TeacherDashboard'));
const StudentResults = lazy(() => import('../components/StudentResults'));
const SuperAdminResults = lazy(() => import('../components/SuperAdminResults'));
const GradeRanking = lazy(() => import('../components/GradeRanking'));
const ResultsPublishPanel = lazy(() => import('../components/ResultsPublishPanel'));
const StudentProfile = lazy(() => import('../components/StudentProfile'));
const ResetPassword = lazy(() => import('../components/ResetPassword'));
const AttendanceAnalyticsDashboard = lazy(() => import('../components/AttendanceAnalyticsDashboard'));
const StudentRegistration = lazy(() => import('../components/StudentRegistration'));
const ParentDashboard = lazy(() => import('../components/ParentDashboard'));

// ERP Components
const ERPLayout = lazy(() => import('../erp/layout/ERPLayout'));
const UnifiedDashboard = lazy(() => import('../erp/pages/UnifiedDashboard'));
const Students = lazy(() => import('../erp/pages/Students'));
const Teachers = lazy(() => import('../erp/pages/Teachers'));
const Parents = lazy(() => import('../erp/pages/Parents'));
const Attendance = lazy(() => import('../erp/pages/Attendance'));
const Grading = lazy(() => import('../erp/pages/Grading'));
const Analytics = lazy(() => import('../erp/pages/Analytics'));
const ActivityLogs = lazy(() => import('../erp/pages/ActivityLogs'));

// Import routing components
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoutes } from './RoleRoutes';
import { Unauthorized } from '../pages/Unauthorized';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes - Role-based access */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <RoleRoutes role="student" />
                </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/*" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <RoleRoutes role="teacher" />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <RoleRoutes role="superadmin" />
                </ProtectedRoute>
            } />

            {/* Common Attendance Routes (accessible by all authenticated users) */}
            <Route path="/scanner" element={
                <ProtectedRoute>
                    <Scanner />
                </ProtectedRoute>
            } />
            <Route path="/manual-attendance" element={
                <ProtectedRoute>
                    <ManualAttendance />
                </ProtectedRoute>
            } />
            <Route path="/attendance" element={
                <ProtectedRoute>
                    <AttendanceLogs />
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
                    <AttendanceAnalyticsDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admins" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <AdminManagement />
                </ProtectedRoute>
            } />
            <Route path="/scanner" element={
                <ProtectedRoute>
                    <Scanner />
                </ProtectedRoute>
            } />
            <Route path="/manual-attendance" element={
                <ProtectedRoute>
                    <ManualAttendance />
                </ProtectedRoute>
            } />
            <Route path="/teacher-dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                </ProtectedRoute>
            } />
            <Route path="/student-results" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentResults />
                </ProtectedRoute>
            } />
            <Route path="/student-profile" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentProfile />
                </ProtectedRoute>
            } />
            <Route path="/superadmin-results" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <SuperAdminResults />
                </ProtectedRoute>
            } />
            <Route path="/grade-ranking" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'teacher']}>
                    <GradeRanking />
                </ProtectedRoute>
            } />
            <Route path="/results-publish" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                    <ResultsPublishPanel />
                </ProtectedRoute>
            } />

            {/* Student Registration Route */}
            <Route path="/student-registration" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                    <StudentRegistration />
                </ProtectedRoute>
            } />

            {/* Parent Dashboard Route */}
            <Route path="/parent-dashboard" element={
                <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                </ProtectedRoute>
            } />

            {/* ERP Dashboard Routes - New Professional Admin Interface */}
            <Route path="/erp" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                    <ERPLayout />
                </ProtectedRoute>
            }>
                <Route index element={<UnifiedDashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="parents" element={<Parents />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="grading" element={<Grading />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
            </Route>

            {/* Unauthorized access page */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch all - redirect to dashboard for authenticated users, landing for others */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};