import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import { UserProfile } from '../types';

export async function authGuard(): Promise<UserProfile> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error('Not authenticated');
    }

    const userRef = ref(database, 'users/' + currentUser.uid);
    const userSnap = await get(userRef);

    if (!userSnap.exists()) {
        throw new Error('User profile not found in Realtime Database');
    }

    const profile = userSnap.val() as UserProfile;
    const normalizedRole = profile.role === 'super_admin' ? 'superadmin' : profile.role;

    if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin') {
        throw new Error('User is not authorized to access admin pages');
    }

    return {
        ...profile,
        role: normalizedRole as UserProfile['role'],
    };
}
