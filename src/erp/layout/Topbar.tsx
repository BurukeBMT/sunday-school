import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface TopbarProps {
    onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    const { user, profile, logout } = useAuth();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superadmin': return 'bg-red-100 text-red-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'teacher': return 'bg-green-100 text-green-800';
            case 'student': return 'bg-purple-100 text-purple-800';
            case 'parent': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'superadmin': return 'Super Admin';
            case 'admin': return 'Administrator';
            case 'teacher': return 'Teacher';
            case 'student': return 'Student';
            case 'parent': return 'Parent';
            default: return role;
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                >
                    <Menu className="h-5 w-5 text-gray-500" />
                </button>

                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students, teachers, courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                {/* Role Badge */}
                {profile?.role && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}>
                        {getRoleDisplayName(profile.role)}
                    </span>
                )}

                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        3
                    </span>
                </button>

                {/* Profile Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden md:block text-sm font-medium text-gray-700">
                            {user?.email?.split('@')[0] || 'User'}
                        </span>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>

                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};