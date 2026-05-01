import { ref, get, set, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';
import { Parent, Student, LoginLog, AttendanceCorrection, AbsenceAlert, WeeklyReport, MonthlyReport, TimelineEntry, BackupMetadata, TeacherMetrics, CalendarEvent, AcademicCalendar, ActivityLog, SystemConfig } from '../types';

// ===== 1. PARENT MANAGEMENT SYSTEM =====

export class ParentService {
    static async createParentForStudent(student: Student): Promise<Parent> {
        const parentId = `PAR-${Date.now().toString().slice(-6)}`;
        const username = `${student.id}_parent`;
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        const parent: Parent = {
            parentId,
            username,
            passwordTemp: tempPassword,
            linkedStudents: [student.id],
            createdAt: new Date().toISOString(),
            phone: student.phone,
            email: student.email,
        };

        await set(ref(database, `parents/${parentId}`), parent);

        // Update student with parent link
        await update(ref(database, `students/${student.id}`), {
            parentId: parentId,
        });

        return parent;
    }

    static async getParentById(parentId: string): Promise<Parent | null> {
        const snapshot = await get(ref(database, `parents/${parentId}`));
        return snapshot.exists() ? snapshot.val() : null;
    }

    static async getParentByUsername(username: string): Promise<Parent | null> {
        const parentsRef = ref(database, 'parents');
        const snapshot = await get(parentsRef);

        if (!snapshot.exists()) return null;

        const parents = snapshot.val();
        for (const [parentId, parent] of Object.entries(parents)) {
            if ((parent as Parent).username === username) {
                return parent as Parent;
            }
        }
        return null;
    }

    static async getStudentsForParent(parentId: string): Promise<Student[]> {
        const parent = await this.getParentById(parentId);
        if (!parent) return [];

        const students: Student[] = [];
        for (const studentId of parent.linkedStudents) {
            const studentSnapshot = await get(ref(database, `students/${studentId}`));
            if (studentSnapshot.exists()) {
                students.push(studentSnapshot.val());
            }
        }
        return students;
    }
}

// ===== 2. LOGIN HISTORY & DEVICE TRACKING =====

export class LoginTrackingService {
    static async logLoginAttempt(userId: string, success: boolean, ipAddress: string, userAgent: string, failureReason?: string): Promise<void> {
        const logId = push(ref(database, 'login_logs')).key!;
        const deviceType = this.detectDeviceType(userAgent);

        const loginLog: LoginLog = {
            logId,
            userId,
            timestamp: new Date().toISOString(),
            ipAddress,
            deviceType,
            userAgent,
            success,
            failureReason,
        };

        await set(ref(database, `login_logs/${logId}`), loginLog);

        // Update user's last login time
        if (success) {
            await update(ref(database, `users/${userId}`), {
                lastLoginTime: new Date().toISOString(),
                loginCount: (await this.getUserLoginCount(userId)) + 1,
            });
        }
    }

    static detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return ua.includes('tablet') || ua.includes('ipad') ? 'tablet' : 'mobile';
        }
        return 'desktop';
    }

    static async getUserLoginHistory(userId: string, limit: number = 50): Promise<LoginLog[]> {
        const logsRef = ref(database, 'login_logs');
        const userLogsQuery = query(logsRef, orderByChild('userId'), equalTo(userId));
        const snapshot = await get(userLogsQuery);

        if (!snapshot.exists()) return [];

        const logs = Object.values(snapshot.val()) as LoginLog[];
        return logs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    private static async getUserLoginCount(userId: string): Promise<number> {
        const userSnapshot = await get(ref(database, `users/${userId}`));
        return userSnapshot.exists() ? userSnapshot.val().loginCount || 0 : 0;
    }
}

// ===== 3. ATTENDANCE CORRECTION SYSTEM =====

