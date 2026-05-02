import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Hash,
    Award,
    BookOpen,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    FileText,
    Eye,
    AlertCircle,
    CheckCircle,
    Clock,
    Target
} from 'lucide-react';
import { auth, database } from '../firebase';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { fetchStudentResults, getTranscriptData } from '../lib/firebaseService';
import { generateTranscriptPDF } from '../lib/generateTranscriptPDF';
import { checkResultsPublished } from '../lib/resultsControl';
import { Student, StudentResult, AttendanceLog, TranscriptData } from '../types';

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    percentage: number;
}

export const StudentProfile: React.FC = () => {
    const [student, setStudent] = useState<Student | null>(null);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
    const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultsPublished, setResultsPublished] = useState(false);
    const [downloadingTranscript, setDownloadingTranscript] = useState(false);

    useEffect(() => {
        loadStudentProfile();
    }, []);

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

    const loadStudentProfile = async () => {
        try {
            const studentData = await resolveStudentRecord();
            if (!studentData) {
                throw new Error('Student data not found');
            }

            setStudent(studentData);

            // Check if results are published for this grade
            const isPublished = await checkResultsPublished(studentData.grade);
            setResultsPublished(isPublished);

            // Load academic data if published
            if (isPublished) {
                const [studentResults, transcript] = await Promise.all([
                    fetchStudentResults(studentData.id, studentData.grade),
                    getTranscriptData(studentData.id)
                ]);
                setResults(studentResults);
                setTranscriptData(transcript);
            }

            // Load attendance statistics
            await loadAttendanceStats(studentData.id);

        } catch (err) {
            setError('Failed to load student profile');
            console.error('Error loading student profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceStats = async (studentId: string) => {
        try {
            // Get all attendance logs for this student
            const attendanceRef = ref(database, 'attendance');
            const attendanceQuery = query(attendanceRef, orderByChild('studentId'), equalTo(studentId));
            const attendanceSnapshot = await get(attendanceQuery);

            let attendanceLogs: AttendanceLog[] = [];
            if (attendanceSnapshot.exists()) {
                const data = attendanceSnapshot.val();
                attendanceLogs = Object.values(data) as AttendanceLog[];
            }

            // Calculate attendance statistics
            const total = attendanceLogs.length;
            const present = attendanceLogs.length; // All logs are present records
            const absent = 0; // We don't track absences in this system
            const percentage = total > 0 ? 100 : 0; // Assuming all logged attendance is present

            setAttendanceStats({
                total,
                present,
                absent,
                percentage
            });

        } catch (err) {
            console.error('Error loading attendance stats:', err);
            // Set default stats if error
            setAttendanceStats({
                total: 0,
                present: 0,
                absent: 0,
                percentage: 0
            });
        }
    };

    const getPerformanceStatus = (average: number) => {
        if (average >= 90) return { status: 'Excellent', color: 'text-green-600 bg-green-100', icon: CheckCircle };
        if (average >= 80) return { status: 'Very Good', color: 'text-blue-600 bg-blue-100', icon: Target };
        if (average >= 70) return { status: 'Good', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
        return { status: 'Needs Improvement', color: 'text-red-600 bg-red-100', icon: AlertCircle };
    };

    const handleDownloadTranscript = async () => {
        if (!student) return;

        setDownloadingTranscript(true);
        try {
            await generateTranscriptPDF(student.id);
        } catch (err) {
            console.error('Error downloading transcript:', err);
        } finally {
            setDownloadingTranscript(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h2>
                    <p className="text-gray-600">{error || 'Unable to load student profile'}</p>
                </div>
            </div>
        );
    }

    const totalAverage = transcriptData?.totalAverage ?? 0;
    const courseCount = Array.isArray(transcriptData?.courses) ? transcriptData.courses.length : 0;
    const bestScore = courseCount > 0 ? Math.max(...transcriptData!.courses.map(c => c.score)) : 0;
    const coursePerformance = Array.isArray(transcriptData?.courses) ? transcriptData.courses.slice(0, 5) : [];
    const performance = getPerformanceStatus(totalAverage);
    const PerformanceIcon = performance.icon;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-2 text-gray-600">Academic and attendance overview</p>
                </div>

                {/* Student Info Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                        <div className="flex items-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-6">
                                <span className="text-2xl font-bold text-white">
                                    {getInitials(student.fullName)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{student.fullName}</h2>
                                <div className="flex items-center mt-2 space-x-4">
                                    <div className="flex items-center text-blue-100">
                                        <Hash className="h-4 w-4 mr-1" />
                                        <span>{student.id}</span>
                                    </div>
                                    <div className="flex items-center text-blue-100">
                                        <Award className="h-4 w-4 mr-1" />
                                        <span>{student.grade}</span>
                                    </div>
                                    {student.email && (
                                        <div className="flex items-center text-blue-100">
                                            <Mail className="h-4 w-4 mr-1" />
                                            <span>{student.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Status */}
                    {resultsPublished && (
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <PerformanceIcon className={`h-5 w-5 mr-2 ${performance.color.split(' ')[0]}`} />
                                    <span className="text-sm font-medium text-gray-700">Performance Status:</span>
                                </div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${performance.color}`}>
                                    {performance.status}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Academic Summary */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                                Academic Summary
                            </h3>
                        </div>

                        <div className="p-6">
                            {resultsPublished ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {totalAverage.toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-gray-600">Average Score</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                #{transcriptData?.overallRank || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-600">Grade Rank</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {courseCount}
                                            </div>
                                            <div className="text-sm text-gray-600">Courses</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {courseCount > 0 ? bestScore.toFixed(1) : '0'}%
                                            </div>
                                            <div className="text-sm text-gray-600">Best Score</div>
                                        </div>
                                    </div>

                                    {courseCount > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Course Performance</h4>
                                            <div className="space-y-2">
                                                {coursePerformance.map((course, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">{course.courseName || ''}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium">{course.score?.toFixed(1) ?? '0'}%</span>
                                                            <span className="text-xs text-gray-500">#{course.rank ?? 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Results Not Available</h4>
                                    <p className="text-sm text-gray-600">
                                        Academic results have not been published yet for your grade.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                                Attendance Summary
                            </h3>
                        </div>

                        <div className="p-6">
                            {attendanceStats ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {attendanceStats.total}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Sessions</div>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {attendanceStats.percentage}%
                                            </div>
                                            <div className="text-sm text-gray-600">Attendance Rate</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-600">
                                                {attendanceStats.present}
                                            </div>
                                            <div className="text-sm text-gray-600">Present</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600">
                                                {attendanceStats.absent}
                                            </div>
                                            <div className="text-sm text-gray-600">Absent</div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="bg-gray-100 rounded-full h-3">
                                            <div
                                                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                                style={{ width: `${attendanceStats.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2 text-center">
                                            Attendance Progress
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data</h4>
                                    <p className="text-sm text-gray-600">
                                        Attendance records will appear here once you start attending classes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => window.location.href = '/student-results'}
                                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Eye className="h-5 w-5 mr-2" />
                                View Results
                            </button>

                            <button
                                onClick={handleDownloadTranscript}
                                disabled={downloadingTranscript || !resultsPublished}
                                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloadingTranscript ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Download className="h-5 w-5 mr-2" />
                                )}
                                Download Transcript
                            </button>

                            <button
                                onClick={() => window.location.href = '/attendance'}
                                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <FileText className="h-5 w-5 mr-2" />
                                View Attendance
                            </button>
                        </div>

                        {!resultsPublished && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <AlertCircle className="inline h-4 w-4 mr-1" />
                                    Transcript download is only available when results are published.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};