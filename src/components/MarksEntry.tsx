import React, { useState, useEffect } from 'react';
import { Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { Course, Student, MarkEntry as MarkEntryType, ASSESSMENT_TYPES } from '../types';
import { saveMarks } from '../lib/firebaseService';

interface MarksEntryProps {
    assignedCourses: Course[];
    assignedGrades: string[];
}

interface StudentMarks {
    [studentId: string]: {
        [assessmentType: string]: number;
    };
}

export const MarksEntry: React.FC<MarksEntryProps> = ({ assignedCourses, assignedGrades }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedAssessmentType, setSelectedAssessmentType] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<StudentMarks>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (selectedCourse) {
            loadStudents();
        }
    }, [selectedCourse]);

    const loadStudents = async () => {
        if (!selectedCourse) return;

        setLoading(true);
        try {
            const course = assignedCourses.find(c => c.id === selectedCourse);
            if (!course) return;

            const studentsRef = ref(database, 'students');
            const gradeQuery = query(studentsRef, orderByChild('grade'), equalTo(course.grade));
            const snapshot = await get(gradeQuery);

            if (snapshot.exists()) {
                const studentsData: Student[] = [];
                snapshot.forEach((childSnapshot) => {
                    studentsData.push({
                        id: childSnapshot.key!,
                        ...childSnapshot.val()
                    });
                });
                setStudents(studentsData);

                // Initialize marks object
                const initialMarks: StudentMarks = {};
                studentsData.forEach(student => {
                    initialMarks[student.id] = {};
                    ASSESSMENT_TYPES.forEach(type => {
                        initialMarks[student.id][type] = 0;
                    });
                });
                setMarks(initialMarks);
            }
        } catch (err) {
            setError('Failed to load students');
            console.error('Error loading students:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMark = (studentId: string, assessmentType: string, value: number) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [assessmentType]: value
            }
        }));
    };

    const handleSaveMarks = async () => {
        if (!selectedCourse || !selectedAssessmentType) {
            setError('Please select a course and assessment type');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const marksToSend: MarkEntryType[] = students.map(student => ({
                studentId: student.id,
                course: selectedCourse,
                assessmentType: selectedAssessmentType,
                score: marks[student.id]?.[selectedAssessmentType] || 0,
                maxScore: 100,
                date: new Date().toISOString()
            }));

            await saveMarks(marksToSend);
            setSuccess('Marks saved successfully!');
        } catch (err) {
            setError('Failed to save marks');
            console.error('Error saving marks:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Enter Student Marks</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a course...</option>
                            {assignedCourses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name} (Grade {course.grade})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assessment Type
                        </label>
                        <select
                            value={selectedAssessmentType}
                            onChange={(e) => setSelectedAssessmentType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose assessment type...</option>
                            {ASSESSMENT_TYPES.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSaveMarks}
                    disabled={saving || !selectedCourse || !selectedAssessmentType}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Marks'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">{success}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : students.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedAssessmentType ? `${selectedAssessmentType.charAt(0).toUpperCase() + selectedAssessmentType.slice(1)} Marks` : 'Student Marks'}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    {selectedAssessmentType && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score (%)
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.id}
                                        </td>
                                        {selectedAssessmentType && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={marks[student.id]?.[selectedAssessmentType] || ''}
                                                    onChange={(e) => updateMark(student.id, selectedAssessmentType, parseFloat(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : selectedCourse ? (
                <div className="text-center py-8 text-gray-500">
                    No students found for this course.
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Please select a course to view students.
                </div>
            )}
        </div>
    );
};
