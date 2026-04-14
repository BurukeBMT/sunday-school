import React, { useState, useEffect } from 'react';
import {
  ref,
  query,
  get,
  orderByChild,
  equalTo,
  onValue,
  DatabaseReference,
  Query
} from 'firebase/database';
import {
  Search,
  Download,
  Filter,
  Calendar,
  BookOpen,
  User,
  Clock,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { database } from '../firebase';
import { AttendanceLog, Course, Student, DEPARTMENTS } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export const AttendanceLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [courseFilter, setCourseFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch courses for filter
    const fetchCourses = async () => {
      const coursesRef = ref(database, 'courses');
      const snap = await get(coursesRef);
      if (snap.exists()) {
        const data = snap.val();
        setCourses(Object.keys(data).map(key => ({ id: key, ...data[key] } as Course)));
      }
    };
    fetchCourses();

    // Fetch students for mapping
    const fetchStudents = async () => {
      const studentsRef = ref(database, 'students');
      const snap = await get(studentsRef);
      if (snap.exists()) {
        const data = snap.val();
        const studentMap: Record<string, Student> = {};
        Object.keys(data).forEach(key => {
          studentMap[key] = data[key] as Student;
        });
        setStudents(studentMap);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    setLoading(true);
    const logsRef = ref(database, 'attendance_logs');
    let q: DatabaseReference | Query = logsRef;

    if (dateFilter) {
      q = query(logsRef, orderByChild('date'), equalTo(dateFilter));
    }

    const unsub = onValue(q, (snap) => {
      let logData: AttendanceLog[] = [];
      if (snap.exists()) {
        const data = snap.val();
        logData = Object.keys(data).map(key => ({ id: key, ...data[key] } as AttendanceLog));
      }
      // Sort by date desc, then time desc in memory
      logData.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.time || ''));
        const dateB = new Date(b.date + ' ' + (b.time || ''));
        return dateB.getTime() - dateA.getTime();
      });
      // Limit to 100
      if (logData.length > 100) logData = logData.slice(0, 100);
      setLogs(logData);
      setLoading(false);
    });

    return () => unsub();
  }, [dateFilter]);

  const filteredLogs = logs.filter(log => {
    const matchesCourse = courseFilter === 'All' || log.courseId === courseFilter;
    const matchesDept = deptFilter === 'All' || log.department === deptFilter;
    return matchesCourse && matchesDept;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Student ID', 'Student Name', 'Course', 'Department'];
    const rows = filteredLogs.map(log => [
      log.date,
      log.time,
      log.studentId,
      students[log.studentId]?.fullName || 'Unknown',
      courses.find(c => c.id === log.courseId)?.name || 'Unknown',
      log.department
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${dateFilter}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{t.attendanceLogs}</h1>
          <p className="text-gray-500">{t.viewAndExportAttendance}</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredLogs.length === 0}
          className="flex items-center justify-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20 disabled:opacity-50"
        >
          <FileSpreadsheet size={18} /> {t.exportCsv}
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.date}</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.course}</label>
          <div className="relative">
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none appearance-none"
            >
              <option value="All">{t.allCourses}</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Department</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none appearance-none"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Time</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Student</th>
                <th className="hidden sm:table-cell px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Course</th>
                <th className="hidden md:table-cell px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Department</th>
                <th className="hidden lg:table-cell px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    No attendance records found for this selection.
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={14} />
                      <span className="font-mono text-sm">{log.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{students[log.studentId]?.fullName || 'Unknown'}</span>
                      <span className="text-[10px] font-mono text-[#5A5A40] uppercase tracking-tighter">{log.studentId}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-8 py-4">
                    <span className="text-sm text-gray-600">
                      {courses.find(c => c.id === log.courseId)?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-8 py-4">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {log.department}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-8 py-4 text-xs text-gray-400">
                    ID: {log.adminId.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
