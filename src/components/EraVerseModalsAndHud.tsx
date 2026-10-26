import React, { useState, useEffect } from 'react';
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
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  Video,
  Clock,
  Calendar,
  MessageSquare
} from 'lucide-react';
import {
  StudentSkillScores,
  ChatMessageItem,
  SkillKey,
  SkillSubmissionSummary
} from '../utils/eraverseFeatures';

interface SportsSideActionsHudProps {
  inSportsZone: 'none' | 'football' | 'tennis' | 'pickleball' | 'playground';
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
      {/* Live Sports Match Scoreboard Banner when on the Football Field or Era Tennis Court */}
      {(inSportsZone === 'football' || inSportsZone === 'tennis' || inSportsZone === 'pickleball') && (
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
            <div className="bg-slate-950/95 border-2 border-emerald-400/80 rounded-2xl px-6 py-2.5 text-white shadow-2xl flex items-center gap-5">
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">YOU (TENNIS)</div>
                <div className="text-2xl font-black text-white">{pickleballScore}</div>
              </div>
              <div className="px-3.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">🎾 ERA TENNIS COURT</div>
                <div className="text-[11px] text-slate-100 font-bold">Press SWING (G) when ball is near!</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">COACH LEO (PRO)</div>
                <div className="text-2xl font-black text-white">{aiPickleballScore}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right-Side Action Buttons Cluster (Jump, Crouch, Kick, Hit + Scroll Zoom) */}
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
          <div className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow">
            {inSportsZone === 'football'
              ? '⚽ Football Field Actions Active'
              : inSportsZone === 'tennis' || inSportsZone === 'pickleball'
              ? '🎾 Era Tennis Court Actions Active'
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
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2Zm-4.5 6.2 3.2-1.2h2.8l3.5 2.2c.6.4.8 1.2.4 1.8-.4.6-1.2.8-1.8.4l-2.1-1.3-.6 3.4 3.4 3.2c.6.5.6 1.4.1 2-.5.6-1.4.6-2 .1l-3.2-3-2 4.2c-.3.7-1.1 1-1.8.7-.7-.3-1-1.1-.7-1.8l2.5-5.3.4-2.8-1.4.5c-.7.3-1.5-.1-1.7-.8-.3-.7.1-1.5.8-1.7Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">JUMP</span>
          </button>

          {/* HIT / SWING BUTTON (G) */}
          <button
            type="button"
            onClick={onHit}
            title="Swing Tennis Racket / Power Return (Key: G)"
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer ${
              inSportsZone === 'tennis' || inSportsZone === 'pickleball'
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/40 scale-105'
                : 'bg-[#2a1505]/90 border-amber-500/80 text-amber-400 hover:border-amber-300'
            }`}
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M8.5 5A2.5 2.5 0 0 0 6 7.5v4.2l-1.3-.8a2 2 0 0 0-2.7.7c-.6.9-.3 2.1.6 2.7l5.2 3.5c1.2.8 2.6 1.2 4 1.2h3.2c2.8 0 5-2.2 5-5V9.5a2.5 2.5 0 0 0-4.3-1.7A2.5 2.5 0 0 0 12.2 6a2.5 2.5 0 0 0-3.7-1Z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">SWING (G)</span>
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
  canSwitchCharacter?: boolean;
  onSendMessage: (text: string) => void;
  onSelectPartnerCharacter?: () => void;
  onClose: () => void;
}

export const ProximityEnglishChat: React.FC<ProximityEnglishChatProps> = ({
  nearbyPartner,
  playerName,
  messages,
  englishWarning,
  canSwitchCharacter = false,
  onSendMessage,
  onSelectPartnerCharacter,
  onClose
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendMessage(inputVal);
    setInputVal('');
  };

  const isTeacher = nearbyPartner?.cohort.includes('TEACHER') || nearbyPartner?.name.toLowerCase().includes('jan');

  return (
    <div className="absolute top-20 left-4 z-30 w-full max-w-md px-2 pointer-events-auto">
      <div className="bg-slate-950/95 border-2 border-sky-400/60 rounded-3xl shadow-2xl overflow-hidden text-white backdrop-blur-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-4 py-3 border-b border-white/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${nearbyPartner ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-extrabold text-xs text-white truncate">
                  {nearbyPartner ? `Chatting with ${nearbyPartner.name}` : 'English Campus Chat'}
                </span>
                {nearbyPartner && (
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                      isTeacher
                        ? 'bg-amber-400 text-slate-950'
                        : nearbyPartner.cohort === 'IELTS 2'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                        : 'bg-blue-500/25 text-blue-300 border border-blue-400/40'
                    }`}
                  >
                    {isTeacher ? 'TEACHER (SUPER ADMIN)' : nearbyPartner.cohort}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-sky-300 font-semibold truncate">
                🇬🇧 English Only Zone • Speak English with classmates
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {nearbyPartner && canSwitchCharacter && onSelectPartnerCharacter && (
              <button
                type="button"
                onClick={onSelectPartnerCharacter}
                className="bg-white/10 hover:bg-white/20 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/15 cursor-pointer"
                title="Switch to preview this character (Super Admin)"
              >
                Preview {nearbyPartner.name}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/30 hover:text-red-300 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3.5 space-y-2.5">
            {!nearbyPartner && (
              <div className="bg-blue-950/60 border border-blue-500/30 text-blue-200 p-3 rounded-2xl text-center space-y-1">
                <div className="font-extrabold text-xs text-white">No one nearby right now</div>
                <div className="text-[11px] text-slate-300">
                  Walk close to any classmate (Suzie, Kai, Sophia, Jack2, May, Dragon, Emily, Hailey, or Teacher Jan) to chat in English!
                </div>
              </div>
            )}

            {englishWarning && (
              <div className="bg-red-600/95 border border-red-300 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-extrabold shadow-lg">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{englishWarning}</span>
              </div>
            )}

            {nearbyPartner && (
              <>
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

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Hello! How is your IELTS prep?',
                    "Let's play football!",
                    "Let's check our Dashboard Hall!"
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
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-md shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export type DashboardModalType =
  | 'my_dashboard'
  | 'class_dashboard'
  | 'listening_dashboard'
  | 'reading_dashboard'
  | 'writing_dashboard'
  | 'speaking_dashboard'
  | null;

interface DashboardHallModalsProps {
  activeModal: DashboardModalType;
  onClose: () => void;
  myStats: StudentSkillScores;
  classCohortLabel: string;
  classStudents: StudentSkillScores[];
  allCohortsStudents: StudentSkillScores[];
  isSuperAdminCharacter: boolean;
  onNavigateFullDashboard: (userId?: string) => void;
  onOpenSkillPractice?: (skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking') => void;
  onSelectAdminCohort?: (cohort: 'IELTS 1' | 'IELTS 2') => void;
}

const SKILL_ACTIVITY_CONFIG: Record<
  SkillKey,
  {
    activityTitle: string;
    chartTitle: string;
    capSkill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
    barColorClass: string;
    badgeBgClass: string;
    badgeTextClass: string;
    pillBorderClass: string;
    headerBtnClass: string;
  }
> = {
  reading: {
    activityTitle: 'Reading Activity',
    chartTitle: 'Reading',
    capSkill: 'Reading',
    barColorClass: 'bg-blue-500',
    badgeBgClass: 'bg-blue-50',
    badgeTextClass: 'text-blue-600',
    pillBorderClass: 'border-blue-200',
    headerBtnClass: 'bg-blue-600 hover:bg-blue-700'
  },
  listening: {
    activityTitle: 'Listening Activity',
    chartTitle: 'Listening',
    capSkill: 'Listening',
    barColorClass: 'bg-emerald-500',
    badgeBgClass: 'bg-emerald-50',
    badgeTextClass: 'text-emerald-600',
    pillBorderClass: 'border-emerald-200',
    headerBtnClass: 'bg-emerald-600 hover:bg-emerald-700'
  },
  writing: {
    activityTitle: 'Writing Activity',
    chartTitle: 'Writing',
    capSkill: 'Writing',
    barColorClass: 'bg-purple-500',
    badgeBgClass: 'bg-purple-50',
    badgeTextClass: 'text-purple-600',
    pillBorderClass: 'border-purple-200',
    headerBtnClass: 'bg-purple-600 hover:bg-purple-700'
  },
  speaking: {
    activityTitle: 'Speaking Activity',
    chartTitle: 'Speaking',
    capSkill: 'Speaking',
    barColorClass: 'bg-orange-500',
    badgeBgClass: 'bg-orange-50',
    badgeTextClass: 'text-orange-600',
    pillBorderClass: 'border-orange-200',
    headerBtnClass: 'bg-orange-600 hover:bg-orange-700'
  }
};

// Accurate Vertical Bar Graph Component (Matches /src/pages/ielts/Dashboard.tsx lines 750–811 & Screenshot 3)
const SkillScoreBarGraphCard: React.FC<{
  skill: SkillKey;
  submissions: SkillSubmissionSummary[];
}> = ({ skill, submissions }) => {
  const cfg = SKILL_ACTIVITY_CONFIG[skill];
  const chronological = [...submissions].slice(0, 5).reverse();
  const recentScore = submissions.length > 0 ? submissions[0].bandScore : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="font-extrabold text-slate-900 text-lg block">{cfg.chartTitle}</span>
          <span className="text-xs text-slate-500 font-medium">Recent Score</span>
        </div>
        <div className={`px-3 py-1 rounded-xl ${cfg.badgeBgClass} border ${cfg.pillBorderClass}`}>
          <span className={`text-2xl font-black ${cfg.badgeTextClass}`}>
            {recentScore !== null ? recentScore.toFixed(1) : '-'}
          </span>
        </div>
      </div>

      <div className="h-44 flex items-end gap-3 pt-6 px-2 border-b border-slate-100 relative">
        {/* Background dashed grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
          <div className="border-b border-dashed border-slate-200 w-full h-0" />
          <div className="border-b border-dashed border-slate-200 w-full h-0" />
          <div className="border-b border-dashed border-slate-200 w-full h-0" />
          <div className="border-b border-dashed border-slate-200 w-full h-0" />
        </div>

        {chronological.length > 0 ? (
          chronological.map((sub, i) => {
            const score = sub.bandScore || 0;
            const heightPercent = Math.max(12, Math.min(100, (score / 9) * 100));
            return (
              <div key={sub.id || i} className="flex-1 flex flex-col items-center gap-2 z-10 h-full justify-end group relative">
                <span className="text-[11px] font-extrabold text-slate-700">{score.toFixed(1)}</span>
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full ${cfg.barColorClass} rounded-t-lg transition-all duration-500`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[68px]" title={sub.title}>
                  {sub.title.replace(/^IELTS\s+(Reading|Listening|Writing|Speaking)\s+/i, '')}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 z-10">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

// Accurate Activity Table Component (Matches Screenshot 4: "Reading Activity", "TEST NAME", "SCORE")
const SkillActivityTableCard: React.FC<{
  title: string;
  submissions: SkillSubmissionSummary[];
}> = ({ title, submissions }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-lg">{title}</h3>
        <span className="text-xs font-bold text-slate-400">{submissions.length} Tests</span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
              <th className="py-3 px-5">Test Name</th>
              <th className="py-3 px-5 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {submissions.length > 0 ? (
              submissions.slice(0, 6).map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-800">{sub.title}</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-800">
                      {sub.bandScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-8 text-center text-slate-400 text-sm">
                  No tests completed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DashboardHallModals: React.FC<DashboardHallModalsProps> = ({
  activeModal,
  onClose,
  myStats,
  classCohortLabel,
  classStudents,
  allCohortsStudents,
  isSuperAdminCharacter,
  onNavigateFullDashboard,
  onOpenSkillPractice,
  onSelectAdminCohort
}) => {
  const [teacherCohortTab, setTeacherCohortTab] = useState<'IELTS 1' | 'IELTS 2'>(
    classCohortLabel === 'IELTS 2' ? 'IELTS 2' : 'IELTS 1'
  );
  const [personalTab, setPersonalTab] = useState<'overview' | SkillKey>('overview');
  const [selectedVideoSub, setSelectedVideoSub] = useState<SkillSubmissionSummary | null>(null);
  const [selectedFeedbackSub, setSelectedFeedbackSub] = useState<SkillSubmissionSummary | null>(null);

  useEffect(() => {
    setTeacherCohortTab(classCohortLabel === 'IELTS 2' ? 'IELTS 2' : 'IELTS 1');
  }, [classCohortLabel]);

  useEffect(() => {
    if (activeModal === 'listening_dashboard') setPersonalTab('listening');
    else if (activeModal === 'reading_dashboard') setPersonalTab('reading');
    else if (activeModal === 'writing_dashboard') setPersonalTab('writing');
    else if (activeModal === 'speaking_dashboard') setPersonalTab('speaking');
    else if (activeModal === 'my_dashboard') setPersonalTab('overview');
  }, [activeModal]);

  if (!activeModal) return null;

  const isPersonalOrSkillModal =
    activeModal === 'my_dashboard' ||
    activeModal === 'listening_dashboard' ||
    activeModal === 'reading_dashboard' ||
    activeModal === 'writing_dashboard' ||
    activeModal === 'speaking_dashboard';

  if (isPersonalOrSkillModal) {
    const activeSkillCfg = personalTab !== 'overview' ? SKILL_ACTIVITY_CONFIG[personalTab] : null;
    const readingSubs = myStats.recentSubmissions.filter((s) => s.skill === 'reading');
    const listeningSubs = myStats.recentSubmissions.filter((s) => s.skill === 'listening');
    const writingSubs = myStats.recentSubmissions.filter((s) => s.skill === 'writing');
    const speakingSubs = myStats.recentSubmissions.filter((s) => s.skill === 'speaking');
    const onlineSpeakingSubs = speakingSubs.filter((s) => !s.isOfflineSpeaking);
    const offlineSpeakingSubs = speakingSubs.filter((s) => s.isOfflineSpeaking);

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
        <div className="bg-slate-50 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1E4DB7] via-blue-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white border-2 border-white/40 shadow-lg shrink-0"
                style={{ backgroundColor: myStats.shirtColor }}
              >
                {myStats.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                    PERSONALIZED IELTS ACTIVITY &amp; SCORE GRAPHS
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    {myStats.cohort}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {myStats.name}&apos;s {activeSkillCfg ? activeSkillCfg.activityTitle : 'IELTS Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block bg-white/15 border border-white/25 rounded-2xl px-4 py-1.5 text-center">
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300">OVERALL BAND</div>
                <div className="text-xl font-black text-white">{myStats.overall.toFixed(1)}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Activity Tabs: All 4 Skills Overview + Reading Activity + Listening Activity + Writing Activity + Speaking (Online & Offline) */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'overview', label: 'All 4 Skills Activity', icon: Sparkles },
                  { id: 'reading', label: `Reading Activity (${myStats.reading.toFixed(1)})`, icon: BookOpen },
                  { id: 'listening', label: `Listening Activity (${myStats.listening.toFixed(1)})`, icon: Headphones },
                  { id: 'writing', label: `Writing Activity (${myStats.writing.toFixed(1)})`, icon: PenTool },
                  { id: 'speaking', label: `Speaking Online & Offline (${myStats.speaking.toFixed(1)})`, icon: Mic }
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = personalTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPersonalTab(id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#1E4DB7] text-white border-[#1E4DB7] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {personalTab === 'overview' ? (
              <>
                {/* 4 Accurate Vertical Bar Graphs Row (Reading, Listening, Writing, Speaking) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SkillScoreBarGraphCard skill="reading" submissions={readingSubs} />
                  <SkillScoreBarGraphCard skill="listening" submissions={listeningSubs} />
                  <SkillScoreBarGraphCard skill="writing" submissions={writingSubs} />
                  <SkillScoreBarGraphCard skill="speaking" submissions={speakingSubs} />
                </div>

                {/* Activity Tables Row: Reading Activity, Listening Activity, Writing Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <SkillActivityTableCard title="Reading Activity" submissions={readingSubs} />
                  <SkillActivityTableCard title="Listening Activity" submissions={listeningSubs} />
                  <SkillActivityTableCard title="Writing Activity" submissions={writingSubs} />
                </div>
              </>
            ) : personalTab !== 'speaking' ? (
              /* Dedicated Reading Activity, Listening Activity, or Writing Activity View (Bar Graph + Test Name & Score Table) */
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkillScoreBarGraphCard
                    skill={personalTab}
                    submissions={
                      personalTab === 'reading'
                        ? readingSubs
                        : personalTab === 'listening'
                        ? listeningSubs
                        : writingSubs
                    }
                  />
                  <SkillActivityTableCard
                    title={SKILL_ACTIVITY_CONFIG[personalTab].activityTitle}
                    submissions={
                      personalTab === 'reading'
                        ? readingSubs
                        : personalTab === 'listening'
                        ? listeningSubs
                        : writingSubs
                    }
                  />
                </div>

                {onOpenSkillPractice && activeSkillCfg && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSkillPractice(activeSkillCfg.capSkill);
                      }}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs text-white ${activeSkillCfg.headerBtnClass} flex items-center gap-1.5 cursor-pointer shadow`}
                    >
                      <span>Practice {activeSkillCfg.capSkill} Tests Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Speaking Section (Shown in Speaking tab AND at the bottom of Overview tab): Both Online & Offline Speaking with Video Thumbnails */}
            {(personalTab === 'speaking' || personalTab === 'overview') && (
              <div className="space-y-6">
                {personalTab === 'speaking' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkillScoreBarGraphCard skill="speaking" submissions={speakingSubs} />
                    <SkillActivityTableCard title="Online Speaking Tests" submissions={onlineSpeakingSubs} />
                  </div>
                )}

                {/* Offline Speaking Assignments with Video Thumbnails (Exact match to Screenshot 5) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">Offline Speaking Assignments</h3>
                        <p className="text-xs text-slate-500">
                          Face-to-face speaking tests &amp; video recordings with teacher feedback
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      {offlineSpeakingSubs.length} Video Record{offlineSpeakingSubs.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {offlineSpeakingSubs.map((sub) => {
                      const thumbUrl = sub.thumbnailInfo?.imageUrl;
                      const mins = sub.timeSpent ? Math.round(sub.timeSpent / 60) : 15;
                      return (
                        <div
                          key={sub.id}
                          className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col"
                        >
                          {/* Video Thumbnail Container */}
                          <div
                            onClick={() => setSelectedVideoSub(sub)}
                            className="aspect-video bg-slate-900 relative overflow-hidden cursor-pointer flex items-center justify-center"
                          >
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={sub.title}
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center relative">
                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                  <Video className="w-8 h-8 text-slate-400" />
                                </div>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                            {/* Top-Left "Offline Test" Badge */}
                            <div className="absolute top-3 left-3 z-20">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-black/65 text-white backdrop-blur-md border border-white/15">
                                Offline Test
                              </span>
                            </div>

                            {/* Center Play Button + WATCH VIDEO */}
                            <div className="relative z-10 flex flex-col items-center gap-1.5">
                              <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-orange-500 transition-all">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                              <span className="text-[11px] font-extrabold text-white tracking-wider uppercase bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-xs">
                                Watch Video
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-extrabold text-slate-900 text-base">{sub.title}</h4>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-orange-50 text-orange-700 border border-orange-200/70 shrink-0">
                                  Band {sub.bandScore.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
                              <div className="flex items-center gap-3 font-semibold">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {mins}m
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {sub.dateStr}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedFeedbackSub(sub)}
                                className="inline-flex items-center gap-1.5 font-extrabold text-slate-700 hover:text-orange-600 transition-colors bg-slate-50 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 hover:border-orange-200 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Feedback</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Open Full Personal Dashboard Button */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200/70 cursor-pointer"
              >
                Back to 3D Dashboard Hall
              </button>
              <button
                type="button"
                onClick={() => onNavigateFullDashboard(myStats.userId)}
                className="px-6 py-3 rounded-xl font-extrabold text-xs bg-[#1E4DB7] hover:bg-blue-800 text-white flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Open Full {myStats.name}&apos;s IELTS Dashboard Page</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Player Sub-Modal for Offline Speaking Assignments */}
        {selectedVideoSub && (
          <div
            className="fixed inset-0 z-60 bg-slate-950/85 flex items-center justify-center p-4"
            onClick={() => setSelectedVideoSub(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      {myStats.name} — {selectedVideoSub.title} (Band {selectedVideoSub.bandScore.toFixed(1)})
                    </h3>
                    <p className="text-xs text-slate-400">Offline Speaking Video Recording • {selectedVideoSub.dateStr}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideoSub(null)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-black w-full relative flex items-center justify-center">
                {selectedVideoSub.thumbnailInfo?.embedUrl &&
                (selectedVideoSub.thumbnailInfo.type === 'youtube' ||
                  selectedVideoSub.thumbnailInfo.type === 'drive') ? (
                  <iframe
                    src={selectedVideoSub.thumbnailInfo.embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideoSub.title}
                  />
                ) : selectedVideoSub.audioUrl && selectedVideoSub.thumbnailInfo?.type === 'video' ? (
                  <video src={selectedVideoSub.audioUrl} controls autoPlay className="w-full h-full" />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                      <Video className="w-8 h-8" />
                    </div>
                    <div className="text-white font-extrabold text-base">
                      Offline Speaking Recording — {selectedVideoSub.title}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {selectedVideoSub.audioUrl
                        ? 'Click below to open the external recording link or open your full IELTS Dashboard.'
                        : `Recorded during ${myStats.cohort} Offline Speaking assessment (${selectedVideoSub.dateStr}).`}
                    </p>
                    {selectedVideoSub.audioUrl && (
                      <a
                        href={selectedVideoSub.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs"
                      >
                        <span>Open Video Recording</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher Feedback Sub-Modal for Offline Speaking */}
        {selectedFeedbackSub && (
          <div
            className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4"
            onClick={() => setSelectedFeedbackSub(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">
                    OFFLINE SPEAKING EVALUATION
                  </span>
                  <h4 className="font-extrabold text-lg text-slate-900">
                    {selectedFeedbackSub.title} — Band {selectedFeedbackSub.bandScore.toFixed(1)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFeedbackSub(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedFeedbackSub.feedback ||
                  `Evaluated by Teacher Jan: Clear pronunciation and steady pacing on ${selectedFeedbackSub.title}. Band Score: ${selectedFeedbackSub.bandScore.toFixed(1)}.`}
              </div>
              {selectedFeedbackSub.vietnameseTranslation && (
                <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  <div className="font-extrabold text-orange-800 mb-1 uppercase">Vietnamese Translation</div>
                  {selectedFeedbackSub.vietnameseTranslation}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFeedbackSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // HOLOGRAPHIC FOUNTAIN CLASS LEADERBOARD MODAL (Filtered strictly to the user's real class: IELTS 1 sees ONLY IELTS 1, IELTS 2 sees ONLY IELTS 2)
  const activeCohort = isSuperAdminCharacter ? teacherCohortTab : classCohortLabel;
  const displayedStudents = isSuperAdminCharacter
    ? allCohortsStudents.filter((s) => s.cohort === teacherCohortTab)
    : classStudents;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
      <div className="bg-slate-950 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border-2 border-cyan-400/60 overflow-hidden text-white">
        {/* Holographic Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-emerald-950 px-6 py-5 border-b border-cyan-400/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300">
                  ✦ CENTRAL FOUNTAIN HOLOGRAPHIC PROJECTION
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  {`${activeCohort} LEADERBOARD`}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                {`Top Students - ${activeCohort} (${displayedStudents.length} Students)`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader note */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-100">
            <Users className="w-4 h-4 text-cyan-400" />
            {isSuperAdminCharacter ? (
              <span>
                Inspecting <strong>{activeCohort}</strong> Leaderboard ({displayedStudents.length} Students). Admin can switch between IELTS 1 and IELTS 2.
              </span>
            ) : (
              <span>
                Your Class Group Leaderboard: <strong>{classCohortLabel}</strong> ({displayedStudents.length} Students) ranked by Reading, Listening, Writing &amp; Speaking.
              </span>
            )}
          </div>

          {isSuperAdminCharacter && (
            <div className="flex items-center gap-1.5">
              {(['IELTS 1', 'IELTS 2'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setTeacherCohortTab(tab);
                    onSelectAdminCohort?.(tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                    teacherCohortTab === tab
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-cyan-200 border border-cyan-500/30 hover:bg-slate-700'
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
          <div className="overflow-x-auto rounded-2xl border border-cyan-500/30 bg-slate-900/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-cyan-300 text-[11px] font-black uppercase tracking-wider border-b border-cyan-500/25">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4 text-center text-blue-300">Reading</th>
                  <th className="py-3.5 px-4 text-center text-teal-300">Listening</th>
                  <th className="py-3.5 px-4 text-center text-amber-300">Writing</th>
                  <th className="py-3.5 px-4 text-center text-purple-300">Speaking</th>
                  <th className="py-3.5 px-4 text-center text-emerald-300">Overall Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {displayedStudents.map((st, idx) => {
                  const isCurrentPlayer = st.name.toLowerCase() === myStats.name.toLowerCase();
                  const fullLabel = st.fullName || st.name;
                  return (
                    <tr
                      key={st.id}
                      className={
                        isCurrentPlayer
                          ? 'bg-cyan-950/80 font-extrabold'
                          : idx % 2 === 0
                          ? 'bg-slate-900/40 hover:bg-slate-800/60'
                          : 'bg-slate-900/80 hover:bg-slate-800/60'
                      }
                    >
                      <td className="py-3.5 px-4 font-bold text-cyan-300">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                            style={{ backgroundColor: st.shirtColor }}
                          >
                            {st.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white">{fullLabel}</span>
                              {isCurrentPlayer && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">
                              {st.roleTitle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${
                            st.cohort === 'IELTS 2'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          }`}
                        >
                          {st.cohort}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-blue-300">{st.reading.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-teal-300">{st.listening.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-300">{st.writing.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-purple-300">{st.speaking.toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">
                          ★ {st.overall.toFixed(1)}
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

