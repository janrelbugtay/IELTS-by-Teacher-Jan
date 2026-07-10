import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, KeyRound } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Login() {
  const { user, userCourse, loading, signIn, signInWithEmail } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]">Loading...</div>;
  }

  if (user) {
    if (userCourse?.toLowerCase() === 'pet') {
      return <Navigate to="/pet/dashboard" replace />;
    }
    return <Navigate to="/ielts/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signIn();
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to sign in with Google. If popups are blocked, please open the app in a new tab.");
      }
    }
  };

  
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
      const cleanLoginId = loginId.trim();
      const lowerLoginId = cleanLoginId.toLowerCase();
      const upperLoginId = cleanLoginId.toUpperCase();

      // Look up user by username, studentId, or authEmail
      const usersRef = collection(db, 'users');
      
      // Try lowercase username
      let q = query(usersRef, where('username', '==', lowerLoginId), limit(1));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try exact studentId
        q = query(usersRef, where('studentId', '==', cleanLoginId), limit(1));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        // Try uppercase studentId
        q = query(usersRef, where('studentId', '==', upperLoginId), limit(1));
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty && cleanLoginId.includes('@')) {
         // Try lowercase email
         q = query(usersRef, where('email', '==', lowerLoginId), limit(1));
         querySnapshot = await getDocs(q);
      }
      if (querySnapshot.empty && cleanLoginId.includes('@')) {
         // Try exact email just in case
         q = query(usersRef, where('email', '==', cleanLoginId), limit(1));
         querySnapshot = await getDocs(q);
      }
      if (querySnapshot.empty && cleanLoginId.includes('@')) {
         q = query(usersRef, where('authEmail', '==', lowerLoginId), limit(1));
         querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        if (cleanLoginId.includes('@')) {
          await signInWithEmail(cleanLoginId, password);
          return;
        }
        throw new Error('User not found. Please check your Student ID or Username.');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // If this is a Firebase Auth user (no custom password set), fall back to standard email login
      if (!userData.password && !userData.tempPassword && cleanLoginId.includes('@')) {
        await signInWithEmail(cleanLoginId, password);
        return;
      }
      
      // Verify password
      if (userData.password !== password && userData.tempPassword !== password) {
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

                    <button 
            onClick={handleGoogleLogin} 
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or login with student ID</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
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
