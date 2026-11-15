import { doc, getDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EslCourseLevel, GameDeck } from '../types';

export const ESL_COURSES: EslCourseLevel[] = [
  'Pre-Starter',
  'Starter',
  'Movers',
  'Flyers',
  'KET',
  'PET',
  'IELTS'
];

export function normalizeCourseLevel(raw?: string | null): EslCourseLevel {
  const val = String(raw || '').trim().toLowerCase();
  if (!val) return 'Starter';
  if (val.includes('pre')) return 'Pre-Starter';
  if (val.includes('starter')) return 'Starter';
  if (val.includes('mover')) return 'Movers';
  if (val.includes('flyer')) return 'Flyers';
  if (val.includes('ket') || val.includes('a2')) return 'KET';
  if (val.includes('pet') || val.includes('b1')) return 'PET';
  if (val.includes('ielts')) return 'IELTS';
  return 'Starter';
}

export const COURSE_META: Record<
  EslCourseLevel,
  {
    cefr: string;
    subtitle: string;
    accentBg: string;
    accentText: string;
    border: string;
  }
> = {
  'Pre-Starter': {
    cefr: 'Pre-A1',
    subtitle: 'Phonics, colors, numbers & first words',
    accentBg: 'bg-amber-600',
    accentText: 'text-amber-700',
    border: 'border-amber-200'
  },
  Starter: {
    cefr: 'Pre-A1+',
    subtitle: 'Everyday objects, animals, verbs & simple sentences',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  Movers: {
    cefr: 'A1',
    subtitle: 'Past simple, routines, weather & story clues',
    accentBg: 'bg-sky-600',
    accentText: 'text-sky-700',
    border: 'border-sky-200'
  },
  Flyers: {
    cefr: 'A2 Elementary',
    subtitle: 'Comparatives, travel, science words & tenses',
    accentBg: 'bg-violet-600',
    accentText: 'text-violet-700',
    border: 'border-violet-200'
  },
  KET: {
    cefr: 'A2 Key',
    subtitle: 'Phrasal verbs, functional dialogues & reading precision',
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  PET: {
    cefr: 'B1 Preliminary',
    subtitle: 'Conditionals, passive voice, idioms & collocations',
    accentBg: 'bg-teal-600',
    accentText: 'text-teal-700',
    border: 'border-teal-200'
  },
  IELTS: {
    cefr: 'B2–C2 Academic',
    subtitle: 'Academic Band 8+ lexis, cohesion & complex grammar',
    accentBg: 'bg-slate-900',
    accentText: 'text-slate-900',
    border: 'border-slate-300'
  }
};

export const NATIVE_COURSE_DECKS: GameDeck[] = [
  {
    id: 'deck-pre-starter-core',
    title: 'Pre-Starter First Words & Colors',
    description: 'Essential animals, colors, numbers, and classroom phrases for early learners.',
    course: 'Pre-Starter',
    mode: 'trivia',
    source: 'native',
    dollarReward: 20,
    gemReward: 30,
    questions: [
      {
        id: 'ps-1',
        prompt: 'Which animal says "meow"?',
        options: ['Cat', 'Duck', 'Cow', 'Frog'],
        correctIndex: 0,
        explanation: 'A cat says "meow".',
        topicTag: 'Animals',
        dollarValue: 5
      },
      {
        id: 'ps-2',
        prompt: 'What color is the daytime sky when there are no clouds?',
        options: ['Blue', 'Purple', 'Brown', 'Black'],
        correctIndex: 0,
        explanation: 'A clear daytime sky is blue.',
        topicTag: 'Colors',
        dollarValue: 5
      },
      {
        id: 'ps-3',
        prompt: 'How many fingers are on one hand?',
        options: ['Five', 'Two', 'Eight', 'Ten'],
        correctIndex: 0,
        explanation: 'There are five fingers on one hand.',
        topicTag: 'Numbers',
        dollarValue: 5
      },
      {
        id: 'ps-4',
        prompt: 'Which fruit is yellow and long?',
        options: ['Banana', 'Grape', 'Apple', 'Watermelon'],
        correctIndex: 0,
        explanation: 'A ripe banana is yellow and curved.',
        topicTag: 'Food',
        dollarValue: 5
      },
      {
        id: 'ps-5',
        prompt: 'Choose the right greeting in the morning:',
        options: ['Good morning!', 'Good night!', 'See you yesterday!', 'Happy sleep!'],
        correctIndex: 0,
        explanation: 'We say "Good morning!" when we wake up or arrive at school.',
        topicTag: 'Greetings',
        dollarValue: 5
      },
      {
        id: 'ps-6',
        prompt: 'What do you use to draw lines and write in class?',
        options: ['A pencil', 'A shoe', 'A pillow', 'A spoon'],
        correctIndex: 0,
        explanation: 'You write and draw with a pencil.',
        topicTag: 'Classroom',
        dollarValue: 5
      }
    ]
  },
  {
    id: 'deck-starter-core',
    title: 'Starters Everyday English & Toys',
    description: 'Action verbs, prepositions of place, family words, and starter sentences.',
    course: 'Starter',
    mode: 'board',
    source: 'native',
    dollarReward: 25,
    gemReward: 40,
    questions: [
      {
        id: 'st-1',
        prompt: 'Look! The cat is sleeping ___ the sofa.',
        options: ['on', 'between', 'underwater', 'at'],
        correctIndex: 0,
        explanation: 'Use "on" when resting on the surface of a sofa.',
        topicTag: 'Prepositions',
        dollarValue: 5
      },
      {
        id: 'st-2',
        prompt: 'Which word is the plural of "mouse"?',
        options: ['mice', 'mouses', 'mices', 'mouse'],
        correctIndex: 0,
        explanation: '"Mouse" has an irregular plural: "mice".',
        topicTag: 'Plurals',
        dollarValue: 5
      },
      {
        id: 'st-3',
        prompt: 'My sister ___ playing football in the garden.',
        options: ['is', 'are', 'am', 'be'],
        correctIndex: 0,
        explanation: 'Singular subject "My sister" takes "is".',
        topicTag: 'Present Continuous',
        dollarValue: 5
      },
      {
        id: 'st-4',
        prompt: 'Where do you brush your teeth every morning?',
        options: ['Bathroom', 'Kitchen', 'Garage', 'Playground'],
        correctIndex: 0,
        explanation: 'We brush our teeth in the bathroom.',
        topicTag: 'Rooms',
        dollarValue: 5
      },
      {
        id: 'st-5',
        prompt: 'Which transport travels on railway tracks?',
        options: ['Train', 'Boat', 'Helicopter', 'Bicycle'],
        correctIndex: 0,
        explanation: 'A train runs along railway tracks.',
        topicTag: 'Transport',
        dollarValue: 5
      },
      {
        id: 'st-6',
        prompt: '"___ you like ice cream?" — "Yes, I do!"',
        options: ['Do', 'Does', 'Is', 'Are'],
        correctIndex: 0,
        explanation: 'Questions with "you" + main verb use "Do".',
        topicTag: 'Grammar',
        dollarValue: 5
      },
      {
        id: 'st-7',
        prompt: 'Which animal can swim fast but cannot walk on land?',
        options: ['Dolphin', 'Elephant', 'Monkey', 'Giraffe'],
        correctIndex: 0,
        explanation: 'Dolphins live in the ocean and swim swiftly.',
        topicTag: 'Animals',
        dollarValue: 5
      },
      {
        id: 'st-8',
        prompt: 'Choose the opposite of "big":',
        options: ['small', 'tall', 'happy', 'fast'],
        correctIndex: 0,
        explanation: '"Small" is the opposite of "big".',
        topicTag: 'Adjectives',
        dollarValue: 5
      }
    ]
  },
  {
    id: 'deck-movers-core',
    title: 'Movers Adventures & Past Tense',
    description: 'Irregular past verbs, comparatives, health vocabulary, and everyday stories.',
    course: 'Movers',
    mode: 'board',
    source: 'native',
    dollarReward: 30,
    gemReward: 45,
    questions: [
      {
        id: 'mv-1',
        prompt: 'Yesterday, Ben ___ his red kite in the park.',
        options: ['flew', 'fly', 'flying', 'flies'],
        correctIndex: 0,
        explanation: 'The past tense of "fly" is "flew".',
        topicTag: 'Past Simple',
        dollarValue: 5
      },
      {
        id: 'mv-2',
        prompt: 'A whale is ___ than a dolphin.',
        options: ['heavier', 'heavy', 'more heavy', 'heaviest'],
        correctIndex: 0,
        explanation: 'Adjectives ending in -y change to -ier for comparisons: heavier.',
        topicTag: 'Comparatives',
        dollarValue: 5
      },
      {
        id: 'mv-3',
        prompt: 'When you have a terrible toothache, you should visit the ___.',
        options: ['dentist', 'pilot', 'farmer', 'clown'],
        correctIndex: 0,
        explanation: 'A dentist checks and treats your teeth.',
        topicTag: 'Jobs & Health',
        dollarValue: 5
      },
      {
        id: 'mv-4',
        prompt: 'They ___ watching a cartoon when Dad came home.',
        options: ['were', 'was', 'is', 'did'],
        correctIndex: 0,
        explanation: 'Use "were" with the plural subject "They".',
        topicTag: 'Past Continuous',
        dollarValue: 5
      },
      {
        id: 'mv-5',
        prompt: 'Which word means the opposite of "whisper"?',
        options: ['shout', 'hide', 'climb', 'carry'],
        correctIndex: 0,
        explanation: 'To speak very loudly is to shout; very quietly is to whisper.',
        topicTag: 'Vocabulary',
        dollarValue: 5
      },
      {
        id: 'mv-6',
        prompt: 'Take an umbrella because it looks very ___ outside.',
        options: ['cloudy', 'sunny', 'dry', 'loud'],
        correctIndex: 0,
        explanation: 'Dark clouds mean rain may fall soon.',
        topicTag: 'Weather',
        dollarValue: 5
      },
      {
        id: 'mv-7',
        prompt: 'You ___ wear a helmet when riding your bike to stay safe.',
        options: ['must', 'mustn\'t', 'couldn\'t', 'aren\'t'],
        correctIndex: 0,
        explanation: '"Must" shows an important safety rule.',
        topicTag: 'Modals',
        dollarValue: 5
      },
      {
        id: 'mv-8',
        prompt: 'Which place has thousands of books you can borrow for free?',
        options: ['Library', 'Cinema', 'Supermarket', 'Station'],
        correctIndex: 0,
        explanation: 'A library lends books to readers.',
        topicTag: 'Town Places',
        dollarValue: 5
      }
    ]
  },
  {
    id: 'deck-flyers-core',
    title: 'Flyers Quest & Grammar Sprint',
    description: 'Present perfect, tag questions, materials, space & science vocabulary.',
    course: 'Flyers',
    mode: 'arena',
    source: 'native',
    dollarReward: 35,
    gemReward: 50,
    questions: [
      {
        id: 'fl-1',
        prompt: 'Have you ___ visited a science museum before?',
        options: ['ever', 'yet', 'ago', 'since'],
        correctIndex: 0,
        explanation: 'Use "ever" in present perfect questions about life experience.',
        topicTag: 'Present Perfect',
        dollarValue: 8
      },
      {
        id: 'fl-2',
        prompt: 'My bicycle frame is ___ metal, so it is strong.',
        options: ['made of', 'making by', 'made from of', 'built to'],
        correctIndex: 0,
        explanation: 'Use "made of" when the material itself can still be seen.',
        topicTag: 'Materials',
        dollarValue: 8
      },
      {
        id: 'fl-3',
        prompt: 'Sarah hasn\'t finished her project ___, so she is still typing.',
        options: ['yet', 'already', 'just', 'still'],
        correctIndex: 0,
        explanation: 'Use "yet" at the end of negative present perfect sentences.',
        topicTag: 'Adverbs',
        dollarValue: 8
      },
      {
        id: 'fl-4',
        prompt: 'An astronaut travels into space inside a ___.',
        options: ['rocket', 'submarine', 'ambulance', 'tractor'],
        correctIndex: 0,
        explanation: 'Rockets launch astronauts beyond Earth\'s atmosphere.',
        topicTag: 'Space',
        dollarValue: 8
      },
      {
        id: 'fl-5',
        prompt: 'If it snows tomorrow morning, we ___ build a giant snowman.',
        options: ['will', 'would', 'did', 'were'],
        correctIndex: 0,
        explanation: 'First conditional uses "If + present simple, ... will + base verb".',
        topicTag: 'Conditionals',
        dollarValue: 8
      },
      {
        id: 'fl-6',
        prompt: 'This suitcase is ___ heavy for me to lift on my own!',
        options: ['too', 'enough', 'much', 'many'],
        correctIndex: 0,
        explanation: '"Too + adjective + for + person + to verb" shows an excessive amount.',
        topicTag: 'Structures',
        dollarValue: 8
      },
      {
        id: 'fl-7',
        prompt: 'What do we call a person who writes news stories for a newspaper?',
        options: ['Journalist', 'Mechanic', 'Waiter', 'Engineer'],
        correctIndex: 0,
        explanation: 'A journalist investigates and writes news articles.',
        topicTag: 'Occupations',
        dollarValue: 8
      },
      {
        id: 'fl-8',
        prompt: 'The museum opens at 9:00 a.m. every day, ___ it?',
        options: ['doesn\'t', 'isn\'t', 'hasn\'t', 'didn\'t'],
        correctIndex: 0,
        explanation: 'Positive present simple third-person singular ("opens") takes negative tag "doesn\'t it?".',
        topicTag: 'Tag Questions',
        dollarValue: 8
      }
    ]
  },
  {
    id: 'deck-ket-core',
    title: 'KET A2 Key Real-Life Challenge',
    description: 'Cambridge A2 Key functional dialogues, signs, quantifiers, and phrasal verbs.',
    course: 'KET',
    mode: 'trivia',
    source: 'native',
    dollarReward: 40,
    gemReward: 60,
    questions: [
      {
        id: 'ket-1',
        prompt: 'Notice: "HALF-PRICE TICKETS FOR STUDENTS UNDER 18 ONLY". Who gets a discount?',
        options: ['A 16-year-old high school pupil', 'A 22-year-old university student', 'Any adult with an ID card', 'Children over 18'],
        correctIndex: 0,
        explanation: '"Under 18 only" applies strictly to students aged 17 or younger.',
        topicTag: 'Reading Signs',
        dollarValue: 10
      },
      {
        id: 'ket-2',
        prompt: 'Could you please ___ the volume down? I\'m revising for a test.',
        options: ['turn', 'take', 'get', 'put'],
        correctIndex: 0,
        explanation: '"Turn down" means lower the volume or sound level.',
        topicTag: 'Phrasal Verbs',
        dollarValue: 10
      },
      {
        id: 'ket-3',
        prompt: 'There isn\'t ___ milk left in the fridge for breakfast.',
        options: ['much', 'many', 'few', 'several'],
        correctIndex: 0,
        explanation: '"Milk" is uncountable, so use "much" in negatives.',
        topicTag: 'Quantifiers',
        dollarValue: 10
      },
      {
        id: 'ket-4',
        prompt: 'I\'m really looking forward ___ our school trip next Friday.',
        options: ['to going on', 'to go on', 'for go on', 'at going'],
        correctIndex: 0,
        explanation: '"Look forward to" takes a noun or -ing gerund.',
        topicTag: 'Collocations',
        dollarValue: 10
      },
      {
        id: 'ket-5',
        prompt: '"How long have you lived in this neighborhood?" — "___ 2021."',
        options: ['Since', 'For', 'During', 'From'],
        correctIndex: 0,
        explanation: 'Use "since" with a starting point in time (2021).',
        topicTag: 'Time Expressions',
        dollarValue: 10
      },
      {
        id: 'ket-6',
        prompt: 'Don\'t forget to ___ your flight two hours before departure.',
        options: ['check in for', 'look after', 'give up', 'break into'],
        correctIndex: 0,
        explanation: 'Passengers "check in" at the airport counter or online.',
        topicTag: 'Travel',
        dollarValue: 10
      },
      {
        id: 'ket-7',
        prompt: 'My brother is very keen ___ playing badminton after school.',
        options: ['on', 'in', 'with', 'about'],
        correctIndex: 0,
        explanation: 'The adjective "keen" pairs with the preposition "on".',
        topicTag: 'Prepositions',
        dollarValue: 10
      },
      {
        id: 'ket-8',
        prompt: 'Either Leo or Mia ___ going to bring the speaker tomorrow.',
        options: ['is', 'are', 'were', 'be'],
        correctIndex: 0,
        explanation: 'With "either ... or", the verb agrees with the nearest subject ("Mia").',
        topicTag: 'Agreement',
        dollarValue: 10
      }
    ]
  },
  {
    id: 'deck-pet-core',
    title: 'PET B1 Preliminary Mastery',
    description: 'B1 conditionals, passive voice, reported speech, and natural idioms.',
    course: 'PET',
    mode: 'board',
    source: 'native',
    dollarReward: 45,
    gemReward: 65,
    questions: [
      {
        id: 'pet-1',
        prompt: 'If I ___ more free time this semester, I would join the debate club.',
        options: ['had', 'have', 'would have', 'will have'],
        correctIndex: 0,
        explanation: 'Second conditional uses past simple ("had") in the if-clause for unreal present situations.',
        topicTag: 'Conditionals',
        dollarValue: 10
      },
      {
        id: 'pet-2',
        prompt: 'The new community library ___ next autumn by the city council.',
        options: ['will be opened', 'will open by', 'is opening to', 'was open'],
        correctIndex: 0,
        explanation: 'Future passive voice follows "will be + past participle".',
        topicTag: 'Passive Voice',
        dollarValue: 10
      },
      {
        id: 'pet-3',
        prompt: 'Maria apologized ___ late for the group presentation.',
        options: ['for arriving', 'to arrive', 'that arriving', 'on arriving'],
        correctIndex: 0,
        explanation: 'We say "apologize for + -ing".',
        topicTag: 'Verb Patterns',
        dollarValue: 10
      },
      {
        id: 'pet-4',
        prompt: 'Although the hike was exhausting, the view from the summit was ___!',
        options: ['worth every step', 'cost nothing', 'pointless', 'ordinary'],
        correctIndex: 0,
        explanation: '"Worth every step" means the reward justified the effort.',
        topicTag: 'Idioms',
        dollarValue: 10
      },
      {
        id: 'pet-5',
        prompt: 'Tom asked me if I ___ seen his notebook anywhere in the classroom.',
        options: ['had', 'have', 'was', 'did'],
        correctIndex: 0,
        explanation: 'Reported speech shifts present perfect ("have seen") back to past perfect ("had seen").',
        topicTag: 'Reported Speech',
        dollarValue: 10
      },
      {
        id: 'pet-6',
        prompt: 'We need to ___ an eco-friendly solution before plastic waste worsens.',
        options: ['come up with', 'run out of', 'put off with', 'get away'],
        correctIndex: 0,
        explanation: '"Come up with" means invent or propose an idea/solution.',
        topicTag: 'Phrasal Verbs',
        dollarValue: 10
      },
      {
        id: 'pet-7',
        prompt: 'Wait here ___ the rain stops; otherwise you will get soaked.',
        options: ['until', 'unless', 'despite', 'while'],
        correctIndex: 0,
        explanation: '"Until" marks the point in time when waiting ends.',
        topicTag: 'Conjunctions',
        dollarValue: 10
      },
      {
        id: 'pet-8',
        prompt: 'I used to ___ nervous before speaking on stage, but practice helped.',
        options: ['feel', 'feeling', 'felt', 'to feel'],
        correctIndex: 0,
        explanation: '"Used to" for past habits is followed by the base infinitive ("feel").',
        topicTag: 'Used To',
        dollarValue: 10
      }
    ]
  },
  {
    id: 'deck-ielts-core',
    title: 'IELTS Band 8.0 Academic Arena',
    description: 'High-value Task 1/2 vocabulary, inversion, nominalization, and Band 8 collocations.',
    course: 'IELTS',
    mode: 'arena',
    source: 'native',
    dollarReward: 50,
    gemReward: 80,
    questions: [
      {
        id: 'ie-1',
        prompt: 'Which academic verb best improves "prices went up sharply" for IELTS Writing Task 1?',
        options: ['surged dramatically', 'climbed goodly', 'went upper fast', 'rose bigly'],
        correctIndex: 0,
        explanation: '"Surged dramatically" conveys a rapid upward trend with Band 8 precision.',
        topicTag: 'Task 1 Lexis',
        dollarValue: 12
      },
      {
        id: 'ie-2',
        prompt: 'Choose the Band 8 inversion structure: "Not only ___ urban congestion, but it also cuts emissions."',
        options: ['does public transit alleviate', 'public transit alleviates', 'alleviates public transit', 'is public transit alleviate'],
        correctIndex: 0,
        explanation: 'Negative adverbials like "Not only" trigger auxiliary-subject inversion ("does public transit alleviate").',
        topicTag: 'Complex Grammar',
        dollarValue: 12
      },
      {
        id: 'ie-3',
        prompt: 'In an essay, what does "mitigate the adverse repercussions" mean?',
        options: ['Reduce the harmful effects', 'Accelerate negative consequences', 'Ignore statistical errors', 'Replace public infrastructure'],
        correctIndex: 0,
        explanation: '"Mitigate" means make less severe, and "adverse repercussions" means negative consequences.',
        topicTag: 'Task 2 Lexis',
        dollarValue: 12
      },
      {
        id: 'ie-4',
        prompt: 'Select the error-free Task 1 comparison:',
        options: [
          'Regarding rye bread, its price remained the lowest throughout the period.',
          'With rye bread, it was the one remained the cheapest.',
          'Rye bread cost was more lower than another breads.',
          'Between 2001 and 2005, rye price stablized around 0.6 euros.'
        ],
        correctIndex: 0,
        explanation: 'Clear topic framing ("Regarding...") paired with accurate tense and superlative ("the lowest") avoids comma splices and omitted relative pronouns.',
        topicTag: 'Grammatical Accuracy',
        dollarValue: 12
      },
      {
        id: 'ie-5',
        prompt: 'Which linker correctly introduces a contrasting clause followed by a noun phrase?',
        options: ['Despite the initial surge,', 'Although the initial surge,', 'However the initial surge,', 'Whereas the initial surge,'],
        correctIndex: 0,
        explanation: '"Despite" is a preposition and precedes a noun phrase; "Although" and "Whereas" require full subject+verb clauses.',
        topicTag: 'Cohesion',
        dollarValue: 12
      },
      {
        id: 'ie-6',
        prompt: 'What is the closest academic synonym for "ubiquitous"?',
        options: ['Omnipresent across daily life', 'Prohibitively expensive', 'Economically stagnant', 'Temporarily suspended'],
        correctIndex: 0,
        explanation: '"Ubiquitous" describes something found everywhere at once.',
        topicTag: 'Academic Vocabulary',
        dollarValue: 12
      },
      {
        id: 'ie-7',
        prompt: 'Identify the accurate hedging sentence suitable for Band 8 Task 2:',
        options: [
          'Targeted subsidies could incentivize households to adopt renewable heating.',
          'Subsidies definitely always force 100% of every person to buy solar forever.',
          'Government must do money for green house because bad air.',
          'There have many reasons why pollution is happen.'
        ],
        correctIndex: 0,
        explanation: 'Modal hedging ("could incentivize") avoids sweeping overgeneralizations.',
        topicTag: 'Academic Tone',
        dollarValue: 12
      },
      {
        id: 'ie-8',
        prompt: 'In 2003, Wholegrain bread plummeted ___ 1.8 euros ___ 1.0 euro.',
        options: ['from ... to', 'between ... at', 'since ... until', 'up ... down'],
        correctIndex: 0,
        explanation: 'State start and end figures for trends using "from X to Y".',
        topicTag: 'Task 1 Prepositions',
        dollarValue: 12
      }
    ]
  }
];

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
      sharedAudioCtx = new AudioCtor();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playGameSfx(kind: 'dice' | 'correct' | 'wrong' | 'win' | 'tick' | 'join') {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number, type: OscillatorType = 'triangle', gainPeak = 0.08) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    if (kind === 'correct') {
      playTone(523.25, now, 0.14);
      playTone(659.25, now + 0.09, 0.18);
      playTone(783.99, now + 0.18, 0.24);
    } else if (kind === 'wrong') {
      playTone(260, now, 0.16, 'sawtooth', 0.06);
      playTone(195, now + 0.12, 0.22, 'sawtooth', 0.05);
    } else if (kind === 'dice') {
      playTone(340, now, 0.06, 'square', 0.04);
      playTone(430, now + 0.06, 0.06, 'square', 0.04);
      playTone(560, now + 0.12, 0.09, 'triangle', 0.06);
    } else if (kind === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => playTone(f, now + idx * 0.09, 0.28));
    } else if (kind === 'join') {
      playTone(587.33, now, 0.12);
      playTone(880, now + 0.08, 0.18);
    } else if (kind === 'tick') {
      playTone(720, now, 0.05, 'sine', 0.03);
    }
  } catch {
    // Audio playback optional
  }
}

