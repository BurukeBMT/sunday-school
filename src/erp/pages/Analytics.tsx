import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, BookOpen, Calendar, Target, BarChart3, PieChart, Activity } from 'lucide-react';
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
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ComposedChart,
    Area,
    Legend
} from 'recharts';

interface AnalyticsData {
    attendanceVsGrades: Array<{
        student: string;
        attendance: number;
        grade: number;
        gradeLevel: string;
    }>;
    performanceTrends: Array<{
        month: string;
        attendance: number;
        averageGrade: number;
        enrollment: number;
    }>;
    gradeDistribution: Array<{
        grade: string;
        count: number;
        percentage: number;
    }>;
    coursePerformance: Array<{
        course: string;
        averageGrade: number;
        attendance: number;
        students: number;
    }>;
    teacherEffectiveness: Array<{
        teacher: string;
        averageGrade: number;
        attendanceRate: number;
        students: number;
    }>;
}

// Mock data - replace with real analytics calculations
const mockAnalyticsData: AnalyticsData = {
    attendanceVsGrades: [
        { student: 'Student 1', attendance: 95, grade: 88, gradeLevel: 'ክፍል 1' },
        { student: 'Student 2', attendance: 92, grade: 82, gradeLevel: 'ክፍል 2' },
        { student: 'Student 3', attendance: 88, grade: 79, gradeLevel: 'ክፍል 3' },
        { student: 'Student 4', attendance: 85, grade: 75, gradeLevel: 'ክፍል 4' },
        { student: 'Student 5', attendance: 78, grade: 72, gradeLevel: 'ክፍል 3' }
    ],
    performanceTrends: [
        { month: 'Sep', attendance: 85, averageGrade: 82, enrollment: 120 },
        { month: 'Oct', attendance: 87, averageGrade: 84, enrollment: 125 },
        { month: 'Nov', attendance: 89, averageGrade: 86, enrollment: 128 },
        { month: 'Dec', attendance: 91, averageGrade: 88, enrollment: 130 },
        { month: 'Jan', attendance: 88, averageGrade: 85, enrollment: 132 },
        { month: 'Feb', attendance: 90, averageGrade: 87, enrollment: 135 }
    ],
    gradeDistribution: [
        { grade: 'A (90-100)', count: 25, percentage: 20.8 },
        { grade: 'B (80-89)', count: 35, percentage: 29.2 },
        { grade: 'C (70-79)', count: 28, percentage: 23.3 },
        { grade: 'D (60-69)', count: 20, percentage: 16.7 },
        { grade: 'F (0-59)', count: 12, percentage: 10.0 }
    ],
    coursePerformance: [
        { course: 'መጽሔት ቅዱስ', averageGrade: 88, attendance: 92, students: 45 },
        { course: 'አማርኛ', averageGrade: 82, attendance: 88, students: 38 },
        { course: 'ሂሳብ', averageGrade: 79, attendance: 85, students: 52 },
        { course: 'እንግሊዝኛ', averageGrade: 85, attendance: 90, students: 28 }
    ],
    teacherEffectiveness: [
        { teacher: 'አቶ ተስፋዬ', averageGrade: 87, attendanceRate: 92, students: 45 },
        { teacher: 'እናት ማሪያም', averageGrade: 84, attendanceRate: 89, students: 38 },
        { teacher: 'አቶ አብረሃም', averageGrade: 82, attendanceRate: 87, students: 52 },
        { teacher: 'እናት ሰላም', averageGrade: 86, attendanceRate: 91, students: 28 }
    ]
};

const correlationData = [
    { attendance: 70, grade: 65 },
    { attendance: 75, grade: 72 },
    { attendance: 80, grade: 78 },
    { attendance: 85, grade: 82 },
    { attendance: 90, grade: 87 },
    { attendance: 95, grade: 92 },
    { attendance: 98, grade: 95 }
];

