export type UserRole = 'super_admin' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  assignedCourses?: string[];
}

export interface Student {
  id: string; // ፍ_ሃ_ሰ_ት_00001
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
