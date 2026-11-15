import { PerformanceTable } from '../../components/PerformanceTable';
import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, where, addDoc, deleteDoc, doc, updateDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Assignment, Submission, OperationType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { handleFirestoreError } from '../../lib/errorHandler';
import { BookOpen, FileText, Headphones, PenTool, Book, Mic, CheckCircle2, ArrowRight, Trash2, RotateCcw, Edit2, X, Camera, Upload, Play, PlayCircle, Plus, Video, Link as LinkIcon, Share2, Folder, ChevronDown, ChevronRight, Key, Eye, EyeOff, ExternalLink, Award, QrCode, ShieldCheck, AlertCircle, Lock, Printer, Clock } from 'lucide-react';
import { StudentCredentialsModal } from '../../components/StudentCredentialsModal';
import { ParentAccessModal } from '../../components/ParentAccessModal';
import { useParentLang } from '../../lib/parentLocale';
import { format } from 'date-fns';
import { createSubmissionNotification } from '../../lib/notificationService';

import { updateProfile } from 'firebase/auth';


const getFallbackType = (id) => {
  if (id === 'offline_speaking') return 'speaking';
  const numId = parseInt(String(id));
  if (!isNaN(numId)) {
    if (numId % 4 === 1) return 'reading';
    if (numId % 4 === 2) return 'listening';
    if (numId % 4 === 3) return 'writing';
    if (numId % 4 === 0) return 'speaking';
  }
  return 'unknown';
};

const getFallbackTitle = (id: any, currentTitle?: string) => {
  if (currentTitle && isNaN(Number(currentTitle)) && !currentTitle.toLowerCase().startsWith('unknown')) {
    return currentTitle;
  }
  
  const strId = String(id);
  const numId = parseInt(strId, 10);
  
  if (/^\d+$/.test(strId) && !isNaN(numId) && numId >= 1 && numId <= 100) {
    const testNum = Math.ceil(numId / 4);
    let skill = 'Practice';
    if (numId % 4 === 1) skill = 'Reading';
    if (numId % 4 === 2) skill = 'Listening';
    if (numId % 4 === 3) skill = 'Writing';
    if (numId % 4 === 0) skill = 'Speaking';
    return `IELTS ${skill} Test ${testNum}`;
  }

  return currentTitle || null;
};

