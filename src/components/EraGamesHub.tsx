import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GameThumbnail } from './GameThumbnail';
import { awardStudentWallet } from '../data/eraGamesCourseDecks';
import {
  ALL_GRADES,
  CAMBRIDGE_COURSES,
  GLOBAL_SUCCESS_LEVELS,
  adaptGameForBubbleIsland,
  extractCambridgeCourse,
  extractGradeNumber,
  fetchLiveHamsterCommunityGames,
  mapStudentCourseToCambridge,
  matchGameGlobalSuccess,
  subscribeLiveHamsterCommunityGames,
  type AdaptedBubbleIslandGame,
  type CambridgeType
} from '../lib/hamsterSync';

type SortMode = 'latest' | 'grade-asc' | 'cambridge-asc' | 'questions-desc' | 'title-asc' | 'oldest';
type BubbleScreen = 'community' | 'setup' | 'game' | 'study';

interface EraGamesHubProps {
  initialCourse?: string;
  externalDollars?: number;
  externalGems?: number;
  onWalletReward?: (gemsWon: number, xpWon: number, dollarsWon: number, gameTitle: string) => void;
  onOpenEraShop?: () => void;
  onClose?: () => void;
  compactModal?: boolean;
}

const CAMBRIDGE_RANK: Record<string, number> = {
  Starters: 1,
  Movers: 2,
  Flyers: 3,
  KET: 4,
  PET: 5,
  IELTS: 6
};

