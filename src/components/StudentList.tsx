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
import JSZip from 'jszip';
import { format } from 'date-fns';

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

  const renderIdCardImage = async (student: Student, qrUrl: string): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const canvasWidth = 1500;
    const canvasHeight = 950;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.fillStyle = '#FCF9F2';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    try {
      const template = new Image();
      template.crossOrigin = 'anonymous';
      template.src = '/logo.jpg';
      await new Promise((resolve, reject) => {
        template.onload = () => resolve(null);
        template.onerror = reject;
      });
      ctx.drawImage(template, 0, 0, canvasWidth, canvasHeight);
    } catch {
      ctx.fillStyle = '#FCF9F2';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    const qrSize = 420;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = 220;
    const panelPadding = 48;

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    drawRoundedRect(qrX - panelPadding, qrY - panelPadding, qrSize + panelPadding * 2, qrSize + panelPadding * 2, 36);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.strokeStyle = '#CBA64E';
    ctx.lineWidth = 14;
    drawRoundedRect(qrX - panelPadding, qrY - panelPadding, qrSize + panelPadding * 2, qrSize + panelPadding * 2, 36);
    ctx.stroke();

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrUrl;
    await new Promise((resolve, reject) => {
      qrImg.onload = () => resolve(null);
      qrImg.onerror = reject;
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    const textBaseY = qrY + qrSize + 96;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F1917';
    ctx.font = '700 54px Arial';
    ctx.fillText(student.fullName, canvasWidth / 2, textBaseY);

    ctx.font = '500 38px Arial';
    ctx.fillStyle = '#1C1C1C';
    ctx.fillText(`ID Number: ${student.id}`, canvasWidth / 2, textBaseY + 72);
    ctx.fillText(`Department: ${student.department}`, canvasWidth / 2, textBaseY + 128);
    ctx.fillText(`Phone: ${student.phone}`, canvasWidth / 2, textBaseY + 184);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to create image'));
        resolve(blob);
      }, 'image/png');
    });
  };

  const downloadSingleQR = async (student: Student) => {
    const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 512, margin: 1 });
    const blob = await renderIdCardImage(student, qrUrl);
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
        const qrData = JSON.stringify({ id: student.id, token: student.qrToken });
        const qrUrl = await QRCode.toDataURL(qrData, { width: 512, margin: 1 });
        const blob = await renderIdCardImage(student, qrUrl);
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
          Download Bulk IDs ({filteredStudents.length})
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
