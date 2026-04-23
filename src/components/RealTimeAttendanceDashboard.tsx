import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { AttendanceDashboard } from './AttendanceDashboard';
import { LiveAttendanceTable } from './LiveAttendanceTable';
import { CourseStats } from './CourseStats';

export const RealTimeAttendanceDashboard: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
    };

    const handleRefresh = () => {
        // Force a refresh by updating the date temporarily
        const currentDate = new Date().toISOString().split('T')[0];
        setSelectedDate('');
        setTimeout(() => setSelectedDate(currentDate), 100);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Real-Time Attendance</h1>
                    <p className="text-gray-600 mt-1">
                        Live attendance monitoring with instant updates from QR scans
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date Picker */}
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Status Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-4"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-800">Live Updates Active</span>
                    </div>
                    <div className="text-sm text-green-700">
                        Attendance data updates automatically as students scan QR codes
                    </div>
                </div>
            </motion.div>

            {/* Attendance Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <AttendanceDashboard />
            </motion.div>

            {/* Live Attendance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <LiveAttendanceTable limit={100} showFilters={true} />
            </motion.div>

            {/* Course Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <CourseStats selectedDate={selectedDate} />
            </motion.div>

            {/* Footer Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-2xl p-6 text-center"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-blue-600 font-bold">1</span>
                        </div>
                        <p>Student scans QR code on mobile device</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-green-600 font-bold">2</span>
                        </div>
                        <p>Google Apps Script validates and sends to Firebase</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <p>React dashboard updates instantly with new data</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};