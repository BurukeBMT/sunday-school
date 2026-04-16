import React from 'react';
import { GradeAttendance } from '../lib/attendanceAnalytics';

interface GradeAttendanceChartProps {
    grades: GradeAttendance[];
    loading?: boolean;
}

export const GradeAttendanceChart: React.FC<GradeAttendanceChartProps> = ({
    grades,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (grades.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade-wise Attendance</h3>
                <div className="text-center py-8 text-gray-500">
                    <p>No attendance data available</p>
                </div>
            </div>
        );
    }

    const maxRate = Math.max(...grades.map(g => g.attendanceRate));

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Grade-wise Attendance</h3>

            <div className="space-y-4">
                {grades.map((grade) => (
                    <div key={grade.grade} className="flex items-center space-x-4">
                        <div className="w-16 text-sm font-medium text-gray-600">
                            {grade.grade}
                        </div>

                        <div className="flex-1">
                            <div className="relative">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${maxRate > 0 ? (grade.attendanceRate / maxRate) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-sm font-semibold text-gray-900">
                                {grade.attendanceRate}%
                            </span>
                            <span className="text-xs text-gray-500">
                                ({grade.presentToday}/{grade.totalStudents})
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>0%</span>
                    <span>Attendance Rate</span>
                    <span>{maxRate.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};