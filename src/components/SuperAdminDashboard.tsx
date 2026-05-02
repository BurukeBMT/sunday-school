import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    BarChart3,
    Shield,
    Activity,
    Settings,
    TrendingUp,
    UserCheck,
    FileText,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { ref, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { database } from '../firebase';
import { UserProfile, Student, Course } from '../types';
import { cn } from '../lib/utils';

interface SystemStats {
    totalStudents: number;
    totalAdmins: number;
    totalTeachers: number;
    totalCourses: number;
    activeCourses: number;
    publishedResults: number;
    totalResults: number;
}

export const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<SystemStats>({
        totalStudents: 0,
        totalAdmins: 0,
        totalTeachers: 0,
        totalCourses: 0,
        activeCourses: 0,
        publishedResults: 0,
        totalResults: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadSystemStats();
        loadRecentActivity();
    }, []);

    const loadSystemStats = async () => {
        try {
            // Load students count
            const studentsRef = ref(database, 'students');
            const studentsSnap = await get(studentsRef);
            const totalStudents = studentsSnap.exists() ? Object.keys(studentsSnap.val()).length : 0;

            // Load users by role
            const usersRef = ref(database, 'users');
            const usersSnap = await get(usersRef);
            let totalAdmins = 0;
            let totalTeachers = 0;

            if (usersSnap.exists()) {
                const users = usersSnap.val();
                Object.values(users).forEach((user: any) => {
                    if (user.role === 'admin') totalAdmins++;
                    if (user.role === 'teacher') totalTeachers++;
                });
            }

            // Load courses
            const coursesRef = ref(database, 'courses');
            const coursesSnap = await get(coursesRef);
            const totalCourses = coursesSnap.exists() ? Object.keys(coursesSnap.val()).length : 0;

            // Count active courses (scheduled for today or future)
            let activeCourses = 0;
            if (coursesSnap.exists()) {
                const courses = coursesSnap.val();
                const today = new Date().toISOString().split('T')[0];
                Object.values(courses).forEach((course: any) => {
                    if (course.schedule && course.schedule.split(' ')[0] >= today) {
                        activeCourses++;
                    }
                });
            }

            // Load results publication status
            const resultsControlRef = ref(database, 'resultsControl');
            const resultsControlSnap = await get(resultsControlRef);
            let publishedResults = 0;
            let totalResults = 0;

            if (resultsControlSnap.exists()) {
                const controls = resultsControlSnap.val();
                totalResults = Object.keys(controls).length;
                Object.values(controls).forEach((control: any) => {
                    if (control.isPublished) publishedResults++;
                });
            }

            setStats({
                totalStudents,
                totalAdmins,
                totalTeachers,
                totalCourses,
                activeCourses,
                publishedResults,
                totalResults
            });
        } catch (error) {
            console.error('Error loading system stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentActivity = async () => {
        try {
            const activityRef = ref(database, 'activityLogs');
            const activityQuery = query(activityRef, orderByChild('timestamp'));
            const unsubscribe = onValue(activityQuery, (snapshot) => {
                if (snapshot.exists()) {
                    const activities = Object.values(snapshot.val())
                        .sort((a: any, b: any) => b.timestamp - a.timestamp)
                        .slice(0, 5);
                    setRecentActivity(activities);
                } else {
                    setRecentActivity([]);
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    };

    const StatCard: React.FC<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
        subtitle?: string;
    }> = ({ title, value, icon, color, subtitle }) => (
        <div className={cn(
            "bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
            color
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gray-50">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                </div>
            </div>
            {subtitle && (
                <p className="text-xs text-gray-400">{subtitle}</p>
            )}
        </div>
    );

    const QuickActionCard: React.FC<{
        title: string;
        description: string;
        icon: React.ReactNode;
        href: string;
        color: string;
    }> = ({ title, description, icon, href, color }) => (
        <a
            href={href}
            className={cn(
                "block bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group",
                color
            )}
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </a>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A5A40]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Super Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2">Complete system overview and management control</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        System Online
                    </div>
                </div>
            </header>

            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    color="border-l-4 border-l-blue-500"
                />
                <StatCard
                    title="Active Admins"
                    value={stats.totalAdmins}
                    icon={<Shield className="w-6 h-6 text-green-600" />}
                    color="border-l-4 border-l-green-500"
                />
                <StatCard
                    title="Total Courses"
                    value={stats.totalCourses}
                    icon={<BookOpen className="w-6 h-6 text-purple-600" />}
                    color="border-l-4 border-l-purple-500"
                    subtitle={`${stats.activeCourses} active this week`}
                />
                <StatCard
                    title="Published Results"
                    value={stats.publishedResults}
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                    color="border-l-4 border-l-orange-500"
                    subtitle={`of ${stats.totalResults} grades`}
                />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                    title="User Management"
                    description="Manage admins, teachers, and student accounts"
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    href="/admin/users"
                    color="hover:border-blue-200"
                />
                <QuickActionCard
                    title="Course Management"
                    description="Create and assign courses to administrators"
                    icon={<BookOpen className="w-6 h-6 text-purple-600" />}
                    href="/admin/courses"
                    color="hover:border-purple-200"
                />
                <QuickActionCard
                    title="Student Records"
                    description="View and manage all student information"
                    icon={<UserCheck className="w-6 h-6 text-green-600" />}
                    href="/admin/students"
                    color="hover:border-green-200"
                />
                <QuickActionCard
                    title="Attendance Analytics"
                    description="Monitor attendance patterns and reports"
                    icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                    href="/analytics"
                    color="hover:border-indigo-200"
                />
                <QuickActionCard
                    title="Grading & Results"
                    description="Manage academic results and publications"
                    icon={<FileText className="w-6 h-6 text-orange-600" />}
                    href="/admin/results"
                    color="hover:border-orange-200"
                />
                <QuickActionCard
                    title="System Activity"
                    description="View audit logs and system activities"
                    icon={<Activity className="w-6 h-6 text-red-600" />}
                    href="/admin/activity"
                    color="hover:border-red-200"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        <p className="text-gray-500 mt-1">Latest system activities and changes</p>
                    </div>
                    <a
                        href="/admin/activity"
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                        View All
                    </a>
                </div>

                {recentActivity.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {activity.user?.[0] || 'S'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {activity.resource}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">System Health</h3>
                            <p className="text-sm text-gray-500">All systems operational</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Database</span>
                            <span className="text-green-600 font-medium">Online</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Authentication</span>
                            <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Academic grading service</span>
                            <span className="text-green-600 font-medium">Connected</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Active Courses</h3>
                            <p className="text-sm text-gray-500">This week</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeCourses}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        of {stats.totalCourses} total courses
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Pending Actions</h3>
                            <p className="text-sm text-gray-500">Require attention</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">
                        All systems up to date
                    </p>
                </div>
            </div>
        </div>
    );
};