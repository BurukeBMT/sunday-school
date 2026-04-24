import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../components/Dashboard'));
const StudentProfile = lazy(() => import('../components/StudentProfile'));
const StudentResults = lazy(() => import('../components/StudentResults'));
const AttendanceLogs = lazy(() => import('../components/AttendanceLogs'));
const TeacherDashboard = lazy(() => import('../components/TeacherDashboard'));
const Scanner = lazy(() => import('../components/Scanner'));
const ManualAttendance = lazy(() => import('../components/ManualAttendance'));
const Registration = lazy(() => import('../components/Registration'));
const StudentRegistration = lazy(() => import('../components/StudentRegistration'));
const StudentList = lazy(() => import('../components/StudentList'));
const CourseManagement = lazy(() => import('../components/CourseManagement'));
const AdminManagement = lazy(() => import('../components/AdminManagement'));
const SuperAdminResults = lazy(() => import('../components/SuperAdminResults'));
const GradeRanking = lazy(() => import('../components/GradeRanking'));
const ResultsPublishPanel = lazy(() => import('../components/ResultsPublishPanel'));
const SuperAdminDashboard = lazy(() => import('../components/SuperAdminDashboard'));
const ActivityLogPanel = lazy(() => import('../components/ActivityLogPanel'));

interface RoleRoutesProps {
    role: 'student' | 'teacher' | 'superadmin' | 'attendance';
}

export const RoleRoutes: React.FC<RoleRoutesProps> = ({ role }) => {
    switch (role) {
        case 'student':
            return (
                <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="results" element={<StudentResults />} />
                    {/* Redirect unknown student routes to student dashboard */}
                    <Route path="*" element={<Navigate to="/student" replace />} />
                </Routes>
            );

        case 'teacher':
            return (
                <Routes>
                    <Route index element={<TeacherDashboard />} />
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="attendance" element={<AttendanceLogs />} />
                    <Route path="marks" element={<TeacherDashboard />} />
                    {/* Redirect unknown teacher routes to teacher dashboard */}
                    <Route path="*" element={<Navigate to="/teacher" replace />} />
                </Routes>
            );

        case 'superadmin':
            return (
                <Routes>
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="dashboard" element={<SuperAdminDashboard />} />
                    <Route path="users" element={<StudentRegistration />} />
                    <Route path="students" element={<StudentList />} />
                    <Route path="courses" element={<CourseManagement />} />
                    <Route path="admins" element={<AdminManagement />} />
                    <Route path="results" element={<SuperAdminResults />} />
                    <Route path="ranking" element={<GradeRanking />} />
                    <Route path="publish" element={<ResultsPublishPanel />} />
                    <Route path="activity" element={<ActivityLogPanel />} />
                    {/* Redirect unknown admin routes to admin dashboard */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            );

        default:
            return <Navigate to="/unauthorized" replace />;
    }
};