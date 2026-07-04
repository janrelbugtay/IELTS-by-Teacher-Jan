import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, CheckCircle2, Star, Users, Trophy, BookOpen, 
  PlayCircle, Clock, BarChart3, ChevronRight, Check, Award,
  MapPin, Calendar, MessageSquare, Play, Plus, Minus,
  Headphones, PenTool, LayoutDashboard
} from 'lucide-react';
import { HomeLeaderboardDashboard } from '../components/HomeLeaderboardDashboard';

// Reusable Counter Component
const AnimatedCounter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / (duration * 1000);
      
      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

export function Home() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.05], [0, -50]);

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const courses = [
    { id: 'pre-starter', name: 'Pre-Starter', age: 'Ages 4-6', level: 'Beginner', desc: 'A fun introduction to English through interactive games, songs, stories, and hands-on activities that build confidence from the very beginning.', image: 'https://drive.google.com/thumbnail?id=1h_In0NTl7lPBaZwLl1vKFz-O4dAs8m0E&sz=w1000', color: 'from-blue-400 to-blue-500' },
    { id: 'starters', name: 'Starters', age: 'Ages 7-8', level: 'Pre-A1', desc: 'Build a strong foundation in English by developing essential vocabulary, simple grammar, and everyday communication skills.', image: 'https://drive.google.com/thumbnail?id=1PZEu_s4S_5KwHtnHeY4RRwuw4BKqIYY2&sz=w1000', color: 'from-orange-400 to-orange-500' },
    { id: 'movers', name: 'Movers', age: 'Ages 8-10', level: 'A1', desc: 'Strengthen speaking, reading, writing, and listening skills while encouraging confident communication in real-life situations.', image: 'https://drive.google.com/thumbnail?id=1CG1M0-jE1Nv49K01RGYYMpB16q6eUAHw&sz=w1000', color: 'from-green-400 to-green-500' },
    { id: 'flyers', name: 'Flyers', age: 'Ages 10-12', level: 'A2', desc: 'Advance English fluency through engaging lessons that develop independent communication, critical thinking, and language accuracy.', image: 'https://drive.google.com/thumbnail?id=1J6PPGe9OnH3ABpzIDfOn3OsLG1dpWpJh&sz=w1000', color: 'from-purple-400 to-purple-500' },
    { id: 'ket', name: 'KET', age: 'Ages 12-14', level: 'A2 Key', desc: 'Gain practical English skills for school, travel, and everyday life while preparing for the Cambridge A2 Key examination.', image: 'https://drive.google.com/thumbnail?id=1pgTKRKvYvOuG6vTT4P36e6VUX1smqndL&sz=w1000', color: 'from-rose-400 to-rose-500' },
    { id: 'pet', name: 'PET', age: 'Ages 14-16', level: 'B1 Preliminary', desc: 'Develop confident, independent English for academic success, travel, and future career opportunities with real-world communication practice.', image: 'https://drive.google.com/thumbnail?id=1ExrKOMdB7SSDtPmIUfMK9_yCbx2_Us4z&sz=w1000', color: 'from-teal-400 to-teal-500' },
    { id: 'ielts', name: 'IELTS', age: 'Ages 16+', level: 'B2-C1', desc: 'Master academic English and effective test strategies to achieve your target IELTS score for university admission and international opportunities.', image: 'https://drive.google.com/thumbnail?id=1YjzWqy769jNBA46EBgyf-dWGdykjV7Yk&sz=w1000', color: 'from-indigo-400 to-indigo-500' },
  ];

  const features = [
    { title: 'Cambridge Curriculum', desc: 'Official materials and proven methodologies from Cambridge University Press.', icon: <BookOpen className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { title: 'Certified Teachers', desc: 'Passionate educators with international TEFL/CELTA qualifications.', icon: <Award className="w-6 h-6" />, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
    { title: 'Interactive Learning', desc: 'Modern classrooms equipped with interactive smartboards and digital resources.', icon: <PlayCircle className="w-6 h-6" />, color: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
    { title: 'Monthly Mock Exams', desc: 'Regular practice tests to track progress and build exam confidence.', icon: <BarChart3 className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  ];

  const faqs = [
    { question: 'How do I know which course is right for my child?', answer: 'We offer a free placement test for all new students. Our academic coordinators will evaluate the results and recommend the perfect level based on their current ability and age.' },
    { question: 'Are the teachers native English speakers?', answer: 'We have a diverse team of both highly qualified native speakers and expert bilingual teachers, all certified to teach Cambridge curriculum.' },
    { question: 'How large are the class sizes?', answer: 'We keep our classes small, with a maximum of 12-15 students to ensure personalized attention and maximum speaking time for every student.' },
    { question: 'Do you offer online classes?', answer: 'Yes, our platform supports fully online and hybrid learning models with interactive digital materials and live video sessions.' }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
            
            {/* Left Side */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 max-w-2xl text-center lg:text-left z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#2563EB] font-semibold text-sm mb-8 border border-blue-100 shadow-sm">
                <Star className="w-4 h-4 fill-[#2563EB] text-[#2563EB]" />
                Cambridge English Learning Platform
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] mb-8 tracking-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#3B82F6]">Cambridge English</span><br />
                <span className="text-[40px] sm:text-5xl lg:text-6xl text-[#64748B] font-bold mt-2 block">from Pre-Starter to IELTS</span>
              </h1>
              
              <p className="text-xl text-[#64748B] mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Unlock your potential with premium structured learning paths, interactive lessons, and authentic exam-style practice.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
                <Link to="/courses" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-full font-semibold text-[15px] shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.35)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                  Explore Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/practice-tests" className="w-full sm:w-auto px-8 py-4 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-full font-semibold text-[15px] shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 group">
                  Take Free Practice Test
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-medium text-[#64748B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" /> Cambridge Certified
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" /> Expert Teachers
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" /> Proven Results
                </div>
              </div>
            </motion.div>

            {/* Right Side */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex-1 w-full relative z-10 lg:pl-10"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#2563EB]/30 via-purple-400/20 to-pink-400/20 blur-3xl rounded-[40px] -z-10 animate-pulse"></div>
                
                <div className="grid grid-cols-12 gap-4 relative">
                  {/* Floating elements */}
                  <motion.div 
                    animate={{ y: [-10, 10, -10] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-8 -left-8 bg-white p-4 rounded-2xl shadow-xl z-20 hidden md:block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">100% Pass Rate</div>
                        <div className="text-xs text-slate-500">Cambridge Exams</div>
                      </div>
                    </div>
                  </motion.div>



                  {/* Main Large Image */}
                  <motion.div 
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    transition={{ duration: 0.3 }}
                    className="col-span-12 sm:col-span-8 h-[400px] md:h-[480px] rounded-[32px] overflow-hidden shadow-2xl relative group cursor-pointer border-4 border-white"
                  >
                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10 duration-500"></div>
                    <img 
                      src="https://lh3.googleusercontent.com/d/1bfR_OFAkxKeeHJPmCFETZDo8KKs1m7Qd" 
                      alt="Learning Center" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8 z-20">
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full mb-3">Campus</span>
                        <h3 className="text-white font-bold text-2xl">Premium Classrooms</h3>
                        <p className="text-slate-200 mt-2 text-sm max-w-sm">Modern facilities designed for optimal learning and student engagement.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Grid of Small Images */}
                  <div className="col-span-12 sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-4 h-auto sm:h-[480px]">
                    {[
                      "https://lh3.googleusercontent.com/d/1ZV8IXVDbZad2fAUwaj_YH1tGYiH8Ep1i",
                      "https://lh3.googleusercontent.com/d/16hvnUkj8M1VkFzowovBccarw6KzVUnDv",
                      "https://lh3.googleusercontent.com/d/1fbbwBgb3iG0z2ePIttR2upjlecZgvOnx"
                    ].map((img, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.05, zIndex: 30 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.1) }}
                        className={`rounded-[24px] overflow-hidden shadow-lg relative group h-[190px] sm:h-full border-2 border-white cursor-pointer ${idx === 2 ? 'col-span-2 sm:col-span-1 hidden sm:block' : ''}`}
                      >
                        <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors z-10 duration-300"></div>
                        <img src={img} alt="Student" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[40px] font-bold text-[#0F172A] mb-4 tracking-tight">Cambridge English Courses</h2>
              <p className="text-[#64748B] text-lg">Comprehensive programs designed to develop all four language skills systematically.</p>
            </div>
            <Link to="/courses" className="px-6 py-3 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 hide-scrollbar">
            {courses.map((course, index) => (
              <motion.div 
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group cursor-pointer min-w-[300px] md:min-w-0 snap-start bg-white rounded-[24px] overflow-hidden border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.15)] transition-all duration-300 flex flex-col h-full relative"
              >
                <div className="w-full h-52 sm:h-60 overflow-hidden flex-shrink-0 bg-slate-100 relative">
                  <div className={`absolute inset-0 bg-gradient-to-t ${course.color} mix-blend-multiply opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-10`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                  <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-1 relative z-20">
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`px-4 py-1.5 text-white text-[13px] font-bold rounded-full tracking-wide shadow-md bg-gradient-to-r ${course.color}`}>{course.age}</span>
                    <span className="px-3.5 py-1.5 bg-slate-100 text-[#64748B] text-[13px] font-bold rounded-full tracking-wide">{course.level}</span>
                  </div>
                  
                  <h3 className={`text-2xl font-extrabold text-[#0F172A] mb-3 transition-colors flex items-center justify-between`}>
                    <span className={`group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r ${course.color}`}>{course.name}</span>
                    <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-[#0F172A]" />
                  </h3>
                  <p className="text-[#64748B] text-[15px] leading-relaxed flex-1 group-hover:text-[#334155] transition-colors duration-300">{course.desc}</p>
                </div>
                
                <div className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r ${course.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </motion.div>
            ))}
            
            {/* Explore More Card - Removed */}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-[40px] font-bold text-[#0F172A] mb-4 tracking-tight">The Premium Experience</h2>
            <p className="text-[#64748B] text-lg">We combine world-class curriculum with modern technology to deliver the best language education.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative p-8 rounded-[32px] bg-white border border-[#E2E8F0] overflow-hidden transition-all duration-500 shadow-sm hover:shadow-2xl hover:border-transparent ${feature.shadow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-white transition-colors duration-300">{feature.title}</h3>
                  <p className="text-[#64748B] text-[15px] leading-relaxed group-hover:text-white/90 transition-colors duration-300">{feature.desc}</p>
                </div>
                
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Test Highlight */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-[#0F172A] rounded-[32px] p-8 md:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-[0_32px_64px_rgba(0,0,0,0.15)]">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white font-medium text-sm mb-6 border border-white/10">
                <LayoutDashboard className="w-4 h-4" /> Next-Gen Testing Platform
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Simulate the real exam experience at home.
              </h2>
              <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-xl">
                Our proprietary testing platform mimics the computer-delivered Cambridge and IELTS exams. Get instant scores, experienced teacher feedback, and detailed analytics.
              </p>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
                {[
                  { icon: <Headphones className="w-5 h-5 text-blue-400" />, text: 'Listening Tests' },
                  { icon: <BookOpen className="w-5 h-5 text-green-400" />, text: 'Reading Tests' },
                  { icon: <PenTool className="w-5 h-5 text-purple-400" />, text: 'Experienced Teachers' },
                  { icon: <Clock className="w-5 h-5 text-orange-400" />, text: 'Strict Timers' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">{item.icon}</div>
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link to="/practice-tests" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0F172A] rounded-full font-bold text-[15px] hover:scale-105 transition-transform duration-300">
                Start Free Test <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: 20 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="flex-1 w-full relative z-10 perspective-[1000px]"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-white/10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img src="https://drive.google.com/thumbnail?id=1mmdsudZKL5susowwXkm_sdGxSGbeaKZB&sz=w1000" alt="Testing Platform" className="w-full h-auto object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent"></div>
                
                {/* Mock UI Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center text-white"><Check className="w-6 h-6" /></div>
                    <div>
                      <div className="text-white font-bold text-sm">Task Submitted</div>
                      <div className="text-slate-300 text-xs">Evaluation complete</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">Band 7.5</div>
                    <div className="text-slate-300 text-xs">Estimated Score</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials / Statistics */}
      <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="max-w-[1400px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[40px] font-bold mb-6 leading-tight">Trusted by hundreds of successful students.</h2>
              <p className="text-slate-300 text-lg mb-12 max-w-lg">
                Our results speak for themselves. We've helped students achieve their target scores for university admission, immigration, and personal growth.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-5xl font-extrabold text-[#3B82F6] mb-2"><AnimatedCounter end={10} suffix="+" /></div>
                  <div className="text-slate-400 font-medium">Years of Excellence</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold text-[#3B82F6] mb-2"><AnimatedCounter end={15} suffix="+" /></div>
                  <div className="text-slate-400 font-medium">Certified Teachers</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <div className="text-[#F59E0B] flex gap-1 mb-8">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-10 italic">
                "Thanks to the comprehensive IELTS preparation program and effective online practice tests, I was able to reach my goal. With consistent effort and the support of my exceptional teacher, I achieved an overall Band 8.0."
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-bold text-lg">Minh Hoang</div>
                  <div className="text-slate-400 text-sm">IELTS Band 8.0 Achiever</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[#0F172A] mb-4 tracking-tight">Life at Kỷ Nguyên Era</h2>
            <p className="text-[#64748B] text-lg">A vibrant community of learners achieving their dreams together.</p>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              "https://lh3.googleusercontent.com/d/1-fCPfoRG-EUkT3DqIXhzFHJxQ-QmTM_7",
              "https://lh3.googleusercontent.com/d/1VetrKou8pNQKGBd-iGHZMlwqALwlRBGG",
              "https://lh3.googleusercontent.com/d/1_3lzGwmEDN56unEeW6S_DGe2vddHiWpV",
              "https://lh3.googleusercontent.com/d/1gucSgi-fzlN-TDFWMI59HGPXFx7uyGaf",
              "https://lh3.googleusercontent.com/d/1iwvqSUapjg5QL4kLlmTSCgv-70aBZc3v",
              "https://lh3.googleusercontent.com/d/1s-QjIXsvF695O5rz2HrgMSwhw5H0QEFn",
              "https://lh3.googleusercontent.com/d/1tOj4WMEFtk634gq18dgylYb5gj_jxK0q",
              "https://lh3.googleusercontent.com/d/1MCsDCEvuik-2gvgKPMXmxkh-nnCzaMG6",
              "https://lh3.googleusercontent.com/d/1kefJhlEcA1KG5B8MJt40EsjOFBH2yX1I"
            ].map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative overflow-hidden rounded-[24px] break-inside-avoid group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img src={img} alt="Gallery" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-[#0F172A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-24 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[40px] font-bold text-[#0F172A] mb-4 tracking-tight">Latest News</h2>
              <p className="text-[#64748B] text-lg">Updates, tips, and stories from our educational community.</p>
            </div>
            <Link to="#" className="px-6 py-3 bg-white text-[#0F172A] border border-[#E2E8F0] rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
              View All Posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'How to prepare for IELTS Speaking Part 3', date: 'March 15, 2026', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop' },
              { title: 'Top 10 Grammar Mistakes to Avoid in PET', date: 'March 10, 2026', img: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=2068&auto=format&fit=crop' },
              { title: 'Congratulations to our Starters Graduates!', date: 'March 05, 2026', img: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80' },
            ].map((post, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] overflow-hidden border border-[#E2E8F0] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-[#0F172A] shadow-sm">
                    {post.date}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-[#0F172A] mb-4 group-hover:text-[#2563EB] transition-colors">{post.title}</h3>
                  <p className="text-[#64748B] text-[15px] mb-6 flex-1">Discover effective strategies and practical tips to improve your performance and achieve your target score.</p>
                  <span className="inline-flex items-center gap-2 text-[#2563EB] font-bold text-[15px] mt-auto">
                    Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-bold text-[#0F172A] mb-4 tracking-tight">Common Questions</h2>
          <p className="text-[#64748B] text-lg">Everything you need to know about our platform and courses.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-[20px] transition-all duration-300 ${activeFaq === idx ? 'border-[#2563EB] bg-blue-50/30 shadow-sm' : 'border-[#E2E8F0] bg-white hover:border-slate-300'}`}
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
              >
                <span className={`font-bold text-lg ${activeFaq === idx ? 'text-[#0F172A]' : 'text-[#0F172A]'}`}>{faq.question}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeFaq === idx ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                  {activeFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0 text-[#64748B] leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
