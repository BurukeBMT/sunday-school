import React from 'react';
import { usePermissions, Permission } from '../lib/usePermissions';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionGateProps {
    children: React.ReactNode;
    permission?: Permission;
    permissions?: Permission[];
    requireAll?: boolean; // If true, user must have ALL permissions; if false, user must have ANY
    fallback?: React.ReactNode;
    showMessage?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    permission,
    permissions = [],
    requireAll = false,
    fallback,
    showMessage = true
}) => {
    const { profile } = useAuth();
    const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]"></div>
            </div>
        );
    }

    // Superadmin bypass
    if (profile?.role === 'superadmin') {
        return <>{children}</>;
    }

    // Check permissions
    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions.length > 0) {
        hasAccess = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);
    } else {
        // No permissions specified, allow access
        hasAccess = true;
    }

    // If user has access, render children
    if (hasAccess) {
        return <>{children}</>;
    }

    // If fallback is provided, use it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default unauthorized message
    if (showMessage) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border border-gray-200">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600 text-center max-w-md">
                    You don't have the required permissions to access this feature.
                    Please contact your administrator if you believe this is an error.
                </p>
                <div className="mt-4 text-sm text-gray-500">
                    Required: {permission || permissions.join(', ')}
                </div>
            </div>
        );
    }

    // If showMessage is false, render nothing
    return null;
};

// Higher-order component version for class components or complex scenarios
export const withPermission = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    permission?: Permission,
    permissions?: Permission[],
    requireAll?: boolean
) => {
    return (props: P) => (
        <PermissionGate
            permission={permission}
            permissions={permissions}
            requireAll={requireAll}
        >
            <WrappedComponent {...props} />
        </PermissionGate>
    );
};

// Hook for conditional rendering
export const usePermissionCheck = (permission?: Permission, permissions?: Permission[]) => {
    const { hasPermission, hasAnyPermission } = usePermissions();

    if (permission) {
        return hasPermission(permission);
    }

    if (permissions && permissions.length > 0) {
        return hasAnyPermission(permissions);
    }

    return true;
};