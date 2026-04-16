import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Award, Target, Eye, Download, BarChart3 } from 'lucide-react';
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
    ScatterChart,
    Scatter,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface GradeRecord {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    course: string;
    teacher: string;
    score: number;
    maxScore: number;
    percentage: number;
    gradeLetter: string;
    term: string;
    date: string;
    comments?: string;
}

interface GradingStats {
    totalStudents: number;
    averageGrade: number;
    highestGrade: number;
    lowestGrade: number;
    passRate: number;
    excellentRate: number;
}

// Mock data - replace with real Google Sheets/Firebase data
const mockGradeRecords: GradeRecord[] = [
    {
        id: 'GRD001',
        studentId: 'STU001',
        studentName: 'አብረሃም ተስፋዬ',
        grade: 'ክፍል 1',
        course: 'መጽሔት ቅዱስ',
        teacher: 'አቶ ተስፋዬ አብረሃም',
        score: 87,
        maxScore: 100,
        percentage: 87,
        gradeLetter: 'A',
        term: 'Term 1',
        date: '2024-01-15',
        comments: 'Excellent understanding of biblical concepts'
    },
    {
        id: 'GRD002',
        studentId: 'STU002',
        studentName: 'ማሪያም ተስፋዬ',
        grade: 'ክፍል 2',
        course: 'አማርኛ',
        teacher: 'እናት ማሪያም ተስፋዬ',
        score: 82,
        maxScore: 100,
        percentage: 82,
        gradeLetter: 'B+',
        term: 'Term 1',
        date: '2024-01-15',
        comments: 'Good progress in language skills'
    },
    {
        id: 'GRD003',
        studentId: 'STU003',
        studentName: 'አብረሃም ሰላም',
        grade: 'ክፍል 3',
        course: 'ሂሳብ',
        teacher: 'አቶ አብረሃም ተስፋዬ',
        score: 79,
        maxScore: 100,
        percentage: 79,
        gradeLetter: 'B',
        term: 'Term 1',
        date: '2024-01-15',
        comments: 'Needs improvement in mathematical calculations'
    }
];

const gradeDistributionData = [
    { range: '90-100', count: 25, color: '#10B981' },
    { range: '80-89', count: 35, color: '#3B82F6' },
    { range: '70-79', count: 28, color: '#F59E0B' },
    { range: '60-69', count: 10, color: '#EF4444' },
    { range: '0-59', count: 2, color: '#7F1D1D' }
];

const coursePerformanceData = [
    { course: 'መጽሔት ቅዱስ', average: 88, students: 45 },
    { course: 'አማርኛ', average: 82, students: 38 },
    { course: 'ሂሳብ', average: 79, students: 52 },
    { course: 'እንግሊዝኛ', average: 85, students: 28 }
];

const gradeTrendData = [
    { term: 'Term 1', average: 83 },
    { term: 'Term 2', average: 85 },
    { term: 'Term 3', average: 87 },
    { term: 'Term 4', average: 89 }
];

const performanceByGradeData = [
    { grade: 'ክፍል 1', average: 88, students: 45 },
    { grade: 'ክፍል 2', average: 82, students: 38 },
    { grade: 'ክፍል 3', average: 79, students: 52 },
    { grade: 'ክፍል 4', average: 85, students: 28 }
];

