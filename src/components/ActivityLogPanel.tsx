import React, { useState, useEffect } from 'react';
import {
    Activity,
    Search,
    Filter,
    Download,
    Calendar,
    User,
    FileText,
    Settings,
    Users,
    BookOpen,
    BarChart3,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ActivityLogger, ActivityLog } from '../lib/activityLogger';
import { cn } from '../lib/utils';
import { PermissionGate } from './PermissionGate';

const ITEMS_PER_PAGE = 20;

const RESOURCE_ICONS: { [key: string]: React.ReactNode } = {
    'users': <Users className="w-4 h-4" />,
    'students': <User className="w-4 h-4" />,
    'courses': <BookOpen className="w-4 h-4" />,
    'attendance': <Calendar className="w-4 h-4" />,
    'results': <FileText className="w-4 h-4" />,
    'analytics': <BarChart3 className="w-4 h-4" />,
    'system': <Settings className="w-4 h-4" />,
    'default': <Activity className="w-4 h-4" />
};

const RESOURCE_COLORS: { [key: string]: string } = {
    'users': 'bg-blue-100 text-blue-700',
    'students': 'bg-green-100 text-green-700',
    'courses': 'bg-purple-100 text-purple-700',
    'attendance': 'bg-orange-100 text-orange-700',
    'results': 'bg-red-100 text-red-700',
    'analytics': 'bg-indigo-100 text-indigo-700',
    'system': 'bg-gray-100 text-gray-700',
    'default': 'bg-gray-100 text-gray-700'
};

export const ActivityLogPanel: React.FC = () => {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [resourceFilter, setResourceFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadActivities();
    }, []);

    useEffect(() => {
        filterActivities();
    }, [activities, searchTerm, resourceFilter]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredActivities.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
    }, [filteredActivities]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const data = await ActivityLogger.getRecentActivities(500); // Load last 500 activities
            setActivities(data);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterActivities = () => {
        let filtered = activities;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.resource.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Resource filter
        if (resourceFilter !== 'all') {
            filtered = filtered.filter(activity => activity.resource === resourceFilter);
        }

        setFilteredActivities(filtered);
    };

    const getCurrentPageActivities = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredActivities.slice(startIndex, endIndex);
    };

    const getUniqueResources = () => {
        const resources = new Set(activities.map(activity => activity.resource));
        return Array.from(resources).sort();
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return `${Math.floor(diffInHours * 60)} minutes ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const exportActivities = () => {
        const csvContent = [
            ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Details'].join(','),
            ...filteredActivities.map(activity => [
                new Date(activity.timestamp).toISOString(),
                `"${activity.user}"`,
                `"${activity.action}"`,
                activity.resource,
                activity.resourceId || '',
                `"${JSON.stringify(activity.details || {})}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PermissionGate permission="activity.read">
            <div className="space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Activity Logs</h1>
                        <p className="text-gray-500">Monitor system activities and user actions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadActivities}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={exportActivities}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white rounded-xl hover:bg-[#4A4A30] transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Filter className="text-gray-400" size={20} />
                        <select
                            value={resourceFilter}
                            onChange={(e) => setResourceFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10"
                        >
                            <option value="all">All Resources</option>
                            {getUniqueResources().map((resource: string) => (
                                <option key={resource} value={resource}>
                                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Activity List */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="animate-spin mx-auto mb-4 w-8 h-8 text-gray-400" />
                            <p className="text-gray-500">Loading activities...</p>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="p-12 text-center">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
                            <p className="text-gray-500">
                                {searchTerm || resourceFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Activity logging will appear here as users interact with the system.'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-50">
                                {getCurrentPageActivities().map((activity) => (
                                    <div key={activity.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-2 rounded-lg flex-shrink-0",
                                                RESOURCE_COLORS[activity.resource] || RESOURCE_COLORS.default
                                            )}>
                                                {RESOURCE_ICONS[activity.resource] || RESOURCE_ICONS.default}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            {activity.action}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            by <span className="font-medium">{activity.user}</span>
                                                            {activity.resourceId && (
                                                                <span> • {activity.resource} #{activity.resourceId}</span>
                                                            )}
                                                        </p>
                                                        {activity.details && (
                                                            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg mt-2">
                                                                <pre className="whitespace-pre-wrap break-words">
                                                                    {JSON.stringify(activity.details, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-gray-400">
                                                            {formatTimestamp(activity.timestamp)}
                                                        </p>
                                                        <span className={cn(
                                                            "inline-block px-2 py-1 text-xs font-medium rounded-full mt-1",
                                                            RESOURCE_COLORS[activity.resource] || RESOURCE_COLORS.default
                                                        )}>
                                                            {activity.resource}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} activities
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PermissionGate>
    );
};