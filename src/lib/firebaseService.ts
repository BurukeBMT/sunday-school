import { database } from '../firebase';
import {
    ref,
    get,
    set,
    push,
    query,
    orderByChild,
    equalTo
} from 'firebase/database';
import {
    AttendanceLog,
    Course,
    GradingRule,
    LeaderboardEntry,
    MarkEntry,
    ResultsControl,
    Student,
    StudentResult,
    TranscriptData
} from '../types';

const normalizeKey = (value: string) => value.replace(/[.#$/\[\]]/g, '_');

const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
};

const getResultStatus = (score: number) => (score >= 60 ? 'Passed' : 'Failed');

export const fetchGradingRules = async (courseId?: string): Promise<GradingRule[]> => {
    if (courseId) {
        const rulesRef = ref(database, `gradingRules/${normalizeKey(courseId)}`);
        const snapshot = await get(rulesRef);
        return snapshot.exists() ? (snapshot.val() as GradingRule[]) : [];
    }

    const rulesRef = ref(database, 'gradingRules');
    const snapshot = await get(rulesRef);
    if (!snapshot.exists()) return [];

    const allRules: GradingRule[] = [];
    const value = snapshot.val();
    Object.values(value).forEach((ruleGroup: any) => {
        if (Array.isArray(ruleGroup)) {
            allRules.push(...ruleGroup);
        }
    });
    return allRules;
};

export const saveGradingRules = async (rules: GradingRule[]): Promise<void> => {
    if (!rules || rules.length === 0) {
        throw new Error('No grading rules provided');
    }

    const course = rules[0].course;
    await set(ref(database, `gradingRules/${normalizeKey(course)}`), rules);
};

export const recordAttendance = async (payload: {
    studentId: string;
    token: string;
    courseId: string;
    markedBy?: string | null;
}): Promise<{ success: boolean; message: string; data?: { fullName: string } }> => {
    const studentRef = ref(database, `students/${payload.studentId}`);
    const studentSnap = await get(studentRef);
    if (!studentSnap.exists()) {
        return { success: false, message: 'Student not found' };
    }

    const student = studentSnap.val() as Student;
    if (student.qrToken !== payload.token) {
        return { success: false, message: 'Invalid QR token' };
    }

    const date = new Date().toISOString().slice(0, 10);
    const attendanceKey = normalizeKey(`${payload.studentId}_${date}_${payload.courseId}`);
    const attendanceRef = ref(database, `attendance/${attendanceKey}`);
    const attendanceSnap = await get(attendanceRef);

    if (attendanceSnap.exists()) {
        return { success: false, message: 'Attendance already recorded for this student, course, and date' };
    }

    const attendance: AttendanceLog = {
        id: attendanceKey,
        studentId: payload.studentId,
        studentName: student.fullName,
        courseId: payload.courseId,
        department: student.department,
        date,
        time: new Date().toISOString().split('T')[1].split('.')[0],
        markedBy: payload.markedBy || 'system',
        method: 'qr',
        createdAt: Date.now()
    };

    await set(attendanceRef, attendance);
    return {
        success: true,
        message: 'Attendance recorded successfully',
        data: { fullName: student.fullName }
    };
};

export const saveMarks = async (marks: MarkEntry[]): Promise<void> => {
    if (!marks || marks.length === 0) {
        throw new Error('No marks provided');
    }

    const marksRef = ref(database, 'marks');
    const studentCache = new Map<string, MarkEntry[]>();

    for (const mark of marks) {
        const { studentId, course, assessmentType } = mark;
        if (!studentCache.has(studentId)) {
            const queryRef = query(marksRef, orderByChild('studentId'), equalTo(studentId));
            const snapshot = await get(queryRef);
            studentCache.set(studentId, snapshot.exists() ? Object.values(snapshot.val() as Record<string, MarkEntry>) : []);
        }

        const existingMarks = studentCache.get(studentId) || [];
        const duplicate = existingMarks.find((existing) =>
            existing.course === course && existing.assessmentType === assessmentType
        );

        if (duplicate) {
            throw new Error(`Duplicate mark entry for student ${studentId}, course ${course}, assessment ${assessmentType}`);
        }

        const newMarkRef = push(marksRef);
        const markId = newMarkRef.key!;
        const markRecord: MarkEntry = {
            id: markId,
            ...mark
        };
        await set(newMarkRef, markRecord);
    }
};

export const fetchStudentResults = async (studentId: string, grade: string): Promise<StudentResult[]> => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    if (!snapshot.exists()) return [];

    const allResults = snapshot.val();
    const studentResults: StudentResult[] = [];
    Object.values(allResults).forEach((value: any) => {
        if (value.studentId === studentId && value.grade === grade) {
            studentResults.push(value as StudentResult);
        }
    });

    return studentResults.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
};

