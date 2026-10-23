import * as THREE from 'three';

export type SkillKey = 'listening' | 'reading' | 'writing' | 'speaking';

export interface SkillSubmissionSummary {
  id: string;
  title: string;
  skill: SkillKey;
  bandScore: number;
  dateStr: string;
}

export interface StudentSkillScores {
  id: string;
  userId?: string;
  email?: string;
  name: string;
  fullName?: string;
  cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
  roleTitle: string;
  specialty: string;
  avatarDetails: string;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  overall: number;
  submissionsCount: number;
  shirtColor: string;
  recentSubmissions: SkillSubmissionSummary[];
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderCohort: string;
  recipientName?: string;
  text: string;
  timestamp: number;
  isWarning?: boolean;
}

export interface CanonicalStudentSpec {
  id: string;
  realUserId?: string;
  email?: string;
  name: string; // Nickname used as primary character name
  fullName?: string;
  cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
  course: 'IELTS Course';
  roleTitle: string;
  specialty: string;
  avatarDetails: string;
  shirtColor: string;
  hairColor: string;
  skinColor: string;
  hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones';
  accessoryType: 'none' | 'glasses' | 'shades';
  targetBuildingId: string;
  motto: string;
  defaultScores: { reading: number; listening: number; writing: number; speaking: number };
  isRealStudent?: boolean;
  isTeacherAdmin?: boolean;
}

export const TEACHER_JAN_PROFILE: CanonicalStudentSpec = {
  id: 'teacher-jan-super-admin',
  realUserId: 'teacher-jan',
  email: 'janrelbugtay03@gmail.com',
  name: 'Teacher Jan',
  fullName: 'Teacher Jan',
  cohort: 'TEACHER (SUPER ADMIN)',
  course: 'IELTS Course',
  roleTitle: 'Teacher (Super Admin)',
  specialty: 'Head of IELTS & Campus Director',
  avatarDetails: 'Crimson Blazer • Golden Crown • Glasses',
  shirtColor: '#dc2626',
  hairColor: '#1c1917',
  skinColor: '#fcd34d',
  hatType: 'crown',
  accessoryType: 'glasses',
  targetBuildingId: 'dashboard',
  motto: 'Welcome to EraVerse! Remember: English only please when chatting with classmates!',
  defaultScores: { reading: 9.0, listening: 9.0, writing: 9.0, speaking: 9.0 },
  isTeacherAdmin: true
};

