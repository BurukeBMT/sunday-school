import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  QrCode, 
  Users, 
  BookOpen, 
  ClipboardList,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();

  const features = [
    {
      title: "QR Attendance",
      description: "Fast and secure attendance tracking using student QR codes.",
      icon: QrCode,
      color: "bg-olive-50 text-olive-600"
    },
    {
      title: "Student Database",
      description: "Centralized management of all Sunday School students and departments.",
      icon: Users,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Course Management",
      description: "Organize courses, schedules, and assign administrators easily.",
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Real-time Logs",
      description: "Instant access to attendance history and detailed reporting.",
      icon: ClipboardList,
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center shadow-lg shadow-olive-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl leading-tight">ፍሬ ሃይማኖት</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Sunday School</p>
          </div>
        </div>
        <button 
          onClick={login}
          className="px-6 py-2.5 bg-[#5A5A40] text-white rounded-full font-bold text-sm hover:bg-[#4A4A30] transition-all shadow-lg shadow-olive-900/10"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 bg-olive-100 text-[#5A5A40] rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Attendance Management System
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-8">
            Empowering Our <br />
            <span className="text-[#5A5A40] italic">Sunday School</span> <br />
            Community.
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed">
            A modern, secure, and efficient way to manage attendance and student records for Fre Haimanot Sunday School.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={login}
              className="px-8 py-4 bg-[#5A5A40] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-all shadow-xl shadow-olive-900/20 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-[#1a1a1a] rounded-full font-bold border border-gray-100 hover:bg-gray-50 transition-all shadow-sm">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="aspect-square rounded-[64px] bg-gradient-to-br from-olive-100 to-olive-200 overflow-hidden shadow-2xl">
            <img 
              src="https://picsum.photos/seed/church/1200/1200" 
              alt="Sunday School" 
              className="w-full h-full object-cover mix-blend-overlay opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-white/90 backdrop-blur-sm rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                <QrCode size={64} className="text-[#5A5A40] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Scan Student ID</p>
              </div>
            </div>
          </div>
          
          {/* Floating Stats Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Users size={18} />
              </div>
              <span className="text-2xl font-bold">500+</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Active Students Registered</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-serif font-bold mb-6">Designed for Efficiency</h2>
            <p className="text-gray-500 leading-relaxed">
              Our system is built with the specific needs of our Sunday School in mind, focusing on speed, accuracy, and ease of use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className="flex items-center text-[#5A5A40] font-bold text-xs uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#151619] rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#5A5A40] rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#5A5A40] rounded-full blur-[120px]" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-8">
              Ready to modernize your attendance?
            </h2>
            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              Join the administrators already using our system to streamline their Sunday School operations.
            </p>
            <button 
              onClick={login}
              className="px-12 py-5 bg-[#5A5A40] text-white rounded-full font-bold text-lg hover:bg-[#4A4A30] transition-all shadow-2xl shadow-olive-900/40"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-serif font-bold">ፍሬ ሃይማኖት</span>
        </div>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Fre Haimanot Sunday School. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-[#5A5A40] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#5A5A40] transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
