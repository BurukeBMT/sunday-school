import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationService } from '../lib/registrationService';
import { Student, Parent } from '../types';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { Loader2, Users, Calendar, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const ParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [parent, setParent] = useState<Parent | null>(null);
    const [children, setChildren] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadParentData = async () => {
            if (!user) return;

            try {
                // Find parent by UID
                const parentsRef = ref(database, 'parents');
                const parentsSnap = await get(parentsRef);

                if (parentsSnap.exists()) {
                    const parents = parentsSnap.val();
                    const parentEntry = Object.entries(parents).find(([_, parentData]: [string, any]) =>
                        parentData.uid === user.uid
                    );

                    if (parentEntry) {
                        const [parentId, parentData] = parentEntry;
                        const parentInfo: Parent = { parentId, ...(parentData as any) };
                        setParent(parentInfo);

                        // Load children
                        const childrenData = await RegistrationService.getParentChildren(parentId);
                        setChildren(childrenData);
                    }
                }
            } catch (err) {
                console.error('Error loading parent data:', err);
                setError('Failed to load parent data');
            } finally {
                setIsLoading(false);
            }
        };

        loadParentData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !parent) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        {error || 'Parent data not found. Please contact school administration.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Parent Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Monitor your children's progress and attendance.
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    Parent ID: {parent.parentId}
                </Badge>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{children.length}</p>
                                <p className="text-sm text-muted-foreground">Children</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {children.reduce((acc, child) => acc + (child.attendanceCount || 0), 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Attendance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {children.reduce((acc, child) => acc + (child.courses?.length || 0), 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Courses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {children.reduce((acc, child) => acc + (child.averageGrade || 0), 0) / children.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Grade</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Children Details */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {children.map((child) => (
                            <Card key={child.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{child.fullName}</CardTitle>
                                    <CardDescription>
                                        Student ID: {child.id} | Grade: {child.grade}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Department:</span>
                                            <span className="text-sm font-medium">{child.department}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Attendance:</span>
                                            <span className="text-sm font-medium">{child.attendanceCount || 0} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Average Grade:</span>
                                            <span className="text-sm font-medium">{child.averageGrade || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Status:</span>
                                            <Badge variant={child.isActive !== false ? 'default' : 'secondary'}>
                                                {child.isActive !== false ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    {children.map((child) => (
                        <Card key={child.id}>
                            <CardHeader>
                                <CardTitle>{child.fullName}'s Attendance</CardTitle>
                                <CardDescription>Student ID: {child.id}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        Attendance details will be displayed here when available.
                                    </p>
                                    <p className="text-sm mt-2">
                                        Total attendance days: {child.attendanceCount || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="grades" className="space-y-4">
                    {children.map((child) => (
                        <Card key={child.id}>
                            <CardHeader>
                                <CardTitle>{child.fullName}'s Grades</CardTitle>
                                <CardDescription>Student ID: {child.id}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        Grade details will be displayed here when available.
                                    </p>
                                    <p className="text-sm mt-2">
                                        Average grade: {child.averageGrade || 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
};