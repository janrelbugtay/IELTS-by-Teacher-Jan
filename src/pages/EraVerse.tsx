import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useNavigate } from 'react-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Users,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  ArrowRight,
  LogOut,
  X,
  Clock,
  BarChart,
  Gamepad2,
  Volume2,
  VolumeX,
  Settings,
  Music,
  Trophy,
  Sliders,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import {
  TEACHER_JAN_PROFILE,
  REAL_IELTS_STUDENT_PROFILES,
  buildUniqueRosterFromFirestore,
  findCharacterForAuthUser,
  computeStudentSkillScores,
  checkEnglishOnlyMessage,
  generateEnglishPartnerReply,
  createSpeechBubbleSprite,
  createPersonalDashboardWallTexture,
  createClassDashboardWallTexture,
  createSkillDashboardWallTexture,
  ChatMessageItem
} from '../utils/eraverseFeatures';
import {
  SportsSideActionsHud,
  ProximityEnglishChat,
  DashboardHallModals,
  DashboardModalType
} from '../components/EraVerseModalsAndHud';

// ============================================================================
// PROCEDURAL WEB AUDIO ENGINE + ROOM SONG SYNTHESIZER
// ============================================================================
interface RoomSongSpec {
  name: string;
  tempoMs: number;
  wave: OscillatorType;
  notes: number[];
  bassNotes: number[];
}

const ROOM_SONGS: Record<string, RoomSongSpec> = {
  campus: {
    name: 'Sunny EraVerse Campus Breeze',
    tempoMs: 360,
    wave: 'triangle',
    notes: [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0],
    bassNotes: [261.63, 261.63, 220.0, 220.0, 174.61, 174.61, 196.0, 196.0]
  },
  practice_tests: {
    name: 'Practice Arena Focus Beats',
    tempoMs: 320,
    wave: 'sine',
    notes: [440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 587.33, 440.0, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0],
    bassNotes: [220.0, 220.0, 196.0, 196.0, 174.61, 174.61, 164.81, 164.81]
  },
  homework: {
    name: 'Homework Hub Lo-Fi Study Groove',
    tempoMs: 420,
    wave: 'sine',
    notes: [392.0, 493.88, 587.33, 783.99, 659.25, 587.33, 493.88, 440.0, 392.0, 440.0, 493.88, 659.25, 587.33, 493.88, 440.0, 392.0],
    bassNotes: [196.0, 196.0, 164.81, 164.81, 146.83, 146.83, 196.0, 196.0]
  },
  dashboard: {
    name: 'IELTS Academy Grand Symphony',
    tempoMs: 380,
    wave: 'triangle',
    notes: [587.33, 739.99, 880.0, 1174.66, 880.0, 739.99, 659.25, 587.33, 659.25, 739.99, 880.0, 987.77, 880.0, 739.99, 659.25, 587.33],
    bassNotes: [293.66, 293.66, 246.94, 246.94, 220.0, 220.0, 196.0, 196.0]
  },
  speaking: {
    name: 'Speaking Studio Upbeat Lounge',
    tempoMs: 300,
    wave: 'triangle',
    notes: [523.25, 622.25, 698.46, 783.99, 932.33, 783.99, 698.46, 622.25, 523.25, 698.46, 783.99, 1046.5, 932.33, 783.99, 698.46, 523.25],
    bassNotes: [261.63, 293.66, 311.13, 349.23, 261.63, 293.66, 311.13, 261.63]
  },
  reading: {
    name: 'Reading Library Tranquil Piano',
    tempoMs: 460,
    wave: 'sine',
    notes: [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25],
    bassNotes: [130.81, 196.0, 164.81, 220.0, 174.61, 261.63, 196.0, 246.94]
  },
  listening: {
    name: 'Listening Hall Harmonic Pulse',
    tempoMs: 340,
    wave: 'sine',
    notes: [659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 493.88, 587.33, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33, 493.88],
    bassNotes: [164.81, 164.81, 196.0, 196.0, 220.0, 220.0, 146.83, 146.83]
  }
};

class EraSoundEngine {
  private ctx: AudioContext | null = null;
  public audioEnabled: boolean = true;
  public musicEnabled: boolean = true;
  private lastStepTime: number = 0;
  private currentRoomKey: string = 'campus';
  private noteIndex: number = 0;
  private musicTimer: number | null = null;

  private getContext(): AudioContext | null {
    if (!this.audioEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public startRoomMusic(roomKey: string) {
    this.currentRoomKey = ROOM_SONGS[roomKey] ? roomKey : 'campus';
    this.noteIndex = 0;
    this.scheduleNextBeat();
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextBeat() {
    this.stopMusic();
    const spec = ROOM_SONGS[this.currentRoomKey] || ROOM_SONGS.campus;
    this.musicTimer = window.setTimeout(() => {
      if (this.audioEnabled && this.musicEnabled) {
        this.playMusicBeat(spec);
      }
      this.scheduleNextBeat();
    }, spec.tempoMs);
  }

  private playMusicBeat(spec: RoomSongSpec) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noteFreq = spec.notes[this.noteIndex % spec.notes.length];
    const bassFreq = spec.bassNotes[Math.floor(this.noteIndex / 2) % spec.bassNotes.length];
    this.noteIndex++;

    // Lead melody note
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = spec.wave;
    osc.frequency.setValueAtTime(noteFreq, now);
    gain.gain.setValueAtTime(0.032, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + (spec.tempoMs / 1000) * 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (spec.tempoMs / 1000) * 0.95);

    // Warm bass accompaniment on every even beat
    if (this.noteIndex % 2 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      bassGain.gain.setValueAtTime(0.025, now);
      bassGain.gain.exponentialRampToValueAtTime(0.0008, now + (spec.tempoMs / 1000) * 1.7);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + (spec.tempoMs / 1000) * 1.8);
    }
  }

  public playFootstep(sprinting: boolean, isIndoor: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const interval = sprinting ? 0.23 : 0.34;
    if (now - this.lastStepTime < interval) return;
    this.lastStepTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isIndoor ? 'triangle' : 'sine';
    const baseFreq = isIndoor ? 140 : 98;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 22, now);
    osc.frequency.exponentialRampToValueAtTime(44, now + 0.06);

    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playDoorSlide(opening: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    if (opening) {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.25);
    } else {
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    }

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playJump(superBounce = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(superBounce ? 160 : 195, now);
    osc.frequency.exponentialRampToValueAtTime(superBounce ? 780 : 520, now + (superBounce ? 0.32 : 0.18));
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (superBounce ? 0.35 : 0.2));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (superBounce ? 0.36 : 0.22));
  }

  public playBallKick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.11);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playPickleballHit() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.055);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playGoalCheer() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    fanfare.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.14, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  public playCrystalCollect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.26);
    });
  }

  public playUiClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }
}

const soundEngine = new EraSoundEngine();

// ============================================================================
// TYPES & VIBRANT ARCHITECTURAL BUILDINGS
// ============================================================================

type GraphicsQuality = 'high' | 'medium' | 'low';

interface BuildingZone {
  id: string;
  name: string;
  shortSign: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  wallColor: number;
  trimColor: number;
  roofColor: number;
  accentColor: number;
  hexAccent: string;
  doorX: number;
  doorZ: number;
  frontDir: 1 | -1;
  interiorWallColor: number;
  interiorFloorColor: number;
}

interface IeltsCharacterProfile {
  id: string;
  realUserId?: string;
  email?: string;
  name: string;
  fullName?: string;
  cohort: 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)';
  course: 'IELTS Course';
  roleTitle: string;
  specialty?: string;
  avatarDetails?: string;
  shirtColor: string;
  hairColor: string;
  skinColor: string;
  hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones';
  accessoryType: 'none' | 'glasses' | 'shades';
  targetBuildingId: string;
  motto: string;
  isRealStudent?: boolean;
  isTeacherAdmin?: boolean;
}

interface WallBoardSpec {
  slot:
    | 'back-left'
    | 'back-right'
    | 'left-wall'
    | 'right-wall'
    | 'left-back'
    | 'left-front'
    | 'right-back'
    | 'right-front';
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  accentHex: string;
  bgLightHex: string;
  actionType:
    | 'practice_skill'
    | 'homework_folder'
    | 'navigate'
    | 'my_dashboard'
    | 'class_dashboard'
    | 'skill_dashboard';
  skillOrTab?: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  route?: string;
  dashboardType?: 'personal' | 'class' | 'listening' | 'reading' | 'writing' | 'speaking';
}

// Vibrant, High-Contrast Colorful Buildings + Bright Warm Classroom Interiors
const BUILDINGS: BuildingZone[] = [
  {
    id: 'practice_tests',
    name: 'Practice Test Arena',
    shortSign: 'PRACTICE TEST',
    x: 40,
    z: -30,
    w: 18,
    d: 14,
    h: 10.5,
    wallColor: 0x60a5fa, // Vibrant Sky Sapphire Facade
    trimColor: 0xeff6ff,
    roofColor: 0x1d4ed8,
    accentColor: 0x2563eb,
    hexAccent: '#2563EB',
    doorX: 40,
    doorZ: -23,
    frontDir: 1,
    interiorWallColor: 0xf0f7ff, // Bright Daylight Blue-White Classroom
    interiorFloorColor: 0xdbeafe
  },
  {
    id: 'homework',
    name: 'Homework Hub',
    shortSign: 'HOMEWORK',
    x: -40,
    z: -30,
    w: 18,
    d: 14,
    h: 10.5,
    wallColor: 0xfbbf24, // Warm Golden Amber Facade
    trimColor: 0xfffbeb,
    roofColor: 0xd97706,
    accentColor: 0xf59e0b,
    hexAccent: '#D97706',
    doorX: -40,
    doorZ: -23,
    frontDir: 1,
    interiorWallColor: 0xfffbeb, // Bright Warm Cream Classroom
    interiorFloorColor: 0xfde68a
  },
  {
    id: 'dashboard',
    name: 'IELTS Academy',
    shortSign: 'DASHBOARD HALL',
    x: 0,
    z: -50,
    w: 22,
    d: 15,
    h: 12.5,
    wallColor: 0x818cf8, // Royal Indigo Facade
    trimColor: 0xeef2ff,
    roofColor: 0x3730a3,
    accentColor: 0x4f46e5,
    hexAccent: '#4F46E5',
    doorX: 0,
    doorZ: -42.5,
    frontDir: 1,
    interiorWallColor: 0xf5f7ff, // Bright Ivory Hall
    interiorFloorColor: 0xe0e7ff
  },
  {
    id: 'speaking',
    name: 'Speaking Studio',
    shortSign: 'SPEAKING STUDIO',
    x: -44,
    z: 30,
    w: 17,
    d: 13,
    h: 10,
    wallColor: 0xc084fc, // Vibrant Orchid Purple Facade
    trimColor: 0xfaf5ff,
    roofColor: 0x7e22ce,
    accentColor: 0x9333ea,
    hexAccent: '#9333EA',
    doorX: -44,
    doorZ: 23.5,
    frontDir: -1,
    interiorWallColor: 0xfaf5ff, // Bright Lavender Studio
    interiorFloorColor: 0xf3e8ff
  },
  {
    id: 'reading',
    name: 'Reading & Writing Library',
    shortSign: 'READING & WRITING',
    x: 44,
    z: 30,
    w: 17,
    d: 13,
    h: 10,
    wallColor: 0x34d399, // Vibrant Mint Emerald Facade
    trimColor: 0xecfdf5,
    roofColor: 0x047857,
    accentColor: 0x10b981,
    hexAccent: '#059669',
    doorX: 44,
    doorZ: 23.5,
    frontDir: -1,
    interiorWallColor: 0xf0fdf4, // Bright Botanical Library
    interiorFloorColor: 0xd1fae5
  },
  {
    id: 'listening',
    name: 'Listening Audio Hall',
    shortSign: 'LISTENING HALL',
    x: 0,
    z: 50,
    w: 19,
    d: 14,
    h: 10.5,
    wallColor: 0x22d3ee, // Vibrant Aqua Cyan Facade
    trimColor: 0xecfeff,
    roofColor: 0x0e7490,
    accentColor: 0x06b6d4,
    hexAccent: '#0891B2',
    doorX: 0,
    doorZ: 43,
    frontDir: -1,
    interiorWallColor: 0xf0fdff, // Bright Cyan Audio Lounge
    interiorFloorColor: 0xcffafe
  }
];

const DEFAULT_IELTS_CHARACTERS: IeltsCharacterProfile[] = [
  TEACHER_JAN_PROFILE,
  ...REAL_IELTS_STUDENT_PROFILES
];

const INTERIOR_BOARDS_BY_BUILDING: Record<string, WallBoardSpec[]> = {
  practice_tests: [
    {
      slot: 'back-left',
      category: 'SKILL 01 • AUDIO LAB',
      title: 'Listening Practice Tests',
      subtitle: '12 Full Tests • 4 Sections • Audio + Transcripts',
      badge: 'OPEN LISTENING TESTS',
      accentHex: '#0284C7',
      bgLightHex: '#E0F2FE',
      actionType: 'practice_skill',
      skillOrTab: 'Listening'
    },
    {
      slot: 'back-right',
      category: 'SKILL 02 • ACADEMIC PASSAGES',
      title: 'Reading Practice Tests',
      subtitle: '21 Full Tests • 3 Passages • True/False/Not Given',
      badge: 'OPEN READING TESTS',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'practice_skill',
      skillOrTab: 'Reading'
    },
    {
      slot: 'left-wall',
      category: 'SKILL 03 • TASK 1 & TASK 2',
      title: 'Writing Practice Tests',
      subtitle: '12 Full Tests • Charts & Essays • Teacher Checking',
      badge: 'OPEN WRITING TESTS',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'practice_skill',
      skillOrTab: 'Writing'
    },
    {
      slot: 'right-wall',
      category: 'SKILL 04 • FACE-TO-FACE',
      title: 'Speaking Practice Tests',
      subtitle: 'Mock & Practice Study Modes • Parts 1, 2 & 3',
      badge: 'OPEN SPEAKING TESTS',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'practice_skill',
      skillOrTab: 'Speaking'
    }
  ],
  homework: [
    {
      slot: 'back-left',
      category: 'WRITING HOMEWORK',
      title: 'IELTS Writing Homework 1',
      subtitle: 'Task 1 & Task 2 Essay Assignment • 60 Mins',
      badge: 'START WRITING HOMEWORK',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'homework_folder',
      skillOrTab: 'Writing'
    },
    {
      slot: 'back-right',
      category: 'SPEAKING HOMEWORK',
      title: 'IELTS Speaking Homework 1–3',
      subtitle: 'Record Audio Responses for Teacher Feedback',
      badge: 'START SPEAKING HOMEWORK',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'homework_folder',
      skillOrTab: 'Speaking'
    },
    {
      slot: 'left-wall',
      category: 'READING HOMEWORK',
      title: 'IELTS Reading Homework',
      subtitle: 'Assigned Academic Reading Comprehension',
      badge: 'OPEN READING HOMEWORK',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'homework_folder',
      skillOrTab: 'Reading'
    },
    {
      slot: 'right-wall',
      category: 'LISTENING HOMEWORK',
      title: 'IELTS Listening Homework',
      subtitle: 'Listen to Class Audio & Answer Questions',
      badge: 'OPEN LISTENING HOMEWORK',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'homework_folder',
      skillOrTab: 'Listening'
    }
  ],
  dashboard: [
    {
      slot: 'back-left',
      category: 'PERSONAL ANALYTICS',
      title: 'My IELTS Dashboard',
      subtitle: 'Individual Listening, Reading, Writing & Speaking Band Scores',
      badge: 'OPEN MY DASHBOARD',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'my_dashboard',
      dashboardType: 'personal',
      route: '/ielts/dashboard'
    },
    {
      slot: 'back-right',
      category: 'CLASS GROUP SCOREBOARD',
      title: 'My Class Dashboard',
      subtitle: 'Classmates List & Scores in Reading, Listening, Writing & Speaking',
      badge: 'OPEN MY CLASS SCORES',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'class_dashboard',
      dashboardType: 'class',
      route: '/courses/ielts?tab=leaderboard'
    },
    {
      slot: 'left-back',
      category: 'LISTENING WALL DASHBOARD',
      title: 'My Listening Dashboard',
      subtitle: 'Sections 1–4 Breakdown, Accuracy & Recent Listening Scores',
      badge: 'OPEN LISTENING DASHBOARD',
      accentHex: '#0D9488',
      bgLightHex: '#CCFBF1',
      actionType: 'skill_dashboard',
      skillOrTab: 'Listening',
      dashboardType: 'listening'
    },
    {
      slot: 'left-front',
      category: 'READING WALL DASHBOARD',
      title: 'My Reading Dashboard',
      subtitle: 'Passages 1–3 Breakdown, Question Types & Reading Band Scores',
      badge: 'OPEN READING DASHBOARD',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'skill_dashboard',
      skillOrTab: 'Reading',
      dashboardType: 'reading'
    },
    {
      slot: 'right-back',
      category: 'WRITING WALL DASHBOARD',
      title: 'My Writing Dashboard',
      subtitle: 'Task 1 & Task 2 Criteria, Coherence, Vocabulary & Essay Scores',
      badge: 'OPEN WRITING DASHBOARD',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'skill_dashboard',
      skillOrTab: 'Writing',
      dashboardType: 'writing'
    },
    {
      slot: 'right-front',
      category: 'SPEAKING WALL DASHBOARD',
      title: 'My Speaking Dashboard',
      subtitle: 'Fluency, Lexical Resource, Grammar, Pronunciation & Recordings',
      badge: 'OPEN SPEAKING DASHBOARD',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'skill_dashboard',
      skillOrTab: 'Speaking',
      dashboardType: 'speaking'
    }
  ],
  speaking: [
    {
      slot: 'back-left',
      category: 'SPEAKING TEST',
      title: 'Speaking Practice Tests',
      subtitle: 'Choose Mock Test or Practice Study Mode',
      badge: 'SELECT SPEAKING TEST',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'practice_skill',
      skillOrTab: 'Speaking'
    },
    {
      slot: 'back-right',
      category: 'SPEAKING HOMEWORK',
      title: 'Assigned Speaking Homework',
      subtitle: 'Complete Speaking Homework 1, 2 & 3',
      badge: 'OPEN SPEAKING HOMEWORK',
      accentHex: '#DB2777',
      bgLightHex: '#FCE7F3',
      actionType: 'homework_folder',
      skillOrTab: 'Speaking'
    },
    {
      slot: 'left-wall',
      category: 'QUICK LAUNCH',
      title: 'IELTS Speaking Test 1',
      subtitle: '15 Mins • Part 1, 2 & 3 Simulation',
      badge: 'START TEST 1',
      accentHex: '#6D28D9',
      bgLightHex: '#EDE9FE',
      actionType: 'navigate',
      route: '/test/speaking/4?mode=practice&name=Student'
    },
    {
      slot: 'right-wall',
      category: 'QUICK LAUNCH',
      title: 'IELTS Speaking Homework 1',
      subtitle: '15 Mins • Assigned Class Speaking Task',
      badge: 'START HOMEWORK 1',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'navigate',
      route: '/test/speaking/homework-test-1'
    }
  ],
  reading: [
    {
      slot: 'back-left',
      category: 'READING COLLECTION',
      title: 'Reading Practice Tests (1–21)',
      subtitle: 'What Lucy Taught Us, The History of Tea & More',
      badge: 'CHOOSE READING TEST',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'practice_skill',
      skillOrTab: 'Reading'
    },
    {
      slot: 'back-right',
      category: 'WRITING COLLECTION',
      title: 'Writing Practice Tests (1–12)',
      subtitle: 'Academic Task 1 Reports & Task 2 Essays',
      badge: 'CHOOSE WRITING TEST',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'practice_skill',
      skillOrTab: 'Writing'
    },
    {
      slot: 'left-wall',
      category: 'DIRECT LAUNCH',
      title: 'IELTS Reading Test 1',
      subtitle: '60 Mins • 3 Passages • 40 Questions',
      badge: 'START READING TEST 1',
      accentHex: '#047857',
      bgLightHex: '#ECFDF5',
      actionType: 'navigate',
      route: '/test/reading/1'
    },
    {
      slot: 'right-wall',
      category: 'DIRECT LAUNCH',
      title: 'IELTS Writing Test 1',
      subtitle: '60 Mins • Task 1 & Task 2',
      badge: 'START WRITING TEST 1',
      accentHex: '#B45309',
      bgLightHex: '#FFFBEB',
      actionType: 'navigate',
      route: '/test/writing/3'
    }
  ],
  listening: [
    {
      slot: 'back-left',
      category: 'LISTENING COLLECTION',
      title: 'Listening Practice Tests (1–12)',
      subtitle: 'Full Audio Simulations • Parts 1 to 4',
      badge: 'CHOOSE LISTENING TEST',
      accentHex: '#0891B2',
      bgLightHex: '#CFFAFE',
      actionType: 'practice_skill',
      skillOrTab: 'Listening'
    },
    {
      slot: 'back-right',
      category: 'DIRECT LAUNCH',
      title: 'IELTS Listening Test 1',
      subtitle: '60 Mins • January Official Practice Test',
      badge: 'START LISTENING TEST 1',
      accentHex: '#0284C7',
      bgLightHex: '#E0F2FE',
      actionType: 'navigate',
      route: '/test/listening/2'
    },
    {
      slot: 'left-wall',
      category: 'DIRECT LAUNCH',
      title: 'IELTS Listening Test 2',
      subtitle: '60 Mins • February Official Practice Test',
      badge: 'START LISTENING TEST 2',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'navigate',
      route: '/test/listening/6'
    },
    {
      slot: 'right-wall',
      category: 'HOMEWORK',
      title: 'Listening Class Homework',
      subtitle: 'Access Assigned Listening Exercises',
      badge: 'OPEN HOMEWORK',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'homework_folder',
      skillOrTab: 'Listening'
    }
  ]
};