export async function awardStudentWallet(options: {
  userId?: string | null;
  dollarsDelta: number;
  gemsDelta?: number;
  xpDelta?: number;
}): Promise<{ nextDollars: number; nextGems: number }> {
  const { userId, dollarsDelta, gemsDelta = 0, xpDelta = 0 } = options;
  const uid = userId || (typeof window !== 'undefined' ? localStorage.getItem('studentUid') : null) || '';

  let nextDollars = Math.max(0, dollarsDelta);
  let nextGems = Math.max(0, gemsDelta);

  if (typeof window !== 'undefined') {
    const prevDollars = parseInt(localStorage.getItem('eraverse_dollars_v2') || '0', 10) || 0;
    const prevGems = parseInt(localStorage.getItem('eraverse_gems_v2') || '0', 10) || 0;
    nextDollars = Math.max(0, prevDollars + dollarsDelta);
    nextGems = Math.max(0, prevGems + gemsDelta);
    try {
      localStorage.setItem('eraverse_dollars_v2', String(nextDollars));
      localStorage.setItem('eraverse_gems_v2', String(nextGems));
    } catch {
      // ignore storage quota errors
    }
  }

  if (uid && !uid.startsWith('ielts')) {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      const existingData = snap.exists() ? snap.data() : {};
      const currentDollars =
        typeof existingData?.dollars === 'number'
          ? existingData.dollars
          : typeof existingData?.eraDollars === 'number'
          ? existingData.eraDollars
          : typeof existingData?.eraverseAvatar?.eraDollars === 'number'
          ? existingData.eraverseAvatar.eraDollars
          : 0;
      const currentGems =
        typeof existingData?.eraGems === 'number'
          ? existingData.eraGems
          : typeof existingData?.gems === 'number'
          ? existingData.gems
          : typeof existingData?.points === 'number'
          ? existingData.points
          : 0;

      nextDollars = Math.max(0, currentDollars + dollarsDelta);
      nextGems = Math.max(0, currentGems + gemsDelta);

      const updates: Record<string, any> = {
        dollars: dollarsDelta !== 0 ? increment(dollarsDelta) : currentDollars,
        eraDollars: dollarsDelta !== 0 ? increment(dollarsDelta) : currentDollars,
        updatedAt: Date.now()
      };
      if (gemsDelta !== 0) {
        updates.eraGems = increment(gemsDelta);
        updates.gems = increment(gemsDelta);
      }
      if (xpDelta !== 0) {
        updates.xp = increment(xpDelta);
      }
      await setDoc(userRef, updates, { merge: true });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eraverse_dollars_v2', String(nextDollars));
          localStorage.setItem('eraverse_gems_v2', String(nextGems));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Wallet sync warning:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('eraverse-wallet-updated', {
        detail: { uid, dollars: nextDollars, gems: nextGems, dollarsDelta, gemsDelta }
      })
    );
  }

  return { nextDollars, nextGems };
}
