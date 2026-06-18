import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Headphones, Book, Pen, Mic, Clock, BarChart, Users, Star, ArrowRight } from 'lucide-react';

const generateMockTests = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const skills = [
    { name: 'Reading', duration: '60 mins', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Listening', duration: '60 mins', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
    { name: 'Speaking', duration: '15 mins', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80' },
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
      tests.push({
        id: idCounter,
        title: `${month} ${skill.name} Practice`,
        skill: skill.name,
        month: month,
        attempts: randomAttempts(idCounter),
        difficulty: getDifficulty(idCounter),
        duration: skill.duration,
        image: skill.image,
        createdAt: new Date(2026, mIndex, 1).getTime(), // For sorting by newest
      });
      idCounter++;
    });
  });

  return tests;
};

const allMockTests = generateMockTests();

export function PracticeTests() {
  const [activeTab, setActiveTab] = useState('All Tests');
  const [activeSkill, setActiveSkill] = useState('Reading');
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">2026 Practice Test Collection</h1>
        <p className="text-slate-600 text-lg">Choose from over 100 official-style IELTS tests updated for 2026.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full lg:w-auto">
          {['All Tests'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors bg-white text-[#1E4DB7] shadow-sm`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[300px]">
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
        {['Listening', 'Reading', 'Speaking'].map(skill => (
          <button 
            key={skill}
            onClick={() => setActiveSkill(skill)}
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
                src={test.image} 
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
                <Link 
                  to={test.skill === 'Writing' ? `/test/writing/${test.id}` : (test.title === 'January Reading Practice' ? `/test/reading/${test.id}` : `/assignment/${test.id}`)}
                  className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                >
                  Start Test <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTests.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tests found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
}
