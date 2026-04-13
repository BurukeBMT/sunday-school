import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot,
  where
} from 'firebase/firestore';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  User,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { db } from '../firebase';
import { UserProfile, DEPARTMENTS } from '../types';
import { cn } from '../lib/utils';

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'users'), where('role', '==', 'admin')), (snap) => {
      setAdmins(snap.docs.map(d => d.data() as UserProfile));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setError('Email and name are required.');
      setLoading(false);
      return;
    }

    try {
      // Generate a temporary UID for the admin record
      const tempUid = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const newAdmin: UserProfile = {
        uid: tempUid,
        email: newAdminEmail.trim(),
        role: 'admin',
        name: newAdminName.trim(),
        assignedCourses: []
      };

      await setDoc(doc(db, 'users', tempUid), newAdmin);
      setIsModalOpen(false);
      setNewAdminEmail('');
      setNewAdminName('');
    } catch (err) {
      setError('Failed to add admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (uid: string) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Admin Management</h1>
          <p className="text-gray-500">Manage system administrators and their access</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20"
        >
          <Plus size={20} /> Add Admin
        </button>
      </header>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-bottom border-gray-100">
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
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    admin.uid.startsWith('admin_') ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
                  )}>
                    {admin.uid.startsWith('admin_') ? 'Pending Login' : 'Active'}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button
                    onClick={() => deleteAdmin(admin.uid)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold">Add New Admin</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-8 space-y-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                Enter the admin's email and name. They will be able to sign in with Google authentication using this email.
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    value={newAdminName}
                    onChange={e => setNewAdminName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                    placeholder="Admin Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="email"
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
