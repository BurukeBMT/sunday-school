import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceCorrectionService } from '../lib/productionServices';
import { AttendanceCorrection } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AttendanceCorrectionPanel: React.FC = () => {
    const { user } = useAuth();
    const [corrections, setCorrections] = useState<AttendanceCorrection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRequestDialog, setShowRequestDialog] = useState(false);

    // Request form state
    const [requestForm, setRequestForm] = useState({
        studentId: '',
        courseId: '',
        date: '',
        oldStatus: 'absent' as 'present' | 'absent',
        newStatus: 'present' as 'present' | 'absent',
        reason: '',
    });

    useEffect(() => {
        loadCorrections();
    }, [user]);

    const loadCorrections = async () => {
        if (!user) return;

        try {
            setLoading(true);
            let correctionsData: AttendanceCorrection[] = [];

            if (user.role === 'superadmin') {
                // Superadmin sees all corrections
                correctionsData = await AttendanceCorrectionService.getPendingCorrections();
            } else {
                // Teachers see their own requests
                // This would need to be implemented based on your user structure
                correctionsData = [];
            }

            setCorrections(correctionsData);
        } catch (error) {
            console.error('Error loading corrections:', error);
            toast.error('Failed to load attendance corrections');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCorrection = async () => {
        if (!user) return;

        try {
            await AttendanceCorrectionService.requestCorrection({
                ...requestForm,
                requestedBy: user.uid,
            });

            toast.success('Correction request submitted successfully');
            setShowRequestDialog(false);
            setRequestForm({
                studentId: '',
                courseId: '',
                date: '',
                oldStatus: 'absent',
                newStatus: 'present',
                reason: '',
            });
            loadCorrections();
        } catch (error) {
            console.error('Error requesting correction:', error);
            toast.error('Failed to submit correction request');
        }
    };

    const handleReviewCorrection = async (requestId: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
        if (!user) return;

        try {
            await AttendanceCorrectionService.reviewCorrection(requestId, status, user.uid, reviewNotes);
            toast.success(`Correction ${status} successfully`);
            loadCorrections();
        } catch (error) {
            console.error('Error reviewing correction:', error);
            toast.error('Failed to review correction');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading corrections...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Corrections</h2>
                    <p className="text-gray-600">Request and review attendance corrections</p>
                </div>

                {user?.role !== 'superadmin' && (
                    <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Request Correction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Request Attendance Correction</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={requestForm.studentId}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, studentId: e.target.value }))}
                                        placeholder="FHST00001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Course ID</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={requestForm.courseId}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, courseId: e.target.value }))}
                                        placeholder="Course ID"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-md"
                                        value={requestForm.date}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Current Status</label>
                                        <Select
                                            value={requestForm.oldStatus}
                                            onValueChange={(value: 'present' | 'absent') =>
                                                setRequestForm(prev => ({ ...prev, oldStatus: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">Present</SelectItem>
                                                <SelectItem value="absent">Absent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Requested Status</label>
                                        <Select
                                            value={requestForm.newStatus}
                                            onValueChange={(value: 'present' | 'absent') =>
                                                setRequestForm(prev => ({ ...prev, newStatus: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">Present</SelectItem>
                                                <SelectItem value="absent">Absent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Reason</label>
                                    <Textarea
                                        value={requestForm.reason}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Please explain why this correction is needed..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleRequestCorrection} className="flex-1">
                                        Submit Request
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRequestDialog(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Corrections List */}
            <div className="space-y-4">
                {corrections.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-gray-600">No attendance corrections found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    corrections.map((correction) => (
                        <Card key={correction.requestId}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {getStatusIcon(correction.status)}
                                        Correction Request #{correction.requestId.slice(-6)}
                                    </CardTitle>
                                    <Badge variant={getStatusBadgeVariant(correction.status)}>
                                        {correction.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Student ID:</span>
                                        <div className="font-medium">{correction.studentId}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Course:</span>
                                        <div className="font-medium">{correction.courseId}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Date:</span>
                                        <div className="font-medium">{correction.date}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Change:</span>
                                        <div className="font-medium">
                                            {correction.oldStatus} → {correction.newStatus}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-sm text-gray-600">Reason:</span>
                                    <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{correction.reason}</p>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                    <div>Requested: {new Date(correction.requestedAt).toLocaleString()}</div>
                                    {correction.reviewedAt && (
                                        <div>Reviewed: {new Date(correction.reviewedAt).toLocaleString()}</div>
                                    )}
                                    {correction.reviewNotes && (
                                        <div>
                                            <span className="font-medium">Review Notes:</span> {correction.reviewNotes}
                                        </div>
                                    )}
                                </div>

                                {user?.role === 'superadmin' && correction.status === 'pending' && (
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            onClick={() => handleReviewCorrection(correction.requestId, 'approved')}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReviewCorrection(correction.requestId, 'rejected')}
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};