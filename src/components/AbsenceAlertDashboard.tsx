import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AbsenceAlertService } from '../lib/productionServices';
import { AbsenceAlert } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AbsenceAlertDashboard: React.FC = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<AbsenceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        resolvedToday: 0,
    });

    useEffect(() => {
        loadAlerts();
        loadStats();
    }, [user]);

    const loadAlerts = async () => {
        if (!user) return;

        try {
            setLoading(true);

            if (user.role === 'parent') {
                // Parents see alerts for their children
                // This would need to be implemented based on your parent-student relationship
                setAlerts([]);
            } else {
                // Admins see all active alerts
                const allAlerts = await getAllActiveAlerts();
                setAlerts(allAlerts);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
            toast.error('Failed to load absence alerts');
        } finally {
            setLoading(false);
        }
    };

    const getAllActiveAlerts = async (): Promise<AbsenceAlert[]> => {
        // This is a placeholder - you would need to implement this based on your database structure
        // For now, return empty array
        return [];
    };

    const loadStats = async () => {
        // Calculate stats from alerts
        const totalAlerts = alerts.length;
        const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && !alert.resolved).length;
        const warningAlerts = alerts.filter(alert => alert.type === 'warning' && !alert.resolved).length;
        const resolvedToday = alerts.filter(alert =>
            alert.resolved &&
            new Date(alert.resolvedAt!).toDateString() === new Date().toDateString()
        ).length;

        setStats({
            totalAlerts,
            criticalAlerts,
            warningAlerts,
            resolvedToday,
        });
    };

    const handleResolveAlert = async (alertId: string) => {
        if (!user) return;

        try {
            await AbsenceAlertService.resolveAlert(alertId, user.uid);
            toast.success('Alert resolved successfully');
            loadAlerts();
        } catch (error) {
            console.error('Error resolving alert:', error);
            toast.error('Failed to resolve alert');
        }
    };

    const runAlertCheck = async () => {
        try {
            await AbsenceAlertService.checkAndCreateAlerts();
            toast.success('Alert check completed');
            loadAlerts();
        } catch (error) {
            console.error('Error running alert check:', error);
            toast.error('Failed to run alert check');
        }
    };

    const getAlertIcon = (type: string) => {
        return type === 'critical' ?
            <AlertTriangle className="w-5 h-5 text-red-500" /> :
            <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    };

    const getAlertBadgeVariant = (type: string) => {
        return type === 'critical' ? 'destructive' : 'secondary';
    };

    useEffect(() => {
        loadStats();
    }, [alerts]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading absence alerts...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Absence Alert System</h2>
                    <p className="text-gray-600">Monitor and manage student absence alerts</p>
                </div>

                {user?.role === 'superadmin' && (
                    <Button onClick={runAlertCheck}>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Run Alert Check
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Warning Alerts</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.warningAlerts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalAlerts}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                                <p className="text-2xl font-bold text-green-600">{stats.resolvedToday}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Absence Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-600">No active absence alerts</p>
                            <p className="text-sm text-gray-500 mt-2">All students are within acceptable attendance ranges</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts
                                .filter(alert => !alert.resolved)
                                .sort((a, b) => {
                                    // Sort critical alerts first
                                    if (a.type === 'critical' && b.type !== 'critical') return -1;
                                    if (a.type !== 'critical' && b.type === 'critical') return 1;
                                    // Then by creation date (newest first)
                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                })
                                .map((alert) => (
                                    <div key={alert.alertId} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                {getAlertIcon(alert.type)}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-medium">Student {alert.studentId}</h3>
                                                        <Badge variant={getAlertBadgeVariant(alert.type)}>
                                                            {alert.type.toUpperCase()}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                                        <div>
                                                            <span className="font-medium">Consecutive Absences:</span> {alert.consecutiveAbsences}
                                                        </div>
                                                        {alert.courseId && (
                                                            <div>
                                                                <span className="font-medium">Course:</span> {alert.courseId}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium">Created:</span> {new Date(alert.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                        {alert.reason}
                                                    </p>
                                                </div>
                                            </div>

                                            {user?.role === 'superadmin' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleResolveAlert(alert.alertId)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alert Thresholds Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Alert Thresholds</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-700">Warning Threshold</h4>
                                <p className="text-sm text-gray-600">Triggered when a student has 2 consecutive absences</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-700">Critical Threshold</h4>
                                <p className="text-sm text-gray-600">Triggered when a student has 3 or more consecutive absences</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Alerts are automatically generated daily. Parents receive notifications for their children's alerts.
                            Administrators can resolve alerts once the attendance issue has been addressed.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};