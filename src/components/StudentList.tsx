import React, { useState, useEffect } from 'react';
import {
  ref,
  query,
  get,
  orderByChild,
  remove,
  onValue
} from 'firebase/database';
import {
  Search,
  Download,
  Trash2,
  QrCode,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileArchive
} from 'lucide-react';
import { database } from '../firebase';
import { Student, DEPARTMENTS } from '../types';
import { cn } from '../lib/utils';
import JSZip from 'jszip';
import { printIdCard } from '../lib/printIdCard';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [downloading, setDownloading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const studentsRef = ref(database, 'students');
    const unsub = onValue(studentsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const studentList = Object.keys(data).map(key => ({ id: key, ...data[key] } as Student));
        // Sort by createdAt desc
        studentList.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        setStudents(studentList);
      } else {
        setStudents([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });



  const downloadSingleQR = async (student: Student) => {
    const blob = await printIdCard(student);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SundaySchool_ID_${student.id.replace(/\//g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadBulkQR = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const student of filteredStudents) {
        const blob = await printIdCard(student);
        zip.file(`SundaySchool_ID_${student.id.replace(/\//g, '_')}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sunday_school_ids_${format(new Date(), 'yyyyMMdd')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download bulk IDs. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await remove(ref(database, 'students/' + id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{t.students}</h1>
          <p className="text-gray-500">{t.manageStudents}</p>
        </div>
        <button
          onClick={downloadBulkQR}
          disabled={downloading || filteredStudents.length === 0}
          className="flex items-center justify-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="animate-spin" size={18} /> : <FileArchive size={18} />}
          {t.downloadBulkIds} ({filteredStudents.length})
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t.searchByNameIdPhone}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10"
          >
            <option value="All">{t.allDepartments}</option>
            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            {t.loading}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
            {t.noStudentsFound}
          </div>
        ) : filteredStudents.map((student) => (
          <div key={student.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5A5A40] to-[#4A4A30] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                  {student.fullName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1a1a1a]">{student.fullName}</h3>
                  <p className="text-sm text-gray-500">{student.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSingleQR(student)}
                  className="p-3 text-olive-600 hover:bg-olive-50 rounded-2xl transition-colors shadow-sm"
                  title={t.downloadQr}
                >
                  <QrCode size={18} />
                </button>
                <button
                  onClick={() => deleteStudent(student.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors shadow-sm"
                  title={t.deleteStudent}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.department}</p>
                <span className="px-3 py-1 rounded-full bg-white text-gray-700 text-xs font-medium shadow-sm">
                  {student.department}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t.phone}</p>
                <p className="font-medium text-gray-900">{student.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t.studentId}</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t.fullName}</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t.department}</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">{t.phone}</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    {t.loading}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    {t.noStudentsFound}
                  </td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4 font-mono font-bold text-[#5A5A40]">{student.id}</td>
                  <td className="px-8 py-4 font-medium text-gray-900">{student.fullName}</td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-gray-500">{student.phone}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => downloadSingleQR(student)}
                        className="p-2 text-olive-600 hover:bg-olive-50 rounded-lg transition-colors"
                        title={t.downloadQr}
                      >
                        <QrCode size={18} />
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.deleteStudent}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
