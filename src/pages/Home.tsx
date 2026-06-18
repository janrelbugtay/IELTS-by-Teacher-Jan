import React from 'react';
import { Link } from 'react-router';
import { Headphones, Book, Pen, Mic, ArrowRight, Play, Star, CheckCircle2, LayoutDashboard, GraduationCap } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 pb-16 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="text-center lg:text-left lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#1E4DB7] font-semibold text-sm mb-6 border border-blue-100 shadow-sm">
                <Star className="w-4 h-4 fill-[#F4A340] text-[#F4A340]" />
                #1 IELTS Preparation Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Achieve Your Target <span className="text-[#1E4DB7]">IELTS Band Score</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Practice Listening, Reading, Writing, and Speaking with real IELTS-style tests. Get instant AI-powered feedback and track your progress to reach your goal faster.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                <Link to="/practice-tests" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <Book className="w-8 h-8 text-[#1E4DB7] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">Practice Tests</span>
                </Link>
                <Link to="/dashboard" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <LayoutDashboard className="w-8 h-8 text-[#F4A340] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">Student Dashboard</span>
                </Link>
                <Link to="/dashboard?tab=classes" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <GraduationCap className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">My Classes</span>
                </Link>
                <Link to="/dashboard?tab=results" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <ArrowRight className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">Previous Results</span>
                </Link>
                <Link to="/dashboard?tab=writing" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <Pen className="w-8 h-8 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">Writing Portfolio</span>
                </Link>
                <Link to="/dashboard?tab=speaking" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#1E4DB7] hover:shadow-md transition-all group">
                  <Mic className="w-8 h-8 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-800 text-center">Speaking Recordings</span>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1E4DB7]/20 to-[#F4A340]/20 blur-3xl rounded-full -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" 
                alt="Students studying" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/1000x800/1E4DB7/ffffff?text=Students+Studying`;
                }}
                className="rounded-3xl shadow-2xl border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500"
              />
              {/* Floating badges */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">8.5</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Average Band</div>
                  <div className="text-xs text-slate-500">From our top students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Master All Four IELTS Skills</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to succeed in one unified platform. Prepare comprehensively for your test day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Listening Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="w-14 h-14 bg-blue-50 text-[#1E4DB7] rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Listening</h3>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Audio player</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Note completion</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Multiple choice</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Matching</li>
            </ul>
            <Link to="/practice-tests" className="w-full py-3 bg-[#F8FAFC] text-[#1E4DB7] font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 group-hover:border-blue-200">
              Practice Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Reading Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="w-14 h-14 bg-orange-50 text-[#F4A340] rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Reading</h3>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Academic passages</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> General Training</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Timed tests</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Highlight & Notes</li>
            </ul>
            <Link to="/practice-tests" className="w-full py-3 bg-[#F8FAFC] text-[#1E4DB7] font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 group-hover:border-blue-200">
              Practice Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Writing Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Pen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Writing</h3>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Task 1 & Task 2</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> AI feedback</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Band score prediction</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Grammar suggestions</li>
            </ul>
            <Link to="/practice-tests" className="w-full py-3 bg-[#F8FAFC] text-[#1E4DB7] font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 group-hover:border-blue-200">
              Practice Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Speaking Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
              <Mic className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Speaking</h3>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Part 1, 2 & 3</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Voice recording</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> AI Evaluation</li>
              <li className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Pronunciation check</li>
            </ul>
            <Link to="/practice-tests" className="w-full py-3 bg-[#F8FAFC] text-[#1E4DB7] font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border border-slate-200 group-hover:border-blue-200">
              Practice Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
