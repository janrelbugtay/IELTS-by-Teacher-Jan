export type FacultyDepartmentId =
  | 'head_admin'
  | 'cambridge_specialists'
  | 'skill_examiners'
  | 'creative_teaching';

export type FacultyEmployeeStatus =
  | 'working'
  | 'walking'
  | 'collaborating'
  | 'awaiting_approval'
  | 'celebrating'
  | 'idle';

export type FacultyTaskStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Awaiting Approval'
  | 'Needs Revision'
  | 'Approved';

export type FacultyTaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type ExamProfileId =
  | 'cambridge_starters'
  | 'cambridge_movers'
  | 'cambridge_flyers'
  | 'cambridge_ket'
  | 'cambridge_pet'
  | 'ielts_academic'
  | 'ielts_general';

export type ExamSkillType = 'Reading' | 'Listening' | 'Writing' | 'Speaking';

export type CreativeToolId =
  | 'mcq'
  | 'fill_blank'
  | 'vocab_worksheet'
  | 'grammar_worksheet'
  | 'reading_comp'
  | 'listening_exercise'
  | 'speaking_questions'
  | 'ielts_writing_task'
  | 'ppt_lesson'
  | 'flashcards'
  | 'classroom_game'
  | 'lesson_plan';

export interface FacultyEmployeeProfile {
  id: string;
  name: string;
  jobTitle: string;
  department: FacultyDepartmentId;
  departmentLabel: string;
  floor: 1 | 2;
  deskX: number;
  deskZ: number;
  personality: string;
  responsibilities: string;
  specializedCapabilities: string[];
  speechBubbles: string[];
  defaultExamProfile?: ExamProfileId;
  defaultSkill?: ExamSkillType;
  defaultCreativeTool?: CreativeToolId;
  // 3D Avatar appearance
  shirtColor: string;
  hairColor: string;
  skinColor: string;
  hatType: string;
  accessoryType: string;
  gender: 'boy' | 'girl';
  hairStyle: string;
  clothingType: string;
  pantsColor: string;
  beltType: string;
  // Live state & gamification
  status: FacultyEmployeeStatus;
  currentTaskTitle: string;
  xp: number;
  level: number;
  tasksCompleted: number;
  approvalRate: number;
  gemsEarnedForSchool: number;
  dollarsEarnedForSchool: number;
}

export interface ExamRubricCriterion {
  id: string;
  name: string;
  scaleLabel: string;
  maxScore: number;
  description: string;
}

export interface ExamProfileSpec {
  id: ExamProfileId;
  name: string;
  shortName: string;
  cefrLevel: string;
  scoringSystem: 'cambridge_shields' | 'cambridge_scale' | 'ielts_bands';
  scoreRangeLabel: string;
  accentColor: string;
  specialistEmployeeId: string;
  courseMapping: 'Starter' | 'Movers' | 'Flyers' | 'KET' | 'PET' | 'IELTS';
  rubricNotes: string;
  writingCriteria: ExamRubricCriterion[];
  speakingCriteria: ExamRubricCriterion[];
}

export interface FacultyTaskItem {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  coordinatorId: string;
  department: FacultyDepartmentId;
  taskCategory: 'exam_assessment' | 'content_generation' | 'batch_assessment' | 'admin_report';
  examProfile?: ExamProfileId;
  skill?: ExamSkillType;
  creativeTool?: CreativeToolId;
  cefrLevel?: string;
  status: FacultyTaskStatus;
  priority: FacultyTaskPriority;
  targetStudentId?: string;
  targetStudentName?: string;
  targetCohort?: string;
  batchCount?: number;
  inputPayload: {
    promptOrQuestion?: string;
    studentResponseText?: string;
    answerKeyText?: string;
    uploadedFileName?: string;
    uploadedMimeType?: string;
    topic?: string;
    questionCount?: number;
    difficulty?: string;
  };
  outputResult?: {
    summaryScoreLabel: string;
    numericScore: number;
    maxNumericScore: number;
    cefrEstimate: string;
    criteriaBreakdown: Array<{
      criterion: string;
      score: string;
      feedback: string;
    }>;
    extractedTextOcrOrTranscript?: string;
    inlineCorrectionsOrMarking?: string;
    strengths: string[];
    weaknesses: string[];
    examinerReportMarkdown: string;
    suggestedImprovementOrModelAnswer?: string;
    generatedQuestions?: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
    generatedSlides?: Array<{
      slideNumber: number;
      title: string;
      bullets: string[];
      speakerNotes: string;
    }>;
    generatedFlashcards?: Array<{
      front: string;
      back: string;
      example: string;
    }>;
  };
  rewardGems: number;
  rewardDollars: number;
  rewardXp: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  approvedBy?: string;
  approvedAt?: number;
  revisionNotes?: string;
}

export interface FacultyApprovalLog {
  id: string;
  taskId: string;
  taskTitle: string;
  employeeId: string;
  employeeName: string;
  action: 'approved' | 'needs_revision' | 'reassigned';
  actorName: string;
  actorRole: string;
  notes: string;
  scoreLabel?: string;
  studentName?: string;
  timestamp: number;
}

export interface FacultyNotification {
  id: string;
  title: string;
  message: string;
  employeeId: string;
  employeeName: string;
  taskId?: string;
  type: 'completion' | 'approval_needed' | 'batch_routed' | 'gamification';
  read: boolean;
  timestamp: number;
}

export interface OfficeDecorationItem {
  id: string;
  name: string;
  description: string;
  floor: 1 | 2;
  costGems: number;
  costDollars: number;
  unlocked: boolean;
  xpBonusPercent: number;
}

export interface FacultyMissionItem {
  id: string;
  title: string;
  type: 'daily' | 'weekly';
  targetCount: number;
  currentCount: number;
  rewardGems: number;
  rewardDollars: number;
  rewardXp: number;
  completed: boolean;
}

