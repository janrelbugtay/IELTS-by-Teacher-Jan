import * as THREE from 'three';

export interface StudentSkillScores {
  id: string;
  userId?: string;
  name: string;
  cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
  roleTitle: string;
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
  overall: number;
  submissionsCount: number;
  shirtColor: string;
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

export const TEACHER_JAN_PROFILE = {
  id: 'teacher-jan-super-admin',
  realUserId: 'teacher-jan',
  name: 'Teacher Jan',
  cohort: 'TEACHER (SUPER ADMIN)' as const,
  course: 'IELTS Course' as const,
  roleTitle: 'Teacher (Super Admin)',
  shirtColor: '#dc2626',
  hairColor: '#1c1917',
  skinColor: '#fcd34d',
  hatType: 'crown' as const,
  accessoryType: 'glasses' as const,
  targetBuildingId: 'dashboard',
  motto: 'Welcome to EraVerse! Remember: English only please when chatting with classmates!',
  isTeacherAdmin: true
};

// Deterministic fallback band score (6.0 - 8.5) so every student in IELTS 1 or IELTS 2 has realistic skill scores if they haven't submitted a test yet
function getSeededScore(name: string, skillOffset: number, isIelts2: boolean): number {
  let hash = skillOffset * 31;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 33 + name.charCodeAt(i)) % 1000;
  }
  const base = isIelts2 ? 6.5 : 6.0;
  const steps = [0, 0.5, 1.0, 1.5, 2.0];
  return Math.min(9.0, base + steps[hash % steps.length]);
}

