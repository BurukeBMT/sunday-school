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

    const drawWheatIcon = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeStyle = '#7A6A3F';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 90);
      ctx.stroke();
      const leafPositions = [-30, -18, -6, 6, 18, 30];
      leafPositions.forEach((offset, index) => {
        ctx.beginPath();
        ctx.ellipse(offset, 20 + index * 10, 12, 18, Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = '#D9B966';
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    };

    const drawGrapesIcon = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#7E2F6B';
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3 - row; col += 1) {
          ctx.beginPath();
          ctx.arc(col * 26 - row * 12, row * 30, 18, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#4A2D30';
      ctx.beginPath();
      ctx.moveTo(-26, -8);
      ctx.lineTo(0, -64);
      ctx.lineTo(10, -58);
      ctx.lineTo(-18, -14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    ctx.fillStyle = '#E6EEE3';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawRoundedRect(28, 28, canvasWidth - 56, canvasHeight - 56, 60);
    ctx.fillStyle = '#F8F3E6';
    ctx.fill();
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#5A6B4D';
    drawRoundedRect(18, 18, canvasWidth - 36, canvasHeight - 36, 72);
    ctx.stroke();

    const headerHeight = 240;
    drawRoundedRect(60, 60, canvasWidth - 120, headerHeight, 44);
    ctx.fillStyle = '#FFF8EE';
    ctx.fill();
    ctx.strokeStyle = '#C9A75C';
    ctx.lineWidth = 10;
    drawRoundedRect(60, 60, canvasWidth - 120, headerHeight, 44);
    ctx.stroke();

    ctx.fillStyle = '#3F4B2F';
    ctx.font = '800 58px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ፈረ የሕይማኖት ሰ/ቤት', canvasWidth / 2, 160);
    ctx.font = '600 40px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Fere Haymanot Sunday School', canvasWidth / 2, 212);

    ctx.strokeStyle = '#5A6B4D';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(140, 265);
    ctx.lineTo(canvasWidth - 140, 265);
    ctx.stroke();

    drawWheatIcon(130, 120, 1.3);
    drawGrapesIcon(canvasWidth - 160, 120, 1.3);

    const qrSize = 420;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = 320;
    const panelPadding = 40;

    drawRoundedRect(qrX - panelPadding, qrY - panelPadding, qrSize + panelPadding * 2, qrSize + panelPadding * 2, 42);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#C9A75C';
    ctx.lineWidth = 16;
    drawRoundedRect(qrX - panelPadding, qrY - panelPadding, qrSize + panelPadding * 2, qrSize + panelPadding * 2, 42);
    ctx.stroke();

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrUrl;
    await new Promise((resolve, reject) => {
      qrImg.onload = () => resolve(null);
      qrImg.onerror = reject;
    });
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    const textBaseY = qrY + qrSize + 94;
    ctx.fillStyle = '#312F26';
    ctx.font = '700 50px "Segoe UI", Arial, sans-serif';
    ctx.fillText(student.fullName, canvasWidth / 2, textBaseY);

    ctx.font = '600 36px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#3E3A2F';
    ctx.fillText(`Name: ${student.fullName}`, canvasWidth / 2, textBaseY + 80);
    ctx.fillText(`ID Number: ${student.id}`, canvasWidth / 2, textBaseY + 140);
    ctx.fillText(`Department: ${student.department}`, canvasWidth / 2, textBaseY + 200);
    ctx.fillText(`Phone: ${student.phone}`, canvasWidth / 2, textBaseY + 260);

    ctx.fillStyle = '#5A6B4D';
    ctx.font = '600 32px "Segoe UI", Arial, sans-serif';
    ctx.fillText('ፈረ የሕይማኖት ሰ/ቤት', canvasWidth / 2, canvasHeight - 60);

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
