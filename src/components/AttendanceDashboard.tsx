import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, TrendingUp, Clock } from 'lucide-react';
import { useAttendanceStats } from '../lib/useAttendance';
import { cn } from '../lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
            "bg-white p-6 rounded-2xl shadow-sm border border-gray-100",
            "hover:shadow-md transition-shadow duration-200"
        )}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
            <div className={cn(
                "p-3 rounded-xl",
                color === 'blue' && "bg-blue-50 text-blue-600",
                color === 'green' && "bg-green-50 text-green-600",
                color === 'red' && "bg-red-50 text-red-600",
                color === 'purple' && "bg-purple-50 text-purple-600"
            )}>
                {icon}
            </div>
        </div>
    </motion.div>
);

export const AttendanceDashboard: React.FC = () => {
    const { stats, loading } = useAttendanceStats();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h2>
                    <p className="text-gray-600">Real-time attendance overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users size={24} />}
                    color="blue"
                    subtitle="Enrolled students"
                />

                <StatCard
                    title="Present Today"
                    value={stats.presentToday}
                    icon={<UserCheck size={24} />}
                    color="green"
                    subtitle={`${stats.attendanceRate}% attendance rate`}
                />

                <StatCard
                    title="Absent Today"
                    value={stats.absentToday}
                    icon={<UserX size={24} />}
                    color="red"
                    subtitle="Students not present"
                />

                <StatCard
                    title="Attendance Rate"
                    value={`${stats.attendanceRate}%`}
                    icon={<TrendingUp size={24} />}
                    color="purple"
                    subtitle="Today's performance"
                />
            </div>

            {stats.totalStudents === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
                >
                    <Users size={48} className="mx-auto mb-4 text-amber-600 opacity-50" />
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">No Students Found</h3>
                    <p className="text-amber-700">
                        Add students to the system to start tracking attendance.
                    </p>
                </motion.div>
            )}
        </div>
    );
};