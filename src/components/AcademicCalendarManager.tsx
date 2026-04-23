import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CalendarService } from '../lib/productionServices';
import { CalendarEvent, AcademicCalendar } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, Plus, Clock, MapPin, BookOpen, GraduationCap, Gift, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AcademicCalendarManager: React.FC = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Create event form state
    const [eventForm, setEventForm] = useState({
        title: '',
        type: 'class' as CalendarEvent['type'],
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        courseId: '',
        description: '',
        isRecurring: false,
        recurrencePattern: 'weekly' as 'daily' | 'weekly' | 'monthly',
    });

    useEffect(() => {
        loadEvents();
    }, [selectedDate]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            // Get events for a date range (current month)
            const startOfMonth = new Date(selectedDate);
            startOfMonth.setDate(1);
            const endOfMonth = new Date(selectedDate);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

            const eventsData = await CalendarService.getEventsForDateRange(
                startOfMonth.toISOString().split('T')[0],
                endOfMonth.toISOString().split('T')[0]
            );
            setEvents(eventsData);
        } catch (error) {
            console.error('Error loading events:', error);
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!user) return;

        try {
            await CalendarService.createEvent({
                ...eventForm,
                createdBy: user.uid,
            });

            toast.success('Event created successfully');
            setShowCreateDialog(false);
            setEventForm({
                title: '',
                type: 'class',
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                courseId: '',
                description: '',
                isRecurring: false,
                recurrencePattern: 'weekly',
            });
            loadEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error('Failed to create event');
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'class':
                return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'holiday':
                return <Gift className="w-4 h-4 text-green-500" />;
            case 'exam':
                return <GraduationCap className="w-4 h-4 text-purple-500" />;
            case 'event':
                return <Calendar className="w-4 h-4 text-orange-500" />;
            case 'lock_period':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'class':
                return 'border-blue-200 bg-blue-50';
            case 'holiday':
                return 'border-green-200 bg-green-50';
            case 'exam':
                return 'border-purple-200 bg-purple-50';
            case 'event':
                return 'border-orange-200 bg-orange-50';
            case 'lock_period':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'class':
                return 'Class';
            case 'holiday':
                return 'Holiday';
            case 'exam':
                return 'Exam';
            case 'event':
                return 'Event';
            case 'lock_period':
                return 'Lock Period';
            default:
                return type;
        }
    };

    const formatEventTime = (event: CalendarEvent) => {
        if (event.startTime && event.endTime) {
            return `${event.startTime} - ${event.endTime}`;
        }
        return 'All day';
    };

    const getEventsForDate = (date: string) => {
        return events.filter(event =>
            event.startDate <= date && event.endDate >= date
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading calendar...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Calendar</h2>
                    <p className="text-gray-600">Manage classes, holidays, exams, and important dates</p>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Calendar Event</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <Input
                                        value={eventForm.title}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Event title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <Select
                                        value={eventForm.type}
                                        onValueChange={(value: CalendarEvent['type']) =>
                                            setEventForm(prev => ({ ...prev, type: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="class">Class</SelectItem>
                                            <SelectItem value="holiday">Holiday</SelectItem>
                                            <SelectItem value="exam">Exam</SelectItem>
                                            <SelectItem value="event">Event</SelectItem>
                                            <SelectItem value="lock_period">Lock Period</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <Input
                                        type="date"
                                        value={eventForm.startDate}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <Input
                                        type="date"
                                        value={eventForm.endDate}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <Input
                                        type="time"
                                        value={eventForm.startTime}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <Input
                                        type="time"
                                        value={eventForm.endTime}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {eventForm.type === 'class' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Course ID (Optional)</label>
                                    <Input
                                        value={eventForm.courseId}
                                        onChange={(e) => setEventForm(prev => ({ ...prev, courseId: e.target.value }))}
                                        placeholder="Course ID for class events"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <Textarea
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Event description"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    checked={eventForm.isRecurring}
                                    onChange={(e) => setEventForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                    className="rounded"
                                />
                                <label htmlFor="recurring" className="text-sm font-medium">Recurring Event</label>
                            </div>

                            {eventForm.isRecurring && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Recurrence Pattern</label>
                                    <Select
                                        value={eventForm.recurrencePattern}
                                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                                            setEventForm(prev => ({ ...prev, recurrencePattern: value }))
                                        }
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleCreateEvent} className="flex-1">
                                    Create Event
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Month Navigation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const date = new Date(selectedDate);
                                date.setMonth(date.getMonth() - 1);
                                setSelectedDate(date.toISOString().split('T')[0]);
                            }}
                        >
                            Previous Month
                        </Button>

                        <h3 className="text-lg font-medium">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </h3>

                        <Button
                            variant="outline"
                            onClick={() => {
                                const date = new Date(selectedDate);
                                date.setMonth(date.getMonth() + 1);
                                setSelectedDate(date.toISOString().split('T')[0]);
                            }}
                        >
                            Next Month
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Events List */}
            <Card>
                <CardHeader>
                    <CardTitle>Calendar Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No events found for this month</p>
                            <p className="text-sm text-gray-500 mt-2">Add events to populate the calendar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.eventId} className={`p-4 rounded-lg border ${getEventColor(event.type)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            {getEventIcon(event.type)}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-medium">{event.title}</h3>
                                                    <Badge variant="outline">
                                                        {getEventTypeLabel(event.type)}
                                                    </Badge>
                                                    {event.isRecurring && (
                                                        <Badge variant="secondary">Recurring</Badge>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {event.startDate === event.endDate
                                                                ? event.startDate
                                                                : `${event.startDate} to ${event.endDate}`
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{formatEventTime(event)}</span>
                                                    </div>
                                                </div>

                                                {event.description && (
                                                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                                                )}

                                                {event.courseId && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>Course: {event.courseId}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Event Types Legend */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Class</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Holiday</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">Exam</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="text-sm">Event</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Lock Period</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};