// Every student account has a 100% unique character appearance, jacket color, headgear, eyewear, role title, specialty & default scores
export const REAL_IELTS_STUDENT_PROFILES: CanonicalStudentSpec[] = [
  {
    id: 'ielts1-suzie',
    email: 'burgerairflavor@gmail.com',
    name: 'Suzie',
    fullName: 'air "Suzie"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Listening Specialist',
    specialty: 'Part 4 Audio & Note Completion',
    avatarDetails: 'Rose Pink Jacket • Sport Cap • Study Glasses',
    shirtColor: '#ec4899',
    hairColor: '#451a03',
    skinColor: '#fef08a',
    hatType: 'cap',
    accessoryType: 'glasses',
    targetBuildingId: 'listening',
    motto: 'Hi, I am Suzie! Listening closely for every keyword in Part 4!',
    defaultScores: { reading: 7.5, listening: 8.0, writing: 6.5, speaking: 7.5 },
    isRealStudent: true
  },
  {
    id: 'ielts1-kai',
    email: 'cogiabao2808@gmail.com',
    name: 'Kai',
    fullName: 'Gia "Kai"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Reading Strategist',
    specialty: 'True / False / Not Given Analysis',
    avatarDetails: 'Royal Sapphire Jacket • Study Glasses',
    shirtColor: '#2563eb',
    hairColor: '#5c2d16',
    skinColor: '#fde68a',
    hatType: 'none',
    accessoryType: 'glasses',
    targetBuildingId: 'dashboard',
    motto: 'Hey, I am Kai! Checking my IELTS 1 Dashboard & Reading scores!',
    defaultScores: { reading: 8.0, listening: 7.5, writing: 7.0, speaking: 7.0 },
    isRealStudent: true
  },
  {
    id: 'ielts1-sophia',
    email: 'sachipi237@gmail.com',
    name: 'Sophia',
    fullName: 'Mint "Sophia"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Speaking Fluency Star',
    specialty: 'Speaking Part 2 & 3 Idiomatic Fluency',
    avatarDetails: 'Electric Violet Jacket • Graduation Cap',
    shirtColor: '#7c3aed',
    hairColor: '#1c1917',
    skinColor: '#fef3c7',
    hatType: 'grad',
    accessoryType: 'none',
    targetBuildingId: 'speaking',
    motto: 'Hello, I am Sophia! Practicing English speaking with my IELTS 1 classmates!',
    defaultScores: { reading: 7.0, listening: 7.5, writing: 6.5, speaking: 8.0 },
    isRealStudent: true
  },
  {
    id: 'ielts1-jack2',
    email: '10khoathcsntmk@gmail.com',
    name: 'Jack2',
    fullName: 'Vương "Jack2"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Audio & Speaking Ace',
    specialty: 'Fast Dialogue Tracking & Pronunciation',
    avatarDetails: 'Ocean Cyan Jacket • Studio Headset • Cool Shades',
    shirtColor: '#0284c7',
    hairColor: '#7c2d12',
    skinColor: '#fdba74',
    hatType: 'headphones',
    accessoryType: 'shades',
    targetBuildingId: 'practice_tests',
    motto: 'I am Jack2! Ready for Practice Tests and Campus Football!',
    defaultScores: { reading: 6.5, listening: 7.5, writing: 6.5, speaking: 7.5 },
    isRealStudent: true
  },
  {
    id: 'ielts1-may',
    email: 'phanthanhson464949@gmail.com',
    name: 'May',
    fullName: 'Ola "May"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Writing Task Architect',
    specialty: 'Task 1 Charts & Task 2 Essay Coherence',
    avatarDetails: 'Golden Amber Jacket • Crown • Study Glasses',
    shirtColor: '#d97706',
    hairColor: '#991b1b',
    skinColor: '#fef08a',
    hatType: 'crown',
    accessoryType: 'glasses',
    targetBuildingId: 'homework',
    motto: 'Hi, I am May! Structuring cohesive Band 8.0 Writing essays!',
    defaultScores: { reading: 7.5, listening: 7.0, writing: 8.0, speaking: 6.5 },
    isRealStudent: true
  },
  {
    id: 'ielts1-dragon',
    email: 'phanthanhphat.7a11@gmail.com',
    name: 'Dragon',
    fullName: 'phanthanh "Dragon"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Vocabulary Champion',
    specialty: 'Lexical Resource & Sports Striker',
    avatarDetails: 'Blaze Orange Jacket • Sport Cap • Cool Shades',
    shirtColor: '#ea580c',
    hairColor: '#1c1917',
    skinColor: '#fcd34d',
    hatType: 'cap',
    accessoryType: 'shades',
    targetBuildingId: 'practice_tests',
    motto: 'I am Dragon! Powering through IELTS tests and scoring goals!',
    defaultScores: { reading: 7.0, listening: 7.0, writing: 6.0, speaking: 7.5 },
    isRealStudent: true
  },
  {
    id: 'ielts1-emily',
    email: '7425842075@hcmdoet.edu.vn',
    name: 'Emily',
    fullName: 'Thái "Emily"',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Grammar & Reading Pro',
    specialty: 'Academic Passage Skimming & Accuracy',
    avatarDetails: 'Teal Emerald Jacket • Studio Headset • Study Glasses',
    shirtColor: '#0d9488',
    hairColor: '#3f2e21',
    skinColor: '#fef3c7',
    hatType: 'headphones',
    accessoryType: 'glasses',
    targetBuildingId: 'reading',
    motto: 'Hello, I am Emily! Aiming for top accuracy in Reading & Listening!',
    defaultScores: { reading: 8.5, listening: 7.5, writing: 7.5, speaking: 7.0 },
    isRealStudent: true
  },
  {
    id: 'ielts1-hailey',
    email: 'haileyera@student.era.edu',
    name: 'Hailey',
    fullName: 'Hailey',
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 All-Round Scholar',
    specialty: 'Full 4-Skill Mock Consistency',
    avatarDetails: 'Royal Indigo Jacket • Grad Cap • Cool Shades',
    shirtColor: '#4f46e5',
    hairColor: '#b45309',
    skinColor: '#fde68a',
    hatType: 'grad',
    accessoryType: 'shades',
    targetBuildingId: 'dashboard',
    motto: 'Hi, I am Hailey! Tracking my 4 skills inside the Dashboard Hall!',
    defaultScores: { reading: 7.5, listening: 8.0, writing: 7.0, speaking: 7.5 },
    isRealStudent: true
  },
  {
    id: 'ielts2-candy',
    email: 'candy@student.era.edu',
    name: 'Candy',
    fullName: 'Candy',
    cohort: 'IELTS 2',
    course: 'IELTS Course',
    roleTitle: 'IELTS 2 Senior Captain',
    specialty: 'Advanced Band 8.0+ Mastery',
    avatarDetails: 'Mint Emerald Jacket • Golden Crown',
    shirtColor: '#10b981',
    hairColor: '#dc2626',
    skinColor: '#fcd34d',
    hatType: 'crown',
    accessoryType: 'none',
    targetBuildingId: 'dashboard',
    motto: 'Representing IELTS 2! Let’s play football and check our scores!',
    defaultScores: { reading: 8.0, listening: 8.5, writing: 7.5, speaking: 8.0 },
    isRealStudent: true
  }
];

export function extractStudentNickname(u: any): string {
  if (u?.nickname && String(u.nickname).trim()) {
    return String(u.nickname).trim();
  }
  const rawName = String(u?.name || u?.displayName || '').trim();
  const quotedMatch = rawName.match(/"([^"]+)"/);
  if (quotedMatch && quotedMatch[1]) {
    return quotedMatch[1].trim();
  }
  const emailLower = String(u?.email || '').trim().toLowerCase();
  const matchedPreset = REAL_IELTS_STUDENT_PROFILES.find(
    (p) => p.email?.toLowerCase() === emailLower
  );
  if (matchedPreset) {
    return matchedPreset.name;
  }
  if (rawName) return rawName;
  if (u?.firstName && String(u.firstName).trim()) return String(u.firstName).trim();
  if (u?.username && String(u.username).trim()) return String(u.username).trim();
  if (emailLower) return emailLower.split('@')[0];
  return 'Student';
}

