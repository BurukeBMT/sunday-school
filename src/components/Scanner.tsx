import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Course, AttendanceLog } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const Scanner: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = profile?.role === 'superadmin'
          ? query(collection(db, 'courses'))
          : query(collection(db, 'courses'), where('adminIds', 'array-contains', profile?.uid));

        const snap = await getDocs(q);
        const courseList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
        setCourses(courseList);
        if (courseList.length > 0) setSelectedCourse(courseList[0].id);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'courses');
      }
    };
    fetchCourses();
  }, [profile]);

  const startScanner = () => {
    if (!selectedCourse) return;
    setScanning(true);
    setResult(null);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (loading) return;
    setLoading(true);
    stopScanner();

    try {
      const data = JSON.parse(decodedText);
      const { id, token } = data;

      // 1. Validate Student
      let studentDoc;
      try {
        studentDoc = await getDoc(doc(db, 'students', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `students/${id}`);
      }

      if (!studentDoc || !studentDoc.exists() || studentDoc.data().qrToken !== token) {
        setResult({ success: false, message: t.invalidQrCode });
        setLoading(false);
        return;
      }

      const studentData = studentDoc.data();
      const today = format(new Date(), 'yyyy-MM-dd');

      // 2. Check Duplicate
      let duplicateSnap;
      try {
        const q = query(
          collection(db, 'attendance_logs'),
          where('studentId', '==', id),
          where('courseId', '==', selectedCourse),
          where('date', '==', today)
        );
        duplicateSnap = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'attendance_logs');
      }

      if (duplicateSnap && !duplicateSnap.empty) {
        setResult({
          success: false,
          message: t.attendanceAlreadyRecorded,
          studentName: studentData.fullName
        });
        setLoading(false);
        return;
      }
      try {
        await addDoc(collection(db, 'attendance_logs'), {
          studentId: id,
          courseId: selectedCourse,
          department: course?.department || '',
          date: today,
          time: format(new Date(), 'HH:mm:ss'),
          adminId: profile?.uid,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'attendance_logs');
      }

      setResult({
        success: true,
        message: t.attendanceRecorded,
        studentName: studentData.fullName
      });
    } catch (err) {
      setResult({ success: false, message: t.invalidQrCode });
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Silent failure for continuous scanning
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{t.attendanceScanner}</h1>
        <p className="text-gray-500">{t.scanStudentQrs}</p>
      </header>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.selectCourse}</label>
          {courses.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{t.noCoursesFound} {t.createCourseFirst}</span>
            </div>
          ) : (
            <div className="relative">
              <select
                disabled={scanning}
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} ({course.department})</option>
                ))}
              </select>
              <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          )}
        </div>

        <div className="relative aspect-square max-w-sm mx-auto bg-gray-900 rounded-[32px] overflow-hidden flex items-center justify-center border-8 border-white shadow-2xl">
          <AnimatePresence mode="wait">
            {courses.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p>Waiting for courses...</p>
              </div>
            ) : !scanning ? (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="text-white w-10 h-10" />
                </div>
                <button
                  onClick={startScanner}
                  className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-bold hover:bg-[#4A4A30] transition-all shadow-xl"
                >
                  Start Scanner
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="reader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <div id="reader" className="w-full h-full" />
                <button
                  onClick={stopScanner}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  Stop
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <Loader2 className="text-white animate-spin" size={48} />
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-2xl flex items-center gap-4 border",
              result.success ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
            )}
          >
            {result.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            <div>
              <p className="font-bold">{result.message}</p>
              {result.studentName && <p className="text-sm opacity-80">{result.studentName}</p>}
            </div>
            <button
              onClick={() => { setResult(null); startScanner(); }}
              className="ml-auto bg-white/50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/80 transition-colors"
            >
              Next Scan
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