function getIeltsPracticeTests() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const skills = [
    { name: 'Reading', duration: '60 mins' },
    { name: 'Listening', duration: '60 mins' },
    { name: 'Writing', duration: '60 mins' },
    { name: 'Speaking', duration: '15 mins' }
  ];
  let idCounter = 1;
  const list: Array<{
    id: number;
    title: string;
    skill: 'Reading' | 'Listening' | 'Writing' | 'Speaking';
    month: string;
    duration: string;
    difficulty: string;
  }> = [];

  months.forEach((month, mIndex) => {
    skills.forEach((sk) => {
      const diff = ['Easy', 'Medium', 'Hard'][idCounter % 3];
      list.push({
        id: idCounter,
        title: `IELTS ${sk.name} Test ${mIndex + 1}`,
        skill: sk.name as 'Reading' | 'Listening' | 'Writing' | 'Speaking',
        month,
        duration: sk.duration,
        difficulty: diff
      });
      idCounter++;
    });
  });

  const extraReadingIds = [49, 53, 57, 61, 65, 69, 73, 77, 81];
  for (let i = 13; i <= 21; i++) {
    const rId = extraReadingIds[i - 13];
    list.push({
      id: rId,
      title: `IELTS Reading Test ${i}`,
      skill: 'Reading',
      month: 'Extra Collection',
      duration: '60 mins',
      difficulty: ['Easy', 'Medium', 'Hard'][rId % 3]
    });
  }

  return list;
}

const INTERIOR_ORIGIN = { x: 500, y: 0, z: 500 };

// Reusable module-scope math vectors to prevent GC spikes
const _camTarget = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

