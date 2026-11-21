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
import {
  EraFacultyWorkstationModal,
  AdminModuleId
} from '../components/EraFacultyWorkstationModal';
import {
  INITIAL_FACULTY_EMPLOYEES,
  FacultyEmployeeProfile
} from '../utils/eraFacultyData';
import {
  EraFishingClubModal,
  pickRandomCaughtFish,
  type FishSpeciesSpec
} from '../components/EraFishingClubModal';

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
  faculty_hq: {
    name: 'ERA Faculty Office Suite',
    tempoMs: 340,
    wave: 'triangle',
    notes: [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 523.25, 587.33, 698.46, 880.0, 1046.5, 880.0, 698.46, 587.33, 523.25],
    bassNotes: [261.63, 261.63, 220.0, 220.0, 174.61, 174.61, 196.0, 196.0]
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
  },
  class_starters: {
    name: 'Starters Sunny Classroom Melody',
    tempoMs: 340,
    wave: 'triangle',
    notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25, 523.25, 392.0],
    bassNotes: [261.63, 261.63, 196.0, 196.0, 220.0, 220.0, 174.61, 174.61]
  },
  class_movers: {
    name: 'Movers Interactive Study Rhythm',
    tempoMs: 330,
    wave: 'sine',
    notes: [587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 493.88, 587.33, 783.99, 880.0, 987.77, 880.0, 783.99, 659.25, 587.33],
    bassNotes: [293.66, 293.66, 220.0, 220.0, 246.94, 246.94, 196.0, 196.0]
  },
  class_flyers: {
    name: 'Flyers Skyward Classroom Chime',
    tempoMs: 320,
    wave: 'triangle',
    notes: [659.25, 783.99, 880.0, 1046.5, 880.0, 783.99, 659.25, 523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25],
    bassNotes: [261.63, 261.63, 220.0, 220.0, 174.61, 174.61, 196.0, 196.0]
  },
  class_ket: {
    name: 'Cambridge KET Classroom Focus',
    tempoMs: 350,
    wave: 'sine',
    notes: [440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 440.0, 392.0, 440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 440.0],
    bassNotes: [220.0, 220.0, 174.61, 174.61, 261.63, 261.63, 196.0, 196.0]
  },
  class_pet: {
    name: 'Cambridge PET Study Harmony',
    tempoMs: 350,
    wave: 'triangle',
    notes: [493.88, 587.33, 739.99, 880.0, 739.99, 587.33, 493.88, 440.0, 493.88, 587.33, 739.99, 987.77, 880.0, 739.99, 587.33, 493.88],
    bassNotes: [246.94, 246.94, 196.0, 196.0, 220.0, 220.0, 185.0, 185.0]
  },
  class_ielts: {
    name: 'IELTS Masterclass Academic Suite',
    tempoMs: 360,
    wave: 'sine',
    notes: [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25],
    bassNotes: [261.63, 261.63, 220.0, 220.0, 174.61, 174.61, 196.0, 196.0]
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
    | 'open_eragames'
    | 'open_faculty_hq';
  skillOrTab?: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  shopCategory?: 'all' | 'vehicles' | 'clothes' | 'belts' | 'accessories' | 'customizer';
  galleryTab?: 'all' | 'photos' | 'videos';
  route?: string;
  dashboardType?: 'personal' | 'class' | 'listening' | 'reading' | 'writing' | 'speaking';
  facultyModule?: AdminModuleId;
  facultyEmployeeId?: string;
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
  },
  // 6 Dedicated Cambridge & IELTS Classroom Buildings on the West Academic Quad
  {
    id: 'class_starters',
    name: 'Starters Classroom',
    shortSign: 'STARTERS CLASS',
    x: -68,
    z: -26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0x0284c7,
    trimColor: 0xe0f2fe,
    roofColor: 0x0c4a6e,
    accentColor: 0x38bdf8,
    hexAccent: '#0EA5E9',
    doorX: -68,
    doorZ: -19.5,
    frontDir: 1,
    interiorWallColor: 0xf0f9ff,
    interiorFloorColor: 0xdbeafe
  },
  {
    id: 'class_movers',
    name: 'Movers Classroom',
    shortSign: 'MOVERS CLASS',
    x: -92,
    z: -26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0xea580c,
    trimColor: 0xffedd5,
    roofColor: 0x7c2d12,
    accentColor: 0xf97316,
    hexAccent: '#F97316',
    doorX: -92,
    doorZ: -19.5,
    frontDir: 1,
    interiorWallColor: 0xfff7ed,
    interiorFloorColor: 0xfed7aa
  },
  {
    id: 'class_flyers',
    name: 'Flyers Classroom',
    shortSign: 'FLYERS CLASS',
    x: -116,
    z: -26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0x059669,
    trimColor: 0xd1fae5,
    roofColor: 0x064e3b,
    accentColor: 0x10b981,
    hexAccent: '#10B981',
    doorX: -116,
    doorZ: -19.5,
    frontDir: 1,
    interiorWallColor: 0xecfdf5,
    interiorFloorColor: 0xa7f3d0
  },
  {
    id: 'class_ket',
    name: 'KET Classroom',
    shortSign: 'KET CLASSROOM',
    x: -68,
    z: 26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0xe11d48,
    trimColor: 0xffe4e6,
    roofColor: 0x881337,
    accentColor: 0xf43f5e,
    hexAccent: '#E11D48',
    doorX: -68,
    doorZ: 19.5,
    frontDir: -1,
    interiorWallColor: 0xfff1f2,
    interiorFloorColor: 0xfecdd3
  },
  {
    id: 'class_pet',
    name: 'PET Classroom',
    shortSign: 'PET CLASSROOM',
    x: -92,
    z: 26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0x0d9488,
    trimColor: 0xccfbf1,
    roofColor: 0x134e4a,
    accentColor: 0x14b8a6,
    hexAccent: '#0D9488',
    doorX: -92,
    doorZ: 19.5,
    frontDir: -1,
    interiorWallColor: 0xf0fdfa,
    interiorFloorColor: 0x99f6e4
  },
  {
    id: 'class_ielts',
    name: 'IELTS Classroom',
    shortSign: 'IELTS CLASSROOM',
    x: -116,
    z: 26,
    w: 16,
    d: 13,
    h: 9.5,
    wallColor: 0x4f46e5,
    trimColor: 0xe0e7ff,
    roofColor: 0x312e81,
    accentColor: 0x6366f1,
    hexAccent: '#4F46E5',
    doorX: -116,
    doorZ: 19.5,
    frontDir: -1,
    interiorWallColor: 0xeef2ff,
    interiorFloorColor: 0xc7d2fe
  },
  {
    id: 'faculty_hq',
    name: 'ERA Faculty',
    shortSign: 'ERA FACULTY',
    x: -144,
    z: -26,
    w: 22,
    d: 15,
    h: 14.5,
    wallColor: 0x1e1b4b,
    trimColor: 0xfde68a,
    roofColor: 0xd97706,
    accentColor: 0xf59e0b,
    hexAccent: '#D97706',
    doorX: -144,
    doorZ: -18.5,
    frontDir: 1,
    interiorWallColor: 0xe5be73,
    interiorFloorColor: 0xc47926
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
  ],
  class_starters: [
    {
      slot: 'left-wall',
      category: 'CAMBRIDGE PRE-A1 STARTERS • LESSON',
      title: 'Starters Vocabulary & Phonics',
      subtitle: 'Animals, Colors, Numbers, Family & Everyday Words',
      badge: 'OPEN STARTERS COURSE',
      accentHex: '#0284C7',
      bgLightHex: '#E0F2FE',
      actionType: 'navigate',
      route: '/courses'
    },
    {
      slot: 'right-wall',
      category: 'STARTERS INTERACTIVE GAMES',
      title: 'Starters English Word Games',
      subtitle: 'Play Fun English Games & Collect Era Gems',
      badge: 'PLAY CLASSROOM GAMES',
      accentHex: '#0EA5E9',
      bgLightHex: '#E0F2FE',
      actionType: 'open_eragames'
    }
  ],
  class_movers: [
    {
      slot: 'left-wall',
      category: 'CAMBRIDGE A1 MOVERS • LESSON',
      title: 'Movers Reading & Speaking',
      subtitle: 'Action Verbs, Daily Routines, Places in Town & Stories',
      badge: 'OPEN MOVERS COURSE',
      accentHex: '#EA580C',
      bgLightHex: '#FFEDD5',
      actionType: 'navigate',
      route: '/courses'
    },
    {
      slot: 'right-wall',
      category: 'MOVERS INTERACTIVE PRACTICE',
      title: 'Movers Vocabulary Challenge',
      subtitle: 'Practice A1 Movers Words & Sentences in EraGames',
      badge: 'START MOVERS CHALLENGE',
      accentHex: '#F97316',
      bgLightHex: '#FFEDD5',
      actionType: 'open_eragames'
    }
  ],
  class_flyers: [
    {
      slot: 'left-wall',
      category: 'CAMBRIDGE A2 FLYERS • LESSON',
      title: 'Flyers Grammar & Storytelling',
      subtitle: 'Tenses, Conversation Skills, Listening & Creative Writing',
      badge: 'OPEN FLYERS COURSE',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'navigate',
      route: '/courses'
    },
    {
      slot: 'right-wall',
      category: 'FLYERS SKILL PRACTICE',
      title: 'Flyers English Arena',
      subtitle: 'Test Your A2 Flyers Vocabulary & Idioms',
      badge: 'PLAY FLYERS ARENA',
      accentHex: '#10B981',
      bgLightHex: '#D1FAE5',
      actionType: 'open_eragames'
    }
  ],
  class_ket: [
    {
      slot: 'left-wall',
      category: 'CAMBRIDGE A2 KEY (KET) • CURRICULUM',
      title: 'KET Reading, Writing & Listening',
      subtitle: 'Official Cambridge A2 Key Exam Preparation & Practice',
      badge: 'OPEN KET DASHBOARD',
      accentHex: '#E11D48',
      bgLightHex: '#FFE4E6',
      actionType: 'navigate',
      route: '/ket/dashboard'
    },
    {
      slot: 'right-wall',
      category: 'CAMBRIDGE KET PRACTICE TESTS',
      title: 'KET Mock Exam Practice',
      subtitle: 'Take Reading, Listening, Writing & Speaking KET Tests',
      badge: 'OPEN KET PRACTICE',
      accentHex: '#F43F5E',
      bgLightHex: '#FFE4E6',
      actionType: 'navigate',
      route: '/practice-tests?course=ket'
    }
  ],
  class_pet: [
    {
      slot: 'left-wall',
      category: 'CAMBRIDGE B1 PRELIMINARY (PET)',
      title: 'PET Academic & Everyday English',
      subtitle: 'Official Cambridge B1 Preliminary Skills & Progress',
      badge: 'OPEN PET DASHBOARD',
      accentHex: '#0D9488',
      bgLightHex: '#CCFBF1',
      actionType: 'navigate',
      route: '/pet/dashboard'
    },
    {
      slot: 'right-wall',
      category: 'CAMBRIDGE PET PRACTICE TESTS',
      title: 'PET Full Practice Exams',
      subtitle: 'Practice B1 Reading, Writing, Listening & Speaking',
      badge: 'OPEN PET PRACTICE',
      accentHex: '#14B8A6',
      bgLightHex: '#CCFBF1',
      actionType: 'navigate',
      route: '/practice-tests?course=pet'
    }
  ],
  class_ielts: [
    {
      slot: 'left-wall',
      category: 'IELTS ACADEMIC MASTERCLASS',
      title: 'IELTS Band 7.0+ Strategy & Analytics',
      subtitle: 'Track Reading, Listening, Writing & Speaking Band Scores',
      badge: 'OPEN IELTS DASHBOARD',
      accentHex: '#4F46E5',
      bgLightHex: '#E0E7FF',
      actionType: 'navigate',
      route: '/ielts/dashboard'
    },
    {
      slot: 'right-wall',
      category: 'IELTS EXAM SIMULATION',
      title: 'IELTS Full Practice Tests',
      subtitle: 'Complete Academic Reading, Listening, Writing & Speaking',
      badge: 'OPEN IELTS TESTS',
      accentHex: '#6366F1',
      bgLightHex: '#E0E7FF',
      actionType: 'practice_skill',
      skillOrTab: 'Reading'
    }
  ],
  faculty_hq: [
    {
      slot: 'back-left',
      category: 'TEACHER JAN • 12-MODULE ADMIN HUB',
      title: 'ERA Faculty Command Center',
      subtitle: 'Manage AI Staff, Assign Batch Tasks & View Analytics',
      badge: 'OPEN ERA FACULTY HUB',
      accentHex: '#D97706',
      bgLightHex: '#FEF3C7',
      actionType: 'open_faculty_hq',
      facultyModule: 'overview'
    },
    {
      slot: 'back-right',
      category: 'FINAL AUTHORITY • QUALITY GATE',
      title: 'Assessment Approval Center',
      subtitle: 'Review & Approve Provisional Cambridge & IELTS Grading',
      badge: 'OPEN APPROVAL CENTER',
      accentHex: '#7C3AED',
      bgLightHex: '#F3E8FF',
      actionType: 'open_faculty_hq',
      facultyModule: 'approval_center'
    },
    {
      slot: 'left-wall',
      category: '7 CAMBRIDGE & IELTS RUBRICS',
      title: 'Examination Department & OCR',
      subtitle: 'Starters, Movers, Flyers, KET, PET & IELTS 4-Skill Marking',
      badge: 'OPEN EXAM DEPARTMENT',
      accentHex: '#2563EB',
      bgLightHex: '#DBEAFE',
      actionType: 'open_faculty_hq',
      facultyModule: 'exam_management'
    },
    {
      slot: 'right-wall',
      category: 'FLOOR 2 • 12 AI TEACHING TOOLS',
      title: 'Creative Teaching Laboratory',
      subtitle: 'Generate Quizzes, Slides & Publish to EraGames / Homework',
      badge: 'OPEN CREATIVE LAB',
      accentHex: '#059669',
      bgLightHex: '#D1FAE5',
      actionType: 'open_faculty_hq',
      facultyModule: 'content_production'
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
    switchFacultyFloor: (floor: 1 | 2) => void;
    sitAtClassroomDesk: (desk: { seatX: number; seatZ: number; deskName: string; classCohort: string }) => void;
    standUpFromDesk: () => void;
    castFishingPole: () => void;
    reelInFish: () => void;
    buyTicketAtBooth: () => void;
    boardCableCar: (freeReturnFallback?: boolean) => void;
    skipCableCarRide: () => void;
    teleportToCableCarStation: () => void;
    setTelescopePreset: (preset: 'city' | 'campus' | 'beach' | 'waterfall' | null) => void;
    sitAtSummitBench: (bench: { seatX: number; seatZ: number; rotY: number }) => void;
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
  const [showFacultyModal, setShowFacultyModal] = useState<boolean>(false);
  const [selectedFacultyEmployee, setSelectedFacultyEmployee] = useState<FacultyEmployeeProfile | null>(null);
  const [facultyInitialAdminModule, setFacultyInitialAdminModule] = useState<AdminModuleId>('overview');
  const [nearFacultyEmployee, setNearFacultyEmployee] = useState<FacultyEmployeeProfile | null>(null);
  const [facultyInteriorFloor, setFacultyInteriorFloor] = useState<1 | 2>(1);
  const [isSittingAtDesk, setIsSittingAtDesk] = useState<boolean>(false);
  const [nearClassroomDesk, setNearClassroomDesk] = useState<{
    seatX: number;
    seatZ: number;
    deskName: string;
    classCohort: string;
  } | null>(null);
  const [showFishingModal, setShowFishingModal] = useState<boolean>(false);
  const [nearFishingZone, setNearFishingZone] = useState<boolean>(false);
  const [fishingPhase, setFishingPhase] = useState<
    'idle' | 'casting' | 'bobbing' | 'bite_ready' | 'reeling_in'
  >('idle');
  const [lastCaughtFish, setLastCaughtFish] = useState<FishSpeciesSpec | null>(null);
  const [activeCatchCard, setActiveCatchCard] = useState<FishSpeciesSpec | null>(null);
  const [catchHistory, setCatchHistory] = useState<FishSpeciesSpec[]>([]);
  const [fishingBaitCount, setFishingBaitCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eraverse_fishing_bait_v1');
      if (saved !== null) return Math.max(0, parseInt(saved, 10) || 0);
      return 3;
    } catch {
      return 3;
    }
  });
  const fishingBaitCountRef = useRef<number>(fishingBaitCount);
  fishingBaitCountRef.current = fishingBaitCount;
  const handleUpdateFishingBait = (nextBait: number) => {
    const clamped = Math.max(0, nextBait);
    fishingBaitCountRef.current = clamped;
    setFishingBaitCount(clamped);
    try {
      localStorage.setItem('eraverse_fishing_bait_v1', String(clamped));
    } catch {}
  };

  // Mountain Cable Car ($5 Ticket Booth), Animated Ride & Walkable Summit Skywalk States
  const [nearCableCarStation, setNearCableCarStation] = useState<'base' | 'summit' | null>(null);
  const [hasCableCarTicket, setHasCableCarTicket] = useState<boolean>(false);
  const hasCableCarTicketRef = useRef<boolean>(false);
  hasCableCarTicketRef.current = hasCableCarTicket;
  const [cableCarRidePhase, setCableCarRidePhase] = useState<'idle' | 'ascending' | 'descending'>('idle');
  const [cableCarElevationMeters, setCableCarElevationMeters] = useState<number>(120);
  const [isAtMountainSummit, setIsAtMountainSummit] = useState<boolean>(false);
  const [nearSummitTelescope, setNearSummitTelescope] = useState<boolean>(false);
  const [activeTelescopeView, setActiveTelescopeView] = useState<'city' | 'campus' | 'beach' | 'waterfall' | null>(null);
  const [nearSummitBench, setNearSummitBench] = useState<{ seatX: number; seatZ: number; rotY: number } | null>(null);
  const [nearSummitCafe, setNearSummitCafe] = useState<boolean>(false);

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
    try {
      const saved = localStorage.getItem('eraverse_gems_v2');
      if (saved !== null) return Math.max(0, parseInt(saved, 10) || 0);
      return isSuperAdminTeacherJan ? 1000 : 0;
    } catch (_e) {
      return isSuperAdminTeacherJan ? 1000 : 0;
    }
  });
  const [eraDollars, setEraDollars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eraverse_dollars_v2');
      if (saved !== null) return Math.max(0, parseInt(saved, 10) || 0);
      return isSuperAdminTeacherJan ? 1000 : 25;
    } catch (_e) {
      return isSuperAdminTeacherJan ? 1000 : 25;
    }
  });
  const eraDollarsRef = useRef<number>(eraDollars);
  eraDollarsRef.current = eraDollars;
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
    const effectiveGems = Math.max(0, Number(nextGems) || 0);
    const effectiveDollars = Math.max(0, Number(nextDollars) || 0);
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

  useEffect(() => {
    const handleWalletSync = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail && typeof detail.dollars === 'number') {
        setEraDollars(detail.dollars);
        if (typeof detail.gems === 'number') {
          setEraGems(detail.gems);
        }
      }
    };
    window.addEventListener('eraverse-wallet-updated', handleWalletSync);
    return () => window.removeEventListener('eraverse-wallet-updated', handleWalletSync);
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

    const resolvedGems =
      typeof fsUserDoc?.eraGems === 'number'
        ? fsUserDoc.eraGems
        : typeof fsUserDoc?.gems === 'number'
        ? fsUserDoc.gems
        : typeof customLook?.eraGems === 'number'
        ? customLook.eraGems
        : null;
    const resolvedDollars =
      typeof fsUserDoc?.dollars === 'number'
        ? fsUserDoc.dollars
        : typeof fsUserDoc?.eraDollars === 'number'
        ? fsUserDoc.eraDollars
        : typeof customLook?.eraDollars === 'number'
        ? customLook.eraDollars
        : null;

    if (resolvedGems !== null) {
      setEraGems(resolvedGems);
      try {
        localStorage.setItem('eraverse_gems_v2', String(resolvedGems));
      } catch (_e) {}
    }
    if (resolvedDollars !== null) {
      setEraDollars(resolvedDollars);
      try {
        localStorage.setItem('eraverse_dollars_v2', String(resolvedDollars));
      } catch (_e) {}
    }

    const femaleNames = [
      'suzie',
      'sophia',
      'may',
      'emily',
      'hailey',
      'trang',
      'uyen',
      'ngan',
      'annie',
      'aisha',
      'rustina',
      'kim',
      'hannah',
      'nhi',
      'tracy',
      'candy',
      'anna',
      'lisa',
      'ruby',
      'chloe'
    ];
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

  const isAuthorizedFaculty = Boolean(
    isAdmin ||
    isSuperAdminTeacherJan ||
    playerProfile.cohort.includes('TEACHER') ||
    !user
  );
  const isAuthorizedFacultyRef = useRef<boolean>(isAuthorizedFaculty);
  isAuthorizedFacultyRef.current = isAuthorizedFaculty;

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
    } else if (board.actionType === 'open_faculty_hq') {
      if (board.facultyEmployeeId) {
        const emp = INITIAL_FACULTY_EMPLOYEES.find((e) => e.id === board.facultyEmployeeId) || null;
        setSelectedFacultyEmployee(emp);
      } else {
        setSelectedFacultyEmployee(null);
      }
      if (board.facultyModule) {
        setFacultyInitialAdminModule(board.facultyModule);
      } else {
        setFacultyInitialAdminModule('overview');
      }
      setShowFacultyModal(true);
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
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0022);

    // Tropical Island Gradient Sky Dome (Deep Azure Zenith -> Bright Island Cyan -> Warm Sunlit Horizon)
    const createTropicalSkyDome = () => {
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 32;
      skyCanvas.height = 512;
      const sCtx = skyCanvas.getContext('2d')!;
      const grad = sCtx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#0284c7');
      grad.addColorStop(0.28, '#0ea5e9');
      grad.addColorStop(0.52, '#38bdf8');
      grad.addColorStop(0.72, '#bae6fd');
      grad.addColorStop(0.86, '#fef9c3');
      grad.addColorStop(1.0, '#bae6fd');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 32, 512);
      const skyTex = new THREE.CanvasTexture(skyCanvas);
      skyTex.colorSpace = THREE.SRGBColorSpace;
      const skyDome = new THREE.Mesh(
        new THREE.SphereGeometry(490, 32, 24),
        new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false, fog: false })
      );
      scene.add(skyDome);

      // Warm Tropical Sun Disc & Soft Halo in the Southern/Eastern Sky
      const sunDisc = new THREE.Mesh(
        new THREE.SphereGeometry(18, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb, fog: false })
      );
      sunDisc.position.set(130, 175, 290);
      scene.add(sunDisc);
    };
    createTropicalSkyDome();

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.2, 600);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    let currentQuality: GraphicsQuality = 'high';

    // 1. Tropical Daytime Lighting Rig (Soft global illumination, warm tropical sunlight & dynamic palm shadows)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x22c55e, 0.82);
    hemiLight.position.set(0, 95, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.28);
    sunLight.position.set(75, 115, 75);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 310;
    const shadowBound = 118;
    sunLight.shadow.camera.left = -shadowBound;
    sunLight.shadow.camera.right = shadowBound;
    sunLight.shadow.camera.top = shadowBound;
    sunLight.shadow.camera.bottom = -shadowBound;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.5);
    rimLight.position.set(-75, 55, -65);
    scene.add(rimLight);

    // 2. High-Resolution Stylized Tropical Grass & Pavement Textures
    const createRichGrassTexture = () => {
      const size = 1024;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;

      // Vibrant base tropical lawn green
      ctx.fillStyle = '#2eab48';
      ctx.fillRect(0, 0, size, size);

      // Soft rolling meadow & sunlit lawn color variations (eliminates flat repetitive tiling)
      for (let p = 0; p < 55; p++) {
        const px = Math.random() * size;
        const py = Math.random() * size;
        const pr = 70 + Math.random() * 140;
        const g = ctx.createRadialGradient(px, py, 8, px, py, pr);
        if (p % 3 === 0) {
          g.addColorStop(0, 'rgba(74, 222, 128, 0.24)');
        } else if (p % 3 === 1) {
          g.addColorStop(0, 'rgba(22, 163, 74, 0.22)');
        } else {
          g.addColorStop(0, 'rgba(134, 239, 172, 0.18)');
        }
        g.addColorStop(1, 'rgba(46, 171, 72, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }

      // Subtle diagonal lawn-mowing sheen bands
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let band = 0; band < size; band += 128) {
        ctx.fillRect(0, band, size, 64);
      }
      ctx.restore();

      // Fine stylized grass blade strokes & small clover clusters
      const bladeColors = ['#22c55e', '#16a34a', '#4ade80', '#15803d', '#86efac'];
      ctx.lineCap = 'round';
      for (let i = 0; i < 6500; i++) {
        const bx = Math.random() * size;
        const by = Math.random() * size;
        const bh = 4 + Math.random() * 6;
        const tilt = (Math.random() - 0.5) * 3.5;
        ctx.strokeStyle = bladeColors[i % bladeColors.length];
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + tilt * 0.5, by - bh * 0.5, bx + tilt, by - bh);
        ctx.stroke();
      }

      // Subtle micro-clover dots & tiny meadow blossoms
      for (let cIdx = 0; cIdx < 320; cIdx++) {
        const cx = Math.random() * size;
        const cy = Math.random() * size;
        ctx.fillStyle = cIdx % 7 === 0 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(21, 128, 61, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy, cIdx % 7 === 0 ? 2.2 : 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(22, 20);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    const createPaverTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      // Warm resort sandstone & travertine stone pavers with clean bevel joints
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) {
        const offset = (y / 64) % 2 === 0 ? 0 : 64;
        for (let x = -64; x < 512; x += 128) {
          ctx.fillStyle = (x + y) % 128 === 0 ? '#cbd5e1' : '#e2e8f0';
          ctx.beginPath();
          ctx.roundRect(x + offset + 3, y + 3, 122, 58, 6);
          ctx.fill();
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
      new THREE.PlaneGeometry(360, 320),
      new THREE.MeshStandardMaterial({
        map: createRichGrassTexture(),
        roughness: 0.82,
        metalness: 0.03
      })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(-50, 0, -70);
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

    const curbMatShared = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.15 });

    // West Academic Quad Main Promenade (connects Central Plaza to Starters, Movers, Flyers, KET, PET, IELTS Classrooms & ERA FACULTY HQ)
    const westPromenadeGroup = new THREE.Group();
    const westPromLen = 140;
    westPromenadeGroup.position.set(-85, 0, 0);
    const westPromBed = new THREE.Mesh(new THREE.BoxGeometry(westPromLen, 0.12, 6.4), plazaMat);
    westPromBed.position.y = 0.06;
    westPromBed.receiveShadow = true;
    westPromenadeGroup.add(westPromBed);
    [-3.36, 3.36].forEach((cz) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(westPromLen, 0.24, 0.32), curbMatShared);
      curb.position.set(0, 0.12, cz);
      curb.receiveShadow = true;
      westPromenadeGroup.add(curb);
    });
    scene.add(westPromenadeGroup);

    // East Sports Complex Main Promenade (connects Central Plaza to Era Tennis Court & Era Football Club)
    const eastPromenadeGroup = new THREE.Group();
    const eastPromLen = 48;
    eastPromenadeGroup.position.set(40, 0, 0);
    const eastPromBed = new THREE.Mesh(new THREE.BoxGeometry(eastPromLen, 0.12, 6.4), plazaMat);
    eastPromBed.position.y = 0.06;
    eastPromBed.receiveShadow = true;
    eastPromenadeGroup.add(eastPromBed);
    [-3.36, 3.36].forEach((cz) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(eastPromLen, 0.24, 0.32), curbMatShared);
      curb.position.set(0, 0.12, cz);
      curb.receiveShadow = true;
      eastPromenadeGroup.add(curb);
    });
    scene.add(eastPromenadeGroup);

    BUILDINGS.forEach((b) => {
      const roadGroup = new THREE.Group();
      if (b.id.startsWith('class_') || b.id === 'faculty_hq') {
        // Orthogonal avenue branch from West Academic Promenade (Z = 0) straight to classroom door
        const branchLen = Math.abs(b.doorZ);
        roadGroup.position.set(b.doorX, 0, b.doorZ / 2);
        const roadBed = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, branchLen), plazaMat);
        roadBed.position.y = 0.06;
        roadBed.receiveShadow = true;
        roadGroup.add(roadBed);
        [-2.65, 2.65].forEach((cx) => {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, branchLen), curbMatShared);
          curb.position.set(cx, 0.12, 0);
          curb.receiveShadow = true;
          roadGroup.add(curb);
        });
      } else {
        const dist = Math.hypot(b.doorX, b.doorZ);
        const roadAngle = Math.atan2(b.doorX, b.doorZ);
        roadGroup.position.set(b.doorX / 2, 0, b.doorZ / 2);
        roadGroup.rotation.y = roadAngle;

        const roadBed = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, dist), plazaMat);
        roadBed.position.y = 0.06;
        roadBed.receiveShadow = true;
        roadGroup.add(roadBed);

        [-2.75, 2.75].forEach((cx) => {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, dist), curbMatShared);
          curb.position.set(cx, 0.12, 0);
          curb.receiveShadow = true;
          roadGroup.add(curb);
        });
      }
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

      // TWO-STOREY ARCHITECTURAL DETAILS FOR ERA FACULTY HQ
      if (b.id === 'faculty_hq') {
        // Wrap-around Gold Second-Floor Balcony Cornice Band
        const midBand = new THREE.Mesh(
          new THREE.BoxGeometry(b.w + 1.2, 0.65, b.d + 1.2),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 })
        );
        midBand.position.y = 7.2;
        midBand.castShadow = true;
        bGroup.add(midBand);

        // Second-Storey Upper Windows (3 across the front facade)
        [-b.w * 0.32, 0, b.w * 0.32].forEach((wx) => {
          const w2Group = new THREE.Group();
          w2Group.position.set(wx, 9.8, frontZ);
          const frame2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 0.28), winFrameMat);
          const glass2 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.35, 0.32), winGlassMat);
          const sill2 = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.26, 0.55), pilasterMat);
          sill2.position.y = -1.45;
          w2Group.add(frame2, glass2, sill2);
          bGroup.add(w2Group);
        });
      }

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
    // 5. OUTDOOR SPORTS & PLAYGROUND PARK (EAST SPORTS COMPLEX: ERA TENNIS COURT & ERA FOOTBALL CLUB)
    // ============================================================================

    // A. Interactive Football (Soccer) Stadium at East Sports Park next to Era Tennis Court (X = 78, Z = 25)
    // Open stadium field where players can walk, run, and play inside seamlessly!
    const PITCH_CENTER = { x: 78, z: 25 };
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

    // 4. Covered Grandstand on East Outer Side + 3D Animated Spectators (facing West towards pitch)
    const greenWallMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.65 });
    const whiteCopingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.75 });
    const brandTex = createClubBrandTexture();
    const brandMat = new THREE.MeshBasicMaterial({ map: brandTex, transparent: true });

    const standGroup = new THREE.Group();
    const eastStandBaseX = PITCH_CENTER.x + PITCH_HALF_W + 2.8;
    const standLen = 42.0;

    // East touchline barrier wall with white coping
    const eastBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, standLen), greenWallMat);
    eastBarrier.position.set(eastStandBaseX, 0.7, PITCH_CENTER.z);
    eastBarrier.castShadow = true;
    eastBarrier.receiveShadow = true;
    standGroup.add(eastBarrier);

    const eastCoping = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, standLen + 0.2), whiteCopingMat);
    eastCoping.position.set(eastStandBaseX, 1.45, PITCH_CENTER.z);
    standGroup.add(eastCoping);

    [-12, 0, 12].forEach((zOffset) => {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.0), brandMat);
      sign.position.set(eastStandBaseX - 0.34, 0.75, PITCH_CENTER.z + zOffset);
      sign.rotation.y = -Math.PI / 2;
      standGroup.add(sign);
    });

    // 3 Tiered concrete grandstand steps + 3D cheering spectators facing West (-X)
    const stadiumSpectators: any[] = [];
    const skinPalette = [0xf5cba7, 0xe0ac69, 0xc68642, 0x8d5524, 0xfadbd8];
    const shirtPalette = [0xef4444, 0xdc2626, 0x3b82f6, 0x2563eb, 0xfacc15, 0x10b981, 0xffffff, 0xf97316];
    const headGeo = new THREE.SphereGeometry(0.30, 14, 14);
    const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.34, 8, 12);
    const armGeo = new THREE.CapsuleGeometry(0.075, 0.28, 6, 8);
    const hairCapGeo = new THREE.SphereGeometry(0.315, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.56);
    const hairColors = [0x1c1917, 0x451a03, 0x92400e, 0xfacc15, 0x0f172a];
    const eyeGeo = new THREE.SphereGeometry(0.042, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    for (let row = 0; row < 3; row++) {
      const stepX = eastStandBaseX + (1.1 + row * 1.15);
      const stepY = 1.25 + row * 0.75;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, stepY, standLen - 1.2), concreteMat);
      stepMesh.position.set(stepX, stepY / 2, PITCH_CENTER.z);
      stepMesh.receiveShadow = true;
      standGroup.add(stepMesh);

      for (let z = -18.0; z <= 18.0; z += 2.2) {
        const spec = new THREE.Group();
        const seedIdx = Math.abs(Math.round(z * 3)) + row;
        const skinColor = skinPalette[seedIdx % skinPalette.length];
        const shirtColor = shirtPalette[(Math.abs(Math.round(z * 7)) + row * 2) % shirtPalette.length];
        const hairCol = hairColors[seedIdx % hairColors.length];

        const shirtMatSpec = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 });
        const torso = new THREE.Mesh(bodyGeo, shirtMatSpec);
        torso.scale.set(0.85, 1.0, 1.12);
        torso.position.y = 0.34;
        torso.castShadow = true;
        spec.add(torso);

        [-1, 1].forEach((armSide) => {
          const arm = new THREE.Mesh(armGeo, shirtMatSpec);
          arm.position.set(-0.02, 0.34, armSide * 0.28);
          arm.rotation.x = armSide * 0.16;
          spec.add(arm);
        });

        const headPivot = new THREE.Group();
        headPivot.position.y = 0.84;

        const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.45 }));
        head.castShadow = true;
        headPivot.add(head);

        const hairCap = new THREE.Mesh(hairCapGeo, new THREE.MeshStandardMaterial({ color: hairCol, roughness: 0.4 }));
        hairCap.rotation.z = -0.15;
        headPivot.add(hairCap);

        const e1 = new THREE.Mesh(eyeGeo, eyeMat);
        e1.position.set(-0.27, 0.02, -0.1);
        headPivot.add(e1);
        const e2 = new THREE.Mesh(eyeGeo, eyeMat);
        e2.position.set(-0.27, 0.02, 0.1);
        headPivot.add(e2);

        spec.add(headPivot);
        spec.position.set(stepX - 0.15, stepY, PITCH_CENTER.z + z);
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
    const backWallX = eastStandBaseX + 4.6;
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.75, 5.5, standLen), greenWallMat);
    backWall.position.set(backWallX, 2.75, PITCH_CENTER.z);
    backWall.castShadow = true;
    standGroup.add(backWall);

    for (let wz = -16; wz <= 16; wz += 6) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 4.2), glassMat);
      win.position.set(backWallX - 0.38, 4.2, PITCH_CENTER.z + wz);
      standGroup.add(win);
    }

    // Slanted Corrugated Green Canopy Roof
    const roofMat = new THREE.MeshStandardMaterial({ map: createCorrugatedRoofTexture(), roughness: 0.55 });
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.22, standLen + 0.4), roofMat);
    roofSlab.position.set(eastStandBaseX + 2.2, 5.8, PITCH_CENTER.z);
    roofSlab.rotation.z = 0.14;
    roofSlab.castShadow = true;
    standGroup.add(roofSlab);

    scene.add(standGroup);

    // 5. Open Stadium Entrances & West Walkway (Facing Main Campus Pathways & Era Tennis Court)
    // Completely OPEN field design so players and autonomous classmates can easily walk and run inside!
    const westGateBaseX = PITCH_CENTER.x - PITCH_HALF_W - 1.8;
    const entranceGateW = 12.0; // 12-meter wide open gateway!

    // North-West low barrier
    const nwBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, (standLen - entranceGateW) / 2), greenWallMat);
    nwBarrier.position.set(westGateBaseX, 0.45, PITCH_CENTER.z - (entranceGateW / 2 + (standLen - entranceGateW) / 4));
    scene.add(nwBarrier);

    // South-West low barrier
    const swBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, (standLen - entranceGateW) / 2), greenWallMat);
    swBarrier.position.set(westGateBaseX, 0.45, PITCH_CENTER.z + (entranceGateW / 2 + (standLen - entranceGateW) / 4));
    scene.add(swBarrier);

    // Grand Entrance Archway Pillars with Era Football Club Signage
    [-entranceGateW / 2, entranceGateW / 2].forEach((pz) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), greenWallMat);
      pillar.position.set(westGateBaseX, 1.8, PITCH_CENTER.z + pz);
      pillar.castShadow = true;
      scene.add(pillar);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), whiteCopingMat);
      cap.position.set(westGateBaseX, 3.75, PITCH_CENTER.z + pz);
      scene.add(cap);

      const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), brandMat);
      banner.position.set(westGateBaseX - 0.62, 2.2, PITCH_CENTER.z + pz);
      banner.rotation.y = -Math.PI / 2;
      scene.add(banner);
    });

    // Overhead Entrance Welcome Sign
    const gateSignTex = makeAttachedBuildingNameTexture('ERA FOOTBALL CLUB • OPEN PITCH ⚽', '#14532d', '#22c55e');
    const gateSign = new THREE.Mesh(
      new THREE.BoxGeometry(entranceGateW + 0.8, 1.4, 0.3),
      new THREE.MeshBasicMaterial({ map: gateSignTex })
    );
    gateSign.position.set(westGateBaseX, 3.8, PITCH_CENTER.z);
    gateSign.rotation.y = -Math.PI / 2;
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

    // B. Era Tennis Court — Lakeside Center Court PBR at East Park (X = 74, Z = -23, right next to Era Football Club)
    const TENNIS_CENTER = { x: 74, z: -23 };
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
    const tennisHeadGeo = new THREE.SphereGeometry(0.30, 14, 14);
    const tennisBodyGeo = new THREE.CapsuleGeometry(0.21, 0.34, 8, 12);
    const tennisArmGeo = new THREE.CapsuleGeometry(0.072, 0.26, 6, 8);
    const tennisHairGeo = new THREE.SphereGeometry(0.315, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.56);
    const tennisHairPalette = [0x1c1917, 0x451a03, 0x92400e, 0xfacc15, 0x0f172a];
    const tennisEyeGeo = new THREE.SphereGeometry(0.042, 8, 8);
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
        const seed = Math.abs(Math.round(z * 5)) + row;
        const skinColor = tennisSkinPalette[seed % tennisSkinPalette.length];
        const shirtColor = tennisShirtPalette[(Math.abs(Math.round(z * 11)) + row * 2) % tennisShirtPalette.length];
        const hairCol = tennisHairPalette[seed % tennisHairPalette.length];

        const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 });
        const charHeadMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4 });

        const torso = new THREE.Mesh(tennisBodyGeo, torsoMat);
        torso.scale.set(0.85, 1.0, 1.12);
        torso.position.y = 0.34;
        torso.castShadow = true;
        spec.add(torso);

        [-1, 1].forEach((armSide) => {
          const arm = new THREE.Mesh(tennisArmGeo, torsoMat);
          arm.position.set(-0.02, 0.34, armSide * 0.27);
          arm.rotation.x = armSide * 0.16;
          spec.add(arm);
        });

        const headPivot = new THREE.Group();
        headPivot.position.y = 0.83;

        const head = new THREE.Mesh(tennisHeadGeo, charHeadMat);
        head.castShadow = true;
        headPivot.add(head);

        const hair = new THREE.Mesh(tennisHairGeo, new THREE.MeshStandardMaterial({ color: hairCol, roughness: 0.4 }));
        hair.rotation.z = -0.15;
        headPivot.add(hair);

        // Eyes looking towards center court
        const e1 = new THREE.Mesh(tennisEyeGeo, tennisEyeMat);
        e1.position.set(-0.27, 0.02, -0.1);
        const e2 = new THREE.Mesh(tennisEyeGeo, tennisEyeMat);
        e2.position.set(-0.27, 0.02, 0.1);
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

    // Register Sports Park Grandstand & Perimeter Wall Colliders so characters never pass through obstacles
    colliders.push(
      // Tennis East Grandstand
      {
        minX: TENNIS_CENTER.x + TENNIS_PLANE_W / 2 + 0.6,
        maxX: TENNIS_CENTER.x + TENNIS_PLANE_W / 2 + 5.2,
        minZ: TENNIS_CENTER.z - 14.5,
        maxZ: TENNIS_CENTER.z + 14.5
      },
      // Football West Spectator Grandstand
      {
        minX: PITCH_CENTER.x - PITCH_HALF_W - 6.5,
        maxX: PITCH_CENTER.x - PITCH_HALF_W - 1.5,
        minZ: PITCH_CENTER.z - 14.5,
        maxZ: PITCH_CENTER.z + 14.5
      }
    );

    // 6. Four-Horizon World Architecture:
    //    NORTH (-Z): Modern Downtown City Skyline
    //    WEST  (-X): Layered Snow-Capped Mountain Range, Pine Forests, Waterfall & Cable Car Observatory
    //    SOUTH (+Z): Golden Sandy Beach, Animated Turquoise Ocean Waves, Walkable Boardwalk Pier, Umbrellas & Palm Trees
    //    EAST  (+X): Sports Park & Coastal Harbor Seawall Promenade
    const oceanFoamBands: Array<{ mesh: THREE.Mesh; baseZ: number; phaseOffset: number }> = [];
    const oceanWaveLayers: Array<{ mesh: THREE.Mesh; baseY: number; speed: number; amp: number }> = [];
    const waterfallRibbons: Array<{ mesh: THREE.Mesh; baseY: number; speed: number; phase: number }> = [];
    const waterfallMistRings: Array<{ mesh: THREE.Mesh; phase: number }> = [];
    const cableCarGondolas: Array<{
      group: THREE.Group;
      startPos: THREE.Vector3;
      endPos: THREE.Vector3;
      phaseOffset: number;
    }> = [];
    const cableCarSim = {
      phase: 'idle' as 'idle' | 'ascending' | 'descending',
      progress: 0,
      isAtSummit: false,
      activeTelescope: null as 'city' | 'campus' | 'beach' | 'waterfall' | null,
      playerGondola: null as THREE.Group | null,
      turnstileArm: null as THREE.Mesh | null,
      summitTurnstileArm: null as THREE.Mesh | null,
      attendantRoot: null as THREE.Group | null,
      startPos: new THREE.Vector3(-152, 6.4, 44),
      endPos: new THREE.Vector3(-196, 78.4, -18)
    };
    const swayingPalmCrowns: Array<{ group: THREE.Group; phase: number }> = [];

    const createStylizedTree = (tx: number, tz: number, scale = 1, addCollider = true) => {
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
      if (addCollider) {
        colliders.push({
          minX: tx - 0.75 * scale,
          maxX: tx + 0.75 * scale,
          minZ: tz - 0.75 * scale,
          maxZ: tz + 0.75 * scale
        });
      }
    };

    // A. NORTH HORIZON (-Z): Modern Downtown City Skyline
    const buildNorthCitySkyline = () => {
      const makeSkyscraperFacadeTexture = (
        bodyHex: string,
        frameHex: string,
        glassHex: string,
        litHex: string
      ) => {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = bodyHex;
        ctx.fillRect(0, 0, 256, 512);

        const cols = 6;
        const rows = 16;
        const padX = 8;
        const padY = 8;
        const cellW = (256 - padX * 2) / cols;
        const cellH = (512 - padY * 2) / rows;

        for (let r = 0; r < rows; r++) {
          ctx.fillStyle = frameHex;
          ctx.fillRect(0, padY + r * cellH - 2, 256, 3);
          for (let col = 0; col < cols; col++) {
            const wx = padX + col * cellW + 3;
            const wy = padY + r * cellH + 3;
            const ww = cellW - 6;
            const wh = cellH - 6;
            const isWarmLit = (r * 7 + col * 11) % 5 === 0;
            ctx.fillStyle = isWarmLit ? litHex : glassHex;
            ctx.fillRect(wx, wy, ww, wh);
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.fillRect(wx, wy, ww * 0.35, wh);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        return tex;
      };

      const cityPalettes = [
        { body: '#1e293b', frame: '#0f172a', glass: '#38bdf8', lit: '#fde68a', roof: 0x334155, accent: 0x38bdf8 },
        { body: '#334155', frame: '#1e293b', glass: '#7dd3fc', lit: '#fef08a', roof: 0x475569, accent: 0xf59e0b },
        { body: '#e2e8f0', frame: '#94a3b8', glass: '#0284c7', lit: '#bae6fd', roof: 0xcbd5e1, accent: 0x2563eb },
        { body: '#1e1b4b', frame: '#0f172a', glass: '#60a5fa', lit: '#fcd34d', roof: 0x312e81, accent: 0x818cf8 },
        { body: '#d6d3d1', frame: '#78716c', glass: '#0369a1', lit: '#fef3c7', roof: 0xa8a29e, accent: 0xd97706 }
      ];

      const facadeMaterials = cityPalettes.map((p) => {
        const tex = makeSkyscraperFacadeTexture(p.body, p.frame, p.glass, p.lit);
        return {
          mat: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.35 }),
          roofMat: new THREE.MeshStandardMaterial({ color: p.roof, roughness: 0.45, metalness: 0.25 }),
          accentMat: new THREE.MeshStandardMaterial({
            color: p.accent,
            emissive: p.accent,
            emissiveIntensity: 0.38,
            roughness: 0.2
          })
        };
      });

      // North Metropolitan Boulevard & Podium Plaza along Z = -112
      const northBlvd = new THREE.Mesh(
        new THREE.BoxGeometry(270, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
      );
      northBlvd.position.set(-10, 0.11, -112);
      northBlvd.receiveShadow = true;
      scene.add(northBlvd);

      // Dashed yellow boulevard center line
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      for (let lx = -135; lx <= 115; lx += 10) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 0.35), dashMat);
        dash.position.set(lx, 0.13, -112);
        scene.add(dash);
      }

      // Two tiered rows of North Downtown Skyscrapers (Z = -132 and Z = -168, X from -136 to +118)
      const northRows = [
        { zBase: -134, count: 14, hMin: 28, hStep: 7 },
        { zBase: -172, count: 16, hMin: 44, hStep: 10 }
      ];
      northRows.forEach((row, rIdx) => {
        for (let i = 0; i < row.count; i++) {
          const frac = i / Math.max(1, row.count - 1);
          const tx = -134 + frac * 252 + ((i % 2) - 0.5) * 4;
          const tz = row.zBase - (i % 3) * 7;
          const bw = 15 + (i % 4) * 4.5;
          const bd = 14 + ((i + 1) % 3) * 4.5;
          // Make central downtown towers tallest for a dramatic skyline silhouette
          const centerPeakBoost = Math.max(0, 1 - Math.abs(tx) / 110) * 24;
          const bh = row.hMin + ((i * 3 + rIdx) % 5) * row.hStep + centerPeakBoost;
          const style = facadeMaterials[(i + rIdx * 2) % facadeMaterials.length];

          const towerGroup = new THREE.Group();
          towerGroup.position.set(tx, 0, tz);

          const mainTower = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), style.mat);
          mainTower.position.y = bh / 2 - 0.5;
          mainTower.castShadow = true;
          towerGroup.add(mainTower);

          const crownBand = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.6, 1.1, bd + 0.6), style.accentMat);
          crownBand.position.y = bh - 0.4;
          towerGroup.add(crownBand);

          const tierW = bw * 0.68;
          const tierD = bd * 0.68;
          const tierH = 5 + (i % 3) * 3.5;
          const upperTier = new THREE.Mesh(new THREE.BoxGeometry(tierW, tierH, tierD), style.roofMat);
          upperTier.position.y = bh + tierH / 2 - 0.4;
          towerGroup.add(upperTier);

          if ((i + rIdx) % 2 === 0) {
            const spireH = 9 + (i % 3) * 4.5;
            const spire = new THREE.Mesh(
              new THREE.CylinderGeometry(0.18, 0.44, spireH, 8),
              style.roofMat
            );
            spire.position.y = bh + tierH + spireH / 2 - 0.5;
            towerGroup.add(spire);

            const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), style.accentMat);
            beacon.position.y = bh + tierH + spireH - 0.3;
            towerGroup.add(beacon);
          }

          scene.add(towerGroup);
        }
      });
    };
    buildNorthCitySkyline();

    // B. WEST HORIZON (-X): Layered Snow-Capped Alpine Mountain Range, Pine Forests, Waterfall & Cable Car Observatory
    const buildWestMountainRange = () => {
      const mtnGroup = new THREE.Group();
      const rockDarkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88, flatShading: true });
      const rockMidMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.84, flatShading: true });
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, metalness: 0.05, flatShading: true });
      const meadowFoothillMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, flatShading: true });

      // Helper to build a faceted low-poly alpine peak with a crisp snow cap
      const createAlpinePeak = (px: number, pz: number, radius: number, height: number, segments = 7, isMidTone = false) => {
        const peak = new THREE.Group();
        peak.position.set(px, 0, pz);

        const baseCone = new THREE.Mesh(
          new THREE.ConeGeometry(radius, height, segments),
          isMidTone ? rockMidMat : rockDarkMat
        );
        baseCone.position.y = height / 2 - 0.5;
        baseCone.rotation.y = (px + pz) * 0.17;
        baseCone.castShadow = true;
        baseCone.receiveShadow = true;
        peak.add(baseCone);

        // Snow cap covering upper 36% of the peak
        const snowH = height * 0.37;
        const snowR = radius * 0.382;
        const snowCone = new THREE.Mesh(new THREE.ConeGeometry(snowR, snowH, segments), snowMat);
        snowCone.position.y = height - snowH / 2 - 0.35;
        snowCone.rotation.y = baseCone.rotation.y;
        peak.add(snowCone);

        mtnGroup.add(peak);
      };

      // Front Foothill Ridge & Alpine Peaks (Kept West of the Cable Car corridor so peaks never clip or overhang the gondola)
      const peakSpecs: Array<[number, number, number, number, number, boolean]> = [
        [-192, -98, 28, 56, 7, false],
        [-222, -74, 38, 84, 8, true],
        [-198, -52, 24, 52, 7, true],
        [-212, -24, 22, 71.4, 8, false], // Main Summit Peak tucked cleanly beneath West side of Y=72m Summit Plaza
        [-208, 0, 21, 52, 7, false],     // Waterfall Cliff Peak shifted West so Cable Car corridor has 25m+ open sky clearance
        [-230, 14, 38, 94, 8, true],     // Grand Matterhorn Crown Peak
        [-206, 38, 21, 54, 7, true],     // Shifted West of Base Station & Cable Line
        [-215, 64, 34, 76, 7, false],
        [-192, 84, 24, 48, 6, true]
      ];
      peakSpecs.forEach(([px, pz, r, h, seg, mid]) => createAlpinePeak(px, pz, r, h, seg, mid));

      // Green Foothill Knolls along X = -178 (Kept clear of the Base Station & Cable Car Line)
      [-82, -48, 20, 62, 82].forEach((fz, idx) => {
        const knoll = new THREE.Mesh(
          new THREE.ConeGeometry(13 + (idx % 2) * 3, 15 + (idx % 3) * 3, 7),
          meadowFoothillMat
        );
        knoll.position.set(-182 - (idx % 2) * 5, 7, fz);
        mtnGroup.add(knoll);
      });

      // Spruce & Pine Forest Belt at the base of the West Mountains (Optimized spacing & kept clear of Cable Car Station at Z = 36..54)
      for (let pz = -96; pz <= 84; pz += 11.5) {
        if (Math.abs(pz) < 12 || (pz > 33 && pz < 55)) continue;
        const px1 = -165 - ((Math.abs(Math.round(pz)) % 3) * 2.5);
        const sc1 = 1.25 + (Math.abs(Math.round(pz)) % 4) * 0.22;
        createStylizedTree(px1, pz, sc1, false);
        createStylizedTree(px1 - 6.5, pz + 3.2, sc1 * 1.15, false);
      }

      // CASCADING MOUNTAIN WATERFALL & EMERALD ALPINE PLUNGE POOL AT (X = -175, Z = 0)
      const cliffWall = new THREE.Mesh(
        new THREE.BoxGeometry(8, 34, 14),
        rockDarkMat
      );
      cliffWall.position.set(-182, 17, 0);
      mtnGroup.add(cliffWall);

      // Emerald Alpine Plunge Pool Basin at the end of the West Academic Promenade (X = -169, Z = 0)
      const poolRim = new THREE.Mesh(
        new THREE.CylinderGeometry(10.8, 11.6, 0.9, 28),
        rockMidMat
      );
      poolRim.position.set(-169, 0.45, 0);
      mtnGroup.add(poolRim);

      const poolWater = new THREE.Mesh(
        new THREE.CylinderGeometry(9.8, 9.8, 0.96, 28),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0284c7,
          emissiveIntensity: 0.28,
          roughness: 0.15,
          metalness: 0.35
        })
      );
      poolWater.position.set(-169, 0.52, 0);
      mtnGroup.add(poolWater);

      // Animated Vertical Waterfall Ribbons cascading down the East face of the cliff
      const waterRibbonMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.86
      });
      const cyanStreamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.72
      });

      const mainFallBacking = new THREE.Mesh(new THREE.BoxGeometry(0.6, 31.5, 6.2), cyanStreamMat);
      mainFallBacking.position.set(-175.6, 16.2, 0);
      mtnGroup.add(mainFallBacking);

      for (let wIdx = 0; wIdx < 8; wIdx++) {
        const zOff = -2.4 + (wIdx % 4) * 1.6;
        const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.75, 7.5, 1.15), waterRibbonMat);
        const startY = 4 + (wIdx * 3.8) % 28;
        ribbon.position.set(-175.2, startY, zOff);
        mtnGroup.add(ribbon);
        waterfallRibbons.push({
          mesh: ribbon,
          baseY: startY,
          speed: 11.5 + (wIdx % 3) * 2.5,
          phase: wIdx * 0.9
        });
      }

      // Churning White Mist & Foam Rings at Waterfall Impact Zone
      const mistMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      [0, 1, 2].forEach((mIdx) => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(1.4 + mIdx * 1.3, 2.2 + mIdx * 1.4, 24), mistMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(-173.2, 1.05 + mIdx * 0.03, 0);
        mtnGroup.add(ring);
        waterfallMistRings.push({ mesh: ring, phase: mIdx * 2.1 });
      });

      // ============================================================================
      // ACCESSIBLE MOUNTAIN CABLE CAR SYSTEM, $5 TICKET BOOTH & SUMMIT SKYWALK (Y=72m)
      // ============================================================================
      const SUMMIT_Y = 72.0;

      // Helper to build crisp 3D signage textures for the Ticket Booth, Base Terminal & Summit Skywalk
      const makeSignMesh = (
        w: number,
        h: number,
        bgHex: string,
        borderHex: string,
        kicker: string,
        headline: string,
        subline: string
      ) => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 192;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = bgHex;
        ctx.beginPath();
        ctx.roundRect(8, 8, 496, 176, 24);
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = borderHex;
        ctx.stroke();

        ctx.fillStyle = borderHex;
        ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(kicker, 256, 46);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(headline, 256, 102);

        ctx.fillStyle = '#FEF08A';
        ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(subline, 256, 150);

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.16),
          new THREE.MeshBasicMaterial({ map: tex })
        );
      };

      const timberMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
      const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.35 });
      const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.55 });
      const crimsonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.2 });
      const stoneDeckMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.55 });
      const glassDeckMat = new THREE.MeshStandardMaterial({
        color: 0xbae6fd,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: 0.62,
        roughness: 0.12,
        metalness: 0.25
      });
      const glassRailingMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1
      });

      // 1. LOWER FOOTHILL BASE STATION & $5 TICKET BOOTH PLAZA AT (X = -151, Z = 44)
      // Approach stone walkway connecting West Campus Lawn to the Cable Car Terminal
      const approachPath = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, 6.4), stoneDeckMat);
      approachPath.position.set(-138, 0.06, 44);
      mtnGroup.add(approachPath);

      const approachTrim = new THREE.Mesh(new THREE.BoxGeometry(24, 0.14, 0.35), goldTrimMat);
      approachTrim.position.set(-138, 0.07, 40.9);
      mtnGroup.add(approachTrim);
      const approachTrim2 = approachTrim.clone();
      approachTrim2.position.z = 47.1;
      mtnGroup.add(approachTrim2);

      // Open-Air Boarding Terminal Platform at (-152, 0, 44)
      const basePlatform = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.5, 12.0), stoneDeckMat);
      basePlatform.position.set(-152, 0.25, 44);
      mtnGroup.add(basePlatform);

      // 4 Tall Timber Corner Pillars supporting the Base Station Canopy Roof (High clearance so cabin & student head never hit roof)
      [
        [-155.8, 39.2],
        [-148.2, 39.2],
        [-155.8, 48.8],
        [-148.2, 48.8]
      ].forEach(([cx, cz]) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 6.4, 12), timberMat);
        col.position.set(cx, 3.45, cz);
        mtnGroup.add(col);
      });

      const baseRoof = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.55, 13.0), timberMat);
      baseRoof.position.set(-152, 6.75, 44);
      mtnGroup.add(baseRoof);

      const baseRoofCrest = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.25, 13.4), goldTrimMat);
      baseRoofCrest.position.set(-152, 7.08, 44);
      mtnGroup.add(baseRoofCrest);

      // Front Welcome Sign on Base Station Canopy facing East (+X toward campus)
      const baseMainSign = makeSignMesh(
        8.6,
        2.1,
        '#0F172A',
        '#F59E0B',
        'WEST MOUNTAIN AERIAL TRANSIT',
        '🚡 SUMMIT CABLE CAR',
        '🎟️ TICKETS: $5 ERA DOLLARS PER RIDE'
      );
      baseMainSign.rotation.y = Math.PI / 2;
      baseMainSign.position.set(-146.2, 7.9, 44);
      mtnGroup.add(baseMainSign);

      // 2. 3D TICKET BOOTH KIOSK ($5 PER RIDE) AT (X = -146.5, Z = 48.6)
      const ticketBoothGroup = new THREE.Group();
      ticketBoothGroup.position.set(-146.5, 0.5, 48.6);

      const boothBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.5, 2.8), crimsonMat);
      boothBody.position.y = 1.25;
      ticketBoothGroup.add(boothBody);

      const boothCounter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 3.1), timberMat);
      boothCounter.position.y = 1.15;
      ticketBoothGroup.add(boothCounter);

      const boothGlass = new THREE.Mesh(
        new THREE.BoxGeometry(3.26, 1.05, 2.4),
        new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.65,
          roughness: 0.1
        })
      );
      boothGlass.position.y = 1.75;
      ticketBoothGroup.add(boothGlass);

      const boothRoof = new THREE.Mesh(new THREE.ConeGeometry(2.55, 1.35, 4), goldTrimMat);
      boothRoof.rotation.y = Math.PI / 4;
      boothRoof.position.y = 3.15;
      ticketBoothGroup.add(boothRoof);

      const boothSign = makeSignMesh(
        3.2,
        1.1,
        '#064E3B',
        '#10B981',
        'CABLE CAR FARE',
        '🎟️ TICKET BOOTH',
        '$5 ERA DOLLARS / RIDE'
      );
      boothSign.rotation.y = Math.PI / 2;
      boothSign.position.set(1.68, 2.85, 0);
      ticketBoothGroup.add(boothSign);

      // Ticket Turnstile Gate beside the Ticket Booth
      const turnstilePost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 12), darkSteelMat);
      turnstilePost.position.set(1.6, 0.6, -2.3);
      ticketBoothGroup.add(turnstilePost);

      const turnstileBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 1.85), goldTrimMat);
      turnstileBar.position.set(1.6, 1.02, -3.2);
      ticketBoothGroup.add(turnstileBar);
      cableCarSim.turnstileArm = turnstileBar;

      // Ticket Attendant Character standing beside the Ticket Booth welcoming students
      const ticketAttendantRig = buildCharacterAvatar({
        shirtColor: '#dc2626',
        hairColor: '#1e293b',
        skinColor: '#fcd34d',
        hatType: 'cap',
        accessoryType: 'glasses',
        name: 'Ticket Clerk Maya',
        cohort: 'SUMMIT TRANSIT ($5)',
        gender: 'girl',
        hairStyle: 'ponytail',
        clothingType: 'blazer',
        pantsColor: '#0f172a'
      });
      ticketAttendantRig.root.position.set(2.1, 0, -0.4);
      ticketAttendantRig.root.rotation.y = Math.PI / 2;
      ticketBoothGroup.add(ticketAttendantRig.root);
      cableCarSim.attendantRoot = ticketAttendantRig.root;

      mtnGroup.add(ticketBoothGroup);

      // 3. UPPER MOUNTAIN SUMMIT SKYWALK, CITY OVERLOOK & OBSERVATORY PLAZA AT Y = 72m
      const summitGroup = new THREE.Group();

      // Inward-Tapered Rock Cliff Spire tucked strictly under the West side of the Summit Plaza (Never overhangs the Cable Car line!)
      const summitRockPedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(10.5, 5.6, 18, 12),
        rockMidMat
      );
      summitRockPedestal.position.set(-199.5, SUMMIT_Y - 9.3, -19.5);
      summitGroup.add(summitRockPedestal);

      // Main Walkable Stone Summit Plaza Deck (X: -208..-184, Z: -30..-6, Y = 72.0)
      const summitPlazaSlab = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.6, 24.0), stoneDeckMat);
      summitPlazaSlab.position.set(-196, SUMMIT_Y - 0.3, -18);
      summitGroup.add(summitPlazaSlab);

      // Cantilevered Transparent Glass Skywalk Deck jutting East toward the City & Campus (X: -184..-171, Z: -26..-10)
      const glassSkywalkFloor = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.35, 16.0), glassDeckMat);
      glassSkywalkFloor.position.set(-177.25, SUMMIT_Y - 0.18, -18);
      summitGroup.add(glassSkywalkFloor);

      // Steel Support Trusses & Glowing Cyan Frame around the Glass Skywalk
      const skywalkFrameEast = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 16.4), goldTrimMat);
      skywalkFrameEast.position.set(-170.5, SUMMIT_Y - 0.15, -18);
      summitGroup.add(skywalkFrameEast);

      [-26, -10].forEach((sz) => {
        const sideBeam = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.42, 0.42), goldTrimMat);
        sideBeam.position.set(-177.25, SUMMIT_Y - 0.15, sz);
        summitGroup.add(sideBeam);

        // Diagonal support strut anchored into the mountain cliff
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 15.5, 8), darkSteelMat);
        strut.position.set(-177.5, SUMMIT_Y - 5.2, sz);
        strut.rotation.z = -0.82;
        summitGroup.add(strut);
      });

      // Perimeter Safety Glass Walls & Gold Handrails around the Summit & Skywalk
      // North Railing (Z = -30 for Plaza, Z = -26 for Skywalk)
      const northRailPlaza = new THREE.Mesh(new THREE.BoxGeometry(24.0, 1.3, 0.2), glassRailingMat);
      northRailPlaza.position.set(-196, SUMMIT_Y + 0.65, -30);
      summitGroup.add(northRailPlaza);

      const northRailSky = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.3, 0.2), glassRailingMat);
      northRailSky.position.set(-177.25, SUMMIT_Y + 0.65, -26);
      summitGroup.add(northRailSky);

      const southRailPlaza = new THREE.Mesh(new THREE.BoxGeometry(16.0, 1.3, 0.2), glassRailingMat);
      southRailPlaza.position.set(-200, SUMMIT_Y + 0.65, -6);
      summitGroup.add(southRailPlaza);

      const southRailSky = new THREE.Mesh(new THREE.BoxGeometry(13.5, 1.3, 0.2), glassRailingMat);
      southRailSky.position.set(-177.25, SUMMIT_Y + 0.65, -10);
      summitGroup.add(southRailSky);

      const eastRailSky = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 16.0), glassRailingMat);
      eastRailSky.position.set(-170.5, SUMMIT_Y + 0.65, -18);
      summitGroup.add(eastRailSky);

      const westRailPlaza = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 24.0), glassRailingMat);
      westRailPlaza.position.set(-208, SUMMIT_Y + 0.65, -18);
      summitGroup.add(westRailPlaza);

      // Summit Observatory Dome & Alpine Sky Cafe at the West/North side of the Summit Deck (-203, 72, -23)
      const obsBase = new THREE.Mesh(
        new THREE.CylinderGeometry(4.4, 5.0, 4.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.2 })
      );
      obsBase.position.set(-202.5, SUMMIT_Y + 2.4, -23.5);
      summitGroup.add(obsBase);

      const obsDome = new THREE.Mesh(
        new THREE.SphereGeometry(4.3, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.25,
          roughness: 0.25,
          metalness: 0.65
        })
      );
      obsDome.position.set(-202.5, SUMMIT_Y + 4.7, -23.5);
      summitGroup.add(obsDome);

      const obsSpire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.28, 5.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 })
      );
      obsSpire.position.set(-202.5, SUMMIT_Y + 9.8, -23.5);
      summitGroup.add(obsSpire);

      // Alpine Sky Cafe Kiosk & Barista Counter on the Summit Terrace (-201.5, 72, -12.5)
      const cafeCounter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.2), timberMat);
      cafeCounter.position.set(-201.5, SUMMIT_Y + 0.6, -12.5);
      summitGroup.add(cafeCounter);

      const cafeCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 2.8), crimsonMat);
      cafeCanopy.position.set(-201.5, SUMMIT_Y + 3.0, -12.5);
      summitGroup.add(cafeCanopy);

      [-203.5, -199.5].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.0, 8), goldTrimMat);
        post.position.set(px, SUMMIT_Y + 1.5, -12.5);
        summitGroup.add(post);
      });

      const cafeSign = makeSignMesh(
        4.4,
        1.05,
        '#1E293B',
        '#F59E0B',
        '2,400M ELEVATION',
        '☕ SUMMIT SKY CAFE',
        'HOT COCOA & PANORAMIC CITY VIEWS'
      );
      cafeSign.rotation.y = Math.PI / 2;
      cafeSign.position.set(-199.1, SUMMIT_Y + 3.65, -12.5);
      summitGroup.add(cafeSign);

      // Summit Boarding Canopy & Return Ticket Gate at the South-East edge of the Summit Plaza (-189, 72, -9.0)
      const summitCanopy = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.45, 7.8), timberMat);
      summitCanopy.position.set(-189, SUMMIT_Y + 6.55, -9.0);
      summitGroup.add(summitCanopy);
      [
        [-192.4, -12.4],
        [-185.6, -12.4],
        [-192.4, -5.6],
        [-185.6, -5.6]
      ].forEach(([cx, cz]) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 6.5, 10), darkSteelMat);
        p.position.set(cx, SUMMIT_Y + 3.25, cz);
        summitGroup.add(p);
      });

      const summitStationSign = makeSignMesh(
        6.8,
        1.5,
        '#0F172A',
        '#38BDF8',
        'UPPER SUMMIT TERMINAL • 2,400M',
        '🚡 RIDE DOWN TO CAMPUS',
        '🎟️ RETURN TICKET: $5 ERA DOLLARS'
      );
      summitStationSign.rotation.y = Math.PI / 2;
      summitStationSign.position.set(-185.1, SUMMIT_Y + 7.45, -9.0);
      summitGroup.add(summitStationSign);

      // Glowing "ERA SUMMIT • CITY OVERLOOK" Photo Arch at the Skywalk Entrance (-184, 72, -18)
      [-21.8, -14.2].forEach((az) => {
        const archPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.6, 12), goldTrimMat);
        archPillar.position.set(-184.2, SUMMIT_Y + 2.3, az);
        summitGroup.add(archPillar);
      });
      const photoArchSign = makeSignMesh(
        8.2,
        1.45,
        '#1E1B4B',
        '#FACC15',
        'PANORAMIC GLASS SKYWALK • 2,400M',
        '🏔️ ERA SUMMIT CITY OVERLOOK',
        'LOOK NORTH FOR CITY SKYLINE & EAST FOR CAMPUS'
      );
      photoArchSign.rotation.y = -Math.PI / 2;
      photoArchSign.position.set(-184.2, SUMMIT_Y + 5.1, -18);
      summitGroup.add(photoArchSign);

      // 3 Mounted Panoramic City & Campus Telescopes / Binoculars along the Skywalk Railing
      const telescopePositions: Array<[number, number, number]> = [
        [-175.5, -25.1, Math.PI], // North railing aiming directly at the North City Skyline!
        [-171.3, -18.0, Math.PI / 2], // East glass skywalk edge aiming at Central Campus & Beach!
        [-175.5, -10.9, 0] // South railing aiming at Waterfall, Campus & South Ocean!
      ];
      telescopePositions.forEach(([tx, tz, rotY]) => {
        const teleGroup = new THREE.Group();
        teleGroup.position.set(tx, SUMMIT_Y, tz);
        teleGroup.rotation.y = rotY;

        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.35, 10), darkSteelMat);
        ped.position.y = 0.68;
        teleGroup.add(ped);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.95, 12), goldTrimMat);
        barrel.rotation.x = Math.PI / 2 - 0.18;
        barrel.position.set(0, 1.45, 0.12);
        teleGroup.add(barrel);

        const lens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.15, 0.08, 12),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        lens.rotation.x = Math.PI / 2 - 0.18;
        lens.position.set(0, 1.36, 0.58);
        teleGroup.add(lens);

        summitGroup.add(teleGroup);
      });

      // 2 Wooden Summit Viewing Benches where students can sit & overlook the City Skyline
      [
        { x: -181.5, z: -24.4, rotY: Math.PI }, // Facing North City Skyline
        { x: -173.2, z: -21.5, rotY: Math.PI / 2 } // Facing East Campus & Harbor
      ].forEach((b) => {
        const bench = new THREE.Group();
        bench.position.set(b.x, SUMMIT_Y, b.z);
        bench.rotation.y = b.rotY;
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.75), timberMat);
        seat.position.y = 0.52;
        bench.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.12), timberMat);
        back.position.set(0, 0.88, -0.32);
        bench.add(back);
        [-0.95, 0.95].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.52, 0.68), darkSteelMat);
          leg.position.set(lx, 0.26, 0);
          bench.add(leg);
        });
        summitGroup.add(bench);
      });

      // Friendly Summit Guide NPC on the Skywalk welcoming students to the City Overlook
      const summitGuideRig = buildCharacterAvatar({
        shirtColor: '#0284c7',
        hairColor: '#78350f',
        skinColor: '#fde68a',
        hatType: 'crown',
        accessoryType: 'none',
        name: 'Summit Guide Leo',
        cohort: 'CITY SKYLINE OVERLOOK',
        gender: 'boy',
        hairStyle: 'short',
        clothingType: 'hoodie',
        pantsColor: '#1e293b'
      });
      summitGuideRig.root.position.set(-180.5, SUMMIT_Y, -16.2);
      summitGuideRig.root.rotation.y = Math.PI / 2;
      summitGroup.add(summitGuideRig.root);

      mtnGroup.add(summitGroup);

      // 4. DUAL SUSPENDED STEEL CABLES & SPACIOUS RIDEABLE PLAYER GONDOLA CABIN (4.55m Interior Headroom!)
      const cableStart = new THREE.Vector3(-152, 6.2, 44);
      const cableEnd = new THREE.Vector3(-189, SUMMIT_Y + 6.2, -9.0);
      cableCarSim.startPos.copy(cableStart);
      cableCarSim.endPos.copy(cableEnd);

      const cableVec = new THREE.Vector3().subVectors(cableEnd, cableStart);
      const cableLen = cableVec.length();
      const cableMid = new THREE.Vector3().addVectors(cableStart, cableEnd).multiplyScalar(0.5);

      const cableMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      [-1.45, 1.45].forEach((offsetX) => {
        const cableMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, cableLen, 8), cableMat);
        cableMesh.position.set(cableMid.x + offsetX, cableMid.y, cableMid.z);
        cableMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cableVec.clone().normalize());
        mtnGroup.add(cableMesh);
      });

      const gondolaRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.28, metalness: 0.25 });
      const gondolaGlassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.35,
        roughness: 0.08
      });
      const gondolaGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28, metalness: 0.6 });

      // Construct a tall, spacious panoramic 3D Cable Car Cabin (4.55m interior clearance so the player's head, crown & nameplate never hit the roof!)
      const createDetailedGondolaCabin = (isPlayerCabin: boolean) => {
        const gGroup = new THREE.Group();
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), darkSteelMat);
        hanger.position.y = -0.7;
        gGroup.add(hanger);

        // Cabin Roof at y = -1.4
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 3.8), gondolaGoldMat);
        roof.position.y = -1.4;
        gGroup.add(roof);

        // Cabin Floor at y = -5.95 (4.55m interior height from floor to roof!)
        const floor = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.25, 3.7), darkSteelMat);
        floor.position.y = -5.95;
        gGroup.add(floor);

        // Lower Crimson Body Skirt Panels
        [
          [0, -5.22, 1.78, 3.3, 1.25, 0.14],
          [0, -5.22, -1.78, 3.3, 1.25, 0.14],
          [-1.58, -5.22, 0, 0.14, 1.25, 3.7]
        ].forEach(([px, py, pz, sx, sy, sz]) => {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), gondolaRedMat);
          panel.position.set(px, py, pz);
          gGroup.add(panel);
        });

        // 4 Tall Corner Frame Pillars (4.4m tall)
        [
          [-1.55, 1.75],
          [1.55, 1.75],
          [-1.55, -1.75],
          [1.55, -1.75]
        ].forEach(([cx, cz]) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.4, 0.18), gondolaRedMat);
          post.position.set(cx, -3.68, cz);
          gGroup.add(post);
        });

        // Tall Transparent Panoramic Windows
        const winFront = new THREE.Mesh(new THREE.BoxGeometry(2.95, 2.85, 0.08), gondolaGlassMat);
        winFront.position.set(0, -3.05, 1.78);
        gGroup.add(winFront);
        const winBack = winFront.clone();
        winBack.position.z = -1.78;
        gGroup.add(winBack);

        if (!isPlayerCabin) {
          const winSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.85, 3.45), gondolaGlassMat);
          winSide.position.set(1.58, -3.05, 0);
          gGroup.add(winSide);
        }

        // Interior Wooden Passenger Bench
        const insideBench = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.35, 3.0), timberMat);
        insideBench.position.set(-1.05, -5.65, 0);
        gGroup.add(insideBench);

        return gGroup;
      };

      // Primary Rideable Player Gondola on the East Cable (+1.45 offset, docked at Base Station initially)
      const playerGondola = createDetailedGondolaCabin(true);
      playerGondola.position.set(cableStart.x + 1.45, cableStart.y, cableStart.z);
      mtnGroup.add(playerGondola);
      cableCarSim.playerGondola = playerGondola;

      // Secondary Scenic Counter-Gondola gliding along the West Cable (-1.45 offset)
      const scenicGondola = createDetailedGondolaCabin(false);
      mtnGroup.add(scenicGondola);
      cableCarGondolas.push({
        group: scenicGondola,
        startPos: new THREE.Vector3(cableStart.x - 1.45, cableStart.y, cableStart.z),
        endPos: new THREE.Vector3(cableEnd.x - 1.45, cableEnd.y, cableEnd.z),
        phaseOffset: Math.PI * 0.5
      });

      // Block player from walking past the West mountain cliff line at ground level (X < -160)
      colliders.push({
        minX: -250,
        maxX: -158.5,
        minZ: -140,
        maxZ: 140
      });

      scene.add(mtnGroup);
    };
    buildWestMountainRange();

    // C. SOUTH HORIZON (+Z): Polished Tropical Island Beach, Multi-Gradient Ocean, Lush Feathered Palm Trees,
    //    Tropical Vegetation, Continuous Wooden Boardwalk & Pier, Tiki Beach Huts, Lifeguard Tower & Volleyball Court
    const buildSouthBeachAndOcean = () => {
      const beachGroup = new THREE.Group();

      // Shared Ambient Occlusion Contact Shadow Disc Generator
      const aoCanvas = document.createElement('canvas');
      aoCanvas.width = 128;
      aoCanvas.height = 128;
      const aoCtx = aoCanvas.getContext('2d')!;
      const aoGrad = aoCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
      aoGrad.addColorStop(0, 'rgba(15, 23, 42, 0.34)');
      aoGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
      aoGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      aoCtx.fillStyle = aoGrad;
      aoCtx.fillRect(0, 0, 128, 128);
      const aoTex = new THREE.CanvasTexture(aoCanvas);
      const aoMat = new THREE.MeshBasicMaterial({
        map: aoTex,
        transparent: true,
        depthWrite: false
      });
      const addContactShadow = (parent: THREE.Object3D, radius: number, x = 0, z = 0, y = 0.04) => {
        const disc = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), aoMat);
        disc.rotation.x = -Math.PI / 2;
        disc.position.set(x, y, z);
        parent.add(disc);
      };

      // 1. South Beach Promenade Walk connecting Central Plaza past Era Gallery to the Beach Boardwalk (X = 14, Z = 0 to 88.5)
      const southPromLen = 88.5;
      const southPromBed = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, southPromLen), plazaMat);
      southPromBed.position.set(14, 0.06, southPromLen / 2);
      southPromBed.receiveShadow = true;
      beachGroup.add(southPromBed);
      [-2.95, 2.95].forEach((cx) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, southPromLen), curbMatShared);
        curb.position.set(14 + cx, 0.11, southPromLen / 2);
        beachGroup.add(curb);
      });

      // 2. High-Resolution Fine Golden Sand Texture with Color Variations, Wet Shoreline Band & Footprints
      const sandCanvas = document.createElement('canvas');
      sandCanvas.width = 1024;
      sandCanvas.height = 1024;
      const sCtx = sandCanvas.getContext('2d')!;
      const sandGrad = sCtx.createLinearGradient(0, 0, 0, 1024);
      sandGrad.addColorStop(0.0, '#fef08a');   // Warm sunlit upper dune sand
      sandGrad.addColorStop(0.32, '#fde68a');  // Soft golden mid-beach sand
      sandGrad.addColorStop(0.68, '#fcd34d');  // Warm honey lower beach sand
      sandGrad.addColorStop(0.84, '#f59e0b');  // Moist tidal shoreline transition
      sandGrad.addColorStop(1.0, '#b45309');   // Wet dark golden sand under shallow surf
      sCtx.fillStyle = sandGrad;
      sCtx.fillRect(0, 0, 1024, 1024);

      // Soft organic wind-swept sand color ripples & warm coral-sand patches
      for (let r = 0; r < 45; r++) {
        const rx = Math.random() * 1024;
        const ry = Math.random() * 820;
        const rad = 45 + Math.random() * 110;
        const rg = sCtx.createRadialGradient(rx, ry, 5, rx, ry, rad);
        rg.addColorStop(0, r % 2 === 0 ? 'rgba(255, 251, 235, 0.26)' : 'rgba(217, 119, 6, 0.14)');
        rg.addColorStop(1, 'rgba(253, 230, 138, 0)');
        sCtx.fillStyle = rg;
        sCtx.fillRect(0, 0, 1024, 1024);
      }

      // Fine wind-ripple lines across the sand
      sCtx.strokeStyle = 'rgba(217, 119, 6, 0.11)';
      sCtx.lineWidth = 2;
      for (let wy = 30; wy < 880; wy += 18) {
        sCtx.beginPath();
        for (let wx = 0; wx <= 1024; wx += 32) {
          const yOff = Math.sin(wx * 0.025 + wy * 0.1) * 4;
          if (wx === 0) sCtx.moveTo(wx, wy + yOff);
          else sCtx.lineTo(wx, wy + yOff);
        }
        sCtx.stroke();
      }

      // Fine sparkling silica & coral sand micro-grains
      for (let i = 0; i < 18000; i++) {
        sCtx.fillStyle =
          i % 3 === 0
            ? 'rgba(255,255,255,0.24)'
            : i % 3 === 1
            ? 'rgba(180,83,9,0.15)'
            : 'rgba(251,146,60,0.14)';
        sCtx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }

      // Natural Footprint Trails along the Shoreline (y = 740..860)
      sCtx.fillStyle = 'rgba(146, 64, 14, 0.28)';
      for (let fx = 24; fx < 1000; fx += 26) {
        const stepSide = (fx / 26) % 2 === 0 ? -7 : 7;
        const fy = 785 + Math.sin(fx * 0.015) * 28 + stepSide;
        sCtx.beginPath();
        sCtx.ellipse(fx, fy, 4.5, 2.4, 0.2 * (stepSide > 0 ? 1 : -1), 0, Math.PI * 2);
        sCtx.fill();
      }

      const sandTex = new THREE.CanvasTexture(sandCanvas);
      sandTex.colorSpace = THREE.SRGBColorSpace;
      sandTex.wrapS = THREE.RepeatWrapping;
      sandTex.wrapT = THREE.ClampToEdgeWrapping;
      sandTex.repeat.set(7, 1);
      sandTex.anisotropy = maxAnisotropy;

      // Contoured Sand Terrain Mesh with Gentle Dune Elevation Variations & Smooth Slope into the Ocean
      const sandGeo = new THREE.PlaneGeometry(340, 50, 96, 28);
      const sandPos = sandGeo.attributes.position;
      for (let i = 0; i < sandPos.count; i++) {
        const vx = sandPos.getX(i); // local X (-170..170), world X = vx - 15
        const vy = sandPos.getY(i); // local Y (-25..25), world Z = 113 - vy
        const worldX = vx - 15;
        const worldZ = 113 - vy;

        // Keep boardwalk corridor around X = 14 flat and smooth so planks never clip
        const distFromBoardwalk = Math.abs(worldX - 14);
        const duneMask = THREE.MathUtils.smoothstep(distFromBoardwalk, 4.5, 11.0);

        let elev = 0;
        if (worldZ < 124) {
          // Gentle rolling upper/mid beach sand dunes
          const duneWave =
            Math.sin(worldX * 0.09) * Math.cos((worldZ - 95) * 0.14) * 0.26 +
            Math.sin(worldX * 0.22 + worldZ * 0.18) * 0.08;
          elev = Math.max(0.02, (0.18 + duneWave) * duneMask);
        } else {
          // Natural smooth slope down into the shallow turquoise water (Z = 124..138)
          const tShore = (worldZ - 124) / 14;
          elev = -tShore * 0.42;
        }
        sandPos.setZ(i, elev);
      }
      sandGeo.computeVertexNormals();

      const sandBeachMesh = new THREE.Mesh(
        sandGeo,
        new THREE.MeshStandardMaterial({
          map: sandTex,
          roughness: 0.86,
          metalness: 0.03
        })
      );
      sandBeachMesh.rotation.x = -Math.PI / 2;
      sandBeachMesh.position.set(-15, 0.02, 113);
      sandBeachMesh.receiveShadow = true;
      beachGroup.add(sandBeachMesh);

      // Decorative Rounded Sandstone Edging Stones between Grass Lawn and Sandy Beach along Z = 88.5
      const curbStoneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
      const warmStoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
      for (let sx = -156; sx <= 112; sx += 3.2) {
        if (Math.abs(sx - 14) < 3.6) continue; // Leave open gateway for the wooden boardwalk
        const stone = new THREE.Mesh(
          new THREE.BoxGeometry(2.95, 0.26, 1.05),
          Math.abs(Math.round(sx)) % 2 === 0 ? curbStoneMat : warmStoneMat
        );
        stone.position.set(sx, 0.13, 88.5);
        stone.receiveShadow = true;
        stone.castShadow = true;
        beachGroup.add(stone);
      }

      // 3. Multi-Gradient Ocean: Crystal Transparent Shallow Water, Turquoise Mid-Lagoon, Deep Azure Ocean & Sun Reflections
      const createOceanGradientTexture = () => {
        const oc = document.createElement('canvas');
        oc.width = 512;
        oc.height = 512;
        const oCtx = oc.getContext('2d')!;
        const oGrad = oCtx.createLinearGradient(0, 0, 0, 512);
        oGrad.addColorStop(0.0, '#67e8f9'); // Crystal shallow aqua at shoreline
        oGrad.addColorStop(0.18, '#22d3ee'); // Bright tropical turquoise
        oGrad.addColorStop(0.45, '#06b6d4'); // Mid lagoon cyan
        oGrad.addColorStop(0.75, '#0284c7'); // Deep tropical azure
        oGrad.addColorStop(1.0, '#0369a1');  // Deep horizon marine blue
        oCtx.fillStyle = oGrad;
        oCtx.fillRect(0, 0, 512, 512);

        // Subtle sunlit caustic wave ripples & shimmering water highlights
        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        oCtx.lineWidth = 2;
        for (let wy = 12; wy < 512; wy += 14) {
          oCtx.beginPath();
          for (let wx = 0; wx <= 512; wx += 24) {
            const yWave = Math.sin(wx * 0.05 + wy * 0.15) * 3.5;
            if (wx === 0) oCtx.moveTo(wx, wy + yWave);
            else oCtx.lineTo(wx, wy + yWave);
          }
          oCtx.stroke();
        }
        const tex = new THREE.CanvasTexture(oc);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(6, 1);
        tex.anisotropy = maxAnisotropy;
        return tex;
      };

      // Transparent Crystal-Clear Shallow Shoreline Water (Z = 129 to 147) revealing wet sand beneath
      const crystalShallowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(360, 18, 48, 8),
        new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0891b2,
          emissiveIntensity: 0.14,
          roughness: 0.55,
          metalness: 0.04,
          transparent: true,
          opacity: 0.72
        })
      );
      crystalShallowMesh.rotation.x = -Math.PI / 2;
      crystalShallowMesh.position.set(-5, -0.02, 138);
      beachGroup.add(crystalShallowMesh);
      oceanWaveLayers.push({ mesh: crystalShallowMesh, baseY: -0.02, speed: 2.1, amp: 0.065 });

      // Main Turquoise-to-Deep-Blue Gradient Ocean Plane (Z = 140 to 270)
      const mainOceanMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(420, 132, 64, 24),
        new THREE.MeshStandardMaterial({
          map: createOceanGradientTexture(),
          emissive: 0x0369a1,
          emissiveIntensity: 0.15,
          roughness: 0.58,
          metalness: 0.04,
          transparent: true,
          opacity: 0.95
        })
      );
      mainOceanMesh.rotation.x = -Math.PI / 2;
      mainOceanMesh.position.set(10, -0.09, 206);
      beachGroup.add(mainOceanMesh);
      oceanWaveLayers.push({ mesh: mainOceanMesh, baseY: -0.09, speed: 1.45, amp: 0.11 });

      // Shimmering Golden Sunlight Specular ReflectionRibbons on the Ocean Water
      const sunShimmerMat = new THREE.MeshBasicMaterial({
        color: 0xfef9c3,
        transparent: true,
        opacity: 0.36
      });
      for (let sIdx = 0; sIdx < 14; sIdx++) {
        const shimmerW = 10 + (sIdx % 4) * 5;
        const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(shimmerW, 0.65), sunShimmerMat);
        shimmer.rotation.x = -Math.PI / 2;
        const sz = 144 + sIdx * 6.5;
        const sx = 35 + Math.sin(sIdx * 1.7) * 28;
        shimmer.position.set(sx, 0.01, sz);
        beachGroup.add(shimmer);
        oceanFoamBands.push({ mesh: shimmer, baseZ: sz, phaseOffset: sIdx * 0.85 });
      }

      // Scalloped Animated White Shoreline Surf Foam Waves near the Beach (Z = 130.5..140)
      const createScallopedFoamTexture = () => {
        const fc = document.createElement('canvas');
        fc.width = 512;
        fc.height = 64;
        const fCtx = fc.getContext('2d')!;
        fCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        fCtx.beginPath();
        fCtx.moveTo(0, 42);
        for (let x = 0; x <= 512; x += 16) {
          const yCurve = 18 + Math.sin(x * 0.098) * 10;
          fCtx.lineTo(x, yCurve);
        }
        fCtx.lineTo(512, 54);
        fCtx.lineTo(0, 54);
        fCtx.closePath();
        fCtx.fill();
        const tex = new THREE.CanvasTexture(fc);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(14, 1);
        return tex;
      };
      const foamWaveTex = createScallopedFoamTexture();

      [0, 1, 2, 3].forEach((fIdx) => {
        const foamMat = new THREE.MeshBasicMaterial({
          map: foamWaveTex,
          transparent: true,
          opacity: 0.82 - fIdx * 0.14,
          depthWrite: false
        });
        const foamBand = new THREE.Mesh(new THREE.PlaneGeometry(340, 2.2 + fIdx * 0.4), foamMat);
        foamBand.rotation.x = -Math.PI / 2;
        const baseZ = 130.8 + fIdx * 3.1;
        foamBand.position.set(-15, 0.05 + fIdx * 0.01, baseZ);
        beachGroup.add(foamBand);
        oceanFoamBands.push({ mesh: foamBand, baseZ, phaseOffset: fIdx * 1.65 });
      });

      // 4. SEAMLESS WOODEN BOARDWALK WALKWAY (Z = 88.5 to 124) & OCEAN PIER WITH DETAILED RAILINGS & LANTERNS (Z = 124 to 172)
      const pierGroup = new THREE.Group();
      const pierX = 14;
      const boardwalkStartZ = 88.5;
      const pierStartZ = 124;
      const pierEndZ = 172;
      const pierW = 8.4;

      const plankCanvas = document.createElement('canvas');
      plankCanvas.width = 512;
      plankCanvas.height = 512;
      const pCtx = plankCanvas.getContext('2d')!;
      pCtx.fillStyle = '#92400e';
      pCtx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 24) {
        pCtx.fillStyle = y % 48 === 0 ? '#b45309' : y % 48 === 24 ? '#9a3412' : '#78350f';
        pCtx.fillRect(0, y, 512, 21);
        // Subtle wood grain lines
        pCtx.fillStyle = 'rgba(254, 243, 199, 0.08)';
        pCtx.fillRect(0, y + 4, 512, 3);
        // Clean dark plank seam
        pCtx.fillStyle = '#451a03';
        pCtx.fillRect(0, y + 21, 512, 3);
      }
      const plankTex = new THREE.CanvasTexture(plankCanvas);
      plankTex.colorSpace = THREE.SRGBColorSpace;
      plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
      plankTex.repeat.set(2, 18);
      plankTex.anisotropy = maxAnisotropy;

      const trimBeamMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const pilingMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
      const postWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
      const ropeGoldMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 });
      const lanternWarmMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9
      });

      // Beach Boardwalk Connector Path over the sand (Z = 88.5 to 124, width 6.4m)
      const sandWalkLen = pierStartZ - boardwalkStartZ;
      const sandBoardwalkDeck = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 0.18, sandWalkLen),
        new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.68 })
      );
      sandBoardwalkDeck.position.set(pierX, 0.11, boardwalkStartZ + sandWalkLen / 2);
      sandBoardwalkDeck.receiveShadow = true;
      pierGroup.add(sandBoardwalkDeck);

      [-3.32, 3.32].forEach((xEdge) => {
        const edgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, sandWalkLen), trimBeamMat);
        edgeBeam.position.set(pierX + xEdge, 0.14, boardwalkStartZ + sandWalkLen / 2);
        edgeBeam.receiveShadow = true;
        pierGroup.add(edgeBeam);
      });

      // Main Ocean Pier Deck (Z = 124 to 172, width 8.4m)
      const pierLen = pierEndZ - pierStartZ;
      const pierDeck = new THREE.Mesh(
        new THREE.BoxGeometry(pierW, 0.32, pierLen),
        new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.68 })
      );
      pierDeck.position.set(pierX, 0.22, pierStartZ + pierLen / 2);
      pierDeck.receiveShadow = true;
      pierDeck.castShadow = true;
      pierGroup.add(pierDeck);

      [-pierW / 2 - 0.12, pierW / 2 + 0.12].forEach((xEdge) => {
        const pierEdgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.4, pierLen), trimBeamMat);
        pierEdgeBeam.position.set(pierX + xEdge, 0.24, pierStartZ + pierLen / 2);
        pierGroup.add(pierEdgeBeam);
      });

      // Detailed Pier Pilings, Double Nautical Railings, Life Rings & Hanging Warm Lanterns
      const buoyRedMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
      for (let pz = pierStartZ + 2; pz <= pierEndZ - 2; pz += 6) {
        [-pierW / 2 + 0.35, pierW / 2 - 0.35].forEach((xOff, sideIdx) => {
          const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 3.4, 12), pilingMat);
          piling.position.set(pierX + xOff, -1.1, pz);
          pierGroup.add(piling);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.32, 12), postWhiteMat);
          post.position.set(pierX + xOff, 1.02, pz);
          post.castShadow = true;
          pierGroup.add(post);

          const postCap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), ropeGoldMat);
          postCap.position.set(pierX + xOff, 1.72, pz);
          pierGroup.add(postCap);

          // Decorative Warm Pier Lanterns every 12m
          if ((pz - pierStartZ) % 12 === 2) {
            const lanternArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.15, 8), trimBeamMat);
            lanternArm.position.set(pierX + xOff, 2.25, pz);
            pierGroup.add(lanternArm);

            const lanternGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), lanternWarmMat);
            lanternGlobe.position.set(pierX + xOff, 2.85, pz);
            pierGroup.add(lanternGlobe);
          }

          // Nautical Rescue Lifebuoy Ring on selected posts
          if ((pz - pierStartZ) === 14 && sideIdx === 1) {
            const lifebuoy = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 10, 20), buoyRedMat);
            lifebuoy.rotation.y = Math.PI / 2;
            lifebuoy.position.set(pierX + xOff + 0.18, 1.1, pz);
            pierGroup.add(lifebuoy);
          }
        });
      }

      // Upper and Mid Nautical Rope Railings along the Pier
      [-pierW / 2 + 0.35, pierW / 2 - 0.35].forEach((xOff) => {
        const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, pierLen - 3, 8), ropeGoldMat);
        topRail.rotation.x = Math.PI / 2;
        topRail.position.set(pierX + xOff, 1.48, pierStartZ + pierLen / 2);
        pierGroup.add(topRail);

        const midRail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, pierLen - 3, 8), postWhiteMat);
        midRail.rotation.x = Math.PI / 2;
        midRail.position.set(pierX + xOff, 0.98, pierStartZ + pierLen / 2);
        pierGroup.add(midRail);
      });

      // Coastal Viewing Gazebo Pavilion at the Ocean End of the Boardwalk Pier (X = 14, Z = 166.5)
      const gazeboZ = 166.5;
      const gazeboRoofMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.35, metalness: 0.15 });
      const gazeboTrimMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
      [
        [-3.2, -3.2],
        [3.2, -3.2],
        [-3.2, 3.2],
        [3.2, 3.2]
      ].forEach(([gx, gz]) => {
        const gCol = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.3, 14), postWhiteMat);
        gCol.position.set(pierX + gx, 2.45, gazeboZ + gz);
        gCol.castShadow = true;
        pierGroup.add(gCol);
      });

      const gazeboRoofLower = new THREE.Mesh(new THREE.ConeGeometry(6.1, 2.1, 8), gazeboRoofMat);
      gazeboRoofLower.position.set(pierX, 5.4, gazeboZ);
      gazeboRoofLower.rotation.y = Math.PI / 8;
      gazeboRoofLower.castShadow = true;
      pierGroup.add(gazeboRoofLower);

      const gazeboRoofUpper = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.65, 8), gazeboTrimMat);
      gazeboRoofUpper.position.set(pierX, 6.75, gazeboZ);
      gazeboRoofUpper.rotation.y = Math.PI / 8;
      pierGroup.add(gazeboRoofUpper);

      const gazeboFinial = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 14, 14),
        lanternWarmMat
      );
      gazeboFinial.position.set(pierX, 7.75, gazeboZ);
      pierGroup.add(gazeboFinial);

      beachGroup.add(pierGroup);

      // 5. UPGRADED CURVED PALM TREES WITH RINGED TRUNKS, MULTI-SHADE FEATHERED FRONDS, COCONUTS & SHADOWS
      const trunkBarkLightMat = new THREE.MeshStandardMaterial({ color: 0x9a5b25, roughness: 0.82 });
      const trunkBarkDarkMat = new THREE.MeshStandardMaterial({ color: 0x7c4316, roughness: 0.88 });
      const palmLeafShades = [
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.48, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45, side: THREE.DoubleSide }),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5, side: THREE.DoubleSide })
      ];
      const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5c2d0c, roughness: 0.72 });

      const createTropicalPalmTree = (px: number, pz: number, sc = 1.0, leanDir = 1) => {
        const palm = new THREE.Group();
        palm.position.set(px, 0, pz);

        // Soft ground ambient occlusion shadow beneath palm tree
        addContactShadow(palm, 2.65 * sc, leanDir * 0.45 * sc, 0, 0.05);

        // 6-Segment Organically Curved Coconut Palm Trunk (Optimized draw calls while preserving smooth curve)
        const segments = 6;
        let curX = 0;
        let curY = 0;
        for (let s = 0; s < segments; s++) {
          const segH = 1.12 * sc;
          const t = s / segments;
          const rBot = (0.44 - t * 0.21) * sc;
          const rTop = (0.4 - t * 0.21) * sc;
          const seg = new THREE.Mesh(
            new THREE.CylinderGeometry(rTop, rBot, segH, 10),
            s % 2 === 0 ? trunkBarkLightMat : trunkBarkDarkMat
          );
          const tilt = (t * t * 0.42 + t * 0.08) * leanDir;
          seg.position.set(curX + Math.sin(tilt) * (segH * 0.5), curY + segH * 0.5, 0);
          seg.rotation.z = -tilt;
          seg.castShadow = s % 2 === 0;
          palm.add(seg);

          curX += Math.sin(tilt) * segH;
          curY += Math.cos(tilt) * segH * 0.96;
        }

        const crownGroup = new THREE.Group();
        crownGroup.position.set(curX, curY, 0);

        // Crown Collar & 3 Clustered Coconuts
        const crownHeart = new THREE.Mesh(
          new THREE.SphereGeometry(0.32 * sc, 8, 8),
          trunkBarkDarkMat
        );
        crownGroup.add(crownHeart);

        [
          [-0.24, -0.14, 0.16],
          [0.24, -0.14, 0.16],
          [0, -0.16, -0.24]
        ].forEach(([cx, cy, cz]) => {
          const coco = new THREE.Mesh(new THREE.SphereGeometry(0.21 * sc, 8, 8), coconutMat);
          coco.scale.set(0.9, 1.15, 0.9);
          coco.position.set(cx * sc, cy * sc, cz * sc);
          crownGroup.add(coco);
        });

        // 8 Full, Arching Feathered Palm Fronds in 3 Shades of Tropical Green (Optimized 3-arch segments per frond)
        const totalFronds = 8;
        for (let f = 0; f < totalFronds; f++) {
          const isUpperTier = f >= 5;
          const fAng = (f / totalFronds) * Math.PI * 2 + (isUpperTier ? 0.35 : 0);
          const leafMat = palmLeafShades[f % palmLeafShades.length];

          const frondPivot = new THREE.Group();
          frondPivot.rotation.y = fAng;
          frondPivot.rotation.x = isUpperTier ? -0.18 : 0.06;

          let fY = 0.08 * sc;
          let fZ = 0.15 * sc;
          const archAngles = [0.14, 0.44, 0.82];
          const segLengths = [1.22, 1.25, 1.05];

          for (let a = 0; a < 3; a++) {
            const sLen = segLengths[a] * sc * (isUpperTier ? 0.88 : 1.0);
            const pitch = archAngles[a];
            const widthFactor = Math.sin(((a + 0.6) / 3.4) * Math.PI);
            const midY = fY - Math.sin(pitch) * (sLen * 0.5);
            const midZ = fZ + Math.cos(pitch) * (sLen * 0.5);

            const leafletW = (0.85 * widthFactor + 0.25) * sc;
            const leaflet = new THREE.Mesh(
              new THREE.BoxGeometry(leafletW, 0.04 * sc, sLen * 0.96),
              leafMat
            );
            leaflet.position.set(0, midY, midZ);
            leaflet.rotation.x = pitch;
            frondPivot.add(leaflet);

            fY -= Math.sin(pitch) * sLen;
            fZ += Math.cos(pitch) * sLen;
          }

          crownGroup.add(frondPivot);
        }

        palm.add(crownGroup);
        swayingPalmCrowns.push({ group: crownGroup, phase: (px + pz) * 0.25 });
        beachGroup.add(palm);

        colliders.push({
          minX: px - 0.65,
          maxX: px + 0.65,
          minZ: pz - 0.65,
          maxZ: pz + 0.65
        });
      };

      const palmLocations: Array<[number, number, number, number]> = [
        [-124, 94, 1.18, 1],
        [-102, 101, 1.25, -1],
        [-78, 93, 1.15, 1],
        [-54, 102, 1.22, -1],
        [-28, 93, 1.16, 1],
        [-4, 96, 1.24, -1],
        [6.5, 92.5, 1.14, -1],
        [21.5, 92.5, 1.18, 1],
        [36, 98, 1.22, -1],
        [56, 93, 1.15, 1],
        [82, 99, 1.26, -1],
        [104, 94, 1.16, 1],
        // Along the South Promenade walking path
        [8.2, 68, 1.08, -1],
        [19.8, 68, 1.08, 1]
      ];
      palmLocations.forEach(([px, pz, sc, ld]) => createTropicalPalmTree(px, pz, sc, ld));

      // 6. TROPICAL VEGETATION, DECORATIVE FLOWERS, MONSTERA PLANTS, SEASHELLS, STARFISH & COASTAL ROCKS
      const bushDarkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
      const bushMidMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
      const bushLightMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.58 });
      const flowerColors = [0xf43f5e, 0xfacc15, 0xfb923c, 0xec4899, 0x38bdf8];
      const rockCoastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.78 });

      const createTropicalFlowerBush = (bx: number, bz: number, sc = 1.0, flowerHex = 0xf43f5e) => {
        const bGroup = new THREE.Group();
        bGroup.position.set(bx, 0, bz);
        addContactShadow(bGroup, 1.35 * sc, 0, 0, 0.04);

        const puffs: Array<[number, number, number, number, THREE.MeshStandardMaterial]> = [
          [0, 0.48, 0, 0.68, bushDarkMat],
          [-0.45, 0.38, 0.25, 0.52, bushMidMat],
          [0.48, 0.4, -0.2, 0.54, bushLightMat],
          [0.12, 0.58, 0.38, 0.46, bushMidMat]
        ];
        puffs.forEach(([px, py, pz, pr, mat]) => {
          const sphere = new THREE.Mesh(new THREE.SphereGeometry(pr * sc, 12, 10), mat);
          sphere.scale.set(1.15, 0.82, 1.1);
          sphere.position.set(px * sc, py * sc, pz * sc);
          sphere.castShadow = true;
          bGroup.add(sphere);
        });

        // Tropical Hibiscus / Plumeria Flower Blossoms on the bush
        const fMat = new THREE.MeshStandardMaterial({ color: flowerHex, roughness: 0.4 });
        const centerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        [
          [0.15, 0.88, 0.2],
          [-0.35, 0.72, 0.35],
          [0.42, 0.76, -0.15],
          [-0.1, 0.82, -0.28],
          [0.25, 0.65, 0.48]
        ].forEach(([fx, fy, fz]) => {
          const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.12 * sc, 8, 8), fMat);
          blossom.scale.set(1.3, 0.55, 1.3);
          blossom.position.set(fx * sc, fy * sc, fz * sc);
          bGroup.add(blossom);

          const pistil = new THREE.Mesh(new THREE.SphereGeometry(0.05 * sc, 6, 6), centerMat);
          pistil.position.set(fx * sc, (fy + 0.05) * sc, fz * sc);
          bGroup.add(pistil);
        });

        // Broad-leaf tropical fern fronds radiating from the base
        for (let f = 0; f < 5; f++) {
          const ang = (f / 5) * Math.PI * 2 + bx;
          const fern = new THREE.Mesh(
            new THREE.BoxGeometry(0.28 * sc, 0.04 * sc, 0.95 * sc),
            bushLightMat
          );
          fern.position.set(Math.sin(ang) * 0.65 * sc, 0.22 * sc, Math.cos(ang) * 0.65 * sc);
          fern.rotation.y = ang;
          fern.rotation.x = -0.25;
          bGroup.add(fern);
        }

        beachGroup.add(bGroup);
      };

      // Distribute Tropical Bushes & Flowering Plants along the Grass-to-Beach Transition & Promenade
      const bushCoords: Array<[number, number, number]> = [
        [-112, 87, 1.1],
        [-92, 90, 0.95],
        [-74, 86.8, 1.15],
        [-58, 91, 0.9],
        [-36, 87, 1.05],
        [-18, 90.5, 1.0],
        [-6, 87.2, 1.1],
        [7.2, 86.8, 0.95],
        [20.8, 86.8, 0.95],
        [32, 90.5, 1.05],
        [52, 87, 1.12],
        [76, 91, 0.95],
        [96, 87, 1.1],
        // Lawn garden accents along the South Promenade
        [9.2, 76, 0.85],
        [18.8, 76, 0.85],
        [9.2, 56, 0.85],
        [18.8, 56, 0.85]
      ];
      bushCoords.forEach(([bx, bz, sc], idx) =>
        createTropicalFlowerBush(bx, bz, sc, flowerColors[idx % flowerColors.length])
      );

      // Decorative Smooth Coastal Rocks & Fallen Coconuts near Palm Groves
      const rockLocations: Array<[number, number, number]> = [
        [-100, 100.5, 1.0],
        [-52, 101, 0.85],
        [-2.5, 95.5, 0.9],
        [23, 93.2, 0.85],
        [54.5, 93.8, 0.95],
        [83.5, 98.2, 1.05]
      ];
      rockLocations.forEach(([rx, rz, sc]) => {
        const rGroup = new THREE.Group();
        rGroup.position.set(rx, 0, rz);
        const mainRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * sc, 1), rockCoastMat);
        mainRock.scale.set(1.3, 0.68, 1.1);
        mainRock.position.y = 0.25 * sc;
        mainRock.castShadow = true;
        rGroup.add(mainRock);

        const sideRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * sc, 1), rockCoastMat);
        sideRock.scale.set(1.1, 0.65, 1.2);
        sideRock.position.set(0.52 * sc, 0.16 * sc, 0.25 * sc);
        rGroup.add(sideRock);

        const fallenCoco = new THREE.Mesh(new THREE.SphereGeometry(0.18 * sc, 10, 10), coconutMat);
        fallenCoco.position.set(-0.45 * sc, 0.16 * sc, 0.35 * sc);
        rGroup.add(fallenCoco);

        beachGroup.add(rGroup);
      });

      // Scattered Shoreline Seashells & Coral Starfish along Z = 121 to 128
      const shellPinkMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.45 });
      const shellCreamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.45 });
      const starfishCoralMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });

      const shellCoords: Array<[number, number, boolean]> = [
        [-84, 125.5, true],
        [-64, 126.8, false],
        [-42, 124.5, true],
        [-26, 127.2, false],
        [-12, 125.8, true],
        [3.5, 126.4, false],
        [26, 125.2, true],
        [44, 127.0, false],
        [68, 125.6, true],
        [90, 126.5, false]
      ];
      shellCoords.forEach(([sx, sz, isStarfish], idx) => {
        if (isStarfish) {
          const star = new THREE.Group();
          star.position.set(sx, 0.08, sz);
          star.rotation.y = idx * 0.7;
          for (let arm = 0; arm < 5; arm++) {
            const aAng = (arm / 5) * Math.PI * 2;
            const ray = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), starfishCoralMat);
            ray.rotation.x = Math.PI / 2;
            ray.rotation.z = -aAng;
            ray.position.set(Math.sin(aAng) * 0.12, 0.02, Math.cos(aAng) * 0.12);
            star.add(ray);
          }
          beachGroup.add(star);
        } else {
          const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI),
            idx % 2 === 0 ? shellPinkMat : shellCreamMat
          );
          shell.rotation.x = -Math.PI / 2;
          shell.scale.set(1.2, 1.0, 0.55);
          shell.position.set(sx, 0.07, sz);
          beachGroup.add(shell);
        }
      });

      // 7. STRIPED RESORT UMBRELLAS, PREMIUM CUSHIONED SUN LOUNGERS & SMALL BEACH TABLES
      // Coordinated Tropical Palette: Turquoise (#06b6d4), Coral (#f43f5e), Sunny Yellow (#facc15), Tropical Orange (#fb923c)
      const resortPalettes = [
        { hex: 0x06b6d4, css: '#06b6d4', cushion: 0x22d3ee },
        { hex: 0xf43f5e, css: '#f43f5e', cushion: 0xfb7185 },
        { hex: 0xfacc15, css: '#facc15', cushion: 0xfde047 },
        { hex: 0xfb923c, css: '#fb923c', cushion: 0xfdba74 }
      ];
      const teakFrameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
      const whiteResortMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });

      const createStripedUmbrellaTexture = (accentCss: string) => {
        const uc = document.createElement('canvas');
        uc.width = 512;
        uc.height = 256;
        const uCtx = uc.getContext('2d')!;
        const stripes = 8;
        const sw = 512 / stripes;
        for (let s = 0; s < stripes; s++) {
          uCtx.fillStyle = s % 2 === 0 ? accentCss : '#ffffff';
          uCtx.fillRect(s * sw, 0, sw + 1, 256);
        }
        // Contrasting border trim at bottom edge of umbrella canopy
        uCtx.fillStyle = accentCss;
        uCtx.fillRect(0, 232, 512, 24);
        const tex = new THREE.CanvasTexture(uc);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      const umbrellaMaterials = resortPalettes.map((p) => ({
        ...p,
        canopyMat: new THREE.MeshStandardMaterial({
          map: createStripedUmbrellaTexture(p.css),
          roughness: 0.45,
          side: THREE.DoubleSide
        }),
        cushionMat: new THREE.MeshStandardMaterial({ color: p.cushion, roughness: 0.5 })
      }));

      const createBeachUmbrellaSpot = (ux: number, uz: number, styleIdx: number) => {
        const style = umbrellaMaterials[styleIdx % umbrellaMaterials.length];
        const spot = new THREE.Group();
        spot.position.set(ux, 0.14, uz);

        addContactShadow(spot, 2.5, 0, 0.2, 0.02);

        // Teakwood umbrella pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 3.3, 12), teakFrameMat);
        pole.position.y = 1.65;
        pole.rotation.z = 0.06;
        pole.castShadow = true;
        spot.add(pole);

        // Rounded 14-segment Striped Umbrella Canopy + Top Finial
        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(2.45, 0.98, 14, 1, true),
          style.canopyMat
        );
        canopy.position.set(-0.1, 3.18, 0);
        canopy.rotation.z = 0.06;
        canopy.castShadow = true;
        spot.add(canopy);

        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), whiteResortMat);
        finial.position.set(-0.13, 3.7, 0);
        spot.add(finial);

        // Small Round Wooden Beach Side Table with Tropical Drink at center
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 16), teakFrameMat);
        tableTop.position.set(0, 0.52, 0.45);
        tableTop.castShadow = true;
        spot.add(tableTop);

        const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.52, 10), teakFrameMat);
        tableLeg.position.set(0, 0.26, 0.45);
        spot.add(tableLeg);

        const drinkCup = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.08, 0.22, 10),
          new THREE.MeshStandardMaterial({ color: style.hex, roughness: 0.3 })
        );
        drinkCup.position.set(0.12, 0.66, 0.45);
        spot.add(drinkCup);

        // Two Premium Sun Loungers with Cushions & Bolster Headrests facing the Ocean (+Z)
        [-1.42, 1.42].forEach((lx) => {
          const lGroup = new THREE.Group();
          lGroup.position.set(lx, 0, 0.4);

          // Teakwood resort base frame & 4 legs
          const frame = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.14, 2.2), teakFrameMat);
          frame.position.y = 0.24;
          frame.castShadow = true;
          lGroup.add(frame);

          [
            [-0.42, -0.92],
            [0.42, -0.92],
            [-0.42, 0.92],
            [0.42, 0.92]
          ].forEach(([legX, legZ]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), teakFrameMat);
            leg.position.set(legX, 0.12, legZ);
            lGroup.add(leg);
          });

          // Plush Cushioned Mattress Pad
          const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 1.55), whiteResortMat);
          mattress.position.set(0, 0.36, 0.28);
          mattress.castShadow = true;
          lGroup.add(mattress);

          // Reclined Cushioned Backrest
          const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.78, 0.12), style.cushionMat);
          backrest.position.set(0, 0.64, -0.68);
          backrest.rotation.x = -0.52;
          backrest.castShadow = true;
          lGroup.add(backrest);

          // Rounded Bolster Head Pillow
          const pillow = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.68, 12), whiteResortMat);
          pillow.rotation.z = Math.PI / 2;
          pillow.position.set(0, 0.92, -0.82);
          lGroup.add(pillow);

          spot.add(lGroup);
        });

        beachGroup.add(spot);
        colliders.push({
          minX: ux - 2.2,
          maxX: ux + 2.2,
          minZ: uz - 1.2,
          maxZ: uz + 1.65
        });
      };

      const umbrellaSpots: Array<[number, number]> = [
        [-98, 114],
        [-72, 116],
        [-48, 114],
        [-22, 116],
        [0, 114],
        [30, 115],
        [52, 116],
        [86, 115]
      ];
      umbrellaSpots.forEach(([ux, uz], idx) => createBeachUmbrellaSpot(ux, uz, idx));

      // 8. WOODEN BEACH HUTS / TIKI CABANAS WITH THATCHED ROOFS & HANGING LANTERNS (X = -35, Z = 102 & X = 42, Z = 102)
      const thatchMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
      const thatchLightMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });

      const createTropicalBeachHut = (hx: number, hz: number, titleText: string, accentHex: string) => {
        const hut = new THREE.Group();
        hut.position.set(hx, 0.15, hz);
        addContactShadow(hut, 4.2, 0, 0, 0.02);

        // Raised Wooden Platform Deck
        const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.26, 5.2), teakFrameMat);
        deck.position.y = 0.13;
        deck.receiveShadow = true;
        deck.castShadow = true;
        hut.add(deck);

        // 4 Bamboo/Timber Corner Posts
        [
          [-2.7, -2.1],
          [2.7, -2.1],
          [-2.7, 2.1],
          [2.7, 2.1]
        ].forEach(([px, pz]) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.6, 12), pilingMat);
          post.position.set(px, 1.9, pz);
          post.castShadow = true;
          hut.add(post);
        });

        // Two-Tiered Thatched Tropical Roof
        const roofLower = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.75, 8), thatchMat);
        roofLower.position.y = 4.35;
        roofLower.rotation.y = Math.PI / 8;
        roofLower.castShadow = true;
        hut.add(roofLower);

        const roofUpper = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.25, 8), thatchLightMat);
        roofUpper.position.y = 5.25;
        roofUpper.rotation.y = Math.PI / 8;
        hut.add(roofUpper);

        // Front Bamboo Refreshment Counter & 3 Tropical Bar Stools
        const counter = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.1, 0.85), teakFrameMat);
        counter.position.set(0, 0.8, 1.6);
        counter.castShadow = true;
        hut.add(counter);

        const counterTop = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 1.05), whiteResortMat);
        counterTop.position.set(0, 1.38, 1.6);
        hut.add(counterTop);

        [-1.4, 0, 1.4].forEach((sx, sIdx) => {
          const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.68, 10), pilingMat);
          stoolLeg.position.set(sx, 0.45, 2.45);
          hut.add(stoolLeg);

          const stoolSeat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.3, 0.12, 14),
            umbrellaMaterials[sIdx % umbrellaMaterials.length].cushionMat
          );
          stoolSeat.position.set(sx, 0.82, 2.45);
          hut.add(stoolSeat);
        });

        // Hanging Warm Decorative Lanterns under the Hut Eaves
        [-2.1, 2.1].forEach((lx) => {
          const lCord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), pilingMat);
          lCord.position.set(lx, 3.35, 1.85);
          hut.add(lCord);

          const lGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), lanternWarmMat);
          lGlobe.position.set(lx, 3.0, 1.85);
          hut.add(lGlobe);
        });

        // Tropical Surfboard Header Sign
        const sc = document.createElement('canvas');
        sc.width = 512;
        sc.height = 128;
        const sCtx2 = sc.getContext('2d')!;
        sCtx2.fillStyle = '#0f172a';
        sCtx2.beginPath();
        sCtx2.roundRect(8, 8, 496, 112, 48);
        sCtx2.fill();
        sCtx2.lineWidth = 8;
        sCtx2.strokeStyle = accentHex;
        sCtx2.stroke();
        sCtx2.fillStyle = '#ffffff';
        sCtx2.font = '900 42px Plus Jakarta Sans, sans-serif';
        sCtx2.textAlign = 'center';
        sCtx2.textBaseline = 'middle';
        sCtx2.fillText(titleText, 256, 66);
        const signTex = new THREE.CanvasTexture(sc);
        signTex.colorSpace = THREE.SRGBColorSpace;

        const signMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(3.4, 0.85),
          new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
        );
        signMesh.position.set(0, 3.38, 2.22);
        hut.add(signMesh);

        beachGroup.add(hut);
        colliders.push({
          minX: hx - 3.3,
          maxX: hx + 3.3,
          minZ: hz - 2.6,
          maxZ: hz + 2.8
        });
      };

      createTropicalBeachHut(-35, 101.5, '🥥 ALOHA TIKI HUT', '#06b6d4');
      createTropicalBeachHut(41, 101.5, '🍹 SUNSET CABANA', '#f43f5e');

      // 9. COASTAL LIFEGUARD TOWER (X = -11, Z = 106)
      const buildLifeguardTower = (lx: number, lz: number) => {
        const lg = new THREE.Group();
        lg.position.set(lx, 0.15, lz);
        addContactShadow(lg, 2.8, 0, 0, 0.02);

        const coralMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.42 });
        const turquoiseMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });
        const glassBlueMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.3,
          roughness: 0.1
        });

        // 4 Angled Timber Stilts
        [
          [-1.35, -1.35],
          [1.35, -1.35],
          [-1.35, 1.35],
          [1.35, 1.35]
        ].forEach(([sx, sz]) => {
          const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.9, 10), postWhiteMat);
          stilt.position.set(sx, 1.45, sz);
          stilt.castShadow = true;
          lg.add(stilt);
        });

        // Cross-bracing beams
        const brace1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 0.14), coralMat);
        brace1.position.set(0, 1.4, -1.35);
        brace1.rotation.z = 0.48;
        lg.add(brace1);

        // Elevated Observation Deck Platform
        const deck = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.24, 4.2), teakFrameMat);
        deck.position.y = 2.95;
        deck.castShadow = true;
        lg.add(deck);

        // Lifeguard Cabin Box
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.35, 2.5), postWhiteMat);
        cabin.position.set(0, 4.22, -0.25);
        cabin.castShadow = true;
        lg.add(cabin);

        // Coral Trim Band & Panoramic Windows
        const trimBand = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.35, 2.58), coralMat);
        trimBand.position.set(0, 3.35, -0.25);
        lg.add(trimBand);

        const frontWin = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.95, 2.58), glassBlueMat);
        frontWin.position.set(0, 4.4, -0.25);
        lg.add(frontWin);

        const sideWin = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.95, 1.65), glassBlueMat);
        sideWin.position.set(0, 4.4, -0.25);
        lg.add(sideWin);

        // Turquoise Pitched Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.25, 4), turquoiseMat);
        roof.position.set(0, 6.0, -0.25);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        lg.add(roof);

        // Front Balcony Railing & Rescue Lifebuoy
        const frontRail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.12), postWhiteMat);
        frontRail.position.set(0, 3.85, 1.9);
        lg.add(frontRail);

        const rescueTorpedo = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.65, 8, 12), coralMat);
        rescueTorpedo.rotation.z = Math.PI / 2;
        rescueTorpedo.position.set(0, 3.55, 1.98);
        lg.add(rescueTorpedo);

        // Access Ladder on the North (-Z) side
        [-0.38, 0.38].forEach((railX) => {
          const lRail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.3, 8), teakFrameMat);
          lRail.position.set(railX, 1.55, -2.15);
          lRail.rotation.x = 0.25;
          lg.add(lRail);
        });
        for (let r = 0; r < 6; r++) {
          const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.76, 8), postWhiteMat);
          rung.rotation.z = Math.PI / 2;
          rung.position.set(0, 0.45 + r * 0.46, -2.48 + r * 0.11);
          lg.add(rung);
        }

        beachGroup.add(lg);
        colliders.push({
          minX: lx - 2.0,
          maxX: lx + 2.0,
          minZ: lz - 2.4,
          maxZ: lz + 2.1
        });
      };
      buildLifeguardTower(-11, 105);

      // 10. BEACH VOLLEYBALL COURT (X = 68, Z = 104)
      const buildBeachVolleyballCourt = (vx: number, vz: number) => {
        const vbGroup = new THREE.Group();
        vbGroup.position.set(vx, 0.18, vz);

        const courtW = 14.0;
        const courtD = 7.6;
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

        // Turquoise Boundary Ribbons on the Sand
        [
          [0, -courtD / 2, courtW, 0.16],
          [0, courtD / 2, courtW, 0.16],
          [-courtW / 2, 0, 0.16, courtD],
          [courtW / 2, 0, 0.16, courtD]
        ].forEach(([lx, lz, lw, ld]) => {
          const ribbon = new THREE.Mesh(new THREE.BoxGeometry(lw, 0.04, ld), lineMat);
          ribbon.position.set(lx, 0.03, lz);
          vbGroup.add(ribbon);
        });

        // Two Timber Volleyball Net Posts
        [-courtD / 2 - 0.3, courtD / 2 + 0.3].forEach((pz) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.55, 12), teakFrameMat);
          post.position.set(0, 1.28, pz);
          post.castShadow = true;
          vbGroup.add(post);

          colliders.push({
            minX: vx - 0.35,
            maxX: vx + 0.35,
            minZ: vz + pz - 0.35,
            maxZ: vz + pz + 0.35
          });
        });

        // Braided Volleyball Net with White Top & Bottom Canvas Tapes
        const vbNet = new THREE.Mesh(
          new THREE.PlaneGeometry(courtD + 0.4, 0.95),
          new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide
          })
        );
        vbNet.rotation.y = Math.PI / 2;
        vbNet.position.set(0, 1.92, 0);
        vbGroup.add(vbNet);

        [2.4, 1.44].forEach((ty) => {
          const tape = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, courtD + 0.5), whiteResortMat);
          tape.position.set(0, ty, 0);
          vbGroup.add(tape);
        });

        // Colorful Tropical Beach Volleyball
        const vBall = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
        );
        vBall.position.set(1.8, 0.3, 0.8);
        vBall.castShadow = true;
        vbGroup.add(vBall);

        beachGroup.add(vbGroup);
      };
      buildBeachVolleyballCourt(68, 103);

      // 11. STANDING SURFBOARDS, BEACH ACCESSORIES & TROPICAL DIRECTIONAL SIGNPOST
      const createSurfboardTexture = (baseHex: string, stripeHex: string) => {
        const sc = document.createElement('canvas');
        sc.width = 128;
        sc.height = 512;
        const sCtx3 = sc.getContext('2d')!;
        sCtx3.fillStyle = baseHex;
        sCtx3.fillRect(0, 0, 128, 512);
        // Center racing stringer & tropical chevrons
        sCtx3.fillStyle = '#ffffff';
        sCtx3.fillRect(56, 0, 16, 512);
        sCtx3.fillStyle = stripeHex;
        sCtx3.fillRect(0, 170, 128, 48);
        sCtx3.fillRect(0, 240, 128, 28);
        const tex = new THREE.CanvasTexture(sc);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      const surfConfigs: Array<[number, number, string, string, number]> = [
        [-29.5, 102.5, '#06b6d4', '#facc15', 0.18],
        [-28.2, 102.8, '#f43f5e', '#ffffff', -0.15],
        [46.5, 102.5, '#fb923c', '#06b6d4', -0.16],
        [47.8, 102.8, '#facc15', '#f43f5e', 0.14],
        [8.5, 111.5, '#06b6d4', '#f43f5e', -0.12],
        [19.5, 111.5, '#f43f5e', '#facc15', 0.12]
      ];
      surfConfigs.forEach(([sx, sz, c1, c2, tilt]) => {
        const board = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.34, 1.65, 8, 14),
          new THREE.MeshStandardMaterial({
            map: createSurfboardTexture(c1, c2),
            roughness: 0.25,
            metalness: 0.1
          })
        );
        board.scale.set(1.0, 1.0, 0.22);
        board.position.set(sx, 1.15, sz);
        board.rotation.z = tilt;
        board.rotation.x = -0.12;
        board.castShadow = true;
        beachGroup.add(board);
      });

      // Tropical Directional Signpost at the Boardwalk Entrance (X = 9.2, Z = 90.5)
      const buildTropicalSignpost = (sx: number, sz: number) => {
        const signGroup = new THREE.Group();
        signGroup.position.set(sx, 0, sz);
        addContactShadow(signGroup, 0.9, 0, 0, 0.03);

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 3.3, 10), teakFrameMat);
        post.position.y = 1.65;
        post.castShadow = true;
        signGroup.add(post);

        const boards: Array<{ label: string; bg: string; y: number; rotY: number }> = [
          { label: '🥥 TIKI HUT & LIFEGUARD ←', bg: '#06b6d4', y: 2.85, rotY: 0.15 },
          { label: '🌊 BOARDWALK PIER ↑', bg: '#f43f5e', y: 2.38, rotY: -0.12 },
          { label: '🏐 BEACH VOLLEYBALL →', bg: '#f59e0b', y: 1.92, rotY: 0.1 }
        ];

        boards.forEach((b) => {
          const bc = document.createElement('canvas');
          bc.width = 512;
          bc.height = 112;
          const bCtx = bc.getContext('2d')!;
          bCtx.fillStyle = b.bg;
          bCtx.beginPath();
          bCtx.roundRect(6, 6, 500, 100, 22);
          bCtx.fill();
          bCtx.lineWidth = 6;
          bCtx.strokeStyle = '#ffffff';
          bCtx.stroke();
          bCtx.fillStyle = '#ffffff';
          bCtx.font = '900 32px Plus Jakarta Sans, sans-serif';
          bCtx.textAlign = 'center';
          bCtx.textBaseline = 'middle';
          bCtx.fillText(b.label, 256, 58);
          const bTex = new THREE.CanvasTexture(bc);
          bTex.colorSpace = THREE.SRGBColorSpace;

          const plaque = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 0.38, 0.08),
            new THREE.MeshBasicMaterial({ map: bTex })
          );
          plaque.position.y = b.y;
          plaque.rotation.y = b.rotY;
          signGroup.add(plaque);
        });

        beachGroup.add(signGroup);
        colliders.push({
          minX: sx - 0.55,
          maxX: sx + 0.55,
          minZ: sz - 0.55,
          maxZ: sz + 0.55
        });
      };
      buildTropicalSignpost(9.2, 90.5);

      // Ocean Waterline Colliders (Keep player on the Sandy Beach Z <= 132, except along the Walkable Boardwalk Pier X = 14 where Z goes up to 170)
      colliders.push(
        { minX: -220, maxX: pierX - pierW / 2 + 0.3, minZ: 132.5, maxZ: 250 },
        { minX: pierX + pierW / 2 - 0.3, maxX: 220, minZ: 132.5, maxZ: 250 },
        { minX: pierX - pierW / 2 - 1, maxX: pierX + pierW / 2 + 1, minZ: pierEndZ - 0.8, maxZ: 250 }
      );

      scene.add(beachGroup);
    };
    buildSouthBeachAndOcean();

    // D. EAST HORIZON (+X): Extended Sandy Beach Behind Era Football Club, Connecting Walkway Patch,
    //    Era Fishing Club Wooden Pier, Bait & Quiz Kiosk, $1-$10 Fish Market & Animated 3D Swimming Fish Lagoon
    const eastLagoonFishes: Array<{
      group: THREE.Group;
      centerX: number;
      centerZ: number;
      radiusX: number;
      radiusZ: number;
      speed: number;
      phase: number;
      tailMesh: THREE.Mesh;
    }> = [];

    const buildEastBeachAndFishingClub = () => {
      const eastGroup = new THREE.Group();

      // 1. Extend East Sports Promenade Walkway Patch past Tennis & Football all the way to the East Beach & Fishing Pier (X = 16 to 122, Z = 0)
      const eastPatchLen = 58;
      const eastPatchBed = new THREE.Mesh(new THREE.BoxGeometry(eastPatchLen, 0.14, 6.4), plazaMat);
      eastPatchBed.position.set(93, 0.07, 0);
      eastPatchBed.receiveShadow = true;
      eastGroup.add(eastPatchBed);
      [-3.36, 3.36].forEach((cz) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(eastPatchLen, 0.24, 0.32), curbMatShared);
        curb.position.set(93, 0.12, cz);
        curb.receiveShadow = true;
        eastGroup.add(curb);
      });

      // South-East Football Club Side Connector Patch (Z = 51, X = 78 to 118) directly behind the South Goal of Era Football Club
      const fbSouthPatch = new THREE.Mesh(new THREE.BoxGeometry(42, 0.14, 5.2), plazaMat);
      fbSouthPatch.position.set(98, 0.07, 51);
      fbSouthPatch.receiveShadow = true;
      eastGroup.add(fbSouthPatch);
      [-2.75, 2.75].forEach((cz) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 0.28), curbMatShared);
        curb.position.set(98, 0.12, 51 + cz);
        eastGroup.add(curb);
      });

      // 2. EXTENDED GOLDEN SANDY BEACH WRAPPING BEHIND ERA FOOTBALL CLUB & TENNIS COURT (X = 100 to 146, Z = -95 to +136)
      const eastSandCanvas = document.createElement('canvas');
      eastSandCanvas.width = 512;
      eastSandCanvas.height = 512;
      const esCtx = eastSandCanvas.getContext('2d')!;
      const esGrad = esCtx.createLinearGradient(0, 0, 512, 0);
      esGrad.addColorStop(0.0, '#fef08a');  // Upper dune golden sand behind Football Club
      esGrad.addColorStop(0.45, '#fde68a'); // Mid beach warm sand
      esGrad.addColorStop(0.76, '#fcd34d'); // Lower beach honey sand
      esGrad.addColorStop(0.9, '#f59e0b');  // Moist tidal shoreline
      esGrad.addColorStop(1.0, '#b45309');  // Wet sand under turquoise shallows
      esCtx.fillStyle = esGrad;
      esCtx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 7000; i++) {
        esCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(180,83,9,0.14)';
        esCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
      const eastSandTex = new THREE.CanvasTexture(eastSandCanvas);
      eastSandTex.colorSpace = THREE.SRGBColorSpace;
      eastSandTex.wrapS = THREE.ClampToEdgeWrapping;
      eastSandTex.wrapT = THREE.RepeatWrapping;
      eastSandTex.repeat.set(1, 6);

      const eastSandGeo = new THREE.PlaneGeometry(46, 232, 24, 72);
      const esPos = eastSandGeo.attributes.position;
      for (let i = 0; i < esPos.count; i++) {
        const vx = esPos.getX(i); // local X (-23..23), world X = 123 + vx (100..146)
        const vy = esPos.getY(i); // local Y (-116..116), world Z = 20 - vy (-96..136)
        const worldX = 123 + vx;
        const worldZ = 20 - vy;
        let elev = 0.05;
        if (worldX < 134) {
          const wave = Math.sin(worldZ * 0.08) * Math.cos((worldX - 102) * 0.14) * 0.18;
          elev = Math.max(0.04, 0.14 + wave);
        } else {
          // Gentle natural slope into the East Turquoise Fishing Lagoon (X = 134..146)
          const tShore = (worldX - 134) / 12;
          elev = -tShore * 0.38;
        }
        esPos.setZ(i, elev);
      }
      eastSandGeo.computeVertexNormals();

      const eastSandBeach = new THREE.Mesh(
        eastSandGeo,
        new THREE.MeshStandardMaterial({ map: eastSandTex, roughness: 0.86, metalness: 0.03 })
      );
      eastSandBeach.rotation.x = -Math.PI / 2;
      eastSandBeach.position.set(123, 0.03, 20);
      eastSandBeach.receiveShadow = true;
      eastGroup.add(eastSandBeach);

      // Rounded Sandstone Edging Border between the Sports Park Grass Lawn and the Extended East Sandy Beach (X = 101.5)
      const edgeStoneMat1 = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.55 });
      const edgeStoneMat2 = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
      for (let sz = -86; sz <= 86; sz += 3.2) {
        if (Math.abs(sz - 0) < 3.8 || Math.abs(sz - 51) < 3.4) continue; // Keep walking patches open
        const stone = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.24, 2.9),
          Math.abs(Math.round(sz)) % 2 === 0 ? edgeStoneMat1 : edgeStoneMat2
        );
        stone.position.set(101.5, 0.12, sz);
        stone.receiveShadow = true;
        eastGroup.add(stone);
      }

      // 3. SCENIC WOODEN COASTAL BOARDWALK PATCH BEHIND ERA FOOTBALL CLUB (X = 114, Z = -60 to +92)
      const plankCanvas = document.createElement('canvas');
      plankCanvas.width = 256;
      plankCanvas.height = 256;
      const pCtx = plankCanvas.getContext('2d')!;
      pCtx.fillStyle = '#92400e';
      pCtx.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y += 24) {
        pCtx.fillStyle = y % 48 === 0 ? '#b45309' : '#78350f';
        pCtx.fillRect(0, y, 256, 21);
        pCtx.fillStyle = '#451a03';
        pCtx.fillRect(0, y + 21, 256, 3);
      }
      const eastPlankTex = new THREE.CanvasTexture(plankCanvas);
      eastPlankTex.colorSpace = THREE.SRGBColorSpace;
      eastPlankTex.wrapS = eastPlankTex.wrapT = THREE.RepeatWrapping;
      eastPlankTex.repeat.set(2, 28);

      const eastBoardwalkMat = new THREE.MeshStandardMaterial({ map: eastPlankTex, roughness: 0.68 });
      const timberDarkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
      const pilingDarkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
      const whitePostMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
      const goldRopeMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.55 });
      const lanternGlowMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9
      });

      const eastWalkLen = 152;
      const eastBoardwalk = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.18, eastWalkLen),
        eastBoardwalkMat
      );
      eastBoardwalk.position.set(114, 0.14, 16);
      eastBoardwalk.receiveShadow = true;
      eastGroup.add(eastBoardwalk);

      [-2.92, 2.92].forEach((xOff) => {
        const curbBeam = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, eastWalkLen), timberDarkMat);
        curbBeam.position.set(114 + xOff, 0.17, 16);
        eastGroup.add(curbBeam);
      });

      // 4. EAST CRYSTAL SHALLOW WATER, TURQUOISE FISHING LAGOON & ANIMATED SURF FOAM (X = 136 to 245)
      const eastShallowWater = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 250, 8, 48),
        new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0891b2,
          emissiveIntensity: 0.15,
          roughness: 0.55,
          metalness: 0.04,
          transparent: true,
          opacity: 0.74
        })
      );
      eastShallowWater.rotation.x = -Math.PI / 2;
      eastShallowWater.position.set(143, -0.02, 16);
      eastGroup.add(eastShallowWater);
      oceanWaveLayers.push({ mesh: eastShallowWater, baseY: -0.02, speed: 2.0, amp: 0.06 });

      const eastDeepOcean = new THREE.Mesh(
        new THREE.PlaneGeometry(115, 270),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.16,
          roughness: 0.58,
          metalness: 0.04
        })
      );
      eastDeepOcean.rotation.x = -Math.PI / 2;
      eastDeepOcean.position.set(202, -0.09, 16);
      eastGroup.add(eastDeepOcean);
      oceanWaveLayers.push({ mesh: eastDeepOcean, baseY: -0.09, speed: 1.5, amp: 0.09 });

      // White Shoreline Surf Foam Strips along the East Beach (X = 136..141)
      const eastFoamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72
      });
      [0, 1, 2].forEach((fIdx) => {
        const foamLine = new THREE.Mesh(new THREE.PlaneGeometry(1.4 + fIdx * 0.3, 235), eastFoamMat);
        foamLine.rotation.x = -Math.PI / 2;
        foamLine.position.set(136.5 + fIdx * 2.4, 0.06, 18);
        eastGroup.add(foamLine);
      });

      // 5. ERA FISHING CLUB WOODEN PIER & ANGLER DOCK RIGHT BEHIND ERA FOOTBALL CLUB (X = 116 to 158, Z = 25)
      const fishingPierGroup = new THREE.Group();
      const fpCenterZ = 25; // Directly aligned behind Era Football Club (which is at X = 78, Z = 25)
      const fpStartX = 116.8;
      const fpEndX = 158.0;
      const fpLen = fpEndX - fpStartX;
      const fpW = 8.6;

      const fpDeck = new THREE.Mesh(
        new THREE.BoxGeometry(fpLen, 0.32, fpW),
        eastBoardwalkMat
      );
      fpDeck.position.set(fpStartX + fpLen / 2, 0.24, fpCenterZ);
      fpDeck.receiveShadow = true;
      fpDeck.castShadow = true;
      fpDeck.userData = { isFishingStation: true };
      fishingPierGroup.add(fpDeck);
      clickableBuildingMeshes.push(fpDeck);

      // Wider Fishing Pavilion Head at the Ocean Tip of the East Pier (X = 152 to 162, Z = 17 to 33)
      const fpHeadDeck = new THREE.Mesh(
        new THREE.BoxGeometry(10.5, 0.34, 15.6),
        eastBoardwalkMat
      );
      fpHeadDeck.position.set(156.5, 0.25, fpCenterZ);
      fpHeadDeck.receiveShadow = true;
      fpHeadDeck.userData = { isFishingStation: true };
      fishingPierGroup.add(fpHeadDeck);
      clickableBuildingMeshes.push(fpHeadDeck);

      // Pilings, White Nautical Posts, Rope Railings & Warm Lanterns along the East Fishing Pier
      for (let px = fpStartX + 2; px <= fpEndX - 1; px += 5.5) {
        [-fpW / 2 + 0.35, fpW / 2 - 0.35].forEach((zOff) => {
          const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 3.2, 10), pilingDarkMat);
          piling.position.set(px, -1.0, fpCenterZ + zOff);
          fishingPierGroup.add(piling);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 1.3, 10), whitePostMat);
          post.position.set(px, 1.02, fpCenterZ + zOff);
          fishingPierGroup.add(post);

          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), goldRopeMat);
          cap.position.set(px, 1.7, fpCenterZ + zOff);
          fishingPierGroup.add(cap);
        });
      }

      [-fpW / 2 + 0.35, fpW / 2 - 0.35].forEach((zOff) => {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, fpLen - 4, 8), goldRopeMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(fpStartX + fpLen / 2 - 1, 1.45, fpCenterZ + zOff);
        fishingPierGroup.add(rail);
      });

      // Mounted Wooden Fishing Rod Stands, Tackle Boxes, Fish Buckets & Floating Red/White Bobbers at the Pier Tip
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 });
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      const bobberRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const bucketBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

      [-5.2, -1.8, 1.8, 5.2].forEach((zOffset, rIdx) => {
        const stationZ = fpCenterZ + zOffset;
        const stationX = 160.8;

        // Blue Angler Fish Bucket & Wooden Stool on the Pier
        const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.52, 12), bucketBlueMat);
        bucket.position.set(stationX - 1.1, 0.68, stationZ + 0.55);
        bucket.userData = { isFishingStation: true };
        fishingPierGroup.add(bucket);
        clickableBuildingMeshes.push(bucket);

        // Angled Fishing Rod extending over the East Lagoon
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.06, 3.8, 8), rodMat);
        rod.position.set(stationX + 1.1, 1.85, stationZ);
        rod.rotation.z = -0.78;
        rod.userData = { isFishingStation: true };
        fishingPierGroup.add(rod);
        clickableBuildingMeshes.push(rod);

        // Vertical Fishing Line dropping down to the Lagoon Water
        const lineDrop = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.95, 6), lineMat);
        lineDrop.position.set(stationX + 2.45, 1.48, stationZ);
        fishingPierGroup.add(lineDrop);

        // Floating Red & White Fishing Bobber on the Lagoon
        const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), bobberRedMat);
        bobber.position.set(stationX + 2.45, 0.04, stationZ);
        bobber.userData = { isFishingStation: true, phase: rIdx * 1.4 };
        fishingPierGroup.add(bobber);
        clickableBuildingMeshes.push(bobber);
      });

      // Glowing Cyan Interactive Cast Ring on the Pier Deck (X = 155.5, Z = 25)
      const castPad = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.4, 0.1, 28),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.45 })
      );
      castPad.position.set(155.5, 0.46, fpCenterZ);
      castPad.userData = { isFishingStation: true };
      fishingPierGroup.add(castPad);
      clickableBuildingMeshes.push(castPad);

      eastGroup.add(fishingPierGroup);

      // 6. BAIT & QUIZ SHACK ("🪱 COLLECT BAIT • COURSE QUIZ") & FISH MARKET STALL ("🐟 FISH MARKET • $1 TO $10")
      const thatchRoofMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.82 });
      const thatchTopMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.78 });
      const teakMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.62 });

      const buildFishingClubKiosk = (
        kx: number,
        kz: number,
        titleText: string,
        subText: string,
        accentHex: string
      ) => {
        const kiosk = new THREE.Group();
        kiosk.position.set(kx, 0.14, kz);

        const baseDeck = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.26, 5.4), teakMat);
        baseDeck.position.y = 0.13;
        baseDeck.receiveShadow = true;
        baseDeck.userData = { isFishingStation: true };
        kiosk.add(baseDeck);
        clickableBuildingMeshes.push(baseDeck);

        [
          [-2.9, -2.2],
          [2.9, -2.2],
          [-2.9, 2.2],
          [2.9, 2.2]
        ].forEach(([px, pz]) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.7, 10), pilingDarkMat);
          post.position.set(px, 1.95, pz);
          post.castShadow = true;
          kiosk.add(post);
        });

        const roof1 = new THREE.Mesh(new THREE.ConeGeometry(5.0, 1.75, 8), thatchRoofMat);
        roof1.position.y = 4.4;
        roof1.rotation.y = Math.PI / 8;
        roof1.castShadow = true;
        roof1.userData = { isFishingStation: true };
        kiosk.add(roof1);
        clickableBuildingMeshes.push(roof1);

        const roof2 = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.25, 8), thatchTopMat);
        roof2.position.y = 5.3;
        roof2.rotation.y = Math.PI / 8;
        kiosk.add(roof2);

        // Front Counter facing West (-X) toward Era Football Club & the Boardwalk
        const counter = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.12, 4.8), teakMat);
        counter.position.set(-1.75, 0.82, 0);
        counter.castShadow = true;
        counter.userData = { isFishingStation: true };
        kiosk.add(counter);
        clickableBuildingMeshes.push(counter);

        const counterTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 5.1), whitePostMat);
        counterTop.position.set(-1.75, 1.42, 0);
        kiosk.add(counterTop);

        // High-Contrast Signboard on the Kiosk
        const sc = document.createElement('canvas');
        sc.width = 512;
        sc.height = 160;
        const sCtx2 = sc.getContext('2d')!;
        sCtx2.fillStyle = '#0f172a';
        sCtx2.beginPath();
        sCtx2.roundRect(8, 8, 496, 144, 36);
        sCtx2.fill();
        sCtx2.lineWidth = 8;
        sCtx2.strokeStyle = accentHex;
        sCtx2.stroke();
        sCtx2.fillStyle = '#ffffff';
        sCtx2.font = '900 34px Plus Jakarta Sans, sans-serif';
        sCtx2.textAlign = 'center';
        sCtx2.fillText(titleText, 256, 64);
        sCtx2.fillStyle = accentHex;
        sCtx2.font = '800 24px Plus Jakarta Sans, sans-serif';
        sCtx2.fillText(subText, 256, 114);
        const signTex = new THREE.CanvasTexture(sc);
        signTex.colorSpace = THREE.SRGBColorSpace;

        const signPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 1.25),
          new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide })
        );
        signPlane.rotation.y = -Math.PI / 2;
        signPlane.position.set(-2.35, 3.45, 0);
        signPlane.userData = { isFishingStation: true };
        kiosk.add(signPlane);
        clickableBuildingMeshes.push(signPlane);

        eastGroup.add(kiosk);
        colliders.push({
          minX: kx - 3.3,
          maxX: kx + 3.3,
          minZ: kz - 2.6,
          maxZ: kz + 2.6
        });
      };

      buildFishingClubKiosk(
        121.5,
        13.5,
        '🪱 BAIT & QUIZ HUT',
        'ANSWER CLASS QUESTIONS → GET BAIT',
        '#22d3ee'
      );
      buildFishingClubKiosk(
        121.5,
        36.5,
        '🐟 ERA FISH MARKET',
        'SELL FISH: $1 • $2 • $5 • $10 DOLLARS',
        '#10b981'
      );

      // 7. ANIMATED 3D TROPICAL FISH SWIMMING IN THE EAST LAGOON AROUND THE FISHING PIER (X = 141..168, Z = 4..46)
      const fishColors = [0xf97316, 0x06b6d4, 0xfacc15, 0xf43f5e, 0x10b981, 0xa855f7, 0x3b82f6];
      for (let f = 0; f < 16; f++) {
        const fishGroup = new THREE.Group();
        const fCol = fishColors[f % fishColors.length];
        const fMat = new THREE.MeshStandardMaterial({
          color: fCol,
          emissive: fCol,
          emissiveIntensity: 0.25,
          roughness: 0.25
        });

        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.52, 6, 10), fMat);
        body.rotation.x = Math.PI / 2;
        body.scale.set(0.75, 1.0, 1.15);
        fishGroup.add(body);

        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.38, 4), fMat);
        tail.rotation.x = -Math.PI / 2;
        tail.position.z = -0.45;
        fishGroup.add(tail);

        const cx = 143 + (f % 4) * 5.2;
        const cz = 8 + Math.floor(f / 4) * 11.5;
        fishGroup.position.set(cx, 0.02, cz);
        fishGroup.userData = { isFishingStation: true };
        eastGroup.add(fishGroup);

        eastLagoonFishes.push({
          group: fishGroup,
          centerX: cx,
          centerZ: cz,
          radiusX: 1.8 + (f % 3) * 0.9,
          radiusZ: 2.2 + (f % 4) * 0.8,
          speed: 0.9 + (f % 5) * 0.28,
          phase: f * 0.9,
          tailMesh: tail
        });
      }

      // 8. PALM TREES, STRIPED RESORT UMBRELLAS & SUN LOUNGERS ON THE EXTENDED EAST BEACH BEHIND FOOTBALL CLUB
      const eastPalmTrunkMat1 = new THREE.MeshStandardMaterial({ color: 0x9a5b25, roughness: 0.82 });
      const eastPalmTrunkMat2 = new THREE.MeshStandardMaterial({ color: 0x7c4316, roughness: 0.88 });
      const eastPalmLeafMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45, side: THREE.DoubleSide });
      const eastPalmLeafMat2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5, side: THREE.DoubleSide });

      const spawnEastBeachPalm = (px: number, pz: number, sc = 1.12, lean = 1) => {
        const pGroup = new THREE.Group();
        pGroup.position.set(px, 0, pz);
        let curX = 0;
        let curY = 0;
        for (let s = 0; s < 5; s++) {
          const segH = 1.2 * sc;
          const t = s / 5;
          const seg = new THREE.Mesh(
            new THREE.CylinderGeometry((0.39 - t * 0.19) * sc, (0.42 - t * 0.19) * sc, segH, 9),
            s % 2 === 0 ? eastPalmTrunkMat1 : eastPalmTrunkMat2
          );
          const tilt = (t * t * 0.38 + t * 0.07) * lean;
          seg.position.set(curX + Math.sin(tilt) * (segH * 0.5), curY + segH * 0.5, 0);
          seg.rotation.z = -tilt;
          seg.castShadow = s % 2 === 0;
          pGroup.add(seg);
          curX += Math.sin(tilt) * segH;
          curY += Math.cos(tilt) * segH * 0.96;
        }
        const crown = new THREE.Group();
        crown.position.set(curX, curY, 0);
        for (let f = 0; f < 7; f++) {
          const ang = (f / 7) * Math.PI * 2;
          const frond = new THREE.Group();
          frond.rotation.y = ang;
          let fy = 0.06 * sc;
          let fz = 0.14 * sc;
          [0.18, 0.56].forEach((pitch, aIdx) => {
            const sLen = (1.35 - aIdx * 0.2) * sc;
            const leaflet = new THREE.Mesh(
              new THREE.BoxGeometry(0.72 * sc, 0.04 * sc, sLen),
              f % 2 === 0 ? eastPalmLeafMat1 : eastPalmLeafMat2
            );
            leaflet.position.set(0, fy - Math.sin(pitch) * (sLen * 0.5), fz + Math.cos(pitch) * (sLen * 0.5));
            leaflet.rotation.x = pitch;
            frond.add(leaflet);
            fy -= Math.sin(pitch) * sLen;
            fz += Math.cos(pitch) * sLen;
          });
          crown.add(frond);
        }
        pGroup.add(crown);
        swayingPalmCrowns.push({ group: crown, phase: (px + pz) * 0.22 });
        eastGroup.add(pGroup);
        colliders.push({ minX: px - 0.65, maxX: px + 0.65, minZ: pz - 0.65, maxZ: pz + 0.65 });
      };

      const eastPalmSpots: Array<[number, number, number, number]> = [
        [107, -64, 1.15, 1],
        [108, -38, 1.18, -1],
        [106, -12, 1.14, 1],
        [107, 10, 1.2, 1],
        [107, 42, 1.18, -1],
        [108, 66, 1.16, 1],
        [109, 84, 1.22, -1],
        [124, -22, 1.15, 1],
        [125, 56, 1.18, 1],
        [124, 78, 1.16, -1]
      ];
      eastPalmSpots.forEach(([px, pz, sc, ld]) => spawnEastBeachPalm(px, pz, sc, ld));

      // East Beach Umbrellas & Sun Loungers facing the East Turquoise Lagoon (+X)
      const eastUmbrellaCols = ['#06b6d4', '#f43f5e', '#facc15', '#fb923c'];
      const eastUmbrellaCoords: Array<[number, number]> = [
        [126, -46],
        [127, -8],
        [127, 48],
        [126, 70],
        [125, 92]
      ];
      eastUmbrellaCoords.forEach(([ux, uz], idx) => {
        const uGroup = new THREE.Group();
        uGroup.position.set(ux, 0.14, uz);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 3.2, 10), teakMat);
        pole.position.y = 1.6;
        pole.castShadow = true;
        uGroup.add(pole);

        const uc = document.createElement('canvas');
        uc.width = 256;
        uc.height = 128;
        const uCtx = uc.getContext('2d')!;
        for (let s = 0; s < 8; s++) {
          uCtx.fillStyle = s % 2 === 0 ? eastUmbrellaCols[idx % eastUmbrellaCols.length] : '#ffffff';
          uCtx.fillRect(s * 32, 0, 33, 128);
        }
        const canopyTex = new THREE.CanvasTexture(uc);
        canopyTex.colorSpace = THREE.SRGBColorSpace;

        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(2.35, 0.95, 12, 1, true),
          new THREE.MeshStandardMaterial({ map: canopyTex, roughness: 0.45, side: THREE.DoubleSide })
        );
        canopy.position.y = 3.1;
        canopy.castShadow = true;
        uGroup.add(canopy);

        [-1.35, 1.35].forEach((lz) => {
          const lounger = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.24, 0.95), whitePostMat);
          lounger.position.set(0.3, 0.22, lz);
          lounger.castShadow = true;
          uGroup.add(lounger);
        });

        eastGroup.add(uGroup);
        colliders.push({ minX: ux - 1.6, maxX: ux + 1.6, minZ: uz - 2.1, maxZ: uz + 2.1 });
      });

      // East Shoreline Water Colliders (Allow player onto the East Sandy Beach X <= 135, and all the way out onto the East Fishing Pier X <= 160.5 when Z is between 17.5 and 32.5)
      colliders.push(
        { minX: 135.5, maxX: 245, minZ: -140, maxZ: fpCenterZ - 7.6 },
        { minX: 135.5, maxX: 245, minZ: fpCenterZ + 7.6, maxZ: 132.5 },
        { minX: 161.2, maxX: 245, minZ: fpCenterZ - 8.5, maxZ: fpCenterZ + 8.5 }
      );

      scene.add(eastGroup);
    };
    buildEastBeachAndFishingClub();

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

    const treeCoords = [
      [-22, -38, 1.2], [22, -38, 1.15], [-24, 38, 1.2], [24, 38, 1.25],
      [-28, -8, 1.05], [28, -8, 1.1], [-28, 10, 1.05], [28, 10, 1.1],
      [-18, -58, 1.3], [18, -58, 1.3], [-18, 60, 1.3], [26, 60, 1.3]
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
    function createNameplateSprite(name: string, cohort: string) {
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
    }

    function buildCharacterAvatar(opts: {
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
    }) {
      const root = new THREE.Group();
      const segs = currentQuality === 'high' ? 12 : currentQuality === 'medium' ? 10 : 8;

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
        'campus'
      );

      // Scale anatomical studio mesh (2.15m) to match campus world scale (~3.12m)
      built.root.scale.setScalar(1.45);
      root.add(built.root);

      const nameplate = createNameplateSprite(opts.name, opts.cohort);
      root.add(nameplate);

      return {
        root,
        hipsGroup: built.hipsGroup,
        defaultHipsY: built.hipsGroup.position.y,
        vehicleGroup: built.vehicleGroup,
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

    // ============================================================================
    // 3D FISHING POLE IN CHARACTER'S RIGHT HAND + 3D LINE, BOBBER, SPLASH & CATCHES
    // ============================================================================
    const createPlayerFishingPoleMesh = () => {
      const poleGroup = new THREE.Group();
      // Position in character's right hand extending forward
      poleGroup.position.set(0, -0.54, 0.14);
      poleGroup.rotation.set(Math.PI / 2.2, 0, 0);

      const corkMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
      const goldReelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.45 });
      const rodCarbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.25 });
      const rodAccentMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 });

      // Cork Grip Handle
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.44, 10), corkMat);
      grip.position.set(0, 0.1, 0);
      poleGroup.add(grip);

      // Spinning Reel + Crank Handle
      const reelPivot = new THREE.Group();
      reelPivot.position.set(0.04, 0.28, 0.06);
      const reelBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), goldReelMat);
      reelBody.rotation.z = Math.PI / 2;
      reelPivot.add(reelBody);
      const reelCrank = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.09, 0.018), rodAccentMat);
      reelCrank.position.set(0.052, 0.03, 0);
      reelPivot.add(reelCrank);
      poleGroup.add(reelPivot);

      // Lower Tapered Fishing Rod Shaft
      const shaftLower = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 0.95, 10), rodCarbonMat);
      shaftLower.position.set(0, 0.78, 0);
      poleGroup.add(shaftLower);

      const shaftBand = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.022, 0.14, 10), rodAccentMat);
      shaftBand.position.set(0, 0.45, 0);
      poleGroup.add(shaftBand);

      const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.004, 6, 12), goldReelMat);
      lowerRing.position.set(0, 0.85, 0.022);
      poleGroup.add(lowerRing);

      // Flexible Upper Rod Shaft Pivot (bends dynamically when a fish or trash pulls on the line!)
      const upperPivot = new THREE.Group();
      upperPivot.position.set(0, 1.25, 0);
      poleGroup.add(upperPivot);

      const shaftUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.018, 0.96, 10), rodCarbonMat);
      shaftUpper.position.set(0, 0.48, 0);
      upperPivot.add(shaftUpper);

      // Line Guide Rings along Upper Rod
      [0.12, 0.58, 0.93].forEach((gy) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 6, 12), goldReelMat);
        ring.position.set(0, gy, 0.02);
        upperPivot.add(ring);
      });

      // Tip Marker at the very end of the flexible upper rod for 3D fishing line attachment
      const rodTip = new THREE.Object3D();
      rodTip.position.set(0, 0.96, 0.02);
      upperPivot.add(rodTip);

      poleGroup.visible = false;
      return { group: poleGroup, rodTip, upperPivot, reelPivot };
    };

    let playerFishingPole = createPlayerFishingPoleMesh();
    playerRig.rightArm.add(playerFishingPole.group);

    // 3D World Fishing Line (13-point catenary curve), Bobber, Splash Droplets, Fish & Trash
    const fishingWorldGroup = new THREE.Group();
    fishingWorldGroup.visible = false;
    scene.add(fishingWorldGroup);

    const FISHING_LINE_SEGMENTS = 12;
    const fishingLinePositions = new Float32Array((FISHING_LINE_SEGMENTS + 1) * 3);
    const fishingLineGeo = new THREE.BufferGeometry();
    fishingLineGeo.setAttribute('position', new THREE.BufferAttribute(fishingLinePositions, 3));
    const fishingLine3D = new THREE.Line(
      fishingLineGeo,
      new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.95 })
    );
    fishingLine3D.frustumCulled = false;
    fishingWorldGroup.add(fishingLine3D);

    const bobber3D = new THREE.Group();
    const bobberTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.22 })
    );
    bobberTop.position.y = 0.08;
    bobber3D.add(bobberTop);

    const bobberCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.07, 14),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    bobberCollar.position.y = 0.06;
    bobber3D.add(bobberCollar);

    const bobberStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    bobberStick.position.y = 0.33;
    bobber3D.add(bobberStick);

    const bobberRipple1 = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.48, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    bobberRipple1.rotation.x = -Math.PI / 2;
    bobberRipple1.position.y = 0.05;
    bobber3D.add(bobberRipple1);

    const bobberRipple2 = new THREE.Mesh(
      new THREE.RingGeometry(0.56, 0.72, 24),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    bobberRipple2.rotation.x = -Math.PI / 2;
    bobberRipple2.position.y = 0.04;
    bobber3D.add(bobberRipple2);

    const bobberRipple3 = new THREE.Mesh(
      new THREE.RingGeometry(0.82, 0.96, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    bobberRipple3.rotation.x = -Math.PI / 2;
    bobberRipple3.position.y = 0.035;
    bobber3D.add(bobberRipple3);

    // 3D Floating "❗ BITE!" Sprite above the bobber when a fish/trash bites
    const createBiteAlertSprite = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 96;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.96)';
        ctx.beginPath();
        ctx.roundRect(12, 10, 232, 74, 24);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FEF08A';
        ctx.stroke();
        ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❗ BITE!', 128, 48);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      sp.scale.set(1.6, 0.6, 1);
      sp.position.set(0, 1.05, 0);
      sp.visible = false;
      return sp;
    };
    const biteAlertSprite = createBiteAlertSprite();
    bobber3D.add(biteAlertSprite);
    fishingWorldGroup.add(bobber3D);

    // 3D Water Splash Droplets Burst Group (14 water droplets bursting in parabolic arcs)
    const splashBurstGroup = new THREE.Group();
    const splashDropGeo = new THREE.SphereGeometry(0.075, 8, 8);
    const splashDropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 });
    const splashDroplets: Array<{ mesh: THREE.Mesh; angle: number; speed: number; peakY: number }> = [];
    for (let i = 0; i < 14; i++) {
      const dropMesh = new THREE.Mesh(splashDropGeo, splashDropMat);
      dropMesh.visible = false;
      splashBurstGroup.add(dropMesh);
      splashDroplets.push({
        mesh: dropMesh,
        angle: (i / 14) * Math.PI * 2 + (i % 2) * 0.2,
        speed: 0.65 + (i % 4) * 0.28,
        peakY: 0.55 + (i % 3) * 0.35
      });
    }
    fishingWorldGroup.add(splashBurstGroup);

    // 3D Detailed Leaping Fish Mesh (Body, Belly Stripe, Dorsal Fin, Pectoral Fins, Tail & Eyes)
    const leapingFish3D = new THREE.Group();
    const leapingFishMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.25,
      roughness: 0.22
    });
    const leapingFishFinMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.18,
      roughness: 0.3
    });
    const lfBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.72, 10, 14), leapingFishMat);
    lfBody.rotation.x = Math.PI / 2;
    lfBody.scale.set(0.75, 1.0, 1.25);
    leapingFish3D.add(lfBody);

    const lfBelly = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.21, 0.58, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.35 })
    );
    lfBelly.rotation.x = Math.PI / 2;
    lfBelly.position.set(0, -0.06, 0.02);
    lfBelly.scale.set(0.68, 0.85, 1.15);
    leapingFish3D.add(lfBelly);

    const lfDorsal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 4), leapingFishFinMat);
    lfDorsal.position.set(0, 0.28, -0.05);
    lfDorsal.rotation.x = -0.35;
    lfDorsal.scale.set(0.35, 1, 1.2);
    leapingFish3D.add(lfDorsal);

    [-1, 1].forEach((side) => {
      const pectFin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), leapingFishFinMat);
      pectFin.position.set(side * 0.22, -0.02, 0.14);
      pectFin.rotation.z = side * -1.1;
      pectFin.rotation.x = -0.3;
      pectFin.scale.set(0.35, 1, 1);
      leapingFish3D.add(pectFin);
    });

    const lfTail = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.48, 4), leapingFishFinMat);
    lfTail.rotation.x = -Math.PI / 2;
    lfTail.scale.set(0.42, 1.05, 1.2);
    lfTail.position.z = -0.65;
    leapingFish3D.add(lfTail);

    const lfEyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lfPupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    [-0.145, 0.145].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), lfEyeMat);
      eye.position.set(ex, 0.08, 0.38);
      leapingFish3D.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), lfPupilMat);
      pupil.position.set(ex * 1.12, 0.08, 0.42);
      leapingFish3D.add(pupil);
    });
    leapingFish3D.visible = false;
    fishingWorldGroup.add(leapingFish3D);

    // 3D Ocean Trash Mesh ($0 Value: Old Muddy Boot / Rusty Can + Tangled Green Seaweed Strands)
    const leapingTrash3D = new THREE.Group();
    const trashBootMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
      metalness: 0.15
    });
    const trashSoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const trashSeaweedMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const bootShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.52, 10), trashBootMat);
    bootShaft.position.set(0, 0.18, -0.06);
    bootShaft.rotation.x = -0.15;
    leapingTrash3D.add(bootShaft);

    const bootFoot = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.34, 8, 10), trashBootMat);
    bootFoot.rotation.x = Math.PI / 2;
    bootFoot.position.set(0, -0.06, 0.08);
    leapingTrash3D.add(bootFoot);

    const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.64), trashSoleMat);
    bootSole.position.set(0, -0.2, 0.08);
    leapingTrash3D.add(bootSole);

    // Dripping Seaweed strands wrapped around the trash
    [-0.16, 0.16].forEach((sx, idx) => {
      const weed = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.55, 6), trashSeaweedMat);
      weed.position.set(sx, -0.05, idx === 0 ? 0.12 : -0.1);
      weed.rotation.z = sx * 1.2;
      leapingTrash3D.add(weed);
    });
    leapingTrash3D.visible = false;
    fishingWorldGroup.add(leapingTrash3D);

    const fishingSimState = {
      phase: 'idle' as 'idle' | 'casting' | 'bobbing' | 'bite_ready' | 'reeling_in',
      timer: 0,
      startX: 0,
      startZ: 0,
      waterX: 0,
      waterZ: 0,
      splashTimer: 0,
      celebrateTimer: 0,
      hookedFish: null as FishSpeciesSpec | null,
      celebratedCatch: null as FishSpeciesSpec | null
    };
    const _rodTipWorldPos = new THREE.Vector3();

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

    // Autonomous IELTS 1, IELTS 2 & Teacher Jan Classmates (Full Campus Multi-Activity AI)
    type NpcActivityType =
      | 'football'
      | 'tennis'
      | 'play_games'
      | 'going_to_room'
      | 'entering_door'
      | 'inside_room'
      | 'exiting_door'
      | 'socialize';

    interface NpcActor {
      profile: IeltsCharacterProfile;
      rig: ReturnType<typeof buildCharacterAvatar>;
      racketMesh: THREE.Group;
      targetX: number;
      targetZ: number;
      speed: number;
      walkPhase: number;
      pauseTimer: number;
      activity: NpcActivityType;
      activityTimer: number;
      targetBuilding: BuildingZone;
      teamSide: 1 | -1;
      courtRole: 'south_player' | 'doubles_partner' | 'court_practice';
      kickTimer: number;
      swingTimer: number;
      chatCooldown: number;
    }
    const npcActors: NpcActor[] = [];
    const npcGroup = new THREE.Group();
    scene.add(npcGroup);

    const pickNextBuildingForNpc = (prof: IeltsCharacterProfile, idx: number): BuildingZone => {
      if (Math.random() < 0.38) {
        const preferred = BUILDINGS.find((b) => b.id === prof.targetBuildingId);
        if (preferred) return preferred;
      }
      const classroomAndHubIds = [
        'class_ielts',
        'speaking',
        'dashboard',
        'practice_tests',
        'homework',
        'reading',
        'listening',
        'class_pet',
        'class_ket',
        'class_flyers',
        'class_movers',
        'class_starters'
      ];
      const pickId = classroomAndHubIds[(idx + Math.floor(Math.random() * classroomAndHubIds.length)) % classroomAndHubIds.length];
      return BUILDINGS.find((b) => b.id === pickId) || BUILDINGS[idx % BUILDINGS.length];
    };

    const spawnNpcActors = (profiles: IeltsCharacterProfile[]) => {
      while (npcGroup.children.length > 0) {
        npcGroup.remove(npcGroup.children[0]);
      }
      npcActors.length = 0;

      const footballNames = new Set(['charlie', 'mike', 'tom', 'dragon', 'jack2', 'billy', 'dan', 'kai']);
      const tennisNames = new Set(['tim', 'kim', 'hannah', 'vinh', 'rustina', 'annie']);
      const gamesNames = new Set(['dat', 'uyen', 'sophia', 'hailey', 'loyd']);

      let assignedFootballCount = 0;
      let assignedTennisCount = 0;
      let assignedGamesCount = 0;

      // Spawn ALL IELTS 1, IELTS 2 & Teacher Jan characters (no slice truncation)
      profiles.forEach((prof, idx) => {
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

        // Attach a 3D tennis racket to right hand (shown whenever playing tennis)
        const racketMesh = createTennisRacketMesh(
          prof.cohort === 'IELTS 2' ? '#10b981' : '#38bdf8'
        );
        racketMesh.position.set(0, -0.58, 0.14);
        racketMesh.rotation.set(Math.PI / 2.3, 0, 0);
        racketMesh.visible = false;
        rig.rightArm.add(racketMesh);

        const isTeacherJan = prof.id === TEACHER_JAN_PROFILE.id || prof.cohort.includes('TEACHER');
        const lowerName = prof.name.toLowerCase();
        const targetB = BUILDINGS.find((b) => b.id === prof.targetBuildingId) || BUILDINGS[idx % BUILDINGS.length];

        let initialActivity: NpcActivityType = 'going_to_room';
        let startX = 0;
        let startZ = 0;
        let targetX = targetB.doorX + (Math.random() - 0.5) * 3.0;
        let targetZ = targetB.doorZ + targetB.frontDir * 3.6;
        let teamSide: 1 | -1 = idx % 2 === 0 ? 1 : -1;
        let courtRole: 'south_player' | 'doubles_partner' | 'court_practice' = 'court_practice';

        if (isTeacherJan) {
          initialActivity = 'socialize';
          startX = 0;
          startZ = 9.5;
          targetX = -10;
          targetZ = 12;
        } else if (footballNames.has(lowerName) && assignedFootballCount < 6) {
          initialActivity = 'football';
          teamSide = assignedFootballCount % 2 === 0 ? 1 : -1;
          const slot = Math.floor(assignedFootballCount / 2);
          startX = PITCH_CENTER.x + (slot - 1) * 5.5;
          startZ = PITCH_CENTER.z + teamSide * (5.5 + slot * 3.2);
          targetX = PITCH_CENTER.x + (Math.random() - 0.5) * 14;
          targetZ = PITCH_CENTER.z + (Math.random() - 0.5) * 24;
          assignedFootballCount++;
        } else if (tennisNames.has(lowerName) && assignedTennisCount < 4) {
          initialActivity = 'tennis';
          racketMesh.visible = true;
          if (assignedTennisCount === 0) {
            courtRole = 'south_player';
            startX = TENNIS_CENTER.x;
            startZ = TENNIS_CENTER.z + 8.8;
          } else if (assignedTennisCount === 1) {
            courtRole = 'doubles_partner';
            startX = TENNIS_CENTER.x - 3.6;
            startZ = TENNIS_CENTER.z + 5.2;
          } else {
            courtRole = 'court_practice';
            startX = TENNIS_CENTER.x + (assignedTennisCount === 2 ? 4.2 : -4.2);
            startZ = TENNIS_CENTER.z + (assignedTennisCount === 2 ? -5.0 : 9.4);
          }
          targetX = startX;
          targetZ = startZ;
          assignedTennisCount++;
        } else if (gamesNames.has(lowerName) && assignedGamesCount < 4) {
          initialActivity = 'play_games';
          // Playing outside EraGames Arcade Plaza
          const eraGamesB = BUILDINGS.find((b) => b.id === 'speaking') || targetB;
          const offsetSide = (assignedGamesCount - 1.5) * 2.2;
          startX = eraGamesB.doorX + offsetSide;
          startZ = eraGamesB.doorZ + eraGamesB.frontDir * 4.5;
          targetX = eraGamesB.doorX + offsetSide * 0.6;
          targetZ = eraGamesB.doorZ + eraGamesB.frontDir * 3.4;
          assignedGamesCount++;
        } else {
          // Distribute across classrooms and hub doors (some walking in, some walking out, some heading to class)
          const bChoice = pickNextBuildingForNpc(prof, idx);
          if (idx % 4 === 0) {
            initialActivity = 'entering_door';
            startX = bChoice.doorX + (Math.random() - 0.5) * 1.5;
            startZ = bChoice.doorZ + bChoice.frontDir * 3.2;
            targetX = bChoice.doorX;
            targetZ = bChoice.doorZ - bChoice.frontDir * 1.6;
          } else if (idx % 4 === 1) {
            initialActivity = 'exiting_door';
            startX = bChoice.doorX;
            startZ = bChoice.doorZ - bChoice.frontDir * 1.2;
            targetX = bChoice.doorX + (Math.random() - 0.5) * 4.0;
            targetZ = bChoice.doorZ + bChoice.frontDir * 5.2;
          } else {
            initialActivity = 'going_to_room';
            const angle = (idx / Math.max(1, profiles.length)) * Math.PI * 2;
            const radius = 16 + (idx % 4) * 9;
            startX = Math.cos(angle) * radius;
            startZ = Math.sin(angle) * radius;
            targetX = bChoice.doorX + (Math.random() - 0.5) * 2.4;
            targetZ = bChoice.doorZ + bChoice.frontDir * 3.6;
          }
        }

        rig.root.position.set(startX, 0, startZ);
        rig.root.userData = { npcProfileId: prof.id };
        npcGroup.add(rig.root);

        npcActors.push({
          profile: prof,
          rig,
          racketMesh,
          targetX,
          targetZ,
          speed: isTeacherJan ? 3.4 : 4.2 + (idx % 4) * 0.45,
          walkPhase: idx * 1.1,
          pauseTimer: 0,
          activity: initialActivity,
          activityTimer: 18 + (idx % 7) * 5,
          targetBuilding: targetB,
          teamSide,
          courtRole,
          kickTimer: 0,
          swingTimer: 0,
          chatCooldown: 4 + (idx % 6) * 2.5
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

    interface InteriorNpcActor {
      profile: IeltsCharacterProfile;
      rig: ReturnType<typeof buildCharacterAvatar>;
      role: 'seated_student' | 'roaming_visitor';
      state: 'walking_in' | 'at_spot' | 'walking_out' | 'outside_wait';
      targetX: number;
      targetZ: number;
      spotX: number;
      spotZ: number;
      timer: number;
      walkPhase: number;
      handRaiseTimer: number;
    }
    let interiorNpcActors: InteriorNpcActor[] = [];

    interface FacultyNpcActor {
      employee: FacultyEmployeeProfile;
      rig: ReturnType<typeof buildCharacterAvatar>;
      floor: 1 | 2;
      baseX: number;
      baseY: number;
      baseZ: number;
      baseRotY: number;
      speechTimer: number;
      bubbleIndex: number;
      isWalker: boolean;
      targetX: number;
      targetZ: number;
      walkPhase: number;
      pauseTimer: number;
      walkSpeed: number;
      waypointIdx: number;
    }
    let facultyNpcActors: FacultyNpcActor[] = [];
    let currentFacultyFloor: 1 | 2 = 1;

    let clickableBoardMeshes: THREE.Object3D[] = [];
    let currentInteriorBoards: Array<{ spec: WallBoardSpec; x: number; z: number; mesh: THREE.Mesh }> = [];
    let interiorColliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
    let interiorPersonBlockers: Array<{ x: number; z: number; radius: number }> = [];
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
      // Warm honey-oak blend so floors never wash out to white under global scene illumination
      base.lerp(new THREE.Color(0xb46924), 0.38);
      ctx.fillStyle = `#${base.getHexString()}`;
      ctx.fillRect(0, 0, 512, 512);

      // Rich wood plank variations & grain lines
      const plankH = 64;
      for (let row = 0; row < 8; row++) {
        const py = row * plankH;
        const offset = (row % 2) * 128;
        for (let col = -1; col < 3; col++) {
          const px = col * 256 + offset;
          ctx.fillStyle = (row + col) % 2 === 0 ? 'rgba(255, 245, 225, 0.08)' : 'rgba(69, 26, 3, 0.09)';
          ctx.fillRect(px, py, 256, plankH);
        }
        // Subtle wood grain streaks
        ctx.strokeStyle = 'rgba(69, 26, 3, 0.07)';
        ctx.lineWidth = 1.5;
        for (let g = 10; g < plankH; g += 14) {
          ctx.beginPath();
          ctx.moveTo(0, py + g);
          ctx.lineTo(512, py + g + ((row % 2 === 0 ? 1 : -1) * 4));
          ctx.stroke();
        }
      }

      // Plank seams
      ctx.strokeStyle = 'rgba(30, 15, 5, 0.22)';
      ctx.lineWidth = 3;
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let row = 0; row < 8; row++) {
        const offset = (row % 2) * 128;
        for (let x = offset; x <= 512; x += 256) {
          ctx.beginPath();
          ctx.moveTo(x, row * 64);
          ctx.lineTo(x, (row + 1) * 64);
          ctx.stroke();
        }
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
      interiorNpcActors = [];
      facultyNpcActors = [];
      interiorColliders = [];
      interiorPersonBlockers = [];
      currentFacultyFloor = 1;
      setFacultyInteriorFloor(1);
      setNearClassroomDesk(null);

      const addInteriorCollider = (minX: number, maxX: number, minZ: number, maxZ: number) => {
        interiorColliders.push({
          minX: INTERIOR_ORIGIN.x + minX,
          maxX: INTERIOR_ORIGIN.x + maxX,
          minZ: INTERIOR_ORIGIN.z + minZ,
          maxZ: INTERIOR_ORIGIN.z + maxZ
        });
      };

      const addInteriorPerson = (localX: number, localZ: number, radius = 0.72) => {
        interiorPersonBlockers.push({
          x: INTERIOR_ORIGIN.x + localX,
          z: INTERIOR_ORIGIN.z + localZ,
          radius
        });
      };

      const isFacultyOffice = building.id === 'faculty_hq';
      const roomW = isFacultyOffice ? 30 : 28;
      const roomD = isFacultyOffice ? 26 : 24;
      const roomH = isFacultyOffice ? 7.2 : 10.5;

      // Helper for ERA FACULTY geometric amber/ochre office carpet texture
      const createFacultyOfficeCarpetTexture = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d')!;
        // Rich warm amber-ochre base carpet (calibrated so global scene lights never wash it out)
        ctx.fillStyle = '#a85a16';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle woven carpet texture noise
        for (let i = 0; i < 3200; i++) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255,215,140,0.06)' : 'rgba(85,40,8,0.08)';
          ctx.fillRect((i * 73) % 512, (i * 139) % 512, 3, 3);
        }

        // Geometric rounded L-shapes, step motifs, and hollow rounded rectangles (#dfa344)
        ctx.strokeStyle = '#dfa344';
        ctx.fillStyle = '#dfa344';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const cell = 128;
        for (let gy = 0; gy < 4; gy++) {
          for (let gx = 0; gx < 4; gx++) {
            const ox = gx * cell;
            const oy = gy * cell;
            const variant = (gx + gy * 2) % 4;

            ctx.lineWidth = 16;
            if (variant === 0) {
              // Stepped Z / L motif
              ctx.beginPath();
              ctx.moveTo(ox + 22, oy + 28);
              ctx.lineTo(ox + 68, oy + 28);
              ctx.lineTo(ox + 68, oy + 76);
              ctx.lineTo(ox + 106, oy + 76);
              ctx.stroke();

              // Small hollow rounded square
              ctx.lineWidth = 7;
              ctx.strokeRect(ox + 20, oy + 82, 30, 28);
            } else if (variant === 1) {
              // Bold L-turn + hollow rectangle
              ctx.beginPath();
              ctx.moveTo(ox + 26, oy + 104);
              ctx.lineTo(ox + 26, oy + 46);
              ctx.lineTo(ox + 88, oy + 46);
              ctx.stroke();

              ctx.lineWidth = 8;
              ctx.strokeRect(ox + 64, oy + 74, 42, 32);
            } else if (variant === 2) {
              // Inverted step motif
              ctx.beginPath();
              ctx.moveTo(ox + 102, oy + 24);
              ctx.lineTo(ox + 54, oy + 24);
              ctx.lineTo(ox + 54, oy + 72);
              ctx.lineTo(ox + 22, oy + 72);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(ox + 72, oy + 104);
              ctx.lineTo(ox + 106, oy + 104);
              ctx.stroke();
            } else {
              // Hollow square + corner hook
              ctx.lineWidth = 8;
              ctx.strokeRect(ox + 22, oy + 22, 40, 36);

              ctx.lineWidth = 16;
              ctx.beginPath();
              ctx.moveTo(ox + 88, oy + 32);
              ctx.lineTo(ox + 88, oy + 96);
              ctx.lineTo(ox + 34, oy + 96);
              ctx.stroke();
            }
          }
        }

        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(5, 5);
        tex.needsUpdate = true;
        return tex;
      };

      // Floor (Geometric Patterned Amber Carpet for ERA FACULTY, Rich Hardwood Parquet for Classrooms & Hubs)
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(roomW, 0.4, roomD),
        new THREE.MeshStandardMaterial({
          map: isFacultyOffice
            ? createFacultyOfficeCarpetTexture()
            : createWoodFloorTexture(building.interiorFloorColor),
          roughness: isFacultyOffice ? 0.78 : 0.42,
          metalness: isFacultyOffice ? 0.02 : 0.06
        })
      );
      floor.position.set(0, -0.2, 0);
      floor.receiveShadow = true;
      interiorGroup.add(floor);

      // Welcome Runner Carpet leading to Exit Door (omitted in ERA FACULTY so patterned carpet is visible down the center aisle)
      if (!isFacultyOffice && !building.id.startsWith('class_')) {
        const carpet = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 0.04, roomD - 4.5),
          new THREE.MeshStandardMaterial({ color: building.accentColor, roughness: 0.75 })
        );
        carpet.position.set(0, 0.02, 0.5);
        interiorGroup.add(carpet);
      }

      // Warm Architectural Wall Colors (Slightly deepened so global daylight never washes them out)
      const adjustedWallColor = new THREE.Color(building.interiorWallColor).lerp(
        new THREE.Color(building.accentColor),
        0.16
      );
      const wallMat = new THREE.MeshStandardMaterial({
        color: isFacultyOffice ? 0xcfa050 : adjustedWallColor,
        roughness: 0.75,
        metalness: 0.02
      });
      const rightOfficeWallMat = new THREE.MeshStandardMaterial({
        color: isFacultyOffice ? 0xbec8d4 : adjustedWallColor,
        roughness: 0.75,
        metalness: 0.02
      });

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.5), wallMat);
      backWall.position.set(0, roomH / 2, -roomD / 2);
      interiorGroup.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), wallMat);
      leftWall.position.set(-roomW / 2, roomH / 2, 0);
      interiorGroup.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), rightOfficeWallMat);
      rightWall.position.set(roomW / 2, roomH / 2, 0);
      interiorGroup.add(rightWall);

      // Enclose Room Completely: Suspended Acoustic Tile Grid Ceiling for ALL Buildings
      const cc = document.createElement('canvas');
      cc.width = 256;
      cc.height = 256;
      const cctx = cc.getContext('2d')!;
      cctx.fillStyle = '#e2e8f0';
      cctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 600; i++) {
        cctx.fillStyle = 'rgba(100,116,139,0.16)';
        cctx.fillRect((i * 53) % 256, (i * 97) % 256, 2, 2);
      }
      cctx.strokeStyle = '#94a3b8';
      cctx.lineWidth = 6;
      cctx.strokeRect(0, 0, 256, 256);
      cctx.beginPath();
      cctx.moveTo(128, 0);
      cctx.lineTo(128, 256);
      cctx.moveTo(0, 128);
      cctx.lineTo(256, 128);
      cctx.stroke();

      const ceilTex = new THREE.CanvasTexture(cc);
      ceilTex.colorSpace = THREE.SRGBColorSpace;
      ceilTex.wrapS = THREE.RepeatWrapping;
      ceilTex.wrapT = THREE.RepeatWrapping;
      ceilTex.repeat.set(9, 8);
      const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.85 });

      const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.4, roomD), ceilingMat);
      ceiling.position.set(0, roomH, 0);
      interiorGroup.add(ceiling);

      // Recessed Glowing Rectangular LED Ceiling Panels
      const ledCoordsX = isFacultyOffice ? [-6.8, 0, 6.8] : [-7.5, 0, 7.5];
      const ledCoordsZ = isFacultyOffice ? [-7.2, -1.2, 4.8] : [-6.2, 0, 6.2];
      const ledW = isFacultyOffice ? 2.2 : 2.8;
      const ledD = isFacultyOffice ? 1.45 : 1.8;
      for (const cx of ledCoordsX) {
        for (const cz of ledCoordsZ) {
          const ceilFrame = new THREE.Mesh(
            new THREE.BoxGeometry(ledW + 0.18, 0.06, ledD + 0.18),
            new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
          );
          ceilFrame.position.set(cx, roomH - 0.16, cz);
          const ceilPanel = new THREE.Mesh(
            new THREE.BoxGeometry(ledW, 0.08, ledD),
            new THREE.MeshBasicMaterial({ color: 0xfffef0 })
          );
          ceilPanel.position.set(cx, roomH - 0.18, cz);
          interiorGroup.add(ceilFrame, ceilPanel);
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
      const lintelH = Math.max(0.4, roomH - 5.35);
      const frontLintel = new THREE.Mesh(
        new THREE.BoxGeometry(frontDoorW, lintelH, 0.5),
        wallMat
      );
      frontLintel.position.set(0, 5.35 + lintelH / 2, roomD / 2);
      interiorGroup.add(frontLintel);

      // Baseboard, Wainscoting Chair Rail & Crown Molding trim along all walls
      const trimMat = new THREE.MeshStandardMaterial({
        color: isFacultyOffice ? 0xb47b38 : building.accentColor,
        roughness: 0.48
      });
      const woodTrimMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.55
      });
      const backTrim = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.32, 0.58), trimMat);
      backTrim.position.set(0, 0.16, -roomD / 2);
      const leftCrown = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, roomD), trimMat);
      leftCrown.position.set(-roomW / 2, roomH - 0.22, 0);
      const rightCrown = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, roomD), trimMat);
      rightCrown.position.set(roomW / 2, roomH - 0.22, 0);
      const backCrown = new THREE.Mesh(new THREE.BoxGeometry(roomW, 0.26, 0.62), trimMat);
      backCrown.position.set(0, roomH - 0.22, -roomD / 2);
      const leftBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, roomD), woodTrimMat);
      leftBase.position.set(-roomW / 2, 0.14, 0);
      const rightBase = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, roomD), woodTrimMat);
      rightBase.position.set(roomW / 2, 0.14, 0);
      interiorGroup.add(backTrim, leftCrown, rightCrown, backCrown, leftBase, rightBase);

      // Universal Framed Architectural Windows & Analog Wall Clock on Front/Side Walls (for non-faculty buildings)
      if (!isFacultyOffice) {
        const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 });
        const winGlassMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
        const winBlindMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
        [-8.4, 8.4].forEach((wx) => {
          const winGroup = new THREE.Group();
          winGroup.position.set(wx, 4.2, roomD / 2 - 0.28);
          const outerF = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.8, 0.14), winFrameMat);
          const glassP = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.4, 0.16), winGlassMat);
          const sill = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.18, 0.35), woodTrimMat);
          sill.position.set(0, -1.95, -0.1);
          winGroup.add(outerF, glassP, sill);
          for (let bx = -1.2; bx <= 1.2; bx += 0.4) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.3, 0.2), winBlindMat);
            slat.position.set(bx, 0, -0.04);
            slat.rotation.y = 0.35;
            winGroup.add(slat);
          }
          interiorGroup.add(winGroup);
        });

        // Analog Classroom / Hall Wall Clock mounted above the front exit lintel
        const clkCanvas = document.createElement('canvas');
        clkCanvas.width = 256;
        clkCanvas.height = 256;
        const clkCtx = clkCanvas.getContext('2d')!;
        clkCtx.fillStyle = '#1e293b';
        clkCtx.beginPath();
        clkCtx.arc(128, 128, 120, 0, Math.PI * 2);
        clkCtx.fill();
        clkCtx.fillStyle = '#ffffff';
        clkCtx.beginPath();
        clkCtx.arc(128, 128, 104, 0, Math.PI * 2);
        clkCtx.fill();
        clkCtx.strokeStyle = '#0f172a';
        clkCtx.lineCap = 'round';
        for (let h = 0; h < 12; h++) {
          const a = (h * Math.PI) / 6;
          clkCtx.lineWidth = h % 3 === 0 ? 7 : 4;
          clkCtx.beginPath();
          clkCtx.moveTo(128 + Math.cos(a) * 78, 128 + Math.sin(a) * 78);
          clkCtx.lineTo(128 + Math.cos(a) * 95, 128 + Math.sin(a) * 95);
          clkCtx.stroke();
        }
        clkCtx.lineWidth = 8;
        clkCtx.beginPath();
        clkCtx.moveTo(128, 128);
        clkCtx.lineTo(84, 96);
        clkCtx.stroke();
        clkCtx.lineWidth = 6;
        clkCtx.beginPath();
        clkCtx.moveTo(128, 128);
        clkCtx.lineTo(175, 92);
        clkCtx.stroke();
        const clkTex = new THREE.CanvasTexture(clkCanvas);
        clkTex.colorSpace = THREE.SRGBColorSpace;
        const wallClock = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 0.75, 0.14, 24),
          [
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }),
            new THREE.MeshBasicMaterial({ map: clkTex }),
            new THREE.MeshStandardMaterial({ color: 0x1e293b })
          ]
        );
        wallClock.rotation.x = Math.PI / 2;
        wallClock.position.set(0, 7.8, -roomD / 2 + 0.32);
        interiorGroup.add(wallClock);
      }

      // Balanced Studio Illumination inside ALL rooms (prevents global sunLight + hemiLight from washing out floors/walls)
      const lightY = isFacultyOffice ? 6.4 : 8.6;
      const lightIntensity = isFacultyOffice ? 0.35 : 0.42;
      const roomLight1 = new THREE.PointLight(0xfffbeb, lightIntensity, 42);
      roomLight1.position.set(-6, lightY, -3);
      interiorGroup.add(roomLight1);

      const roomLight2 = new THREE.PointLight(0xfffbeb, lightIntensity, 42);
      roomLight2.position.set(6, lightY, -3);
      interiorGroup.add(roomLight2);

      const roomLight3 = new THREE.PointLight(0xfff3d1, 0.32, 42);
      roomLight3.position.set(0, lightY, 5);
      interiorGroup.add(roomLight3);

      // Decorative Broad-Leaf Potted Plants in All 4 Room Corners (non-faculty rooms)
      if (!isFacultyOffice) {
        [
          [-roomW / 2 + 1.8, -roomD / 2 + 1.8],
          [roomW / 2 - 1.8, -roomD / 2 + 1.8],
          [-roomW / 2 + 1.8, roomD / 2 - 1.8],
          [roomW / 2 - 1.8, roomD / 2 - 1.8]
        ].forEach(([px, pz]) => {
          const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.48, 1.1, 14),
            new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 })
          );
          pot.position.set(px, 0.55, pz);
          const soil = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.08, 14),
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 })
          );
          soil.position.set(px, 1.08, pz);
          const bush = new THREE.Mesh(
            new THREE.SphereGeometry(1.05, 14, 14),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 })
          );
          bush.position.set(px, 1.7, pz);
          const topLeaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.72, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 })
          );
          topLeaf.position.set(px, 2.35, pz);
          interiorGroup.add(pot, soil, bush, topLeaf);
        });
      }

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

      if (!isFacultyOffice) {
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
      }

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
        addInteriorCollider(-3.9, 3.9, -roomD / 2 + 4.7, -roomD / 2 + 6.9);
        addInteriorPerson(0, -roomD / 2 + 4.25, 0.85);

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
        addInteriorCollider(-9.1, -4.5, -1.8, 2.8);
        addInteriorCollider(4.5, 9.1, -1.8, 2.8);
        addInteriorCollider(-9.3, -5.1, 3.1, 7.3);
        addInteriorCollider(5.1, 9.3, 3.1, 7.3);

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
        // Era Gallery: Museum Exhibition Hall with Central Sculpture, Brass Stanchions & Cushioned Viewing Benches
        const galleryStand = new THREE.Group();
        galleryStand.position.set(0, 0, -1.8);
        const plinth = new THREE.Mesh(
          new THREE.BoxGeometry(5.6, 1.1, 2.4),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 })
        );
        plinth.position.y = 0.55;
        const goldPlinthRim = new THREE.Mesh(
          new THREE.BoxGeometry(5.76, 0.12, 2.56),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.8 })
        );
        goldPlinthRim.position.y = 1.12;
        galleryStand.add(plinth, goldPlinthRim);

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

        // 4 Brass Museum Stanchion Posts around the central exhibit
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });
        [
          [-3.4, -1.7],
          [3.4, -1.7],
          [-3.4, 1.7],
          [3.4, 1.7]
        ].forEach(([sx, sz]) => {
          const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 12), brassMat);
          sBase.position.set(sx, 0.04, sz);
          const sPost = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 10), brassMat);
          sPost.position.set(sx, 0.54, sz);
          const sTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), brassMat);
          sTop.position.set(sx, 1.06, sz);
          galleryStand.add(sBase, sPost, sTop);
        });
        interiorGroup.add(galleryStand);

        // Two Cushioned Museum Viewing Benches
        const benchVelvetMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.55 });
        const benchFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 });
        [-4.8, 4.8].forEach((bx) => {
          const bGroup = new THREE.Group();
          bGroup.position.set(bx, 0, 1.8);
          const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.26, 3.6), benchVelvetMat);
          seat.position.y = 0.68;
          const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.52, 3.3), benchFrameMat);
          base.position.y = 0.26;
          bGroup.add(seat, base);
          interiorGroup.add(bGroup);
        });
        addInteriorCollider(-3.5, 3.5, -3.6, 0.0);
        addInteriorCollider(-5.6, -4.0, -0.1, 3.7);
        addInteriorCollider(4.0, 5.6, -0.1, 3.7);
      } else if (building.id === 'speaking') {
        // EraGames Arcade Arena: Neon Floor Stage, Host NPC ("Pixel"), Gamer NPCs, Arcade Cabinets & Champion Podium
        const arcadeCarpet = new THREE.Mesh(
          new THREE.PlaneGeometry(16, 10),
          new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.85 })
        );
        arcadeCarpet.rotation.x = -Math.PI / 2;
        arcadeCarpet.position.set(0, 0.02, -1.5);
        interiorGroup.add(arcadeCarpet);

        // Central Arcade Host Desk + Pixel (EraGames Host NPC)
        const hostDeskGroup = new THREE.Group();
        hostDeskGroup.position.set(0, 0, -5.8);
        const deskBody = new THREE.Mesh(
          new THREE.BoxGeometry(6.2, 1.35, 1.7),
          new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.35, metalness: 0.5 })
        );
        deskBody.position.y = 0.675;
        deskBody.userData = { isEraGames: true };
        clickableBoardMeshes.push(deskBody);
        hostDeskGroup.add(deskBody);

        const deskTrim = new THREE.Mesh(
          new THREE.BoxGeometry(6.4, 0.16, 1.85),
          new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.35, roughness: 0.2 })
        );
        deskTrim.position.y = 1.38;
        deskTrim.userData = { isEraGames: true };
        clickableBoardMeshes.push(deskTrim);
        hostDeskGroup.add(deskTrim);

        const pixelHostRig = buildCharacterAvatar({
          shirtColor: '#7c3aed',
          hairColor: '#0f172a',
          skinColor: '#FFE7D6',
          hatType: 'headphones',
          accessoryType: 'cyber_visor',
          name: 'Pixel • EraGames Host',
          cohort: 'ERAGAMES',
          gender: 'boy',
          hairStyle: 'fluffy_swept',
          clothingType: 'cyber_jacket',
          beltType: 'cyber_belt'
        });
        pixelHostRig.root.position.set(0, 0, -1.45);
        pixelHostRig.rightArm.rotation.z = 2.2;
        pixelHostRig.rightArm.rotation.x = -0.3;
        const pixelBubble = createSpeechBubbleSprite(
          'Pixel (EraGames)',
          'Welcome to EraGames! Play Vocab Blitz, Word Scramble & Idiom Penalty to win Era Gems!',
          false
        );
        pixelBubble.userData = { isEraGames: true };
        clickableBoardMeshes.push(pixelBubble);
        pixelHostRig.root.add(pixelBubble);
        hostDeskGroup.add(pixelHostRig.root);
        interiorGroup.add(hostDeskGroup);

        // Two Detailed Neon Arcade Cabinets + Student Gamers Playing
        [
          {
            ax: -6.8,
            az: -1.8,
            hex: 0x9333ea,
            gamer: {
              name: 'Kai • Speed Blitz',
              shirtColor: '#ec4899',
              hairColor: '#1c1917',
              skinColor: '#FFD8BE',
              hatType: 'cap',
              accessoryType: 'glasses',
              gender: 'boy',
              hairStyle: 'kpop_curtain',
              clothingType: 'varsity',
              beltType: 'Belt_Black'
            }
          },
          {
            ax: 6.8,
            az: -1.8,
            hex: 0x06b6d4,
            gamer: {
              name: 'Sophia • Word Pro',
              shirtColor: '#0ea5e9',
              hairColor: '#7c2d12',
              skinColor: '#FFE7D6',
              hatType: 'daisy_clips',
              accessoryType: 'none',
              gender: 'girl',
              hairStyle: 'twin_buns',
              clothingType: 'skirt_outfit',
              beltType: 'Belt_White'
            }
          }
        ].forEach(({ ax, az, hex, gamer }) => {
          const cab = new THREE.Group();
          cab.position.set(ax, 0, az);
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.0, 3.6, 1.55),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.65 })
          );
          body.position.y = 1.8;
          body.userData = { isEraGames: true };
          clickableBoardMeshes.push(body);
          cab.add(body);

          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 1.18),
            new THREE.MeshBasicMaterial({ color: hex })
          );
          screen.position.set(0, 2.35, 0.79);
          screen.userData = { isEraGames: true };
          clickableBoardMeshes.push(screen);
          cab.add(screen);

          const marquee = new THREE.Mesh(
            new THREE.BoxGeometry(1.85, 0.42, 0.25),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          marquee.position.set(0, 3.45, 0.72);
          cab.add(marquee);

          const controlDeck = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 0.22, 0.65),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
          );
          controlDeck.position.set(0, 1.55, 0.95);
          cab.add(controlDeck);

          [-0.45, 0.45].forEach((jx) => {
            const stick = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10),
              new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 })
            );
            stick.position.set(jx, 1.72, 1.0);
            const knob = new THREE.Mesh(
              new THREE.SphereGeometry(0.07, 12, 12),
              new THREE.MeshStandardMaterial({ color: hex })
            );
            knob.position.set(jx, 1.84, 1.0);
            cab.add(stick, knob);
          });

          interiorGroup.add(cab);

          const gamerRig = buildCharacterAvatar({
            ...gamer,
            cohort: 'IELTS 1'
          });
          gamerRig.root.position.set(ax, 0, az + 2.05);
          gamerRig.root.rotation.y = Math.PI;
          gamerRig.leftArm.rotation.x = -0.85;
          gamerRig.rightArm.rotation.x = -0.85;
          interiorGroup.add(gamerRig.root);
        });

        // Champion Gem Podium + Keeper Max Penalty Practice Stand
        const podiumGroup = new THREE.Group();
        podiumGroup.position.set(0, 0, 0.8);
        const podBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.8, 2.0, 0.45, 24),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.7 })
        );
        podBase.position.y = 0.225;
        podBase.userData = { isEraGames: true };
        clickableBoardMeshes.push(podBase);
        podiumGroup.add(podBase);

        const podRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.85, 0.07, 12, 32),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        podRing.rotation.x = Math.PI / 2;
        podRing.position.y = 0.46;
        podiumGroup.add(podRing);

        const arenaStriker = buildCharacterAvatar({
          shirtColor: '#10b981',
          hairColor: '#1c1917',
          skinColor: '#FFD8BE',
          hatType: 'gold_crown',
          accessoryType: 'none',
          name: 'Champion Cup • Click to Play!',
          cohort: 'ERAGAMES',
          gender: 'boy',
          hairStyle: 'textured_crop',
          clothingType: 'varsity',
          beltType: 'Belt_White'
        });
        arenaStriker.root.position.set(0, 0.45, 0);
        arenaStriker.leftArm.rotation.z = -1.1;
        arenaStriker.rightArm.rotation.z = 1.1;
        podiumGroup.add(arenaStriker.root);
        interiorGroup.add(podiumGroup);
        addInteriorCollider(-3.3, 3.3, -6.8, -4.8);
        addInteriorPerson(0, -7.25, 0.85);
        addInteriorCollider(-7.9, -5.7, -2.7, -0.9);
        addInteriorCollider(5.7, 7.9, -2.7, -0.9);
        addInteriorPerson(-6.8, 0.25, 0.78);
        addInteriorPerson(6.8, 0.25, 0.78);
        addInteriorCollider(-1.95, 1.95, -1.15, 2.75);
      } else if (building.id.startsWith('class_')) {
        // ====================================================================
        // AUTHENTIC 3D CLASSROOM INTERIOR (STARTERS, MOVERS, FLYERS, KET, PET, IELTS)
        // Features: Front Teaching Chalkboard/Smartboard, Teacher Desk & Podium,
        // 12 Student Desks & Chairs in 3x4 Rows, Open Textbooks, Bookshelves & Teacher
        // ====================================================================
        const classroomMetaMap: Record<
          string,
          {
            header: string;
            lessonTitle: string;
            points: string[];
            teacherName: string;
            teacherShirt: string;
            teacherGender: 'boy' | 'girl';
            accentHex: string;
            route: string;
            actionType: 'navigate' | 'practice_skill';
          }
        > = {
          class_starters: {
            header: 'CAMBRIDGE PRE-A1 STARTERS • CLASSROOM',
            lessonTitle: 'Unit 1: Hello! Animals, Colors & My Family',
            points: [
              '1. Phonics & Sight Words: A–Z Sounds, Numbers 1–20 & Classroom Objects',
              '2. Speaking Practice: "What is this?" — "It is a friendly orange cat!"',
              '3. Activity: Match Pictures, Listen & Spell 5-Letter English Words'
            ],
            teacherName: 'Ms. Emma • Starters Teacher',
            teacherShirt: '#0284c7',
            teacherGender: 'girl',
            accentHex: '#0EA5E9',
            route: '/courses',
            actionType: 'navigate'
          },
          class_movers: {
            header: 'CAMBRIDGE A1 MOVERS • CLASSROOM',
            lessonTitle: 'Unit 2: Our Town, Daily Routines & Action Verbs',
            points: [
              '1. Grammar Focus: Present Continuous & Past Simple Regular Verbs',
              '2. Reading & Writing: Picture Story Sequencing & Comparative Adjectives',
              '3. Speaking Practice: Spot 4 Differences Between Two Story Pictures'
            ],
            teacherName: 'Mr. Leo • Movers Teacher',
            teacherShirt: '#ea580c',
            teacherGender: 'boy',
            accentHex: '#F97316',
            route: '/courses',
            actionType: 'navigate'
          },
          class_flyers: {
            header: 'CAMBRIDGE A2 FLYERS • CLASSROOM',
            lessonTitle: 'Unit 3: Future Adventures, Science & Storytelling',
            points: [
              '1. Grammar Focus: Present Perfect ("Have you ever...?") & Will / Going to',
              '2. Reading & Listening: Multi-Paragraph Stories & Note Completion',
              '3. Writing Workshop: Write a 35-Word Story from 3 Picture Prompts'
            ],
            teacherName: 'Ms. Clara • Flyers Teacher',
            teacherShirt: '#059669',
            teacherGender: 'girl',
            accentHex: '#10B981',
            route: '/courses',
            actionType: 'navigate'
          },
          class_ket: {
            header: 'CAMBRIDGE A2 KEY (KET) • CLASSROOM',
            lessonTitle: 'Module 4: A2 Key Reading, Listening & Email Writing',
            points: [
              '1. Reading Parts 1–5: Signs, Short Messages & 3-Option Multiple Choice',
              '2. Writing Parts 6 & 7: Write a 25+ Word Note & 3-Picture Story',
              '3. Speaking Parts 1 & 2: Personal Questions & Collaborative Discussion'
            ],
            teacherName: 'Mr. David • KET Instructor',
            teacherShirt: '#e11d48',
            teacherGender: 'boy',
            accentHex: '#E11D48',
            route: '/ket/dashboard',
            actionType: 'navigate'
          },
          class_pet: {
            header: 'CAMBRIDGE B1 PRELIMINARY (PET) • CLASSROOM',
            lessonTitle: 'Module 5: B1 Preliminary Articles, Emails & Listening',
            points: [
              '1. Reading Parts 1–6: Text Matching, Gapped Text & Open Cloze',
              '2. Writing Parts 1 & 2: 100-Word Email Response & Opinion Article',
              '3. Speaking Parts 1–4: Extended Turn Photo Description & Discussion'
            ],
            teacherName: 'Ms. Hannah • PET Instructor',
            teacherShirt: '#0d9488',
            teacherGender: 'girl',
            accentHex: '#0D9488',
            route: '/pet/dashboard',
            actionType: 'navigate'
          },
          class_ielts: {
            header: 'IELTS ACADEMIC BAND 7.0+ • CLASSROOM',
            lessonTitle: 'Masterclass: Academic Reading, Task 2 Essay & Fluency',
            points: [
              '1. Reading: True / False / Not Given & Paragraph Heading Strategies',
              '2. Writing Task 1 & 2: Data Chart Analysis & 250-Word Academic Essay',
              '3. Speaking Part 2 & 3: 2-Minute Cue Card Monologue & Abstract Debate'
            ],
            teacherName: 'Teacher Jan • IELTS Head Mentor',
            teacherShirt: '#4f46e5',
            teacherGender: 'girl',
            accentHex: '#4F46E5',
            route: '/ielts/dashboard',
            actionType: 'practice_skill'
          }
        };

        const cMeta = classroomMetaMap[building.id] || classroomMetaMap.class_starters;

        // 1. Front Classroom Teaching Chalkboard / Smartboard on Front Wall (-roomD / 2)
        const makeClassroomChalkboardTexture = () => {
          const c = document.createElement('canvas');
          c.width = 1280;
          c.height = 540;
          const ctx = c.getContext('2d')!;

          // Deep classic slate-green chalkboard surface with subtle radial vignette
          const grad = ctx.createRadialGradient(640, 270, 80, 640, 270, 720);
          grad.addColorStop(0, '#14532d');
          grad.addColorStop(1, '#062e16');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1280, 540);

          // Subtle chalk dust grid lines
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 2;
          for (let y = 110; y < 460; y += 70) {
            ctx.beginPath();
            ctx.moveTo(48, y);
            ctx.lineTo(1232, y);
            ctx.stroke();
          }

          // Top Course Banner Pill
          ctx.fillStyle = cMeta.accentHex;
          ctx.beginPath();
          ctx.roundRect(48, 28, 1184, 64, 16);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 30px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cMeta.header, 640, 70);

          // Today's Lesson Title in bright yellow chalk
          ctx.fillStyle = '#fde047';
          ctx.font = '800 38px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(cMeta.lessonTitle, 64, 152);

          // Lesson Points in crisp white chalk
          ctx.fillStyle = '#f8fafc';
          ctx.font = '700 26px Plus Jakarta Sans, sans-serif';
          cMeta.points.forEach((pt, idx) => {
            ctx.fillText(pt, 72, 222 + idx * 66);
          });

          // Bottom interactive callout bar
          ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
          ctx.beginPath();
          ctx.roundRect(300, 444, 680, 64, 32);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fde047';
          ctx.stroke();

          ctx.fillStyle = '#fde047';
          ctx.font = '900 24px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CLICK CHALKBOARD OR PRESS [E] TO OPEN LESSON →', 640, 484);

          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAnisotropy;
          return tex;
        };

        const mainChalkboardSpec: WallBoardSpec = {
          slot: 'back-center',
          category: cMeta.header,
          title: cMeta.lessonTitle,
          subtitle: cMeta.points[0],
          badge: 'OPEN CLASSROOM LESSON',
          accentHex: cMeta.accentHex,
          bgLightHex: '#F8FAFC',
          actionType: cMeta.actionType,
          route: cMeta.route,
          skillOrTab: 'Reading'
        };

        const boardGroup = new THREE.Group();
        boardGroup.position.set(0, 4.4, -roomD / 2 + 0.35);

        const woodFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55, metalness: 0.1 });
        const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(13.2, 5.4, 0.22), woodFrameMat);
        boardFrame.userData = { boardSpec: mainChalkboardSpec };
        boardGroup.add(boardFrame);
        clickableBoardMeshes.push(boardFrame);

        const boardFace = new THREE.Mesh(
          new THREE.PlaneGeometry(12.6, 4.85),
          new THREE.MeshBasicMaterial({ map: makeClassroomChalkboardTexture() })
        );
        boardFace.position.z = 0.12;
        boardFace.userData = { boardSpec: mainChalkboardSpec };
        boardGroup.add(boardFace);
        clickableBoardMeshes.push(boardFace);

        // Wooden Chalk Tray + Colored Chalks & Felt Eraser
        const chalkTray = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.16, 0.45), woodFrameMat);
        chalkTray.position.set(0, -2.65, 0.22);
        boardGroup.add(chalkTray);

        const eraserBlock = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.14, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
        );
        eraserBlock.position.set(-3.2, -2.5, 0.26);
        boardGroup.add(eraserBlock);

        [
          { x: -1.5, col: 0xffffff },
          { x: -1.1, col: 0xfde047 },
          { x: -0.7, col: 0xf472b6 },
          { x: 1.8, col: 0x38bdf8 }
        ].forEach(({ x, col }) => {
          const chalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.28, 10),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 })
          );
          chalk.rotation.z = Math.PI / 2;
          chalk.position.set(x, -2.53, 0.26);
          boardGroup.add(chalk);
        });

        interiorGroup.add(boardGroup);

        currentInteriorBoards.push({
          spec: mainChalkboardSpec,
          x: INTERIOR_ORIGIN.x,
          z: INTERIOR_ORIGIN.z - roomD / 2 + 3.2,
          mesh: boardFace
        });

        // 2. Teacher's Raised Wooden Podium Platform + Teacher Desk, Globe, Laptop, Books & Teacher NPC
        const podiumStage = new THREE.Mesh(
          new THREE.BoxGeometry(15.2, 0.22, 3.8),
          new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 })
        );
        podiumStage.position.set(0, 0.11, -roomD / 2 + 2.15);
        podiumStage.receiveShadow = true;
        interiorGroup.add(podiumStage);

        const teacherDeskGroup = new THREE.Group();
        teacherDeskGroup.position.set(-4.3, 0.22, -roomD / 2 + 2.45);

        const tDeskTop = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 0.14, 1.5),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 })
        );
        tDeskTop.position.y = 1.38;
        tDeskTop.castShadow = true;
        teacherDeskGroup.add(tDeskTop);

        const tDeskFront = new THREE.Mesh(
          new THREE.BoxGeometry(3.15, 1.25, 1.28),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
        );
        tDeskFront.position.y = 0.68;
        tDeskFront.castShadow = true;
        teacherDeskGroup.add(tDeskFront);

        // Laptop, World Globe & Stack of Books on Teacher's Desk
        const laptopBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.04, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 })
        );
        laptopBase.position.set(-0.45, 1.47, 0.1);
        const laptopScreen = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.44, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x38bdf8, emissiveIntensity: 0.25 })
        );
        laptopScreen.position.set(-0.45, 1.68, -0.12);
        laptopScreen.rotation.x = 0.2;
        teacherDeskGroup.add(laptopBase, laptopScreen);

        // Classroom World Globe on Teacher's Desk
        const globeStand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.24, 0.12, 14),
          new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 })
        );
        globeStand.position.set(-1.2, 1.5, 0);
        const globeSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
        );
        globeSphere.position.set(-1.2, 1.85, 0);
        teacherDeskGroup.add(globeStand, globeSphere);

        [0xef4444, 0x3b82f6, 0x10b981].forEach((bCol, bIdx) => {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.1, 0.42),
            new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.5 })
          );
          book.position.set(0.85, 1.5 + bIdx * 0.11, 0);
          book.rotation.y = bIdx * 0.12;
          teacherDeskGroup.add(book);
        });

        interiorGroup.add(teacherDeskGroup);

        // Teacher Character standing at the front chalkboard welcoming students
        const teacherRig = buildCharacterAvatar({
          shirtColor: cMeta.teacherShirt,
          hairColor: '#1c1917',
          skinColor: '#FFE7D6',
          hatType: 'none',
          accessoryType: 'glasses',
          name: cMeta.teacherName,
          cohort: 'TEACHER (SUPER ADMIN)',
          gender: cMeta.teacherGender,
          hairStyle: cMeta.teacherGender === 'girl' ? 'ponytail' : 'classic',
          clothingType: 'royal_suit',
          beltType: 'leather_belt'
        });
        teacherRig.root.position.set(3.6, 0.22, -roomD / 2 + 2.3);
        const teacherBubble = createSpeechBubbleSprite(
          cMeta.teacherName,
          `Welcome to ${building.name}! Students in this class can click any desk chair or press [E] to sit down!`,
          false
        );
        teacherBubble.userData = { boardSpec: mainChalkboardSpec };
        clickableBoardMeshes.push(teacherBubble);
        teacherRig.root.add(teacherBubble);
        interiorGroup.add(teacherRig.root);
        addInteriorCollider(-6.1, -2.5, -roomD / 2 + 1.6, -roomD / 2 + 3.3);
        addInteriorPerson(3.6, -roomD / 2 + 2.3, 0.82);

        // Side-Wall Educational Posters & Framed Windows along Left and Right Classroom Walls
        const posterMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
        const posterFrameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.55 });
        [-4.5, 2.5].forEach((pz, pIdx) => {
          [-roomW / 2 + 0.3, roomW / 2 - 0.3].forEach((px, sIdx) => {
            const pGroup = new THREE.Group();
            pGroup.position.set(px, 4.3, pz);
            pGroup.rotation.y = sIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
            const pFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.1), posterFrameMat);
            const pFace = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.9, 0.12), posterMat);
            const pHeader = new THREE.Mesh(
              new THREE.BoxGeometry(2.7, 0.38, 0.14),
              new THREE.MeshBasicMaterial({ color: pIdx === 0 ? building.accentColor : 0x0284c7 })
            );
            pHeader.position.y = 0.62;
            pGroup.add(pFrame, pFace, pHeader);
            interiorGroup.add(pGroup);
          });
        });

        // 3. Rows of 3D Student Desks & Interactive Classroom Chairs (3 Rows × 4 Columns = 12 Student Desks & Chairs)
        const deskWoodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.48 });
        const chairWoodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.52 });
        const legMetalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.65 });
        const trayMetalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.4 });
        const pageWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
        const pencilYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
        const bookCoverPalette = [0x0ea5e9, 0xf97316, 0x10b981, 0xe11d48, 0x6366f1, 0x8b5cf6];

        const deskCols = [-6.6, -2.2, 2.2, 6.6];
        const deskRows = [-2.2, 1.3, 4.8];

        // Map each classroom building to its specific student cohort label & dedicated cohort student roster
        const classroomCohortConfig: Record<
          string,
          {
            cohortLabel: string;
            roster: Array<{ name: string; cohort: string; gender: 'boy' | 'girl'; hair: string; shirt: string }>;
          }
        > = {
          class_starters: {
            cohortLabel: 'STARTERS',
            roster: [
              { name: 'Milo', cohort: 'STARTERS', gender: 'boy', hair: 'classic', shirt: '#0ea5e9' },
              { name: 'Lily', cohort: 'STARTERS', gender: 'girl', hair: 'twin_buns', shirt: '#f43f5e' },
              { name: 'Toby', cohort: 'STARTERS', gender: 'boy', hair: 'spiky', shirt: '#10b981' },
              { name: 'Mia', cohort: 'STARTERS', gender: 'girl', hair: 'twintails', shirt: '#a855f7' },
              { name: 'Benny', cohort: 'STARTERS', gender: 'boy', hair: 'textured_crop', shirt: '#f59e0b' },
              { name: 'Zoe', cohort: 'STARTERS', gender: 'girl', hair: 'ponytail', shirt: '#ec4899' }
            ]
          },
          class_movers: {
            cohortLabel: 'MOVERS',
            roster: [
              { name: 'Lucas', cohort: 'MOVERS', gender: 'boy', hair: 'spiky', shirt: '#f97316' },
              { name: 'Chloe', cohort: 'MOVERS', gender: 'girl', hair: 'long_wavy', shirt: '#06b6d4' },
              { name: 'Noah', cohort: 'MOVERS', gender: 'boy', hair: 'textured_crop', shirt: '#3b82f6' },
              { name: 'Emma', cohort: 'MOVERS', gender: 'girl', hair: 'ponytail', shirt: '#ec4899' },
              { name: 'Oliver', cohort: 'MOVERS', gender: 'boy', hair: 'classic', shirt: '#10b981' },
              { name: 'Ruby', cohort: 'MOVERS', gender: 'girl', hair: 'twin_buns', shirt: '#8b5cf6' }
            ]
          },
          class_flyers: {
            cohortLabel: 'FLYERS',
            roster: [
              { name: 'Ethan', cohort: 'FLYERS', gender: 'boy', hair: 'kpop_curtain', shirt: '#10b981' },
              { name: 'Sophia', cohort: 'FLYERS', gender: 'girl', hair: 'long_wavy', shirt: '#0ea5e9' },
              { name: 'Liam', cohort: 'FLYERS', gender: 'boy', hair: 'textured_crop', shirt: '#6366f1' },
              { name: 'Ava', cohort: 'FLYERS', gender: 'girl', hair: 'twintails', shirt: '#f43f5e' },
              { name: 'Mason', cohort: 'FLYERS', gender: 'boy', hair: 'spiky', shirt: '#f59e0b' },
              { name: 'Bella', cohort: 'FLYERS', gender: 'girl', hair: 'ponytail', shirt: '#14b8a6' }
            ]
          },
          class_ket: {
            cohortLabel: 'KET',
            roster: [
              { name: 'Daniel', cohort: 'KET', gender: 'boy', hair: 'textured_crop', shirt: '#e11d48' },
              { name: 'Grace', cohort: 'KET', gender: 'girl', hair: 'long_wavy', shirt: '#8b5cf6' },
              { name: 'Ryan', cohort: 'KET', gender: 'boy', hair: 'kpop_curtain', shirt: '#2563eb' },
              { name: 'Nina', cohort: 'KET', gender: 'girl', hair: 'twin_buns', shirt: '#ec4899' },
              { name: 'Kevin', cohort: 'KET', gender: 'boy', hair: 'classic', shirt: '#059669' },
              { name: 'Sarah', cohort: 'KET', gender: 'girl', hair: 'ponytail', shirt: '#f97316' }
            ]
          },
          class_pet: {
            cohortLabel: 'PET',
            roster: [
              { name: 'Alex', cohort: 'PET', gender: 'boy', hair: 'kpop_curtain', shirt: '#0d9488' },
              { name: 'Elena', cohort: 'PET', gender: 'girl', hair: 'long_wavy', shirt: '#6366f1' },
              { name: 'Marcus', cohort: 'PET', gender: 'boy', hair: 'textured_crop', shirt: '#0284c7' },
              { name: 'Claire', cohort: 'PET', gender: 'girl', hair: 'ponytail', shirt: '#e11d48' },
              { name: 'Victor', cohort: 'PET', gender: 'boy', hair: 'spiky', shirt: '#d97706' },
              { name: 'Jade', cohort: 'PET', gender: 'girl', hair: 'twin_buns', shirt: '#10b981' }
            ]
          },
          class_ielts: {
            cohortLabel: 'IELTS 1 & 2',
            roster: [
              { name: 'Kim', cohort: 'IELTS 2', gender: 'girl', hair: 'long_wavy', shirt: '#ec4899' },
              { name: 'Charlie', cohort: 'IELTS 2', gender: 'boy', hair: 'textured_crop', shirt: '#2563eb' },
              { name: 'Hannah', cohort: 'IELTS 2', gender: 'girl', hair: 'twintails', shirt: '#a855f7' },
              { name: 'Suzie', cohort: 'IELTS 1', gender: 'girl', hair: 'twin_buns', shirt: '#f97316' },
              { name: 'Nhi', cohort: 'IELTS 1', gender: 'girl', hair: 'long_wavy', shirt: '#0ea5e9' },
              { name: 'Dan', cohort: 'IELTS 1', gender: 'boy', hair: 'kpop_curtain', shirt: '#10b981' }
            ]
          }
        };

        const activeCohortCfg = classroomCohortConfig[building.id] || classroomCohortConfig.class_ielts;

        deskRows.forEach((rz, rIdx) => {
          deskCols.forEach((cx, cIdx) => {
            const deskNumber = rIdx * 4 + cIdx + 1;
            const seatWorldX = INTERIOR_ORIGIN.x + cx;
            const seatWorldZ = INTERIOR_ORIGIN.z + rz + 0.95;
            const deskLabel = `${building.name} • Desk #${deskNumber} (Row ${rIdx + 1})`;
            const deskHitData = {
              isClassroomDesk: true,
              seatX: seatWorldX,
              seatZ: seatWorldZ,
              deskName: deskLabel,
              classCohort: activeCohortCfg.cohortLabel
            };

            const unitGroup = new THREE.Group();
            unitGroup.position.set(cx, 0, rz);

            // Student Desk Top
            const dTop = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.11, 1.1), deskWoodMat);
            dTop.position.y = 1.28;
            dTop.castShadow = true;
            dTop.receiveShadow = true;
            dTop.userData = deskHitData;
            clickableBoardMeshes.push(dTop);
            unitGroup.add(dTop);

            // Under-Desk Book Storage Tray
            const dTray = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.9), trayMetalMat);
            dTray.position.y = 1.12;
            unitGroup.add(dTray);

            // 4 Tubular Metal Desk Legs
            [
              [-0.88, -0.44],
              [0.88, -0.44],
              [-0.88, 0.44],
              [0.88, 0.44]
            ].forEach(([lx, lz]) => {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 1.26, 8), legMetalMat);
              leg.position.set(lx, 0.63, lz);
              leg.castShadow = true;
              unitGroup.add(leg);
            });

            // Open Notebook & Pencil on top of every student desk
            const coverCol = bookCoverPalette[(rIdx * 4 + cIdx) % bookCoverPalette.length];
            const notebookCover = new THREE.Mesh(
              new THREE.BoxGeometry(0.72, 0.025, 0.5),
              new THREE.MeshStandardMaterial({ color: coverCol, roughness: 0.5 })
            );
            notebookCover.position.set(-0.15, 1.35, 0);
            unitGroup.add(notebookCover);

            const notebookPages = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.03, 0.46), pageWhiteMat);
            notebookPages.position.set(-0.15, 1.365, 0);
            unitGroup.add(notebookPages);

            const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 8), pencilYellowMat);
            pencil.rotation.z = Math.PI / 2;
            pencil.rotation.y = 0.25;
            pencil.position.set(0.45, 1.36, 0.08);
            unitGroup.add(pencil);

            // Student Chair placed behind the desk (at +Z facing -Z chalkboard)
            const chairGroup = new THREE.Group();
            chairGroup.position.set(0, 0, 0.95);

            const cSeat = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.09, 0.88), chairWoodMat);
            cSeat.position.y = 0.76;
            cSeat.castShadow = true;
            cSeat.userData = deskHitData;
            clickableBoardMeshes.push(cSeat);
            chairGroup.add(cSeat);

            // 4 Chair Legs
            [
              [-0.4, -0.36],
              [0.4, -0.36],
              [-0.4, 0.36],
              [0.4, 0.36]
            ].forEach(([lx, lz]) => {
              const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.76, 8), legMetalMat);
              cLeg.position.set(lx, 0.38, lz);
              chairGroup.add(cLeg);
            });

            // Chair Backrest Supports & Curved Wooden Backrest
            [-0.36, 0.36].forEach((bx) => {
              const post = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.62, 8), legMetalMat);
              post.position.set(bx, 1.06, 0.4);
              chairGroup.add(post);
            });

            const cBack = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.48, 0.08), chairWoodMat);
            cBack.position.set(0, 1.26, 0.42);
            cBack.castShadow = true;
            cBack.userData = deskHitData;
            clickableBoardMeshes.push(cBack);
            chairGroup.add(cBack);

            unitGroup.add(chairGroup);
            interiorGroup.add(unitGroup);
            // Collider on the wooden desk table top (leaving the chair at rz + 0.95 accessible so players can walk up and sit down)
            addInteriorCollider(cx - 1.05, cx + 1.05, rz - 0.56, rz + 0.48);
          });
        });

        // 4. Students Belonging to This Specific Class Building Seated in the Classroom Chairs
        const matchingCampusStudents = npcActors
          .map((n) => n.profile)
          .filter((p) =>
            building.id === 'class_ielts'
              ? p.cohort === 'IELTS 1' || p.cohort === 'IELTS 2'
              : p.targetBuildingId === building.id ||
                String(p.cohort).toUpperCase().includes(activeCohortCfg.cohortLabel)
          );

        // Seat 6 class students on the classroom chairs (leaving 6 open chairs so the player & classmates can sit down at any desk!)
        const seatedDeskSlots = [
          { colIdx: 0, rowIdx: 0 },
          { colIdx: 2, rowIdx: 0 },
          { colIdx: 1, rowIdx: 1 },
          { colIdx: 3, rowIdx: 1 },
          { colIdx: 0, rowIdx: 2 },
          { colIdx: 2, rowIdx: 2 }
        ];

        seatedDeskSlots.forEach((slot, idx) => {
          const seatX = deskCols[slot.colIdx];
          const seatZ = deskRows[slot.rowIdx] + 0.92; // Positioned directly on the chair seat
          const cohortPreset = activeCohortCfg.roster[idx % activeCohortCfg.roster.length];
          const matchedProf =
            matchingCampusStudents.find((p) => p.name.toLowerCase() === cohortPreset.name.toLowerCase()) ||
            (building.id === 'class_ielts' ? matchingCampusStudents[idx % Math.max(1, matchingCampusStudents.length)] : null);

          const displayName = matchedProf ? matchedProf.name : cohortPreset.name;
          const displayCohort = matchedProf ? matchedProf.cohort : cohortPreset.cohort;

          const stRig = buildCharacterAvatar({
            shirtColor: matchedProf?.shirtColor || cohortPreset.shirt,
            hairColor: matchedProf?.hairColor || '#1c1917',
            skinColor: matchedProf?.skinColor || '#FFE7D6',
            hatType: matchedProf?.hatType || 'none',
            accessoryType: matchedProf?.accessoryType || 'none',
            name: `${displayName} • ${displayCohort}`,
            cohort: displayCohort,
            gender: matchedProf?.gender || cohortPreset.gender,
            hairStyle: matchedProf?.hairStyle || cohortPreset.hair,
            clothingType: matchedProf?.clothingType || 'varsity',
            pantsColor: matchedProf?.pantsColor || '#1e293b',
            beltType: matchedProf?.beltType || 'none'
          });
          // True seated pose directly on the classroom chair seat cushion (root.y = 0, hipsGroup.y = 0.56 -> world hip y = 0.81m on the 0.76m chair seat, feet tucked under desk)
          stRig.root.position.set(seatX, 0, seatZ);
          stRig.root.rotation.y = Math.PI; // Facing the front chalkboard
          stRig.hipsGroup.position.y = 0.56;
          stRig.vehicleGroup.visible = false;
          stRig.leftLeg.rotation.x = -1.12;
          stRig.rightLeg.rotation.x = -1.12;
          stRig.leftArm.rotation.x = -0.68;
          stRig.rightArm.rotation.x = -0.68;
          stRig.root.children.forEach((child) => {
            if ((child as THREE.Sprite).isSprite) {
              child.scale.multiplyScalar(0.68);
              child.position.y = 2.95;
            }
          });
          interiorGroup.add(stRig.root);
          addInteriorPerson(seatX, seatZ, 0.72);

          const synthProf: IeltsCharacterProfile = matchedProf || {
            id: `${building.id}-student-${idx}`,
            name: displayName,
            cohort: displayCohort as any,
            course: 'IELTS Course',
            roleTitle: `${displayCohort} Student`,
            shirtColor: cohortPreset.shirt,
            hairColor: '#1c1917',
            skinColor: '#FFE7D6',
            hatType: 'none',
            accessoryType: 'none',
            gender: cohortPreset.gender,
            hairStyle: cohortPreset.hair,
            clothingType: 'varsity',
            pantsColor: '#1e293b',
            beltType: 'none',
            targetBuildingId: building.id,
            motto: `Studying in ${building.name}!`
          };

          interiorNpcActors.push({
            profile: synthProf,
            rig: stRig,
            role: 'seated_student',
            state: 'at_spot',
            targetX: seatX,
            targetZ: seatZ,
            spotX: seatX,
            spotZ: seatZ,
            timer: 4 + idx * 2.5,
            walkPhase: idx * 1.3,
            handRaiseTimer: idx === 0 ? 2.2 : 0
          });
        });

        // 5. Classroom Bookshelves & Storage Lockers at Back Left & Back Right Corners
        [-10.2, 10.2].forEach((bx) => {
          const shelfGroup = new THREE.Group();
          shelfGroup.position.set(bx, 0, -roomD / 2 + 1.1);
          const shelfFrame = new THREE.Mesh(
            new THREE.BoxGeometry(3.0, 4.4, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
          );
          shelfFrame.position.y = 2.2;
          shelfFrame.castShadow = true;
          shelfGroup.add(shelfFrame);

          for (let row = 0; row < 3; row++) {
            for (let b = 0; b < 6; b++) {
              const bk = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.72, 0.68),
                new THREE.MeshStandardMaterial({
                  color: bookCoverPalette[(row * 6 + b) % bookCoverPalette.length],
                  roughness: 0.45
                })
              );
              bk.position.set(-0.95 + b * 0.38, 1.1 + row * 1.15, 0.14);
              shelfGroup.add(bk);
            }
          }
          interiorGroup.add(shelfGroup);
          addInteriorCollider(bx - 1.6, bx + 1.6, -roomD / 2 + 0.5, -roomD / 2 + 1.7);
        });
      } else if (building.id === 'practice_tests') {
        // ====================================================================
        // PRACTICE TEST ARENA INTERIOR: 3D COMPUTER EXAMINATION LAB
        // Features: 6 Partitioned Exam Computer Booths, Widescreen Exam Monitors,
        // Headphones, Ergonomic Chairs, Seated Test-Takers & Front Proctor Desk
        // ====================================================================
        const boothWoodMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
        const deskSurfMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
        const frameDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 });
        const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        // Front Exam Proctor Desk
        const proctorGroup = new THREE.Group();
        proctorGroup.position.set(0, 0, -4.8);
        const pDesk = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.35, 1.4), boothWoodMat);
        pDesk.position.y = 0.675;
        const pTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 1.55), deskSurfMat);
        pTop.position.y = 1.4;
        proctorGroup.add(pDesk, pTop);

        const proctorRig = buildCharacterAvatar({
          shirtColor: '#1d4ed8',
          hairColor: '#1c1917',
          skinColor: '#FFE7D6',
          hatType: 'none',
          accessoryType: 'glasses',
          name: 'Mr. Arthur • Exam Proctor',
          cohort: 'PRACTICE ARENA',
          gender: 'boy',
          hairStyle: 'classic',
          clothingType: 'royal_suit',
          beltType: 'leather_belt'
        });
        proctorRig.root.position.set(0, 0, -1.2);
        proctorGroup.add(proctorRig.root);
        interiorGroup.add(proctorGroup);
        addInteriorCollider(-2.4, 2.4, -5.6, -4.0);
        addInteriorPerson(0, -6.0, 0.82);

        // 4 Computer Testing Booths with Seated Student Test-Takers
        const boothPositions = [
          { x: -4.2, z: -1.2 },
          { x: 4.2, z: -1.2 },
          { x: -4.2, z: 2.6 },
          { x: 4.2, z: 2.6 }
        ];
        const studentPool = npcActors
          .map((n) => n.profile)
          .filter((p) => p.cohort === 'IELTS 1' || p.cohort === 'IELTS 2');

        boothPositions.forEach((bp, bIdx) => {
          const bGroup = new THREE.Group();
          bGroup.position.set(bp.x, 0, bp.z);

          // Booth Privacy Dividers (Left, Right, Front)
          const backDiv = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.95, 0.12), boothWoodMat);
          backDiv.position.set(0, 0.975, -0.65);
          const leftDiv = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.95, 1.4), boothWoodMat);
          leftDiv.position.set(-1.25, 0.975, 0);
          const rightDiv = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.95, 1.4), boothWoodMat);
          rightDiv.position.set(1.25, 0.975, 0);
          const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), deskSurfMat);
          deskTop.position.set(0, 1.25, -0.05);

          // Widescreen Exam Monitor & Keyboard
          const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.35, 12), frameDarkMat);
          monStand.position.set(0, 1.45, -0.35);
          const monFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 0.06), frameDarkMat);
          monFrame.position.set(0, 1.72, -0.35);
          const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.58), screenGlowMat);
          monScreen.position.set(0, 1.72, -0.31);
          const kb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.24), frameDarkMat);
          kb.position.set(0, 1.32, 0.15);

          // Exam Chair
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.85), frameDarkMat);
          seat.position.set(0, 0.76, 0.85);
          const back = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.8, 0.1), boothWoodMat);
          back.position.set(0, 1.2, 1.24);
          const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.25, 0.75, 10), frameDarkMat);
          pedestal.position.set(0, 0.38, 0.85);

          bGroup.add(backDiv, leftDiv, rightDiv, deskTop, monStand, monFrame, monScreen, kb, seat, back, pedestal);
          interiorGroup.add(bGroup);
          addInteriorCollider(bp.x - 1.35, bp.x + 1.35, bp.z - 0.72, bp.z + 0.65);

          // Seated Student taking Computer IELTS Practice Test with Headphones
          const prof =
            studentPool[bIdx % Math.max(1, studentPool.length)] ||
            DEFAULT_IELTS_CHARACTERS[(bIdx + 1) % DEFAULT_IELTS_CHARACTERS.length];
          const testerRig = buildCharacterAvatar({
            shirtColor: prof.shirtColor,
            hairColor: prof.hairColor,
            skinColor: prof.skinColor,
            hatType: 'headphones',
            accessoryType: prof.accessoryType,
            name: `${prof.name} • Testing`,
            cohort: prof.cohort,
            gender: prof.gender,
            hairStyle: prof.hairStyle,
            clothingType: prof.clothingType,
            pantsColor: prof.pantsColor,
            beltType: prof.beltType
          });
          testerRig.root.position.set(bp.x, 0, bp.z + 0.82);
          testerRig.root.rotation.y = Math.PI;
          testerRig.hipsGroup.position.y = 0.56;
          testerRig.vehicleGroup.visible = false;
          testerRig.leftLeg.rotation.x = -1.12;
          testerRig.rightLeg.rotation.x = -1.12;
          testerRig.leftArm.rotation.x = -0.68;
          testerRig.rightArm.rotation.x = -0.68;
          testerRig.root.children.forEach((child) => {
            if ((child as THREE.Sprite).isSprite) {
              child.scale.multiplyScalar(0.62);
              child.position.y = 2.95;
            }
          });
          interiorGroup.add(testerRig.root);
          addInteriorPerson(bp.x, bp.z + 0.82, 0.75);
        });
      } else if (building.id === 'homework') {
        // ====================================================================
        // HOMEWORK HUB INTERIOR: ACADEMIC LIBRARY & COLLABORATIVE STUDY LOUNGE
        // Features: 4 Mahogany Library Study Tables, Green Banker's Desk Lamps,
        // Open Laptops & Textbooks, Tall Bookcases & Seated Studying Classmates
        // ====================================================================
        const mahoganyMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.48 });
        const oakTopMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.42 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.75, roughness: 0.25 });
        const lampShadeMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.45,
          roughness: 0.3
        });

        const tableCoords = [
          { x: -4.2, z: -1.8 },
          { x: 4.2, z: -1.8 },
          { x: -4.2, z: 3.0 },
          { x: 4.2, z: 3.0 }
        ];
        const studentPool = npcActors
          .map((n) => n.profile)
          .filter((p) => p.cohort === 'IELTS 1' || p.cohort === 'IELTS 2');

        tableCoords.forEach((tc, tIdx) => {
          const tGroup = new THREE.Group();
          tGroup.position.set(tc.x, 0, tc.z);

          const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.65), oakTopMat);
          tableTop.position.y = 1.28;
          tableTop.castShadow = true;
          tGroup.add(tableTop);

          [
            [-1.5, -0.65],
            [1.5, -0.65],
            [-1.5, 0.65],
            [1.5, 0.65]
          ].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.26, 0.16), mahoganyMat);
            leg.position.set(lx, 0.63, lz);
            tGroup.add(leg);
          });

          // Classic Emerald Library Banker's Lamp in the center of each table
          const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 12), brassMat);
          lampBase.position.set(0, 1.38, 0);
          const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 10), brassMat);
          lampStem.position.set(0, 1.6, 0);
          const lampShade = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.26), lampShadeMat);
          lampShade.position.set(0, 1.82, 0);
          tGroup.add(lampBase, lampStem, lampShade);

          // Books & Notebooks on table
          const bookStack = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.18, 0.42),
            new THREE.MeshStandardMaterial({ color: tIdx % 2 === 0 ? 0x2563eb : 0xe11d48, roughness: 0.5 })
          );
          bookStack.position.set(-0.85, 1.44, 0.15);
          tGroup.add(bookStack);

          // Library Chairs + Seated Studying Student
          const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 0.88), mahoganyMat);
          chairSeat.position.set(0, 0.76, 1.05);
          const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.1), mahoganyMat);
          chairBack.position.set(0, 1.18, 1.44);
          tGroup.add(chairSeat, chairBack);

          interiorGroup.add(tGroup);
          addInteriorCollider(tc.x - 1.75, tc.x + 1.75, tc.z - 0.88, tc.z + 0.88);

          const prof =
            studentPool[(tIdx + 3) % Math.max(1, studentPool.length)] ||
            DEFAULT_IELTS_CHARACTERS[(tIdx + 3) % DEFAULT_IELTS_CHARACTERS.length];
          const hwRig = buildCharacterAvatar({
            shirtColor: prof.shirtColor,
            hairColor: prof.hairColor,
            skinColor: prof.skinColor,
            hatType: prof.hatType,
            accessoryType: prof.accessoryType,
            name: `${prof.name} • Homework`,
            cohort: prof.cohort,
            gender: prof.gender,
            hairStyle: prof.hairStyle,
            clothingType: prof.clothingType,
            pantsColor: prof.pantsColor,
            beltType: prof.beltType
          });
          hwRig.root.position.set(tc.x, 0, tc.z + 1.02);
          hwRig.root.rotation.y = Math.PI;
          hwRig.hipsGroup.position.y = 0.56;
          hwRig.vehicleGroup.visible = false;
          hwRig.leftLeg.rotation.x = -1.12;
          hwRig.rightLeg.rotation.x = -1.12;
          hwRig.leftArm.rotation.x = -0.68;
          hwRig.rightArm.rotation.x = -0.68;
          hwRig.root.children.forEach((child) => {
            if ((child as THREE.Sprite).isSprite) {
              child.scale.multiplyScalar(0.62);
              child.position.y = 2.95;
            }
          });
          interiorGroup.add(hwRig.root);
          addInteriorPerson(tc.x, tc.z + 1.02, 0.75);
        });
      } else if (building.id === 'dashboard') {
        // ====================================================================
        // IELTS ACADEMY / DASHBOARD HALL INTERIOR: GRAND ACADEMIC HONOR HALL
        // Features: Central Honor Roll Trophy Pedestal, 4 Classical Columns,
        // Velvet Lounge Benches & Clear Sightlines to the 6 Analytics Walls
        // ====================================================================
        const marbleColMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.1 });
        const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.8 });
        const velvetBenchMat = new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.6 });

        // 4 Classical Columns framing the Grand Hall
        [
          [-8.5, -5.5],
          [8.5, -5.5],
          [-8.5, 5.5],
          [8.5, 5.5]
        ].forEach(([cx, cz]) => {
          const colGroup = new THREE.Group();
          colGroup.position.set(cx, 0, cz);
          const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.3), goldAccentMat);
          base.position.y = 0.25;
          const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, roomH - 1.0, 16), marbleColMat);
          shaft.position.y = roomH / 2;
          const capital = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.3), goldAccentMat);
          capital.position.y = roomH - 0.35;
          colGroup.add(base, shaft, capital);
          interiorGroup.add(colGroup);
          addInteriorCollider(cx - 0.75, cx + 0.75, cz - 0.75, cz + 0.75);
        });

        // Central Academy Honor Trophy Pedestal
        const trophyGroup = new THREE.Group();
        trophyGroup.position.set(0, 0, -0.5);
        const pedBase = new THREE.Mesh(
          new THREE.CylinderGeometry(1.65, 1.95, 1.1, 24),
          new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.5 })
        );
        pedBase.position.y = 0.55;
        const goldCup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.28, 1.15, 20), goldAccentMat);
        goldCup.position.y = 1.65;
        const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 12, 32), goldAccentMat);
        goldRing.position.y = 2.05;
        trophyGroup.add(pedBase, goldCup, goldRing);
        interiorGroup.add(trophyGroup);
        addInteriorCollider(-1.95, 1.95, -2.45, 1.45);

        // Two Velvet Academic Viewing Benches flanking the center aisle
        [-4.6, 4.6].forEach((bx) => {
          const bench = new THREE.Group();
          bench.position.set(bx, 0, 0.5);
          const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.32, 3.8), velvetBenchMat);
          cushion.position.y = 0.68;
          const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.12, 3.86), goldAccentMat);
          goldTrim.position.y = 0.48;
          bench.add(cushion, goldTrim);
          interiorGroup.add(bench);
          addInteriorCollider(bx - 0.85, bx + 0.85, -1.45, 2.45);
        });
      }

      // ========================================================================
      // ERA FACULTY 3D OFFICE SPACE WITH CUBICLES (Matching Reference Cubicle Office)
      // ========================================================================
      if (building.id === 'faculty_hq') {
        // 1. Procedural Wood-Grain Texture for Lower Cubicle Partition Panels
        const createCubicleWoodTexture = () => {
          const c = document.createElement('canvas');
          c.width = 256;
          c.height = 256;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#7c4c2a';
          ctx.fillRect(0, 0, 256, 256);

          // Vertical wood plank divisions & wavy walnut wood grain lines
          for (let px = 0; px < 256; px += 32) {
            ctx.fillStyle = px % 64 === 0 ? 'rgba(60,30,12,0.38)' : 'rgba(155,100,55,0.22)';
            ctx.fillRect(px, 0, 3, 256);

            ctx.strokeStyle = 'rgba(52,26,10,0.45)';
            ctx.lineWidth = 2.5;
            for (let g = 0; g < 3; g++) {
              ctx.beginPath();
              const baseLineX = px + 8 + g * 8;
              ctx.moveTo(baseLineX, 0);
              ctx.bezierCurveTo(
                baseLineX + (g % 2 === 0 ? 5 : -5),
                85,
                baseLineX + (g % 2 === 0 ? -5 : 5),
                170,
                baseLineX,
                256
              );
              ctx.stroke();
            }
          }
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          return tex;
        };

        const cubicleWoodMat = new THREE.MeshStandardMaterial({
          map: createCubicleWoodTexture(),
          roughness: 0.65,
          metalness: 0.05
        });
        const cubicleFrameMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.35
        });
        const cubicleGlassMat = new THREE.MeshStandardMaterial({
          color: 0xcbd5e1,
          transparent: true,
          opacity: 0.34,
          roughness: 0.15,
          metalness: 0.25
        });
        const stickyNoteMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const whiteDeskMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.4 });
        const drawerBodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const drawerFrontMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45 });

        // 2. THREE BACK-WALL FRAMED WINDOWS WITH VERTICAL BLINDS & OUTDOOR TREES
        const createOutdoorWindowTexture = (variant: number) => {
          const c = document.createElement('canvas');
          c.width = 256;
          c.height = 384;
          const ctx = c.getContext('2d')!;
          const skyGrad = ctx.createLinearGradient(0, 0, 0, 384);
          skyGrad.addColorStop(0, '#7dd3fc');
          skyGrad.addColorStop(0.65, '#bae6fd');
          skyGrad.addColorStop(0.66, '#4d7c0f');
          skyGrad.addColorStop(1, '#3f6212');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, 256, 384);

          // Trunk
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(114, 210, 24, 140);

          // Stylized rounded tree foliage outside the office window
          if (variant === 0) {
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(115, 165, 62, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(145, 205, 46, 0, Math.PI * 2);
            ctx.fill();
          } else if (variant === 1) {
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(128, 150, 68, 36, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.ellipse(128, 198, 56, 32, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#65a30d';
            ctx.beginPath();
            ctx.arc(130, 175, 60, 0, Math.PI * 2);
            ctx.fill();
          }

          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };

        const windowFrameWoodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.55 });
        const blindSlatMat = new THREE.MeshStandardMaterial({
          color: 0xd1d5db,
          transparent: true,
          opacity: 0.72,
          roughness: 0.5
        });

        [-5.6, 0.2, 6.0].forEach((wx, wIdx) => {
          const winGroup = new THREE.Group();
          winGroup.position.set(wx, 2.85, -roomD / 2 + 0.28);

          // Outdoor tree view backdrop
          const viewPane = new THREE.Mesh(
            new THREE.PlaneGeometry(2.6, 3.9),
            new THREE.MeshBasicMaterial({ map: createOutdoorWindowTexture(wIdx) })
          );
          winGroup.add(viewPane);

          // Outer dark wood frame & center window mullions
          const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.18, 0.14), windowFrameWoodMat);
          topBar.position.y = 1.98;
          const botBar = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.2, 0.22), windowFrameWoodMat);
          botBar.position.y = -1.98;
          const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.1, 0.14), windowFrameWoodMat);
          leftBar.position.x = -1.34;
          const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.1, 0.14), windowFrameWoodMat);
          rightBar.position.x = 1.34;
          const midVert = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.9, 0.12), windowFrameWoodMat);
          const midHoriz = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.12), windowFrameWoodMat);
          midHoriz.position.y = 0.25;
          winGroup.add(topBar, botBar, leftBar, rightBar, midVert, midHoriz);

          // Top black curtain rod & vertical blind slats
          const curtainRod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 3.2, 10),
            darkMetalMat
          );
          curtainRod.rotation.z = Math.PI / 2;
          curtainRod.position.set(0, 2.22, 0.12);
          winGroup.add(curtainRod);

          for (let s = -5; s <= 5; s++) {
            if (wIdx === 1 && Math.abs(s) <= 2) continue; // Center window slightly parted
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.95, 0.02), blindSlatMat);
            slat.position.set(s * 0.22, 0.1, 0.12);
            slat.rotation.y = 0.28;
            winGroup.add(slat);
          }

          interiorGroup.add(winGroup);
        });

        // Left-wall vertical window blind curtain near back-left corner
        const sideCurtainGroup = new THREE.Group();
        sideCurtainGroup.position.set(-roomW / 2 + 0.34, 2.8, -8.8);
        sideCurtainGroup.rotation.y = Math.PI / 2;
        for (let s = -6; s <= 6; s++) {
          const slat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.3, 0.04), blindSlatMat);
          slat.position.set(s * 0.26, 0, 0);
          slat.rotation.y = 0.22;
          sideCurtainGroup.add(slat);
        }
        interiorGroup.add(sideCurtainGroup);

        // 3. LEFT-WALL ROUND ANALOG OFFICE CLOCK & FRAMED MODERN GEOMETRIC WALL ART
        const createClockFaceTexture = () => {
          const c = document.createElement('canvas');
          c.width = 256;
          c.height = 256;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(128, 128, 120, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 14;
          ctx.strokeStyle = '#1e293b';
          ctx.stroke();

          // 12 hour tick marks
          for (let h = 0; h < 12; h++) {
            const a = (h / 12) * Math.PI * 2;
            ctx.save();
            ctx.translate(128, 128);
            ctx.rotate(a);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-4, -102, 8, 22);
            ctx.restore();
          }

          // Hour hand (~10 o'clock) & Minute hand (~2 o'clock)
          ctx.strokeStyle = '#0f172a';
          ctx.lineCap = 'round';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(128, 128);
          ctx.lineTo(78, 96);
          ctx.stroke();

          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(128, 128);
          ctx.lineTo(182, 92);
          ctx.stroke();

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(128, 128, 8, 0, Math.PI * 2);
          ctx.fill();

          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };

        const clockGroup = new THREE.Group();
        clockGroup.position.set(-roomW / 2 + 0.3, 4.35, -1.8);
        clockGroup.rotation.y = Math.PI / 2;
        const clockBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.72, 0.72, 0.14, 28),
          darkMetalMat
        );
        clockBody.rotation.x = Math.PI / 2;
        const clockFace = new THREE.Mesh(
          new THREE.CircleGeometry(0.66, 28),
          new THREE.MeshBasicMaterial({ map: createClockFaceTexture() })
        );
        clockFace.position.z = 0.08;
        clockGroup.add(clockBody, clockFace);
        interiorGroup.add(clockGroup);

        // Framed Modern Wall Posters (Left & Right Office Walls)
        const addFramedWallPoster = (
          x: number,
          y: number,
          z: number,
          rotY: number,
          w: number,
          h: number,
          drawFn: (ctx: CanvasRenderingContext2D) => void
        ) => {
          const c = document.createElement('canvas');
          c.width = 256;
          c.height = 256;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 256, 256);
          drawFn(ctx);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;

          const pGroup = new THREE.Group();
          pGroup.position.set(x, y, z);
          pGroup.rotation.y = rotY;
          const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.08), whiteDeskMat);
          const canvasPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex })
          );
          canvasPlane.position.z = 0.05;
          pGroup.add(frame, canvasPlane);
          interiorGroup.add(pGroup);
        };

        // Left-wall minimalist line-art poster
        addFramedWallPoster(-roomW / 2 + 0.28, 3.6, -4.4, Math.PI / 2, 1.35, 1.55, (ctx) => {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(128, 128, 65, 0, Math.PI * 1.65);
          ctx.stroke();
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(155, 145, 24, 0, Math.PI * 2);
          ctx.fill();
        });

        // Right-wall geometric red/black triangle poster (matching right wall of reference image)
        addFramedWallPoster(roomW / 2 - 0.28, 3.55, 0.8, -Math.PI / 2, 1.5, 1.65, (ctx) => {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(45, 50);
          ctx.lineTo(215, 75);
          ctx.lineTo(135, 215);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(140, 115, 28, 0, Math.PI * 2);
          ctx.fill();
        });

        // Right-wall botanical leaf poster
        addFramedWallPoster(roomW / 2 - 0.28, 3.55, -4.2, -Math.PI / 2, 1.35, 1.55, (ctx) => {
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(128, 220);
          ctx.quadraticCurveTo(120, 120, 140, 45);
          ctx.stroke();
          ctx.fillStyle = '#16a34a';
          [-38, 38].forEach((dx, i) => {
            ctx.beginPath();
            ctx.ellipse(128 + dx, 95 + i * 35, 28, 14, dx < 0 ? -0.4 : 0.4, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        // 4. FREESTANDING WHITE PRESENTATION FLIP-CHART / ANALYTICS STAND (Back of Central Aisle)
        const createFlipChartTexture = () => {
          const c = document.createElement('canvas');
          c.width = 256;
          c.height = 340;
          const ctx = c.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 256, 340);
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 20px Plus Jakarta Sans, sans-serif';
          ctx.fillText('ERA FACULTY', 58, 38);

          // Colorful Pie Chart
          const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308'];
          let startAng = 0;
          [0.35, 0.25, 0.22, 0.18].forEach((slice, idx) => {
            ctx.fillStyle = colors[idx];
            ctx.beginPath();
            ctx.moveTo(128, 130);
            ctx.arc(128, 130, 56, startAng, startAng + slice * Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            startAng += slice * Math.PI * 2;
          });

          // Mini Bar Chart rows
          [
            { y: 225, w: 140, col: '#3b82f6' },
            { y: 255, w: 170, col: '#f97316' },
            { y: 285, w: 120, col: '#22c55e' }
          ].forEach((bar) => {
            ctx.fillStyle = bar.col;
            ctx.fillRect(42, bar.y, bar.w, 16);
          });

          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };

        const adminBoardSpec = INTERIOR_BOARDS_BY_BUILDING['faculty_hq'][0];
        const chartStandGroup = new THREE.Group();
        chartStandGroup.position.set(-1.35, 0, -10.2);
        const chartBoard = new THREE.Mesh(
          new THREE.BoxGeometry(1.55, 2.2, 0.1),
          whiteDeskMat
        );
        chartBoard.position.y = 1.65;
        chartBoard.userData = { boardSpec: adminBoardSpec };
        const chartFace = new THREE.Mesh(
          new THREE.PlaneGeometry(1.42, 2.0),
          new THREE.MeshBasicMaterial({ map: createFlipChartTexture() })
        );
        chartFace.position.set(0, 1.65, 0.06);
        chartFace.userData = { boardSpec: adminBoardSpec };
        const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), darkMetalMat);
        leftLeg.position.set(-0.55, 0.75, -0.1);
        const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), darkMetalMat);
        rightLeg.position.set(0.55, 0.75, -0.1);
        chartStandGroup.add(chartBoard, chartFace, leftLeg, rightLeg);
        interiorGroup.add(chartStandGroup);
        clickableBoardMeshes.push(chartBoard, chartFace);
        currentInteriorBoards.push({
          spec: adminBoardSpec,
          x: INTERIOR_ORIGIN.x - 1.35,
          z: INTERIOR_ORIGIN.z - 9.2,
          mesh: chartFace
        });

        // 5. POTTED BROAD-LEAF TROPICAL OFFICE PLANTS (Matching Foreground & Background Plants in Reference)
        const addTropicalOfficePlant = (px: number, pz: number, scale = 1) => {
          const pGroup = new THREE.Group();
          pGroup.position.set(px, 0, pz);
          pGroup.scale.setScalar(scale);

          const pot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.28, 0.74, 16),
            new THREE.MeshStandardMaterial({ color: 0x8d4925, roughness: 0.65 })
          );
          pot.position.y = 0.37;
          const potRim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.45, 0.43, 0.1, 16),
            new THREE.MeshStandardMaterial({ color: 0x9c522b, roughness: 0.6 })
          );
          potRim.position.y = 0.72;
          const soil = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 0.05, 14),
            new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.9 })
          );
          soil.position.y = 0.75;
          pGroup.add(pot, potRim, soil);

          const stemMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.5 });
          const leafMat = new THREE.MeshStandardMaterial({ color: 0xa3c940, roughness: 0.45 });

          for (let l = 0; l < 6; l++) {
            const ang = (l / 6) * Math.PI * 2 + 0.3;
            const stemH = 0.65 + (l % 2) * 0.28;
            const leafGroup = new THREE.Group();
            leafGroup.position.set(0, 0.75, 0);
            leafGroup.rotation.y = ang;

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, stemH, 8), stemMat);
            stem.position.set(0.12, stemH / 2, 0);
            stem.rotation.z = -0.32;

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.03, 0.32), leafMat);
            blade.position.set(0.44, stemH - 0.02, 0);
            blade.rotation.z = -0.25;
            leafGroup.add(stem, blade);
            pGroup.add(leafGroup);
          }

          interiorGroup.add(pGroup);
        };

        // Tropical office plants at the ends of cubicle rows & by the back windows
        addTropicalOfficePlant(2.85, 4.95, 1.12);
        addTropicalOfficePlant(-2.85, 4.95, 1.05);
        addTropicalOfficePlant(-3.4, -10.4, 0.95);
        addTropicalOfficePlant(3.4, -10.4, 0.95);

        // 6. HELPER TO BUILD MODULAR WOOD-AND-GLASS CUBICLE PARTITION WALLS
        const buildCubiclePartitionWall = (len: number, hasStickyNote = false) => {
          const wGroup = new THREE.Group();
          const thickness = 0.11;

          // Lower Walnut Wood-Grain Panel (y = 0.06 to 1.34)
          const woodPanel = new THREE.Mesh(
            new THREE.BoxGeometry(len - 0.08, 1.28, thickness * 0.82),
            cubicleWoodMat
          );
          woodPanel.position.y = 0.7;
          woodPanel.castShadow = true;
          woodPanel.receiveShadow = true;
          wGroup.add(woodPanel);

          // Upper Translucent Frosted Glass Panel (y = 1.38 to 1.98)
          const glassPanel = new THREE.Mesh(
            new THREE.BoxGeometry(len - 0.1, 0.58, thickness * 0.45),
            cubicleGlassMat
          );
          glassPanel.position.y = 1.68;
          wGroup.add(glassPanel);

          // Black Metal Frame Rails (Bottom, Middle Divider, Top Header) & End Posts
          const botRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, thickness), cubicleFrameMat);
          botRail.position.y = 0.035;
          const midRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, thickness), cubicleFrameMat);
          midRail.position.y = 1.36;
          const topRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, thickness), cubicleFrameMat);
          topRail.position.y = 2.02;

          const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.06, thickness + 0.01), cubicleFrameMat);
          leftPost.position.set(-len / 2 + 0.055, 1.03, 0);
          const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.06, thickness + 0.01), cubicleFrameMat);
          rightPost.position.set(len / 2 - 0.055, 1.03, 0);
          wGroup.add(botRail, midRail, topRail, leftPost, rightPost);

          // Center vertical mullion on longer walls
          if (len >= 2.2) {
            const centerMullion = new THREE.Mesh(
              new THREE.BoxGeometry(0.065, 2.02, thickness + 0.005),
              cubicleFrameMat
            );
            centerMullion.position.set(0, 1.01, 0);
            wGroup.add(centerMullion);
          }

          // Yellow Sticky Notes stuck to the partition frame
          if (hasStickyNote) {
            const note1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.02), stickyNoteMat);
            note1.position.set(len * 0.18, 1.35, thickness * 0.55);
            const note2 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.02), stickyNoteMat);
            note2.position.set(-len * 0.22, 1.12, -thickness * 0.55);
            wGroup.add(note1, note2);
          }

          return wGroup;
        };

        // 7. BUILD LEFT & RIGHT CUBICLE BAYS ALONG THE OPEN CENTRAL AISLE (x = -2.4 to +2.4 is open carpet aisle)
        const chairBackColors = [0xeab308, 0x06b6d4, 0xef4444, 0x22c55e, 0x8b5cf6];
        const wireBinMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.4,
          metalness: 0.6,
          wireframe: true
        });
        const crumpledPaperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });

        // Separate the 22 employees into 16 seated cubicle specialists (facing the door +Z) + 6 roaming office employees walking naturally around the room
        const walkingIds = new Set([
          'emp_coordinator',
          'emp_pet',
          'emp_lesson_planner',
          'emp_game_designer',
          'emp_student_affairs',
          'emp_creative_director'
        ]);
        const seatedEmployees = INITIAL_FACULTY_EMPLOYEES.filter((e) => !walkingIds.has(e.id));
        const walkingEmployees = INITIAL_FACULTY_EMPLOYEES.filter((e) => walkingIds.has(e.id));

        // 4 Spacious Cubicle Rows from Back to Front, 4 Cubicles per Row = 16 Cubicles (Redesigned so ALL desks, chairs & employees face the Front Door at +Z!)
        const rowZPositions = [-6.8, -2.4, 2.0, 6.4];
        const colXPositions = [-9.6, -4.6, 4.6, 9.6];

        addInteriorCollider(-2.2, -0.5, -10.8, -9.5); // Flip-chart stand collider

        seatedEmployees.forEach((emp, idx) => {
          const rowIdx = Math.floor(idx / 4);
          const colIdx = idx % 4;
          const cx = colXPositions[colIdx];
          const cz = rowZPositions[rowIdx] ?? 6.4;
          const isLeftWing = cx < 0;
          const isInnerAisleCubicle = Math.abs(cx) < 6.0;

          const cubicleGroup = new THREE.Group();
          cubicleGroup.position.set(cx, 0, cz);

          // Back Cubicle Partition Wall behind the employee's chair (at -Z so the employee faces +Z toward the Front Door!)
          const backPart = buildCubiclePartitionWall(3.5, idx % 2 === 0);
          backPart.position.set(0, 0, -1.25);
          cubicleGroup.add(backPart);

          // Low Half-Height Front Modesty Partition in front of the desk (+Z) so employees have a clear view facing the Door (+Z)
          const frontLowWall = new THREE.Group();
          frontLowWall.position.set(0, 0, 1.05);
          const lowWood = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.86, 0.09), cubicleWoodMat);
          lowWood.position.y = 0.46;
          lowWood.castShadow = true;
          const lowGlass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 0.05), cubicleGlassMat);
          lowGlass.position.y = 1.04;
          const lowTopRail = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 0.11), cubicleFrameMat);
          lowTopRail.position.y = 1.2;
          const lowMidRail = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.05, 0.11), cubicleFrameMat);
          lowMidRail.position.y = 0.89;
          frontLowWall.add(lowWood, lowGlass, lowTopRail, lowMidRail);
          cubicleGroup.add(frontLowWall);

          // Side Cubicle Partition Wall (separating cubicle from central aisle or outer wall, leaving an entry gap on the chair side)
          const aisleSideX = isLeftWing ? 1.72 : -1.72;
          const sidePart = buildCubiclePartitionWall(1.65, idx % 3 === 0);
          sidePart.rotation.y = Math.PI / 2;
          sidePart.position.set(aisleSideX, 0, 0.22);
          cubicleGroup.add(sidePart);

          if (!isInnerAisleCubicle) {
            const outerPart = buildCubiclePartitionWall(2.3, false);
            outerPart.rotation.y = Math.PI / 2;
            outerPart.position.set(isLeftWing ? -1.72 : 1.72, 0, -0.1);
            cubicleGroup.add(outerPart);
          }

          // WHITE OFFICE DESK placed in front of the employee (+Z side of cubicle so employee sits at -Z and faces +Z toward the Door)
          const deskZOffset = 0.42;
          const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.08, 1.05), whiteDeskMat);
          deskTop.position.set(0, 0.78, deskZOffset);
          deskTop.castShadow = true;
          deskTop.receiveShadow = true;
          deskTop.userData = { isFacultyEmployee: true, employeeProfile: emp };
          cubicleGroup.add(deskTop);
          clickableBoardMeshes.push(deskTop);

          // 4 Dark Metal Cylindrical Desk Legs
          [
            [-1.12, deskZOffset - 0.42],
            [1.12, deskZOffset - 0.42],
            [-1.12, deskZOffset + 0.42],
            [1.12, deskZOffset + 0.42]
          ].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.76, 10), darkMetalMat);
            leg.position.set(lx, 0.38, lz);
            cubicleGroup.add(leg);
          });

          // 3-DRAWER DARK GREY PEDESTAL FILING CABINET under one end of the desk (drawers facing -Z toward the employee)
          const cabX = isLeftWing ? -0.76 : 0.76;
          const cabBody = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.88), drawerBodyMat);
          cabBody.position.set(cabX, 0.36, deskZOffset);
          cubicleGroup.add(cabBody);

          [0.16, 0.38, 0.6].forEach((dy) => {
            const drawerFace = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.04), drawerFrontMat);
            drawerFace.position.set(cabX, dy, deskZOffset - 0.45);
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.04), darkMetalMat);
            handle.position.set(cabX, dy, deskZOffset - 0.48);
            cubicleGroup.add(drawerFace, handle);
          });

          // OPEN SILVER/DARK-GREY LAPTOP ON DESK (Oriented so the employee facing +Z looks at the screen)
          const laptopGroup = new THREE.Group();
          laptopGroup.position.set(isLeftWing ? 0.18 : -0.18, 0.82, deskZOffset - 0.04);
          const lapBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.025, 0.38),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.5 })
          );
          const lapKeys = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.03, 0.22),
            darkMetalMat
          );
          lapKeys.position.set(0, 0.005, -0.02);
          const lapScreenFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.38, 0.025),
            darkMetalMat
          );
          lapScreenFrame.position.set(0, 0.19, 0.18);
          lapScreenFrame.rotation.x = 0.22;
          lapScreenFrame.userData = { isFacultyEmployee: true, employeeProfile: emp };
          const lapDisplay = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.32),
            new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0xbae6fd : 0xd1fae5 })
          );
          lapDisplay.position.set(0, 0.19, 0.165);
          lapDisplay.rotation.y = Math.PI;
          lapDisplay.rotation.x = -0.22;
          lapDisplay.userData = { isFacultyEmployee: true, employeeProfile: emp };
          laptopGroup.add(lapBase, lapKeys, lapScreenFrame, lapDisplay);
          cubicleGroup.add(laptopGroup);
          clickableBoardMeshes.push(lapScreenFrame, lapDisplay);

          // Colored Mousepad & Grey Mouse
          const mousePad = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.012, 0.24),
            new THREE.MeshStandardMaterial({ color: idx % 2 === 0 ? 0xfacc15 : 0x38bdf8, roughness: 0.6 })
          );
          mousePad.position.set(isLeftWing ? 0.62 : -0.62, 0.825, deskZOffset - 0.1);
          const mouse = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.035, 0.12),
            drawerFrontMat
          );
          mouse.position.set(isLeftWing ? 0.62 : -0.62, 0.84, deskZOffset - 0.1);
          cubicleGroup.add(mousePad, mouse);

          // TWO-TIER WIRE PAPER INBOX TRAY WITH WHITE PAPER STACK + PEN CUP
          const trayX = isLeftWing ? -0.68 : 0.68;
          const trayFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.14, 0.34),
            wireBinMat
          );
          trayFrame.position.set(trayX, 0.89, deskZOffset + 0.06);
          const paperStack = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.07, 0.28),
            crumpledPaperMat
          );
          paperStack.position.set(trayX, 0.87, deskZOffset + 0.06);
          paperStack.rotation.y = 0.08;
          cubicleGroup.add(trayFrame, paperStack);

          // Pen Cup with 3 Colored Pens
          const penCup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.048, 0.14, 12),
            drawerFrontMat
          );
          penCup.position.set(isLeftWing ? 0.88 : -0.88, 0.89, deskZOffset + 0.18);
          cubicleGroup.add(penCup);
          [0xef4444, 0xfacc15, 0x3b82f6].forEach((pCol, pIdx) => {
            const pen = new THREE.Mesh(
              new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6),
              new THREE.MeshBasicMaterial({ color: pCol })
            );
            pen.position.set(
              (isLeftWing ? 0.88 : -0.88) + (pIdx - 1) * 0.02,
              0.96,
              deskZOffset + 0.18
            );
            pen.rotation.z = (pIdx - 1) * 0.18;
            cubicleGroup.add(pen);
          });

          // WIRE-MESH WASTEBASKET WITH CRUMPLED WHITE PAPER BALLS BESIDE THE DESK
          const binX = isLeftWing ? 1.28 : -1.28;
          const binZ = deskZOffset - 0.28;
          const wasteBin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.16, 0.44, 12, 2, true),
            wireBinMat
          );
          wasteBin.position.set(binX, 0.22, binZ);
          cubicleGroup.add(wasteBin);

          [
            [binX - 0.05, 0.1, binZ + 0.03],
            [binX + 0.06, 0.14, binZ - 0.04],
            [binX, 0.22, binZ + 0.02]
          ].forEach(([px, py, pz], pIdx) => {
            const paperBall = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), crumpledPaperMat);
            paperBall.position.set(px, py, pz);
            paperBall.rotation.set(pIdx, pIdx * 1.3, 0);
            cubicleGroup.add(paperBall);
          });

          // COLORFUL ERGONOMIC SWIVEL OFFICE CHAIR (Positioned at -Z facing +Z toward the desk and Front Door!)
          const chairGroup = new THREE.Group();
          const chairZ = -0.38;
          chairGroup.position.set(0, 0, chairZ);

          const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 10), darkMetalMat);
          chairStem.position.y = 0.24;
          chairGroup.add(chairStem);

          // 5-Star Caster Legs & Wheels
          for (let legI = 0; legI < 5; legI++) {
            const la = (legI / 5) * Math.PI * 2;
            const starArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.34), darkMetalMat);
            starArm.position.set(Math.sin(la) * 0.16, 0.07, Math.cos(la) * 0.16);
            starArm.rotation.y = la;
            const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), darkMetalMat);
            caster.rotation.z = Math.PI / 2;
            caster.position.set(Math.sin(la) * 0.31, 0.035, Math.cos(la) * 0.31);
            chairGroup.add(starArm, caster);
          }

          // White Padded Seat Cushion
          const seatPad = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.09, 0.54), whiteDeskMat);
          seatPad.position.y = 0.47;
          chairGroup.add(seatPad);

          // Loop Armrests
          [-0.29, 0.29].forEach((ax) => {
            const armRest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.36), drawerBodyMat);
            armRest.position.set(ax, 0.6, 0.02);
            chairGroup.add(armRest);
          });

          // Colorful Curved Backrest at -Z (behind the employee so the chair faces +Z toward the Door!)
          const backCol = chairBackColors[idx % chairBackColors.length];
          const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.58, 0.09),
            new THREE.MeshStandardMaterial({ color: backCol, roughness: 0.35 })
          );
          chairBack.position.set(0, 0.82, -0.24);
          chairBack.rotation.x = -0.1;
          chairGroup.add(chairBack);

          cubicleGroup.add(chairGroup);
          interiorGroup.add(cubicleGroup);

          // Register cubicle obstacle collider so characters never walk through cubicle walls or desks
          addInteriorCollider(cx - 1.75, cx + 1.75, cz - 1.3, cz + 1.12);

          // SPAWN SEATED AI EMPLOYEE ON THEIR OFFICE CHAIR FACING THE FRONT DOOR (+Z, rotY = 0)
          const empRig = buildCharacterAvatar({
            shirtColor: emp.shirtColor,
            hairColor: emp.hairColor,
            skinColor: emp.skinColor,
            hatType: emp.hatType,
            accessoryType: emp.accessoryType,
            name: `${emp.name} (${emp.jobTitle})`,
            cohort: emp.department === 'head_admin' ? 'TEACHER (SUPER ADMIN)' : 'IELTS 1',
            gender: emp.gender,
            hairStyle: emp.hairStyle,
            clothingType: emp.clothingType,
            pantsColor: emp.pantsColor
          });
          const empWorldX = cx;
          const empWorldZ = cz - 0.36;
          const empRotY = 0; // Facing +Z toward their desk and the Front Entrance/Exit Door!
          empRig.root.scale.setScalar(0.82);
          empRig.root.position.set(empWorldX, 0, empWorldZ);
          empRig.root.rotation.y = empRotY;
          empRig.hipsGroup.position.y = 0.46;
          empRig.vehicleGroup.visible = false;
          empRig.leftLeg.rotation.x = -1.08;
          empRig.rightLeg.rotation.x = -1.08;
          empRig.leftArm.rotation.x = -0.68;
          empRig.rightArm.rotation.x = -0.68;
          empRig.root.children.forEach((child) => {
            if ((child as THREE.Sprite).isSprite) {
              child.scale.multiplyScalar(0.52);
              child.position.y = 3.1;
            }
          });
          interiorGroup.add(empRig.root);
          addInteriorPerson(empWorldX, empWorldZ, 0.72);

          // Invisible Click Hitbox cylinder around the AI Employee & Workstation
          const empHitbox = new THREE.Mesh(
            new THREE.CylinderGeometry(1.05, 1.05, 3.0, 12),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
          );
          empHitbox.position.set(empWorldX, 1.4, empWorldZ + 0.25);
          empHitbox.userData = { isFacultyEmployee: true, employeeProfile: emp };
          interiorGroup.add(empHitbox);
          clickableBoardMeshes.push(empHitbox);

          facultyNpcActors.push({
            employee: emp,
            rig: empRig,
            floor: 1,
            baseX: empWorldX,
            baseY: 0,
            baseZ: empWorldZ,
            baseRotY: empRotY,
            speechTimer: 2.5 + (idx % 7) * 2.2,
            bubbleIndex: 0,
            isWalker: false,
            targetX: empWorldX,
            targetZ: empWorldZ,
            walkPhase: idx * 0.8,
            pauseTimer: 0,
            walkSpeed: 0,
            waypointIdx: 0
          });
        });

        // 8. SPAWN 6 NATURAL ROAMING FACULTY EMPLOYEES WALKING AROUND THE OFFICE ROOM
        const officeWaypoints = [
          { x: -1.1, z: -8.6 },
          { x: 1.1, z: -8.6 },
          { x: -1.2, z: -4.6 },
          { x: 1.2, z: -4.6 },
          { x: -1.1, z: -0.2 },
          { x: 1.1, z: -0.2 },
          { x: -1.2, z: 4.2 },
          { x: 1.2, z: 4.2 },
          { x: -3.2, z: 8.4 },
          { x: 0.0, z: 8.6 },
          { x: 3.2, z: 8.4 },
          { x: 2.4, z: -9.2 }
        ];

        walkingEmployees.forEach((emp, wIdx) => {
          const empRig = buildCharacterAvatar({
            shirtColor: emp.shirtColor,
            hairColor: emp.hairColor,
            skinColor: emp.skinColor,
            hatType: emp.hatType,
            accessoryType: emp.accessoryType,
            name: `${emp.name} (${emp.jobTitle})`,
            cohort: emp.department === 'head_admin' ? 'TEACHER (SUPER ADMIN)' : 'IELTS 1',
            gender: emp.gender,
            hairStyle: emp.hairStyle,
            clothingType: emp.clothingType,
            pantsColor: emp.pantsColor
          });
          const startWp = officeWaypoints[(wIdx * 2) % officeWaypoints.length];
          const nextWp = officeWaypoints[(wIdx * 2 + 3) % officeWaypoints.length];
          empRig.root.scale.setScalar(0.86);
          empRig.root.position.set(startWp.x, 0, startWp.z);
          empRig.root.rotation.y = 0; // Initially facing +Z toward the door
          empRig.root.children.forEach((child) => {
            if ((child as THREE.Sprite).isSprite) {
              child.scale.multiplyScalar(0.55);
              child.position.y = 3.5;
            }
          });
          interiorGroup.add(empRig.root);

          const empHitbox = new THREE.Mesh(
            new THREE.CylinderGeometry(1.0, 1.0, 3.0, 12),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false })
          );
          empHitbox.position.set(0, 1.5, 0);
          empHitbox.userData = { isFacultyEmployee: true, employeeProfile: emp };
          empRig.root.add(empHitbox);
          clickableBoardMeshes.push(empHitbox);

          facultyNpcActors.push({
            employee: emp,
            rig: empRig,
            floor: 1,
            baseX: startWp.x,
            baseY: 0,
            baseZ: startWp.z,
            baseRotY: 0,
            speechTimer: 3.5 + wIdx * 2.8,
            bubbleIndex: 0,
            isWalker: true,
            targetX: nextWp.x,
            targetZ: nextWp.z,
            walkPhase: wIdx * 1.3,
            pauseTimer: (wIdx % 3) * 0.8,
            walkSpeed: 2.3 + (wIdx % 3) * 0.25,
            waypointIdx: (wIdx * 2 + 3) % officeWaypoints.length
          });
        });
      } else if (!building.id.startsWith('class_')) {
        // For non-classroom hub rooms (EraGames, EraSHOP, Era Gallery, Dashboard Hall, Practice Tests, Homework),
        // also spawn dynamic IELTS 1 & IELTS 2 classmates walking in & out of the room and interacting!
        const studentPool = npcActors
          .map((n) => n.profile)
          .filter((p) => p.cohort === 'IELTS 1' || p.cohort === 'IELTS 2');
        const hubVisitorTargets = [
          { x: -5.4, z: -3.2, prefName: 'Nhi' },
          { x: 5.4, z: -3.2, prefName: 'Dan' },
          { x: -3.8, z: 3.5, prefName: 'Tracy' },
          { x: 3.8, z: 3.5, prefName: 'Vinh' }
        ];
        hubVisitorTargets.forEach((hv, hIdx) => {
          const prof =
            studentPool.find((p) => p.name.toLowerCase() === hv.prefName.toLowerCase()) ||
            studentPool[(hIdx + 8) % Math.max(1, studentPool.length)] ||
            DEFAULT_IELTS_CHARACTERS[(hIdx + 8) % DEFAULT_IELTS_CHARACTERS.length];
          const hvRig = buildCharacterAvatar({
            shirtColor: prof.shirtColor,
            hairColor: prof.hairColor,
            skinColor: prof.skinColor,
            hatType: prof.hatType,
            accessoryType: prof.accessoryType,
            name: `${prof.name} • ${prof.cohort}`,
            cohort: prof.cohort,
            gender: prof.gender,
            hairStyle: prof.hairStyle,
            clothingType: prof.clothingType,
            pantsColor: prof.pantsColor,
            beltType: prof.beltType
          });
          const enteringNow = hIdx % 2 === 0;
          hvRig.root.position.set(enteringNow ? (hIdx === 0 ? -0.8 : 0.8) : hv.x, 0, enteringNow ? 10.5 : hv.z);
          hvRig.root.rotation.y = Math.PI;
          interiorGroup.add(hvRig.root);

          interiorNpcActors.push({
            profile: prof,
            rig: hvRig,
            role: 'roaming_visitor',
            state: enteringNow ? 'walking_in' : 'at_spot',
            targetX: hv.x,
            targetZ: hv.z,
            spotX: hv.x,
            spotZ: hv.z,
            timer: 4.5 + hIdx * 3.0,
            walkPhase: hIdx * 1.4,
            handRaiseTimer: 0
          });
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
      isSitting: false,
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

    const sitAtClassroomDesk = (desk: { seatX: number; seatZ: number; deskName: string; classCohort: string }) => {
      soundEngine.playUiClick();
      playerState.isSitting = true;
      playerState.isCrouching = false;
      setIsCrouching(false);
      setIsSittingAtDesk(true);
      playerState.x = desk.seatX;
      playerState.y = 0;
      playerState.z = desk.seatZ;
      playerState.vx = 0;
      playerState.vz = 0;
      playerState.vy = 0;
      playerState.rotY = Math.PI; // Face the front classroom chalkboard
      playerRig.hipsGroup.position.y = 0.56;
      playerRig.vehicleGroup.visible = false;
      playerRig.leftLeg.rotation.x = -1.12;
      playerRig.rightLeg.rotation.x = -1.12;
      showToast(
        `Seated at ${desk.deskName}`,
        `Studying with ${desk.classCohort} class! Press [Space] or Move (W/A/S/D) to stand up.`,
        '#10B981'
      );
    };

    const standUpFromDesk = () => {
      if (!playerState.isSitting) return;
      soundEngine.playUiClick();
      playerState.isSitting = false;
      setIsSittingAtDesk(false);
      playerState.y = 0;
      playerState.z += 0.48;
      playerRig.hipsGroup.position.y = playerRig.defaultHipsY;
      playerRig.vehicleGroup.visible = true;
    };

    const enterBuildingInterior = (b: BuildingZone) => {
      if (b.id === 'faculty_hq' && !isAuthorizedFacultyRef.current) {
        soundEngine.playDoorSlide(false);
        doorCooldownTimer = 1.6;
        playerState.z = b.doorZ + b.frontDir * 3.8;
        showToast(
          '🔒 ERA FACULTY — Teachers & Admin Only',
          'Only Teacher Jan and authorized Faculty can enter ERA FACULTY and operate AI Workstations.',
          '#D97706'
        );
        return;
      }
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
      playerState.isSitting = false;
      setIsSittingAtDesk(false);
      playerRig.hipsGroup.position.y = playerRig.defaultHipsY;
      playerRig.vehicleGroup.visible = true;
      buildInteriorRoom(b);
      interiorGroup.visible = true;
      playerState.x = INTERIOR_ORIGIN.x;
      playerState.y = 0;
      playerState.z = INTERIOR_ORIGIN.z + (b.id === 'faculty_hq' ? 8.2 : 5.5);
      playerState.vx = 0;
      playerState.vz = 0;
      playerState.vy = 0;
      playerState.rotY = Math.PI;
      camState.yaw = 0;
      camState.pitch = b.id === 'faculty_hq' ? 0.04 : b.id === 'dashboard' ? 0.25 : 0.28;
      camState.distance = b.id === 'faculty_hq' ? 9.2 : b.id === 'dashboard' ? 13.8 : 11.8;
      setZoomSliderValue(b.id === 'faculty_hq' ? 9 : b.id === 'dashboard' ? 14 : 12);
      setInsideBuilding(b);
      setNearBuildingPrompt(null);

      // Snap camera instantly to interior room
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
      } else if (b.id === 'faculty_hq') {
        showToast(
          '🏢 Welcome to ERA FACULTY',
          'Walk down the central office aisle and click any cubicle workstation to assign tasks or review assessments!',
          '#D97706'
        );
      } else if (b.id.startsWith('class_')) {
        showToast(
          `Inside ${b.name}`,
          `Click any classroom desk chair or press [E] near a desk to sit down in class!`,
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
      playerState.isSitting = false;
      setIsSittingAtDesk(false);
      playerRig.hipsGroup.position.y = playerRig.defaultHipsY;
      playerRig.vehicleGroup.visible = true;
      setNearClassroomDesk(null);
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
      sitAtClassroomDesk,
      standUpFromDesk,
      applyAvatarAppearance: (prof) => {
        const oldPos = playerRig.root.position.clone();
        const oldRot = playerRig.root.rotation.y;
        const wasPoleVisible = playerFishingPole.group.visible;
        scene.remove(playerRig.root);
        playerRig = buildCharacterAvatar(prof);
        playerRig.root.position.copy(oldPos);
        playerRig.root.rotation.y = oldRot;
        playerFishingPole = createPlayerFishingPoleMesh();
        playerFishingPole.group.visible = wasPoleVisible;
        playerRig.rightArm.add(playerFishingPole.group);
        scene.add(playerRig.root);
        if (activeInteriorBuilding?.id === 'dashboard') {
          buildInteriorRoom(activeInteriorBuilding);
        }
      },
      setGraphicsQuality: (q: GraphicsQuality) => {
        currentQuality = q;
        if (q === 'high') {
          renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
          renderer.shadowMap.enabled = !isSoftwareGl;
          renderer.toneMappingExposure = 0.96;
          scene.fog = new THREE.FogExp2(0x7dd3fc, 0.003);
        } else if (q === 'medium') {
          renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.15));
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
        const wasPoleVisible = playerFishingPole.group.visible;
        scene.remove(playerRig.root);
        playerRig = buildCharacterAvatar(playerProfile);
        playerRig.root.position.copy(oldPos);
        playerRig.root.rotation.y = oldRot;
        playerFishingPole = createPlayerFishingPoleMesh();
        playerFishingPole.group.visible = wasPoleVisible;
        playerRig.rightArm.add(playerFishingPole.group);
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
        if (playerState.isSitting) {
          standUpFromDesk();
          return;
        }
        if (playerState.isGrounded) {
          playerState.isCrouching = false;
          setIsCrouching(false);
          playerState.vy = 12.2;
          playerState.isGrounded = false;
          soundEngine.playJump(false);
        }
      },
      toggleCrouch: () => {
        if (playerState.isSitting) {
          standUpFromDesk();
          return;
        }
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
        if (actorId === 'player' || actorId === 'player-self') {
          attachSpeechBubble(playerRig.root, speakerName, text, isWarning);
          return;
        }
        if (activeInteriorBuilding) {
          const foundInt = interiorNpcActors.find((n) => n.profile.id === actorId || n.profile.name === speakerName);
          if (foundInt) {
            attachSpeechBubble(foundInt.rig.root, speakerName, text, isWarning);
            return;
          }
        }
        const foundNpc = npcActors.find((n) => n.profile.id === actorId || n.profile.name === speakerName);
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
      },
      switchFacultyFloor: (floor: 1 | 2) => {
        soundEngine.playUiClick();
        currentFacultyFloor = floor;
        setFacultyInteriorFloor(floor);
        if (floor === 2) {
          playerState.x = INTERIOR_ORIGIN.x - 7.5;
          playerState.z = INTERIOR_ORIGIN.z + 2.0;
          playerState.y = 5.2;
          playerState.vy = 0;
          showToast('Floor 2: Creative Lab & Student Affairs', 'Click any AI Specialist on Floor 2 to generate teaching content!', '#10B981');
        } else {
          playerState.x = INTERIOR_ORIGIN.x;
          playerState.z = INTERIOR_ORIGIN.z + 4.5;
          playerState.y = 0;
          playerState.vy = 0;
          showToast('Floor 1: Head Admin & Exam Department', 'Click Teacher Jan or any Cambridge/IELTS Examiner on Floor 1!', '#D97706');
        }
      },
      castFishingPole: () => {
        if (activeInteriorBuilding) {
          exitBuildingInterior();
        }
        // If a fish is currently biting, clicking pulls/reels it in immediately!
        if (fishingSimState.phase === 'bite_ready' || fishingSimState.phase === 'bobbing') {
          gameActionsRef.current?.reelInFish();
          return;
        }
        if (fishingSimState.phase !== 'idle') return;

        if (fishingBaitCountRef.current <= 0) {
          soundEngine.playUiClick();
          setShowFishingModal(true);
          showToast('Out of Bait! 🪱', 'Answer a quick class question to collect +2 Bait!', '#06B6D4');
          return;
        }

        // Consume 1 Bait
        handleUpdateFishingBait(fishingBaitCountRef.current - 1);
        soundEngine.playJump(false);

        // Ensure character is standing at the beach shoreline or pier facing the ocean water
        const onSouthBeach = playerState.z > 88 && playerState.x <= 104;
        const onEastBeach = playerState.x > 100;

        if (onSouthBeach) {
          // Face South (+Z) toward South Ocean
          if (playerState.z < 125 && Math.abs(playerState.x - 14) > 4.5) {
            playerState.z = 127.5;
          }
          playerState.rotY = 0;
        } else if (onEastBeach) {
          // Face East (+X) toward East Fishing Lagoon behind Era Football Club
          if (playerState.x < 131) {
            playerState.x = 134.5;
          }
          playerState.rotY = Math.PI / 2;
        } else {
          // Teleport to East Beach Shoreline/Pier behind Era Football Club facing the Lagoon
          playerState.x = 134.5;
          playerState.z = 25;
          playerState.y = 0;
          playerState.rotY = Math.PI / 2;
          camState.yaw = -Math.PI / 2;
        }

        const castDist = 7.5;
        fishingSimState.startX = playerState.x;
        fishingSimState.startZ = playerState.z;
        fishingSimState.waterX = playerState.x + Math.sin(playerState.rotY) * castDist;
        fishingSimState.waterZ = playerState.z + Math.cos(playerState.rotY) * castDist;
        fishingSimState.hookedFish = pickRandomCaughtFish();
        fishingSimState.celebrateTimer = 0;
        fishingSimState.splashTimer = 0;

        if (fishingSimState.hookedFish.isTrash) {
          trashBootMat.color.setHex(fishingSimState.hookedFish.hexColor);
        } else {
          leapingFishMat.color.setHex(fishingSimState.hookedFish.hexColor);
          leapingFishMat.emissive.setHex(fishingSimState.hookedFish.hexColor);
        }
        leapingFish3D.visible = false;
        leapingTrash3D.visible = false;
        biteAlertSprite.visible = false;
        bobber3D.visible = true;
        fishingLine3D.visible = true;

        playerFishingPole.group.visible = true;
        fishingWorldGroup.visible = true;
        fishingSimState.phase = 'casting';
        fishingSimState.timer = 0;
        setFishingPhase('casting');
      },
      reelInFish: () => {
        if (fishingSimState.phase !== 'bite_ready' && fishingSimState.phase !== 'bobbing') return;
        soundEngine.playCrystalCollect();
        fishingSimState.phase = 'reeling_in';
        fishingSimState.timer = 0;
        fishingSimState.splashTimer = 0.55;
        biteAlertSprite.visible = false;
        const isTrashCatch = Boolean(fishingSimState.hookedFish?.isTrash);
        leapingFish3D.visible = !isTrashCatch;
        leapingTrash3D.visible = isTrashCatch;
        setFishingPhase('reeling_in');
      },
      buyTicketAtBooth: () => {
        if (hasCableCarTicketRef.current) {
          soundEngine.playUiClick();
          showToast(
            'Ride Ticket Ready! 🎟️',
            'You already have a $5 Cable Car ticket! Step onto the platform & board the cabin!',
            '#10B981'
          );
          return;
        }
        if (eraDollarsRef.current < 5) {
          soundEngine.playBallKick();
          if (cableCarSim.attendantRoot) {
            attachSpeechBubble(
              cableCarSim.attendantRoot,
              'Ticket Clerk Maya',
              'Tickets are $5 Era Dollars! Catch fish at the beach or play EraGames to earn $5!',
              true
            );
          }
          showToast(
            'Not Enough Era Dollars! ($5 Needed) 🎟️',
            `You have $${eraDollarsRef.current} Era Dollars. Catch fish at the beach or play EraGames to earn $5!`,
            '#F43F5E'
          );
          return;
        }

        // Deduct $5 Era Dollars at the Ticket Booth
        soundEngine.playCrystalCollect();
        setEraDollars((prev) => {
          const next = Math.max(0, prev - 5);
          eraDollarsRef.current = next;
          try {
            localStorage.setItem('eraverse_dollars_v2', String(next));
          } catch {}
          return next;
        });
        hasCableCarTicketRef.current = true;
        setHasCableCarTicket(true);

        if (cableCarSim.turnstileArm) {
          cableCarSim.turnstileArm.rotation.x += Math.PI / 2;
        }
        if (cableCarSim.attendantRoot) {
          attachSpeechBubble(
            cableCarSim.attendantRoot,
            'Ticket Clerk Maya',
            'Ticket purchased (-$5 💵)! Gate open — enjoy your ride up to the Summit Skywalk!',
            false
          );
        }
        showToast(
          'Purchased Cable Car Ticket (-$5 💵) 🎟️',
          'Ticket validated at the booth! Board the Cable Car cabin to ride!',
          '#10B981'
        );
      },
      boardCableCar: (freeReturnFallback = false) => {
        if (activeInteriorBuilding) {
          exitBuildingInterior();
        }
        if (cableCarSim.phase !== 'idle') return;
        if (playerState.isSitting) {
          standUpFromDesk();
        }
        cableCarSim.activeTelescope = null;
        setActiveTelescopeView(null);

        const ridingDown = cableCarSim.isAtSummit || playerState.y > 35;

        // Validate or purchase $5 ticket per ride (unless using free return trail fallback from summit with $0)
        if (!freeReturnFallback) {
          if (hasCableCarTicketRef.current) {
            hasCableCarTicketRef.current = false;
            setHasCableCarTicket(false);
          } else {
            if (eraDollarsRef.current < 5) {
              soundEngine.playBallKick();
              if (cableCarSim.attendantRoot && !ridingDown) {
                attachSpeechBubble(
                  cableCarSim.attendantRoot,
                  'Ticket Clerk Maya',
                  'Each Cable Car ride costs $5 Era Dollars at the Ticket Booth!',
                  true
                );
              }
              showToast(
                'Cable Car Ticket Required ($5 💵) 🎟️',
                `Each ride costs $5 Era Dollars (You have $${eraDollarsRef.current}). Go fishing or play EraGames to earn $5!`,
                '#F43F5E'
              );
              return;
            }
            // Auto-deduct $5 Era Dollars at the Ticket Booth Turnstile
            setEraDollars((prev) => {
              const next = Math.max(0, prev - 5);
              eraDollarsRef.current = next;
              try {
                localStorage.setItem('eraverse_dollars_v2', String(next));
              } catch {}
              return next;
            });
          }
        }

        soundEngine.playGoalCheer();
        if (cableCarSim.turnstileArm) {
          cableCarSim.turnstileArm.rotation.x += Math.PI / 2;
        }

        if (!ridingDown) {
          cableCarSim.phase = 'ascending';
          cableCarSim.progress = 0;
          setCableCarRidePhase('ascending');
          if (cableCarSim.attendantRoot) {
            attachSpeechBubble(
              cableCarSim.attendantRoot,
              'Ticket Clerk Maya',
              'Ticket validated (-$5 💵)! Ascending to Summit City Overlook (2,400m)!',
              false
            );
          }
          showToast(
            'Boarding Summit Cable Car (-$5 💵) 🚡',
            'Gliding up to the Mountain Summit Glass Skywalk & City Overlook!',
            '#F59E0B'
          );
        } else {
          cableCarSim.phase = 'descending';
          cableCarSim.progress = 1;
          setCableCarRidePhase('descending');
          showToast(
            freeReturnFallback ? 'Returning to Campus Base Station 🚡' : 'Boarding Return Cable Car (-$5 💵) 🚡',
            'Descending from the Mountain Summit back to the West Campus Base Station!',
            '#38BDF8'
          );
        }
      },
      skipCableCarRide: () => {
        if (cableCarSim.phase === 'ascending') {
          cableCarSim.progress = 1;
        } else if (cableCarSim.phase === 'descending') {
          cableCarSim.progress = 0;
        }
      },
      teleportToCableCarStation: () => {
        if (activeInteriorBuilding) {
          exitBuildingInterior();
        }
        if (playerState.isSitting) {
          standUpFromDesk();
        }
        cableCarSim.activeTelescope = null;
        setActiveTelescopeView(null);
        soundEngine.playUiClick();

        if (cableCarSim.isAtSummit) {
          // Move right to the Summit Boarding Gate
          playerState.x = -189.0;
          playerState.y = 72.0;
          playerState.z = -10.5;
          playerState.rotY = -Math.PI / 2;
          showToast(
            'Upper Summit Cable Car Terminal (2,400m) 🏔️',
            'Walk out onto the Glass Skywalk to view the City from above, or pay $5 to ride down!',
            '#38BDF8'
          );
        } else {
          // Teleport right in front of the $5 Ticket Booth & Base Station at West Mountain Foothills
          playerState.x = -142.8;
          playerState.y = 0;
          playerState.z = 45.2;
          playerState.vx = 0;
          playerState.vz = 0;
          playerState.rotY = -Math.PI / 2;
          camState.yaw = -Math.PI / 2;
          if (cableCarSim.attendantRoot) {
            attachSpeechBubble(
              cableCarSim.attendantRoot,
              'Ticket Clerk Maya',
              'Welcome to West Mountain Cable Car! Tickets are $5 Era Dollars per ride!',
              false
            );
          }
          showToast(
            'West Mountain Cable Car & $5 Ticket Booth 🎟️',
            'Pay $5 Era Dollars at the Ticket Booth to ride the Cable Car up to the Summit City Overlook!',
            '#F59E0B'
          );
        }
      },
      setTelescopePreset: (preset) => {
        soundEngine.playUiClick();
        cableCarSim.activeTelescope = preset;
        setActiveTelescopeView(preset);
        if (preset === 'city') {
          showToast(
            '🔭 Viewing: North City Metropolis from Above (2,400m)',
            'Bird’s-eye panorama of the Downtown High-Rise Skyline, Highway & Campus!',
            '#38BDF8'
          );
        } else if (preset === 'campus') {
          showToast(
            '🔭 Viewing: EraVerse Central Campus & Classrooms',
            'Aerial view of Cambridge & IELTS Classrooms, Holographic Fountain & Sports Park!',
            '#10B981'
          );
        } else if (preset === 'beach') {
          showToast(
            '🔭 Viewing: South Tropical Beach & East Fishing Lagoon',
            'Overlooking the Turquoise Ocean, Boardwalk Pier, Palm Trees & Fishing Dock!',
            '#F59E0B'
          );
        } else if (preset === 'waterfall') {
          showToast(
            '🔭 Viewing: West Alpine Waterfall & Pine Forest Valley',
            'Looking down at the Cascading Mountain Waterfall and Cable Car Line!',
            '#06B6D4'
          );
        }
      },
      sitAtSummitBench: (bench) => {
        soundEngine.playUiClick();
        playerState.isSitting = true;
        playerState.isCrouching = false;
        setIsCrouching(false);
        setIsSittingAtDesk(true);
        playerState.x = bench.seatX;
        playerState.y = 72.0;
        playerState.z = bench.seatZ;
        playerState.vx = 0;
        playerState.vz = 0;
        playerState.vy = 0;
        playerState.rotY = bench.rotY;
        showToast(
          'Seated at Summit City Overlook Bench 🏔️',
          'Enjoying the high-altitude view of the North City Skyline! Press Space or E to stand up.',
          '#38BDF8'
        );
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
          if (activeInteriorBuilding.id === 'faculty_hq') {
            let closestEmp: FacultyEmployeeProfile | null = null;
            let minEmpDist = 3.8;
            facultyNpcActors.forEach((fa) => {
              const wx = INTERIOR_ORIGIN.x + fa.baseX;
              const wz = INTERIOR_ORIGIN.z + fa.baseZ;
              const d = Math.hypot(playerState.x - wx, playerState.z - wz);
              if (Math.abs(playerState.y - fa.baseY) < 2.5 && d < minEmpDist) {
                minEmpDist = d;
                closestEmp = fa.employee;
              }
            });
            if (closestEmp) {
              soundEngine.playUiClick();
              setSelectedFacultyEmployee(closestEmp);
              setShowFacultyModal(true);
              return;
            }
          }
          // Check if standing near a classroom desk chair to sit down or stand up
          if (activeInteriorBuilding.id.startsWith('class_')) {
            if (playerState.isSitting) {
              standUpFromDesk();
              return;
            }
            let closestDesk: { seatX: number; seatZ: number; deskName: string; classCohort: string } | null = null;
            let minDeskDist = 2.4;
            clickableBoardMeshes.forEach((m) => {
              const ud = m.userData;
              if (ud?.isClassroomDesk) {
                const d = Math.hypot(playerState.x - ud.seatX, playerState.z - ud.seatZ);
                if (d < minDeskDist) {
                  minDeskDist = d;
                  closestDesk = {
                    seatX: ud.seatX,
                    seatZ: ud.seatZ,
                    deskName: ud.deskName,
                    classCohort: ud.classCohort
                  };
                }
              }
            });
            if (closestDesk) {
              sitAtClassroomDesk(closestDesk);
              return;
            }
          }
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
          } else if (activeInteriorBuilding.id === 'faculty_hq') {
            soundEngine.playUiClick();
            setSelectedFacultyEmployee(null);
            setFacultyInitialAdminModule('overview');
            setShowFacultyModal(true);
          } else {
            setActiveBuildingModal(activeInteriorBuilding.id);
          }
        } else {
          // Check if standing near the Central Fountain Holographic Class Leaderboard
          const distToFountain = Math.hypot(playerState.x, playerState.z);
          if (distToFountain < 10.5 && playerState.y < 10) {
            soundEngine.playUiClick();
            setDashboardHallModal('class_dashboard');
            return;
          }
          // If currently viewing through a Summit Telescope, pressing E exits telescope mode
          if (cableCarSim.activeTelescope) {
            gameActionsRef.current?.setTelescopePreset(null);
            return;
          }
          // Check if standing on the Upper Mountain Summit Skywalk (Y > 40)
          if (cableCarSim.isAtSummit || playerState.y > 40) {
            if (playerState.isSitting) {
              standUpFromDesk();
              return;
            }
            // Check Summit Telescopes
            const teleSpots: Array<{ x: number; z: number; preset: 'city' | 'campus' | 'waterfall' }> = [
              { x: -175.5, z: -25.1, preset: 'city' },
              { x: -171.3, z: -18.0, preset: 'campus' },
              { x: -175.5, z: -10.9, preset: 'waterfall' }
            ];
            for (const ts of teleSpots) {
              if (Math.hypot(playerState.x - ts.x, playerState.z - ts.z) < 3.4) {
                gameActionsRef.current?.setTelescopePreset(ts.preset);
                return;
              }
            }
            // Check Summit Viewing Benches
            const summitBenches = [
              { seatX: -181.5, seatZ: -24.4, rotY: Math.PI },
              { seatX: -173.2, seatZ: -21.5, rotY: Math.PI / 2 }
            ];
            for (const sb of summitBenches) {
              if (Math.hypot(playerState.x - sb.seatX, playerState.z - sb.seatZ) < 2.6) {
                gameActionsRef.current?.sitAtSummitBench(sb);
                return;
              }
            }
            // Check Summit Sky Cafe Kiosk (-201.5, -12.5)
            if (Math.hypot(playerState.x - -201.5, playerState.z - -12.5) < 4.2) {
              soundEngine.playCrystalCollect();
              attachSpeechBubble(
                playerRig.root,
                playerProfile.name,
                'Sipping hot cocoa at 2,400m overlooking the North City Skyline! ☕🏔️',
                false
              );
              showToast(
                'Summit Sky Cafe Hot Cocoa! ☕',
                'Warm alpine cocoa served at 2,400m overlooking the city and ocean!',
                '#F59E0B'
              );
              return;
            }
            // Check Upper Summit Cable Car Boarding Platform (-189, -9.0)
            if (Math.hypot(playerState.x - -189.0, playerState.z - -9.0) < 8.5) {
              gameActionsRef.current?.boardCableCar(eraDollarsRef.current < 5);
              return;
            }
          }
          // Check if standing near the Lower Foothill Cable Car Base Station & $5 Ticket Booth (-148, 45)
          if (playerState.y < 15 && Math.hypot(playerState.x - -148.5, playerState.z - 45.5) < 10.5) {
            gameActionsRef.current?.boardCableCar(false);
            return;
          }
          // Check if standing at the South Beach or East Beach Fishing Zone
          const atBeachFishingZone =
            playerState.z > 94 || (playerState.x > 100 && playerState.z > -90 && playerState.z < 135);
          if (atBeachFishingZone) {
            if (fishingSimState.phase === 'bite_ready' || fishingSimState.phase === 'bobbing') {
              gameActionsRef.current?.reelInFish();
            } else if (fishingBaitCountRef.current > 0) {
              gameActionsRef.current?.castFishingPole();
            } else {
              soundEngine.playUiClick();
              setShowFishingModal(true);
            }
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
        if (cableCarSim.activeTelescope) {
          gameActionsRef.current?.setTelescopePreset(null);
          return;
        }
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
      camState.pitch = Math.max(-0.65, Math.min(1.15, camState.pitch + dy * 0.0065));
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
            } else if (hitData.isClassroomDesk) {
              sitAtClassroomDesk({
                seatX: hitData.seatX,
                seatZ: hitData.seatZ,
                deskName: hitData.deskName,
                classCohort: hitData.classCohort
              });
            } else if (hitData.isFacultyEmployee && hitData.employeeProfile) {
              soundEngine.playUiClick();
              setSelectedFacultyEmployee(hitData.employeeProfile);
              setShowFacultyModal(true);
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
            } else if (hitData.isEraGames) {
              handleBoardActionRef.current({
                slot: 'back-center',
                category: 'ERAGAMES ARCADE HOST',
                title: 'EraGames Arcade & Arena',
                subtitle: 'Play Vocab Blitz, Word Scramble & Penalty Shootout',
                badge: 'PLAY ERAGAMES',
                accentHex: '#9333EA',
                bgLightHex: '#F3E8FF',
                actionType: 'open_eragames'
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
            if (hitUserData?.isFishingStation) {
              soundEngine.playUiClick();
              setShowFishingModal(true);
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

    // Cache last-committed HUD proximity values so tick() never triggers redundant 60fps React re-renders
    const hudSyncCache = {
      facultyEmpId: '' as string,
      npcId: '' as string,
      boardKey: '' as string,
      deskKey: '' as string,
      buildingId: '' as string,
      nearFishing: false,
      cableStation: null as 'base' | 'summit' | null,
      nearTelescope: false,
      benchKey: '' as string,
      nearCafe: false,
      lastElevMeters: 120
    };

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

      // Animate Four-Horizon World Elements: South Ocean Waves & Surf Foam, West Mountain Waterfall & Aerial Cable Cars, and Palm Fronds
      if (!activeInteriorBuilding) {
        oceanWaveLayers.forEach((wl, wIdx) => {
          wl.mesh.position.y = wl.baseY + Math.sin(elapsed * wl.speed + wIdx * 1.3) * wl.amp;
        });

        oceanFoamBands.forEach((fb) => {
          const waveCycle = Math.sin(elapsed * 1.65 + fb.phaseOffset);
          fb.mesh.position.z = fb.baseZ - waveCycle * 1.45;
          const mat = fb.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.42 + (waveCycle + 1) * 0.22;
        });

        waterfallRibbons.forEach((wr) => {
          wr.mesh.position.y -= wr.speed * dt;
          if (wr.mesh.position.y < 3.5) {
            wr.mesh.position.y = 30.5;
          }
        });

        waterfallMistRings.forEach((mr) => {
          const pulse = ((elapsed * 1.4 + mr.phase) % 3.0) / 3.0;
          const sc = 0.75 + pulse * 1.35;
          mr.mesh.scale.set(sc, sc, 1);
          const mat = mr.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = (1 - pulse) * 0.75;
        });

        cableCarGondolas.forEach((cc) => {
          const t = (Math.sin(elapsed * 0.22 + cc.phaseOffset) + 1) * 0.5;
          cc.group.position.lerpVectors(cc.startPos, cc.endPos, t);
          cc.group.rotation.z = Math.sin(elapsed * 1.8 + cc.phaseOffset) * 0.035;
        });

        swayingPalmCrowns.forEach((pc) => {
          pc.group.rotation.z = Math.sin(elapsed * 1.6 + pc.phase) * 0.06;
          pc.group.rotation.x = Math.cos(elapsed * 1.3 + pc.phase) * 0.04;
        });

        // Animate 3D Tropical Fish swimming in oval loops around the East Beach Fishing Pier
        eastLagoonFishes.forEach((lf) => {
          const ang = elapsed * lf.speed + lf.phase;
          const nextX = lf.centerX + Math.cos(ang) * lf.radiusX;
          const nextZ = lf.centerZ + Math.sin(ang) * lf.radiusZ;
          const dx = -Math.sin(ang) * lf.radiusX;
          const dz = Math.cos(ang) * lf.radiusZ;
          lf.group.position.x = nextX;
          lf.group.position.z = nextZ;
          lf.group.position.y = -0.02 + Math.sin(elapsed * 3.5 + lf.phase) * 0.05;
          lf.group.rotation.y = Math.atan2(dx, dz);
          lf.tailMesh.rotation.y = Math.sin(elapsed * 14 + lf.phase) * 0.35;
        });
      }

      // AUTOMATIC SLIDING DOORS (Exterior & Interior Exit Door)
      if (!activeInteriorBuilding) {
        doorControllers.forEach((dc) => {
          const distPlayer = Math.hypot(playerState.x - dc.building.doorX, playerState.z - dc.building.doorZ);
          let distNpc = 999;
          for (const npc of npcActors) {
            if (!npc.rig.root.visible) continue;
            const d = Math.hypot(npc.rig.root.position.x - dc.building.doorX, npc.rig.root.position.z - dc.building.doorZ);
            if (d < distNpc) distNpc = d;
          }

          const shouldOpen = distPlayer < 6.4 || distNpc < 4.8;
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
        let distInteriorNpcToDoor = 999;
        for (const inpc of interiorNpcActors) {
          if (!inpc.rig.root.visible) continue;
          const d = Math.hypot(inpc.rig.root.position.x, inpc.rig.root.position.z - 10.8);
          if (d < distInteriorNpcToDoor) distInteriorNpcToDoor = d;
        }
        const targetExitOpen = distToExit < 5.2 || distInteriorNpcToDoor < 3.8 ? 1.0 : 0.0;
        interiorExitOpenAmount = THREE.MathUtils.damp(interiorExitOpenAmount, targetExitOpen, 8, dt);
        interiorExitLeftDoor.position.x = -1.06 - interiorExitOpenAmount * 1.4;
        interiorExitRightDoor.position.x = 1.06 + interiorExitOpenAmount * 1.4;
      }

      // PLAYER MOVEMENT (Keyboard + Mobile/Tablet Touch Joystick with Smooth Acceleration, Crouch & Classroom Desk Sitting Support)
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

      if (playerState.isSitting && isMoving) {
        standUpFromDesk();
      }

      const vehicleBoost =
        playerVehicleRef.current === 'bike'
          ? 1.55
          : playerVehicleRef.current === 'skateboard'
          ? 1.35
          : 1.0;
      const baseSpeed = (playerState.isCrouching ? 5.6 : playerState.sprinting ? 15.2 : 10.2) * vehicleBoost;

      if (isMoving && !playerState.isSitting) {
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
        const playerRadius = 0.48;

        if (activeInteriorBuilding) {
          let blockedX = false;
          let blockedZ = false;
          for (const c of interiorColliders) {
            if (
              nextX > c.minX - playerRadius &&
              nextX < c.maxX + playerRadius &&
              playerState.z > c.minZ - playerRadius &&
              playerState.z < c.maxZ + playerRadius
            ) {
              blockedX = true;
            }
            if (
              playerState.x > c.minX - playerRadius &&
              playerState.x < c.maxX + playerRadius &&
              nextZ > c.minZ - playerRadius &&
              nextZ < c.maxZ + playerRadius
            ) {
              blockedZ = true;
            }
          }

          // Check interior person blockers (clerk NPCs, teachers, seated students, and walking faculty/students)
          const checkInteriorPersonHit = (tx: number, tz: number, curDistSq: number) => {
            for (const pb of interiorPersonBlockers) {
              const minD = pb.radius + playerRadius;
              const dSq = (tx - pb.x) * (tx - pb.x) + (tz - pb.z) * (tz - pb.z);
              if (dSq < minD * minD && dSq < curDistSq) return true;
            }
            for (const inpc of interiorNpcActors) {
              if (!inpc.rig.root.visible) continue;
              const px = INTERIOR_ORIGIN.x + inpc.rig.root.position.x;
              const pz = INTERIOR_ORIGIN.z + inpc.rig.root.position.z;
              const minD = 0.88;
              const dSq = (tx - px) * (tx - px) + (tz - pz) * (tz - pz);
              const curSq = (playerState.x - px) * (playerState.x - px) + (playerState.z - pz) * (playerState.z - pz);
              if (dSq < minD * minD && dSq < curSq) return true;
            }
            for (const fa of facultyNpcActors) {
              const px = INTERIOR_ORIGIN.x + fa.rig.root.position.x;
              const pz = INTERIOR_ORIGIN.z + fa.rig.root.position.z;
              const minD = 0.88;
              const dSq = (tx - px) * (tx - px) + (tz - pz) * (tz - pz);
              const curSq = (playerState.x - px) * (playerState.x - px) + (playerState.z - pz) * (playerState.z - pz);
              if (dSq < minD * minD && dSq < curSq) return true;
            }
            return false;
          };

          if (!blockedX && checkInteriorPersonHit(nextX, playerState.z, 999)) blockedX = true;
          if (!blockedZ && checkInteriorPersonHit(playerState.x, nextZ, 999)) blockedZ = true;

          if (!blockedX) {
            playerState.x = Math.max(INTERIOR_ORIGIN.x - 12.8, Math.min(INTERIOR_ORIGIN.x + 12.8, nextX));
          }
          if (!blockedZ) {
            playerState.z = Math.max(INTERIOR_ORIGIN.z - 10.8, Math.min(INTERIOR_ORIGIN.z + 11.2, nextZ));
          }

          if (
            doorCooldownTimer <= 0 &&
            Math.abs(playerState.x - INTERIOR_ORIGIN.x) < 2.4 &&
            playerState.z > INTERIOR_ORIGIN.z + 9.8
          ) {
            exitBuildingInterior();
          }
        } else if (cableCarSim.phase !== 'idle') {
          // Player is currently riding inside the 3D Cable Car Gondola Cabin!
          playerState.vx = 0;
          playerState.vz = 0;
        } else if (cableCarSim.isAtSummit || playerState.y > 40) {
          // Player is walking on the Upper Mountain Summit Plaza & Cantilevered Glass Skywalk (Y = 72m)!
          // Summit Main Plaza: X in [-207.2, -184.0], Z in [-29.2, -6.8]
          // Cantilevered Glass Skywalk: X in [-184.0, -171.2], Z in [-25.2, -10.8]
          // Avoid walking through Observatory Dome cylinder at (-202.5, -23.5, radius 5.3)
          const obsDist = Math.hypot(nextX - -202.5, nextZ - -23.5);
          if (obsDist > 5.35) {
            const clampedX = Math.max(-207.2, Math.min(-171.2, nextX));
            const inSkywalkZone = clampedX > -184.2;
            const minAllowedZ = inSkywalkZone ? -25.2 : -29.2;
            const maxAllowedZ = inSkywalkZone ? -10.8 : -6.8;
            playerState.x = clampedX;
            playerState.z = Math.max(minAllowedZ, Math.min(maxAllowedZ, nextZ));
          }
        } else {
          let blockedX = false;
          let blockedZ = false;
          for (const c of colliders) {
            if (
              nextX > c.minX - playerRadius &&
              nextX < c.maxX + playerRadius &&
              playerState.z > c.minZ - playerRadius &&
              playerState.z < c.maxZ + playerRadius
            ) {
              blockedX = true;
            }
            if (
              playerState.x > c.minX - playerRadius &&
              playerState.x < c.maxX + playerRadius &&
              nextZ > c.minZ - playerRadius &&
              nextZ < c.maxZ + playerRadius
            ) {
              blockedZ = true;
            }
          }

          // Check exterior person blockers (all visible NPCs, Coach Leo, Keeper Max)
          const checkExteriorPersonHit = (tx: number, tz: number) => {
            const minD = 0.96;
            const minDSq = minD * minD;
            for (const npc of npcActors) {
              if (!npc.rig.root.visible) continue;
              const px = npc.rig.root.position.x;
              const pz = npc.rig.root.position.z;
              const dSq = (tx - px) * (tx - px) + (tz - pz) * (tz - pz);
              const curSq = (playerState.x - px) * (playerState.x - px) + (playerState.z - pz) * (playerState.z - pz);
              if (dSq < minDSq && dSq < curSq) return true;
            }
            const specialRigs = [pickleOpponentRig.root.position, footballKeeperRig.root.position];
            for (const sp of specialRigs) {
              const dSq = (tx - sp.x) * (tx - sp.x) + (tz - sp.z) * (tz - sp.z);
              const curSq = (playerState.x - sp.x) * (playerState.x - sp.x) + (playerState.z - sp.z) * (playerState.z - sp.z);
              if (dSq < minDSq && dSq < curSq) return true;
            }
            return false;
          };

          if (!blockedX && checkExteriorPersonHit(nextX, playerState.z)) blockedX = true;
          if (!blockedZ && checkExteriorPersonHit(playerState.x, nextZ)) blockedZ = true;

          if (!blockedX) playerState.x = Math.max(-158, Math.min(161, nextX));
          if (!blockedZ) playerState.z = Math.max(-106, Math.min(170, nextZ));
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
      } else if (playerState.isSitting) {
        // Seated directly on the classroom chair seat facing front chalkboard
        playerRig.hipsGroup.position.y = 0.56;
        playerRig.vehicleGroup.visible = false;
        playerRig.leftLeg.rotation.x = THREE.MathUtils.damp(playerRig.leftLeg.rotation.x, -1.12, 12, dt);
        playerRig.rightLeg.rotation.x = THREE.MathUtils.damp(playerRig.rightLeg.rotation.x, -1.12, 12, dt);
        playerRig.leftArm.rotation.x = THREE.MathUtils.damp(playerRig.leftArm.rotation.x, -0.65, 12, dt);
        if (playerState.waveTimer <= 0) {
          playerRig.rightArm.rotation.x = THREE.MathUtils.damp(playerRig.rightArm.rotation.x, -0.65, 12, dt);
          playerRig.rightArm.rotation.z = THREE.MathUtils.damp(playerRig.rightArm.rotation.z, 0, 12, dt);
        }
      } else {
        playerRig.hipsGroup.position.y = playerRig.defaultHipsY;
        playerRig.vehicleGroup.visible = true;
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

      // ============================================================================
      // 3D FISHING POLE CASTING, CURVED LINE, WATER SPLASH & FISH / TRASH ANIMATION
      // ============================================================================
      const isPlayerAtBeachZone =
        !activeInteriorBuilding &&
        (playerState.z > 94 || (playerState.x > 100 && playerState.z > -90 && playerState.z < 135));
      playerFishingPole.group.visible =
        isPlayerAtBeachZone || fishingSimState.phase !== 'idle' || fishingSimState.celebrateTimer > 0;

      // Cancel active cast if player walks far away from casting spot
      if (
        fishingSimState.phase !== 'idle' &&
        Math.hypot(playerState.x - fishingSimState.startX, playerState.z - fishingSimState.startZ) > 3.2
      ) {
        fishingSimState.phase = 'idle';
        fishingSimState.celebrateTimer = 0;
        fishingWorldGroup.visible = false;
        leapingFish3D.visible = false;
        leapingTrash3D.visible = false;
        biteAlertSprite.visible = false;
        playerFishingPole.upperPivot.rotation.set(0, 0, 0);
        setFishingPhase('idle');
      }

      // Animate 3D Splash Water Droplets whenever splashTimer > 0
      if (fishingSimState.splashTimer > 0) {
        fishingSimState.splashTimer = Math.max(0, fishingSimState.splashTimer - dt);
        const spProgress = 1 - fishingSimState.splashTimer / 0.55;
        splashBurstGroup.position.set(fishingSimState.waterX, 0.04, fishingSimState.waterZ);
        for (let i = 0; i < splashDroplets.length; i++) {
          const d = splashDroplets[i];
          if (fishingSimState.splashTimer <= 0) {
            d.mesh.visible = false;
          } else {
            d.mesh.visible = true;
            const r = spProgress * d.speed * 1.45;
            const dy = Math.sin(spProgress * Math.PI) * d.peakY;
            d.mesh.position.set(Math.cos(d.angle) * r, Math.max(0, dy), Math.sin(d.angle) * r);
            const s = Math.max(0.2, 1 - spProgress * 0.65);
            d.mesh.scale.setScalar(s);
          }
        }
      } else {
        for (let i = 0; i < splashDroplets.length; i++) {
          splashDroplets[i].mesh.visible = false;
        }
      }

      // 3D Trophy Showcase Hold after catching a Fish ($1-$10) or Trash ($0)
      if (fishingSimState.phase === 'idle' && fishingSimState.celebrateTimer > 0) {
        fishingSimState.celebrateTimer = Math.max(0, fishingSimState.celebrateTimer - dt);
        fishingWorldGroup.visible = true;
        bobber3D.visible = false;
        fishingLine3D.visible = false;
        const isTrashItem = Boolean(fishingSimState.celebratedCatch?.isTrash);
        const showcaseMesh = isTrashItem ? leapingTrash3D : leapingFish3D;
        leapingFish3D.visible = !isTrashItem;
        leapingTrash3D.visible = isTrashItem;

        // Float & spin the caught 3D fish or 3D trash right in front/above the player character
        const frontX = playerState.x + Math.sin(playerState.rotY) * 1.25;
        const frontZ = playerState.z + Math.cos(playerState.rotY) * 1.25;
        showcaseMesh.position.set(frontX, playerState.y + 2.15 + Math.sin(elapsed * 6) * 0.12, frontZ);
        showcaseMesh.rotation.set(0, elapsed * 3.8, isTrashItem ? 0.25 : Math.sin(elapsed * 14) * 0.18);
        showcaseMesh.scale.setScalar(1.35);

        if (fishingSimState.celebrateTimer <= 0) {
          leapingFish3D.visible = false;
          leapingTrash3D.visible = false;
          leapingFish3D.scale.setScalar(1);
          leapingTrash3D.scale.setScalar(1);
          fishingWorldGroup.visible = false;
        }
      }

      if (fishingSimState.phase !== 'idle') {
        fishingSimState.timer += dt;
        fishingWorldGroup.visible = true;
        bobber3D.visible = true;
        fishingLine3D.visible = true;
        leapingFish3D.scale.setScalar(1);
        leapingTrash3D.scale.setScalar(1);
        const isTrashHooked = Boolean(fishingSimState.hookedFish?.isTrash);

        if (fishingSimState.phase === 'casting') {
          // Whip right arm & 3D fishing pole forward (0 -> 0.5s)
          const t = Math.min(1, fishingSimState.timer / 0.5);
          playerRig.rightArm.rotation.x = -1.85 + t * 1.02;
          playerRig.rightArm.rotation.z = 0;
          playerFishingPole.upperPivot.rotation.x = -Math.sin(t * Math.PI) * 0.28;

          const curX = THREE.MathUtils.lerp(fishingSimState.startX, fishingSimState.waterX, t);
          const curZ = THREE.MathUtils.lerp(fishingSimState.startZ, fishingSimState.waterZ, t);
          const arcY = Math.sin(t * Math.PI) * 2.8 + (1 - t) * 1.4;
          bobber3D.position.set(curX, arcY, curZ);
          bobberRipple1.visible = false;
          bobberRipple2.visible = false;
          bobberRipple3.visible = false;
          biteAlertSprite.visible = false;

          if (fishingSimState.timer >= 0.5) {
            fishingSimState.phase = 'bobbing';
            fishingSimState.timer = 0;
            fishingSimState.splashTimer = 0.55; // Trigger splash burst on water impact!
            setFishingPhase('bobbing');
          }
        } else if (fishingSimState.phase === 'bobbing') {
          // Hold 3D fishing pole steady over the water while bobber floats (0 -> 1.3s)
          playerRig.rightArm.rotation.x = -0.82 + Math.sin(elapsed * 2.5) * 0.04;
          playerRig.rightArm.rotation.z = 0;
          playerFishingPole.upperPivot.rotation.x = 0.04 + Math.sin(elapsed * 3) * 0.02;

          bobber3D.position.set(
            fishingSimState.waterX,
            0.03 + Math.sin(elapsed * 4.5) * 0.05,
            fishingSimState.waterZ
          );
          bobberRipple1.visible = true;
          bobberRipple2.visible = true;
          bobberRipple3.visible = true;
          biteAlertSprite.visible = false;
          const rScale = 0.85 + ((elapsed * 1.2) % 1.0) * 0.8;
          bobberRipple1.scale.set(rScale, rScale, 1);
          bobberRipple2.scale.set(rScale * 1.18, rScale * 1.18, 1);
          bobberRipple3.scale.set(rScale * 1.35, rScale * 1.35, 1);

          // Show shadow/silhouette of fish or drifting trash under the bobber
          const activeCatchMesh = isTrashHooked ? leapingTrash3D : leapingFish3D;
          leapingFish3D.visible = !isTrashHooked;
          leapingTrash3D.visible = isTrashHooked;
          const swimAngle = elapsed * (isTrashHooked ? 1.4 : 3.4);
          const orbitR = isTrashHooked ? 0.35 : 0.9;
          activeCatchMesh.position.set(
            fishingSimState.waterX + Math.cos(swimAngle) * orbitR,
            -0.08,
            fishingSimState.waterZ + Math.sin(swimAngle) * orbitR
          );
          activeCatchMesh.rotation.set(0, -swimAngle, 0);
          if (!isTrashHooked) {
            lfTail.rotation.y = Math.sin(elapsed * 18) * 0.35;
          }

          if (fishingSimState.timer >= 1.3) {
            fishingSimState.phase = 'bite_ready';
            fishingSimState.timer = 0;
            fishingSimState.splashTimer = 0.55;
            soundEngine.playUiClick();
            setFishingPhase('bite_ready');
          }
        } else if (fishingSimState.phase === 'bite_ready') {
          // Hooked! Bobber plunges rapidly, ❗ BITE! sprite pulses, & upper rod bends strongly!
          playerRig.rightArm.rotation.x = -0.95 + Math.sin(elapsed * 18) * 0.14;
          playerFishingPole.upperPivot.rotation.x = 0.34 + Math.sin(elapsed * 22) * 0.12;
          playerFishingPole.reelPivot.rotation.x += dt * 10;

          bobber3D.position.set(
            fishingSimState.waterX + Math.sin(elapsed * 22) * 0.1,
            -0.06 + Math.sin(elapsed * 20) * 0.18,
            fishingSimState.waterZ + Math.cos(elapsed * 22) * 0.1
          );
          biteAlertSprite.visible = true;
          const alertPulse = 1 + Math.sin(elapsed * 16) * 0.18;
          biteAlertSprite.scale.set(1.65 * alertPulse, 0.62 * alertPulse, 1);

          const splashScale = 1.0 + Math.abs(Math.sin(elapsed * 15)) * 1.05;
          bobberRipple1.scale.set(splashScale, splashScale, 1);
          bobberRipple2.scale.set(splashScale * 1.28, splashScale * 1.28, 1);
          bobberRipple3.scale.set(splashScale * 1.55, splashScale * 1.55, 1);

          // Repeat mini splash bursts while fish/trash thrashes
          if (fishingSimState.splashTimer <= 0.1) {
            fishingSimState.splashTimer = 0.45;
          }

          const activeCatchMesh = isTrashHooked ? leapingTrash3D : leapingFish3D;
          leapingFish3D.visible = !isTrashHooked;
          leapingTrash3D.visible = isTrashHooked;
          activeCatchMesh.position.set(fishingSimState.waterX, -0.02, fishingSimState.waterZ);
          activeCatchMesh.rotation.y = elapsed * (isTrashHooked ? 4 : 9);

          if (fishingSimState.timer >= 1.35) {
            gameActionsRef.current?.reelInFish();
          }
        } else if (fishingSimState.phase === 'reeling_in') {
          // Pull fishing pole up, bend rod tip & leap the 3D Fish or 3D Trash out of the water in a high arc!
          const t = Math.min(1, fishingSimState.timer / 0.82);
          playerRig.rightArm.rotation.x = -1.68;
          playerRig.rightArm.rotation.z = 0;
          playerFishingPole.upperPivot.rotation.x = Math.sin((1 - t) * Math.PI) * 0.42;
          playerFishingPole.reelPivot.rotation.x += dt * 22;

          const catchX = THREE.MathUtils.lerp(fishingSimState.waterX, playerState.x, t);
          const catchZ = THREE.MathUtils.lerp(fishingSimState.waterZ, playerState.z, t);
          const catchY = Math.sin(t * Math.PI) * 3.6 + t * 1.55;

          bobber3D.position.set(catchX, catchY + 0.28, catchZ);
          bobberRipple1.visible = false;
          bobberRipple2.visible = false;
          bobberRipple3.visible = false;
          biteAlertSprite.visible = false;

          const activeCatchMesh = isTrashHooked ? leapingTrash3D : leapingFish3D;
          leapingFish3D.visible = !isTrashHooked;
          leapingTrash3D.visible = isTrashHooked;
          activeCatchMesh.position.set(catchX, catchY, catchZ);
          if (isTrashHooked) {
            // Trash tumbles end-over-end through the air
            activeCatchMesh.rotation.set(t * Math.PI * 3.5, playerState.rotY + t * 4, t * 2.5);
          } else {
            // Fish arcs gracefully and wags its tail rapidly
            activeCatchMesh.rotation.set(
              -Math.cos(t * Math.PI) * 0.85,
              playerState.rotY + Math.PI,
              Math.sin(elapsed * 22) * 0.28
            );
            lfTail.rotation.y = Math.sin(elapsed * 28) * 0.48;
          }

          if (fishingSimState.timer >= 0.82) {
            const caught = fishingSimState.hookedFish || pickRandomCaughtFish();
            fishingSimState.phase = 'idle';
            fishingSimState.celebratedCatch = caught;
            fishingSimState.celebrateTimer = 2.4; // Showcase the 3D catch floating beside the player!
            playerFishingPole.upperPivot.rotation.set(0, 0, 0);
            setFishingPhase('idle');
            setLastCaughtFish(caught);
            setActiveCatchCard(caught);
            setCatchHistory((prev) => [caught, ...prev].slice(0, 6));

            if (caught.isTrash || caught.price <= 0) {
              // Caught Ocean Trash ($0 Value)!
              soundEngine.playBallKick();
              if (caught.xpReward > 0) {
                setXp((prev) => prev + caught.xpReward);
              }
              attachSpeechBubble(
                playerRig.root,
                playerProfile.name,
                `Caught Trash: ${caught.emoji} ${caught.name} ($0 Value)!`,
                true
              );
              showToast(
                `Trash Caught: ${caught.emoji} ${caught.name} ($0 Value)`,
                `Ocean trash is worth $0 Era Dollars! Cast again for $1–$10 fish!`,
                '#F43F5E'
              );
            } else {
              // Award the fish's Dollar Price ($1 to $10 Era Dollars) and XP!
              soundEngine.playGoalCheer();
              setEraDollars((prev) => {
                const next = prev + caught.price;
                try {
                  localStorage.setItem('eraverse_dollars_v2', String(next));
                } catch {}
                return next;
              });
              setXp((prev) => prev + caught.xpReward);
              attachSpeechBubble(
                playerRig.root,
                playerProfile.name,
                `Caught ${caught.emoji} ${caught.name} (+$${caught.price})!`,
                false
              );
              showToast(
                `Caught ${caught.emoji} ${caught.name} (+$${caught.price} 💵)!`,
                `Added +$${caught.price} Era Dollars & +${caught.xpReward} XP to your wallet!`,
                '#10B981'
              );
            }
          }
        }

        // Update 13-point Curved Catenary 3D Fishing Line from rodTip to bobber3D
        playerRig.root.updateMatrixWorld(true);
        playerFishingPole.rodTip.getWorldPosition(_rodTipWorldPos);
        const posArr = fishingLineGeo.attributes.position.array as Float32Array;
        const endX = bobber3D.position.x;
        const endY = bobber3D.position.y + 0.24;
        const endZ = bobber3D.position.z;

        // Line sag when floating vs taut vibration when biting/reeling
        const sagAmount =
          fishingSimState.phase === 'bobbing'
            ? 0.42 + Math.sin(elapsed * 3) * 0.05
            : fishingSimState.phase === 'casting'
            ? 0.22
            : 0.03;

        for (let i = 0; i <= FISHING_LINE_SEGMENTS; i++) {
          const u = i / FISHING_LINE_SEGMENTS;
          const lx = THREE.MathUtils.lerp(_rodTipWorldPos.x, endX, u);
          const lz = THREE.MathUtils.lerp(_rodTipWorldPos.z, endZ, u);
          const parabola = 4 * u * (1 - u);
          const jitter =
            fishingSimState.phase === 'bite_ready'
              ? Math.sin(elapsed * 45 + i * 1.7) * 0.04 * parabola
              : 0;
          const ly = THREE.MathUtils.lerp(_rodTipWorldPos.y, endY, u) - parabola * sagAmount + jitter;
          const idx = i * 3;
          posArr[idx] = lx;
          posArr[idx + 1] = ly;
          posArr[idx + 2] = lz;
        }
        fishingLineGeo.attributes.position.needsUpdate = true;
      }

      // ============================================================================
      // 3D MOUNTAIN CABLE CAR RIDE ANIMATION & MULTI-ELEVATION GROUND PHYSICS (Y=0 vs Y=72)
      // ============================================================================
      if (cableCarSim.phase !== 'idle' && cableCarSim.playerGondola) {
        const rideDurationSec = 9.0;
        if (cableCarSim.phase === 'ascending') {
          cableCarSim.progress = Math.min(1, cableCarSim.progress + dt / rideDurationSec);
        } else {
          cableCarSim.progress = Math.max(0, cableCarSim.progress - dt / rideDurationSec);
        }

        // Smooth ease-in-out interpolation along the mountain steel cable
        const p = cableCarSim.progress;
        const smoothP = p * p * (3 - 2 * p);
        const gx = THREE.MathUtils.lerp(cableCarSim.startPos.x + 1.45, cableCarSim.endPos.x + 1.45, smoothP);
        const gy = THREE.MathUtils.lerp(cableCarSim.startPos.y, cableCarSim.endPos.y, smoothP);
        const gz = THREE.MathUtils.lerp(cableCarSim.startPos.z, cableCarSim.endPos.z, smoothP);

        cableCarSim.playerGondola.position.set(gx, gy, gz);
        cableCarSim.playerGondola.rotation.z = Math.sin(elapsed * 2.2) * 0.02;

        // Place player character on the cabin floor (y = gy - 5.82) with 1.25m+ clear headroom below the cabin roof (gy - 1.4)!
        playerState.x = gx + 0.12;
        playerState.y = gy - 5.82;
        playerState.z = gz;
        playerState.vy = 0;
        playerState.isGrounded = true;
        playerState.rotY = Math.PI / 2; // Face East/North toward the City & Campus view
        playerRig.vehicleGroup.visible = false;

        const elevMeters = Math.round(120 + smoothP * 2280);
        if (Math.abs(elevMeters - hudSyncCache.lastElevMeters) >= 35) {
          hudSyncCache.lastElevMeters = elevMeters;
          setCableCarElevationMeters(elevMeters);
        }

        if (cableCarSim.phase === 'ascending' && cableCarSim.progress >= 1) {
          // Arrived at Upper Mountain Summit Skywalk (Y = 72m)!
          cableCarSim.phase = 'idle';
          cableCarSim.isAtSummit = true;
          hudSyncCache.lastElevMeters = 2400;
          setCableCarRidePhase('idle');
          setIsAtMountainSummit(true);
          setCableCarElevationMeters(2400);
          playerState.x = -187.5;
          playerState.y = 72.0;
          playerState.z = -14.0;
          playerState.rotY = Math.PI / 2; // Facing out toward the Glass Skywalk & City Skyline
          camState.yaw = -Math.PI / 2;
          soundEngine.playGoalCheer();
          attachSpeechBubble(
            playerRig.root,
            playerProfile.name,
            'Arrived at the Mountain Summit Skywalk (2,400m)! Look at the City Skyline from above! 🏔️🏙️',
            false
          );
          showToast(
            'Welcome to Mountain Summit Skywalk (2,400m)! 🏔️🏙️',
            'Walk out onto the Glass Skywalk or use the Telescopes (E) to see the City from above!',
            '#10B981'
          );
        } else if (cableCarSim.phase === 'descending' && cableCarSim.progress <= 0) {
          // Arrived back at Lower Foothill Base Station (Y = 0m)!
          cableCarSim.phase = 'idle';
          cableCarSim.isAtSummit = false;
          hudSyncCache.lastElevMeters = 120;
          setCableCarRidePhase('idle');
          setIsAtMountainSummit(false);
          setCableCarElevationMeters(120);
          playerState.x = -145.0;
          playerState.y = 0;
          playerState.z = 44.0;
          playerState.rotY = Math.PI / 2;
          soundEngine.playGoalCheer();
          showToast(
            'Arrived at West Campus Base Station 🚡',
            'Visit the $5 Ticket Booth anytime to ride back up to the Summit City Overlook!',
            '#38BDF8'
          );
        }
      } else {
        // Keep docked player gondola waiting at whichever terminal the player is currently near
        if (cableCarSim.playerGondola) {
          const targetP = cableCarSim.isAtSummit ? 1 : 0;
          const gx = THREE.MathUtils.lerp(cableCarSim.startPos.x + 1.45, cableCarSim.endPos.x + 1.45, targetP);
          const gy = THREE.MathUtils.lerp(cableCarSim.startPos.y, cableCarSim.endPos.y, targetP);
          const gz = THREE.MathUtils.lerp(cableCarSim.startPos.z, cableCarSim.endPos.z, targetP);
          cableCarSim.playerGondola.position.set(gx, gy, gz);
          cableCarSim.playerGondola.rotation.z = Math.sin(elapsed * 1.5) * 0.012;
        }

        // Vertical Jump & Multi-Elevation Ground Floor Physics (Y = 72.0 on Summit Deck, Y = 0 on Campus)
        const activeGroundFloorY =
          !activeInteriorBuilding && (cableCarSim.isAtSummit || (playerState.x < -168 && playerState.y > 40))
            ? 72.0
            : 0;

        if (playerState.isSitting) {
          playerState.y = activeGroundFloorY;
          playerState.vy = 0;
          playerState.isGrounded = true;
        } else {
          playerState.vy -= 26 * dt;
          playerState.y += playerState.vy * dt;

          if (playerState.y <= activeGroundFloorY) {
            playerState.y = activeGroundFloorY;
            playerState.vy = 0;
            playerState.isGrounded = true;
          }
        }
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

      // Autonomous IELTS 1, IELTS 2 & Teacher Jan Natural Campus & Classroom Activities
      let closestNpc: IeltsCharacterProfile | null = null;
      let closestNpcDist = 5.4;

      // Helper to transition an exterior NPC to their next natural campus activity
      const assignNextExteriorActivity = (npc: NpcActor, idx: number) => {
        const isTeacherJan = npc.profile.id === TEACHER_JAN_PROFILE.id || npc.profile.cohort.includes('TEACHER');
        if (isTeacherJan) {
          npc.activity = Math.random() < 0.5 ? 'going_to_room' : 'socialize';
          npc.activityTimer = 20 + Math.random() * 15;
          const b = pickNextBuildingForNpc(npc.profile, idx);
          npc.targetBuilding = b;
          npc.targetX = b.doorX + (Math.random() - 0.5) * 4;
          npc.targetZ = b.doorZ + b.frontDir * 4.2;
          return;
        }

        const activeFootballers = npcActors.filter((a) => a.activity === 'football').length;
        const activeTennis = npcActors.filter((a) => a.activity === 'tennis').length;
        const activeGamers = npcActors.filter((a) => a.activity === 'play_games').length;
        const roll = Math.random();

        if (activeFootballers < 6 && roll < 0.28) {
          npc.activity = 'football';
          npc.activityTimer = 28 + Math.random() * 18;
          npc.teamSide = activeFootballers % 2 === 0 ? 1 : -1;
          npc.targetX = PITCH_CENTER.x + (Math.random() - 0.5) * 16;
          npc.targetZ = PITCH_CENTER.z + npc.teamSide * (4 + Math.random() * 12);
        } else if (activeTennis < 4 && roll < 0.48) {
          npc.activity = 'tennis';
          npc.activityTimer = 25 + Math.random() * 16;
          const hasSouth = npcActors.some((a) => a !== npc && a.activity === 'tennis' && a.courtRole === 'south_player');
          npc.courtRole = !hasSouth ? 'south_player' : activeTennis === 1 ? 'doubles_partner' : 'court_practice';
          npc.targetX = TENNIS_CENTER.x + (npc.courtRole === 'south_player' ? 0 : (Math.random() - 0.5) * 7.5);
          npc.targetZ = TENNIS_CENTER.z + (npc.courtRole === 'south_player' ? 8.8 : 5.5 + Math.random() * 4.0);
        } else if (activeGamers < 4 && roll < 0.66) {
          npc.activity = 'play_games';
          npc.activityTimer = 20 + Math.random() * 14;
          const eraGamesB = BUILDINGS.find((b) => b.id === 'speaking') || BUILDINGS[0];
          npc.targetBuilding = eraGamesB;
          npc.targetX = eraGamesB.doorX + (Math.random() - 0.5) * 5.0;
          npc.targetZ = eraGamesB.doorZ + eraGamesB.frontDir * 4.2;
        } else {
          npc.activity = 'going_to_room';
          npc.activityTimer = 24 + Math.random() * 14;
          const nextB = pickNextBuildingForNpc(npc.profile, idx);
          npc.targetBuilding = nextB;
          npc.targetX = nextB.doorX + (Math.random() - 0.5) * 2.2;
          npc.targetZ = nextB.doorZ + nextB.frontDir * 3.5;
        }
      };

      // Identify the 2 closest footballers to the soccer ball so they actively chase & pass/shoot
      let closestFootballer1: NpcActor | null = null;
      let closestFootballer2: NpcActor | null = null;
      let bestFbDist1 = 999;
      let bestFbDist2 = 999;
      for (const npc of npcActors) {
        if (npc.activity !== 'football') continue;
        const d = Math.hypot(npc.rig.root.position.x - soccerBallState.x, npc.rig.root.position.z - soccerBallState.z);
        if (d < bestFbDist1) {
          bestFbDist2 = bestFbDist1;
          closestFootballer2 = closestFootballer1;
          bestFbDist1 = d;
          closestFootballer1 = npc;
        } else if (d < bestFbDist2) {
          bestFbDist2 = d;
          closestFootballer2 = npc;
        }
      }

      npcActors.forEach((npc, idx) => {
        npc.activityTimer -= dt;
        if (npc.kickTimer > 0) npc.kickTimer -= dt;
        if (npc.swingTimer > 0) npc.swingTimer -= dt;
        if (npc.chatCooldown > 0) npc.chatCooldown -= dt;

        // 1. INSIDE A CLASSROOM OR BUILDING ROOM (Hidden on exterior while studying/playing inside)
        if (npc.activity === 'inside_room') {
          npc.rig.root.visible = false;
          npc.racketMesh.visible = false;
          if (npc.activityTimer <= 0) {
            const b = npc.targetBuilding;
            npc.rig.root.visible = true;
            npc.rig.root.position.set(b.doorX + (Math.random() - 0.5) * 0.8, 0, b.doorZ - b.frontDir * 1.2);
            npc.targetX = b.doorX + (Math.random() - 0.5) * 4.5;
            npc.targetZ = b.doorZ + b.frontDir * 5.2;
            npc.activity = 'exiting_door';
            npc.activityTimer = 8.0;
          }
          return;
        }

        npc.rig.root.visible = true;
        npc.racketMesh.visible = npc.activity === 'tennis';

        // 2. PLAYING FOOTBALL ON THE PITCH
        if (npc.activity === 'football') {
          const isChaser = npc === closestFootballer1 || npc === closestFootballer2;
          if (isChaser) {
            npc.targetX = THREE.MathUtils.clamp(
              soccerBallState.x,
              PITCH_CENTER.x - PITCH_HALF_W + 1.2,
              PITCH_CENTER.x + PITCH_HALF_W - 1.2
            );
            npc.targetZ = THREE.MathUtils.clamp(
              soccerBallState.z,
              PITCH_CENTER.z - PITCH_HALF_L + 1.5,
              PITCH_CENTER.z + PITCH_HALF_L - 1.5
            );
          } else if (Math.hypot(npc.targetX - npc.rig.root.position.x, npc.targetZ - npc.rig.root.position.z) < 1.8) {
            // Tactical positioning on pitch
            const wingOffset = ((idx % 3) - 1) * 7.5;
            npc.targetX = THREE.MathUtils.clamp(
              PITCH_CENTER.x + wingOffset + (Math.random() - 0.5) * 4.0,
              PITCH_CENTER.x - PITCH_HALF_W + 1.8,
              PITCH_CENTER.x + PITCH_HALF_W - 1.8
            );
            const targetHalfZ = PITCH_CENTER.z + npc.teamSide * (3.5 + Math.random() * 11.5);
            npc.targetZ = THREE.MathUtils.clamp(
              targetHalfZ,
              PITCH_CENTER.z - PITCH_HALF_L + 2.5,
              PITCH_CENTER.z + PITCH_HALF_L - 2.5
            );
          }

          // Kick / Pass / Shoot the soccer ball when close (yields priority if human player is right on the ball)
          const distToSoccer = Math.hypot(
            npc.rig.root.position.x - soccerBallState.x,
            npc.rig.root.position.z - soccerBallState.z
          );
          const playerDistToSoccer = Math.hypot(playerState.x - soccerBallState.x, playerState.z - soccerBallState.z);
          if (distToSoccer < 1.85 && npc.kickTimer <= 0 && playerDistToSoccer > 2.4) {
            npc.kickTimer = 0.55;
            const goalZ = npc.teamSide === 1 ? PITCH_CENTER.z - PITCH_HALF_L : PITCH_CENTER.z + PITCH_HALF_L;
            const goalX = PITCH_CENTER.x + (Math.random() - 0.5) * 4.2;
            const dirX = goalX - soccerBallState.x;
            const dirZ = goalZ - soccerBallState.z;
            const len = Math.hypot(dirX, dirZ) || 1;
            const power = 15.5 + Math.random() * 5.5;
            soccerBallState.vx = (dirX / len) * power;
            soccerBallState.vz = (dirZ / len) * power;
            soccerBallState.vy = 4.2 + Math.random() * 2.6;
            if (playerDistToSoccer < 26) {
              soundEngine.playBallKick();
            }
            if (npc.chatCooldown <= 0 && Math.random() < 0.45) {
              const fbLines = [
                'Pass to the wing! ⚽',
                `Shooting for ${npc.profile.cohort}! ⚽`,
                'Counter-attack! Let’s go! ⚽',
                'Top corner shot! ⚽'
              ];
              attachSpeechBubble(npc.rig.root, npc.profile.name, fbLines[idx % fbLines.length], false);
              npc.chatCooldown = 14 + Math.random() * 10;
            }
          }

          if (npc.activityTimer <= 0) {
            assignNextExteriorActivity(npc, idx);
          }
        }

        // 3. PLAYING TENNIS ON ERA TENNIS COURT
        else if (npc.activity === 'tennis') {
          const playerOnSouthCourt =
            Math.abs(playerState.x - TENNIS_CENTER.x) < 7.2 &&
            playerState.z > TENNIS_CENTER.z - 0.5 &&
            playerState.z < TENNIS_CENTER.z + 13.5;

          if (npc.courtRole === 'south_player' && !playerOnSouthCourt) {
            npc.targetX = THREE.MathUtils.clamp(
              pickleBallState.x,
              TENNIS_CENTER.x - 5.2,
              TENNIS_CENTER.x + 5.2
            );
            npc.targetZ = TENNIS_CENTER.z + 8.85;

            if (pickleBallState.z > TENNIS_CENTER.z + 6.2 && pickleBallState.vz > 0 && npc.swingTimer <= 0) {
              npc.swingTimer = 0.42;
              if (npc.chatCooldown <= 0 && Math.random() < 0.38) {
                const tnLines = [
                  'Forehand topspin return! 🎾',
                  'Great rally Coach Leo! 🎾',
                  `${npc.profile.cohort} tennis ace! 🎾`,
                  'Cross-court winner! 🎾'
                ];
                attachSpeechBubble(npc.rig.root, npc.profile.name, tnLines[idx % tnLines.length], false);
                npc.chatCooldown = 15 + Math.random() * 10;
              }
            }
          } else {
            // Doubles partner or court footwork warm-up
            const sideSign = idx % 2 === 0 ? 1 : -1;
            npc.targetX = TENNIS_CENTER.x + sideSign * 4.4 + Math.sin(elapsed * 2.1 + idx) * 1.4;
            npc.targetZ = TENNIS_CENTER.z + 6.8 + Math.cos(elapsed * 1.8 + idx) * 1.2;
            if (Math.sin(elapsed * 3.2 + idx) > 0.92 && npc.swingTimer <= 0) {
              npc.swingTimer = 0.35;
            }
          }

          if (npc.activityTimer <= 0) {
            assignNextExteriorActivity(npc, idx);
          }
        }

        // 4. PLAYING GAMES (EraGames Bubble Island Plaza)
        else if (npc.activity === 'play_games') {
          const dArcade = Math.hypot(
            npc.rig.root.position.x - npc.targetX,
            npc.rig.root.position.z - npc.targetZ
          );
          if (dArcade < 1.6) {
            npc.rig.root.position.y = Math.abs(Math.sin(elapsed * 6.5 + idx)) * 0.35;
            if (npc.chatCooldown <= 0) {
              attachSpeechBubble(
                npc.rig.root,
                npc.profile.name,
                'Going inside EraGames to play Bubble Island! 🫧🎮',
                false
              );
              npc.chatCooldown = 16;
            }
            if (npc.activityTimer <= 12) {
              const eraGamesB = BUILDINGS.find((b) => b.id === 'speaking') || npc.targetBuilding;
              npc.targetBuilding = eraGamesB;
              npc.activity = 'entering_door';
              npc.targetX = eraGamesB.doorX;
              npc.targetZ = eraGamesB.doorZ - eraGamesB.frontDir * 1.5;
            }
          }
          if (npc.activityTimer <= 0) {
            npc.rig.root.position.y = 0;
            assignNextExteriorActivity(npc, idx);
          }
        }

        // 5. WALKING TO A CLASSROOM OR OTHER ROOM -> ENTERING DOOR -> EXITING DOOR
        else if (npc.activity === 'going_to_room') {
          const dDoor = Math.hypot(
            npc.targetX - npc.rig.root.position.x,
            npc.targetZ - npc.rig.root.position.z
          );
          if (dDoor < 1.35) {
            const b = npc.targetBuilding;
            npc.activity = 'entering_door';
            npc.targetX = b.doorX;
            npc.targetZ = b.doorZ - b.frontDir * 1.5;
            npc.activityTimer = 7.0;
          }
        } else if (npc.activity === 'entering_door') {
          const dInside = Math.hypot(
            npc.targetX - npc.rig.root.position.x,
            npc.targetZ - npc.rig.root.position.z
          );
          if (dInside < 0.85 || npc.activityTimer <= 0) {
            npc.activity = 'inside_room';
            npc.activityTimer = 9.0 + Math.random() * 9.0;
            npc.rig.root.visible = false;
            return;
          }
        } else if (npc.activity === 'exiting_door') {
          const dOut = Math.hypot(
            npc.targetX - npc.rig.root.position.x,
            npc.targetZ - npc.rig.root.position.z
          );
          if (dOut < 1.35 || npc.activityTimer <= 0) {
            if (npc.chatCooldown <= 0 && Math.random() < 0.55) {
              const bId = npc.targetBuilding.id;
              const exitMsg =
                bId === 'speaking'
                  ? 'Just won +$35 in Bubble Island! 🫧'
                  : bId.startsWith('class_')
                  ? `Finished ${npc.targetBuilding.name} class! 📚`
                  : bId === 'dashboard'
                  ? `Checked our ${npc.profile.cohort} leaderboard! 🏆`
                  : bId === 'reading'
                  ? 'Got cool new gear at EraSHOP! 🛍️'
                  : 'Ready for football & tennis! ⚽🎾';
              attachSpeechBubble(npc.rig.root, npc.profile.name, exitMsg, false);
              npc.chatCooldown = 15 + Math.random() * 10;
            }
            assignNextExteriorActivity(npc, idx);
          }
        } else {
          // 'socialize' (Teacher Jan & campus stroll)
          const dSoc = Math.hypot(
            npc.targetX - npc.rig.root.position.x,
            npc.targetZ - npc.rig.root.position.z
          );
          if (dSoc < 1.5 || npc.activityTimer <= 0) {
            npc.pauseTimer = 2.0 + Math.random() * 2.0;
            assignNextExteriorActivity(npc, idx);
          }
        }

        //Locomotion & Limb Animation for Exterior NPCs
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

          const moveSpeed =
            npc.activity === 'football'
              ? npc.speed * 1.28
              : npc.activity === 'tennis'
              ? npc.speed * 1.15
              : npc.speed;

          if (dist > 0.35) {
            const ang = Math.atan2(dx, dz);
            const curX = npc.rig.root.position.x;
            const curZ = npc.rig.root.position.z;
            const nextX = curX + Math.sin(ang) * moveSpeed * dt;
            const nextZ = curZ + Math.cos(ang) * moveSpeed * dt;
            const isDoorTransit = npc.activity === 'entering_door' || npc.activity === 'exiting_door';

            let blockedNpcX = false;
            let blockedNpcZ = false;
            if (!isDoorTransit) {
              for (const c of colliders) {
                if (nextX > c.minX - 0.35 && nextX < c.maxX + 0.35 && curZ > c.minZ - 0.35 && curZ < c.maxZ + 0.35) {
                  blockedNpcX = true;
                }
                if (curX > c.minX - 0.35 && curX < c.maxX + 0.35 && nextZ > c.minZ - 0.35 && nextZ < c.maxZ + 0.35) {
                  blockedNpcZ = true;
                }
              }
            }
            if (!activeInteriorBuilding) {
              const dPlayerNext = (nextX - playerState.x) * (nextX - playerState.x) + (nextZ - playerState.z) * (nextZ - playerState.z);
              const dPlayerCur = (curX - playerState.x) * (curX - playerState.x) + (curZ - playerState.z) * (curZ - playerState.z);
              if (dPlayerNext < 1.05 * 1.05 && dPlayerNext < dPlayerCur) {
                blockedNpcX = true;
                blockedNpcZ = true;
              }
            }

            if (!blockedNpcX) npc.rig.root.position.x = nextX;
            if (!blockedNpcZ) npc.rig.root.position.z = nextZ;
            npc.rig.root.rotation.y = npc.activity === 'tennis' ? Math.PI : ang;
            npc.walkPhase += dt * (npc.activity === 'football' ? 10.2 : 7.8);
            const sw = Math.sin(npc.walkPhase) * (npc.activity === 'football' ? 0.58 : 0.45);
            npc.rig.leftLeg.rotation.x = sw;
            npc.rig.rightLeg.rotation.x = -sw;
            npc.rig.leftArm.rotation.x = -sw * 0.65;
            npc.rig.rightArm.rotation.x = sw * 0.65;
          } else {
            npc.rig.leftLeg.rotation.x *= 0.82;
            npc.rig.rightLeg.rotation.x *= 0.82;
            npc.rig.leftArm.rotation.x *= 0.82;
            npc.rig.rightArm.rotation.x *= 0.82;
            if (npc.activity === 'tennis') {
              npc.rig.root.rotation.y = Math.PI; // Face the tennis net
            }
          }
        }

        // Apply Football Kick / Goal Celebration or Tennis Forehand Swing overrides
        if (npc.kickTimer > 0) {
          npc.rig.rightLeg.rotation.x = -1.25 * Math.sin((npc.kickTimer / 0.55) * Math.PI);
          npc.rig.leftArm.rotation.x = -0.65;
        }
        if (npc.swingTimer > 0) {
          npc.rig.rightArm.rotation.x = -1.85 * Math.sin((npc.swingTimer / 0.42) * Math.PI);
          npc.rig.rightArm.rotation.z = 0.35;
        } else {
          npc.rig.rightArm.rotation.z = THREE.MathUtils.damp(npc.rig.rightArm.rotation.z, 0, 8, dt);
        }

        if (npc.activity === 'football' && keeperGoalCooldown > 1.1) {
          npc.rig.root.position.y = Math.abs(Math.sin(elapsed * 10 + idx)) * 0.75;
        } else if (npc.activity !== 'play_games') {
          npc.rig.root.position.y = THREE.MathUtils.damp(npc.rig.root.position.y, 0, 10, dt);
        }

        if (!activeInteriorBuilding && npc.rig.root.visible) {
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

      // Animate Interior Classmates & Visitors when player is inside a Classroom or Building
      if (activeInteriorBuilding) {
        interiorNpcActors.forEach((inpc, idx) => {
          inpc.timer -= dt;
          if (inpc.role === 'seated_student') {
            // Seated students sit directly on their chair facing the chalkboard, take notes, and raise their hand
            inpc.rig.root.position.y = 0;
            inpc.rig.hipsGroup.position.y = 0.56;
            inpc.rig.vehicleGroup.visible = false;
            inpc.rig.leftLeg.rotation.x = -1.12;
            inpc.rig.rightLeg.rotation.x = -1.12;
            inpc.rig.root.rotation.y = Math.PI + Math.sin(elapsed * 1.2 + idx) * 0.08;
            if (inpc.handRaiseTimer > 0) {
              inpc.handRaiseTimer -= dt;
              inpc.rig.rightArm.rotation.z = THREE.MathUtils.damp(inpc.rig.rightArm.rotation.z, 2.65, 8, dt);
              inpc.rig.rightArm.rotation.x = THREE.MathUtils.damp(inpc.rig.rightArm.rotation.x, -0.25, 8, dt);
            } else {
              inpc.rig.rightArm.rotation.z = THREE.MathUtils.damp(inpc.rig.rightArm.rotation.z, 0, 6, dt);
              inpc.rig.rightArm.rotation.x = Math.sin(elapsed * 4.5 + idx) * 0.15 - 0.35; // Note-taking motion
              if (inpc.timer <= 0) {
                inpc.timer = 7 + Math.random() * 9;
                if (Math.random() < 0.45) {
                  inpc.handRaiseTimer = 2.8;
                  const studyLines = [
                    'I know the answer, Teacher! 🙋',
                    'Working on Band 8 Writing Task 2! ✍️',
                    'Practicing Cambridge & IELTS vocab! 📚',
                    'Can we play Bubble Island after class? 🫧'
                  ];
                  attachSpeechBubble(inpc.rig.root, inpc.profile.name, studyLines[idx % studyLines.length], false);
                }
              }
            }
          } else {
            // Roaming classmates walking IN through the room door, moving around the room, and walking OUT the door
            if (inpc.state === 'outside_wait') {
              inpc.rig.root.visible = false;
              if (inpc.timer <= 0) {
                inpc.rig.root.visible = true;
                inpc.rig.root.position.set((Math.random() - 0.5) * 1.2, 0, 11.2);
                inpc.targetX = inpc.spotX + (Math.random() - 0.5) * 2.4;
                inpc.targetZ = inpc.spotZ + (Math.random() - 0.5) * 2.0;
                inpc.state = 'walking_in';
                inpc.timer = 8.0;
              }
              return;
            }

            inpc.rig.root.visible = true;
            const dx = inpc.targetX - inpc.rig.root.position.x;
            const dz = inpc.targetZ - inpc.rig.root.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 0.35) {
              const ang = Math.atan2(dx, dz);
              const nextLocalX = inpc.rig.root.position.x + Math.sin(ang) * 3.2 * dt;
              const nextLocalZ = inpc.rig.root.position.z + Math.cos(ang) * 3.2 * dt;
              const nextWorldX = INTERIOR_ORIGIN.x + nextLocalX;
              const nextWorldZ = INTERIOR_ORIGIN.z + nextLocalZ;
              const curWorldX = INTERIOR_ORIGIN.x + inpc.rig.root.position.x;
              const curWorldZ = INTERIOR_ORIGIN.z + inpc.rig.root.position.z;

              const dPlayerNext = (nextWorldX - playerState.x) * (nextWorldX - playerState.x) + (nextWorldZ - playerState.z) * (nextWorldZ - playerState.z);
              const dPlayerCur = (curWorldX - playerState.x) * (curWorldX - playerState.x) + (curWorldZ - playerState.z) * (curWorldZ - playerState.z);

              if (!(dPlayerNext < 0.92 * 0.92 && dPlayerNext < dPlayerCur)) {
                inpc.rig.root.position.x = nextLocalX;
                inpc.rig.root.position.z = nextLocalZ;
              }
              inpc.rig.root.rotation.y = ang;
              inpc.walkPhase += dt * 7.2;
              const sw = Math.sin(inpc.walkPhase) * 0.42;
              inpc.rig.leftLeg.rotation.x = sw;
              inpc.rig.rightLeg.rotation.x = -sw;
              inpc.rig.leftArm.rotation.x = -sw * 0.55;
              inpc.rig.rightArm.rotation.x = sw * 0.55;
            } else {
              inpc.rig.leftLeg.rotation.x *= 0.8;
              inpc.rig.rightLeg.rotation.x *= 0.8;
              inpc.rig.leftArm.rotation.x *= 0.8;
              inpc.rig.rightArm.rotation.x *= 0.8;

              if (inpc.state === 'walking_in') {
                inpc.state = 'at_spot';
                inpc.timer = 6.5 + Math.random() * 6.0;
                inpc.rig.root.rotation.y = Math.PI;
              } else if (inpc.state === 'at_spot') {
                if (inpc.timer <= 0) {
                  if (Math.random() < 0.48) {
                    inpc.targetX = (Math.random() - 0.5) * 8.5;
                    inpc.targetZ = 4.2 + Math.random() * 4.2;
                    inpc.timer = 5.5 + Math.random() * 4.5;
                  } else {
                    // Head out the exit door
                    inpc.state = 'walking_out';
                    inpc.targetX = (Math.random() - 0.5) * 0.8;
                    inpc.targetZ = 11.4;
                    inpc.timer = 6.0;
                  }
                }
              } else if (inpc.state === 'walking_out') {
                inpc.state = 'outside_wait';
                inpc.rig.root.visible = false;
                inpc.timer = 3.5 + Math.random() * 4.5;
              }
            }
          }

          if (inpc.rig.root.visible) {
            const worldNpcX = INTERIOR_ORIGIN.x + inpc.rig.root.position.x;
            const worldNpcZ = INTERIOR_ORIGIN.z + inpc.rig.root.position.z;
            const dToPlayer = Math.hypot(playerState.x - worldNpcX, playerState.z - worldNpcZ);
            if (dToPlayer < closestNpcDist) {
              closestNpcDist = dToPlayer;
              closestNpc = inpc.profile;
            }
          }
        });
      }
      // Animate AI Employees inside ERA FACULTY & detect proximity to cubicle workstations
      let closestFacEmp: FacultyEmployeeProfile | null = null;
      if (activeInteriorBuilding && activeInteriorBuilding.id === 'faculty_hq') {
        const facultyWaypoints = [
          { x: -1.15, z: -6.8 },
          { x: 1.15, z: -6.8 },
          { x: -1.15, z: -2.4 },
          { x: 1.15, z: -2.4 },
          { x: -1.15, z: 2.2 },
          { x: 1.15, z: 2.2 },
          { x: -1.15, z: 7.4 },
          { x: 1.15, z: 7.4 },
          { x: -4.8, z: 8.6 },
          { x: 4.8, z: 8.6 },
          { x: -7.8, z: 8.8 },
          { x: 7.8, z: 8.8 }
        ];
        let minFacDist = 3.8;
        facultyNpcActors.forEach((fa, fIdx) => {
          if (fa.isWalker) {
            // Natural office roaming around the room: walking along the central avenue, front door concourse & back analytics wall
            if (fa.pauseTimer > 0) {
              fa.pauseTimer -= dt;
              fa.rig.root.position.y = 0;
              fa.rig.leftLeg.rotation.x *= 0.82;
              fa.rig.rightLeg.rotation.x *= 0.82;
              fa.rig.leftArm.rotation.x *= 0.82;
              fa.rig.rightArm.rotation.x *= 0.82;
              if (fa.pauseTimer <= 0) {
                fa.waypointIdx = (fa.waypointIdx + 1 + Math.floor(Math.random() * 3)) % facultyWaypoints.length;
                const nextWp = facultyWaypoints[fa.waypointIdx];
                fa.targetX = nextWp.x + (Math.random() - 0.5) * 0.45;
                fa.targetZ = nextWp.z + (Math.random() - 0.5) * 0.45;
              }
            } else {
              const dx = fa.targetX - fa.rig.root.position.x;
              const dz = fa.targetZ - fa.rig.root.position.z;
              const dist = Math.hypot(dx, dz);
              if (dist > 0.28) {
                const ang = Math.atan2(dx, dz);
                const nextLocalX = fa.rig.root.position.x + Math.sin(ang) * fa.walkSpeed * dt;
                const nextLocalZ = fa.rig.root.position.z + Math.cos(ang) * fa.walkSpeed * dt;
                const nextWorldX = INTERIOR_ORIGIN.x + nextLocalX;
                const nextWorldZ = INTERIOR_ORIGIN.z + nextLocalZ;
                const curWorldX = INTERIOR_ORIGIN.x + fa.rig.root.position.x;
                const curWorldZ = INTERIOR_ORIGIN.z + fa.rig.root.position.z;

                // Avoid walking through the human player or other walking faculty staff
                let blockedByPerson = false;
                const dPlayerNext = (nextWorldX - playerState.x) * (nextWorldX - playerState.x) + (nextWorldZ - playerState.z) * (nextWorldZ - playerState.z);
                const dPlayerCur = (curWorldX - playerState.x) * (curWorldX - playerState.x) + (curWorldZ - playerState.z) * (curWorldZ - playerState.z);
                if (dPlayerNext < 0.95 * 0.95 && dPlayerNext < dPlayerCur) {
                  blockedByPerson = true;
                }
                for (const otherFa of facultyNpcActors) {
                  if (otherFa === fa || !otherFa.isWalker) continue;
                  const ox = otherFa.rig.root.position.x;
                  const oz = otherFa.rig.root.position.z;
                  const dOtherNext = (nextLocalX - ox) * (nextLocalX - ox) + (nextLocalZ - oz) * (nextLocalZ - oz);
                  const dOtherCur = (fa.rig.root.position.x - ox) * (fa.rig.root.position.x - ox) + (fa.rig.root.position.z - oz) * (fa.rig.root.position.z - oz);
                  if (dOtherNext < 0.85 * 0.85 && dOtherNext < dOtherCur) {
                    blockedByPerson = true;
                    break;
                  }
                }

                if (!blockedByPerson) {
                  fa.rig.root.position.x = nextLocalX;
                  fa.rig.root.position.z = nextLocalZ;
                } else {
                  // Pick a new open waypoint if blocked
                  fa.waypointIdx = (fa.waypointIdx + 2) % facultyWaypoints.length;
                  fa.targetX = facultyWaypoints[fa.waypointIdx].x;
                  fa.targetZ = facultyWaypoints[fa.waypointIdx].z;
                }

                let rotDiff = ang - fa.rig.root.rotation.y;
                while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                fa.rig.root.rotation.y += rotDiff * Math.min(1, dt * 10);

                fa.walkPhase += dt * (fa.walkSpeed * 3.1);
                fa.rig.root.position.y = Math.abs(Math.sin(fa.walkPhase)) * 0.04;
                const swing = Math.sin(fa.walkPhase) * 0.44;
                fa.rig.leftArm.rotation.x = swing;
                fa.rig.rightArm.rotation.x = -swing;
                fa.rig.leftLeg.rotation.x = -swing;
                fa.rig.rightLeg.rotation.x = swing;
              } else {
                fa.pauseTimer = 1.6 + Math.random() * 2.4;
                // While pausing, orient toward the front entrance door (+Z) or nearby cubicle
                fa.rig.root.rotation.y = THREE.MathUtils.damp(fa.rig.root.rotation.y, 0, 8, dt);
              }
            }
          } else {
            // Seated on office chair at cubicle desk facing the front entrance door (+Z, baseRotY = 0)
            fa.rig.root.position.y = 0;
            fa.rig.hipsGroup.position.y = 0.46;
            fa.rig.vehicleGroup.visible = false;
            fa.rig.leftLeg.rotation.x = -1.08;
            fa.rig.rightLeg.rotation.x = -1.08;
            fa.rig.root.rotation.y = fa.baseRotY + Math.sin(elapsed * 1.4 + fIdx) * 0.07;
            fa.rig.leftArm.rotation.x = -0.68 + Math.sin(elapsed * 6.5 + fIdx) * 0.12;
            fa.rig.rightArm.rotation.x = -0.68 + Math.cos(elapsed * 6.5 + fIdx) * 0.12;
          }

          fa.speechTimer -= dt;
          if (fa.speechTimer <= 0) {
            fa.speechTimer = 11 + (fIdx % 6) * 3.5;
            if (Math.random() < 0.35 && fa.employee.speechBubbles.length > 0) {
              const line = fa.employee.speechBubbles[fa.bubbleIndex % fa.employee.speechBubbles.length];
              fa.bubbleIndex++;
              attachSpeechBubble(fa.rig.root, fa.employee.name, line, false);
            }
          }

          const wx = INTERIOR_ORIGIN.x + fa.rig.root.position.x;
          const wz = INTERIOR_ORIGIN.z + fa.rig.root.position.z;
          const d = Math.hypot(playerState.x - wx, playerState.z - wz);
          if (d < minFacDist) {
            minFacDist = d;
            closestFacEmp = fa.employee;
          }
        });
      }
      const nextFacId = closestFacEmp ? closestFacEmp.id : '';
      if (nextFacId !== hudSyncCache.facultyEmpId) {
        hudSyncCache.facultyEmpId = nextFacId;
        setNearFacultyEmployee(closestFacEmp);
      }

      const nextNpcId = closestNpc ? closestNpc.id : '';
      if (nextNpcId !== hudSyncCache.npcId) {
        hudSyncCache.npcId = nextNpcId;
        setNearCharacterPrompt(closestNpc);
      }

      // Proximity Prompts (Cached so React state only updates when proximity target actually changes)
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
        if (!nearBoard && activeInteriorBuilding.id === 'speaking') {
          const distToPixel = Math.hypot(
            playerState.x - INTERIOR_ORIGIN.x,
            playerState.z - (INTERIOR_ORIGIN.z - 5.5)
          );
          const distToPodium = Math.hypot(
            playerState.x - INTERIOR_ORIGIN.x,
            playerState.z - (INTERIOR_ORIGIN.z + 0.8)
          );
          if (distToPixel < 5.0 || distToPodium < 4.2) {
            nearBoard = {
              slot: 'back-center',
              category: 'ERAGAMES ARCADE HOST',
              title: 'EraGames Arcade & Arena',
              subtitle: 'Play Mini-Games with Pixel, Kai & Sophia to win Era Gems',
              badge: 'PLAY ERAGAMES',
              accentHex: '#9333EA',
              bgLightHex: '#F3E8FF',
              actionType: 'open_eragames'
            };
          }
        }
        const nextBoardKey = nearBoard ? `${nearBoard.slot}:${nearBoard.title}` : '';
        if (nextBoardKey !== hudSyncCache.boardKey) {
          hudSyncCache.boardKey = nextBoardKey;
          setNearBoardPrompt(nearBoard);
        }

        if (activeInteriorBuilding.id.startsWith('class_') && !playerState.isSitting) {
          let closestDesk: {
            seatX: number;
            seatZ: number;
            deskName: string;
            classCohort: string;
          } | null = null;
          let minDeskDist = 2.3;
          clickableBoardMeshes.forEach((m) => {
            if (m.userData?.isClassroomDesk) {
              const d = Math.hypot(
                playerState.x - m.userData.seatX,
                playerState.z - m.userData.seatZ
              );
              if (d < minDeskDist) {
                minDeskDist = d;
                closestDesk = {
                  seatX: m.userData.seatX,
                  seatZ: m.userData.seatZ,
                  deskName: m.userData.deskName,
                  classCohort: m.userData.classCohort
                };
              }
            }
          });
          const nextDeskKey = closestDesk ? `${closestDesk.deskName}:${closestDesk.seatX}` : '';
          if (nextDeskKey !== hudSyncCache.deskKey) {
            hudSyncCache.deskKey = nextDeskKey;
            setNearClassroomDesk(closestDesk);
          }
        } else if (hudSyncCache.deskKey !== '') {
          hudSyncCache.deskKey = '';
          setNearClassroomDesk(null);
        }
      } else {
        if (hudSyncCache.deskKey !== '') {
          hudSyncCache.deskKey = '';
          setNearClassroomDesk(null);
        }
        let nearB: BuildingZone | null = null;
        let minDoorDist = 6.5;
        BUILDINGS.forEach((b) => {
          const d = Math.hypot(playerState.x - b.doorX, playerState.z - b.doorZ);
          if (d < minDoorDist) {
            minDoorDist = d;
            nearB = b;
          }
        });
        const nextBId = nearB ? (nearB as BuildingZone).id : '';
        if (nextBId !== hudSyncCache.buildingId) {
          hudSyncCache.buildingId = nextBId;
          setNearBuildingPrompt(nearB);
        }

        const isNearAnyBeachFishingSpot =
          playerState.y < 15 &&
          (playerState.z > 94 || (playerState.x > 100 && playerState.z > -90 && playerState.z < 135));
        if (isNearAnyBeachFishingSpot !== hudSyncCache.nearFishing) {
          hudSyncCache.nearFishing = isNearAnyBeachFishingSpot;
          setNearFishingZone(isNearAnyBeachFishingSpot);
        }

        // Detect proximity to Lower Base Cable Car Station / $5 Ticket Booth OR Upper Summit Terminal
        if (cableCarSim.phase === 'idle') {
          const distBaseStation =
            playerState.y < 15 ? Math.hypot(playerState.x - -148.5, playerState.z - 45.5) : 999;
          const distSummitStation =
            playerState.y > 40 ? Math.hypot(playerState.x - -189.0, playerState.z - -9.0) : 999;
          const nextCableStation: 'base' | 'summit' | null =
            distBaseStation < 11.0 ? 'base' : distSummitStation < 8.5 ? 'summit' : null;
          if (nextCableStation !== hudSyncCache.cableStation) {
            hudSyncCache.cableStation = nextCableStation;
            setNearCableCarStation(nextCableStation);
          }

          // Detect proximity to Summit Panoramic Telescopes, Viewing Benches & Sky Cafe
          if (playerState.y > 40) {
            const teleDist = Math.min(
              Math.hypot(playerState.x - -175.5, playerState.z - -25.1),
              Math.hypot(playerState.x - -171.3, playerState.z - -18.0),
              Math.hypot(playerState.x - -175.5, playerState.z - -10.9)
            );
            const nextTele = teleDist < 3.6;
            if (nextTele !== hudSyncCache.nearTelescope) {
              hudSyncCache.nearTelescope = nextTele;
              setNearSummitTelescope(nextTele);
            }

            const summitBenches = [
              { seatX: -181.5, seatZ: -24.4, rotY: Math.PI },
              { seatX: -173.2, seatZ: -21.5, rotY: Math.PI / 2 }
            ];
            let foundBench: { seatX: number; seatZ: number; rotY: number } | null = null;
            for (const sb of summitBenches) {
              if (Math.hypot(playerState.x - sb.seatX, playerState.z - sb.seatZ) < 2.6) {
                foundBench = sb;
                break;
              }
            }
            const nextBenchKey = foundBench ? `${foundBench.seatX}:${foundBench.seatZ}` : '';
            if (nextBenchKey !== hudSyncCache.benchKey) {
              hudSyncCache.benchKey = nextBenchKey;
              setNearSummitBench(foundBench);
            }

            const nextCafe = Math.hypot(playerState.x - -201.5, playerState.z - -12.5) < 4.2;
            if (nextCafe !== hudSyncCache.nearCafe) {
              hudSyncCache.nearCafe = nextCafe;
              setNearSummitCafe(nextCafe);
            }
          } else {
            if (hudSyncCache.nearTelescope) {
              hudSyncCache.nearTelescope = false;
              setNearSummitTelescope(false);
            }
            if (hudSyncCache.benchKey !== '') {
              hudSyncCache.benchKey = '';
              setNearSummitBench(null);
            }
            if (hudSyncCache.nearCafe) {
              hudSyncCache.nearCafe = false;
              setNearSummitCafe(false);
            }
          }
        } else {
          if (hudSyncCache.cableStation !== null) {
            hudSyncCache.cableStation = null;
            setNearCableCarStation(null);
          }
          if (hudSyncCache.nearTelescope) {
            hudSyncCache.nearTelescope = false;
            setNearSummitTelescope(false);
          }
          if (hudSyncCache.benchKey !== '') {
            hudSyncCache.benchKey = '';
            setNearSummitBench(null);
          }
          if (hudSyncCache.nearCafe) {
            hudSyncCache.nearCafe = false;
            setNearSummitCafe(false);
          }
        }
      }

      // Camera Anti-Occlusion, Panoramic Telescope View & Smooth Orbit
      if (!activeInteriorBuilding && cableCarSim.activeTelescope) {
        // High-Altitude Panoramic Telescope View from the Mountain Summit (Y = 76m+) overlooking the City & Campus!
        if (cableCarSim.activeTelescope === 'city') {
          _desiredCamPos.set(-165, 82.0, -32);
          _camTarget.set(-10, 26.0, -142); // Aim directly at the North City Metropolis Skyline!
        } else if (cableCarSim.activeTelescope === 'campus') {
          _desiredCamPos.set(-164, 80.0, -18);
          _camTarget.set(0, 6.0, 0); // Aim at Central Campus Plaza, Classrooms & Fountain
        } else if (cableCarSim.activeTelescope === 'beach') {
          _desiredCamPos.set(-164, 80.0, -12);
          _camTarget.set(45, 2.0, 115); // Aim at South Tropical Beach, Pier & East Fishing Lagoon
        } else {
          _desiredCamPos.set(-166, 76.0, -8);
          _camTarget.set(-174, 15.0, 0); // Aim at Cascading Alpine Waterfall & Plunge Pool
        }
        camera.position.lerp(_desiredCamPos, Math.min(1, dt * 8));
        camera.lookAt(_camTarget);
      } else {
        const basePivotY = playerState.y + 2.0;
        const lookTiltY =
          camState.pitch < 0
            ? -camState.pitch * 6.2
            : camState.pitch > 0.35
            ? -(camState.pitch - 0.35) * 2.0
            : 0;
        _camTarget.set(playerState.x, basePivotY + lookTiltY, playerState.z);

        const effectiveOrbitPitch = Math.max(-0.18, camState.pitch);
        const horizDist = camState.distance * Math.cos(effectiveOrbitPitch);
        const vertDist = camState.distance * Math.sin(effectiveOrbitPitch);

        const maxInteriorCamY =
          activeInteriorBuilding?.id === 'faculty_hq'
            ? 6.65
            : activeInteriorBuilding
            ? 9.8
            : 125.0;

        const rawCamY = basePivotY + vertDist;
        const clampedCamY = Math.max(playerState.y + 1.15, Math.min(maxInteriorCamY, rawCamY));

        _desiredCamPos.set(
          playerState.x + Math.sin(camState.yaw) * horizDist,
          clampedCamY,
          playerState.z + Math.cos(camState.yaw) * horizDist
        );

        doorControllers.forEach((dc) => {
          dc.wallMaterials.forEach((mat) => {
            mat.opacity = THREE.MathUtils.damp(mat.opacity, 1.0, 10, dt);
          });
        });

        if (!activeInteriorBuilding && playerState.y < 35 && cableCarSim.phase === 'idle') {
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
        } else if (activeInteriorBuilding) {
          const maxWallX = activeInteriorBuilding.id === 'faculty_hq' ? 14.2 : 13.0;
          const maxWallZ = activeInteriorBuilding.id === 'faculty_hq' ? 12.2 : 11.0;
          _desiredCamPos.x = Math.max(INTERIOR_ORIGIN.x - maxWallX, Math.min(INTERIOR_ORIGIN.x + maxWallX, _desiredCamPos.x));
          _desiredCamPos.z = Math.max(INTERIOR_ORIGIN.z - maxWallZ, Math.min(INTERIOR_ORIGIN.z + maxWallZ, _desiredCamPos.z));
        }

        camera.position.lerp(_desiredCamPos, Math.min(1, dt * 16));
        camera.lookAt(_camTarget);
      }

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
              <span className="text-sm font-black text-white leading-tight">{eraGems.toLocaleString()}</span>
            </div>
          </div>

          {/* Era Dollar Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35">
            <span className="text-base">💵</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 leading-none">
                Era Dollar
              </span>
              <span className="text-sm font-black text-white leading-tight">${eraDollars.toLocaleString()}</span>
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
            <span>EraSHOP (💎 {eraGems} • 💵 ${eraDollars})</span>
          </button>
        )}

        {/* East Beach Fishing Club Button */}
        {!insideBuilding && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiClick();
              setShowFishingModal(true);
            }}
            className={`flex items-center gap-2 font-extrabold text-xs px-3.5 py-3 rounded-2xl shadow-lg border transition-all cursor-pointer ${
              nearFishingZone
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 border-amber-300 ring-2 ring-amber-300/60 animate-bounce'
                : 'bg-slate-900/90 hover:bg-cyan-950/90 text-cyan-200 border-cyan-400/35'
            }`}
            title="East Beach Fishing Lagoon behind Era Football Club — Answer Course Questions for Bait & Catch $1–$10 Fish!"
          >
            <span className="text-base leading-none">🎣</span>
            <span>Fishing ({fishingBaitCount} 🪱)</span>
          </button>
        )}

        {/* West Mountain Cable Car ($5 Ticket Booth) & Summit Skywalk Button */}
        {!insideBuilding && (
          <button
            type="button"
            onClick={() => gameActionsRef.current?.teleportToCableCarStation()}
            className={`flex items-center gap-2 font-extrabold text-xs px-3.5 py-3 rounded-2xl shadow-lg border transition-all cursor-pointer ${
              isAtMountainSummit || cableCarRidePhase !== 'idle' || nearCableCarStation
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-yellow-200 ring-2 ring-amber-300/60'
                : 'bg-slate-900/90 hover:bg-amber-950/90 text-amber-200 border-amber-400/35'
            }`}
            title="West Mountain Cable Car & $5 Ticket Booth — Ride up to the Summit Glass Skywalk & see the City from above!"
          >
            <span className="text-base leading-none">🚡</span>
            <span>
              {isAtMountainSummit
                ? 'Summit Skywalk (2,400m)'
                : cableCarRidePhase !== 'idle'
                ? `Cable Car (${cableCarElevationMeters}m)`
                : 'Cable Car ($5 🎟️)'}
            </span>
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
                if (insideBuilding.id === 'faculty_hq') {
                  setSelectedFacultyEmployee(null);
                  setFacultyInitialAdminModule('overview');
                  setShowFacultyModal(true);
                  return;
                }
                if (insideBuilding.id.startsWith('class_')) {
                  const firstBoard = INTERIOR_BOARDS_BY_BUILDING[insideBuilding.id]?.[0];
                  if (firstBoard) {
                    handleBoardAction(firstBoard);
                    return;
                  }
                }
                setActiveBuildingModal(insideBuilding.id);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl border border-blue-400/30 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{insideBuilding.id === 'faculty_hq' ? 'Open ERA Faculty' : `Open ${insideBuilding.name}`}</span>
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

      {/* 6B. MOUNTAIN CABLE CAR $5 TICKET BOOTH, LIVE AERIAL RIDE & SUMMIT CITY OVERLOOK HUD */}
      {!insideBuilding &&
        !nearBuildingPrompt &&
        (nearCableCarStation !== null ||
          cableCarRidePhase !== 'idle' ||
          isAtMountainSummit ||
          activeTelescopeView !== null) && (
          <div className="absolute bottom-6 inset-x-0 z-10 flex flex-col items-center gap-2.5 pointer-events-none px-4">
            {/* Active Panoramic Telescope City Overlook Bar */}
            {activeTelescopeView !== null && (
              <div className="bg-slate-950/95 border-2 border-sky-400/80 rounded-2xl px-4 py-3 text-white shadow-2xl flex flex-wrap items-center gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-2 pr-2">
                  <span className="text-2xl">🔭</span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                      SUMMIT TELESCOPE • 2,400M ELEVATION
                    </div>
                    <div className="text-sm font-black text-white">
                      Panoramic City & Island Overlook
                    </div>
                  </div>
                </div>

                {(
                  [
                    { id: 'city', label: '🏙️ North City Skyline' },
                    { id: 'campus', label: '🏫 Central Campus' },
                    { id: 'beach', label: '🏖️ South Beach & Lagoon' },
                    { id: 'waterfall', label: '🌊 Alpine Waterfall' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => gameActionsRef.current?.setTelescopePreset(t.id)}
                    className={`px-3 py-2 rounded-xl font-extrabold text-xs cursor-pointer transition-all border ${
                      activeTelescopeView === t.id
                        ? 'bg-sky-500 text-slate-950 border-sky-200 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/15'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => gameActionsRef.current?.setTelescopePreset(null)}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Exit Telescope (ESC)
                </button>
              </div>
            )}

            {/* Live 3D Cable Car Aerial Ride Progress Bar */}
            {cableCarRidePhase !== 'idle' && (
              <div className="bg-slate-950/95 border-2 border-amber-400/80 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex flex-wrap items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚡</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        {cableCarRidePhase === 'ascending'
                          ? 'ASCENDING TO SUMMIT CITY OVERLOOK'
                          : 'DESCENDING TO WEST CAMPUS BASE'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black tabular-nums">
                        🎟️ $5 TICKET PAID
                      </span>
                    </div>
                    <div className="text-base font-black text-white tabular-nums">
                      Altitude: {cableCarElevationMeters.toLocaleString()}m / 2,400m • Drag Mouse to Look Around the City!
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => gameActionsRef.current?.skipCableCarRide()}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  ⏩ Skip to Station
                </button>
              </div>
            )}

            {/* Base Station $5 Ticket Booth OR Upper Summit Skywalk Controls */}
            {cableCarRidePhase === 'idle' && activeTelescopeView === null && (
              <div className="bg-slate-950/95 border-2 border-amber-400/60 rounded-2xl px-4 py-3 text-white shadow-2xl flex flex-wrap items-center gap-3 pointer-events-auto">
                <div className="flex items-center gap-2.5 pr-1">
                  <span className="text-2xl">{isAtMountainSummit ? '🏔️' : '🎟️'}</span>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>
                        {isAtMountainSummit
                          ? 'Mountain Summit Skywalk & City Overlook (2,400m)'
                          : 'Mountain Cable Car & Ticket Booth'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-black border ${
                          hasCableCarTicket
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                            : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                        }`}
                      >
                        {hasCableCarTicket ? '🎟️ Ticket Ready' : '🎟️ $5 / Ride'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-300">
                      {isAtMountainSummit
                        ? 'Walk onto the Glass Skywalk, use Telescopes to view the North City Skyline, or ride down!'
                        : `Ticket Clerk Maya: Pay $5 Era Dollars per ride (Your Wallet: $${eraDollars})`}
                    </div>
                  </div>
                </div>

                {!isAtMountainSummit ? (
                  <>
                    {!hasCableCarTicket && (
                      <button
                        type="button"
                        onClick={() => gameActionsRef.current?.buyTicketAtBooth()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🎟️ Buy $5 Ticket at Booth</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => gameActionsRef.current?.boardCableCar(false)}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {hasCableCarTicket
                          ? '🚡 Board Cable Car to Summit (E)'
                          : '🚡 Pay $5 & Ride to Summit (E)'}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => gameActionsRef.current?.setTelescopePreset('city')}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔭 View City from Above {nearSummitTelescope ? '(E)' : ''}</span>
                    </button>

                    {nearSummitBench && !isSittingAtDesk && (
                      <button
                        type="button"
                        onClick={() => gameActionsRef.current?.sitAtSummitBench(nearSummitBench)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <span>🪑 Sit on Overlook Bench (E)</span>
                      </button>
                    )}

                    {isSittingAtDesk && (
                      <button
                        type="button"
                        onClick={() => gameActionsRef.current?.standUpFromDesk()}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <span>Stand Up (Space)</span>
                      </button>
                    )}

                    {nearSummitCafe && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playCrystalCollect();
                          showToast(
                            'Summit Sky Cafe Hot Cocoa! ☕',
                            'Enjoying warm alpine hot cocoa at 2,400m overlooking the city!',
                            '#F59E0B'
                          );
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        <span>☕ Get Sky Cafe Cocoa (E)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => gameActionsRef.current?.boardCableCar(eraDollars < 5)}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {hasCableCarTicket
                          ? '🚡 Ride Cable Car Down (Ticket Ready)'
                          : eraDollars >= 5
                          ? '🚡 Pay $5 & Ride Down to Campus'
                          : '🚡 Ride Down to Campus (Free Return)'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      {(nearFishingZone || fishingPhase !== 'idle' || activeCatchCard) && !nearBuildingPrompt && !insideBuilding && (
        <div className="absolute bottom-6 inset-x-0 z-10 flex flex-col items-center gap-2.5 pointer-events-none px-4">
          {/* Catch Result Showcase Card: Shows exact Fish Caught (+$1 to +$10) OR Trash Caught ($0 Value) */}
          {activeCatchCard && (
            <div
              className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-2xl border-2 flex items-center gap-3.5 transition-all max-w-md w-full ${
                activeCatchCard.isTrash || activeCatchCard.price <= 0
                  ? 'bg-slate-950/95 border-rose-500/80 text-white'
                  : 'bg-slate-950/95 border-emerald-400/80 text-white'
              }`}
            >
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                  activeCatchCard.isTrash || activeCatchCard.price <= 0
                    ? 'bg-rose-950/80 border-rose-500/50'
                    : 'bg-emerald-950/80 border-emerald-400/50'
                }`}
              >
                {activeCatchCard.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeCatchCard.isTrash || activeCatchCard.price <= 0
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                        : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                    }`}
                  >
                    {activeCatchCard.isTrash || activeCatchCard.price <= 0
                      ? '🗑️ TRASH CAUGHT'
                      : `🐟 ${activeCatchCard.rarity.toUpperCase()} FISH CAUGHT`}
                  </span>
                  {activeCatchCard.xpReward > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-300">
                      +{activeCatchCard.xpReward} XP
                    </span>
                  )}
                </div>

                <div className="text-base font-black text-white truncate mt-0.5">
                  {activeCatchCard.name}
                </div>
                <div className="text-[11px] font-semibold text-slate-300">
                  {activeCatchCard.isTrash || activeCatchCard.price <= 0
                    ? 'No dollar value — keep fishing for $1 to $10 fish!'
                    : `Added +$${activeCatchCard.price} Era Dollars directly to your wallet!`}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <div
                  className={`px-3 py-1.5 rounded-xl font-black text-sm border shadow-md ${
                    activeCatchCard.isTrash || activeCatchCard.price <= 0
                      ? 'bg-rose-600 text-white border-rose-300'
                      : 'bg-emerald-500 text-slate-950 border-emerald-200'
                  }`}
                >
                  {activeCatchCard.isTrash || activeCatchCard.price <= 0
                    ? '$0 VALUE'
                    : `+$${activeCatchCard.price} 💵`}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCatchCard(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Dismiss ✕
                </button>
              </div>
            </div>
          )}

          {/* Main Beach Fishing Control Bar */}
          <div className="bg-slate-950/95 border-2 border-cyan-400/50 rounded-2xl px-4 py-3 text-white shadow-2xl flex flex-col gap-2 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 pr-1">
                <span className="text-2xl">🎣</span>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>Beach Fishing</span>
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-[11px]">
                      🪱 {fishingBaitCount} Bait
                    </span>
                  </div>
                  {lastCaughtFish ? (
                    <div
                      className={`text-[11px] font-extrabold ${
                        lastCaughtFish.isTrash || lastCaughtFish.price <= 0
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      Last catch: {lastCaughtFish.emoji} {lastCaughtFish.name} (
                      {lastCaughtFish.isTrash || lastCaughtFish.price <= 0
                        ? '$0 Trash'
                        : `+$${lastCaughtFish.price}`}
                      )
                    </div>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-400">
                      Fish worth $1–$10 • Watch out for $0 ocean trash!
                    </div>
                  )}
                </div>
              </div>

              {fishingPhase === 'bite_ready' || fishingPhase === 'bobbing' ? (
                <button
                  type="button"
                  onClick={() => gameActionsRef.current?.reelInFish()}
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer animate-bounce"
                >
                  <span>🐟 Pull / Reel In! (E)</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={fishingPhase !== 'idle'}
                  onClick={() => gameActionsRef.current?.castFishingPole()}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {fishingBaitCount > 0 ? '🎣 Cast Fishing Pole (1 🪱)' : '🪱 Get Bait to Fish'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick();
                  setShowFishingModal(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>➕ Get Bait (Quiz)</span>
              </button>
            </div>

            {/* Recent Catches Pill Strip (Fish $1-$10 & Trash $0) */}
            {catchHistory.length > 0 && (
              <div className="pt-1.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
                  Catches:
                </span>
                {catchHistory.map((item, idx) => {
                  const isTrash = item.isTrash || item.price <= 0;
                  return (
                    <span
                      key={`${item.id}-${idx}`}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 border ${
                        isTrash
                          ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                          : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span
                        className={`px-1 rounded font-black ${
                          isTrash ? 'bg-rose-500/30 text-rose-200' : 'bg-emerald-500/30 text-emerald-200'
                        }`}
                      >
                        {isTrash ? '$0' : `+$${item.price}`}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {nearFacultyEmployee && insideBuilding?.id === 'faculty_hq' && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
          <div className="bg-slate-950/95 border border-amber-400/40 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                ERA FACULTY CUBICLE WORKSTATION • {nearFacultyEmployee.departmentLabel}
              </div>
              <div className="text-base font-extrabold">
                {nearFacultyEmployee.name} — {nearFacultyEmployee.jobTitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedFacultyEmployee(nearFacultyEmployee);
                setShowFacultyModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open Workstation (E)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isSittingAtDesk && insideBuilding && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
          <div className="bg-slate-950/95 border border-emerald-400/40 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                CLASSROOM STUDENT SEAT
              </div>
              <div className="text-base font-extrabold">Seated at Classroom Desk</div>
            </div>
            <button
              type="button"
              onClick={() => gameActionsRef.current?.standUpFromDesk()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Stand Up (Space / E)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isSittingAtDesk && nearClassroomDesk && !nearFacultyEmployee && insideBuilding && (
        <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
          <div className="bg-slate-950/95 border border-amber-400/40 rounded-2xl px-5 py-3.5 text-white shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                {insideBuilding.name} • STUDENT SEAT
              </div>
              <div className="text-base font-extrabold">{nearClassroomDesk.deskName}</div>
            </div>
            <button
              type="button"
              onClick={() => gameActionsRef.current?.sitAtClassroomDesk(nearClassroomDesk)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sit Down at Desk (E)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isSittingAtDesk && !nearClassroomDesk && nearBoardPrompt && !nearFacultyEmployee && insideBuilding && (
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
          eraGems={eraGems}
          eraDollars={eraDollars}
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
          eraGems={eraGems}
          eraDollars={eraDollars}
          studentCourse={userCourse || playerProfile.cohort}
          playerAvatar={{
            ...playerProfile,
            skinTone: playerProfile.skinColor,
            topColor: playerProfile.shirtColor,
            bottomColor: playerProfile.pantsColor,
            hatStyle: playerProfile.hatType,
            beltStyle: playerProfile.beltType,
            rideStyle: 'none'
          }}
          onOpenEraShop={() => {
            soundEngine.playUiClick();
            setEraShopInitialTab('shop');
            setEraShopInitialCat('all');
            setActiveBuildingModal('reading');
          }}
          onRewardGems={(gemsWon, xpWon, dollarsWon, gameTitle) => {
            soundEngine.playGoalCheer();
            const nextGems = eraGems + gemsWon;
            const nextDollars = eraDollars + dollarsWon;
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

      {/* ============================================================================
          MODAL 8: ERA FACULTY HQ — AI EMPLOYEE WORKSTATIONS & TEACHER JAN 12-MODULE ADMIN HUB
          ============================================================================ */}
      <EraFacultyWorkstationModal
        isOpen={showFacultyModal || activeBuildingModal === 'faculty_hq'}
        onClose={() => {
          setShowFacultyModal(false);
          if (activeBuildingModal === 'faculty_hq') setActiveBuildingModal(null);
        }}
        initialEmployeeId={selectedFacultyEmployee?.id || null}
        initialDashboardModule={facultyInitialAdminModule}
        currentUserName={playerProfile.name}
        currentUserEmail={user?.email || playerProfile.email}
        isAuthorizedFaculty={isAuthorizedFaculty}
        eraGems={eraGems}
        eraDollars={eraDollars}
        onRewardCurrency={(gemsDelta, dollarsDelta, reason) => {
          soundEngine.playGoalCheer();
          const nextGems = Math.max(0, eraGems + gemsDelta);
          const nextDollars = Math.max(0, eraDollars + dollarsDelta);
          setEraGems(nextGems);
          setEraDollars(nextDollars);
          persistAvatarCustomization(playerProfile, nextGems, ownedShopItems, nextDollars);
          showToast(
            `${gemsDelta >= 0 ? `+${gemsDelta}` : gemsDelta} 💎 Gems • ${dollarsDelta >= 0 ? `+$${dollarsDelta}` : `-$${Math.abs(dollarsDelta)}`} 💵`,
            reason,
            '#D97706'
          );
        }}
        studentRoster={allStudentsSkillScores}
        firestoreFolders={firestoreFolders}
      />

      {/* ============================================================================
          MODAL 9: EAST BEACH ERA FISHING CLUB — COURSE QUESTIONS FOR BAIT & $1-$10 FISH MARKET
          ============================================================================ */}
      <EraFishingClubModal
        isOpen={showFishingModal}
        onClose={() => setShowFishingModal(false)}
        studentName={playerProfile.name}
        studentCourse={userCourse || playerProfile.cohort}
        studentCohort={playerProfile.cohort}
        baitCount={fishingBaitCount}
        onUpdateBaitCount={handleUpdateFishingBait}
        userId={user?.uid || null}
        isAdmin={isAdmin}
        eraDollars={eraDollars}
        eraGems={eraGems}
        onOpenEraShop={() => {
          soundEngine.playUiClick();
          setShowFishingModal(false);
          setEraShopInitialTab('shop');
          setEraShopInitialCat('all');
          setActiveBuildingModal('reading');
        }}
        onCastFishingPoleIn3D={() => {
          gameActionsRef.current?.castFishingPole();
        }}
        onEarnDollars={(dollarsWon, xpWon, reason) => {
          soundEngine.playGoalCheer();
          const nextDollars = eraDollars + dollarsWon;
          setEraDollars(nextDollars);
          setXp((prev) => prev + xpWon);
          persistAvatarCustomization(playerProfile, eraGems, ownedShopItems, nextDollars);
          showToast(
            `+$${dollarsWon} 💵 Era Dollars & +${xpWon} XP!`,
            reason,
            '#10B981'
          );
        }}
      />
    </div>
  );
}
export default EraVerse;
