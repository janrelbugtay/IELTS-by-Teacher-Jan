import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BookOpen, Home, GraduationCap, Menu, X, Bell, User, ChevronDown, Award , Facebook, Instagram, Youtube} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EraLogo } from './EraLogo';


const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    className={className}
    fill="currentColor"
  >
    <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
  </svg>
);

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userCourse, setUserCourse] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().course) {
          setUserCourse(docSnap.data().course);
        }
      }).catch(() => {});
    }
  }, [user]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: any[] = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/ielts/dashboard' },
  ];
  if (user && userCourse) {
    navLinks.push({ name: 'My Class', path: `/courses/${userCourse.toLowerCase().replace(/[^a-z0-9-]/g, '') === 'starter' ? 'starters' : userCourse.toLowerCase().replace(/[^a-z0-9-]/g, '')}` });
  }

  const visibleLinks = navLinks.filter(link => !link.adminOnly || (link.adminOnly && isAdmin));

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] flex flex-col selection:bg-[#3B82F6] selection:text-white">
      {/* Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-[#E2E8F0]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <EraLogo className="w-10 h-10 rounded-[14px] shadow-[0_8px_16px_rgba(37,99,235,0.2)] group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all duration-300" />
                <div className="flex flex-col hidden sm:flex">
                  <span className="font-bold text-[15px] leading-tight text-[#0F172A]">Kỷ Nguyên Era</span>
                  <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Chi nhánh Phú Hoà</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
              {visibleLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-[15px] font-medium transition-colors rounded-full hover:bg-slate-50 group ${
                    location.pathname === link.path ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#2563EB] rounded-full"
                    />
                  )}
                  <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#2563EB] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="hidden xl:flex items-center gap-5">
              {!user ? (
                <>
                  <Link to="/login" className="text-[15px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Login</Link>
                  <Link to="/login" className="text-[15px] font-semibold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-6 py-2.5 rounded-full hover:shadow-[0_8px_16px_rgba(37,99,235,0.2)] hover:-translate-y-0.5 transition-all duration-300">
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button className="relative p-2 text-[#64748B] hover:text-[#0F172A] transition-colors rounded-full hover:bg-slate-100">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full border-2 border-white"></span>
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#E2E8F0] overflow-hidden flex items-center justify-center text-[#64748B]">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-[14px] font-semibold text-[#0F172A]">
                        {user?.displayName || user?.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#64748B]" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-[#E2E8F0] py-2 overflow-hidden"
                        >
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-slate-50 transition-colors">
                              <GraduationCap className="w-4 h-4 text-[#64748B]" /> Admin Dashboard
                            </Link>
                          )}
                          {!isAdmin ? (
                            <Link to="/ielts/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-slate-50 transition-colors">
                              <Home className="w-4 h-4 text-[#64748B]" /> My Dashboard
                            </Link>
                          ) : (
                            <>
                              <div className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-y border-slate-100 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Courses Dashboard
                              </div>
                              <div className="max-h-[250px] overflow-y-auto py-1">
                                <Link to="/pre-starter/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">Pre-starter</Link>
                                <Link to="/starters/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">Starters</Link>
                                <Link to="/movers/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">Movers</Link>
                                <Link to="/flyers/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">Flyers</Link>
                                <Link to="/ket/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">KET</Link>
                                <Link to="/pet/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">PET</Link>
                                <Link to="/ielts/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors pl-9">IELTS</Link>
                              </div>
                            </>
                          )}
                          <div className="h-px bg-[#E2E8F0] my-1"></div>
                          <button 
                            onClick={() => { signOut(); setUserMenuOpen(false); }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#64748B] hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="xl:hidden bg-white border-b border-[#E2E8F0] overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 flex flex-col gap-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      location.pathname === link.path ? 'bg-blue-50 text-[#2563EB]' : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {!user ? (
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-3">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl text-[15px] font-medium text-[#64748B] bg-slate-50 hover:bg-slate-100">Login</Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl text-[15px] font-medium text-white bg-[#2563EB] hover:bg-blue-700">Get Started</Link>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#64748B] overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL || undefined} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=e2e8f0&color=64748b`; }} /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-[#0F172A]">{user.displayName || 'Student'}</div>
                        <div className="text-xs text-[#64748B]">{user.email}</div>
                      </div>
                    </div>
                    {!isAdmin ? (
                      <Link to="/ielts/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-slate-50 flex items-center gap-3">
                        <Home className="w-5 h-5" /> Dashboard
                      </Link>
                    ) : (
                      <div className="flex flex-col">
                        <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 flex items-center gap-2 rounded-lg mb-1">
                          <BookOpen className="w-4 h-4" /> Courses Dashboard
                        </div>
                        <Link to="/pre-starter/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">Pre-starter</Link>
                        <Link to="/starters/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">Starters</Link>
                        <Link to="/movers/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">Movers</Link>
                        <Link to="/flyers/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">Flyers</Link>
                        <Link to="/ket/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">KET</Link>
                        <Link to="/pet/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">PET</Link>
                        <Link to="/ielts/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-[15px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 pl-11 rounded-lg">IELTS</Link>
                      </div>
                    )}
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="px-4 py-3 rounded-xl text-[15px] font-medium text-red-600 hover:bg-red-50 text-left flex items-center gap-3">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto mt-20 ${location.pathname === '/' ? '' : 'max-w-[1400px] p-4 sm:p-6 lg:p-8'}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] pt-16 pb-8 mt-auto relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div className="col-span-1 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <EraLogo className="w-10 h-10 rounded-[14px]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] leading-tight text-[#0F172A]">Kỷ Nguyên Era</span>
                  <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Chi nhánh Phú Hoà</span>
                </div>
              </Link>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                A premium international English academy dedicated to excellence in Cambridge qualifications from young learners to advanced speakers.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <a href="https://www.facebook.com/eraenglishphuhoa" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:scale-110 shadow-sm hover:shadow-md hover:shadow-[#1877F2]/20 transition-all duration-300">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@eraenglishtdm" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-black hover:border-black hover:scale-110 shadow-sm hover:shadow-md hover:shadow-black/20 transition-all duration-300">
                  <span className="sr-only">TikTok</span>
                  <TiktokIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:scale-110 shadow-sm hover:shadow-md hover:shadow-[#dc2743]/20 transition-all duration-300">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] hover:scale-110 shadow-sm hover:shadow-md hover:shadow-[#FF0000]/20 transition-all duration-300">
                  <span className="sr-only">YouTube</span>
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-[#0F172A] mb-6">Courses</h3>
              <ul className="space-y-4">
                {['Pre-Starter', 'Starters', 'Movers', 'Flyers', 'KET (A2 Key)', 'PET (B1 Preliminary)', 'IELTS'].map((course) => (
                  <li key={course}>
                    <Link to="#" className="text-[#64748B] hover:text-[#2563EB] text-sm transition-colors">{course}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-[#0F172A] mb-6">Resources</h3>
              <ul className="space-y-4">
                {['Practice Tests', 'Study Materials', 'Blog & News', 'Student Success', 'FAQ', 'Support'].map((item) => (
                  <li key={item}>
                    <Link to="#" className="text-[#64748B] hover:text-[#2563EB] text-sm transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-[#0F172A] mb-6">Newsletter</h3>
              <p className="text-[#64748B] text-sm mb-4">Subscribe to our newsletter for the latest updates and English learning tips.</p>
              <form className="flex flex-col gap-3">
                <input type="email" placeholder="Enter your email" className="px-4 py-3 rounded-xl bg-slate-50 border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all text-sm" />
                <button type="submit" className="px-4 py-3 bg-[#0F172A] text-white rounded-xl text-sm font-semibold hover:bg-[#1E293B] transition-colors">Subscribe</button>
              </form>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#E2E8F0] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#64748B] text-sm">© {new Date().getFullYear()} Kỷ Nguyên Era. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="text-[#64748B] hover:text-[#0F172A] text-sm transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-[#64748B] hover:text-[#0F172A] text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
