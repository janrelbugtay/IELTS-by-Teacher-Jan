import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Fish, GraduationCap, Sparkles, X } from 'lucide-react';
import {
  ESL_COURSES,
  NATIVE_COURSE_DECKS,
  normalizeCourseLevel,
  playGameSfx
} from '../data/eraGamesCourseDecks';
import {
  adaptGameForBubbleIsland,
  extractCambridgeCourse,
  fetchLiveHamsterCommunityGames
} from '../lib/hamsterSync';
import type { EslCourseLevel, GameQuestion as GameQuestionItem } from '../types';

export interface FishSpeciesSpec {
  id: string;
  name: string;
  rarity: 'Trash' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  price: number; // $0 for Trash, $1 to $10 Era Dollars for Fish
  xpReward: number;
  emoji: string;
  hexColor: number;
  badgeClass: string;
  chanceWeight: number;
  isTrash?: boolean;
}

export const ERA_FISH_CATALOG: FishSpeciesSpec[] = [
  {
    id: 'trash-boot',
    name: 'Old Muddy Boot',
    rarity: 'Trash',
    price: 0,
    xpReward: 0,
    emoji: '🥾',
    hexColor: 0x78350f,
    badgeClass: 'bg-slate-200 text-slate-600 border-slate-400',
    chanceWeight: 7,
    isTrash: true
  },
  {
    id: 'trash-can',
    name: 'Rusty Tin Can',
    rarity: 'Trash',
    price: 0,
    xpReward: 0,
    emoji: '🥫',
    hexColor: 0x64748b,
    badgeClass: 'bg-slate-200 text-slate-600 border-slate-400',
    chanceWeight: 7,
    isTrash: true
  },
  {
    id: 'trash-seaweed',
    name: 'Tangled Seaweed',
    rarity: 'Trash',
    price: 0,
    xpReward: 0,
    emoji: '🌿',
    hexColor: 0x15803d,
    badgeClass: 'bg-slate-200 text-slate-600 border-slate-400',
    chanceWeight: 6,
    isTrash: true
  },
  {
    id: 'trash-bottle',
    name: 'Plastic Bottle',
    rarity: 'Trash',
    price: 0,
    xpReward: 0,
    emoji: '🧴',
    hexColor: 0x94a3b8,
    badgeClass: 'bg-slate-200 text-slate-600 border-slate-400',
    chanceWeight: 6,
    isTrash: true
  },
  {
    id: 'fish-sardine',
    name: 'Silver Sardine',
    rarity: 'Common',
    price: 1,
    xpReward: 15,
    emoji: '🐟',
    hexColor: 0x38bdf8,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    chanceWeight: 18
  },
  {
    id: 'fish-clownfish',
    name: 'Coral Clownfish',
    rarity: 'Common',
    price: 2,
    xpReward: 20,
    emoji: '🐠',
    hexColor: 0xf97316,
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-300',
    chanceWeight: 18
  },
  {
    id: 'fish-tang',
    name: 'Blue Tang',
    rarity: 'Uncommon',
    price: 3,
    xpReward: 25,
    emoji: '🐟',
    hexColor: 0x2563eb,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300',
    chanceWeight: 15
  },
  {
    id: 'fish-angelfish',
    name: 'Emerald Butterflyfish',
    rarity: 'Uncommon',
    price: 4,
    xpReward: 30,
    emoji: '🐠',
    hexColor: 0x10b981,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    chanceWeight: 13
  },
  {
    id: 'fish-snapper',
    name: 'Red Snapper',
    rarity: 'Rare',
    price: 5,
    xpReward: 40,
    emoji: '🐟',
    hexColor: 0xef4444,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    chanceWeight: 11
  },
  {
    id: 'fish-puffer',
    name: 'Golden Puffer',
    rarity: 'Rare',
    price: 6,
    xpReward: 45,
    emoji: '🐡',
    hexColor: 0xeab308,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    chanceWeight: 9
  },
  {
    id: 'fish-mahimahi',
    name: 'Mahi-Mahi',
    rarity: 'Epic',
    price: 7,
    xpReward: 55,
    emoji: '🐠',
    hexColor: 0x06b6d4,
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-300',
    chanceWeight: 6
  },
  {
    id: 'fish-tuna',
    name: 'Yellowfin Tuna',
    rarity: 'Epic',
    price: 8,
    xpReward: 65,
    emoji: '🐟',
    hexColor: 0x4f46e5,
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    chanceWeight: 5
  },
  {
    id: 'fish-marlin',
    name: 'Royal Blue Marlin',
    rarity: 'Epic',
    price: 9,
    xpReward: 80,
    emoji: '🦈',
    hexColor: 0x9333ea,
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    chanceWeight: 3
  },
  {
    id: 'fish-koi',
    name: 'Golden Dragon Koi',
    rarity: 'Legendary',
    price: 10,
    xpReward: 100,
    emoji: '🐉',
    hexColor: 0xf59e0b,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-400',
    chanceWeight: 2
  }
];

