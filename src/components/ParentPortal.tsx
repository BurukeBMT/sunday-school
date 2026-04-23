import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParentService, LoginTrackingService } from '../lib/productionServices';
import { Parent, Student } from '../types';
import { get, ref } from 'firebase/database';
import { database } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, Download, Calendar, BookOpen, TrendingUp } from 'lucide-react';

export const ParentPortal: React.FC = () => {
    const { user } = useAuth();
    const [parent, setParent] = useState<Parent | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadParentData();
        }
    }, [user]);

    const loadParentData = async () => {
        if (!user?.uid) return;

        try {
            // Find parent by UID
            const parentsSnapshot = await get(ref(database, 'parents'));

            if (parentsSnapshot.exists()) {
                const parents = parentsSnapshot.val();
                const parentData = Object.values(parents).find((p: any) => p.uid === user.uid) as Parent;

                if (parentData) {
                    setParent(parentData);
                    const studentData = await ParentService.getStudentsForParent(parentData.parentId);
                    setStudents(studentData);
                }
            }
        } catch (error) {
            console.error('Error loading parent data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCredentials = () => {
        if (!parent) return;

        const credentials = `
Parent Portal Credentials
========================
Parent ID: ${parent.parentId}
Username: ${parent.username}
Temporary Password: ${parent.passwordTemp}

Please change your password after first login.
Login URL: [Your App URL]/login

Generated: ${new Date().toLocaleString()}
    `.trim();

        const blob = new Blob([credentials], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parent-credentials-${parent.parentId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading parent portal...</div>;
    }

    if (!parent) {
        return (
            <div className="text-center py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Parent Portal Not Found</h2>
                <p className="text-gray-600">Your parent account has not been set up yet. Please contact the school administration.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Parent Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Parent Portal - {parent.parentId}</span>
                        <Button onClick={downloadCredentials} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download Credentials
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                            <div className="text-sm text-gray-600">Linked Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{parent.lastLoginTime ? 'Active' : 'New'}</div>
                            <div className="text-sm text-gray-600">Account Status</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{parent.loginCount || 0}</div>
                            <div className="text-sm text-gray-600">Total Logins</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Linked Students */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <Card key={student.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">{student.fullName}</CardTitle>
                            <Badge variant="outline">{student.id}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Grade:</span>
                                    <Badge>{student.grade}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Department:</span>
                                    <Badge variant="secondary">{student.department}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Phone:</span>
                                    <span className="text-sm">{student.phone}</span>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Attendance
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        Grades
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        Progress
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {students.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600">No students linked to this parent account yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Please contact the school administration to link your children.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};