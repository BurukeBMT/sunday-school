import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../firebase';

export const generateStudentId = async (): Promise<string> => {
    try {
        const studentsRef = ref(database, 'students');
        const q = query(studentsRef, orderByChild('id'), limitToLast(1));
        const snap = await get(q);
        let nextNum = 1;
        if (snap.exists()) {
            const data = snap.val();
            const lastId = Object.values(data).map((item: any) => item.id).sort().pop();
            const match = lastId?.match(/\d+$/);
            if (match) nextNum = parseInt(match[0]) + 1;
        }
        const newId = `FHST${nextNum.toString().padStart(5, '0')}`;
        return newId;
    } catch (err) {
        console.error('Error generating student ID:', err);
        // Fallback: generate with timestamp
        const timestamp = Date.now().toString().slice(-5);
        return `FHST${timestamp}`;
    }
};

export const generateParentId = async (): Promise<string> => {
    try {
        const parentsRef = ref(database, 'parents');
        const q = query(parentsRef, orderByChild('parentId'), limitToLast(1));
        const snap = await get(q);
        let nextNum = 1;
        if (snap.exists()) {
            const data = snap.val();
            const lastId = Object.values(data).map((item: any) => item.parentId).sort().pop();
            const match = lastId?.match(/\d+$/);
            if (match) nextNum = parseInt(match[0]) + 1;
        }
        const newId = `PAR${nextNum.toString().padStart(6, '0')}`;
        return newId;
    } catch (err) {
        console.error('Error generating parent ID:', err);
        // Fallback: generate with timestamp
        const timestamp = Date.now().toString().slice(-6);
        return `PAR${timestamp}`;
    }
};

export const generatePassword = (length: number = 10): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export const generateSecurePassword = (): string => {
    // Generate a password with at least one uppercase, one lowercase, one number, one special char
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    let password = '';
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));

    // Fill the rest randomly
    const allChars = upper + lower + numbers + special;
    for (let i = 4; i < 10; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};