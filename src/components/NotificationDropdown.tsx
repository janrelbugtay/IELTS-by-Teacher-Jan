import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, ExternalLink, BookOpen, PenTool, Mic, Headphones, 
  FileText, Folder, CheckCheck, Sparkles, Filter, X 
} from 'lucide-react';
import { Link } from 'react-router';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { NotificationItem } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const { user, isAdmin, userCourse } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userFolder, setUserFolder] = useState<{ id: string | null; name: string | null; course: string | null } | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'practice_test'>('all');
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      if (!user) return [];
      const saved = localStorage.getItem(`era_read_notifications_${user.uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch current user's folder assignment
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchUserFolder = async () => {
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        if (uDoc.exists() && isMounted) {
          const data = uDoc.data();
          setUserFolder({
            id: data.folderId || null,
            name: data.folderName || null,
            course: data.course || userCourse || 'IELTS'
          });
        }
      } catch (err) {
        console.warn('Could not fetch user folder info:', err);
      }
    };

    fetchUserFolder();
    return () => { isMounted = false; };
  }, [user, userCourse]);

  // Listen to Firestore notifications
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    // Listen to real-time notifications
    const notifQ = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const unsubscribe = onSnapshot(notifQ, async (snapshot) => {
      if (!isMounted) return;
      
      const firestoreItems: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        firestoreItems.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
      });

      // If few/zero records exist in the notifications collection, bootstrap with recent submissions
      if (firestoreItems.length < 5) {
        try {
          const subQ = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(25));
          const subSnap = await getDocs(subQ);
          const userCache: Record<string, any> = {};

          const fallbackItems: NotificationItem[] = [];
          for (const sDoc of subSnap.docs) {
            const sData = sDoc.data();
            const sUserId = sData.userId;
            
            // Check if already in firestoreItems
            if (firestoreItems.some(item => item.submissionId === sDoc.id || item.id === sDoc.id)) {
              continue;
            }

            if (!userCache[sUserId]) {
              try {
                const uSnap = await getDoc(doc(db, 'users', sUserId));
                userCache[sUserId] = uSnap.exists() ? uSnap.data() : {};
              } catch {
                userCache[sUserId] = {};
              }
            }

            const uInfo = userCache[sUserId] || {};
            const isHw = (sData.assignmentId && String(sData.assignmentId).toLowerCase().includes('homework')) ||
                         (sData.assignmentTitle && String(sData.assignmentTitle).toLowerCase().includes('homework'));

            fallbackItems.push({
              id: `sub_${sDoc.id}`,
              userId: sUserId,
              userName: sData.studentName || uInfo.name || uInfo.nickname || 'Student',
              userNickname: uInfo.nickname || '',
              userPhotoURL: uInfo.photoURL || '',
              course: uInfo.course || 'IELTS',
              folderId: uInfo.folderId || null,
              folderName: uInfo.folderName || null,
              type: isHw ? 'homework' : 'practice_test',
              testType: sData.assignmentType || 'writing',
              title: sData.assignmentTitle || (isHw ? 'Homework Submission' : 'Practice Test'),
              bandScore: sData.bandScore,
              score: sData.score,
              submissionId: sDoc.id,
              createdAt: sData.createdAt
            });
          }

          const combined = [...firestoreItems, ...fallbackItems];
          // sort by createdAt
          combined.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
            return timeB - timeA;
          });

          if (isMounted) {
            setNotifications(combined);
          }
          return;
        } catch (e) {
          console.warn('Error fetching fallback notifications:', e);
        }
      }

      if (isMounted) {
        setNotifications(firestoreItems);
      }
    }, (error) => {
      console.warn('Notifications subscription error:', error);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // RESTRICTED FILTER LOGIC:
  // Admin sees all notifications.
  // Regular users ONLY see notifications for users who share the SAME CLASS FOLDER.
  const filteredNotifications = notifications.filter((item) => {
    // 1. Role-based folder restriction
    if (!isAdmin) {
      if (!userFolder) return false;

      const userCourseNorm = (userFolder.course || '').trim().toLowerCase();
      const itemCourseNorm = (item.course || '').trim().toLowerCase();

      // Must be same course
      if (userCourseNorm && itemCourseNorm && userCourseNorm !== itemCourseNorm) {
        return false;
      }

      // Check folder matching
      if (userFolder.id) {
        // User is inside a specific folder (e.g. "IELTS 1")
        const isSameFolderId = item.folderId && item.folderId === userFolder.id;
        const isSameFolderName = item.folderName && userFolder.name && 
          item.folderName.trim().toLowerCase() === userFolder.name.trim().toLowerCase();
        
        if (!isSameFolderId && !isSameFolderName) {
          return false;
        }
      } else {
        // User is in Main Folder / Root (no subfolder assigned)
        const itemHasNoFolder = !item.folderId || !item.folderName || item.folderName === 'Main Folder';
        if (!itemHasNoFolder) {
          return false;
        }
      }
    }

    // 2. Activity Type Filter (All, Homework, Practice Tests)
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }

    return true;
  });

  const unreadCount = filteredNotifications.filter(n => n.id && !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = filteredNotifications.map(n => n.id).filter(Boolean) as string[];
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    if (user) {
      localStorage.setItem(`era_read_notifications_${user.uid}`, JSON.stringify(updated));
    }
  };

  const markOneAsRead = (id?: string) => {
    if (!id || readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    if (user) {
      localStorage.setItem(`era_read_notifications_${user.uid}`, JSON.stringify(updated));
    }
  };

  const getTestIcon = (testType?: string, type?: string) => {
    if (type === 'homework') return <FileText className="w-4 h-4 text-amber-500" />;
    switch (testType) {
      case 'writing': return <PenTool className="w-4 h-4 text-orange-500" />;
      case 'speaking': return <Mic className="w-4 h-4 text-purple-500" />;
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'listening': return <Headphones className="w-4 h-4 text-teal-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatTimestamp = (createdAt: any) => {
    try {
      if (!createdAt) return 'Just now';
      const date = createdAt?.toDate ? createdAt.toDate() : (typeof createdAt === 'number' ? new Date(createdAt) : new Date());
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isOpen 
            ? 'bg-blue-100 text-[#1E4DB7]' 
            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
        }`}
        title="Activity Notifications"
        aria-label="Activity Notifications"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 md:w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                {isAdmin ? (
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Admin View: All Courses & Folders
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-blue-500" />
                    Restricted to: <strong className="text-slate-800">{userFolder?.name || userFolder?.course || 'Your Class'}</strong>
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 px-2.5 py-1 rounded-lg transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType('practice_test')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filterType === 'practice_test' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Practice Tests
            </button>
            <button
              type="button"
              onClick={() => setFilterType('homework')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filterType === 'homework' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Homework
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">No notifications yet</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  {isAdmin 
                    ? "Submissions from practice tests and homework will show up here."
                    : `When classmates in ${userFolder?.name || 'your class folder'} submit tests or homework, you'll be notified here.`
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isRead = item.id ? readIds.includes(item.id) : false;
                const firstName = item.userName?.split(' ')[0] || 'Student';
                const initial = firstName.charAt(0).toUpperCase();

                return (
                  <div
                    key={item.id}
                    onClick={() => markOneAsRead(item.id)}
                    className={`px-4 py-3.5 transition-colors flex items-start gap-3 relative hover:bg-slate-50/80 cursor-pointer ${
                      !isRead ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {!isRead && (
                      <div className="absolute left-1.5 top-4 bottom-4 w-1 bg-blue-600 rounded-full"></div>
                    )}

                    {/* Student Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      {item.userPhotoURL ? (
                        <img 
                          src={item.userPhotoURL} 
                          alt={item.userName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {initial}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm border border-slate-100">
                        {getTestIcon(item.testType, item.type)}
                      </div>
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-800 leading-snug">
                        <span className="font-bold text-slate-900">{item.userName}</span>
                        {item.userNickname && (
                          <span className="text-blue-600 font-semibold italic ml-1">
                            &quot;{item.userNickname}&quot;
                          </span>
                        )}
                        <span className="text-slate-600 ml-1">
                          {item.type === 'homework' 
                            ? 'submitted homework for' 
                            : 'completed practice test'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {item.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {/* Class Folder Tag */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Folder className="w-2.5 h-2.5 text-blue-500" />
                          {item.folderName || item.course || 'Main'}
                        </span>

                        {/* Test Type Pill */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                          {item.type === 'homework' ? 'Homework' : (item.testType || 'Test')}
                        </span>

                        {/* Score Tag if available */}
                        {item.bandScore !== undefined && item.bandScore !== null && item.bandScore !== 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Band {item.bandScore}
                          </span>
                        )}
                        {item.score !== undefined && item.score !== null && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.score}/40
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 ml-auto">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {isAdmin ? "Admin view shows all student submissions" : "Group notifications are live in real-time"}
            </span>
            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              My Dashboard <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
