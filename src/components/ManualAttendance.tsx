import React, { useState, useEffect } from 'react';
import {
    ref,
    query,
    orderByChild,
    equalTo,
    get,
    push,
    set
} from 'firebase/database';
import {
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    UserCheck,
    BookOpen,
    AlertCircle,
    Users
} from 'lucide-react';
import { database, handleDatabaseError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Course, DEPARTMENTS, Student } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const ManualAttendance: React.FC = () => {
    const { profile } = useAuth();
    const { t } = useLanguage();
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        studentName?: string
    } | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesRef = ref(database, 'courses');
                const snap = await get(coursesRef);
                if (snap.exists()) {
                    const allCourses = snap.val();
                    let courseList: Course[] = [];
                    if (profile?.role === 'superadmin') {
                        courseList = Object.keys(allCourses).map(key => ({
                            id: key,
                            ...allCourses[key]
                        }));
                    } else {
                        courseList = Object.keys(allCourses)
                            .map(key => ({ id: key, ...allCourses[key] }))
                            .filter(course =>
                                course.adminIds &&
                                course.adminIds.includes(profile?.uid)
                            );
                    }
                    setCourses(courseList);
                    if (courseList.length > 0) {
                        setSelectedCourse(courseList[0].id);
                    }
                }
            } catch (error) {
                handleDatabaseError(error, OperationType.LIST, 'courses');
            }
        };

        if (profile) fetchCourses();
    }, [profile]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedCourse) return;

            try {
                setLoading(true);
                const studentsRef = ref(database, 'students');
                const snap = await get(studentsRef);
                if (snap.exists()) {
                    const allStudents = snap.val();
                    const studentList: Student[] = Object.keys(allStudents).map(key => ({
                        id: key,
                        ...allStudents[key]
                    }));
                    setStudents(studentList);
                    setFilteredStudents(studentList);
                }
            } catch (error) {
                handleDatabaseError(error, OperationType.LIST, 'students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedCourse]);

    useEffect(() => {
        let filtered = students;

        // Filter by course departments
        if (selectedCourse) {
            const course = courses.find(c => c.id === selectedCourse);
            if (course) {
                const courseDepartments = Array.isArray(course.departments)
                    ? course.departments
                    : course.departments
                        ? [course.departments]
                        : course.department
                            ? [course.department]
                            : [];
                filtered = filtered.filter(student => courseDepartments.includes(student.department));
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(student =>
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredStudents(filtered);
    }, [searchQuery, students, selectedCourse, courses]);

    const markAttendance = async (student: Student) => {
        if (!selectedCourse || markingAttendance) {
            if (!selectedCourse) {
                setResult({
                    success: false,
                    message: 'Please select a valid course before marking attendance.'
                });
                setTimeout(() => setResult(null), 3000);
            }
            return;
        }

        setMarkingAttendance(student.id);

        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const course = courses.find(c => c.id === selectedCourse);

            if (!course) {
                setResult({
                    success: false,
                    message: 'Selected course not found. Please reload and try again.'
                });
                setTimeout(() => setResult(null), 3000);
                return;
            }

            // Check for duplicate attendance
            const logsRef = ref(database, 'attendance');
            const duplicateQuery = query(
                logsRef,
                orderByChild('studentId'),
                equalTo(student.id)
            );
            const duplicateSnap = await get(duplicateQuery);

            if (duplicateSnap.exists()) {
                const logs = duplicateSnap.val();
                const isDuplicate = Object.values(logs).some((log: any) =>
                    log.studentId === student.id &&
                    log.courseId === selectedCourse &&
                    log.date === today
                );

                if (isDuplicate) {
                    setResult({
                        success: false,
                        message: 'Already marked today',
                        studentName: student.fullName
                    });
                    setTimeout(() => setResult(null), 3000);
                    return;
                }
            }

            // Record attendance
            await push(ref(database, 'attendance'), {
                studentId: student.id,
                studentName: student.fullName,
                courseId: selectedCourse,
                department: student.department, // Use student's actual department
                date: today,
                time: format(new Date(), 'HH:mm:ss'),
                markedBy: profile?.uid,
                method: 'manual',
                createdAt: Date.now()
            });

            setResult({
                success: true,
                message: 'Attendance marked successfully',
                studentName: student.fullName
            });

            setTimeout(() => setResult(null), 3000);

        } catch (error) {
            console.error('Error marking attendance:', error);
            setResult({
                success: false,
                message: 'Error marking attendance. Please try again.'
            });
            setTimeout(() => setResult(null), 3000);
        } finally {
            setMarkingAttendance(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">
                    {t.manualAttendance || 'Manual Attendance'}
                </h1>
                <p className="text-gray-500">
                    {t.markAttendanceManually || 'Mark attendance manually for students'}
                </p>
            </header>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-8">
                {/* Course Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {t.selectCourse}
                    </label>
                    {courses.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex items-center gap-3">
                            <AlertCircle size={20} />
                            <span>{t.noCoursesFound} {t.createCourseFirst}</span>
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={e => setSelectedCourse(e.target.value)}
                                className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10"
                            >
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({(course.departments || [course.department]).join(', ')})
                                    </option>
                                ))}
                            </select>
                            <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {t.searchStudents || 'Search Students'}
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t.searchByNameOrId || 'Search by name or student ID...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "p-6 rounded-2xl flex items-center gap-4 border",
                            result.success
                                ? "bg-green-50 border-green-100 text-green-700"
                                : "bg-red-50 border-red-100 text-red-700"
                        )}
                    >
                        {result.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        <div className="flex-1">
                            <p className="font-bold">{result.message}</p>
                            {result.studentName && (
                                <p className="text-sm opacity-80">{result.studentName}</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Student List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            {t.students || 'Students'} ({filteredStudents.length})
                        </h3>
                        {loading && <Loader2 className="animate-spin text-gray-400" size={20} />}
                    </div>

                    {filteredStudents.length === 0 && !loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p>{t.noStudentsFound || 'No students found'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredStudents.map(student => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">
                                                {student.fullName}
                                            </h4>
                                            <p className="text-sm text-gray-600">ID: {student.id}</p>
                                            <p className="text-sm text-gray-500">{student.department}</p>
                                        </div>
                                        <button
                                            onClick={() => markAttendance(student)}
                                            disabled={markingAttendance === student.id}
                                            className="bg-[#5A5A40] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#4A4A30] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            {markingAttendance === student.id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <CheckCircle2 size={16} />
                                            )}
                                            {markingAttendance === student.id ? 'Marking...' : 'Mark Present'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};