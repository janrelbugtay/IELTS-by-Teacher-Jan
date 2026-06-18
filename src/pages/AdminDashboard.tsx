import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, OperationType, Submission } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { handleFirestoreError } from '../lib/errorHandler';
import { Plus, Users, FileText, LayoutDashboard, Activity, Clock, Globe } from 'lucide-react';
import { format, subDays, subMinutes } from 'date-fns';

interface UserStats {
  total: number;
  onlineNow: number;
  activeToday: number;
  activeThisWeek: number;
  newThisMonth: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
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
        
        const now = new Date();
        const fiveMinsAgo = subMinutes(now, 5);
        const startOfDay = new Date(now.setHours(0,0,0,0));
        const startOfWeek = subDays(startOfDay, 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        usersSnap.forEach(doc => {
          total++;
          const data = doc.data();
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
            <div className="bg-white p-6 rounded-2xl border border-natural-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
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

    </div>
  );
}
