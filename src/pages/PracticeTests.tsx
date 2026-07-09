import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Search, Headphones, Book, Pen, Mic, Clock, BarChart, Users, Star, ArrowRight, LayoutDashboard } from 'lucide-react';

const generateMockTests = (courseName: string) => {
  if (courseName === 'PET') {
    return [
      {
        id: 'PET-READING-001',
        title: 'B1 Preliminary Reading - Test 1',
        skill: 'Reading',
        month: 'January',
        attempts: 2450,
        difficulty: 'Medium',
        duration: '45 mins',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(2026, 0, 1).getTime(),
        externalLink: '/PET_Reading/test_1/index.html'
      },
      {
        id: 'PET-LISTENING-001',
        title: 'B1 Preliminary Listening - Test 1',
        skill: 'Listening',
        month: 'January',
        attempts: 1820,
        difficulty: 'Medium',
        duration: '30 mins',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(2026, 0, 1).getTime(),
        externalLink: '#'
      },
      {
        id: 'PET-WRITING-001',
        title: 'B1 Preliminary Writing - Test 1',
        skill: 'Writing',
        month: 'January',
        attempts: 1200,
        difficulty: 'Medium',
        duration: '45 mins',
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(2026, 0, 1).getTime(),
        externalLink: '#'
      },
      {
        id: 'PET-SPEAKING-001',
        title: 'B1 Preliminary Speaking - Test 1',
        skill: 'Speaking',
        month: 'January',
        attempts: 950,
        difficulty: 'Medium',
        duration: '15 mins',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(2026, 0, 1).getTime(),
        externalLink: '#'
      }
    ];
  }

  if (courseName !== 'IELTS') {
    return [];
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const skills = [
    { name: 'Reading', duration: '60 mins', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Listening', duration: '60 mins', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
    { name: 'Writing', duration: '60 mins', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Speaking', duration: '15 mins', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80' },
  ];

  let idCounter = 1;
  const tests: any[] = [];
  
  // Seed random predictably for attempts so they don't jump around
  const randomAttempts = (id: number) => {
    const min = 1000;
    const max = 50000;
    // Pseudo-random based on id
    const rand = Math.abs(Math.sin(id * 100)) * (max - min) + min;
    return Math.floor(rand);
  };

  const getDifficulty = (id: number) => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    return difficulties[id % 3];
  };

  // Generate ordered lists for skills so when we filter by all we see a mix, but when filtered by skill they're chronological
  months.forEach((month, mIndex) => {
    skills.forEach(skill => {
      
      let testId: any = idCounter;
      let externalLink = undefined;

      
      tests.push({
        id: testId as any,
        title: `${month} ${skill.name} Practice (${courseName})`,
        skill: skill.name,
        month: month,
        attempts: randomAttempts(idCounter),
        difficulty: getDifficulty(idCounter),
        duration: skill.duration,
        image: skill.image,
        externalLink: externalLink,
        createdAt: new Date(2026, mIndex, 1).getTime(), // For sorting by newest
      });
      idCounter++;
    });
  });

  return tests;
};

export function PracticeTests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userCourse, isAdmin } = useAuth();
  const courseId = searchParams.get('course') || 'ielts';
  
  let normalizedUserCourse = userCourse ? userCourse.toLowerCase().replace(/[^a-z0-9-]/g, '') : null;
  if (normalizedUserCourse === 'starter') normalizedUserCourse = 'starters';
  
  const isRestricted = !isAdmin && normalizedUserCourse && courseId && normalizedUserCourse !== courseId.toLowerCase();

  const activeSkill = searchParams.get('skill') || 'Listening';


  const courseData: Record<string, { name: string, title: string, desc: string }> = {
    'pre-starter': { name: 'Pre-Starter', title: 'Pre-Starter Practice Tests', desc: 'Fun interactive games and tests for early learners.' },
    'starters': { name: 'Starters', title: 'Starters Practice Tests', desc: 'Basic vocabulary and simple sentence tests.' },
    'movers': { name: 'Movers', title: 'Movers Practice Tests', desc: 'Speaking and writing tests for young learners.' },
    'flyers': { name: 'Flyers', title: 'Flyers Practice Tests', desc: 'Advanced everyday communication practice tests.' },
    'ket': { name: 'KET', title: 'KET Practice Tests', desc: 'Essential English real-life situations practice.' },
    'pet': { name: 'PET', title: 'PET Practice Tests', desc: 'Practical English for work, study and travel practice.' },
    'ielts': { name: 'IELTS', title: '2026 Practice Test Collection', desc: 'Choose from over 100 official-style IELTS tests updated for 2026.' }
  };

  const courseInfo = courseData[courseId] || courseData['ielts'];

  const allMockTests = useMemo(() => generateMockTests(courseInfo.name), [courseInfo.name]);

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ielts_writing_progress_3');
    }
  }, []);

  const filteredTests = useMemo(() => {
    let result = allMockTests;

    // Filter by Tab (Academic vs General is mocked here since we don't have distinct tags on the generated dataset, let's keep it simple)
    // If you need Academic/General distinct, you'd add tracking to the generator, but standard prompt means just filter by what's possible
    
    // Filter by skill
    result = result.filter(t => t.skill === activeSkill);

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.month.toLowerCase().includes(q) ||
        t.skill.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'Newest') {
        return a.createdAt - b.createdAt; // Chronological (January to December)
      }
      if (sortBy === 'Most Popular' || sortBy === 'Most Attempted') {
        return b.attempts - a.attempts;
      }
      if (sortBy === 'Difficulty') {
        const rank: any = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
        return rank[b.difficulty] - rank[a.difficulty];
      }
      return 0;
    });

    return result;
  }, [activeSkill, activeTab, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{courseInfo.title}</h1>
        <p className="text-slate-600 text-lg">{courseInfo.desc}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-full lg:w-[300px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {['Listening', 'Reading', 'Writing', 'Speaking'].map(skill => (
          <button 
            key={skill}
            onClick={() => {
              setSearchParams(prev => {
                prev.set('skill', skill);
                return prev;
              });
            }}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all border ${
              activeSkill === skill 
                ? 'bg-[#1E4DB7] border-[#1E4DB7] text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#1E4DB7] hover:text-[#1E4DB7]'
            }`}
          >
            {skill}
          </button>
        ))}
        
        <div className="ml-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]"
          >
            <option>Newest</option>
            <option>Most Popular</option>
            <option>Most Attempted</option>
            <option>Difficulty</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src={test.image || undefined} 
                alt={test.title} 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x400/1E4DB7/ffffff?text=${test.skill}`;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {test.skill}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{test.title}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" /> {test.attempts.toLocaleString()} attempts
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart className="w-4 h-4 text-[#F4A340]" /> Difficulty: <span className="font-semibold text-slate-800">{test.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-[#1E4DB7]" /> {test.duration}
                </div>
              </div>
              
              <div className="mt-auto">
                {[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 17, 'IELTS-READING-JAN2026-001'].includes(test.id) ? (
                  <Link 
                    to={`/test/${test.skill.toLowerCase()}/${test.id}`}
                    className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Start Test <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : test.externalLink && test.externalLink !== '#' ? (
                  <Link 
                    to={`/test/embed?src=${encodeURIComponent(test.externalLink)}`}
                    className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Start Test <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTests.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tests available</h3>
          <p className="text-slate-600">
            {courseId !== 'ielts' && courseId !== 'pet' ? 'Practice tests are currently only available for IELTS and PET courses.' : 'Try adjusting your search criteria or filters.'}
          </p>
        </div>
      )}
    </div>
  );
}
