import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Copy,
  Loader2
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit, setDoc, doc } from 'firebase/firestore';
import { parse } from 'csv-parse/browser/esm';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { DEPARTMENTS, Student } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export const Registration: React.FC = () => {
  const { profile } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', department: DEPARTMENTS[0] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ total: number, success: number, errors: string[] } | null>(null);

  const generateStudentId = async () => {
    try {
      console.log('Generating student ID... Current profile:', profile);
      const q = query(collection(db, 'students'), orderBy('id', 'desc'), limit(1));
      const snap = await getDocs(q);
      console.log('Student ID query snap empty:', snap.empty);
      let nextNum = 1;
      if (!snap.empty) {
        const lastId = snap.docs[0].data().id;
        console.log('Last student ID found:', lastId);
        const match = lastId.match(/\d+$/);
        if (match) nextNum = parseInt(match[0]) + 1;
      }
      const newId = `ፍ-ሃ-ሰ-ት-${nextNum.toString().padStart(5, '0')}`;
      console.log('Generated new ID:', newId);
      return newId;
    } catch (err) {
      console.error('Error in generateStudentId:', err);
      handleFirestoreError(err, OperationType.LIST, 'students');
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Starting registration... Profile:', profile);
      const studentId = await generateStudentId();
      if (!studentId) throw new Error('Failed to generate student ID');

      const qrToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const student: Student = {
        id: studentId,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        department: form.department,
        qrToken,
        createdAt: new Date().toISOString()
      };

      console.log('Registering student:', student);
      try {
        await setDoc(doc(db, 'students', studentId), student);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `students/${studentId}`);
      }
      console.log('Student registered successfully');
      setSuccess(student);
      setForm({ fullName: '', phone: '', email: '', department: DEPARTMENTS[0] });
    } catch (err: any) {
      console.error('Registration error details:', err);
      let message = 'Failed to register student. Please try again.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error.includes('insufficient permissions')) {
          message = `Permission denied. Your role is ${profile?.role || 'unknown'}. You must be a Super Admin to register students.`;
        }
      } catch (e) { }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setBulkResults(null);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = (event.target?.result as string) || '';
      const hasTabs = csvData.includes('\t');
      const hasCommas = csvData.includes(',');
      const delimiter = hasTabs && !hasCommas ? '\t' : ',';

      parse(csvData, { columns: true, skip_empty_lines: true, delimiter }, async (err, records) => {
        if (err) {
          setError('Invalid CSV format');
          setLoading(false);
          return;
        }

        // Get max ID once
        let maxNum = 0;
        try {
          const q = query(collection(db, 'students'), orderBy('id', 'desc'), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const lastId = snap.docs[0].data().id as string;
            const match = lastId.match(/\d+$/);
            if (match) maxNum = parseInt(match[0]);
          }
        } catch (e) {
          console.error('Bulk max ID error:', e);
        }

        let successCount = 0;
        const errors: string[] = [];

        for (let index = 0; index < records.length; index++) {
          const record = records[index] as Record<string, unknown>;

          const normalizedRecord: Record<string, string> = {};
          Object.entries(record).forEach(([key, value]) => {
            if (!key) return;
            const normalizedKey = key.toString().trim().toLowerCase();
            if (value !== undefined && value !== null) {
              normalizedRecord[normalizedKey] = value.toString().trim();
            }
          });

          const fullName = normalizedRecord['full name'] || normalizedRecord['fullname'] || normalizedRecord['name'] || normalizedRecord['ሙሉ ስም'] || '';
          const phone = normalizedRecord['phone'] || normalizedRecord['phone number'] || normalizedRecord['ስልክ'] || '';
          const email = normalizedRecord['email'] || normalizedRecord['email address'] || '';
          let department = normalizedRecord['department'] || normalizedRecord['ምድብ'] || '';
          if (!department || !DEPARTMENTS.includes(department)) department = DEPARTMENTS[0];

          if (!fullName || !phone) {
            errors.push(`Row ${index + 1}: missing required fields (Full Name and Phone are required).`);
            continue;
          }

          try {
            maxNum++; // Sequential
            const studentId = `ፍ-ሃ-ሰ-ት-${maxNum.toString().padStart(5, '0')}`;
            const qrToken = Math.random().toString(36).substring(2, 15);
            const student: Student = {
              id: studentId,
              fullName,
              phone,
              email,
              department,
              qrToken,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'students', studentId), student);
            successCount++;
          } catch (err: any) {
            const rowName = fullName || 'Unknown';
            const errMessage = err instanceof Error ? err.message : String(err);
            errors.push(`Row ${index + 1} (${rowName}): ${errMessage}`);
          }
        }

        setBulkResults({ total: records.length, success: successCount, errors });
        setLoading(false);
      });
    };
    reader.readAsText(file);
  };

  const downloadQR = async (student: Student) => {
    const { id, fullName, phone, department, qrToken } = student;
    const qrData = JSON.stringify({ id, token: qrToken });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 256, margin: 1 });

    const pdf = new jsPDF({ unit: 'mm', format: [85.6, 53.98] }); // Standard ID size

    // Logo bg - fetch base64
    try {
      const logoRes = await fetch('/logo.jpg');
      const logoBlob = await logoRes.blob();
      const logoReader = new FileReader();
      logoReader.readAsDataURL(logoBlob);
      await new Promise(resolve => {
        logoReader.onload = () => {
          pdf.addImage(logoReader.result as string, 'JPEG', 2, 2, 81.6, 49.98, undefined, 'FAST');
          resolve(null);
        };
      });
    } catch (e) {
      // Fallback bg gradient if logo fail
      pdf.setFillColor(245, 245, 220);
      pdf.rect(0, 0, 85.6, 53.98, 'F');
    }

    // Interactive bg pattern (lines for printable texture)
    pdf.setDrawColor(220, 220, 200);
    for (let i = 0; i < 85.6; i += 5) {
      pdf.line(i, 0, i, 53.98);
    }

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(26, 26, 26);
    pdf.text('Sunday School ID Card', 42.8, 7, { align: 'center' });

    // Student ID field label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('STUDENT ID', 42.8, 12, { align: 'center' });

    // ID big mono
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(26, 26, 26);
    pdf.text(id, 42.8, 16, { align: 'center' });

    // Full Name field label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('FULL NAME', 42.8, 20.5, { align: 'center' });

    // Name (wrapped)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(26, 26, 26);
    const nameLines = pdf.splitTextToSize(fullName, 70);
    pdf.text(nameLines, 42.8, 24, { align: 'center' });

    // Department and Phone
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`${department} | ${phone}`, 42.8, 29.5, { align: 'center' });

    // QR Code label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('SCAN QR CODE', 42.8, 34.5, { align: 'center' });

    // QR centered bottom
    const qrImg = new Image();
    qrImg.src = qrUrl;
    await new Promise(resolve => {
      qrImg.onload = () => {
        pdf.addImage(qrImg, 'PNG', 31.8, 36.5, 22, 22);
        resolve(null);
      };
    });

    pdf.save(`SundaySchool_ID_${id.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Student Registration</h1>
          <p className="text-gray-500">Register new students individually or in bulk</p>
        </div>
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-100">
          <button
            onClick={() => setBulkMode(false)}
            className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", !bulkMode ? "bg-[#5A5A40] text-white" : "text-gray-500 hover:bg-gray-50")}
          >
            Individual
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", bulkMode ? "bg-[#5A5A40] text-white" : "text-gray-500 hover:bg-gray-50")}
          >
            Bulk Upload
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!bulkMode ? (
          <motion.div
            key="individual"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100"
          >
            {success ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold">Registration Successful!</h2>
                  <p className="text-gray-500">{success.fullName} has been registered.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl inline-block">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Student ID</p>
                  <p className="text-xl font-mono font-bold text-[#5A5A40]">{success.id}</p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => downloadQR(success)}
                    className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors"
                  >
                    <Download size={18} /> Download QR
                  </button>
                  <button
                    onClick={() => setSuccess(null)}
                    className="flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Register Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                    <input
                      required
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                      placeholder="09..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Department</label>
                    <select
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none"
                    >
                      {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full bg-[#5A5A40] text-white py-4 rounded-xl font-bold hover:bg-[#4A4A30] transition-all shadow-lg shadow-olive-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                  Register Student
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 text-center"
          >
            {bulkResults ? (
              <div className="space-y-6 py-4">
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#5A5A40]">{bulkResults.total}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">{bulkResults.success}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Success</p>
                  </div>
                </div>
                {bulkResults.errors.length > 0 && (
                  <div className="text-left bg-red-50 p-4 rounded-xl max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-red-600 uppercase mb-2">Errors</p>
                    <ul className="text-xs text-red-500 list-disc pl-4 space-y-1">
                      {bulkResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setBulkResults(null)}
                  className="bg-[#5A5A40] text-white px-8 py-3 rounded-full hover:bg-[#4A4A30] transition-colors"
                >
                  Upload More
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Upload size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold">Bulk Registration</h2>
                  <p className="text-gray-500 max-w-sm mx-auto">Upload a CSV file with columns: Full Name, Phone, Email, Department</p>
                </div>

                <div className="flex justify-center gap-4">
                  <label className="cursor-pointer bg-[#5A5A40] text-white px-8 py-4 rounded-full font-bold hover:bg-[#4A4A30] transition-all shadow-lg shadow-olive-900/20 flex items-center gap-2">
                    <FileText size={20} />
                    Choose CSV File
                    <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} disabled={loading} />
                  </label>
                </div>

                <div className="text-xs text-gray-400">
                  <p>Make sure your CSV follows the required format.</p>
                  <button className="text-[#5A5A40] font-bold mt-2 hover:underline">Download Template</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
