import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CourseAttendance } from '../lib/attendanceAnalytics';

interface CourseAttendanceTableProps {
    courses: CourseAttendance[];
    loading?: boolean;
}

export const CourseAttendanceTable: React.FC<CourseAttendanceTableProps> = ({
    courses,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex space-x-4">
                                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h3>
                <div className="text-center py-8 text-gray-500">
                    <p>No course data available</p>
                </div>
            </div>
        );
    }

    const getAttendanceColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 bg-green-50';
        if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getTrendIcon = (rate: number) => {
        if (rate >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (rate >= 60) return <Minus className="h-4 w-4 text-yellow-600" />;
        return <TrendingDown className="h-4 w-4 text-red-600" />;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Course-wise Attendance</h3>
                <div className="text-sm text-gray-500">
                    {courses.length} courses
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Students</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Present</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Rate</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, index) => (
                            <tr
                                key={course.courseId}
                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50/50' :
                                        index === courses.length - 1 ? 'bg-red-50/50' : ''
                                    }`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-3">
                                        {index === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Highest</span>}
                                        {index === courses.length - 1 && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Lowest</span>}
                                        <div>
                                            <p className="font-medium text-gray-900">{course.courseName}</p>
                                            <p className="text-sm text-gray-500">{course.courseId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="font-medium text-gray-900">{course.totalStudents}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="font-medium text-gray-900">{course.presentToday}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="font-medium text-gray-900">{course.attendanceRate}%</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(course.attendanceRate)}`}>
                                        {getTrendIcon(course.attendanceRate)}
                                        <span>
                                            {course.attendanceRate >= 80 ? 'Excellent' :
                                                course.attendanceRate >= 60 ? 'Good' : 'Needs Attention'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-600">Average Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {(courses.reduce((sum, course) => sum + course.attendanceRate, 0) / courses.length).toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Highest</p>
                        <p className="text-lg font-semibold text-green-600">
                            {Math.max(...courses.map(c => c.attendanceRate)).toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Lowest</p>
                        <p className="text-lg font-semibold text-red-600">
                            {Math.min(...courses.map(c => c.attendanceRate)).toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {courses.reduce((sum, course) => sum + course.totalStudents, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};