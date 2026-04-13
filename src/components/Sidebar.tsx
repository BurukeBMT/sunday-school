import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  QrCode,
  LogOut,
  ClipboardList,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { profile, user, logout } = useAuth();
  const { t } = useLanguage();
  const SUPER_ADMIN_EMAIL = 'burukmaedot16@gmail.com';
  const isSuperAdmin = profile?.role === 'superadmin' || user?.email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL;

  const menuItems = [
    { path: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { path: '/registration', label: t.registration, icon: UserPlus, hidden: !isSuperAdmin },
    { path: '/students', label: t.students, icon: Users, hidden: !isSuperAdmin },
    { path: '/courses', label: t.courses, icon: BookOpen, hidden: !isSuperAdmin },
    { path: '/admins', label: t.admins, icon: ShieldCheck, hidden: !isSuperAdmin },
    { path: '/scanner', label: t.scanner, icon: QrCode },
    { path: '/attendance', label: t.logs, icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white w-72 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-700/50",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-40 left-10 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full"></div>
        </div>

        <div className="relative p-8 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="flex-shrink-0 flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5A5A40] to-[#4A4A30] rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg leading-tight text-white drop-shadow-sm">ፍሬ ሃይማኖት ሰ/ት/ቤት</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">አቴንዳንስ ስርዓት</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 min-h-0">
            {menuItems.filter(item => !item.hidden).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-left relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-[#5A5A40] to-[#4A4A30] text-white shadow-lg shadow-olive-900/20"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <item.icon size={20} className="transition-transform group-hover:scale-110 relative z-10" />
                <span className="font-medium relative z-10">{item.label}</span>
                {({ isActive }) => isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-700/50 flex-shrink-0">
            {/* User Profile Section */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5A5A40] to-[#4A4A30] rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
                  {profile?.name?.[0] || profile?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{profile?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {profile?.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="mb-4 px-2">
              <LanguageSelector />
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all duration-200 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
