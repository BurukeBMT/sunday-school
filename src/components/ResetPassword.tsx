import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { auth, database } from '../firebase';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!user) {
            setError('Please sign in before resetting your password.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(user, password);
            if (profile) {
                await update(ref(database, 'users/' + user.uid), {
                    mustResetPassword: false,
                });
            }
            setMessage('Password updated successfully. Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err: any) {
            setError(err.message || 'Failed to update password.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4 py-10">
            <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-lg w-full border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#5A5A40] rounded-3xl flex items-center justify-center shadow-lg">
                        <Lock className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#1a1a1a]">Reset Your Password</h1>
                        <p className="text-sm text-gray-500">Create a new secure password for your admin account.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-start gap-3">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 flex items-start gap-3">
                            <CheckCircle2 size={18} />
                            <span>{message}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50 shadow-lg"
                    >
                        {loading ? 'Updating password...' : 'Save New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
