import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, TrendingUp, Settings, Edit } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { TeacherProfile, Course } from '../types';
import { GradingRulesForm } from './GradingRulesForm';
import { MarksEntry } from './MarksEntry';

export const TeacherDashboard: React.FC = () => {
    const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'marks'>('overview');

    useEffect(() => {
        const loadTeacherData = async () => {
            if (!auth.currentUser) return;

            try {
                const teacherRef = ref(database, `teachers/${auth.currentUser.uid}`);
                const teacherSnapshot = await get(teacherRef);

                if (teacherSnapshot.exists()) {
                    const teacherData = teacherSnapshot.val() as TeacherProfile;
                    setTeacher(teacherData);

                    if (teacherData.assignedCourses?.length) {
                        const coursesRef = ref(database, 'courses');
                        const coursesSnapshot = await get(coursesRef);

                        if (coursesSnapshot.exists()) {
                            const allCourses = coursesSnapshot.val();
                            const assignedCourses: Course[] = [];

                            for (const courseId of teacherData.assignedCourses) {
                                if (allCourses[courseId]) {
                                    assignedCourses.push({
                                        id: courseId,
                                        ...allCourses[courseId]
                                    });
                                }
                            }

                            setCourses(assignedCourses);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading teacher data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTeacherData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">You are not registered as a teacher.</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'rules', label: 'Grading Rules', icon: Settings },
        { id: 'marks', label: 'Enter Marks', icon: Edit },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome back, {teacher.name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Assigned Grades</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {teacher.assignedGrades?.length ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Courses</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {teacher.assignedCourses?.length ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Students</p>
                                <p className="text-2xl font-bold text-gray-900">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="bg-white rounded-lg shadow">
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Assigned Grades</h3>
                                    <div className="space-y-2">
                                        {Array.isArray(teacher.assignedGrades) ? teacher.assignedGrades.map((grade) => (
                                            <div key={grade} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                                                <span className="font-medium">{grade}</span>
                                            </div>
                                        )) : null}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Assigned Courses</h3>
                                    <div className="space-y-2">
                                        {Array.isArray(courses) ? courses.map((course) => (
                                            <div key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <FileText className="h-5 w-5 text-green-600 mr-3" />
                                                <span className="font-medium">{course.name}</span>
                                            </div>
                                        )) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <GradingRulesForm assignedCourses={courses} />
                    )}

                    {activeTab === 'marks' && (
                        <MarksEntry
                            assignedCourses={courses}
                            assignedGrades={teacher.assignedGrades}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
