import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">ፍሬ ሃይማኖት ሰ/ት/ቤት</h1>
        <p className="text-gray-500 mb-8 italic">Attendance Management System</p>
        
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20"
        >
          <LogIn size={20} />
          Login with Google
        </button>
        
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};