export function buildUniqueRosterFromFirestore(
  firestoreUsers: any[],
  firestoreFolders: Array<{ id: string; name: string; course: string }>
): CanonicalStudentSpec[] {
  const folderMap = new Map<string, string>();
  firestoreFolders.forEach((f) => {
    folderMap.set(f.id, f.name);
  });

  const extraShirtColors = [
    '#059669', '#db2777', '#9333ea', '#0891b2', '#65a30d', '#e11d48', '#2dd4bf', '#6366f1'
  ];
  const extraHairColors = ['#1c1917', '#451a03', '#7c2d12', '#991b1b', '#b45309'];
  const extraSkinColors = ['#fde68a', '#fcd34d', '#fef08a', '#fdba74'];
  const extraHats: Array<'cap' | 'grad' | 'crown' | 'headphones' | 'none'> = ['cap', 'grad', 'headphones', 'crown', 'none'];
  const extraAccessories: Array<'glasses' | 'shades' | 'none'> = ['glasses', 'shades', 'none'];
  const extraBuildings = ['dashboard', 'practice_tests', 'homework', 'speaking', 'reading', 'listening'];
  const extraSpecialties = [
    'Academic Reading & Vocabulary',
    'Listening Section 4 & Fluency',
    'Writing Task 2 Arguments',
    'Speaking Part 3 Discussion'
  ];

  // Start from a map keyed by lowercase nickname so no two characters ever share a nickname or look
  const rosterByNickname = new Map<string, CanonicalStudentSpec>();
  REAL_IELTS_STUDENT_PROFILES.forEach((preset) => {
    rosterByNickname.set(preset.name.toLowerCase(), { ...preset });
  });

  const ieltsUsers = firestoreUsers.filter((u) => {
    if (u.isDeleted) return false;
    const emailLower = String(u.email || '').toLowerCase();
    if (emailLower === 'janrelbugtay03@gmail.com' || String(u.name || '').toLowerCase() === 'teacher jan') {
      return false;
    }
    const courseUpper = String(u.course || '').toUpperCase();
    const fName = u.folderName || (u.folderId ? folderMap.get(u.folderId) : '') || '';
    const folderUpper = String(fName).toUpperCase();
    const isPresetEmail = REAL_IELTS_STUDENT_PROFILES.some((p) => p.email?.toLowerCase() === emailLower);
    return courseUpper.includes('IELTS') || folderUpper.includes('IELTS') || isPresetEmail;
  });

  let extraIdx = 0;
  ieltsUsers.forEach((u) => {
    const emailLower = String(u.email || '').trim().toLowerCase();
    const nickname = extractStudentNickname(u);
    const nickKey = nickname.toLowerCase();

    const fName = u.folderName || (u.folderId ? folderMap.get(u.folderId) : '') || '';
    const upperFolder = String(fName).toUpperCase();
    const cohort: 'IELTS 1' | 'IELTS 2' = upperFolder.includes('2') ? 'IELTS 2' : 'IELTS 1';

    // Match preset by email or nickname
    let existing = rosterByNickname.get(nickKey);
    if (!existing && emailLower) {
      for (const [k, val] of rosterByNickname.entries()) {
        if (val.email?.toLowerCase() === emailLower) {
          existing = val;
          rosterByNickname.delete(k);
          break;
        }
      }
    }

    if (existing) {
      rosterByNickname.set(nickKey, {
        ...existing,
        id: `real-${u.id}`,
        realUserId: u.id,
        email: u.email || existing.email,
        name: nickname,
        fullName: u.firstName && u.nickname ? `${u.firstName} "${u.nickname}"` : u.name || existing.fullName || nickname,
        cohort,
        roleTitle: existing.roleTitle.replace(/^IELTS [12]/, cohort),
        motto: u.motto || existing.motto,
        isRealStudent: true
      });
    } else {
      const shirtColor = extraShirtColors[extraIdx % extraShirtColors.length];
      const hatType = extraHats[extraIdx % extraHats.length];
      const accessoryType = extraAccessories[extraIdx % extraAccessories.length];
      const specialty = extraSpecialties[extraIdx % extraSpecialties.length];
      rosterByNickname.set(nickKey, {
        id: `real-${u.id}`,
        realUserId: u.id,
        email: u.email || undefined,
        name: nickname,
        fullName: u.firstName && u.nickname ? `${u.firstName} "${u.nickname}"` : u.name || nickname,
        cohort,
        course: 'IELTS Course',
        roleTitle: `${cohort} ${ ['Reading Scholar', 'Listening Pro', 'Speaking Star', 'Writing Specialist'][extraIdx % 4] }`,
        specialty,
        avatarDetails: `${shirtColor} Jacket • ${hatType === 'none' ? 'Natural Hair' : hatType.toUpperCase()} • ${accessoryType === 'none' ? 'Clear View' : accessoryType.toUpperCase()}`,
        shirtColor,
        hairColor: extraHairColors[extraIdx % extraHairColors.length],
        skinColor: extraSkinColors[extraIdx % extraSkinColors.length],
        hatType,
        accessoryType,
        targetBuildingId: extraBuildings[extraIdx % extraBuildings.length],
        motto: u.motto || `Hi, I am ${nickname} in ${cohort}! Checking my personalized IELTS dashboard!`,
        defaultScores: {
          reading: 6.5 + ((extraIdx % 4) * 0.5),
          listening: 7.0 + (((extraIdx + 1) % 4) * 0.5),
          writing: 6.0 + (((extraIdx + 2) % 4) * 0.5),
          speaking: 6.5 + (((extraIdx + 3) % 4) * 0.5)
        },
        isRealStudent: true
      });
      extraIdx++;
    }
  });

  return [TEACHER_JAN_PROFILE, ...Array.from(rosterByNickname.values())];
}

