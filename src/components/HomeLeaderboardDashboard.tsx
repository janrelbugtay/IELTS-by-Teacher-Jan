import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Search, ChevronDown, Users, ChevronRight, Book, 
  CheckCircle2, TrendingUp, Star, Calendar, BarChart3, ShieldCheck, Lock 
} from 'lucide-react';
import { Link } from 'react-router';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';

interface CourseItem {
  id: string;
  name: string;
  age: string;
  image: string;
  color: string;
}

const COURSES: CourseItem[] = [
  { id: 'IELTS 1', name: 'IELTS 1', age: 'Folder IELTS 1', image: 'https://drive.google.com/thumbnail?id=1YjzWqy769jNBA46EBgyf-dWGdykjV7Yk&sz=w1000', color: 'bg-rose-500 text-white' },
  { id: 'IELTS 2', name: 'IELTS 2', age: 'Folder IELTS 2', image: 'https://drive.google.com/thumbnail?id=1YjzWqy769jNBA46EBgyf-dWGdykjV7Yk&sz=w1000', color: 'bg-emerald-500 text-white' },
  { id: 'Pre-Starter', name: 'Pre-Starters', age: 'Ages 4–6', image: 'https://drive.google.com/thumbnail?id=1h_In0NTl7lPBaZwLl1vKFz-O4dAs8m0E&sz=w1000', color: 'bg-blue-500 text-white' },
  { id: 'Starter', name: 'Starters', age: 'Ages 6–8', image: 'https://drive.google.com/thumbnail?id=1PZEu_s4S_5KwHtnHeY4RRwuw4BKqIYY2&sz=w1000', color: 'bg-yellow-400 text-white' },
  { id: 'Movers', name: 'Movers', age: 'Ages 8–10', image: 'https://drive.google.com/thumbnail?id=1CG1M0-jE1Nv49K01RGYYMpB16q6eUAHw&sz=w1000', color: 'bg-emerald-400 text-white' },
  { id: 'Flyers', name: 'Flyers', age: 'Ages 10–12', image: 'https://drive.google.com/thumbnail?id=1J6PPGe9OnH3ABpzIDfOn3OsLG1dpWpJh&sz=w1000', color: 'bg-purple-400 text-white' },
  { id: 'KET', name: 'KET', age: 'Ages 12+', image: 'https://drive.google.com/thumbnail?id=1pgTKRKvYvOuG6vTT4P36e6VUX1smqndL&sz=w1000', color: 'bg-orange-500 text-white' },
  { id: 'PET', name: 'PET', age: 'Ages 13+', image: 'https://drive.google.com/thumbnail?id=1ExrKOMdB7SSDtPmIUfMK9_yCbx2_Us4z&sz=w1000', color: 'bg-teal-400 text-white' },
];

// Exact helper matching src/pages/ielts/Dashboard.tsx
const getFallbackType = (id: any) => {
  if (id === 'offline_speaking') return 'speaking';
  const numId = parseInt(String(id), 10);
  if (!isNaN(numId)) {
    if (numId % 4 === 1) return 'reading';
    if (numId % 4 === 2) return 'listening';
    if (numId % 4 === 3) return 'writing';
    if (numId % 4 === 0) return 'speaking';
  }
  return 'unknown';
};