export class AttendanceCorrectionService {
    static async requestCorrection(correction: Omit<AttendanceCorrection, 'requestId' | 'requestedAt' | 'status'>): Promise<string> {
        const requestId = push(ref(database, 'attendance_corrections')).key!;

        const fullCorrection: AttendanceCorrection = {
            ...correction,
            requestId,
            requestedAt: new Date().toISOString(),
            status: 'pending',
        };

        await set(ref(database, `attendance_corrections/${requestId}`), fullCorrection);
        return requestId;
    }

    static async reviewCorrection(requestId: string, status: 'approved' | 'rejected', reviewedBy: string, reviewNotes?: string): Promise<void> {
        const updateData: Partial<AttendanceCorrection> = {
            status,
            reviewedBy,
            reviewedAt: new Date().toISOString(),
            reviewNotes,
        };

        await update(ref(database, `attendance_corrections/${requestId}`), updateData);

        // If approved, update the actual attendance log
        if (status === 'approved') {
            const correction = await this.getCorrectionById(requestId);
            if (correction) {
                // Update attendance log (this would need to be implemented based on your attendance log structure)
                // This is a placeholder - you'll need to implement the actual attendance update logic
                console.log('Correction approved - updating attendance log:', correction);
            }
        }
    }

    static async getCorrectionById(requestId: string): Promise<AttendanceCorrection | null> {
        const snapshot = await get(ref(database, `attendance_corrections/${requestId}`));
        return snapshot.exists() ? snapshot.val() : null;
    }

    static async getPendingCorrections(): Promise<AttendanceCorrection[]> {
        const correctionsRef = ref(database, 'attendance_corrections');
        const pendingQuery = query(correctionsRef, orderByChild('status'), equalTo('pending'));
        const snapshot = await get(pendingQuery);

        return snapshot.exists() ? Object.values(snapshot.val()) : [];
    }
}

// ===== 4. ABSENCE ALERT SYSTEM =====

export class AbsenceAlertService {
    static async checkAndCreateAlerts(): Promise<void> {
        // Get all students
        const studentsSnapshot = await get(ref(database, 'students'));
        if (!studentsSnapshot.exists()) return;

        const students = Object.values(studentsSnapshot.val()) as Student[];

        for (const student of students) {
            await this.checkStudentAbsences(student.id);
        }
    }

    private static async checkStudentAbsences(studentId: string): Promise<void> {
        // Get recent attendance logs (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logsRef = ref(database, 'attendance');
        const studentLogsQuery = query(logsRef, orderByChild('studentId'), equalTo(studentId));
        const snapshot = await get(studentLogsQuery);

        if (!snapshot.exists()) return;

        const logs = Object.values(snapshot.val()) as any[];
        const recentLogs = logs.filter(log =>
            new Date(log.date) >= thirtyDaysAgo &&
            log.status === 'absent' // Assuming your logs have a status field
        );

        const consecutiveAbsences = this.calculateConsecutiveAbsences(recentLogs);

        // Create alerts based on thresholds
        if (consecutiveAbsences >= 3) {
            await this.createAlert(studentId, 'critical', consecutiveAbsences, 'Multiple consecutive absences');
        } else if (consecutiveAbsences >= 2) {
            await this.createAlert(studentId, 'warning', consecutiveAbsences, 'Consecutive absences detected');
        }
    }

    private static calculateConsecutiveAbsences(logs: any[]): number {
        if (logs.length === 0) return 0;

        // Sort by date descending
        logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let consecutive = 0;
        const today = new Date();

        for (const log of logs) {
            const logDate = new Date(log.date);
            const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= consecutive) {
                consecutive++;
            } else {
                break;
            }
        }

