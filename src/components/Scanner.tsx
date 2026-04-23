import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ref, get } from 'firebase/database';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  BookOpen,
  AlertCircle,
  Users
} from 'lucide-react';
import { database, handleDatabaseError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Course } from '../types';
import { DEPARTMENTS } from '../types';
import { format } from 'date-fns';
import { sendScan } from '../lib/sheetsApi';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const Scanner: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string } | null>(null);
  const [scannerInitializing, setScannerInitializing] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

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

    // Check if html5-qrcode is available and properly loaded
    if (typeof Html5QrcodeScanner === 'undefined' || !Html5QrcodeScanner) {
      setResult({ success: false, message: 'QR scanner library not loaded properly. Please refresh the page and try again.' });
      setScanning(false);
      setScannerInitializing(false);
      return;
    }

    // Check if required methods exist
    if (typeof Html5QrcodeScanner !== 'function') {
      setResult({ success: false, message: 'QR scanner library is not compatible. Please try a different browser.' });
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
        setScannerInitializing(false);
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
        setScannerInitializing(false);
        return;
      }

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const initializeScanner = async () => {
          try {
            // Check if reader element exists
            const readerElement = document.getElementById('reader');
            if (!readerElement) {
              throw new Error('Scanner container element not found');
            }

            // Try main scanner configuration first
            try {
              console.log('Creating main scanner...');
              scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                  experimentalFeatures: {
                    useBarCodeDetectorIfSupported: false
                  },
                  rememberLastUsedCamera: true,
                  showTorchButtonIfSupported: true
                },
                /* verbose= */ false
              );

              // Check if scanner was created successfully
              if (!scannerRef.current || typeof scannerRef.current.render !== 'function') {
                throw new Error('Failed to create scanner object');
              }

              const renderPromise = scannerRef.current.render(onScanSuccess, onScanFailure);

              // Ensure render returns a Promise
              if (renderPromise && typeof renderPromise.then === 'function') {
                await renderPromise;
                console.log('Scanner started successfully');
                setScannerInitializing(false);
                return; // Success, exit function
              } else {
                // If render doesn't return a Promise, assume it worked
                console.log('Scanner started successfully (no promise returned)');
                setScannerInitializing(false);
                return; // Success, exit function
              }
            } catch (mainScannerError) {
              console.error('Main scanner failed:', mainScannerError);

              // Try fallback scanner configuration
              try {
                console.log('Trying fallback scanner configuration...');
                scannerRef.current = new Html5QrcodeScanner(
                  "reader",
                  {
                    fps: 5,
                    qrbox: { width: 200, height: 200 },
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                  },
                  /* verbose= */ true
                );

                // Check if fallback scanner was created successfully
                if (!scannerRef.current || typeof scannerRef.current.render !== 'function') {
                  throw new Error('Failed to create fallback scanner object');
                }

                const fallbackRenderPromise = scannerRef.current.render(onScanSuccess, onScanFailure);

                // Ensure fallback render returns a Promise
                if (fallbackRenderPromise && typeof fallbackRenderPromise.then === 'function') {
                  await fallbackRenderPromise;
                  console.log('Fallback scanner started successfully');
                  setScannerInitializing(false);
                  return; // Success, exit function
                } else {
                  // If render doesn't return a Promise, assume it worked
                  console.log('Fallback scanner started successfully (no promise returned)');
                  setScannerInitializing(false);
                  return; // Success, exit function
                }
              } catch (fallbackError) {
                console.error('Fallback scanner also failed:', fallbackError);
                throw new Error('Both main and fallback scanners failed to initialize');
              }
            }
          } catch (error: any) {
            console.error('Scanner initialization error:', error);
            const errorMessage = error.message || 'Unknown initialization error';
            setResult({
              success: false,
              message: `Failed to initialize scanner: ${errorMessage}. Please try: 1) Refresh the page, 2) Allow camera permissions, 3) Try a different browser (Chrome recommended), or 4) Use your mobile device.`
            });
            setScanning(false);
            setScannerInitializing(false);
          }
        };

        initializeScanner();
      }, 200); // Increased delay
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

      const response = await sendScan({
        id,
        token,
        course: selectedCourse,
        markedBy: profile?.uid || null
      });

      if (!response.success) {
        setResult({ success: false, message: response.error || t.invalidQrCode });
        return;
      }

      setResult({
        success: true,
        message: response.message || t.attendanceRecorded,
        studentName: response.data?.fullName || response.data?.studentName || undefined
      });

      setTimeout(() => {
        setResult(null);
      }, 3000);
    } catch (err) {
      console.error('Scan processing error:', err);
      setResult({ success: false, message: t.invalidQrCode });

      setTimeout(() => {
        setResult(null);
      }, 3000);
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

  // Auto-stop scanner after 30 minutes to prevent battery drain (continuous scanning mode)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (scanning) {
      timeoutId = setTimeout(() => {
        stopScanner();
        setResult({ success: false, message: 'Scanner automatically stopped after 30 minutes of continuous scanning. Please restart if needed.' });
      }, 30 * 60 * 1000); // 30 minutes
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
                  <option key={course.id} value={course.id}>
                    {course.name} ({(course.departments || [course.department]).join(', ')})
                  </option>
                ))}
              </select>
              <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {t.selectDepartment || 'Select Department'}
          </label>
          <div className="relative">
            <select
              disabled={scanning || scannerInitializing}
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {t.allDepartments || 'All Departments'}
              </option>
              {DEPARTMENTS.map(department => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
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
              className="w-full h-full relative"
            >
              <div id="reader" className="w-full h-full" />
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Scanning...
                </div>
                <button
                  onClick={stopScanner}
                  className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-600 transition-colors"
                >
                  Stop Scanner
                </button>
              </div>
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
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "p-6 rounded-2xl flex items-center gap-4 border",
            result.success ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
          )}
        >
          {result.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
          <div className="flex-1">
            <p className="font-bold">{result.message}</p>
            {result.studentName && <p className="text-sm opacity-80">{result.studentName}</p>}
          </div>
          <div className="flex gap-2">
            {!result.success && (
              <button
                onClick={() => { setResult(null); }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
              >
                Continue Scanning
              </button>
            )}
            <button
              onClick={() => { setResult(null); }}
              className="bg-white/50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/80 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
