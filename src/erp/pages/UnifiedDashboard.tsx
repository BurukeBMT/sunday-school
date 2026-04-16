import React, { useState, useEffect } from 'react';
import {
    Users,
    GraduationCap,
    UserPlus,
    UserCheck,
    BookOpen,
    TrendingUp,
    Activity,
    Calendar
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { useAuth } from '../../contexts/AuthContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts';

// Mock data - replace with real Firebase data
const attendanceData = [
    { date: 'Mon', attendance: 85 },
    { date: 'Tue', attendance: 92 },
    { date: 'Wed', attendance: 78 },
    { date: 'Thu', attendance: 95 },
    { date: 'Fri', attendance: 88 },
    { date: 'Sat', attendance: 82 },
    { date: 'Sun', attendance: 90 }
];

const gradeData = [
    { grade: 'ክፍል 1', count: 45, average: 85 },
    { grade: 'ክፍል 2', count: 52, average: 82 },
    { grade: 'ክፍል 3', count: 38, average: 88 },
    { grade: 'ክፍል 4', count: 41, average: 79 },
    { grade: 'ክፍል 5', count: 35, average: 91 },
    { grade: 'ክፍል 6', count: 29, average: 86 }
];

const courseData = [
    { name: 'መጽሔት ቅዱስ', value: 35, color: '#3B82F6' },
    { name: 'አማርኛ', value: 25, color: '#10B981' },
    { name: 'እንግሊዝኛ', value: 20, color: '#F59E0B' },
    { name: 'ሂሳብ', value: 15, color: '#EF4444' },
    { name: 'ሳይንስ', value: 5, color: '#8B5CF6' }
];

const activityData = [
    { time: '09:00', actions: 12 },
    { time: '10:00', actions: 25 },
    { time: '11:00', actions: 18 },
    { time: '12:00', actions: 32 },
    { time: '13:00', actions: 15 },
    { time: '14:00', actions: 28 },
    { time: '15:00', actions: 22 },
    { time: '16:00', actions: 35 }
];

export const UnifiedDashboard: React.FC = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        todayAttendance: 0,
        averageGrade: 0,
        activeClasses: 0,
        pendingActions: 0
    });

    useEffect(() => {
        // TODO: Fetch real data from Firebase
        // For now, using mock data
        setStats({
            totalStudents: 1247,
            totalTeachers: 23,
            totalParents: 892,
            todayAttendance: 89,
            averageGrade: 84.5,
            activeClasses: 18,
            pendingActions: 7
        });
    }, []);

    const isSuperAdmin = profile?.role === 'superadmin';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back! Here's what's happening at ፍሬ ሃይማኖት ሰ/ት/ቤት today.
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents.toLocaleString()}
                    icon={Users}
                    trend={{ value: 5.2, isPositive: true }}
                />
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={GraduationCap}
                    trend={{ value: 2.1, isPositive: true }}
                />
                <StatCard
                    title="Total Parents"
                    value={stats.totalParents.toLocaleString()}
                    icon={UserPlus}
                    trend={{ value: 8.3, isPositive: true }}
                />
                <StatCard
                    title="Today's Attendance"
                    value={`${stats.todayAttendance}%`}
                    icon={UserCheck}
                    trend={{ value: 3.1, isPositive: true }}
                />
                <StatCard
                    title="Average Grade"
                    value={`${stats.averageGrade}%`}
                    icon={BookOpen}
                    trend={{ value: 1.8, isPositive: true }}
                />
                <StatCard
                    title="Active Classes"
                    value={stats.activeClasses}
                    icon={Calendar}
                />
                <StatCard
                    title="Pending Actions"
                    value={stats.pendingActions}
                    icon={Activity}
                />
                <StatCard
                    title="Performance"
                    value="Excellent"
                    icon={TrendingUp}
                    trend={{ value: 12.5, isPositive: true }}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <ChartCard
                    title="Weekly Attendance Trend"
                    subtitle="Daily attendance percentage over the past week"
                    icon={TrendingUp}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                formatter={(value) => [`${value}%`, 'Attendance']}
                                labelFormatter={(label) => `Day: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="attendance"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Grade Distribution */}
                <ChartCard
                    title="Grade-wise Performance"
                    subtitle="Average grades by grade level"
                    icon={BookOpen}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                                formatter={(value) => [`${value}%`, 'Average Grade']}
                                labelFormatter={(label) => `Grade: ${label}`}
                            />
                            <Bar dataKey="average" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Course Performance */}
                <ChartCard
                    title="Course Distribution"
                    subtitle="Student enrollment by course"
                    icon={BookOpen}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={courseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {courseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Enrollment']} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Activity Timeline */}
                <ChartCard
                    title="Daily Activity"
                    subtitle="System activity throughout the day"
                    icon={Activity}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value} actions`, 'Activity']}
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="actions"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Quick Actions - Super Admin Only */}
            {isSuperAdmin && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center space-x-3">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Add New Student</h4>
                                    <p className="text-sm text-gray-600">Register a new student account</p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center space-x-3">
                                <GraduationCap className="h-8 w-8 text-green-600" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Add New Teacher</h4>
                                    <p className="text-sm text-gray-600">Create teacher account</p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-8 w-8 text-purple-600" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Create Course</h4>
                                    <p className="text-sm text-gray-600">Add new course to curriculum</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};