export const fetchResults = async (): Promise<StudentResult[]> => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    if (!snapshot.exists()) return [];

    return Object.values(snapshot.val()) as StudentResult[];
};

export const getGradeRanking = async (grade: string): Promise<LeaderboardEntry[]> => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    if (!snapshot.exists()) return [];

    const studentScores = new Map<string, { name: string; total: number; count: number }>();
    const studentNames = new Map<string, string>();

    Object.values(snapshot.val()).forEach((value: any) => {
        if (value.grade !== grade) return;
        const studentId = value.studentId;
        const score = Number(value.total || 0);
        const student = studentScores.get(studentId) || { name: '', total: 0, count: 0 };
        student.total += score;
        student.count += 1;
        studentScores.set(studentId, student);
        if (value.studentName) {
            studentNames.set(studentId, value.studentName);
        }
    });

    const ranking: LeaderboardEntry[] = Array.from(studentScores.entries())
        .map(([studentId, data]) => ({
            studentId,
            studentName: data.name || studentNames.get(studentId) || studentId,
            grade,
            totalScore: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
            rank: 0
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

    return ranking.slice(0, 100);
};

export const getTopStudentsByGrade = async (grade: string, limit = 10): Promise<LeaderboardEntry[]> => {
    const ranking = await getGradeRanking(grade);
    return ranking.slice(0, limit);
};

export const getTranscriptData = async (studentId: string): Promise<TranscriptData> => {
    const studentRef = ref(database, `students/${studentId}`);
    const studentSnap = await get(studentRef);
    if (!studentSnap.exists()) {
        throw new Error('Student not found');
    }

    const student = studentSnap.val() as Student;
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    const courses: Array<{ courseName: string; score: number; rank: number }> = [];
    let totalScore = 0;
    let count = 0;

    if (snapshot.exists()) {
        Object.values(snapshot.val()).forEach((value: any) => {
            if (value.studentId !== studentId) return;
            courses.push({
                courseName: value.course || '',
                score: Number(value.total || 0),
                rank: Number(value.rank || 0)
            });
            totalScore += Number(value.total || 0);
            count += 1;
        });
    }

    const totalAverage = count > 0 ? Math.round((totalScore / count) * 100) / 100 : 0;
    const gradeRanking = await getGradeRanking(student.grade);
    const overallRank = gradeRanking.findIndex((entry) => entry.studentId === studentId) + 1 || 0;

    return {
        studentId,
        studentName: student.fullName,
        grade: student.grade,
        courses,
        totalAverage,
        overallRank
    };
};

export const fetchAttendanceLogs = async (date?: string): Promise<AttendanceLog[]> => {
    const attendanceRef = ref(database, 'attendance');
    const snapshot = await get(attendanceRef);
    if (!snapshot.exists()) return [];

    const logs: AttendanceLog[] = [];
    Object.values(snapshot.val()).forEach((value: any) => {
        if (!date || value.date === date) {
            logs.push(value as AttendanceLog);
        }
    });

    return logs;
};

export const getResultsControl = async (grade: string): Promise<ResultsControl> => {
    const resultsControlRef = ref(database, `resultsControl/${normalizeKey(grade)}`);
    const snapshot = await get(resultsControlRef);
    if (!snapshot.exists()) {
        return { isPublished: false };
    }
    return snapshot.val() as ResultsControl;
};

export const saveResultsControl = async (grade: string, publish: boolean): Promise<void> => {
    const resultsControlRef = ref(database, `resultsControl/${normalizeKey(grade)}`);
    await set(resultsControlRef, {
        isPublished: publish,
        publishedAt: publish ? Date.now() : undefined
    });
};

export const getCoursesByGrade = async (grade: string): Promise<Course[]> => {
    const coursesRef = ref(database, 'courses');
    const snapshot = await get(coursesRef);
    if (!snapshot.exists()) return [];

    return Object.values(snapshot.val())
        .map((value: any) => value as Course)
        .filter(course => course.grade === grade);
};

export const getMarksByCourse = async (courseId: string): Promise<MarkEntry[]> => {
    const marksRef = ref(database, 'marks');
    const snapshot = await get(marksRef);
    if (!snapshot.exists()) return [];

    return Object.values(snapshot.val())
        .map((value: any) => value as MarkEntry)
        .filter(mark => mark.course === courseId);
};

export const getAllMarks = async (): Promise<MarkEntry[]> => {
    const marksRef = ref(database, 'marks');
    const snapshot = await get(marksRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as MarkEntry[];
};

export const getStudentsByGrade = async (grade: string): Promise<Student[]> => {
    const studentsRef = ref(database, 'students');
    const studentQuery = query(studentsRef, orderByChild('grade'), equalTo(grade));
    const snapshot = await get(studentQuery);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as Student[];
};

export const getResultsForCourse = async (courseId: string): Promise<StudentResult[]> => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val())
        .map((value: any) => value as StudentResult)
        .filter(result => result.course === courseId);
};

export const saveStudentResult = async (result: StudentResult): Promise<void> => {
    const key = normalizeKey(`${result.studentId}_${result.course}`);
    await set(ref(database, `results/${key}`), result);
};

export const recalculateResultsForGrade = async (grade: string): Promise<void> => {
    const students = await getStudentsByGrade(grade);
    const courses = await getCoursesByGrade(grade);
    const allMarks = await getAllMarks();

    for (const course of courses) {
        const rules = await fetchGradingRules(course.id);
        if (!rules || rules.length === 0) {
            continue;
        }

        const ruleWeights = rules.reduce((acc, rule) => {
            acc[rule.type] = rule.weight;
            return acc;
        }, {} as Record<string, number>);

        const courseMarks = allMarks.filter(mark => mark.course === course.id);
        const studentResultsById: Record<string, { total: number; weightedTotal: number; course: string; grade: string; studentName: string; }> = {};

        students.forEach(student => {
            studentResultsById[student.id] = {
                total: 0,
                weightedTotal: 0,
                course: course.id,
                grade,
                studentName: student.fullName
            };
        });

        courseMarks.forEach(mark => {
            const target = studentResultsById[mark.studentId];
            if (!target) return;

            const weight = ruleWeights[mark.assessmentType] ?? 0;
            const maxScore = mark.maxScore ?? 100;
            const percentage = maxScore > 0 ? (mark.score / maxScore) * 100 : 0;
            target.weightedTotal += (percentage * weight) / 100;
            target.total += percentage;
        });

        const results = Object.entries(studentResultsById)
            .filter(([, value]) => value.weightedTotal > 0)
            .map(([studentId, value]) => ({
                studentId,
                studentName: value.studentName,
                course: value.course,
                grade: value.grade,
                total: Math.round(value.weightedTotal * 100) / 100,
                average: Math.round(value.weightedTotal * 100) / 100,
                rank: 0,
                letterGrade: getLetterGrade(value.weightedTotal),
                status: getResultStatus(value.weightedTotal)
            }))
            .sort((a, b) => b.total - a.total);

        results.forEach((result, index) => {
            result.rank = index + 1;
        });

        for (const result of results) {
            await saveStudentResult(result);
        }
    }
};
