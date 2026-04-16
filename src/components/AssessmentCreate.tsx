import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { auth } from '../firebase';
import { createAssessment } from '../lib/gradingUtils';
import { GRADES } from '../types';

interface AssessmentCreateProps {
    assignedCourses: string[];
    assignedGrades: string[];
}

export const AssessmentCreate: React.FC<AssessmentCreateProps> = ({
    assignedCourses,
    assignedGrades,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        courseId: '',
        grade: '',
        totalMarks: 100,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        setLoading(true);
        setError('');

        try {
            await createAssessment({
                name: formData.name,
                courseId: formData.courseId,
                grade: formData.grade,
                totalMarks: formData.totalMarks,
                createdBy: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
            });

            setFormData({
                name: '',
                courseId: '',
                grade: '',
                totalMarks: 100,
            });
            setIsModalOpen(false);
            // You might want to refresh the assessments list here
        } catch (err) {
            setError('Failed to create assessment');
            console.error('Error creating assessment:', err);
        } finally {
            setLoading(false);
        }
    };

    const availableCourses = assignedCourses.filter(courseId => {
        // In a real app, you'd fetch course details to show names
        return true; // For now, show all assigned courses
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Assessments</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Assessment
                </button>
            </div>

            {/* Assessment List - You can implement this later */}
            <div className="text-center py-8 text-gray-500">
                Assessment list will be displayed here
            </div>

            {/* Create Assessment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Create Assessment</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assessment Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Mid Exam, Final, Quiz 1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Grade
                                </label>
                                <select
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {GRADES.filter(grade => assignedGrades.includes(grade)).map((grade) => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course
                                </label>
                                <select
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {availableCourses.map((courseId) => (
                                        <option key={courseId} value={courseId}>
                                            Course {courseId}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Marks
                                </label>
                                <input
                                    type="number"
                                    value={formData.totalMarks}
                                    onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                    max="100"
                                    required
                                />
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
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Create
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};