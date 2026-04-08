import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4 py-12">
            <div className="max-w-xl w-full bg-white rounded-[32px] border border-gray-100 shadow-xl p-10 text-center">
                <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <AlertCircle size={36} />
                </div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-4">Access denied</h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    Access denied. Contact administrator.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        <ArrowLeft size={16} /> Back to home
                    </button>
                    {user && (
                        <button
                            onClick={logout}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5A5A40] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A4A30] transition"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
