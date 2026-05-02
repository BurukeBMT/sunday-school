import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, BookOpen, Award, AlertCircle, Download, FileText, Lock, User } from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { fetchStudentResults } from '../lib/firebaseService';
import { checkResultsPublished } from '../lib/resultsControl';
import { generateTranscriptPDF } from '../lib/generateTranscriptPDF';
import { StudentResult, Student } from '../types';

export const StudentResults: React.FC = () => {
    const [results, setResults] = useState<StudentResult[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultsPublished, setResultsPublished] = useState(false);
    const [downloadingTranscript, setDownloadingTranscript] = useState(false);

    useEffect(() => {
        const resolveStudentRecord = async (): Promise<Student | null> => {
            if (!auth.currentUser) return null;
            const uid = auth.currentUser.uid;

            const directRef = ref(database, `students/${uid}`);
            const directSnap = await get(directRef);
            if (directSnap.exists()) {
                return directSnap.val() as Student;
            }

            const studentsRef = ref(database, 'students');
            const uidQuery = query(studentsRef, orderByChild('uid'), equalTo(uid));
            const uidSnap = await get(uidQuery);
            if (uidSnap.exists()) {
                const students = uidSnap.val();
                const firstKey = Object.keys(students)[0];
                return students[firstKey] as Student;
            }

            const email = auth.currentUser.email?.trim().toLowerCase();
            if (email) {
                const emailQuery = query(studentsRef, orderByChild('email'), equalTo(email));
                const emailSnap = await get(emailQuery);
                if (emailSnap.exists()) {
                    const students = emailSnap.val();
                    const firstKey = Object.keys(students)[0];
                    return students[firstKey] as Student;
                }
            }

            return null;
        };

        const loadStudentData = async () => {
            try {
                const studentData = await resolveStudentRecord();
                if (!studentData) {
                    throw new Error('Student data not found');
                }

                setStudent(studentData);

                // Check if results are published for this grade
                const isPublished = await checkResultsPublished(studentData.grade);
                setResultsPublished(isPublished);

                if (isPublished) {
                    // Load results only if published
                    const studentResults = await fetchStudentResults(studentData.id, studentData.grade);
                    setResults(studentResults);
                }
            } catch (err) {
                setError('Failed to load student data or results.');
                console.error('Error loading student data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStudentData();
    }, []);

    // Calculate statistics
    const safeResults = Array.isArray(results) ? results : [];
    const totalCourses = safeResults.length;
    const averageScore = totalCourses > 0 ? safeResults.reduce((sum, result) => sum + (result.total ?? 0), 0) / totalCourses : 0;
    const highestScore = totalCourses > 0 ? Math.max(...safeResults.map(r => r.total ?? 0)) : 0;
    const lowestScore = totalCourses > 0 ? Math.min(...safeResults.map(r => r.total ?? 0)) : 0;
    const bestRank = totalCourses > 0 ? Math.min(...safeResults.map(r => r.rank ?? 0)) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Available</h2>
                    <p className="text-gray-600 max-w-md">{error}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Results are calculated and published by your teachers. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    if (!resultsPublished) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Lock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Yet Published</h2>
                    <p className="text-gray-600 max-w-md">
                        Your academic results have not been published yet.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Teachers will publish results when they are ready. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Yet</h2>
                    <p className="text-gray-600">Your course results have not been published yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Teachers will publish results after completing assessments and grading.
                    </p>
                </div>
            </div>
        );
    }

    const handleDownloadTranscript = async () => {
        if (!student) return;

        setDownloadingTranscript(true);
        try {
            await generateTranscriptPDF(student.id);
        } catch (err) {
            console.error('Error downloading transcript:', err);
            // You could add a toast notification here
        } finally {
            setDownloadingTranscript(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
                            <p className="mt-2 text-gray-600">Academic performance across all courses</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.href = '/student-profile'}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                            </button>
                            <button
                                onClick={handleDownloadTranscript}
                                disabled={downloadingTranscript}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {downloadingTranscript ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Download Transcript
                            </button>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Courses</p>
                            <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Average</p>
                            <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Highest</p>
                            <p className="text-2xl font-bold text-gray-900">{highestScore}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Award className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Best Rank</p>
                            <p className="text-2xl font-bold text-gray-900">
                                #{bestRank ?? 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Course Results</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(safeResults) ? safeResults.map((result) => {
                                const getPerformanceColor = (score: number) => {
                                    if (score >= 90) return 'text-green-600 bg-green-100';
                                    if (score >= 80) return 'text-blue-600 bg-blue-100';
                                    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
                                    if (score >= 60) return 'text-orange-600 bg-orange-100';
                                    return 'text-red-600 bg-red-100';
                                };

                                const getPerformanceLabel = (score: number) => {
                                    if (score >= 90) return 'Excellent';
                                    if (score >= 80) return 'Very Good';
                                    if (score >= 70) return 'Good';
                                    if (score >= 60) return 'Satisfactory';
                                    return 'Needs Improvement';
                                };

                                return (
                                    <tr key={result.course}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Course {result.course}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {result.total}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            #{result.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={"inline-flex px-2 py-1 text-xs font-semibold rounded-full " + getPerformanceColor(result.total)}>
                                                {getPerformanceLabel(result.total)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : null}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-2">Score Range</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Highest Score:</span>
                                <span className="text-sm font-medium">{highestScore}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Lowest Score:</span>
                                <span className="text-sm font-medium">{lowestScore}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Average Score:</span>
                                <span className="text-sm font-medium">{averageScore.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-medium text-gray-900 mb-2">Ranking</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Best Rank:</span>
                                <span className="text-sm font-medium">
                                    #{bestRank ?? 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Courses Completed:</span>
                                <span className="text-sm font-medium">{totalCourses}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Results are calculated based on the grading rules set by your teachers.
                        Each course may have different assessment components (assignments, quizzes, exams) with varying weights.
                    </p>
                </div>
            </div>
        </div>

    );
};
