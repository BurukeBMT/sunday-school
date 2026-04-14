import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Mail,
  Lock,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { auth, database } from '../firebase';
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  set,
  update,
  remove,
  push
} from 'firebase/database';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

const SUPER_ADMIN_EMAIL = 'burukmaedot16@gmail.com';

const deriveNameFromEmail = (email: string) => {
  const local = email.split('@')[0] || '';
  return local
    .replace(/[._+]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [derivedName, setDerivedName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const adminsRef = ref(database, 'users');
    const adminsQuery = query(adminsRef, orderByChild('role'), equalTo('admin'));
    const unsubscribe = onValue(adminsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adminList = Object.keys(data).map(key => ({ ...data[key], uid: key }));
        setAdmins(adminList);
      } else {
        setAdmins([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailChange = (value: string) => {
    const normalizedEmail = value.trim().toLowerCase();
    setNewAdminEmail(normalizedEmail);
    setDerivedName(deriveNameFromEmail(normalizedEmail));
  };

  const restoreSuperAdmin = async () => {
    try {
      await signOut(auth);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account', login_hint: SUPER_ADMIN_EMAIL });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Failed to restore superadmin session:', error);
      throw error;
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const emailValue = newAdminEmail.trim().toLowerCase();
    const passwordValue = newAdminPassword.trim();

    if (!emailValue || !passwordValue) {
      setError('Email and password are required.');
      return;
    }

    if (passwordValue.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      if (!credential.user) {
        throw new Error('Failed to create admin user.');
      }

      const finalName = derivedName || deriveNameFromEmail(emailValue);
      await updateProfile(credential.user, { displayName: finalName });

      const userProfile: UserProfile = {
        uid: credential.user.uid,
        email: emailValue,
        role: 'admin',
        name: finalName,
        assignedCourses: [],
        mustResetPassword: true,
      };

      await set(ref(database, 'users/' + credential.user.uid), userProfile);
      await restoreSuperAdmin();

      setInfo('Admin created successfully. The admin must sign in and reset their password.');
      setIsModalOpen(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setDerivedName('');
    } catch (err: any) {
      console.error('Add admin error:', err);
      setError(err.message || 'Failed to add admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (admin: UserProfile) => {
    if (!window.confirm(`Remove ${admin.email} from admin access?`)) return;
    try {
      await remove(ref(database, 'users/' + admin.uid));
      setInfo('Admin access removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove admin access.');
    }
  };

  const handleResetPassword = async (admin: UserProfile) => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, admin.email);
      await update(ref(database, 'users/' + admin.uid), { mustResetPassword: true });
      setInfo(`Reset email sent to ${admin.email}`);
    } catch (err: any) {
      console.error('Reset admin password error:', err);
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Admin Management</h1>
          <p className="text-gray-500">Create admins using email/password and manage their access.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20"
        >
          <Plus size={20} /> Add Admin
        </button>
      </header>

      {(error || info) && (
        <div className={`rounded-3xl p-4 text-sm ${error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {error || info}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-gray-400">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Loading admins...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-gray-400">
                  No admins found.
                </td>
              </tr>
            ) : admins.map((admin) => (
              <tr key={admin.uid} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-olive-50 text-olive-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {admin.name?.[0] || admin.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{admin.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-gray-500">{admin.email}</td>
                <td className="px-8 py-4">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
                    admin.mustResetPassword ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-600'
                  )}>
                    {admin.mustResetPassword ? 'Reset required' : 'Active'}
                  </span>
                </td>
                <td className="px-8 py-4 text-right flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleResetPassword(admin)}
                    className="px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-all"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleRemoveAdmin(admin)}
                    className="px-4 py-2 rounded-2xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all"
                  >
                    Remove Access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold">Create Admin</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-8 space-y-6">
              <div className="rounded-3xl border border-olive-100 bg-olive-50 p-4 text-sm text-olive-700">
                Enter the new admin's email and password. The name will be derived automatically from the email.
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={newAdminEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none"
                      placeholder="Enter temporary password"
                    />
                  </div>
                </div>

                {derivedName && (
                  <div className="rounded-2xl bg-white border border-gray-100 p-4 text-sm text-gray-700">
                    Admin name will be: <span className="font-semibold">{derivedName}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm flex items-center gap-3">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50"
              >
                {loading ? 'Creating admin...' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
