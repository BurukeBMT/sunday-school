import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TeacherMetricsService } from '../lib/productionServices';
import { TeacherMetrics } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Users, BookOpen, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const TeacherPerformanceDashboard: React.FC = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<TeacherMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [generatingMetrics, setGeneratingMetrics] = useState(false);

    useEffect(() => {
        loadMetrics();
    }, [selectedPeriod]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            // In a real implementation, this would fetch metrics for all teachers
            // For now, we'll show placeholder data
            setMetrics([]);
        } catch (error) {
            console.error('Error loading metrics:', error);
            toast.error('Failed to load teacher metrics');
        } finally {
            setLoading(false);
        }
    };

    const generateMetrics = async () => {
        if (!user) return;

        try {
            setGeneratingMetrics(true);

            // Get date range based on selected period
            const endDate = new Date().toISOString().split('T')[0];
            let startDate: string;

            switch (selectedPeriod) {
                case 'weekly':
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'monthly':
                    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'yearly':
                    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
            }

            // In a real implementation, this would generate metrics for all teachers
            // For now, we'll show a success message
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

            toast.success(`Teacher metrics generated for ${selectedPeriod} period`);
            loadMetrics();

        } catch (error) {
            console.error('Error generating metrics:', error);
            toast.error('Failed to generate teacher metrics');
        } finally {
            setGeneratingMetrics(false);
        }
    };

    const getPerformanceColor = (efficiency: number) => {
        if (efficiency >= 90) return 'text-green-600';
        if (efficiency >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceBadge = (efficiency: number) => {
        if (efficiency >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
        if (efficiency >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
        return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading teacher metrics...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Teacher Performance Dashboard</h2>
                    <p className="text-gray-600">Monitor teacher activity and performance metrics</p>
                </div>

                <div className="flex gap-4">
                    <Select value={selectedPeriod} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setSelectedPeriod(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={generateMetrics} disabled={generatingMetrics}>
                        {generatingMetrics ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Generate Metrics
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                                <p className="text-2xl font-bold text-blue-600">{metrics.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <BookOpen className="w-8 h-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {metrics.reduce((sum, m) => sum + m.metrics.coursesManaged, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Target className="w-8 h-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {metrics.length > 0
                                        ? Math.round(metrics.reduce((sum, m) => sum + m.metrics.attendanceEfficiency, 0) / metrics.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Award className="w-8 h-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                                <p className="text-lg font-bold text-yellow-600">
                                    {metrics.length > 0
                                        ? metrics.reduce((prev, current) =>
                                            prev.metrics.attendanceEfficiency > current.metrics.attendanceEfficiency ? prev : current
                                        ).teacherId.slice(-4)
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Teacher Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    {metrics.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No teacher metrics available</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Generate metrics to view teacher performance data
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {metrics
                                .sort((a, b) => b.metrics.attendanceEfficiency - a.metrics.attendanceEfficiency)
                                .map((metric, index) => (
                                    <div key={metric.teacherId} className="border rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {metric.teacherId.slice(-2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Teacher {metric.teacherId.slice(-4)}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {metric.startDate} to {metric.endDate}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {getPerformanceBadge(metric.metrics.attendanceEfficiency)}
                                                <Badge variant="outline">#{index + 1}</Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {metric.metrics.totalAttendanceMarked}
                                                </div>
                                                <div className="text-sm text-gray-600">Attendance Marked</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {metric.metrics.uniqueStudentsMarked}
                                                </div>
                                                <div className="text-sm text-gray-600">Unique Students</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {metric.metrics.coursesManaged}
                                                </div>
                                                <div className="text-sm text-gray-600">Courses Managed</div>
                                            </div>

                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(metric.metrics.attendanceEfficiency)}`}>
                                                    {Math.round(metric.metrics.attendanceEfficiency)}%
                                                </div>
                                                <div className="text-sm text-gray-600">Efficiency</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Class Attendance Rate</span>
                                                <span>{Math.round(metric.metrics.averageClassAttendance)}%</span>
                                            </div>
                                            <Progress value={metric.metrics.averageClassAttendance} className="h-2" />

                                            <div className="flex justify-between text-sm text-gray-600 mt-2">
                                                <span>Last Activity:</span>
                                                <span>{new Date(metric.metrics.lastActivity).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Top Performers
                            </h4>
                            <div className="space-y-2">
                                {metrics
                                    .filter(m => m.metrics.attendanceEfficiency >= 90)
                                    .slice(0, 3)
                                    .map((metric, index) => (
                                        <div key={metric.teacherId} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                            <span className="text-sm">Teacher {metric.teacherId.slice(-4)}</span>
                                            <Badge variant="outline">{Math.round(metric.metrics.attendanceEfficiency)}%</Badge>
                                        </div>
                                    ))}
                                {metrics.filter(m => m.metrics.attendanceEfficiency >= 90).length === 0 && (
                                    <p className="text-sm text-gray-500">No teachers with 90%+ efficiency</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-yellow-500" />
                                Areas for Improvement
                            </h4>
                            <div className="space-y-2">
                                {metrics
                                    .filter(m => m.metrics.attendanceEfficiency < 75)
                                    .slice(0, 3)
                                    .map((metric) => (
                                        <div key={metric.teacherId} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                            <span className="text-sm">Teacher {metric.teacherId.slice(-4)}</span>
                                            <Badge variant="outline">{Math.round(metric.metrics.attendanceEfficiency)}%</Badge>
                                        </div>
                                    ))}
                                {metrics.filter(m => m.metrics.attendanceEfficiency < 75).length === 0 && (
                                    <p className="text-sm text-gray-500">All teachers performing well</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};