// Match the currently logged-in Firebase Auth user to their personal character under their nickname
export function findCharacterForAuthUser(
  authUser: { uid?: string; email?: string | null; displayName?: string | null } | null | undefined,
  isAdmin: boolean,
  roster: CanonicalStudentSpec[],
  firestoreUsers: any[]
): CanonicalStudentSpec | null {
  if (!authUser) return null;
  const emailLower = String(authUser.email || '').trim().toLowerCase();
  if (isAdmin || emailLower === 'janrelbugtay03@gmail.com') {
    return {
      ...TEACHER_JAN_PROFILE,
      realUserId: authUser.uid || TEACHER_JAN_PROFILE.realUserId
    };
  }

  // 1. Direct UID match in roster
  if (authUser.uid) {
    const byUid = roster.find((c) => c.realUserId === authUser.uid || c.id === `real-${authUser.uid}`);
    if (byUid) return byUid;
  }

  // 2. Direct email match in roster
  if (emailLower) {
    const byEmail = roster.find((c) => c.email?.toLowerCase() === emailLower);
    if (byEmail) {
      return {
        ...byEmail,
        realUserId: authUser.uid || byEmail.realUserId
      };
    }
  }

  // 3. Check firestoreUsers doc for this uid/email and extract nickname
  const fsUser = firestoreUsers.find(
    (u) => (authUser.uid && u.id === authUser.uid) || (emailLower && String(u.email || '').toLowerCase() === emailLower)
  );
  if (fsUser) {
    const nick = extractStudentNickname(fsUser).toLowerCase();
    const byNick = roster.find((c) => c.name.toLowerCase() === nick);
    if (byNick) {
      return {
        ...byNick,
        realUserId: fsUser.id,
        email: fsUser.email || byNick.email,
        name: extractStudentNickname(fsUser)
      };
    }
  }

  // 4. Match displayName or email prefix
  const disp = String(authUser.displayName || '').trim();
  if (disp) {
    const byDisp = roster.find(
      (c) =>
        c.name.toLowerCase() === disp.toLowerCase() ||
        c.fullName?.toLowerCase().includes(disp.toLowerCase())
    );
    if (byDisp) {
      return { ...byDisp, realUserId: authUser.uid || byDisp.realUserId };
    }
  }

  // 5. Construct a dedicated unique character for this logged-in student so they never use someone else's character
  const fallbackNickname = fsUser ? extractStudentNickname(fsUser) : disp || emailLower.split('@')[0] || 'Student';
  return {
    id: `real-${authUser.uid || fallbackNickname}`,
    realUserId: authUser.uid,
    email: authUser.email || undefined,
    name: fallbackNickname,
    fullName: fallbackNickname,
    cohort: 'IELTS 1',
    course: 'IELTS Course',
    roleTitle: 'IELTS 1 Student',
    specialty: '4-Skill IELTS Preparation',
    avatarDetails: 'Sapphire Jacket • Cap • Glasses',
    shirtColor: '#0284c7',
    hairColor: '#1c1917',
    skinColor: '#fde68a',
    hatType: 'cap',
    accessoryType: 'glasses',
    targetBuildingId: 'dashboard',
    motto: `Hi, I am ${fallbackNickname}! Checking my personalized IELTS dashboard!`,
    defaultScores: { reading: 7.0, listening: 7.5, writing: 6.5, speaking: 7.0 },
    isRealStudent: true
  };
}

// Deterministic fallback band score (6.0 - 8.5) if custom character not in preset map
function getSeededScore(name: string, skillOffset: number, isIelts2: boolean): number {
  const preset = REAL_IELTS_STUDENT_PROFILES.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
  if (preset) {
    if (skillOffset === 1) return preset.defaultScores.reading;
    if (skillOffset === 2) return preset.defaultScores.listening;
    if (skillOffset === 3) return preset.defaultScores.writing;
    if (skillOffset === 4) return preset.defaultScores.speaking;
  }
  let hash = skillOffset * 37;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33 + name.charCodeAt(i) * (i + 1)) % 1000;
  }
  const base = isIelts2 ? 6.5 : 6.0;
  const steps = [0, 0.5, 1.0, 1.5, 2.0];
  return Math.min(9.0, base + steps[hash % steps.length]);
}

function getFallbackSkillFromAssignmentId(assignmentId: any, titleStr: string): SkillKey | null {
  const lower = (titleStr || '').toLowerCase();
  if (lower.includes('reading')) return 'reading';
  if (lower.includes('listening')) return 'listening';
  if (lower.includes('writing')) return 'writing';
  if (lower.includes('speaking') || assignmentId === 'offline_speaking') return 'speaking';

  const numId = parseInt(String(assignmentId), 10);
  if (!isNaN(numId) && numId >= 1 && numId <= 100) {
    if (numId % 4 === 1) return 'reading';
    if (numId % 4 === 2) return 'listening';
    if (numId % 4 === 3) return 'writing';
    if (numId % 4 === 0) return 'speaking';
  }
  return null;
}