// Extracts thumbnail or iframe preview details from Google Drive, YouTube, or direct video/audio links
const getSubmissionThumbnailInfo = (url?: string) => {
  if (!url) return null;
  const clean = url.trim();

  // YouTube match
  if (clean.includes('youtube.com/watch') || clean.includes('youtu.be/')) {
    let videoId = '';
    if (clean.includes('youtube.com/watch')) {
      const urlParams = new URL(clean).searchParams;
      videoId = urlParams.get('v') || '';
    } else {
      const match = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) videoId = match[1];
    }
    if (videoId) {
      return {
        type: 'image' as const,
        imageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      };
    }
  }

  // Google Drive match
  if (clean.includes('drive.google.com')) {
    let driveId = '';
    const matchD = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      driveId = matchD[1];
    } else {
      const matchId = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) driveId = matchId[1];
    }
    if (driveId) {
      return {
        type: 'drive' as const,
        driveId,
        // High-res Google Drive thumbnail generator
        imageUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`,
        embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      };
    }
  }

  // Direct image URL
  if (/\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(clean)) {
    return {
      type: 'image' as const,
      imageUrl: clean,
      embedUrl: null,
    };
  }

  return null;
};


export function Dashboard({ isShared = false, isParentView = false }: { isShared?: boolean; isParentView?: boolean }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAddOffline, setShowAddOffline] = useState(false);
  const [speakingFolderOpen, setSpeakingFolderOpen] = useState(true);
  const [offlineForm, setOfflineForm] = useState({ id: '', name: '', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '', vietnameseTranslation: '' });
  const [viewFeedbackItem, setViewFeedbackItem] = useState<any>(null);

  const { userId: urlUserId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const isParentMode = Boolean(isParentView || isShared);
  const canAdminEdit = Boolean(isAdmin && !isParentMode);
  const parentKey = searchParams.get('key') || '';
  const [parentLang, setParentLang] = useParentLang(isParentMode);
  const isVi = isParentMode && parentLang === 'vi';
  const rawTab = searchParams.get('tab') || 'overview';
  const allowedParentTabs = ['overview', 'reading', 'listening', 'writing', 'speaking', 'results'];
  const currentTab = isParentMode
    ? (allowedParentTabs.includes(rawTab) ? rawTab : 'overview')
    : (canAdminEdit ? rawTab : 'overview');
  
  const paramUid = searchParams.get('userId') || searchParams.get('user');
  let targetUserId = (canAdminEdit && paramUid) ? paramUid : user?.uid;
  if (isParentMode && urlUserId) {
    targetUserId = urlUserId;
  }

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const submissions = React.useMemo(() => allSubmissions.filter((s) => !s.isDeleted), [allSubmissions]);
  const trashedSubmissions = React.useMemo(() => {
    return allSubmissions
      .filter((s) => Boolean(s.isDeleted))
      .sort((a, b) => {
        const aDel = a.deletedAt?.toMillis ? a.deletedAt.toMillis() : (typeof a.deletedAt === 'number' ? a.deletedAt : (a.createdAt as number) || 0);
        const bDel = b.deletedAt?.toMillis ? b.deletedAt.toMillis() : (typeof b.deletedAt === 'number' ? b.deletedAt : (b.createdAt as number) || 0);
        return bDel - aDel;
      });
  }, [allSubmissions]);
  const [loading, setLoading] = useState(true);
  const [targetUserName, setTargetUserName] = useState<string | null>(null);
  
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<string>('');
  const [editRawScoreValue, setEditRawScoreValue] = useState<string>('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkValue, setEditLinkValue] = useState<string>('');
  const [editingCorrectedLinkId, setEditingCorrectedLinkId] = useState<string | null>(null);
  const [editCorrectedLinkValue, setEditCorrectedLinkValue] = useState<string>('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const [uploadingSubmissionId, setUploadingSubmissionId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showParentAccessModal, setShowParentAccessModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; embedUrl?: string | null; directUrl?: string | null } | null>(null);

  const getTabUrl = (tabName: string) => {
    if (isParentMode) {
      const base = location.pathname.startsWith('/shared/')
        ? `/shared/dashboard/${targetUserId}`
        : `/parent/dashboard/${targetUserId}`;
      return `${base}?tab=${tabName}${parentKey ? `&key=${encodeURIComponent(parentKey)}` : ''}`;
    }
    return `/ielts/dashboard?tab=${tabName}${targetUserId !== user?.uid ? `&userId=${targetUserId}` : ''}`;
  };

  const getResultUrl = (submissionId: string) => {
    if (isParentMode) {
      return `/parent/results/${submissionId}?student=${encodeURIComponent(targetUserId || '')}${parentKey ? `&key=${encodeURIComponent(parentKey)}` : ''}`;
    }
    return `/results/${submissionId}`;
  };

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
    if (!editScoreValue && !editRawScoreValue) {
      setEditingScoreId(null);
      return;
    }
    try {
      const updates: any = {};
      
      if (editScoreValue) {
        const score = parseFloat(editScoreValue);
        if (!isNaN(score)) {
          updates.bandScore = score;
          updates.isEvaluated = true;
          updates.evaluatedBy = 'admin';
        }
      }
      if (editRawScoreValue) {
        const rawScore = parseInt(editRawScoreValue, 10);
        if (!isNaN(rawScore)) updates.score = rawScore;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'submissions', subId), updates);
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
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isRestoringAll, setIsRestoringAll] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);

  const [userProfile, setUserProfile] = useState<{nickname?: string, motto?: string, photoURL?: string, name?: string, needsPasswordReset?: boolean, email?: string, phone?: string, course?: string, username?: string, tempPassword?: string, password?: string, studentId?: string, eraverseAvatar?: any, folderName?: string, parentAccess?: { enabled?: boolean; token?: string; updatedAt?: number }} | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    setPhotoLoadError(false);
  }, [userProfile?.photoURL]);

  useEffect(() => {
    // Auto-clear January writing test content per user request
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ielts_writing_progress_3');
        localStorage.removeItem('ielts_writing_progress_1');
    }
  }, []);

  useEffect(() => {
    if (!targetUserId) return;
    if (!isParentMode && !user) return;
    
    // Auto-delete January mock test submission from db to fully wipe the content (never run in parent view)
    if (!isParentMode) {
      getDocs(query(collection(db, 'submissions'), where('userId', '==', targetUserId))).then(snap => {
          snap.forEach(d => {
              if (d.data().assignmentId === '3' || (d.data().title || '').includes('January Writing')) {
                  deleteDoc(doc(db, 'submissions', d.id)).catch(console.error);
              }
          });
      }).catch(console.error);
    }

    // Fetch user details
    const unsubscribeUser = onSnapshot(doc(db, 'users', targetUserId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data as any);
        if (canAdminEdit && targetUserId !== user?.uid) {
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
      setAllSubmissions(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });
    
    return () => {
      unsubscribeUser();
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, [user, targetUserId, canAdminEdit, isParentMode]);

  useEffect(() => {
    if (!isParentMode || isAdmin || !targetUserId || !userProfile) return;
    const pAccess = userProfile.parentAccess;
    if (pAccess?.enabled === false) return;
    if (pAccess?.token && parentKey !== pAccess.token && location.pathname.startsWith('/parent/')) return;

    const visitKey = `parent_ielts_visit_${targetUserId}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(visitKey)) {
      sessionStorage.setItem(visitKey, '1');
      setDoc(
        doc(db, 'users', targetUserId),
        {
          parentAccess: {
            ...(pAccess || {}),
            viewCount: increment(1),
            lastViewedAt: Date.now(),
          },
        },
        { merge: true }
      ).catch(() => {});
    }
  }, [isParentMode, isAdmin, targetUserId, userProfile, parentKey, location.pathname]);

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

  if (isParentMode) {
    if (!targetUserId || !userProfile) {
      return (
        <div className="max-w-lg mx-auto my-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
            {isVi ? 'Không tìm thấy hồ sơ học tập' : 'Student Report Not Found'}
          </h2>
          <p className="text-sm text-slate-500">
            {isVi
              ? 'Đường dẫn truy cập không đầy đủ hoặc hồ sơ học viên hiện không khả dụng.'
              : 'This parent access link may be incomplete or the student profile is unavailable.'}
          </p>
        </div>
      );
    }

    const parentAccess = userProfile.parentAccess;
    const accessDeniedMessage =
      parentAccess?.enabled === false
        ? isVi
          ? 'Quyền xem báo cáo dành cho Phụ huynh hiện đang tạm dừng. Vui lòng liên hệ giáo viên hoặc trung tâm để mở lại.'
          : 'Parent access is currently paused by the teacher. Please contact your teacher to re-enable access.'
        : parentAccess?.token && parentKey && parentKey !== parentAccess.token
        ? isVi
          ? 'Mã QR hoặc đường dẫn này đã được làm mới. Vui lòng sử dụng mã QR mới nhất từ giáo viên.'
          : 'This parent access link has been replaced. Please scan the latest QR code from the teacher.'
        : parentAccess?.token && !parentKey && location.pathname.startsWith('/parent/')
        ? isVi
          ? 'Vui lòng quét mã QR hoặc mở đúng đường dẫn dành cho Phụ huynh để xem báo cáo học tập.'
          : 'A valid Parent Access QR code or link is required to view this student report.'
        : null;

    if (accessDeniedMessage) {
      return (
        <div className="max-w-lg mx-auto my-10 bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
            {isVi ? 'Tạm thời không thể truy cập' : 'Access Unavailable'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{accessDeniedMessage}</p>
        </div>
      );
    }
  }

  const handleSaveProfile = async () => {
    if (!targetUserId) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      const updateData: any = {
        nickname: editNickname.trim(),
        motto: editMotto.trim()
      };

      if (editUsername.trim()) {
        const cleanUser = editUsername.trim().toLowerCase().replace(/\s+/g, '');
        // Check uniqueness if username changed
        if (cleanUser !== (userProfile?.username || '').toLowerCase()) {
          const checkQ = query(collection(db, 'users'), where('username', '==', cleanUser));
          const checkSnap = await getDocs(checkQ);
          const conflict = checkSnap.docs.find(d => d.id !== targetUserId);
          if (conflict) {
            setProfileError('This username is already taken. Please choose another.');
            setProfileSaving(false);
            return;
          }
        }
        updateData.username = cleanUser;
        updateData.authEmail = `${cleanUser}@student.era.edu`;
      }

      if (editPassword.trim()) {
        updateData.tempPassword = editPassword.trim();
        updateData.password = editPassword.trim();
      }

      // Profile photo ONLY updated if admin
      if (canAdminEdit) {
        updateData.photoURL = editPhotoURL.trim();
      }

      await setDoc(doc(db, 'users', targetUserId), updateData, { merge: true });
      setUserProfile((prev: any) => prev ? ({ ...prev, ...updateData }) : updateData);

      if (user && targetUserId === user.uid && !(user as any).customAuth) {
        const authUpdates: any = { displayName: editNickname.trim() || user.displayName };
        if (canAdminEdit && editPhotoURL.trim()) {
          authUpdates.photoURL = editPhotoURL.trim();
        }
        await updateProfile(user as any, authUpdates).catch(console.error);
      }

      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Error updating profile", error);
      setProfileError(error.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
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
  const getSubmissionsByType = (type: string) => submissions.filter((s) => {
    const directType = s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || getFallbackType(s.assignmentId);
    if (directType === type) return true;
    
    // Skill title fallback
    const title = (s.assignmentTitle || (s as any).title || '').toLowerCase();
    if (type === 'speaking' && (title.includes('speaking') || s.assignmentId === 'offline_speaking')) return true;
    if (type === 'reading' && (title.includes('reading') || s.assignmentId === 'offline_reading')) return true;
    if (type === 'listening' && (title.includes('listening') || s.assignmentId === 'offline_listening')) return true;
    if (type === 'writing' && (title.includes('writing') || s.assignmentId === 'offline_writing')) return true;
    
    return false;
  });

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
      await updateDoc(doc(db, 'submissions', testToDelete), {
        isDeleted: true,
        deletedAt: Date.now(),
        deletedBy: user?.uid || 'admin',
      });
      setTestToDelete(null);
    } catch (err: any) {
      console.error("Error moving test to trash:", err);
      setDeleteError(err.message || "Failed to delete test. It may be due to permission settings.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreTest = async (submissionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!submissionId) return;
    setRestoringId(submissionId);
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        isDeleted: false,
        deletedAt: null,
      });
    } catch (err: any) {
      console.error("Error restoring test:", err);
    } finally {
      setRestoringId(null);
    }
  };

  const handleRestoreAllTests = async () => {
    if (trashedSubmissions.length === 0) return;
    setIsRestoringAll(true);
    try {
      await Promise.all(
        trashedSubmissions.map((sub) =>
          sub.id
            ? updateDoc(doc(db, 'submissions', sub.id), {
                isDeleted: false,
                deletedAt: null,
              })
            : Promise.resolve()
        )
      );
    } catch (err: any) {
      console.error("Error restoring all tests:", err);
    } finally {
      setIsRestoringAll(false);
    }
  };

  const confirmPermanentDeleteTest = async () => {
    if (!permanentDeleteId) return;
    setIsPermanentDeleting(true);
    try {
      await deleteDoc(doc(db, 'submissions', permanentDeleteId));
      setPermanentDeleteId(null);
    } catch (err: any) {
      console.error("Error permanently deleting test:", err);
    } finally {
      setIsPermanentDeleting(false);
    }
  };

  const readingSubs = getSubmissionsByType('reading');
  const listeningSubs = getSubmissionsByType('listening');
  const writingSubs = getSubmissionsByType('writing');
  const speakingSubs = getSubmissionsByType('speaking').filter(s => s.assignmentId !== 'offline_speaking' && !(s.assignmentTitle || '').toLowerCase().includes('offline'));
  const offlineSpeakingSubs = getSubmissionsByType('speaking').filter(s => s.assignmentId === 'offline_speaking' || (s.assignmentTitle || '').toLowerCase().includes('offline'));
  const allSpeakingSubs = [...speakingSubs, ...offlineSpeakingSubs].sort((a, b) => (b.createdAt as number) - (a.createdAt as number));

  const isSpeakingEvaluated = (sub: Submission) => {
    // Only reflect speaking score if the admin submitted the evaluation
    return Boolean(sub.isEvaluated === true || sub.evaluatedBy === 'admin' || (sub.assignmentId === 'offline_speaking' && sub.bandScore !== undefined && sub.bandScore !== null));
  };

  const rScore = averageScore(readingSubs);
  const lScore = averageScore(listeningSubs);
  const wScore = averageScore(writingSubs);
  const sScore = averageScore(allSpeakingSubs.filter(isSpeakingEvaluated));

  const overallBand = () => {
    let scores = [rScore, lScore, wScore, sScore].filter(s => s > 0);
    if (scores.length === 0) return 0.0;
    const avg = scores.reduce((a,b)=>a+b, 0) / scores.length;
    return Math.round(avg * 2) / 2;
  }

  const pendingCount = assignments.length - submissions.length;
  const firstName = targetUserName ? targetUserName.split(' ')[0] : (user?.displayName?.split(' ')[0] || 'Student');

  const studentDisplayName = userProfile?.nickname || userProfile?.name || targetUserName || firstName || 'Student';

  return (
    <div className="space-y-5 sm:space-y-10 pb-20 sm:pb-16 max-w-7xl mx-auto">
      
      {isParentMode && (
        <div className="bg-white border border-slate-200/90 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl flex items-center justify-between gap-2 shadow-2xs print:hidden">
          <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
            {isVi ? `Báo cáo học tập · ${studentDisplayName}` : `Progress Report · ${studentDisplayName}`}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setParentLang('en')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  parentLang === 'en' ? 'bg-[#1E4DB7] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setParentLang('vi')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  parentLang === 'vi' ? 'bg-[#1E4DB7] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiếng Việt
              </button>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              title={isVi ? 'In báo cáo' : 'Print report'}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isVi ? 'In báo cáo' : 'Print'}</span>
            </button>
          </div>
        </div>
      )}

      {canAdminEdit && targetUserName && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl flex items-center gap-3 text-sm">
          <FileText className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="font-medium">
            You are viewing <strong>{targetUserName}</strong>'s dashboard. Any tests you start from here will be saved to your own account, not theirs.
          </p>
        </div>
      )}

      {/* Welcome Section */}
      <section className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-5 sm:gap-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-5 sm:p-8 md:p-11 rounded-3xl sm:rounded-[2rem] shadow-xl relative overflow-hidden group text-center md:text-left">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-3.5 sm:gap-6 md:gap-8 w-full min-w-0">
          <div
            onClick={() => {
              if (!canAdminEdit) return;
              setEditNickname(userProfile?.nickname || firstName || '');
              setEditUsername(userProfile?.username || '');
              setEditPassword(userProfile?.tempPassword || userProfile?.password || '');
              setShowEditPassword(false);
              setProfileError('');
              setEditMotto(userProfile?.motto || '');
              setEditPhotoURL(userProfile?.photoURL || '');
              setIsEditingProfile(true);
            }}
            title={canAdminEdit ? 'Admin: Add or edit Profile Photo URL' : undefined}
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 border-4 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center shrink-0 mx-auto md:mx-0 relative ${canAdminEdit ? 'cursor-pointer group/avatar' : ''}`}
          >
            {userProfile?.photoURL && !photoLoadError ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile?.nickname || firstName || 'Student'}
                referrerPolicy="no-referrer"
                onError={() => setPhotoLoadError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white select-none">
                {(userProfile?.nickname || studentDisplayName || 'S').charAt(0).toUpperCase()}
              </span>
            )}
            {canAdminEdit && (
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider gap-1">
                <Camera className="w-4 h-4" />
                <span>Photo Link</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center md:items-start w-full min-w-0">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-2 sm:mb-3">
              {isParentMode ? (
                <span className="text-xs font-semibold text-blue-200/90">
                  {isVi ? 'Hồ sơ Học viên · Kỷ Nguyên Era' : 'Student Progress Overview'}
                </span>
              ) : (
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-blue-200 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-inner">
                  {targetUserName ? 'Viewing Student Profile' : 'Student Profile'}
                </div>
              )}
              {/* Parent QR button: ONLY visible to admin */}
              {canAdminEdit && (
                <button
                  type="button"
                  onClick={() => setShowParentAccessModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 rounded-full transition-all text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer border border-indigo-300/30"
                  title="Generate Parent Instant Access QR Code & Link"
                >
                  <QrCode className="w-3.5 h-3.5" /> Parent QR
                </button>
              )}
              {/* Credentials button: ONLY visible to admin */}
              {canAdminEdit && (
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-full transition-all text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                  title="View & copy student credentials and login password"
                >
                  <Key className="w-3.5 h-3.5" /> Credentials
                </button>
              )}
              {!isParentMode && (!targetUserId || targetUserId === user?.uid || canAdminEdit) && (
                <button 
                  onClick={() => {
                    setEditNickname(userProfile?.nickname || firstName || '');
                    setEditUsername(userProfile?.username || '');
                    setEditPassword(userProfile?.tempPassword || userProfile?.password || '');
                    setShowEditPassword(false);
                    setProfileError('');
                    setEditMotto(userProfile?.motto || '');
                    setEditPhotoURL(userProfile?.photoURL || '');
                    setIsEditingProfile(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-blue-200 hover:text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-1.5 sm:mb-2 tracking-tight break-words max-w-full">
              {isParentMode
                ? isVi
                  ? `Kết quả học tập của ${studentDisplayName}`
                  : `${studentDisplayName}'s Progress`
                : targetUserName
                ? `Viewing ${userProfile?.nickname || firstName}'s Dashboard`
                : `Welcome back, ${userProfile?.nickname || firstName}`}
            </h1>
            <p className="text-blue-100 text-xs sm:text-base md:text-lg font-medium max-w-lg leading-relaxed">
              {userProfile?.motto ||
                (isParentMode
                  ? isVi
                    ? 'Tổng hợp điểm số các kỹ năng và kết quả kiểm tra tại Kỷ Nguyên Era.'
                    : `Overview of ${studentDisplayName}'s skill scores and completed assessments.`
                  : targetUserName
                  ? `Tracking progress for ${targetUserName}.`
                  : `Track your progress and continue your journey to Band 7.5. You're doing great!`)}
            </p>
          </div>
        </div>
        
        {/* Overall Band Card - Fluid on mobile, prevents overflow and overlapping */}
        <div className="relative z-10 w-full sm:w-auto shrink-0 flex justify-center">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 border border-red-100/90 shadow-[0_12px_35px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_45px_rgba(239,68,68,0.22)] transition-all duration-300 relative overflow-hidden flex items-center justify-between gap-3 sm:gap-4 group w-full sm:w-auto sm:min-w-[270px]">
            {/* Subtle ambient red background tint */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-100/40 rounded-full blur-2xl pointer-events-none group-hover:bg-red-100/60 transition-colors"></div>

            {/* Left Column: Squircle icon + Title/Subtitle */}
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 relative z-10 text-left">
              {/* Squircle Icon Container */}
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-white to-red-50/80 border border-red-100 shadow-[0_4px_16px_rgba(239,68,68,0.12)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4L19.5 11.5L27.5 12.5L21.5 18L23 26L16 22L9 26L10.5 18L4.5 12.5L12.5 11.5L16 4Z" fill="#D8001B" />
                  <circle cx="16" cy="15" r="4" fill="white" />
                  <circle cx="16" cy="15" r="2.2" fill="#D8001B" />
                </svg>
              </div>

              {/* Text column */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-base font-black uppercase tracking-tight text-[#D8001B] truncate leading-tight">
                  {userProfile?.course === 'PET'
                    ? isVi
                      ? 'ĐIỂM TỔNG KẾT'
                      : 'OVERALL GRADE'
                    : isVi
                    ? 'ĐIỂM TỔNG (BAND)'
                    : 'OVERALL BAND'}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap mt-0.5">
                  {isVi ? 'Trung bình kỹ năng' : 'Skill Score'}
                </span>
              </div>
            </div>

            {/* Circular Score Disc */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-br from-white via-white to-red-50/50 border border-red-100 shadow-[0_6px_20px_rgba(239,68,68,0.08)] flex items-center justify-center shrink-0 relative z-10">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#B90014] tracking-tight">
                {userProfile?.course === 'PET' ? Math.round(overallBand()) : overallBand().toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs - Visible to Admin and Parent View */}
      {(canAdminEdit || isParentMode) && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 border-b border-slate-200/80 scrollbar-hide pt-1">
          <Link to={getTabUrl('overview')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'overview' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Tổng quan' : 'Dashboard'}
          </Link>
          <Link to={getTabUrl('reading')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'reading' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Kỹ năng Đọc' : 'Reading'}
          </Link>
          <Link to={getTabUrl('listening')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'listening' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Kỹ năng Nghe' : 'Listening'}
          </Link>
          <Link to={getTabUrl('writing')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'writing' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Kỹ năng Viết' : 'Writing'}
          </Link>
          <Link to={getTabUrl('speaking')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'speaking' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Kỹ năng Nói' : 'Speaking'}
          </Link>
          <Link to={getTabUrl('results')} className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 ${currentTab === 'results' ? 'bg-[#1E4DB7] text-white shadow-md hover:bg-blue-800' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {isVi ? 'Lịch sử làm bài' : 'History'}
          </Link>
          {canAdminEdit && (
            <Link
              to={getTabUrl('trash')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[0.95rem] font-bold rounded-xl sm:rounded-2xl whitespace-nowrap shrink-0 transition-all duration-200 flex items-center gap-2 ${
                currentTab === 'trash'
                  ? 'bg-rose-600 text-white shadow-md hover:bg-rose-700'
                  : 'bg-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash Bin</span>
              {trashedSubmissions.length > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${
                    currentTab === 'trash' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {trashedSubmissions.length}
                </span>
              )}
            </Link>
          )}
        </div>
      )}

      {currentTab === 'overview' && (
      <>
        {/* Statistics Grid - Colored according to Progress: Reading Blue, Listening Green, Writing Orange, Speaking Purple */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-6">
        {[
          {
            title: isVi ? 'KỸ NĂNG ĐỌC' : 'READING',
            score: rScore,
            cardBg: 'bg-gradient-to-b from-white via-blue-50/30 to-blue-50/70 border-2 border-blue-300/80 shadow-[0_8px_25px_rgba(37,99,235,0.08)] hover:shadow-[0_16px_38px_rgba(37,99,235,0.16)] hover:border-blue-400',
            ambientGlow: 'bg-blue-200/40 group-hover:bg-blue-200/60',
            squircleBg: 'from-white to-blue-100/90 border border-blue-200 shadow-[0_4px_16px_rgba(37,99,235,0.14)]',
            titleColor: 'text-[#1E4DB7]',
            discBg: 'from-white via-white to-blue-50/80 border-2 border-blue-200 shadow-[0_4px_16px_rgba(30,77,183,0.10)]',
            scoreColor: 'text-[#1E4DB7]',
            icon: (
              <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 7.5C6 6.39543 6.89543 5.5 8 5.5C10.5 5.5 13.5 6.5 15 8.2V24.5C13.5 23 10.5 22 8 22C6.89543 22 6 22.8954 6 24V7.5Z" fill="#1E4DB7" />
                <path d="M26 7.5C26 6.39543 25.1046 5.5 24 5.5C21.5 5.5 18.5 6.5 17 8.2V24.5C18.5 23 21.5 22 24 22C25.1046 22 26 22.8954 26 24V7.5Z" fill="#2563EB" />
                <path d="M16 8V24.5" stroke="#1D4ED8" strokeWidth="1" />
                <line x1="19.5" y1="10.5" x2="23.5" y2="10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="19.5" y1="14" x2="23.5" y2="14" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="19.5" y1="17.5" x2="22.5" y2="17.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )
          },
          {
            title: isVi ? 'KỸ NĂNG NGHE' : 'LISTENING',
            score: lScore,
            cardBg: 'bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50/70 border-2 border-emerald-300/80 shadow-[0_8px_25px_rgba(16,185,129,0.08)] hover:shadow-[0_16px_38px_rgba(16,185,129,0.16)] hover:border-emerald-400',
            ambientGlow: 'bg-emerald-200/40 group-hover:bg-emerald-200/60',
            squircleBg: 'from-white to-emerald-100/90 border border-emerald-200 shadow-[0_4px_16px_rgba(16,185,129,0.14)]',
            titleColor: 'text-[#059669]',
            discBg: 'from-white via-white to-emerald-50/80 border-2 border-emerald-200 shadow-[0_4px_16px_rgba(5,150,105,0.10)]',
            scoreColor: 'text-[#047857]',
            icon: (
              <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16C6 10.4772 10.4772 6 16 6C21.5228 6 26 10.4772 26 16V22C26 24.2091 24.2091 26 22 26H21C19.8954 26 19 25.1046 19 24V18C19 16.8954 19.8954 16 21 16H23V16C23 12.134 19.866 9 16 9C12.134 9 9 12.134 9 16V16H11C12.1046 16 13 16.8954 13 18V24C13 25.1046 12.1046 26 11 26H10C7.79086 26 6 24.2091 6 22V16Z" fill="#059669" />
                <circle cx="21" cy="20" r="1.5" fill="white" />
                <circle cx="11" cy="20" r="1.5" fill="white" />
              </svg>
            )
          },
          {
            title: isVi ? 'KỸ NĂNG VIẾT' : 'WRITING',
            score: wScore,
            cardBg: 'bg-gradient-to-b from-white via-orange-50/30 to-orange-50/70 border-2 border-orange-300/80 shadow-[0_8px_25px_rgba(249,115,22,0.08)] hover:shadow-[0_16px_38px_rgba(249,115,22,0.16)] hover:border-orange-400',
            ambientGlow: 'bg-orange-200/40 group-hover:bg-orange-200/60',
            squircleBg: 'from-white to-orange-100/90 border border-orange-200 shadow-[0_4px_16px_rgba(249,115,22,0.14)]',
            titleColor: 'text-[#EA580C]',
            discBg: 'from-white via-white to-orange-50/80 border-2 border-orange-200 shadow-[0_4px_16px_rgba(234,88,12,0.10)]',
            scoreColor: 'text-[#C2410C]',
            icon: (
              <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.8 5.7C23.6 4.9 24.9 4.9 25.7 5.7C26.5 6.5 26.5 7.8 25.7 8.6L13.8 20.5C13.5 20.8 13.1 21.0 12.7 21.1L7.5 22.5C6.9 22.7 6.3 22.1 6.5 21.5L7.9 16.3C8.0 15.9 8.2 15.5 8.5 15.2L20.4 3.3" fill="#EA580C" />
                <path d="M19 8L23 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="26" x2="25" y2="26" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )
          },
          {
            title: isVi ? 'KỸ NĂNG NÓI' : 'SPEAKING',
            score: sScore,
            cardBg: 'bg-gradient-to-b from-white via-purple-50/30 to-purple-50/70 border-2 border-purple-300/80 shadow-[0_8px_25px_rgba(168,85,247,0.08)] hover:shadow-[0_16px_38px_rgba(168,85,247,0.16)] hover:border-purple-400',
            ambientGlow: 'bg-purple-200/40 group-hover:bg-purple-200/60',
            squircleBg: 'from-white to-purple-100/90 border border-purple-200 shadow-[0_4px_16px_rgba(168,85,247,0.14)]',
            titleColor: 'text-[#9333EA]',
            discBg: 'from-white via-white to-purple-50/80 border-2 border-purple-200 shadow-[0_4px_16px_rgba(147,51,234,0.10)]',
            scoreColor: 'text-[#7E22CE]',
            icon: (
              <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-7 sm:h-7 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="11.5" y="5" width="9" height="14" rx="4.5" fill="#9333EA" />
                <line x1="14" y1="9" x2="18" y2="9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="14" y1="12" x2="18" y2="12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M8 14.5C8 18.9183 11.5817 22.5 16 22.5C20.4183 22.5 24 18.9183 24 14.5" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M16 22.5V27M11 27H21" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )
          }
        ].map((card, idx) => {
          const displayScore = card.score > 0 
            ? (userProfile?.course === 'PET' ? Math.round(card.score) : card.score.toFixed(1)) 
            : '-';

          return (
            <div 
              key={idx}
              className={`rounded-2xl sm:rounded-3xl p-3 sm:p-5 xl:p-4 2xl:p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between gap-2 sm:gap-3 group ${card.cardBg}`}
            >
              {/* Subtle ambient background glow */}
              <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-colors ${card.ambientGlow}`}></div>

              {/* Left Column: Squircle icon + Title/Subtitle (flex-1 min-w-0 to prevent any overlap) */}
              <div className="flex items-center gap-2 sm:gap-3 xl:gap-2.5 2xl:gap-3.5 min-w-0 flex-1 relative z-10">
                {/* Squircle Icon Container */}
                <div className={`w-9 h-9 sm:w-13 sm:h-13 xl:w-11 xl:h-11 2xl:w-14 2xl:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-b flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.squircleBg}`}>
                  {card.icon}
                </div>

                {/* Text column - properly flexible with no risk of collision */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-[11px] sm:text-base xl:text-xs 2xl:text-base font-black uppercase tracking-tight truncate leading-tight ${card.titleColor}`}>
                    {card.title}
                  </span>
                  <span className="text-[10px] sm:text-xs xl:text-[10px] 2xl:text-xs font-semibold text-slate-500 truncate mt-0.5">
                    {isVi ? 'Điểm TB' : 'Skill Score'}
                  </span>
                </div>
              </div>

              {/* Circular Score Disc - Dedicated shrink-0 container that NEVER overlaps */}
              <div className={`w-11 h-11 sm:w-16 sm:h-16 xl:w-13 xl:h-13 2xl:w-16 2xl:h-16 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 relative z-10 ${card.discBg}`}>
                <span className={`text-lg sm:text-3xl xl:text-xl 2xl:text-3xl font-black tracking-tight ${card.scoreColor}`}>
                  {displayScore}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Progress Section */}
      <section className="space-y-4 sm:space-y-6 mt-6 sm:mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{isVi ? 'Biểu đồ tiến độ' : 'Progress'}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-blue-600 flex items-center justify-between">
              <span>{isVi ? 'Kỹ năng Đọc' : 'Reading'}</span>
            </h3>
            <div className="flex items-end gap-2.5 h-32 sm:h-36 pt-7">
              {getSubmissionsByType('reading').slice(0, 5).reverse().map((sub, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full">
                  <div 
                    className="w-full bg-blue-600 rounded-t-lg relative transition-all duration-300 hover:bg-blue-700 shadow-xs" 
                    style={{ height: `${Math.max(12, ((sub.bandScore || 0) / 9) * 100)}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-blue-600 whitespace-nowrap">
                      {sub.bandScore ? (sub.bandScore % 1 === 0 ? sub.bandScore.toFixed(1) : sub.bandScore) : '-'}
                    </div>
                  </div>
                </div>
              ))}
              {getSubmissionsByType('reading').length === 0 && <div className="text-slate-400 text-sm py-10 w-full text-center">{isVi ? 'Chưa có dữ liệu bài Đọc' : 'No reading data yet'}</div>}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-emerald-600 flex items-center justify-between">
              <span>{isVi ? 'Kỹ năng Nghe' : 'Listening'}</span>
            </h3>
            <div className="flex items-end gap-2.5 h-32 sm:h-36 pt-7">
              {getSubmissionsByType('listening').slice(0, 5).reverse().map((sub, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-lg relative transition-all duration-300 hover:bg-emerald-600 shadow-xs" 
                    style={{ height: `${Math.max(12, ((sub.bandScore || 0) / 9) * 100)}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-600 whitespace-nowrap">
                      {sub.bandScore ? (sub.bandScore % 1 === 0 ? sub.bandScore.toFixed(1) : sub.bandScore) : '-'}
                    </div>
                  </div>
                </div>
              ))}
              {getSubmissionsByType('listening').length === 0 && <div className="text-slate-400 text-sm py-10 w-full text-center">{isVi ? 'Chưa có dữ liệu bài Nghe' : 'No listening data yet'}</div>}
            </div>
          </div>
        
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-orange-600 flex items-center justify-between">
              <span>{isVi ? 'Kỹ năng Viết' : 'Writing'}</span>
            </h3>
            <div className="flex items-end gap-2.5 h-32 sm:h-36 pt-7">
              {getSubmissionsByType('writing').slice(0, 5).reverse().map((sub, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full">
                  <div 
                    className="w-full bg-orange-500 rounded-t-lg relative transition-all duration-300 hover:bg-orange-600 shadow-xs" 
                    style={{ height: `${Math.max(12, ((sub.bandScore || 0) / 9) * 100)}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-orange-600 whitespace-nowrap">
                      {sub.bandScore ? (sub.bandScore % 1 === 0 ? sub.bandScore.toFixed(1) : sub.bandScore) : '-'}
                    </div>
                  </div>
                </div>
              ))}
              {getSubmissionsByType('writing').length === 0 && <div className="text-slate-400 text-sm py-10 w-full text-center">{isVi ? 'Chưa có dữ liệu bài Viết' : 'No writing data yet'}</div>}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-purple-600 flex items-center justify-between">
              <span>{isVi ? 'Kỹ năng Nói' : 'Speaking'}</span>
            </h3>
            <div className="flex items-end gap-2.5 h-32 sm:h-36 pt-7">
              {allSpeakingSubs.slice(0, 5).reverse().map((sub, i) => {
                const evaluated = isSpeakingEvaluated(sub);
                const scoreToReflect = evaluated && sub.bandScore !== undefined && sub.bandScore !== null ? Number(sub.bandScore) : null;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full">
                    <div 
                      className={`w-full ${scoreToReflect !== null ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-200'} rounded-t-lg relative transition-all duration-300 shadow-xs`} 
                      style={{ height: scoreToReflect !== null ? `${Math.max(12, (scoreToReflect / 9) * 100)}%` : '12%' }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-purple-600 whitespace-nowrap">
                        {scoreToReflect !== null ? (scoreToReflect % 1 === 0 ? scoreToReflect.toFixed(1) : scoreToReflect) : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {allSpeakingSubs.length === 0 && <div className="text-slate-400 text-sm py-10 w-full text-center">{isVi ? 'Chưa có dữ liệu bài Nói' : 'No speaking data yet'}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Independent Sections for Skills */}
      <div className="space-y-8 sm:space-y-12 mt-8 sm:mt-12">
        {/* Online Speaking Tests - Redesigned with Band Score & Evaluation Status */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 flex items-center justify-center shadow-xs shrink-0">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{isVi ? 'Bài thi Nói trực tuyến' : 'Online Speaking Tests'}</h2>
              </div>
            </div>
            <button onClick={() => navigate(getTabUrl('speaking'))} className="text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors uppercase tracking-wider sm:tracking-widest flex items-center gap-1 shrink-0 cursor-pointer">
              {isVi ? 'Xem tất cả' : 'View All'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-purple-200/80 shadow-[0_8px_28px_rgba(147,51,234,0.06)] overflow-hidden">
            <div 
              className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 bg-gradient-to-r from-purple-50/90 via-fuchsia-50/35 to-white border-b border-purple-100 cursor-pointer hover:from-purple-50 hover:to-purple-50/30 transition-colors"
              onClick={() => setSpeakingFolderOpen(!speakingFolderOpen)}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2.5 sm:p-3 bg-purple-600 text-white rounded-xl shadow-xs shrink-0">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 truncate">IELTS Speaking</h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{isVi ? 'Danh sách bài thi Nói trực tuyến đã nộp' : 'Your online speaking test submissions'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {(() => {
                  const evaluatedCount = speakingSubs.filter(s => isSpeakingEvaluated(s) && s.bandScore !== undefined && s.bandScore !== null).length;
                  return speakingSubs.length > 0 ? (
                    <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-500 tabular-nums">
                      {isVi ? `${evaluatedCount}/${speakingSubs.length} đã chấm` : `${evaluatedCount}/${speakingSubs.length} evaluated`}
                    </span>
                  ) : null;
                })()}
                <span className="bg-purple-600 text-white font-black px-3 sm:px-3.5 py-1 rounded-full text-xs shadow-xs tracking-wide whitespace-nowrap tabular-nums">
                  {isVi ? `${speakingSubs.length} bài` : `${speakingSubs.length} ${speakingSubs.length === 1 ? 'item' : 'items'}`}
                </span>
                {speakingFolderOpen ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronRight className="w-5 h-5 text-purple-600" />}
              </div>
            </div>
            {speakingFolderOpen && (
              <div className="divide-y divide-purple-100/80 bg-white">
                {speakingSubs.slice(0, 4).map(sub => {
                  const assignment = assignments.find(a => a.id === sub.assignmentId);
                  const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                  const evaluated = isSpeakingEvaluated(sub) && sub.bandScore !== undefined && sub.bandScore !== null;
                  const durationStr = sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : '14m 0s';
                  const dateStr = sub.createdAt ? format(sub.createdAt, 'MMM d') : 'N/A';

                  return (
                    <div 
                      key={sub.id} 
                      onClick={() => navigate(getResultUrl(sub.id))}
                      className="px-4 sm:px-6 py-4 hover:bg-purple-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${evaluated ? 'bg-purple-100 text-purple-700' : 'bg-amber-50 text-amber-600 border border-amber-200/70'}`}>
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-purple-700 transition-colors">{title}</h3>
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5 tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {durationStr}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{dateStr}</span>
                            {evaluated && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-700 font-semibold">{isVi ? 'Đã có điểm' : 'Evaluated'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0 pl-13 sm:pl-0">
                        {/* Band Score or To be evaluated status */}
                        {editingScoreId === sub.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="9"
                              value={editScoreValue}
                              onChange={(e) => setEditScoreValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm font-bold border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 tabular-nums"
                              placeholder="Band"
                              title="Band Score"
                              autoFocus
                            />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save Score">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Cancel">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {evaluated ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100/90 border border-purple-200 text-purple-900 whitespace-nowrap" title="Band Score">
                                <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span className="text-xs font-bold text-purple-700">Band</span>
                                <span className="text-sm font-black text-purple-950 tabular-nums">{Number(sub.bandScore).toFixed(1)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 text-xs font-bold whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{isVi ? 'Chờ đánh giá' : 'To be evaluated'}</span>
                              </span>
                            )}
                            {canAdminEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingScoreId(sub.id);
                                  setEditScoreValue(sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toString() : '');
                                  setEditRawScoreValue('');
                                }}
                                className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                                title={isVi ? 'Chấm điểm nhanh' : 'Edit Band Score'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(getResultUrl(sub.id)); }}
                            className="bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white border border-purple-200/80 hover:border-purple-600 text-xs font-bold py-2 px-3.5 sm:px-4 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                          >
                            {evaluated ? (isVi ? 'Nhận xét' : 'Feedback') : canAdminEdit ? (isVi ? 'Chấm điểm' : 'Evaluate') : (isVi ? 'Xem bài' : 'Feedback')}
                          </button>
                          {canAdminEdit && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTest(sub.id, e); }}
                              className="bg-slate-100/80 hover:bg-red-50 text-slate-400 hover:text-red-600 p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                              title="Delete Test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {speakingSubs.length === 0 && (
                  <div className="py-10 sm:py-12 px-4 text-center text-sm text-slate-500">
                    {isVi ? 'Chưa có bài thi Nói trực tuyến nào.' : 'No online speaking tests yet.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Offline Speaking Assignments - Immersive Purple Theme */}
        {offlineSpeakingSubs.length > 0 && (
          <section className="space-y-4 sm:space-y-6 mt-8 sm:mt-12">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 flex items-center justify-center shadow-xs">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">{isVi ? 'Bài thi Nói tại lớp' : 'Offline Speaking Assignments'}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {offlineSpeakingSubs.slice(0, 4).map(sub => {
                const title = sub.assignmentTitle || 'Offline Speaking Assignment';
                const thumbInfo = getSubmissionThumbnailInfo(sub.audioUrl);
                const feedbackContent = (sub as any).feedback || sub.teacherComment || sub.aiFeedback || (sub.answers as any)?.feedback || (sub.answers as any)?.teacherComment || '';
                const viContent = sub.vietnameseTranslation || sub.teacherCommentVi || (sub.answers as any)?.vietnameseTranslation || (sub.answers as any)?.teacherCommentVi || '';

                const handlePlayVideo = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (thumbInfo?.embedUrl || sub.audioUrl) {
                    setActiveVideoModal({
                      title,
                      embedUrl: thumbInfo?.embedUrl,
                      directUrl: sub.audioUrl,
                    });
                  } else {
                    navigate(getResultUrl(sub.id));
                  }
                };

                const handleOpenFeedback = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  setViewFeedbackItem({
                    title,
                    bandScore: isSpeakingEvaluated(sub) ? sub.bandScore : undefined,
                    date: sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy') : '',
                    feedback: feedbackContent,
                    vietnameseTranslation: viContent,
                    subId: sub.id,
                  });
                };

                return (
                  <div key={sub.id} className="bg-white rounded-3xl border border-purple-200/80 shadow-[0_8px_25px_rgba(168,85,247,0.07)] overflow-hidden flex flex-col sm:flex-row hover:shadow-xl hover:border-purple-400 transition-all group">
                    {/* Thumbnail Side - click opens video directly in-page modal */}
                    <div 
                      onClick={handlePlayVideo}
                      className="sm:w-[46%] relative bg-slate-950 flex items-center justify-center min-h-[175px] overflow-hidden cursor-pointer"
                      title="Watch video"
                    >
                      {thumbInfo?.imageUrl ? (
                        <>
                          <img 
                            src={thumbInfo.imageUrl} 
                            alt={title}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/70 transition-all"></div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-900">
                          <div className="absolute inset-0 bg-purple-500/10 backdrop-blur-xs"></div>
                        </div>
                      )}

                      {/* Video / Mic Play Overlay Badge */}
                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <div className="w-13 h-13 rounded-2xl bg-purple-600/90 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-purple-600 transition-all duration-300">
                          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs shadow-xs">
                          {isVi ? 'Xem video' : 'Watch Video'}
                        </span>
                      </div>

                      {/* Top Corner Badge */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[11px] font-semibold">
                        <Video className="w-3.5 h-3.5 text-purple-300" />
                        <span>{isVi ? 'Tại lớp' : 'Offline Test'}</span>
                      </div>
                    </div>

                    {/* Information Side */}
                    <div className="p-4 sm:p-5 sm:w-[54%] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 
                            onClick={handleOpenFeedback}
                            className="font-black text-slate-900 line-clamp-2 text-base hover:text-purple-700 transition-colors cursor-pointer"
                          >
                            {title}
                          </h3>
                          {canAdminEdit && (
                              <button onClick={(e) => {
                                  e.stopPropagation();
                                  setOfflineForm({
                                      id: sub.id,
                                      name: sub.assignmentTitle || 'Offline Speaking Assignment',
                                      link: sub.audioUrl || '',
                                      score: sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toString() : '',
                                      date: sub.createdAt ? new Date(sub.createdAt.seconds ? sub.createdAt.seconds * 1000 : sub.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                      feedback: feedbackContent,
                                      vietnameseTranslation: viContent
                                  });
                                  setShowAddOffline(true);
                              }} className="text-slate-400 hover:text-purple-600 p-1 shrink-0" title="Edit Entry">
                                  <Edit2 className="w-4 h-4" />
                              </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3 mt-1.5 flex-wrap">
                          {isSpeakingEvaluated(sub) && sub.bandScore !== undefined && sub.bandScore !== null ? (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-black text-xs shadow-xs tabular-nums">Band {Number(sub.bandScore).toFixed(1)}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 font-bold text-xs">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              {isVi ? 'Chờ đánh giá' : 'To be evaluated'}
                            </span>
                          )}
                          <span className="text-purple-300">•</span>
                          <span className="text-xs font-medium text-slate-500">{sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : '15m'}</span>
                          <span className="text-purple-300">•</span>
                          <span className="text-xs font-medium text-slate-500">{sub.createdAt ? format(sub.createdAt, 'MMM d') : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2 flex-wrap sm:flex-nowrap">
                        <button 
                          onClick={handleOpenFeedback} 
                          className="flex-1 bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-800 text-xs font-black py-2.5 px-3 rounded-xl transition-all text-center whitespace-nowrap shadow-xs cursor-pointer"
                        >
                          {isVi ? 'Nhận xét' : 'Feedback'}
                        </button>
                        {sub.audioUrl && (
                          <a href={sub.audioUrl} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center border border-purple-200/60" title="Open Original Video Link">
                            <Upload className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {canAdminEdit && (
                          <button onClick={(e) => handleDeleteTest(sub.id, e)} className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center" title="Delete Test">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reading Activity - Immersive Blue Theme */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 flex items-center justify-center shadow-xs shrink-0">
                <Book className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{isVi ? 'Kết quả Kỹ năng Đọc' : 'Reading Activity'}</h2>
            </div>
            <button onClick={() => navigate(getTabUrl('reading'))} className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider sm:tracking-widest flex items-center gap-1 shrink-0 cursor-pointer">
              {isVi ? 'Xem tất cả' : 'View All'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-b from-white via-blue-50/20 to-blue-50/40 rounded-3xl sm:rounded-[2rem] border border-blue-200/80 shadow-[0_10px_30px_rgba(37,99,235,0.08)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-blue-50 via-blue-100/50 to-indigo-50/30 border-b border-blue-100">
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-blue-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                    <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-blue-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Điểm' : 'Score'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-blue-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Số câu đúng' : 'Correct'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-blue-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Thời gian' : 'Time'}</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-blue-900/70 uppercase tracking-wider sm:tracking-widest text-right">{isVi ? 'Ngày làm' : 'Date'}</th>
                    {canAdminEdit && <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-blue-900/70 uppercase tracking-widest text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/60 bg-white/70 backdrop-blur-xs">
                  {getSubmissionsByType('reading').length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-10 sm:py-12 text-center text-sm text-slate-500">{isVi ? 'Chưa có bài kiểm tra Đọc nào.' : 'No reading activity yet.'}</td>
                    </tr>
                  ) : getSubmissionsByType('reading').slice(0, 5).map((sub) => {
                    const assignment = assignments.find(a => a.id === sub.assignmentId);
                    const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                    return (
                      <tr key={sub.id} className="hover:bg-blue-50/60 transition-colors cursor-pointer" onClick={() => { navigate(getResultUrl(sub.id)); }}>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">{title}</td>
                        <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-blue-100 text-blue-700 font-black text-xs sm:text-sm">
                            {sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-semibold hidden sm:table-cell">{sub.percentage !== undefined && sub.percentage !== null ? `${Math.round((sub.percentage / 100) * 40)}/40` : '-'}</td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-medium hidden sm:table-cell">{sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : '-'}</td>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-slate-500 text-right text-xs sm:text-sm font-medium whitespace-nowrap">{sub.createdAt ? format(sub.createdAt, 'MMM d') : '-'}</td>
                        {canAdminEdit && (
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right">
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Listening Activity - Immersive Green Theme */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 flex items-center justify-center shadow-xs shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{isVi ? 'Kết quả Kỹ năng Nghe' : 'Listening Activity'}</h2>
            </div>
            <button onClick={() => navigate(getTabUrl('listening'))} className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider sm:tracking-widest flex items-center gap-1 shrink-0 cursor-pointer">
              {isVi ? 'Xem tất cả' : 'View All'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-b from-white via-emerald-50/20 to-emerald-50/40 rounded-3xl sm:rounded-[2rem] border border-emerald-200/80 shadow-[0_10px_30px_rgba(16,185,129,0.08)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-teal-50/30 border-b border-emerald-100">
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                    <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Điểm' : 'Score'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-emerald-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Số câu đúng' : 'Correct'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-emerald-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Thời gian' : 'Time'}</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-emerald-900/70 uppercase tracking-wider sm:tracking-widest text-right">{isVi ? 'Ngày làm' : 'Date'}</th>
                    {canAdminEdit && <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-emerald-900/70 uppercase tracking-widest text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/60 bg-white/70 backdrop-blur-xs">
                  {getSubmissionsByType('listening').length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-10 sm:py-12 text-center text-sm text-slate-500">{isVi ? 'Chưa có bài kiểm tra Nghe nào.' : 'No listening activity yet.'}</td>
                    </tr>
                  ) : getSubmissionsByType('listening').slice(0, 5).map((sub) => {
                    const assignment = assignments.find(a => a.id === sub.assignmentId);
                    const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                    return (
                      <tr key={sub.id} className="hover:bg-emerald-50/60 transition-colors cursor-pointer" onClick={() => { navigate(getResultUrl(sub.id)); }}>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">{title}</td>
                        <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs sm:text-sm">
                            {sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-semibold hidden sm:table-cell">{sub.percentage !== undefined && sub.percentage !== null ? `${Math.round((sub.percentage / 100) * 40)}/40` : '-'}</td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-medium hidden sm:table-cell">{sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : '-'}</td>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-slate-500 text-right text-xs sm:text-sm font-medium whitespace-nowrap">{sub.createdAt ? format(sub.createdAt, 'MMM d') : '-'}</td>
                        {canAdminEdit && (
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right">
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Writing Activity - Immersive Orange Theme */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 flex items-center justify-center shadow-xs shrink-0">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{isVi ? 'Kết quả Kỹ năng Viết' : 'Writing Activity'}</h2>
            </div>
            <button onClick={() => navigate(getTabUrl('writing'))} className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors uppercase tracking-wider sm:tracking-widest flex items-center gap-1 shrink-0 cursor-pointer">
              {isVi ? 'Xem tất cả' : 'View All'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-b from-white via-orange-50/20 to-orange-50/40 rounded-3xl sm:rounded-[2rem] border border-orange-200/80 shadow-[0_10px_30px_rgba(249,115,22,0.08)] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-orange-50 via-orange-100/50 to-amber-50/30 border-b border-orange-100">
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-orange-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                    <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-orange-900/70 uppercase tracking-wider sm:tracking-widest">{isVi ? 'Điểm' : 'Score'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-orange-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Số từ' : 'Words'}</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-orange-900/70 uppercase tracking-widest hidden sm:table-cell">{isVi ? 'Thời gian' : 'Time'}</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-black text-orange-900/70 uppercase tracking-wider sm:tracking-widest text-right">{isVi ? 'Ngày làm' : 'Date'}</th>
                    {canAdminEdit && <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-xs font-black text-orange-900/70 uppercase tracking-widest text-right"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100/60 bg-white/70 backdrop-blur-xs">
                  {getSubmissionsByType('writing').length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-10 sm:py-12 text-center text-sm text-slate-500">{isVi ? 'Chưa có bài kiểm tra Viết nào.' : 'No writing activity yet.'}</td>
                    </tr>
                  ) : getSubmissionsByType('writing').slice(0, 5).map((sub) => {
                    const assignment = assignments.find(a => a.id === sub.assignmentId);
                    const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                    
                    let wordCount = 0;
                    if (typeof sub.answers === 'string') {
                      wordCount = sub.answers.split(/\s+/).filter(w => w.length > 0).length;
                    } else if (sub.answers && sub.answers['task2']) {
                       wordCount = sub.answers['task2'].split(/\s+/).filter(w => w.length > 0).length;
                    } else if (sub.answers && sub.answers['task1']) {
                       wordCount = sub.answers['task1'].split(/\s+/).filter(w => w.length > 0).length;
                    }
                    
                    return (
                      <tr key={sub.id} className="hover:bg-orange-50/60 transition-colors cursor-pointer" onClick={() => { navigate(getResultUrl(sub.id)); }}>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">{title}</td>
                        <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-orange-100 text-orange-700 font-black text-xs sm:text-sm">
                            {sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toFixed(1) : isVi ? 'Chờ chấm' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-semibold hidden sm:table-cell">{wordCount}</td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-slate-600 font-medium hidden sm:table-cell">{sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : '-'}</td>
                        <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-slate-500 text-right text-xs sm:text-sm font-medium whitespace-nowrap">{sub.createdAt ? format(sub.createdAt, 'MMM d') : '-'}</td>
                        {canAdminEdit && (
                          <td className="px-3 sm:px-6 py-3.5 sm:py-4 text-right">
                            <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      
</>
      )}

      {currentTab === 'results' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-slate-50">
             <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isVi ? 'Tất cả bài đã hoàn thành' : 'All Completed Tests'}</h2>
             <div className="flex gap-2 w-full sm:w-auto">
                 <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex-1 sm:flex-initial bg-white border border-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-[#1E4DB7] shadow-sm">
                     <option value="all">{isVi ? 'Tất cả kỹ năng' : 'All Skills'}</option>
                     <option value="reading">{isVi ? 'Kỹ năng Đọc' : 'Reading'}</option>
                     <option value="listening">{isVi ? 'Kỹ năng Nghe' : 'Listening'}</option>
                     <option value="writing">{isVi ? 'Kỹ năng Viết' : 'Writing'}</option>
                     <option value="speaking">{isVi ? 'Kỹ năng Nói' : 'Speaking'}</option>
                 </select>
                 <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} className="flex-1 sm:flex-initial bg-white border border-slate-300 text-xs sm:text-sm rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-[#1E4DB7] shadow-sm">
                     <option value="desc">{isVi ? 'Mới nhất' : 'Newest First'}</option>
                     <option value="asc">{isVi ? 'Cũ nhất' : 'Oldest First'}</option>
                 </select>
             </div>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest whitespace-nowrap">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                  <th className="px-3 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest whitespace-nowrap">{isVi ? 'Kỹ năng' : 'Subject'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">{isVi ? 'Ngày hoàn thành' : 'Completed'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">{isVi ? 'Thời gian' : 'Time Spent'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">{isVi ? 'Nhận xét' : 'Feedback'}</th>
                  <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider sm:tracking-widest whitespace-nowrap text-right">{isVi ? 'Điểm Band' : 'Band Score'}</th>
                  <th className="px-2 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
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
                    let filtered = filterType === 'all' ? [...submissions] : submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || getFallbackType(s.assignmentId)) === filterType);
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
                  const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                  const type = sub.assignmentType || assignment?.type || (getFallbackType(sub.assignmentId));
                  const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => navigate(getResultUrl(sub.id))}>
                      <td className="px-3.5 sm:px-6 py-3.5 sm:py-4">
                        {canAdminEdit && editingTitleId === sub.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 sm:gap-3">
                                  {type === 'speaking' && (
                                    <div className="relative w-10 h-7 bg-slate-800 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:ring-1 ring-purple-400 transition-all" title="View Video">
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80')] bg-cover bg-center opacity-40"></div>
                                      <PlayCircle className="w-4 h-4 text-white/90 z-10" />
                                    </div>
                                  )}
                                  <p className="text-xs sm:text-sm font-bold text-slate-900">{title}</p>
                            {canAdminEdit && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3.5 sm:py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold ${type === 'reading' ? 'bg-blue-50 text-[#1E4DB7]' : type === 'listening' ? 'bg-teal-50 text-teal-600' : type === 'writing' ? 'bg-orange-50 text-[#F4A340]' : 'bg-purple-50 text-purple-600'}`}>
                          {getIcon(type)} <span className="capitalize">{isVi ? (type === 'reading' ? 'Đọc' : type === 'listening' ? 'Nghe' : type === 'writing' ? 'Viết' : type === 'speaking' ? 'Nói' : type) : type}</span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-sm font-medium text-slate-600 hidden md:table-cell whitespace-nowrap">
                        {sub.timeSpent ? `${Math.floor(sub.timeSpent / 60)}m ${sub.timeSpent % 60}s` : 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 hidden md:table-cell">
                         <div className="flex flex-wrap items-center gap-2">
                           {sub.correctedFileUrl && (
                               <a href={sub.correctedFileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider hover:bg-green-100" onClick={(e) => e.stopPropagation()}>{isVi ? 'Bài chấm' : 'Corrected Writing'}</a>
                           )}
                         </div>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
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
                              placeholder="Band"
                              title="Band Score"
                              autoFocus
                            />
                            <input
                              type="number"
                              min="0"
                              max="40"
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              value={editRawScoreValue}
                              onChange={(e) => setEditRawScoreValue(e.target.value)}
                              placeholder="Raw"
                              title="Raw Score"
                            />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
                             {(type !== 'speaking' || isSpeakingEvaluated(sub)) && sub.bandScore !== undefined && sub.bandScore !== null ? (
                               <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base tabular-nums" title="Band Score">{sub.bandScore.toFixed(1)}</span>
                             ) : type === 'speaking' ? (
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
                                 <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                 {isVi ? 'Chờ đánh giá' : 'To be evaluated'}
                               </span>
                             ) : (
                               <span className="text-slate-400">TBD</span>
                             )}
                            {canAdminEdit && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {canAdminEdit && (
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
                          {canAdminEdit && type === 'writing' && (
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
                          {canAdminEdit && (
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
        <div className="space-y-6">
          {!isParentMode && (userProfile?.course === 'PET' || searchParams.get('course') === 'pet' || searchParams.get('course') === 'PET') && (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Available Practice Tests</h2>
                    <p className="text-sm text-slate-500">Take a practice test to improve your score</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link 
                  to="/test/embed?src=%2FPET_Reading%2Ftest_1%2Findex.html" 
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Test 1</h3>
                    <p className="text-sm text-slate-500">B1 Preliminary Reading</p>
                  </div>
                </Link>
              </div>
            </section>
          )}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl shrink-0">
                    <Book className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isVi ? 'Hồ sơ Kỹ năng Đọc' : 'Reading Portfolio'}</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{isVi ? 'Các bài kiểm tra Đọc đã hoàn thành' : 'Your submitted reading tests'}</p>
                 </div>
             </div>
             {canAdminEdit && (
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
          <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">{isVi ? 'Ngày nộp' : 'Submitted'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">{isVi ? 'Điểm' : 'Score'}</th>
                  <th className="px-2 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (getFallbackType(s.assignmentId))) === 'reading');
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
                      const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                      const type = sub.assignmentType || assignment?.type || (getFallbackType(sub.assignmentId));
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            {
                              navigate(getResultUrl(sub.id));
                            }
                          }}>
                            <td className="px-6 py-5">
                              {canAdminEdit && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  {type === 'speaking' && (
                                    <div className="relative w-10 h-7 bg-slate-800 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:ring-1 ring-purple-400 transition-all" title="View Video">
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80')] bg-cover bg-center opacity-40"></div>
                                      <PlayCircle className="w-4 h-4 text-white/90 z-10" />
                                    </div>
                                  )}
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {canAdminEdit && (
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
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} placeholder="Band" title="Band Score" />
                                  <input type="number" min="0" max="40" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
         {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base" title="Band Score">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {canAdminEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {canAdminEdit && (
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
        </div>
      )}

      {currentTab === 'listening' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 sm:p-3 bg-teal-100 rounded-xl shrink-0">
                    <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                 </div>
                 <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isVi ? 'Hồ sơ Kỹ năng Nghe' : 'Listening Portfolio'}</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{isVi ? 'Các bài kiểm tra Nghe đã hoàn thành' : 'Your submitted listening tests'}</p>
                 </div>
             </div>
             {canAdminEdit && (
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
          <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">{isVi ? 'Ngày nộp' : 'Submitted'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">{isVi ? 'Điểm' : 'Score'}</th>
                  <th className="px-2 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || (getFallbackType(s.assignmentId))) === 'listening');
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
                      const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                      const type = sub.assignmentType || assignment?.type || (getFallbackType(sub.assignmentId));
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            {
                              navigate(getResultUrl(sub.id));
                            }
                          }}>
                            <td className="px-6 py-5">
                              {canAdminEdit && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  {type === 'speaking' && (
                                    <div className="relative w-10 h-7 bg-slate-800 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:ring-1 ring-purple-400 transition-all" title="View Video">
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80')] bg-cover bg-center opacity-40"></div>
                                      <PlayCircle className="w-4 h-4 text-white/90 z-10" />
                                    </div>
                                  )}
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {canAdminEdit && (
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
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} placeholder="Band" title="Band Score" />
                                  <input type="number" min="0" max="40" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
         {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base" title="Band Score">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {canAdminEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {canAdminEdit && (
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
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 sm:p-3 bg-orange-100 rounded-xl shrink-0">
                    <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-[#F4A340]" />
                 </div>
                 <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isVi ? 'Hồ sơ Kỹ năng Viết' : 'Writing Portfolio'}</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{isVi ? 'Bài viết của học viên và nhận xét từ giáo viên' : 'Submitted essays and teacher feedback'}</p>
                 </div>
             </div>
             {canAdminEdit && (
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
          <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">{isVi ? 'Ngày nộp' : 'Submitted'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Nhận xét' : 'Feedback'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">{isVi ? 'Điểm Band' : 'Band Score'}</th>
                  <th className="px-2 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || getFallbackType(s.assignmentId)) === 'writing');
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
                      const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                      const type = sub.assignmentType || assignment?.type || (getFallbackType(sub.assignmentId));
                      const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback || !!sub.fileUrl;
                      
                      return (
                        <React.Fragment key={sub.id}>
                          <tr className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                            navigate(getResultUrl(sub.id));
                          }}>
                            <td className="px-6 py-5">
                              {canAdminEdit && editingTitleId === sub.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  {type === 'speaking' && (
                                    <div className="relative w-10 h-7 bg-slate-800 border border-slate-700 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:ring-1 ring-purple-400 transition-all" title="View Video">
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80')] bg-cover bg-center opacity-40"></div>
                                      <PlayCircle className="w-4 h-4 text-white/90 z-10" />
                                    </div>
                                  )}
                                  <p className="text-sm font-bold text-slate-900">{title}</p>
                                  {canAdminEdit && (
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
                                  <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} placeholder="Band" title="Band Score" />
                                  <input type="number" min="0" max="40" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
         {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base" title="Band Score">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}
                                  {canAdminEdit && (
                                    <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {canAdminEdit && (
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
                                {canAdminEdit && (
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
                                {canAdminEdit && (
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
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 sm:p-3 bg-purple-100 rounded-xl shrink-0">
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                 </div>
                 <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">{isVi ? 'Hồ sơ Kỹ năng Nói' : 'Speaking Recordings'}</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{isVi ? 'Các bài thi Nói và nhận xét từ giáo viên' : 'Past speaking sessions and teacher feedback'}</p>
                 </div>
             </div>
             {canAdminEdit && (
               <div>
                 <button
                  onClick={() => {
                      setOfflineForm({ id: '', name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '', vietnameseTranslation: '' });
                      setShowAddOffline(true);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Offline Entry
                </button>
               </div>
             )}
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Bài kiểm tra' : 'Test Name'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">{isVi ? 'Ngày nộp' : 'Submitted'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{isVi ? 'Video / Nhận xét' : 'Audio/Feedback'}</th>
                  <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">{isVi ? 'Điểm Band' : 'Band Score'}</th>
                  <th className="px-2 sm:px-6 py-3.5 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                    const filtered = submissions.filter((s) => (s.assignmentType || assignments.find(a => a.id === s.assignmentId)?.type || getFallbackType(s.assignmentId)) === 'speaking');
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
                      const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                      const type = sub.assignmentType || assignment?.type || (getFallbackType(sub.assignmentId));
                      const hasFeedback = !!sub.teacherComment || !!sub.aiFeedback;
                      const hasAudio = !!sub.audioUrl;
                      
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors cursor-pointer bg-white" onClick={() => {
                          navigate(getResultUrl(sub.id));
                        }}>
                          <td className="px-6 py-5">
                            {canAdminEdit && editingTitleId === sub.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="text" className="w-full px-2 py-1 text-sm font-bold border border-slate-300 rounded" value={editTitleValue} onChange={(e) => setEditTitleValue(e.target.value)} autoFocus />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditTitle(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTitleId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                {type === 'speaking' && (() => {
                                  const thumb = getSubmissionThumbnailInfo(sub.audioUrl);
                                  return (
                                    <div className="relative w-12 h-8 bg-slate-900 border border-slate-700/60 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:ring-2 ring-purple-400 transition-all" title="View Video">
                                      {thumb?.imageUrl ? (
                                        <img src={thumb.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                      ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-900 opacity-80"></div>
                                      )}
                                      <div className="absolute inset-0 bg-black/30"></div>
                                      <PlayCircle className="w-4 h-4 text-white/95 relative z-10 drop-shadow" />
                                    </div>
                                  );
                                })()}
                                <p className="text-sm font-bold text-slate-900">{title}</p>
                                {canAdminEdit && (
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
                               {sub.audioUrl && (
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     const thumb = getSubmissionThumbnailInfo(sub.audioUrl);
                                     setActiveVideoModal({
                                       title,
                                       embedUrl: thumb?.embedUrl,
                                       directUrl: sub.audioUrl,
                                     });
                                   }}
                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors border border-purple-200/60 shadow-xs"
                                   title="Watch Video"
                                 >
                                   <Play className="w-3.5 h-3.5" fill="currentColor" />
                                   <span>Video</span>
                                 </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const feedbackText = (sub as any).feedback || sub.teacherComment || sub.aiFeedback || (sub.answers as any)?.feedback || (sub.answers as any)?.teacherComment || '';
                                    const viText = sub.vietnameseTranslation || sub.teacherCommentVi || (sub.answers as any)?.vietnameseTranslation || (sub.answers as any)?.teacherCommentVi || '';
                                    setViewFeedbackItem({
                                      title,
                                      bandScore: isSpeakingEvaluated(sub) ? sub.bandScore : undefined,
                                      date: sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy') : '',
                                      feedback: feedbackText,
                                      vietnameseTranslation: viText,
                                      subId: sub.id,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 font-bold text-xs rounded-lg transition-colors shadow-xs"
                                  title="View Feedback"
                                >
                                  <span>{isVi ? 'Nhận xét' : 'Feedback'}</span>
                                </button>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                            {editingScoreId === sub.id ? (
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} placeholder="Band" title="Band Score" />
                                  <input type="number" min="0" max="40" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditScore(sub.id); }} className="text-green-600 hover:text-green-800"><CheckCircle2 className="w-4 h-4" /></button>
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingScoreId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                {sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
         {isSpeakingEvaluated(sub) && sub.bandScore !== undefined && sub.bandScore !== null ? (
           <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 text-sm sm:text-base font-black tabular-nums" title="Band Score">
             <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
             Band {sub.bandScore.toFixed(1)}
           </span>
         ) : (
           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
             <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
             {isVi ? 'Chờ đánh giá' : 'To be evaluated'}
           </span>
         )}
                                {canAdminEdit && (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Score">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {canAdminEdit && (
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
                              {canAdminEdit && (
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

      {canAdminEdit && currentTab === 'trash' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-rose-50/40">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Trash Bin</h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    Admin Only
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Deleted test results for {targetUserName || userProfile?.nickname || firstName}. Restore any test to return it to History and score calculations.
                </p>
              </div>
            </div>
            {trashedSubmissions.length > 1 && (
              <button
                type="button"
                disabled={isRestoringAll}
                onClick={handleRestoreAllTests}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isRestoringAll ? 'animate-spin' : ''}`} />
                <span>{isRestoringAll ? 'Restoring All...' : `Restore All (${trashedSubmissions.length})`}</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">Completed</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap hidden md:table-cell">Deleted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Band Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trashedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 bg-slate-50/50">
                      <Trash2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700">Trash Bin is empty</p>
                      <p className="text-xs text-slate-400 mt-1">Deleted tests will appear here so you can restore them anytime.</p>
                    </td>
                  </tr>
                ) : (
                  trashedSubmissions.map((sub) => {
                    const assignment = assignments.find((a) => a.id === sub.assignmentId);
                    const title = getFallbackTitle(sub.assignmentId, sub.assignmentTitle) || assignment?.title || 'Unknown Test';
                    const type = sub.assignmentType || assignment?.type || getFallbackType(sub.assignmentId);
                    const deletedTimestamp = sub.deletedAt?.toMillis
                      ? sub.deletedAt.toMillis()
                      : typeof sub.deletedAt === 'number'
                      ? sub.deletedAt
                      : null;

                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer bg-white"
                        onClick={() => navigate(getResultUrl(sub.id))}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                              type === 'reading'
                                ? 'bg-blue-50 text-[#1E4DB7]'
                                : type === 'listening'
                                ? 'bg-teal-50 text-teal-600'
                                : type === 'writing'
                                ? 'bg-orange-50 text-[#F4A340]'
                                : 'bg-purple-50 text-purple-600'
                            }`}
                          >
                            {getIcon(type)} <span className="capitalize">{type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                          {sub.createdAt ? format(sub.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-rose-600 hidden md:table-cell whitespace-nowrap">
                          {deletedTimestamp ? format(deletedTimestamp, 'MMM d, yyyy h:mm a') : 'Recently'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {sub.score !== undefined && sub.score !== null && (
                              <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">
                                {sub.score}/40
                              </span>
                            )}
                            {(type !== 'speaking' || isSpeakingEvaluated(sub)) && sub.bandScore !== undefined && sub.bandScore !== null ? (
                              <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base" title="Band Score">
                                {sub.bandScore.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-slate-400">TBD</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={restoringId === sub.id}
                              onClick={(e) => handleRestoreTest(sub.id!, e)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                              title="Restore Test Result"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${restoringId === sub.id ? 'animate-spin' : ''}`} />
                              <span>{restoringId === sub.id ? 'Restoring...' : 'Restore'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPermanentDeleteId(sub.id!);
                              }}
                              className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {testToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Move Test to Trash Bin</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this test result? It will be moved to the Trash Bin where an admin can restore it at any time.</p>
            
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
                {isDeleting ? 'Moving...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {permanentDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Permanently</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to permanently delete this test result from the Trash Bin? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setPermanentDeleteId(null)}
                disabled={isPermanentDeleting}
                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPermanentDeleteTest}
                disabled={isPermanentDeleting}
                className="flex-1 py-3 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isPermanentDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddOffline && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{offlineForm.id ? 'Edit Offline Entry' : 'Add Offline Entry'}</h3>
              <button onClick={() => setShowAddOffline(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Test Name</label>
                <input 
                  type="text"
                  value={offlineForm.name}
                  onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="e.g. Offline Speaking Assignment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Link (e.g. Google Drive Video/Audio)</label>
                <input 
                  type="url"
                  value={offlineForm.link}
                  onChange={(e) => setOfflineForm({...offlineForm, link: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Band Score</label>
                <input 
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={offlineForm.score}
                  onChange={(e) => setOfflineForm({...offlineForm, score: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="e.g. 6.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                <input 
                  type="date"
                  value={offlineForm.date}
                  onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Feedback / Notes</label>
                <textarea 
                  value={offlineForm.feedback}
                  onChange={(e) => setOfflineForm({...offlineForm, feedback: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                  placeholder="Add any teacher feedback or personal notes here..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vietnamese Translation</label>
                <textarea 
                  value={offlineForm.vietnameseTranslation || ''}
                  onChange={(e) => setOfflineForm({...offlineForm, vietnameseTranslation: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                  placeholder="Bản dịch tiếng Việt..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowAddOffline(false)} 
                  className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                      if (!targetUserId) return;
                      try {
                        const bandScore = parseFloat(offlineForm.score);
                        const payload = {
                          assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                          audioUrl: offlineForm.link,
                          bandScore: isNaN(bandScore) ? null : bandScore,
                          isEvaluated: !isNaN(bandScore),
                          evaluatedBy: !isNaN(bandScore) ? 'admin' : null,
                          feedback: offlineForm.feedback,
                          teacherComment: offlineForm.feedback,
                          vietnameseTranslation: offlineForm.vietnameseTranslation,
                          teacherCommentVi: offlineForm.vietnameseTranslation,
                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),
                        };
                        if (offlineForm.id) {
                            await updateDoc(doc(db, 'submissions', offlineForm.id), payload);
                        } else {
                            const newDoc = await addDoc(collection(db, 'submissions'), {
                              ...payload,
                              assignmentId: 'offline_speaking',
                              assignmentType: 'speaking',
                              userId: targetUserId,
                            });

                            createSubmissionNotification({
                              userId: targetUserId,
                              studentName: userProfile?.name || targetUserName || 'Student',
                              assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                              type: 'practice_test',
                              testType: 'speaking',
                              bandScore: isNaN(bandScore) ? undefined : bandScore,
                              submissionId: newDoc.id
                            }).catch(console.warn);
                        }
                        setShowAddOffline(false);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to save entry");
                      }
                  }} 
                  className="flex-1 py-3.5 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-slate-900">Edit Profile</h3>
              <button 
                type="button"
                onClick={() => setIsEditingProfile(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {profileError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nickname</label>
                <input 
                  type="text" 
                  value={editNickname} 
                  onChange={e => setEditNickname(e.target.value)}
                  placeholder="e.g. Suzie"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={e => setEditUsername(e.target.value)}
                  placeholder="e.g. airflavorburger"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Used to log into your account.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                  >
                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showEditPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input 
                  type={showEditPassword ? 'text' : 'password'} 
                  value={editPassword} 
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Used to log into your account.</p>
              </div>
              
              {/* Profile Photo URL - ONLY VISIBLE TO THE ADMIN */}
              {canAdminEdit && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Profile Photo URL</label>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Admin Only
                    </span>
                  </div>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900"
                      />
                    </div>
                  </div>
                  {editPhotoURL && (
                    <div className="mt-3 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-200 shadow-sm overflow-hidden bg-slate-50">
                        <img src={editPhotoURL || undefined} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Motto</label>
                <textarea 
                  value={editMotto} 
                  onChange={e => setEditMotto(e.target.value)}
                  placeholder="e.g. Track your progress and continue your journey to Band 7.5. You're doing great!"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                ></textarea>
              </div>
              
              <div className="pt-3 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)} 
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={profileSaving}
                  onClick={handleSaveProfile} 
                  className="flex-1 py-3 bg-[#1E4DB7] text-white font-bold hover:bg-blue-800 rounded-xl transition-colors shadow-lg shadow-blue-500/30 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {canAdminEdit && showCredentialsModal && (
        <StudentCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          userId={targetUserId || user?.uid || ''}
          userProfile={userProfile}
          course={userProfile?.course || 'IELTS'}
        />
      )}

      {canAdminEdit && showParentAccessModal && (
        <ParentAccessModal
          isOpen={showParentAccessModal}
          onClose={() => setShowParentAccessModal(false)}
          userId={targetUserId || user?.uid || ''}
          userProfile={userProfile}
          course={userProfile?.course || 'IELTS'}
        />
      )}

      {/* Direct In-Page Video Player Modal (No external popup) */}
      {activeVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base truncate max-w-md">{activeVideoModal.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {activeVideoModal.directUrl && (
                  <a 
                    href={activeVideoModal.directUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    title="Open original link"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative w-full bg-black aspect-video flex items-center justify-center">
              {activeVideoModal.embedUrl ? (
                <iframe 
                  src={activeVideoModal.embedUrl}
                  title={activeVideoModal.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                ></iframe>
              ) : activeVideoModal.directUrl ? (
                <div className="p-8 text-center space-y-4">
                  <PlayCircle className="w-16 h-16 text-purple-400 mx-auto" />
                  <p className="text-slate-300 text-sm max-w-md">This file link can be accessed directly:</p>
                  <a 
                    href={activeVideoModal.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                  >
                    Watch Speaking Video <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Full Feedback Modal (Landscape Widescreen Mode occupying the screen, two-column layout for Feedback & Vietnamese translation so nothing gets cut) */}
      {viewFeedbackItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-7xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header (Sticky top) */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 backdrop-blur-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{viewFeedbackItem.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-semibold">
                    {viewFeedbackItem.bandScore !== undefined && viewFeedbackItem.bandScore !== null && (
                      <span className="px-2.5 py-0.5 bg-purple-600 text-white rounded-md font-black">
                        Band {Number(viewFeedbackItem.bandScore).toFixed(1)}
                      </span>
                    )}
                    {viewFeedbackItem.date && <span>• {viewFeedbackItem.date}</span>}
                    <span className="hidden sm:inline text-purple-400 font-medium">• {isVi ? 'Nhận xét Kỹ năng Nói' : 'Speaking Evaluation Report'}</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewFeedbackItem(null)} 
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Landscape Body - 2 Columns on desktop (English Assessment | Vietnamese Translation) or responsive stacked */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/30">
              <div className={`grid gap-5 sm:gap-6 ${viewFeedbackItem.vietnameseTranslation ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Column 1: Teacher Assessment & Feedback */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      {isVi ? 'Nhận xét của Giáo viên (Tiếng Anh)' : 'Examiner / Teacher Assessment'}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200/80">English</span>
                  </div>
                  <div className="bg-white border border-purple-100 rounded-2xl p-5 sm:p-7 shadow-xs text-slate-800 text-[14.5px] sm:text-base leading-relaxed font-sans whitespace-pre-wrap flex-1">
                    {viewFeedbackItem.feedback ? viewFeedbackItem.feedback : (
                      <span className="text-slate-400 italic">{isVi ? 'Chưa có nhận xét.' : 'No feedback provided yet.'}</span>
                    )}
                  </div>
                </div>

                {/* Column 2: Vietnamese Translation */}
                {viewFeedbackItem.vietnameseTranslation && (
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        {isVi ? 'Nhận xét bằng Tiếng Việt' : 'Vietnamese Translation'}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200/80">Tiếng Việt</span>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-7 shadow-xs text-slate-800 text-[14.5px] sm:text-base leading-relaxed font-sans whitespace-pre-wrap flex-1">
                      {viewFeedbackItem.vietnameseTranslation}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer (Sticky bottom) */}
            <div className="px-5 sm:px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-slate-400">
                {isVi ? 'Kỷ Nguyên Era · Báo cáo đánh giá' : 'EraEnglish Assessment Feedback'}
              </span>
              <button 
                type="button"
                onClick={() => setViewFeedbackItem(null)} 
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
              >
                {isVi ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