function getFallbackSkillFromAssignmentId(assignmentId: any, titleStr: string): 'reading' | 'listening' | 'writing' | 'speaking' | null {
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
    name: string;
    cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
    roleTitle: string;
    shirtColor: string;
  },
  allSubmissions: any[]
): StudentSkillScores {
  if (character.cohort === 'TEACHER (SUPER ADMIN)' || character.name.toLowerCase().includes('teacher jan')) {
    return {
      id: character.id,
      userId: character.realUserId,
      name: character.name,
      cohort: 'TEACHER (SUPER ADMIN)',
      roleTitle: 'Teacher (Super Admin)',
      reading: 9.0,
      listening: 9.0,
      writing: 9.0,
      speaking: 9.0,
      overall: 9.0,
      submissionsCount: allSubmissions.length,
      shirtColor: character.shirtColor
    };
  }

  const rawUid = character.realUserId || (character.id.startsWith('real-') ? character.id.replace(/^real-/, '') : '');
  const charNameLower = character.name.trim().toLowerCase();

  const userSubs = allSubmissions.filter((s) => {
    if (rawUid && s.userId === rawUid) return true;
    const subName = String(s.userName || s.studentName || s.candidateName || '').trim().toLowerCase();
    return subName && subName === charNameLower;
  });

  const bySkill: Record<'reading' | 'listening' | 'writing' | 'speaking', number[]> = {
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  };

  userSubs.forEach((s) => {
    const band = typeof s.bandScore === 'number' ? s.bandScore : parseFloat(s.bandScore);
    if (isNaN(band) || band <= 0) return;
    const skill =
      (s.assignmentType as 'reading' | 'listening' | 'writing' | 'speaking') ||
      getFallbackSkillFromAssignmentId(s.assignmentId, s.assignmentTitle || s.title || '');
    if (skill && bySkill[skill]) {
      bySkill[skill].push(band);
    }
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
    name: character.name,
    cohort: character.cohort,
    roleTitle: character.roleTitle,
    reading,
    listening,
    writing,
    speaking,
    overall,
    submissionsCount: userSubs.length,
    shirtColor: character.shirtColor
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
      return `Check the Dashboard Hall! I updated both your Personal Dashboard and your ${partnerCohort.includes('2') ? 'IELTS 2' : 'Class'} Scoreboard.`;
    }
    if (lower.includes('play') || lower.includes('football') || lower.includes('pickleball') || lower.includes('sport')) {
      return `Let's head to the Sports Park! Use Jump, Crouch, Kick, and Hit to score goals!`;
    }
    return `Wonderful English sentence! Keep practicing your IELTS Speaking and Writing skills!`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hey there! Good to see you in ${partnerCohort}! Want to check our Class Dashboard or play football?`;
  }
  if (lower.includes('football') || lower.includes('soccer') || lower.includes('kick') || lower.includes('goal')) {
    return `Let's play at the Football Field! Press Kick (F) or Crouch (C) to slide-tackle and score!`;
  }
  if (lower.includes('pickleball') || lower.includes('hit') || lower.includes('court')) {
    return `Pickleball is super fun! Use the Hit button when the ball bounces on your side!`;
  }
  if (lower.includes('score') || lower.includes('band') || lower.includes('test') || lower.includes('dashboard')) {
    return `I just checked our ${partnerCohort} Class Dashboard wall inside Dashboard Hall! Let's aim for Band 8.0!`;
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
// 3D WALL BOARD TEXTURES FOR DASHBOARD HALL (MY PERSONAL DASHBOARD & MY CLASS DASHBOARD)
// ============================================================================
export function createPersonalDashboardWallTexture(
  stats: StudentSkillScores,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d')!;

  // Crisp bright card background
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
  ctx.font = '800 22px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`PERSONAL IELTS DASHBOARD • ${stats.cohort}`, 56, 72);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${stats.name}'s Dashboard`, 56, 126);

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

  // 4 Skill Cards (Reading, Listening, Writing, Speaking)
  const skillCards = [
    { label: 'READING', score: stats.reading, bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
    { label: 'LISTENING', score: stats.listening, bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e' },
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
  ctx.roundRect(232, 496, 560, 92, 46);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLICK OR PRESS E • OPEN MY DASHBOARD', 512, 552);

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
  ctx.fillText(`EXCLUSIVE CLASS GROUP SCOREBOARD • ONLY ${cohortTitle} STUDENTS`, 52, 66);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`${cohortTitle} Class Dashboard (${students.length} Students)`, 52, 114);

  // Table Header Row
  const tableY = 158;
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(34, tableY, 956, 48, 12);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.font = '900 20px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('STUDENT NAME', 56, tableY + 31);
  ctx.textAlign = 'center';
  ctx.fillText('READING', 450, tableY + 31);
  ctx.fillText('LISTENING', 585, tableY + 31);
  ctx.fillText('WRITING', 720, tableY + 31);
  ctx.fillText('SPEAKING', 845, tableY + 31);
  ctx.fillText('OVERALL', 945, tableY + 31);

  // Up to 6 rows on the 3D Wall Board (full list in interactive modal)
  const visibleRows = students.slice(0, 6);
  visibleRows.forEach((st, idx) => {
    const rowY = tableY + 56 + idx * 54;
    const isMe = st.name.toLowerCase() === activeStudentName.toLowerCase();

    ctx.fillStyle = isMe ? '#dbeafe' : idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(34, rowY, 956, 48, 10);
    ctx.fill();
    if (isMe) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = isMe ? '900 22px Plus Jakarta Sans, sans-serif' : '800 21px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${idx + 1}. ${st.name.slice(0, 18)}${isMe ? ' (You)' : ''}`, 56, rowY + 32);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(st.reading.toFixed(1), 450, rowY + 32);
    ctx.fillStyle = '#0f766e';
    ctx.fillText(st.listening.toFixed(1), 585, rowY + 32);
    ctx.fillStyle = '#b45309';
    ctx.fillText(st.writing.toFixed(1), 720, rowY + 32);
    ctx.fillStyle = '#7e22ce';
    ctx.fillText(st.speaking.toFixed(1), 845, rowY + 32);

    ctx.fillStyle = '#059669';
    ctx.font = '900 23px Plus Jakarta Sans, sans-serif';
    ctx.fillText(st.overall.toFixed(1), 945, rowY + 32);
  });

  // Footer CTA
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(212, 542, 600, 68, 34);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 25px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CLICK OR PRESS E • VIEW FULL ${cohortTitle} SCORE TABLE`, 512, 584);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
