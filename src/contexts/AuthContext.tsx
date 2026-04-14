import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, push, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../firebase';
import { UserProfile } from '../types';
import { findLocalAdminByEmail } from '../lib/adminStore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Special superadmin check - if this is the superadmin email, always ensure they have access
        const superAdminEmail = 'burukmaedot16@gmail.com';
        const isSuperAdminEmail = user.email?.trim().toLowerCase() === superAdminEmail;

        if (isSuperAdminEmail) {
          const superAdminProfile: UserProfile = {
            uid: user.uid,
            email: user.email!.trim().toLowerCase(),
            role: 'superadmin',
            name: user.displayName || '',
            assignedCourses: []
          };

          try {
            const userRef = ref(database, 'users/' + user.uid);
            await set(userRef, superAdminProfile);
          } catch (error) {
            console.warn('Could not persist superadmin profile to Realtime Database:', error);
          }

          setProfile(superAdminProfile);
          setLoading(false);
          return;
        }

        // First try to get profile by real UID
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const profile = snapshot.val() as UserProfile;
          const normalizedRole = profile.role === 'super_admin' ? 'superadmin' : profile.role;

          if (normalizedRole === 'admin' || normalizedRole === 'superadmin') {
            setProfile({
              ...profile,
              role: normalizedRole as UserProfile['role'],
            });
          } else {
            setProfile(null);
          }
        } else {
          const userEmail = user.email?.trim().toLowerCase();

          // First, try to resolve a local admin record if Realtime Database is not used for admin storage.
          const localAdmin = userEmail ? findLocalAdminByEmail(userEmail) : undefined;
          if (localAdmin) {
            setProfile({
              uid: user.uid,
              email: userEmail || '',
              role: 'admin',
              name: user.displayName || localAdmin.name,
              assignedCourses: []
            });
            setLoading(false);
            return;
          }

          // Check if there's an admin record with this email (created via AdminManagement)
          const usersRef = ref(database, 'users');
          const emailQuery = query(usersRef, orderByChild('email'), equalTo(userEmail));
          const querySnap = await get(emailQuery);

          if (querySnap.exists()) {
            const users = querySnap.val();
            const adminKey = Object.keys(users).find(key => users[key].role === 'admin');
            if (adminKey) {
              const adminData = users[adminKey] as UserProfile;

              // Update the admin record with the real Firebase Auth UID
              const updatedProfile: UserProfile = {
                ...adminData,
                uid: user.uid,
                name: user.displayName || adminData.name
              };

              await set(userRef, updatedProfile);
              await remove(ref(database, 'users/' + adminKey)); // Remove the old record

              setProfile(updatedProfile);
              setLoading(false);
              return;
            }
          }

          setProfile(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    await signInWithPopup(auth, provider);
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithEmailPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