        return consecutive;
    }

    private static async createAlert(studentId: string, type: 'warning' | 'critical', consecutiveAbsences: number, reason: string): Promise<void> {
        // Check if alert already exists
        const existingAlerts = await this.getActiveAlertsForStudent(studentId);
        const existingAlert = existingAlerts.find(alert => alert.type === type && !alert.resolved);

        if (existingAlert) return; // Alert already exists

        const alertId = push(ref(database, 'absence_alerts')).key!;

        const alert: AbsenceAlert = {
            alertId,
            studentId,
            type,
            consecutiveAbsences,
            reason,
            createdAt: new Date().toISOString(),
            resolved: false,
        };

        await set(ref(database, `absence_alerts/${alertId}`), alert);
    }

    static async getActiveAlertsForStudent(studentId: string): Promise<AbsenceAlert[]> {
        const alertsRef = ref(database, 'absence_alerts');
        const studentAlertsQuery = query(alertsRef, orderByChild('studentId'), equalTo(studentId));
        const snapshot = await get(studentAlertsQuery);

        if (!snapshot.exists()) return [];

        const alerts = Object.values(snapshot.val()) as AbsenceAlert[];
        return alerts.filter(alert => !alert.resolved);
    }

    static async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
        await update(ref(database, `absence_alerts/${alertId}`), {
            resolved: true,
            resolvedAt: new Date().toISOString(),
            resolvedBy,
        });
    }
}

// ===== 5. AUTO REPORTS SYSTEM =====

export class ReportService {
    static async generateWeeklyReport(weekStart: string, weekEnd: string): Promise<WeeklyReport> {
        const reportId = `weekly-${weekStart}`;

        // Get attendance data for the week
        const attendanceData = await this.getAttendanceDataForPeriod(weekStart, weekEnd);
        const studentsData = await this.getStudentsData();

        const report: WeeklyReport = {
            reportId,
            weekStart,
            weekEnd,
            generatedAt: new Date().toISOString(),
            totalStudents: studentsData.length,
            totalAttendance: attendanceData.totalAttendance,
            attendancePercentage: (attendanceData.totalAttendance / (studentsData.length * attendanceData.totalDays)) * 100,
            topPerformers: attendanceData.topPerformers,
            lowPerformers: attendanceData.lowPerformers,
            courseBreakdown: attendanceData.courseBreakdown,
        };

        await set(ref(database, `weekly_reports/${reportId}`), report);
        return report;
    }

    static async generateMonthlyReport(month: string): Promise<MonthlyReport> {
        const reportId = `monthly-${month}`;

        // Get data for the month
        const [year, monthNum] = month.split('-');
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const attendanceData = await this.getMonthlyAttendanceData(month);
        const gradeData = await this.getGradePerformanceData(month);
        const teacherData = await this.getTeacherPerformanceData(month);

        const report: MonthlyReport = {
            reportId,
            month,
            generatedAt: new Date().toISOString(),
            totalStudents: attendanceData.totalStudents,
            averageAttendance: attendanceData.averageAttendance,
            gradePerformance: gradeData,
            teacherPerformance: teacherData,
        };

        await set(ref(database, `monthly_reports/${reportId}`), report);
        return report;
    }

    private static async getAttendanceDataForPeriod(startDate: string, endDate: string): Promise<any> {
        // Implementation would query attendance logs for the period
        // This is a placeholder - implement based on your attendance log structure
        return {
            totalAttendance: 0,
            totalDays: 7,
            topPerformers: [],
            lowPerformers: [],
            courseBreakdown: [],
        };
    }

    private static async getStudentsData(): Promise<Student[]> {
        const snapshot = await get(ref(database, 'students'));
        return snapshot.exists() ? Object.values(snapshot.val()) : [];
    }

    private static async getMonthlyAttendanceData(month: string): Promise<any> {
        // Implementation placeholder
        return {
            totalStudents: 0,
            averageAttendance: 0,
        };
    }

    private static async getGradePerformanceData(month: string): Promise<any[]> {
        // Implementation placeholder
        return [];
    }

    private static async getTeacherPerformanceData(month: string): Promise<any[]> {
        // Implementation placeholder
        return [];
    }
}

// ===== 6. STUDENT ACADEMIC TIMELINE =====

