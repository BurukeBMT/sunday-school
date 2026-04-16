import { database } from '../firebase';
import { ref, get, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { Assessment, Mark, StudentResult, TeacherProfile, Student } from '../types';

// Teacher Management
export const createTeacher = async (teacher: TeacherProfile): Promise<void> => {
    const teacherRef = ref(database, `teachers/${teacher.uid}`);
    await set(teacherRef, teacher);
};

export const getTeacher = async (teacherId: string): Promise<TeacherProfile | null> => {
    const teacherRef = ref(database, `teachers/${teacherId}`);
    const snapshot = await get(teacherRef);
    return snapshot.exists() ? snapshot.val() : null;
};

export const updateTeacher = async (teacherId: string, updates: Partial<TeacherProfile>): Promise<void> => {
    const teacherRef = ref(database, `teachers/${teacherId}`);
    await update(teacherRef, updates);
};

// Assessment Management
export const createAssessment = async (assessment: Omit<Assessment, 'id'>): Promise<string> => {
    const assessmentsRef = ref(database, 'assessments');
    const newAssessmentRef = push(assessmentsRef);
    const assessmentData: Assessment = {
        ...assessment,
        id: newAssessmentRef.key!,
    };
    await set(newAssessmentRef, assessmentData);
    return assessmentData.id;
};

export const getAssessmentsByCourse = async (courseId: string): Promise<Assessment[]> => {
    const assessmentsRef = ref(database, 'assessments');
    const courseQuery = query(assessmentsRef, orderByChild('courseId'), equalTo(courseId));
    const snapshot = await get(courseQuery);
    if (!snapshot.exists()) return [];

    const assessments: Assessment[] = [];
    snapshot.forEach((child) => {
        assessments.push(child.val());
    });
    return assessments;
};

export const getAssessmentsByGrade = async (grade: string): Promise<Assessment[]> => {
    const assessmentsRef = ref(database, 'assessments');
    const gradeQuery = query(assessmentsRef, orderByChild('grade'), equalTo(grade));
    const snapshot = await get(gradeQuery);
    if (!snapshot.exists()) return [];

    const assessments: Assessment[] = [];
    snapshot.forEach((child) => {
        assessments.push(child.val());
    });
    return assessments;
};

// Marks Management
export const createMark = async (mark: Omit<Mark, 'id'>): Promise<string> => {
    const marksRef = ref(database, 'marks');
    const newMarkRef = push(marksRef);
    const markData: Mark = {
        ...mark,
        id: newMarkRef.key!,
    };
    await set(newMarkRef, markData);
    return markData.id;
};

export const getMarksByAssessment = async (assessmentId: string): Promise<Mark[]> => {
    const marksRef = ref(database, 'marks');
    const assessmentQuery = query(marksRef, orderByChild('assessmentId'), equalTo(assessmentId));
    const snapshot = await get(assessmentQuery);
    if (!snapshot.exists()) return [];

    const marks: Mark[] = [];
    snapshot.forEach((child) => {
        marks.push(child.val());
    });
    return marks;
};

export const getMarksByStudent = async (studentId: string): Promise<Mark[]> => {
    const marksRef = ref(database, 'marks');
    const studentQuery = query(marksRef, orderByChild('studentId'), equalTo(studentId));
    const snapshot = await get(studentQuery);
    if (!snapshot.exists()) return [];

    const marks: Mark[] = [];
    snapshot.forEach((child) => {
        marks.push(child.val());
    });
    return marks;
};

export const updateMark = async (markId: string, score: number): Promise<void> => {
    const markRef = ref(database, `marks/${markId}`);
    await update(markRef, { score });
};

export const deleteMark = async (markId: string): Promise<void> => {
    const markRef = ref(database, `marks/${markId}`);
    await remove(markRef);
};

// Results Management
export const saveStudentResult = async (result: StudentResult): Promise<void> => {
    const resultRef = ref(database, `results/${result.studentId}`);
    await set(resultRef, result);
};

export const getStudentResult = async (studentId: string): Promise<StudentResult | null> => {
    const resultRef = ref(database, `results/${studentId}`);
    const snapshot = await get(resultRef);
    return snapshot.exists() ? snapshot.val() : null;
};

export const getResultsByGrade = async (grade: string): Promise<StudentResult[]> => {
    const resultsRef = ref(database, 'results');
    const snapshot = await get(resultsRef);
    if (!snapshot.exists()) return [];

    const results: StudentResult[] = [];
    snapshot.forEach((child) => {
        const result = child.val();
        if (result.grade === grade) {
            results.push(result);
        }
    });
    return results.sort((a, b) => a.rank - b.rank);
};

// Utility Functions
export const getStudentsByGrade = async (grade: string): Promise<Student[]> => {
    const studentsRef = ref(database, 'students');
    const gradeQuery = query(studentsRef, orderByChild('grade'), equalTo(grade));
    const snapshot = await get(gradeQuery);
    if (!snapshot.exists()) return [];

    const students: Student[] = [];
    snapshot.forEach((child) => {
        students.push(child.val());
    });
    return students;
};

export const calculateStudentResults = async (grade: string): Promise<StudentResult[]> => {
    const students = await getStudentsByGrade(grade);
    const assessments = await getAssessmentsByGrade(grade);

    const results: StudentResult[] = [];

    for (const student of students) {
        const studentMarks = await getMarksByStudent(student.id);
        const relevantMarks = studentMarks.filter(mark =>
            assessments.some(assessment => assessment.id === mark.assessmentId)
        );

        if (relevantMarks.length === 0) continue;

        const total = relevantMarks.reduce((sum, mark) => sum + mark.score, 0);
        const average = total / assessments.length;

        results.push({
            studentId: student.id,
            grade,
            total,
            average: Math.round(average * 100) / 100,
            rank: 0, // Will be set after sorting
        });
    }

    // Sort by total descending and assign ranks
    results.sort((a, b) => b.total - a.total);
    results.forEach((result, index) => {
        result.rank = index + 1;
    });

    return results;
};

export const generateResultsForGrade = async (grade: string): Promise<void> => {
    const results = await calculateStudentResults(grade);

    for (const result of results) {
        await saveStudentResult(result);
    }
};