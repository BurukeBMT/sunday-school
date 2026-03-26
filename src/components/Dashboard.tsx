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
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back to Fre Haimanot Attendance System</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Today Attendance', value: stats.todayAttendance, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Active Courses', value: stats.activeCourses, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
          { label: 'Absence Alerts', value: stats.absenteeAlerts, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif font-bold text-xl">Attendance Trends</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={14} /> +12% this week
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#5A5A40" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-serif font-bold text-xl mb-8">By Department</h3>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deptData.map((dept, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{dept.name}</span>
                </div>
                <span className="font-bold">{dept.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
