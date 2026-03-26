import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  where, 
  deleteDoc, 
  doc,
  onSnapshot
} from 'firebase/firestore';
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
import { db } from '../firebase';
import { Student, DEPARTMENTS } from '../types';
import { cn } from '../lib/utils';
import QRCode from 'qrcode';

export const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'students'), orderBy('createdAt', 'desc')),
      (snap) => {
        setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
        setLoading(false);
      }
    );
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
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    const url = await QRCode.toDataURL(qrData, { width: 400, margin: 2 });
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${student.id.replace(/\//g, '_')}.png`;
    link.click();
  };

  const downloadBulkQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/bulk-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: filteredStudents.map(s => ({ id: s.id, fullName: s.fullName, qrToken: s.qrToken })) })
      });
      
      if (!response.ok) throw new Error('Failed to generate ZIP');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_qrs_${format(new Date(), 'yyyyMMdd')}.zip`;
      link.click();
    } catch (err) {
      alert('Failed to download bulk QRs. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteDoc(doc(db, 'students', id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Student Directory</h1>
          <p className="text-gray-500">Manage and view all registered students</p>
        </div>
        <button 
          onClick={downloadBulkQR}
          disabled={downloading || filteredStudents.length === 0}
          className="flex items-center justify-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="animate-spin" size={18} /> : <FileArchive size={18} />}
          Download Bulk QRs ({filteredStudents.length})
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, ID, or phone..."
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
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-bottom border-gray-100">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Student ID</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Department</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Phone</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400">
                    No students found matching your criteria.
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
                        title="Download QR"
                      >
                        <QrCode size={18} />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Student"
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

function format(date: Date, pattern: string) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return pattern.replace('yyyy', String(y)).replace('MM', m).replace('dd', d);
}
