import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    GraduationCap,
    BookOpen,
    BarChart3,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    Shield,
    UserPlus,
    Calendar,
    FileText,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<any>;
    roles: string[];
    badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const { profile } = useAuth();

    const menuItems: MenuItem[] = [
        {
            path: '/erp/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['superadmin', 'admin', 'teacher', 'student', 'parent']
        },
        {
            path: '/erp/students',
            label: 'Students',
            icon: Users,
            roles: ['superadmin', 'admin', 'teacher']
        },
        {
            path: '/erp/teachers',
            label: 'Teachers',
            icon: GraduationCap,
            roles: ['superadmin', 'admin']
        },
        {
            path: '/erp/parents',
            label: 'Parents',
            icon: UserPlus,
            roles: ['superadmin', 'admin', 'teacher']
        },
        {
            path: '/erp/attendance',
            label: 'Attendance',
            icon: UserCheck,
            roles: ['superadmin', 'admin', 'teacher', 'student', 'parent']
        },
        {
            path: '/erp/grading',
            label: 'Grading',
            icon: BookOpen,
            roles: ['superadmin', 'admin', 'teacher', 'student', 'parent']
        },
        {
            path: '/erp/courses',
            label: 'Courses',
            icon: FileText,
            roles: ['superadmin', 'admin', 'teacher']
        },
        {
            path: '/erp/analytics',
            label: 'Analytics',
            icon: BarChart3,
            roles: ['superadmin', 'admin']
        },
        {
            path: '/erp/activity-logs',
            label: 'Activity Logs',
            icon: Activity,
            roles: ['superadmin', 'admin']
        },
        {
            path: '/erp/reports',
            label: 'Reports',
            icon: TrendingUp,
            roles: ['superadmin', 'admin', 'teacher']
        },
        {
            path: '/erp/settings',
            label: 'Settings',
            icon: Settings,
            roles: ['superadmin']
        }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(profile?.role || '')
    );

    return (
        <div className={cn(
            "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isCollapsed && (
                    <div className="flex items-center space-x-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">ፍሬ ሃይማኖት</h2>
                            <p className="text-xs text-gray-500">School ERP</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                    ) : (
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )
                            }
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium truncate">{item.label}</span>
                            )}
                            {item.badge && !isCollapsed && (
                                <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                {!isCollapsed && (
                    <div className="text-xs text-gray-500 text-center">
                        © 2024 ፍሬ ሃይማኖት ሰ/ት/ቤት
                    </div>
                )}
            </div>
        </div>
    );
};