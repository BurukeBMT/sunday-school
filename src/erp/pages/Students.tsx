import React, { useState, useEffect } from 'react';
import { Users, Eye, Edit, UserPlus, Filter, Download } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { Student } from '../../types';

interface StudentWithStats extends Student {
    attendanceRate?: number;
    averageGrade?: number;
    parentName?: string;
}

// Mock data - replace with real Firebase data
const mockStudents: StudentWithStats[] = [
    {
        id: 'FHST0001',
        uid: 'user1',
        fullName: 'አብረሃም ተስፋዬ',
        phone: '+251911111111',
        email: 'student1@school.local',
        department: 'ክፍል 1',
        grade: 'ክፍል 1',
        qrToken: 'token1',
        createdAt: '2024-01-01',
        parentId: 'PAR0001',
        username: 'FHST0001',
        passwordTemp: 'temp123',
        attendanceRate: 95,
        averageGrade: 88,
        parentName: 'አበበ ተስፋዬ'
    },
    {
        id: 'FHST0002',
        uid: 'user2',
        fullName: 'ሰላም አብረሃም',
        phone: '+251922222222',
        email: 'student2@school.local',
        department: 'ክፍል 2',
        grade: 'ክፍል 2',
        qrToken: 'token2',
        createdAt: '2024-01-02',
        parentId: 'PAR0002',
        username: 'FHST0002',
        passwordTemp: 'temp123',
        attendanceRate: 87,
        averageGrade: 92,
        parentName: 'መለስ አብረሃም'
    },
    // Add more mock students...
];

export const Students: React.FC = () => {
    const { profile } = useAuth();
    const [students, setStudents] = useState<StudentWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [filters, setFilters] = useState({
        grade: '',
        performance: ''
    });

    useEffect(() => {
        // TODO: Fetch real data from Firebase
        setTimeout(() => {
            setStudents(mockStudents);
            setLoading(false);
        }, 1000);
    }, []);

    const columns = [
        {
            key: 'id',
            header: 'Student ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm font-medium text-blue-600">{value}</span>
            )
        },
        {
            key: 'fullName',
            header: 'Full Name',
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
            key: 'attendanceRate',
            header: 'Attendance %',
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
            key: 'averageGrade',
            header: 'Avg Grade',
            sortable: true,
            render: (value: number) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value >= 85 ? 'bg-green-100 text-green-800' :
                    value >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {value}%
                </span>
            )
        },
        {
            key: 'parentName',
            header: 'Parent',
            sortable: true
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, student: StudentWithStats) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
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
        totalStudents: students.length,
        activeStudents: students.filter(s => s.attendanceRate && s.attendanceRate > 0).length,
        highPerformers: students.filter(s => s.averageGrade && s.averageGrade >= 85).length,
        lowAttendance: students.filter(s => s.attendanceRate && s.attendanceRate < 80).length
    };

    const isSuperAdmin = profile?.role === 'superadmin';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-600 mt-1">
                        Manage student records, attendance, and performance
                    </p>
                </div>
                {isSuperAdmin && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Student</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                />
                <StatCard
                    title="Active Students"
                    value={stats.activeStudents}
                    icon={Users}
                />
                <StatCard
                    title="High Performers (≥85%)"
                    value={stats.highPerformers}
                    icon={Users}
                />
                <StatCard
                    title="Low Attendance (<80%)"
                    value={stats.lowAttendance}
                    icon={Users}
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Clear All
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={filters.grade}
                        onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Grades</option>
                        <option value="ክፍል 1">ክፍል 1</option>
                        <option value="ክፍል 2">ክፍል 2</option>
                        <option value="ክፍል 3">ክፍል 3</option>
                        <option value="ክፍል 4">ክፍል 4</option>
                        <option value="ክፍል 5">ክፍል 5</option>
                        <option value="ክፍል 6">ክፍል 6</option>
                    </select>

                    <select
                        value={filters.performance}
                        onChange={(e) => setFilters(prev => ({ ...prev, performance: e.target.value }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Performance Levels</option>
                        <option value="excellent">Excellent (≥90%)</option>
                        <option value="good">Good (80-89%)</option>
                        <option value="average">Average (70-79%)</option>
                        <option value="needs-improvement">Needs Improvement (&lt;70%)</option>
                    </select>

                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <DataTable
                data={students}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search students by name, ID, or parent..."
                itemsPerPage={15}
                onRowClick={(student) => {
                    setSelectedStudent(student);
                    setShowProfileDrawer(true);
                }}
            />

            {/* Student Profile Drawer */}
            {showProfileDrawer && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
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
                                        <p><strong>Name:</strong> {selectedStudent.fullName}</p>
                                        <p><strong>Student ID:</strong> {selectedStudent.id}</p>
                                        <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                                        <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                                    </div>
                                </div>

                                {/* Performance */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600 font-medium">Attendance Rate</p>
                                            <p className="text-2xl font-bold text-blue-900">{selectedStudent.attendanceRate}%</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-600 font-medium">Average Grade</p>
                                            <p className="text-2xl font-bold text-green-900">{selectedStudent.averageGrade}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Parent Information</h3>
                                    <div className="space-y-2">
                                        <p><strong>Parent Name:</strong> {selectedStudent.parentName}</p>
                                        <p><strong>Parent ID:</strong> {selectedStudent.parentId}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        View Full Profile
                                    </button>
                                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                        Edit Student
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