export const Analytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>('6months');

    useEffect(() => {
        // TODO: Fetch real analytics data from Firebase
        setTimeout(() => {
            setAnalyticsData(mockAnalyticsData);
            setLoading(false);
        }, 1000);
    }, [selectedTimeframe]);

    const stats = {
        totalStudents: 135,
        averageAttendance: 89,
        averageGrade: 85,
        correlationCoefficient: 0.78,
        improvementRate: 12,
        retentionRate: 94
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">
                        Advanced insights and performance correlations
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                />
                <StatCard
                    title="Avg Attendance"
                    value={`${stats.averageAttendance}%`}
                    icon={Calendar}
                    trend={{ value: 3, isPositive: true }}
                />
                <StatCard
                    title="Avg Grade"
                    value={`${stats.averageGrade}%`}
                    icon={BookOpen}
                    trend={{ value: 2, isPositive: true }}
                />
                <StatCard
                    title="Correlation (Att/Grade)"
                    value={stats.correlationCoefficient.toFixed(2)}
                    icon={TrendingUp}
                />
            </div>

            {/* Performance Trends */}
            <ChartCard
                title="Performance Trends Over Time"
                subtitle="Attendance, grades, and enrollment trends"
                icon={Activity}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.performanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" domain={[80, 100]} />
                        <YAxis yAxisId="right" orientation="right" domain={[115, 140]} />
                        <Tooltip />
                        <Legend />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="enrollment"
                            fill="#E5E7EB"
                            stroke="#9CA3AF"
                            name="Enrollment"
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="attendance"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            name="Attendance %"
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="averageGrade"
                            stroke="#10B981"
                            strokeWidth={3}
                            name="Average Grade %"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Correlation Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Attendance vs Grade Correlation"
                    subtitle="Relationship between attendance and academic performance"
                    icon={Target}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart data={correlationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="attendance"
                                name="Attendance %"
                                domain={[60, 100]}
                            />
                            <YAxis
                                type="number"
                                dataKey="grade"
                                name="Grade %"
                                domain={[60, 100]}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                formatter={(value, name) => [`${value}%`, name]}
                            />
                            <Scatter
                                name="Students"
                                dataKey="grade"
                                fill="#3B82F6"
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Grade Distribution"
                    subtitle="Overall grade distribution across all students"
                    icon={BarChart3}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.gradeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                            <Bar dataKey="percentage" fill="#3B82F6" name="Percentage" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Course Performance Analysis */}
            <ChartCard
                title="Course Performance Analysis"
                subtitle="Average grades and attendance by course"
                icon={BookOpen}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.coursePerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="course" />
                        <YAxis yAxisId="left" domain={[75, 95]} />
                        <YAxis yAxisId="right" orientation="right" domain={[80, 95]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="averageGrade"
                            fill="#10B981"
                            name="Average Grade %"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="attendance"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            name="Attendance %"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Teacher Effectiveness */}
            <ChartCard
                title="Teacher Effectiveness Analysis"
                subtitle="Performance metrics by teacher"
                icon={Users}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.teacherEffectiveness}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="teacher" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="averageGrade" fill="#F59E0B" name="Avg Grade %" />
                        <Bar dataKey="attendanceRate" fill="#3B82F6" name="Attendance %" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Detailed Analytics Table */}
            <DataTable
                data={analyticsData.attendanceVsGrades}
                columns={[
                    {
                        key: 'student',
                        header: 'Student',
                        sortable: true
                    },
                    {
                        key: 'gradeLevel',
                        header: 'Grade Level',
                        sortable: true,
                        render: (value: string) => (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {value}
                            </span>
                        )
                    },
                    {
                        key: 'attendance',
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
                        key: 'grade',
                        header: 'Grade %',
                        sortable: true,
                        render: (value: number) => (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value >= 85 ? 'bg-green-100 text-green-800' :
                                value >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {value}%
                            </span>
                        )
                    }
                ]}
                searchable={true}
                searchPlaceholder="Search analytics data..."
                itemsPerPage={10}
            />

            {/* Insights and Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Positive Trends</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Strong correlation between attendance and grades (0.78)</li>
                                <li>• Consistent improvement in average grades over time</li>
                                <li>• High retention rate of 94%</li>
                                <li>• መጽሔት ቅዱስ course shows highest performance</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Performance Highlights</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• 50% of students achieving B grade or higher</li>
                                <li>• አቶ ተስፋዬ shows highest teacher effectiveness</li>
                                <li>• ክፍል 1 has the strongest attendance-grade correlation</li>
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• ሂሳብ course needs attention (lowest average)</li>
                                <li>• Some students with low attendance (&lt;80%) struggling</li>
                                <li>• Grade distribution shows room for more A grades</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">Recommendations</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                                <li>• Focus on improving attendance for at-risk students</li>
                                <li>• Provide additional support for ሂሳብ course</li>
                                <li>• Share best practices from high-performing teachers</li>
                                <li>• Implement early intervention for students below 75%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};