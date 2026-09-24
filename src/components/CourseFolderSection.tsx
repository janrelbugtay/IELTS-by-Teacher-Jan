import React from 'react';
import { Folder, Shield, ArrowRight, Users, Layers, Sparkles } from 'lucide-react';
import { CourseFolder } from '../types';
import { CourseFolderModal } from './CourseFolderModal';

interface CourseFolderSectionProps {
  courseName: string;
  courseUsers: any[];
  allFolders: CourseFolder[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenCreateStudent: (courseName: string, folderId?: string | null, folderName?: string | null, lock?: boolean) => void;
  onOpenMoveStudent: (student: any) => void;
  onOpenBatchMoveStudents?: (students: any[]) => void;
  onGenerateCredentials: (u: any) => void;
  onOpenCreateFolder: (courseName: string, parentFolder?: CourseFolder | null) => void;
}

const COURSE_THEMES: Record<string, {
  badge: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  borderColor: string;
  hoverBorder: string;
  glow: string;
  tabBg: string;
  levelTag: string;
}> = {
  'Pre-Starter': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10 text-amber-600',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200/80',
    hoverBorder: 'hover:border-amber-400',
    glow: 'hover:shadow-amber-100',
    tabBg: 'bg-amber-500',
    levelTag: 'Early Stage'
  },
  'Starter': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-400',
    glow: 'hover:shadow-emerald-100',
    tabBg: 'bg-emerald-500',
    levelTag: 'Young Learners 1'
  },
  'Movers': {
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    gradient: 'from-sky-500 to-blue-500',
    iconBg: 'bg-sky-500/10 text-sky-600',
    iconColor: 'text-sky-500',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200/80',
    hoverBorder: 'hover:border-sky-400',
    glow: 'hover:shadow-sky-100',
    tabBg: 'bg-sky-500',
    levelTag: 'Young Learners 2'
  },
  'Flyers': {
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10 text-violet-600',
    iconColor: 'text-violet-500',
    textColor: 'text-violet-800',
    borderColor: 'border-violet-200/80',
    hoverBorder: 'hover:border-violet-400',
    glow: 'hover:shadow-violet-100',
    tabBg: 'bg-violet-500',
    levelTag: 'Young Learners 3'
  },
  'KET': {
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
    iconColor: 'text-indigo-500',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-200/80',
    hoverBorder: 'hover:border-indigo-400',
    glow: 'hover:shadow-indigo-100',
    tabBg: 'bg-indigo-600',
    levelTag: 'Cambridge A2'
  },
  'PET': {
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-500/10 text-teal-600',
    iconColor: 'text-teal-500',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200/80',
    hoverBorder: 'hover:border-teal-400',
    glow: 'hover:shadow-teal-100',
    tabBg: 'bg-teal-600',
    levelTag: 'Cambridge B1'
  },
  'IELTS': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    gradient: 'from-[#1E4DB7] to-indigo-700',
    iconBg: 'bg-blue-500/10 text-[#1E4DB7]',
    iconColor: 'text-[#1E4DB7]',
    textColor: 'text-[#1E4DB7]',
    borderColor: 'border-blue-300',
    hoverBorder: 'hover:border-blue-600',
    glow: 'hover:shadow-blue-200',
    tabBg: 'bg-[#1E4DB7]',
    levelTag: 'International English'
  }
};

export function CourseFolderSection({
  courseName,
  courseUsers,
  allFolders,
  isExpanded,
  onToggleExpand,
  onOpenCreateStudent,
  onOpenMoveStudent,
  onGenerateCredentials,
  onOpenCreateFolder
}: CourseFolderSectionProps) {
  // Count custom folders for this course (excluding deleted)
  const courseFolders = allFolders.filter((f) => f.course === courseName && !f.isDeleted);
  const isIelts = courseName === 'IELTS';

  const theme = COURSE_THEMES[courseName] || COURSE_THEMES['IELTS'];

  return (
    <>
      {/* Immersive Folder-Themed Card */}
      <div 
        onClick={onToggleExpand}
        className={`group relative flex flex-col justify-between bg-white rounded-3xl border ${theme.borderColor} ${theme.hoverBorder} shadow-sm hover:shadow-xl ${theme.glow} transition-all duration-300 -translate-y-0 hover:-translate-y-1.5 cursor-pointer overflow-hidden p-6 select-none`}
      >
        {/* Physical Folder Top Tab Ear */}
        <div className="absolute top-0 left-6 flex items-center">
          <div className={`h-2.5 w-24 rounded-b-lg ${theme.tabBg} shadow-xs`}></div>
        </div>

        {/* Ambient Top Glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${theme.gradient} opacity-[0.07] group-hover:opacity-[0.14] transition-opacity blur-2xl pointer-events-none`}></div>

        {/* Card Content Top */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4 mt-1">
            {/* Tactile Folder Icon */}
            <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300`}>
              <Folder className={`w-8 h-8 ${theme.iconColor} transition-transform group-hover:scale-110`} />
            </div>

            {/* Level Tag / IELTS Badge */}
            <div className="flex flex-col items-end gap-1">
              {isIelts ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#1E4DB7] border border-blue-200 shadow-2xs">
                  <Shield className="w-3 h-3 text-[#1E4DB7]" /> IELTS Only Zone
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                  {theme.levelTag}
                </span>
              )}
            </div>
          </div>

          {/* Course Name */}
          <div className="mb-4">
            <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight flex items-center gap-2">
              {courseName}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cambridge English Curriculum
            </p>
          </div>
        </div>

        {/* Stats & Folder Metadata Badges */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Count Pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/70 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
              <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
              <span>{courseUsers.length}</span>
              <span className="font-normal text-slate-500 text-[11px]">students</span>
            </span>

            {/* Subfolders Count Pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/70 group-hover:bg-slate-200/60 transition-colors">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{courseFolders.length}</span>
              <span className="font-normal text-slate-500 text-[11px]">folders</span>
            </span>
          </div>

          {/* Interactive Arrow Indicator */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-all pl-2 shrink-0">
            <span className="hidden sm:inline text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Pop Up Modal for this course when opened */}
      {isExpanded && (
        <CourseFolderModal
          courseName={courseName}
          courseUsers={courseUsers}
          allFolders={allFolders}
          onClose={onToggleExpand}
          onOpenCreateFolder={onOpenCreateFolder}
          onOpenCreateStudent={onOpenCreateStudent}
          onOpenMoveStudent={onOpenMoveStudent}
          onGenerateCredentials={onGenerateCredentials}
        />
      )}
    </>
  );
}
