import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useParentLang } from '../lib/parentLocale';
import { Submission, Assignment } from '../types';
import { format } from 'date-fns';
import {
  ArrowLeft,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  FileText,
  Clock,
  Calendar,
  Award,
  Play,
  ExternalLink,
  AlertCircle,
  Printer,
  Globe,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cleanTeacherFeedback, OrganizedTeacherFeedbackView } from '../components/SpeakingPerformanceReport';

const getFallbackTitle = (id: any) => {
  const strId = String(id);
  if (!/^\d+$/.test(strId)) return null;
  const numId = parseInt(strId, 10);
  if (!isNaN(numId) && numId >= 1 && numId <= 100) {
    const testNum = Math.ceil(numId / 4);
    let skill = 'Practice';
    if (numId % 4 === 1) skill = 'Reading';
    if (numId % 4 === 2) skill = 'Listening';
    if (numId % 4 === 3) skill = 'Writing';
    if (numId % 4 === 0) skill = 'Speaking';
    return `IELTS ${skill} Test ${testNum}`;
  }
  return null;
};

function getCefrFromBand(band: number | null): string | null {
  if (band === null || isNaN(band)) return null;
  if (band >= 8.5) return 'C2';
  if (band >= 7.0) return 'C1';
  if (band >= 5.5) return 'B2';
  if (band >= 4.0) return 'B1';
  return 'A2';
}

function getVideoEmbedUrl(url?: string) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean.includes('youtube.com/watch?v=')) {
    const v = new URL(clean).searchParams.get('v');
    return v ? `https://www.youtube.com/embed/${v}` : null;
  }
  if (clean.includes('youtu.be/')) {
    const match = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (clean.includes('drive.google.com')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    return clean.replace(/\/view.*$/, '/preview');
  }
  return null;
}

