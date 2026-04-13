import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { db } from '../firebase';
import { Student, AttendanceLog, DEPARTMENTS } from '../types';
import { format, subDays, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    absenteeAlerts: 0,
    activeCourses: 0
  });
  const [deptData, setDeptData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Real-time stats
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStats(prev => ({ ...prev, totalStudents: snap.size }));

      const counts = DEPARTMENTS.map(dept => ({
        name: dept,
        value: snap.docs.filter(d => d.data().department === dept).length
      }));
      setDeptData(counts);
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const unsubToday = onSnapshot(
      query(collection(db, 'attendance_logs'), where('date', '==', today)),
      (snap) => {
        setStats(prev => ({ ...prev, todayAttendance: snap.size }));
      }
    );

    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      setStats(prev => ({ ...prev, activeCourses: snap.size }));
    });

    // Recent logs
    const unsubLogs = onSnapshot(
      query(collection(db, 'attendance_logs'), orderBy('date', 'desc'), orderBy('time', 'desc'), limit(5)),
      (snap) => {
        setRecentLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceLog)));
      }
    );

    // Daily trends (last 7 days)
    const fetchTrends = async () => {
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const q = query(collection(db, 'attendance_logs'), where('date', '==', date));
        const snap = await getDocs(q);
        trends.push({ date: format(subDays(new Date(), i), 'MMM dd'), count: snap.size });
      }
      setDailyData(trends);
    };
    fetchTrends();

    return () => {
      unsubStudents();
      unsubToday();
      unsubCourses();
      unsubLogs();
    };
  }, []);

  const COLORS = ['#5A5A40', '#8E9299', '#D1D1D1', '#A3A380', '#151619'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{t.dashboardOverview}</h1>
        <p className="text-gray-500">{t.welcomeBack}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.totalStudents, value: stats.totalStudents, icon: Users, color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200/50' },
          { label: t.todayAttendance, value: stats.todayAttendance, icon: CheckCircle, color: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200/50' },
          { label: t.activeCourses, value: stats.activeCourses, icon: Calendar, color: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200/50' },
          { label: t.absenceAlerts, value: stats.absenteeAlerts, icon: AlertTriangle, color: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-200/50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <stat.icon size={80} className="text-current" />
            </div>

            <div className="relative flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border", stat.color)}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a1a] group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <TrendingUp size={128} className="text-gray-300" />
          </div>

          <div className="relative flex items-center justify-between mb-8">
            <h3 className="font-serif font-bold text-xl text-[#1a1a1a]">{t.attendanceTrends}</h3>
            <span className="text-xs font-bold text-green-600 bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
              <TrendingUp size={14} className="inline mr-1" /> {t.thisWeek}
            </span>
          </div>
          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E9299' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E9299' }} />
                <Tooltip
                  cursor={{ fill: '#f5f5f0' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="count" fill="#5A5A40" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <Users size={96} className="text-gray-300" />
          </div>

          <h3 className="relative font-serif font-bold text-xl mb-8 text-[#1a1a1a]">{t.departmentDistribution}</h3>
          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {deptData.map((dept, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-700 font-medium">{dept.name}</span>
                </div>
                <span className="font-bold text-[#1a1a1a] bg-white px-3 py-1 rounded-full shadow-sm">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
