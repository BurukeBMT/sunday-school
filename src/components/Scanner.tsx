import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  push,
  set
} from 'firebase/database';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { database, handleDatabaseError, OperationType } from '../firebase'; import { useAuth } from '../contexts/AuthContext';
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
  const [scannerInitializing, setScannerInitializing] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = ref(database, 'courses');
        const snap = await get(coursesRef);
        if (snap.exists()) {
          const allCourses = snap.val();
          let courseList: Course[] = [];
          if (profile?.role === 'superadmin') {
            courseList = Object.keys(allCourses).map(key => ({ id: key, ...allCourses[key] }));
          } else {
            courseList = Object.keys(allCourses)
              .map(key => ({ id: key, ...allCourses[key] }))
              .filter(course => course.adminIds && course.adminIds.includes(profile?.uid));
          }
          setCourses(courseList);
          if (courseList.length > 0) setSelectedCourse(courseList[0].id);
        }
      } catch (error) {
        handleDatabaseError(error, OperationType.LIST, 'courses');
      }
    };

    if (profile) fetchCourses();
  }, [profile]);

  const startScanner = async () => {
    if (!selectedCourse) return;
    setScanning(true);
    setScannerInitializing(true);
    setResult(null);

    // Check if running over HTTPS (required for camera access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setResult({ success: false, message: 'Camera access requires HTTPS. Please access the app over a secure connection.' });
      setScanning(false);
      setScannerInitializing(false);
      return;
    }

    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');

      if (!hasCamera) {
        setResult({ success: false, message: 'No camera found on this device' });
        setScanning(false);
        return;
      }

      // Request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (permissionError) {
        console.error('Camera permission denied:', permissionError);
        setResult({ success: false, message: 'Camera permission denied. Please allow camera access and try again.' });
        setScanning(false);
        return;
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner(
            "reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
              supportedScanTypes: ["qr_code"],
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: false
              }
            },
            /* verbose= */ false
          );

          scannerRef.current.render(onScanSuccess, onScanFailure)
            .then(() => {
              console.log('Scanner started successfully');
              setScannerInitializing(false);
            })
            .catch((error) => {
              console.error('Failed to start scanner:', error);
              setResult({ success: false, message: 'Failed to start camera scanner. Please try again.' });
              setScanning(false);
              setScannerInitializing(false);
            });
        } catch (error) {
          console.error('Scanner initialization error:', error);
          setResult({ success: false, message: 'Failed to initialize scanner. Please refresh the page and try again.' });
          setScanning(false);
        }
      }, 100);
    } catch (error) {
      console.error('Camera check error:', error);
      setResult({ success: false, message: 'Unable to access camera. Please check your device settings.' });
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
          .then(() => {
            console.log('Scanner stopped successfully');
          })
          .catch(err => {
            console.error("Failed to clear scanner", err);
          });
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setScannerInitializing(false);
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
        } catch (error) {
          console.error('Error clearing scanner on unmount:', error);
        }
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = JSON.parse(decodedText);
      const { id, token } = data;

      if (!id || !token) {
        throw new Error('Invalid QR code format');
      }

      // 1. Validate Student
      let studentSnap;
      try {
        studentSnap = await get(ref(database, 'students/' + id));
      } catch (err) {
        console.error('Error fetching student:', err);
        setResult({ success: false, message: 'Error validating student. Please try again.' });
        setLoading(false);
        return;
      }

      if (!studentSnap || !studentSnap.exists()) {
        setResult({ success: false, message: t.invalidQrCode });
        setLoading(false);
        return;
      }

      const studentData = studentSnap.val();
      if (studentData.qrToken !== token) {
        setResult({ success: false, message: t.invalidQrCode });
        setLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // 2. Check Duplicate
      let duplicateSnap;
      try {
        const logsRef = ref(database, 'attendance_logs');
        const duplicateQuery = query(logsRef, orderByChild('studentId'), equalTo(id));
        duplicateSnap = await get(duplicateQuery);
      } catch (err) {
        console.error('Error checking duplicates:', err);
        setResult({ success: false, message: 'Error checking attendance records. Please try again.' });
        setLoading(false);
        return;
      }

      if (duplicateSnap && duplicateSnap.exists()) {
        const logs = duplicateSnap.val();
        const isDuplicate = Object.values(logs).some((log: any) =>
          log.studentId === id && log.courseId === selectedCourse && log.date === today
        );
        if (isDuplicate) {
          setResult({
            success: false,
            message: t.attendanceAlreadyRecorded,
            studentName: studentData.fullName
          });
          setLoading(false);
          return;
        }
      }

      // 3. Record Attendance
      try {
        const course = courses.find(c => c.id === selectedCourse);
        await push(ref(database, 'attendance_logs'), {
          studentId: id,
          courseId: selectedCourse,
          department: course?.department || '',
          date: today,
          time: format(new Date(), 'HH:mm:ss'),
          adminId: profile?.uid,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error('Error recording attendance:', err);
        setResult({ success: false, message: 'Error recording attendance. Please try again.' });
        setLoading(false);
        return;
      }

      setResult({
        success: true,
        message: t.attendanceRecorded,
        studentName: studentData.fullName
      });

      // Stop scanner after successful scan
      stopScanner();

    } catch (err) {
      console.error('Scan processing error:', err);
      setResult({ success: false, message: t.invalidQrCode });
      stopScanner();
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Silent failure for continuous scanning - only log if it's a real error
    if (error && typeof error === 'string' && !error.includes('No QR code found')) {
      console.warn('QR scan error:', error);
    }
  };

  // Auto-stop scanner after 5 minutes to prevent battery drain
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (scanning) {
      timeoutId = setTimeout(() => {
        stopScanner();
        setResult({ success: false, message: 'Scanner timed out after 5 minutes. Please restart if needed.' });
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [scanning]);

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
                disabled={scanning || scannerInitializing}
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={scanning || scannerInitializing}
                  className="bg-[#5A5A40] text-white px-8 py-4 rounded-full font-bold hover:bg-[#4A4A30] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  {scannerInitializing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Initializing Camera...
                    </div>
                  ) : scanning ? 'Starting Scanner...' : 'Start Scanner'}
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
