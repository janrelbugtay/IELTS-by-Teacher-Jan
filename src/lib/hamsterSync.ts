import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

export const HAMSTER_FIREBASE_CONFIG = {
  projectId: 'plucky-aegis-408915',
  appId: '1:564796706827:web:392d7514feecfd627f770e',
  apiKey: 'AIzaSyDZHL0cknHt3W6gkIUQD0f2L-w8ZPBqTRw',
  authDomain: 'plucky-aegis-408915.firebaseapp.com',
  storageBucket: 'plucky-aegis-408915.firebasestorage.app',
  messagingSenderId: '564796706827',
  firestoreDatabaseId: 'ai-studio-eslgamestudioai-3eb6c438-fab4-4cca-9a82-b91a4aede8f0'
};

export type CambridgeType = 'Starters' | 'Movers' | 'Flyers' | 'KET' | 'PET' | 'IELTS';

export type GradeType =
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12';

export const CAMBRIDGE_COURSES: { id: CambridgeType; label: string; badgeClass: string }[] = [
  {
    id: 'Starters',
    label: 'Starters',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  {
    id: 'Movers',
    label: 'Movers',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300'
  },
  {
    id: 'Flyers',
    label: 'Flyers',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300'
  },
  {
    id: 'KET',
    label: 'KET',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300'
  },
  {
    id: 'PET',
    label: 'PET',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-300'
  },
  {
    id: 'IELTS',
    label: 'IELTS',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300'
  }
];

export const ALL_GRADES: GradeType[] = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

export const GLOBAL_SUCCESS_LEVELS = [
  { id: 'Global Success 6', grade: 6, label: 'Global Success 6' },
  { id: 'Global Success 7', grade: 7, label: 'Global Success 7' },
  { id: 'Global Success 8', grade: 8, label: 'Global Success 8' },
  { id: 'Global Success 9', grade: 9, label: 'Global Success 9' },
  { id: 'Global Success 1-5', grade: null, label: 'Global Success 1–5' },
  { id: 'Global Success 10-12', grade: null, label: 'Global Success 10–12' }
];

export function mapStudentCourseToCambridge(rawCourse?: string | null): CambridgeType | 'all' {
  const val = String(rawCourse || '').trim().toLowerCase();
  if (!val) return 'all';
  if (val.includes('mover')) return 'Movers';
  if (val.includes('flyer')) return 'Flyers';
  if (val.includes('ket') || val.includes('a2')) return 'KET';
  if (val.includes('pet') || val.includes('b1')) return 'PET';
  if (val.includes('ielts')) return 'IELTS';
  if (val.includes('starter') || val.includes('pre')) return 'Starters';
  return 'all';
}

export function extractGradeNumber(game: any): number | null {
  if (!game) return null;
  const classText = `${game.classLevel || ''} ${game.className || ''}`.trim();
  const titleText = `${game.topic || ''} ${game.name || ''} ${game.title || ''}`.trim();

  if (/^0?([1-9]|1[0-2])$/.test(classText)) {
    return parseInt(classText, 10);
  }
  const classGradeMatch = classText.match(/\b(?:grade|gr\.?|class|lớp|lop|g)\s*0?([1-9]|1[0-2])\b/i);
  if (classGradeMatch) {
    return parseInt(classGradeMatch[1], 10);
  }
  const titleGradeMatch = titleText.match(/\b(?:grade|gr\.?|class|lớp|lop)\s*0?([1-9]|1[0-2])\b/i);
  if (titleGradeMatch) {
    return parseInt(titleGradeMatch[1], 10);
  }
  const curriculumMatch = titleText.match(
    /\b(?:global\s*success|gs|tiếng\s*anh|english|smart\s*start|smart\s*world|family\s*and\s*friends|friends\s*plus|i-?learn(?:\s*smart\s*(?:start|world))?|explore\s*(?:english|our\s*world)?|bright)\s*0?([1-9]|1[0-2])\b/i
  );
  if (curriculumMatch) {
    return parseInt(curriculumMatch[1], 10);
  }
  return null;
}

export function extractCambridgeCourse(game: any): CambridgeType | null {
  if (!game) return null;
  const classText = `${game.classLevel || ''} ${game.className || ''}`.toLowerCase();
  const titleText = `${game.topic || ''} ${game.name || ''} ${game.title || ''}`.toLowerCase();
  const combined = `${classText} ${titleText}`;

  if (/\b(?:ielts|b2|c1|c2)\b/i.test(combined)) return 'IELTS';
  if (/\b(?:pet\b|b1\s*preliminary\b|preliminary\s*english|\bb1\b)/i.test(combined)) return 'PET';
  if (/\b(?:ket\b|a2\s*key\b|key\s*english|\ba2\b)/i.test(combined)) return 'KET';
  if (/\b(?:flyers?|yle\s*flyers?|a2\s*flyers?)\b/i.test(combined)) return 'Flyers';
  if (/\b(?:movers?|yle\s*movers?|a1\s*movers?)\b/i.test(combined)) return 'Movers';
  if (/\b(?:pre[-\s]*starters?|starters?|yle\s*starters?|pre[-\s]*a1|pre[-\s]*k)\b/i.test(combined)) {
    return 'Starters';
  }
  return null;
}

export function matchGameGlobalSuccess(game: any, gsId: string): boolean {
  if (!game) return false;
  const combined = `${game.topic || ''} ${game.name || ''} ${game.title || ''} ${game.curriculum || ''} ${game.classLevel || ''} ${game.className || ''}`.toLowerCase();

  if (gsId === 'Global Success 6') {
    return (
      combined.includes('global success 6') ||
      combined.includes('gs 6') ||
      (combined.includes('global success') && extractGradeNumber(game) === 6) ||
      (extractGradeNumber(game) === 6 && combined.includes('tiếng anh 6'))
    );
  }
  if (gsId === 'Global Success 7') {
    return (
      combined.includes('global success 7') ||
      combined.includes('gs 7') ||
      (combined.includes('global success') && extractGradeNumber(game) === 7) ||
      (extractGradeNumber(game) === 7 && combined.includes('tiếng anh 7'))
    );
  }
  if (gsId === 'Global Success 8') {
    return (
      combined.includes('global success 8') ||
      combined.includes('gs 8') ||
      (combined.includes('global success') && extractGradeNumber(game) === 8) ||
      (extractGradeNumber(game) === 8 && combined.includes('tiếng anh 8'))
    );
  }
  if (gsId === 'Global Success 9') {
    return (
      combined.includes('global success 9') ||
      combined.includes('gs 9') ||
      (combined.includes('global success') && extractGradeNumber(game) === 9) ||
      (extractGradeNumber(game) === 9 && combined.includes('tiếng anh 9'))
    );
  }
  if (gsId === 'Global Success 1-5') {
    const gr = extractGradeNumber(game);
    return combined.includes('global success') && gr !== null && gr >= 1 && gr <= 5;
  }
  if (gsId === 'Global Success 10-12') {
    const gr = extractGradeNumber(game);
    return combined.includes('global success') && gr !== null && gr >= 10 && gr <= 12;
  }
  return combined.includes('global success');
}

export function getHamsterDb() {
  const appName = 'HamsterEnglishOnlineApp';
  const existing = getApps().find((a) => a.name === appName);
  const app =
    existing ||
    initializeApp(
      {
        projectId: HAMSTER_FIREBASE_CONFIG.projectId,
        appId: HAMSTER_FIREBASE_CONFIG.appId,
        apiKey: HAMSTER_FIREBASE_CONFIG.apiKey,
        authDomain: HAMSTER_FIREBASE_CONFIG.authDomain,
        storageBucket: HAMSTER_FIREBASE_CONFIG.storageBucket,
        messagingSenderId: HAMSTER_FIREBASE_CONFIG.messagingSenderId
      },
      appName
    );
  return initializeFirestore(
    app,
    { ignoreUndefinedProperties: true },
    HAMSTER_FIREBASE_CONFIG.firestoreDatabaseId
  );
}

export async function fetchCachedHamsterCommunityGames(): Promise<{
  games: any[];
  pageVisits: number;
}> {
  try {
    const res = await fetch('/hamster-community-cache.json');
    if (res.ok) {
      const data = await res.json();
      return {
        games: Array.isArray(data.games) ? data.games : [],
        pageVisits: typeof data.pageVisits === 'number' ? data.pageVisits : 779
      };
    }
  } catch {
    // ignore
  }
  return { games: [], pageVisits: 779 };
}

export async function fetchLiveHamsterCommunityGames(): Promise<{
  games: any[];
  pageVisits: number;
}> {
  const cached = await fetchCachedHamsterCommunityGames();
  const gamesMap = new Map<string, any>();
  for (const g of cached.games) {
    if (g && g.id) gamesMap.set(String(g.id), g);
  }
  let pageVisits = cached.pageVisits || 779;

  try {
    const remoteDb = getHamsterDb();
    try {
      const qBool = query(collection(remoteDb, 'mysteryBoxGames'), where('isPublic', '==', true));
      const snap = await getDocs(qBool);
      snap.forEach((d) => {
        gamesMap.set(d.id, { id: d.id, ...d.data() });
      });
    } catch {
      // fallback to cached
    }

    try {
      const settingsSnap = await getDoc(doc(remoteDb, 'settings', 'general'));
      if (settingsSnap.exists() && settingsSnap.data()?.pageVisits) {
        pageVisits = Number(settingsSnap.data().pageVisits) || pageVisits;
      }
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }

  return {
    games: Array.from(gamesMap.values()),
    pageVisits
  };
}

export function subscribeLiveHamsterCommunityGames(
  onUpdate: (games: any[]) => void
): () => void {
  try {
    const remoteDb = getHamsterDb();
    const qLive = query(collection(remoteDb, 'mysteryBoxGames'), where('isPublic', '==', true));
    return onSnapshot(
      qLive,
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        if (list.length > 0) onUpdate(list);
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}

export interface BubbleIslandQuestion {
  id: number | string;
  text: string;
  question?: string;
  image?: string;
  imageUrl?: string;
  options: string[];
  answerIndex: number;
  correct?: number;
}

export interface BubbleIslandSentence {
  id: number | string;
  text: string;
  image?: string;
  options?: string[];
  answerIndex?: number;
  emoji: string;
  diff: number;
}

export interface AdaptedBubbleIslandGame {
  id: string | number;
  title: string;
  topic: string;
  classLevel: string;
  creatorName: string;
  mode: 'word' | 'anagram' | 'multiple-choice';
  sentences: BubbleIslandSentence[];
  questions: BubbleIslandQuestion[];
}

/**
 * Converts ANY Community Hub game from hamsterenglish.online (`mysteryBoxGames`)
 * so it plays natively inside the Bubble Island game (`/bubble-sentence.html`).
 */
export function adaptGameForBubbleIsland(gameData: any): AdaptedBubbleIslandGame {
  const gameTitle = gameData?.topic || gameData?.name || gameData?.title || 'Bubble Island Quiz';
  const classLevel = gameData?.className || gameData?.classLevel || '';
  const creatorName = gameData?.creatorName || 'Community Teacher';

  const rawQuestions = gameData?.customQuestions || gameData?.questions || [];
  const rawSentences = gameData?.customSentences || gameData?.sentences || [];

  // If the game has MCQ questions, adapt them for Bubble Island multiple-choice mode
  if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
    const normalizedQuestions: BubbleIslandQuestion[] = rawQuestions.map((q: any, idx: number) => {
      const text = String(q?.text || q?.question || `Question ${idx + 1}`).trim();
      let options = Array.isArray(q?.options)
        ? q.options.filter((o: any) => typeof o === 'string' && o.trim() !== '')
        : Array.isArray(q?.answers)
        ? q.answers
            .filter((a: any) => a && typeof a.text === 'string' && a.text.trim() !== '')
            .map((a: any) => a.text)
        : [];
      let answerIndex =
        typeof q?.answerIndex === 'number'
          ? q.answerIndex
          : typeof q?.correctIndex === 'number'
          ? q.correctIndex
          : typeof q?.correctOptionIndex === 'number'
          ? q.correctOptionIndex
          : typeof q?.correct === 'number'
          ? q.correct
          : 0;

      if (options.length < 2) {
        options = ['True', 'False'];
        answerIndex = 0;
      }
      if (answerIndex < 0 || answerIndex >= options.length) {
        answerIndex = 0;
      }

      return {
        id: q?.id || idx + 1,
        text,
        question: text,
        options,
        answerIndex,
        correct: answerIndex,
        ...(q?.image || q?.imageUrl ? { image: q.image || q.imageUrl, imageUrl: q.image || q.imageUrl } : {})
      };
    });

    const mcqSentences: BubbleIslandSentence[] = normalizedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      image: q.image,
      options: q.options,
      answerIndex: q.answerIndex,
      emoji: '🫧',
      diff: 1
    }));

    return {
      id: gameData?.id || Date.now(),
      title: gameTitle,
      topic: gameTitle,
      classLevel,
      creatorName,
      mode: 'multiple-choice',
      sentences: mcqSentences,
      questions: normalizedQuestions
    };
  }

  // Otherwise use customSentences (word or anagram mode on Bubble Island)
  if (Array.isArray(rawSentences) && rawSentences.length > 0) {
    const gMode = gameData?.mode === 'anagram' ? 'anagram' : 'word';
    const cleanSentences: BubbleIslandSentence[] = rawSentences.map((s: any, idx: number) => ({
      id: s?.id || idx + 1,
      text: String(s?.text || s?.sentence || '').trim(),
      image: s?.image || s?.imageUrl,
      emoji: s?.emoji || '✨',
      diff: typeof s?.diff === 'number' ? s.diff : 1
    }));

    return {
      id: gameData?.id || Date.now(),
      title: gameTitle,
      topic: gameTitle,
      classLevel,
      creatorName,
      mode: gMode,
      sentences: cleanSentences,
      questions: []
    };
  }

  // Fallback questions
  const fallbackQuestions: BubbleIslandQuestion[] = [
    {
      id: 1,
      text: 'Which sentence is grammatically correct?',
      options: [
        "She doesn't like apples.",
        "She don't like apples.",
        'She not like apples.',
        "She isn't like apples."
      ],
      answerIndex: 0
    }
  ];

  return {
    id: gameData?.id || Date.now(),
    title: gameTitle,
    topic: gameTitle,
    classLevel,
    creatorName,
    mode: 'multiple-choice',
    sentences: fallbackQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      answerIndex: q.answerIndex,
      emoji: '🫧',
      diff: 1
    })),
    questions: fallbackQuestions
  };
}
