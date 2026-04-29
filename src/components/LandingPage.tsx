import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  QrCode,
  Users,
  BookOpen,
  ClipboardList,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Phone,
  MapPin,
  Church
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { loginWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5A5A40]"></div>
      </div>
    );
  }

  // Stats counters
  const [stats, setStats] = useState({ students: 0, departments: 0, years: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setStats({
        students: Math.min(stats.students + 5, 500),
        departments: Math.min(stats.departments + 1, 6),
        years: Math.min(stats.years + 1, 64),
      });
    }, 20);
    return () => clearInterval(timer);
  }, [stats]);

  const scrollToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(section);
  };

  const services = [
    { id: 0, title: 'የቅዱስ ቂርቆስ ክፍል', age: '3-9 ዓመት' },
    { id: 1, title: 'የሕፃናት ክፍል', age: '10-13 ዓመት' },
    { id: 2, title: 'የአዳጊ ክፍል', age: '14-18 ዓመት' },
    { id: 4, title: 'የወጣቶች ክፍል', age: '19 ዓመት በላይ' },
    { id: 5, title: 'የአረጋውያን ጉባኤ', age: 'ለአባቶችና እናቶች' },
  ];

  const features = [
    { title: 'QR መገኘት', desc: 'ፈጣን እና ደህንነቱ የተጠበቀ መገኘት መከታተያ።', icon: QrCode, color: 'bg-olive-50 text-olive-600' },
    { title: 'የተማሪ ቤዝ', desc: 'ሁሉም ሰንበት ትምህርት ቤት ተማሪዎችና ክፍሎችን መቆጣጠር።', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'የክፍል መቆጣጠር', desc: 'ክፍሎችን፣ የጊዜ ሰነዶችን እና አስተዳዳሪዎችን በቀላሉ ያደራግጡ።', icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
    { title: 'በጊዜ መገኘት መዝገቦች', desc: 'መገኘት ታሪክ እና ዝርዝር ሪፖርቶችን ያግኙ።', icon: ClipboardList, color: 'bg-green-50 text-green-600' },
  ];

  const toggleAccordion = (id: number) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] overflow-x-hidden">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#5A5A40] rounded-2xl flex items-center justify-center shadow-xl">
            <Church className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl">ፍሬ ሃይማኖት</h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Frehaymanot Sunday School</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => scrollToSection('services')} className="px-6 py-2 text-sm font-bold text-[#5A5A40] hover:bg-olive-50 rounded-xl transition-all">
            አገልግሎቶች
          </button>
          <button onClick={() => navigate('/login')} className="px-8 py-2.5 bg-[#5A5A40] text-white rounded-2xl font-bold hover:bg-[#4A4A30] shadow-lg transition-all">
            ግባ
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <span className="inline-block px-6 py-2 bg-gradient-to-r from-olive-100 to-green-100 text-[#5A5A40] rounded-full text-sm font-bold uppercase tracking-widest mb-8">
            የማዕምራት አስተዳዳሪ ስርዓት
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-8 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            ፍሬ ሃይማኖት <br />
            <span className="text-[#5A5A40]">ሰንበት ትምህርት ቤት</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-xl">
            የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን፣ የምሥራቅ ሐረርጌ ሀገረ ስብከት፣ የጥንተ አድባራት ወገዳማት ደብረ ፀሐይ ቅዱስ ጊዮርጊስ እና ደብረ አድኅኖ ቅዱስ ገብርኤል አብያተ ክርስቲያናት
          </p>
          <blockquote className="text-lg font-medium italic text-[#5A5A40] border-l-4 border-olive-400 pl-6 py-4 bg-olive-50 rounded-xl max-w-lg">
            "ፍሬ" ማለት ውጤት፣ ግብ... "ሃይማኖት" ማለት ማመን፣ መታመን እና ተስፋ። በሥራ የሚገለጥ እምነት!
          </blockquote>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-[#5A5A40] text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-[#4A4A30] shadow-2xl transition-all group">
              አሁን ይጀምሩ <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button onClick={() => scrollToSection('about')} className="px-10 py-5 bg-white text-[#1a1a1a] rounded-2xl font-bold border-2 border-gray-200 hover:bg-gray-50 shadow-xl transition-all">
              ስለ እኛ ይውቁ
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-olive-100 via-green-50 to-olive-200 overflow-hidden shadow-2xl relative">
            <img src="https://picsum.photos/seed/church-group/800/600?random=1" alt="ፍሬ ሃይማኖት" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl">
              <QrCode size={48} className="text-[#5A5A40] mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-700 text-center">QR ኮድ ማንበብ</p>
            </div>
          </div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-6 -right-6 bg-green-100 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-green-600" />
              <span className="text-2xl font-bold text-green-700">{stats.students.toLocaleString()}+</span>
            </div>
            <p className="text-xs text-green-600 font-medium">የተመዘገቡ ተማሪዎች</p>
          </motion.div>
        </motion.div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 bg-gradient-to-r from-[#5A5A40] to-olive-700 bg-clip-text text-transparent">
              ስለ ፍሬ ሃይማኖት
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              ከ1960 ዓ.ም ጀምሮ እስከ አሁን ጊዜ ድረስ አገልግሎቱ ተቀጠለ ነው። በ"ወጣቶች ማህበር" ስም ተመስርቶ በከተማዋ የመጀመሪያው ሰንበት ትምህርት ቤት ሆኖ ተመሰረተ።
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <h3 className="text-3xl font-serif font-bold text-[#5A5A40] mb-6">ራዕይና ተልዕኮ</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                ወንጌልን ለዓለም ሁሉ ማድረስ፣ ትውልዱን በሃይማኖትና በሥርዓተ ቤተክርስቲያን ኮትኩቶ ማሳደግ።
              </p>
              <div className="grid grid-cols-2 gap-6">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Church size={24} className="text-green-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">64+ ዓመታት</h4>
                  <p className="text-sm text-gray-600">ታሪክ</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-olive-100 rounded-xl flex items-center justify-center mb-4">
                    <Users size={24} className="text-olive-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">500+</h4>
                  <p className="text-sm text-gray-600">ተማሪዎች</p>
                </motion.div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-gradient-to-r from-olive-50 to-green-50 p-8 rounded-3xl">
                <h4 className="text-2xl font-bold text-[#5A5A40] mb-4">ታሪካዊ መጀመሪያ</h4>
                <p className="text-gray-600 leading-relaxed">በታኅሣሥ 1960 ዓ.ም በ"ወጣቶች ማህበር" ስም ተመስርቶ...</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-[#5A5A40]">
              የምንሰጣቸው አገልግሎቶች
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              በእድሜ ክልል የተከፋፈሉ የትምህርት ዘርፎችና ተግባራት
            </p>
          </motion.div>

          {/* Age Groups Accordion */}
          <div className="max-w-4xl mx-auto space-y-4">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(service.id)}
                  className="w-full p-8 text-left hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-olive-500 to-green-500 rounded-xl flex items-center justify-center">
                        <Users size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-[#5A5A40]">{service.title}</h3>
                        <p className="text-sm text-gray-500">{service.age}</p>
                      </div>
                    </div>
                    <ChevronDown className={cn('w-6 h-6 transition-transform', openAccordion === service.id && 'rotate-180')} />
                  </div>
                </button>
                <AnimatePresence>
                  {openAccordion === service.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-olive-50 to-green-50 px-8 pb-8"
                    >
                      <p className="text-gray-700 leading-relaxed">
                        የተዘዋዋሪ ተግባራትና ትምህርቶች በዚህ ክፍል ይኖራሉ። አገልግሎት ለማግኘት ግባ ያድርጉ።
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl bg-gradient-to-b from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
              >
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all', feature.color)}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="values" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-[#5A5A40]">
              መርሆዎቻችን
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-[#5A5A40] mb-6">አገልጋይነት</h3>
              <p>ለቤተክርስቲያን ልዩ ትኩረትና ክብር መስጠት።</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-[#5A5A40] mb-6">ቅንነት</h3>
              <p>በውይይትና በመግባባት በቡድን መስራት።</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-[#5A5A40] mb-6">ታማኝነት</h3>
              <p>መልካም ስነ-ምግባርና ስብዕና።</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold text-[#5A5A40] mb-6">አሳታፊ አሰራር</h3>
              <p>ሁሉም አባል አቅሙ በፈቀደው አገልግሎት እንዲሳተፍ ማድረግ።</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-[#5A5A40]">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="text-5xl font-serif font-bold mb-8">
            ግንኙነት ይያዙን
          </motion.h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed max-w-2xl mx-auto">
            የሕፃናት ክፍል ወይም አጠቃላይ ጥያቄ ለማግኘት በቀላሉ ይደውሉን
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.a href="tel:0967877206" whileHover={{ scale: 1.05 }} className="bg-white text-[#5A5A40] p-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl">
              <Phone size={24} />
              09-67877206
            </motion.a>
            <motion.a href="tel:0923204008" whileHover={{ scale: 1.05 }} className="bg-emerald-500 text-white p-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl">
              <Phone size={24} />
              ሕፃናት 09-23204008
            </motion.a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5A5A40] rounded-2xl flex items-center justify-center">
                <Church className="text-white w-7 h-7" />
              </div>
              <span className="font-serif font-bold text-2xl">ፍሬ ሃይማኖት</span>
            </div>
          </div>
          <p>© {new Date().getFullYear()} Frehaymanot Sunday School. ሁሉም መብቶች የተጠበቀው።</p>
        </div>
      </footer>
    </div>
  );
};