export function computeStudentSkillScores(
  character: {
    id: string;
    realUserId?: string;
    email?: string;
    name: string;
    fullName?: string;
    cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
    roleTitle: string;
    specialty?: string;
    avatarDetails?: string;
    shirtColor: string;
  },
  allSubmissions: any[]
): StudentSkillScores {
  const preset = REAL_IELTS_STUDENT_PROFILES.find(
    (p) =>
      p.name.toLowerCase() === character.name.trim().toLowerCase() ||
      (character.email && p.email?.toLowerCase() === character.email.toLowerCase())
  );

  if (character.cohort === 'TEACHER (SUPER ADMIN)' || character.name.toLowerCase().includes('teacher jan')) {
    return {
      id: character.id,
      userId: character.realUserId,
      email: character.email || TEACHER_JAN_PROFILE.email,
      name: character.name,
      fullName: character.fullName || character.name,
      cohort: 'TEACHER (SUPER ADMIN)',
      roleTitle: 'Teacher (Super Admin)',
      specialty: TEACHER_JAN_PROFILE.specialty,
      avatarDetails: TEACHER_JAN_PROFILE.avatarDetails,
      reading: 9.0,
      listening: 9.0,
      writing: 9.0,
      speaking: 9.0,
      overall: 9.0,
      submissionsCount: allSubmissions.length,
      shirtColor: character.shirtColor,
      recentSubmissions: []
    };
  }

  const rawUid = character.realUserId || (character.id.startsWith('real-') ? character.id.replace(/^real-/, '') : '');
  const charNameLower = character.name.trim().toLowerCase();
  const fullNameLower = (character.fullName || preset?.fullName || '').trim().toLowerCase();
  const emailLower = (character.email || preset?.email || '').trim().toLowerCase();

  const userSubs = allSubmissions.filter((s) => {
    if (rawUid && s.userId === rawUid) return true;
    if (emailLower && String(s.userEmail || s.email || '').trim().toLowerCase() === emailLower) return true;
    const subName = String(s.userName || s.studentName || s.candidateName || '').trim().toLowerCase();
    if (!subName) return false;
    if (subName === charNameLower) return true;
    if (fullNameLower && (subName === fullNameLower || fullNameLower.includes(`"${subName}"`))) return true;
    return false;
  });

  const bySkill: Record<SkillKey, number[]> = {
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  };

  const recentSubmissions: SkillSubmissionSummary[] = [];

  userSubs.forEach((s) => {
    const band = typeof s.bandScore === 'number' ? s.bandScore : parseFloat(s.bandScore);
    const skill =
      (s.assignmentType as SkillKey) ||
      getFallbackSkillFromAssignmentId(s.assignmentId, s.assignmentTitle || s.title || '');
    if (!skill || !bySkill[skill]) return;

    const validBand = !isNaN(band) && band > 0 ? band : getSeededScore(character.name, 1, character.cohort === 'IELTS 2');
    if (!isNaN(band) && band > 0) {
      bySkill[skill].push(band);
    }

    const rawTime = s.createdAt?.toMillis
      ? s.createdAt.toMillis()
      : typeof s.createdAt === 'number'
      ? s.createdAt
      : Date.now();
    const d = new Date(rawTime);
    const dateStr = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;

    recentSubmissions.push({
      id: s.id || `${skill}-${recentSubmissions.length}`,
      title: s.assignmentTitle || s.title || `IELTS ${skill.charAt(0).toUpperCase() + skill.slice(1)} Practice`,
      skill,
      bandScore: Math.round(validBand * 2) / 2,
      dateStr
    });
  });

  const avgOrFallback = (arr: number[], offset: number) => {
    if (arr.length > 0) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.round(avg * 2) / 2;
    }
    return getSeededScore(character.name, offset, character.cohort === 'IELTS 2');
  };

  const reading = avgOrFallback(bySkill.reading, 1);
  const listening = avgOrFallback(bySkill.listening, 2);
  const writing = avgOrFallback(bySkill.writing, 3);
  const speaking = avgOrFallback(bySkill.speaking, 4);
  const overall = Math.round(((reading + listening + writing + speaking) / 4) * 2) / 2;

  return {
    id: character.id,
    userId: rawUid || undefined,
    email: character.email || preset?.email,
    name: character.name,
    fullName: character.fullName || preset?.fullName || character.name,
    cohort: character.cohort,
    roleTitle: character.roleTitle || preset?.roleTitle || `${character.cohort} Student`,
    specialty: character.specialty || preset?.specialty || 'IELTS 4-Skill Mastery',
    avatarDetails: character.avatarDetails || preset?.avatarDetails || 'Custom Student Avatar',
    reading,
    listening,
    writing,
    speaking,
    overall,
    submissionsCount: userSubs.length,
    shirtColor: character.shirtColor,
    recentSubmissions: recentSubmissions.slice(0, 12)
  };
}

// ============================================================================
// VIETNAMESE DETECTOR (ENFORCES "ENGLISH ONLY PLEASE")
// ============================================================================
const VIETNAMESE_DIACRITICS_REGEX =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỖÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

const VIETNAMESE_UNACCENTED_WORDS = new Set([
  'xin', 'chao', 'khong', 'duoc', 'nhung', 'nguoi', 'biet', 'cam', 'tam',
  'ban', 'minh', 'chung', 'tui', 'tao', 'uhm', 'vay', 'troi', 'nha',
  'nhe', 'vang', 'chua', 'luon', 'qua', 'hoc', 'bai', 'thay', 'giao',
  'cai', 'nay', 'kia', 'dau', 'sao', 'roi', 'dang', 'cung', 'rat',
  'lam', 'anh', 'chi', 'em', 'oi', 'ha', 'di', 'an', 'uong', 'ngu'
]);

const VIETNAMESE_PHRASES = [
  'xin chao',
  'chao ban',
  'cam on',
  'tam biet',
  'lam gi',
  'di dau',
  'o dau',
  'sao vay',
  'the nao',
  'troi oi',
  'ban oi',
  'anh oi',
  'chi oi',
  'co giao',
  'thay giao',
  'khong biet',
  'duoc khong',
  'hoc bai',
  'bai tap'
];

