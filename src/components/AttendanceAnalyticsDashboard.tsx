import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    UserCheck,
    UserX,
    TrendingUp,
    BarChart3,
    BookOpen,
    GraduationCap,
    UserCog,
    RefreshCw,
    Clock
} from 'lucide-react';
import {
    getRealtimeAttendanceAnalytics,
    AttendanceAnalytics,
    getAttendanceAnalyticsForDate
} from '../lib/attendanceAnalytics';
import { AttendanceStatsCard } from './AttendanceStatsCard';
import { GradeAttendanceChart } from './GradeAttendanceChart';
import { CourseAttendanceTable } from './CourseAttendanceTable';

export const AttendanceAnalyticsDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Real-time analytics subscription
    useEffect(() => {
        setLoading(true);
        const unsubscribe = getRealtimeAttendanceAnalytics((data) => {
            setAnalytics(data);
            setLoading(false);
            setError(null);
        });

        return unsubscribe;
    }, []);

    // Handle date selection for historical data
    const handleDateChange = async (date: string) => {
        if (!date) {
            // Reset to real-time data
            setSelectedDate('');
            return;
        }

        setSelectedDate(date);
        setLoading(true);
        try {
            const historicalData = await getAttendanceAnalyticsForDate(date);
            setAnalytics(historicalData);
            setError(null);
        } catch (err) {
            setError('Failed to load historical data');
            console.error('Error loading historical analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate trends (mock data for demonstration - in real app, compare with yesterday)
    const trends = useMemo(() => {
        if (!analytics) return null;

        // Mock trend calculation - in production, compare with previous day
        return {
            present: { value: 5.2, isPositive: true },
            percentage: { value: 2.1, isPositive: true },
            courses: { value: -1.8, isPositive: false }
        };
    }, [analytics]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <BarChart3 className="h-12 w-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Attendance Analytics</h1>
                            <p className="text-gray-600 mt-1">
                                Real-time attendance insights and statistics
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Date Selector */}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
                                    View Date:
                                </label>
                                <input
                                    id="date-select"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {selectedDate && (
                                    <button
                                        onClick={() => handleDateChange('')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Live
                                    </button>
                                )}
                            </div>

                            {/* Last Updated */}
                            {analytics && (
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Updated {analytics.lastUpdated.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && !analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : analytics ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <AttendanceStatsCard
                                title="Total Students"
                                value={analytics.overall.totalStudents}
                                subtitle="Enrolled students"
                                icon={Users}
                                color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                            />

                            <AttendanceStatsCard
                                title="Present Today"
                                value={analytics.overall.presentToday}
                                subtitle={`${analytics.overall.attendancePercentage}% attendance rate`}
                                icon={UserCheck}
                                color="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                                trend={trends?.present}
                            />

                            <AttendanceStatsCard
                                title="Absent Today"
                                value={analytics.overall.absentToday}
                                subtitle="Students not present"
                                icon={UserX}
                                color="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                            />

                            <AttendanceStatsCard
                                title="Average Rate"
                                value={`${analytics.overall.attendancePercentage}%`}
                                subtitle="Overall attendance"
                                icon={TrendingUp}
                                color="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                                trend={trends?.percentage}
                            />
                        </div>

                        {/* Charts and Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Grade Attendance Chart */}
                            <GradeAttendanceChart
                                grades={analytics.grades}
                                loading={loading}
                            />

                            {/* Course Attendance Table */}
                            <CourseAttendanceTable
                                courses={analytics.courses}
                                loading={loading}
                            />
                        </div>

                        {/* Teacher Stats */}
                        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Teacher Activity</h3>
                                <div className="text-sm text-gray-500">
                                    {analytics.teachers.length} active teachers
                                </div>
                            </div>

                            {analytics.teachers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analytics.teachers.slice(0, 6).map((teacher) => (
                                        <div key={teacher.teacherId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{teacher.teacherName}</p>
                                                <p className="text-sm text-gray-500">Last active: {teacher.lastActivity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{teacher.attendanceTaken}</p>
                                                <p className="text-xs text-gray-500">records</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No teacher activity data available</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};