export function HomeLeaderboardDashboard({ 
  defaultCourse, 
  hideCourseTabs 
}: { 
  defaultCourse?: string; 
  hideCourseTabs?: boolean;
}) {
  const { user: authUser, isAdmin: contextIsAdmin } = useAuth();
  
  const currentEmail = (authUser?.email || '').trim().toLowerCase();
  const isAdmin = Boolean(
    contextIsAdmin ||
    currentEmail === 'janrelbugtay03@gmail.com' ||
    currentEmail === 'khaisangschool.edu.vn@gmail.com' ||
    (authUser as any)?.role === 'admin' ||
    (authUser as any)?.isTeacherAdmin === true
  );

  const [activeCourse, setActiveCourse] = useState<string>('IELTS 1');
  const [filter, setFilter] = useState<'This Week' | 'This Month' | 'All Time'>('This Week');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [foldersList, setFoldersList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. LIVE FIRESTORE LISTENERS (Real-time updates without artificial limit)
  useEffect(() => {
    let isMounted = true;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!isMounted) return;
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsersList(list);
    }, (err) => {
      console.warn("Users live listener warning:", err);
    });

    const unsubFolders = onSnapshot(collection(db, 'folders'), (snapshot) => {
      if (!isMounted) return;
      const fList: any[] = [];
      snapshot.forEach((docSnap) => {
        fList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFoldersList(fList);
    }, (err) => {
      console.warn("Folders live listener warning:", err);
    });

    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      if (!isMounted) return;
      const aList: any[] = [];
      snapshot.forEach((docSnap) => {
        aList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAssignmentsList(aList);
    }, (err) => {
      console.warn("Assignments live listener warning:", err);
    });

    const unsubSubs = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      if (!isMounted) return;
      const sList: any[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        sList.push({
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toMillis
            ? d.createdAt.toMillis()
            : typeof d.createdAt === 'number'
            ? d.createdAt
            : d.createdAt?.seconds
            ? d.createdAt.seconds * 1000
            : Date.now()
        });
      });
      setSubmissions(sList);
    }, (err) => {
      console.warn("Submissions live listener warning:", err);
    });

    return () => {
      isMounted = false;
      unsubUsers();
      unsubFolders();
      unsubAssignments();
      unsubSubs();
    };
  }, []);

  // Helper: Get all folder IDs (root + nested descendants) matching a folder name in IELTS (exact match with CourseFolderModal.tsx)
  const getFolderIdsForClass = useMemo(() => {
    const activeFolders = foldersList.filter((f) => !f.isDeleted);
    const getDescendants = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return [];
      visited.add(id);
      const children = activeFolders.filter((f) => f.parentId === id);
      const childIds = children.map((c) => c.id);
      return [...childIds, ...childIds.flatMap((cId) => getDescendants(cId, visited))];
    };

    const buildSet = (targetFolderName: string) => {
      const targetUpper = targetFolderName.trim().toUpperCase();
      const matchingRoots = activeFolders.filter(
        (f) => (f.name || '').trim().toUpperCase() === targetUpper
      );
      const ids = new Set<string>();
      matchingRoots.forEach((rf) => {
        ids.add(rf.id);
        getDescendants(rf.id).forEach((dId) => ids.add(dId));
      });
      return ids;
    };

    return {
      'IELTS 1': buildSet('IELTS 1'),
      'IELTS 2': buildSet('IELTS 2'),
    };
  }, [foldersList]);

  // 2. Resolve logged-in Student's Assigned Class
  // Admin can see all classes; regular student can ONLY see their own class leaderboard (e.g. IELTS 1 or IELTS 2)
  const studentAssignedClass = useMemo((): string => {
    if (isAdmin) return 'ADMIN';

    const studentUid = (authUser?.uid || localStorage.getItem('studentUid') || '').trim();
    const currentUserDoc = usersList.find(
      (u) =>
        !u.isDeleted &&
        (u.id === studentUid ||
          u.uid === studentUid ||
          (currentEmail && (u.email || '').trim().toLowerCase() === currentEmail) ||
          (currentEmail && (u.authEmail || '').trim().toLowerCase() === currentEmail))
    );

    if (currentUserDoc) {
      if (currentUserDoc.folderId && getFolderIdsForClass['IELTS 2'].has(currentUserDoc.folderId)) {
        return 'IELTS 2';
      }
      if (currentUserDoc.folderId && getFolderIdsForClass['IELTS 1'].has(currentUserDoc.folderId)) {
        return 'IELTS 1';
      }
      const fObj = foldersList.find((f) => f.id === currentUserDoc.folderId);
      const resolvedFolderName = (currentUserDoc.folderName || fObj?.name || '').trim().toUpperCase();
      if (resolvedFolderName === 'IELTS 2' || resolvedFolderName.includes('IELTS 2')) {
        return 'IELTS 2';
      }
      if (resolvedFolderName === 'IELTS 1' || resolvedFolderName.includes('IELTS 1')) {
        return 'IELTS 1';
      }
      if (currentUserDoc.course && currentUserDoc.course !== 'IELTS') {
        return currentUserDoc.course;
      }
    }

    return 'IELTS 1';
  }, [isAdmin, authUser, currentEmail, usersList, foldersList, getFolderIdsForClass]);

  // Lock student to their class; allow admin to view any class
  useEffect(() => {
    if (!isAdmin) {
      setActiveCourse(studentAssignedClass);
    } else if (defaultCourse) {
      const normalized = defaultCourse.trim().toUpperCase();
      if (normalized === 'IELTS 2') setActiveCourse('IELTS 2');
      else if (normalized === 'IELTS 1' || normalized === 'IELTS') setActiveCourse('IELTS 1');
      else {
        const found = COURSES.find(
          (c) => c.id.toLowerCase() === defaultCourse.toLowerCase() || c.name.toLowerCase() === defaultCourse.toLowerCase()
        );
        if (found) setActiveCourse(found.id);
      }
    }
  }, [isAdmin, studentAssignedClass, defaultCourse]);

  // 3. Build Live Leaderboard Data using exact Firestore folder students & exact Dashboard.tsx Overall Band calculation
  const leaderboardData = useMemo(() => {
    // Filter students strictly from Firestore matching CourseFolderModal.tsx
    const classUsers = usersList.filter((u) => {
      if (u.isDeleted) return false;

      if (activeCourse === 'IELTS 1' || activeCourse === 'IELTS 2') {
        if (u.course !== 'IELTS') return false;
        const validIds = getFolderIdsForClass[activeCourse];
        if (u.folderId && validIds.has(u.folderId)) {
          return true;
        }
        if (!u.folderId && (u.folderName || '').trim().toUpperCase() === activeCourse) {
          return true;
        }
        return false;
      }

      const normCourse = activeCourse === 'Starters' ? 'Starter' : activeCourse;
      return u.course === normCourse || u.course === activeCourse;
    });

    // Exact Dashboard.tsx Overall Band calculation per student
    const getSubmissionsByType = (userSubs: any[], type: string) =>
      userSubs.filter((s) => {
        const directType =
          s.assignmentType ||
          assignmentsList.find((a) => a.id === s.assignmentId)?.type ||
          getFallbackType(s.assignmentId);
        if (directType === type) return true;

        const title = (s.assignmentTitle || s.title || '').toLowerCase();
        if (type === 'speaking' && (title.includes('speaking') || s.assignmentId === 'offline_speaking')) return true;
        if (type === 'reading' && (title.includes('reading') || s.assignmentId === 'offline_reading')) return true;
        if (type === 'listening' && (title.includes('listening') || s.assignmentId === 'offline_listening')) return true;
        if (type === 'writing' && (title.includes('writing') || s.assignmentId === 'offline_writing')) return true;

        return false;
      });

    const averageScore = (subs: any[]) => {
      const scored = subs.filter((s) => s.bandScore !== undefined && s.bandScore !== null && !isNaN(Number(s.bandScore)));
      if (scored.length === 0) return 0;
      const sum = scored.reduce((acc, curr) => acc + (Number(curr.bandScore) || 0), 0);
      return Math.round((sum / scored.length) * 2) / 2; // round to nearest 0.5
    };

    const isSpeakingEvaluated = (sub: any) => {
      return Boolean(
        sub.isEvaluated === true ||
          sub.evaluatedBy === 'admin' ||
          (sub.assignmentId === 'offline_speaking' && sub.bandScore !== undefined && sub.bandScore !== null)
      );
    };

    const rows = classUsers.map((u) => {
      const uid = u.uid || u.id;
      const userSubs = submissions.filter(
        (s) =>
          s.userId === uid &&
          s.assignmentId !== '3' &&
          !(s.title || '').includes('January Writing')
      );

      // Exact 4-skill calculation from src/pages/ielts/Dashboard.tsx
      const readingSubs = getSubmissionsByType(userSubs, 'reading');
      const listeningSubs = getSubmissionsByType(userSubs, 'listening');
      const writingSubs = getSubmissionsByType(userSubs, 'writing');
      const speakingSubs = getSubmissionsByType(userSubs, 'speaking').filter(
        (s) => s.assignmentId !== 'offline_speaking' && !(s.assignmentTitle || '').toLowerCase().includes('offline')
      );
      const offlineSpeakingSubs = getSubmissionsByType(userSubs, 'speaking').filter(
        (s) => s.assignmentId === 'offline_speaking' || (s.assignmentTitle || '').toLowerCase().includes('offline')
      );
      const allSpeakingSubs = [...speakingSubs, ...offlineSpeakingSubs];

      const rScore = averageScore(readingSubs);
      const lScore = averageScore(listeningSubs);
      const wScore = averageScore(writingSubs);
      const sScore = averageScore(allSpeakingSubs.filter(isSpeakingEvaluated));

      const skillScores = [rScore, lScore, wScore, sScore].filter((s) => s > 0);
      let overallBand = 0.0;
      if (skillScores.length > 0) {
        const avg = skillScores.reduce((a, b) => a + b, 0) / skillScores.length;
        overallBand = Math.round(avg * 2) / 2;
      } else {
        // Fallback for non-IELTS courses if bandScore is present directly
        const scoredSubs = userSubs.filter((s) => typeof s.bandScore === 'number');
        if (scoredSubs.length > 0) {
          const avg = scoredSubs.reduce((acc, curr) => acc + curr.bandScore, 0) / scoredSubs.length;
          overallBand = Math.round(avg * 2) / 2;
        }
      }

      const scoredCount = userSubs.filter((s) => s.bandScore !== undefined && s.bandScore !== null).length;
      const streak = scoredCount > 0 ? Math.min(scoredCount * 2, 30) : 0;

      // Exact student name from CourseFolderModal.tsx
      const studentName = u.firstName || u.name?.split(' ')[0] || u.displayName || u.email?.split('@')[0] || 'Unknown';
      const initialLetter = (u.firstName || u.name || studentName || 'U')[0].toUpperCase();

      return {
        id: u.id,
        uid,
        name: studentName,
        nickname: u.nickname || '',
        email: u.email || '',
        // Never generate fake profile pictures; only use real u.photoURL from Firestore if present
        photoURL: u.photoURL || '',
        initialLetter,
        badge: u.badge || '',
        badgeColor: u.badgeColor || '',
        overallBand,
        streak,
        course: u.course || activeCourse
      };
    });

    // Sort by overallBand descending, then streak descending, then name alphabetically
    rows.sort((a, b) => {
      if (b.overallBand !== a.overallBand) {
        return b.overallBand - a.overallBand;
      }
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [activeCourse, usersList, getFolderIdsForClass, assignmentsList, submissions, filter]);

  // 4. Filter by search query (matches student name, nickname, or email)
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboardData;
    const q = searchQuery.trim().toLowerCase();
    return leaderboardData.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        (st.nickname && st.nickname.toLowerCase().includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q))
    );
  }, [leaderboardData, searchQuery]);

  const currentCourse = COURSES.find((c) => c.id === activeCourse) || COURSES[0];

  return (
    <section className="relative bg-[#F8FAFC] py-20 overflow-hidden border-y border-[#E2E8F0]">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/5 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs tracking-wide uppercase mb-5"
          >
            <Trophy className="w-3.5 h-3.5" />
            COMPETE &amp; IMPROVE
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-[54px] font-extrabold text-[#0F172A] mb-4 tracking-tight leading-tight"
          >
            Class <span className="text-[#2563EB]">Leaderboards</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[17px] text-[#64748B]"
          >
            Check the rankings and progress of students across all levels.
          </motion.p>
        </div>

        {/* Access Mode Notification Banner */}
        {isAdmin ? (
          <div className="mb-6 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl px-5 py-3 text-sm">
            <div className="flex items-center gap-2.5 text-slate-800 font-bold">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Teacher Jan (Super Admin) Mode • Full access to inspect all class leaderboards ({leaderboardData.length} students in {currentCourse.name}).</span>
            </div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-blue-600 text-white rounded-full">
              Super Admin
            </span>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-700 font-bold">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Personalized Class Access: Viewing your class <strong>{currentCourse.name}</strong> leaderboard ({leaderboardData.length} students).</span>
            </div>
            <span className="text-xs font-black uppercase px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              {currentCourse.name}
            </span>
          </div>
        )}

        {/* Course Navigation Cards (Admin can switch between IELTS 1, IELTS 2, and all classes) */}
        {isAdmin && !hideCourseTabs && (
          <div className="flex justify-center flex-wrap gap-3 mb-8">
            {COURSES.map((course, idx) => {
              const isActive = activeCourse === course.id;
              return (
                <motion.button
                  key={course.id}
                  onClick={() => setActiveCourse(course.id)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
                    isActive 
                      ? `bg-white border-2 border-[#2563EB] shadow-md shadow-blue-500/10` 
                      : `bg-white border border-[#E2E8F0] hover:border-blue-200 hover:shadow-xs`
                  }`}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2563EB]"></div>
                  )}
                  <div className="w-9 h-9 rounded-full flex overflow-hidden items-center justify-center text-sm shadow-xs shrink-0">
                    <img 
                      src={course.image} 
                      alt={course.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-left">
                    <div className={`font-bold text-sm leading-none ${isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                      {course.name}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Non-admin student locked class pill */}
        {!isAdmin && (
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border-2 border-[#2563EB] shadow-md shadow-blue-500/10 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2563EB]"></div>
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                <img 
                  src={currentCourse.image} 
                  alt={currentCourse.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider">YOUR ASSIGNED CLASS</span>
                <div className="font-extrabold text-[#0F172A] text-base leading-tight">
                  {currentCourse.name} ({leaderboardData.length} Students)
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Left Column (Leaderboard Table) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col h-full">
              
              {/* Card Header with Search and Weekly Filter Dropdown */}
              <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </div>
                  Top Students – <span className="text-[#2563EB]">{currentCourse.name}</span>
                  <span className="text-xs font-bold bg-blue-50 text-[#2563EB] px-2.5 py-0.5 rounded-full border border-blue-200">
                    {filteredLeaderboard.length}
                  </span>
                </h3>

                <div className="flex items-center gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..." 
                      className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] w-[140px] md:w-[180px] transition-all"
                    />
                  </div>

                  {/* Weekly Filter Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-xs cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {filter} <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden py-1">
                        {(['This Week', 'This Month', 'All Time'] as const).map((f) => (
                          <button 
                            key={f}
                            type="button"
                            onClick={() => {
                              setFilter(f);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer ${
                              filter === f ? 'text-[#2563EB] bg-blue-50/80 font-bold' : 'text-[#64748B]'
                            }`}
                          >
                            <span>{f}</span>
                            {filter === f && <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Body - Shows all students in the folder (e.g. all 14 in IELTS 1, all 12 in IELTS 2) */}
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
                      key={`${activeCourse}-${filter}-${searchQuery}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-1"
                    >
                      {filteredLeaderboard.map((student, index) => {
                        const rank = index + 1;
                        let rankDisplay = <span className="text-[#64748B] font-bold text-base w-8 text-center">{rank}</span>;
                        
                        if (rank === 1) {
                          rankDisplay = (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-white flex items-center justify-center font-bold shadow-xs">
                              1
                            </div>
                          );
                        } else if (rank === 2) {
                          rankDisplay = (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 text-white flex items-center justify-center font-bold shadow-xs">
                              2
                            </div>
                          );
                        } else if (rank === 3) {
                          rankDisplay = (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
                              3
                            </div>
                          );
                        }

                        const viewUrl = student.course === 'PET'
                          ? `/pet/dashboard?userId=${student.uid}`
                          : `/ielts/dashboard?userId=${student.uid}`;

                        return (
                          <div 
                            key={student.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50/90 rounded-2xl transition-colors group"
                          >
                            {/* Student Rank, Real Avatar (or Initial Circle) & Name */}
                            <div className="flex items-center gap-4 w-[280px]">
                              <div className="flex items-center justify-center w-10">
                                {rankDisplay}
                              </div>

                              {/* Avatar: ONLY real u.photoURL from Firestore or clean initial letter circle (never generated) */}
                              <div className="relative shrink-0">
                                {student.photoURL ? (
                                  <>
                                    <img 
                                      src={student.photoURL} 
                                      alt={student.name} 
                                      className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200 shrink-0" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                    <div 
                                      className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 items-center justify-center font-bold text-sm border border-blue-200 shrink-0 hidden"
                                    >
                                      {student.initialLetter}
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
                                    {student.initialLetter}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-[#0F172A] whitespace-nowrap truncate flex items-center gap-1.5">
                                  <span>{student.name}</span>
                                  {student.nickname && (
                                    <span className="text-blue-600 italic font-normal text-xs">
                                      "{student.nickname}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Student Badge (if any) */}
                            <div className="flex-1 flex justify-start pl-4 min-w-[120px]">
                              {student.badge ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${student.badgeColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                  {student.badge}
                                </span>
                              ) : null}
                            </div>

                            {/* Exact Overall Band & Streak */}
                            <div className="flex items-center justify-end gap-8 pr-4">
                              <div className="flex items-center gap-1.5 w-24 justify-end">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                                <span className="font-bold text-[#0F172A]">{student.overallBand.toFixed(1)}</span>
                                <span className="text-[10px] font-bold text-[#64748B] uppercase">BAND</span>
                              </div>
                              
                              <div className="flex items-center justify-end gap-1.5 w-20">
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
                                <span className="font-bold text-[#0F172A]">{student.streak}</span>
                                <span className="text-xs text-[#64748B] font-medium">days</span>
                              </div>

                              {isAdmin ? (
                                <Link
                                  to={viewUrl}
                                  title={`View ${student.name}'s Dashboard`}
                                  className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors cursor-pointer"
                                >
                                  <Trophy className="w-4 h-4" />
                                </Link>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                  <Trophy className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {filteredLeaderboard.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          {searchQuery.trim()
                            ? `No students found matching "${searchQuery}"`
                            : `No students found in ${currentCourse.name}`}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-5 border-t border-[#E2E8F0] flex items-center justify-between">
                <Link 
                  to="/courses/IELTS" 
                  className="text-[#2563EB] font-bold text-sm hover:underline flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  View Full Leaderboard ({leaderboardData.length} Students)
                  <ChevronRight className="w-4 h-4 ml-1 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (Trophy Card) */}
          <div className="lg:col-span-4 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] rounded-3xl p-8 border border-[#E2E8F0] shadow-xs flex flex-col h-full relative overflow-hidden"
            >
              {/* Confetti particles */}
              <div className="absolute top-10 left-10 w-2 h-2 rounded-xs bg-blue-400 rotate-12"></div>
              <div className="absolute top-20 right-16 w-2 h-2 rounded-xs bg-yellow-400 -rotate-12"></div>
              <div className="absolute top-16 left-1/3 w-1.5 h-1.5 rounded-xs bg-purple-400 rotate-45"></div>
              <div className="absolute top-8 right-1/3 w-2 h-2 rounded-xs bg-green-400 rotate-45"></div>

              <div className="text-center mb-8 pt-4">
                {/* Podium Illustration with 2, 1 with Trophy, 3 */}
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
                <p className="text-[#64748B] text-sm leading-relaxed px-4">
                  Complete lessons, practice daily and climb to the top!
                </p>
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
