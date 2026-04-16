import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LogOut, ShieldX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <ShieldX className="h-8 w-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>

                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go to Dashboard
                    </button>

                    {user && (
                        <button
                            onClick={logout}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};