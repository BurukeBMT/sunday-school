import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Registration } from './components/Registration';
import { StudentList } from './components/StudentList';
import { CourseManagement } from './components/CourseManagement';
import { Scanner } from './components/Scanner';
import { AttendanceLogs } from './components/AttendanceLogs';
import { AdminManagement } from './components/AdminManagement';
import { Menu, X, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'registration': return <Registration />;
      case 'students': return <StudentList />;
      case 'courses': return <CourseManagement />;
      case 'scanner': return <Scanner />;
      case 'logs': return <AttendanceLogs />;
      case 'admins': return <AdminManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 lg:ml-72 min-h-screen p-4 lg:p-12">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ፍ/ሃ</span>
            </div>
            <h2 className="font-serif font-bold">ፍሬ ሃይማኖት</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
