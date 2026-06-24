import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, Submission, OperationType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router';
import { handleFirestoreError } from '../lib/errorHandler';
import { FileText, Headphones, PenTool, Book, Mic, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for results tab
  const [filterType, setFilterType] = useState('all');
  const [filterSort, setFilterSort] = useState('desc');
  const [expandedWritingIds, setExpandedWritingIds] = useState<Record<string, boolean>>({});
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Auto-clear January writing test content per user request
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ielts_writing_progress_3');
        localStorage.removeItem('ielts_writing_progress_1');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Auto-delete January mock test submission from db to fully wipe the content
    getDocs(query(collection(db, 'submissions'), where('userId', '==', user.uid))).then(snap => {
        snap.forEach(d => {
            if (d.data().assignmentId === '3' || (d.data().title || '').includes('January Writing')) {
                deleteDoc(doc(db, 'submissions', d.id)).catch(console.error);
            }
        });
    }).catch(console.error);

    // Fetch assignments
    const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
    const unsubscribeAssignments = onSnapshot(q, (snapshot) => {
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

    // Fetch user's submissions
    const qSub = query(collection(db, 'submissions'), where('userId', '==', user.uid));
    const unsubscribeSubmissions = onSnapshot(qSub, (snapshot) => {
      const data: Submission[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        data.push({ 
          id: doc.id, 
          ...d,
          createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (typeof d.createdAt === 'number' ? d.createdAt : Date.now())
        } as Submission);
      });
      // sort desc in memory
      data.sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
      setSubmissions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });
    
    return () => {
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 w-full max-w-sm">
            <div className="h-10 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-1/2"></div>
          </div>
          <div className="w-full md:w-48 h-24 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'reading': return <Book className="w-6 h-6 text-[#1E4DB7]" />;
      case 'listening': return <Headphones className="w-6 h-6 text-teal-600" />;
      case 'writing': return <PenTool className="w-6 h-6 text-[#F4A340]" />;
      case 'speaking': return <Mic className="w-6 h-6 text-purple-600" />;
      default: return <FileText className="w-6 h-6 text-slate-600" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'reading': return 'text-[#1E4DB7]';
      case 'listening': return 'text-teal-600';
      case 'writing': return 'text-[#F4A340]';
      case 'speaking': return 'text-purple-600';
      default: return 'text-slate-600';
    }
  };
  
  // Analytics Calculations
  const getSubmissionsByType = (type: string) => submissions.filter((s) => s.assignmentType === type || (!s.assignmentType && assignments.find(a => a.id === s.assignmentId)?.type === type));

  const averageScore = (subs: Submission[]) => {
    const scored = subs.filter(s => s.bandScore !== undefined);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, curr) => acc + (curr.bandScore || 0), 0);
    return Math.round((sum / scored.length) * 2) / 2; // round to nearest 0.5
  };

  const handleDeleteTest = async (submissionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In iframe, window.confirm might be blocked. Using a custom approach or direct delete.
    setDeleteError(null);
    setTestToDelete(submissionId);
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'submissions', testToDelete));
      setTestToDelete(null);
    } catch (err: any) {
      console.error("Error deleting test:", err);
      setDeleteError(err.message || "Failed to delete test. It may be due to permission settings.");
    } finally {
      setIsDeleting(false);
    }
  };

  const readingSubs = getSubmissionsByType('reading');
  const listeningSubs = getSubmissionsByType('listening');
  const writingSubs = getSubmissionsByType('writing');
  const speakingSubs = getSubmissionsByType('speaking');

  const rScore = averageScore(readingSubs);
  const lScore = averageScore(listeningSubs);
  const wScore = averageScore(writingSubs);
  const sScore = averageScore(speakingSubs);

  const overallBand = () => {
    let scores = [rScore, lScore, wScore, sScore].filter(s => s > 0);
    if (scores.length === 0) return 0.0;
    const avg = scores.reduce((a,b)=>a+b, 0) / scores.length;
    return Math.round(avg * 2) / 2;
  }

  const pendingCount = assignments.length - submissions.length;
  const firstName = user?.displayName?.split(' ')[0] || 'Student';

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">
      
      {/* Welcome area */}
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#1E4DB7] bg-blue-50 px-3 py-1.5 rounded-full inline-block mb-3 border border-blue-100">
            Student Profile
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">Welcome back, {firstName}</h1>
          <p className="text-slate-600 text-lg">
            Track your progress and continue your journey to Band 7.5.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-left bg-slate-50 p-6 rounded-2xl border border-slate-200 min-w-[160px]">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Band</div>
            <div className="text-4xl font-bold text-slate-900 inline-block align-baseline">{overallBand().toFixed(1)}</div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-hide">
        <Link to="/dashboard?tab=overview" className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${currentTab === 'overview' ? 'border-[#1E4DB7] text-[#1E4DB7]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Overview</Link>
        <Link to="/dashboard?tab=results" className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${currentTab === 'results' ? 'border-[#1E4DB7] text-[#1E4DB7]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Previous Results</Link>
        <Link to="/dashboard?tab=writing" className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${currentTab === 'writing' ? 'border-[#1E4DB7] text-[#1E4DB7]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Writing Portfolio</Link>
        <Link to="/dashboard?tab=speaking" className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${currentTab === 'speaking' ? 'border-[#1E4DB7] text-[#1E4DB7]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Speaking Recordings</Link>
        <Link to="/classes" className="px-5 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 whitespace-nowrap transition-colors">My Classes</Link>
      </div>

      {currentTab === 'overview' && (
      <>
        {/* Statistics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-shadow text-white">
          <div className="font-bold uppercase tracking-widest text-slate-400 text-xs mb-1">Total Practice</div>
          <div className="text-4xl font-bold mb-4">{submissions.length} <span className="text-xl text-slate-500 font-medium">tests</span></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-[#1E4DB7]">Reading</span>
            <span className="text-3xl font-bold text-slate-900">{rScore > 0 ? rScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-auto overflow-hidden">
            <div className="bg-[#1E4DB7] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(rScore/9)*100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-teal-600">Listening</span>
            <span className="text-3xl font-bold text-slate-900">{lScore > 0 ? lScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-auto overflow-hidden">
            <div className="bg-teal-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(lScore/9)*100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-[#F4A340]">Writing</span>
            <span className="text-3xl font-bold text-slate-900">{wScore > 0 ? wScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-auto overflow-hidden">
            <div className="bg-[#F4A340] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(wScore/9)*100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-purple-600">Speaking</span>
            <span className="text-3xl font-bold text-slate-900">{sScore > 0 ? sScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-auto overflow-hidden">
            <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(sScore/9)*100}%` }}></div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          <button onClick={() => navigate('/dashboard?tab=results')} className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
            View History <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No recent activity yet.</td>
                  </tr>
                ) : submissions.slice(0, 5).map((sub) => {
                  const assignment = assignments.find(a => a.id === sub.assignmentId);
                  const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                  const type = sub.assignmentType || assignment?.type || 'reading';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/results/${sub.id}`)}>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${type === 'reading' ? 'bg-blue-50 text-[#1E4DB7]' : type === 'listening' ? 'bg-teal-50 text-teal-600' : type === 'writing' ? 'bg-orange-50 text-[#F4A340]' : 'bg-purple-50 text-purple-600'}`}>
                          {getIcon(type)} <span className="capitalize">{type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 hidden sm:table-cell">
                        {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy') : ''}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right">
                        {sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toFixed(1) : 'Pending'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Assignments Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">My Practice Assignments</h2>
          <button className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
            Browse Library <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl whitespace-nowrap">Assigned by Teacher</button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-xl whitespace-nowrap transition-colors">In Progress Tests</button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-xl whitespace-nowrap transition-colors">Completed Tests</button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-xl whitespace-nowrap transition-colors">My Writing Portfolio</button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.length === 0 ? (
            <div className="col-span-1 py-16 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">No assigned class work</h3>
              <p className="text-slate-600 max-w-sm mx-auto">When your teacher posts new practice tasks, they will appear right here.</p>
            </div>
          ) : (
            assignments.map((assignment) => {
              const isCompleted = submissions.some(s => s.assignmentId === assignment.id);
              
              return (
                <Link
                  key={assignment.id}
                  to={`/assignment/${assignment.id}`}
                  className="group relative flex flex-col bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                      {getIcon(assignment.type)}
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <div className="bg-slate-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-slate-700" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{assignment.title}</h3>
                  <p className="text-slate-600 line-clamp-2 mb-8 flex-1">
                    {assignment.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className={`font-bold uppercase tracking-widest ${getTypeStyle(assignment.type)}`}>{assignment.type}</span>
                    {assignment.createdAt && (
                      <span className="font-semibold text-slate-500">
                        {assignment.createdAt ? format(assignment.createdAt, 'MMM d, yyyy') : 'N/A'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
      </>
      )}

      {currentTab === 'results' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
             <h2 className="text-xl font-bold text-slate-900">All Completed Tests</h2>
             <div className="flex gap-2">
                 <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-[#1E4DB7] shadow-sm">
                     <option value="all">All Skills</option>
                     <option value="reading">Reading</option>
                     <option value="listening">Listening</option>
                     <option value="writing">Writing</option>
                     <option value="speaking">Speaking</option>
                 </select>
                 <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} className="bg-white border border-slate-300 text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-[#1E4DB7] shadow-sm">
                     <option value="desc">Newest First</option>
                     <option value="asc">Oldest First</option>
                 </select>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Completed</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Time Spent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">Feedback</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Band Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                     <td colSpan={7} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium">No results found.</p>
                     </td>
                  </tr>
                ) : (() => {
                    let filtered = filterType === 'all' ? [...submissions] : submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type) === filterType);
                    if (filterSort === 'asc') filtered.reverse();
                    
                    if (filtered.length === 0) {
                        return (
                          <tr>
                             <td colSpan={7} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                <p className="text-sm font-medium">No results match your filters.</p>
                             </td>
                          </tr>
                        );
                    }
                    return filtered.map((sub) => {
                  const assignment = assignments.find(a => a.id === sub.assignmentId);
                  const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                  const type = sub.assignmentType || assignment?.type || 'reading';
                  const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => navigate(`/results/${sub.id}`)}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${type === 'reading' ? 'bg-blue-50 text-[#1E4DB7]' : type === 'listening' ? 'bg-teal-50 text-teal-600' : type === 'writing' ? 'bg-orange-50 text-[#F4A340]' : 'bg-purple-50 text-purple-600'}`}>
                          {getIcon(type)} <span className="capitalize">{type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                        {sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                         {hasFeedback ? (
                           <span className="inline-flex items-center bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200">Available</span>
                         ) : (
                           <span className="inline-flex items-center bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded border border-slate-200">Pending</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                        {sub.bandScore ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })})()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === 'writing' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <div className="p-3 bg-orange-100 rounded-xl">
                    <PenTool className="w-6 h-6 text-[#F4A340]" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Writing Portfolio</h2>
                    <p className="text-sm text-slate-500">Your submitted essays and teacher feedback</p>
                 </div>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Feedback</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Estimated Band</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type) === 'writing');
                    if (filtered.length === 0) {
                        return (
                          <tr>
                             <td colSpan={4} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                <PenTool className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No writing submissions yet.</p>
                             </td>
                          </tr>
                        );
                    }
                    return filtered.map((sub) => {
                      const assignment = assignments.find(a => a.id === sub.assignmentId);
                      const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                      const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                      
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => setExpandedWritingIds(prev => ({...prev, [sub.id as string]: !prev[sub.id as string]}))}>
                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-slate-900">{title}</p>
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                              {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                            </td>
                            <td className="px-6 py-5">
                               {hasFeedback ? (
                                 <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-200"><CheckCircle2 className="w-3.5 h-3.5"/> Reviewed</span>
                               ) : (
                                 <span className="inline-flex items-center bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-md border border-orange-200">Pending</span>
                               )}
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                              {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                          {expandedWritingIds[sub.id as string] && (
                            <tr>
                               <td colSpan={5} className="px-6 py-6 border-b border-t border-slate-100 bg-slate-50/50">
                                  <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
                                     <div className="flex justify-between items-center">
                                       <h4 className="font-bold text-slate-800 text-lg">Response Preview</h4>
                                       <div className="flex gap-3">
                                           <button onClick={() => navigate(`/results/${sub.id}`)} className="bg-blue-50 text-[#1E4DB7] px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">View Full Result</button>
                                           <button 
                                               onClick={async () => {
                                                   if (window.confirm('Are you sure you want to delete this test submission?')) {
                                                       try {
                                                           await deleteDoc(doc(db, 'submissions', sub.id as string));
                                                           setSubmissions(prev => prev.filter(s => s.id !== sub.id));
                                                       } catch (err) {
                                                           console.error('Failed to delete', err);
                                                       }
                                                   }
                                               }}
                                               className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                            >
                                               Delete
                                           </button>
                                       </div>
                                     </div>
                                     
                                     {(() => {
                                         if (typeof sub.answers === 'string') {
                                             try {
                                                 const parsed = JSON.parse(sub.answers);
                                                 return (
                                                   <div className="space-y-6">
                                                     {parsed.part1 && (
                                                         <div>
                                                             <h5 className="font-bold text-slate-700 mb-2 border-b pb-1">Part 1</h5>
                                                             <div className="p-5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                                                 {parsed.part1}
                                                             </div>
                                                         </div>
                                                     )}
                                                     {parsed.part2 && (
                                                         <div>
                                                             <h5 className="font-bold text-slate-700 mb-2 border-b pb-1">Part 2</h5>
                                                             <div className="p-5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                                                 {parsed.part2}
                                                             </div>
                                                         </div>
                                                     )}
                                                   </div>
                                                 );
                                             } catch (e) {
                                                 return <div className="p-5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap shadow-sm">{sub.answers}</div>;
                                             }
                                         }
                                         return <div className="p-5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm text-slate-400">N/A</div>;
                                     })()}
                                  </div>
                               </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === 'speaking' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <div className="p-3 bg-purple-100 rounded-xl">
                    <Mic className="w-6 h-6 text-purple-600" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Speaking Recordings</h2>
                    <p className="text-sm text-slate-500">Your past speaking sessions and teacher feedback</p>
                 </div>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Audio/Feedback</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Estimated Band</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type) === 'speaking');
                    if (filtered.length === 0) {
                        return (
                          <tr>
                             <td colSpan={5} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                <Mic className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No speaking submissions yet.</p>
                             </td>
                          </tr>
                        );
                    }
                    return filtered.map((sub) => {
                      const assignment = assignments.find(a => a.id === sub.assignmentId);
                      const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                      const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                      const hasAudio = !!sub.audioUrl;
                      
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => navigate(`/results/${sub.id}`)}>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                            {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                               {hasAudio ? (
                                   <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[11px] font-bold px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider">Audio</span>
                               ) : null}
                               {hasFeedback ? (
                                   <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider">Reviewed</span>
                               ) : (
                                   <span className="inline-flex items-center bg-orange-50 text-orange-600 text-[11px] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase tracking-wider">Pending</span>
                               )}
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                            {sub.bandScore ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {testToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Test Result</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this test result? This action cannot be undone and will affect your progress statistics.</p>
            
            {deleteError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {deleteError}
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={() => setTestToDelete(null)} 
                disabled={isDeleting}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTest} 
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete Test'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