export function pickRandomCaughtFish(): FishSpeciesSpec {
  const totalW = ERA_FISH_CATALOG.reduce((sum, item) => sum + item.chanceWeight, 0);
  let roll = Math.random() * totalW;
  for (const fish of ERA_FISH_CATALOG) {
    roll -= fish.chanceWeight;
    if (roll <= 0) return fish;
  }
  return ERA_FISH_CATALOG[0];
}

// Curated, clean, high-quality course questions per level (no unnecessary filler text)
const CURATED_FISHING_QUESTIONS: Record<EslCourseLevel, GameQuestionItem[]> = {
  'Pre-Starter': [
    {
      id: 'ps-fish-1',
      prompt: 'What color is the sun?',
      options: ['Yellow', 'Purple', 'Black', 'Pink'],
      correctIndex: 0
    },
    {
      id: 'ps-fish-2',
      prompt: 'How many eyes do you have?',
      options: ['Two', 'Five', 'Ten', 'Eight'],
      correctIndex: 0
    },
    {
      id: 'ps-fish-3',
      prompt: 'Which animal says "Meow"?',
      options: ['Cat', 'Dog', 'Duck', 'Cow'],
      correctIndex: 0
    },
    {
      id: 'ps-fish-4',
      prompt: 'Which one is a fruit?',
      options: ['Apple', 'Chair', 'Book', 'Pencil'],
      correctIndex: 0
    },
    {
      id: 'ps-fish-5',
      prompt: 'What number comes after 4?',
      options: ['5', '2', '8', '9'],
      correctIndex: 0
    }
  ],
  Starter: [
    {
      id: 'st-fish-1',
      prompt: 'Fish swim in the _____.',
      options: ['sea', 'tree', 'desk', 'shoe'],
      correctIndex: 0
    },
    {
      id: 'st-fish-2',
      prompt: 'She _____ eating an ice cream on the beach.',
      options: ['is', 'are', 'am', 'be'],
      correctIndex: 0
    },
    {
      id: 'st-fish-3',
      prompt: 'We wear _____ on our feet.',
      options: ['shoes', 'hats', 'glasses', 'gloves'],
      correctIndex: 0
    },
    {
      id: 'st-fish-4',
      prompt: 'How _____ apples are in the basket?',
      options: ['many', 'much', 'long', 'old'],
      correctIndex: 0
    },
    {
      id: 'st-fish-5',
      prompt: 'My brother _____ football every Saturday.',
      options: ['plays', 'playing', 'play', 'played'],
      correctIndex: 0
    }
  ],
  Movers: [
    {
      id: 'mv-fish-1',
      prompt: 'A dolphin is _____ than a crab.',
      options: ['bigger', 'biggest', 'big', 'more big'],
      correctIndex: 0
    },
    {
      id: 'mv-fish-2',
      prompt: 'Yesterday, we _____ to the beach with our teacher.',
      options: ['went', 'go', 'goes', 'going'],
      correctIndex: 0
    },
    {
      id: 'mv-fish-3',
      prompt: 'You use a _____ to catch fish.',
      options: ['fishing pole', 'toothbrush', 'blanket', 'pillow'],
      correctIndex: 0
    },
    {
      id: 'mv-fish-4',
      prompt: 'Where _____ you go last weekend?',
      options: ['did', 'do', 'does', 'are'],
      correctIndex: 0
    },
    {
      id: 'mv-fish-5',
      prompt: 'It was raining, _____ we stayed inside the classroom.',
      options: ['so', 'because', 'or', 'than'],
      correctIndex: 0
    }
  ],
  Flyers: [
    {
      id: 'fl-fish-1',
      prompt: 'Have you _____ seen a whale in the ocean?',
      options: ['ever', 'yet', 'since', 'for'],
      correctIndex: 0
    },
    {
      id: 'fl-fish-2',
      prompt: 'If it is sunny tomorrow, we _____ go fishing at the pier.',
      options: ['will', 'would', 'did', 'had'],
      correctIndex: 0
    },
    {
      id: 'fl-fish-3',
      prompt: 'The wooden pier was _____ by local builders last year.',
      options: ['built', 'build', 'building', 'builds'],
      correctIndex: 0
    },
    {
      id: 'fl-fish-4',
      prompt: 'She has studied English _____ three years.',
      options: ['for', 'since', 'during', 'from'],
      correctIndex: 0
    },
    {
      id: 'fl-fish-5',
      prompt: 'While I was walking along the beach, I _____ a seashell.',
      options: ['found', 'find', 'finding', 'finds'],
      correctIndex: 0
    }
  ],
  KET: [
    {
      id: 'ket-fish-1',
      prompt: 'You _____ bring your own fishing pole; you can borrow one here.',
      options: ["don't have to", 'must not', 'cannot', 'should not'],
      correctIndex: 0
    },
    {
      id: 'ket-fish-2',
      prompt: 'The train to the coast leaves _____ 8:30 a.m.',
      options: ['at', 'on', 'in', 'by'],
      correctIndex: 0
    },
    {
      id: 'ket-fish-3',
      prompt: 'There are only a _____ fish left in the bucket.',
      options: ['few', 'little', 'much', 'bit'],
      correctIndex: 0
    },
    {
      id: 'ket-fish-4',
      prompt: 'Could you tell me _____ the Fish Market opens?',
      options: ['when', 'what', 'which', 'who'],
      correctIndex: 0
    },
    {
      id: 'ket-fish-5',
      prompt: 'This beach is much _____ than the city center.',
      options: ['quieter', 'more quiet', 'quietest', 'quiet'],
      correctIndex: 0
    }
  ],
  PET: [
    {
      id: 'pet-fish-1',
      prompt: 'Despite _____ early, they did not catch the first ferry.',
      options: ['leaving', 'left', 'they left', 'to leave'],
      correctIndex: 0
    },
    {
      id: 'pet-fish-2',
      prompt: 'If I _____ more bait, I would stay at the pier all afternoon.',
      options: ['had', 'have', 'will have', 'would have'],
      correctIndex: 0
    },
    {
      id: 'pet-fish-3',
      prompt: 'The teacher reminded the students _____ their homework before Friday.',
      options: ['to finish', 'finishing', 'finish', 'finished'],
      correctIndex: 0
    },
    {
      id: 'pet-fish-4',
      prompt: 'Marine reefs must be protected _____ future generations can enjoy them.',
      options: ['so that', 'in order', 'although', 'unless'],
      correctIndex: 0
    },
    {
      id: 'pet-fish-5',
      prompt: 'By the time the sunset began, we _____ ten fish.',
      options: ['had caught', 'have caught', 'catch', 'are catching'],
      correctIndex: 0
    }
  ],
  IELTS: [
    {
      id: 'ielts-fish-1',
      prompt: 'Sustainable fishing policies are essential to prevent the _____ of marine ecosystems.',
      options: ['depletion', 'expansion', 'abundance', 'innovation'],
      correctIndex: 0
    },
    {
      id: 'ielts-fish-2',
      prompt: 'Not only _____ carbon emissions, but coastal mangroves also shelter young fish.',
      options: ['do they absorb', 'they absorb', 'absorb they', 'are they absorb'],
      correctIndex: 0
    },
    {
      id: 'ielts-fish-3',
      prompt: 'The research findings provide _____ evidence that ocean temperatures are rising.',
      options: ['compelling', 'reluctant', 'ambiguous', 'trivial'],
      correctIndex: 0
    },
    {
      id: 'ielts-fish-4',
      prompt: '_____ strict regulations, overfishing remains a challenge in international waters.',
      options: ['Notwithstanding', 'Whereas', 'Consequently', 'Furthermore'],
      correctIndex: 0
    },
    {
      id: 'ielts-fish-5',
      prompt: 'A significant proportion of coastal residents rely _____ fisheries for their livelihood.',
      options: ['predominantly on', 'exclusively at', 'consistently with', 'substantially to'],
      correctIndex: 0
    }
  ]
};

