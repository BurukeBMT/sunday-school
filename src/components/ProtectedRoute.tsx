import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const SUPER_ADMIN_EMAIL = 'burukmaedot16@gmail.com';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = ['admin', 'superadmin'] }) => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();
    const isSuperAdminEmail = user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#5A5A40]" size={42} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (isSuperAdminEmail) {
        return <>{children}</>;
    }

    if (profile?.mustResetPassword && location.pathname !== '/reset-password') {
        return <Navigate to="/reset-password" replace />;
    }

    if (!profile || !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
