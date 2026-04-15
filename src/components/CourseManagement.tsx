import React, { useState, useEffect } from 'react';
import {
  ref,
  query,
  get,
  push,
  update,
  remove,
  set,
  onValue,
  orderByChild,
  equalTo
} from 'firebase/database';
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
import { database } from '../firebase';
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
  const [attendanceStartTime, setAttendanceStartTime] = useState('08:00');
  const [attendanceEndTime, setAttendanceEndTime] = useState('10:00');
  const [form, setForm] = useState({ departments: [] as string[], adminIds: [] as string[] });

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
    const coursesRef = ref(database, 'courses');
    const unsubCourses = onValue(coursesRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setCourses(Object.keys(data).map(key => ({ id: key, ...data[key] } as Course)));
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    const adminsRef = ref(database, 'users');
    const adminsQuery = query(adminsRef, orderByChild('role'), equalTo('admin'));
    const unsubAdmins = onValue(adminsQuery, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setAdmins(Object.keys(data).map(key => data[key] as UserProfile));
      } else {
        setAdmins([]);
      }
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
        departments: form.departments,
        schedule,
        adminIds: form.adminIds,
        attendanceStartTime,
        attendanceEndTime,
      };

      if (editingCourse) {
        await update(ref(database, 'courses/' + editingCourse.id), courseData);
      } else {
        const newCourseRef = push(ref(database, 'courses'));
        await set(newCourseRef, { id: newCourseRef.key, ...courseData });
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setCourseNameSelection(COURSE_NAME_OPTIONS[0]);
      setCustomCourseName('');
      setScheduleDate('');
      setScheduleTime('08:00');
      setAttendanceStartTime('08:00');
      setAttendanceEndTime('10:00');
      setForm({ departments: [], adminIds: [] });
    } catch (err) {
      console.error('Course save error:', err);
      alert('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await remove(ref(database, 'courses/' + id));
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
            setAttendanceStartTime('08:00');
            setAttendanceEndTime('10:00');
            setForm({ departments: [], adminIds: [] });
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
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-lg">
            No courses created yet.
          </div>
        ) : courses.map((course) => (
          <div key={course.id} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <BookOpen size={80} className="text-gray-300" />
            </div>

            <div className="relative flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-olive-50 to-olive-100 text-olive-600 rounded-3xl flex items-center justify-center shadow-lg border border-olive-200/50">
                <BookOpen size={26} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => {
                    setEditingCourse(course);
                    const foundOption = COURSE_NAME_OPTIONS.includes(course.name) ? course.name : 'other';
                    setCourseNameSelection(foundOption);
                    setCustomCourseName(foundOption === 'other' ? course.name : '');
                    const parsed = parseSchedule(course.schedule);
                    setScheduleDate(parsed.date);
                    setScheduleTime(parsed.time);
                    setAttendanceStartTime(course.attendanceStartTime || '08:00');
                    setAttendanceEndTime(course.attendanceEndTime || '10:00');
                    setForm({ departments: course.departments || [course.department], adminIds: course.adminIds });
                    setIsModalOpen(true);
                  }}
                  className="p-3 text-gray-400 hover:text-olive-600 hover:bg-olive-50 rounded-2xl transition-all duration-200 shadow-sm"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 text-[#1a1a1a] group-hover:scale-105 transition-transform duration-300">{course.name}</h3>
            <div className="space-y-2 mb-6">
              {(course.departments || [course.department]).map((dept, index) => (
                <p key={index} className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full inline-block mr-2 mb-2">{dept}</p>
              ))}
            </div>

            <div className="space-y-4 mt-auto">
              <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-2xl">
                <Calendar size={18} className="text-olive-600" />
                <span className="font-medium">{formatScheduleDisplay(course.schedule)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-2xl">
                <Users size={18} className="text-purple-600" />
                <span className="font-medium">{course.adminIds.length} Admins Assigned</span>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-olive-200 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Course Name</label>
                <select
                  value={courseNameSelection}
                  onChange={e => {
                    const selected = e.target.value;
                    setCourseNameSelection(selected);
                    setCustomCourseName('');
                    // Reset departments when course type changes
                    setForm(prev => ({
                      ...prev,
                      departments: []
                    }));
                  }}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                >
                  {COURSE_NAME_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option === 'other' ? 'Other' : option}
                    </option>
                  ))}
                </select>
              </div>

              {courseNameSelection === 'other' && (
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Other Course Name</label>
                  <input
                    required
                    value={customCourseName}
                    onChange={e => setCustomCourseName(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                    placeholder="Enter course name"
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Departments</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-4 border border-gray-100 rounded-2xl bg-gray-50/50 shadow-inner">
                  {departmentOptions.map(dept => (
                    <label key={dept} className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-2xl cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={form.departments.includes(dept)}
                        onChange={e => {
                          const newDepartments = e.target.checked
                            ? [...form.departments, dept]
                            : form.departments.filter(d => d !== dept);
                          setForm({ ...form, departments: newDepartments });
                        }}
                        className="w-5 h-5 text-olive-600 rounded-lg border-2 border-gray-300 focus:ring-olive-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
                {form.departments.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Please select at least one department</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Schedule Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Attendance Start Time</label>
                  <input
                    type="time"
                    value={attendanceStartTime}
                    onChange={e => setAttendanceStartTime(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Attendance End Time</label>
                  <input
                    type="time"
                    value={attendanceEndTime}
                    onChange={e => setAttendanceEndTime(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-olive-500 outline-none transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>
              {scheduleDate && (
                <div className="rounded-3xl border border-olive-100 bg-gradient-to-r from-olive-50 to-olive-25 p-4 text-sm text-olive-700 shadow-sm">
                  Ethiopian calendar: <span className="font-bold">{formatEthiopianDate(new Date(scheduleDate))}</span>
                  {scheduleTime ? ` • ${scheduleTime}` : ''}
                </div>
              )}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Assign Admins</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-4 border border-gray-100 rounded-2xl bg-gray-50/50 shadow-inner">
                  {admins.map(admin => (
                    <label key={admin.uid} className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-2xl cursor-pointer transition-all duration-200">
                      <input
                        type="checkbox"
                        checked={form.adminIds.includes(admin.uid)}
                        onChange={e => {
                          const newIds = e.target.checked
                            ? [...form.adminIds, admin.uid]
                            : form.adminIds.filter(id => id !== admin.uid);
                          setForm({ ...form, adminIds: newIds });
                        }}
                        className="w-5 h-5 text-olive-600 rounded-lg border-2 border-gray-300 focus:ring-olive-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{admin.name || admin.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#5A5A40] to-[#4A4A30] text-white py-4 rounded-2xl font-bold hover:from-[#4A4A30] hover:to-[#3A3A20] transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </div>
                ) : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
