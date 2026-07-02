import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Login() {
  const { user, loading, signIn, signInWithEmail } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/ielts/dashboard" replace />;
  }

  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    if (!loginId || !password) {
      setError('Please enter your Student ID/Username and password.');
      setAuthLoading(false);
      return;
    }

    try {
      // Look up user by username, studentId, or authEmail
      const usersRef = collection(db, 'users');
      let q = query(usersRef, where('username', '==', loginId), limit(1));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try studentId
        q = query(usersRef, where('studentId', '==', loginId), limit(1));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty && loginId.includes('@')) {
         // Try email
         q = query(usersRef, where('email', '==', loginId), limit(1));
         querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty && loginId.includes('@')) {
         q = query(usersRef, where('authEmail', '==', loginId), limit(1));
         querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        if (loginId.includes('@')) {
          await signInWithEmail(loginId, password);
          return;
        }
        throw new Error('User not found. Please check your Student ID or Username.');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Verify password
      if (userData.password !== password && userData.tempPassword !== password) {
        throw new Error('Invalid password. Please check your credentials.');
      }

      if (!userData.authEmail) {
        throw new Error('This account is not configured correctly. Please contact your teacher.');
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
          {/* Option 1: Google */}
          <button 
            type="button"
            onClick={signIn}
            className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w0.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500 font-medium">or School Account Login</span>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Option 2: School Account */}
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
