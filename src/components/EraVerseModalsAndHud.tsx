import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Trophy,
  MessageCircle,
  Send,
  AlertTriangle,
  ExternalLink,
  X,
  ShieldCheck,
  Users
} from 'lucide-react';
import {
  StudentSkillScores,
  ChatMessageItem
} from '../utils/eraverseFeatures';

interface SportsSideActionsHudProps {
  inSportsZone: 'none' | 'football' | 'pickleball' | 'playground';
  isCrouching: boolean;
  footballGoals: number;
  aiFootballGoals: number;
  pickleballScore: number;
  aiPickleballScore: number;
  zoomSliderValue: number;
  onZoomChange: (val: number) => void;
  onJump: () => void;
  onToggleCrouch: () => void;
  onKick: () => void;
  onHit: () => void;
}

export const SportsSideActionsHud: React.FC<SportsSideActionsHudProps> = ({
  inSportsZone,
  isCrouching,
  footballGoals,
  aiFootballGoals,
  pickleballScore,
  aiPickleballScore,
  zoomSliderValue,
  onZoomChange,
  onJump,
  onToggleCrouch,
  onKick,
  onHit
}) => {
  return (
    <>
      {/* Live Sports Match Scoreboard Banner when on the Football Field or Pickleball Court */}
      {(inSportsZone === 'football' || inSportsZone === 'pickleball') && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          {inSportsZone === 'football' ? (
            <div className="bg-slate-950/95 border-2 border-emerald-400/70 rounded-2xl px-6 py-2.5 text-white shadow-2xl flex items-center gap-5">
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">YOU (STRIKER)</div>
                <div className="text-2xl font-black text-white">{footballGoals}</div>
              </div>
              <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">⚽ FOOTBALL MATCH</div>
                <div className="text-[11px] text-slate-200 font-bold">Press KICK (F) or CROUCH (C)</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">KEEPER MAX</div>
                <div className="text-2xl font-black text-white">{aiFootballGoals}</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/95 border-2 border-cyan-400/70 rounded-2xl px-6 py-2.5 text-white shadow-2xl flex items-center gap-5">
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">YOU</div>
                <div className="text-2xl font-black text-white">{pickleballScore}</div>
              </div>
              <div className="px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-300">🏓 PICKLEBALL COURT</div>
                <div className="text-[11px] text-slate-200 font-bold">Press HIT (G) when ball is near!</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">COACH LEO</div>
                <div className="text-2xl font-black text-white">{aiPickleballScore}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right-Side Action Buttons Cluster (Jump, Crouch, Kick, Hit + Scroll Zoom) inspired by reference screenshot */}
      <div className="absolute bottom-6 right-5 z-20 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Scroll Zoom Slider for Phone/Tablet & Quick Camera Zoom */}
        <div className="bg-slate-950/85 border border-amber-500/40 rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">Zoom</span>
          <input
            type="range"
            min={7}
            max={24}
            value={zoomSliderValue}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-20 accent-amber-500 cursor-pointer"
          />
        </div>

        {inSportsZone !== 'none' && (
          <div className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow">
            {inSportsZone === 'football'
              ? '⚽ Football Field Actions Active'
              : inSportsZone === 'pickleball'
              ? '🏓 Pickleball Court Actions Active'
              : '🎪 Playground Actions Active'}
          </div>
        )}

        {/* Action Cluster: Top row (Kick + Jump), Bottom row (Hit/Smash + Crouch) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* KICK BUTTON (F) */}
          <button
            type="button"
            onClick={onKick}
            title="Kick Football / Power Shot (Key: F)"
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ${
              inSportsZone === 'football'
                ? 'bg-[#3b1d06]/95 border-amber-400 text-amber-400 ring-4 ring-amber-400/30 scale-105'
                : 'bg-[#2a1505]/90 border-amber-500/80 text-amber-400 hover:border-amber-300'
            }`}
          >
            {/* Kick / Foot Icon */}
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M14.5 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 8.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.4.6 1.5 1.3l.8 4.2 3.7 1.8c.7.4 1 1.2.6 1.9-.4.7-1.2 1-1.9.6l-4.5-2.2-.7 5.4c-.1.8-.8 1.3-1.6 1.2-.8-.1-1.3-.8-1.2-1.6l.8-6.1-1.5-1.5V8.5ZM5.5 17a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">KICK (F)</span>
          </button>

          {/* JUMP BUTTON (SPACE) */}
          <button
            type="button"
            onClick={onJump}
            title="Jump / Header (Key: Space)"
            className="w-16 h-16 rounded-full bg-[#2a1505]/90 border-2 border-amber-500/85 hover:border-amber-300 text-amber-400 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
          >
            {/* Jumping Person Icon matching reference */}
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2Zm-4.5 6.2 3.2-1.2h2.8l3.5 2.2c.6.4.8 1.2.4 1.8-.4.6-1.2.8-1.8.4l-2.1-1.3-.6 3.4 3.4 3.2c.6.5.6 1.4.1 2-.5.6-1.4.6-2 .1l-3.2-3-2 4.2c-.3.7-1.1 1-1.8.7-.7-.3-1-1.1-.7-1.8l2.5-5.3.4-2.8-1.4.5c-.7.3-1.5-.1-1.7-.8-.3-.7.1-1.5.8-1.7Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">JUMP</span>
          </button>

          {/* HIT / SMASH BUTTON (G) */}
          <button
            type="button"
            onClick={onHit}
            title="Hit / Smash Pickleball (Key: G)"
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ${
              inSportsZone === 'pickleball'
                ? 'bg-[#3b1d06]/95 border-amber-400 text-amber-400 ring-4 ring-amber-400/30 scale-105'
                : 'bg-[#2a1505]/90 border-amber-500/80 text-amber-400 hover:border-amber-300'
            }`}
          >
            {/* Fist / Hit Icon matching reference */}
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M8.5 5A2.5 2.5 0 0 0 6 7.5v4.2l-1.3-.8a2 2 0 0 0-2.7.7c-.6.9-.3 2.1.6 2.7l5.2 3.5c1.2.8 2.6 1.2 4 1.2h3.2c2.8 0 5-2.2 5-5V9.5a2.5 2.5 0 0 0-4.3-1.7A2.5 2.5 0 0 0 12.2 6a2.5 2.5 0 0 0-3.7-1Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">HIT (G)</span>
          </button>

          {/* CROUCH BUTTON (C) */}
          <button
            type="button"
            onClick={onToggleCrouch}
            title="Crouch / Slide Posture (Key: C)"
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ${
              isCrouching
                ? 'bg-amber-500 text-slate-950 border-white ring-4 ring-amber-400/40'
                : 'bg-[#2a1505]/90 border-amber-500/85 hover:border-amber-300 text-amber-400'
            }`}
          >
            {/* Crouch / Low Crawl Icon matching reference */}
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M6.5 9a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Zm4.2 3.2h5.1l3.6 2.5c.6.4.8 1.3.4 1.9-.4.6-1.3.8-1.9.4L15 15h-3.2l-2.6 2.6H4.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5h3.8l2.4-2.4Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">
              {isCrouching ? 'STAND' : 'CROUCH'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

interface ProximityEnglishChatProps {
  nearbyPartner: {
    id: string;
    name: string;
    cohort: string;
    roleTitle: string;
  } | null;
  playerName: string;
  messages: ChatMessageItem[];
  englishWarning: string | null;
  onSendMessage: (text: string) => void;
  onSelectPartnerCharacter?: () => void;
}

export const ProximityEnglishChat: React.FC<ProximityEnglishChatProps> = ({
  nearbyPartner,
  playerName,
  messages,
  englishWarning,
  onSendMessage,
  onSelectPartnerCharacter
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!nearbyPartner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendMessage(inputVal);
    setInputVal('');
  };

  const isTeacher = nearbyPartner.cohort.includes('TEACHER') || nearbyPartner.name.toLowerCase().includes('jan');

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 pointer-events-auto">
      <div className="bg-slate-950/95 border-2 border-blue-400/50 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-2.5 border-b border-white/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-extrabold text-xs text-white">
                  Chatting with {nearbyPartner.name}
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                    isTeacher
                      ? 'bg-amber-400 text-slate-950'
                      : nearbyPartner.cohort === 'IELTS 2'
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                      : 'bg-blue-500/25 text-blue-300 border border-blue-400/40'
                  }`}
                >
                  {isTeacher ? 'TEACHER (SUPER ADMIN)' : nearbyPartner.cohort}
                </span>
              </div>
              <div className="text-[10px] text-sky-300 font-semibold">
                🇬🇧 English Only Zone • Speak English when close to each other
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSelectPartnerCharacter && (
              <button
                type="button"
                onClick={onSelectPartnerCharacter}
                className="bg-white/10 hover:bg-white/20 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/15 cursor-pointer"
              >
                Play as {nearbyPartner.name.split(' ')[0]}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
            >
              {isExpanded ? 'Minimize' : 'Chat'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3.5 space-y-2.5">
            {/* Vietnamese Warning Alert */}
            {englishWarning && (
              <div className="bg-red-600/95 border border-red-300 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-extrabold shadow-lg">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{englishWarning}</span>
              </div>
            )}

            {/* Recent Messages */}
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {messages.length === 0 ? (
                <div className="text-[11px] text-slate-400 text-center py-2">
                  You are next to <strong className="text-white">{nearbyPartner.name}</strong>! Say hello in English below ({playerName}).
                </div>
              ) : (
                messages.slice(-5).map((m) => (
                  <div
                    key={m.id}
                    className={`text-xs px-3 py-1.5 rounded-xl ${
                      m.isWarning
                        ? 'bg-red-950/90 border border-red-500/60 text-red-200 font-bold'
                        : m.senderName === playerName
                        ? 'bg-blue-600/30 border border-blue-400/40 text-blue-100 ml-6'
                        : 'bg-slate-800/90 border border-white/10 text-slate-100 mr-6'
                    }`}
                  >
                    <span className="font-extrabold text-sky-300 mr-1.5">{m.senderName}:</span>
                    <span>{m.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick English Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'Hello! How is your IELTS prep?',
                "Let's play football!",
                "Let's check our Class Dashboard!"
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onSendMessage(preset)}
                  className="text-[10px] font-bold bg-slate-900 hover:bg-blue-950 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Chat with ${nearbyPartner.name} in English only...`}
                className="flex-1 bg-slate-900 border border-white/20 rounded-xl px-3.5 py-2 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardHallModalsProps {
  activeModal: 'my_dashboard' | 'class_dashboard' | null;
  onClose: () => void;
  myStats: StudentSkillScores;
  classCohortLabel: string;
  classStudents: StudentSkillScores[];
  allCohortsStudents: StudentSkillScores[];
  isSuperAdminCharacter: boolean;
  onNavigateFullDashboard: (userId?: string) => void;
}

export const DashboardHallModals: React.FC<DashboardHallModalsProps> = ({
  activeModal,
  onClose,
  myStats,
  classCohortLabel,
  classStudents,
  allCohortsStudents,
  isSuperAdminCharacter,
  onNavigateFullDashboard
}) => {
  const [teacherCohortTab, setTeacherCohortTab] = useState<'ALL' | 'IELTS 1' | 'IELTS 2'>('ALL');

  if (!activeModal) return null;

  if (activeModal === 'my_dashboard') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E4DB7] via-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white border-2 border-white/40 shadow-lg"
                style={{ backgroundColor: myStats.shirtColor }}
              >
                {myStats.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                    PERSONAL DASHBOARD HALL
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    {myStats.cohort}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">{myStats.name}&apos;s IELTS Dashboard</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Overall Summary Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                  INDIVIDUAL STUDENT PERFORMANCE
                </div>
                <div className="text-lg font-extrabold mt-0.5">
                  {myStats.name} • {myStats.cohort}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Each student in EraVerse has their own personal IELTS dashboard tracking Reading, Listening, Writing, and Speaking.
                </p>
              </div>
              <div className="bg-blue-600/30 border border-blue-400/40 rounded-2xl px-5 py-3 text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">OVERALL BAND</div>
                <div className="text-3xl font-black text-white">{myStats.overall.toFixed(1)}</div>
              </div>
            </div>

            {/* 4 Skill Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Reading', score: myStats.reading, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                { label: 'Listening', score: myStats.listening, icon: Headphones, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
                { label: 'Writing', score: myStats.writing, icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                { label: 'Speaking', score: myStats.speaking, icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' }
              ].map(({ label, score, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-2xl p-4 border-2 ${bg} flex flex-col items-center text-center`}>
                  <Icon className={`w-6 h-6 ${color} mb-2`} />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">{label}</span>
                  <span className="text-3xl font-black text-slate-900 mt-1">{score.toFixed(1)}</span>
                  <span className="text-[11px] font-semibold text-slate-500 mt-0.5">Band Score</span>
                </div>
              ))}
            </div>

            {/* Open Full Personal Dashboard Button */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Back to Dashboard Hall
              </button>
              <button
                type="button"
                onClick={() => onNavigateFullDashboard(myStats.userId)}
                className="px-6 py-3 rounded-xl font-extrabold text-xs bg-[#1E4DB7] hover:bg-blue-800 text-white flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Open Full {myStats.name}&apos;s Dashboard Page</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLASS DASHBOARD MODAL (Filtered strictly to the user's class e.g. Kai -> ONLY IELTS 1, unless Teacher Jan Super Admin)
  const displayedStudents = isSuperAdminCharacter
    ? teacherCohortTab === 'ALL'
      ? allCohortsStudents
      : allCohortsStudents.filter((s) => s.cohort === teacherCohortTab)
    : classStudents;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-100">
                  DEDICATED CLASS DASHBOARD WALL
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                  {isSuperAdminCharacter ? 'TEACHER JAN (SUPER ADMIN VIEW)' : `${classCohortLabel} GROUP ONLY`}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {isSuperAdminCharacter
                  ? 'All IELTS Classes Scoreboard (Teacher Jan)'
                  : `${classCohortLabel} Class Dashboard (${displayedStudents.length} Students)`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader note */}
        <div className="px-6 py-3.5 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Users className="w-4 h-4 text-emerald-700" />
            {isSuperAdminCharacter ? (
              <span>Teacher Jan (Super Admin) can inspect both IELTS 1 and IELTS 2 cohorts.</span>
            ) : (
              <span>
                Showing <strong>only {classCohortLabel}</strong> classmates for <strong>{myStats.name}</strong> with Reading, Listening, Writing &amp; Speaking scores.
              </span>
            )}
          </div>

          {isSuperAdminCharacter && (
            <div className="flex items-center gap-1.5">
              {(['ALL', 'IELTS 1', 'IELTS 2'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTeacherCohortTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${
                    teacherCohortTab === tab
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scores Table */}
        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Class Group</th>
                  <th className="py-3.5 px-4 text-center text-blue-700">Reading</th>
                  <th className="py-3.5 px-4 text-center text-teal-700">Listening</th>
                  <th className="py-3.5 px-4 text-center text-amber-700">Writing</th>
                  <th className="py-3.5 px-4 text-center text-purple-700">Speaking</th>
                  <th className="py-3.5 px-4 text-center text-emerald-800">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {displayedStudents.map((st, idx) => {
                  const isCurrentPlayer = st.name.toLowerCase() === myStats.name.toLowerCase();
                  return (
                    <tr
                      key={st.id}
                      className={
                        isCurrentPlayer
                          ? 'bg-blue-50/90 font-extrabold'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-slate-50'
                          : 'bg-slate-50/60 hover:bg-slate-50'
                      }
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0"
                            style={{ backgroundColor: st.shirtColor }}
                          >
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900">{st.name}</span>
                            {isCurrentPlayer && (
                              <span className="ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                            st.cohort === 'IELTS 2'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {st.cohort}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-blue-700">{st.reading.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-teal-700">{st.listening.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-700">{st.writing.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-purple-700">{st.speaking.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                          {st.overall.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
