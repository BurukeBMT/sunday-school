export type UserRole = 'superadmin' | 'admin' | 'super_admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  assignedCourses?: string[];
  mustResetPassword?: boolean;
}

export const STUDENT_ID_REGEX = /^FHST\d{5}$/;

export interface Student {
  id: string; // FHST00001
  fullName: string;
  phone: string;
  email?: string;
  department: string;
  qrToken: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  departments: string[]; // Changed from single department to multiple departments
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

export const DEPARTMENTS = [
  'ደቂቀ ሕጻናት',
  'ሕጻናት',
  'አዳጊ',
  'ወጣት',
  'ሰራተኛ ጉባኤ'
];
