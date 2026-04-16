import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { InstallPrompt } from './components/InstallPrompt';
import { AppRoutes } from './routes/AppRoutes';
import { Menu, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 lg:ml-72 min-h-screen p-4 lg:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#5A5A40] via-[#6A6A50] to-[#5A5A40] p-6 rounded-3xl shadow-xl border border-white/20 backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/20 rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <img src="/logo.jpg" alt="Fre-Haymanot logo" className="w-8 h-8 rounded-xl object-cover shadow-md" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h2 className="font-serif font-bold text-white text-lg leading-tight drop-shadow-sm">
                    ፍሬ ሃይማኖት ሰ/ት/ቤት
                  </h2>
                  <p className="text-white/80 text-sm font-medium">አቴንዳንስ ስርዓት</p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="group relative p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Menu size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <AppRoutes />
        </div>
      </main>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
