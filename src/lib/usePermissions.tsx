import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Permission types
export type Permission =
    | 'users.create'
    | 'users.read'
    | 'users.update'
    | 'users.delete'
    | 'students.create'
    | 'students.read'
    | 'students.update'
    | 'students.delete'
    | 'courses.create'
    | 'courses.read'
    | 'courses.update'
    | 'courses.delete'
    | 'attendance.read'
    | 'attendance.update'
    | 'results.read'
    | 'results.publish'
    | 'results.unpublish'
    | 'analytics.read'
    | 'system.admin'
    | 'activity.read';

export interface RolePermissions {
    [role: string]: Permission[];
}

// Default permissions for each role
const DEFAULT_PERMISSIONS: RolePermissions = {
    superadmin: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'students.create', 'students.read', 'students.update', 'students.delete',
        'courses.create', 'courses.read', 'courses.update', 'courses.delete',
        'attendance.read', 'attendance.update',
        'results.read', 'results.publish', 'results.unpublish',
        'analytics.read',
        'system.admin',
        'activity.read'
    ],
    admin: [
        'students.read', 'students.update',
        'courses.read', 'courses.update',
        'attendance.read', 'attendance.update',
        'results.read',
        'analytics.read'
    ],
    teacher: [
        'students.read',
        'courses.read',
        'attendance.read', 'attendance.update',
        'results.read',
        'analytics.read'
    ],
    student: [
        'students.read',
        'results.read'
    ]
};

interface PermissionsContextType {
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
    getUserPermissions: () => Permission[];
    updateUserPermissions: (userId: string, permissions: Permission[]) => Promise<void>;
    loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { profile, loading: authLoading } = useAuth();
    const [customPermissions, setCustomPermissions] = useState<{ [userId: string]: Permission[] }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only load custom permissions after auth has finished loading
        if (!authLoading) {
            loadCustomPermissions();
        }
    }, [authLoading]);

    const loadCustomPermissions = async () => {
        try {
            const permissionsRef = ref(database, 'userPermissions');
            const snapshot = await get(permissionsRef);
            if (snapshot.exists()) {
                setCustomPermissions(snapshot.val());
            } else {
                // Initialize empty permissions if path doesn't exist
                setCustomPermissions({});
            }
        } catch (error) {
            console.warn('Could not load custom permissions, using defaults:', error);
            // Continue with empty custom permissions
            setCustomPermissions({});
        } finally {
            setLoading(false);
        }
    };

    const getUserPermissions = (): Permission[] => {
        if (authLoading || !profile) return [];

        // Superadmin always has all permissions
        if (profile.role === 'superadmin') {
            return DEFAULT_PERMISSIONS.superadmin;
        }

        // Check for custom permissions first
        if (customPermissions[profile.uid]) {
            return customPermissions[profile.uid];
        }

        // Fall back to default role permissions
        return DEFAULT_PERMISSIONS[profile.role] || [];
    };

    const hasPermission = (permission: Permission): boolean => {
        if (authLoading || !profile) return false;
        const userPermissions = getUserPermissions();
        return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        if (authLoading || !profile) return false;
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
        if (authLoading || !profile) return false;
        return permissions.every(permission => hasPermission(permission));
    };

    const updateUserPermissions = async (userId: string, permissions: Permission[]): Promise<void> => {
        try {
            const permissionsRef = ref(database, 'userPermissions');
            const updatedPermissions = { ...customPermissions, [userId]: permissions };
            await set(permissionsRef, updatedPermissions);
            setCustomPermissions(updatedPermissions);
        } catch (error) {
            console.error('Error updating user permissions:', error);
            throw error;
        }
    };

    const value: PermissionsContextType = {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getUserPermissions,
        updateUserPermissions,
        loading: loading || authLoading
    };

    // Show loading state while permissions are being initialized
    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]"></div>
            </div>
        );
    }

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
};