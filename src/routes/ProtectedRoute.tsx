import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { user, profile, loading } = useAuth();

    // Show loading spinner while auth state is being determined
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required, check user role
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = profile?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and has required role (or no role restriction)
    return <>{children}</>;
};