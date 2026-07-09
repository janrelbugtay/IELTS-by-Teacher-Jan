import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Headphones, Mic, BookOpen, PenTool, Activity, Trophy, Medal, Star, Flame, Search, ChevronDown, Award } from 'lucide-react';
import { HomeLeaderboardDashboard } from '../components/HomeLeaderboardDashboard';
import { PETCalculator } from '../components/PETCalculator';

// Removed duplicate mock data

export function CourseDetails() {
  const { id } = useParams();
  const { userCourse, isAdmin } = useAuth();
  
  let normalizedUserCourse = userCourse ? userCourse.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;
  if (normalizedUserCourse === 'starter') normalizedUserCourse = 'starters';
  const isRestricted = !isAdmin && normalizedUserCourse && id && normalizedUserCourse !== id.toLowerCase();

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'overview';
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [location.search]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`?tab=${tabId}`, { replace: true });
  };

  const courseData: Record<string, { name: string, image: string, color: string }> = {
    'pre-starter': { name: 'Pre-Starter', image: 'https://drive.google.com/thumbnail?id=1h_In0NTl7lPBaZwLl1vKFz-O4dAs8m0E&sz=w1000', color: 'from-blue-400 to-blue-500' },
    'starters': { name: 'Starters', image: 'https://drive.google.com/thumbnail?id=1PZEu_s4S_5KwHtnHeY4RRwuw4BKqIYY2&sz=w1000', color: 'from-orange-400 to-orange-500' },
    'movers': { name: 'Movers', image: 'https://drive.google.com/thumbnail?id=1CG1M0-jE1Nv49K01RGYYMpB16q6eUAHw&sz=w1000', color: 'from-green-400 to-green-500' },
    'flyers': { name: 'Flyers', image: 'https://drive.google.com/thumbnail?id=1J6PPGe9OnH3ABpzIDfOn3OsLG1dpWpJh&sz=w1000', color: 'from-purple-400 to-purple-500' },
    'ket': { name: 'KET', image: 'https://drive.google.com/thumbnail?id=1pgTKRKvYvOuG6vTT4P36e6VUX1smqndL&sz=w1000', color: 'from-rose-400 to-rose-500' },
    'pet': { name: 'PET', image: 'https://drive.google.com/thumbnail?id=1ExrKOMdB7SSDtPmIUfMK9_yCbx2_Us4z&sz=w1000', color: 'from-teal-400 to-teal-500' },
    'ielts': { name: 'IELTS', image: 'https://drive.google.com/thumbnail?id=1YjzWqy769jNBA46EBgyf-dWGdykjV7Yk&sz=w1000', color: 'from-indigo-400 to-indigo-500' }
  };

  const course = courseData[id || ''] || { name: 'Course', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80', color: 'from-blue-400 to-blue-500' };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'assignments', label: 'Homework' },
    { id: 'practice', label: 'Practice Tests' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'announcements', label: 'Announcements' },
  ];

  if (id === 'pet') {
    tabs.push({ id: 'calculator', label: 'Calculator' });
  }

  const folders = [
    {
      title: 'Practice Test',
      icon: <BookOpen className="w-8 h-8 text-[#2563EB]" />,
      desc: 'Take mock tests and evaluations.',
      color: 'bg-blue-50 border-[#2563EB]/20 hover:border-[#2563EB]',
      link: `/practice-tests?course=${id || 'ielts'}`
    },
    {
      title: 'Homework',
      icon: <PenTool className="w-8 h-8 text-[#F59E0B]" />,
      desc: 'Complete assignments and exercises.',
      color: 'bg-orange-50 border-[#F59E0B]/20 hover:border-[#F59E0B]',
      action: () => handleTabChange('assignments')
    },
    {
      title: 'Activities',
      icon: <Activity className="w-8 h-8 text-[#22C55E]" />,
      desc: 'Interactive learning activities and games.',
      color: 'bg-green-50 border-[#22C55E]/20 hover:border-[#22C55E]',
      link: '#'
    },
    {
      title: 'Class Leaderboard',
      icon: <Trophy className="w-8 h-8 text-rose-500" />,
      desc: 'See top students for this class.',
      color: 'bg-rose-50 border-rose-500/20 hover:border-rose-500',
      action: () => handleTabChange('leaderboard')
    }
  ];

  if (id === 'pet') {
    folders.push({
      title: 'PET Calculator',
      icon: <Activity className="w-8 h-8 text-[#0EA5E9]" />,
      desc: 'Calculate your Cambridge English B1 Preliminary exam scores.',
      color: 'bg-sky-50 border-sky-500/20 hover:border-sky-500',
      action: () => handleTabChange('calculator')
    });
  }

  
  const renderHomework = () => {
    const homeworkFolders: any[] = [
      {
        title: 'Reading Homework',
        icon: <BookOpen className="w-8 h-8 text-[#1E4DB7]" />,
        desc: 'Complete reading homework.',
        color: 'bg-blue-50 border-[#1E4DB7]/20 hover:border-[#1E4DB7]',
      },
      {
        title: 'Listening Homework',
        icon: <Headphones className="w-8 h-8 text-teal-600" />,
        desc: 'Listen to audio and answer questions.',
        color: 'bg-teal-50 border-teal-600/20 hover:border-teal-600',
      },
      {
        title: 'Writing Homework',
        icon: <PenTool className="w-8 h-8 text-[#F4A340]" />,
        desc: 'Submit your writing homework.',
        color: 'bg-orange-50 border-[#F4A340]/20 hover:border-[#F4A340]',
      },
      {
        title: 'Speaking Homework',
        icon: <Mic className="w-8 h-8 text-purple-600" />,
        desc: 'Submit your speaking homework.',
        color: 'bg-purple-50 border-purple-600/20 hover:border-purple-600',
      }
    ];

    if (id === 'ielts') {
      homeworkFolders.push({
        title: 'April Listening Practice',
        icon: <Headphones className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the April CD-IELTS listening test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600'
      });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {homeworkFolders.map((folder, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {folder.externalLink ? (
              <a 
                href={folder.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </a>
            ) : (
              <div 
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {folders.map((folder, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {folder.link ? (
              <Link 
                to={folder.link}
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </Link>
            ) : (
              <button 
                onClick={folder.action}
                className={`block w-full text-left h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </button>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  if (isRestricted) {
    return (
      <div className="bg-[#F8FAFC] min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[32px] text-center max-w-lg shadow-xl border border-red-100">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Access Restricted</h2>
          <p className="text-slate-600 mb-8 text-lg leading-relaxed">You do not have permission to view this course. You are currently enrolled in a different course.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E4DB7] text-white rounded-2xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/30">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] font-medium transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] flex-1">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
                <img src={course.image || undefined} alt={course.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A] leading-tight tracking-tight">{course.name}</h1>
                <p className="text-[#64748B] mt-1">Select a tab to view your course content.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1E4DB7] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'assignments' && renderHomework()}
          {activeTab === 'leaderboard' && (
            <HomeLeaderboardDashboard 
              defaultCourse={course.name}
              hideCourseTabs={true}
            />
          )}
          {activeTab === 'calculator' && (
            <PETCalculator />
          )}
          {activeTab !== 'overview' && activeTab !== 'assignments' && activeTab !== 'leaderboard' && activeTab !== 'calculator' && (
            <div className="bg-white rounded-[24px] p-12 text-center border border-slate-200">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Content coming soon</h3>
              <p className="text-slate-500">The {tabs.find(t => t.id === activeTab)?.label} section is currently under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