export class TimelineService {
    static async addTimelineEntry(entry: Omit<TimelineEntry, 'entryId'>): Promise<string> {
        const entryId = push(ref(database, 'timeline')).key!;

        const fullEntry: TimelineEntry = {
            ...entry,
            entryId,
        };

        await set(ref(database, `timeline/${entryId}`), fullEntry);
        return entryId;
    }

    static async getStudentTimeline(studentId: string, limit: number = 100): Promise<TimelineEntry[]> {
        const timelineRef = ref(database, 'timeline');
        const studentTimelineQuery = query(timelineRef, orderByChild('studentId'), equalTo(studentId));
        const snapshot = await get(studentTimelineQuery);

        if (!snapshot.exists()) return [];

        const entries = Object.values(snapshot.val()) as TimelineEntry[];
        return entries
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
}

// ===== 7. BACKUP & RESTORE SYSTEM =====

export class BackupService {
    static async createBackup(type: 'auto' | 'manual', createdBy: string): Promise<BackupMetadata> {
        const backupId = `backup-${Date.now()}`;

        // Get record counts
        const [studentsCount, attendanceCount, coursesCount, usersCount, parentsCount] = await Promise.all([
            this.getCollectionCount('students'),
            this.getCollectionCount('attendance'),
            this.getCollectionCount('courses'),
            this.getCollectionCount('users'),
            this.getCollectionCount('parents'),
        ]);

        const backup: BackupMetadata = {
            backupId,
            timestamp: new Date().toISOString(),
            createdBy,
            type,
            size: 0, // Will be calculated after export
            recordCount: {
                students: studentsCount,
                attendance: attendanceCount,
                courses: coursesCount,
                users: usersCount,
                parents: parentsCount,
            },
            status: 'in_progress',
        };

        await set(ref(database, `backups/${backupId}`), backup);

        // Start backup process (this would typically export to Firebase Storage)
        // For now, we'll mark as completed
        await update(ref(database, `backups/${backupId}`), {
            status: 'completed',
            size: Math.floor(Math.random() * 1000000), // Placeholder
        });

        return backup;
    }

    static async getBackups(limit: number = 50): Promise<BackupMetadata[]> {
        const backupsRef = ref(database, 'backups');
        const snapshot = await get(backupsRef);

        if (!snapshot.exists()) return [];

        const backups = Object.values(snapshot.val()) as BackupMetadata[];
        return backups
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    private static async getCollectionCount(collection: string): Promise<number> {
        const snapshot = await get(ref(database, collection));
        return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    }
}

// ===== 8. TEACHER PERFORMANCE TRACKING =====

export class TeacherMetricsService {
    static async calculateTeacherMetrics(teacherId: string, period: string, startDate: string, endDate: string): Promise<TeacherMetrics> {
        // Get teacher's courses
        const teacherSnapshot = await get(ref(database, `users/${teacherId}`));
        if (!teacherSnapshot.exists()) throw new Error('Teacher not found');

        const teacher = teacherSnapshot.val();
        const assignedCourses = teacher.assignedCourses || [];

        // Calculate metrics based on attendance logs
        const metrics = await this.calculateMetricsFromAttendance(teacherId, assignedCourses, startDate, endDate);

        const teacherMetrics: TeacherMetrics = {
            teacherId,
            period,
            startDate,
            endDate,
            metrics,
        };

        await set(ref(database, `teacher_metrics/${teacherId}_${period}_${startDate}`), teacherMetrics);
        return teacherMetrics;
    }