function getTime(val: any): number {
  if (!val) return 0;
  if (val.toMillis) return val.toMillis();
  if (val.seconds) return val.seconds * 1000;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getGameTime(g: any): number {
  return getTime(g?.publishedAt) || getTime(g?.updatedAt) || getTime(g?.createdAt) || 0;
}

function getGameQuestionCount(g: any): number {
  return (
    g?.customQuestions?.length ||
    g?.questions?.length ||
    g?.customSentences?.length ||
    g?.sentences?.length ||
    g?.cards?.length ||
    10
  );
}

function getGameCambridgeRank(g: any): number {
  const c = extractCambridgeCourse(g);
  return c ? CAMBRIDGE_RANK[c] || 99 : 99;
}

function getGameDisplayBadge(game: any): { label: string; badgeClass: string } | null {
  const cambridge = extractCambridgeCourse(game);
  if (cambridge) {
    const found = CAMBRIDGE_COURSES.find((c) => c.id === cambridge);
    if (found) return { label: found.label, badgeClass: found.badgeClass };
  }
  const grade = extractGradeNumber(game);
  if (grade !== null) {
    return {
      label: `Grade ${grade}`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
    };
  }
  const rawClass = String(game?.className || game?.classLevel || '').trim();
  if (rawClass) {
    return {
      label: rawClass,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
    };
  }
  return null;
}

export const EraGamesHub: React.FC<EraGamesHubProps> = ({
  initialCourse,
  onWalletReward
}) => {
  const { user, userCourse, isAdmin } = useAuth();
  const effectiveUid =
    user?.uid || (typeof window !== 'undefined' ? localStorage.getItem('studentUid') || '' : '');

  const [games, setGames] = useState<any[]>([]);
  const [pageVisits, setPageVisits] = useState<number>(779);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Default to student's course (e.g. Movers student automatically sees Movers questions!)
  const [studentDetectedCourse, setStudentDetectedCourse] = useState<CambridgeType | 'all'>(() =>
    mapStudentCourseToCambridge(initialCourse || userCourse || localStorage.getItem('studentCourse'))
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    const detected = mapStudentCourseToCambridge(
      initialCourse || userCourse || localStorage.getItem('studentCourse')
    );
    return detected !== 'all' ? detected : 'all';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('latest');

  // Bubble Island Game State
  const [screen, setScreen] = useState<BubbleScreen>('community');
  const [activeBubbleGame, setActiveBubbleGame] = useState<AdaptedBubbleIslandGame | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>('theme-sky');
  const [studyIndex, setStudyIndex] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Sync student course from Firestore users/{uid} so e.g. Movers student defaults to Movers
  useEffect(() => {
    if (!effectiveUid || effectiveUid.startsWith('ielts')) return;
    const unsub = onSnapshot(
      doc(db, 'users', effectiveUid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as any;
        const mapped = mapStudentCourseToCambridge(
          data.gameCourseOverride || data.course || initialCourse || userCourse
        );
        if (mapped !== 'all') {
          setStudentDetectedCourse(mapped);
          if (!isAdmin) {
            setSelectedLevel(mapped);
          }
        }
      },
      () => {}
    );
    return () => unsub();
  }, [effectiveUid, initialCourse, userCourse, isAdmin]);

  const loadCommunityGames = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchLiveHamsterCommunityGames();
      if (res.games.length > 0) {
        setGames(res.games);
      }
      if (res.pageVisits) {
        setPageVisits(res.pageVisits);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCommunityGames();
    const unsub = subscribeLiveHamsterCommunityGames((liveList) => {
      setGames((prev) => {
        const map = new Map<string, any>();
        for (const g of prev) if (g?.id) map.set(String(g.id), g);
        for (const g of liveList) if (g?.id) map.set(String(g.id), g);
        return Array.from(map.values());
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Listen to postMessages from /bubble-sentence.html (Bubble Island iframe)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'QUIT_GAME') {
        setScreen('setup');
      } else if (e.data.type === 'IFRAME_READY') {
        if (iframeRef.current?.contentWindow && activeBubbleGame) {
          const payloadItems =
            activeBubbleGame.mode === 'multiple-choice'
              ? activeBubbleGame.questions.length > 0
                ? activeBubbleGame.questions
                : activeBubbleGame.sentences
              : activeBubbleGame.sentences;
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'LOAD_GAME',
              data: {
                ...activeBubbleGame,
                sentences: payloadItems,
                customSentences: payloadItems,
                customQuestions: activeBubbleGame.questions || [],
                theme: selectedTheme
              }
            },
            '*'
          );
        }
      } else if (e.data.type === 'BUBBLE_ISLAND_CORRECT') {
        // Award +5 Gems & +$5 Era Dollars per correct bubble/sentence in Bubble Island
        awardStudentWallet({
          userId: effectiveUid,
          dollarsDelta: 5,
          gemsDelta: 5,
          xpDelta: 15
        }).catch(() => {});
        if (onWalletReward && activeBubbleGame) {
          onWalletReward(5, 15, 5, `Bubble Island: ${activeBubbleGame.title}`);
        }
      } else if (e.data.type === 'BUBBLE_ISLAND_WIN') {
        // Completion bonus when finishing Bubble Island round
        const bonusDollars = 25;
        const bonusGems = 30;
        awardStudentWallet({
          userId: effectiveUid,
          dollarsDelta: bonusDollars,
          gemsDelta: bonusGems,
          xpDelta: 60
        }).catch(() => {});
        if (onWalletReward && activeBubbleGame) {
          onWalletReward(bonusGems, 60, bonusDollars, `Completed Bubble Island: ${activeBubbleGame.title}`);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeBubbleGame, selectedTheme, effectiveUid, onWalletReward]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const titleText = `${game.topic || ''} ${game.name || ''} ${game.title || ''}`.toLowerCase();
      const classText = `${game.classLevel || ''} ${game.className || ''}`.toLowerCase();
      const creatorText = (game.creatorName || '').toLowerCase();
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q || titleText.includes(q) || classText.includes(q) || creatorText.includes(q);

      let matchesLevel = true;
      if (selectedLevel !== 'all') {
        if (selectedLevel.startsWith('Global Success')) {
          matchesLevel = matchGameGlobalSuccess(game, selectedLevel);
        } else if (selectedLevel.startsWith('Grade ')) {
          const targetGrade = parseInt(selectedLevel.replace('Grade ', ''), 10);
          matchesLevel = extractGradeNumber(game) === targetGrade;
        } else {
          matchesLevel = extractCambridgeCourse(game) === (selectedLevel as CambridgeType);
        }
      }
      return matchesSearch && matchesLevel;
    });
  }, [games, searchTerm, selectedLevel]);

  const sortedGames = useMemo(() => {
    const list = [...filteredGames];
    switch (sortBy) {
      case 'latest':
        return list.sort((a, b) => getGameTime(b) - getGameTime(a));
      case 'grade-asc':
        return list.sort((a, b) => {
          const ga = extractGradeNumber(a) ?? 999;
          const gb = extractGradeNumber(b) ?? 999;
          if (ga !== gb) return ga - gb;
          const ca = getGameCambridgeRank(a);
          const cb = getGameCambridgeRank(b);
          if (ca !== cb) return ca - cb;
          return getGameTime(b) - getGameTime(a);
        });
      case 'cambridge-asc':
        return list.sort((a, b) => {
          const ca = getGameCambridgeRank(a);
          const cb = getGameCambridgeRank(b);
          if (ca !== cb) return ca - cb;
          const ga = extractGradeNumber(a) ?? 999;
          const gb = extractGradeNumber(b) ?? 999;
          if (ga !== gb) return ga - gb;
          return getGameTime(b) - getGameTime(a);
        });
      case 'questions-desc':
        return list.sort((a, b) => getGameQuestionCount(b) - getGameQuestionCount(a));
      case 'title-asc':
        return list.sort((a, b) => {
          const ta = (a.topic || a.name || a.title || '').toLowerCase();
          const tb = (b.topic || b.name || b.title || '').toLowerCase();
          return ta.localeCompare(tb);
        });
      case 'oldest':
        return list.sort((a, b) => getGameTime(a) - getGameTime(b));
      default:
        return list.sort((a, b) => getGameTime(b) - getGameTime(a));
    }
  }, [filteredGames, sortBy]);

  const handleSelectGameForBubbleIsland = (game: any) => {
    const adapted = adaptGameForBubbleIsland(game);
    setActiveBubbleGame(adapted);
    setStudyIndex(0);
    setScreen('setup');
  };

  // ============================================================================
  // SCREEN 2: BUBBLE ISLAND SETUP SCREEN (Play Game / Choose Theme / Study Mode)
  // ============================================================================
  if (screen === 'setup' && activeBubbleGame) {
    const themeBgClass =
      selectedTheme === 'theme-ocean'
        ? 'bg-gradient-to-b from-sky-600 to-cyan-600'
        : selectedTheme === 'theme-space'
        ? 'bg-gradient-to-b from-slate-900 to-indigo-950'
        : selectedTheme === 'theme-jungle'
        ? 'bg-gradient-to-b from-green-600 to-emerald-400'
        : selectedTheme === 'theme-sunset'
        ? 'bg-gradient-to-b from-orange-400 to-yellow-300'
        : 'bg-gradient-to-b from-sky-400 to-blue-200';

    const itemCount =
      activeBubbleGame.mode === 'multiple-choice'
        ? activeBubbleGame.questions.length
        : activeBubbleGame.sentences.length;

    return (
      <div
        className={`relative rounded-[28px] min-h-[580px] flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden transition-colors duration-700 ${themeBgClass}`}
      >
        {/* Top bar back to Community Hub */}
        <div className="w-full flex items-center justify-between gap-3 mb-6 relative z-20">
          <button
            type="button"
            onClick={() => setScreen('community')}
            className="px-5 py-2.5 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md text-white font-extrabold text-sm border border-white/40 flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Community Hub</span>
          </button>

          <div className="px-4 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md text-white text-xs font-extrabold border border-white/25">
            {activeBubbleGame.classLevel ? `${activeBubbleGame.classLevel} · ` : ''}
            {itemCount} Questions · Bubble Island
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
          <h2 className="text-4xl sm:text-6xl font-black mb-2 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] text-center tracking-tight">
            Bubble Island
          </h2>
          <p className="text-white/95 font-extrabold text-base sm:text-xl mb-8 text-center drop-shadow">
            {activeBubbleGame.title}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
            {/* Card 1: Play Bubble Island Game */}
            <button
              type="button"
              onClick={() => setScreen('game')}
              className="group relative rounded-[2.5rem] bg-white/25 hover:bg-white/35 backdrop-blur-md border-2 border-white/50 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center justify-between p-5 text-center"
            >
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border-2 border-white/60 mb-4 bg-sky-200">
                <img
                  src="/assets/aistudio/image_44bb8d05.png"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/bubble-island-card.jpg';
                  }}
                  alt="Bubble Island"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white drop-shadow-md flex items-center justify-center gap-2">
                  <Play className="w-6 h-6 fill-current" />
                  <span>Play Game</span>
                </h3>
                <p className="text-white/90 text-xs font-bold mt-1">
                  Start popping bubbles & earn 💎 Era Gems + 💵 Dollars!
                </p>
              </div>
            </button>

            {/* Card 2: Choose Theme */}
            <div className="rounded-[2.5rem] bg-white/20 backdrop-blur-md border-2 border-white/40 shadow-2xl p-6 flex flex-col justify-center">
              <h3 className="text-2xl font-black text-white mb-4 text-center drop-shadow-md">
                Choose Theme
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'theme-sky', name: 'Sky', icon: '☁️' },
                  { id: 'theme-ocean', name: 'Ocean', icon: '🌊' },
                  { id: 'theme-space', name: 'Space', icon: '🚀' },
                  { id: 'theme-jungle', name: 'Jungle', icon: '🌴' },
                  { id: 'theme-sunset', name: 'Sunset', icon: '🌅' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-sm font-extrabold text-sm cursor-pointer ${
                      selectedTheme === t.id
                        ? 'bg-white text-blue-600 border-2 border-blue-400 scale-105'
                        : 'bg-white/20 text-white border-2 border-transparent hover:bg-white/30'
                    }`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Study Mode */}
            <button
              type="button"
              onClick={() => {
                setStudyIndex(0);
                setScreen('study');
              }}
              className="group relative rounded-[2.5rem] bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="text-7xl mb-5 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">
                📖
              </div>
              <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">Study Mode</h3>
              <p className="text-white/90 text-sm font-bold">
                Review all {itemCount} questions & answers before playing!
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN 3: BUBBLE ISLAND STUDY MODE
  // ============================================================================
  if (screen === 'study' && activeBubbleGame) {
    const isMcq = activeBubbleGame.mode === 'multiple-choice' && activeBubbleGame.questions.length > 0;
    const totalCount = isMcq
      ? activeBubbleGame.questions.length
      : activeBubbleGame.sentences.length;
    const currentQ = isMcq ? activeBubbleGame.questions[studyIndex] : null;
    const currentS = !isMcq ? activeBubbleGame.sentences[studyIndex] : null;

    return (
      <div className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-10 min-h-[540px] flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setScreen('setup')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bubble Island</span>
          </button>

          <div className="text-slate-600 font-extrabold text-sm bg-slate-100 px-5 py-2 rounded-full font-mono">
            {studyIndex + 1} / {Math.max(1, totalCount)}
          </div>
        </div>

        <div className="my-auto py-8 flex flex-col items-center text-center max-w-3xl mx-auto w-full">
          {isMcq && currentQ ? (
            <>
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-4 py-1.5 rounded-full border border-sky-200 mb-4">
                Question {studyIndex + 1}
              </span>
              {currentQ.image && (
                <img
                  src={currentQ.image}
                  alt="Question"
                  className="max-h-44 object-contain rounded-2xl border border-slate-200 bg-white p-2 shadow-sm mb-4"
                />
              )}
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-6">
                {currentQ.text}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {currentQ.options.map((opt, oIdx) => {
                  const isCorrect = currentQ.answerIndex === oIdx;
                  return (
                    <div
                      key={oIdx}
                      className={`p-4 rounded-2xl flex items-center gap-3 font-bold border-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCorrect ? '✓' : String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1 text-sm sm:text-base">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              {currentS?.text || 'No item'}
            </h2>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={studyIndex <= 0}
            onClick={() => setStudyIndex((i) => Math.max(0, i - 1))}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-sm text-slate-700 cursor-pointer"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => setScreen('game')}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm cursor-pointer shadow-md"
          >
            🫧 Launch Bubble Island
          </button>
          <button
            type="button"
            disabled={studyIndex >= totalCount - 1}
            onClick={() => setStudyIndex((i) => Math.min(totalCount - 1, i + 1))}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 font-bold text-sm text-white cursor-pointer"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // SCREEN 4: ACTIVE BUBBLE ISLAND GAME (/bubble-sentence.html IFRAME)
  // ============================================================================
  if (screen === 'game' && activeBubbleGame) {
    return (
      <div className="relative w-full h-[74vh] min-h-[540px] rounded-[28px] overflow-hidden border-2 border-sky-300 shadow-2xl bg-sky-100">
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScreen('setup')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/85 hover:bg-slate-900 text-white rounded-full font-bold shadow-lg text-xs sm:text-sm cursor-pointer border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => setScreen('community')}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-700/90 hover:bg-purple-800 text-white rounded-full font-bold shadow-lg text-xs sm:text-sm cursor-pointer border border-white/20"
          >
            <span>Community Hub</span>
          </button>
        </div>

        <iframe
          ref={iframeRef}
          src="/bubble-sentence.html"
          className="w-full h-full border-0"
          title="Bubble Island"
          onLoad={() => {
            if (iframeRef.current?.contentWindow) {
              const payloadItems =
                activeBubbleGame.mode === 'multiple-choice'
                  ? activeBubbleGame.questions.length > 0
                    ? activeBubbleGame.questions
                    : activeBubbleGame.sentences
                  : activeBubbleGame.sentences;
              iframeRef.current.contentWindow.postMessage(
                {
                  type: 'LOAD_GAME',
                  data: {
                    ...activeBubbleGame,
                    sentences: payloadItems,
                    customSentences: payloadItems,
                    customQuestions: activeBubbleGame.questions || [],
                    theme: selectedTheme
                  }
                },
                '*'
              );
            }
          }}
        />
      </div>
    );
  }

  // ============================================================================
  // SCREEN 1: HAMSTERENGLISH.ONLINE COMMUNITY HUB (PLAY IN BUBBLE ISLAND)
  // ============================================================================
  const hasActiveFilters = Boolean(searchTerm || selectedLevel !== 'all');

  return (
    <div className="flex flex-col gap-6">
      {/* Community Hub Banner matching Screenshot 1 + Bubble Island Featured Badge */}
      <div className="bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] p-6 sm:p-7 rounded-[28px] shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/image_44bb8d05.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/bubble-island-card.jpg';
              }}
              alt="Bubble Island"
              className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl object-cover border-2 border-white/60 shadow-lg shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider mb-1">
                <span>🏝️ hamsterenglish.online · Bubble Island Edition</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black flex items-center gap-2.5 tracking-tight">
                <Users className="w-7 h-7 text-amber-300 shrink-0" />
                <span>Community Hub</span>
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium mt-1">
                {studentDetectedCourse !== 'all'
                  ? `Showing ${selectedLevel === 'all' ? 'All' : selectedLevel} games (matched to your ${studentDetectedCourse} course) — click any game to play in Bubble Island!`
                  : 'Discover and play Cambridge (Starters – IELTS) & Grade 1–12 games in Bubble Island!'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none">{pageVisits.toLocaleString()}</div>
                <div className="text-indigo-100 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                  Users
                </div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none">{games.length}</div>
                <div className="text-indigo-100 text-[11px] font-bold uppercase tracking-wider mt-0.5">
                  Public Games
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadCommunityGames}
              disabled={isRefreshing}
              title="Refresh Community Hub"
              className="w-11 h-11 bg-white/15 hover:bg-white/25 border border-white/25 rounded-2xl flex items-center justify-center text-white transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Control Center matching Screenshot 1 */}
      <div className="flex flex-col gap-3.5 bg-white p-5 rounded-3xl shadow-xs border border-slate-200/80">
        {/* Row 1: Search & Course Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="relative md:col-span-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search topics, game titles, class levels, or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-medium text-slate-800 placeholder:text-slate-400 text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative md:col-span-4">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-bold text-slate-700 cursor-pointer text-sm"
            >
              <option value="all">All Grades & Courses</option>
              <optgroup label="Cambridge Courses">
                {CAMBRIDGE_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="School Grades">
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Row 2: Sort Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
              Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                sortBy === 'latest'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔥 Latest Published
            </button>
            <button
              type="button"
              onClick={() => setSortBy('grade-asc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                sortBy === 'grade-asc'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎓 Grade 1 — 12
            </button>
            <button
              type="button"
              onClick={() => setSortBy('cambridge-asc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                sortBy === 'cambridge-asc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🏅 Cambridge (Starters — IELTS)
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('all');
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Courses</span>
            </button>
          )}
        </div>

        {/* Row 3: Cambridge, Grades & Global Success Filter Pills */}
        <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100">
          {/* Cambridge Course Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-500 shrink-0 flex items-center gap-1 min-w-[85px]">
              <Award className="w-3.5 h-3.5" /> Cambridge:
            </span>
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedLevel === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {CAMBRIDGE_COURSES.map((c) => {
              const isSelected = selectedLevel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedLevel(isSelected ? 'all' : c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200/60'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* School Grade Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 shrink-0 flex items-center gap-1 min-w-[85px]">
              <GraduationCap className="w-3.5 h-3.5" /> Grades:
            </span>
            {ALL_GRADES.map((grade) => {
              const isSelected = selectedLevel === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedLevel(isSelected ? 'all' : grade)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50/70 hover:bg-amber-100/80 text-amber-800 border-amber-200/60'
                  }`}
                >
                  {grade}
                </button>
              );
            })}
          </div>

          {/* Global Success Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 shrink-0 flex items-center gap-1 min-w-[85px]">
              <BookOpen className="w-3.5 h-3.5" /> Global Success:
            </span>
            {GLOBAL_SUCCESS_LEVELS.map((gs) => {
              const isSelected = selectedLevel === gs.id;
              return (
                <button
                  key={gs.id}
                  type="button"
                  onClick={() => setSelectedLevel(isSelected ? 'all' : gs.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200/60'
                  }`}
                >
                  {gs.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1 font-semibold">
        <div>
          Showing <span className="font-bold text-slate-800">{sortedGames.length}</span>{' '}
          {sortedGames.length === 1 ? 'game' : 'games'}
          {selectedLevel !== 'all' && (
            <span>
              {' '}
              in <span className="text-purple-700 font-bold">{selectedLevel}</span>
            </span>
          )}
          <span> · All playable in Bubble Island 🫧</span>
        </div>
        <div className="text-slate-400">
          Sorted by:{' '}
          <span className="text-slate-700 font-bold">
            {sortBy === 'latest'
              ? 'Latest Published'
              : sortBy === 'grade-asc'
              ? 'Grade (1 to 12)'
              : 'Cambridge (Starters to IELTS)'}
          </span>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-purple-600" />
          <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
            Loading hamsterenglish.online Community Hub...
          </p>
        </div>
      ) : sortedGames.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <p className="text-sm font-bold text-slate-600 mb-3">
            No games found matching {selectedLevel}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedLevel('all');
            }}
            className="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 cursor-pointer"
          >
            Show All Community Games
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedGames.map((game) => {
            const badge = getGameDisplayBadge(game);
            const itemCount = getGameQuestionCount(game);
            const creatorLabel = (game.creatorName || 'Teacher Jan').trim();
            const creatorInitial = creatorLabel.charAt(0).toUpperCase() || 'T';
            const isRecent =
              getGameTime(game) > Date.now() - 48 * 60 * 60 * 1000;

            return (
              <div
                key={game.id}
                onClick={() => handleSelectGameForBubbleIsland(game)}
                className="group bg-white rounded-[24px] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border border-slate-200/85 hover:border-sky-400 flex flex-col cursor-pointer relative"
              >
                {/* Thumbnail Preview */}
                <div className="aspect-[4/3] bg-slate-900 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                  <GameThumbnail
                    gameType={game.gameType || 'bubble-sentence-pro'}
                    info={{ title: 'Bubble Island' }}
                    game={game}
                  />
                  {/* Hover Play in Bubble Island Overlay */}
                  <div className="absolute inset-0 bg-slate-950/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-20">
                    <div className="px-4 py-2.5 bg-sky-500 text-white rounded-2xl flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform duration-200 shadow-lg font-extrabold text-xs sm:text-sm">
                      <Play className="fill-current w-4 h-4" />
                      <span>Play in Bubble Island</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/70 text-[11px] font-extrabold tracking-tight">
                        <Layers className="w-3 h-3 text-sky-600 shrink-0" />
                        <span>Bubble Island</span>
                        <span className="text-sky-300">·</span>
                        <span className="text-sky-700 shrink-0">{itemCount} Qs</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isRecent ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> New
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Your Game
                          </span>
                        )}
                        {badge && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold whitespace-nowrap border ${badge.badgeClass}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3
                      className="font-extrabold text-[15px] text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-sky-600 transition-colors"
                      title={game.topic || game.name || game.title}
                    >
                      {game.topic || game.name || game.title || 'Untitled Game'}
                    </h3>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black shrink-0">
                        {creatorInitial}
                      </div>
                      <span className="text-xs font-bold text-slate-600 truncate">
                        by {creatorLabel}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-sky-50 group-hover:bg-sky-500 text-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
