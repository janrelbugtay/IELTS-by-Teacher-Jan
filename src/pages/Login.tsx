import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export function Login() {
  const { user, loading, signIn } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-orange-50/50 -z-10"></div>
      
      <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-[#1E4DB7] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          {isRegistering ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          {isRegistering ? 'Create your account' : 'Welcome Back'}
        </h1>
        <p className="text-slate-600 mb-8 text-center">
          {isRegistering ? 'Sign up to start practicing' : 'Sign in to continue your IELTS practice'}
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={signIn}
            className="w-full py-4 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w0.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button 
            className="w-full py-4 px-4 bg-[#1E4DB7] text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            Continue with Email
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
          <p className="text-slate-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[#1E4DB7] font-bold hover:underline"
            >
              {isRegistering ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
