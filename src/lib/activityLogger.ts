import { ref, push, set, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface ActivityLog {
    id?: string;
    user: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
}

// Activity logger utility
export class ActivityLogger {
    static async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
        try {
            const activityRef = ref(database, 'activityLogs');
            const newActivityRef = push(activityRef);

            const logEntry: ActivityLog = {
                ...activity,
                id: newActivityRef.key!,
                timestamp: Date.now(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            };

            await set(newActivityRef, logEntry);
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't throw error to avoid breaking the main functionality
        }
    }

    static async getRecentActivities(limit: number = 50): Promise<ActivityLog[]> {
        try {
            const activityRef = ref(database, 'activityLogs');
            const activityQuery = query(activityRef, orderByChild('timestamp'), limitToLast(limit));
            const snapshot = await get(activityQuery);

            if (snapshot.exists()) {
                const activities = Object.values(snapshot.val()) as ActivityLog[];
                return activities.sort((a, b) => b.timestamp - a.timestamp);
            }

            return [];
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            return [];
        }
    }

    static async getActivitiesByUser(userId: string, limit: number = 20): Promise<ActivityLog[]> {
        try {
            const activities = await this.getRecentActivities(1000); // Get more to filter
            return activities
                .filter(activity => activity.userId === userId)
                .slice(0, limit);
        } catch (error) {
            console.error('Failed to fetch user activities:', error);
            return [];
        }
    }

    static async getActivitiesByResource(resource: string, limit: number = 20): Promise<ActivityLog[]> {
        try {
            const activities = await this.getRecentActivities(1000); // Get more to filter
            return activities
                .filter(activity => activity.resource === resource)
                .slice(0, limit);
        } catch (error) {
            console.error('Failed to fetch resource activities:', error);
            return [];
        }
    }

    private static async getClientIP(): Promise<string> {
        try {
            // Note: This is a simplified approach. In production, you'd want to get the real IP
            // from the server-side. For client-side logging, we can use a service or leave it empty.
            return 'client-side';
        } catch {
            return 'unknown';
        }
    }
}

// Predefined activity actions
export const ActivityActions = {
    // User management
    USER_CREATED: 'Created new user account',
    USER_UPDATED: 'Updated user information',
    USER_DELETED: 'Deleted user account',
    USER_LOGIN: 'User logged in',
    USER_LOGOUT: 'User logged out',
    PASSWORD_RESET: 'Password reset requested',
    PASSWORD_CHANGED: 'Password changed',

    // Student management
    STUDENT_CREATED: 'Created new student record',
    STUDENT_UPDATED: 'Updated student information',
    STUDENT_DELETED: 'Deleted student record',
    STUDENT_BULK_IMPORT: 'Bulk imported students',

    // Course management
    COURSE_CREATED: 'Created new course',
    COURSE_UPDATED: 'Updated course information',
    COURSE_DELETED: 'Deleted course',
    COURSE_ASSIGNED: 'Assigned course to admin',

    // Attendance
    ATTENDANCE_MARKED: 'Marked attendance',
    ATTENDANCE_UPDATED: 'Updated attendance record',
    ATTENDANCE_BULK_UPDATE: 'Bulk attendance update',

    // Results/Grading
    RESULTS_PUBLISHED: 'Published exam results',
    RESULTS_UNPUBLISHED: 'Unpublished exam results',
    GRADES_UPDATED: 'Updated student grades',
    GRADING_RULES_CHANGED: 'Modified grading rules',

    // System
    SYSTEM_BACKUP: 'System backup performed',
    SETTINGS_CHANGED: 'System settings updated',
    PERMISSIONS_CHANGED: 'User permissions modified',

    // Analytics
    REPORT_GENERATED: 'Generated analytics report',
    DATA_EXPORTED: 'Exported system data'
} as const;

// React hook for activity logging
export const useActivityLogger = () => {
    const { profile } = useAuth();

    const logActivity = async (
        action: string,
        resource: string,
        resourceId?: string,
        details?: any
    ) => {
        if (!profile) return;

        await ActivityLogger.logActivity({
            user: profile.name || profile.email,
            userId: profile.uid,
            action,
            resource,
            resourceId,
            details
        });
    };

    return { logActivity };
};