import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useCourseAttendanceStats } from '../lib/useAttendance';
import { cn } from '../lib/utils';

interface CourseStatsProps {
    selectedDate?: string;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ selectedDate }) => {
    const { courseStats, loading } = useCourseAttendanceStats(selectedDate);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Course Attendance</h3>
                    <p className="text-sm text-gray-600">Attendance breakdown by course</p>
                </div>
                <BarChart3 size={20} className="text-gray-400" />
            </div>

            {courseStats.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Course Data</h4>
                    <p className="text-gray-600">
                        Course attendance statistics will appear here once students start attending classes.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseStats.map((course, index) => (
                        <motion.div
                            key={course.courseId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow",
                                "bg-gradient-to-br from-white to-gray-50"
                            )}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <BookOpen size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{course.courseName}</h4>
                                        <p className="text-xs text-gray-500">{course.presentCount} / {course.totalStudents} present</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {course.attendanceRate}%
                                    </div>
                                    <div className="text-xs text-gray-500">rate</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(course.attendanceRate, 100)}%` }}
                                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                                    className={cn(
                                        "h-2 rounded-full",
                                        course.attendanceRate >= 80 ? "bg-green-500" :
                                            course.attendanceRate >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {course.presentCount} present
                                </span>
                                <span className="flex items-center gap-1">
                                    <TrendingUp size={12} />
                                    {course.attendanceRate >= 80 ? 'Excellent' :
                                        course.attendanceRate >= 60 ? 'Good' : 'Needs Attention'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {courseStats.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Total Courses: {courseStats.length}</span>
                        <span>Average Rate: {Math.round(courseStats.reduce((sum, course) => sum + course.attendanceRate, 0) / courseStats.length)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};