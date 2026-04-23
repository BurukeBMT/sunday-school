import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from '../firebase';
import {
    AppsScriptAttendanceLog,
    AttendanceStats,
    CourseAttendanceStats,
    LiveAttendanceEntry,
    Course
} from '../types';

export const useRealtimeAttendance = () => {
    const [attendanceLogs, setAttendanceLogs] = useState<AppsScriptAttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const attendanceRef = ref(database, 'attendance_logs');

        const handleData = (snapshot: any) => {
            try {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const logs: AppsScriptAttendanceLog[] = Object.entries(data)
                        .map(([id, log]: [string, any]) => ({
                            id,
                            ...log
                        }))
                        .sort((a, b) => b.createdAt - a.createdAt); // Most recent first

                    setAttendanceLogs(logs);
                } else {
                    setAttendanceLogs([]);
                }
                setLoading(false);
                setError(null);
            } catch (err) {
                console.error('Error processing attendance data:', err);
                setError('Failed to load attendance data');
                setLoading(false);
            }
        };

        const handleError = (err: any) => {
            console.error('Firebase attendance listener error:', err);
            setError('Failed to connect to attendance data');
            setLoading(false);
        };

        // Set up real-time listener
        onValue(attendanceRef, handleData, handleError);

        // Cleanup function
        return () => {
            off(attendanceRef, 'value', handleData);
        };
    }, []);

    return { attendanceLogs, loading, error };
};

export const useAttendanceStats = (selectedDate?: string) => {
    const [stats, setStats] = useState<AttendanceStats>({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0,
        lastUpdated: Date.now()
    });
    const [loading, setLoading] = useState(true);

    const calculateStats = useCallback(async () => {
        try {
            setLoading(true);

            // Get today's date or selected date
            const targetDate = selectedDate || new Date().toISOString().split('T')[0];

            // Get all students count
            const studentsRef = ref(database, 'students');
            const studentsSnap = await get(studentsRef);
            const totalStudents = studentsSnap.exists() ? Object.keys(studentsSnap.val()).length : 0;

            // Get today's attendance logs
            const attendanceRef = ref(database, 'attendance_logs');
            const attendanceSnap = await get(attendanceRef);

            let presentToday = 0;
            if (attendanceSnap.exists()) {
                const logs = attendanceSnap.val();
                const todayLogs = Object.values(logs).filter((log: any) =>
                    log.date === targetDate
                );
                presentToday = todayLogs.length;
            }

            const absentToday = Math.max(0, totalStudents - presentToday);
            const attendanceRate = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

            setStats({
                totalStudents,
                presentToday,
                absentToday,
                attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
                lastUpdated: Date.now()
            });

            setLoading(false);
        } catch (error) {
            console.error('Error calculating attendance stats:', error);
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        calculateStats();
    }, [calculateStats]);

    return { stats, loading, recalculate: calculateStats };
};

export const useCourseAttendanceStats = (selectedDate?: string) => {
    const [courseStats, setCourseStats] = useState<CourseAttendanceStats[]>([]);
    const [loading, setLoading] = useState(true);

    const calculateCourseStats = useCallback(async () => {
        try {
            setLoading(true);

            const targetDate = selectedDate || new Date().toISOString().split('T')[0];

            // Get courses
            const coursesRef = ref(database, 'courses');
            const coursesSnap = await get(coursesRef);

            // Get attendance logs for the date
            const attendanceRef = ref(database, 'attendance_logs');
            const attendanceSnap = await get(attendanceRef);

            const stats: CourseAttendanceStats[] = [];

            if (coursesSnap.exists()) {
                const courses = coursesSnap.val();

                for (const [courseId, course] of Object.entries(courses)) {
                    const courseData = course as Course;

                    // Count attendance for this course on the target date
                    let presentCount = 0;
                    if (attendanceSnap.exists()) {
                        const logs = attendanceSnap.val();
                        presentCount = Object.values(logs).filter((log: any) =>
                            log.date === targetDate && log.course === courseData.name
                        ).length;
                    }

                    // For simplicity, assume all students could attend (you might want to filter by course assignments)
                    const totalStudents = 50; // This should be calculated based on enrolled students per course

                    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

                    stats.push({
                        courseId,
                        courseName: courseData.name,
                        totalStudents,
                        presentCount,
                        attendanceRate: Math.round(attendanceRate * 100) / 100
                    });
                }
            }

            setCourseStats(stats);
            setLoading(false);
        } catch (error) {
            console.error('Error calculating course attendance stats:', error);
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        calculateCourseStats();
    }, [calculateCourseStats]);

    return { courseStats, loading, recalculate: calculateCourseStats };
};

export const useLiveAttendanceTable = (limit: number = 50) => {
    const [liveEntries, setLiveEntries] = useState<LiveAttendanceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const attendanceRef = query(
            ref(database, 'attendance_logs'),
            orderByChild('createdAt'),
            limitToLast(limit)
        );

        const handleData = (snapshot: any) => {
            try {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const entries: LiveAttendanceEntry[] = Object.entries(data)
                        .map(([id, log]: [string, any]) => ({
                            id,
                            studentName: log.studentName || 'Unknown',
                            studentId: log.studentId,
                            course: log.course,
                            time: log.time,
                            timestamp: log.createdAt
                        }))
                        .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

                    setLiveEntries(entries);
                } else {
                    setLiveEntries([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error processing live attendance data:', err);
                setLoading(false);
            }
        };

        onValue(attendanceRef, handleData);

        return () => {
            off(attendanceRef, 'value', handleData);
        };
    }, [limit]);

    return { liveEntries, loading };
};