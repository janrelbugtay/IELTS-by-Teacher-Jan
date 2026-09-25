import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, User, Folder, ChevronRight } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface StudentUser {
  id: string;
  name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  email?: string;
  authEmail?: string;
  username?: string;
  studentId?: string;
  course?: string;
  folderId?: string | null;
  folderName?: string | null;
  photoURL?: string;
  isDeleted?: boolean;
}

export function AdminStudentSearch({ isMobile = false }: { isMobile?: boolean }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If not admin, do not render anything
  if (!isAdmin) {
    return null;
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch users when admin is active
  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    const usersQ = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQ, (snapshot) => {
      const fetched: StudentUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.isDeleted) {
          fetched.push({ id: docSnap.id, ...data } as StudentUser);
        }
      });
      // Sort alphabetically by primary name
      fetched.sort((a, b) => {
        const nameA = (a.firstName || a.name || a.displayName || a.nickname || '').toLowerCase();
        const nameB = (b.firstName || b.name || b.displayName || b.nickname || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setUsers(fetched);
      setLoading(false);
    }, (err) => {
      console.warn('Error fetching users for admin search:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter students
  const cleanTerm = searchTerm.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (!cleanTerm) return true;

    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.name || ''} ${u.displayName || ''}`.toLowerCase();
    const nickname = (u.nickname || '').toLowerCase();
    const email = (u.email || u.authEmail || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const course = (u.course || '').toLowerCase();
    const folder = (u.folderName || '').toLowerCase();

    return (
      fullName.includes(cleanTerm) ||
      nickname.includes(cleanTerm) ||
      email.includes(cleanTerm) ||
      username.includes(cleanTerm) ||
      course.includes(cleanTerm) ||
      folder.includes(cleanTerm)
    );
  });

  const displayUsers = filteredUsers.slice(0, 20);

  const handleSelectStudent = (student: StudentUser) => {
    setIsOpen(false);
    setSearchTerm('');

    const course = (student.course || 'IELTS').toLowerCase();
    let path = `/ielts/dashboard?userId=${student.id}`;
    if (course === 'pet') {
      path = `/pet/dashboard?userId=${student.id}`;
    } else if (course === 'ket') {
      path = `/ket/dashboard?userId=${student.id}`;
    }

    navigate(path);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Simple Search Icon Button - No words, no keys */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-blue-100 text-[#1E4DB7]'
            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
        }`}
        title="Search students"
        aria-label="Search students"
      >
        <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
      </button>

      {/* Clean Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 md:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Simple blank input area without words or keys */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Student Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2">
                  <User className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400">No students found</p>
              </div>
            ) : (
              displayUsers.map((student) => {
                const primaryName = student.firstName || student.name || student.displayName || 'Student';
                const initial = primaryName.charAt(0).toUpperCase();
                const course = student.course || 'IELTS';
                const folder = student.folderName || 'Main';

                return (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {student.photoURL ? (
                          <img
                            src={student.photoURL}
                            alt={primaryName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                            {initial}
                          </div>
                        )}
                      </div>

                      {/* Name & Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {student.name || primaryName}
                          </span>
                          {student.nickname && (
                            <span className="text-[11px] font-semibold text-blue-600 italic">
                              &quot;{student.nickname}&quot;
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                            <Folder className="w-3 h-3 text-blue-500" />
                            <span className="truncate max-w-[120px]">{folder}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Pill & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {course}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}