function cleanQuestionPrompt(text: string): string {
  return text
    .replace(/_{3,}/g, '_____')
    .replace(/^(Question\s*\d+\s*[:.-]\s*)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveAutoCourse(rawCourse?: string | null, rawCohort?: string | null): EslCourseLevel {
  const combined = `${rawCourse || ''} ${rawCohort || ''}`.trim().toLowerCase();
  if (!combined) return 'IELTS';
  if (combined.includes('pre-starter') || combined.includes('pre starter')) return 'Pre-Starter';
  if (combined.includes('starter')) return 'Starter';
  if (combined.includes('mover')) return 'Movers';
  if (combined.includes('flyer')) return 'Flyers';
  if (combined.includes('ket') || combined.includes('a2')) return 'KET';
  if (combined.includes('pet') || combined.includes('b1')) return 'PET';
  if (combined.includes('ielts') || combined.includes('teacher') || combined.includes('admin')) {
    return 'IELTS';
  }
  return normalizeCourseLevel(combined);
}

interface EraFishingClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCourse?: string | null;
  studentCohort?: string | null;
  userId?: string | null;
  isAdmin?: boolean;
  baitCount: number;
  onUpdateBaitCount: (nextBait: number) => void;
  eraDollars: number;
  eraGems: number;
  onEarnDollars: (dollarsAdded: number, xpAdded: number, summaryText: string) => void;
  onCastFishingPoleIn3D?: () => void;
  onOpenEraShop?: () => void;
}

export const EraFishingClubModal: React.FC<EraFishingClubModalProps> = ({
  isOpen,
  onClose,
  studentCourse,
  studentCohort,
  baitCount,
  onUpdateBaitCount,
  eraDollars,
  onCastFishingPoleIn3D
}) => {
  const autoDetectedCourse = useMemo(
    () => resolveAutoCourse(studentCourse, studentCohort),
    [studentCourse, studentCohort]
  );

  const [activeCourse, setActiveCourse] = useState<EslCourseLevel>(autoDetectedCourse);
  const [communityQuestionsByCourse, setCommunityQuestionsByCourse] = useState<
    Record<string, GameQuestionItem[]>
  >({});

  useEffect(() => {
    setActiveCourse(autoDetectedCourse);
  }, [autoDetectedCourse]);

  // Load live EraGames questions by class level
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    fetchLiveHamsterCommunityGames()
      .then((res) => {
        if (!mounted) return;
        const games = Array.isArray(res) ? res : res?.games || [];
        const grouped: Record<string, GameQuestionItem[]> = {};
        for (const g of games) {
          const cam = extractCambridgeCourse(g);
          const adapted = adaptGameForBubbleIsland(g);
          if (adapted.questions && adapted.questions.length > 0) {
            const targetLevels: EslCourseLevel[] =
              cam === 'Starters' ? ['Pre-Starter', 'Starter'] : [cam as EslCourseLevel];
            targetLevels.forEach((lvl) => {
              if (!grouped[lvl]) grouped[lvl] = [];
              adapted.questions.forEach((q, idx) => {
                const cleaned = cleanQuestionPrompt(q.text || '');
                if (
                  cleaned.length >= 8 &&
                  q.options &&
                  q.options.length >= 3 &&
                  q.options.every((o) => String(o).trim().length > 0)
                ) {
                  grouped[lvl].push({
                    id: `live-${g.id}-${idx}`,
                    prompt: cleaned,
                    options: q.options.slice(0, 4).map((o) => String(o).trim()),
                    correctIndex: q.answerIndex
                  });
                }
              });
            });
          }
        }
        setCommunityQuestionsByCourse(grouped);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Build clean question pool for the active course
  const questionPool = useMemo<GameQuestionItem[]>(() => {
    const curated = CURATED_FISHING_QUESTIONS[activeCourse] || [];
    const nativeDecks = NATIVE_COURSE_DECKS.filter((d) => d.course === activeCourse);
    const nativeQs = nativeDecks
      .flatMap((d) => d.questions)
      .map((q) => ({
        ...q,
        prompt: cleanQuestionPrompt(q.prompt)
      }));
    const liveQs = communityQuestionsByCourse[activeCourse] || [];
    const combined = [...curated, ...nativeQs, ...liveQs];
    return combined.length > 0 ? combined : CURATED_FISHING_QUESTIONS.IELTS;
  }, [activeCourse, communityQuestionsByCourse]);

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const shuffledIndices = useMemo(() => {
    const arr = questionPool.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [questionPool]);

  const currentQuestion = useMemo<GameQuestionItem | null>(() => {
    if (questionPool.length === 0) return null;
    const idx = shuffledIndices[questionIndex % shuffledIndices.length] ?? 0;
    return questionPool[idx] || questionPool[0];
  }, [questionPool, shuffledIndices, questionIndex]);

  const displayedOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const entries = currentQuestion.options.map((text, origIdx) => ({
      text,
      isCorrect: origIdx === currentQuestion.correctIndex
    }));
    const seedStr = `${currentQuestion.id}-${questionIndex}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) | 0;
    }
    for (let i = entries.length - 1; i > 0; i--) {
      hash = (hash * 1664525 + 1013904223) | 0;
      const j = Math.abs(hash) % (i + 1);
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return entries;
  }, [currentQuestion, questionIndex]);

  const handleSelectQuizAnswer = (optIdx: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;
    setSelectedOption(optIdx);
    setIsAnswerSubmitted(true);

    const chosen = displayedOptions[optIdx];
    if (chosen?.isCorrect) {
      playGameSfx('correct');
      onUpdateBaitCount(baitCount + 2);
    } else {
      playGameSfx('wrong');
    }
  };

  const handleNextQuestion = () => {
    playGameSfx('tick');
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuestionIndex((prev) => prev + 1);
  };

  if (!isOpen) return null;

  const isChosenCorrect =
    isAnswerSubmitted && selectedOption !== null && displayedOptions[selectedOption]?.isCorrect;
  const correctOptionText = displayedOptions.find((o) => o.isCorrect)?.text || '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Clean, minimal header */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-600 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎣</span>
            <h2 className="text-lg font-black tracking-tight">Fishing Bait Quiz</h2>
            <div className="flex items-center gap-1.5 bg-slate-950/30 border border-white/20 rounded-xl px-2.5 py-1">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-200" />
              <select
                value={activeCourse}
                onChange={(e) => {
                  setActiveCourse(e.target.value as EslCourseLevel);
                  setSelectedOption(null);
                  setIsAnswerSubmitted(false);
                  setQuestionIndex(0);
                }}
                className="bg-transparent text-xs font-extrabold text-white focus:outline-hidden cursor-pointer"
              >
                {ESL_COURSES.map((c) => (
                  <option key={c} value={c} className="text-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-950/35 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-sm">🪱</span>
              <span className="text-sm font-black">{baitCount} Bait</span>
            </div>

            <div className="bg-slate-950/35 border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-sm">💵</span>
              <span className="text-sm font-black">${eraDollars.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Question Area — No unnecessary words */}
        <div className="p-6">
          {currentQuestion && (
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug mb-5">
                {currentQuestion.prompt}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedOptions.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx] || 'A';
                  const isSelected = selectedOption === idx;
                  let btnStyle =
                    'bg-slate-50 hover:bg-cyan-50/70 text-slate-800 border-slate-200 hover:border-cyan-400';

                  if (isAnswerSubmitted) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-400/40';
                    } else if (isSelected && !opt.isCorrect) {
                      btnStyle = 'bg-rose-50 text-rose-900 border-rose-400';
                    } else {
                      btnStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-65';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                          isAnswerSubmitted && opt.isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswerSubmitted && isSelected && !opt.isCorrect
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="font-bold text-sm">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Result & Action Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div>
                  {isAnswerSubmitted ? (
                    isChosenCorrect ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Correct! +2 Bait 🪱 (Total: {baitCount} Bait)</span>
                      </div>
                    ) : (
                      <div className="text-rose-600 font-extrabold text-sm">
                        Answer: {correctOptionText}
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      Correct answer = +2 Bait 🪱
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {baitCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onCastFishingPoleIn3D) {
                          onCastFishingPoleIn3D();
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🎣 Cast Fishing Pole ({baitCount} 🪱)</span>
                    </button>
                  )}

                  {isAnswerSubmitted && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer"
                    >
                      Next Question →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compact $0 Trash & $1-$10 Fish Price Strip */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Fish className="w-3.5 h-3.5 text-cyan-600" />
                Fish ($1 – $10) & Trash ($0)
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cast pole at the beach to catch fish
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {ERA_FISH_CATALOG.map((fish) => (
                <div
                  key={fish.id}
                  className={`px-2.5 py-1.5 rounded-xl border shrink-0 flex items-center gap-1.5 ${
                    fish.isTrash
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-sm">{fish.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-700">{fish.name}</span>
                  <span
                    className={`text-[11px] font-black px-1.5 py-0.5 rounded-md border ${
                      fish.isTrash
                        ? 'text-rose-700 bg-rose-100 border-rose-300'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    ${fish.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EraFishingClubModal;
