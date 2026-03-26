import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
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
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const p = docSnap.data() as UserProfile;
          console.log('User profile found:', p);
          setProfile(p);
        } else {
          // Check if there's a pending admin profile with this email
          const q = query(collection(db, 'users'), where('email', '==', user.email), where('role', '==', 'admin'));
          const querySnap = await getDocs(q);
          
          if (!querySnap.empty) {
            const pendingDoc = querySnap.docs[0];
            const pendingData = pendingDoc.data() as UserProfile;
            
            // Create real profile and delete pending one
            const newProfile: UserProfile = {
              ...pendingData,
              uid: user.uid,
              name: user.displayName || pendingData.name
            };
            
            await setDoc(docRef, newProfile);
            await deleteDoc(pendingDoc.ref);
            setProfile(newProfile);
          } else {
            // Default profile for first-time login (Super Admin check)
            const isSuperAdmin = user.email === 'burukmaedot16@gmail.com';
            console.log('Creating new profile. Super Admin:', isSuperAdmin);
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              role: isSuperAdmin ? 'super_admin' : 'admin',
              name: user.displayName || '',
              assignedCourses: []
            };
            try {
              await setDoc(docRef, newProfile);
              console.log('Profile created successfully');
              setProfile(newProfile);
            } catch (err) {
              console.error('Failed to create profile in Firestore:', err);
              // Fallback to local profile so UI works for super admin email
              setProfile(newProfile);
            }
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
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