export const Grading: React.FC = () => {
    const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [selectedGrade, setSelectedGrade] = useState<string>('all');

    useEffect(() => {
        // TODO: Fetch real data from Google Sheets/Firebase based on filters
        setTimeout(() => {
            setGradeRecords(mockGradeRecords);
            setLoading(false);
        }, 1000);
    }, [selectedTerm, selectedCourse, selectedGrade]);

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
            key: 'course',
            header: 'Course',
            sortable: true,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {value}
                </span>
            )
        },
        {
            key: 'score',
            header: 'Score',
            sortable: true,
            render: (value: number, record: GradeRecord) => (
                <span className="font-medium text-gray-900">
                    {value}/{record.maxScore}
                </span>
            )
        },
        {
            key: 'percentage',
            header: 'Percentage',
            sortable: true,
            render: (value: number) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value >= 90 ? 'bg-green-100 text-green-800' :
                        value >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            value >= 70 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                    }`}>
                    {value}%
                </span>
            )
        },
        {
            key: 'gradeLetter',
            header: 'Grade',
            sortable: true,
            render: (value: string) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${value === 'A' ? 'bg-green-100 text-green-800' :
                        value === 'B+' || value === 'B' ? 'bg-blue-100 text-blue-800' :
                            value === 'C+' || value === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                    }`}>
                    {value}
                </span>
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
            key: 'comments',
            header: 'Comments',
            render: (value: string) => (
                <span className="text-sm text-gray-600 max-w-xs truncate" title={value}>
                    {value || '-'}
                </span>
            )
        }
    ];

    // Calculate stats from current records
    const stats: GradingStats = {
        totalStudents: 120, // Mock total
        averageGrade: Math.round(gradeRecords.reduce((acc, record) => acc + record.percentage, 0) / gradeRecords.length),
        highestGrade: Math.max(...gradeRecords.map(r => r.percentage)),
        lowestGrade: Math.min(...gradeRecords.map(r => r.percentage)),
        passRate: Math.round((gradeRecords.filter(r => r.percentage >= 60).length / gradeRecords.length) * 100),
        excellentRate: Math.round((gradeRecords.filter(r => r.percentage >= 90).length / gradeRecords.length) * 100)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Grading</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor student performance and academic progress
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                            <option value="Term 4">Term 4</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Courses</option>
                            <option value="መጽሔት ቅዱስ">መጽሔት ቅዱስ</option>
                            <option value="አማርኛ">አማርኛ</option>
                            <option value="ሂሳብ">ሂሳብ</option>
                            <option value="እንግሊዝኛ">እንግሊዝኛ</option>
                        </select>
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
                    icon={BookOpen}
                />
                <StatCard
                    title="Average Grade"
                    value={`${stats.averageGrade}%`}
                    icon={TrendingUp}
                    trend={{ value: 2, isPositive: true }}
                />
                <StatCard
                    title="Pass Rate"
                    value={`${stats.passRate}%`}
                    icon={Award}
                    trend={{ value: 5, isPositive: true }}
                />
                <StatCard
                    title="Excellent Rate"
                    value={`${stats.excellentRate}%`}
                    icon={Target}
                    trend={{ value: 1, isPositive: true }}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Grade Distribution"
                    subtitle="Distribution of grades across all students"
                    icon={BarChart3}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" name="Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Course Performance"
                    subtitle="Average performance by course"
                    icon={BookOpen}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={coursePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="course" />
                            <YAxis domain={[70, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Average Grade']} />
                            <Bar dataKey="average" fill="#10B981" name="Average Grade" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Grade Trends Over Time"
                    subtitle="Average grades across academic terms"
                    icon={TrendingUp}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradeTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="term" />
                            <YAxis domain={[80, 95]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Average Grade']} />
                            <Line
                                type="monotone"
                                dataKey="average"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Performance by Grade Level"
                    subtitle="Average performance across grade levels"
                    icon={Award}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceByGradeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis domain={[75, 95]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Average Grade']} />
                            <Bar dataKey="average" fill="#F59E0B" name="Average Grade" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Grade Records Table */}
            <DataTable
                data={gradeRecords}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search grades by student name, course, or grade..."
                itemsPerPage={15}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-5 w-5" />
                        <span>Export Report</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                        <BarChart3 className="h-5 w-5" />
                        <span>Generate Charts</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                        <Eye className="h-5 w-5" />
                        <span>View Details</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <Award className="h-5 w-5" />
                        <span>Top Performers</span>
                    </button>
                </div>
            </div>
        </div>
    );
};