import { ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';
import { Student, Parent } from '../types';
import { generateStudentId, generateParentId, generateSecurePassword } from './idGenerator';
import { PDFGenerator } from './PDFGenerator';
import { QRGenerator } from './QRGenerator';
import { registerStudent as registerStudentSheet } from './sheetsApi';

export interface RegistrationResult {
    student: Student;
    parent: Parent;
    studentCredentials: {
        username: string;
        password: string;
        email: string;
    };
    parentCredentials: {
        username: string;
        password: string;
        email?: string;
    };
    studentPDF: Blob;
    parentPDF: Blob;
    studentQR: string;
    parentQR: string;
}

export class RegistrationService {
    static async registerStudent(
        fullName: string,
        grade: string,
        parentPhone: string,
        parentEmail?: string
    ): Promise<RegistrationResult> {
        try {
            const studentId = await generateStudentId();
            const studentPassword = generateSecurePassword();
            const studentEmail = `${studentId}@school.local`;

            let parent = await this.findParentByContact(parentPhone, parentEmail);
            if (!parent) {
                parent = await this.createParent(parentPhone, parentEmail);
            }

            const qrToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const now = new Date();
            const date = now.toISOString().slice(0, 10);
            const time = now.toTimeString().split(' ')[0];

            const student: Student = {
                id: studentId,
                fullName,
                phone: parentPhone,
                email: parentEmail,
                department: grade,
                grade,
                qrToken,
                createdAt: now.toISOString(),
                parentId: parent.parentId,
                username: studentId,
                passwordTemp: studentPassword
            };

            await set(ref(database, `students/${studentId}`), student);
            await this.linkStudentToParent(parent.parentId, studentId);

            const sheetResult = await registerStudentSheet({
                studentId,
                fullName,
                course: grade,
                grade,
                qrToken,
                date,
                time
            });

            if (!sheetResult.success) {
                throw new Error(sheetResult.error || 'Google Sheets registration failed.');
            }

            const studentPDF = await PDFGenerator.generateStudentPDF(student, {
                username: studentId,
                password: studentPassword,
                email: studentEmail
            });

            const parentChildren = await this.getParentChildren(parent.parentId);
            const parentPDF = await PDFGenerator.generateParentPDF(parent, parentChildren, {
                username: parent.username,
                password: parent.passwordTemp || '',
                email: parent.email
            });

            const studentQR = await QRGenerator.generateStudentQR(studentId, qrToken);
            const parentQR = await QRGenerator.generateParentQR(parent.parentId, parent.passwordTemp || studentId);

            return {
                student,
                parent,
                studentCredentials: {
                    username: studentId,
                    password: studentPassword,
                    email: studentEmail
                },
                parentCredentials: {
                    username: parent.username,
                    password: parent.passwordTemp || '',
                    email: parent.email
                },
                studentPDF,
                parentPDF,
                studentQR,
                parentQR
            };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static async findParentByContact(phone: string, email?: string): Promise<Parent | null> {
        try {
            const parentsRef = ref(database, 'parents');

            if (phone) {
                const phoneQuery = query(parentsRef, orderByChild('phone'), equalTo(phone));
                const phoneSnap = await get(phoneQuery);
                if (phoneSnap.exists()) {
                    const parents = phoneSnap.val();
                    const parentId = Object.keys(parents)[0];
                    return { parentId, ...parents[parentId] };
                }
            }

            if (email) {
                const emailQuery = query(parentsRef, orderByChild('email'), equalTo(email));
                const emailSnap = await get(emailQuery);
                if (emailSnap.exists()) {
                    const parents = emailSnap.val();
                    const parentId = Object.keys(parents)[0];
                    return { parentId, ...parents[parentId] };
                }
            }

            return null;
        } catch (error) {
            console.error('Error finding parent:', error);
            return null;
        }
    }

    static async createParent(phone: string, email?: string): Promise<Parent> {
        try {
            const parentId = await generateParentId();
            const parentPassword = generateSecurePassword();
            const parentEmail = email || `${phone.replace('+', '')}@parent.local`;

            const parent: Parent = {
                parentId,
                uid: '',
                username: phone,
                passwordTemp: parentPassword,
                linkedStudents: [],
                createdAt: new Date().toISOString(),
                phone,
                email: parentEmail
            };

            await set(ref(database, `parents/${parentId}`), parent);
            return parent;
        } catch (error) {
            console.error('Error creating parent:', error);
            throw error;
        }
    }

    static async linkStudentToParent(parentId: string, studentId: string): Promise<void> {
        try {
            const parentRef = ref(database, `parents/${parentId}`);
            const parentSnap = await get(parentRef);
            if (!parentSnap.exists()) return;

            const parent = parentSnap.val() as Parent;
            const linkedStudents = parent.linkedStudents || [];
            if (!linkedStudents.includes(studentId)) {
                linkedStudents.push(studentId);
                await update(parentRef, { linkedStudents });
            }
        } catch (error) {
            console.error('Error linking student to parent:', error);
            throw error;
        }
    }

    static async getParentChildren(parentId: string): Promise<Student[]> {
        try {
            const parentRef = ref(database, `parents/${parentId}`);
            const parentSnap = await get(parentRef);
            if (!parentSnap.exists()) return [];

            const parent = parentSnap.val() as Parent;
            const children: Student[] = [];
            for (const studentId of parent.linkedStudents || []) {
                const studentRef = ref(database, `students/${studentId}`);
                const studentSnap = await get(studentRef);
                if (studentSnap.exists()) {
                    children.push(studentSnap.val() as Student);
                }
            }
            return children;
        } catch (error) {
            console.error('Error getting parent children:', error);
            return [];
        }
    }

    static async getStudentById(studentId: string): Promise<Student | null> {
        try {
            const studentRef = ref(database, `students/${studentId}`);
            const snapshot = await get(studentRef);
            if (snapshot.exists()) {
                return snapshot.val() as Student;
            }
            return null;
        } catch (error) {
            console.error('Error getting student:', error);
            return null;
        }
    }

    static async getParentById(parentId: string): Promise<Parent | null> {
        try {
            const parentRef = ref(database, `parents/${parentId}`);
            const snapshot = await get(parentRef);
            if (snapshot.exists()) {
                return snapshot.val() as Parent;
            }
            return null;
        } catch (error) {
            console.error('Error getting parent:', error);
            return null;
        }
    }
}
