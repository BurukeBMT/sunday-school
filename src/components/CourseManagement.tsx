import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
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

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', department: DEPARTMENTS[0], schedule: '', adminIds: [] as string[] });

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
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), form);
        // Update admins assignedCourses
        // (Simplification: in a real app, you'd sync these more robustly)
      } else {
        const newCourseRef = doc(collection(db, 'courses'));
        await setDoc(newCourseRef, { id: newCourseRef.id, ...form });
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setForm({ name: '', department: DEPARTMENTS[0], schedule: '', adminIds: [] });
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
          onClick={() => { setIsModalOpen(true); setEditingCourse(null); }}
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
                    setForm({ name: course.name, department: course.department, schedule: course.schedule || '', adminIds: course.adminIds });
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
                <span>{course.schedule || 'No schedule set'}</span>
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
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                  placeholder="e.g. Bible Study"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Schedule</label>
                <input
                  value={form.schedule}
                  onChange={e => setForm({ ...form, schedule: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none"
                  placeholder="e.g. Sundays 10:00 AM"
                />
              </div>
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
