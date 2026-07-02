import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, PenTool, Activity, Trophy, Medal, Star, Flame, Search, ChevronDown, Award } from 'lucide-react';
import { HomeLeaderboardDashboard } from '../components/HomeLeaderboardDashboard';
import { PETCalculator } from '../components/PETCalculator';

// Removed duplicate mock data

export function CourseDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

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
    { id: 'assignments', label: 'Assignments' },
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
      link: `/ielts/dashboard?course=${id || 'ielts'}`
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
      action: () => setActiveTab('leaderboard')
    }
  ];

  if (id === 'pet') {
    folders.push({
      title: 'PET Calculator',
      icon: <Activity className="w-8 h-8 text-[#0EA5E9]" />,
      desc: 'Calculate your Cambridge English B1 Preliminary exam scores.',
      color: 'bg-sky-50 border-sky-500/20 hover:border-sky-500',
      action: () => setActiveTab('calculator')
    });
  }

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
                <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
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
              onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'leaderboard' && (
            <HomeLeaderboardDashboard 
              defaultCourse={course.name}
              hideCourseTabs={true}
            />
          )}
          {activeTab === 'calculator' && (
            <PETCalculator />
          )}
          {activeTab !== 'overview' && activeTab !== 'leaderboard' && activeTab !== 'calculator' && (
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
