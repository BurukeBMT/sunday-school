import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, Mail, Lock, AlertCircle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmailPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]"></div>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await loginWithEmailPassword(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password sign-in is disabled in Firebase Auth. Enable it in the Firebase console.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[32px] shadow-xl max-w-xl w-full border border-gray-100"
      >
        <div className="w-20 h-20 bg-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2 text-center">Login to Admin Portal</h1>
        <p className="text-gray-500 mb-8 text-center">Use your admin email and password or superadmin Google sign-in.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-700 flex items-start gap-3">
              <RefreshCcw size={18} />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-4 py-4 rounded-2xl border border-gray-200 bg-white text-[#5A5A40] font-bold hover:bg-gray-50 disabled:opacity-50"
        >
          Send password reset email
        </button>

        <div className="text-center my-4 text-gray-400 uppercase tracking-[0.3em] text-xs">or</div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#5A5A40] to-[#4A4A30] text-white py-4 rounded-2xl font-bold hover:from-[#4A4A30] hover:to-[#3A3A20] transition-all shadow-lg"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

        <p className="mt-6 text-xs text-gray-400 uppercase tracking-widest text-center">Authorized Personnel Only</p>
      </motion.div>
    </div>
  );
};
