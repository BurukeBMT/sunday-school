import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ['admin', 'superadmin'] }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#5A5A40]" size={42} />
            </div>
        );
    }

    if (!user || !profile || !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