export const EXAM_PROFILES: ExamProfileSpec[] = [
  {
    id: 'cambridge_starters',
    name: 'Cambridge Pre-A1 Starters',
    shortName: 'Starters',
    cefrLevel: 'Pre-A1',
    scoringSystem: 'cambridge_shields',
    scoreRangeLabel: '1 to 5 Cambridge Shields (🛡️)',
    accentColor: '#0EA5E9',
    specialistEmployeeId: 'emp_starters',
    courseMapping: 'Starter',
    rubricNotes:
      'Cambridge Young Learners Pre-A1 Starters rubric (1–5 Shields per skill). Evaluates basic word recognition, picture-word matching, spelling of simple nouns, and short spoken responses. NEVER use IELTS bands.',
    writingCriteria: [
      { id: 'word_spelling', name: 'Spelling & Letter Formation', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Accuracy of single-word spelling from picture prompts.' },
      { id: 'sentence_comprehension', name: 'Yes/No & 1-Word Answers', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Correctness of short picture-based answers.' }
    ],
    speakingCriteria: [
      { id: 'lexical_recognition', name: 'Vocabulary & Object Naming', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Naming everyday objects, animals, colors, and numbers.' },
      { id: 'interactive_response', name: 'Prompt Comprehension & Pronunciation', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Following simple instructions and answering basic personal questions.' }
    ]
  },
  {
    id: 'cambridge_movers',
    name: 'Cambridge A1 Movers',
    shortName: 'Movers',
    cefrLevel: 'A1',
    scoringSystem: 'cambridge_shields',
    scoreRangeLabel: '1 to 5 Cambridge Shields (🛡️)',
    accentColor: '#F97316',
    specialistEmployeeId: 'emp_movers',
    courseMapping: 'Movers',
    rubricNotes:
      'Cambridge Young Learners A1 Movers rubric (1–5 Shields per skill). Evaluates simple sentences, Part 6 picture description writing, story sequencing, and "find the difference" speaking. NEVER use IELTS bands.',
    writingCriteria: [
      { id: 'phrase_completion', name: 'Sentence & Phrase Completion', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Completing sentences about a scene accurately.' },
      { id: 'short_sentences', name: 'Independent Sentence Production', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Writing two complete, intelligible sentences about a picture.' },
      { id: 'grammar_spelling', name: 'A1 Grammar & Spelling', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Present continuous, simple past, and basic prepositions.' }
    ],
    speakingCriteria: [
      { id: 'story_diffs', name: 'Describing Differences & Picture Story', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Identifying differences and narrating a 4-picture story.' },
      { id: 'pronunciation_fluency', name: 'A1 Pronunciation & Interactive Ease', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Clear articulation and natural response to examiner questions.' }
    ]
  },
  {
    id: 'cambridge_flyers',
    name: 'Cambridge A2 Flyers',
    shortName: 'Flyers',
    cefrLevel: 'A2',
    scoringSystem: 'cambridge_shields',
    scoreRangeLabel: '1 to 5 Cambridge Shields (🛡️)',
    accentColor: '#10B981',
    specialistEmployeeId: 'emp_flyers',
    courseMapping: 'Flyers',
    rubricNotes:
      'Cambridge Young Learners A2 Flyers rubric (1–5 Shields per skill). Evaluates Part 7 three-picture short story writing (20+ words), open cloze grammar, and information-exchange speaking. NEVER use IELTS bands.',
    writingCriteria: [
      { id: 'story_content', name: 'Three-Picture Story Content', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Covers all three pictures clearly in 20+ words.' },
      { id: 'narrative_cohesion', name: 'Story Linking & Connectors', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Uses then, after that, because, and when naturally.' },
      { id: 'language_accuracy', name: 'A2 Grammar & Vocabulary Range', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Past tenses, modals, and descriptive vocabulary.' }
    ],
    speakingCriteria: [
      { id: 'info_exchange', name: 'Information Exchange & Question Formation', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Asking and answering Wh- questions accurately.' },
      { id: 'story_narration', name: '5-Picture Story Narration', scaleLabel: '1–5 Shields', maxScore: 5, description: 'Connected narrative delivery and pronunciation.' }
    ]
  },
  {
    id: 'cambridge_ket',
    name: 'Cambridge A2 Key (KET)',
    shortName: 'A2 Key (KET)',
    cefrLevel: 'A2',
    scoringSystem: 'cambridge_scale',
    scoreRangeLabel: 'Cambridge Scale 100–150 (Sub-scores 0–5)',
    accentColor: '#E11D48',
    specialistEmployeeId: 'emp_ket',
    courseMapping: 'KET',
    rubricNotes:
      'Official Cambridge A2 Key (KET) rubric. Writing (Part 6 Email 25+ words, Part 7 Picture Story 35+ words) is marked 0–5 on Content, Organisation, and Language (total /15 per part, mapped to Cambridge Scale 100–150). NEVER use IELTS bands.',
    writingCriteria: [
      { id: 'content', name: 'Content', scaleLabel: '0–5', maxScore: 5, description: 'All three content points addressed clearly so the target reader is fully informed.' },
      { id: 'organisation', name: 'Organisation', scaleLabel: '0–5', maxScore: 5, description: 'Text is connected using basic, high-frequency linking words (and, but, because, so).' },
      { id: 'language', name: 'Language', scaleLabel: '0–5', maxScore: 5, description: 'Everyday A2 vocabulary and simple grammatical forms used with good control.' }
    ],
    speakingCriteria: [
      { id: 'grammar_vocab', name: 'Grammar and Vocabulary', scaleLabel: '0–5', maxScore: 5, description: 'Control of simple grammatical forms and appropriate A2 vocabulary.' },
      { id: 'pronunciation', name: 'Pronunciation', scaleLabel: '0–5', maxScore: 5, description: 'Intelligible intonation, word stress, and individual sounds.' },
      { id: 'interactive_comm', name: 'Interactive Communication', scaleLabel: '0–5', maxScore: 5, description: 'Maintains simple exchanges and collaborative discussion.' }
    ]
  },
  {
    id: 'cambridge_pet',
    name: 'Cambridge B1 Preliminary (PET)',
    shortName: 'B1 Preliminary (PET)',
    cefrLevel: 'B1',
    scoringSystem: 'cambridge_scale',
    scoreRangeLabel: 'Cambridge Scale 120–170 (Sub-scores 0–5)',
    accentColor: '#0D9488',
    specialistEmployeeId: 'emp_pet',
    courseMapping: 'PET',
    rubricNotes:
      'Official Cambridge B1 Preliminary (PET) rubric. Writing (Part 1 Email 100 words, Part 2 Article or Story 100 words) is marked 0–5 across Content, Communicative Achievement, Organisation, and Language (/20 total, mapped to Cambridge Scale 120–170). NEVER use IELTS bands.',
    writingCriteria: [
      { id: 'content', name: 'Content', scaleLabel: '0–5', maxScore: 5, description: 'All content is relevant to the task and the target reader is fully informed.' },
      { id: 'comm_achievement', name: 'Communicative Achievement', scaleLabel: '0–5', maxScore: 5, description: 'Uses the conventions of the communicative task (email, article, or story) to hold the reader’s attention.' },
      { id: 'organisation', name: 'Organisation', scaleLabel: '0–5', maxScore: 5, description: 'Text is generally well-organized and coherent, using a variety of B1 linking words and cohesive devices.' },
      { id: 'language', name: 'Language', scaleLabel: '0–5', maxScore: 5, description: 'Uses a range of everyday vocabulary and simple/some complex B1 grammatical forms with good control.' }
    ],
    speakingCriteria: [
      { id: 'grammar_vocab', name: 'Grammar and Vocabulary', scaleLabel: '0–5', maxScore: 5, description: 'Good degree of control of simple grammatical forms and appropriate B1 vocabulary.' },
      { id: 'discourse_mgmt', name: 'Discourse Management', scaleLabel: '0–5', maxScore: 5, description: 'Extended stretches of language with very little hesitation and relevant contributions.' },
      { id: 'pronunciation', name: 'Pronunciation', scaleLabel: '0–5', maxScore: 5, description: 'Clear intelligibility, intonation, and stress.' },
      { id: 'interactive_comm', name: 'Interactive Communication', scaleLabel: '0–5', maxScore: 5, description: 'Initiates and responds appropriately in collaborative tasks.' }
    ]
  },
  {
    id: 'ielts_academic',
    name: 'IELTS Academic',
    shortName: 'IELTS Academic',
    cefrLevel: 'B1–C2',
    scoringSystem: 'ielts_bands',
    scoreRangeLabel: 'Band 0.0 to 9.0 (0.5 increments)',
    accentColor: '#4F46E5',
    specialistEmployeeId: 'emp_ielts',
    courseMapping: 'IELTS',
    rubricNotes:
      'Official IELTS Academic 0–9 Band Descriptors. Writing evaluates Task Achievement (Task 1 data/chart/process) or Task Response (Task 2 essay), Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.',
    writingCriteria: [
      { id: 'ta_tr', name: 'Task Achievement / Task Response', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Clear overview of main trends (Task 1) or fully developed position addressing all parts of the prompt (Task 2).' },
      { id: 'cc', name: 'Coherence and Cohesion', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Logical paragraph progression and natural use of cohesive devices.' },
      { id: 'lr', name: 'Lexical Resource', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Wide range of academic vocabulary, collocations, and accurate word choice.' },
      { id: 'gra', name: 'Grammatical Range and Accuracy', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Variety of complex structures with frequent error-free sentences.' }
    ],
    speakingCriteria: [
      { id: 'fc', name: 'Fluency and Coherence', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Speaks at length without noticeable effort or loss of coherence.' },
      { id: 'lr', name: 'Lexical Resource', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Uses vocabulary resource flexibly to discuss a variety of topics and idiomatic language.' },
      { id: 'gra', name: 'Grammatical Range and Accuracy', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Uses a range of complex structures flexibly and accurately.' },
      { id: 'pron', name: 'Pronunciation', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Uses a wide range of pronunciation features with sustained intelligibility.' }
    ]
  },
  {
    id: 'ielts_general',
    name: 'IELTS General Training',
    shortName: 'IELTS General',
    cefrLevel: 'B1–C2',
    scoringSystem: 'ielts_bands',
    scoreRangeLabel: 'Band 0.0 to 9.0 (0.5 increments)',
    accentColor: '#7C3AED',
    specialistEmployeeId: 'emp_ielts',
    courseMapping: 'IELTS',
    rubricNotes:
      'Official IELTS General Training 0–9 Band Descriptors. Task 1 evaluates letter writing (Formal, Semi-formal, Informal tone, purpose, and bullet coverage); Task 2 evaluates discursive essay writing.',
    writingCriteria: [
      { id: 'ta_tr', name: 'Task Achievement (Letter Tone & Bullets) / Task Response', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Clear purpose, consistent tone, and full coverage of all bullet points or essay prompt.' },
      { id: 'cc', name: 'Coherence and Cohesion', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Information and ideas arranged coherently with clear progression.' },
      { id: 'lr', name: 'Lexical Resource', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Natural vocabulary appropriate to formal or informal register.' },
      { id: 'gra', name: 'Grammatical Range and Accuracy', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Wide range of structures with high grammatical control.' }
    ],
    speakingCriteria: [
      { id: 'fc', name: 'Fluency and Coherence', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Smooth delivery and well-structured discourse across Parts 1, 2, and 3.' },
      { id: 'lr', name: 'Lexical Resource', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Precise vocabulary and natural idiomatic expressions.' },
      { id: 'gra', name: 'Grammatical Range and Accuracy', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Mix of simple and complex sentence forms with high accuracy.' },
      { id: 'pron', name: 'Pronunciation', scaleLabel: 'Band 0–9', maxScore: 9, description: 'Natural stress, rhythm, and intonation.' }
    ]
  }
];

export interface CreativeToolSpec {
  id: CreativeToolId;
  name: string;
  shortName: string;
  description: string;
  specialistEmployeeId: string;
  iconName: string;
  accentColor: string;
  supportsGamePublish: boolean;
  supportsHomeworkPublish: boolean;
}

export const CREATIVE_TEACHING_TOOLS: CreativeToolSpec[] = [
  {
    id: 'mcq',
    name: 'Multiple-Choice Question Generator',
    shortName: 'MCQ Generator',
    description: 'Generate 4-option multiple-choice questions with answer key, distractor rationale, and Bubble Island game export.',
    specialistEmployeeId: 'emp_quiz',
    iconName: 'CheckSquare',
    accentColor: '#2563EB',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'fill_blank',
    name: 'Fill-in-the-Blank Cloze Generator',
    shortName: 'Fill-in-the-Blank',
    description: 'Create contextual gap-fill sentences and word-bank passages tailored to any Cambridge or CEFR level.',
    specialistEmployeeId: 'emp_quiz',
    iconName: 'Edit3',
    accentColor: '#0284C7',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'vocab_worksheet',
    name: 'Vocabulary Worksheet Generator',
    shortName: 'Vocab Worksheet',
    description: 'Produce printable vocabulary matching, collocation drills, definition exercises, and sentence writing.',
    specialistEmployeeId: 'emp_vocab',
    iconName: 'BookOpen',
    accentColor: '#059669',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'grammar_worksheet',
    name: 'Grammar Worksheet Generator',
    shortName: 'Grammar Worksheet',
    description: 'Build targeted grammar rule summaries, error correction drills, and sentence transformation sheets.',
    specialistEmployeeId: 'emp_grammar',
    iconName: 'FileCheck',
    accentColor: '#0D9488',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'reading_comp',
    name: 'Reading Comprehension Generator',
    shortName: 'Reading Passage',
    description: 'Generate leveled reading passages with True/False/Not Given, multiple-choice, and short-answer questions.',
    specialistEmployeeId: 'emp_worksheet',
    iconName: 'FileText',
    accentColor: '#4F46E5',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'listening_exercise',
    name: 'Listening Exercise & Script Generator',
    shortName: 'Listening Lab',
    description: 'Create realistic dialogue/monologue audio scripts with comprehension questions and answer keys.',
    specialistEmployeeId: 'emp_listening',
    iconName: 'Headphones',
    accentColor: '#0891B2',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'speaking_questions',
    name: 'Speaking Prompt & Cue Card Generator',
    shortName: 'Speaking Prompts',
    description: 'Generate Part 1 interview questions, Part 2 cue cards, Part 3 discussion prompts, and Band 8 sample answers.',
    specialistEmployeeId: 'emp_speaking',
    iconName: 'Mic',
    accentColor: '#7C3AED',
    supportsGamePublish: false,
    supportsHomeworkPublish: true
  },
  {
    id: 'ielts_writing_task',
    name: 'IELTS & Cambridge Writing Task Generator',
    shortName: 'Writing Prompts',
    description: 'Create authentic Writing prompts, planning outlines, high-scoring vocabulary lists, and Band 8+ model essays.',
    specialistEmployeeId: 'emp_writing',
    iconName: 'PenTool',
    accentColor: '#D97706',
    supportsGamePublish: false,
    supportsHomeworkPublish: true
  },
  {
    id: 'ppt_lesson',
    name: 'PowerPoint Lesson Deck Creator',
    shortName: 'PowerPoint Slides',
    description: 'Design structured 8–12 slide classroom presentation decks with slide titles, visual cues, and teacher speaker notes.',
    specialistEmployeeId: 'emp_ppt',
    iconName: 'Presentation',
    accentColor: '#EA580C',
    supportsGamePublish: false,
    supportsHomeworkPublish: false
  },
  {
    id: 'flashcards',
    name: 'Interactive Flashcard Deck Creator',
    shortName: 'Flashcards',
    description: 'Build study flashcards with target term, phonetic guide, student-friendly definition, and example sentence.',
    specialistEmployeeId: 'emp_creative',
    iconName: 'Layers',
    accentColor: '#EC4899',
    supportsGamePublish: true,
    supportsHomeworkPublish: false
  },
  {
    id: 'classroom_game',
    name: 'Classroom & Bubble Island Game Creator',
    shortName: 'Bubble Island Game',
    description: 'Generate ready-to-play Bubble Island & EraGames question sets mapped directly to Starters, Movers, Flyers, KET, PET, or IELTS.',
    specialistEmployeeId: 'emp_gamedesigner',
    iconName: 'Gamepad2',
    accentColor: '#9333EA',
    supportsGamePublish: true,
    supportsHomeworkPublish: true
  },
  {
    id: 'lesson_plan',
    name: 'Full Classroom Lesson Plan Generator',
    shortName: 'Lesson Planner',
    description: 'Create 45, 60, or 90-minute PPP/TBL lesson plans with warm-up, guided practice, freer speaking, and homework.',
    specialistEmployeeId: 'emp_planner',
    iconName: 'Calendar',
    accentColor: '#16A34A',
    supportsGamePublish: false,
    supportsHomeworkPublish: false
  }
];

export const INITIAL_FACULTY_EMPLOYEES: FacultyEmployeeProfile[] = [
  // ==========================================================================
  // FLOOR 1: HEAD ADMINISTRATION (Center Executive Suite)
  // ==========================================================================
  {
    id: 'emp_teacher_jan',
    name: 'Teacher Jan',
    jobTitle: 'Head Administrator & Final Approval Authority',
    department: 'head_admin',
    departmentLabel: 'Head Administration',
    floor: 1,
    deskX: -2.4,
    deskZ: -8.2,
    personality: 'Visionary, supportive, and exacting about academic standards across every cohort.',
    responsibilities: 'Oversees all 22 AI faculty members, reviews provisional exam assessments, approves official student scores, and directs curriculum production.',
    specializedCapabilities: ['Final Assessment Approval', 'Task Priority Routing', 'Cohort Analytics', 'Official Record Sync'],
    speechBubbles: [
      'Welcome to ERA FACULTY! Let’s review today’s pending exam assessments.',
      'Every Cambridge and IELTS score is verified here before reaching student records!',
      'Great work team! Keep our IELTS 1, IELTS 2, and Cambridge feedback crystal clear!'
    ],
    shirtColor: '#f59e0b',
    hairColor: '#1c1917',
    skinColor: '#FFE7D6',
    hatType: 'halo',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'fluffy_swept',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Reviewing Provisional IELTS & PET Assessments',
    xp: 4800,
    level: 12,
    tasksCompleted: 142,
    approvalRate: 100,
    gemsEarnedForSchool: 950,
    dollarsEarnedForSchool: 1850
  },
  {
    id: 'emp_coordinator',
    name: 'Clara Vance',
    jobTitle: 'Exam Coordinator',
    department: 'head_admin',
    departmentLabel: 'Head Administration',
    floor: 1,
    deskX: 2.4,
    deskZ: -8.2,
    personality: 'Hyper-organized, calm under pressure, and tracks every batch of exam papers to the second.',
    responsibilities: 'Receives uploaded exam batches, assigns papers to Cambridge & IELTS examiners, balances department queues, and notifies Teacher Jan upon completion.',
    specializedCapabilities: ['Batch Paper Routing', 'Examiner Load Balancing', 'Rubric Verification', 'Deadline Tracking'],
    speechBubbles: [
      'Teacher Jan, I have routed the new batch of PET & IELTS papers to the Writing Examiner!',
      'All 7 examination profiles are calibrated to their official rubrics.',
      '2 assessments are in the Awaiting Approval queue for your sign-off!'
    ],
    defaultExamProfile: 'cambridge_pet',
    defaultSkill: 'Writing',
    shirtColor: '#2563eb',
    hairColor: '#3b2219',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'slick_bun',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'collaborating',
    currentTaskTitle: 'Dispatching Batch Assessment Queue to Skill Examiners',
    xp: 3150,
    level: 9,
    tasksCompleted: 89,
    approvalRate: 99,
    gemsEarnedForSchool: 540,
    dollarsEarnedForSchool: 1120
  },

  // ==========================================================================
  // FLOOR 1: CAMBRIDGE & IELTS EXAMINATION SPECIALISTS (Left Wing: X = -10.5 to -5.5)
  // ==========================================================================
  {
    id: 'emp_starters',
    name: 'Toby Finch',
    jobTitle: 'Starters Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -10.2,
    deskZ: -5.2,
    personality: 'Warm, cheerful, and expert at encouraging Pre-A1 Young Learners.',
    responsibilities: 'Manages Cambridge Pre-A1 Starters assessments (1–5 Shields), picture vocabulary recognition, and early spelling diagnostics.',
    specializedCapabilities: ['Pre-A1 Starters 1–5 Shields Rubric', 'Picture-Word Matching', 'Phonics & Letter Diagnostics'],
    speechBubbles: [
      'Teacher Jan, the Starters picture-word reading sheets scored 5 Shields!',
      'Checking Pre-A1 spelling and object naming for our youngest learners!',
      'Never a band score here—strictly Cambridge Shields for Starters!'
    ],
    defaultExamProfile: 'cambridge_starters',
    defaultSkill: 'Reading',
    shirtColor: '#0284c7',
    hairColor: '#78350f',
    skinColor: '#FFE7D6',
    hatType: 'cap',
    accessoryType: 'none',
    gender: 'boy',
    hairStyle: 'classic',
    clothingType: 'varsity',
    pantsColor: '#1e293b',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Grading Pre-A1 Starters Reading & Writing Shield Sheets',
    xp: 1920,
    level: 6,
    tasksCompleted: 48,
    approvalRate: 98,
    gemsEarnedForSchool: 320,
    dollarsEarnedForSchool: 640
  },
  {
    id: 'emp_movers',
    name: 'Maya Lin',
    jobTitle: 'Movers Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -6.2,
    deskZ: -5.2,
    personality: 'Observant, patient, and loves helping A1 students build full sentences.',
    responsibilities: 'Evaluates Cambridge A1 Movers Reading, Listening, Part 6 picture sentences, and 4-picture story speaking.',
    specializedCapabilities: ['A1 Movers 1–5 Shields Rubric', 'Part 6 Picture Sentence Grading', 'Story Difference Analysis'],
    speechBubbles: [
      "Teacher Jan, I've finished correcting the Movers reading papers. They are ready for your approval!",
      'Evaluating A1 Movers Part 6 picture sentences using the 5-Shield rubric!',
      'Our Movers students are getting much stronger with past tense verbs!'
    ],
    defaultExamProfile: 'cambridge_movers',
    defaultSkill: 'Reading',
    shirtColor: '#ea580c',
    hairColor: '#1c1917',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'twintails',
    clothingType: 'varsity',
    pantsColor: '#1e293b',
    beltType: 'none',
    status: 'awaiting_approval',
    currentTaskTitle: 'Movers Reading & Writing Papers Ready for Approval',
    xp: 2340,
    level: 7,
    tasksCompleted: 61,
    approvalRate: 99,
    gemsEarnedForSchool: 410,
    dollarsEarnedForSchool: 820
  },
  {
    id: 'emp_flyers',
    name: 'Leo Sterling',
    jobTitle: 'Flyers Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -10.2,
    deskZ: -1.0,
    personality: 'Energetic storyteller who coaches A2 Flyers students on creative 3-picture narratives.',
    responsibilities: 'Grades Cambridge A2 Flyers open cloze, extended reading comprehension, and Part 7 three-picture short stories.',
    specializedCapabilities: ['A2 Flyers 1–5 Shields Rubric', '3-Picture Story Evaluation', 'A2 Grammar Cloze Analysis'],
    speechBubbles: [
      'Checking A2 Flyers 3-picture stories for connectors and past continuous!',
      'Flyers Reading & Writing Part 7 papers are marked with detailed Shield feedback!',
      'Ready to publish a new Flyers Bubble Island deck whenever you need!'
    ],
    defaultExamProfile: 'cambridge_flyers',
    defaultSkill: 'Writing',
    shirtColor: '#059669',
    hairColor: '#451a03',
    skinColor: '#FFD8BE',
    hatType: 'none',
    accessoryType: 'none',
    gender: 'boy',
    hairStyle: 'textured_crop',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Assessing A2 Flyers Part 7 Three-Picture Stories',
    xp: 2180,
    level: 7,
    tasksCompleted: 54,
    approvalRate: 97,
    gemsEarnedForSchool: 360,
    dollarsEarnedForSchool: 750
  },
  {
    id: 'emp_ket',
    name: 'Nora Thorne',
    jobTitle: 'KET Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -6.2,
    deskZ: -1.0,
    personality: 'Methodical and sharp-eyed on A2 Key email and picture story sub-scores.',
    responsibilities: 'Evaluates A2 Key (KET) Parts 1–7 using the Cambridge Scale (100–150) and 0–5 sub-scores for Content, Organisation, and Language.',
    specializedCapabilities: ['A2 Key (KET) Scale 100–150', 'Part 6 Guided Email Rubric', 'Part 7 35-Word Story Rubric'],
    speechBubbles: [
      'Scoring KET Part 6 emails on Content, Organisation, and Language (0–5 each)!',
      'All KET Reading & Writing parts checked against the A2 Cambridge Scale!',
      'Make sure students cover all three bullet points in their KET email!'
    ],
    defaultExamProfile: 'cambridge_ket',
    defaultSkill: 'Writing',
    shirtColor: '#e11d48',
    hairColor: '#3b2219',
    skinColor: '#FFE7D6',
    hatType: 'beret',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'long_wavy',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Calibrating A2 Key (KET) Part 6 & 7 Writing Sub-scores',
    xp: 2560,
    level: 8,
    tasksCompleted: 67,
    approvalRate: 99,
    gemsEarnedForSchool: 440,
    dollarsEarnedForSchool: 890
  },
  {
    id: 'emp_pet',
    name: 'Julian Brooks',
    jobTitle: 'PET Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -10.2,
    deskZ: 3.2,
    personality: 'Analytical B1 Preliminary specialist focused on Communicative Achievement and B1 discourse.',
    responsibilities: 'Grades B1 Preliminary (PET) Reading, Listening, Writing (Email & Article/Story), and Speaking using the 0–5 C/CA/O/L rubric and 120–170 scale.',
    specializedCapabilities: ['B1 Preliminary (PET) Scale 120–170', '0–5 C/CA/O/L Writing Rubric', 'B1 Discourse Management'],
    speechBubbles: [
      'Evaluating PET 100-word emails and articles on Content, Communicative Achievement, Organisation & Language!',
      'Teacher Jan, the B1 Preliminary writing batch is ready for review!',
      'Checking B1 range of linking words and complex clauses!'
    ],
    defaultExamProfile: 'cambridge_pet',
    defaultSkill: 'Writing',
    shirtColor: '#0d9488',
    hairColor: '#0f172a',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'parted_neat',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'gold_buckle',
    status: 'walking',
    currentTaskTitle: 'Grading B1 Preliminary (PET) Part 2 Articles',
    xp: 2790,
    level: 8,
    tasksCompleted: 73,
    approvalRate: 98,
    gemsEarnedForSchool: 490,
    dollarsEarnedForSchool: 960
  },
  {
    id: 'emp_ielts',
    name: 'Dr. Arthur Pendelton',
    jobTitle: 'IELTS Specialist',
    department: 'cambridge_specialists',
    departmentLabel: 'Cambridge Examination Specialists',
    floor: 1,
    deskX: -6.2,
    deskZ: 3.2,
    personality: 'Seasoned Senior IELTS Examiner with deep mastery of Band 0–9 descriptors for IELTS 1 and IELTS 2 cohorts.',
    responsibilities: 'Calibrates IELTS Academic & General Training assessments across Task 1, Task 2, Speaking Parts 1–3, Reading, and Listening.',
    specializedCapabilities: ['IELTS Academic & General 0–9 Bands', 'Band 8+ Essay Elevation', 'IELTS 1 & IELTS 2 Cohort Diagnostics'],
    speechBubbles: [
      'Auditing IELTS 1 & IELTS 2 Task 2 essays for Band 7.5+ Lexical Resource!',
      'Remember: Task 1 Academic requires a clear overview paragraph to reach Band 7+!',
      'Teacher Jan, I have prepared the latest IELTS Academic band breakdown for your approval!'
    ],
    defaultExamProfile: 'ielts_academic',
    defaultSkill: 'Writing',
    shirtColor: '#4f46e5',
    hairColor: '#475569',
    skinColor: '#FFE7D6',
    hatType: 'crown',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'parted_neat',
    clothingType: 'royal_coat',
    pantsColor: '#0f172a',
    beltType: 'champion_belt',
    status: 'working',
    currentTaskTitle: 'Calibrating IELTS 1 & IELTS 2 Academic Band Reports',
    xp: 3890,
    level: 10,
    tasksCompleted: 112,
    approvalRate: 100,
    gemsEarnedForSchool: 720,
    dollarsEarnedForSchool: 1450
  },

  // ==========================================================================
  // FLOOR 1: FOUR SKILL ASSESSMENT EXAMINERS (Right Wing: X = +5.5 to +10.5)
  // ==========================================================================
  {
    id: 'emp_reading',
    name: 'Elena Rostova',
    jobTitle: 'Reading Examiner',
    department: 'skill_examiners',
    departmentLabel: 'Four-Skill Assessment Specialists',
    floor: 1,
    deskX: 6.2,
    deskZ: -5.2,
    personality: 'Precision-focused examiner who spots every True/False/Not Given trap and distractor.',
    responsibilities: 'Marks uploaded Reading answer sheets across all 7 exams, calculates exact raw and scaled scores, explains incorrect answers, and generates reading reports.',
    specializedCapabilities: ['Objective Answer Sheet Auto-Marking', 'T/F/NG & Inference Explanations', 'Passage Weakness Diagnostics'],
    speechBubbles: [
      'Reading answer sheets marked! Explaining every True/False/Not Given distractor!',
      'Upload any student reading sheet and I will calculate scores and item explanations!',
      'IELTS 2 Reading accuracy on Matching Headings is up 14% this week!'
    ],
    defaultExamProfile: 'ielts_academic',
    defaultSkill: 'Reading',
    shirtColor: '#0284c7',
    hairColor: '#7c2d12',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'slick_bun',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Auto-Marking Uploaded Reading Answer Sheets',
    xp: 2940,
    level: 8,
    tasksCompleted: 82,
    approvalRate: 99,
    gemsEarnedForSchool: 510,
    dollarsEarnedForSchool: 1040
  },
  {
    id: 'emp_listening',
    name: 'Marcus Chen',
    jobTitle: 'Listening Examiner',
    department: 'skill_examiners',
    departmentLabel: 'Four-Skill Assessment Specialists',
    floor: 1,
    deskX: 10.2,
    deskZ: -5.2,
    personality: 'Attentive audio specialist with studio headphones who analyzes section-by-section listening accuracy.',
    responsibilities: 'Evaluates uploaded Listening answer sheets and audio exercises, detects spelling/plural traps, and maps listening weaknesses.',
    specializedCapabilities: ['Listening Answer Sheet Grading', 'Audio Distractor & Spelling Analysis', 'Section 1–4 Performance Reports'],
    speechBubbles: [
      'Checking Listening answer sheets for plural -s and number-spelling accuracy!',
      'Teacher Jan, the Listening diagnostic report is ready for review!',
      'Helping students master Section 3 multiple-choice distractors!'
    ],
    defaultExamProfile: 'ielts_academic',
    defaultSkill: 'Listening',
    shirtColor: '#0891b2',
    hairColor: '#0f172a',
    skinColor: '#FFD8BE',
    hatType: 'headphones',
    accessoryType: 'none',
    gender: 'boy',
    hairStyle: 'fluffy_swept',
    clothingType: 'cyber_jacket',
    pantsColor: '#0f172a',
    beltType: 'cyber_belt',
    status: 'working',
    currentTaskTitle: 'Analyzing Listening Answer Sheets & Audio Distractors',
    xp: 2810,
    level: 8,
    tasksCompleted: 76,
    approvalRate: 98,
    gemsEarnedForSchool: 480,
    dollarsEarnedForSchool: 980
  },
  {
    id: 'emp_writing',
    name: 'Dr. Victoria Sterling',
    jobTitle: 'Writing Examiner',
    department: 'skill_examiners',
    departmentLabel: 'Four-Skill Assessment Specialists',
    floor: 1,
    deskX: 6.2,
    deskZ: -1.0,
    personality: 'Rigorous yet constructive writing specialist equipped with multimodal OCR for handwritten scripts.',
    responsibilities: 'Extracts text from handwritten images or typed essays via OCR, evaluates using the exact Cambridge or IELTS rubric, marks inline grammar/vocab errors, and provides elevated model rewrites.',
    specializedCapabilities: ['Handwritten Essay OCR Extraction', 'Inline Error Strike & Correction', 'Exam-Specific Rubric Breakdown', 'Band 8+ / Top-Scale Rewrite'],
    speechBubbles: [
      'Upload a photo of a handwritten essay or typed script—my OCR and rubric engine will mark every line!',
      'Teacher Jan, I finished marking the PET and IELTS Writing scripts for your approval!',
      'Inline grammar, collocation, and coherence corrections are ready!'
    ],
    defaultExamProfile: 'ielts_academic',
    defaultSkill: 'Writing',
    shirtColor: '#d97706',
    hairColor: '#451a03',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'long_wavy',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'awaiting_approval',
    currentTaskTitle: 'OCR & Rubric Grading of Student Writing Scripts',
    xp: 3620,
    level: 10,
    tasksCompleted: 104,
    approvalRate: 99,
    gemsEarnedForSchool: 680,
    dollarsEarnedForSchool: 1360
  },
  {
    id: 'emp_speaking',
    name: 'Oliver Grant',
    jobTitle: 'Speaking Examiner',
    department: 'skill_examiners',
    departmentLabel: 'Four-Skill Assessment Specialists',
    floor: 1,
    deskX: 10.2,
    deskZ: -1.0,
    personality: 'Encouraging oral examiner who transcribes student audio recordings and pinpoints pronunciation and fluency gains.',
    responsibilities: 'Transcribes uploaded student speaking recordings via Gemini, evaluates Fluency, Pronunciation, Grammar, and Vocabulary under the selected exam rubric, and generates provisional scores.',
    specializedCapabilities: ['Student Audio Transcription', 'Fluency & Pronunciation Scoring', 'Lexical & Grammatical Oral Feedback'],
    speechBubbles: [
      'Upload any student Speaking audio file—I will transcribe it and score Fluency, Pronunciation, Grammar & Vocabulary!',
      'Provisional Speaking scores are queued for Teacher Jan’s final approval!',
      'Listening to IELTS 2 Part 2 cue card recordings right now!'
    ],
    defaultExamProfile: 'ielts_academic',
    defaultSkill: 'Speaking',
    shirtColor: '#7c3aed',
    hairColor: '#1c1917',
    skinColor: '#FFE7D6',
    hatType: 'headphones',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'textured_crop',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Transcribing & Scoring Student Speaking Recordings',
    xp: 3340,
    level: 9,
    tasksCompleted: 91,
    approvalRate: 99,
    gemsEarnedForSchool: 610,
    dollarsEarnedForSchool: 1210
  },

  // ==========================================================================
  // FLOOR 2: CREATIVE TEACHING & ACADEMIC OPERATIONS (Upper Mezzanine y = 5.2)
  // ==========================================================================
  {
    id: 'emp_grammar',
    name: 'Professor Higgins',
    jobTitle: 'Grammar Specialist',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: -10.5,
    deskZ: -6.2,
    personality: 'Witty syntax perfectionist who turns tricky tense and clause rules into crystal-clear drills.',
    responsibilities: 'Designs leveled grammar worksheets, sentence transformation drills, and error-correction exercises from Starters to IELTS.',
    specializedCapabilities: ['Grammar Worksheet Generation', 'Tense & Clause Diagnostics', 'Error Correction Drills'],
    speechBubbles: [
      'Crafting a new Relative Clauses & Conditionals worksheet for PET and IELTS!',
      'Grammar drills generated and ready to export as PDF or publish to Homework!',
      'A well-placed complex sentence boosts Grammatical Range every time!'
    ],
    defaultCreativeTool: 'grammar_worksheet',
    shirtColor: '#0f766e',
    hairColor: '#64748b',
    skinColor: '#FFE7D6',
    hatType: 'beret',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'parted_neat',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Generating CEFR B1/B2 Grammar Transformation Drills',
    xp: 2150,
    level: 7,
    tasksCompleted: 58,
    approvalRate: 98,
    gemsEarnedForSchool: 390,
    dollarsEarnedForSchool: 780
  },
  {
    id: 'emp_vocab',
    name: 'Chloe Bennett',
    jobTitle: 'Vocabulary Specialist',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: -6.5,
    deskZ: -6.2,
    personality: 'Lexical enthusiast who curates high-impact collocations, phrasal verbs, and thematic word lists.',
    responsibilities: 'Produces vocabulary worksheets, collocation builders, and synonym matrices tailored to Cambridge and IELTS topics.',
    specializedCapabilities: ['Vocabulary Worksheet Generator', 'Academic Collocation Lists', 'CEFR Lexical Sets'],
    speechBubbles: [
      'Building a Band 8 Academic Collocations worksheet for IELTS 1 & IELTS 2!',
      'Need a Movers or Flyers thematic vocabulary sheet? Just pick a topic at my desk!',
      'Collocations and context sentences are ready for download!'
    ],
    defaultCreativeTool: 'vocab_worksheet',
    shirtColor: '#059669',
    hairColor: '#78350f',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'none',
    gender: 'girl',
    hairStyle: 'long_wavy',
    clothingType: 'varsity',
    pantsColor: '#1e293b',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Curating Thematic Vocabulary & Collocation Sheets',
    xp: 2290,
    level: 7,
    tasksCompleted: 63,
    approvalRate: 99,
    gemsEarnedForSchool: 410,
    dollarsEarnedForSchool: 830
  },
  {
    id: 'emp_planner',
    name: 'Hannah Abbott',
    jobTitle: 'Lesson Planner',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: -2.5,
    deskZ: -6.2,
    personality: 'Structured curriculum architect who designs engaging 45, 60, and 90-minute classroom lessons.',
    responsibilities: 'Generates complete lesson plans with learning objectives, warm-up games, guided practice, freer communicative production, and homework.',
    specializedCapabilities: ['45/60/90-Min Lesson Plans', 'PPP & Task-Based Learning', 'Classroom Timing & Board Plans'],
    speechBubbles: [
      'Designing a 60-minute interactive lesson plan with warm-up and speaking activities!',
      'Every lesson plan includes teacher notes, board layout, and timing!',
      'Click my workstation to generate a custom lesson plan for any class!'
    ],
    defaultCreativeTool: 'lesson_plan',
    shirtColor: '#16a34a',
    hairColor: '#3b2219',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'slick_bun',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'none',
    status: 'collaborating',
    currentTaskTitle: 'Structuring Weekly IELTS & Cambridge Lesson Plans',
    xp: 2410,
    level: 7,
    tasksCompleted: 65,
    approvalRate: 99,
    gemsEarnedForSchool: 430,
    dollarsEarnedForSchool: 860
  },
  {
    id: 'emp_quiz',
    name: 'Lucas Vega',
    jobTitle: 'Quiz Maker',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: 2.5,
    deskZ: -6.2,
    personality: 'Fast-paced assessment builder who crafts multiple-choice and cloze quizzes in seconds.',
    responsibilities: 'Creates leveled Multiple-Choice (MCQ) and Fill-in-the-Blank quizzes with explanations and 1-click publishing to Homework or EraGames.',
    specializedCapabilities: ['Multiple-Choice Generator', 'Fill-in-the-Blank Cloze', '1-Click Homework & Game Export'],
    speechBubbles: [
      '20 new Multiple-Choice and Fill-in-the-Blank questions generated with full answer keys!',
      'You can publish my quizzes directly to EraGames Bubble Island or Homework!',
      'Testing distractors across Starters, Movers, Flyers, KET, PET, and IELTS!'
    ],
    defaultCreativeTool: 'mcq',
    shirtColor: '#2563eb',
    hairColor: '#1c1917',
    skinColor: '#FFD8BE',
    hatType: 'cap',
    accessoryType: 'none',
    gender: 'boy',
    hairStyle: 'spiky',
    clothingType: 'hoodie',
    pantsColor: '#0f172a',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Generating Leveled MCQ & Fill-in-the-Blank Quizzes',
    xp: 2640,
    level: 8,
    tasksCompleted: 74,
    approvalRate: 98,
    gemsEarnedForSchool: 470,
    dollarsEarnedForSchool: 940
  },
  {
    id: 'emp_worksheet',
    name: 'Sophie Alvarez',
    jobTitle: 'Worksheet Designer',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: 6.5,
    deskZ: -6.2,
    personality: 'Editorial designer who pairs leveled reading passages with clean, printable comprehension tasks.',
    responsibilities: 'Creates Reading Comprehension passages, multi-part classroom handouts, and printable PDF worksheets.',
    specializedCapabilities: ['Reading Comprehension Generator', 'Printable PDF Handouts', 'Multi-Format Question Sets'],
    speechBubbles: [
      'Formatting a new Reading Comprehension worksheet with True/False/Not Given & MCQs!',
      'Download any worksheet as a clean printable PDF right from my workstation!',
      'Tailored passages ready for Movers, Flyers, PET, and IELTS!'
    ],
    defaultCreativeTool: 'reading_comp',
    shirtColor: '#4f46e5',
    hairColor: '#3b2219',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'girl',
    hairStyle: 'twin_buns',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Designing Printable Reading Comprehension Handouts',
    xp: 2380,
    level: 7,
    tasksCompleted: 62,
    approvalRate: 99,
    gemsEarnedForSchool: 420,
    dollarsEarnedForSchool: 840
  },
  {
    id: 'emp_ppt',
    name: "Liam O'Connor",
    jobTitle: 'PowerPoint Creator',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: 10.5,
    deskZ: -6.2,
    personality: 'Visual presenter who structures clear, high-engagement slide decks for classroom projection.',
    responsibilities: 'Generates slide-by-slide PowerPoint lesson outlines with teaching points, interactive check questions, and speaker notes.',
    specializedCapabilities: ['Slide-by-Slide Deck Creation', 'Teacher Speaker Notes', 'Interactive Board Slides'],
    speechBubbles: [
      '10-slide classroom presentation deck ready with teacher speaker notes!',
      'Click my workstation to build a PowerPoint lesson on any grammar or IELTS topic!',
      'Structured slides make classroom teaching effortless!'
    ],
    defaultCreativeTool: 'ppt_lesson',
    shirtColor: '#ea580c',
    hairColor: '#7c2d12',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'none',
    gender: 'boy',
    hairStyle: 'fluffy_swept',
    clothingType: 'varsity',
    pantsColor: '#1e293b',
    beltType: 'none',
    status: 'working',
    currentTaskTitle: 'Building 10-Slide Classroom Presentation Decks',
    xp: 2090,
    level: 6,
    tasksCompleted: 53,
    approvalRate: 98,
    gemsEarnedForSchool: 370,
    dollarsEarnedForSchool: 740
  },
  {
    id: 'emp_gamedesigner',
    name: 'Pixel Kai',
    jobTitle: 'Educational Game Designer',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: -10.5,
    deskZ: -0.8,
    personality: 'Playful game architect who builds Bubble Island and EraGames question packs for every course.',
    responsibilities: 'Generates interactive Bubble Island question decks and publishes them directly to EraGames so students can play and earn Era Dollars.',
    specializedCapabilities: ['Bubble Island Deck Generator', 'Direct EraGames Publishing', 'Course-Matched Trivia Design'],
    speechBubbles: [
      'New Bubble Island question deck ready to publish straight to EraGames! 🫧🎮',
      'Students in Movers, KET, PET, and IELTS love playing our custom game decks!',
      'Generate a game at my desk and click Publish to EraGames in one tap!'
    ],
    defaultCreativeTool: 'classroom_game',
    shirtColor: '#9333ea',
    hairColor: '#0f172a',
    skinColor: '#FFE7D6',
    hatType: 'headphones',
    accessoryType: 'cyber_visor',
    gender: 'boy',
    hairStyle: 'spiky',
    clothingType: 'cyber_jacket',
    pantsColor: '#0f172a',
    beltType: 'cyber_belt',
    status: 'celebrating',
    currentTaskTitle: 'Publishing Course-Matched Bubble Island Decks to EraGames',
    xp: 3120,
    level: 9,
    tasksCompleted: 86,
    approvalRate: 100,
    gemsEarnedForSchool: 580,
    dollarsEarnedForSchool: 1160
  },
  {
    id: 'emp_student_affairs',
    name: 'Grace Kim',
    jobTitle: 'Student Affairs Officer',
    department: 'creative_teaching',
    departmentLabel: 'Academic Operations & Student Affairs',
    floor: 2,
    deskX: -6.5,
    deskZ: -0.8,
    personality: 'Empathetic mentor who tracks student engagement, streaks, and wellbeing across IELTS 1 and IELTS 2.',
    responsibilities: 'Monitors student participation across classes and games, prepares personalized encouragement notes, and manages cohort rosters.',
    specializedCapabilities: ['Student Engagement Tracking', 'Cohort Roster Management', 'Personalized Motivation Notes'],
    speechBubbles: [
      'All 15 IELTS 1 and 12 IELTS 2 students are active on campus today!',
      'Tracking homework completion streaks and Era Dollars rewards!',
      'Happy students learn faster—let’s celebrate their milestones!'
    ],
    defaultCreativeTool: 'speaking_questions',
    shirtColor: '#ec4899',
    hairColor: '#1c1917',
    skinColor: '#FFE7D6',
    hatType: 'none',
    accessoryType: 'none',
    gender: 'girl',
    hairStyle: 'long_wavy',
    clothingType: 'blazer',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'walking',
    currentTaskTitle: 'Auditing IELTS 1 & IELTS 2 Student Engagement Streaks',
    xp: 2250,
    level: 7,
    tasksCompleted: 59,
    approvalRate: 99,
    gemsEarnedForSchool: 400,
    dollarsEarnedForSchool: 800
  },
  {
    id: 'emp_academic_report',
    name: 'Daniel Park',
    jobTitle: 'Academic Report Officer',
    department: 'creative_teaching',
    departmentLabel: 'Academic Operations & Student Affairs',
    floor: 2,
    deskX: 6.5,
    deskZ: -0.8,
    personality: 'Data-driven analyst who turns assessment scores into clear progress reports for teachers and parents.',
    responsibilities: 'Compiles multi-skill student performance summaries, tracks cohort band progression, and exports official academic transcripts.',
    specializedCapabilities: ['Cohort Analytics & Charts', 'Parent Progress Summaries', 'Multi-Skill Score Aggregation'],
    speechBubbles: [
      'Compiling weekly skill analytics across Reading, Listening, Writing, and Speaking!',
      'IELTS 1 and IELTS 2 progress reports are synced with approved assessments!',
      'Check the Academic Analytics tab in Teacher Jan’s dashboard for live charts!'
    ],
    defaultCreativeTool: 'ielts_writing_task',
    shirtColor: '#0284c7',
    hairColor: '#0f172a',
    skinColor: '#FFD8BE',
    hatType: 'none',
    accessoryType: 'glasses',
    gender: 'boy',
    hairStyle: 'parted_neat',
    clothingType: 'blazer',
    pantsColor: '#0f172a',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Compiling Cohort Band Progression & Skill Reports',
    xp: 2490,
    level: 8,
    tasksCompleted: 68,
    approvalRate: 99,
    gemsEarnedForSchool: 450,
    dollarsEarnedForSchool: 900
  },
  {
    id: 'emp_creative',
    name: 'Aria Montgomery',
    jobTitle: 'Creative Director',
    department: 'creative_teaching',
    departmentLabel: 'Creative Teaching & Curriculum Lab',
    floor: 2,
    deskX: 10.5,
    deskZ: -0.8,
    personality: 'Imaginative visual thinker who crafts memorable flashcards, speaking cue cards, and thematic prompts.',
    responsibilities: 'Leads the Creative Teaching Lab, designs bilingual/monolingual flashcard decks, and curates engaging classroom themes.',
    specializedCapabilities: ['Flashcard Deck Creator', 'Visual Memory Hooks', 'Thematic Curriculum Design'],
    speechBubbles: [
      'Generating high-retention Flashcard decks with phonetics and example sentences!',
      'Creative visual prompts make new vocabulary stick Effortlessly!',
      'Visit Floor 2 Creative Lab anytime to produce flashcards, slides, or games!'
    ],
    defaultCreativeTool: 'flashcards',
    shirtColor: '#db2777',
    hairColor: '#451a03',
    skinColor: '#FFE7D6',
    hatType: 'beret',
    accessoryType: 'sunglasses',
    gender: 'girl',
    hairStyle: 'twintails',
    clothingType: 'royal_coat',
    pantsColor: '#1e293b',
    beltType: 'gold_buckle',
    status: 'working',
    currentTaskTitle: 'Designing High-Retention Vocabulary Flashcard Decks',
    xp: 2710,
    level: 8,
    tasksCompleted: 71,
    approvalRate: 99,
    gemsEarnedForSchool: 490,
    dollarsEarnedForSchool: 980
  }
];

export const INITIAL_FACULTY_TASKS: FacultyTaskItem[] = [
  {
    id: 'task_seed_movers_reading',
    title: 'Cambridge A1 Movers Reading & Writing Part 6 Assessment',
    description: 'Marked Movers Reading & Picture Sentence papers using the 1–5 Cambridge Shields rubric.',
    employeeId: 'emp_movers',
    employeeName: 'Maya Lin',
    employeeTitle: 'Movers Specialist',
    coordinatorId: 'emp_coordinator',
    department: 'cambridge_specialists',
    taskCategory: 'exam_assessment',
    examProfile: 'cambridge_movers',
    skill: 'Reading',
    cefrLevel: 'A1',
    status: 'Awaiting Approval',
    priority: 'High',
    targetStudentName: 'Movers Cohort Batch (12 Papers)',
    targetCohort: 'Movers',
    batchCount: 12,
    inputPayload: {
      promptOrQuestion: 'Cambridge A1 Movers Reading & Writing Parts 1–6 (Picture matching, Yes/No, Dialogue choice, Cloze, and Picture Sentences).',
      studentResponseText: '1. a library  2. a dolphin  3. Yes  4. No  5. Part 6: The boy is eating a big red apple. Two brown dogs are playing under the tree.',
      answerKeyText: '1. a library  2. a dolphin  3. Yes  4. No  5. Full sentences describing the park scene.'
    },
    outputResult: {
      summaryScoreLabel: '5 / 5 Cambridge Shields (🛡️🛡️🛡️🛡️🛡️)',
      numericScore: 5,
      maxNumericScore: 5,
      cefrEstimate: 'A1 Movers (Strong Pass)',
      criteriaBreakdown: [
        { criterion: 'Lexical & Picture Matching (Parts 1–3)', score: '5 / 5 Shields', feedback: 'Accurate noun identification with correct article usage.' },
        { criterion: 'Reading Cloze & Story Comprehension (Parts 4–5)', score: '4.5 / 5 Shields', feedback: 'Strong comprehension of simple past narrative actions.' },
        { criterion: 'Picture Sentence Production (Part 6)', score: '5 / 5 Shields', feedback: 'Two complete, grammatically accurate present continuous sentences.' }
      ],
      inlineCorrectionsOrMarking: 'All objective items 1–4 marked ✅ Correct. Part 6 sentences ("The boy is eating a big red apple. Two brown dogs are playing under the tree.") earn full marks (2/2 each) under the A1 Movers mark scheme.',
      strengths: ['Accurate present continuous verb forms', 'Exact spelling of everyday A1 nouns', 'Complete independent sentence structure in Part 6'],
      weaknesses: ['Review irregular past forms (went, saw, bought) for Part 5 story gaps'],
      examinerReportMarkdown: '### Cambridge A1 Movers Official Examiner Report\n- **Awarded Score:** 5 / 5 Shields (🛡️🛡️🛡️🛡️🛡️)\n- **CEFR Level:** A1 Achieved\n- **Summary:** Excellent accuracy across word matching and sentence completion. Ready for Teacher Jan’s final approval.',
      suggestedImprovementOrModelAnswer: 'Model Extension (Flyers Bridge): "The boy in the blue jacket is happily eating a crisp red apple while two playful brown dogs chase a ball under the oak tree."'
    },
    rewardGems: 35,
    rewardDollars: 60,
    rewardXp: 120,
    createdBy: 'Teacher Jan',
    createdAt: Date.now() - 1000 * 60 * 42,
    updatedAt: Date.now() - 1000 * 60 * 15
  },
  {
    id: 'task_seed_pet_writing',
    title: 'B1 Preliminary (PET) Writing Part 1 Email Assessment — Kim (IELTS 2 / B1 Bridge)',
    description: 'Evaluated 100-word B1 Preliminary email using the official Cambridge 0–5 Content, Communicative Achievement, Organisation, and Language rubric.',
    employeeId: 'emp_pet',
    employeeName: 'Julian Brooks',
    employeeTitle: 'PET Specialist',
    coordinatorId: 'emp_coordinator',
    department: 'cambridge_specialists',
    taskCategory: 'exam_assessment',
    examProfile: 'cambridge_pet',
    skill: 'Writing',
    cefrLevel: 'B1',
    status: 'Awaiting Approval',
    priority: 'High',
    targetStudentId: 'ielts2-kim',
    targetStudentName: 'Kim',
    targetCohort: 'IELTS 2',
    batchCount: 1,
    inputPayload: {
      promptOrQuestion: 'Write an email to your English-speaking friend Alex about a school sports festival you attended last weekend (100 words). Include: 1) Which sport you played, 2) Why you enjoyed it, 3) Invite Alex to visit next month.',
      studentResponseText: 'Hi Alex,\nHow are you doing? Last Saturday our school organized a big sports festival on the EraVerse campus. I played doubles tennis with Hannah on the Era Tennis Court, and our team won the second prize! I really enjoyed it because the atmosphere was super exciting and everyone cheered for us. Would you like to come and visit my school next month so we can play together?\nBest wishes,\nKim'
    },
    outputResult: {
      summaryScoreLabel: '18 / 20 (Cambridge Scale: 162 / 170 — Grade A / B2 Achieved)',
      numericScore: 18,
      maxNumericScore: 20,
      cefrEstimate: 'B1 Preliminary (Grade A)',
      criteriaBreakdown: [
        { criterion: 'Content', score: '5 / 5', feedback: 'All three required points (sport played, reason for enjoyment, and invitation) are fully addressed.' },
        { criterion: 'Communicative Achievement', score: '4.5 / 5', feedback: 'Natural, friendly email register that holds the target reader’s attention.' },
        { criterion: 'Organisation', score: '4.5 / 5', feedback: 'Clear greeting, logical sequencing with cohesive linkers (and, because, so), and appropriate sign-off.' },
        { criterion: 'Language', score: '4 / 5', feedback: 'Accurate past simple and modal invitation structures with strong topic vocabulary.' }
      ],
      inlineCorrectionsOrMarking: 'Hi Alex, How are you doing? Last Saturday our school organized a big sports festival on the EraVerse campus. I played doubles tennis with Hannah on the Era Tennis Court, and our team ~~won the second prize~~ **won second prize**! I really enjoyed it because the atmosphere was super exciting and everyone cheered for us.',
      strengths: ['Covers all 3 prompt notes naturally', 'Strong B1 cohesive devices (because, so that)', 'Appropriate informal email conventions'],
      weaknesses: ['Omit "the" before ordinal prizes ("won second prize")'],
      examinerReportMarkdown: '### Cambridge B1 Preliminary (PET) Writing Report\n- **Total Sub-score:** 18 / 20 (Cambridge English Scale: **162 / 170**)\n- **Rubric Applied:** Official Cambridge B1 Preliminary (Content 5, Communicative Achievement 4.5, Organisation 4.5, Language 4.0)\n- **Status:** Provisional — Awaiting Teacher Jan Approval.',
      suggestedImprovementOrModelAnswer: 'Hi Alex,\n\nIt was great to hear from you! Last Saturday, our school hosted an unforgettable sports festival on the EraVerse campus. I competed in doubles tennis with my classmate Hannah, and we were thrilled to win second prize! I thoroughly enjoyed the tournament because the crowd was so supportive and the matches were closely contested. Would you be free to visit next month so we can team up for a match?\n\nBest wishes,\nKim'
    },
    rewardGems: 45,
    rewardDollars: 80,
    rewardXp: 150,
    createdBy: 'Teacher Jan',
    createdAt: Date.now() - 1000 * 60 * 95,
    updatedAt: Date.now() - 1000 * 60 * 28
  },
  {
    id: 'task_seed_ielts_writing',
    title: 'IELTS Academic Writing Task 2 Evaluation — Charlie (IELTS 2)',
    description: 'Full Band 0–9 evaluation with inline error marking and Band 8.0 elevated model essay.',
    employeeId: 'emp_writing',
    employeeName: 'Dr. Victoria Sterling',
    employeeTitle: 'Writing Examiner',
    coordinatorId: 'emp_coordinator',
    department: 'skill_examiners',
    taskCategory: 'exam_assessment',
    examProfile: 'ielts_academic',
    skill: 'Writing',
    cefrLevel: 'C1',
    status: 'Approved',
    priority: 'Normal',
    targetStudentId: 'ielts2-charlie',
    targetStudentName: 'Charlie',
    targetCohort: 'IELTS 2',
    batchCount: 1,
    inputPayload: {
      promptOrQuestion: 'Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional for students. Discuss both views and give your own opinion.',
      studentResponseText: 'Nowadays, whether university attendance should be mandatory or optional is a heated debate. While autonomous learning offers flexibility, I firmly believe compulsory attendance provides essential academic guidance and peer interaction.'
    },
    outputResult: {
      summaryScoreLabel: 'Band 7.5 (IELTS Academic)',
      numericScore: 7.5,
      maxNumericScore: 9.0,
      cefrEstimate: 'C1',
      criteriaBreakdown: [
        { criterion: 'Task Response (TR)', score: 'Band 7.5', feedback: 'Addresses both views clearly and maintains a consistent personal position.' },
        { criterion: 'Coherence and Cohesion (CC)', score: 'Band 7.5', feedback: 'Smooth paragraph transitions and clear topic sentences.' },
        { criterion: 'Lexical Resource (LR)', score: 'Band 7.5', feedback: 'Uses academic collocations such as "autonomous learning" and "peer interaction".' },
        { criterion: 'Grammatical Range and Accuracy (GRA)', score: 'Band 7.5', feedback: 'Complex concessive clauses ("While...") used with high accuracy.' }
      ],
      inlineCorrectionsOrMarking: 'Nowadays, whether university attendance should be mandatory or optional ~~is a heated debate~~ **remains a subject of considerable debate**. While autonomous learning offers flexibility, I firmly believe compulsory attendance provides essential academic guidance and peer interaction.',
      strengths: ['Clear thesis statement', 'Balanced concessive subordination', 'Academic register'],
      weaknesses: ['Replace conversational clichés like "heated debate" with formal academic phrasing'],
      examinerReportMarkdown: '### Official IELTS Academic Examiner Report\n- **Overall Band Score:** Band 7.5\n- **Breakdown:** TR 7.5 · CC 7.5 · LR 7.5 · GRA 7.5\n- **Approval Status:** Approved by Teacher Jan.',
      suggestedImprovementOrModelAnswer: 'In contemporary higher education, whether lecture attendance ought to be compulsory or voluntary remains a subject of considerable debate. While self-directed study affords mature learners valuable scheduling flexibility, I contend that structured classroom participation is indispensable for rigorous academic mentorship and collaborative inquiry.'
    },
    rewardGems: 50,
    rewardDollars: 90,
    rewardXp: 180,
    createdBy: 'Teacher Jan',
    createdAt: Date.now() - 1000 * 60 * 180,
    updatedAt: Date.now() - 1000 * 60 * 120,
    approvedBy: 'Teacher Jan',
    approvedAt: Date.now() - 1000 * 60 * 120
  }
];

export const INITIAL_OFFICE_DECORATIONS: OfficeDecorationItem[] = [
  {
    id: 'deco_trophy_shelf',
    name: 'Championship Faculty Trophy Case',
    description: 'Golden academic trophy cabinet displayed in the Floor 1 Executive Atrium (+5% Employee XP).',
    floor: 1,
    costGems: 100,
    costDollars: 200,
    unlocked: true,
    xpBonusPercent: 5
  },
  {
    id: 'deco_espresso_bar',
    name: 'Artisan Faculty Espresso & Tea Bar',
    description: 'Premium coffee station on Floor 1 keeping examiners energized during batch marking (+10% Employee XP).',
    floor: 1,
    costGems: 150,
    costDollars: 300,
    unlocked: false,
    xpBonusPercent: 10
  },
  {
    id: 'deco_holo_globe',
    name: 'Holographic Cambridge & IELTS World Globe',
    description: 'Rotating illuminated globe on the Floor 2 Creative Mezzanine (+15% Employee XP).',
    floor: 2,
    costGems: 220,
    costDollars: 450,
    unlocked: false,
    xpBonusPercent: 15
  },
  {
    id: 'deco_gold_plaque',
    name: 'Teacher Jan Founder’s Crest & Gold Plaque',
    description: 'Prestigious royal crest mounted above the Head Administration Command Desk (+20% Employee XP).',
    floor: 1,
    costGems: 300,
    costDollars: 600,
    unlocked: false,
    xpBonusPercent: 20
  }
];

export const INITIAL_FACULTY_MISSIONS: FacultyMissionItem[] = [
  {
    id: 'mission_daily_assess',
    title: 'Daily Mission: Complete or Approve 3 Examination Assessments',
    type: 'daily',
    targetCount: 3,
    currentCount: 1,
    rewardGems: 50,
    rewardDollars: 100,
    rewardXp: 200,
    completed: false
  },
  {
    id: 'mission_daily_creative',
    title: 'Daily Mission: Generate 2 Classroom Worksheets, Quizzes, or Game Decks',
    type: 'daily',
    targetCount: 2,
    currentCount: 1,
    rewardGems: 40,
    rewardDollars: 80,
    rewardXp: 150,
    completed: false
  },
  {
    id: 'mission_weekly_batch',
    title: 'Weekly Challenge: Process & Approve 10 Multi-Skill Tasks Across All Departments',
    type: 'weekly',
    targetCount: 10,
    currentCount: 3,
    rewardGems: 180,
    rewardDollars: 350,
    rewardXp: 600,
    completed: false
  }
];

export const FACULTY_ACHIEVEMENT_BADGES = [
  {
    id: 'badge_cambridge_master',
    title: 'Cambridge Shield Guardian',
    desc: 'Evaluated assessments across Starters, Movers, Flyers, KET, and PET using official Cambridge rubrics.',
    unlocked: true,
    color: '#0284C7'
  },
  {
    id: 'badge_ielts_authority',
    title: 'Band 9 Calibration Authority',
    desc: 'Approved official IELTS Academic & General Training evaluations for IELTS 1 and IELTS 2.',
    unlocked: true,
    color: '#4F46E5'
  },
  {
    id: 'badge_creative_architect',
    title: 'Curriculum & Game Architect',
    desc: 'Published AI-generated question decks directly to EraGames Bubble Island and Homework.',
    unlocked: true,
    color: '#9333EA'
  },
  {
    id: 'badge_workforce_commander',
    title: 'ERA Faculty Workforce Commander',
    desc: 'Coordinated all 22 AI specialists across Floor 1 and Floor 2 of ERA FACULTY HQ.',
    unlocked: true,
    color: '#D97706'
  }
];
