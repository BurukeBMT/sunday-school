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
  department: string;
  schedule?: string;
  adminIds: string[];
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  courseId: string;
  department: string;
  date: string;
  time: string;
  adminId: string;
}

export const DEPARTMENTS = [
  'ደቂቀ ሕጻናት',
  'ሕጻናት',
  'አዳጊ',
  'ወጣት',
  'ሰራተኛ ጉባኤ'
];
