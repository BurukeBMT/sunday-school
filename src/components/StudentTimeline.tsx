import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TimelineService } from '../lib/productionServices';
import { TimelineEntry } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, BookOpen, TrendingUp, User, CheckCircle, XCircle, Award } from 'lucide-react';

export const StudentTimeline: React.FC<{ studentId?: string }> = ({ studentId }) => {
    const { user } = useAuth();
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedStudentId, setSelectedStudentId] = useState<string>(studentId || '');

    useEffect(() => {
        if (selectedStudentId) {
            loadTimeline();
        }
    }, [selectedStudentId, filter]);

    const loadTimeline = async () => {
        if (!selectedStudentId) return;

        try {
            setLoading(true);
            const timelineData = await TimelineService.getStudentTimeline(selectedStudentId);

            // Filter by type if needed
            const filteredData = filter === 'all'
                ? timelineData
                : timelineData.filter(entry => entry.type === filter);

            setTimeline(filteredData);
        } catch (error) {
            console.error('Error loading timeline:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimelineIcon = (type: string) => {
        switch (type) {
            case 'attendance':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'grade':
                return <Award className="w-5 h-5 text-blue-500" />;
            case 'course_enrollment':
                return <BookOpen className="w-5 h-5 text-purple-500" />;
            case 'status_change':
                return <TrendingUp className="w-5 h-5 text-orange-500" />;
            default:
                return <Calendar className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTimelineColor = (type: string) => {
        switch (type) {
            case 'attendance':
                return 'border-green-200 bg-green-50';
            case 'grade':
                return 'border-blue-200 bg-blue-50';
            case 'course_enrollment':
                return 'border-purple-200 bg-purple-50';
            case 'status_change':
                return 'border-orange-200 bg-orange-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const formatTimelineDetails = (entry: TimelineEntry) => {
        const { type, details } = entry;

        switch (type) {
            case 'attendance':
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Course:</span>
                            <Badge variant="outline">{details.courseName || details.courseId}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <Badge variant={details.attendanceStatus === 'present' ? 'default' : 'secondary'}>
                                {details.attendanceStatus}
                            </Badge>
                        </div>
                        {details.notes && <p className="text-sm text-gray-600">{details.notes}</p>}
                    </div>
                );

            case 'grade':
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Course:</span>
                            <Badge variant="outline">{details.courseName || details.courseId}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Score:</span>
                            <Badge variant="default">{details.score}/100</Badge>
                        </div>
                        {details.grade && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Grade:</span>
                                <Badge>{details.grade}</Badge>
                            </div>
                        )}
                    </div>
                );

            case 'course_enrollment':
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Course:</span>
                            <Badge variant="outline">{details.courseName || details.courseId}</Badge>
                        </div>
                        {details.grade && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Grade:</span>
                                <Badge>{details.grade}</Badge>
                            </div>
                        )}
                    </div>
                );

            case 'status_change':
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <Badge>{details.status}</Badge>
                        </div>
                        {details.notes && <p className="text-sm text-gray-600">{details.notes}</p>}
                    </div>
                );

            default:
                return <p className="text-sm text-gray-600">{details.notes || 'No additional details'}</p>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;

        return date.toLocaleDateString();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading timeline...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Student Academic Timeline</h2>
                    <p className="text-gray-600">Complete history of student activities and progress</p>
                </div>

                <div className="flex gap-4">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="attendance">Attendance</SelectItem>
                            <SelectItem value="grade">Grades</SelectItem>
                            <SelectItem value="course_enrollment">Enrollments</SelectItem>
                            <SelectItem value="status_change">Status Changes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Activity Timeline {selectedStudentId && `- Student ${selectedStudentId}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {timeline.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No timeline entries found</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {filter === 'all' ? 'This student has no recorded activities yet.' : `No ${filter} activities found.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timeline.map((entry, index) => (
                                <div key={entry.entryId} className="relative">
                                    {/* Timeline line */}
                                    {index < timeline.length - 1 && (
                                        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                                    )}

                                    <div className={`flex items-start space-x-4 p-4 rounded-lg border ${getTimelineColor(entry.type)}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {getTimelineIcon(entry.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-900 capitalize">
                                                    {entry.type.replace('_', ' ')}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-700">
                                                {formatTimelineDetails(entry)}
                                            </div>

                                            <div className="mt-2 text-xs text-gray-500">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {timeline.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Attendance Records</p>
                                    <p className="text-2xl font-bold">
                                        {timeline.filter(t => t.type === 'attendance').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Award className="w-8 h-8 text-blue-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Grade Entries</p>
                                    <p className="text-2xl font-bold">
                                        {timeline.filter(t => t.type === 'grade').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <BookOpen className="w-8 h-8 text-purple-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Course Enrollments</p>
                                    <p className="text-2xl font-bold">
                                        {timeline.filter(t => t.type === 'course_enrollment').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Status Changes</p>
                                    <p className="text-2xl font-bold">
                                        {timeline.filter(t => t.type === 'status_change').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};