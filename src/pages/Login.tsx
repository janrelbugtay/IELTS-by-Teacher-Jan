import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Login() {
  const { user, userCourse, loading, signInWithEmail } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoLoginId = searchParams.get('autoLoginId');
    const autoLoginPass = searchParams.get('autoLoginPass');
    
    if (autoLoginId && autoLoginPass && !user && !loading && !authLoading) {
      setLoginId(autoLoginId);
      setPassword(autoLoginPass);
      // Clean up URL right away so we don't end up in an infinite loop if something fails
      window.history.replaceState({}, document.title, window.location.pathname);
      processLogin(autoLoginId, autoLoginPass);
    }
  }, [user, loading]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]">Loading...</div>;
  }

  if (user) {
    if (userCourse?.toLowerCase() === 'pet') {
      return <Navigate to="/pet/dashboard" replace />;
    }
    return <Navigate to="/ielts/dashboard" replace />;
  }
  
  const processLogin = async (idToUse: string, passToUse: string) => {
    setError('');
    setAuthLoading(true);

    if (!idToUse || !passToUse) {
      setError('Please enter your Student ID/Username and password.');
      setAuthLoading(false);
      return;
    }

    try {
      const cleanLoginId = idToUse.trim();
      const lowerLoginId = cleanLoginId.toLowerCase();
      const upperLoginId = cleanLoginId.toUpperCase();
      const cleanPass = passToUse.trim();

      // Look up user by username, studentId, or authEmail
      const usersRef = collection(db, 'users');
      let matchingDocs: any[] = [];
      
      // 1. Try lowercase username
      const qUser = query(usersRef, where('username', '==', lowerLoginId));
      const snapUser = await getDocs(qUser);
      matchingDocs.push(...snapUser.docs);

      // 2. Try exact studentId
      if (matchingDocs.length === 0) {
        const qId = query(usersRef, where('studentId', '==', cleanLoginId));
        const snapId = await getDocs(qId);
        matchingDocs.push(...snapId.docs);
      }
      
      // 3. Try uppercase studentId
      if (matchingDocs.length === 0) {
        const qUpper = query(usersRef, where('studentId', '==', upperLoginId));
        const snapUpper = await getDocs(qUpper);
        matchingDocs.push(...snapUpper.docs);
      }

      // 4. Try altUsernames array
      if (matchingDocs.length === 0) {
        try {
          const qAlt = query(usersRef, where('altUsernames', 'array-contains', lowerLoginId));
          const snapAlt = await getDocs(qAlt);
          matchingDocs.push(...snapAlt.docs);
        } catch {
          // ignore if index not available
        }
      }

      // 5. Try email fields if input contains @
      if (matchingDocs.length === 0 && cleanLoginId.includes('@')) {
        const qEmail = query(usersRef, where('email', '==', lowerLoginId));
        const snapEmail = await getDocs(qEmail);
        matchingDocs.push(...snapEmail.docs);

        if (matchingDocs.length === 0) {
          const qAuthEmail = query(usersRef, where('authEmail', '==', lowerLoginId));
          const snapAuthEmail = await getDocs(qAuthEmail);
          matchingDocs.push(...snapAuthEmail.docs);
        }
      }

      // 6. Broad fallback for inputs like "tracy", "tracy ielts 2", "tracy era"
      if (matchingDocs.length === 0) {
        const allUsersSnap = await getDocs(usersRef);
        const searchTerms = lowerLoginId.split(/\s+/).filter(Boolean);
        
        allUsersSnap.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data.isDeleted) return;
          const uName = (data.username || '').toLowerCase();
          const fName = (data.firstName || '').toLowerCase();
          const fullName = (data.name || '').toLowerCase();
          const sId = (data.studentId || '').toLowerCase();
          const fld = (data.folderName || '').toLowerCase();
          const alts: string[] = (data.altUsernames || []).map((a: string) => a.toLowerCase());

          // Check if every search term matches something in the student's profile
          const allTermsMatch = searchTerms.every(term => 
            uName.includes(term) || 
            fName.includes(term) || 
            fullName.includes(term) || 
            sId.includes(term) ||
            fld.includes(term) ||
            alts.some(a => a.includes(term))
          );

          if (allTermsMatch) {
            matchingDocs.push(docSnap);
          }
        });
      }

      // Filter out deleted accounts and prioritize active ones
      const nonDeleted = matchingDocs.filter(d => !d.data().isDeleted && d.data().status !== 'deleted');
      const activeDoc = nonDeleted.length > 0 ? nonDeleted[0] : matchingDocs[0];

      if (!activeDoc) {
        if (cleanLoginId.includes('@')) {
          await signInWithEmail(cleanLoginId, passToUse);
          return;
        }
        throw new Error('User not found. Please check your Student ID or Username.');
      }

      const userDoc = activeDoc;
      const userData = userDoc.data();
      
      // If this is a Firebase Auth user (no custom password set), fall back to standard email login
      if (!userData.password && !userData.tempPassword && cleanLoginId.includes('@')) {
        await signInWithEmail(cleanLoginId, passToUse);
        return;
      }
      
      // Verify password (supports primary password, tempPassword, altPasswords, trimmed and case-insensitive)
      const allowedPasswords: string[] = [
        userData.password,
        userData.tempPassword,
        ...(Array.isArray(userData.altPasswords) ? userData.altPasswords : [])
      ].filter(Boolean);

      const isPasswordValid = allowedPasswords.some(p => 
        p === passToUse || 
        p === cleanPass || 
        p.toLowerCase() === cleanPass.toLowerCase()
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password. Please check your credentials.');
      }

      // Store student ID in local storage to override Firebase Auth UID
      localStorage.setItem('studentUid', userDoc.id);

      // We bypass Firebase Auth for students since they don't have accounts.
      // Update AuthContext to trigger user state reload
      window.dispatchEvent(new Event('storage'));
      // Just wait a tick for AuthContext to pick up the local storage change
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await processLogin(loginId, password);
  };

  const handleForgotPassword = () => {
    alert("Request Password Reset\n\nA notification has been sent to your teacher or administrator to reset your password.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/50 -z-10"></div>
      
      <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-[#1E4DB7] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <LogIn className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          Student Login
        </h1>
        <p className="text-slate-600 mb-8 text-center text-sm">
          Access your English center dashboard
        </p>

        <div className="w-full space-y-5">

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          {/* School Account Login */}
          <form onSubmit={handleSchoolLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Student ID or Username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] transition-all"
                required
                minLength={6}
              />
            </div>
            
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-[#1E4DB7] focus:ring-[#1E4DB7]" defaultChecked />
                <span>Remember me</span>
              </label>
              <button type="button" onClick={handleForgotPassword} className="text-sm font-bold text-[#1E4DB7] hover:underline">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full py-4 px-4 bg-[#1E4DB7] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              {authLoading ? 'Signing in...' : <><KeyRound className="w-5 h-5" /> Login</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
