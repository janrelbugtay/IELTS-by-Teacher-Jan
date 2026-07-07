import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Search, ChevronDown, Users, ChevronRight, Book, CheckCircle2, TrendingUp, Star, Calendar, BarChart3 } from 'lucide-react';
import { Link } from 'react-router';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

const courses = [
  { id: 'Pre-Starter', name: 'Pre-Starters', age: 'Ages 4–6', image: 'https://drive.google.com/thumbnail?id=1h_In0NTl7lPBaZwLl1vKFz-O4dAs8m0E&sz=w1000', color: 'bg-blue-500 text-white' },
  { id: 'Starters', name: 'Starters', age: 'Ages 6–8', image: 'https://drive.google.com/thumbnail?id=1PZEu_s4S_5KwHtnHeY4RRwuw4BKqIYY2&sz=w1000', color: 'bg-yellow-400 text-white' },
  { id: 'Movers', name: 'Movers', age: 'Ages 8–10', image: 'https://drive.google.com/thumbnail?id=1CG1M0-jE1Nv49K01RGYYMpB16q6eUAHw&sz=w1000', color: 'bg-emerald-400 text-white' },
  { id: 'Flyers', name: 'Flyers', age: 'Ages 10–12', image: 'https://drive.google.com/thumbnail?id=1J6PPGe9OnH3ABpzIDfOn3OsLG1dpWpJh&sz=w1000', color: 'bg-purple-400 text-white' },
  { id: 'KET', name: 'KET', age: 'Ages 12+', image: 'https://drive.google.com/thumbnail?id=1pgTKRKvYvOuG6vTT4P36e6VUX1smqndL&sz=w1000', color: 'bg-orange-500 text-white' },
  { id: 'PET', name: 'PET', age: 'Ages 13+', image: 'https://drive.google.com/thumbnail?id=1ExrKOMdB7SSDtPmIUfMK9_yCbx2_Us4z&sz=w1000', color: 'bg-teal-400 text-white' },
  { id: 'IELTS', name: 'IELTS', age: 'Ages 16+', image: 'https://drive.google.com/thumbnail?id=1YjzWqy769jNBA46EBgyf-dWGdykjV7Yk&sz=w1000', color: 'bg-rose-400 text-white' },
];

