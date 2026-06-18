import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BookOpen, Headphones, PenTool, Mic, Home, GraduationCap, LayoutDashboard } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      {!location.pathname.startsWith('/classes') && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-[#1E4DB7] font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-[#1E4DB7] rounded-lg flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              IELTS by Teacher Jan
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link to="/" className={`text-base font-bold flex items-center gap-2.5 transition-colors ${location.pathname === '/' ? 'text-[#1E4DB7]' : 'text-slate-600 hover:text-[#1E4DB7]'}`}>
                <Home className="w-6 h-6" /> Home
              </Link>
              <Link to="/practice-tests" className={`text-base font-bold flex items-center gap-2.5 transition-colors ${location.pathname.includes('/practice-tests') ? 'text-[#1E4DB7]' : 'text-slate-600 hover:text-[#1E4DB7]'}`}>
                <BookOpen className="w-6 h-6" /> Practice Tests
              </Link>
              
              {user && (
                <Link to="/dashboard" className={`text-base font-bold flex items-center gap-2.5 transition-colors ${location.pathname === '/dashboard' ? 'text-[#1E4DB7]' : 'text-slate-600 hover:text-[#1E4DB7]'}`}>
                  <LayoutDashboard className="w-6 h-6" /> Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/classes" className={`text-base font-bold flex items-center gap-2.5 transition-colors ${location.pathname.startsWith('/classes') ? 'text-[#1E4DB7]' : 'text-slate-600 hover:text-[#1E4DB7]'}`}>
                  <GraduationCap className="w-6 h-6" /> Classes
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-[#1E4DB7] transition-colors hidden sm:block">Login</Link>
                  <Link to="/login" className="text-sm font-semibold bg-[#1E4DB7] text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors shadow-sm">Register</Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-slate-700 hidden sm:block">
                    {user?.displayName || user?.email}
                  </div>
                  <button 
                    onClick={signOut}
                    className="text-slate-500 hover:text-red-600 transition-colors bg-slate-100 p-2 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className={`flex-1 w-full mx-auto ${location.pathname.startsWith('/classes') ? '' : 'max-w-7xl p-4 sm:p-6 lg:p-8'}`}>
        {children}
      </main>
    </div>
  );
}