export function checkEnglishOnlyMessage(rawText: string): { allowed: boolean; reason?: string } {
  const trimmed = rawText.trim();
  if (!trimmed) return { allowed: false, reason: 'Empty message' };

  if (VIETNAMESE_DIACRITICS_REGEX.test(trimmed)) {
    return {
      allowed: false,
      reason: 'English only please! Do not use Vietnamese in EraVerse chat.'
    };
  }

  const lower = trimmed.toLowerCase().replace(/[.,!?'"()]/g, ' ');
  for (const phrase of VIETNAMESE_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        allowed: false,
        reason: 'English only please! Please speak in English with your classmates.'
      };
    }
  }

  const tokens = lower.split(/\s+/).filter(Boolean);
  let vnWordMatches = 0;
  for (const t of tokens) {
    if (VIETNAMESE_UNACCENTED_WORDS.has(t)) {
      vnWordMatches++;
    }
  }

  if (vnWordMatches >= 2 || (tokens.length === 1 && VIETNAMESE_UNACCENTED_WORDS.has(tokens[0]))) {
    return {
      allowed: false,
      reason: 'English only please! Please type your message in English.'
    };
  }

  return { allowed: true };
}

export function generateEnglishPartnerReply(
  partnerName: string,
  partnerCohort: string,
  userMessage: string
): string {
  const lower = userMessage.toLowerCase();
  const isTeacherJan = partnerCohort.includes('TEACHER') || partnerName.toLowerCase().includes('jan');

  if (isTeacherJan) {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hello! I'm Teacher Jan (Super Admin). Great job speaking in English today!`;
    }
    if (lower.includes('score') || lower.includes('band') || lower.includes('dashboard')) {
      return `Check the Dashboard Hall! All walls show your personal Listening, Reading, Writing & Speaking scores!`;
    }
    if (lower.includes('play') || lower.includes('football') || lower.includes('pickleball') || lower.includes('sport')) {
      return `Let's head to the Sports Park! Use Jump, Crouch, Kick, and Hit to score goals!`;
    }
    return `Wonderful English sentence! Keep practicing your IELTS Speaking and Writing skills!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hey there! I'm ${partnerName} (${partnerCohort}). Want to check our Dashboard Hall or play football?`;
  }
  if (lower.includes('football') || lower.includes('soccer') || lower.includes('kick') || lower.includes('goal')) {
    return `Let's play at the Football Field! Press Kick (F) or Crouch (C) to slide-tackle and score!`;
  }
  if (lower.includes('pickleball') || lower.includes('hit') || lower.includes('court')) {
    return `Pickleball is super fun! Use the Hit button when the ball bounces on your side!`;
  }
  if (lower.includes('score') || lower.includes('band') || lower.includes('test') || lower.includes('dashboard')) {
    return `I just checked our ${partnerCohort} Dashboard Hall! Love seeing Listening, Reading, Writing & Speaking on the walls!`;
  }
  return `Awesome! Speaking English together in ${partnerCohort} really helps our IELTS Speaking fluency!`;
}

// ============================================================================
// 3D SPEECH BUBBLE SPRITE ABOVE CHARACTERS
// ============================================================================
export function createSpeechBubbleSprite(speakerName: string, message: string, isWarning = false): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 180;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = isWarning ? 'rgba(185, 28, 28, 0.96)' : 'rgba(15, 23, 42, 0.94)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 136, 26);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = isWarning ? '#fca5a5' : '#38bdf8';
  ctx.stroke();

  // Speech pointer triangle at bottom center
  ctx.beginPath();
  ctx.moveTo(238, 148);
  ctx.lineTo(256, 172);
  ctx.lineTo(274, 148);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = isWarning ? '#fef08a' : '#38bdf8';
  ctx.font = '800 20px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isWarning ? '⚠️ ENGLISH ONLY PLEASE' : `💬 ${speakerName}`, 256, 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 22px Plus Jakarta Sans, sans-serif';
  const words = message.split(' ');
  let line1 = '';
  let line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 36) {
      line1 = (line1 + ' ' + w).trim();
    } else if ((line2 + ' ' + w).trim().length <= 36) {
      line2 = (line2 + ' ' + w).trim();
    }
  }
  if (line2) {
    ctx.fillText(line1, 256, 84);
    ctx.fillText(line2, 256, 116);
  } else {
    ctx.fillText(line1, 256, 98);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  );
  sprite.scale.set(4.2, 1.48, 1);
  sprite.position.set(0, 4.85, 0);
  return sprite;
}

