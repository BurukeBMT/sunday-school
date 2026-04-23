export type UserRole = 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent';

// Enhanced permission system
export type PermissionAction = 'view_only' | 'edit_only' | 'approve_only' | 'export_only' | 'full_access';

export interface Permission {
  module: string;
  actions: PermissionAction[];
}

export interface RolePermissions {
  roleId: string;
  permissions: Permission[];
}

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
  lastLoginTime?: string;
  loginCount?: number;
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

// Apps Script Firebase Integration Types
export interface AppsScriptAttendanceLog {
  studentId: string;
  studentName: string;
  course: string; // Course name from Apps Script
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  method: 'qr';
  createdAt: number; // timestamp
}

// Real-time attendance dashboard types
export interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  lastUpdated: number;
}

export interface CourseAttendanceStats {
  courseId: string;
  courseName: string;
  totalStudents: number;
  presentCount: number;
  attendanceRate: number;
}

export interface LiveAttendanceEntry {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  time: string;
  timestamp: number;
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
  assessmentType: string;
  score: number;
  maxScore?: number;
  date?: string;
  teacherId?: string;
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

// ===== NEW PRODUCTION FEATURES INTERFACES =====

// 1. Login History & Device Tracking
export interface LoginLog {
  logId: string;
  userId: string;
  timestamp: string; // ISO 8601
  ipAddress: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

// 2. Attendance Correction System
export interface AttendanceCorrection {
  requestId: string;
  studentId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  oldStatus: 'present' | 'absent';
  newStatus: 'present' | 'absent';
  reason: string;
  requestedBy: string; // User ID
  requestedAt: string; // ISO 8601
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Superadmin ID
  reviewedAt?: string; // ISO 8601
  reviewNotes?: string;
}

// 3. Absence Alert System
export interface AbsenceAlert {
  alertId: string;
  studentId: string;
  type: 'warning' | 'critical'; // 2 absences = warning, 3+ = critical
  consecutiveAbsences: number;
  courseId?: string;
  reason: string;
  createdAt: string; // ISO 8601
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// 4. Auto Reports System
export interface WeeklyReport {
  reportId: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  generatedAt: string; // ISO 8601
  totalStudents: number;
  totalAttendance: number;
  attendancePercentage: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    attendanceRate: number;
  }>;
  lowPerformers: Array<{
    studentId: string;
    studentName: string;
    absences: number;
  }>;
  courseBreakdown: Array<{
    courseId: string;
    courseName: string;
    attendanceRate: number;
  }>;
}

export interface MonthlyReport {
  reportId: string;
  month: string; // YYYY-MM
  generatedAt: string; // ISO 8601
  totalStudents: number;
  averageAttendance: number;
  gradePerformance: Array<{
    grade: string;
    averageScore: number;
    attendanceRate: number;
  }>;
  teacherPerformance: Array<{
    teacherId: string;
    teacherName: string;
    coursesCount: number;
    averageAttendance: number;
  }>;
}

// 5. Student Academic Timeline
export interface TimelineEntry {
  entryId: string;
  studentId: string;
  type: 'attendance' | 'grade' | 'course_enrollment' | 'status_change';
  timestamp: string; // ISO 8601
  details: {
    courseId?: string;
    courseName?: string;
    grade?: string;
    score?: number;
    status?: string;
    attendanceStatus?: 'present' | 'absent';
    notes?: string;
  };
}

// 6. Backup & Restore System
export interface BackupMetadata {
  backupId: string;
  timestamp: string; // ISO 8601
  createdBy: string; // User ID
  type: 'auto' | 'manual';
  size: number; // bytes
  recordCount: {
    students: number;
    attendance_logs: number;
    courses: number;
    users: number;
    parents: number;
  };
  downloadUrl?: string; // Firebase Storage URL
  status: 'completed' | 'failed' | 'in_progress';
  checksum?: string; // For integrity verification
}

// 7. Teacher Performance Tracking
export interface TeacherMetrics {
  teacherId: string;
  period: string; // 'weekly' | 'monthly' | 'yearly'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  metrics: {
    totalAttendanceMarked: number;
    uniqueStudentsMarked: number;
    coursesManaged: number;
    averageClassAttendance: number;
    attendanceEfficiency: number; // attendance marked / total possible
    lastActivity: string; // ISO 8601
  };
}

// 8. Academic Calendar System
export interface CalendarEvent {
  eventId: string;
  title: string;
  type: 'class' | 'holiday' | 'exam' | 'event' | 'lock_period';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  courseId?: string; // For class events
  description?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  createdBy: string;
  createdAt: string; // ISO 8601
  isActive: boolean;
}

export interface AcademicCalendar {
  calendarId: string;
  academicYear: string; // e.g., "2024-2025"
  events: CalendarEvent[];
  holidays: string[]; // Array of YYYY-MM-DD dates
  examPeriods: Array<{
    name: string;
    startDate: string;
    endDate: string;
  }>;
  attendanceLockDates: string[]; // Dates when attendance cannot be modified
}

// 9. Activity Log (Enhanced)
export interface ActivityLog {
  id: string;
  timestamp: string; // ISO 8601 format
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
  category: 'authentication' | 'data_modification' | 'system' | 'access' | 'export' | 'attendance' | 'grading';
}

// 10. System Configuration
export interface SystemConfig {
  configId: string;
  absenceAlertThresholds: {
    warning: number; // 2
    critical: number; // 3
  };
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  reportAutoGeneration: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number; // minutes
  updatedBy: string;
  updatedAt: string; // ISO 8601
}
