import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, TrendingUp, Eye, Edit, UserPlus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { useAuth } from '../../contexts/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface Teacher {
    id: string;
    uid: string;
    fullName: string;
    email: string;
    phone: string;
    assignedGrades: string[];
    assignedCourses: string[];
    studentsCount: number;
    averageStudentGrade: number;
    attendanceRate: number;
    createdAt: string;
}

// Mock data - replace with real Firebase data
const mockTeachers: Teacher[] = [
    {
        id: 'TCH001',
        uid: 'teacher1',
        fullName: 'አቶ ተስፋዬ አብረሃም',
        email: 'teacher1@school.local',
        phone: '+251911111111',
        assignedGrades: ['ክፍል 1', 'ክፍል 2'],
        assignedCourses: ['መጽሔት ቅዱስ', 'አማርኛ'],
        studentsCount: 45,
        averageStudentGrade: 87.5,
        attendanceRate: 95,
        createdAt: '2024-01-01'
    },
    {
        id: 'TCH002',
        uid: 'teacher2',
        fullName: 'እናት ማሪያም ተስፋዬ',
        email: 'teacher2@school.local',
        phone: '+251922222222',
        assignedGrades: ['ክፍል 3', 'ክፍል 4'],
        assignedCourses: ['እንግሊዝኛ', 'ሂሳብ'],
        studentsCount: 38,
        averageStudentGrade: 82.3,
        attendanceRate: 92,
        createdAt: '2024-01-02'
    }
];

const courseLoadData = [
    { teacher: 'አቶ ተስፋዬ', courses: 4, students: 45 },
    { teacher: 'እናት ማሪያም', courses: 3, students: 38 },
    { teacher: 'አቶ አብረሃም', courses: 5, students: 52 },
    { teacher: 'እናት ሰላም', courses: 2, students: 28 }
];

const performanceData = [
    { name: 'Excellent', value: 35, color: '#10B981' },
    { name: 'Good', value: 45, color: '#3B82F6' },
    { name: 'Average', value: 15, color: '#F59E0B' },
    { name: 'Needs Improvement', value: 5, color: '#EF4444' }
];

export const Teachers: React.FC = () => {
    const { profile } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);

    useEffect(() => {
        // TODO: Fetch real data from Firebase
        setTimeout(() => {
            setTeachers(mockTeachers);
            setLoading(false);
        }, 1000);
    }, []);

    const columns = [
        {
            key: 'id',
            header: 'Teacher ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm font-medium text-green-600">{value}</span>
            )
        },
        {
            key: 'fullName',
            header: 'Full Name',
            sortable: true
        },
        {
            key: 'assignedGrades',
            header: 'Assigned Grades',
            render: (value: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {value.map((grade, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                            {grade}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'studentsCount',
            header: 'Students',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium text-gray-900">{value}</span>
            )
        },
        {
            key: 'averageStudentGrade',
            header: 'Avg Student Grade',
            sortable: true,
            render: (value: number) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value >= 85 ? 'bg-green-100 text-green-800' :
                        value >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {value}%
                </span>
            )
        },
        {
            key: 'attendanceRate',
            header: 'Attendance Rate',
            sortable: true,
            render: (value: number) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value >= 90 ? 'bg-green-100 text-green-800' :
                        value >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {value}%
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, teacher: Teacher) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeacher(teacher);
                            setShowProfileDrawer(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    const stats = {
        totalTeachers: teachers.length,
        totalStudents: teachers.reduce((acc, teacher) => acc + teacher.studentsCount, 0),
        averageGrade: teachers.reduce((acc, teacher) => acc + teacher.averageStudentGrade, 0) / teachers.length,
        averageAttendance: teachers.reduce((acc, teacher) => acc + teacher.attendanceRate, 0) / teachers.length
    };

    const isSuperAdmin = profile?.role === 'superadmin';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
                    <p className="text-gray-600 mt-1">
                        Manage teacher assignments, performance, and course loads
                    </p>
                </div>
                {isSuperAdmin && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Teacher</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={GraduationCap}
                />
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                />
                <StatCard
                    title="Avg Student Grade"
                    value={`${stats.averageGrade.toFixed(1)}%`}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Avg Attendance"
                    value={`${stats.averageAttendance.toFixed(1)}%`}
                    icon={BookOpen}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Course Load Distribution"
                    subtitle="Teachers by number of courses and students"
                    icon={BookOpen}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={courseLoadData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="teacher" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="courses" fill="#3B82F6" name="Courses" />
                            <Bar dataKey="students" fill="#10B981" name="Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Teacher Performance"
                    subtitle="Distribution of teacher performance ratings"
                    icon={TrendingUp}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={performanceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Teachers Table */}
            <DataTable
                data={teachers}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search teachers by name, ID, or grade..."
                itemsPerPage={10}
                onRowClick={(teacher) => {
                    setSelectedTeacher(teacher);
                    setShowProfileDrawer(true);
                }}
            />

            {/* Teacher Profile Drawer */}
            {showProfileDrawer && selectedTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Teacher Profile</h2>
                                <button
                                    onClick={() => setShowProfileDrawer(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                                    <div className="space-y-2">
                                        <p><strong>Name:</strong> {selectedTeacher.fullName}</p>
                                        <p><strong>Teacher ID:</strong> {selectedTeacher.id}</p>
                                        <p><strong>Email:</strong> {selectedTeacher.email}</p>
                                        <p><strong>Phone:</strong> {selectedTeacher.phone}</p>
                                    </div>
                                </div>

                                {/* Assignments */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignments</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Grades:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTeacher.assignedGrades.map((grade, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {grade}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Courses:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTeacher.assignedCourses.map((course, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                    >
                                                        {course}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600 font-medium">Students</p>
                                            <p className="text-2xl font-bold text-blue-900">{selectedTeacher.studentsCount}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-600 font-medium">Avg Grade</p>
                                            <p className="text-2xl font-bold text-green-900">{selectedTeacher.averageStudentGrade}%</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-purple-600 font-medium">Attendance</p>
                                            <p className="text-2xl font-bold text-purple-900">{selectedTeacher.attendanceRate}%</p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <p className="text-sm text-orange-600 font-medium">Courses</p>
                                            <p className="text-2xl font-bold text-orange-900">{selectedTeacher.assignedCourses.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        View Full Profile
                                    </button>
                                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                        Edit Assignments
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};