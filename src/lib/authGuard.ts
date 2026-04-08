import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export async function authGuard(): Promise<UserProfile> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error('Not authenticated');
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User profile not found in Firestore');
    }

    const profile = userDoc.data() as UserProfile;
    const normalizedRole = profile.role === 'super_admin' ? 'superadmin' : profile.role;

    if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin') {
        throw new Error('User is not authorized to access admin pages');
    }

    return {
        ...profile,
        role: normalizedRole as UserProfile['role'],
    };
}
