export type UserRole = 'superadmin' | 'admin' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  assignedCourses?: string[];
  mustResetPassword?: boolean;
}

export interface TeacherProfile {
  uid: string;
  name: string;
  assignedGrades: string[];
  assignedCourses: string[];
  mustResetPassword?: boolean;
}

export const STUDENT_ID_REGEX = /^FHST\d{5}$/;

export interface Student {
  id: string; // FHST00001
  uid?: string; // Firebase Auth UID (new)
  fullName: string;
  phone: string;
  email?: string;
  department: string;
  grade: string; // New: grade level (ክፍል 1 to ክፍል 12)
  qrToken: string;
  createdAt: string;
  parentId?: string; // New: link to parent
  username?: string; // New: auto-generated username
  passwordTemp?: string; // New: temporary password for first login
}

export interface Parent {
  parentId: string; // PAR-000001
  uid?: string; // Firebase Auth UID
  username: string; // phone number or email
  passwordTemp?: string; // temporary password
  linkedStudents: string[]; // array of student IDs
  createdAt: string;
  phone?: string;
  email?: string;
}

export interface Course {
  id: string;
  name: string;
  departments: string[]; // Changed from single department to multiple departments
  grade: string; // New: grade level this course belongs to
  assignedTeacherId: string; // New: teacher assigned to this course
  schedule?: string;
  adminIds: string[];
  attendanceStartTime?: string; // New: when attendance can start (HH:mm format)
  attendanceEndTime?: string;   // New: when attendance can end (HH:mm format)
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  department: string;
  date: string;
  time: string;
  markedBy: string;
  method?: 'qr' | 'manual';
  createdAt?: number;
}

// Grading System Types (Google Sheets Integration)
export interface GradingRule {
  course: string;
  type: string; // 'assignment', 'quiz', 'mid', 'final', etc.
  weight: number; // percentage (0-100)
}

export interface MarkEntry {
  studentId: string;
  course: string;
  type: string;
  score: number;
}

export interface StudentResult {
  studentId: string;
  course: string;
  total: number;
  rank: number;
}

// New types for advanced academic features
export interface GradeRanking {
  studentId: string;
  studentName: string;
  grade: string;
  totalScore: number;
  rank: number;
}

export interface ResultsControl {
  isPublished: boolean;
  publishedAt?: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  grade: string;
  totalScore: number;
}

export interface TranscriptData {
  studentId: string;
  studentName: string;
  grade: string;
  courses: Array<{
    courseName: string;
    score: number;
    rank: number;
  }>;
  totalAverage: number;
  overallRank: number;
}

export const GRADES = [
  'ክፍል 1', 'ክፍል 2', 'ክፍል 3', 'ክፍል 4', 'ክፍል 5', 'ክፍል 6',
  'ክፍል 7', 'ክፍል 8', 'ክፍል 9', 'ክፍል 10', 'ክፍል 11', 'ክፍል 12'
];

export const ASSESSMENT_TYPES = [
  'assignment',
  'quiz',
  'mid',
  'final',
  'project',
  'participation'
];

export const DEPARTMENTS = [
  'ደቂቀ ሕጻናት',
  'ሕጻናት',
  'አዳጊ',
  'ወጣት',
  'ሰራተኛ ጉባኤ'
];