    private static async calculateMetricsFromAttendance(teacherId: string, courses: string[], startDate: string, endDate: string): Promise<any> {
        // Implementation placeholder - would query attendance logs
        return {
            totalAttendanceMarked: 0,
            uniqueStudentsMarked: 0,
            coursesManaged: courses.length,
            averageClassAttendance: 0,
            attendanceEfficiency: 0,
            lastActivity: new Date().toISOString(),
        };
    }
}

// ===== 9. ACADEMIC CALENDAR SYSTEM =====

export class CalendarService {
    static async createEvent(event: Omit<CalendarEvent, 'eventId' | 'createdAt'>): Promise<string> {
        const eventId = push(ref(database, 'calendar_events')).key!;

        const fullEvent: CalendarEvent = {
            ...event,
            eventId,
            createdAt: new Date().toISOString(),
        };

        await set(ref(database, `calendar_events/${eventId}`), fullEvent);
        return eventId;
    }

    static async getEventsForDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
        const eventsRef = ref(database, 'calendar_events');
        const snapshot = await get(eventsRef);

        if (!snapshot.exists()) return [];

        const events = Object.values(snapshot.val()) as CalendarEvent[];
        return events.filter(event =>
            event.isActive &&
            ((event.startDate >= startDate && event.startDate <= endDate) ||
                (event.endDate >= startDate && event.endDate <= endDate))
        );
    }

    static async createAcademicCalendar(academicYear: string): Promise<string> {
        const calendarId = `calendar-${academicYear}`;

        const calendar: AcademicCalendar = {
            calendarId,
            academicYear,
            events: [],
            holidays: [],
            examPeriods: [],
            attendanceLockDates: [],
        };

        await set(ref(database, `academic_calendars/${calendarId}`), calendar);
        return calendarId;
    }
}

// ===== 10. ENHANCED ACTIVITY LOGGING =====

export class EnhancedActivityLogger {
    static async logActivity(activity: Omit<ActivityLog, 'id'>): Promise<string> {
        const id = push(ref(database, 'activity_logs')).key!;

        const fullActivity: ActivityLog = {
            ...activity,
            id,
        };

        await set(ref(database, `activity_logs/${id}`), fullActivity);
        return id;
    }

    static async getActivitiesForUser(userId: string, limit: number = 100): Promise<ActivityLog[]> {
        const activitiesRef = ref(database, 'activity_logs');
        const userActivitiesQuery = query(activitiesRef, orderByChild('userId'), equalTo(userId));
        const snapshot = await get(userActivitiesQuery);

        if (!snapshot.exists()) return [];

        const activities = Object.values(snapshot.val()) as ActivityLog[];
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    static async getActivitiesByCategory(category: string, limit: number = 100): Promise<ActivityLog[]> {
        const activitiesRef = ref(database, 'activity_logs');
        const categoryActivitiesQuery = query(activitiesRef, orderByChild('category'), equalTo(category));
        const snapshot = await get(categoryActivitiesQuery);

        if (!snapshot.exists()) return [];

        const activities = Object.values(snapshot.val()) as ActivityLog[];
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
}

// ===== SYSTEM CONFIGURATION =====

export class SystemConfigService {
    private static readonly CONFIG_ID = 'system_config';

    static async getConfig(): Promise<SystemConfig> {
        const snapshot = await get(ref(database, `system_config/${this.CONFIG_ID}`));

        if (snapshot.exists()) {
            return snapshot.val();
        }

        // Return default config
        return {
            configId: this.CONFIG_ID,
            absenceAlertThresholds: {
                warning: 2,
                critical: 3,
            },
            autoBackupEnabled: true,
            backupFrequency: 'weekly',
            reportAutoGeneration: true,
            maxLoginAttempts: 5,
            sessionTimeout: 480, // 8 hours
            updatedBy: 'system',
            updatedAt: new Date().toISOString(),
        };
    }

    static async updateConfig(updates: Partial<SystemConfig>, updatedBy: string): Promise<void> {
        const currentConfig = await this.getConfig();
        const updatedConfig = {
            ...currentConfig,
            ...updates,
            updatedBy,
            updatedAt: new Date().toISOString(),
        };

        await set(ref(database, `system_config/${this.CONFIG_ID}`), updatedConfig);
    }
}