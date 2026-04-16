import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, FileText, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface ActivityLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'warning' | 'error';
    category: 'authentication' | 'data_modification' | 'system' | 'access' | 'export';
}

interface ActivityStats {
    totalActivities: number;
    todayActivities: number;
    activeUsers: number;
    failedActions: number;
    successRate: number;
}

// Mock data - replace with real Firebase audit logs
const mockActivityLogs: ActivityLog[] = [
    {
        id: 'LOG001',
        timestamp: '2024-01-15T10:30:00Z',
        userId: 'admin1',
        userName: 'አቶ አዲስ ተስፋዬ',
        userRole: 'superadmin',
        action: 'LOGIN',
        resource: 'Authentication',
        details: 'Successful login to admin dashboard',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        category: 'authentication'
    },
    {
        id: 'LOG002',
        timestamp: '2024-01-15T10:35:00Z',
        userId: 'teacher1',
        userName: 'አቶ ተስፋዬ አብረሃም',
        userRole: 'teacher',
        action: 'UPDATE_ATTENDANCE',
        resource: 'Attendance',
        resourceId: 'ATT001',
        details: 'Marked student present for Sunday service',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        status: 'success',
        category: 'data_modification'
    },
    {
        id: 'LOG003',
        timestamp: '2024-01-15T10:40:00Z',
        userId: 'parent1',
        userName: 'አቶ አብረሃም ተስፋዬ',
        userRole: 'parent',
        action: 'VIEW_GRADES',
        resource: 'Grading',
        resourceId: 'STU001',
        details: 'Viewed child\'s grade report',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Android 13; Mobile)',
        status: 'success',
        category: 'access'
    },
    {
        id: 'LOG004',
        timestamp: '2024-01-15T10:45:00Z',
        userId: 'admin1',
        userName: 'አቶ አዲስ ተስፋዬ',
        userRole: 'superadmin',
        action: 'EXPORT_DATA',
        resource: 'Reports',
        details: 'Exported attendance report for January',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        category: 'export'
    },
    {
        id: 'LOG005',
        timestamp: '2024-01-15T10:50:00Z',
        userId: 'unknown',
        userName: 'Unknown User',
        userRole: 'guest',
        action: 'FAILED_LOGIN',
        resource: 'Authentication',
        details: 'Failed login attempt - invalid credentials',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'error',
        category: 'authentication'
    }
];

const activityByHourData = [
    { hour: '06:00', activities: 2 },
    { hour: '08:00', activities: 15 },
    { hour: '10:00', activities: 28 },
    { hour: '12:00', activities: 22 },
    { hour: '14:00', activities: 18 },
    { hour: '16:00', activities: 12 },
    { hour: '18:00', activities: 8 },
    { hour: '20:00', activities: 3 }
];

const activityByCategoryData = [
    { name: 'Authentication', value: 35, color: '#3B82F6' },
    { name: 'Data Modification', value: 28, color: '#10B981' },
    { name: 'Access', value: 22, color: '#F59E0B' },
    { name: 'Export', value: 10, color: '#8B5CF6' },
    { name: 'System', value: 5, color: '#6B7280' }
];

const activityByStatusData = [
    { name: 'Success', value: 85, color: '#10B981' },
    { name: 'Warning', value: 10, color: '#F59E0B' },
    { name: 'Error', value: 5, color: '#EF4444' }
];

