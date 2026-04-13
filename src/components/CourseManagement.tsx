import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  onSnapshot,
  where
} from 'firebase/firestore';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Users,
  Calendar,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { Course, DEPARTMENTS, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { formatEthiopianDate } from '../lib/ethiopianCalendar';

const COURSE_NAME_OPTIONS = [
  'የትምህርት መርሃ ግብር',
  'መዝሙር ጥናት',
  'የጽዳት አገልግሎት',
  'የልማት ስራ',
  'የተከታታይ ትምህርት መርሃ ግብር',
  'ልዩ መርሃ ግብር',
  'other'
];

const SPECIAL_GRADE_COURSE = 'የተከታታይ ትምህርት መርሃ ግብር';

const GRADE_DEPARTMENTS = Array.from({ length: 12 }, (_, i) => `${i + 1}ኛ ክፍል`);

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseNameSelection, setCourseNameSelection] = useState(COURSE_NAME_OPTIONS[0]);
  const [customCourseName, setCustomCourseName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [form, setForm] = useState({ department: DEPARTMENTS[0], adminIds: [] as string[] });

  const isGradeCourse = courseNameSelection === SPECIAL_GRADE_COURSE;
  const departmentOptions = isGradeCourse ? GRADE_DEPARTMENTS : DEPARTMENTS;

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  const parseSchedule = (schedule?: string) => {
    if (!schedule) {
      return { date: '', time: '08:00' };
    }

    const [datePart, timePart] = schedule.split(' ');
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
    const validTime = /^\d{2}:\d{2}$/.test(timePart || '') ? timePart : '08:00';

    return { date: validDate, time: validTime };
  };

  const formatScheduleDisplay = (schedule?: string) => {
    if (!schedule) return 'No schedule set';
    const [datePart, timePart] = schedule.split(' ');
    const dateText = datePart || schedule;
    const ethiopian = /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? ` · ${formatEthiopianDate(new Date(datePart))}` : '';
    return `${dateText}${timePart ? ` ${timePart}` : ''}${ethiopian}`;
  };

  useEffect(() => {
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      setLoading(false);
    });

    const unsubAdmins = onSnapshot(query(collection(db, 'users'), where('role', '==', 'admin')), (snap) => {
      setAdmins(snap.docs.map(d => d.data() as UserProfile));
    });

    return () => {
      unsubCourses();
      unsubAdmins();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseName = courseNameSelection === 'other' ? customCourseName.trim() : courseNameSelection;
      if (!courseName) {
        alert('Please enter a course name.');
        setLoading(false);
        return;
      }

      // Validate that schedule date is not in the past
      if (scheduleDate && scheduleDate < today) {
        alert('Cannot schedule courses for past dates. Please select today or a future date.');
        setLoading(false);
        return;
      }

      const schedule = scheduleDate ? `${scheduleDate} ${scheduleTime}` : '';
      const courseData = {
        name: courseName,
        department: form.department,
        schedule,
        adminIds: form.adminIds,
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
      } else {
        const newCourseRef = doc(collection(db, 'courses'));
        await setDoc(newCourseRef, { id: newCourseRef.id, ...courseData });
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setCourseNameSelection(COURSE_NAME_OPTIONS[0]);
      setCustomCourseName('');
      setScheduleDate('');
      setScheduleTime('08:00');
      setForm({ department: DEPARTMENTS[0], adminIds: [] });
    } catch (err) {
      console.error('Course save error:', err);
      alert('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">Course Management</h1>
          <p className="text-gray-500">Create and assign admins to Sunday School courses</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditingCourse(null);
            setCourseNameSelection(COURSE_NAME_OPTIONS[0]);
            setCustomCourseName('');
            setScheduleDate('');
            setScheduleTime('08:00');
            setForm({ department: DEPARTMENTS[0], adminIds: [] });
          }}
          className="flex items-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-full hover:bg-[#4A4A30] transition-colors shadow-lg shadow-olive-900/20"
        >
          <Plus size={20} /> Create Course
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-[32px] border border-gray-100">
            No courses created yet.
          </div>
        ) : courses.map((course) => (
          <div key={course.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-olive-50 text-olive-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingCourse(course);
                    const foundOption = COURSE_NAME_OPTIONS.includes(course.name) ? course.name : 'other';
                    setCourseNameSelection(foundOption);
                    setCustomCourseName(foundOption === 'other' ? course.name : '');
                    const parsed = parseSchedule(course.schedule);
                    setScheduleDate(parsed.date);
                    setScheduleTime(parsed.time);
                    setForm({ department: course.department, adminIds: course.adminIds });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-serif font-bold mb-1">{course.name}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{course.department}</p>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>{formatScheduleDisplay(course.schedule)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>{course.adminIds.length} Admins Assigned</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold">{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Course Name</label>
                <select
                  value={courseNameSelection}
                  onChange={e => {
                    const selected = e.target.value;
                    setCourseNameSelection(selected);
                    setCustomCourseName('');
                    setForm(prev => ({
                      ...prev,
                      department: selected === SPECIAL_GRADE_COURSE ? GRADE_DEPARTMENTS[0] : DEPARTMENTS[0]
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                >
                  {COURSE_NAME_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option === 'other' ? 'Other' : option}
                    </option>
                  ))}
                </select>
              </div>

              {courseNameSelection === 'other' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Other Course Name</label>
                  <input
                    required
                    value={customCourseName}
                    onChange={e => setCustomCourseName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                    placeholder="Enter course name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                >
                  {departmentOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Schedule Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              </div>
              {scheduleDate && (
                <div className="rounded-2xl border border-olive-100 bg-olive-50 p-4 text-sm text-olive-700">
                  Ethiopian calendar: <span className="font-semibold">{formatEthiopianDate(new Date(scheduleDate))}</span>
                  {scheduleTime ? ` • ${scheduleTime}` : ''}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Assign Admins</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                  {admins.map(admin => (
                    <label key={admin.uid} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.adminIds.includes(admin.uid)}
                        onChange={e => {
                          const newIds = e.target.checked
                            ? [...form.adminIds, admin.uid]
                            : form.adminIds.filter(id => id !== admin.uid);
                          setForm({ ...form, adminIds: newIds });
                        }}
                        className="w-4 h-4 text-olive-600 rounded"
                      />
                      <span className="text-sm">{admin.name || admin.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#5A5A40] text-white py-4 rounded-xl font-bold hover:bg-[#4A4A30] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
