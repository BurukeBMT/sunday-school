import { ref, onValue, off, get } from 'firebase/database';
import { database } from '../firebase';
import { Student, Course, AttendanceLog } from '../types';

export interface AttendanceStats {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    attendancePercentage: number;
}

export interface CourseAttendance {
    courseId: string;
    courseName: string;
    totalStudents: number;
    presentToday: number;
    attendanceRate: number;
}

export interface GradeAttendance {
    grade: string;
    totalStudents: number;
    presentToday: number;
    attendanceRate: number;
}

export interface TeacherStats {
    teacherId: string;
    teacherName: string;
    attendanceTaken: number;
    lastActivity: string;
}

export interface AttendanceAnalytics {
    overall: AttendanceStats;
    courses: CourseAttendance[];
    grades: GradeAttendance[];
    teachers: TeacherStats[];
    lastUpdated: Date;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Calculate overall attendance statistics
 */
export const calculateOverallStats = (
    allStudents: Student[],
    todayLogs: AttendanceLog[]
): AttendanceStats => {
    const totalStudents = allStudents.length;
    const presentToday = new Set(todayLogs.map(log => log.studentId)).size;
    const absentToday = totalStudents - presentToday;
    const attendancePercentage = totalStudents > 0 ? (presentToday / totalStudents) * 100 : 0;

    return {
        totalStudents,
        presentToday,
        absentToday,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
    };
};

/**
 * Calculate course-wise attendance analytics
 */
export const calculateCourseAttendance = (
    courses: Course[],
    allStudents: Student[],
    todayLogs: AttendanceLog[]
): CourseAttendance[] => {
    return courses.map(course => {
        // Get students in this course's grade and departments
        const courseStudents = allStudents.filter(student =>
            student.grade === course.grade &&
            course.departments.includes(student.department)
        );

        // Get attendance logs for this course today
        const courseLogs = todayLogs.filter(log => log.courseId === course.id);
        const presentStudents = new Set(courseLogs.map(log => log.studentId)).size;

        const attendanceRate = courseStudents.length > 0
            ? (presentStudents / courseStudents.length) * 100
            : 0;

        return {
            courseId: course.id,
            courseName: course.name,
            totalStudents: courseStudents.length,
            presentToday: presentStudents,
            attendanceRate: Math.round(attendanceRate * 100) / 100
        };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);
};

/**
 * Calculate grade-wise attendance analytics
 */
export const calculateGradeAttendance = (
    allStudents: Student[],
    todayLogs: AttendanceLog[]
): GradeAttendance[] => {
    const grades = ['ክፍል 1', 'ክፍል 2', 'ክፍል 3', 'ክፍል 4', 'ክፍል 5', 'ክፍል 6',
        'ክፍል 7', 'ክፍል 8', 'ክፍል 9', 'ክፍል 10', 'ክፍል 11', 'ክፍል 12'];

    return grades.map(grade => {
        const gradeStudents = allStudents.filter(student => student.grade === grade);
        const gradeLogs = todayLogs.filter(log => {
            const student = allStudents.find(s => s.id === log.studentId);
            return student?.grade === grade;
        });
        const presentStudents = new Set(gradeLogs.map(log => log.studentId)).size;

        const attendanceRate = gradeStudents.length > 0
            ? (presentStudents / gradeStudents.length) * 100
            : 0;

        return {
            grade,
            totalStudents: gradeStudents.length,
            presentToday: presentStudents,
            attendanceRate: Math.round(attendanceRate * 100) / 100
        };
    }).filter(grade => grade.totalStudents > 0);
};

/**
 * Calculate teacher attendance statistics
 */
export const calculateTeacherStats = (
    todayLogs: AttendanceLog[],
    teachers: { [key: string]: { name: string } }
): TeacherStats[] => {
    const teacherMap = new Map<string, { count: number; lastActivity: string }>();

    todayLogs.forEach(log => {
        const teacherId = log.markedBy;
        const existing = teacherMap.get(teacherId) || { count: 0, lastActivity: log.time };

        teacherMap.set(teacherId, {
            count: existing.count + 1,
            lastActivity: log.time > existing.lastActivity ? log.time : existing.lastActivity
        });
    });

    return Array.from(teacherMap.entries())
        .map(([teacherId, stats]) => ({
            teacherId,
            teacherName: teachers[teacherId]?.name || `Teacher ${teacherId.slice(-4)}`,
            attendanceTaken: stats.count,
            lastActivity: stats.lastActivity
        }))
        .sort((a, b) => b.attendanceTaken - a.attendanceTaken);
};

/**
 * Main function to get real-time attendance analytics
 */
export const getRealtimeAttendanceAnalytics = (
    callback: (analytics: AttendanceAnalytics) => void
): (() => void) => {
    const today = getTodayDate();
    let students: Student[] = [];
    let courses: Course[] = [];
    let teachers: { [key: string]: { name: string } } = {};
    let todayLogs: AttendanceLog[] = [];

    // Students listener
    const studentsRef = ref(database, 'students');
    const unsubStudents = onValue(studentsRef, (snap) => {
        if (snap.exists()) {
            students = Object.values(snap.val());
        }
        updateAnalytics();
    });

    // Courses listener
    const coursesRef = ref(database, 'courses');
    const unsubCourses = onValue(coursesRef, (snap) => {
        if (snap.exists()) {
            courses = Object.values(snap.val());
        }
        updateAnalytics();
    });

    // Teachers listener
    const teachersRef = ref(database, 'teachers');
    const unsubTeachers = onValue(teachersRef, (snap) => {
        if (snap.exists()) {
            teachers = snap.val();
        }
        updateAnalytics();
    });

    // Attendance logs listener (filtered for today)
    const logsRef = ref(database, 'attendance_logs');
    const unsubLogs = onValue(logsRef, (snap) => {
        if (snap.exists()) {
            const allLogs = Object.values(snap.val()) as AttendanceLog[];
            todayLogs = allLogs.filter(log => log.date === today);
        } else {
            todayLogs = [];
        }
        updateAnalytics();
    });

    const updateAnalytics = () => {
        const overall = calculateOverallStats(students, todayLogs);
        const courseAnalytics = calculateCourseAttendance(courses, students, todayLogs);
        const gradeAnalytics = calculateGradeAttendance(students, todayLogs);
        const teacherAnalytics = calculateTeacherStats(todayLogs, teachers);

        const analytics: AttendanceAnalytics = {
            overall,
            courses: courseAnalytics,
            grades: gradeAnalytics,
            teachers: teacherAnalytics,
            lastUpdated: new Date()
        };

        callback(analytics);
    };

    // Return cleanup function
    return () => {
        unsubStudents();
        unsubCourses();
        unsubTeachers();
        unsubLogs();
    };
};

/**
 * Get attendance analytics for a specific date (non-realtime)
 */
export const getAttendanceAnalyticsForDate = async (date: string): Promise<AttendanceAnalytics> => {
    const [studentsSnap, coursesSnap, teachersSnap, logsSnap] = await Promise.all([
        get(ref(database, 'students')),
        get(ref(database, 'courses')),
        get(ref(database, 'teachers')),
        get(ref(database, 'attendance_logs'))
    ]);

    const students: Student[] = studentsSnap.exists() ? Object.values(studentsSnap.val()) : [];
    const courses: Course[] = coursesSnap.exists() ? Object.values(coursesSnap.val()) : [];
    const teachers: { [key: string]: { name: string } } = teachersSnap.exists() ? teachersSnap.val() : {};

    let todayLogs: AttendanceLog[] = [];
    if (logsSnap.exists()) {
        const allLogs = Object.values(logsSnap.val()) as AttendanceLog[];
        todayLogs = allLogs.filter(log => log.date === date);
    }

    const overall = calculateOverallStats(students, todayLogs);
    const courseAnalytics = calculateCourseAttendance(courses, students, todayLogs);
    const gradeAnalytics = calculateGradeAttendance(students, todayLogs);
    const teacherAnalytics = calculateTeacherStats(todayLogs, teachers);

    return {
        overall,
        courses: courseAnalytics,
        grades: gradeAnalytics,
        teachers: teacherAnalytics,
        lastUpdated: new Date()
    };
};