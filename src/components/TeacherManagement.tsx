import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, UserPlus } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import { createTeacher, updateTeacher, getTeacher } from '../lib/gradingUtils';
import { TeacherProfile, GRADES } from '../types';

export const TeacherManagement: React.FC = () => {
    const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
    const [formData, setFormData] = useState({
        uid: '',
        name: '',
        assignedGrades: [] as string[],
        assignedCourses: [] as string[],
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const teachersRef = ref(database, 'teachers');
        const unsubscribe = onValue(teachersRef, (snapshot) => {
            const teachersData: TeacherProfile[] = [];
            snapshot.forEach((child) => {
                teachersData.push(child.val());
            });
            setTeachers(teachersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingTeacher) {
                await updateTeacher(editingTeacher.uid, {
                    name: formData.name,
                    assignedGrades: formData.assignedGrades,
                    assignedCourses: formData.assignedCourses,
                });
            } else {
                // In a real app, you'd create the user account first
                // For now, we'll assume the UID is provided
                await createTeacher({
                    uid: formData.uid,
                    name: formData.name,
                    assignedGrades: formData.assignedGrades,
                    assignedCourses: formData.assignedCourses,
                });
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            setError('Failed to save teacher');
            console.error('Error saving teacher:', err);
        }
    };

    const handleEdit = (teacher: TeacherProfile) => {
        setEditingTeacher(teacher);
        setFormData({
            uid: teacher.uid,
            name: teacher.name,
            assignedGrades: [...teacher.assignedGrades],
            assignedCourses: [...teacher.assignedCourses],
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (teacherId: string) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            const teacherRef = ref(database, `teachers/${teacherId}`);
            await remove(teacherRef);
        } catch (err) {
            console.error('Error deleting teacher:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            uid: '',
            name: '',
            assignedGrades: [],
            assignedCourses: [],
        });
        setEditingTeacher(null);
        setError('');
    };

    const toggleGrade = (grade: string) => {
        setFormData(prev => ({
            ...prev,
            assignedGrades: prev.assignedGrades.includes(grade)
                ? prev.assignedGrades.filter(g => g !== grade)
                : [...prev.assignedGrades, grade],
        }));
    };

    const toggleCourse = (courseId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedCourses: prev.assignedCourses.includes(courseId)
                ? prev.assignedCourses.filter(c => c !== courseId)
                : [...prev.assignedCourses, courseId],
        }));
    };

    // Mock course data - in a real app, you'd fetch this from Firebase
    const availableCourses = [
        { id: 'course1', name: 'Mathematics' },
        { id: 'course2', name: 'English' },
        { id: 'course3', name: 'Science' },
        { id: 'course4', name: 'History' },
        { id: 'course5', name: 'Geography' },
        { id: 'course6', name: 'Art' },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Teacher Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add Teacher
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                            <li key={teacher.uid} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">{teacher.name}</h3>
                                                <p className="text-sm text-gray-500">ID: {teacher.uid}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Grades:</span> {teacher.assignedGrades.join(', ') || 'None'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Courses:</span> {teacher.assignedCourses.length} assigned
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.uid)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {teachers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No teachers found. Add your first teacher to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teacher ID (UID)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.uid}
                                        onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Firebase Auth UID"
                                        required
                                        disabled={!!editingTeacher}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Teacher's full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned Grades
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {GRADES.map((grade) => (
                                        <label key={grade} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.assignedGrades.includes(grade)}
                                                onChange={() => toggleGrade(grade)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{grade}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned Courses
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {availableCourses.map((course) => (
                                        <label key={course.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.assignedCourses.includes(course.id)}
                                                onChange={() => toggleCourse(course.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{course.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm">{error}</div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                >
                                    <Save className="h-5 w-5 mr-2" />
                                    {editingTeacher ? 'Update' : 'Add'} Teacher
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};