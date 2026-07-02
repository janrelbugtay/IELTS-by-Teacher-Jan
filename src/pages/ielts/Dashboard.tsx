import { PerformanceTable } from '../../components/PerformanceTable';
import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Assignment, Submission, OperationType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { handleFirestoreError } from '../../lib/errorHandler';
import { FileText, Headphones, PenTool, Book, Mic, CheckCircle2, ArrowRight, Trash2, Edit2, X, Camera, Upload, PlayCircle, Plus, Link as LinkIcon, Share2 } from 'lucide-react';
import { format } from 'date-fns';

import { linkWithPopup, GoogleAuthProvider } from 'firebase/auth';

export function Dashboard({ isShared = false }: { isShared?: boolean }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkGoogle = async () => {
    if (!user) return;
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      alert("Google account linked successfully! You can now log in with Google.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to link Google account.");
    }
  };
  const { userId: urlUserId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  
  let targetUserId = (isAdmin && searchParams.get('userId')) ? searchParams.get('userId') : user?.uid;
  if (isShared && urlUserId) {
    targetUserId = urlUserId;
  }

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetUserName, setTargetUserName] = useState<string | null>(null);
  
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<string>('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkValue, setEditLinkValue] = useState<string>('');
  const [editingCorrectedLinkId, setEditingCorrectedLinkId] = useState<string | null>(null);
  const [editCorrectedLinkValue, setEditCorrectedLinkValue] = useState<string>('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const [uploadingSubmissionId, setUploadingSubmissionId] = useState<string | null>(null);

  const handleEditTitle = async (subId: string) => {
    if (!editTitleValue) {
      setEditingTitleId(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'submissions', subId), {
        assignmentTitle: editTitleValue
      });
      setEditingTitleId(null);
    } catch (err: any) {
      console.error("Error updating title:", err);
      alert("Failed to update title.");
    }
  };

  const handleEditScore = async (subId: string) => {
    if (!editScoreValue) {
      setEditingScoreId(null);
      return;
    }
    try {
      const score = parseFloat(editScoreValue);
      if (!isNaN(score)) {
        await updateDoc(doc(db, 'submissions', subId), {
          bandScore: score
        });
      }
      setEditingScoreId(null);
    } catch (err: any) {
      console.error("Error updating score:", err);
      alert("Failed to update score.");
    }
  };

  const handleLinkSave = async (subId: string, type: 'writing' | 'speaking') => {
    if (!editLinkValue) {
      setEditingLinkId(null);
      return;
    }
    setUploadingSubmissionId(subId);
    try {
      const updateData: any = {};
      if (type === 'speaking') {
        updateData.audioUrl = editLinkValue;
      } else {
        updateData.fileUrl = editLinkValue;
      }
      
      await updateDoc(doc(db, 'submissions', subId), updateData);
      setEditingLinkId(null);
    } catch (err: any) {
      console.error("Error updating link:", err);
      alert("Failed to update link.");
    } finally {
      setUploadingSubmissionId(null);
    }
  };

  const handleCorrectedLinkSave = async (subId: string) => {
    if (!editCorrectedLinkValue) {
      setEditingCorrectedLinkId(null);
      return;
    }
    setUploadingSubmissionId(subId);
    try {
      await updateDoc(doc(db, 'submissions', subId), { correctedFileUrl: editCorrectedLinkValue });
      setEditingCorrectedLinkId(null);
    } catch (err: any) {
      console.error("Error updating corrected link:", err);
      alert("Failed to update corrected link.");
    } finally {
      setUploadingSubmissionId(null);
    }
  };

  // Filters for results tab
  const [filterType, setFilterType] = useState('all');
  const [filterSort, setFilterSort] = useState('desc');
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [userProfile, setUserProfile] = useState<{nickname?: string, motto?: string, photoURL?: string, name?: string, needsPasswordReset?: boolean, email?: string, phone?: string, course?: string} | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');

  useEffect(() => {
    // Auto-clear January writing test content per user request
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ielts_writing_progress_3');
        localStorage.removeItem('ielts_writing_progress_1');
    }
  }, []);

  useEffect(() => {
    if (!targetUserId) return;
    if (!isShared && !user) return;
    
    // Auto-delete January mock test submission from db to fully wipe the content
    getDocs(query(collection(db, 'submissions'), where('userId', '==', targetUserId))).then(snap => {
        snap.forEach(d => {
            if (d.data().assignmentId === '3' || (d.data().title || '').includes('January Writing')) {
                deleteDoc(doc(db, 'submissions', d.id)).catch(console.error);
            }
        });
    }).catch(console.error);

    // Fetch user details
    const unsubscribeUser = onSnapshot(doc(db, 'users', targetUserId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data as any);
        if (isAdmin && targetUserId !== user?.uid) {
            setTargetUserName(data.name || data.displayName || data.email);
        } else {
            setTargetUserName(null);
        }
      } else {
        setUserProfile(null);
        setTargetUserName(null);
      }
    });

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
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'assignments');
    });

    // Fetch user's submissions
    const qSub = query(collection(db, 'submissions'), where('userId', '==', targetUserId));
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
      unsubscribeUser();
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, [user, targetUserId, isAdmin]);

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

  const handleSaveProfile = async () => {
    if (!targetUserId) return;
    try {
      await setDoc(doc(db, 'users', targetUserId), {
        nickname: editNickname,
        motto: editMotto,
        photoURL: editPhotoURL
      }, { merge: true });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

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
  const firstName = targetUserName ? targetUserName.split(' ')[0] : (user?.displayName?.split(' ')[0] || 'Student');

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">
      
      {isAdmin && targetUserName && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <p className="font-medium">
            You are viewing <strong>{targetUserName}</strong>'s dashboard. Any tests you start from here will be saved to your own account, not theirs.
          </p>
        </div>
      )}

      {/* Welcome area */}
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-10 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative z-10 flex items-center gap-6 md:gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-white">{firstName.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-blue-200 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-inner">
                {targetUserName ? 'Viewing Student Profile' : 'Student Profile'}
              </div>
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/shared/dashboard/${targetUserId}`;
                  navigator.clipboard.writeText(url);
                  alert('Shareable link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              {(!targetUserId || targetUserId === user?.uid || isAdmin) && (
                <div className="flex items-center gap-2">
                  {!user?.providerData.some(p => p.providerId === 'google.com') && (!targetUserId || targetUserId === user?.uid) && (
                    <button 
                      onClick={handleLinkGoogle}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-200 hover:text-white text-xs font-bold uppercase tracking-wider"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w0.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Link Google
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setEditNickname(userProfile?.nickname || firstName);
                      setEditMotto(userProfile?.motto || '');
                      setEditPhotoURL(userProfile?.photoURL || '');
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-200 hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight">
              {targetUserName ? `Viewing ${userProfile?.nickname || firstName}'s Dashboard` : `Welcome back, ${userProfile?.nickname || firstName}`}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-lg">
              {userProfile?.motto || (targetUserName ? `Tracking progress for ${targetUserName}.` : `Track your progress and continue your journey to Band 7.5. You're doing great!`)}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
          <div className="text-left bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 min-w-[200px] shadow-xl hover:bg-white/20 transition-colors duration-300 w-full md:w-auto flex flex-col justify-center">
            <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-300" /> {userProfile?.course === 'PET' ? 'Overall Grade' : 'Overall Band'}
            </div>
            <div className="text-6xl font-extrabold text-white tracking-tighter drop-shadow-md">{overallBand().toFixed(1)}</div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 border-b-2 border-slate-100 scrollbar-hide pt-4">
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=overview` : `/ielts/dashboard?tab=overview${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'overview' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Overview</Link>
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=results` : `/ielts/dashboard?tab=results${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'results' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Previous Results</Link>
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=reading` : `/ielts/dashboard?tab=reading${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'reading' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Reading Portfolio</Link>
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=listening` : `/ielts/dashboard?tab=listening${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'listening' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Listening Portfolio</Link>
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=writing` : `/ielts/dashboard?tab=writing${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'writing' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Writing Portfolio</Link>
        <Link to={isShared ? `/shared/dashboard/${targetUserId}?tab=speaking` : `/ielts/dashboard?tab=speaking${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`} className={`px-6 py-3 text-[0.95rem] font-bold rounded-2xl whitespace-nowrap transition-all duration-200 ${currentTab === 'speaking' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>Speaking Recordings</Link>
        {!isShared && !targetUserName && <Link to="/classes" className="px-6 py-3 text-[0.95rem] font-bold rounded-2xl bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 whitespace-nowrap transition-all duration-200">My Classes</Link>}
      </div>

      {currentTab === 'overview' && (
      <>
        {/* Statistics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <div className="relative z-10 font-bold uppercase tracking-widest text-slate-400 text-sm mb-2">Total Practice</div>
          <div className="relative z-10 text-5xl font-extrabold mb-4 mt-2 tracking-tighter">{submissions.length}</div>
          <div className="relative z-10 mt-auto text-sm text-slate-400 font-medium bg-white/5 rounded-lg py-2 px-3 inline-block w-max border border-white/10 backdrop-blur-sm">Completed Tests</div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[#1E4DB7] group-hover:opacity-[0.06] transition-opacity transform group-hover:-rotate-12 duration-500">
            <Book className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <span className="text-[0.9rem] font-extrabold uppercase tracking-widest text-[#1E4DB7] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">Reading</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{rScore > 0 ? rScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-auto overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${(rScore/9)*100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-teal-600 group-hover:opacity-[0.06] transition-opacity transform group-hover:rotate-12 duration-500">
            <Headphones className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <span className="text-[0.9rem] font-extrabold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">Listening</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{lScore > 0 ? lScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-auto overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${(lScore/9)*100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[#F4A340] group-hover:opacity-[0.06] transition-opacity transform group-hover:-rotate-12 duration-500">
            <PenTool className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <span className="text-[0.9rem] font-extrabold uppercase tracking-widest text-[#F4A340] bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">Writing</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{wScore > 0 ? wScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-auto overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-orange-400 to-amber-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${(wScore/9)*100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-purple-600 group-hover:opacity-[0.06] transition-opacity transform group-hover:rotate-12 duration-500">
            <Mic className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <span className="text-[0.9rem] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">Speaking</span>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{sScore > 0 ? sScore.toFixed(1) : '-'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-auto overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-inner" style={{ width: `${(sScore/9)*100}%` }}></div>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          <button onClick={() => navigate(isShared ? `/shared/dashboard/${targetUserId}?tab=results` : '/ielts/dashboard?tab=results')} className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
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
                  const type = sub.assignmentType || assignment?.type || (sub.assignmentId === '3' ? 'writing' : 'reading');
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                      if (sub.fileUrl) {
                        window.open(sub.fileUrl, '_blank');
                      } else if (sub.audioUrl) {
                        window.open(sub.audioUrl, '_blank');
                      } else if (!sub.assignmentId.startsWith('offline_')) {
                        navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`);
                      }
                    }}>
                      <td className="px-6 py-5">
                        {isAdmin && editingTitleId === sub.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                            {isAdmin && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
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
                        {editingScoreId === sub.id ? (
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="9"
                              value={editScoreValue}
                              onChange={(e) => setEditScoreValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              autoFocus
                            />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="text-slate-900">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">Pending</span>}
                            {isAdmin && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {sub.correctedFileUrl && (
                              <a href={sub.correctedFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider hover:bg-green-100" onClick={(e) => e.stopPropagation()}>Corrected</a>
                          )}
                          {isAdmin && (
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Performance Table</h2>
          <button className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
            Browse Library <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <PerformanceTable submissions={submissions} assignments={assignments} currentTab={currentTab} />
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
                    let filtered = filterType === 'all' ? [...submissions] : submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (s.assignmentId === '3' ? 'writing' : 'unknown')) === filterType);
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
                  const type = sub.assignmentType || assignment?.type || (sub.assignmentId === '3' ? 'writing' : 'reading');
                  const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => !sub.assignmentId.startsWith('offline_') && navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`)}>
                      <td className="px-6 py-4">
                        {isAdmin && editingTitleId === sub.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                            {isAdmin && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
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
                         <div className="flex flex-wrap items-center gap-2">
                           {sub.correctedFileUrl && (
                               <a href={sub.correctedFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider hover:bg-green-100" onClick={(e) => e.stopPropagation()}>Corrected Writing</a>
                           )}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                        {editingScoreId === sub.id ? (
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="9"
                              value={editScoreValue}
                              onChange={(e) => setEditScoreValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              autoFocus
                            />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                            {isAdmin && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            editingLinkId === sub.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="text" placeholder="Paste link..." className="w-32 px-2 py-1 text-sm border border-slate-300 rounded" value={editLinkValue} onChange={(e) => setEditLinkValue(e.target.value)} />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLinkSave(sub.id, type === 'speaking' ? 'speaking' : 'writing'); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingLinkId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(sub.id); setEditLinkValue(type === 'speaking' ? (sub.audioUrl || '') : (sub.fileUrl || '')); }} className="text-slate-400 hover:text-[#1E4DB7] p-2 rounded-full hover:bg-blue-50 transition-colors" title="Paste Link">
                                {uploadingSubmissionId === sub.id ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E4DB7] block"></span> : <LinkIcon className="w-4 h-4" />}
                              </button>
                            )
                          )}
                          {isAdmin && type === 'writing' && (
                            editingCorrectedLinkId === sub.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="text" placeholder="Corrected link..." className="w-32 px-2 py-1 text-sm border border-slate-300 rounded" value={editCorrectedLinkValue} onChange={(e) => setEditCorrectedLinkValue(e.target.value)} />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCorrectedLinkSave(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCorrectedLinkId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); setEditingCorrectedLinkId(sub.id); setEditCorrectedLinkValue(sub.correctedFileUrl || ''); }} className="text-slate-400 hover:text-[#1E4DB7] p-2 rounded-full hover:bg-blue-50 transition-colors" title="Paste Corrected Link">
                                {uploadingSubmissionId === sub.id ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E4DB7] block"></span> : <FileText className="w-4 h-4" />}
                              </button>
                            )
                          )}
                          {isAdmin && (
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })})()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === 'reading' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <div className="p-3 bg-blue-100 rounded-xl">
                    <Book className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Reading Portfolio</h2>
                    <p className="text-sm text-slate-500">Your submitted reading tests</p>
                 </div>
             </div>
             {isAdmin && (
               <div>
                 <button
                   onClick={async () => {
                     try {
                       const refId = doc(collection(db, 'submissions')).id;
                       await setDoc(doc(db, 'submissions', refId), {
                         assignmentId: 'offline_reading',
                         assignmentTitle: 'Offline Reading Assignment',
                         assignmentType: 'reading',
                         userId: targetUserId,
                         answers: 'Offline submission',
                         createdAt: serverTimestamp(),
                       });
                     } catch(err) {
                       console.error(err);
                     }
                   }}
                   className="flex items-center gap-2 bg-[#1E4DB7] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Offline Entry
                 </button>
               </div>
             )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (s.assignmentId === '1' ? 'reading' : 'unknown')) === 'reading');
                    if (filtered.length === 0) {
                        return (
                          <tr>
                             <td colSpan={4} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                <Book className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No reading submissions yet.</p>
                             </td>
                          </tr>
                        );
                    }
                    return filtered.map((sub) => {
                      const assignment = assignments.find(a => a.id === sub.assignmentId);
                      const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                      
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            if (!sub.assignmentId.startsWith('offline_')) {
                              navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`);
                            }
                          }}>
                            <td className="px-6 py-5">
                              {isAdmin && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                              {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                              {editingScoreId === sub.id ? (
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {isAdmin && (
                                  <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      )
                    });
                })()}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {currentTab === 'listening' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                 <div className="p-3 bg-teal-100 rounded-xl">
                    <Headphones className="w-6 h-6 text-teal-600" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Listening Portfolio</h2>
                    <p className="text-sm text-slate-500">Your submitted listening tests</p>
                 </div>
             </div>
             {isAdmin && (
               <div>
                 <button
                   onClick={async () => {
                     try {
                       const refId = doc(collection(db, 'submissions')).id;
                       await setDoc(doc(db, 'submissions', refId), {
                         assignmentId: 'offline_listening',
                         assignmentTitle: 'Offline Listening Assignment',
                         assignmentType: 'listening',
                         userId: targetUserId,
                         answers: 'Offline submission',
                         createdAt: serverTimestamp(),
                       });
                     } catch(err) {
                       console.error(err);
                     }
                   }}
                   className="flex items-center gap-2 bg-[#1E4DB7] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Offline Entry
                 </button>
               </div>
             )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (s.assignmentId === '2' ? 'listening' : 'unknown')) === 'listening');
                    if (filtered.length === 0) {
                        return (
                          <tr>
                             <td colSpan={4} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                                <Headphones className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-medium">No listening submissions yet.</p>
                             </td>
                          </tr>
                        );
                    }
                    return filtered.map((sub) => {
                      const assignment = assignments.find(a => a.id === sub.assignmentId);
                      const title = sub.assignmentTitle || assignment?.title || 'Unknown Test';
                      
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            if (!sub.assignmentId.startsWith('offline_')) {
                              navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`);
                            }
                          }}>
                            <td className="px-6 py-5">
                              {isAdmin && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                              {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                              {editingScoreId === sub.id ? (
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {isAdmin && (
                                  <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      )
                    });
                })()}
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
             {isAdmin && (
               <div>
                 <button
                   onClick={async () => {
                     try {
                       const refId = doc(collection(db, 'submissions')).id;
                       await setDoc(doc(db, 'submissions', refId), {
                         assignmentId: 'offline_writing',
                         assignmentTitle: 'Offline Writing Assignment',
                         assignmentType: 'writing',
                         userId: targetUserId,
                         answers: 'Offline submission',
                         createdAt: serverTimestamp(),
                       });
                     } catch(err) {
                       console.error(err);
                     }
                   }}
                   className="flex items-center gap-2 bg-[#1E4DB7] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Offline Entry
                 </button>
               </div>
             )}
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
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (s.assignmentId === '3' ? 'writing' : 'unknown')) === 'writing');
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
                      const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback || !!sub.fileUrl;
                      
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            if (sub.fileUrl) {
                              window.open(sub.fileUrl, '_blank');
                            } else if (sub.audioUrl) {
                              window.open(sub.audioUrl, '_blank');
                            } else if (!sub.assignmentId.startsWith('offline_')) {
                              navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`);
                            }
                          }}>
                            <td className="px-6 py-5">
                              {isAdmin && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                              {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2">
                                 {sub.correctedFileUrl && (
                                     <a href={sub.correctedFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider hover:bg-green-100" onClick={(e) => e.stopPropagation()}>Corrected Writing</a>
                                 )}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                              {editingScoreId === sub.id ? (
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {isAdmin && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {isAdmin && (
                                  editingLinkId === sub.id ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <input type="text" placeholder="Paste link..." className="w-32 px-2 py-1 text-sm border border-slate-300 rounded" value={editLinkValue} onChange={(e) => setEditLinkValue(e.target.value)} />
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLinkSave(sub.id, 'writing'); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingLinkId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                    </div>
                                  ) : (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(sub.id); setEditLinkValue(sub.fileUrl || ''); }} className="text-slate-400 hover:text-[#1E4DB7] p-2 rounded-full hover:bg-blue-50 transition-colors" title="Paste Link">
                                      {uploadingSubmissionId === sub.id ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E4DB7] block"></span> : <LinkIcon className="w-4 h-4" />}
                                    </button>
                                  )
                                )}
                                {isAdmin && (
                                  editingCorrectedLinkId === sub.id ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <input type="text" placeholder="Corrected link..." className="w-32 px-2 py-1 text-sm border border-slate-300 rounded" value={editCorrectedLinkValue} onChange={(e) => setEditCorrectedLinkValue(e.target.value)} />
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCorrectedLinkSave(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingCorrectedLinkId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                    </div>
                                  ) : (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingCorrectedLinkId(sub.id); setEditCorrectedLinkValue(sub.correctedFileUrl || ''); }} className="text-slate-400 hover:text-[#1E4DB7] p-2 rounded-full hover:bg-blue-50 transition-colors" title="Paste Corrected Link">
                                      {uploadingSubmissionId === sub.id ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E4DB7] block"></span> : <FileText className="w-4 h-4" />}
                                    </button>
                                  )
                                )}
                                {isAdmin && (
                                  <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
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
             {isAdmin && (
               <div>
                 <button
                   onClick={async () => {
                     try {
                       const refId = doc(collection(db, 'submissions')).id;
                       await setDoc(doc(db, 'submissions', refId), {
                         assignmentId: 'offline_speaking',
                         assignmentTitle: 'Offline Speaking Assignment',
                         assignmentType: 'speaking',
                         userId: targetUserId,
                         answers: 'Offline submission',
                         createdAt: serverTimestamp(),
                       });
                     } catch(err) {
                       console.error(err);
                     }
                   }}
                   className="flex items-center gap-2 bg-[#1E4DB7] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Offline Entry
                 </button>
               </div>
             )}
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
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                          if (sub.fileUrl) {
                            window.open(sub.fileUrl, '_blank');
                          } else if (sub.audioUrl) {
                            window.open(sub.audioUrl, '_blank');
                          } else if (!sub.assignmentId.startsWith('offline_')) {
                            navigate(isShared ? `/shared/results/${sub.id}` : `/results/${sub.id}`);
                          }
                        }}>
                          <td className="px-6 py-5">
                            {isAdmin && editingTitleId === sub.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900">{title}</p>
                                {isAdmin && (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                            {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2">
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                            {editingScoreId === sub.id ? (
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                {isAdmin && (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {isAdmin && (
                                editingLinkId === sub.id ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input type="text" placeholder="Paste link..." className="w-32 px-2 py-1 text-sm border border-slate-300 rounded" value={editLinkValue} onChange={(e) => setEditLinkValue(e.target.value)} />
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLinkSave(sub.id, 'speaking'); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingLinkId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(sub.id); setEditLinkValue(sub.audioUrl || ''); }} className="text-slate-400 hover:text-[#1E4DB7] p-2 rounded-full hover:bg-blue-50 transition-colors" title="Paste Link">
                                    {uploadingSubmissionId === sub.id ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1E4DB7] block"></span> : <LinkIcon className="w-4 h-4" />}
                                  </button>
                                )
                              )}
                              {isAdmin && (
                                <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
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

      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
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
                      onChange={e => setEditPhotoURL(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900"
                    />
                  </div>
                </div>
                {editPhotoURL && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-50">
                      <img src={editPhotoURL} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
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
                  onClick={() => setIsEditingProfile(false)} 
                  className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  className="flex-1 py-3.5 bg-[#1E4DB7] text-white font-bold hover:bg-blue-800 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