export function ParentTestResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const parentKey = searchParams.get('key') || '';
  const studentIdParam = searchParams.get('student') || '';

  // Parent View language selector: defaults to English ('en')
  const [lang, setLang] = useParentLang(true);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [accessDeniedCode, setAccessDeniedCode] = useState<'paused' | 'expired' | 'missing' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const subDoc = await getDoc(doc(db, 'submissions', id));
        if (!subDoc.exists()) {
          setLoading(false);
          return;
        }
        const raw = subDoc.data();
        const subData = {
          id: subDoc.id,
          ...raw,
          createdAt: raw.createdAt?.toMillis
            ? raw.createdAt.toMillis()
            : typeof raw.createdAt === 'number'
            ? raw.createdAt
            : Date.now(),
        } as Submission;

        const targetUid = studentIdParam || subData.userId;
        if (targetUid) {
          const userSnap = await getDoc(doc(db, 'users', targetUid));
          if (userSnap.exists()) {
            const uData = userSnap.data();
            setStudentProfile(uData);
            if (uData.parentAccess?.enabled === false) {
              setAccessDeniedCode('paused');
              setLoading(false);
              return;
            }
            if (
              uData.parentAccess?.token &&
              parentKey &&
              parentKey !== uData.parentAccess.token
            ) {
              setAccessDeniedCode('expired');
              setLoading(false);
              return;
            }
            if (
              uData.parentAccess?.token &&
              !parentKey &&
              location.pathname.startsWith('/parent/')
            ) {
              setAccessDeniedCode('missing');
              setLoading(false);
              return;
            }

            if (!isAdmin && typeof sessionStorage !== 'undefined') {
              const visitKey = `parent_viewed_${targetUid}`;
              if (!sessionStorage.getItem(visitKey)) {
                sessionStorage.setItem(visitKey, '1');
                setDoc(
                  doc(db, 'users', targetUid),
                  {
                    parentAccess: {
                      ...uData.parentAccess,
                      lastViewedAt: Date.now(),
                      viewCount: increment(1),
                    },
                  },
                  { merge: true }
                ).catch(() => {});
              }
            }
          }
        }

        setSubmission(subData);

        if (subData.assignmentId) {
          try {
            const assignDoc = await getDoc(doc(db, 'assignments', subData.assignmentId));
            if (assignDoc.exists()) {
              setAssignment({ id: assignDoc.id, ...assignDoc.data() } as Assignment);
            }
          } catch {
            // Optional assignment metadata
          }
        }
      } catch (err) {
        console.error('Error loading parent test result:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id, studentIdParam, parentKey, location.pathname, isAdmin]);

  const handleBackToDashboard = () => {
    const uid = studentIdParam || submission?.userId;
    if (uid) {
      const course = (studentProfile?.course || '').toLowerCase();
      let dashBase = `/parent/dashboard/${uid}`;
      if (course === 'pet') dashBase = `/parent/pet/dashboard/${uid}`;
      else if (course === 'ket') dashBase = `/parent/ket/dashboard/${uid}`;
      navigate(`${dashBase}${parentKey ? `?key=${encodeURIComponent(parentKey)}` : ''}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-[#1E4DB7] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">
          {lang === 'vi' ? 'Đang tải kết quả học tập...' : 'Loading result...'}
        </p>
      </div>
    );
  }

  if (accessDeniedCode) {
    const deniedMsg =
      accessDeniedCode === 'paused'
        ? lang === 'vi'
          ? 'Liên kết xem kết quả tạm thời đang đóng. Quý Phụ huynh vui lòng liên hệ Giáo viên phụ trách.'
          : 'Parent access is currently paused. Please contact your teacher.'
        : accessDeniedCode === 'expired'
        ? lang === 'vi'
          ? 'Mã QR hoặc liên kết này đã được đổi mới. Quý Phụ huynh vui lòng sử dụng mã QR mới nhất từ Giáo viên.'
          : 'This QR code or link has been reset. Please use the latest link from your teacher.'
        : lang === 'vi'
        ? 'Vui lòng mở đường dẫn hoặc quét mã QR chính thức từ Giáo viên để xem kết quả.'
        : 'Please use a valid Parent QR code or link from your teacher.';

    return (
      <div className="max-w-md mx-auto my-10 bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-1.5">
          {lang === 'vi' ? 'Liên kết tạm ngưng' : 'Access Unavailable'}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">{deniedMsg}</p>
      </div>
    );
  }

  if (!submission || submission.isDeleted) {
    return (
      <div className="max-w-md mx-auto my-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 mb-1.5">
          {lang === 'vi' ? 'Không tìm thấy bài làm' : 'Result Not Found'}
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          {lang === 'vi'
            ? 'Kết quả bài kiểm tra này hiện không khả dụng.'
            : 'This test result is currently unavailable.'}
        </p>
        <button
          type="button"
          onClick={handleBackToDashboard}
          className="min-h-[42px] px-5 py-2.5 bg-[#1E4DB7] text-white font-bold rounded-xl text-sm cursor-pointer"
        >
          {lang === 'vi' ? 'Quay lại Bảng tổng hợp' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  const title =
    submission.assignmentTitle ||
    getFallbackTitle(submission.assignmentId) ||
    assignment?.title ||
    'IELTS Practice Test';

  let type = (submission.assignmentType || assignment?.type || '').toLowerCase();
  if (!type || type === 'unknown') {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('reading')) type = 'reading';
    else if (lowerTitle.includes('listening')) type = 'listening';
    else if (lowerTitle.includes('writing')) type = 'writing';
    else if (lowerTitle.includes('speaking')) type = 'speaking';
  }

  const candidateName =
    studentProfile?.nickname ||
    studentProfile?.name ||
    studentProfile?.displayName ||
    (submission as any).studentName ||
    'Student';

  const isSpeakingEvaluated = Boolean(
    submission.isEvaluated === true ||
      submission.evaluatedBy === 'admin' ||
      (submission.assignmentId === 'offline_speaking' &&
        submission.bandScore !== undefined &&
        submission.bandScore !== null)
  );

  const numericBand =
    type === 'speaking' && !isSpeakingEvaluated
      ? null
      : submission.bandScore !== undefined && submission.bandScore !== null
      ? Number(submission.bandScore)
      : null;

  const displayBandScore = numericBand !== null && !isNaN(numericBand) ? numericBand.toFixed(1) : null;
  const cefrBadge = getCefrFromBand(numericBand);

  const rawCorrectCount =
    submission.score !== undefined && submission.score !== null
      ? submission.score
      : submission.percentage !== undefined && submission.percentage !== null
      ? Math.round((submission.percentage / 100) * 40)
      : null;

  const accuracyPercent =
    rawCorrectCount !== null ? Math.round((Number(rawCorrectCount) / 40) * 100) : null;

  const completedDate = submission.createdAt
    ? format(submission.createdAt, 'MMM d, yyyy')
    : 'N/A';

  const timeSpentStr = submission.timeSpent
    ? `${Math.floor(submission.timeSpent / 60)}m ${submission.timeSpent % 60}s`
    : null;

  const writingOutputs: { label: string; text: string }[] = [];
  if (type === 'writing' && submission.answers) {
    if (typeof submission.answers === 'string') {
      if (submission.answers.trim() && submission.answers !== 'Offline submission') {
        writingOutputs.push({
          label: lang === 'vi' ? 'Bài viết đã nộp' : 'Submitted Essay',
          text: submission.answers,
        });
      }
    } else if (typeof submission.answers === 'object') {
      if (submission.answers.task1) {
        writingOutputs.push({
          label: lang === 'vi' ? 'Bài viết Task 1' : 'Task 1 Response',
          text: String(submission.answers.task1),
        });
      }
      if (submission.answers.task2) {
        writingOutputs.push({
          label: lang === 'vi' ? 'Bài luận Task 2' : 'Task 2 Essay',
          text: String(submission.answers.task2),
        });
      }
    }
  }

  const writingWordCount = writingOutputs.reduce(
    (acc, item) => acc + item.text.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  const teacherSummaryComment =
    submission.teacherComment ||
    (submission as any).feedback ||
    (submission.answers as any)?.teacherComment ||
    (submission.answers as any)?.feedback ||
    '';

  const teacherSummaryVi =
    submission.vietnameseTranslation ||
    submission.teacherCommentVi ||
    (submission.answers as any)?.vietnameseTranslation ||
    (submission.answers as any)?.teacherCommentVi ||
    '';

  const embedVideoUrl = getVideoEmbedUrl(submission.audioUrl);
  const rubricScores = (submission as any).rubricScores;

  const skillMeta =
    type === 'reading'
      ? { Icon: BookOpen, color: 'text-[#1E4DB7]', label: lang === 'vi' ? 'Kỹ năng Đọc' : 'Reading' }
      : type === 'listening'
      ? { Icon: Headphones, color: 'text-emerald-700', label: lang === 'vi' ? 'Kỹ năng Nghe' : 'Listening' }
      : type === 'writing'
      ? { Icon: PenTool, color: 'text-orange-700', label: lang === 'vi' ? 'Kỹ năng Viết' : 'Writing' }
      : type === 'speaking'
      ? { Icon: Mic, color: 'text-purple-700', label: lang === 'vi' ? 'Kỹ năng Nói' : 'Speaking' }
      : { Icon: FileText, color: 'text-slate-700', label: lang === 'vi' ? 'Bài kiểm tra' : 'Assessment' };

  const SkillIcon = skillMeta.Icon;

  return (
    <div className="max-w-4xl mx-auto py-1 sm:py-4 space-y-4 sm:space-y-6 pb-16">
      {/* Compact Mobile-Optimized Top Action Bar */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <button
          type="button"
          onClick={handleBackToDashboard}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#1E4DB7] hover:border-blue-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Quay lại' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {/* Parent Language Selector: English (default) | Tiếng Việt */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('vi')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                lang === 'vi' ? 'bg-white text-[#1E4DB7] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tiếng Việt
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            title={lang === 'vi' ? 'In phiếu điểm' : 'Print Report'}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#1E4DB7] hover:border-blue-200 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'vi' ? 'In phiếu điểm' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Official Score Report Card */}
      <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-8 md:p-10 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 mb-2.5 tabular-nums">
            <span className={`inline-flex items-center gap-1.5 font-bold ${skillMeta.color}`}>
              <SkillIcon className="w-3.5 h-3.5" />
              {skillMeta.label}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {completedDate}
            </span>
            {timeSpentStr && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {timeSpentStr}
                </span>
              </>
            )}
            {cefrBadge && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-slate-700">CEFR {cefrBadge}</span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-5 sm:mb-6">
            {title}
          </h1>

          {/* Candidate Name + Score Summary (Mobile 2-col grid, Desktop flex) */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {lang === 'vi' ? 'Họ và tên Học viên' : 'Candidate Name'}
              </span>
              <div className="bg-white border border-blue-100 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-base sm:text-lg font-black text-blue-950 uppercase tracking-wide truncate">
                {candidateName}
              </div>
            </div>

            <div
              className={`grid gap-3 shrink-0 tabular-nums ${
                ((type === 'reading' || type === 'listening') && rawCorrectCount !== null) ||
                (type === 'writing' && writingWordCount > 0)
                  ? 'grid-cols-2 sm:flex'
                  : 'grid-cols-1 sm:flex'
              }`}
            >
              {(type === 'reading' || type === 'listening') && rawCorrectCount !== null && (
                <div className="text-center px-3.5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-white border border-blue-100 sm:min-w-[135px] flex flex-col justify-center">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    {lang === 'vi' ? 'Số câu đúng' : 'Final Score'}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#1E4DB7]">
                    {rawCorrectCount}
                    <span className="text-base sm:text-lg font-bold text-slate-400">/40</span>
                  </span>
                  {accuracyPercent !== null && (
                    <span className="block text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">
                      {lang === 'vi' ? `Đạt ${accuracyPercent}%` : `${accuracyPercent}% accuracy`}
                    </span>
                  )}
                </div>
              )}

              {type === 'writing' && writingWordCount > 0 && (
                <div className="text-center px-3.5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-white border border-orange-200 sm:min-w-[130px] flex flex-col justify-center">
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                    {lang === 'vi' ? 'Tổng số từ' : 'Word Count'}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-orange-600">
                    {writingWordCount}
                  </span>
                </div>
              )}

              <div className="text-center px-3.5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-emerald-50 border border-emerald-300 sm:min-w-[135px] flex flex-col justify-center">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
                  {lang === 'vi' ? 'Điểm Band' : 'Band Score'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                  {displayBandScore ?? (lang === 'vi' ? 'Chờ chấm' : 'Pending')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content by Skill */}
        <div className="p-4 sm:p-8 md:p-10 space-y-6">
          {/* Speaking Rubric Breakdown */}
          {type === 'speaking' && isSpeakingEvaluated && rubricScores && (
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                {lang === 'vi' ? 'Điểm thành phần Kỹ năng Nói' : 'Speaking Criteria Breakdown'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 tabular-nums">
                {[
                  {
                    label: lang === 'vi' ? 'Độ trôi chảy' : 'Fluency & Coherence',
                    val: rubricScores.FC ?? rubricScores.fluency,
                  },
                  {
                    label: lang === 'vi' ? 'Vốn từ vựng' : 'Lexical Resource',
                    val: rubricScores.LR ?? rubricScores.lexical,
                  },
                  {
                    label: lang === 'vi' ? 'Ngữ pháp' : 'Grammar Range',
                    val: rubricScores.GRA ?? rubricScores.grammar,
                  },
                  {
                    label: lang === 'vi' ? 'Phát âm' : 'Pronunciation',
                    val: rubricScores.PR ?? rubricScores.pronunciation,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-center"
                  >
                    <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {item.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-purple-700">
                      {item.val !== undefined && item.val !== null ? Number(item.val).toFixed(1) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speaking Video / Recording Output */}
          {type === 'speaking' && submission.audioUrl && (
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-600" />
                {lang === 'vi' ? 'Phần thi Nói của Học viên' : 'Student Speaking Recording'}
              </h2>
              {embedVideoUrl ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200">
                  <iframe
                    src={embedVideoUrl}
                    title={title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={submission.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm border border-purple-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Mở bài nói của học viên' : 'Open Student Recording'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Writing Student Output */}
          {type === 'writing' && writingOutputs.length > 0 && (
            <div className="space-y-3.5">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-orange-500" />
                {lang === 'vi' ? 'Bài viết của Học viên' : 'Student Written Response'}
              </h2>
              {writingOutputs.map((out) => (
                <div
                  key={out.label}
                  className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between tabular-nums">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                      {out.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {out.text.trim().split(/\s+/).filter(Boolean).length}{' '}
                      {lang === 'vi' ? 'từ' : 'words'}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {out.text}
                  </p>
                </div>
              ))}
              {submission.correctedFileUrl && (
                <a
                  href={submission.correctedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm border border-emerald-200 transition-colors"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>
                    {lang === 'vi'
                      ? 'Xem bài viết đã được Giáo viên chấm sửa'
                      : 'View Teacher Corrected Writing'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Teacher Feedback Summary */}
          {(teacherSummaryComment || teacherSummaryVi) ? (
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1E4DB7]" />
                {lang === 'vi' ? 'Nhận xét & Đánh giá của Giáo viên' : 'Teacher Evaluation'}
              </h2>
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                {lang === 'vi' && teacherSummaryVi ? (
                  <>
                    <div className="prose prose-slate max-w-none text-sm sm:text-base">
                      <Markdown>{teacherSummaryVi}</Markdown>
                    </div>
                    {teacherSummaryComment && (
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Nhận xét gốc (Tiếng Anh)
                        </h4>
                        {type === 'speaking' ? (
                          <OrganizedTeacherFeedbackView feedback={cleanTeacherFeedback(teacherSummaryComment)} />
                        ) : (
                          <div className="prose prose-slate max-w-none text-sm">
                            <Markdown>{teacherSummaryComment}</Markdown>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {teacherSummaryComment &&
                      (type === 'speaking' ? (
                        <OrganizedTeacherFeedbackView feedback={cleanTeacherFeedback(teacherSummaryComment)} />
                      ) : (
                        <div className="prose prose-slate max-w-none text-sm sm:text-base">
                          <Markdown>{teacherSummaryComment}</Markdown>
                        </div>
                      ))}
                    {teacherSummaryVi && (
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                          Bản dịch Tiếng Việt
                        </h4>
                        <div className="prose prose-slate max-w-none text-sm">
                          <Markdown>{teacherSummaryVi}</Markdown>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            (type === 'reading' || type === 'listening') && (
              <p className="text-xs sm:text-sm text-slate-500 text-center py-2">
                {lang === 'vi'
                  ? 'Kết quả chấm tự động theo thang điểm IELTS chuẩn.'
                  : 'Official score calculated on the standard IELTS Band scale.'}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
