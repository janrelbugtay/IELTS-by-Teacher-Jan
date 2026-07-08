import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, OperationType, Submission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { handleFirestoreError } from '../lib/errorHandler';
import { Plus, Users, FileText, LayoutDashboard, Activity, Clock, Globe, Edit2, X, Camera, Folder, Trophy, Search, Calendar, Star, Flame, BookOpen, Target, TrendingUp, BarChart2, Medal, ChevronRight, UserPlus, Key, Copy, CheckCircle2 } from 'lucide-react';
import { format, subDays, subMinutes } from 'date-fns';

import { CreateStudentModal } from '../components/CreateStudentModal';

interface UserStats {
  total: number;
  onlineNow: number;
  activeToday: number;
  activeThisWeek: number;
  newThisMonth: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
  const [selectedCourseForCreation, setSelectedCourseForCreation] = useState<string | undefined>(undefined);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    onlineNow: 0,
    activeToday: 0,
    activeThisWeek: 0,
    newThisMonth: 0
  });

  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showOnlineUsersModal, setShowOnlineUsersModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [usersList, setUsersList] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCredentials = async (u: any) => {
    try {
      const firstName = u.firstName || u.name?.split(' ')[0] || u.nickname || 'Student';
      const lastName = u.lastName || u.name?.split(' ').slice(1).join('') || '';
      const course = u.course || 'IELTS';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const prefix = course.substring(0, 3).toUpperCase();
      
      const studentId = u.studentId || `${prefix}-${year}-${randomNum}`;
      
      const baseUsername = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const username = u.username || (baseUsername || `student${randomNum}`);
      
      const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
      const tempPassword = u.tempPassword || `${cleanFirstName}${randomNum}`;

      const userRef = doc(db, 'users', u.id);
      await updateDoc(userRef, {
        studentId,
        username,
        tempPassword,
        password: u.password || tempPassword,
        authEmail: u.authEmail || u.email || `${username}@student.era.edu`
      });

      setGeneratedCredentials({
        name: u.name || u.nickname || u.email || 'Student',
        studentId,
        username,
        tempPassword
      });

    } catch (err: any) {
      console.error(err);
      alert('Failed to generate credentials: ' + err.message);
    }
  };

  const handleCopyCredentials = () => {
    if (!generatedCredentials) return;
    const text = `
Student Credentials for ${generatedCredentials.name}
----------------------------------
Student ID: ${generatedCredentials.studentId}
Username: ${generatedCredentials.username}
Password: ${generatedCredentials.tempPassword}

Please log in and change your password immediately.
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await setDoc(doc(db, 'users', editingUser.id), {
        nickname: editNickname,
        photoURL: editPhotoURL,
        motto: editMotto,
      }, { merge: true });
      
      setUsersList(prev => prev.map(u => u.id === editingUser.id ? {
        ...u, 
        nickname: editNickname, 
        photoURL: editPhotoURL, 
        motto: editMotto
      } : u));
      
      setEditingUser(null);
    } catch (err: any) {
      console.error("Error updating user", err);
      alert("Error updating user: " + err.message);
    }
  };

  const handleUpdateUserCourse = async (userId: string, newCourse: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        course: newCourse
      }, { merge: true });
      
      setUsersList(prev => prev.map(u => u.id === userId ? {
        ...u,
        course: newCourse
      } : u));
    } catch (err: any) {
      console.error("Error updating user course", err);
      alert("Error updating user course: " + err.message);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen to Assignments
    const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Assignment[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        data.push({ 
            id: doc.id, 
            ...d,
            createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (typeof d.createdAt === 'number' ? d.createdAt : Date.now())
        } as Assignment);
      });
      setAssignments(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assignments');
      setLoading(false);
    });

    // Listen to all Submissions for analytics
    const subQ = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    const subUnsubscribe = onSnapshot(subQ, (snapshot) => {
      const data: Submission[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        data.push({ 
            id: doc.id, 
            ...d,
            createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (typeof d.createdAt === 'number' ? d.createdAt : Date.now())
        } as Submission);
      });
      setSubmissions(data);
    });

    // Fetch user stats
    const fetchUserStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let total = 0, onlineNow = 0, activeToday = 0, activeThisWeek = 0, newThisMonth = 0;
        const fetchedUsers: any[] = [];
        
        const now = new Date();
        const fiveMinsAgo = subMinutes(now, 5);
        const startOfDay = new Date(now.setHours(0,0,0,0));
        const startOfWeek = subDays(startOfDay, 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        usersSnap.forEach(doc => {
          total++;
          const data = doc.data();
          fetchedUsers.push({ id: doc.id, ...data });
          
          const lastActive = data.lastActive?.toDate ? data.lastActive.toDate() : (typeof data.lastActive === 'number' ? new Date(data.lastActive) : null);
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (typeof data.createdAt === 'number' ? new Date(data.createdAt) : null);

          if (lastActive) {
            if (lastActive >= fiveMinsAgo) onlineNow++;
            if (lastActive >= startOfDay) activeToday++;
            if (lastActive >= startOfWeek) activeThisWeek++;
          }
          if (createdAt && createdAt >= startOfMonth) {
            newThisMonth++;
          }
        });

        setUserStats({ total, onlineNow, activeToday, activeThisWeek, newThisMonth });
        setUsersList(fetchedUsers);
      } catch (err) {
        console.error("Error fetching user stats", err);
      }
    }
    
    // Poll stats more frequently or just fetch once
    fetchUserStats();
    const statInterval = setInterval(fetchUserStats, 60000);

    return () => {
      unsubscribe();
      subUnsubscribe();
      clearInterval(statInterval);
    };
  }, [user]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading Platform Analytics...</div>;
  }

  const firstName = user?.displayName?.split(' ')[0] || 'Teacher';

  const formatStat = (num: number) => num.toLocaleString();

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', userToDelete));
      setUsersList(prev => prev.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user", err);
      // fallback in case of error
      setUserToDelete(null);
    }
  };



  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-natural-900 text-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div>
          <div className="text-accent-green uppercase font-bold tracking-widest text-sm mb-2">Classroom & Analytics</div>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight">Welcome, {firstName}</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/image-generator" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-natural-900 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm"
          >
            <Camera className="w-5 h-5" /> Image Generator
          </Link>
          <Link 
            to="/classes/create" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-green text-white font-bold rounded-xl hover:bg-accent-green/90 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-5 h-5" /> New Assignment
          </Link>
        </div>
      </div>

      {/* User Tracking System */}
      <section>
         <h2 className="text-2xl font-bold text-natural-900 mb-6 flex items-center gap-2">
           <Activity className="w-6 h-6 text-[#1E4DB7]" /> User Tracking Analytics
         </h2>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center">
              <Users className="w-6 h-6 text-natural-400 mb-2"/>
              <div className="text-3xl font-black text-natural-900">{formatStat(userStats.total)}</div>
              <div className="text-xs font-bold text-natural-500 uppercase tracking-widest mt-1">Total Students</div>
            </div>
            <div 
              className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
              onClick={() => setShowOnlineUsersModal(true)}
            >
               <div className="absolute top-0 inset-x-0 h-1 bg-green-500"></div>
              <div className="relative">
                 <span className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <div className="text-3xl font-black text-natural-900">{formatStat(userStats.onlineNow)}</div>
              </div>
              <div className="text-xs font-bold text-natural-500 uppercase tracking-widest mt-1">Online Now</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center">
              <Clock className="w-6 h-6 text-natural-400 mb-2"/>
              <div className="text-3xl font-black text-natural-900">{formatStat(userStats.activeToday)}</div>
              <div className="text-xs font-bold text-natural-500 uppercase tracking-widest mt-1">Active Today</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center">
              <Activity className="w-6 h-6 text-natural-400 mb-2"/>
              <div className="text-3xl font-black text-natural-900">{formatStat(userStats.activeThisWeek)}</div>
              <div className="text-xs font-bold text-natural-500 uppercase tracking-widest mt-1">Active This Week</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center">
               <Globe className="w-6 h-6 text-natural-400 mb-2"/>
              <div className="text-3xl font-black text-[#1E4DB7]">{formatStat(userStats.newThisMonth)}</div>
              <div className="text-xs font-bold text-natural-500 uppercase tracking-widest mt-1">New this Month</div>
            </div>
         </div>
      </section>

      {/* Test Performance & Submission Stats */}
      <section>
         <h2 className="text-2xl font-bold text-natural-900 mb-6 flex items-center gap-2">
           <LayoutDashboard className="w-6 h-6 text-[#1E4DB7]" /> Platform Engagement
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm flex flex-col items-center text-center">
               <div className="p-4 bg-blue-50 rounded-full mb-4"><FileText className="w-8 h-8 text-blue-600"/></div>
               <div className="text-4xl font-black text-slate-900 mb-2">{submissions.filter(s => s.assignmentType === 'writing').length}</div>
               <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Essays Submitted</div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm flex flex-col items-center text-center">
               <div className="p-4 bg-purple-50 rounded-full mb-4"><Activity className="w-8 h-8 text-purple-600"/></div>
               <div className="text-4xl font-black text-slate-900 mb-2">{submissions.length}</div>
               <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Tests Completed</div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm flex flex-col items-center text-center">
               <div className="p-4 bg-orange-50 rounded-full mb-4"><Users className="w-8 h-8 text-orange-600"/></div>
               <div className="text-4xl font-black text-slate-900 mb-2">
                 {(() => {
                    const graded = submissions.filter(s => typeof s.bandScore === 'number' && s.bandScore > 0);
                    if (graded.length === 0) return 'N/A';
                    const avg = graded.reduce((acc, curr) => acc + (curr.bandScore || 0), 0) / graded.length;
                    return avg.toFixed(1);
                 })()}
               </div>
               <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Avg Platform Band</div>
            </div>
         </div>
      </section>

      {/* Assignment Library */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-serif text-natural-900">Assignment Library</h2>
            <p className="text-natural-700 mt-1">Manage tests and review student submissions.</p>
          </div>
        </div>
        
        {assignments.length === 0 ? (
          <div className="text-center py-16 bg-white border border-natural-200 rounded-3xl shadow-sm">
            <FileText className="w-12 h-12 text-natural-300 mx-auto mb-4" />
            <p className="text-natural-500 text-lg">No assignments created yet.</p>
            <Link 
              to="/classes/create" 
              className="inline-block mt-4 px-6 py-2 bg-natural-900 text-white rounded-lg font-bold"
            >
              Create First Assignment
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map(assignment => {
              const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
              
              return (
                <div 
                  key={assignment.id} 
                  className="bg-white border border-natural-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-natural-100 text-natural-900 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                         {assignment.type}
                       </span>
                       <span className="text-natural-500 text-sm">{assignment.createdAt ? format(assignment.createdAt, 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-natural-900 mb-2">{assignment.title}</h3>
                    <p className="text-natural-600 line-clamp-2 text-sm">{assignment.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-natural-200 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                    <div className="text-center w-24">
                       <div className="text-2xl font-black text-natural-900">{assignmentSubmissions.length}</div>
                       <div className="text-[10px] font-bold text-natural-500 uppercase tracking-widest">Submissions</div>
                    </div>
                    <Link 
                      to={`/assignment/${assignment.id}`}
                      className="flex-1 py-2 px-4 bg-natural-50 hover:bg-natural-100 text-natural-900 font-bold rounded-xl transition-colors text-center text-sm border border-natural-200"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Course Management */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-serif text-natural-900">Courses</h2>
            <p className="text-natural-700 mt-1">Manage Cambridge English courses.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {['Pre-Starter', 'Starter', 'Movers', 'Flyers', 'KET', 'PET', 'IELTS'].map((courseName) => {
            const courseUsers = usersList.filter(u => u.course === courseName);
            const isExpanded = expandedCourse === courseName;
            
            return (
            <div 
              key={courseName} 
              className="bg-white border-t-8 border-t-blue-500 border border-natural-200 rounded-2xl rounded-tl-sm shadow-sm hover:shadow-md transition-shadow flex flex-col relative mb-4"
            >
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setExpandedCourse(isExpanded ? null : courseName)}
              >
                <div className="absolute top-[-10px] left-0 bg-blue-500 h-[10px] w-1/3 rounded-t-lg"></div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold text-natural-900">{courseName}</h3>
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedCourseForCreation(courseName);
                        setIsCreateStudentModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                      title={`Create new student for ${courseName}`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Create Student
                    </button>
                    <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                      {courseUsers.length}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-natural-500 font-medium">{courseUsers.length} Student{courseUsers.length !== 1 ? 's' : ''}</p>
              </div>
              
              {isExpanded && (
                <div className="border-t border-natural-200">
                  {courseUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-natural-50 text-natural-600 text-[10px] uppercase tracking-wider border-b border-natural-200">
                            <th className="px-4 py-3 font-bold">Name / Email</th>
                            <th className="px-4 py-3 font-bold">Joined</th>
                            <th className="px-4 py-3 font-bold">Last Active</th>
                            <th className="px-4 py-3 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-natural-200">
                          {courseUsers.map(u => {
                            const createdStr = u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM d, yyyy') : (typeof u.createdAt === 'number' ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A');
                            const activeStr = u.lastActive?.toDate ? format(u.lastActive.toDate(), 'MMM d, yyyy HH:mm') : (typeof u.lastActive === 'number' ? format(new Date(u.lastActive), 'MMM d, yyyy HH:mm') : 'N/A');
                            return (
                              <tr key={u.id} className="hover:bg-natural-50 transition-colors text-sm">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {u.photoURL ? (
                                      <img src={u.photoURL || undefined} alt={u.firstName || u.name?.split(' ')[0] || u.nickname || 'User'} className="w-6 h-6 rounded-full object-cover border border-natural-200 shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-[10px] border border-blue-200 shadow-sm shrink-0">
                                        {(u.firstName || u.name?.split(' ')[0] || u.nickname || u.displayName || u.email || 'U')[0].toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-natural-900">
                                        {u.firstName || u.name?.split(' ')[0] || u.displayName || 'Unknown'}
                                        {u.nickname && <span className="text-blue-600 ml-1 italic font-normal">"{u.nickname}"</span>}
                                      </div>
                                      <div className="text-xs text-natural-500">{u.email || 'No email'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-natural-600">{createdStr}</td>
                                <td className="px-4 py-3 text-xs text-natural-600">{activeStr}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex flex-col xl:flex-row items-end xl:items-center justify-end gap-2">

                                  <div className="flex items-center justify-end gap-2 mt-1 xl:mt-0">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateCredentials(u);
                                      }}
                                      title="Generate Student Credentials"
                                      className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors inline-flex items-center gap-1 shadow-sm shrink-0"
                                    >
                                      <Key className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">Credentials</span><span className="sm:hidden">Creds</span>
                                    </button>
                                    <Link 
                                      to={`/ielts/dashboard?userId=${u.uid || u.id}`}
                                      className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors inline-flex items-center gap-1 shadow-sm shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                      title="View Dashboard"
                                    >
                                      <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> View
                                    </Link>
                                  </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-natural-400">No Students Yet</span>
                      <button
                        onClick={() => {
                          setSelectedCourseForCreation(courseName);
                          setIsCreateStudentModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Student
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      </section>



      {/* User Management */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-natural-900">User Management</h2>
            <p className="text-natural-700 mt-1">Manage platform users, view details, and create new student accounts.</p>
          </div>
          <button 
            onClick={() => setIsCreateStudentModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E4DB7] text-white font-bold rounded-xl shadow-sm hover:bg-blue-800 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Create Student
          </button>
        </div>
        
        <div className="bg-white border border-natural-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-natural-50 text-natural-600 text-xs uppercase tracking-wider border-b border-natural-200">
                  <th className="px-6 py-4 font-bold">Name / Email</th>
                  <th className="px-6 py-4 font-bold">Course</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold">Last Active</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-200">
                {usersList.map((u) => {
                  const createdStr = u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM d, yyyy') : (typeof u.createdAt === 'number' ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A');
                  const activeStr = u.lastActive?.toDate ? format(u.lastActive.toDate(), 'MMM d, yyyy HH:mm') : (typeof u.lastActive === 'number' ? format(new Date(u.lastActive), 'MMM d, yyyy HH:mm') : 'N/A');
                  return (
                    <tr key={u.id} className="hover:bg-natural-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-natural-900">
                          {u.firstName || u.name?.split(' ')[0] || u.displayName || 'Unknown'}
                          {u.nickname && <span className="text-blue-600 ml-1 italic font-normal">"{u.nickname}"</span>}
                        </div>
                        <div className="text-sm text-natural-500">{u.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.course || ''}
                          onChange={(e) => handleUpdateUserCourse(u.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                          <option value="">None</option>
                          <option value="Pre-Starter">Pre-Starter</option>
                          <option value="Starter">Starter</option>
                          <option value="Movers">Movers</option>
                          <option value="Flyers">Flyers</option>
                          <option value="KET">KET</option>
                          <option value="PET">PET</option>
                          <option value="IELTS">IELTS</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-natural-600">{createdStr}</td>
                      <td className="px-6 py-4 text-sm text-natural-600">{activeStr}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingUser(u);
                            setEditNickname(u.name || u.nickname || u.displayName || '');
                            setEditPhotoURL(u.photoURL || '');
                            setEditMotto(u.motto || '');
                          }}
                          className="text-amber-600 hover:text-amber-800 font-bold text-sm px-3 py-1 rounded border border-transparent hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => setUserToDelete(u.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {usersList.length === 0 && (
              <div className="p-8 text-center text-natural-500">No users found.</div>
            )}
          </div>
        </div>
      </section>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nickname</label>
                <input 
                  type="text" 
                  value={editNickname} 
                  onChange={e => setEditNickname(e.target.value)}
                  placeholder="e.g. Test Master"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Profile Photo URL</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Camera className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      value={editPhotoURL} 
                      onChange={e => {
                        let val = e.target.value;
                        if (val.includes('drive.google.com/file/d/')) {
                          const match = val.match(/\/d\/([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            val = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                          }
                        }
                        setEditPhotoURL(val);
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900"
                    />
                  </div>
                </div>
                {editPhotoURL && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-50">
                      <img src={editPhotoURL || undefined} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Motto</label>
                <textarea 
                  value={editMotto} 
                  onChange={e => setEditMotto(e.target.value)}
                  placeholder="e.g. Track your progress and continue your journey to Band 7.5. You're doing great!"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveUser} 
                  className="flex-1 py-3.5 bg-[#1E4DB7] text-white font-bold hover:bg-blue-800 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOnlineUsersModal && (
        <div className="fixed inset-0 bg-natural-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden scale-100 transition-transform">
            <div className="p-6 border-b border-natural-100 flex justify-between items-center bg-natural-50/50">
              <h2 className="text-xl font-bold text-natural-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Online Users
              </h2>
              <button 
                onClick={() => setShowOnlineUsersModal(false)}
                className="text-natural-400 hover:text-natural-600 p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {usersList.filter(u => {
                  const lastActive = u.lastActive?.toDate ? u.lastActive.toDate() : (typeof u.lastActive === 'number' ? new Date(u.lastActive) : null);
                  return lastActive && lastActive >= subMinutes(new Date(), 5);
                }).length === 0 ? (
                  <p className="text-center text-natural-500 py-8">No users currently online.</p>
                ) : (
                  usersList.filter(u => {
                    const lastActive = u.lastActive?.toDate ? u.lastActive.toDate() : (typeof u.lastActive === 'number' ? new Date(u.lastActive) : null);
                    return lastActive && lastActive >= subMinutes(new Date(), 5);
                  }).map(u => (
                    <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-natural-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden text-xl font-bold text-blue-600 uppercase">
                        {u.photoURL ? <img src={u.photoURL || undefined} alt={u.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.email || "U")}&background=f1f5f9&color=475569`; }} /> : (u.name || u.email || 'U')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-natural-900 truncate">{u.name || u.nickname || 'Unknown User'}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                            Online
                          </span>
                        </div>
                        <p className="text-sm text-natural-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isCreateStudentModalOpen && (
        <CreateStudentModal 
          defaultCourse={selectedCourseForCreation}
          onClose={() => {
            setIsCreateStudentModalOpen(false);
            setSelectedCourseForCreation(undefined);
          }}
          onSuccess={() => {
            // The user will be created and added to the users list in real-time or on next fetch
            // Let's just close the modal when they click Done in the success state (handled by modal)
          }}
        />
      )}

      {generatedCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Credentials Generated!</h3>
              <p className="text-slate-500 mt-2">Student credentials for <strong>{generatedCredentials.name}</strong></p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative mb-6">
              <button onClick={handleCopyCredentials} className="absolute top-4 right-4 p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 text-xs font-bold">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Credentials</h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-slate-500">Student ID</span>
                  <p className="text-lg font-bold text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">{generatedCredentials.studentId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Username</span>
                  <p className="text-lg font-bold text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">{generatedCredentials.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Temporary Password</span>
                  <p className="text-lg font-bold text-amber-600 font-mono bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block mt-1">{generatedCredentials.tempPassword}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setGeneratedCredentials(null)}
              className="w-full py-3.5 bg-[#1E4DB7] text-white font-bold hover:bg-blue-800 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this user? This will remove their profile from the database.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 text-slate-700 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="flex-1 py-2 bg-red-600 text-white font-bold hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