export function EraVerse() {
  const { user, userCourse, isAdmin } = useAuth();
  const navigate = useNavigate();

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const touchJoystickRef = useRef<{ dx: number; dy: number; active: boolean }>({ dx: 0, dy: 0, active: false });

  const gameActionsRef = useRef<{
    teleportToBuilding: (buildingId: string) => void;
    enterBuildingInterior: (building: BuildingZone) => void;
    exitBuildingInterior: () => void;
    applyAvatarAppearance: (profile: {
      shirtColor: string;
      hairColor: string;
      skinColor: string;
      hatType: string;
      accessoryType: string;
      name: string;
      cohort: string;
    }) => void;
    setGraphicsQuality: (q: GraphicsQuality) => void;
    setSkyPreset: (mode: 'day' | 'sunset' | 'night') => void;
    triggerJump: () => void;
    triggerWave: () => void;
    triggerKick: () => void;
    triggerHit: () => void;
    toggleCrouch: () => void;
    setZoomDistance: (dist: number) => void;
    syncNpcProfiles: (profiles: IeltsCharacterProfile[]) => void;
    showSpeechBubbleOnActor: (actorId: string, speakerName: string, text: string, isWarning?: boolean) => void;
    refreshDashboardWalls: () => void;
  } | null>(null);

  const [activeBuildingModal, setActiveBuildingModal] = useState<string | null>(null);
  const [dashboardHallModal, setDashboardHallModal] = useState<DashboardModalType>(null);
  const [selectedPracticeSkill, setSelectedPracticeSkill] = useState<'Listening' | 'Reading' | 'Writing' | 'Speaking'>('Listening');
  const [selectedHomeworkTab, setSelectedHomeworkTab] = useState<'All' | 'Writing' | 'Speaking' | 'Reading' | 'Listening' | 'Assigned'>('All');
  const [insideBuilding, setInsideBuilding] = useState<BuildingZone | null>(null);
  const [nearBuildingPrompt, setNearBuildingPrompt] = useState<BuildingZone | null>(null);
  const [nearBoardPrompt, setNearBoardPrompt] = useState<WallBoardSpec | null>(null);
  const [nearCharacterPrompt, setNearCharacterPrompt] = useState<IeltsCharacterProfile | null>(null);
  const [xp, setXp] = useState<number>(150);
  const [crystalsCollected, setCrystalsCollected] = useState<number>(0);
  const [footballGoals, setFootballGoals] = useState<number>(0);
  const [aiFootballGoals, setAiFootballGoals] = useState<number>(0);
  const [pickleballScore, setPickleballScore] = useState<number>(0);
  const [aiPickleballScore, setAiPickleballScore] = useState<number>(0);
  const [inSportsZone, setInSportsZone] = useState<'none' | 'football' | 'pickleball' | 'playground'>('none');
  const [isCrouching, setIsCrouching] = useState<boolean>(false);
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [englishWarning, setEnglishWarning] = useState<string | null>(null);
  const [skyMode, setSkyMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>('high');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCharactersModal, setShowCharactersModal] = useState<boolean>(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState<boolean>(false);
  const [cohortFilter, setCohortFilter] = useState<'ALL' | 'IELTS 1' | 'IELTS 2' | 'TEACHER (SUPER ADMIN)'>('ALL');
  const [toastBanner, setToastBanner] = useState<{ title: string; subtitle: string; color: string } | null>(null);
  const [zoomSliderValue, setZoomSliderValue] = useState<number>(14);
  const [joystickThumbPos, setJoystickThumbPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [speakingModalTest, setSpeakingModalTest] = useState<{ id: number | string; title: string } | null>(null);
  const [candidateName, setCandidateName] = useState<string>(user?.displayName || 'Student');

  const [playerProfile, setPlayerProfile] = useState<{
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
    hairColor: string;
    skinColor: string;
    hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones';
    accessoryType: 'none' | 'glasses' | 'shades';
  }>(() => {
    const initialMatch = findCharacterForAuthUser(user, isAdmin, DEFAULT_IELTS_CHARACTERS as any, []);
    if (initialMatch) {
      return {
        id: initialMatch.id,
        realUserId: user?.uid || initialMatch.realUserId,
        email: user?.email || initialMatch.email,
        name: initialMatch.name,
        fullName: initialMatch.fullName,
        cohort: initialMatch.cohort,
        roleTitle: initialMatch.roleTitle,
        specialty: initialMatch.specialty,
        avatarDetails: initialMatch.avatarDetails,
        shirtColor: initialMatch.shirtColor,
        hairColor: initialMatch.hairColor,
        skinColor: initialMatch.skinColor,
        hatType: initialMatch.hatType,
        accessoryType: initialMatch.accessoryType
      };
    }
    const firstPreset = REAL_IELTS_STUDENT_PROFILES[0];
    return {
      id: firstPreset.id,
      realUserId: user?.uid,
      email: user?.email || firstPreset.email,
      name: firstPreset.name,
      fullName: firstPreset.fullName,
      cohort: firstPreset.cohort,
      roleTitle: firstPreset.roleTitle,
      specialty: firstPreset.specialty,
      avatarDetails: firstPreset.avatarDetails,
      shirtColor: firstPreset.shirtColor,
      hairColor: firstPreset.hairColor,
      skinColor: firstPreset.skinColor,
      hatType: firstPreset.hatType,
      accessoryType: firstPreset.accessoryType
    };
  });

  const [firestoreFolders, setFirestoreFolders] = useState<Array<{ id: string; name: string; course: string }>>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<Array<any>>([]);
  const [firestoreAssignments, setFirestoreAssignments] = useState<Array<any>>([]);
  const [firestoreSubmissions, setFirestoreSubmissions] = useState<Array<any>>([]);

  const allPracticeTests = useMemo(() => getIeltsPracticeTests(), []);

  // Start room song synthesizer on mount and clean up on unmount
  useEffect(() => {
    soundEngine.startRoomMusic('campus');
    return () => {
      soundEngine.stopMusic();
    };
  }, []);

  useEffect(() => {
    const unsubFolders = onSnapshot(
      collection(db, 'folders'),
      (snap) => {
        const list: Array<{ id: string; name: string; course: string }> = [];
        snap.forEach((d) => {
          const data = d.data();
          if (!data.isDeleted) {
            list.push({ id: d.id, name: data.name || '', course: data.course || '' });
          }
        });
        setFirestoreFolders(list);
      },
      () => {}
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (!data.isDeleted) {
            list.push({ id: d.id, ...data });
          }
        });
        setFirestoreUsers(list);
      },
      () => {}
    );

    const unsubAssignments = onSnapshot(
      collection(db, 'assignments'),
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setFirestoreAssignments(list);
      },
      () => {}
    );

    const unsubSubmissions = onSnapshot(
      collection(db, 'submissions'),
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setFirestoreSubmissions(list);
      },
      () => {}
    );

    return () => {
      unsubFolders();
      unsubUsers();
      unsubAssignments();
      unsubSubmissions();
    };
  }, []);

  // Build unique roster from real Firestore student accounts under their nicknames (no duplicate or fake characters)
  const ieltsCharacters = useMemo<IeltsCharacterProfile[]>(() => {
    return buildUniqueRosterFromFirestore(firestoreUsers, firestoreFolders);
  }, [firestoreFolders, firestoreUsers]);

  // Strictly bind logged-in user to their personal character under their nickname
  useEffect(() => {
    if (!user) return;
    const matched = findCharacterForAuthUser(user, isAdmin, ieltsCharacters as any, firestoreUsers);
    if (!matched) return;

    // Check if this specific user customized their avatar colors/hat in localStorage
    let customLook: any = null;
    try {
      const rawCustom = localStorage.getItem(`eraverse_custom_${user.uid}`);
      if (rawCustom) customLook = JSON.parse(rawCustom);
    } catch (_e) {
      // ignore
    }

    setPlayerProfile((prev) => {
      // If Teacher Jan (Super Admin) manually switched to preview a student, don't overwrite unless the logged-in user changed
      if (isAdmin && prev.id !== matched.id && prev.realUserId && prev.realUserId !== user.uid) {
        return prev;
      }
      return {
        id: matched.id,
        realUserId: matched.realUserId || user.uid,
        email: matched.email || user.email || undefined,
        name: matched.name, // Always use the student's nickname!
        fullName: matched.fullName,
        cohort: matched.cohort,
        roleTitle: matched.roleTitle,
        specialty: matched.specialty,
        avatarDetails: matched.avatarDetails,
        shirtColor: customLook?.shirtColor || matched.shirtColor,
        hairColor: customLook?.hairColor || matched.hairColor,
        skinColor: customLook?.skinColor || matched.skinColor,
        hatType: customLook?.hatType || matched.hatType,
        accessoryType: customLook?.accessoryType || matched.accessoryType
      };
    });
    setCandidateName(matched.name);
  }, [user?.uid, user?.email, isAdmin, ieltsCharacters, firestoreUsers]);

  // Compute every student's individual Reading, Listening, Writing, Speaking & Overall Band scores
  const allStudentsSkillScores = useMemo(() => {
    return ieltsCharacters
      .filter((c) => c.cohort === 'IELTS 1' || c.cohort === 'IELTS 2')
      .map((c) => computeStudentSkillScores(c, firestoreSubmissions))
      .sort((a, b) => b.overall - a.overall);
  }, [ieltsCharacters, firestoreSubmissions]);

  // Active player's own personal dashboard stats linked to their account
  const myPersonalDashboardStats = useMemo(() => {
    return computeStudentSkillScores(
      {
        id: playerProfile.id,
        realUserId: playerProfile.realUserId || user?.uid,
        email: playerProfile.email || user?.email || undefined,
        name: playerProfile.name,
        fullName: playerProfile.fullName,
        cohort: playerProfile.cohort,
        roleTitle: playerProfile.roleTitle,
        specialty: playerProfile.specialty,
        avatarDetails: playerProfile.avatarDetails,
        shirtColor: playerProfile.shirtColor
      },
      firestoreSubmissions
    );
  }, [playerProfile, user?.uid, user?.email, firestoreSubmissions]);

  // Active player's dedicated class group list (e.g. if Suzie/Kai is in IELTS 1, show ONLY IELTS 1 students!)
  const activeClassCohortLabel = playerProfile.cohort === 'IELTS 2' ? 'IELTS 2' : 'IELTS 1';
  const myClassDashboardStudents = useMemo(() => {
    const filtered = allStudentsSkillScores.filter((s) => s.cohort === activeClassCohortLabel);
    if (
      playerProfile.cohort !== 'TEACHER (SUPER ADMIN)' &&
      !filtered.some((s) => s.name.toLowerCase() === playerProfile.name.toLowerCase())
    ) {
      return [myPersonalDashboardStats, ...filtered].sort((a, b) => b.overall - a.overall);
    }
    return filtered;
  }, [allStudentsSkillScores, activeClassCohortLabel, playerProfile, myPersonalDashboardStats]);

  const dashboardDataRef = useRef({
    myStats: myPersonalDashboardStats,
    classCohortLabel: activeClassCohortLabel,
    classStudents: myClassDashboardStudents
  });
  dashboardDataRef.current = {
    myStats: myPersonalDashboardStats,
    classCohortLabel: activeClassCohortLabel,
    classStudents: myClassDashboardStudents
  };

  useEffect(() => {
    if (gameActionsRef.current) {
      gameActionsRef.current.syncNpcProfiles(ieltsCharacters);
    }
  }, [ieltsCharacters]);

  useEffect(() => {
    if (gameActionsRef.current) {
      gameActionsRef.current.applyAvatarAppearance(playerProfile);
      gameActionsRef.current.refreshDashboardWalls();
    }
  }, [playerProfile, myPersonalDashboardStats, myClassDashboardStudents]);

  const showToast = (title: string, subtitle: string, color = '#2563EB') => {
    setToastBanner({ title, subtitle, color });
    window.setTimeout(() => {
      setToastBanner((prev) => (prev?.title === title ? null : prev));
    }, 3200);
  };

  const handleSendProximityChat = (rawText: string) => {
    if (!nearCharacterPrompt) return;
    const check = checkEnglishOnlyMessage(rawText);
    if (!check.allowed) {
      soundEngine.playDoorSlide(false);
      const warnText = 'English only please! Please chat in English, not Vietnamese.';
      setEnglishWarning(warnText);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `warn-${Date.now()}`,
          senderId: 'system',
          senderName: 'English Only Rule',
          senderCohort: 'SYSTEM',
          text: 'English only please!',
          timestamp: Date.now(),
          isWarning: true
        }
      ]);
      gameActionsRef.current?.showSpeechBubbleOnActor('player-self', playerProfile.name, 'English only please!', true);
      showToast('English Only Please! 🇬🇧', 'Please speak in English when chatting in EraVerse.', '#DC2626');
      window.setTimeout(() => {
        setEnglishWarning((prev) => (prev === warnText ? null : prev));
      }, 4000);
      return;
    }

    setEnglishWarning(null);
    soundEngine.playUiClick();
    const cleanText = rawText.trim();
    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      senderId: playerProfile.id,
      senderName: playerProfile.name,
      senderCohort: playerProfile.cohort,
      recipientName: nearCharacterPrompt.name,
      text: cleanText,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    gameActionsRef.current?.showSpeechBubbleOnActor('player-self', playerProfile.name, cleanText, false);

    // Partner replies in English after a brief natural pause
    const partner = nearCharacterPrompt;
    window.setTimeout(() => {
      const replyText = generateEnglishPartnerReply(partner.name, partner.cohort, cleanText);
      const replyMsg: ChatMessageItem = {
        id: `reply-${Date.now()}`,
        senderId: partner.id,
        senderName: partner.name,
        senderCohort: partner.cohort,
        recipientName: playerProfile.name,
        text: replyText,
        timestamp: Date.now()
      };
      setChatMessages((prev) => [...prev, replyMsg]);
      gameActionsRef.current?.showSpeechBubbleOnActor(partner.id, partner.name, replyText, false);
      soundEngine.playUiClick();
    }, 650);
  };

  const handleBoardAction = (board: WallBoardSpec) => {
    soundEngine.playUiClick();
    if (board.actionType === 'my_dashboard') {
      setDashboardHallModal('my_dashboard');
    } else if (board.actionType === 'class_dashboard') {
      setDashboardHallModal('class_dashboard');
    } else if (board.actionType === 'skill_dashboard') {
      if (board.dashboardType === 'listening') setDashboardHallModal('listening_dashboard');
      else if (board.dashboardType === 'reading') setDashboardHallModal('reading_dashboard');
      else if (board.dashboardType === 'writing') setDashboardHallModal('writing_dashboard');
      else if (board.dashboardType === 'speaking') setDashboardHallModal('speaking_dashboard');
      else setDashboardHallModal('my_dashboard');
    } else if (board.actionType === 'practice_skill' && board.skillOrTab) {
      setSelectedPracticeSkill(board.skillOrTab);
      setActiveBuildingModal('practice_tests');
    } else if (board.actionType === 'homework_folder') {
      setSelectedHomeworkTab((board.skillOrTab as any) || 'All');
      setActiveBuildingModal('homework');
    } else if (board.actionType === 'navigate' && board.route) {
      navigate(board.route);
    }
  };

  const handleBoardActionRef = useRef(handleBoardAction);
  handleBoardActionRef.current = handleBoardAction;

  // ============================================================================
  // INITIALIZE THREE.JS WORLD
  // ============================================================================
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (_e) {
        return false;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 80;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0032);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 550);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio * 1.25, 2.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    let currentQuality: GraphicsQuality = 'high';

    // 1. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xf0f9ff, 0x34d399, 0.9);
    hemiLight.position.set(0, 90, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    sunLight.position.set(70, 105, 60);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 290;
    const shadowBound = 115;
    sunLight.shadow.camera.left = -shadowBound;
    sunLight.shadow.camera.right = shadowBound;
    sunLight.shadow.camera.top = shadowBound;
    sunLight.shadow.camera.bottom = -shadowBound;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.55);
    rimLight.position.set(-70, 50, -60);
    scene.add(rimLight);

    // 2. High-Sharpness Procedural Textures
    const createRichGrassTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#2ec44d';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = i % 3 === 0 ? '#25a244' : i % 3 === 1 ? '#4ad66d' : '#1b8a36';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 7);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(55, 55);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const createPaverTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) {
        const offset = (y / 64) % 2 === 0 ? 0 : 64;
        for (let x = -64; x < 512; x += 128) {
          ctx.fillStyle = (x + y) % 128 === 0 ? '#e2e8f0' : '#f8fafc';
          ctx.fillRect(x + offset + 3, y + 3, 122, 58);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const createFacadeWallTexture = (baseHex: number, trimHex: number) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      const col = new THREE.Color(baseHex);
      const trimCol = new THREE.Color(trimHex);
      ctx.fillStyle = `#${col.getHexString()}`;
      ctx.fillRect(0, 0, 512, 512);

      // Decorative architectural horizontal band + crisp stone block seams
      ctx.fillStyle = `#${trimCol.getHexString()}`;
      ctx.fillRect(0, 0, 512, 36);
      ctx.fillRect(0, 465, 512, 47);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 3;
      for (let y = 64; y < 460; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x < 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 36);
        ctx.lineTo(x, 465);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 1);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(460, 460),
      new THREE.MeshStandardMaterial({
        map: createRichGrassTexture(),
        roughness: 0.82,
        metalness: 0.04
      })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const paverTex = createPaverTexture();
    const plazaMat = new THREE.MeshStandardMaterial({
      map: paverTex,
      roughness: 0.6,
      metalness: 0.08
    });

    // Central Plaza
    const plazaDisc = new THREE.Mesh(new THREE.CylinderGeometry(20, 20.5, 0.18, 64), plazaMat);
    plazaDisc.position.set(0, 0.09, 0);
    plazaDisc.receiveShadow = true;
    scene.add(plazaDisc);

    // Central Fountain Monument
    const monumentGroup = new THREE.Group();
    const poolOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.7, 0.85, 36),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.15 })
    );
    poolOuter.position.y = 0.42;
    poolOuter.castShadow = true;
    poolOuter.receiveShadow = true;
    monumentGroup.add(poolOuter);

    const waterPool = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 4.6, 0.68, 32),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.1,
        metalness: 0.4
      })
    );
    waterPool.position.y = 0.56;
    monumentGroup.add(waterPool);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 1.3, 3.8, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.25 })
    );
    spire.position.y = 2.6;
    spire.castShadow = true;
    monumentGroup.add(spire);

    const globeGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.45, 1),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        roughness: 0.12,
        metalness: 0.85
      })
    );
    globeGem.position.y = 5.6;
    monumentGroup.add(globeGem);
    scene.add(monumentGroup);

    // 3. Attached Building Name Signboard Texture
    const makeAttachedBuildingNameTexture = (shortName: string, bgColorHex: string, borderHex: string) => {
      const c = document.createElement('canvas');
      c.width = 768;
      c.height = 160;
      const ctx = c.getContext('2d')!;

      ctx.fillStyle = bgColorHex;
      ctx.beginPath();
      ctx.roundRect(6, 6, 756, 148, 24);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = borderHex;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 58px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shortName, 384, 82);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // 4. Construct the 6 Colorful Buildings with Automatic Doors
    const colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [
      { minX: -5.5, maxX: 5.5, minZ: -5.5, maxZ: 5.5 }
    ];

    interface AnimatedDoorController {
      building: BuildingZone;
      leftDoor: THREE.Group;
      rightDoor: THREE.Group;
      leftClosedX: number;
      rightClosedX: number;
      openAmount: number;
      isOpen: boolean;
      wallMaterials: THREE.MeshStandardMaterial[];
    }

    const doorControllers: AnimatedDoorController[] = [];
    const clickableBuildingMeshes: THREE.Object3D[] = [];
    const allBuildingOccluderMeshes: THREE.Mesh[] = [];

    BUILDINGS.forEach((b) => {
      const dist = Math.hypot(b.doorX, b.doorZ);
      const roadAngle = Math.atan2(b.doorX, b.doorZ);
      const roadGroup = new THREE.Group();
      roadGroup.position.set(b.doorX / 2, 0, b.doorZ / 2);
      roadGroup.rotation.y = roadAngle;

      const roadBed = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, dist), plazaMat);
      roadBed.position.y = 0.06;
      roadBed.receiveShadow = true;
      roadGroup.add(roadBed);

      const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.1 });
      [-2.75, 2.75].forEach((cx) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, dist), curbMat);
        curb.position.set(cx, 0.12, 0);
        curb.receiveShadow = true;
        roadGroup.add(curb);
      });
      scene.add(roadGroup);

      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);
      bGroup.userData = { buildingId: b.id };

      const buildingWallMaterials: THREE.MeshStandardMaterial[] = [];

      const foundation = new THREE.Mesh(
        new THREE.BoxGeometry(b.w + 1.8, 0.7, b.d + 1.8),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6, metalness: 0.1 })
      );
      foundation.position.y = 0.35;
      foundation.receiveShadow = true;
      foundation.castShadow = true;
      bGroup.add(foundation);

      const stepPorch = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.42, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 })
      );
      stepPorch.position.set(0, 0.21, (b.d / 2 + 1.2) * b.frontDir);
      stepPorch.receiveShadow = true;
      bGroup.add(stepPorch);

      const mainWallMat = new THREE.MeshStandardMaterial({
        map: createFacadeWallTexture(b.wallColor, b.trimColor),
        roughness: 0.42,
        metalness: 0.08,
        transparent: true,
        opacity: 1.0
      });
      buildingWallMaterials.push(mainWallMat);

      const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mainWallMat);
      body.position.y = b.h / 2 + 0.7;
      body.castShadow = true;
      body.receiveShadow = true;
      body.userData = { buildingId: b.id };
      bGroup.add(body);
      clickableBuildingMeshes.push(body);
      allBuildingOccluderMeshes.push(body);

      const roofMat = new THREE.MeshStandardMaterial({
        color: b.roofColor,
        roughness: 0.32,
        metalness: 0.25,
        transparent: true,
        opacity: 1.0
      });
      buildingWallMaterials.push(roofMat);

      const cornice = new THREE.Mesh(new THREE.BoxGeometry(b.w + 1.5, 1.35, b.d + 1.5), roofMat);
      cornice.position.y = b.h + 1.25;
      cornice.castShadow = true;
      cornice.userData = { buildingId: b.id };
      bGroup.add(cornice);
      clickableBuildingMeshes.push(cornice);
      allBuildingOccluderMeshes.push(cornice);

      const upperDeck = new THREE.Mesh(
        new THREE.BoxGeometry(b.w - 2.8, 1.6, b.d - 2.8),
        new THREE.MeshStandardMaterial({ color: b.accentColor, roughness: 0.28, metalness: 0.35 })
      );
      upperDeck.position.y = b.h + 2.45;
      upperDeck.castShadow = true;
      bGroup.add(upperDeck);

      // White 3D Corner Pilasters
      const pilasterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.12 });
      [
        [-b.w / 2, -b.d / 2],
        [b.w / 2, -b.d / 2],
        [-b.w / 2, b.d / 2],
        [b.w / 2, b.d / 2]
      ].forEach(([cx, cz]) => {
        const pilaster = new THREE.Mesh(new THREE.BoxGeometry(1.0, b.h + 0.5, 1.0), pilasterMat);
        pilaster.position.set(cx, b.h / 2 + 0.7, cz);
        pilaster.castShadow = true;
        bGroup.add(pilaster);
      });

      const frontZ = (b.d / 2 + 0.08) * b.frontDir;

      // Attached Building Name Signboard
      const signTex = makeAttachedBuildingNameTexture(b.shortSign, '#0f172a', b.hexAccent);
      const signBacking = new THREE.Mesh(
        new THREE.BoxGeometry(11.2, 2.35, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 })
      );
      signBacking.position.set(0, b.h - 0.45, frontZ + 0.16 * b.frontDir);
      signBacking.userData = { buildingId: b.id };
      bGroup.add(signBacking);
      clickableBuildingMeshes.push(signBacking);

      const signFace = new THREE.Mesh(
        new THREE.PlaneGeometry(10.9, 2.2),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signFace.position.set(0, b.h - 0.45, frontZ + 0.35 * b.frontDir);
      if (b.frontDir === -1) {
        signFace.rotation.y = Math.PI;
      }
      signFace.userData = { buildingId: b.id };
      bGroup.add(signFace);
      clickableBuildingMeshes.push(signFace);

      // 3D Framed Windows with Colorful Awning & Flowerbox
      const winFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
      const winGlassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x7dd3fc,
        emissiveIntensity: 0.35,
        roughness: 0.08,
        metalness: 0.85
      });

      [-b.w * 0.32, b.w * 0.32].forEach((wx) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, 4.5, frontZ);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.1, 0.28), winFrameMat);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.65, 0.32), winGlassMat);
        const sill = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.28, 0.55), pilasterMat);
        sill.position.y = -1.6;
        const awning = new THREE.Mesh(
          new THREE.BoxGeometry(3.0, 0.35, 0.85),
          new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.4 })
        );
        awning.position.set(0, 1.65, 0.3 * b.frontDir);
        wGroup.add(frame, glass, sill, awning);
        bGroup.add(wGroup);
      });

      // Warm Lit Lobby Recess behind Sliding Doors
      const lobbyRecess = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 4.8, 0.18),
        new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
      );
      lobbyRecess.position.set(0, 3.1, frontZ - 0.02 * b.frontDir);
      lobbyRecess.userData = { buildingId: b.id };
      bGroup.add(lobbyRecess);
      clickableBuildingMeshes.push(lobbyRecess);

      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 0.4, 2.0),
        new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.3, metalness: 0.35 })
      );
      canopy.position.set(0, 5.8, frontZ + 0.85 * b.frontDir);
      canopy.castShadow = true;
      bGroup.add(canopy);

      [-2.75, 2.75].forEach((px) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 5.2, 16), pilasterMat);
        col.position.set(px, 3.1, frontZ + 1.25 * b.frontDir);
        col.castShadow = true;
        bGroup.add(col);
      });

      // Automatic Sliding Double Doors
      const createDoorLeaf = (isLeft: boolean) => {
        const leafGroup = new THREE.Group();
        const leafFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 4.6, 0.22),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.5 })
        );
        const leafGlass = new THREE.Mesh(
          new THREE.BoxGeometry(0.88, 4.1, 0.25),
          new THREE.MeshStandardMaterial({
            color: b.accentColor,
            emissive: b.accentColor,
            emissiveIntensity: 0.35,
            roughness: 0.1,
            metalness: 0.75
          })
        );
        leafGlass.userData = { buildingId: b.id };
        const handle = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.75, 0.34),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 })
        );
        handle.position.set(isLeft ? 0.38 : -0.38, 0, 0);
        leafGroup.add(leafFrame, leafGlass, handle);
        clickableBuildingMeshes.push(leafGlass, leafFrame);
        return leafGroup;
      };

      const leftDoor = createDoorLeaf(true);
      const rightDoor = createDoorLeaf(false);
      const leftClosedX = -0.56;
      const rightClosedX = 0.56;
      leftDoor.position.set(leftClosedX, 3.0, frontZ + 0.1 * b.frontDir);
      rightDoor.position.set(rightClosedX, 3.0, frontZ + 0.1 * b.frontDir);
      bGroup.add(leftDoor, rightDoor);

      doorControllers.push({
        building: b,
        leftDoor,
        rightDoor,
        leftClosedX,
        rightClosedX,
        openAmount: 0,
        isOpen: false,
        wallMaterials: buildingWallMaterials
      });

      scene.add(bGroup);

      colliders.push({
        minX: b.x - b.w / 2 - 0.5,
        maxX: b.x + b.w / 2 + 0.5,
        minZ: b.z - b.d / 2 - 0.5,
        maxZ: b.z + b.d / 2 + 0.5
      });
    });

    // ============================================================================
    // 5. OUTDOOR SPORTS & PLAYGROUND PARK (FOOTBALL PITCH, PICKLEBALL COURT, PLAYGROUND)
    // ============================================================================

    // A. Interactive Football (Soccer) Field at West Park (X = -75, Z = 0)
    const PITCH_CENTER = { x: -75, z: 0 };
    const PITCH_W = 24;
    const PITCH_L = 36;

    const createFootballPitchTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 768;
      const ctx = c.getContext('2d')!;

      // Alternating mowed turf stripes
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#16a34a' : '#22c55e';
        ctx.fillRect(0, i * 64, 512, 64);
      }

      // Crisp white pitch markings
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeRect(24, 24, 464, 720);

      // Halfway line & center circle
      ctx.beginPath();
      ctx.moveTo(24, 384);
      ctx.lineTo(488, 384);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(256, 384, 68, 0, Math.PI * 2);
      ctx.stroke();

      // Penalty boxes
      ctx.strokeRect(126, 24, 260, 110);
      ctx.strokeRect(126, 634, 260, 110);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const footballPitch = new THREE.Mesh(
      new THREE.PlaneGeometry(PITCH_W, PITCH_L),
      new THREE.MeshStandardMaterial({ map: createFootballPitchTexture(), roughness: 0.75 })
    );
    footballPitch.rotation.x = -Math.PI / 2;
    footballPitch.position.set(PITCH_CENTER.x, 0.08, PITCH_CENTER.z);
    footballPitch.receiveShadow = true;
    scene.add(footballPitch);

    // 3D Goalposts at North (Z - 17) & South (Z + 17) ends of the Football Field
    const createGoalpost = (gz: number) => {
      const gGroup = new THREE.Group();
      gGroup.position.set(PITCH_CENTER.x, 0, gz);
      const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.4 });
      const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 12), postMat);
      leftPost.position.set(-3.2, 1.6, 0);
      const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 12), postMat);
      rightPost.position.set(3.2, 1.6, 0);
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 6.6, 12), postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 3.2, 0);

      const netMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 3.1, 1.6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.45 })
      );
      netMesh.position.set(0, 1.55, gz < PITCH_CENTER.z ? -0.8 : 0.8);
      gGroup.add(leftPost, rightPost, crossbar, netMesh);
      scene.add(gGroup);
    };
    createGoalpost(PITCH_CENTER.z - PITCH_L / 2 + 1.0);
    createGoalpost(PITCH_CENTER.z + PITCH_L / 2 - 1.0);

    // Football Field Sign
    const fbSignTex = makeAttachedBuildingNameTexture('FOOTBALL FIELD', '#14532d', '#22c55e');
    const fbSign = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 1.8, 0.25),
      new THREE.MeshBasicMaterial({ map: fbSignTex })
    );
    fbSign.position.set(PITCH_CENTER.x + PITCH_W / 2 + 1.2, 3.2, PITCH_CENTER.z);
    fbSign.rotation.y = Math.PI / 2;
    scene.add(fbSign);

    // Interactive Physics 3D Soccer Ball
    const createSoccerBallTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#0f172a';
      [
        [64, 64], [192, 64], [128, 128], [64, 192], [192, 192]
      ].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 34, 0, Math.PI * 2);
        ctx.fill();
      });
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const soccerBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 24, 24),
      new THREE.MeshStandardMaterial({ map: createSoccerBallTexture(), roughness: 0.3, metalness: 0.1 })
    );
    soccerBallMesh.castShadow = true;
    soccerBallMesh.position.set(PITCH_CENTER.x, 0.68, PITCH_CENTER.z);
    scene.add(soccerBallMesh);

    const soccerBallState = {
      x: PITCH_CENTER.x,
      y: 0.68,
      z: PITCH_CENTER.z,
      vx: 0,
      vy: 0,
      vz: 0
    };

    // B. Interactive Pickleball Court at East Park (X = 72, Z = 0)
    const PICKLE_CENTER = { x: 72, z: 0 };
    const PICKLE_W = 14;
    const PICKLE_L = 24;

    const createPickleballCourtTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 768;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#1d4ed8'; // Outer tournament blue
      ctx.fillRect(0, 0, 512, 768);
      ctx.fillStyle = '#10b981'; // Inner court emerald
      ctx.fillRect(48, 48, 416, 672);
      ctx.fillStyle = '#0ea5e9'; // Non-volley kitchen zone
      ctx.fillRect(48, 274, 416, 220);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeRect(48, 48, 416, 672);
      ctx.beginPath();
      ctx.moveTo(48, 274);
      ctx.lineTo(464, 274);
      ctx.moveTo(48, 494);
      ctx.lineTo(464, 494);
      ctx.moveTo(256, 48);
      ctx.lineTo(256, 274);
      ctx.moveTo(256, 494);
      ctx.lineTo(256, 720);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const pickleCourt = new THREE.Mesh(
      new THREE.PlaneGeometry(PICKLE_W, PICKLE_L),
      new THREE.MeshStandardMaterial({ map: createPickleballCourtTexture(), roughness: 0.5 })
    );
    pickleCourt.rotation.x = -Math.PI / 2;
    pickleCourt.position.set(PICKLE_CENTER.x, 0.08, PICKLE_CENTER.z);
    pickleCourt.receiveShadow = true;
    scene.add(pickleCourt);

    // Pickleball Net
    const pickleNet = new THREE.Mesh(
      new THREE.BoxGeometry(PICKLE_W - 1.5, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    pickleNet.position.set(PICKLE_CENTER.x, 0.55, PICKLE_CENTER.z);
    scene.add(pickleNet);

    const netTape = new THREE.Mesh(
      new THREE.BoxGeometry(PICKLE_W - 1.4, 0.14, 0.16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    netTape.position.set(PICKLE_CENTER.x, 1.1, PICKLE_CENTER.z);
    scene.add(netTape);

    const pbSignTex = makeAttachedBuildingNameTexture('PICKLEBALL COURT', '#1e3a8a', '#38bdf8');
    const pbSign = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 1.8, 0.25),
      new THREE.MeshBasicMaterial({ map: pbSignTex })
    );
    pbSign.position.set(PICKLE_CENTER.x - PICKLE_W / 2 - 1.2, 3.2, PICKLE_CENTER.z);
    pbSign.rotation.y = -Math.PI / 2;
    scene.add(pbSign);

    // Active Pickleball Ball
    const pickleBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xeab308,
        emissiveIntensity: 0.4,
        roughness: 0.2
      })
    );
    pickleBallMesh.position.set(PICKLE_CENTER.x, 1.5, PICKLE_CENTER.z);
    scene.add(pickleBallMesh);

    const pickleBallState = {
      x: PICKLE_CENTER.x,
      y: 1.5,
      z: PICKLE_CENTER.z - 6,
      vx: 1.8,
      vz: 9.5,
      phase: 0
    };

    // C. Interactive Campus Playground & Trampoline Jump Pad (X = -70, Z = -34)
    const TRAMPOLINE_POS = { x: -66, z: -28 };
    const trampGroup = new THREE.Group();
    trampGroup.position.set(TRAMPOLINE_POS.x, 0, TRAMPOLINE_POS.z);
    const trampRing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.4, 0.65, 28),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.3 })
    );
    trampRing.position.y = 0.32;
    const trampMatMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.7, 2.7, 0.72, 28),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        roughness: 0.2
      })
    );
    trampMatMesh.position.y = 0.35;
    trampGroup.add(trampRing, trampMatMesh);

    // Colorful Playground Slide & Swings Set next to Trampoline
    const slideTower = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.6, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    slideTower.position.set(-6, 1.8, 0);
    slideTower.castShadow = true;
    const slideRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 1.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    slideRoof.position.set(-6, 4.5, 0);
    slideRoof.rotation.y = Math.PI / 4;
    const slideChute = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.3 })
    );
    slideChute.position.set(-6, 1.6, 3.2);
    slideChute.rotation.x = 0.52;
    trampGroup.add(slideTower, slideRoof, slideChute);
    scene.add(trampGroup);

    // 6. Mountains, Clouds & Trees
    const createMountainRange = () => {
      const mtnMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 165 + (i % 3) * 18;
        const h = 32 + (i % 4) * 10;
        const r = 24 + (i % 3) * 6;
        const mGroup = new THREE.Group();
        mGroup.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);

        const peak = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mtnMat);
        peak.position.y = h / 2 - 1;
        mGroup.add(peak);

        const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.36, h * 0.36, 8), snowMat);
        cap.position.y = h * 0.82 - 1;
        mGroup.add(cap);
        scene.add(mGroup);
      }
    };
    createMountainRange();

    const clouds: Array<{ group: THREE.Group; speed: number }> = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    for (let i = 0; i < 12; i++) {
      const cGroup = new THREE.Group();
      cGroup.position.set((Math.random() - 0.5) * 240, 36 + (i % 3) * 5, (Math.random() - 0.5) * 240);
      [
        [0, 0, 0, 3.2],
        [2.4, -0.3, 0.4, 2.4],
        [-2.4, -0.4, -0.3, 2.5],
        [0.8, 0.7, -0.8, 2.2]
      ].forEach(([cx, cy, cz, cr]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(cr, 12, 12), cloudMat);
        puff.position.set(cx, cy, cz);
        cGroup.add(puff);
      });
      scene.add(cGroup);
      clouds.push({ group: cGroup, speed: 0.8 + (i % 4) * 0.35 });
    }

    const createStylizedTree = (tx: number, tz: number, scale = 1) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36 * scale, 0.54 * scale, 2.8 * scale, 12),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
      );
      trunk.position.y = 1.4 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafColors = [0x15803d, 0x16a34a, 0x22c55e];
      [0, 1, 2].forEach((layer) => {
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry((2.4 - layer * 0.45) * scale, (2.6 - layer * 0.35) * scale, 14),
          new THREE.MeshStandardMaterial({ color: leafColors[layer], roughness: 0.6 })
        );
        crown.position.y = (3.1 + layer * 1.3) * scale;
        crown.castShadow = true;
        tree.add(crown);
      });

      scene.add(tree);
      colliders.push({
        minX: tx - 0.75,
        maxX: tx + 0.75,
        minZ: tz - 0.75,
        maxZ: tz + 0.75
      });
    };

    const treeCoords = [
      [-22, -38, 1.2], [22, -38, 1.15], [-24, 38, 1.2], [24, 38, 1.25],
      [-28, -8, 1.05], [28, -8, 1.1], [-28, 10, 1.05], [28, 10, 1.1],
      [-18, -58, 1.3], [18, -58, 1.3], [-18, 60, 1.3], [18, 60, 1.3]
    ];
    treeCoords.forEach(([tx, tz, sc]) => createStylizedTree(tx, tz, sc));

    // Collectible Word Crystals
    const crystalWords = [
      { word: 'COHERENCE', x: 18, y: 1.4, z: -12, color: 0x38bdf8 },
      { word: 'LEXICAL', x: -18, y: 1.4, z: -12, color: 0xf59e0b },
      { word: 'FLUENCY', x: -18, y: 1.4, z: 14, color: 0xa855f7 },
      { word: 'ARTICULATE', x: 18, y: 1.4, z: 14, color: 0x10b981 },
      { word: 'BAND 9.0', x: -75, y: 1.5, z: -14, color: 0xf43f5e }
    ];
    const crystalObjs: Array<{ mesh: THREE.Mesh; word: string; collected: boolean; baseY: number }> = [];
    crystalWords.forEach((cw) => {
      const cMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.72, 0),
        new THREE.MeshStandardMaterial({
          color: cw.color,
          emissive: cw.color,
          emissiveIntensity: 0.5,
          roughness: 0.15,
          metalness: 0.8
        })
      );
      cMesh.position.set(cw.x, cw.y, cw.z);
      scene.add(cMesh);
      crystalObjs.push({ mesh: cMesh, word: cw.word, collected: false, baseY: cw.y });
    });

    // ============================================================================
    // 7. HIGH-DETAIL 3D CHARACTER BUILDER (Sculpted Head, Ears, Smile, Shoes, Backpack, Collar)
    // ============================================================================
    const createNameplateSprite = (name: string, cohort: string) => {
      const c = document.createElement('canvas');
      c.width = 360;
      c.height = 88;
      const ctx = c.getContext('2d')!;

      const isTeacher = cohort.toUpperCase().includes('TEACHER') || cohort.toUpperCase().includes('ADMIN');
      const isIelts2 = cohort.includes('2');
      const badgeColor = isTeacher ? '#d97706' : isIelts2 ? '#10b981' : '#2563eb';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(6, 6, 348, 76, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = badgeColor;
      ctx.stroke();

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(42, 12, 276, 24, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cohort.toUpperCase(), 180, 29);

      ctx.fillStyle = isTeacher ? '#fde68a' : '#ffffff';
      ctx.font = '900 21px Plus Jakarta Sans, sans-serif';
      ctx.fillText(name.slice(0, 20), 180, 62);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false })
      );
      sprite.scale.set(2.65, 0.65, 1);
      sprite.position.set(0, 3.78, 0);
      return sprite;
    };

    const buildCharacterAvatar = (opts: {
      shirtColor: string;
      hairColor: string;
      skinColor: string;
      hatType: string;
      accessoryType: string;
      name: string;
      cohort: string;
    }) => {
      const root = new THREE.Group();
      const segs = currentQuality === 'high' ? 20 : currentQuality === 'medium' ? 12 : 8;

      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.78, segs),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.02;
      root.add(shadowDisc);

      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      const skinMat = new THREE.MeshStandardMaterial({ color: opts.skinColor, roughness: 0.45, metalness: 0.04 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: opts.shirtColor, roughness: 0.38, metalness: 0.14 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.08 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
      const hairMat = new THREE.MeshStandardMaterial({ color: opts.hairColor, roughness: 0.6, metalness: 0.08 });

      // Legs + Detailed Sneakers
      const createLegWithShoe = (lx: number) => {
        const legGroup = new THREE.Group();
        legGroup.position.set(lx, 0.92, 0);
        const legCyl = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.52, 8, segs), pantsMat);
        legCyl.position.y = -0.38;
        legCyl.castShadow = true;
        legGroup.add(legCyl);

        const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.54), shoeMat);
        sneaker.position.set(0, -0.8, 0.06);
        sneaker.castShadow = true;
        legGroup.add(sneaker);
        return legGroup;
      };

      const leftLeg = createLegWithShoe(-0.24);
      const rightLeg = createLegWithShoe(0.24);
      root.add(leftLeg, rightLeg);

      // Sculpted Torso + White Shirt Collar + Student Backpack
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.52, 8, segs), shirtMat);
      torso.position.y = 1.45;
      torso.castShadow = true;
      bodyGroup.add(torso);

      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.06, 8, segs),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.92;
      bodyGroup.add(collar);

      // Student Backpack on Back
      const isTeacherCohort = opts.cohort.toUpperCase().includes('TEACHER');
      const backpack = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.72, 0.32),
        new THREE.MeshStandardMaterial({
          color: isTeacherCohort ? 0xb45309 : opts.cohort.includes('2') ? 0x059669 : 0x1e3a8a,
          roughness: 0.4,
          metalness: 0.2
        })
      );
      backpack.position.set(0, 1.48, -0.38);
      backpack.castShadow = true;
      bodyGroup.add(backpack);

      // Smooth Capsule Arms + Hands
      const createArm = (ax: number) => {
        const armGroup = new THREE.Group();
        armGroup.position.set(ax, 1.86, 0);
        const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.48, 8, segs), shirtMat);
        sleeve.position.y = -0.34;
        sleeve.castShadow = true;
        armGroup.add(sleeve);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.16, segs, segs), skinMat);
        hand.position.y = -0.76;
        armGroup.add(hand);
        return armGroup;
      };

      const leftArm = createArm(-0.58);
      const rightArm = createArm(0.58);
      bodyGroup.add(leftArm, rightArm);

      // Detailed Sculpted Head + Ears + Eyes + Smile
      const headGroup = new THREE.Group();
      headGroup.position.y = 2.44;
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, segs, segs), skinMat);
      headMesh.scale.set(1.0, 1.04, 0.96);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // Ears
      [-0.45, 0.45].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
        ear.position.set(ex, 0.0, 0);
        headGroup.add(ear);
      });

      // Expressive Eyes with White Highlights
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const pupilHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-0.16, 0.16].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), eyeMat);
        eye.position.set(ex, 0.06, 0.41);
        headGroup.add(eye);
        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), pupilHighlightMat);
        glint.position.set(ex + 0.02, 0.08, 0.46);
        headGroup.add(glint);
      });

      // Friendly Smile Arc
      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.022, 6, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0x7c2d12 })
      );
      smile.rotation.x = Math.PI;
      smile.position.set(0, -0.08, 0.42);
      headGroup.add(smile);

      // Sculpted Hair Dome
      const hairDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, segs, segs, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hairDome.position.y = 0.05;
      headGroup.add(hairDome);

      // Hats / Headgear
      if (opts.hatType === 'grad') {
        const mortar = new THREE.Mesh(
          new THREE.BoxGeometry(1.12, 0.08, 1.12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
        );
        mortar.position.y = 0.52;
        headGroup.add(mortar);
        const tassel = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.32, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.7 })
        );
        tassel.position.set(0.46, 0.38, 0.46);
        headGroup.add(tassel);
      } else if (opts.hatType === 'crown') {
        const crown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.32, 0.28, 12),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.88 })
        );
        crown.position.y = 0.54;
        headGroup.add(crown);
      } else if (opts.hatType === 'cap') {
        const capVisor = new THREE.Mesh(
          new THREE.BoxGeometry(0.76, 0.08, 0.42),
          new THREE.MeshStandardMaterial({ color: opts.shirtColor, roughness: 0.35 })
        );
        capVisor.position.set(0, 0.32, 0.42);
        headGroup.add(capVisor);
      } else if (opts.hatType === 'headphones') {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.49, 0.06, 8, 20, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.7 })
        );
        band.position.y = 0.06;
        headGroup.add(band);
      }

      if (opts.accessoryType === 'glasses' || opts.accessoryType === 'shades') {
        const gMat = new THREE.MeshStandardMaterial({
          color: opts.accessoryType === 'shades' ? 0x0f172a : 0x38bdf8,
          roughness: 0.12,
          metalness: 0.85
        });
        const glassesBar = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.17, 0.08), gMat);
        glassesBar.position.set(0, 0.06, 0.44);
        headGroup.add(glassesBar);
      }

      bodyGroup.add(headGroup);

      const nameplate = createNameplateSprite(opts.name, opts.cohort);
      root.add(nameplate);

      return {
        root,
        bodyGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        headGroup
      };
    };

    let playerRig = buildCharacterAvatar(playerProfile);
    scene.add(playerRig.root);

    // Active 3D speech bubbles above characters
    const activeSpeechBubbles: Array<{
      rigRoot: THREE.Group;
      sprite: THREE.Sprite;
      expiresAt: number;
    }> = [];

    const attachSpeechBubble = (rigRoot: THREE.Group, speakerName: string, text: string, isWarning = false) => {
      // Remove any existing speech bubble on this rigRoot
      for (let i = activeSpeechBubbles.length - 1; i >= 0; i--) {
        if (activeSpeechBubbles[i].rigRoot === rigRoot) {
          rigRoot.remove(activeSpeechBubbles[i].sprite);
          activeSpeechBubbles.splice(i, 1);
        }
      }
      const sprite = createSpeechBubbleSprite(speakerName, text, isWarning);
      rigRoot.add(sprite);
      activeSpeechBubbles.push({
        rigRoot,
        sprite,
        expiresAt: performance.now() + 6200
      });
    };

    // Pickleball AI Partner Character on North side of Pickleball Court
    const pickleOpponentRig = buildCharacterAvatar({
      shirtColor: '#f59e0b',
      hairColor: '#1c1917',
      skinColor: '#fcd34d',
      hatType: 'cap',
      accessoryType: 'shades',
      name: 'Coach Leo (Pickleball)',
      cohort: 'IELTS 2'
    });
    pickleOpponentRig.root.position.set(PICKLE_CENTER.x, 0, PICKLE_CENTER.z - 8.5);
    scene.add(pickleOpponentRig.root);

    // Football AI Goalkeeper on North Goal of Football Field
    const footballKeeperRig = buildCharacterAvatar({
      shirtColor: '#ef4444',
      hairColor: '#0f172a',
      skinColor: '#f1c27d',
      hatType: 'cap',
      accessoryType: 'none',
      name: 'Keeper Max (GK)',
      cohort: 'IELTS 1'
    });
    footballKeeperRig.root.position.set(PITCH_CENTER.x, 0, PITCH_CENTER.z - PITCH_L / 2 + 1.4);
    scene.add(footballKeeperRig.root);

    // Autonomous IELTS 1, IELTS 2 & Teacher Jan Classmates
    interface NpcActor {
      profile: IeltsCharacterProfile;
      rig: ReturnType<typeof buildCharacterAvatar>;
      targetX: number;
      targetZ: number;
      speed: number;
      walkPhase: number;
      pauseTimer: number;
    }
    const npcActors: NpcActor[] = [];
    const npcGroup = new THREE.Group();
    scene.add(npcGroup);

    const spawnNpcActors = (profiles: IeltsCharacterProfile[]) => {
      while (npcGroup.children.length > 0) {
        npcGroup.remove(npcGroup.children[0]);
      }
      npcActors.length = 0;

      profiles.slice(0, 14).forEach((prof, idx) => {
        const rig = buildCharacterAvatar({
          shirtColor: prof.shirtColor,
          hairColor: prof.hairColor,
          skinColor: prof.skinColor,
          hatType: prof.hatType,
          accessoryType: prof.accessoryType,
          name: prof.name,
          cohort: prof.cohort
        });
        const isTeacherJan = prof.id === TEACHER_JAN_PROFILE.id || prof.cohort.includes('TEACHER');
        const angle = (idx / Math.max(1, Math.min(14, profiles.length))) * Math.PI * 2;
        const radius = isTeacherJan ? 8 : 14 + (idx % 3) * 8;
        rig.root.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        rig.root.userData = { npcProfileId: prof.id };
        npcGroup.add(rig.root);

        const targetB = BUILDINGS.find((b) => b.id === prof.targetBuildingId) || BUILDINGS[idx % BUILDINGS.length];
        npcActors.push({
          profile: prof,
          rig,
          targetX: targetB.doorX + (Math.random() - 0.5) * 8,
          targetZ: targetB.doorZ + targetB.frontDir * 4.5,
          speed: isTeacherJan ? 3.2 : 3.5 + (idx % 3) * 0.45,
          walkPhase: idx * 1.1,
          pauseTimer: 0
        });
      });
    };

    spawnNpcActors(ieltsCharacters);

    // ============================================================================
    // 8. REDESIGNED BRIGHT & WELCOMING 3D BUILDING INTERIOR + ARCHITECTURAL EXIT DOOR
    // ============================================================================
    const interiorGroup = new THREE.Group();
    interiorGroup.position.set(INTERIOR_ORIGIN.x, INTERIOR_ORIGIN.y, INTERIOR_ORIGIN.z);
    interiorGroup.visible = false;
    scene.add(interiorGroup);

    let clickableBoardMeshes: THREE.Object3D[] = [];
    let currentInteriorBoards: Array<{ spec: WallBoardSpec; x: number; z: number; mesh: THREE.Mesh }> = [];
    let activeInteriorBuilding: BuildingZone | null = null;
    let savedExteriorPos = { x: 0, z: 14, rotY: Math.PI };
    let doorCooldownTimer = 0;
    let interiorExitLeftDoor: THREE.Group | null = null;
    let interiorExitRightDoor: THREE.Group | null = null;
    let interiorExitOpenAmount = 0;

    // Bright High-Clarity Interactive Wall Board Texture
    const makeBrightInteriorBoardTexture = (spec: WallBoardSpec) => {
      if (spec.dashboardType === 'personal') {
        return createPersonalDashboardWallTexture(dashboardDataRef.current.myStats, maxAnisotropy);
      }
      if (spec.dashboardType === 'class') {
        return createClassDashboardWallTexture(
          dashboardDataRef.current.classCohortLabel,
          dashboardDataRef.current.classStudents,
          dashboardDataRef.current.myStats.name,
          maxAnisotropy
        );
      }
      if (
        spec.dashboardType === 'listening' ||
        spec.dashboardType === 'reading' ||
        spec.dashboardType === 'writing' ||
        spec.dashboardType === 'speaking'
      ) {
        return createSkillDashboardWallTexture(
          dashboardDataRef.current.myStats,
          spec.dashboardType,
          maxAnisotropy
        );
      }

      const c = document.createElement('canvas');
      c.width = 768;
      c.height = 440;
      const ctx = c.getContext('2d')!;

      // Clean white/pastel card with colorful border
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(8, 8, 752, 424, 30);
      ctx.fill();
      ctx.lineWidth = 12;
      ctx.strokeStyle = spec.accentHex;
      ctx.stroke();

      // Top tinted header band
      ctx.fillStyle = spec.bgLightHex;
      ctx.beginPath();
      ctx.roundRect(20, 20, 728, 92, 20);
      ctx.fill();

      ctx.fillStyle = spec.accentHex;
      ctx.font = '900 24px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(spec.category, 384, 76);

      // Main Title in Deep Slate
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 44px Plus Jakarta Sans, sans-serif';
      ctx.fillText(spec.title, 384, 188);

      // Subtitle
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 25px Plus Jakarta Sans, sans-serif';
      ctx.fillText(spec.subtitle, 384, 248);

      // Vibrant CTA Button Pill
      ctx.fillStyle = spec.accentHex;
      ctx.beginPath();
      ctx.roundRect(164, 308, 440, 80, 40);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px Plus Jakarta Sans, sans-serif';
      ctx.fillText(spec.badge, 384, 358);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const createWoodFloorTexture = (tintHex: number) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      const base = new THREE.Color(tintHex);
      ctx.fillStyle = `#${base.getHexString()}`;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 3;
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const buildInteriorRoom = (building: BuildingZone) => {
      while (interiorGroup.children.length > 0) {
        interiorGroup.remove(interiorGroup.children[0]);
      }
      clickableBoardMeshes = [];
      currentInteriorBoards = [];

      const roomW = 28;
      const roomD = 24;
      const roomH = 10.5;

      // Bright Polished Classroom Floor
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(roomW, 0.4, roomD),
        new THREE.MeshStandardMaterial({
          map: createWoodFloorTexture(building.interiorFloorColor),
          roughness: 0.35,
          metalness: 0.08
        })
      );
      floor.position.set(0, -0.2, 0);
      floor.receiveShadow = true;
      interiorGroup.add(floor);

      // Welcome Runner Carpet leading to Exit Door
      const carpet = new THREE.Mesh(
        new THREE.BoxGeometry(5.8, 0.05, roomD - 4),
        new THREE.MeshStandardMaterial({ color: building.accentColor, roughness: 0.65 })
      );
      carpet.position.set(0, 0.03, 0);
      interiorGroup.add(carpet);

      // Bright Daylight Walls (Back, Left, Right, and Front Wall framing the Exit Door)
      const wallMat = new THREE.MeshStandardMaterial({
        color: building.interiorWallColor,
        roughness: 0.45,
        metalness: 0.05
      });

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.5), wallMat);
      backWall.position.set(0, roomH / 2, -roomD / 2);
      interiorGroup.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), wallMat);
      leftWall.position.set(-roomW / 2, roomH / 2, 0);
      interiorGroup.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), wallMat);
      rightWall.position.set(roomW / 2, roomH / 2, 0);
      interiorGroup.add(rightWall);

      // Baseboard trim along walls
      const trimMat = new THREE.MeshStandardMaterial({ color: building.accentColor, roughness: 0.4 });
      const backTrim = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.45, 0.6), trimMat);
      backTrim.position.set(0, 0.22, -roomD / 2);
      interiorGroup.add(backTrim);

      // Bright Studio Daylight Illumination inside the room
      const roomLight1 = new THREE.PointLight(0xffffff, 3.2, 45);
      roomLight1.position.set(-6, 8.8, -3);
      interiorGroup.add(roomLight1);

      const roomLight2 = new THREE.PointLight(0xffffff, 3.2, 45);
      roomLight2.position.set(6, 8.8, -3);
      interiorGroup.add(roomLight2);

      const roomLight3 = new THREE.PointLight(0xfffbeb, 2.8, 45);
      roomLight3.position.set(0, 8.8, 5);
      interiorGroup.add(roomLight3);

      // Decorative Potted Plants in Room Corners
      [
        [-roomW / 2 + 1.8, -roomD / 2 + 1.8],
        [roomW / 2 - 1.8, -roomD / 2 + 1.8]
      ].forEach(([px, pz]) => {
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.48, 1.1, 14),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
        );
        pot.position.set(px, 0.55, pz);
        const bush = new THREE.Mesh(
          new THREE.SphereGeometry(1.05, 14, 14),
          new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 })
        );
        bush.position.set(px, 1.65, pz);
        interiorGroup.add(pot, bush);
      });

      // REAL 3D ARCHITECTURAL EXIT DOOR AT FRONT (+Z)
      const exitZ = roomD / 2 - 0.35;
      const exitFrameGroup = new THREE.Group();
      exitFrameGroup.position.set(0, 0, exitZ);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 });
      const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 0.45), frameMat);
      leftJamb.position.set(-2.35, 2.6, 0);
      const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.2, 0.45), frameMat);
      rightJamb.position.set(2.35, 2.6, 0);
      const headerJamb = new THREE.Mesh(new THREE.BoxGeometry(5.15, 0.5, 0.45), frameMat);
      headerJamb.position.set(0, 5.1, 0);
      exitFrameGroup.add(leftJamb, rightJamb, headerJamb);

      // Illuminated Green "EXIT TO CAMPUS" Sign mounted cleanly above the door frame
      const exitSignTex = makeAttachedBuildingNameTexture('EXIT DOOR', '#059669', '#34d399');
      const exitSignBacking = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 1.1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 })
      );
      exitSignBacking.position.set(0, 6.05, 0);
      exitFrameGroup.add(exitSignBacking);

      const exitSignFront = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 0.98),
        new THREE.MeshBasicMaterial({ map: exitSignTex })
      );
      exitSignFront.position.set(0, 6.05, -0.12);
      exitSignFront.rotation.y = Math.PI;
      exitSignFront.userData = { isExitDoor: true };
      exitFrameGroup.add(exitSignFront);
      clickableBoardMeshes.push(exitSignFront);

      // Sliding Glass Exit Door Panels
      const createInteriorExitLeaf = (isLeft: boolean) => {
        const lGroup = new THREE.Group();
        const border = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 4.8, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.4 })
        );
        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(1.75, 4.3, 0.22),
          new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.4,
            roughness: 0.1,
            metalness: 0.7
          })
        );
        glass.userData = { isExitDoor: true };
        const handleBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.85, 0.32),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 })
        );
        handleBar.position.set(isLeft ? 0.72 : -0.72, 0, 0);
        lGroup.add(border, glass, handleBar);
        clickableBoardMeshes.push(glass, border);
        return lGroup;
      };

      interiorExitLeftDoor = createInteriorExitLeaf(true);
      interiorExitRightDoor = createInteriorExitLeaf(false);
      interiorExitLeftDoor.position.set(-1.06, 2.4, 0);
      interiorExitRightDoor.position.set(1.06, 2.4, 0);
      exitFrameGroup.add(interiorExitLeftDoor, interiorExitRightDoor);

      // Glowing Emerald Exit Floor Pad
      const exitPad = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.08, 32),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 })
      );
      exitPad.position.set(0, 0.04, -1.6);
      exitPad.userData = { isExitDoor: true };
      exitFrameGroup.add(exitPad);
      clickableBoardMeshes.push(exitPad);

      interiorGroup.add(exitFrameGroup);

      // Interactive 3D Wall Boards (In Dashboard Hall: Back wall has Personal Overview + Class Dashboard; Left & Right walls have Listening, Reading, Writing, Speaking Dashboards)
      const isDashboardHall = building.id === 'dashboard';
      const boards = INTERIOR_BOARDS_BY_BUILDING[building.id] || INTERIOR_BOARDS_BY_BUILDING['practice_tests'];
      const slotTransforms: Record<
        WallBoardSpec['slot'],
        { x: number; y: number; z: number; rotY: number; standX: number; standZ: number }
      > = {
        'back-left': {
          x: isDashboardHall ? -6.5 : -6.4,
          y: isDashboardHall ? 4.9 : 4.6,
          z: -roomD / 2 + 0.4,
          rotY: 0,
          standX: INTERIOR_ORIGIN.x + (isDashboardHall ? -6.5 : -6.4),
          standZ: INTERIOR_ORIGIN.z - roomD / 2 + 4.0
        },
        'back-right': {
          x: isDashboardHall ? 6.5 : 6.4,
          y: isDashboardHall ? 4.9 : 4.6,
          z: -roomD / 2 + 0.4,
          rotY: 0,
          standX: INTERIOR_ORIGIN.x + (isDashboardHall ? 6.5 : 6.4),
          standZ: INTERIOR_ORIGIN.z - roomD / 2 + 4.0
        },
        'left-wall': {
          x: -roomW / 2 + 0.4,
          y: 4.6,
          z: -1.8,
          rotY: Math.PI / 2,
          standX: INTERIOR_ORIGIN.x - roomW / 2 + 3.6,
          standZ: INTERIOR_ORIGIN.z - 1.8
        },
        'right-wall': {
          x: roomW / 2 - 0.4,
          y: 4.6,
          z: -1.8,
          rotY: -Math.PI / 2,
          standX: INTERIOR_ORIGIN.x + roomW / 2 - 3.6,
          standZ: INTERIOR_ORIGIN.z - 1.8
        },
        'left-back': {
          x: -roomW / 2 + 0.4,
          y: 4.75,
          z: -5.8,
          rotY: Math.PI / 2,
          standX: INTERIOR_ORIGIN.x - roomW / 2 + 3.6,
          standZ: INTERIOR_ORIGIN.z - 5.8
        },
        'left-front': {
          x: -roomW / 2 + 0.4,
          y: 4.75,
          z: 4.2,
          rotY: Math.PI / 2,
          standX: INTERIOR_ORIGIN.x - roomW / 2 + 3.6,
          standZ: INTERIOR_ORIGIN.z + 4.2
        },
        'right-back': {
          x: roomW / 2 - 0.4,
          y: 4.75,
          z: -5.8,
          rotY: -Math.PI / 2,
          standX: INTERIOR_ORIGIN.x + roomW / 2 - 3.6,
          standZ: INTERIOR_ORIGIN.z - 5.8
        },
        'right-front': {
          x: roomW / 2 - 0.4,
          y: 4.75,
          z: 4.2,
          rotY: -Math.PI / 2,
          standX: INTERIOR_ORIGIN.x + roomW / 2 - 3.6,
          standZ: INTERIOR_ORIGIN.z + 4.2
        }
      };

      boards.forEach((bSpec) => {
        const tf = slotTransforms[bSpec.slot];
        const bGroup = new THREE.Group();
        bGroup.position.set(tf.x, tf.y, tf.z);
        bGroup.rotation.y = tf.rotY;

        const isBackDashboardBoard = bSpec.dashboardType === 'personal' || bSpec.dashboardType === 'class';
        const isSideSkillDashboardBoard =
          bSpec.dashboardType === 'listening' ||
          bSpec.dashboardType === 'reading' ||
          bSpec.dashboardType === 'writing' ||
          bSpec.dashboardType === 'speaking';

        const boardW = isBackDashboardBoard ? 11.2 : isSideSkillDashboardBoard ? 9.4 : 8.2;
        const boardH = isBackDashboardBoard ? 6.6 : isSideSkillDashboardBoard ? 5.8 : 4.8;

        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(boardW, boardH, 0.18),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        backing.userData = { boardSpec: bSpec };
        bGroup.add(backing);

        const bTex = makeBrightInteriorBoardTexture(bSpec);
        const faceMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(boardW - 0.2, boardH - 0.2),
          new THREE.MeshBasicMaterial({ map: bTex })
        );
        faceMesh.position.z = 0.11;
        faceMesh.userData = { boardSpec: bSpec };
        bGroup.add(faceMesh);

        interiorGroup.add(bGroup);
        clickableBoardMeshes.push(backing, faceMesh);

        const padMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.75, 1.75, 0.08, 28),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(bSpec.accentHex),
            transparent: true,
            opacity: 0.38
          })
        );
        padMesh.position.set(
          tf.standX - INTERIOR_ORIGIN.x,
          0.05,
          tf.standZ - INTERIOR_ORIGIN.z
        );
        padMesh.userData = { boardSpec: bSpec };
        interiorGroup.add(padMesh);
        clickableBoardMeshes.push(padMesh);

        currentInteriorBoards.push({
          spec: bSpec,
          x: tf.standX,
          z: tf.standZ,
          mesh: faceMesh
        });
      });
    };

    // ============================================================================
    // 9. PLAYER MOVEMENT, TOUCH PINCH/SCROLL ZOOM & CAMERA ANTI-OCCLUSION
    // ============================================================================
    const playerState = {
      x: 0,
      y: 0,
      z: 14,
      vx: 0,
      vz: 0,
      vy: 0,
      rotY: Math.PI,
      isGrounded: true,
      sprinting: false,
      isCrouching: false,
      crouchLerp: 0,
      walkCycle: 0,
      waveTimer: 0,
      kickTimer: 0,
      hitTimer: 0
    };

    let lastDetectedSportsZone: 'football' | 'pickleball' | null = null;
    let keeperGoalCooldown = 0;

    const camState = {
      yaw: 0,
      pitch: 0.36,
      distance: 14.0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      pinchStartDist: 0
    };

    const keys: Record<string, boolean> = {};

    const enterBuildingInterior = (b: BuildingZone) => {
      soundEngine.playDoorSlide(true);
      soundEngine.startRoomMusic(b.id);
      doorCooldownTimer = 1.2;
      if (!activeInteriorBuilding) {
        savedExteriorPos = {
          x: b.doorX,
          z: b.doorZ + b.frontDir * 4.5,
          rotY: b.frontDir === 1 ? 0 : Math.PI
        };
      }
      activeInteriorBuilding = b;
      buildInteriorRoom(b);
      interiorGroup.visible = true;
      playerState.x = INTERIOR_ORIGIN.x;
      playerState.y = 0;
      playerState.z = INTERIOR_ORIGIN.z + 5.5;
      playerState.vx = 0;
      playerState.vz = 0;
      playerState.vy = 0;
      playerState.rotY = Math.PI;
      camState.yaw = 0;
      camState.pitch = b.id === 'dashboard' ? 0.25 : 0.28;
      camState.distance = b.id === 'dashboard' ? 13.8 : 11.8;
      setZoomSliderValue(b.id === 'dashboard' ? 14 : 12);
      setInsideBuilding(b);
      setNearBuildingPrompt(null);
      if (lastDetectedSportsZone !== null) {
        lastDetectedSportsZone = null;
        setInSportsZone('none');
      }
      if (b.id === 'dashboard') {
        showToast(
          `Welcome to ${dashboardDataRef.current.myStats.name}'s Dashboard Hall!`,
          `Inspect your Personal Overview, Class Scoreboard, plus Listening, Reading, Writing & Speaking walls!`,
          b.hexAccent
        );
      } else {
        showToast(
          `Inside ${b.name}`,
          `Now playing: ♪ ${ROOM_SONGS[b.id]?.name || 'Classroom Melody'}`,
          b.hexAccent
        );
      }
    };

    const exitBuildingInterior = () => {
      if (!activeInteriorBuilding) return;
      soundEngine.playDoorSlide(false);
      soundEngine.startRoomMusic('campus');
      doorCooldownTimer = 1.2;
      activeInteriorBuilding = null;
      interiorGroup.visible = false;
      playerState.x = savedExteriorPos.x;
      playerState.y = 0;
      playerState.z = savedExteriorPos.z;
      playerState.rotY = savedExteriorPos.rotY;
      playerState.vx = 0;
      playerState.vz = 0;
      playerState.vy = 0;
      camState.yaw = savedExteriorPos.rotY === 0 ? Math.PI : 0;
      camState.distance = 14.0;
      setZoomSliderValue(14);
      setInsideBuilding(null);
      setNearBoardPrompt(null);
      showToast('Back on EraVerse Campus', 'Visit the Football Field & Pickleball Court in the Sports Park!', '#2563EB');
    };

    const teleportToBuilding = (buildingId: string) => {
      const b = BUILDINGS.find((item) => item.id === buildingId);
      if (!b) return;
      soundEngine.playUiClick();
      if (activeInteriorBuilding) {
        exitBuildingInterior();
      }
      playerState.x = b.doorX;
      playerState.y = 0;
      playerState.z = b.doorZ + b.frontDir * 4.0;
      playerState.vy = 0;
      playerState.rotY = b.frontDir === 1 ? Math.PI : 0;
      camState.yaw = b.frontDir === 1 ? 0 : Math.PI;
    };

    gameActionsRef.current = {
      teleportToBuilding,
      enterBuildingInterior,
      exitBuildingInterior,
      applyAvatarAppearance: (prof) => {
        const oldPos = playerRig.root.position.clone();
        const oldRot = playerRig.root.rotation.y;
        scene.remove(playerRig.root);
        playerRig = buildCharacterAvatar(prof);
        playerRig.root.position.copy(oldPos);
        playerRig.root.rotation.y = oldRot;
        scene.add(playerRig.root);
        if (activeInteriorBuilding?.id === 'dashboard') {
          buildInteriorRoom(activeInteriorBuilding);
        }
      },
      setGraphicsQuality: (q: GraphicsQuality) => {
        currentQuality = q;
        if (q === 'high') {
          renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio * 1.25, 2.5));
          renderer.shadowMap.enabled = !isSoftwareGl;
          renderer.toneMappingExposure = 1.18;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.003);
        } else if (q === 'medium') {
          renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
          renderer.shadowMap.enabled = !isSoftwareGl;
          renderer.toneMappingExposure = 1.1;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0042);
        } else {
          renderer.setPixelRatio(1);
          renderer.shadowMap.enabled = false;
          renderer.toneMappingExposure = 1.05;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0055);
        }
        const oldPos = playerRig.root.position.clone();
        const oldRot = playerRig.root.rotation.y;
        scene.remove(playerRig.root);
        playerRig = buildCharacterAvatar(playerProfile);
        playerRig.root.position.copy(oldPos);
        playerRig.root.rotation.y = oldRot;
        scene.add(playerRig.root);
      },
      setSkyPreset: (mode) => {
        soundEngine.playUiClick();
        if (mode === 'day') {
          scene.background = new THREE.Color(0x38bdf8);
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0032);
          sunLight.color.setHex(0xfffbeb);
          sunLight.intensity = 1.5;
          hemiLight.intensity = 0.9;
        } else if (mode === 'sunset') {
          scene.background = new THREE.Color(0xfb923c);
          scene.fog = new THREE.FogExp2(0xfdba74, 0.0042);
          sunLight.color.setHex(0xfed7aa);
          sunLight.intensity = 1.25;
          hemiLight.intensity = 0.7;
        } else {
          scene.background = new THREE.Color(0x0f172a);
          scene.fog = new THREE.FogExp2(0x0f172a, 0.005);
          sunLight.color.setHex(0x60a5fa);
          sunLight.intensity = 0.65;
          hemiLight.intensity = 0.45;
        }
      },
      triggerJump: () => {
        if (playerState.isGrounded) {
          playerState.isCrouching = false;
          setIsCrouching(false);
          playerState.vy = 12.2;
          playerState.isGrounded = false;
          soundEngine.playJump(false);
        }
      },
      toggleCrouch: () => {
        playerState.isCrouching = !playerState.isCrouching;
        setIsCrouching(playerState.isCrouching);
        soundEngine.playUiClick();
      },
      triggerKick: () => {
        playerState.kickTimer = 0.42;
        soundEngine.playBallKick();
        if (!activeInteriorBuilding) {
          const distToBall = Math.hypot(playerState.x - soccerBallState.x, playerState.z - soccerBallState.z);
          if (distToBall < 4.5) {
            // Aim shot toward the facing direction (or North Goal if facing North)
            const faceX = Math.sin(playerState.rotY);
            const faceZ = Math.cos(playerState.rotY);
            const toBallX = (soccerBallState.x - playerState.x) / Math.max(0.25, distToBall);
            const toBallZ = (soccerBallState.z - playerState.z) / Math.max(0.25, distToBall);
            const shotX = faceX * 0.65 + toBallX * 0.35;
            const shotZ = faceZ * 0.65 + toBallZ * 0.35;
            const norm = Math.hypot(shotX, shotZ) || 1;
            soccerBallState.vx = (shotX / norm) * 24.5;
            soccerBallState.vz = (shotZ / norm) * 24.5;
            soccerBallState.vy = 7.4;
            showToast('Power Kick! ⚽', 'Blasted the football downfield!', '#16A34A');
          }
        }
      },
      triggerHit: () => {
        playerState.hitTimer = 0.42;
        soundEngine.playPickleballHit();
        if (!activeInteriorBuilding) {
          const distPickle = Math.hypot(playerState.x - pickleBallState.x, playerState.z - pickleBallState.z);
          if (distPickle < 5.6) {
            pickleBallState.vz = -Math.abs(pickleBallState.vz) * 1.18 - 2.0;
            pickleBallState.vx = (Math.random() - 0.5) * 6.5;
            pickleBallState.phase = 0.35;
            setPickleballScore((s) => s + 1);
            setXp((x) => x + 30);
            showToast('Pickleball Power Smash! 🏓 +30 XP', 'Crushed the return over the net!', '#0EA5E9');
          } else {
            // Also allow hitting soccer ball if right next to it
            const distSoccer = Math.hypot(playerState.x - soccerBallState.x, playerState.z - soccerBallState.z);
            if (distSoccer < 3.4) {
              soccerBallState.vx = Math.sin(playerState.rotY) * 18;
              soccerBallState.vz = Math.cos(playerState.rotY) * 18;
              soccerBallState.vy = 6.0;
            }
          }
        }
      },
      triggerWave: () => {
        playerState.waveTimer = 1.8;
        soundEngine.playUiClick();
      },
      setZoomDistance: (dist: number) => {
        camState.distance = Math.max(6.5, Math.min(26, dist));
      },
      syncNpcProfiles: (profiles) => {
        spawnNpcActors(profiles);
      },
      showSpeechBubbleOnActor: (actorId, speakerName, text, isWarning) => {
        if (actorId === 'player') {
          attachSpeechBubble(playerRig.root, speakerName, text, isWarning);
          return;
        }
        const foundNpc = npcActors.find((n) => n.profile.id === actorId);
        if (foundNpc) {
          attachSpeechBubble(foundNpc.rig.root, speakerName, text, isWarning);
        }
      },
      refreshDashboardWalls: () => {
        if (activeInteriorBuilding && activeInteriorBuilding.id === 'dashboard') {
          buildInteriorRoom(activeInteriorBuilding);
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement)?.tagName)) return;
      const code = e.code;
      keys[code] = true;

      if (code === 'Space') {
        e.preventDefault();
        gameActionsRef.current?.triggerJump();
      } else if (code === 'KeyC') {
        e.preventDefault();
        gameActionsRef.current?.toggleCrouch();
      } else if (code === 'KeyF') {
        e.preventDefault();
        gameActionsRef.current?.triggerKick();
      } else if (code === 'KeyG') {
        e.preventDefault();
        gameActionsRef.current?.triggerHit();
      } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
        playerState.sprinting = true;
      } else if (code === 'KeyE') {
        if (activeInteriorBuilding) {
          let closestBoard: WallBoardSpec | null = null;
          let minD = 4.8;
          currentInteriorBoards.forEach((cb) => {
            const d = Math.hypot(playerState.x - cb.x, playerState.z - cb.z);
            if (d < minD) {
              minD = d;
              closestBoard = cb.spec;
            }
          });
          if (closestBoard) {
            handleBoardActionRef.current(closestBoard);
          } else {
            setActiveBuildingModal(activeInteriorBuilding.id);
          }
        } else {
          let closestB: BuildingZone | null = null;
          let minD = 6.5;
          BUILDINGS.forEach((b) => {
            const d = Math.hypot(playerState.x - b.doorX, playerState.z - b.doorZ);
            if (d < minD) {
              minD = d;
              closestB = b;
            }
          });
          if (closestB) {
            enterBuildingInterior(closestB);
          }
        }
      } else if (code === 'KeyT') {
        e.preventDefault();
        setShowChatModal((prev) => !prev);
      } else if (code === 'Escape') {
        setShowChatModal(false);
        if (activeInteriorBuilding) {
          exitBuildingInterior();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        playerState.sprinting = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const raycaster = new THREE.Raycaster();
    const camOcclusionRaycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      camState.isDragging = true;
      camState.lastX = e.clientX;
      camState.lastY = e.clientY;
      camState.downX = e.clientX;
      camState.downY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!camState.isDragging) return;
      const dx = e.clientX - camState.lastX;
      const dy = e.clientY - camState.lastY;
      camState.lastX = e.clientX;
      camState.lastY = e.clientY;
      camState.yaw -= dx * 0.0065;
      camState.pitch = Math.max(0.16, Math.min(1.15, camState.pitch + dy * 0.0055));
    };

    const onPointerUp = (e: PointerEvent) => {
      const movedDist = Math.hypot(e.clientX - camState.downX, e.clientY - camState.downY);
      camState.isDragging = false;

      if (movedDist < 6) {
        const rect = domElem.getBoundingClientRect();
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);

        if (activeInteriorBuilding) {
          const hits = raycaster.intersectObjects(clickableBoardMeshes, false);
          if (hits.length > 0) {
            const hitData = hits[0].object.userData;
            if (hitData.isExitDoor) {
              exitBuildingInterior();
            } else if (hitData.boardSpec) {
              handleBoardActionRef.current(hitData.boardSpec);
            }
          }
        } else {
          const bHits = raycaster.intersectObjects(clickableBuildingMeshes, false);
          if (bHits.length > 0) {
            const bId = bHits[0].object.userData?.buildingId;
            const foundB = BUILDINGS.find((item) => item.id === bId);
            if (foundB) {
              enterBuildingInterior(foundB);
            }
          }
        }
      }
    };

    // Wheel & Touch Pinch Zoom for Phone/Tablet
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camState.distance = Math.max(6.5, Math.min(26, camState.distance + e.deltaY * 0.01));
      setZoomSliderValue(Math.round(camState.distance));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        camState.pinchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && camState.pinchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = (camState.pinchStartDist - dist) * 0.04;
        camState.pinchStartDist = dist;
        camState.distance = Math.max(6.5, Math.min(26, camState.distance + delta));
        setZoomSliderValue(Math.round(camState.distance));
      }
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    domElem.addEventListener('touchmove', onTouchMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight - 80;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ============================================================================
    // 10. ANIMATION LOOP (Smooth Damped Movement, Sports Side Actions, Football & Pickleball)
    // ============================================================================
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (doorCooldownTimer > 0) {
        doorCooldownTimer -= dt;
      }
      if (keeperGoalCooldown > 0) {
        keeperGoalCooldown -= dt;
      }

      // Clean up expired 3D speech bubbles
      const nowMs = performance.now();
      for (let i = activeSpeechBubbles.length - 1; i >= 0; i--) {
        if (nowMs >= activeSpeechBubbles[i].expiresAt) {
          activeSpeechBubbles[i].rigRoot.remove(activeSpeechBubbles[i].sprite);
          activeSpeechBubbles.splice(i, 1);
        }
      }

      globeGem.rotation.y = elapsed * 0.9;
      globeGem.position.y = 5.6 + Math.sin(elapsed * 2.2) * 0.2;

      clouds.forEach((cl) => {
        cl.group.position.x += cl.speed * dt;
        if (cl.group.position.x > 140) cl.group.position.x = -140;
      });

      // AUTOMATIC SLIDING DOORS (Exterior & Interior Exit Door)
      if (!activeInteriorBuilding) {
        doorControllers.forEach((dc) => {
          const distPlayer = Math.hypot(playerState.x - dc.building.doorX, playerState.z - dc.building.doorZ);
          let distNpc = 999;
          for (const npc of npcActors) {
            const d = Math.hypot(npc.rig.root.position.x - dc.building.doorX, npc.rig.root.position.z - dc.building.doorZ);
            if (d < distNpc) distNpc = d;
          }

          const shouldOpen = distPlayer < 6.4 || distNpc < 4.5;
          if (shouldOpen !== dc.isOpen) {
            dc.isOpen = shouldOpen;
            if (distPlayer < 12) {
              soundEngine.playDoorSlide(shouldOpen);
            }
          }

          const targetOpen = dc.isOpen ? 1.0 : 0.0;
          dc.openAmount = THREE.MathUtils.damp(dc.openAmount, targetOpen, 8, dt);

          const slideOffset = dc.openAmount * 1.15;
          dc.leftDoor.position.x = dc.leftClosedX - slideOffset;
          dc.rightDoor.position.x = dc.rightClosedX + slideOffset;

          if (
            doorCooldownTimer <= 0 &&
            dc.openAmount > 0.55 &&
            Math.abs(playerState.x - dc.building.doorX) < 1.85 &&
            Math.abs(playerState.z - dc.building.doorZ) < 1.35
          ) {
            enterBuildingInterior(dc.building);
          }
        });
      } else if (interiorExitLeftDoor && interiorExitRightDoor) {
        const distToExit = Math.hypot(
          playerState.x - INTERIOR_ORIGIN.x,
          playerState.z - (INTERIOR_ORIGIN.z + 11.5)
        );
        const targetExitOpen = distToExit < 5.2 ? 1.0 : 0.0;
        interiorExitOpenAmount = THREE.MathUtils.damp(interiorExitOpenAmount, targetExitOpen, 8, dt);
        interiorExitLeftDoor.position.x = -1.06 - interiorExitOpenAmount * 1.4;
        interiorExitRightDoor.position.x = 1.06 + interiorExitOpenAmount * 1.4;
      }

      // PLAYER MOVEMENT (Keyboard + Mobile/Tablet Touch Joystick with Smooth Acceleration & Crouch Support)
      let moveForward = 0;
      let moveRight = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveRight += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveRight -= 1;

      if (touchJoystickRef.current.active) {
        moveRight += touchJoystickRef.current.dx;
        moveForward -= touchJoystickRef.current.dy;
      }

      const inputMag = Math.min(1, Math.hypot(moveForward, moveRight));
      const isMoving = inputMag > 0.06;
      const baseSpeed = playerState.isCrouching ? 5.6 : playerState.sprinting ? 15.2 : 10.2;

      if (isMoving) {
        const fwdX = -Math.sin(camState.yaw);
        const fwdZ = -Math.cos(camState.yaw);
        const rightX = Math.cos(camState.yaw);
        const rightZ = -Math.sin(camState.yaw);

        let dirX = fwdX * moveForward + rightX * moveRight;
        let dirZ = fwdZ * moveForward + rightZ * moveRight;
        const len = Math.hypot(dirX, dirZ) || 1;
        dirX /= len;
        dirZ /= len;

        const targetVx = dirX * baseSpeed * inputMag;
        const targetVz = dirZ * baseSpeed * inputMag;
        playerState.vx = THREE.MathUtils.damp(playerState.vx, targetVx, 15, dt);
        playerState.vz = THREE.MathUtils.damp(playerState.vz, targetVz, 15, dt);

        const targetRotY = Math.atan2(dirX, dirZ);
        let diff = targetRotY - playerState.rotY;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        playerState.rotY += diff * Math.min(1, dt * 16);
      } else {
        playerState.vx = THREE.MathUtils.damp(playerState.vx, 0, 13, dt);
        playerState.vz = THREE.MathUtils.damp(playerState.vz, 0, 13, dt);
      }

      const speedNow = Math.hypot(playerState.vx, playerState.vz);
      if (speedNow > 0.15) {
        const nextX = playerState.x + playerState.vx * dt;
        const nextZ = playerState.z + playerState.vz * dt;

        if (activeInteriorBuilding) {
          playerState.x = Math.max(INTERIOR_ORIGIN.x - 12.8, Math.min(INTERIOR_ORIGIN.x + 12.8, nextX));
          playerState.z = Math.max(INTERIOR_ORIGIN.z - 10.8, Math.min(INTERIOR_ORIGIN.z + 11.2, nextZ));

          if (
            doorCooldownTimer <= 0 &&
            Math.abs(playerState.x - INTERIOR_ORIGIN.x) < 2.4 &&
            playerState.z > INTERIOR_ORIGIN.z + 9.8
          ) {
            exitBuildingInterior();
          }
        } else {
          let blockedX = false;
          let blockedZ = false;
          for (const c of colliders) {
            if (nextX > c.minX && nextX < c.maxX && playerState.z > c.minZ && playerState.z < c.maxZ) {
              blockedX = true;
            }
            if (playerState.x > c.minX && playerState.x < c.maxX && nextZ > c.minZ && nextZ < c.maxZ) {
              blockedZ = true;
            }
          }
          if (!blockedX) playerState.x = Math.max(-145, Math.min(145, nextX));
          if (!blockedZ) playerState.z = Math.max(-145, Math.min(145, nextZ));
        }

        playerState.walkCycle += dt * (speedNow * 1.15);
        const swing = Math.sin(playerState.walkCycle) * Math.min(0.62, speedNow * 0.062);
        playerRig.leftLeg.rotation.x = swing;
        playerRig.rightLeg.rotation.x = -swing;
        playerRig.leftArm.rotation.x = -swing * 0.75;
        playerRig.rightArm.rotation.x = swing * 0.75;

        if (playerState.isGrounded) {
          soundEngine.playFootstep(playerState.sprinting, Boolean(activeInteriorBuilding));
        }
      } else {
        playerRig.leftLeg.rotation.x *= 0.85;
        playerRig.rightLeg.rotation.x *= 0.85;
        playerRig.leftArm.rotation.x *= 0.85;
        if (playerState.waveTimer <= 0 && playerState.hitTimer <= 0) {
          playerRig.rightArm.rotation.x *= 0.85;
          playerRig.rightArm.rotation.z *= 0.85;
        }
      }

      // Crouch animation (smooth torso drop + athletic knee bend)
      const targetCrouch = playerState.isCrouching ? 1 : 0;
      playerState.crouchLerp = THREE.MathUtils.damp(playerState.crouchLerp, targetCrouch, 14, dt);
      playerRig.bodyGroup.position.y = -playerState.crouchLerp * 0.42;
      playerRig.bodyGroup.rotation.x = playerState.crouchLerp * 0.24;
      if (playerState.crouchLerp > 0.05 && speedNow <= 0.2) {
        playerRig.leftLeg.rotation.x = -playerState.crouchLerp * 0.48;
        playerRig.rightLeg.rotation.x = playerState.crouchLerp * 0.48;
      }

      // Kick leg swing animation
      if (playerState.kickTimer > 0) {
        playerState.kickTimer -= dt;
        const kickPhase = Math.sin((playerState.kickTimer / 0.42) * Math.PI);
        playerRig.rightLeg.rotation.x = -kickPhase * 1.35;
        playerRig.leftArm.rotation.x = -kickPhase * 0.85;
      }

      // Hit / Smash arm swing animation
      if (playerState.hitTimer > 0) {
        playerState.hitTimer -= dt;
        const hitPhase = Math.sin((playerState.hitTimer / 0.42) * Math.PI);
        playerRig.rightArm.rotation.x = -hitPhase * 2.25;
        playerRig.rightArm.rotation.z = -hitPhase * 0.45;
      }

      if (playerState.waveTimer > 0) {
        playerState.waveTimer -= dt;
        playerRig.rightArm.rotation.x = -2.5;
        playerRig.rightArm.rotation.z = Math.sin(elapsed * 14) * 0.35 - 0.3;
      }

      // Vertical Jump + Playground Trampoline Bounce
      playerState.vy -= 26 * dt;
      playerState.y += playerState.vy * dt;

      if (!activeInteriorBuilding) {
        const distTramp = Math.hypot(playerState.x - TRAMPOLINE_POS.x, playerState.z - TRAMPOLINE_POS.z);
        if (distTramp < 2.8 && playerState.y <= 0.75 && playerState.vy <= 0) {
          playerState.vy = 20.5;
          playerState.isGrounded = false;
          soundEngine.playJump(true);
          showToast('Trampoline Super Bounce!', 'Wheee! Playground Super Jump!', '#EC4899');
        }
      }

      if (playerState.y <= 0) {
        playerState.y = 0;
        playerState.vy = 0;
        playerState.isGrounded = true;
      }

      playerRig.root.position.set(playerState.x, playerState.y, playerState.z);
      playerRig.root.rotation.y = playerState.rotY;

      // Detect whether player is in Football Field or Pickleball Court
      if (!activeInteriorBuilding) {
        const inFootball =
          Math.abs(playerState.x - PITCH_CENTER.x) < PITCH_W / 2 + 5 &&
          Math.abs(playerState.z - PITCH_CENTER.z) < PITCH_L / 2 + 5;
        const inPickle =
          Math.abs(playerState.x - PICKLE_CENTER.x) < PICKLE_W / 2 + 5 &&
          Math.abs(playerState.z - PICKLE_CENTER.z) < PICKLE_L / 2 + 5;
        const nextZone: 'football' | 'pickleball' | null = inFootball
          ? 'football'
          : inPickle
          ? 'pickleball'
          : null;
        if (nextZone !== lastDetectedSportsZone) {
          lastDetectedSportsZone = nextZone;
          setInSportsZone(nextZone);
        }
      }

      // ============================================================================
      // SPORTS PARK SIMULATION: PLAYABLE FOOTBALL MATCH & PICKLEBALL RALLY
      // ============================================================================
      if (!activeInteriorBuilding) {
        // 1. Football Physics, Dribbling & AI Goalkeeper (Keeper Max)
        const distToBall = Math.hypot(playerState.x - soccerBallState.x, playerState.z - soccerBallState.z);
        if (distToBall < 1.68 && playerState.y < 1.8) {
          const kickDirX = (soccerBallState.x - playerState.x) / Math.max(0.2, distToBall);
          const kickDirZ = (soccerBallState.z - playerState.z) / Math.max(0.2, distToBall);
          const isPowerKick = playerState.kickTimer > 0;
          const kickPower = isPowerKick ? 24.0 : Math.max(11.5, speedNow * 1.45);
          soccerBallState.vx = kickDirX * kickPower;
          soccerBallState.vz = kickDirZ * kickPower;
          soccerBallState.vy = isPowerKick ? 7.0 : 3.6;
          soundEngine.playBallKick();
        }

        // AI Goalkeeper (Keeper Max) patrols the North Goal line and dives to save or counter-kick!
        const northGoalZ = PITCH_CENTER.z - PITCH_L / 2 + 1.35;
        const keeperTargetX = THREE.MathUtils.clamp(
          soccerBallState.x,
          PITCH_CENTER.x - 2.75,
          PITCH_CENTER.x + 2.75
        );
        footballKeeperRig.root.position.x = THREE.MathUtils.damp(
          footballKeeperRig.root.position.x,
          keeperTargetX,
          5.2,
          dt
        );
        footballKeeperRig.root.position.z = northGoalZ;
        footballKeeperRig.leftLeg.rotation.x = Math.sin(elapsed * 6) * 0.25;
        footballKeeperRig.rightLeg.rotation.x = -Math.sin(elapsed * 6) * 0.25;

        const distKeeperToBall = Math.hypot(
          footballKeeperRig.root.position.x - soccerBallState.x,
          footballKeeperRig.root.position.z - soccerBallState.z
        );
        if (distKeeperToBall < 1.45 && soccerBallState.y < 2.3 && soccerBallState.vz < 0) {
          // Keeper Max blocks and counter-attacks toward South Goal!
          soccerBallState.vz = 17.5 + Math.random() * 5;
          soccerBallState.vx = (Math.random() - 0.5) * 10;
          soccerBallState.vy = 5.5;
          soundEngine.playBallKick();
          showToast('Saved by Keeper Max! 🧤', 'Use KICK (F) from an angle to beat the goalkeeper!', '#F59E0B');
        }

        soccerBallState.vy -= 18 * dt;
        soccerBallState.x += soccerBallState.vx * dt;
        soccerBallState.y += soccerBallState.vy * dt;
        soccerBallState.z += soccerBallState.vz * dt;

        if (soccerBallState.y <= 0.68) {
          soccerBallState.y = 0.68;
          if (Math.abs(soccerBallState.vy) > 1.5) {
            soccerBallState.vy = -soccerBallState.vy * 0.55;
          } else {
            soccerBallState.vy = 0;
          }
        }

        // Friction
        soccerBallState.vx *= Math.pow(0.22, dt);
        soccerBallState.vz *= Math.pow(0.22, dt);

        // Keep ball near pitch bounds & check for GOAL!
        const minPitchX = PITCH_CENTER.x - PITCH_W / 2;
        const maxPitchX = PITCH_CENTER.x + PITCH_W / 2;
        const minPitchZ = PITCH_CENTER.z - PITCH_L / 2;
        const maxPitchZ = PITCH_CENTER.z + PITCH_L / 2;

        if (soccerBallState.x < minPitchX) {
          soccerBallState.x = minPitchX;
          soccerBallState.vx = Math.abs(soccerBallState.vx) * 0.7;
        }
        if (soccerBallState.x > maxPitchX) {
          soccerBallState.x = maxPitchX;
          soccerBallState.vx = -Math.abs(soccerBallState.vx) * 0.7;
        }

        // Check Goal Scored (Within goalposts X: ±3.1 at North/South ends)
        if (Math.abs(soccerBallState.x - PITCH_CENTER.x) < 3.1 && keeperGoalCooldown <= 0) {
          if (soccerBallState.z < minPitchZ + 1.1) {
            // Player scored in North Goal past Keeper Max!
            keeperGoalCooldown = 1.5;
            soundEngine.playGoalCheer();
            setFootballGoals((g) => g + 1);
            setXp((x) => x + 100);
            showToast('GOOOOAL! ⚽ +100 XP!', 'You beat Keeper Max on the EraVerse Football Field!', '#16A34A');
            soccerBallState.x = PITCH_CENTER.x;
            soccerBallState.y = 2.0;
            soccerBallState.z = PITCH_CENTER.z;
            soccerBallState.vx = 0;
            soccerBallState.vy = 0;
            soccerBallState.vz = 0;
          } else if (soccerBallState.z > maxPitchZ - 1.1) {
            // South goal: if player was far or Keeper counter-attacked
            keeperGoalCooldown = 1.5;
            soundEngine.playGoalCheer();
            if (playerState.z > PITCH_CENTER.z) {
              setFootballGoals((g) => g + 1);
              setXp((x) => x + 100);
              showToast('GOOOOAL! ⚽ +100 XP!', 'Awesome shot into the South Goal!', '#16A34A');
            } else {
              setAiFootballGoals((g) => g + 1);
              showToast('Keeper Max Scored! ⚽', 'Defend the South Goal and counter-attack!', '#EF4444');
            }
            soccerBallState.x = PITCH_CENTER.x;
            soccerBallState.y = 2.0;
            soccerBallState.z = PITCH_CENTER.z;
            soccerBallState.vx = 0;
            soccerBallState.vy = 0;
            soccerBallState.vz = 0;
          }
        } else {
          if (soccerBallState.z < minPitchZ) {
            soccerBallState.z = minPitchZ;
            soccerBallState.vz = Math.abs(soccerBallState.vz) * 0.7;
          }
          if (soccerBallState.z > maxPitchZ) {
            soccerBallState.z = maxPitchZ;
            soccerBallState.vz = -Math.abs(soccerBallState.vz) * 0.7;
          }
        }

        soccerBallMesh.position.set(soccerBallState.x, soccerBallState.y, soccerBallState.z);
        soccerBallMesh.rotation.x += soccerBallState.vz * dt * 1.2;
        soccerBallMesh.rotation.z -= soccerBallState.vx * dt * 1.2;

        // 2. Pickleball Rally & Match Scoring Simulation
        pickleBallState.x += pickleBallState.vx * dt;
        pickleBallState.z += pickleBallState.vz * dt;
        pickleBallState.phase += dt * 6.5;
        pickleBallState.y = 1.15 + Math.abs(Math.sin(pickleBallState.phase)) * 1.45;

        // Clamp pickleball X within court width
        if (pickleBallState.x < PICKLE_CENTER.x - PICKLE_W / 2 + 0.6) {
          pickleBallState.x = PICKLE_CENTER.x - PICKLE_W / 2 + 0.6;
          pickleBallState.vx = Math.abs(pickleBallState.vx);
        }
        if (pickleBallState.x > PICKLE_CENTER.x + PICKLE_W / 2 - 0.6) {
          pickleBallState.x = PICKLE_CENTER.x + PICKLE_W / 2 - 0.6;
          pickleBallState.vx = -Math.abs(pickleBallState.vx);
        }

        // AI Coach hits ball back on North side
        if (pickleBallState.z < PICKLE_CENTER.z - 8.2 && pickleBallState.vz < 0) {
          pickleBallState.vz = 9.5;
          pickleBallState.vx = (Math.random() - 0.5) * 4.8;
          pickleOpponentRig.rightArm.rotation.x = -1.6;
          if (Math.hypot(playerState.x - PICKLE_CENTER.x, playerState.z - PICKLE_CENTER.z) < 18) {
            soundEngine.playPickleballHit();
          }
        } else {
          pickleOpponentRig.rightArm.rotation.x *= 0.85;
        }

        // South side return (if player is near or presses HIT, player returns and scores; if player is on court and misses, Coach Leo scores!)
        if (pickleBallState.z > PICKLE_CENTER.z + 8.2 && pickleBallState.vz > 0) {
          pickleBallState.vz = -9.5;
          pickleBallState.vx = (Math.random() - 0.5) * 4.8;
          const playerDistToBall = Math.hypot(
            playerState.x - pickleBallState.x,
            playerState.z - pickleBallState.z
          );
          if (playerDistToBall < 4.9 || playerState.hitTimer > 0) {
            soundEngine.playPickleballHit();
            playerState.hitTimer = 0.38;
            setPickleballScore((s) => s + 1);
            setXp((x) => x + 25);
            showToast('Pickleball Smash! 🏓 +25 XP', 'Great return over the net!', '#0EA5E9');
          } else if (lastDetectedSportsZone === 'pickleball') {
            setAiPickleballScore((s) => s + 1);
            showToast('Coach Leo Point! 🏓', 'Move closer or press HIT (G) to return the ball!', '#F59E0B');
          }
        }

        pickleBallMesh.position.set(pickleBallState.x, pickleBallState.y, pickleBallState.z);
        pickleOpponentRig.root.position.x = THREE.MathUtils.damp(
          pickleOpponentRig.root.position.x,
          pickleBallState.x,
          6,
          dt
        );
      }

      // Collectible Word Crystals
      if (!activeInteriorBuilding) {
        crystalObjs.forEach((co) => {
          if (co.collected) return;
          co.mesh.rotation.y = elapsed * 1.8;
          co.mesh.position.y = co.baseY + Math.sin(elapsed * 3) * 0.2;
          const dist = Math.hypot(
            playerState.x - co.mesh.position.x,
            playerState.y + 1.2 - co.mesh.position.y,
            playerState.z - co.mesh.position.z
          );
          if (dist < 2.0) {
            co.collected = true;
            co.mesh.visible = false;
            soundEngine.playCrystalCollect();
            setCrystalsCollected((c) => c + 1);
            setXp((x) => x + 50);
            showToast(`Collected "${co.word}" Crystal!`, '+50 IELTS EraVerse XP Earned!', '#10B981');
          }
        });
      }

      // Autonomous Classmates & Teacher Jan AI Patrol + Proximity Detection
      let closestNpc: IeltsCharacterProfile | null = null;
      let closestNpcDist = 5.4;

      npcActors.forEach((npc) => {
        if (npc.pauseTimer > 0) {
          npc.pauseTimer -= dt;
          npc.rig.leftLeg.rotation.x *= 0.85;
          npc.rig.rightLeg.rotation.x *= 0.85;
          npc.rig.leftArm.rotation.x *= 0.85;
          npc.rig.rightArm.rotation.x *= 0.85;
        } else {
          const dx = npc.targetX - npc.rig.root.position.x;
          const dz = npc.targetZ - npc.rig.root.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist < 1.5) {
            npc.pauseTimer = 1.8 + Math.random() * 2.5;
            const randomB = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
            npc.targetX = randomB.doorX + (Math.random() - 0.5) * 10;
            npc.targetZ = randomB.doorZ + randomB.frontDir * (4.0 + Math.random() * 4.0);
          } else {
            const ang = Math.atan2(dx, dz);
            npc.rig.root.position.x += Math.sin(ang) * npc.speed * dt;
            npc.rig.root.position.z += Math.cos(ang) * npc.speed * dt;
            npc.rig.root.rotation.y = ang;
            npc.walkPhase += dt * 7.5;
            const sw = Math.sin(npc.walkPhase) * 0.45;
            npc.rig.leftLeg.rotation.x = sw;
            npc.rig.rightLeg.rotation.x = -sw;
            npc.rig.leftArm.rotation.x = -sw * 0.6;
            npc.rig.rightArm.rotation.x = sw * 0.6;
          }
        }

        if (!activeInteriorBuilding) {
          const dToPlayer = Math.hypot(
            playerState.x - npc.rig.root.position.x,
            playerState.z - npc.rig.root.position.z
          );
          if (dToPlayer < closestNpcDist) {
            closestNpcDist = dToPlayer;
            closestNpc = npc.profile;
          }
        }
      });
      setNearCharacterPrompt(closestNpc);

      // Proximity Prompts
      if (activeInteriorBuilding) {
        let nearBoard: WallBoardSpec | null = null;
        let minBoardDist = 4.6;
        currentInteriorBoards.forEach((cb) => {
          const d = Math.hypot(playerState.x - cb.x, playerState.z - cb.z);
          if (d < minBoardDist) {
            minBoardDist = d;
            nearBoard = cb.spec;
          }
        });
        setNearBoardPrompt(nearBoard);
      } else {
        let nearB: BuildingZone | null = null;
        let minDoorDist = 6.5;
        BUILDINGS.forEach((b) => {
          const d = Math.hypot(playerState.x - b.doorX, playerState.z - b.doorZ);
          if (d < minDoorDist) {
            minDoorDist = d;
            nearB = b;
          }
        });
        setNearBuildingPrompt(nearB);
      }

      // Camera Anti-Occlusion & Smooth Orbit
      _camTarget.set(playerState.x, playerState.y + 2.2, playerState.z);
      const horizDist = camState.distance * Math.cos(camState.pitch);
      const vertDist = camState.distance * Math.sin(camState.pitch);
      _desiredCamPos.set(
        _camTarget.x + Math.sin(camState.yaw) * horizDist,
        Math.max(1.5, _camTarget.y + vertDist),
        _camTarget.z + Math.cos(camState.yaw) * horizDist
      );

      doorControllers.forEach((dc) => {
        dc.wallMaterials.forEach((mat) => {
          mat.opacity = THREE.MathUtils.damp(mat.opacity, 1.0, 10, dt);
        });
      });

      if (!activeInteriorBuilding) {
        _rayDir.subVectors(_desiredCamPos, _camTarget);
        const rayLen = _rayDir.length();
        if (rayLen > 0.1) {
          _rayDir.normalize();
          camOcclusionRaycaster.set(_camTarget, _rayDir);
          camOcclusionRaycaster.far = rayLen;
          const hits = camOcclusionRaycaster.intersectObjects(allBuildingOccluderMeshes, false);
          if (hits.length > 0) {
            const safeDist = Math.max(3.2, hits[0].distance - 0.85);
            _desiredCamPos.copy(_camTarget).addScaledVector(_rayDir, safeDist);
            const hitBuildingId = hits[0].object.userData?.buildingId;
            const dc = doorControllers.find((d) => d.building.id === hitBuildingId);
            if (dc) {
              dc.wallMaterials.forEach((mat) => {
                mat.opacity = 0.35;
              });
            }
          }
        }
      } else {
        _desiredCamPos.x = Math.max(INTERIOR_ORIGIN.x - 13.0, Math.min(INTERIOR_ORIGIN.x + 13.0, _desiredCamPos.x));
        _desiredCamPos.z = Math.max(INTERIOR_ORIGIN.z - 11.0, Math.min(INTERIOR_ORIGIN.z + 11.0, _desiredCamPos.z));
      }

      camera.position.lerp(_desiredCamPos, Math.min(1, dt * 16));
      camera.lookAt(_camTarget);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const canSwitchCharacter = isAdmin || !user;

  const handleSelectCharacter = (char: IeltsCharacterProfile) => {
    soundEngine.playUiClick();
    const isMyOwnChar =
      char.name.toLowerCase() === playerProfile.name.toLowerCase() ||
      (user?.uid && char.realUserId === user.uid) ||
      (user?.email && char.email?.toLowerCase() === user.email.toLowerCase());

    if (!canSwitchCharacter && !isMyOwnChar) {
      showToast(
        `Account Bound to ${playerProfile.name}`,
        `You are logged in as ${playerProfile.name} (${playerProfile.cohort}). Each student uses their own personalized character!`,
        '#2563EB'
      );
      return;
    }

    setPlayerProfile({
      id: char.id,
      realUserId: char.realUserId,
      email: char.email,
      name: char.name,
      fullName: char.fullName,
      cohort: char.cohort,
      roleTitle: char.roleTitle,
      specialty: char.specialty,
      avatarDetails: char.avatarDetails,
      shirtColor: char.shirtColor,
      hairColor: char.hairColor,
      skinColor: char.skinColor,
      hatType: char.hatType,
      accessoryType: char.accessoryType
    });
    setShowCharactersModal(false);
    showToast(`Now Playing as ${char.name} (${char.cohort})`, char.motto, char.cohort === 'IELTS 2' ? '#10B981' : '#2563EB');
  };

  const filteredCharacters = useMemo(() => {
    if (cohortFilter === 'ALL') return ieltsCharacters;
    return ieltsCharacters.filter((c) => c.cohort === cohortFilter);
  }, [ieltsCharacters, cohortFilter]);

  const filteredPracticeTests = useMemo(() => {
    return allPracticeTests.filter((t) => t.skill === selectedPracticeSkill);
  }, [allPracticeTests, selectedPracticeSkill]);

  const homeworkItems = useMemo(() => {
    const coreHomework = [
      {
        id: 'ielts-writing-homework-1',
        title: 'IELTS Writing Homework 1',
        skill: 'Writing',
        difficulty: 'Medium',
        duration: '60 mins',
        desc: 'Complete Academic Writing Task 1 & Task 2 essay homework.',
        route: '/test/writing/ielts-writing-homework-1',
        badgeColor: 'bg-amber-500'
      },
      {
        id: 'homework-test-1',
        title: 'IELTS Speaking Homework 1',
        skill: 'Speaking',
        difficulty: 'Medium',
        duration: '15 mins',
        desc: 'Record your Speaking Part 1, 2 & 3 responses for teacher checking.',
        route: '/test/speaking/homework-test-1',
        badgeColor: 'bg-purple-600'
      },
      {
        id: 'homework-test-2',
        title: 'IELTS Speaking Homework 2',
        skill: 'Speaking',
        difficulty: 'Medium',
        duration: '15 mins',
        desc: 'Complete your second IELTS Speaking homework recording.',
        route: '/test/speaking/homework-test-2',
        badgeColor: 'bg-purple-600'
      },
      {
        id: 'homework-test-3',
        title: 'IELTS Speaking Homework 3',
        skill: 'Speaking',
        difficulty: 'Hard',
        duration: '15 mins',
        desc: 'Advanced IELTS Speaking Part 2 & 3 fluency homework.',
        route: '/test/speaking/homework-test-3',
        badgeColor: 'bg-purple-600'
      },
      {
        id: 'reading-hw-1',
        title: 'IELTS Reading Homework — Test 1',
        skill: 'Reading',
        difficulty: 'Medium',
        duration: '60 mins',
        desc: 'Complete reading comprehension passages (What Lucy Taught Us & more).',
        route: '/test/reading/1',
        badgeColor: 'bg-blue-600'
      },
      {
        id: 'listening-hw-1',
        title: 'IELTS Listening Homework — Test 1',
        skill: 'Listening',
        difficulty: 'Medium',
        duration: '60 mins',
        desc: 'Listen to the 4 sections and answer all 40 comprehension questions.',
        route: '/test/listening/2',
        badgeColor: 'bg-teal-600'
      }
    ];

    const dynamicAssignments = firestoreAssignments.map((a) => ({
      id: a.id,
      title: a.title || 'Class Assignment',
      skill: 'Assigned',
      difficulty: a.course || 'IELTS',
      duration: 'Class Task',
      desc: a.description || 'Assigned class homework from your teacher.',
      route: `/assignment/${a.id}`,
      badgeColor: 'bg-emerald-600'
    }));

    const all = [...coreHomework, ...dynamicAssignments];
    if (selectedHomeworkTab === 'All') return all;
    return all.filter((item) => item.skill === selectedHomeworkTab);
  }, [firestoreAssignments, selectedHomeworkTab]);

  const currentRoomSongName = insideBuilding
    ? ROOM_SONGS[insideBuilding.id]?.name || ROOM_SONGS.campus.name
    : ROOM_SONGS.campus.name;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-slate-950 select-none">
      {/* 1. ISOLATED THREE.JS WEBGL CANVAS */}
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* 2. TOP-LEFT PLAYER STATUS, SPORTS SCOREBOARD & CHARACTER SWITCHER */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-2.5 text-white shadow-xl">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-inner border border-white/20"
            style={{ backgroundColor: playerProfile.shirtColor }}
          >
            {playerProfile.cohort === 'IELTS 2' ? 'I2' : 'I1'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">{playerProfile.name}</span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  playerProfile.cohort.includes('TEACHER')
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                    : playerProfile.cohort === 'IELTS 2'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}
              >
                {playerProfile.cohort}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium flex flex-wrap items-center gap-2 mt-0.5">
              <span>{insideBuilding ? `Inside: ${insideBuilding.name}` : 'EraVerse Campus & Sports Park'}</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{xp} XP</span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">⚽ {footballGoals}</span>
              <span>•</span>
              <span className="text-cyan-300 font-bold">🏓 {pickleballScore}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            setShowCharactersModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg border border-blue-400/40 transition-all cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Characters & Teachers ({ieltsCharacters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            setShowCustomizerModal(true);
          }}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs px-3.5 py-3 rounded-2xl shadow-lg border border-white/15 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Avatar</span>
        </button>

        {/* Top-Ribbon Chat Icon Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            setShowChatModal((prev) => !prev);
          }}
          className={`flex items-center gap-2 font-bold text-xs px-3.5 py-3 rounded-2xl shadow-lg border transition-all cursor-pointer ${
            showChatModal
              ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/40 shadow-sky-500/20'
              : nearCharacterPrompt
              ? 'bg-slate-900/95 hover:bg-slate-800 text-sky-300 border-sky-400/60 shadow-md ring-1 ring-sky-400/40 animate-pulse'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-white/15'
          }`}
          title={nearCharacterPrompt ? `Chat with ${nearCharacterPrompt.name} in English (or press T)` : 'Campus English Chat (press T)'}
        >
          <MessageCircle className="w-4 h-4 text-sky-400" />
          <span>Chat</span>
          {nearCharacterPrompt && (
            <span className="text-[10px] bg-sky-500/25 text-sky-200 border border-sky-400/50 px-2 py-0.5 rounded-full font-black">
              {nearCharacterPrompt.name.split(' ')[0]}
            </span>
          )}
        </button>
      </div>

      {/* 2B. SPORTS PARK SIDE ACTIONS HUD (KICK, JUMP, HIT, CROUCH + LIVE MATCH SCOREBOARD) */}
      <SportsSideActionsHud
        inSportsZone={inSportsZone}
        footballGoals={footballGoals}
        aiFootballGoals={aiFootballGoals}
        pickleballScore={pickleballScore}
        aiPickleballScore={aiPickleballScore}
        isCrouching={isCrouching}
        zoomSliderValue={zoomSliderValue}
        onZoomChange={(val) => {
          setZoomSliderValue(val);
          gameActionsRef.current?.setZoomDistance(val);
        }}
        onKick={() => gameActionsRef.current?.triggerKick()}
        onJump={() => gameActionsRef.current?.triggerJump()}
        onHit={() => gameActionsRef.current?.triggerHit()}
        onToggleCrouch={() => gameActionsRef.current?.toggleCrouch()}
      />

      {/* 2C. PROXIMITY ENGLISH-ONLY CHAT (OPENED ON-DEMAND VIA TOP CHAT ICON) */}
      {showChatModal && (
        <ProximityEnglishChat
          nearbyPartner={nearCharacterPrompt}
          playerName={playerProfile.name}
          messages={chatMessages}
          englishWarning={englishWarning}
          canSwitchCharacter={canSwitchCharacter}
          onSendMessage={handleSendProximityChat}
          onSelectPartnerCharacter={() => {
            if (nearCharacterPrompt) handleSelectCharacter(nearCharacterPrompt);
          }}
          onClose={() => setShowChatModal(false)}
        />
      )}

      {/* 2D. PERSONALIZED DASHBOARD DOCK WHEN INSIDE DASHBOARD BUILDING (IELTS ACADEMY) */}
      {insideBuilding?.id === 'dashboard' && !dashboardHallModal && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-auto">
          <div className="bg-slate-950/92 border-2 border-indigo-400/60 rounded-2xl px-4 py-2.5 text-white shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white border border-white/30 shadow"
                style={{ backgroundColor: playerProfile.shirtColor }}
              >
                {playerProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-white">
                    {playerProfile.name}&apos;s Personalized Dashboard
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                    Overall Band {myPersonalDashboardStats.overall.toFixed(1)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  Walk to the Left, Right &amp; Back walls or click any skill below to inspect your full dashboard:
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDashboardHallModal('my_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] cursor-pointer shadow"
              >
                My Overview
              </button>
              <button
                type="button"
                onClick={() => setDashboardHallModal('listening_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600/90 hover:bg-teal-500 text-white font-extrabold text-[11px] cursor-pointer"
              >
                Listening: {myPersonalDashboardStats.listening.toFixed(1)}
              </button>
              <button
                type="button"
                onClick={() => setDashboardHallModal('reading_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-700/90 hover:bg-blue-600 text-white font-extrabold text-[11px] cursor-pointer"
              >
                Reading: {myPersonalDashboardStats.reading.toFixed(1)}
              </button>
              <button
                type="button"
                onClick={() => setDashboardHallModal('writing_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-extrabold text-[11px] cursor-pointer"
              >
                Writing: {myPersonalDashboardStats.writing.toFixed(1)}
              </button>
              <button
                type="button"
                onClick={() => setDashboardHallModal('speaking_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-extrabold text-[11px] cursor-pointer"
              >
                Speaking: {myPersonalDashboardStats.speaking.toFixed(1)}
              </button>
              <button
                type="button"
                onClick={() => setDashboardHallModal('class_dashboard')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-extrabold text-[11px] cursor-pointer"
              >
                {activeClassCohortLabel} Class ({myClassDashboardStudents.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetUid = myPersonalDashboardStats.userId;
                  navigate(isAdmin && targetUid ? `/ielts/dashboard?userId=${targetUid}` : '/ielts/dashboard');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/40 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOP-RIGHT SETTINGS (GRAPHICS QUALITY: HIGH/MEDIUM/LOW, AUDIO ON/OFF, ROOM MUSIC) & ROOM EXIT */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        {insideBuilding && (
          <>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setActiveBuildingModal(insideBuilding.id);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl border border-blue-400/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open {insideBuilding.name}</span>
            </button>
            <button
              type="button"
              onClick={() => gameActionsRef.current?.exitBuildingInterior()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Door (ESC)</span>
            </button>
          </>
        )}

        {/* Quick Audio On/Off Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextAudio = !audioEnabled;
            soundEngine.audioEnabled = nextAudio;
            setAudioEnabled(nextAudio);
            if (nextAudio) soundEngine.playUiClick();
          }}
          className={`flex items-center gap-2 font-bold text-xs px-3.5 py-3 rounded-2xl shadow-xl border transition-all cursor-pointer ${
            audioEnabled
              ? 'bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-red-300 border-red-500/30'
          }`}
          title="Audio On / Off"
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{audioEnabled ? 'Audio On' : 'Audio Off'}</span>
        </button>

        {/* Top-Right Settings Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiClick();
            setShowSettingsModal(!showSettingsModal);
          }}
          className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl border border-white/15 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-blue-400" />
          <span>Settings</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {graphicsQuality}
          </span>
        </button>
      </div>

      {/* TOP-RIGHT SETTINGS DROPDOWN PANEL */}
      {showSettingsModal && (
        <div className="absolute top-20 right-4 z-30 w-80 bg-slate-950/95 border border-white/20 rounded-3xl p-5 text-white shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="font-extrabold text-sm tracking-tight">EraVerse Settings</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Graphics Quality Selector */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Graphics Quality & Character Detail
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'high', label: 'High', desc: 'Ultra Sharp' },
                    { id: 'medium', label: 'Medium', desc: 'Balanced' },
                    { id: 'low', label: 'Low', desc: 'Fast FPS' }
                  ] as const
                ).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setGraphicsQuality(q.id);
                      gameActionsRef.current?.setGraphicsQuality(q.id);
                      showToast(
                        `Graphics Quality: ${q.label.toUpperCase()}`,
                        q.id === 'high'
                          ? 'High-detail sculpted characters, ultra sharpness & PBR materials enabled!'
                          : `Switched to ${q.label} graphics mode.`,
                        '#3B82F6'
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      graphicsQuality === q.id
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{q.label}</div>
                    <div className="text-[10px] opacity-80">{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio On / Off */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2.5">
                {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                <div>
                  <div className="text-xs font-extrabold">Master Audio & SFX</div>
                  <div className="text-[10px] text-slate-400">Footsteps, doors, sports & chimes</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !audioEnabled;
                  soundEngine.audioEnabled = next;
                  setAudioEnabled(next);
                  if (next) soundEngine.playUiClick();
                }}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer ${
                  audioEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {audioEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Room Song Music On / Off */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-extrabold">Room Songs & Music</div>
                  <div className="text-[10px] text-amber-300 truncate max-w-[145px]">♪ {currentRoomSongName}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !musicEnabled;
                  soundEngine.musicEnabled = next;
                  setMusicEnabled(next);
                  soundEngine.playUiClick();
                }}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer ${
                  musicEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Time of Day / Sky */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Campus Atmosphere
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'day', label: 'Daylight', icon: Sun },
                    { id: 'sunset', label: 'Sunset', icon: Sunset },
                    { id: 'night', label: 'Night', icon: Moon }
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSkyMode(id);
                      gameActionsRef.current?.setSkyPreset(id);
                    }}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      skyMode === id
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MOBILE & TABLET TOUCH CONTROLS: VIRTUAL THUMBSTICK + SCROLL ZOOM SLIDER + JUMP */}
      {/* Bottom-Left Touch Movement Thumbstick (Shown on touch/mobile/tablet screens) */}
      <div className="xl:hidden absolute bottom-6 left-6 z-20 flex items-center gap-4 pointer-events-auto">
        <div
          className="relative w-28 h-28 rounded-full bg-slate-950/75 border-2 border-white/25 shadow-2xl flex items-center justify-center touch-none"
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            touchJoystickRef.current.active = true;
          }}
          onPointerMove={(e) => {
            if (!touchJoystickRef.current.active) return;
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const maxR = rect.width / 2 - 14;
            let dx = e.clientX - cx;
            let dy = e.clientY - cy;
            const dist = Math.hypot(dx, dy);
            if (dist > maxR) {
              dx = (dx / dist) * maxR;
              dy = (dy / dist) * maxR;
            }
            setJoystickThumbPos({ x: dx, y: dy });
            touchJoystickRef.current.dx = dx / maxR;
            touchJoystickRef.current.dy = dy / maxR;
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            touchJoystickRef.current.active = false;
            touchJoystickRef.current.dx = 0;
            touchJoystickRef.current.dy = 0;
            setJoystickThumbPos({ x: 0, y: 0 });
          }}
          onPointerCancel={() => {
            touchJoystickRef.current.active = false;
            touchJoystickRef.current.dx = 0;
            touchJoystickRef.current.dy = 0;
            setJoystickThumbPos({ x: 0, y: 0 });
          }}
        >
          <div
            className="w-11 h-11 rounded-full bg-blue-500 border-2 border-white shadow-lg pointer-events-none"
            style={{
              transform: `translate(${joystickThumbPos.x}px, ${joystickThumbPos.y}px)`
            }}
          />
        </div>
      </div>

      {/* Right-Side Touch Scroll Zoom Slider & Jump Button for Phone / Tablet */}
      <div className="xl:hidden absolute bottom-6 right-6 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        <div className="bg-slate-950/80 border border-white/20 rounded-2xl px-2.5 py-3 flex flex-col items-center gap-2 shadow-xl">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300">Scroll Zoom</span>
          <input
            type="range"
            min={7}
            max={24}
            value={zoomSliderValue}
            onChange={(e) => {
              const val = Number(e.target.value);
              setZoomSliderValue(val);
              gameActionsRef.current?.setZoomDistance(val);
            }}
            className="w-24 accent-blue-500 cursor-pointer"
          />
        </div>
        <button
          type="button"
          onClick={() => gameActionsRef.current?.triggerJump()}
          className="w-16 h-16 rounded-full bg-blue-600 active:bg-blue-500 text-white font-extrabold text-xs border-2 border-white/40 shadow-2xl flex items-center justify-center cursor-pointer"
        >
          JUMP
        </button>
      </div>

      {/* 5. TOAST BANNER */}
      {toastBanner && (
        <div className="absolute top-20 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
          <div
            className="bg-slate-950/95 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 flex items-center gap-3"
            style={{ borderColor: toastBanner.color }}
          >
            <Sparkles className="w-5 h-5 shrink-0" style={{ color: toastBanner.color }} />
            <div>
              <div className="font-extrabold text-sm">{toastBanner.title}</div>
              <div className="text-xs text-slate-300">{toastBanner.subtitle}</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROXIMITY INTERACTION PROMPTS */}
      {nearBuildingPrompt && !insideBuilding && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
          <div className="bg-slate-950/95 border border-white/20 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                AUTOMATIC DOORS OPEN • WALK IN OR PRESS E
              </div>
              <div className="text-base font-extrabold">{nearBuildingPrompt.name}</div>
            </div>
            <button
              type="button"
              onClick={() => gameActionsRef.current?.enterBuildingInterior(nearBuildingPrompt)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enter Building (E)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {nearBoardPrompt && insideBuilding && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
          <div className="bg-slate-950/95 border border-white/20 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                {nearBoardPrompt.category}
              </div>
              <div className="text-base font-extrabold">{nearBoardPrompt.title}</div>
            </div>
            <button
              type="button"
              onClick={() => handleBoardAction(nearBoardPrompt)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{nearBoardPrompt.badge} (E)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Character interaction is accessed cleanly via the top Chat icon and Characters menu */}

      {/* ============================================================================
          MODAL 1: PRACTICE TEST ARENA BUILDING MODAL
          ============================================================================ */}
      {activeBuildingModal === 'practice_tests' && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[86vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1E4DB7] to-blue-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                    ERAVERSE PRACTICE TEST BUILDING
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    IELTS Practice Test Arena
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/practice-tests?course=ielts&skill=${selectedPracticeSkill}`)}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Open Full Practice Test Page
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBuildingModal(null)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { skill: 'Listening', icon: Headphones },
                    { skill: 'Reading', icon: BookOpen },
                    { skill: 'Writing', icon: PenTool },
                    { skill: 'Speaking', icon: Mic }
                  ] as const
                ).map(({ skill, icon: Icon }) => {
                  const active = selectedPracticeSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiClick();
                        setSelectedPracticeSkill(skill);
                      }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                        active
                          ? 'bg-[#1E4DB7] text-white border-[#1E4DB7] shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{skill} Tests</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredPracticeTests.length} {selectedPracticeSkill} Practice Tests
              </span>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPracticeTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-100 text-[#1E4DB7]">
                        {test.skill}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{test.month}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-2">{test.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> {test.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart className="w-3.5 h-3.5 text-amber-500" /> {test.difficulty}
                      </span>
                    </div>
                  </div>

                  {test.skill === 'Speaking' ? (
                    <button
                      type="button"
                      onClick={() => setSpeakingModalTest({ id: test.id, title: test.title })}
                      className="w-full py-2.5 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Start Speaking Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/test/${test.skill.toLowerCase()}/${test.id}`)}
                      className="w-full py-2.5 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Start {test.skill} Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 2: HOMEWORK BUILDING MODAL
          ============================================================================ */}
      {activeBuildingModal === 'homework' && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[86vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-100">
                    ERAVERSE HOMEWORK BUILDING
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Student Homework Hub
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const courseSlug = (userCourse || 'ielts').toLowerCase().replace(/[^a-z0-9-]/g, '');
                    navigate(`/courses/${courseSlug === 'starter' ? 'starters' : courseSlug}?tab=assignments`);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Open Full Homework Page
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBuildingModal(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {(['All', 'Writing', 'Speaking', 'Reading', 'Listening', 'Assigned'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setSelectedHomeworkTab(tab);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      selectedHomeworkTab === tab
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    {tab === 'All' ? 'All Given Homework' : `${tab} Homework`}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {homeworkItems.length} Homework Tasks Available
              </span>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {homeworkItems.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-extrabold text-white px-2.5 py-1 rounded-lg ${hw.badgeColor}`}>
                        {hw.skill} Homework
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{hw.duration}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">{hw.title}</h3>
                    <p className="text-xs text-slate-600 mb-5 leading-relaxed">{hw.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(hw.route)}
                    className="w-full py-2.5 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Start Homework</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 3: IELTS COURSE CHARACTERS (IELTS 1 & IELTS 2) SELECTOR
          ============================================================================ */}
      {showCharactersModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-[#1E4DB7] to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                    IELTS COURSE COHORTS
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    IELTS 1 & IELTS 2 Characters
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCharactersModal(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(['ALL', 'IELTS 1', 'IELTS 2', 'TEACHER (SUPER ADMIN)'] as const).map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setCohortFilter(cohort);
                    }}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      cohortFilter === cohort
                        ? cohort.includes('TEACHER')
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : cohort === 'IELTS 2'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-[#1E4DB7] text-white border-[#1E4DB7] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {cohort === 'ALL'
                      ? 'All Characters & Teachers'
                      : cohort.includes('TEACHER')
                      ? 'Teacher Jan (Super Admin)'
                      : `${cohort} Characters`}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {canSwitchCharacter
                  ? 'Every student has a unique personalized character under their nickname!'
                  : `Logged in as ${playerProfile.name} (${playerProfile.cohort}) — bound to your personal character & dashboard`}
              </span>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCharacters.map((char) => {
                const isSelected = playerProfile.name.toLowerCase() === char.name.toLowerCase();
                const isTeacher = char.cohort.includes('TEACHER');
                return (
                  <div
                    key={char.id}
                    className={`rounded-2xl p-4 border-2 transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? isTeacher
                          ? 'border-amber-500 bg-amber-50/70 shadow-md'
                          : 'border-blue-600 bg-blue-50/50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold shadow-md shrink-0 border-2 border-white"
                        style={{ backgroundColor: char.shirtColor }}
                      >
                        <span className="text-[10px] opacity-85">{isTeacher ? 'TEACH' : char.cohort}</span>
                        <span className="text-base">{char.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base">{char.name}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isTeacher
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : char.cohort === 'IELTS 2'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {char.cohort}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                              YOUR CHARACTER
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">
                          {char.roleTitle} {char.specialty ? `• ${char.specialty}` : ''}
                        </p>
                        {char.avatarDetails && (
                          <p className="text-[11px] font-semibold text-blue-600 mt-0.5 truncate">
                            {char.avatarDetails}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">“{char.motto}”</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-3.5 py-2 rounded-xl font-extrabold text-xs shrink-0 bg-emerald-600 text-white shadow-xs">
                        Active (You)
                      </span>
                    ) : canSwitchCharacter ? (
                      <button
                        type="button"
                        onClick={() => handleSelectCharacter(char)}
                        className="px-4 py-2.5 rounded-xl font-extrabold text-xs shrink-0 transition-all cursor-pointer bg-[#1E4DB7] hover:bg-blue-800 text-white"
                      >
                        Play Character
                      </button>
                    ) : (
                      <span className="px-3 py-2 rounded-xl font-bold text-[11px] shrink-0 bg-slate-100 text-slate-500 border border-slate-200">
                        Classmate
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 4: AVATAR CUSTOMIZER
          ============================================================================ */}
      {showCustomizerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                  IELTS COURSE AVATAR STUDIO
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">Customize Your Character</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomizerModal(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Character Name
                </label>
                <input
                  type="text"
                  value={playerProfile.name}
                  onChange={(e) => setPlayerProfile({ ...playerProfile, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  IELTS Course Cohort Badge
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['IELTS 1', 'IELTS 2'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setPlayerProfile({
                          ...playerProfile,
                          cohort: c,
                          shirtColor: c === 'IELTS 2' ? '#10b981' : '#2563eb'
                        })
                      }
                      className={`py-3 rounded-xl font-extrabold text-sm border-2 transition-all cursor-pointer ${
                        playerProfile.cohort === c
                          ? c === 'IELTS 2'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                            : 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {c} Character
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Varsity Jacket Color
                </label>
                <div className="flex gap-2.5">
                  {['#2563eb', '#10b981', '#f59e0b', '#9333ea', '#ef4444', '#06b6d4', '#0f172a'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setPlayerProfile({ ...playerProfile, shirtColor: hex })}
                      className={`w-9 h-9 rounded-xl border-2 cursor-pointer transition-transform ${
                        playerProfile.shirtColor === hex ? 'scale-110 border-slate-900 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Headgear Style
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'grad', label: 'Grad Cap' },
                      { id: 'crown', label: 'Crown' },
                      { id: 'headphones', label: 'Headset' },
                      { id: 'cap', label: 'Cap' },
                      { id: 'none', label: 'None' }
                    ] as const
                  ).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setPlayerProfile({ ...playerProfile, hatType: h.id })}
                      className={`py-2 px-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        playerProfile.hatType === h.id
                          ? 'bg-[#1E4DB7] text-white border-[#1E4DB7]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Eyewear
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'glasses', label: 'Study Glasses' },
                      { id: 'shades', label: 'Cool Shades' },
                      { id: 'none', label: 'None' }
                    ] as const
                  ).map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setPlayerProfile({ ...playerProfile, accessoryType: acc.id })}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        playerProfile.accessoryType === acc.id
                          ? 'bg-[#1E4DB7] text-white border-[#1E4DB7]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  if (user?.uid) {
                    try {
                      localStorage.setItem(
                        `eraverse_custom_${user.uid}`,
                        JSON.stringify({
                          shirtColor: playerProfile.shirtColor,
                          hairColor: playerProfile.hairColor,
                          skinColor: playerProfile.skinColor,
                          hatType: playerProfile.hatType,
                          accessoryType: playerProfile.accessoryType
                        })
                      );
                    } catch (_e) {
                      // ignore
                    }
                  }
                  setShowCustomizerModal(false);
                  showToast('Character Updated!', `${playerProfile.name} (${playerProfile.cohort}) is ready!`, '#10B981');
                }}
                className="w-full py-3 bg-[#1E4DB7] hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Save & Return to EraVerse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 5: SPEAKING TEST MODE LAUNCHER
          ============================================================================ */}
      {speakingModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSpeakingModalTest(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="bg-blue-900 p-4 rounded-2xl text-white shadow-lg">
                <Mic className="w-8 h-8" />
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-blue-900 text-center mb-1">
              {speakingModalTest.title}
            </h3>
            <p className="text-slate-500 text-center text-sm mb-6">
              11–14 Minutes • 3 Parts • Face-to-Face Simulation
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900"
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!candidateName.trim()}
                onClick={() => {
                  const encoded = encodeURIComponent(candidateName.trim());
                  navigate(`/test/speaking/${speakingModalTest.id}?mode=mock&name=${encoded}`);
                }}
                className="py-4 px-4 rounded-2xl border-2 border-red-500 bg-red-50 hover:bg-red-600 text-red-800 hover:text-white font-extrabold text-base transition-all cursor-pointer"
              >
                Mock Test Mode
              </button>
              <button
                type="button"
                disabled={!candidateName.trim()}
                onClick={() => {
                  const encoded = encodeURIComponent(candidateName.trim());
                  navigate(`/test/speaking/${speakingModalTest.id}?mode=practice&name=${encoded}`);
                }}
                className="py-4 px-4 rounded-2xl border-2 border-purple-500 bg-purple-50 hover:bg-purple-600 text-purple-800 hover:text-white font-extrabold text-base transition-all cursor-pointer"
              >
                Practice Study Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          MODAL 6 & 7: DASHBOARD HALL MODALS (PERSONAL DASHBOARD, 4 SKILL WALLS & CLASS SCOREBOARD)
          ============================================================================ */}
      <DashboardHallModals
        activeModal={
          dashboardHallModal ||
          (activeBuildingModal === 'dashboard_personal' || activeBuildingModal === 'dashboard'
            ? 'my_dashboard'
            : activeBuildingModal === 'dashboard_class'
            ? 'class_dashboard'
            : null)
        }
        onClose={() => {
          setDashboardHallModal(null);
          setActiveBuildingModal(null);
        }}
        myStats={myPersonalDashboardStats}
        classCohortLabel={activeClassCohortLabel}
        classStudents={myClassDashboardStudents}
        allCohortsStudents={allStudentsSkillScores}
        isSuperAdminCharacter={playerProfile.cohort === 'TEACHER (SUPER ADMIN)'}
        onNavigateFullDashboard={(uid) =>
          navigate(isAdmin && uid ? `/ielts/dashboard?userId=${uid}` : '/ielts/dashboard')
        }
        onOpenSkillPractice={(skill) => {
          setSelectedPracticeSkill(skill);
          setActiveBuildingModal('practice_tests');
        }}
      />
    </div>
  );
}
export default EraVerse;
