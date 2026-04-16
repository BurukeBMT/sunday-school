import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
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
    Cell
} from 'recharts';

interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    checkOutTime?: string;
    teacher: string;
    notes?: string;
}

interface AttendanceStats {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    excusedToday: number;
    attendanceRate: number;
}

// Mock data - replace with real Firebase data
const mockAttendanceRecords: AttendanceRecord[] = [
    {
        id: 'ATT001',
        studentId: 'STU001',
        studentName: 'አብረሃም ተስፋዬ',
        grade: 'ክፍል 1',
        date: '2024-01-15',
        status: 'present',
        checkInTime: '08:30',
        checkOutTime: '12:00',
        teacher: 'አቶ ተስፋዬ አብረሃም',
        notes: 'On time'
    },
    {
        id: 'ATT002',
        studentId: 'STU002',
        studentName: 'ማሪያም ተስፋዬ',
        grade: 'ክፍል 2',
        date: '2024-01-15',
        status: 'late',
        checkInTime: '09:15',
        checkOutTime: '12:00',
        teacher: 'እናት ማሪያም ተስፋዬ',
        notes: 'Arrived 45 minutes late'
    },
    {
        id: 'ATT003',
        studentId: 'STU003',
        studentName: 'አብረሃም ሰላም',
        grade: 'ክፍል 3',
        date: '2024-01-15',
        status: 'absent',
        teacher: 'አቶ አብረሃም ተስፋዬ',
        notes: 'Family emergency'
    }
];

const weeklyAttendanceData = [
    { day: 'Mon', present: 85, absent: 15, late: 5 },
    { day: 'Tue', present: 88, absent: 12, late: 3 },
    { day: 'Wed', present: 82, absent: 18, late: 7 },
    { day: 'Thu', present: 90, absent: 10, late: 2 },
    { day: 'Fri', present: 87, absent: 13, late: 4 },
    { day: 'Sat', present: 91, absent: 9, late: 1 },
    { day: 'Sun', present: 89, absent: 11, late: 3 }
];

const gradeAttendanceData = [
    { grade: 'ክፍል 1', attendance: 92 },
    { grade: 'ክፍል 2', attendance: 88 },
    { grade: 'ክፍል 3', attendance: 85 },
    { grade: 'ክፍል 4', attendance: 90 }
];

const attendanceStatusData = [
    { name: 'Present', value: 85, color: '#10B981' },
    { name: 'Absent', value: 10, color: '#EF4444' },
    { name: 'Late', value: 4, color: '#F59E0B' },
    { name: 'Excused', value: 1, color: '#6B7280' }
];

export const Attendance: React.FC = () => {
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState<string>('all');

    useEffect(() => {
        // TODO: Fetch real data from Firebase based on selectedDate and selectedGrade
        setTimeout(() => {
            setAttendanceRecords(mockAttendanceRecords);
            setLoading(false);
        }, 1000);
    }, [selectedDate, selectedGrade]);

    const columns = [
        {
            key: 'studentName',
            header: 'Student Name',
            sortable: true
        },
        {
            key: 'grade',
            header: 'Grade',
            sortable: true,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: string) => {
                const statusConfig = {
                    present: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                    absent: { color: 'bg-red-100 text-red-800', icon: XCircle },
                    late: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
                    excused: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
                };
                const config = statusConfig[value as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                );
            }
        },
        {
            key: 'checkInTime',
            header: 'Check-in',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value || '-'}</span>
            )
        },
        {
            key: 'checkOutTime',
            header: 'Check-out',
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value || '-'}</span>
            )
        },
        {
            key: 'teacher',
            header: 'Teacher',
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
            )
        },
        {
            key: 'notes',
            header: 'Notes',
            render: (value: string) => (
                <span className="text-sm text-gray-600 max-w-xs truncate" title={value}>
                    {value || '-'}
                </span>
            )
        }
    ];

    // Calculate stats from current records
    const stats: AttendanceStats = {
        totalStudents: 120, // Mock total
        presentToday: attendanceRecords.filter(r => r.status === 'present').length,
        absentToday: attendanceRecords.filter(r => r.status === 'absent').length,
        lateToday: attendanceRecords.filter(r => r.status === 'late').length,
        excusedToday: attendanceRecords.filter(r => r.status === 'excused').length,
        attendanceRate: Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor student attendance patterns and statistics
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Grades</option>
                            <option value="ክፍል 1">ክፍል 1</option>
                            <option value="ክፍል 2">ክፍል 2</option>
                            <option value="ክፍል 3">ክፍል 3</option>
                            <option value="ክፍል 4">ክፍል 4</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                />
                <StatCard
                    title="Present Today"
                    value={stats.presentToday}
                    icon={CheckCircle}
                    trend={{ value: 5, isPositive: true }}
                />
                <StatCard
                    title="Absent Today"
                    value={stats.absentToday}
                    icon={XCircle}
                    trend={{ value: -2, isPositive: false }}
                />
                <StatCard
                    title="Attendance Rate"
                    value={`${stats.attendanceRate}%`}
                    icon={TrendingUp}
                    trend={{ value: 3, isPositive: true }}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Weekly Attendance Trend"
                    subtitle="Daily attendance breakdown for the current week"
                    icon={Calendar}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="present" stackId="a" fill="#10B981" name="Present" />
                            <Bar dataKey="absent" stackId="a" fill="#EF4444" name="Absent" />
                            <Bar dataKey="late" stackId="a" fill="#F59E0B" name="Late" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Attendance by Grade"
                    subtitle="Average attendance rate per grade"
                    icon={TrendingUp}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradeAttendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis domain={[80, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                            <Line
                                type="monotone"
                                dataKey="attendance"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Attendance Status Distribution */}
            <ChartCard
                title="Today's Attendance Status"
                subtitle="Distribution of attendance statuses for today"
                icon={Users}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={attendanceStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {attendanceStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Status']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                        {attendanceStatusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ChartCard>

            {/* Attendance Records Table */}
            <DataTable
                data={attendanceRecords}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search attendance records by student name or grade..."
                itemsPerPage={15}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <Calendar className="h-5 w-5" />
                        <span>Generate Report</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle className="h-5 w-5" />
                        <span>Export Data</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <AlertTriangle className="h-5 w-5" />
                        <span>View Absences</span>
                    </button>
                </div>
            </div>
        </div>
    );
};