export function HomeLeaderboardDashboard({ defaultCourse, hideCourseTabs }: { defaultCourse?: string, hideCourseTabs?: boolean }) {
  const [activeCourse, setActiveCourse] = useState(defaultCourse || 'IELTS');
  const [filter, setFilter] = useState('This Week');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (defaultCourse) setActiveCourse(defaultCourse);
  }, [defaultCourse]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const fetchedUsers: any[] = [];
        usersSnapshot.forEach(doc => {
          fetchedUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsersList(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();

    const subQ = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const subUnsubscribe = onSnapshot(subQ, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(data);
    });

    return () => {
      subUnsubscribe();
    };
  }, []);

  const currentCourse = courses.find(c => c.id === activeCourse) || courses[courses.length - 1];

  const leaderboardData = usersList
    .filter(u => u.course === activeCourse)
    .map(u => {
      const userSubs = submissions.filter(s => s.userId === (u.uid || u.id) && typeof s.bandScore === 'number');
      const averageBandRaw = userSubs.length > 0 ? userSubs.reduce((acc, curr) => acc + curr.bandScore, 0) / userSubs.length : 0;
      const overallBand = Math.round(averageBandRaw * 2) / 2;
      const streak = userSubs.length > 0 ? Math.min(userSubs.length * 2, 30) : 0;
      return {
        ...u,
        name: u.firstName || u.name?.split(' ')[0] || u.nickname || u.displayName || u.email?.split('@')[0] || 'Unknown',
        avatar: u.photoURL || '',
        overallBand,
        streak
      };
    })
    .sort((a, b) => b.overallBand - a.overallBand)
    .slice(0, 10);

  return (
    <section className="relative bg-[#F8FAFC] py-20 overflow-hidden border-y border-[#E2E8F0]">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs tracking-wide uppercase mb-6"
          >
            <Trophy className="w-3.5 h-3.5" />
            COMPETE & IMPROVE
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-[54px] font-extrabold text-[#0F172A] mb-4 tracking-tight leading-tight"
          >
            Class <span className="text-[#2563EB]">Leaderboards</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[17px] text-[#64748B]"
          >
            Check the rankings and progress of students across all levels.
          </motion.p>
        </div>

        {/* Course Navigation Cards */}
        {!hideCourseTabs && (
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            {courses.map((course, idx) => {
              const isActive = activeCourse === course.id;
              return (
                <motion.button
                  key={course.id}
                  onClick={() => setActiveCourse(course.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? `bg-white border-2 border-[#2563EB] shadow-md shadow-blue-500/10` 
                      : `bg-white border border-[#E2E8F0] hover:border-blue-200 hover:shadow-sm`
                  }`}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2563EB]"></div>
                  )}
                  <div className="w-10 h-10 rounded-full flex overflow-hidden items-center justify-center text-lg shadow-sm">
                    <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <div className={`font-bold leading-none mb-1 ${isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                      {course.name}
                    </div>
                    <div className="text-xs font-medium text-[#64748B]">
                      {course.age}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Left Column (Leaderboard Table) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </div>
                  Top Students – <span className="text-[#2563EB]">{currentCourse.name}</span>
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] w-[140px] md:w-[180px] transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {filter} <ChevronDown className="w-4 h-4 text-[#64748B]" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#E2E8F0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                      {['This Week', 'This Month', 'All Time'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-[#F8FAFC] ${filter === f ? 'text-[#2563EB] bg-blue-50' : 'text-[#64748B]'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[650px] p-2">
                  <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <div className="flex items-center gap-4 w-[280px]">
                      <div className="w-10 text-center">RANK</div>
                      <div>STUDENT</div>
                    </div>
                    <div className="flex-1 pl-4 min-w-[120px]">BADGE</div>
                    <div className="flex items-center justify-end gap-8 pr-4">
                      <div className="w-24 text-right">{activeCourse === 'PET' ? 'OVERALL GRADE' : 'OVERALL BAND'}</div>
                      <div className="w-20 text-right">STREAK</div>
                      <div className="w-10 text-center">ACTION</div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCourse}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {leaderboardData.map((student, index) => {
                        const rank = index + 1;
                        let rankDisplay = <span className="text-[#64748B] font-bold text-base w-8 text-center">{rank}</span>;
                        
                        if (rank === 1) {
                          rankDisplay = <div className="w-8 h-8 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-white flex items-center justify-center font-bold shadow-sm">1</div>;
                        } else if (rank === 2) {
                          rankDisplay = <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 text-white flex items-center justify-center font-bold shadow-sm">2</div>;
                        } else if (rank === 3) {
                          rankDisplay = <div className="w-8 h-8 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm">3</div>;
                        }

                        return (
                          <div 
                            key={student.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-2xl transition-colors group"
                          >
                            <div className="flex items-center gap-4 w-[280px]">
                              <div className="flex items-center justify-center w-10">
                                {rankDisplay}
                              </div>
                              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=f1f5f9&color=475569`; }} />
                              <div className="font-bold text-[#0F172A] whitespace-nowrap">{student.name}</div>
                            </div>
                            
                            <div className="flex-1 flex justify-start pl-4 min-w-[120px]">
                              {student.badge && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${student.badgeColor}`}>
                                  {student.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-8 pr-4">
                              <div className="flex items-center gap-1.5 w-24 justify-end">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-[#0F172A]">{student.overallBand.toFixed(1)}</span>
                                <span className="text-[10px] font-bold text-[#64748B] uppercase">Band</span>
                              </div>
                              
                              <div className="flex items-center justify-end gap-1.5 w-20">
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                                <span className="font-bold text-[#0F172A]">{student.streak}</span>
                                <span className="text-xs text-[#64748B] font-medium">days</span>
                              </div>

                              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors cursor-pointer">
                                <Trophy className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-5 border-t border-[#E2E8F0] flex items-center">
                <Link to={`/courses/${activeCourse}`} className="text-[#2563EB] font-bold text-sm hover:underline flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View Full Leaderboard
                  <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (Trophy Card) */}
          <div className="lg:col-span-4 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] rounded-3xl p-8 border border-[#E2E8F0] shadow-sm flex flex-col h-full relative overflow-hidden"
            >
              {/* Confetti particles - simplified css representation */}
              <div className="absolute top-10 left-10 w-2 h-2 rounded-sm bg-blue-400 rotate-12"></div>
              <div className="absolute top-20 right-16 w-2 h-2 rounded-sm bg-yellow-400 -rotate-12"></div>
              <div className="absolute top-16 left-1/3 w-1.5 h-1.5 rounded-sm bg-purple-400 rotate-45"></div>
              <div className="absolute top-8 right-1/3 w-2 h-2 rounded-sm bg-green-400 rotate-45"></div>

              <div className="text-center mb-8 pt-4">
                {/* Podium Illustration */}
                <div className="relative flex justify-center items-end h-32 mb-6">
                  {/* Rank 2 */}
                  <div className="w-14 h-12 bg-blue-500 rounded-t-lg relative flex items-center justify-center shadow-lg -mr-1 z-10">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  {/* Rank 1 */}
                  <div className="w-16 h-16 bg-blue-600 rounded-t-lg relative flex items-start pt-2 justify-center shadow-xl z-20">
                    <span className="text-white font-bold text-xl">1</span>
                    <div className="absolute -top-12 text-5xl drop-shadow-md">🏆</div>
                  </div>
                  {/* Rank 3 */}
                  <div className="w-14 h-8 bg-blue-400 rounded-t-lg relative flex items-center justify-center shadow-lg -ml-1 z-10">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-[#0F172A] mb-2">Keep Learning, Keep Growing!</h3>
                <p className="text-[#64748B] text-sm leading-relaxed px-4">Complete lessons, practice daily and climb to the top!</p>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="font-bold text-[#0F172A] text-xs mb-0.5">Learn</div>
                  <div className="text-[10px] text-[#64748B] leading-tight">Complete lessons</div>
                </div>
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="font-bold text-[#0F172A] text-xs mb-0.5">Practice</div>
                  <div className="text-[10px] text-[#64748B] leading-tight">Do exercises</div>
                </div>
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="font-bold text-[#0F172A] text-xs mb-0.5">Improve</div>
                  <div className="text-[10px] text-[#64748B] leading-tight">Climb ranks</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

