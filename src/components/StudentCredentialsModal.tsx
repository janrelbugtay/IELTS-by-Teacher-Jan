import React, { useState, useEffect } from 'react';
import { X, Key, Copy, CheckCircle2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StudentCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userProfile: any;
  course?: string;
  canRegenerate?: boolean;
}

export function StudentCredentialsModal({
  isOpen,
  onClose,
  userId,
  userProfile,
  course = 'IELTS'
}: StudentCredentialsModalProps) {
  const [profile, setProfile] = useState<any>(userProfile);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync prop changes to state
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  // Real-time listener for the user document to reflect instant username/password changes
  useEffect(() => {
    if (!isOpen || !userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });
    return () => unsub();
  }, [isOpen, userId]);

  // Compute or fallback credentials
  const displayName = profile?.nickname || profile?.firstName || profile?.name || profile?.displayName || 'Student';
  const firstName = (profile?.firstName || displayName.split(' ')[0] || 'student').toLowerCase().replace(/[^a-z0-9]/g, '') || 'student';
  const lastName = (profile?.lastName || displayName.split(' ').slice(1).join('') || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const studentCourse = profile?.course || course || 'IELTS';
  const prefix = studentCourse.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();

  // If student document already has credentials, use them; otherwise prepare defaults
  const studentId = profile?.studentId || `${prefix}-${year}-${Math.abs(userId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 1000)) % 9000 + 1000}`;
  const username = profile?.username || `${firstName}${lastName || '123'}`;
  const password = profile?.tempPassword || profile?.password || `${firstName}1234`;

  // Auto-login link
  const loginUrl = `${window.location.origin}/login?autoLoginId=${encodeURIComponent(studentId)}&autoLoginPass=${encodeURIComponent(password)}`;

  // Automatically ensure credentials exist in Firestore if missing
  useEffect(() => {
    if (isOpen && userId && (!profile?.studentId || !profile?.username || (!profile?.tempPassword && !profile?.password))) {
      const userRef = doc(db, 'users', userId);
      setDoc(userRef, {
        studentId,
        username,
        tempPassword: password,
        password: password,
        authEmail: profile?.authEmail || profile?.email || `${username}@student.era.edu`
      }, { merge: true }).catch((err) => {
        console.warn('Could not auto-sync missing credentials in modal:', err);
      });
    }
  }, [isOpen, userId, profile?.studentId, profile?.username, profile?.tempPassword, profile?.password]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    const text = `
Era AI Language Center - Student Credentials
---------------------------------------------
Student: ${displayName}
Course: ${studentCourse}
Student ID: ${studentId}
Username: ${username}
Password: ${password}

Login Link: ${loginUrl}
---------------------------------------------
Please keep your credentials secure.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 relative text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-amber-200">
            <Key className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Credentials</h3>
          <p className="text-xs text-slate-500 mt-1">
            Account access & credentials for <strong className="text-slate-800">{displayName}</strong>
          </p>
        </div>

        {/* Credentials Box */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 mb-5 space-y-3.5">
          
          {/* Student ID */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Student ID</span>
              <button
                onClick={() => copyToClipboard(studentId, 'studentId')}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'studentId' ? (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Copied</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                )}
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>{studentId}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                {studentCourse}
              </span>
            </div>
          </div>

          {/* Username */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Username</span>
              <button
                onClick={() => copyToClipboard(username, 'username')}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'username' ? (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Copied</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                )}
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200">
              {username}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Password</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(password, 'password')}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'password' ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Copied</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                  )}
                </button>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-amber-700 bg-amber-50/70 px-3 py-2 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>{showPassword ? password : '••••••••••••'}</span>
            </div>
          </div>

          {/* One-Click Direct Login Link */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Quick Login Link</span>
              <button
                onClick={() => copyToClipboard(loginUrl, 'loginUrl')}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'loginUrl' ? (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Copied</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Link</span>
                )}
              </button>
            </div>
            <div className="text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 truncate flex items-center justify-between gap-2">
              <span className="truncate font-mono">{loginUrl}</span>
              <a
                href={loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 shrink-0"
                title="Test Login Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors border border-slate-200/80 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedAll ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>All Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copy Credentials</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
