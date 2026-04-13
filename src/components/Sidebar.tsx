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
        "fixed top-0 left-0 h-full bg-[#151619] text-white w-72 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <div className="flex-shrink-0 flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg leading-tight">ፍሬ ሃይማኖት ሰ/ት/ቤት አቴንዳንስ</h2>
                <p className="text-[10px] uppercase tracking-widest text-[#8E9299]">Sunday School</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
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
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  isActive
                    ? "bg-[#5A5A40] text-white shadow-lg shadow-olive-900/20"
                    : "text-[#8E9299] hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-sm font-bold">
                {profile?.name?.[0] || profile?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
                <p className="text-[10px] text-[#8E9299] uppercase tracking-wider">
                  {profile?.role}
                </p>
              </div>
            </div>

            <div className="mb-4 px-2">
              <LanguageSelector />
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