// ============================================================================
// 3D WALL BOARD TEXTURES FOR DASHBOARD HALL:
// 1. MY PERSONAL OVERVIEW DASHBOARD (Back-Left Wall)
// 2. MY CLASS DASHBOARD (Back-Right Wall)
// 3. SKILL-SPECIFIC WALL DASHBOARDS: LISTENING, READING, WRITING, SPEAKING (Left & Right Walls)
// ============================================================================
export function createPersonalDashboardWallTexture(
  stats: StudentSkillScores,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(10, 10, 1004, 620, 32);
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#2563EB';
  ctx.stroke();

  // Header Banner
  const grad = ctx.createLinearGradient(24, 24, 980, 140);
  grad.addColorStop(0, '#1e3a8a');
  grad.addColorStop(1, '#2563eb');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(28, 28, 968, 128, 22);
  ctx.fill();

  ctx.fillStyle = '#93c5fd';
  ctx.font = '800 21px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`PERSONAL IELTS DASHBOARD • ${stats.cohort} • ${stats.specialty.toUpperCase()}`, 52, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${stats.name}'s Dashboard`, 52, 126);

  // Overall Band Badge on Right of Header
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.roundRect(750, 44, 220, 96, 18);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.font = '800 18px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('OVERALL BAND', 860, 74);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
  ctx.fillText(stats.overall.toFixed(1), 860, 124);

  // 4 Skill Cards (Listening, Reading, Writing, Speaking)
  const skillCards = [
    { label: 'LISTENING', score: stats.listening, bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
    { label: 'READING', score: stats.reading, bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
    { label: 'WRITING', score: stats.writing, bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
    { label: 'SPEAKING', score: stats.speaking, bg: '#faf5ff', border: '#a855f7', text: '#7e22ce' }
  ];

  skillCards.forEach((sc, idx) => {
    const x = 36 + idx * 240;
    const y = 188;
    const w = 222;
    const h = 270;

    ctx.fillStyle = sc.bg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 24);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = sc.border;
    ctx.stroke();

    ctx.fillStyle = sc.text;
    ctx.font = '900 24px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sc.label, x + w / 2, y + 56);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 72px Plus Jakarta Sans, sans-serif';
    ctx.fillText(sc.score.toFixed(1), x + w / 2, y + 165);

    ctx.fillStyle = '#64748b';
    ctx.font = '700 20px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Band Score', x + w / 2, y + 225);
  });

  // Bottom CTA Bar
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.roundRect(212, 496, 600, 92, 46);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CLICK OR PRESS E • OPEN ${stats.name.toUpperCase()}'S DASHBOARD`, 512, 552);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createClassDashboardWallTexture(
  cohortTitle: string,
  students: StudentSkillScores[],
  activeStudentName: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(10, 10, 1004, 620, 32);
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#059669';
  ctx.stroke();

  // Header
  const grad = ctx.createLinearGradient(24, 24, 980, 130);
  grad.addColorStop(0, '#065f46');
  grad.addColorStop(1, '#10b981');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(28, 28, 968, 112, 22);
  ctx.fill();

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '800 20px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`REAL STUDENT NICKNAMES • ${cohortTitle} CLASSMATES`, 52, 66);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${cohortTitle} Class Dashboard (${students.length} Students)`, 52, 114);

  // Table Header Row
  const tableY = 154;
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(34, tableY, 956, 44, 12);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.font = '900 19px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NICKNAME', 54, tableY + 29);
  ctx.textAlign = 'center';
  ctx.fillText('READING', 450, tableY + 29);
  ctx.fillText('LISTENING', 585, tableY + 29);
  ctx.fillText('WRITING', 720, tableY + 29);
  ctx.fillText('SPEAKING', 845, tableY + 29);
  ctx.fillText('OVERALL', 945, tableY + 29);

  // Up to 7 rows on the 3D Wall Board
  const visibleRows = students.slice(0, 7);
  visibleRows.forEach((st, idx) => {
    const rowY = tableY + 50 + idx * 48;
    const isMe = st.name.toLowerCase() === activeStudentName.toLowerCase();

    ctx.fillStyle = isMe ? '#dbeafe' : idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(34, rowY, 956, 43, 10);
    ctx.fill();
    if (isMe) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = isMe ? '900 21px Plus Jakarta Sans, sans-serif' : '800 20px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${idx + 1}. ${st.name.slice(0, 18)}${isMe ? ' (You)' : ''}`, 54, rowY + 29);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(st.reading.toFixed(1), 450, rowY + 29);
    ctx.fillStyle = '#0f766e';
    ctx.fillText(st.listening.toFixed(1), 585, rowY + 29);
    ctx.fillStyle = '#b45309';
    ctx.fillText(st.writing.toFixed(1), 720, rowY + 29);
    ctx.fillStyle = '#7e22ce';
    ctx.fillText(st.speaking.toFixed(1), 845, rowY + 29);

    ctx.fillStyle = '#059669';
    ctx.font = '900 22px Plus Jakarta Sans, sans-serif';
    ctx.fillText(st.overall.toFixed(1), 945, rowY + 29);
  });

  // Footer CTA
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(212, 548, 600, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CLICK OR PRESS E • VIEW ALL ${cohortTitle} CLASS SCORES`, 512, 588);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

// Dedicated 3D Wall Board Texture for each of the 4 skills (Listening, Reading, Writing, Speaking) on the Side Walls
export function createSkillDashboardWallTexture(
  stats: StudentSkillScores,
  skill: SkillKey,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 960;
  c.height = 600;
  const ctx = c.getContext('2d')!;

  const themeMap: Record<
    SkillKey,
    {
      title: string;
      gradStart: string;
      gradEnd: string;
      border: string;
      softBg: string;
      badgeBg: string;
      criteria: Array<{ label: string; delta: number }>;
      defaultTasks: string[];
    }
  > = {
    listening: {
      title: 'Listening Dashboard',
      gradStart: '#0f766e',
      gradEnd: '#0d9488',
      border: '#14b8a6',
      softBg: '#f0fdfa',
      badgeBg: '#ccfbf1',
      criteria: [
        { label: 'Section 1 • Everyday Dialogue', delta: 0.5 },
        { label: 'Section 2 • Campus Monologue', delta: 0.0 },
        { label: 'Section 3 • Academic Discussion', delta: 0.0 },
        { label: 'Section 4 • University Lecture', delta: -0.5 }
      ],
      defaultTasks: [
        'IELTS Listening Test 1 (40 Questions)',
        'IELTS Listening Homework — Audio Lab',
        'Part 4 Academic Note Completion'
      ]
    },
    reading: {
      title: 'Reading Dashboard',
      gradStart: '#1e3a8a',
      gradEnd: '#2563eb',
      border: '#3b82f6',
      softBg: '#eff6ff',
      badgeBg: '#dbeafe',
      criteria: [
        { label: 'True / False / Not Given', delta: 0.5 },
        { label: 'Matching Headings & Paragraph', delta: 0.0 },
        { label: 'Summary & Gap Completion', delta: 0.0 },
        { label: 'Passage 3 Academic Analysis', delta: -0.5 }
      ],
      defaultTasks: [
        'IELTS Reading Test 1 — What Lucy Taught Us',
        'IELTS Reading Homework Comprehension',
        'Academic Passage Timing Drill'
      ]
    },
    writing: {
      title: 'Writing Dashboard',
      gradStart: '#92400e',
      gradEnd: '#d97706',
      border: '#f59e0b',
      softBg: '#fffbeb',
      badgeBg: '#fef3c7',
      criteria: [
        { label: 'Task Achievement & Response', delta: 0.0 },
        { label: 'Coherence & Paragraph Cohesion', delta: 0.5 },
        { label: 'Lexical Resource (Vocabulary)', delta: 0.0 },
        { label: 'Grammatical Range & Accuracy', delta: -0.5 }
      ],
      defaultTasks: [
        'IELTS Writing Homework 1 (Task 1 & 2)',
        'Academic Task 1 Data Report Chart',
        'Task 2 Argumentative Essay Practice'
      ]
    },
    speaking: {
      title: 'Speaking Dashboard',
      gradStart: '#581c87',
      gradEnd: '#7e22ce',
      border: '#a855f7',
      softBg: '#faf5ff',
      badgeBg: '#f3e8ff',
      criteria: [
        { label: 'Fluency & Topic Coherence', delta: 0.5 },
        { label: 'Lexical Resource & Idioms', delta: 0.0 },
        { label: 'Grammatical Range & Accuracy', delta: 0.0 },
        { label: 'Pronunciation & Intonation', delta: 0.0 }
      ],
      defaultTasks: [
        'IELTS Speaking Homework 1–3 Recordings',
        'Speaking Part 2 Cue Card Simulation',
        'Face-to-Face Mock Speaking Practice'
      ]
    }
  };

  const cfg = themeMap[skill];
  const mainScore = stats[skill];

  // Outer card
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(10, 10, 940, 580, 30);
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = cfg.border;
  ctx.stroke();

  // Top Header Banner
  const grad = ctx.createLinearGradient(26, 26, 930, 136);
  grad.addColorStop(0, cfg.gradStart);
  grad.addColorStop(1, cfg.gradEnd);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(26, 26, 908, 118, 22);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '800 19px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`PERSONAL ${skill.toUpperCase()} WALL • ${stats.name.toUpperCase()} (${stats.cohort})`, 50, 64);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${stats.name}'s ${cfg.title}`, 50, 116);

  // Right Band Score Box
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.roundRect(710, 38, 204, 94, 18);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.font = '800 16px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${skill.toUpperCase()} BAND`, 812, 66);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
  ctx.fillText(mainScore.toFixed(1), 812, 116);

  // Left Column: 4 Skill Criteria Breakdown Bars
  ctx.fillStyle = cfg.softBg;
  ctx.beginPath();
  ctx.roundRect(30, 162, 440, 326, 22);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = cfg.border;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 21px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${skill.toUpperCase()} CRITERIA BREAKDOWN`, 52, 198);

  cfg.criteria.forEach((crit, idx) => {
    const cy = 224 + idx * 62;
    const subBand = Math.max(5.0, Math.min(9.0, Math.round((mainScore + crit.delta) * 2) / 2));
    const pct = Math.min(1, subBand / 9.0);

    ctx.fillStyle = '#334155';
    ctx.font = '800 17px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(crit.label, 52, cy);

    ctx.fillStyle = cfg.gradStart;
    ctx.font = '900 18px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Band ${subBand.toFixed(1)}`, 448, cy);

    // Progress Bar Track
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(52, cy + 10, 396, 16, 8);
    ctx.fill();

    // Progress Bar Fill
    ctx.fillStyle = cfg.gradEnd;
    ctx.beginPath();
    ctx.roundRect(52, cy + 10, Math.round(396 * pct), 16, 8);
    ctx.fill();
  });

  // Right Column: Student's Recent Submissions & Progress for this Skill
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(490, 162, 440, 326, 22);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  const skillSubs = stats.recentSubmissions.filter((s) => s.skill === skill);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 21px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`RECENT ${skill.toUpperCase()} RECORD (${skillSubs.length || 3})`, 512, 198);

  const itemsToDraw =
    skillSubs.length > 0
      ? skillSubs.slice(0, 3).map((s) => ({
          title: s.title,
          meta: `Submitted ${s.dateStr}`,
          band: s.bandScore.toFixed(1)
        }))
      : cfg.defaultTasks.map((t, i) => ({
          title: t,
          meta: `${stats.cohort} Tracked Skill`,
          band: Math.max(5.5, Math.min(9.0, mainScore + (i === 0 ? 0.5 : i === 2 ? -0.5 : 0))).toFixed(1)
        }));

  itemsToDraw.forEach((item, idx) => {
    const ry = 216 + idx * 84;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(510, ry, 400, 70, 14);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 18px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.title.slice(0, 28), 526, ry + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '700 15px Plus Jakarta Sans, sans-serif';
    ctx.fillText(item.meta, 526, ry + 54);

    // Band Pill
    ctx.fillStyle = cfg.badgeBg;
    ctx.beginPath();
    ctx.roundRect(816, ry + 15, 78, 40, 12);
    ctx.fill();
    ctx.fillStyle = cfg.gradStart;
    ctx.font = '900 20px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.band, 855, ry + 42);
  });

  // Bottom CTA Bar
  ctx.fillStyle = cfg.gradEnd;
  ctx.beginPath();
  ctx.roundRect(180, 506, 600, 64, 32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 23px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CLICK OR PRESS E • OPEN ${stats.name.toUpperCase()}'S ${skill.toUpperCase()} DETAILS`, 480, 546);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