export const ActivityLogs: React.FC = () => {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

    useEffect(() => {
        // TODO: Fetch real activity logs from Firebase
        setTimeout(() => {
            setActivityLogs(mockActivityLogs);
            setLoading(false);
        }, 1000);
    }, [selectedDate, selectedCategory, selectedStatus]);

    const columns = [
        {
            key: 'timestamp',
            header: 'Timestamp',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">
                    {new Date(value).toLocaleString()}
                </span>
            )
        },
        {
            key: 'userName',
            header: 'User',
            sortable: true,
            render: (value: string, log: ActivityLog) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{log.userRole}</div>
                </div>
            )
        },
        {
            key: 'action',
            header: 'Action',
            sortable: true,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'resource',
            header: 'Resource',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: string) => {
                const statusConfig = {
                    success: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                    warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
                    error: { color: 'bg-red-100 text-red-800', icon: XCircle }
                };
                const config = statusConfig[value as keyof typeof statusConfig];
                const Icon = config.icon;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                );
            }
        },
        {
            key: 'category',
            header: 'Category',
            sortable: true,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {value.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'details',
            header: 'Details',
            render: (value: string) => (
                <span className="text-sm text-gray-600 max-w-xs truncate" title={value}>
                    {value}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, log: ActivityLog) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                        setShowDetailsDrawer(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <Eye className="h-4 w-4" />
                </button>
            )
        }
    ];

    // Calculate stats from current logs
    const stats: ActivityStats = {
        totalActivities: activityLogs.length,
        todayActivities: activityLogs.filter(log =>
            new Date(log.timestamp).toDateString() === new Date().toDateString()
        ).length,
        activeUsers: new Set(activityLogs.map(log => log.userId)).size,
        failedActions: activityLogs.filter(log => log.status === 'error').length,
        successRate: Math.round((activityLogs.filter(log => log.status === 'success').length / activityLogs.length) * 100)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-1">
                        Audit trail of all system activities and user actions
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="authentication">Authentication</option>
                            <option value="data_modification">Data Modification</option>
                            <option value="access">Access</option>
                            <option value="export">Export</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Activities"
                    value={stats.totalActivities}
                    icon={Activity}
                />
                <StatCard
                    title="Today's Activities"
                    value={stats.todayActivities}
                    icon={Clock}
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={User}
                />
                <StatCard
                    title="Success Rate"
                    value={`${stats.successRate}%`}
                    icon={CheckCircle}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Activity by Hour"
                    subtitle="Activity distribution throughout the day"
                    icon={Clock}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activityByHourData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="activities"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Activity by Category"
                    subtitle="Distribution of activities by type"
                    icon={FileText}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activityByCategoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {activityByCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Activities']} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Activity Status */}
            <ChartCard
                title="Activity Status Distribution"
                subtitle="Success, warning, and error rates"
                icon={AlertTriangle}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={activityByStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {activityByStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Status']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                        {activityByStatusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ChartCard>

            {/* Activity Logs Table */}
            <DataTable
                data={activityLogs}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search activity logs by user, action, or resource..."
                itemsPerPage={15}
                onRowClick={(log) => {
                    setSelectedLog(log);
                    setShowDetailsDrawer(true);
                }}
            />

            {/* Activity Details Drawer */}
            {showDetailsDrawer && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Activity Details</h2>
                                <button
                                    onClick={() => setShowDetailsDrawer(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                                    <div className="space-y-2">
                                        <p><strong>Activity ID:</strong> {selectedLog.id}</p>
                                        <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                                        <p><strong>User:</strong> {selectedLog.userName} ({selectedLog.userRole})</p>
                                        <p><strong>Action:</strong> {selectedLog.action.replace('_', ' ')}</p>
                                        <p><strong>Resource:</strong> {selectedLog.resource}</p>
                                        {selectedLog.resourceId && <p><strong>Resource ID:</strong> {selectedLog.resourceId}</p>}
                                    </div>
                                </div>

                                {/* Status and Category */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Category</h3>
                                    <div className="flex space-x-4">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedLog.status === 'success' ? 'bg-green-100 text-green-800' :
                                                    selectedLog.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {selectedLog.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
                                </div>

                                {/* Technical Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>IP Address:</strong> {selectedLog.ipAddress}</p>
                                        <p><strong>User Agent:</strong></p>
                                        <p className="text-gray-600 bg-gray-50 p-2 rounded text-xs break-all">
                                            {selectedLog.userAgent}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        View User Profile
                                    </button>
                                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                        Export Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};