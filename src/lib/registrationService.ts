import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';
import { ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../firebase';
import { Student, Parent } from '../types';
import { generateStudentId, generateParentId, generateSecurePassword } from './idGenerator';
import { PDFGenerator } from './PDFGenerator';
import { QRGenerator } from './QRGenerator';

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
            // Generate student ID
            const studentId = await generateStudentId();

            // Generate credentials
            const studentPassword = generateSecurePassword();
            const studentEmail = `${studentId}@school.local`;

            // Create Firebase Auth user for student
            const studentCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
            const studentUid = studentCredential.user.uid;

            // Update profile
            await updateProfile(studentCredential.user, {
                displayName: fullName
            });

            // Check if parent exists
            let parent = await this.findParentByContact(parentPhone, parentEmail);

            if (!parent) {
                // Create new parent
                parent = await this.createParent(parentPhone, parentEmail);
            }

            // Create student record
            const student: Student = {
                id: studentId,
                uid: studentUid,
                fullName,
                phone: parentPhone, // Use parent's phone
                email: parentEmail,
                department: grade, // Use grade as department for now
                grade,
                qrToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                createdAt: new Date().toISOString(),
                parentId: parent.parentId,
                username: studentId,
                passwordTemp: studentPassword
            };

            // Save student to database
            await set(ref(database, `students/${studentId}`), student);

            // Link student to parent
            await this.linkStudentToParent(parent.parentId, studentId);

            // Generate PDFs and QR codes
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

            const studentQR = await QRGenerator.generateStudentQR(studentId, studentId, studentPassword);
            const parentQR = await QRGenerator.generateParentQR(parent.parentId, parent.username, parent.passwordTemp || '');

            // Sign out to avoid auth state issues
            await signOut(auth);

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

            // First try to find by phone
            if (phone) {
                const phoneQuery = query(parentsRef, orderByChild('phone'), equalTo(phone));
                const phoneSnap = await get(phoneQuery);
                if (phoneSnap.exists()) {
                    const parents = phoneSnap.val();
                    const parentId = Object.keys(parents)[0];
                    return { parentId, ...parents[parentId] };
                }
            }

            // Then try to find by email
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

            // Create Firebase Auth user for parent
            const parentCredential = await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            const parentUid = parentCredential.user.uid;

            // Update profile
            await updateProfile(parentCredential.user, {
                displayName: `Parent of ${phone}`
            });

            const parent: Parent = {
                parentId,
                uid: parentUid,
                username: phone, // Use phone as username
                passwordTemp: parentPassword,
                linkedStudents: [],
                createdAt: new Date().toISOString(),
                phone,
                email: email || parentEmail
            };

            // Save parent to database
            await set(ref(database, `parents/${parentId}`), parent);

            return parent;
        } catch (error) {
            console.error('Error creating parent:', error);
            throw error;
        }
    }

    static async linkStudentToParent(parentId: string, studentId: string): Promise<void> {
        try {
            // Get current parent data
            const parentRef = ref(database, `parents/${parentId}`);
            const parentSnap = await get(parentRef);

            if (parentSnap.exists()) {
                const parent = parentSnap.val() as Parent;
                const linkedStudents = parent.linkedStudents || [];

                if (!linkedStudents.includes(studentId)) {
                    linkedStudents.push(studentId);
                    await update(parentRef, { linkedStudents });
                }
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

            for (const studentId of parent.linkedStudents) {
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