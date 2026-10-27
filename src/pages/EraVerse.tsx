import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useNavigate } from 'react-router';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { EraVerseAvatar3D } from '../components/EraVerseAvatar3D';
import { buildRealisticCharacter3D } from '../utils/realisticCharacterBuilder';
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
  ExternalLink,
  ShoppingBag,
  Maximize,
  Minimize
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
import {
  EraShopModal,
  EraGalleryModal,
  EraGamesModal,
  EraShopItem,
  ERA_GALLERY_PHOTOS
} from '../components/EraShopGalleryGamesModals';

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
    name: 'EraGames Arcade Synthwave',
    tempoMs: 280,
    wave: 'triangle',
    notes: [523.25, 622.25, 698.46, 783.99, 932.33, 783.99, 698.46, 622.25, 523.25, 698.46, 783.99, 1046.5, 932.33, 783.99, 698.46, 523.25],
    bassNotes: [261.63, 293.66, 311.13, 349.23, 261.63, 293.66, 311.13, 261.63]
  },
  reading: {
    name: "Candy's EraSHOP Boutique Pop",
    tempoMs: 340,
    wave: 'sine',
    notes: [523.25, 587.33, 659.25, 523.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25],
    bassNotes: [130.81, 196.0, 164.81, 220.0, 174.61, 261.63, 196.0, 246.94]
  },
  listening: {
    name: 'Era Gallery Exhibition Lounge',
    tempoMs: 360,
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

  public playTennisHit(isSmash = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const freq = isSmash ? 210 : 170;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);

    const chime = ctx.createOscillator();
    const cGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(isSmash ? 1174.66 : 987.77, now);
    chime.frequency.exponentialRampToValueAtTime(1567.98, now + 0.18);
    cGain.gain.setValueAtTime(0.12, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    chime.connect(cGain);
    cGain.connect(ctx.destination);
    chime.start(now);
    chime.stop(now + 0.2);
  }

  public playPickleballHit() {
    this.playTennisHit(false);
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
  hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones' | 'halo' | string;
  accessoryType: 'none' | 'glasses' | 'shades' | 'cyber_visor' | 'wings' | string;
  gender?: 'boy' | 'girl' | string;
  hairStyle?: 'classic' | 'spiky' | 'long' | 'ponytail' | 'twintails' | string;
  bodyType?: 'regular' | 'slim' | 'athletic' | 'tall' | string;
  clothingType?: 'varsity' | 'hoodie' | 'streetwear' | 'royal_suit' | 'skirt_outfit' | 'cyber_jacket' | string;
  pantsColor?: string;
  beltType?: 'none' | 'leather_belt' | 'gold_belt' | 'cyber_belt' | 'star_belt' | string;
  vehicleType?: 'none' | 'skateboard' | 'bike' | string;
  targetBuildingId: string;
  motto: string;
  isRealStudent?: boolean;
  isTeacherAdmin?: boolean;
}

interface WallBoardSpec {
  slot:
    | 'back-center'
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
    | 'skill_dashboard'
    | 'open_erashop'
    | 'open_eragallery'
    | 'open_eragames';
  skillOrTab?: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  shopCategory?: 'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories' | 'customizer';
  galleryTab?: 'all' | 'photos' | 'videos';
  route?: string;
  dashboardType?: 'personal' | 'class' | 'listening' | 'reading' | 'writing' | 'speaking';
}

// Rich Architectural Campus Buildings + Warm Grounded Classroom Interiors
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
    wallColor: 0x2563eb,
    trimColor: 0xbfdbfe,
    roofColor: 0x1e3a8a,
    accentColor: 0x1d4ed8,
    hexAccent: '#2563EB',
    doorX: 40,
    doorZ: -23,
    frontDir: 1,
    interiorWallColor: 0xdbeafe,
    interiorFloorColor: 0x93c5fd
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
    wallColor: 0xd97706,
    trimColor: 0xfde68a,
    roofColor: 0x92400e,
    accentColor: 0xb45309,
    hexAccent: '#D97706',
    doorX: -40,
    doorZ: -23,
    frontDir: 1,
    interiorWallColor: 0xfef3c7,
    interiorFloorColor: 0xfcd34d
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
    wallColor: 0x4f46e5,
    trimColor: 0xc7d2fe,
    roofColor: 0x312e81,
    accentColor: 0x4338ca,
    hexAccent: '#4F46E5',
    doorX: 0,
    doorZ: -42.5,
    frontDir: 1,
    interiorWallColor: 0xe0e7ff,
    interiorFloorColor: 0xa5b4fc
  },
  {
    id: 'speaking',
    name: 'EraGames Arcade Arena',
    shortSign: 'ERAGAMES',
    x: -44,
    z: 30,
    w: 17,
    d: 13,
    h: 10,
    wallColor: 0x7c3aed, // Electric Violet Arcade Facade
    trimColor: 0xe9d5ff,
    roofColor: 0x4c1d95,
    accentColor: 0x6d28d9,
    hexAccent: '#7C3AED',
    doorX: -44,
    doorZ: 23.5,
    frontDir: -1,
    interiorWallColor: 0xf3e8ff,
    interiorFloorColor: 0xd8b4fe
  },
  {
    id: 'reading',
    name: 'EraSHOP Boutique & Gear',
    shortSign: 'EraSHOP',
    x: 44,
    z: 30,
    w: 17,
    d: 13,
    h: 10,
    wallColor: 0xdb2777, // Vibrant Rose-Pink & Gold Boutique Facade
    trimColor: 0xfce7f3,
    roofColor: 0x831843,
    accentColor: 0xbe185d,
    hexAccent: '#DB2777',
    doorX: 44,
    doorZ: 23.5,
    frontDir: -1,
    interiorWallColor: 0xfdf2f8,
    interiorFloorColor: 0xfbcfe8
  },
  {
    id: 'listening',
    name: 'Era Gallery (Photos & Videos)',
    shortSign: 'ERA GALLERY',
    x: 0,
    z: 50,
    w: 19,
    d: 14,
    h: 10.5,
    wallColor: 0x0891b2, // Ocean Teal Exhibition Gallery Facade
    trimColor: 0xa5f3fc,
    roofColor: 0x164e63,
    accentColor: 0x0e7490,
    hexAccent: '#0891B2',
    doorX: 0,
    doorZ: 43,
    frontDir: -1,
    interiorWallColor: 0xcffafe,
    interiorFloorColor: 0x67e8f9
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
      slot: 'back-center',
      category: 'PERSONAL ANALYTICS',
      title: 'My IELTS Dashboard',
      subtitle: 'Individual Reading, Listening, Writing & Speaking Band Scores',
      badge: 'OPEN MY DASHBOARD',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'my_dashboard',
      dashboardType: 'personal',
      route: '/ielts/dashboard'
    },
    {
      slot: 'left-back',
      category: 'LISTENING ACTIVITY & BAR GRAPH',
      title: 'Listening Activity',
      subtitle: 'Accurate Score Bar Graph & Listening Test Name + Score Record',
      badge: 'OPEN LISTENING ACTIVITY',
      accentHex: '#0D9488',
      bgLightHex: '#CCFBF1',
      actionType: 'skill_dashboard',
      skillOrTab: 'Listening',
      dashboardType: 'listening'
    },
    {
      slot: 'left-front',
      category: 'READING ACTIVITY & BAR GRAPH',
      title: 'Reading Activity',
      subtitle: 'Accurate Score Bar Graph & Reading Test Name + Score Record',
      badge: 'OPEN READING ACTIVITY',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'skill_dashboard',
      skillOrTab: 'Reading',
      dashboardType: 'reading'
    },
    {
      slot: 'right-back',
      category: 'WRITING ACTIVITY & BAR GRAPH',
      title: 'Writing Activity',
      subtitle: 'Accurate Score Bar Graph & Writing Test Name + Score Record',
      badge: 'OPEN WRITING ACTIVITY',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'skill_dashboard',
      skillOrTab: 'Writing',
      dashboardType: 'writing'
    },
    {
      slot: 'right-front',
      category: 'SPEAKING ONLINE & OFFLINE VIDEO',
      title: 'Speaking Activity (Online & Offline)',
      subtitle: 'Online Speaking Tests & Offline Speaking Video Thumbnails + Feedback',
      badge: 'OPEN SPEAKING ACTIVITY',
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
      category: 'ARCADE GAME 01 • +60 💎 GEMS',
      title: 'Vocabulary Speed Blitz',
      subtitle: 'Match Academic IELTS Synonyms & Win Era Gems',
      badge: 'PLAY VOCAB BLITZ',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'open_eragames'
    },
    {
      slot: 'back-right',
      category: 'ARCADE GAME 02 • +50 💎 GEMS',
      title: 'Academic Word Scramble',
      subtitle: 'Unscramble Band 8.0 Words & Collect Era Gems',
      badge: 'PLAY WORD SCRAMBLE',
      accentHex: '#DB2777',
      bgLightHex: '#FCE7F3',
      actionType: 'open_eragames'
    },
    {
      slot: 'left-wall',
      category: 'ARCADE GAME 03 • +75 💎 GEMS',
      title: 'Idiom Penalty Shootout',
      subtitle: 'Score Goals with English Idioms & Grammar',
      badge: 'PLAY PENALTY SHOOTOUT',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'open_eragames'
    },
    {
      slot: 'right-wall',
      category: 'SPEND YOUR GEMS',
      title: 'Visit Candy in EraSHOP',
      subtitle: 'Use Your 💎 Era Gems to Buy Bikes, Skateboards & Belts',
      badge: 'OPEN ERASHOP',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'open_erashop',
      shopCategory: 'all'
    }
  ],
  reading: [],
  listening: [
    {
      slot: 'back-left',
      category: 'CAMPUS PHOTO EXHIBITION',
      title: 'Life at Kỷ Nguyên Era',
      subtitle: 'A Vibrant Community of Learners Achieving Their Dreams',
      badge: 'VIEW CAMPUS PHOTOS (9)',
      accentHex: '#0891B2',
      bgLightHex: '#CFFAFE',
      actionType: 'open_eragallery',
      galleryTab: 'photos'
    },
    {
      slot: 'back-right',
      category: 'CAMPUS CINEMA & STORIES',
      title: 'Kỷ Nguyên Era Videos',
      subtitle: 'Watch Highlights and Stories from Our Campus in HD',
      badge: 'WATCH CAMPUS VIDEOS (6)',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'open_eragallery',
      galleryTab: 'videos'
    },
    {
      slot: 'left-wall',
      category: 'STUDENT MEMORIES',
      title: 'Classroom & Event Highlights',
      subtitle: 'Explore Full-Screen Photos from Kỷ Nguyên Era',
      badge: 'OPEN PHOTO GALLERY',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'open_eragallery',
      galleryTab: 'photos'
    },
    {
      slot: 'right-wall',
      category: 'FEATURED VIDEO REELS',
      title: 'Life at Kỷ Nguyên Era Videos',
      subtitle: 'Stream All 6 Campus Highlight Videos Inside EraVerse',
      badge: 'OPEN VIDEO THEATRE',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'open_eragallery',
      galleryTab: 'videos'
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
      gender?: string;
      hairStyle?: string;
      bodyType?: string;
      clothingType?: string;
      pantsColor?: string;
      beltType?: string;
      vehicleType?: string;
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
  const [inSportsZone, setInSportsZone] = useState<'none' | 'football' | 'tennis' | 'pickleball' | 'playground'>('none');
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [speakingModalTest, setSpeakingModalTest] = useState<{ id: number | string; title: string } | null>(null);
  const [candidateName, setCandidateName] = useState<string>(user?.displayName || 'Student');
  const [eraShopInitialTab, setEraShopInitialTab] = useState<'shop' | 'customizer'>('shop');
  const [eraShopInitialCat, setEraShopInitialCat] = useState<'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories'>('all');
  const [eraGalleryInitialTab, setEraGalleryInitialTab] = useState<'all' | 'photos' | 'videos'>('all');
  const isSuperAdminTeacherJan = Boolean(
    user?.email?.toLowerCase().trim() === 'janrelbugtay03@gmail.com' ||
    user?.email?.toLowerCase().trim() === 'khaisangschool.edu.vn@gmail.com' ||
    user?.uid === 'bDxlNzABwrPrse6l2LmS1CcLxcJ2' ||
    (isAdmin && (
      (user?.displayName && user.displayName.toLowerCase().includes('teacher jan')) ||
      (user?.displayName && user.displayName.toLowerCase().includes('teacher')) ||
      (user?.email && user.email.toLowerCase().includes('janrel'))
    ))
  );

  const [eraGems, setEraGems] = useState<number>(() => {
    if (!isSuperAdminTeacherJan) {
      try {
        localStorage.setItem('eraverse_gems_v2', '0');
      } catch (_e) {}
      return 0;
    }
    try {
      const saved = localStorage.getItem('eraverse_gems_v2');
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 1000;
    } catch (_e) {
      return 1000;
    }
  });
  const [eraDollars, setEraDollars] = useState<number>(() => {
    if (!isSuperAdminTeacherJan) {
      try {
        localStorage.setItem('eraverse_dollars_v2', '0');
      } catch (_e) {}
      return 0;
    }
    try {
      const saved = localStorage.getItem('eraverse_dollars_v2');
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 1000;
    } catch (_e) {
      return 1000;
    }
  });
  const [ownedShopItems, setOwnedShopItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eraverse_owned_shop_items');
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

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
    hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones' | 'halo' | string;
    accessoryType: 'none' | 'glasses' | 'shades' | 'cyber_visor' | 'wings' | string;
    gender?: 'boy' | 'girl' | string;
    hairStyle?: 'classic' | 'spiky' | 'long' | 'ponytail' | 'twintails' | string;
    bodyType?: 'regular' | 'slim' | 'athletic' | 'tall' | string;
    clothingType?: 'varsity' | 'hoodie' | 'streetwear' | 'royal_suit' | 'skirt_outfit' | 'cyber_jacket' | string;
    pantsColor?: string;
    beltType?: 'none' | 'leather_belt' | 'gold_belt' | 'cyber_belt' | 'star_belt' | string;
    vehicleType?: 'none' | 'skateboard' | 'bike' | string;
    [key: string]: any;
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
        accessoryType: initialMatch.accessoryType,
        gender: initialMatch.gender || 'boy',
        hairStyle: initialMatch.hairStyle || 'classic',
        bodyType: initialMatch.bodyType || 'regular',
        clothingType: initialMatch.clothingType || 'varsity',
        pantsColor: initialMatch.pantsColor || '#1e293b',
        beltType: initialMatch.beltType || 'none',
        vehicleType: initialMatch.vehicleType || 'none'
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
      accessoryType: firstPreset.accessoryType,
      gender: 'girl',
      hairStyle: 'long',
      bodyType: 'regular',
      clothingType: 'varsity',
      pantsColor: '#1e293b',
      beltType: 'none',
      vehicleType: 'none'
    };
  });

  const [firestoreFolders, setFirestoreFolders] = useState<Array<{ id: string; name: string; course: string; parentId?: string | null; isDeleted?: boolean }>>([]);
  const [firestoreUsers, setFirestoreUsers] = useState<Array<any>>([]);
  const [firestoreAssignments, setFirestoreAssignments] = useState<Array<any>>([]);
  const [firestoreSubmissions, setFirestoreSubmissions] = useState<Array<any>>([]);
  const [adminSelectedCohort, setAdminSelectedCohort] = useState<'IELTS 1' | 'IELTS 2'>('IELTS 1');

  const allPracticeTests = useMemo(() => getIeltsPracticeTests(), []);

  // Helper to persist EraVerse character customizations + Era Gems + Era Dollars + owned items to both Firestore (`users/{uid}`) and localStorage
  const persistAvatarCustomization = (
    profileToSave: typeof playerProfile,
    nextGems = eraGems,
    nextOwned = ownedShopItems,
    nextDollars = eraDollars
  ) => {
    const targetUid = profileToSave.realUserId || user?.uid || localStorage.getItem('studentUid') || '';
    const effectiveGems = isSuperAdminTeacherJan ? nextGems : 0;
    const effectiveDollars = isSuperAdminTeacherJan ? nextDollars : 0;
    const avatarPayload = {
      ...profileToSave,
      name: profileToSave.name,
      cohort: profileToSave.cohort,
      shirtColor: profileToSave.topColor || profileToSave.shirtColor,
      hairColor: profileToSave.hairColor,
      skinColor: profileToSave.skinTone || profileToSave.skinColor,
      hatType: profileToSave.hatStyle || profileToSave.hatType,
      accessoryType: profileToSave.accessoryType,
      gender: profileToSave.gender || 'boy',
      hairStyle: profileToSave.hairStyle || 'classic',
      bodyType: profileToSave.bodyType || 'regular',
      clothingType: profileToSave.clothingType || 'varsity',
      pantsColor: profileToSave.bottomColor || profileToSave.pantsColor || '#1e293b',
      beltType: profileToSave.beltStyle || profileToSave.beltType || 'none',
      vehicleType: profileToSave.vehicleType || 'none',
      eraGems: effectiveGems,
      eraDollars: effectiveDollars,
      ownedShopItems: nextOwned,
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem('eraverse_gems_v2', String(effectiveGems));
      localStorage.setItem('eraverse_dollars_v2', String(effectiveDollars));
      localStorage.setItem('eraverse_owned_shop_items', JSON.stringify(nextOwned));
      if (targetUid) {
        localStorage.setItem(`eraverse_custom_${targetUid}`, JSON.stringify(avatarPayload));
      }
      if (profileToSave.name) {
        localStorage.setItem(`eraverse_custom_nick_${profileToSave.name.trim().toLowerCase()}`, JSON.stringify(avatarPayload));
      }
      window.dispatchEvent(
        new CustomEvent('eraverse-avatar-updated', {
          detail: { uid: targetUid, name: profileToSave.name, avatar: avatarPayload }
        })
      );
    } catch (_e) {
      // ignore storage errors
    }

    if (targetUid && !targetUid.startsWith('ielts')) {
      setDoc(
        doc(db, 'users', targetUid),
        {
          eraverseAvatar: avatarPayload,
          eraGems: effectiveGems,
          eraDollars: effectiveDollars,
          gems: effectiveGems,
          dollars: effectiveDollars
        },
        { merge: true }
      ).catch(() => {});
    }
  };

  const toggleAppFullscreen = () => {
    soundEngine.playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen((prev) => !prev);
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 120);
  };

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
        const list: Array<{ id: string; name: string; course: string; parentId?: string | null; isDeleted?: boolean }> = [];
        snap.forEach((d) => {
          const data = d.data();
          if (!data.isDeleted) {
            list.push({
              id: d.id,
              name: data.name || '',
              course: data.course || '',
              parentId: data.parentId || null,
              isDeleted: Boolean(data.isDeleted)
            });
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
    const fallbackStudentUid = typeof window !== 'undefined' ? localStorage.getItem('studentUid') : null;
    const effectiveAuthUser = user || (fallbackStudentUid ? { uid: fallbackStudentUid, email: null, displayName: null } : null);
    if (!effectiveAuthUser) return;

    const matched = findCharacterForAuthUser(effectiveAuthUser, isAdmin, ieltsCharacters as any, firestoreUsers);
    if (!matched) return;

    const matchedUid = matched.realUserId || effectiveAuthUser.uid || '';
    const fsUserDoc = firestoreUsers.find((u) => u.id === matchedUid || u.uid === matchedUid);
    let customLook: any = fsUserDoc?.eraverseAvatar || null;
    try {
      const rawCustom =
        (matchedUid ? localStorage.getItem(`eraverse_custom_${matchedUid}`) : null) ||
        localStorage.getItem(`eraverse_custom_nick_${matched.name.toLowerCase()}`);
      if (rawCustom) {
        const parsed = JSON.parse(rawCustom);
        if (!customLook || (parsed.updatedAt && (!customLook.updatedAt || parsed.updatedAt >= customLook.updatedAt))) {
          customLook = { ...customLook, ...parsed };
        }
      }
    } catch (_e) {
      // ignore
    }

    if (Array.isArray(customLook?.ownedShopItems)) {
      setOwnedShopItems(customLook.ownedShopItems);
    }

    if (!isSuperAdminTeacherJan) {
      setEraGems(0);
      setEraDollars(0);
      try {
        localStorage.setItem('eraverse_gems_v2', '0');
        localStorage.setItem('eraverse_dollars_v2', '0');
      } catch (_e) {}
    } else {
      if (typeof customLook?.eraGems === 'number') {
        setEraGems(customLook.eraGems);
      }
      if (typeof customLook?.eraDollars === 'number') {
        setEraDollars(customLook.eraDollars);
      }
    }

    const femaleNames = ['suzie', 'sophia', 'may', 'emily', 'hailey', 'candy', 'anna', 'lisa', 'ruby', 'chloe'];
    const defaultGender = femaleNames.includes((customLook?.name || matched.name).toLowerCase()) ? 'girl' : 'boy';

    setPlayerProfile((prev) => {
      if (isAdmin && prev.id !== matched.id && prev.realUserId && prev.realUserId !== effectiveAuthUser.uid) {
        return prev;
      }
      return {
        ...prev,
        ...(customLook || {}),
        id: matched.id,
        realUserId: matched.realUserId || effectiveAuthUser.uid,
        email: matched.email || effectiveAuthUser.email || undefined,
        name: customLook?.name || matched.name,
        fullName: matched.fullName,
        cohort: matched.cohort,
        roleTitle: matched.roleTitle,
        specialty: matched.specialty,
        avatarDetails: matched.avatarDetails,
        shirtColor: customLook?.topColor || customLook?.shirtColor || matched.shirtColor,
        hairColor: customLook?.hairColor || matched.hairColor,
        skinColor: customLook?.skinTone || customLook?.skinColor || matched.skinColor,
        hatType: customLook?.hatStyle || customLook?.hatType || matched.hatType,
        accessoryType: customLook?.accessoryType || matched.accessoryType,
        gender: customLook?.gender || matched.gender || defaultGender,
        hairStyle: customLook?.hairStyle || matched.hairStyle || (defaultGender === 'girl' ? 'twin_buns' : 'fluffy_swept'),
        bodyType: customLook?.bodyType || matched.bodyType || 'regular',
        clothingType: customLook?.clothingType || matched.clothingType || 'varsity',
        pantsColor: customLook?.bottomColor || customLook?.pantsColor || matched.pantsColor || '#1e293b',
        beltType: customLook?.beltStyle || customLook?.beltType || matched.beltType || 'none',
        vehicleType: customLook?.vehicleType || matched.vehicleType || 'none'
      };
    });
    setCandidateName(customLook?.name || matched.name);
    if (matched.cohort === 'IELTS 1' || matched.cohort === 'IELTS 2') {
      setCohortFilter(matched.cohort);
    }
  }, [user?.uid, user?.email, isAdmin, ieltsCharacters, firestoreUsers]);

  // Exact leaderboard sorting comparator matching HomeLeaderboardDashboard.tsx
  const sortLeaderboardStudents = (a: any, b: any) => {
    if (b.overall !== a.overall) return b.overall - a.overall;
    const streakA = (a.scoredCount || 0) > 0 ? Math.min((a.scoredCount || 0) * 2, 30) : 0;
    const streakB = (b.scoredCount || 0) > 0 ? Math.min((b.scoredCount || 0) * 2, 30) : 0;
    if (streakB !== streakA) return streakB - streakA;
    return String(a.fullName || a.name).localeCompare(String(b.fullName || b.name));
  };

  // Compute every student's individual Reading, Listening, Writing, Speaking & Overall Band scores
  const allStudentsSkillScores = useMemo(() => {
    return ieltsCharacters
      .filter((c) => c.cohort === 'IELTS 1' || c.cohort === 'IELTS 2')
      .map((c) => computeStudentSkillScores(c, firestoreSubmissions, firestoreAssignments))
      .sort(sortLeaderboardStudents);
  }, [ieltsCharacters, firestoreSubmissions, firestoreAssignments]);

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
      firestoreSubmissions,
      firestoreAssignments
    );
  }, [playerProfile, user?.uid, user?.email, firestoreSubmissions, firestoreAssignments]);

  // Active player's dedicated class group list:
  // - IELTS 1 students ONLY see IELTS 1 leaderboard (14 students)
  // - IELTS 2 students ONLY see IELTS 2 leaderboard (12 students)
  // - Teacher Jan (Super Admin) can toggle between IELTS 1 and IELTS 2
  const activeClassCohortLabel: 'IELTS 1' | 'IELTS 2' =
    playerProfile.cohort === 'TEACHER (SUPER ADMIN)'
      ? adminSelectedCohort
      : playerProfile.cohort === 'IELTS 2'
      ? 'IELTS 2'
      : 'IELTS 1';

  const myClassDashboardStudents = useMemo(() => {
    return allStudentsSkillScores
      .filter((s) => s.cohort === activeClassCohortLabel)
      .sort(sortLeaderboardStudents);
  }, [allStudentsSkillScores, activeClassCohortLabel]);

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

  const playerVehicleRef = useRef<string>(playerProfile.vehicleType || 'none');
  playerVehicleRef.current = playerProfile.vehicleType || 'none';

  useEffect(() => {
    if (gameActionsRef.current) {
      gameActionsRef.current.applyAvatarAppearance(playerProfile);
      gameActionsRef.current.refreshDashboardWalls();
    }
  }, [playerProfile, myPersonalDashboardStats, myClassDashboardStudents, activeClassCohortLabel]);

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
    if (board.actionType === 'open_erashop') {
      if (board.shopCategory === 'customizer') {
        setEraShopInitialTab('customizer');
        setEraShopInitialCat('all');
      } else {
        setEraShopInitialTab('shop');
        setEraShopInitialCat((board.shopCategory as any) || 'all');
      }
      setActiveBuildingModal('reading');
    } else if (board.actionType === 'open_eragallery') {
      setEraGalleryInitialTab(board.galleryTab || 'all');
      setActiveBuildingModal('listening');
    } else if (board.actionType === 'open_eragames') {
      setActiveBuildingModal('speaking');
    } else if (board.actionType === 'my_dashboard') {
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
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    let currentQuality: GraphicsQuality = 'high';

    // 1. Lighting Rig (Balanced natural exposure so buildings & ground never wash out to white)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x15803d, 0.75);
    hemiLight.position.set(0, 90, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.2);
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

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rimLight.position.set(-70, 50, -60);
    scene.add(rimLight);

    // 2. High-Sharpness Procedural Textures
    const createRichGrassTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#249e3f';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = i % 3 === 0 ? '#1e8736' : i % 3 === 1 ? '#34b350' : '#166929';
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
      // Warm architectural slate & sandstone pavers (not blinding white)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) {
        const offset = (y / 64) % 2 === 0 ? 0 : 64;
        for (let x = -64; x < 512; x += 128) {
          ctx.fillStyle = (x + y) % 128 === 0 ? '#94a3b8' : '#cbd5e1';
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
      ctx.fillRect(0, 0, 512, 34);
      ctx.fillRect(0, 468, 512, 44);

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.lineWidth = 3;
      for (let y = 64; y < 460; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x < 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 34);
        ctx.lineTo(x, 468);
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
        roughness: 0.85,
        metalness: 0.04
      })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const paverTex = createPaverTexture();
    const plazaMat = new THREE.MeshStandardMaterial({
      map: paverTex,
      roughness: 0.68,
      metalness: 0.08
    });

    // Central Plaza
    const plazaDisc = new THREE.Mesh(new THREE.CylinderGeometry(20, 20.5, 0.18, 64), plazaMat);
    plazaDisc.position.set(0, 0.09, 0);
    plazaDisc.receiveShadow = true;
    scene.add(plazaDisc);

    // Central Fountain Monument + Holographic Projected Class Leaderboard Screen (replaces the yellow ball)
    const monumentGroup = new THREE.Group();
    const poolOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.7, 0.85, 36),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.25 })
    );
    poolOuter.position.y = 0.42;
    poolOuter.castShadow = true;
    poolOuter.receiveShadow = true;
    monumentGroup.add(poolOuter);

    const poolGoldRim = new THREE.Mesh(
      new THREE.TorusGeometry(5.25, 0.14, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.7 })
    );
    poolGoldRim.rotation.x = Math.PI / 2;
    poolGoldRim.position.y = 0.85;
    monumentGroup.add(poolGoldRim);

    const waterPool = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 4.6, 0.68, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.3,
        roughness: 0.12,
        metalness: 0.45
      })
    );
    waterPool.position.y = 0.56;
    monumentGroup.add(waterPool);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.45, 3.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.45 })
    );
    spire.position.y = 2.4;
    spire.castShadow = true;
    monumentGroup.add(spire);

    // Holographic Projector Emitter Ring on top of Fountain Pedestal
    const holoEmitterRing = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.05, 0.36, 28),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.85,
        roughness: 0.15,
        metalness: 0.8
      })
    );
    holoEmitterRing.position.y = 4.3;
    monumentGroup.add(holoEmitterRing);

    // Translucent Upward Hologram Projection Light Beam Cone
    const holoBeamCone = new THREE.Mesh(
      new THREE.ConeGeometry(4.8, 3.2, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    holoBeamCone.rotation.x = Math.PI; // Inverted cone expanding upward from emitter to projected screen
    holoBeamCone.position.y = 5.9;
    monumentGroup.add(holoBeamCone);

    // Floating Projected Class Leaderboard Screen above Fountain
    const holoScreenGroup = new THREE.Group();
    holoScreenGroup.position.set(0, 7.8, 0);

    const holoFrameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(10.4, 6.5, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x0284c7,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.92
      })
    );
    holoFrameOuter.userData = { isFountainLeaderboard: true };
    holoScreenGroup.add(holoFrameOuter);

    const initialLeaderboardTex = createClassDashboardWallTexture(
      dashboardDataRef.current.classCohortLabel,
      dashboardDataRef.current.classStudents,
      dashboardDataRef.current.myStats.name,
      maxAnisotropy
    );
    const holoScreenMat = new THREE.MeshBasicMaterial({
      map: initialLeaderboardTex,
      transparent: true,
      opacity: 0.96
    });

    const holoScreenFront = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 6.15), holoScreenMat);
    holoScreenFront.position.z = 0.1;
    holoScreenFront.userData = { isFountainLeaderboard: true };
    holoScreenGroup.add(holoScreenFront);

    const holoScreenBack = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 6.15), holoScreenMat);
    holoScreenBack.position.z = -0.1;
    holoScreenBack.rotation.y = Math.PI;
    holoScreenBack.userData = { isFountainLeaderboard: true };
    holoScreenGroup.add(holoScreenBack);

    monumentGroup.add(holoScreenGroup);
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
    const clickableBuildingMeshes: THREE.Object3D[] = [holoFrameOuter, holoScreenFront, holoScreenBack];
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

      const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.15 });
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
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.15 })
      );
      foundation.position.y = 0.35;
      foundation.receiveShadow = true;
      foundation.castShadow = true;
      bGroup.add(foundation);

      const stepPorch = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.42, 2.4),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55 })
      );
      stepPorch.position.set(0, 0.21, (b.d / 2 + 1.2) * b.frontDir);
      stepPorch.receiveShadow = true;
      bGroup.add(stepPorch);

      const mainWallMat = new THREE.MeshStandardMaterial({
        map: createFacadeWallTexture(b.wallColor, b.trimColor),
        roughness: 0.48,
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
        roughness: 0.35,
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
        new THREE.MeshStandardMaterial({ color: b.accentColor, roughness: 0.32, metalness: 0.3 })
      );
      upperDeck.position.y = b.h + 2.45;
      upperDeck.castShadow = true;
      bGroup.add(upperDeck);

      // Warm Architectural Limestone Corner Pilasters (Not blinding white)
      const pilasterMat = new THREE.MeshStandardMaterial({ color: b.trimColor, roughness: 0.45, metalness: 0.12 });
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

      // 3D Framed Windows with Colorful Awning
      const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.3 });
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

    // A. Interactive Football (Soccer) Stadium at West Park (X = -75, Z = 0)
    // Open stadium field where players can walk, run, and play inside seamlessly!
    const PITCH_CENTER = { x: -75, z: 0 };
    const PITCH_W = 28.0;
    const PITCH_L = 44.0;
    const PITCH_HALF_W = PITCH_W / 2; // 14.0
    const PITCH_HALF_L = PITCH_L / 2; // 22.0
    const GOAL_WIDTH = 6.4;
    const GOAL_HEIGHT = 2.45;
    const GOAL_DEPTH = 2.1;

    // High-Resolution 2048x2048 PBR Turf & Crisp White Chalk Pitch Markings
    const generateHighResFootballPitchTextures = () => {
      const size = 2048;
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = size;
      colorCanvas.height = size;
      const ctx = colorCanvas.getContext('2d')!;

      // Base championship lawn green
      ctx.fillStyle = '#68b03b';
      ctx.fillRect(0, 0, size, size);

      // Dual-directional mowed lawn checkerboard stripes (14 cols x 24 rows)
      const numCols = 14;
      const numRows = 24;
      const colW = size / numCols;
      const rowH = size / numRows;

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const isLightCol = c % 2 === 0;
          const isLightRow = r % 2 === 0;
          let luma = 0;
          if (isLightCol && isLightRow) luma = 14;
          else if (!isLightCol && !isLightRow) luma = -12;
          else if (isLightCol && !isLightRow) luma = 5;
          else luma = -4;

          const R = Math.min(255, Math.max(0, 104 + luma));
          const G = Math.min(255, Math.max(0, 175 + luma));
          const B = Math.min(255, Math.max(0, 56 + Math.round(luma * 0.6)));
          ctx.fillStyle = `rgb(${R},${G},${B})`;
          ctx.fillRect(c * colW, r * rowH, colW + 1, rowH + 1);
        }
      }

      // Organic micro-blade grass noise
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 16;
        data[i] = Math.min(255, Math.max(0, data[i] + grain * 0.8));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.5));
      }
      ctx.putImageData(imgData, 0, 0);

      // Goalmouth & penalty wear patches
      const wearSpots = [
        [0.5, 0.12, 140],
        [0.5, 0.88, 140],
        [0.5, 0.50, 110]
      ];
      wearSpots.forEach(([wx, wy, rad]) => {
        const grad = ctx.createRadialGradient(size * wx, size * wy, 8, size * wx, size * wy, rad);
        grad.addColorStop(0, 'rgba(132, 118, 65, 0.22)');
        grad.addColorStop(1, 'rgba(132, 118, 65, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      });

      // Crisp chalk white markings
      const planeW = 32.0;
      const planeL = 48.0;
      const toX = (m: number) => (0.5 + m / planeW) * size;
      const toY = (m: number) => (0.5 + m / planeL) * size;
      const scaleX = (m: number) => (m / planeW) * size;
      const scaleY = (m: number) => (m / planeL) * size;

      ctx.strokeStyle = '#f8fafc';
      ctx.fillStyle = '#f8fafc';
      ctx.lineWidth = (0.14 / planeW) * size;
      ctx.lineCap = 'square';

      const hw = PITCH_HALF_W;
      const hl = PITCH_HALF_L;

      // 1. Outer touchlines & goal lines
      ctx.strokeRect(toX(-hw), toY(-hl), scaleX(PITCH_W), scaleY(PITCH_L));

      // 2. Halfway line
      ctx.beginPath();
      ctx.moveTo(toX(-hw), toY(0));
      ctx.lineTo(toX(hw), toY(0));
      ctx.stroke();

      // 3. Center circle & center kickoff spot
      ctx.beginPath();
      ctx.ellipse(toX(0), toY(0), scaleX(4.4), scaleY(4.4), 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(toX(0), toY(0), scaleX(0.24), 0, Math.PI * 2);
      ctx.fill();

      // 4. North & South Penalty Boxes & Goal Areas
      [-1, 1].forEach((dir) => {
        const goalZ = dir * hl;
        const penZ = dir * (hl - 6.8);
        const sixZ = dir * (hl - 2.6);
        const spotZ = dir * (hl - 4.8);

        // 18-yard penalty box
        ctx.strokeRect(toX(-6.8), Math.min(toY(goalZ), toY(penZ)), scaleX(13.6), scaleY(6.8));

        // 6-yard goal area
        ctx.strokeRect(toX(-4.1), Math.min(toY(goalZ), toY(sixZ)), scaleX(8.2), scaleY(2.6));

        // Penalty spot
        ctx.beginPath();
        ctx.arc(toX(0), toY(spotZ), scaleX(0.2), 0, Math.PI * 2);
        ctx.fill();

        // Penalty box D-arc
        ctx.beginPath();
        const startAng = dir === -1 ? Math.PI * 0.22 : Math.PI * 1.22;
        const endAng = dir === -1 ? Math.PI * 0.78 : Math.PI * 1.78;
        ctx.ellipse(toX(0), toY(spotZ), scaleX(3.4), scaleY(3.4), 0, startAng, endAng);
        ctx.stroke();
      });

      // 5. Corner arcs
      const cRadX = scaleX(0.9);
      const cRadY = scaleY(0.9);
      [
        [-hw, -hl, 0, Math.PI * 0.5],
        [hw, -hl, Math.PI * 0.5, Math.PI],
        [hw, hl, Math.PI, Math.PI * 1.5],
        [-hw, hl, Math.PI * 1.5, Math.PI * 2]
      ].forEach(([cx, cz, a1, a2]) => {
        ctx.beginPath();
        ctx.ellipse(toX(cx), toY(cz), cRadX, cRadY, 0, a1, a2);
        ctx.stroke();
      });

      const colorTex = new THREE.CanvasTexture(colorCanvas);
      colorTex.colorSpace = THREE.SRGBColorSpace;
      colorTex.anisotropy = maxAnisotropy;
      return { colorTex, planeW, planeL };
    };

    const createClubBrandTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, 512, 128);
      ctx.font = 'italic 900 38px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText('Era Football Club', 256, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const createCorrugatedRoofTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      for (let x = 0; x < 256; x += 8) {
        ctx.fillStyle = x % 16 === 0 ? '#1e5e22' : '#144617';
        ctx.fillRect(x, 0, 8, 256);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 4);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const createHexNetTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(64, 0);
      ctx.lineTo(128, 64);
      ctx.lineTo(64, 128);
      ctx.closePath();
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(18, 9);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // 1. PBR Football Turf Mesh
    const { colorTex: pitchColorTex, planeW: pitchPlaneW, planeL: pitchPlaneL } = generateHighResFootballPitchTextures();
    const footballPitch = new THREE.Mesh(
      new THREE.PlaneGeometry(pitchPlaneW, pitchPlaneL),
      new THREE.MeshStandardMaterial({
        map: pitchColorTex,
        roughness: 0.76,
        metalness: 0.02
      })
    );
    footballPitch.rotation.x = -Math.PI / 2;
    footballPitch.position.set(PITCH_CENTER.x, 0.08, PITCH_CENTER.z);
    footballPitch.receiveShadow = true;
    scene.add(footballPitch);

    // 2. 3D Football Goals with Deformable Hexagonal Nets at North (-Z) & South (+Z) ends
    const footballGoalNets: any[] = [];
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.35 });
    const stanchionMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.45, metalness: 0.4 });
    const hexNetMat = new THREE.MeshStandardMaterial({
      map: createHexNetTexture(),
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      roughness: 0.55
    });

    const createDetailedGoal = (zSign: number) => {
      const gGroup = new THREE.Group();
      const goalZ = PITCH_CENTER.z + zSign * PITCH_HALF_L;
      gGroup.position.set(PITCH_CENTER.x, 0, goalZ);

      // Left & Right upright posts
      const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, GOAL_HEIGHT, 16), postMat);
      leftPost.position.set(-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0);
      leftPost.castShadow = true;

      const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, GOAL_HEIGHT, 16), postMat);
      rightPost.position.set(GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0);
      rightPost.castShadow = true;

      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, GOAL_WIDTH + 0.22, 16), postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, GOAL_HEIGHT, 0);
      crossbar.castShadow = true;
      gGroup.add(leftPost, rightPost, crossbar);

      // Stanchions (rear support bars)
      [-GOAL_WIDTH / 2, GOAL_WIDTH / 2].forEach((px) => {
        const backBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GOAL_HEIGHT, 10), stanchionMat);
        backBar.position.set(px, GOAL_HEIGHT / 2, zSign * GOAL_DEPTH);
        gGroup.add(backBar);

        const topStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, GOAL_DEPTH, 10), stanchionMat);
        topStrut.rotation.x = Math.PI / 2;
        topStrut.position.set(px, GOAL_HEIGHT - 0.05, zSign * (GOAL_DEPTH / 2));
        gGroup.add(topStrut);
      });

      // Deformable back net plane
      const backNetGeo = new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_HEIGHT, 16, 8);
      const backNet = new THREE.Mesh(backNetGeo, hexNetMat);
      backNet.position.set(0, GOAL_HEIGHT / 2, zSign * GOAL_DEPTH);
      (backNet as any).userData = {
        basePos: backNetGeo.attributes.position.clone(),
        rippleIntensity: 0,
        zSign
      };
      gGroup.add(backNet);
      footballGoalNets.push(backNet);

      // Roof Net & Side Nets
      const roofNet = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_DEPTH), hexNetMat);
      roofNet.rotation.x = Math.PI / 2;
      roofNet.position.set(0, GOAL_HEIGHT, zSign * (GOAL_DEPTH / 2));
      gGroup.add(roofNet);

      [-GOAL_WIDTH / 2, GOAL_WIDTH / 2].forEach((px) => {
        const sideNet = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_DEPTH, GOAL_HEIGHT), hexNetMat);
        sideNet.rotation.y = Math.PI / 2;
        sideNet.position.set(px, GOAL_HEIGHT / 2, zSign * (GOAL_DEPTH / 2));
        gGroup.add(sideNet);
      });

      scene.add(gGroup);
    };
    createDetailedGoal(-1); // North goal (Z = -22)
    createDetailedGoal(1);  // South goal (Z = +22)

    // 3. Animated Corner Flags
    const footballCornerFlags: THREE.Mesh[] = [];
    const cornerPoleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const cornerClothMat = new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide, roughness: 0.4 });
    [
      [-PITCH_HALF_W, -PITCH_HALF_L],
      [PITCH_HALF_W, -PITCH_HALF_L],
      [-PITCH_HALF_W, PITCH_HALF_L],
      [PITCH_HALF_W, PITCH_HALF_L]
    ].forEach(([cx, cz]) => {
      const fg = new THREE.Group();
      fg.position.set(PITCH_CENTER.x + cx, 0, PITCH_CENTER.z + cz);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), cornerPoleMat);
      pole.position.y = 0.7;
      fg.add(pole);

      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.32, 6, 2), cornerClothMat);
      cloth.position.set(0.24, 1.2, 0);
      fg.add(cloth);
      scene.add(fg);
      footballCornerFlags.push(cloth);
    });

    // 4. Covered Grandstand on West Side + 3D Animated Spectators
    const greenWallMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.65 });
    const whiteCopingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.75 });
    const brandTex = createClubBrandTexture();
    const brandMat = new THREE.MeshBasicMaterial({ map: brandTex, transparent: true });

    const standGroup = new THREE.Group();
    const westBaseX = PITCH_CENTER.x - PITCH_HALF_W - 2.8; // around X = -91.8
    const standLen = 42.0;

    // West touchline barrier wall with white coping
    const westBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, standLen), greenWallMat);
    westBarrier.position.set(westBaseX, 0.7, PITCH_CENTER.z);
    westBarrier.castShadow = true;
    westBarrier.receiveShadow = true;
    standGroup.add(westBarrier);

    const westCoping = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, standLen + 0.2), whiteCopingMat);
    westCoping.position.set(westBaseX, 1.45, PITCH_CENTER.z);
    standGroup.add(westCoping);

    [-12, 0, 12].forEach((zOffset) => {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.0), brandMat);
      sign.position.set(westBaseX + 0.34, 0.75, PITCH_CENTER.z + zOffset);
      sign.rotation.y = Math.PI / 2;
      standGroup.add(sign);
    });

    // 3 Tiered concrete grandstand steps + 3D cheering spectators
    const stadiumSpectators: any[] = [];
    const skinPalette = [0xf5cba7, 0xe0ac69, 0xc68642, 0x8d5524, 0xfadbd8];
    const shirtPalette = [0xef4444, 0xdc2626, 0x3b82f6, 0x2563eb, 0xfacc15, 0x10b981, 0xffffff, 0xf97316];
    const headGeo = new THREE.SphereGeometry(0.32, 12, 12);
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.6, 10);
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    for (let row = 0; row < 3; row++) {
      const stepX = westBaseX - (1.1 + row * 1.15);
      const stepY = 1.25 + row * 0.75;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, stepY, standLen - 1.2), concreteMat);
      stepMesh.position.set(stepX, stepY / 2, PITCH_CENTER.z);
      stepMesh.receiveShadow = true;
      standGroup.add(stepMesh);

      for (let z = -18.0; z <= 18.0; z += 2.2) {
        const spec = new THREE.Group();
        const skinColor = skinPalette[(Math.abs(Math.round(z * 3)) + row) % skinPalette.length];
        const shirtColor = shirtPalette[(Math.abs(Math.round(z * 7)) + row * 2) % shirtPalette.length];

        const torso = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 }));
        torso.position.y = 0.3;
        torso.castShadow = true;
        spec.add(torso);

        const headPivot = new THREE.Group();
        headPivot.position.y = 0.78;

        const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.45 }));
        head.castShadow = true;
        headPivot.add(head);

        const e1 = new THREE.Mesh(eyeGeo, eyeMat);
        e1.position.set(0.28, 0.04, -0.1);
        headPivot.add(e1);
        const e2 = new THREE.Mesh(eyeGeo, eyeMat);
        e2.position.set(0.28, 0.04, 0.1);
        headPivot.add(e2);

        spec.add(headPivot);
        spec.position.set(stepX + 0.15, stepY, PITCH_CENTER.z + z);
        (spec as any).userData = {
          baseY: stepY,
          phase: Math.random() * Math.PI * 2,
          headPivot
        };
        standGroup.add(spec);
        stadiumSpectators.push(spec);
      }
    }

    // Grandstand back wall & VIP skybox windows
    const backWallX = westBaseX - 4.6;
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.75, 5.5, standLen), greenWallMat);
    backWall.position.set(backWallX, 2.75, PITCH_CENTER.z);
    backWall.castShadow = true;
    standGroup.add(backWall);

    for (let wz = -16; wz <= 16; wz += 6) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 4.2), glassMat);
      win.position.set(backWallX + 0.38, 4.2, PITCH_CENTER.z + wz);
      standGroup.add(win);
    }

    // Slanted Corrugated Green Canopy Roof
    const roofMat = new THREE.MeshStandardMaterial({ map: createCorrugatedRoofTexture(), roughness: 0.55 });
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.22, standLen + 0.4), roofMat);
    roofSlab.position.set(westBaseX - 2.2, 5.8, PITCH_CENTER.z);
    roofSlab.rotation.z = -0.14;
    roofSlab.castShadow = true;
    standGroup.add(roofSlab);

    scene.add(standGroup);

    // 5. Open Stadium Entrances & East Walkway (Facing Main Campus Pathways)
    // Completely OPEN field design so players and autonomous classmates can easily walk and run inside!
    const eastBaseX = PITCH_CENTER.x + PITCH_HALF_W + 1.8; // around X = -59.2
    const entranceGateW = 12.0; // 12-meter wide open gateway!

    // North-East low barrier
    const neBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, (standLen - entranceGateW) / 2), greenWallMat);
    neBarrier.position.set(eastBaseX, 0.45, PITCH_CENTER.z - (entranceGateW / 2 + (standLen - entranceGateW) / 4));
    scene.add(neBarrier);

    // South-East low barrier
    const seBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, (standLen - entranceGateW) / 2), greenWallMat);
    seBarrier.position.set(eastBaseX, 0.45, PITCH_CENTER.z + (entranceGateW / 2 + (standLen - entranceGateW) / 4));
    scene.add(seBarrier);

    // Grand Entrance Archway Pillars with Era Football Club Signage
    [-entranceGateW / 2, entranceGateW / 2].forEach((pz) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), greenWallMat);
      pillar.position.set(eastBaseX, 1.8, PITCH_CENTER.z + pz);
      pillar.castShadow = true;
      scene.add(pillar);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), whiteCopingMat);
      cap.position.set(eastBaseX, 3.75, PITCH_CENTER.z + pz);
      scene.add(cap);

      const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), brandMat);
      banner.position.set(eastBaseX + 0.62, 2.2, PITCH_CENTER.z + pz);
      banner.rotation.y = Math.PI / 2;
      scene.add(banner);
    });

    // Overhead Entrance Welcome Sign
    const gateSignTex = makeAttachedBuildingNameTexture('ERA FOOTBALL CLUB • OPEN PITCH ⚽', '#14532d', '#22c55e');
    const gateSign = new THREE.Mesh(
      new THREE.BoxGeometry(entranceGateW + 0.8, 1.4, 0.3),
      new THREE.MeshBasicMaterial({ map: gateSignTex })
    );
    gateSign.position.set(eastBaseX, 3.8, PITCH_CENTER.z);
    gateSign.rotation.y = Math.PI / 2;
    scene.add(gateSign);

    // Team Dugout Benches on touchline
    const createTeamDugout = (x: number, z: number) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.7), benchMat);
      seat.position.y = 0.45;
      bGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.12), benchMat);
      back.position.set(0, 0.75, -0.28);
      bGroup.add(back);
      scene.add(bGroup);
    };
    createTeamDugout(PITCH_CENTER.x - 8, PITCH_CENTER.z - PITCH_HALF_L - 1.8);
    createTeamDugout(PITCH_CENTER.x + 8, PITCH_CENTER.z - PITCH_HALF_L - 1.8);

    // 6. Interactive Physics 3D Match Football
    const createClassicSoccerBallTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 256);

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      const spots = [
        [64, 64], [192, 64], [320, 64], [448, 64],
        [128, 160], [256, 160], [384, 160], [500, 160]
      ];
      spots.forEach(([cx, cy]) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(ang) * 26;
          const py = cy + Math.sin(ang) * 26;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const SOCCER_BALL_RADIUS = 0.46;
    const soccerBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SOCCER_BALL_RADIUS, 28, 28),
      new THREE.MeshStandardMaterial({
        map: createClassicSoccerBallTexture(),
        roughness: 0.32,
        metalness: 0.08
      })
    );
    soccerBallMesh.castShadow = true;
    soccerBallMesh.position.set(PITCH_CENTER.x, SOCCER_BALL_RADIUS, PITCH_CENTER.z);
    scene.add(soccerBallMesh);

    const soccerBallState = {
      x: PITCH_CENTER.x,
      y: SOCCER_BALL_RADIUS,
      z: PITCH_CENTER.z,
      vx: 0,
      vy: 0,
      vz: 0
    };

    // B. Era Tennis Court — Lakeside Center Court PBR at East Park (X = 72, Z = 0)
    const TENNIS_CENTER = { x: 72, z: 0 };
    const PICKLE_CENTER = TENNIS_CENTER;
    const TENNIS_PLANE_W = 19.0;
    const TENNIS_PLANE_L = 31.0;
    const PICKLE_W = TENNIS_PLANE_W;
    const PICKLE_L = TENNIS_PLANE_L;
    const TENNIS_DOUBLES_W = 13.0;
    const TENNIS_SINGLES_W = 9.8;
    const TENNIS_COURT_L = 24.0;
    const TENNIS_HALF_L = 12.0;
    const TENNIS_SERVICE_L = 6.2;
    const TENNIS_NET_H = 1.0;

    const tennisSpectators: THREE.Group[] = [];

    // Helper for procedural 3D Tennis Racket (Grip, Throat, Hoop, and String Bed)
    const createTennisRacketMesh = (accentColor = '#10b981') => {
      const racket = new THREE.Group();
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.44, 12), handleMat);
      handle.position.y = -0.22;
      racket.add(handle);

      const buttcapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const buttcap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 12), buttcapMat);
      buttcap.position.y = -0.44;
      racket.add(buttcap);

      const frameMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.35, metalness: 0.45 });
      const throatL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), frameMat);
      throatL.position.set(-0.04, 0.06, 0);
      throatL.rotation.z = -0.25;
      const throatR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), frameMat);
      throatR.position.set(0.04, 0.06, 0);
      throatR.rotation.z = 0.25;
      racket.add(throatL, throatR);

      const headRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 12, 28), frameMat);
      headRim.scale.set(0.85, 1.25, 1);
      headRim.position.y = 0.32;
      racket.add(headRim);

      const stringCanvas = document.createElement('canvas');
      stringCanvas.width = 128;
      stringCanvas.height = 128;
      const sCtx = stringCanvas.getContext('2d')!;
      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.lineWidth = 4;
      for (let i = 16; i < 128; i += 16) {
        sCtx.beginPath();
        sCtx.moveTo(i, 8);
        sCtx.lineTo(i, 120);
        sCtx.moveTo(8, i);
        sCtx.lineTo(120, i);
        sCtx.stroke();
      }
      const stringTex = new THREE.CanvasTexture(stringCanvas);
      const stringMat = new THREE.MeshBasicMaterial({
        map: stringTex,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide
      });
      const stringBed = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.44), stringMat);
      stringBed.position.y = 0.32;
      racket.add(stringBed);

      racket.scale.set(1.15, 1.15, 1.15);
      return racket;
    };

    // 1. High-Resolution Grass Court Texture with Dual-Directional Lawn Checkerboard & Chalk Markings
    const generateHighResGrassCourtTextures = () => {
      const size = 1024;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;

      // Base lush championship green
      ctx.fillStyle = '#6db33f';
      ctx.fillRect(0, 0, size, size);

      // Dual-directional mowed lawn checkerboard stripes
      const numCols = 14;
      const numRows = 22;
      const colW = size / numCols;
      const rowH = size / numRows;

      for (let r = 0; r < numRows; r++) {
        for (let col = 0; col < numCols; col++) {
          const isLightCol = col % 2 === 0;
          const isLightRow = r % 2 === 0;
          let luma = 0;
          if (isLightCol && isLightRow) luma = 14;
          else if (!isLightCol && !isLightRow) luma = -12;
          else if (isLightCol && !isLightRow) luma = 4;
          else luma = -4;

          const R = Math.min(255, Math.max(0, 108 + luma));
          const G = Math.min(255, Math.max(0, 178 + luma));
          const B = Math.min(255, Math.max(0, 60 + Math.round(luma * 0.6)));
          ctx.fillStyle = `rgb(${R},${G},${B})`;
          ctx.fillRect(col * colW, r * rowH, colW + 1, rowH + 1);
        }
      }

      // Micro grass blade organic grain
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * 16;
        data[i] = Math.min(255, Math.max(0, data[i] + grain * 0.8));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.5));
      }
      ctx.putImageData(imgData, 0, 0);

      // Baseline footwork wear patches
      const wearGrad1 = ctx.createRadialGradient(size * 0.5, size * 0.88, 10, size * 0.5, size * 0.88, 120);
      wearGrad1.addColorStop(0, 'rgba(138, 125, 70, 0.28)');
      wearGrad1.addColorStop(1, 'rgba(138, 125, 70, 0)');
      ctx.fillStyle = wearGrad1;
      ctx.fillRect(0, 0, size, size);

      const wearGrad2 = ctx.createRadialGradient(size * 0.5, size * 0.12, 10, size * 0.5, size * 0.12, 120);
      wearGrad2.addColorStop(0, 'rgba(138, 125, 70, 0.28)');
      wearGrad2.addColorStop(1, 'rgba(138, 125, 70, 0)');
      ctx.fillStyle = wearGrad2;
      ctx.fillRect(0, 0, size, size);

      // Crisp chalk white court markings
      const toX = (m: number) => (0.5 + m / TENNIS_PLANE_W) * size;
      const toY = (m: number) => (0.5 + m / TENNIS_PLANE_L) * size;

      ctx.strokeStyle = '#f8fafc';
      ctx.fillStyle = '#f8fafc';
      ctx.lineCap = 'square';
      ctx.lineWidth = 6;

      const hwDoubles = TENNIS_DOUBLES_W / 2;
      const hwSingles = TENNIS_SINGLES_W / 2;
      const hl = TENNIS_HALF_L;
      const sl = TENNIS_SERVICE_L;

      // Outer Doubles Rectangle
      ctx.strokeRect(toX(-hwDoubles), toY(-hl), (TENNIS_DOUBLES_W / TENNIS_PLANE_W) * size, (TENNIS_COURT_L / TENNIS_PLANE_L) * size);

      // Singles Sidelines
      ctx.beginPath();
      ctx.moveTo(toX(-hwSingles), toY(-hl));
      ctx.lineTo(toX(-hwSingles), toY(hl));
      ctx.moveTo(toX(hwSingles), toY(-hl));
      ctx.lineTo(toX(hwSingles), toY(hl));

      // Service Lines
      ctx.moveTo(toX(-hwSingles), toY(-sl));
      ctx.lineTo(toX(hwSingles), toY(-sl));
      ctx.moveTo(toX(-hwSingles), toY(sl));
      ctx.lineTo(toX(hwSingles), toY(sl));

      // Center Service Line
      ctx.moveTo(toX(0), toY(-sl));
      ctx.lineTo(toX(0), toY(sl));

      // Baseline Center Tick Marks
      ctx.moveTo(toX(0), toY(-hl));
      ctx.lineTo(toX(0), toY(-hl + 0.45));
      ctx.moveTo(toX(0), toY(hl));
      ctx.lineTo(toX(0), toY(hl - 0.45));
      ctx.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // Helper for "Era Tennis Court" Brand Banners
    const createTennisBrandTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 116);
      ctx.font = '900 38px "Outfit", sans-serif';
      ctx.fillStyle = '#ecfdf5';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎾 ERA TENNIS COURT', 256, 64);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // Helper for Corrugated Grandstand Canopy Roof
    const createTennisRoofTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      for (let x = 0; x < 256; x += 8) {
        ctx.fillStyle = x % 16 === 0 ? '#166534' : '#14532d';
        ctx.fillRect(x, 0, 8, 256);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 2);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const tennisCourtGroup = new THREE.Group();
    tennisCourtGroup.position.set(TENNIS_CENTER.x, 0, TENNIS_CENTER.z);

    // 2. High-Definition Turf Court Mesh
    const courtGeo = new THREE.PlaneGeometry(TENNIS_PLANE_W, TENNIS_PLANE_L);
    const courtMat = new THREE.MeshStandardMaterial({
      map: generateHighResGrassCourtTextures(),
      roughness: 0.72,
      metalness: 0.04
    });
    const tennisCourtMesh = new THREE.Mesh(courtGeo, courtMat);
    tennisCourtMesh.rotation.x = -Math.PI / 2;
    tennisCourtMesh.position.y = 0.08;
    tennisCourtMesh.receiveShadow = true;
    tennisCourtGroup.add(tennisCourtMesh);

    // 3. Braided 3D Tennis Net with Catenary Sag, White Top Tape & Center Strap
    const netWidth = TENNIS_DOUBLES_W + 1.2;
    const netCanvas = document.createElement('canvas');
    netCanvas.width = 128;
    netCanvas.height = 128;
    const nCtx = netCanvas.getContext('2d')!;
    nCtx.strokeStyle = '#0f172a';
    nCtx.lineWidth = 14;
    nCtx.strokeRect(0, 0, 128, 128);
    const netTex = new THREE.CanvasTexture(netCanvas);
    netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
    netTex.repeat.set(40, 4);

    const netGeo = new THREE.PlaneGeometry(netWidth, TENNIS_NET_H - 0.06, 24, 1);
    const posAttr = netGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const normX = vx / (netWidth / 2);
      const sag = (1 - normX * normX) * 0.055;
      posAttr.setY(i, vy - sag);
    }
    netGeo.computeVertexNormals();

    const netMat = new THREE.MeshStandardMaterial({
      map: netTex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      roughness: 0.6
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(0, (TENNIS_NET_H - 0.06) / 2 + 0.04, 0);
    netMesh.castShadow = true;
    tennisCourtGroup.add(netMesh);

    // White Canvas Top Tape (curved with matching catenary sag)
    const tapeGeo = new THREE.BoxGeometry(netWidth, 0.075, 0.06, 24, 1, 1);
    const tapePos = tapeGeo.attributes.position;
    for (let i = 0; i < tapePos.count; i++) {
      const vx = tapePos.getX(i);
      const normX = vx / (netWidth / 2);
      tapePos.setY(i, tapePos.getY(i) - (1 - normX * normX) * 0.055);
    }
    tapeGeo.computeVertexNormals();
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
    tapeMesh.position.set(0, TENNIS_NET_H + 0.04, 0);
    tapeMesh.castShadow = true;
    tennisCourtGroup.add(tapeMesh);

    // White Center Strap
    const strapGeo = new THREE.BoxGeometry(0.08, TENNIS_NET_H - 0.04, 0.07);
    const strapMesh = new THREE.Mesh(strapGeo, tapeMat);
    strapMesh.position.set(0, (TENNIS_NET_H - 0.04) / 2 + 0.04, 0);
    tennisCourtGroup.add(strapMesh);

    // Forest-Green Fluted Net Posts & Brass Caps
    const tennisPostGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.15, 16);
    const tennisPostMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.35, metalness: 0.45 });
    const tennisLeftPost = new THREE.Mesh(tennisPostGeo, tennisPostMat);
    tennisLeftPost.position.set(-netWidth / 2, 0.58, 0);
    tennisLeftPost.castShadow = true;
    const tennisRightPost = new THREE.Mesh(tennisPostGeo, tennisPostMat);
    tennisRightPost.position.set(netWidth / 2, 0.58, 0);
    tennisRightPost.castShadow = true;
    tennisCourtGroup.add(tennisLeftPost, tennisRightPost);

    // 4. Stadium Perimeter Walls, Wooden Benches & Open Entrance Pathways
    const tennisGreenWallMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.65 });
    const tennisDarkPanelMat = new THREE.MeshStandardMaterial({ color: 0x0f3b1e, roughness: 0.75 });
    const tennisWhiteCopingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
    const tennisBrandMat = new THREE.MeshBasicMaterial({ map: createTennisBrandTexture() });

    // North Wall (-Z) with windscreen panels and "Era Tennis Court" brand
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(TENNIS_PLANE_W + 1.2, 1.8, 0.5), tennisGreenWallMat);
    northWall.position.set(0, 0.9, -TENNIS_PLANE_L / 2 - 0.25);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    tennisCourtGroup.add(northWall);

    const northCoping = new THREE.Mesh(new THREE.BoxGeometry(TENNIS_PLANE_W + 1.4, 0.12, 0.65), tennisWhiteCopingMat);
    northCoping.position.set(0, 1.86, -TENNIS_PLANE_L / 2 - 0.25);
    tennisCourtGroup.add(northCoping);

    const northBrand = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), tennisBrandMat);
    northBrand.position.set(0, 1.05, -TENNIS_PLANE_L / 2 + 0.02);
    tennisCourtGroup.add(northBrand);

    // Court Wooden Benches
    const createCourtBench = (bx: number, bz: number, rotY: number) => {
      const bGroup = new THREE.Group();
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), benchMat);
      seat.position.y = 0.45;
      seat.castShadow = true;
      bGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.48, 0.08), benchMat);
      back.position.set(0, 0.72, -0.26);
      back.castShadow = true;
      bGroup.add(back);
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.52), tennisDarkPanelMat);
      legL.position.set(-1.05, 0.22, 0);
      bGroup.add(legL);
      const legR = legL.clone();
      legR.position.x = 1.05;
      bGroup.add(legR);
      bGroup.position.set(bx, 0, bz);
      bGroup.rotation.y = rotY;
      tennisCourtGroup.add(bGroup);
    };

    createCourtBench(-4.2, -TENNIS_PLANE_L / 2 + 0.9, 0);
    createCourtBench(4.2, -TENNIS_PLANE_L / 2 + 0.9, 0);

    // West Side (-X, towards central campus avenue): Wide open entrance so players easily walk into court!
    const westBarrierNorth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 10.0), tennisGreenWallMat);
    westBarrierNorth.position.set(-TENNIS_PLANE_W / 2 - 0.25, 0.45, -TENNIS_PLANE_L / 4 - 2.5);
    westBarrierNorth.castShadow = true;
    tennisCourtGroup.add(westBarrierNorth);

    const westBarrierSouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 10.0), tennisGreenWallMat);
    westBarrierSouth.position.set(-TENNIS_PLANE_W / 2 - 0.25, 0.45, TENNIS_PLANE_L / 4 + 2.5);
    westBarrierSouth.castShadow = true;
    tennisCourtGroup.add(westBarrierSouth);

    // Welcome entrance pillars flanking the wide 10m West gateway
    [-5.0, 5.0].forEach((pz) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), tennisWhiteCopingMat);
      pillar.position.set(-TENNIS_PLANE_W / 2 - 0.25, 0.7, pz);
      pillar.castShadow = true;
      tennisCourtGroup.add(pillar);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 }));
      cap.position.set(-TENNIS_PLANE_W / 2 - 0.25, 1.52, pz);
      tennisCourtGroup.add(cap);
    });

    // South Barrier (+Z) with open 6m center pathway
    const southBarrierL = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 0.5), tennisGreenWallMat);
    southBarrierL.position.set(-TENNIS_PLANE_W / 4 - 1.2, 0.45, TENNIS_PLANE_L / 2 + 0.25);
    southBarrierL.castShadow = true;
    tennisCourtGroup.add(southBarrierL);

    const southBarrierR = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 0.5), tennisGreenWallMat);
    southBarrierR.position.set(TENNIS_PLANE_W / 4 + 1.2, 0.45, TENNIS_PLANE_L / 2 + 0.25);
    southBarrierR.castShadow = true;
    tennisCourtGroup.add(southBarrierR);

    // 5. East Covered Grandstand with 3 Tiers, Corrugated Green Canopy Roof & 3D Animated Spectators
    const grandstandX = TENNIS_PLANE_W / 2 + 1.2;
    const tennisStandGroup = new THREE.Group();
    tennisStandGroup.position.set(grandstandX, 0, 0);

    const tennisRoofTex = createTennisRoofTexture();
    const tennisRoofMat = new THREE.MeshStandardMaterial({ map: tennisRoofTex, roughness: 0.55 });
    const tennisConcreteMat = new THREE.MeshStandardMaterial({ color: 0xdbe2ea, roughness: 0.7 });

    const tennisSkinPalette = [0xf5cba7, 0xe0ac69, 0xc68642, 0x8d5524, 0xfadbd8];
    const tennisShirtPalette = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xf97316, 0xec4899];
    const tennisHeadGeo = new THREE.SphereGeometry(0.32, 14, 14);
    const tennisBodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.58, 12);
    const tennisEyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const tennisEyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    for (let row = 0; row < 3; row++) {
      const stepX = 0.85 + row * 1.1;
      const stepY = 1.2 + row * 0.75;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, stepY, 28.0), tennisConcreteMat);
      stepMesh.position.set(stepX, stepY / 2, 0);
      stepMesh.receiveShadow = true;
      tennisStandGroup.add(stepMesh);

      // Spectators along the grandstand tier
      for (let z = -12.5; z <= 12.5; z += 1.8) {
        const spec = new THREE.Group();
        const skinColor = tennisSkinPalette[(Math.abs(Math.round(z * 5)) + row) % tennisSkinPalette.length];
        const shirtColor = tennisShirtPalette[(Math.abs(Math.round(z * 11)) + row * 2) % tennisShirtPalette.length];

        const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 });
        const charHeadMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4 });

        const torso = new THREE.Mesh(tennisBodyGeo, torsoMat);
        torso.position.y = 0.29;
        torso.castShadow = true;
        spec.add(torso);

        const headPivot = new THREE.Group();
        headPivot.position.y = 0.78;

        const head = new THREE.Mesh(tennisHeadGeo, charHeadMat);
        head.castShadow = true;
        headPivot.add(head);

        // Eyes looking towards center court
        const e1 = new THREE.Mesh(tennisEyeGeo, tennisEyeMat);
        e1.position.set(-0.29, 0.04, -0.1);
        const e2 = new THREE.Mesh(tennisEyeGeo, tennisEyeMat);
        e2.position.set(-0.29, 0.04, 0.1);
        headPivot.add(e1, e2);
        spec.add(headPivot);

        spec.position.set(stepX - 0.15, stepY, z + (Math.random() - 0.5) * 0.2);
        spec.userData = {
          baseY: stepY,
          phase: Math.random() * Math.PI * 2,
          headPivot
        };
        tennisStandGroup.add(spec);
        tennisSpectators.push(spec);
      }
    }

    // Slanted Grandstand Corrugated Canopy Roof
    const tennisRoofPivot = new THREE.Group();
    tennisRoofPivot.position.set(2.0, 5.2, 0);
    tennisRoofPivot.rotation.z = 0.16;
    const tennisRoofSlab = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 29.0), tennisRoofMat);
    tennisRoofSlab.castShadow = true;
    tennisRoofPivot.add(tennisRoofSlab);
    const tennisFascia = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 29.1), tennisWhiteCopingMat);
    tennisFascia.position.set(-2.9, 0, 0);
    tennisRoofPivot.add(tennisFascia);
    tennisStandGroup.add(tennisRoofPivot);

    tennisCourtGroup.add(tennisStandGroup);
    scene.add(tennisCourtGroup);

    // 6. Active Yellow Tennis Ball Mesh
    const pickleBallMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xd9f905,
        emissive: 0x84cc16,
        emissiveIntensity: 0.35,
        roughness: 0.38
      })
    );
    // Subtle white curved tennis ball seam ring
    const tennisSeam = new THREE.Mesh(
      new THREE.TorusGeometry(0.245, 0.014, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    tennisSeam.rotation.x = Math.PI / 4;
    pickleBallMesh.add(tennisSeam);
    pickleBallMesh.position.set(TENNIS_CENTER.x, 1.2, TENNIS_CENTER.z - 5);
    scene.add(pickleBallMesh);

    const pickleBallState = {
      x: TENNIS_CENTER.x,
      y: 1.2,
      z: TENNIS_CENTER.z - 5,
      vx: 2.0,
      vz: 9.8,
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

    // Dynamic Pop-Up Collectible Era Gems (💎) & Era Dollars (💵)
    const createCollectibleLabelSprite = (label: string, borderHex: string) => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 52, 16);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = borderHex;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 128, 39);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sp.scale.set(2.2, 0.55, 1);
      sp.position.set(0, 1.35, 0);
      return sp;
    };

    const spawnLocations = [
      { x: 15, z: -11 },
      { x: -15, z: -11 },
      { x: -15, z: 13 },
      { x: 15, z: 13 },
      { x: 0, z: 19 },
      { x: 0, z: -19 },
      { x: 32, z: -16 },
      { x: -32, z: -16 },
      { x: 32, z: 16 },
      { x: -32, z: 16 },
      { x: -58, z: -8 },
      { x: -58, z: 10 }
    ];

    const crystalObjs: Array<{
      group: THREE.Group;
      mesh: THREE.Mesh;
      ring: THREE.Mesh;
      kind: 'gem' | 'dollar';
      amount: number;
      collected: boolean;
      respawnTimer: number;
      popScale: number;
      baseY: number;
    }> = [];

    spawnLocations.forEach((loc, idx) => {
      const isGem = idx % 2 === 0;
      const amount = isGem ? 15 + (idx % 3) * 5 : 20 + (idx % 4) * 10;
      const colorHex = isGem ? (idx % 4 === 0 ? 0xec4899 : 0x38bdf8) : 0x10b981;

      const cGroup = new THREE.Group();
      cGroup.position.set(loc.x, 1.35, loc.z);

      const cMesh = new THREE.Mesh(
        isGem ? new THREE.OctahedronGeometry(0.75, 0) : new THREE.CylinderGeometry(0.68, 0.68, 0.24, 20),
        new THREE.MeshStandardMaterial({
          color: isGem ? colorHex : 0xfacc15,
          emissive: colorHex,
          emissiveIntensity: 0.55,
          roughness: 0.15,
          metalness: 0.85
        })
      );
      if (!isGem) {
        cMesh.rotation.x = Math.PI / 2;
      }
      cGroup.add(cMesh);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.75 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.55;
      cGroup.add(ring);

      const labelSprite = createCollectibleLabelSprite(
        isGem ? `💎 +${amount} GEMS` : `💵 +$${amount}`,
        isGem ? '#ec4899' : '#10b981'
      );
      cGroup.add(labelSprite);

      scene.add(cGroup);
      crystalObjs.push({
        group: cGroup,
        mesh: cMesh,
        ring,
        kind: isGem ? 'gem' : 'dollar',
        amount,
        collected: idx >= 7, // Start with 7 popped up immediately, others pop up dynamically
        respawnTimer: idx >= 7 ? 2.5 + (idx - 7) * 2.0 : 0,
        popScale: idx >= 7 ? 0.01 : 1,
        baseY: 1.35
      });
      if (idx >= 7) {
        cGroup.visible = false;
      }
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
      gender?: string;
      hairStyle?: string;
      bodyType?: string;
      clothingType?: string;
      pantsColor?: string;
      beltType?: string;
      vehicleType?: string;
      [key: string]: any;
    }) => {
      const root = new THREE.Group();
      const segs = currentQuality === 'high' ? 20 : currentQuality === 'medium' ? 12 : 8;

      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.84, segs),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.02;
      root.add(shadowDisc);

      const built = buildRealisticCharacter3D(
        {
          ...opts,
          skinTone: opts.skinTone || opts.skinColor,
          topColor: opts.topColor || opts.shirtColor,
          bottomColor: opts.bottomColor || opts.pantsColor,
          hatStyle: opts.hatStyle || opts.hatType,
          beltStyle: opts.beltStyle || opts.beltType,
          rideStyle: opts.rideStyle || opts.vehicleType
        },
        currentQuality === 'high' ? 'high' : 'campus'
      );

      // Scale anatomical studio mesh (2.15m) to match campus world scale (~3.12m)
      built.root.scale.setScalar(1.45);
      root.add(built.root);

      const nameplate = createNameplateSprite(opts.name, opts.cohort);
      root.add(nameplate);

      return {
        root,
        bodyGroup: built.torsoGroup,
        leftLeg: built.leftLegGroup,
        rightLeg: built.rightLegGroup,
        leftArm: built.leftArmGroup,
        rightArm: built.rightArmGroup,
        headGroup: built.headGroup
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

    // Tennis AI Partner Character (Coach Leo) on North baseline of Era Tennis Court
    const pickleOpponentRig = buildCharacterAvatar({
      shirtColor: '#059669',
      hairColor: '#1c1917',
      skinColor: '#fcd34d',
      hatType: 'cap',
      accessoryType: 'shades',
      name: 'Coach Leo (Tennis Pro)',
      cohort: 'IELTS 2'
    });
    pickleOpponentRig.root.position.set(TENNIS_CENTER.x, 0, TENNIS_CENTER.z - 9.5);
    const coachRacket = createTennisRacketMesh('#10b981');
    coachRacket.position.set(0.2, -0.42, 0.22);
    coachRacket.rotation.set(-Math.PI / 2, 0, 0.25);
    pickleOpponentRig.rightArm.add(coachRacket);
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
          cohort: prof.cohort,
          gender: prof.gender,
          hairStyle: prof.hairStyle,
          bodyType: prof.bodyType,
          clothingType: prof.clothingType,
          pantsColor: prof.pantsColor,
          beltType: prof.beltType,
          vehicleType: prof.vehicleType
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

      // Enclose Room Completely: Ceiling & Front Wall Wings around the Exit Door Frame
      const ceiling = new THREE.Mesh(
        new THREE.BoxGeometry(roomW, 0.4, roomD),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.85
        })
      );
      ceiling.position.set(0, roomH, 0);
      interiorGroup.add(ceiling);

      // Recessed Soft Ceiling Panels
      for (let cx = -8; cx <= 8; cx += 8) {
        for (let cz = -6; cz <= 6; cz += 6) {
          const ceilPanel = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.08, 3.2),
            new THREE.MeshBasicMaterial({ color: 0xfffbeb })
          );
          ceilPanel.position.set(cx, roomH - 0.05, cz);
          interiorGroup.add(ceilPanel);
        }
      }

      // Front Walls flanking the central Exit Door Frame (prevents exterior sky from showing)
      const frontDoorW = 5.15;
      const frontWingW = (roomW - frontDoorW) / 2;
      const frontLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(frontWingW, roomH, 0.5),
        wallMat
      );
      frontLeftWall.position.set(-roomW / 2 + frontWingW / 2, roomH / 2, roomD / 2);
      interiorGroup.add(frontLeftWall);

      const frontRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(frontWingW, roomH, 0.5),
        wallMat
      );
      frontRightWall.position.set(roomW / 2 - frontWingW / 2, roomH / 2, roomD / 2);
      interiorGroup.add(frontRightWall);

      // Lintel Wall above the Exit Door Frame
      const lintelH = roomH - 5.35;
      const frontLintel = new THREE.Mesh(
        new THREE.BoxGeometry(frontDoorW, lintelH, 0.5),
        wallMat
      );
      frontLintel.position.set(0, 5.35 + lintelH / 2, roomD / 2);
      interiorGroup.add(frontLintel);

      // Baseboard trim along walls
      const trimMat = new THREE.MeshStandardMaterial({ color: building.accentColor, roughness: 0.4 });
      const backTrim = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.45, 0.6), trimMat);
      backTrim.position.set(0, 0.22, -roomD / 2);
      interiorGroup.add(backTrim);

      // Balanced Studio Illumination inside the room (no harsh white overexposure)
      const roomLight1 = new THREE.PointLight(0xfffbeb, 1.45, 42);
      roomLight1.position.set(-6, 8.8, -3);
      interiorGroup.add(roomLight1);

      const roomLight2 = new THREE.PointLight(0xfffbeb, 1.45, 42);
      roomLight2.position.set(6, 8.8, -3);
      interiorGroup.add(roomLight2);

      const roomLight3 = new THREE.PointLight(0xe0f2fe, 1.25, 42);
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
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.4 })
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

      // Interactive 3D Wall Boards (In Dashboard Hall: Back wall has Personal Overview; Left & Right walls have Listening, Reading, Writing, Speaking Activity)
      const isDashboardHall = building.id === 'dashboard';
      const boards = INTERIOR_BOARDS_BY_BUILDING[building.id] || INTERIOR_BOARDS_BY_BUILDING['practice_tests'];
      const slotTransforms: Record<
        WallBoardSpec['slot'],
        { x: number; y: number; z: number; rotY: number; standX: number; standZ: number }
      > = {
        'back-center': {
          x: 0,
          y: 4.9,
          z: -roomD / 2 + 0.4,
          rotY: 0,
          standX: INTERIOR_ORIGIN.x,
          standZ: INTERIOR_ORIGIN.z - roomD / 2 + 4.0
        },
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

        const boardW = isBackDashboardBoard ? 12.2 : isSideSkillDashboardBoard ? 9.4 : 8.2;
        const boardH = isBackDashboardBoard ? 6.8 : isSideSkillDashboardBoard ? 5.8 : 4.8;

        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(boardW, boardH, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 })
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

      // ========================================================================
      // SPECIALIZED 3D INTERIOR FURNISHINGS FOR ERASHOP, ERA GALLERY & ERAGAMES
      // ========================================================================
      if (building.id === 'reading') {
        // EraSHOP Boutique Counter + Player "Candy" Assigned as Shopkeeper inside the Shop!
        const counterGroup = new THREE.Group();
        counterGroup.position.set(0, 0, -roomD / 2 + 5.8);

        const deskBase = new THREE.Mesh(
          new THREE.BoxGeometry(7.2, 1.35, 1.8),
          new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.25, metalness: 0.35 })
        );
        deskBase.position.y = 0.68;
        deskBase.userData = { isCandyShop: true };
        counterGroup.add(deskBase);
        clickableBoardMeshes.push(deskBase);

        const deskTop = new THREE.Mesh(
          new THREE.BoxGeometry(7.6, 0.18, 2.1),
          new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.15, metalness: 0.4 })
        );
        deskTop.position.y = 1.42;
        deskTop.userData = { isCandyShop: true };
        counterGroup.add(deskTop);
        clickableBoardMeshes.push(deskTop);

        // Candy NPC Character stationed behind the EraSHOP Counter
        const candyRig = buildCharacterAvatar({
          shirtColor: '#f43f5e',
          hairColor: '#991b1b',
          skinColor: '#fef08a',
          hatType: 'crown',
          accessoryType: 'glasses',
          name: 'Candy • EraSHOP Host',
          cohort: 'IELTS 2',
          gender: 'girl',
          hairStyle: 'twintails',
          clothingType: 'skirt_outfit',
          beltType: 'star_belt'
        });
        candyRig.root.position.set(0, 0, -1.55);
        const candyWelcomeBubble = createSpeechBubbleSprite(
          'Candy (EraSHOP)',
          'Welcome to EraSHOP! Spend your Era Gems on Bikes, Skateboards, Belts, Clothes & Boy/Girl Styles!',
          false
        );
        candyWelcomeBubble.userData = { isCandyShop: true };
        clickableBoardMeshes.push(candyWelcomeBubble);
        candyRig.root.add(candyWelcomeBubble);
        counterGroup.add(candyRig.root);
        interiorGroup.add(counterGroup);

        // 3D Display Pedestals showcasing a 3D Bike (Left) and 3D Skateboard (Right) with Price Tags
        const createShopPedestal = (px: number, pz: number, itemType: 'bike' | 'skateboard') => {
          const pGroup = new THREE.Group();
          pGroup.position.set(px, 0, pz);
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(2.1, 2.3, 0.55, 28),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.7 })
          );
          base.position.y = 0.28;
          base.userData = { isCandyShop: true };
          clickableBoardMeshes.push(base);
          pGroup.add(base);

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.15, 0.08, 12, 32),
            new THREE.MeshBasicMaterial({ color: itemType === 'bike' ? 0x06b6d4 : 0xec4899 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.56;
          pGroup.add(ring);

          if (itemType === 'bike') {
            const bikeShowcase = buildCharacterAvatar({
              shirtColor: '#06b6d4',
              hairColor: '#0f172a',
              skinColor: '#fcd34d',
              hatType: 'headphones',
              accessoryType: 'cyber_visor',
              name: 'Turbo Bike • 220 💎',
              cohort: 'ERASHOP',
              gender: 'boy',
              clothingType: 'cyber_jacket',
              beltType: 'cyber_belt',
              vehicleType: 'bike'
            });
            bikeShowcase.root.position.y = 0.56;
            bikeShowcase.root.rotation.y = 0.45;
            pGroup.add(bikeShowcase.root);
          } else {
            const skateShowcase = buildCharacterAvatar({
              shirtColor: '#ec4899',
              hairColor: '#facc15',
              skinColor: '#fef08a',
              hatType: 'halo',
              accessoryType: 'wings',
              name: 'Skateboard • 120 💎',
              cohort: 'ERASHOP',
              gender: 'girl',
              hairStyle: 'long',
              clothingType: 'skirt_outfit',
              beltType: 'gold_belt',
              vehicleType: 'skateboard'
            });
            skateShowcase.root.position.y = 0.56;
            skateShowcase.root.rotation.y = -0.45;
            pGroup.add(skateShowcase.root);
          }
          interiorGroup.add(pGroup);
        };

        createShopPedestal(-6.8, 0.5, 'bike');
        createShopPedestal(6.8, 0.5, 'skateboard');

        // Additional Showroom Vehicles on Floor: Gold Cruiser Bike & Pro Scooter
        const createExtraVehiclePedestal = (px: number, pz: number, vKind: 'gold_bike' | 'scooter', label: string, price: string) => {
          const vGroup = new THREE.Group();
          vGroup.position.set(px, 0, pz);
          const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.9, 2.1, 0.45, 24),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.6 })
          );
          base.position.y = 0.22;
          base.userData = { isCandyShop: true };
          clickableBoardMeshes.push(base);
          vGroup.add(base);

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.95, 0.07, 10, 28),
            new THREE.MeshBasicMaterial({ color: vKind === 'gold_bike' ? 0xfacc15 : 0x10b981 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.45;
          vGroup.add(ring);

          const rig = buildCharacterAvatar({
            shirtColor: vKind === 'gold_bike' ? '#f59e0b' : '#10b981',
            hairColor: '#0f172a',
            skinColor: '#fef08a',
            hatType: vKind === 'gold_bike' ? 'crown' : 'headphones',
            accessoryType: 'glasses',
            name: `${label} - ${price}`,
            cohort: 'ERASHOP',
            gender: 'boy',
            clothingType: 'cyber_jacket',
            beltType: 'gold_belt',
            vehicleType: vKind === 'gold_bike' ? 'bike' : 'skateboard'
          });
          rig.root.position.y = 0.45;
          rig.root.rotation.y = px > 0 ? -0.4 : 0.4;
          vGroup.add(rig.root);
          interiorGroup.add(vGroup);
        };
        createExtraVehiclePedestal(-7.2, 5.2, 'gold_bike', 'Gold Cruiser Bike', '150 💎');
        createExtraVehiclePedestal(7.2, 5.2, 'scooter', 'Pro Street Scooter', '95 💎');

        // ====================================================================
        // LEFT WALL: BOUTIQUE CLOTHES RACKS & SIGNATURE OUTFIT MANNEQUINS
        // ====================================================================
        const leftWallGroup = new THREE.Group();
        leftWallGroup.position.set(-roomW / 2 + 0.9, 0, 0);

        // Gold boutique clothing rack rail
        const rackMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85 });
        const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 12), rackMat);
        leftPost.position.set(0, 1.9, -4.5);
        const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 12), rackMat);
        rightPost.position.set(0, 1.9, 4.5);
        const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 9.2, 12), rackMat);
        topRail.rotation.x = Math.PI / 2;
        topRail.position.set(0, 3.65, 0);
        leftWallGroup.add(leftPost, rightPost, topRail);

        // Boutique wall signboard
        const boutiqueSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.9, 7.8),
          new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.3 })
        );
        boutiqueSign.position.set(0.1, 5.8, 0);
        leftWallGroup.add(boutiqueSign);

        // Mannequins showcasing signature clothes
        const outfitsShowcase = [
          { z: -2.8, name: 'Floral Mandarin Top (Ref #3)', shirt: '#38bdf8', hair: '#1c1917', bottom: '#ffffff', hat: 'halo' },
          { z: 0.0, name: 'Academy Sailor Blouse', shirt: '#ffffff', hair: '#7c2d12', bottom: '#1e3a8a', hat: 'crown' },
          { z: 2.8, name: 'Prep Crest Blazer', shirt: '#1e293b', hair: '#0f172a', bottom: '#e2e8f0', hat: 'headphones' }
        ];

        outfitsShowcase.forEach((outfit) => {
          const mPlatform = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 1.0, 0.25, 20),
            new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.4 })
          );
          mPlatform.position.set(0.2, 0.125, outfit.z);
          mPlatform.userData = { isCandyShop: true };
          clickableBoardMeshes.push(mPlatform);
          leftWallGroup.add(mPlatform);

          const mannequin = buildCharacterAvatar({
            shirtColor: outfit.shirt,
            hairColor: outfit.hair,
            skinColor: '#ffe4e6',
            hatType: outfit.hat as any,
            accessoryType: 'glasses',
            name: outfit.name,
            cohort: 'OUTFITS',
            gender: 'girl',
            clothingType: outfit.shirt === '#38bdf8' ? 'tshirt' : 'skirt_outfit',
            beltType: 'star_belt'
          });
          mannequin.root.position.set(0.2, 0.25, outfit.z);
          mannequin.root.rotation.y = Math.PI / 2;
          leftWallGroup.add(mannequin.root);
        });

        // Full-Length Boutique Mirror with glowing rose frame
        const mirrorFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 4.5, 2.2),
          new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.25, metalness: 0.5 })
        );
        mirrorFrame.position.set(0.08, 2.35, -5.8);
        const mirrorGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(2.0, 4.2),
          new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.05, metalness: 0.95 })
        );
        mirrorGlass.rotation.y = Math.PI / 2;
        mirrorGlass.position.set(0.15, 2.35, -5.8);
        leftWallGroup.add(mirrorFrame, mirrorGlass);
        interiorGroup.add(leftWallGroup);

        // ====================================================================
        // RIGHT WALL: HEADGEAR, CROWNS, PROPS & ACCESSORIES DISPLAY SHELVES
        // ====================================================================
        const rightWallGroup = new THREE.Group();
        rightWallGroup.position.set(roomW / 2 - 0.9, 0, 0);

        // 3 Glowing Glass Wall Shelves
        const shelfHeights = [1.8, 3.2, 4.6];
        const shelfLabels = ['Waist Belts & Gear', 'Eyewear & Visors', 'Royal Crowns & Headgear'];
        shelfHeights.forEach((shY, sIdx) => {
          const shelfGlass = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 0.08, 8.5),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 })
          );
          shelfGlass.position.set(-0.2, shY, 0);
          rightWallGroup.add(shelfGlass);

          // Gold wall brackets supporting shelf
          [-3.5, 0, 3.5].forEach((bz) => {
            const bracket = new THREE.Mesh(
              new THREE.BoxGeometry(0.85, 0.35, 0.06),
              new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.7 })
            );
            bracket.position.set(-0.2, shY - 0.18, bz);
            rightWallGroup.add(bracket);
          });
        });

        // 3D Headgear & Props showcased on velvet display blocks
        const showcaseItems = [
          { z: -2.8, y: 4.8, col: 0xfacc15, name: 'Champion Crown', geom: new THREE.CylinderGeometry(0.35, 0.45, 0.4, 6) },
          { z: 0.0, y: 4.8, col: 0xfffbeb, name: 'Angel Halo', geom: new THREE.TorusGeometry(0.4, 0.06, 12, 24) },
          { z: 2.8, y: 4.8, col: 0x06b6d4, name: 'Cat Headphones', geom: new THREE.BoxGeometry(0.65, 0.5, 0.45) },
          { z: -2.0, y: 3.4, col: 0x22d3ee, name: 'Cyber Visor', geom: new THREE.BoxGeometry(0.7, 0.22, 0.3) },
          { z: 1.5, y: 3.4, col: 0xf59e0b, name: 'Aviator Shades', geom: new THREE.BoxGeometry(0.6, 0.18, 0.25) },
          { z: -1.5, y: 2.0, col: 0xfacc15, name: 'Gold Championship Belt', geom: new THREE.TorusGeometry(0.5, 0.12, 10, 20) },
          { z: 1.5, y: 2.0, col: 0x38bdf8, name: 'Sport Cyber Belt', geom: new THREE.TorusGeometry(0.48, 0.1, 10, 20) }
        ];

        showcaseItems.forEach((it) => {
          const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.36, 0.15, 16),
            new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 })
          );
          ped.position.set(-0.25, it.y - 0.075, it.z);
          ped.userData = { isCandyShop: true };
          clickableBoardMeshes.push(ped);
          rightWallGroup.add(ped);

          const itemMesh = new THREE.Mesh(
            it.geom,
            new THREE.MeshStandardMaterial({ color: it.col, roughness: 0.2, metalness: 0.85 })
          );
          itemMesh.position.set(-0.25, it.y + 0.15, it.z);
          if (it.name.includes('Halo') || it.name.includes('Belt')) {
            itemMesh.rotation.x = Math.PI / 2;
          }
          itemMesh.userData = { isCandyShop: true };
          clickableBoardMeshes.push(itemMesh);
          rightWallGroup.add(itemMesh);
        });

        // Boutique wall signboard for gear
        const gearSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.9, 7.8),
          new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 })
        );
        gearSign.position.set(-0.1, 5.8, 0);
        rightWallGroup.add(gearSign);

        interiorGroup.add(rightWallGroup);
      } else if (building.id === 'listening') {
        // Era Gallery: Add a central 3D Exhibition Sculpture & Photo Display Stand
        const galleryStand = new THREE.Group();
        galleryStand.position.set(0, 0, -1.2);
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(5.6, 1.1, 2.4),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 })
        );
        plinth.position.y = 0.55;
        galleryStand.add(plinth);

        const crystalArt = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.25, 0),
          new THREE.MeshStandardMaterial({
            color: 0x14b8a6,
            emissive: 0x0d9488,
            emissiveIntensity: 0.45,
            roughness: 0.15,
            metalness: 0.85
          })
        );
        crystalArt.position.y = 2.45;
        galleryStand.add(crystalArt);
        interiorGroup.add(galleryStand);
      } else if (building.id === 'speaking') {
        // EraGames Arcade Arena: Add 3D Neon Arcade Cabinets inside the room
        [
          [-6.5, -2.2, 0x9333ea],
          [6.5, -2.2, 0xec4899]
        ].forEach(([ax, az, hex]) => {
          const cab = new THREE.Group();
          cab.position.set(ax, 0, az);
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 3.4, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 })
          );
          body.position.y = 1.7;
          cab.add(body);
          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.45, 1.15),
            new THREE.MeshBasicMaterial({ color: hex })
          );
          screen.position.set(0, 2.25, 0.77);
          cab.add(screen);
          interiorGroup.add(cab);
        });
      }
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

    let lastDetectedSportsZone: 'football' | 'tennis' | 'pickleball' | null = null;
    let keeperGoalCooldown = 0;
    let tennisScoreCooldown = 0;

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

      // Snap camera instantly to interior room to prevent any camera lerp through exterior mountains
      const initHoriz = camState.distance * Math.cos(camState.pitch);
      const initVert = camState.distance * Math.sin(camState.pitch);
      camera.position.set(
        playerState.x + Math.sin(camState.yaw) * initHoriz,
        playerState.y + 1.8 + initVert,
        playerState.z + Math.cos(camState.yaw) * initHoriz
      );
      camera.lookAt(playerState.x, playerState.y + 1.8, playerState.z);
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

      // Snap camera instantly back to exterior door position
      const exitHoriz = camState.distance * Math.cos(camState.pitch);
      const exitVert = camState.distance * Math.sin(camState.pitch);
      camera.position.set(
        playerState.x + Math.sin(camState.yaw) * exitHoriz,
        playerState.y + 1.8 + exitVert,
        playerState.z + Math.cos(camState.yaw) * exitHoriz
      );
      camera.lookAt(playerState.x, playerState.y + 1.8, playerState.z);

      showToast('Back on EraVerse Campus', 'Visit the Football Field & Era Tennis Court in the Sports Park!', '#2563EB');
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
          renderer.toneMappingExposure = 0.96;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.003);
        } else if (q === 'medium') {
          renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
          renderer.shadowMap.enabled = !isSoftwareGl;
          renderer.toneMappingExposure = 0.94;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0042);
        } else {
          renderer.setPixelRatio(1);
          renderer.shadowMap.enabled = false;
          renderer.toneMappingExposure = 0.92;
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
        soundEngine.playTennisHit(true);
        if (!activeInteriorBuilding) {
          const distTennis = Math.hypot(playerState.x - pickleBallState.x, playerState.z - pickleBallState.z);
          if (distTennis < 6.8) {
            pickleBallState.vz = -Math.abs(pickleBallState.vz) * 1.15 - 2.5;
            pickleBallState.vx = (Math.random() - 0.5) * 7.5;
            pickleBallState.phase = 0.35;
            setPickleballScore((s) => s + 1);
            setXp((x) => x + 30);
            showToast('Tennis Ace Return! 🎾 +30 XP', 'Crushed the forehand winner past the net!', '#10B981');
            tennisScoreCooldown = 1.0;
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
        // Refresh the Holographic Projected Class Leaderboard Screen above the Central Fountain
        const updatedHoloTex = createClassDashboardWallTexture(
          dashboardDataRef.current.classCohortLabel,
          dashboardDataRef.current.classStudents,
          dashboardDataRef.current.myStats.name,
          maxAnisotropy
        );
        holoScreenMat.map = updatedHoloTex;
        holoScreenMat.needsUpdate = true;

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
          // Check if standing near the Central Fountain Holographic Class Leaderboard
          const distToFountain = Math.hypot(playerState.x, playerState.z);
          if (distToFountain < 10.5) {
            soundEngine.playUiClick();
            setDashboardHallModal('class_dashboard');
            return;
          }
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
            } else if (hitData.isCandyShop) {
              handleBoardActionRef.current({
                slot: 'back-center',
                category: "CANDY'S BOUTIQUE COUNTER",
                title: 'EraSHOP Store & Gear',
                subtitle: 'Buy Vehicles, Belts, Outfits & Customize Character',
                badge: 'OPEN ERASHOP',
                accentHex: '#DB2777',
                bgLightHex: '#FCE7F3',
                actionType: 'open_erashop',
                shopCategory: 'all'
              });
            } else if (hitData.boardSpec) {
              handleBoardActionRef.current(hitData.boardSpec);
            }
          }
        } else {
          const bHits = raycaster.intersectObjects(clickableBuildingMeshes, false);
          if (bHits.length > 0) {
            const hitUserData = bHits[0].object.userData;
            if (hitUserData?.isFountainLeaderboard) {
              soundEngine.playUiClick();
              setDashboardHallModal('class_dashboard');
              return;
            }
            const bId = hitUserData?.buildingId;
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

    let lastHoloSignature = '';

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Guarantee Holographic Fountain Leaderboard texture always reflects latest Firestore scores & active cohort
      const currentHoloSig = `${dashboardDataRef.current.classCohortLabel}:${dashboardDataRef.current.myStats.name}:${dashboardDataRef.current.classStudents.map((s) => `${s.id}-${s.overall}-${s.reading}-${s.listening}-${s.writing}-${s.speaking}`).join('|')}`;
      if (currentHoloSig !== lastHoloSignature) {
        lastHoloSignature = currentHoloSig;
        const freshTex = createClassDashboardWallTexture(
          dashboardDataRef.current.classCohortLabel,
          dashboardDataRef.current.classStudents,
          dashboardDataRef.current.myStats.name,
          maxAnisotropy
        );
        if (holoScreenMat.map) {
          holoScreenMat.map.dispose();
        }
        holoScreenMat.map = freshTex;
        holoScreenMat.needsUpdate = true;
      }

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

      // Animate Holographic Projected Class Leaderboard Screen above Central Fountain
      holoScreenGroup.position.y = 7.8 + Math.sin(elapsed * 2.0) * 0.16;
      holoBeamCone.material.opacity = 0.14 + Math.sin(elapsed * 3.5) * 0.05;

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
      const vehicleBoost =
        playerVehicleRef.current === 'bike'
          ? 1.55
          : playerVehicleRef.current === 'skateboard'
          ? 1.35
          : 1.0;
      const baseSpeed = (playerState.isCrouching ? 5.6 : playerState.sprinting ? 15.2 : 10.2) * vehicleBoost;

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

      // Detect whether player is in Football Field or Era Tennis Court
      if (!activeInteriorBuilding) {
        const inFootball =
          Math.abs(playerState.x - PITCH_CENTER.x) < PITCH_W / 2 + 5 &&
          Math.abs(playerState.z - PITCH_CENTER.z) < PITCH_L / 2 + 5;
        const inTennis =
          Math.abs(playerState.x - TENNIS_CENTER.x) < TENNIS_PLANE_W / 2 + 4.0 &&
          Math.abs(playerState.z - TENNIS_CENTER.z) < TENNIS_PLANE_L / 2 + 4.0;
        const nextZone: 'football' | 'tennis' | null = inFootball
          ? 'football'
          : inTennis
          ? 'tennis'
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
        const northGoalZ = PITCH_CENTER.z - PITCH_HALF_L + 1.35;
        const keeperTargetX = THREE.MathUtils.clamp(
          soccerBallState.x,
          PITCH_CENTER.x - (GOAL_WIDTH / 2 - 0.4),
          PITCH_CENTER.x + (GOAL_WIDTH / 2 - 0.4)
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

        if (soccerBallState.y <= SOCCER_BALL_RADIUS) {
          soccerBallState.y = SOCCER_BALL_RADIUS;
          if (Math.abs(soccerBallState.vy) > 1.5) {
            soccerBallState.vy = -soccerBallState.vy * 0.55;
          } else {
            soccerBallState.vy = 0;
          }
        }

        // Turf rolling friction
        soccerBallState.vx *= Math.pow(0.22, dt);
        soccerBallState.vz *= Math.pow(0.22, dt);

        // Keep ball near pitch bounds & check for GOAL!
        const minPitchX = PITCH_CENTER.x - PITCH_HALF_W;
        const maxPitchX = PITCH_CENTER.x + PITCH_HALF_W;
        const minPitchZ = PITCH_CENTER.z - PITCH_HALF_L;
        const maxPitchZ = PITCH_CENTER.z + PITCH_HALF_L;

        if (soccerBallState.x < minPitchX) {
          soccerBallState.x = minPitchX;
          soccerBallState.vx = Math.abs(soccerBallState.vx) * 0.7;
        }
        if (soccerBallState.x > maxPitchX) {
          soccerBallState.x = maxPitchX;
          soccerBallState.vx = -Math.abs(soccerBallState.vx) * 0.7;
        }

        // Check Goal Scored (Within goalposts at North/South ends)
        if (Math.abs(soccerBallState.x - PITCH_CENTER.x) < GOAL_WIDTH / 2 && keeperGoalCooldown <= 0) {
          if (soccerBallState.z < minPitchZ + 1.2) {
            // Player scored in North Goal past Keeper Max!
            keeperGoalCooldown = 1.8;
            soundEngine.playGoalCheer();
            setFootballGoals((g) => g + 1);
            setXp((x) => x + 100);
            if (footballGoalNets[0]) {
              footballGoalNets[0].userData.rippleIntensity = 1.0;
            }
            if (isSuperAdminTeacherJan) {
              setEraGems((gm) => {
                const next = gm + 25;
                try {
                  localStorage.setItem('eraverse_gems_v2', String(next));
                } catch (_e) {}
                return next;
              });
              setEraDollars((dl) => {
                const next = dl + 40;
                try {
                  localStorage.setItem('eraverse_dollars_v2', String(next));
                } catch (_e) {}
                return next;
              });
            } else {
              setEraGems(0);
              setEraDollars(0);
            }
            showToast('GOOOOAL! ⚽ +25 💎 Gems & +$40 💵!', 'You beat Keeper Max in Era Football Club!', '#16A34A');
            soccerBallState.x = PITCH_CENTER.x;
            soccerBallState.y = 2.0;
            soccerBallState.z = PITCH_CENTER.z;
            soccerBallState.vx = 0;
            soccerBallState.vy = 0;
            soccerBallState.vz = 0;
          } else if (soccerBallState.z > maxPitchZ - 1.2) {
            // South goal scored!
            keeperGoalCooldown = 1.8;
            soundEngine.playGoalCheer();
            if (footballGoalNets[1]) {
              footballGoalNets[1].userData.rippleIntensity = 1.0;
            }
            if (playerState.z > PITCH_CENTER.z) {
              setFootballGoals((g) => g + 1);
              setXp((x) => x + 100);
              if (isSuperAdminTeacherJan) {
                setEraGems((gm) => {
                  const next = gm + 25;
                  try {
                    localStorage.setItem('eraverse_gems_v2', String(next));
                  } catch (_e) {}
                  return next;
                });
                setEraDollars((dl) => {
                  const next = dl + 40;
                  try {
                    localStorage.setItem('eraverse_dollars_v2', String(next));
                  } catch (_e) {}
                  return next;
                });
              } else {
                setEraGems(0);
                setEraDollars(0);
              }
              showToast('GOOOOAL! ⚽ +25 💎 Gems & +$40 💵!', 'Awesome shot into the South Goal!', '#16A34A');
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

        // Animate Corner Flags fluttering in the breeze
        footballCornerFlags.forEach((cloth, idx) => {
          cloth.rotation.y = Math.sin(elapsed * 6 + idx) * 0.28;
        });

        // Dynamic Goal Net ripple waves
        footballGoalNets.forEach((net) => {
          const ud = net.userData;
          if (!ud || ud.rippleIntensity <= 0.01) return;
          ud.rippleIntensity = Math.max(0, ud.rippleIntensity - dt * 1.2);
          const posAttr = net.geometry.attributes.position;
          const baseAttr = ud.basePos;
          for (let i = 0; i < posAttr.count; i++) {
            const bx = baseAttr.getX(i);
            const by = baseAttr.getY(i);
            const isEdge = Math.abs(bx) > (GOAL_WIDTH / 2 - 0.1) || Math.abs(by) > (GOAL_HEIGHT / 2 - 0.1);
            if (isEdge) {
              posAttr.setZ(i, 0);
            } else {
              const wave = Math.sin(elapsed * 24 - Math.hypot(bx, by) * 3.0) * 0.45 * ud.rippleIntensity;
              const bulge = ud.zSign * 0.65 * ud.rippleIntensity;
              posAttr.setZ(i, bulge + wave);
            }
          }
          posAttr.needsUpdate = true;
        });

        // 3D Spectators cheering & ball-tracking
        for (let i = 0; i < stadiumSpectators.length; i++) {
          const s = stadiumSpectators[i];
          if (keeperGoalCooldown > 0) {
            s.position.y = s.userData.baseY + Math.abs(Math.sin(elapsed * 12 + s.userData.phase)) * 0.32;
          } else {
            s.position.y = s.userData.baseY;
          }
          const lookZ = (soccerBallState.z - s.position.z) * 0.02;
          s.userData.headPivot.rotation.y = THREE.MathUtils.clamp(lookZ, -0.45, 0.45);
        }

        // 2. Era Tennis Court Match & Rally Simulation
        if (tennisScoreCooldown > 0) {
          tennisScoreCooldown -= dt;
        }

        pickleBallState.x += pickleBallState.vx * dt;
        pickleBallState.z += pickleBallState.vz * dt;
        pickleBallState.phase += dt * 6.2;
        pickleBallState.y = 1.05 + Math.abs(Math.sin(pickleBallState.phase)) * 1.55;

        // Clamp tennis ball X within court boundary
        const maxCourtX = TENNIS_DOUBLES_W / 2 - 0.3;
        if (pickleBallState.x < TENNIS_CENTER.x - maxCourtX) {
          pickleBallState.x = TENNIS_CENTER.x - maxCourtX;
          pickleBallState.vx = Math.abs(pickleBallState.vx);
        }
        if (pickleBallState.x > TENNIS_CENTER.x + maxCourtX) {
          pickleBallState.x = TENNIS_CENTER.x + maxCourtX;
          pickleBallState.vx = -Math.abs(pickleBallState.vx);
        }

        // Coach Leo (Tennis Pro) returns ball from North baseline
        if (pickleBallState.z < TENNIS_CENTER.z - 9.0 && pickleBallState.vz < 0) {
          pickleBallState.vz = 10.0 + Math.random() * 2.0;
          pickleBallState.vx = (Math.random() - 0.5) * 5.4;
          pickleOpponentRig.rightArm.rotation.x = -1.75;
          if (Math.hypot(playerState.x - TENNIS_CENTER.x, playerState.z - TENNIS_CENTER.z) < 22) {
            soundEngine.playTennisHit(false);
          }
        } else {
          pickleOpponentRig.rightArm.rotation.x *= 0.85;
        }

        // South baseline return (if player is near or presses SWING (G), player returns and scores; if player is on court and misses, Coach Leo scores)
        if (pickleBallState.z > TENNIS_CENTER.z + 9.0 && pickleBallState.vz > 0) {
          pickleBallState.vz = -10.2 - Math.random() * 2.0;
          pickleBallState.vx = (Math.random() - 0.5) * 5.4;
          const playerDistToBall = Math.hypot(
            playerState.x - pickleBallState.x,
            playerState.z - pickleBallState.z
          );
          if (playerDistToBall < 5.4 || playerState.hitTimer > 0) {
            soundEngine.playTennisHit(playerState.hitTimer > 0);
            playerState.hitTimer = 0.4;
            setPickleballScore((s) => s + 1);
            setXp((x) => x + 25);
            showToast('Tennis Forehand Winner! 🎾 +25 XP', 'Crisp shot over the net!', '#10B981');
            tennisScoreCooldown = 1.0;
          } else if (lastDetectedSportsZone === 'tennis') {
            setAiPickleballScore((s) => s + 1);
            showToast('Coach Leo Point! 🎾', 'Move closer or press SWING (G) to return!', '#F59E0B');
          }
        }

        pickleBallMesh.position.set(pickleBallState.x, pickleBallState.y, pickleBallState.z);
        pickleOpponentRig.root.position.x = THREE.MathUtils.damp(
          pickleOpponentRig.root.position.x,
          pickleBallState.x,
          6,
          dt
        );

        // Animate Grandstand Spectators cheering & tracking the tennis ball
        for (let i = 0; i < tennisSpectators.length; i++) {
          const spec = tennisSpectators[i];
          if (tennisScoreCooldown > 0) {
            spec.position.y = spec.userData.baseY + Math.abs(Math.sin(elapsed * 12 + spec.userData.phase)) * 0.28;
          } else {
            spec.position.y = spec.userData.baseY;
          }
          if (spec.userData.headPivot) {
            const ballRelZ = (pickleBallState.z - spec.position.z) * 0.035;
            spec.userData.headPivot.rotation.y = THREE.MathUtils.clamp(ballRelZ, -0.5, 0.5);
          }
        }
      }

      // Dynamic Pop-Up Era Gems (💎) & Era Dollars (💵) Collection & Respawn Loop
      if (!activeInteriorBuilding) {
        crystalObjs.forEach((co, idx) => {
          if (co.collected) {
            co.respawnTimer -= dt;
            if (co.respawnTimer <= 0) {
              co.collected = false;
              co.popScale = 0.05;
              co.group.visible = true;
              // Slightly randomize position around its spawn zone so pop-ups feel dynamic
              const baseLoc = spawnLocations[idx % spawnLocations.length];
              co.group.position.x = baseLoc.x + (Math.random() - 0.5) * 6;
              co.group.position.z = baseLoc.z + (Math.random() - 0.5) * 6;
            }
            return;
          }

          co.popScale = THREE.MathUtils.damp(co.popScale, 1.0, 9, dt);
          co.group.scale.setScalar(co.popScale);
          co.mesh.rotation.y = elapsed * 2.2;
          co.ring.scale.setScalar(0.9 + Math.sin(elapsed * 4 + idx) * 0.12);
          co.group.position.y = co.baseY + Math.sin(elapsed * 3.2 + idx) * 0.22;

          const dist = Math.hypot(
            playerState.x - co.group.position.x,
            playerState.z - co.group.position.z
          );
          if (dist < 2.35) {
            co.collected = true;
            co.group.visible = false;
            co.respawnTimer = 6.5 + Math.random() * 5.5;
            soundEngine.playCrystalCollect();
            setCrystalsCollected((c) => c + 1);
            setXp((x) => x + 30);

            if (co.kind === 'gem') {
              if (isSuperAdminTeacherJan) {
                setEraGems((gm) => {
                  const next = gm + co.amount;
                  try {
                    localStorage.setItem('eraverse_gems_v2', String(next));
                  } catch (_e) {}
                  return next;
                });
              } else {
                setEraGems(0);
              }
              showToast(`💎 +${co.amount} Era Gems Collected!`, 'Walk around campus to collect more popping Era Gems!', '#EC4899');
            } else {
              if (isSuperAdminTeacherJan) {
                setEraDollars((dl) => {
                  const next = dl + co.amount;
                  try {
                    localStorage.setItem('eraverse_dollars_v2', String(next));
                  } catch (_e) {}
                  return next;
                });
              } else {
                setEraDollars(0);
              }
              showToast(`💵 +$${co.amount} Era Dollars Collected!`, 'Spend your Era Dollars & Era Gems in EraSHOP!', '#10B981');
            }
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
        if (!nearBoard && activeInteriorBuilding.id === 'reading') {
          const distToCandy = Math.hypot(
            playerState.x - INTERIOR_ORIGIN.x,
            playerState.z - (INTERIOR_ORIGIN.z - 6.2)
          );
          if (distToCandy < 5.0) {
            nearBoard = {
              slot: 'back-center',
              category: "CANDY'S BOUTIQUE COUNTER",
              title: 'EraSHOP Store & Gear',
              subtitle: 'Buy Vehicles, Belts, Outfits & Customize Character',
              badge: 'OPEN ERASHOP',
              accentHex: '#DB2777',
              bgLightHex: '#FCE7F3',
              actionType: 'open_erashop',
              shopCategory: 'all'
            };
          }
        }
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
            const safeDist = Math.max(1.0, hits[0].distance - 0.35);
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

    setPlayerProfile((prev) => ({
      ...prev,
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
      accessoryType: char.accessoryType,
      gender: char.gender || prev.gender || 'boy',
      hairStyle: char.hairStyle || prev.hairStyle || 'classic',
      bodyType: char.bodyType || prev.bodyType || 'regular',
      clothingType: char.clothingType || prev.clothingType || 'varsity',
      pantsColor: char.pantsColor || prev.pantsColor || '#1e293b',
      beltType: char.beltType || prev.beltType || 'none',
      vehicleType: char.vehicleType || prev.vehicleType || 'none'
    }));
    setShowCharactersModal(false);
    showToast(`Now Playing as ${char.name} (${char.cohort})`, char.motto, char.cohort === 'IELTS 2' ? '#10B981' : '#2563EB');
  };

  const filteredCharacters = useMemo(() => {
    // Non-admin students in IELTS 1 or IELTS 2 only see their own group's characters
    if (!isAdmin && (playerProfile.cohort === 'IELTS 1' || playerProfile.cohort === 'IELTS 2')) {
      return ieltsCharacters.filter((c) => c.cohort === playerProfile.cohort);
    }
    if (cohortFilter === 'ALL') return ieltsCharacters;
    return ieltsCharacters.filter((c) => c.cohort === cohortFilter);
  }, [ieltsCharacters, cohortFilter, isAdmin, playerProfile.cohort]);

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
    <div
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[calc(100vh-80px)]'
      } overflow-hidden bg-slate-950 select-none`}
    >
      {/* 1. ISOLATED THREE.JS WEBGL CANVAS */}
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* 2. TOP-LEFT ERA WALLET (ONLY ERA GEMS & ERA DOLLAR) + SUPERADMIN CHARACTERS & SHOP-ONLY ERASHOP ICON */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-white shadow-2xl">
          {/* Era Gems Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-500/15 border border-pink-400/35">
            <span className="text-base">💎</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-pink-300 leading-none">
                Era Gems
              </span>
              <span className="text-sm font-black text-white leading-tight">{(isSuperAdminTeacherJan ? eraGems : 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Era Dollar Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35">
            <span className="text-base">💵</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 leading-none">
                Era Dollar
              </span>
              <span className="text-sm font-black text-white leading-tight">${(isSuperAdminTeacherJan ? eraDollars : 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Characters & Teachers button: ONLY visible to SuperAdmin */}
        {isAdmin && (
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
        )}

        {/* EraSHOP icon: ONLY appears when the player enters the EraSHOP building */}
        {insideBuilding?.id === 'reading' && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              setEraShopInitialTab('shop');
              setEraShopInitialCat('all');
              setActiveBuildingModal('reading');
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg border border-pink-400/40 transition-all cursor-pointer animate-bounce"
          >
            <ShoppingBag className="w-4 h-4 text-amber-200" />
            <span>EraSHOP (💎 {isSuperAdminTeacherJan ? eraGems : 0} • 💵 ${isSuperAdminTeacherJan ? eraDollars : 0})</span>
          </button>
        )}

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

      {/* 3. TOP-RIGHT FULLSCREEN & SETTINGS (AUDIO ICON MOVED INSIDE SETTINGS) */}
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

        {/* Full Screen App Toggle Button */}
        <button
          type="button"
          onClick={toggleAppFullscreen}
          className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-3 rounded-2xl shadow-xl border border-white/15 transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Mode'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-emerald-400" />
          ) : (
            <Maximize className="w-4 h-4 text-sky-400" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'Full Screen' : 'Expand'}</span>
        </button>

        {/* Top-Right Settings Button (Contains Audio & Music Controls) */}
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

      {/* Top pop-up banners removed for a clean, unobstructed 3D viewport */}

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
                {(isAdmin
                  ? (['ALL', 'IELTS 1', 'IELTS 2', 'TEACHER (SUPER ADMIN)'] as const)
                  : ([playerProfile.cohort === 'IELTS 2' ? 'IELTS 2' : 'IELTS 1'] as const)
                ).map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    onClick={() => {
                      soundEngine.playUiClick();
                      setCohortFilter(cohort);
                    }}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer border ${
                      cohortFilter === cohort || !isAdmin
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
                  : `Logged in as ${playerProfile.name} (${playerProfile.cohort}) — bound to your personal character & ${playerProfile.cohort} group`}
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
          MODAL 4A: ERASHOP BOUTIQUE & CHARACTER CUSTOMIZER (WITH CANDY, ERA GEMS & ERA DOLLARS)
          ============================================================================ */}
      {(showCustomizerModal || activeBuildingModal === 'reading') && (
        <EraShopModal
          isOpen={showCustomizerModal || activeBuildingModal === 'reading'}
          onClose={() => {
            setShowCustomizerModal(false);
            if (activeBuildingModal === 'reading') setActiveBuildingModal(null);
          }}
          initialTab={showCustomizerModal ? 'customizer' : eraShopInitialTab}
          initialCategory={eraShopInitialCat}
          eraGems={isSuperAdminTeacherJan ? eraGems : 0}
          eraDollars={isSuperAdminTeacherJan ? eraDollars : 0}
          ownedItems={ownedShopItems}
          isAdmin={isAdmin}
          playerProfile={playerProfile}
          onUpdateProfile={(updated) => {
            const nextProfile = { ...playerProfile, ...updated };
            setPlayerProfile(nextProfile);
            persistAvatarCustomization(nextProfile, eraGems, ownedShopItems, eraDollars);
          }}
          onBuyItem={(item: EraShopItem, currency: 'gems' | 'dollars' = 'gems') => {
            let nextGems = eraGems;
            let nextDollars = eraDollars;
            if (currency === 'dollars') {
              if (eraDollars < item.price) {
                showToast(
                  'Not Enough Era Dollars! 💵',
                  `You need $${item.price - eraDollars} more 💵 Era Dollars! Collect popping dollars on campus or play EraGames!`,
                  '#10B981'
                );
                return;
              }
              nextDollars = eraDollars - item.price;
              setEraDollars(nextDollars);
            } else {
              if (eraGems < item.price) {
                showToast(
                  'Not Enough Era Gems! 💎',
                  `You need ${item.price - eraGems} more 💎 Era Gems! Collect popping Era Gems on campus or play EraGames!`,
                  '#EC4899'
                );
                return;
              }
              nextGems = eraGems - item.price;
              setEraGems(nextGems);
            }
            const nextOwned = ownedShopItems.includes(item.id) ? ownedShopItems : [...ownedShopItems, item.id];
            setOwnedShopItems(nextOwned);
            soundEngine.playCrystalCollect();
            const nextProfile = {
              ...playerProfile,
              [item.applyKey]: item.applyValue,
              ...(item.extraUpdates || {}),
              ...(item.shirtColorOverride ? { shirtColor: item.shirtColorOverride } : {}),
              ...(item.pantsColorOverride ? { pantsColor: item.pantsColorOverride } : {})
            };
            setPlayerProfile(nextProfile);
            persistAvatarCustomization(nextProfile, nextGems, nextOwned, nextDollars);
            showToast(
              `Purchased & Equipped ${item.name}!`,
              `Candy: "Looks awesome on you, ${playerProfile.name}! Synced to your Student Dashboard!"`,
              '#EC4899'
            );
          }}
          onEquipItem={(item: EraShopItem) => {
            soundEngine.playUiClick();
            const isCurrentlyEquipped = (playerProfile as any)[item.applyKey] === item.applyValue;
            const nextVal = isCurrentlyEquipped
              ? item.applyKey === 'clothingType'
                ? 'varsity'
                : 'none'
              : item.applyValue;
            const nextProfile = {
              ...playerProfile,
              [item.applyKey]: nextVal,
              ...(!isCurrentlyEquipped && item.extraUpdates ? item.extraUpdates : {}),
              ...(!isCurrentlyEquipped && item.shirtColorOverride ? { shirtColor: item.shirtColorOverride } : {}),
              ...(!isCurrentlyEquipped && item.pantsColorOverride ? { pantsColor: item.pantsColorOverride } : {})
            };
            setPlayerProfile(nextProfile);
            persistAvatarCustomization(nextProfile, eraGems, ownedShopItems, eraDollars);
            showToast(
              isCurrentlyEquipped ? `Unequipped ${item.name}` : `Equipped ${item.name}!`,
              `Candy: "Updated your 3D character in EraVerse & your Student Dashboard!"`,
              '#EC4899'
            );
          }}
          onRewardGems={(gemsWon, dollarsWon, reason) => {
            soundEngine.playGoalCheer();
            const nextGems = isSuperAdminTeacherJan ? eraGems + gemsWon : 0;
            const nextDollars = isSuperAdminTeacherJan ? eraDollars + dollarsWon : 0;
            setEraGems(nextGems);
            setEraDollars(nextDollars);
            persistAvatarCustomization(playerProfile, nextGems, ownedShopItems, nextDollars);
            showToast(
              `+${gemsWon} 💎 Era Gems & +$${dollarsWon} 💵!`,
              reason,
              '#F59E0B'
            );
          }}
          onSaveAndSync={() => {
            soundEngine.playUiClick();
            persistAvatarCustomization(playerProfile, eraGems, ownedShopItems, eraDollars);
            setShowCustomizerModal(false);
            if (activeBuildingModal === 'reading') setActiveBuildingModal(null);
            showToast(
              '3D Character & EraSHOP Gear Saved!',
              `${playerProfile.name}'s 3D character is updated in EraVerse and your Student Dashboard!`,
              '#10B981'
            );
          }}
        />
      )}

      {/* ============================================================================
          MODAL 4B: ERA GALLERY (LIFE AT KY NGUYEN ERA PHOTOS & VIDEOS)
          ============================================================================ */}
      {activeBuildingModal === 'listening' && (
        <EraGalleryModal
          isOpen={activeBuildingModal === 'listening'}
          onClose={() => setActiveBuildingModal(null)}
          initialTab={eraGalleryInitialTab}
        />
      )}

      {/* ============================================================================
          MODAL 4C: ERAGAMES ARCADE ARENA (EARN ERA GEMS & ERA DOLLARS)
          ============================================================================ */}
      {activeBuildingModal === 'speaking' && (
        <EraGamesModal
          isOpen={activeBuildingModal === 'speaking'}
          onClose={() => setActiveBuildingModal(null)}
          eraGems={isSuperAdminTeacherJan ? eraGems : 0}
          eraDollars={isSuperAdminTeacherJan ? eraDollars : 0}
          onOpenEraShop={() => {
            soundEngine.playUiClick();
            setEraShopInitialTab('shop');
            setEraShopInitialCat('all');
            setActiveBuildingModal('reading');
          }}
          onRewardGems={(gemsWon, xpWon, dollarsWon, gameTitle) => {
            soundEngine.playGoalCheer();
            const nextGems = isSuperAdminTeacherJan ? eraGems + gemsWon : 0;
            const nextDollars = isSuperAdminTeacherJan ? eraDollars + dollarsWon : 0;
            setEraGems(nextGems);
            setEraDollars(nextDollars);
            setXp((x) => x + xpWon);
            persistAvatarCustomization(playerProfile, nextGems, ownedShopItems, nextDollars);
            showToast(
              `+${gemsWon} 💎 Era Gems & +$${dollarsWon} 💵!`,
              `${gameTitle} — Spend your rewards in EraSHOP with Candy!`,
              '#9333EA'
            );
          }}
        />
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
        onSelectAdminCohort={(c) => setAdminSelectedCohort(c)}
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
