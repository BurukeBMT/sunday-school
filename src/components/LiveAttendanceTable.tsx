import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, BookOpen, Calendar, Search, Filter } from 'lucide-react';
import { useLiveAttendanceTable } from '../lib/useAttendance';
import { cn } from '../lib/utils';

interface LiveAttendanceTableProps {
    limit?: number;
    showFilters?: boolean;
}

export const LiveAttendanceTable: React.FC<LiveAttendanceTableProps> = ({
    limit = 50,
    showFilters = true
}) => {
    const { liveEntries, loading, error, isAuthenticated } = useLiveAttendanceTable(limit);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    // Get unique courses for filter
    const courses = [...new Set(liveEntries.map(entry => entry.course))];

    // Filter entries
    const filteredEntries = liveEntries.filter(entry => {
        const matchesSearch = !searchTerm ||
            entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.studentId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = !selectedCourse || entry.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });

    if (!isAuthenticated) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-gray-600">Please log in to view live attendance data.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
                <User size={48} className="mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Live Attendance</h3>
                        <p className="text-sm text-gray-600">Real-time attendance records</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live</span>
                    </div>
                </div>

                {showFilters && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                            >
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                {filteredEntries.length === 0 ? (
                    <div className="p-12 text-center">
                        <User size={48} className="mx-auto mb-4 text-gray-300" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {liveEntries.length === 0 ? 'No Attendance Yet' : 'No Results Found'}
                        </h4>
                        <p className="text-gray-600">
                            {liveEntries.length === 0
                                ? 'Attendance records will appear here as students scan their QR codes.'
                                : 'Try adjusting your search or filter criteria.'
                            }
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredEntries.map((entry, index) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User size={16} className="text-blue-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {entry.studentName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {entry.studentId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <BookOpen size={16} className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{entry.course}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Clock size={16} className="text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{entry.time}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                                                Present
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>

            {filteredEntries.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Showing {filteredEntries.length} of {liveEntries.length} records</span>
                        <span>Last scan: {filteredEntries[0]?.time || 'N/A'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};