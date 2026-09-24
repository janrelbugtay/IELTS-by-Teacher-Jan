import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, OperationType, Submission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { handleFirestoreError } from '../lib/errorHandler';
import { Plus, Users, FileText, LayoutDashboard, Activity, Clock, Globe, Edit2, X, Camera, Folder, Trophy, Search, Calendar, Star, Flame, BookOpen, Target, TrendingUp, BarChart2, Medal, ChevronRight, UserPlus, Key, Copy, CheckCircle2, FolderInput, Layers, Shield, Trash2, ArrowRight } from 'lucide-react';
import { format, subDays, subMinutes } from 'date-fns';

import { CreateStudentModal } from '../components/CreateStudentModal';
import { CourseFolderSection } from '../components/CourseFolderSection';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { MoveStudentModal } from '../components/MoveStudentModal';
import { TrashBinModal } from '../components/TrashBinModal';
import { CourseFolder } from '../types';

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
  const [selectedFolderIdForCreation, setSelectedFolderIdForCreation] = useState<string | null>(null);
  const [selectedFolderNameForCreation, setSelectedFolderNameForCreation] = useState<string | null>(null);
  const [isCourseLockedForCreation, setIsCourseLockedForCreation] = useState(false);

  // Folder management state
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderCourseTarget, setFolderCourseTarget] = useState<string>('IELTS');
  const [folderParentTarget, setFolderParentTarget] = useState<CourseFolder | null>(null);

  // Move student modal state
  const [studentToMove, setStudentToMove] = useState<any | null>(null);
  const [studentsToBatchMove, setStudentsToBatchMove] = useState<any[] | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

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
  const [isTrashBinModalOpen, setIsTrashBinModalOpen] = useState(false);

  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleOpenCreateStudent = (courseName?: string, folderId?: string | null, folderName?: string | null, lock: boolean = false) => {
    setSelectedCourseForCreation(courseName || 'IELTS');
    setSelectedFolderIdForCreation(folderId || null);
    setSelectedFolderNameForCreation(folderName || null);
    setIsCourseLockedForCreation(lock);
    setIsCreateStudentModalOpen(true);
  };

  const handleOpenCreateFolder = (courseName: string, parentFolder?: CourseFolder | null) => {
    setFolderCourseTarget(courseName);
    setFolderParentTarget(parentFolder || null);
    setIsCreateFolderModalOpen(true);
  };

  const handleOpenMoveStudent = (student: any) => {
    setStudentToMove(student);
    setStudentsToBatchMove(null);
    setIsMoveModalOpen(true);
  };

  const handleOpenBatchMoveStudents = (students: any[]) => {
    setStudentsToBatchMove(students);
    setStudentToMove(null);
    setIsMoveModalOpen(true);
  };

  const handleStudentsMoved = (studentIds: string[], newCourse: string, newFolderId: string | null, newFolderName: string | null) => {
    setUsersList(prev => prev.map(u => {
      if (studentIds.includes(u.id)) {
        return {
          ...u,
          course: newCourse,
          folderId: newFolderId,
          folderName: newFolderName
        };
      }
      return u;
    }));
  };

  const handleGenerateCredentials = async (u: any) => {
    try {
      const firstName = u.firstName || u.name?.split(' ')[0] || u.nickname || 'Student';
      const lastName = u.lastName || u.name?.split(' ').slice(1).join('') || '';
      const course = u.course || 'IELTS';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      const prefix = course.substring(0, 3).toUpperCase();
      
      const studentId = u.studentId || `${prefix}-${year}-${randomNum}`;
      
      const baseUsername = `${(firstName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}${(lastName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const username = u.username || (baseUsername || `student${randomNum}`);
      
      const cleanFirstName = (firstName || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
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
    const targetUser = usersList.find(u => u.id === userId);
    if (targetUser?.course === 'IELTS' && newCourse !== 'IELTS') {
      alert('IELTS students can only be moved within the IELTS folder.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', userId), {
        course: newCourse,
        folderId: null,
        folderName: null
      }, { merge: true });
      
      setUsersList(prev => prev.map(u => u.id === userId ? {
        ...u,
        course: newCourse,
        folderId: null,
        folderName: null
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

    // Listen to Folders in real-time
    const unsubFolders = onSnapshot(collection(db, 'folders'), (snapshot) => {
      const data: CourseFolder[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as CourseFolder);
      });
      setFolders(data);
    }, (err) => {
      console.warn("Error listening to folders", err);
    });

    // Listen to Users in real-time
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      let total = 0, onlineNow = 0, activeToday = 0, activeThisWeek = 0, newThisMonth = 0;
      const fetchedUsers: any[] = [];
      
      const now = new Date();
      const fiveMinsAgo = subMinutes(now, 5);
      const startOfDay = new Date(now.setHours(0,0,0,0));
      const startOfWeek = subDays(startOfDay, 7);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedUsers.push({ id: doc.id, ...data });

        // Only count active users in platform stats
        if (!data.isDeleted) {
          total++;
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
        }
      });

      setUserStats({ total, onlineNow, activeToday, activeThisWeek, newThisMonth });
      setUsersList(fetchedUsers);
    }, (err) => {
      console.warn("Error listening to users", err);
    });

    return () => {
      unsubscribe();
      subUnsubscribe();
      unsubFolders();
      unsubUsers();
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
      // Soft-delete to Trash Bin
      await setDoc(doc(db, 'users', userToDelete), {
        isDeleted: true,
        deletedAt: Date.now()
      }, { merge: true });
      setUserToDelete(null);
    } catch (err) {
      console.error("Error moving user to trash", err);
      setUserToDelete(null);
    }
  };

  const handleRestoreStudent = async (studentId: string) => {
    try {
      await setDoc(doc(db, 'users', studentId), {
        isDeleted: false,
        deletedAt: null
      }, { merge: true });
    } catch (err) {
      console.error('Failed to restore student', err);
    }
  };

  const handleRestoreFolder = async (folderId: string) => {
    try {
      await setDoc(doc(db, 'folders', folderId), {
        isDeleted: false,
        deletedAt: null
      }, { merge: true });
    } catch (err) {
      console.error('Failed to restore folder', err);
    }
  };

  const handlePermanentDeleteStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
    } catch (err) {
      console.error('Failed to permanently delete student', err);
    }
  };

  const handlePermanentDeleteFolder = async (folderId: string) => {
    try {
      await deleteDoc(doc(db, 'folders', folderId));
    } catch (err) {
      console.error('Failed to permanently delete folder', err);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const deletedStudents = usersList.filter(u => u.isDeleted);
      const deletedFolders = folders.filter(f => f.isDeleted);
      await Promise.all([
        ...deletedStudents.map(s => deleteDoc(doc(db, 'users', s.id))),
        ...deletedFolders.map(f => deleteDoc(doc(db, 'folders', f.id)))
      ]);
    } catch (err) {
      console.error('Failed to empty trash', err);
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
            <h2 className="text-3xl font-serif text-natural-900">Courses & Folders</h2>
            <p className="text-natural-700 mt-1">Manage Cambridge English courses, subfolders, and student folder assignments.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
          {['Pre-Starter', 'Starter', 'Movers', 'Flyers', 'KET', 'PET', 'IELTS'].map((courseName) => {
            const courseUsers = usersList.filter(u => !u.isDeleted && u.course === courseName);
            const isExpanded = expandedCourse === courseName;
            
            return (
              <CourseFolderSection
                key={courseName}
                courseName={courseName}
                courseUsers={courseUsers}
                allFolders={folders.filter(f => !f.isDeleted)}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedCourse(isExpanded ? null : courseName)}
                onOpenCreateStudent={handleOpenCreateStudent}
                onOpenMoveStudent={handleOpenMoveStudent}
                onOpenBatchMoveStudents={handleOpenBatchMoveStudents}
                onGenerateCredentials={handleGenerateCredentials}
                onOpenCreateFolder={handleOpenCreateFolder}
              />
            );
          })}

          {/* Trash Bin Card - Positioned right next to IELTS */}
          <div 
            onClick={() => setIsTrashBinModalOpen(true)}
            className="group relative flex flex-col justify-between bg-white rounded-3xl border border-rose-200/90 hover:border-rose-400 shadow-sm hover:shadow-xl hover:shadow-rose-100 transition-all duration-300 -translate-y-0 hover:-translate-y-1.5 cursor-pointer overflow-hidden p-6 select-none"
          >
            {/* Physical Folder Top Tab Ear */}
            <div className="absolute top-0 left-6 flex items-center">
              <div className="h-2.5 w-24 rounded-b-lg bg-rose-500 shadow-xs"></div>
            </div>

            {/* Ambient Top Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-rose-500 to-red-600 opacity-[0.08] group-hover:opacity-[0.16] transition-opacity blur-2xl pointer-events-none"></div>

            {/* Card Content Top */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-4 mt-1">
                {/* Tactile Trash Icon */}
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Trash2 className="w-8 h-8 text-rose-600 transition-transform group-hover:scale-110" />
                </div>

                {/* Recycle Bin Tag */}
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 shadow-2xs">
                    Recycle Bin
                  </span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="mb-4">
                <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors tracking-tight flex items-center gap-2">
                  Trash Bin
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Restore or Delete Permanently
                </p>
              </div>
            </div>

            {/* Stats & Folder Metadata Badges */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Student Count Pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/70 group-hover:bg-rose-50 group-hover:text-rose-700 group-hover:border-rose-200 transition-colors">
                  <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600" />
                  <span>{usersList.filter(u => u.isDeleted).length}</span>
                  <span className="font-normal text-slate-500 text-[11px]">students</span>
                </span>

                {/* Folders Count Pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/70 group-hover:bg-slate-200/60 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{folders.filter(f => f.isDeleted).length}</span>
                  <span className="font-normal text-slate-500 text-[11px]">folders</span>
                </span>
              </div>

              {/* Interactive Arrow Indicator */}
              <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-rose-600 transition-all pl-2 shrink-0">
                <span className="hidden sm:inline text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
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
            onClick={() => handleOpenCreateStudent('IELTS', null, null, false)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E4DB7] text-white font-bold rounded-xl shadow-sm hover:bg-blue-800 transition-colors cursor-pointer"
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
                  <th className="px-6 py-4 font-bold">Folder</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold">Last Active</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-natural-200">
                {usersList.filter(u => !u.isDeleted).map((u) => {
                  const createdStr = u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM d, yyyy') : (typeof u.createdAt === 'number' ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A');
                  const activeStr = u.lastActive?.toDate ? format(u.lastActive.toDate(), 'MMM d, yyyy HH:mm') : (typeof u.lastActive === 'number' ? format(new Date(u.lastActive), 'MMM d, yyyy HH:mm') : 'N/A');
                  const isUserIelts = u.course === 'IELTS';
                  const assignedFolderName = u.folderName || (u.folderId ? folders.find(f => f.id === u.folderId)?.name : null) || 'Main Folder';

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
                        <div className="flex items-center gap-1.5">
                          <select
                            value={u.course || ''}
                            onChange={(e) => handleUpdateUserCourse(u.id, e.target.value)}
                            className={`bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 ${
                              isUserIelts ? 'font-bold text-blue-700 bg-blue-50/50' : ''
                            }`}
                            title={isUserIelts ? 'IELTS students can only be moved within the IELTS folder' : undefined}
                          >
                            <option value="" disabled={isUserIelts}>None</option>
                            <option value="Pre-Starter" disabled={isUserIelts}>Pre-Starter</option>
                            <option value="Starter" disabled={isUserIelts}>Starter</option>
                            <option value="Movers" disabled={isUserIelts}>Movers</option>
                            <option value="Flyers" disabled={isUserIelts}>Flyers</option>
                            <option value="KET" disabled={isUserIelts}>KET</option>
                            <option value="PET" disabled={isUserIelts}>PET</option>
                            <option value="IELTS">IELTS</option>
                          </select>
                          {isUserIelts && (
                            <span title="IELTS students are locked to IELTS" className="text-blue-600">
                              <Shield className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                          <Folder className="w-3.5 h-3.5 text-blue-500" />
                          <span className="truncate max-w-[130px]">{assignedFolderName}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-natural-600">{createdStr}</td>
                      <td className="px-6 py-4 text-sm text-natural-600">{activeStr}</td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {/* Move Student Button */}
                        <button
                          onClick={() => handleOpenMoveStudent(u)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Move student to folder"
                        >
                          <FolderInput className="w-3.5 h-3.5" /> Move
                        </button>
                        <button 
                          onClick={() => {
                            setEditingUser(u);
                            setEditNickname(u.name || u.nickname || u.displayName || '');
                            setEditPhotoURL(u.photoURL || '');
                            setEditMotto(u.motto || '');
                          }}
                          className="text-amber-600 hover:text-amber-800 font-bold text-sm px-3 py-1 rounded border border-transparent hover:border-amber-200 hover:bg-amber-50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => setUserToDelete(u.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded border border-transparent hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {usersList.filter(u => !u.isDeleted).length === 0 && (
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
          defaultFolderId={selectedFolderIdForCreation}
          defaultFolderName={selectedFolderNameForCreation}
          lockCourse={isCourseLockedForCreation}
          folders={folders.filter(f => !f.isDeleted)}
          onClose={() => {
            setIsCreateStudentModalOpen(false);
            setSelectedCourseForCreation(undefined);
            setSelectedFolderIdForCreation(null);
            setSelectedFolderNameForCreation(null);
            setIsCourseLockedForCreation(false);
          }}
          onSuccess={() => {
            // Updated via real-time onSnapshot listener
          }}
        />
      )}

      {isCreateFolderModalOpen && (
        <CreateFolderModal
          course={folderCourseTarget}
          parentFolder={folderParentTarget}
          availableFolders={folders.filter(f => !f.isDeleted)}
          onClose={() => {
            setIsCreateFolderModalOpen(false);
            setFolderParentTarget(null);
          }}
          onCreated={(newFolder) => {
            setFolders(prev => [...prev.filter(f => f.id !== newFolder.id), newFolder]);
          }}
        />
      )}

      {isMoveModalOpen && (studentToMove || (studentsToBatchMove && studentsToBatchMove.length > 0)) && (
        <MoveStudentModal
          student={studentToMove}
          students={studentsToBatchMove || undefined}
          folders={folders.filter(f => !f.isDeleted)}
          onClose={() => {
            setIsMoveModalOpen(false);
            setStudentToMove(null);
            setStudentsToBatchMove(null);
          }}
          onMoved={handleStudentsMoved}
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">Move Student to Trash</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Are you sure you want to move this student to the Trash Bin? You can restore them anytime or permanently delete them from the Trash Bin.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 text-slate-700 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="flex-1 py-2 bg-rose-600 text-white font-bold hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash Bin Modal for Restoring and Permanently Deleting */}
      <TrashBinModal
        isOpen={isTrashBinModalOpen}
        onClose={() => setIsTrashBinModalOpen(false)}
        deletedStudents={usersList.filter(u => u.isDeleted)}
        deletedFolders={folders.filter(f => f.isDeleted)}
        onRestoreStudent={handleRestoreStudent}
        onRestoreFolder={handleRestoreFolder}
        onPermanentDeleteStudent={handlePermanentDeleteStudent}
        onPermanentDeleteFolder={handlePermanentDeleteFolder}
        onEmptyTrash={handleEmptyTrash}
      />
    </div>
  );
}
