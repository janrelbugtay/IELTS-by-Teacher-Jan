import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Play, Pause, RefreshCw, X, ArrowLeft, Sparkles, Loader2, RotateCcw, Check, AlertCircle, FileText, Edit3, Headphones, Zap, CheckCircle2, XCircle, Info, ArrowRight, BookOpen, Volume2, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { IELTS_SPEAKING_QUESTIONS, getSpeakingTestQuestions } from '../data/speakingTestData';
import { getAudioFromIndexedDB } from '../lib/indexedDB';
import { SpeakingAudioItem, stopAllSpeakingRecordings, registerActiveSpeakingRecording, unregisterActiveSpeakingRecording } from './SpeakingAudioItem';
import Markdown from 'react-markdown';

export interface PerformanceReportData {
  overallScore: number;
  scores: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
}

const rubricData = {
    FC: {
        9: ["Speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar", "Speaks coherently with fully appropriate cohesive features", "Develops topics fully and appropriately"],
        8: ["Speaks fluently with only occasional repetition or self- correction; hesitation is usually content-related and only rarely to search for language", "Develops topics coherently and appropriately"],
        7: ["Speaks at length without noticeable effort or loss of coherence", "May demonstrate language-related hesitation at times, or some repetition and/or self-correction", "Uses a range of connectives and discourse markers with some flexibility"],
        6: ["Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation", "Uses a range of connectives and discourse markers but not always appropriately"],
        5: ["Usually maintains flow of speech but uses repetition, self correction and/or slow speech to keep going", "May over-use certain connectives and discourse markers", "Produces simple speech fluently, but more complex communication causes fluency problems"],
        4: ["Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction", "Links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence"],
        3: ["Speaks with long pauses", "Has limited ability to link simple sentences", "Gives only simple responses and is frequently unable to convey basic message"],
        2: ["Pauses lengthily before most words", "Little communication possible"],
        1: ["No communication possible", "No rateable language"]
    },
    LR: {
        9: ["Uses vocabulary with full flexibility and precision in all topics", "Uses idiomatic language naturally and accurately"],
        8: ["Uses a wide vocabulary resource readily and flexibly to convey precise meaning", "Uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies", "Uses paraphrase effectively as required"],
        7: ["Uses vocabulary resource flexibly to discuss a variety of topics", "Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices", "Uses paraphrase effectively"],
        6: ["Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies", "Generally paraphrases successfully"],
        5: ["Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility", "Attempts to use paraphrase but with mixed success"],
        4: ["Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice", "Rarely attempts paraphrase"],
        3: ["Uses simple vocabulary to convey personal information", "Has insufficient vocabulary for less familiar topics"],
        2: ["Only produces isolated words or memorised utterances"],
        1: ["No communication possible", "No rateable language"]
    },
    GRA: {
        9: ["Uses a full range of structures naturally and appropriately", "Produces consistently accurate structures apart from ‘slips’"],
        8: ["Uses a wide range of structures flexibly", "Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors"],
        7: ["Uses a range of complex structures with some flexibility", "Frequently produces error-free sentences, though some grammatical mistakes persist"],
        6: ["Uses a mix of simple and complex structures, but with limited flexibility", "May make frequent mistakes with complex structures, though these rarely cause comprehension problems"],
        5: ["Produces basic sentence forms with reasonable accuracy", "Uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems"],
        4: ["Produces basic sentence forms and some correct simple sentences but subordinate structures are rare", "Errors are frequent and may lead to misunderstanding"],
        3: ["Attempts basic sentence forms but with limited success, or relies on apparently memorised utterances", "Makes numerous errors except in memorised expressions"],
        2: ["Cannot produce basic sentence forms"],
        1: ["No communication possible", "No rateable language"]
    },
    PR: {
        9: ["Uses a full range of pronunciation features with precision and subtlety", "Sustains flexible use of features throughout", "Is effortless to understand"],
        8: ["Uses a wide range of pronunciation features", "Sustains flexible use of features, with only occasional lapses", "Is easy to understand throughout; L1 accent has minimal effect on intelligibility"],
        7: ["Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8"],
        6: ["Uses a range of pronunciation features with mixed control", "Shows some effective use of features but this is not sustained", "Can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times"],
        5: ["Shows all features of band 4 and some, but not all the positive features of band 6", "Attempts to control features but lapses are frequent", "Mispronunciations are frequent and cause some difficulty for the listener"],
        4: ["Uses a limited range of pronunciation features"],
        3: ["Shows some of the features of band 2 and some, but not all, of the positive features of band 4"],
        2: ["Speech is often unintelligible"],
        1: ["No communication possible", "No rateable language"]
    }
};

const criteriaNames = {
  FC: "Fluency & Coherence",
  LR: "Lexical Resource",
  GRA: "Grammatical Range",
  PR: "Pronunciation"
};

type CriterionKey = keyof typeof criteriaNames;

// Helper to ensure feedback contains no suggestions, no scores, no "teacher fix", and no "AI"
export const cleanTeacherFeedback = (feedbackText: string): string => {
  if (!feedbackText) return '';
  return feedbackText
    // Remove "Teacher fix" or "teacher fix" -> replace with check and x
    .replace(/✅\s*\*?Teacher\s*fix:\*?/gi, '✓')
    .replace(/\*?Teacher\s*fix:\*?/gi, '✓')
    .replace(/❌\s*\*?You\s*said:\*?/gi, '✗')
    .replace(/\*?You\s*said:\*?/gi, '✗')
    // Remove (Band [Score]) from section headers
    .replace(/###\s*([^\n]+?)\s*\([Bb]and\s*[0-9.]+\)/g, '### $1')
    // Remove duplicate overall band score lines in feedback
    .replace(/(?:Overall\s+estimated\s+band|Overall\s+Band|Band\s+Score):\s*[0-9.]+/gi, '')
    // Remove suggestions or practice steps sections
    .replace(/###\s*[^\n]*(?:Steps to Practice|Practice Steps|Suggestions|Recommended Next Steps|Teacher Tip)[\s\S]*?(?=(###|$))/gi, '')
    // Remove standalone "Teacher tip:" lines if any
    .replace(/-\s*\*\*Teacher\s*tip:\*\*[\s\S]*?(?=(\n-|\n###|$))/gi, '')
    // Remove any accidental mention of AI
    .replace(/\bAI Auto-Score\b/gi, 'Teacher Checking')
    .replace(/\bAI Evaluat(?:ion|or)\b/gi, 'Teacher Checking')
    .replace(/\bAI\b/g, '')
    .trim();
};

export function OrganizedTeacherFeedbackView({ feedback }: { feedback: string }) {
  const cleanedText = cleanTeacherFeedback(feedback);
  if (!cleanedText) return null;

  // Split into sections by Markdown headings
  const rawSections = cleanedText.split(/(?=###\s+)/).map(s => s.trim()).filter(Boolean);

  if (rawSections.length <= 1 && !cleanedText.includes('###')) {
    return (
      <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900">
        <Markdown>{cleanedText}</Markdown>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rawSections.map((sec, idx) => {
        const lines = sec.split('\n');
        const headerLine = lines[0] || '';
        const title = headerLine.replace(/^###\s+/, '').trim();
        const body = lines.slice(1).join('\n').trim();

        // 1. Overall / Teacher's Note
        if (title.toLowerCase().includes("overall") || title.toLowerCase().includes("teacher's feedback") || title.toLowerCase().includes("teacher note")) {
          return (
            <div key={idx} className="bg-gradient-to-r from-violet-50/90 via-indigo-50/70 to-purple-50/60 border border-violet-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm shadow-xs font-bold">
                  👩‍🏫
                </div>
                <h4 className="font-bold text-slate-900 text-base">Teacher's Overview</h4>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-normal">
                {body.replace(/^\[|\]$/g, '')}
              </p>
            </div>
          );
        }

        // 2. Fluency & Coherence
        if (title.toLowerCase().includes("fluency") || title.toLowerCase().includes("coherence")) {
          const wentWellMatch = body.match(/(?:✅|✓|\*|-)?\s*\*\*What went well:\*\*\s*([\s\S]*?)(?=(?:❌|✗|\*|-)?\s*\*\*Things holding you back:|$)/i);
          const holdingBackMatch = body.match(/(?:❌|✗|\*|-)?\s*\*\*Things holding you back:\*\*\s*([\s\S]*?)(?=$)/i);

          const wentWell = wentWellMatch ? wentWellMatch[1].trim().replace(/^[-*•]\s*/, '') : null;
          const holdingBack = holdingBackMatch ? holdingBackMatch[1].trim().replace(/^[-*•]\s*/, '') : null;

          return (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">🗣️</span>
                <h4 className="font-bold text-slate-900 text-base">Fluency & Coherence</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* What went well (Check Icon) */}
                <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                      What went well
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {wentWell || "Good sustained flow in answers."}
                    </p>
                  </div>
                </div>

                {/* Things holding you back (X Icon) */}
                <div className="bg-rose-50/70 border border-rose-200/90 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-rose-950 text-sm mb-1 flex items-center gap-1.5">
                      Things holding you back
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {holdingBack || "Hesitation and pauses observed."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // 3. Grammar & Sentence Structure
        if (title.toLowerCase().includes("grammar") || title.toLowerCase().includes("sentence structure")) {
          const corrections: Array<{ wrong: string; correct: string }> = [];
          const bLines = body.split('\n');
          for (let i = 0; i < bLines.length; i++) {
            const line = bLines[i].trim();
            if (!line) continue;
            // Single-line format: X "..." ✓ "..." or ✗ "..." ✓ "..."
            const singleMatch = line.match(/(?:[X✗❌]|x:)\s*["“']?([^"”'✓✅\n]+?)["”']?\s*(?:[✓✅]|check:|->)\s*["“']?([^"”'\n]+)["”']?/i);
            if (singleMatch && singleMatch[1] && singleMatch[2]) {
              corrections.push({
                wrong: singleMatch[1].trim().replace(/^["“']|["”']$/g, ''),
                correct: singleMatch[2].trim().replace(/^["“']|["”']$/g, '')
              });
              continue;
            }
            // Multi-line format: ✗ "..." \n ✓ "..."
            const wrongMatch = line.match(/^[*-]?\s*(?:[X✗❌]|x:)\s*(.+)$/i);
            if (wrongMatch && wrongMatch[1] && i + 1 < bLines.length) {
              const nextLine = bLines[i + 1].trim();
              const correctMatch = nextLine.match(/^[*-]?\s*(?:[✓✅]|check:|->)\s*(.+)$/i);
              if (correctMatch && correctMatch[1]) {
                corrections.push({
                  wrong: wrongMatch[1].trim().replace(/^["“']|["”']$/g, ''),
                  correct: correctMatch[1].trim().replace(/^["“']|["”']$/g, '')
                });
                i++;
              }
            }
          }

          const focusMatch = body.match(/\*\*Grammar focus:\*\*\s*([\s\S]*?)(?=$)/i);
          const grammarFocus = focusMatch ? focusMatch[1].trim() : null;

          return (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">⚖️</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Grammar & Sentence Structure</h4>
                  <p className="text-xs text-slate-500">Authentic mistakes heard in recording with natural teacher corrections</p>
                </div>
              </div>

              {corrections.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {corrections.map((item, cIdx) => (
                    <div key={cIdx} className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-slate-300 transition-colors">
                      {/* X (Student said) */}
                      <div className="flex items-start gap-3 bg-red-50/80 border border-red-200/80 rounded-lg p-2.5">
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-0.5">Spoken in audio</span>
                          <span className="text-xs sm:text-sm text-slate-800 italic font-medium">"{item.wrong}"</span>
                        </div>
                      </div>

                      {/* Check (Correct version) */}
                      <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">Correct sentence</span>
                          <span className="text-xs sm:text-sm text-emerald-950 font-semibold">"{item.correct}"</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose prose-slate max-w-none text-slate-700 text-sm">
                  <Markdown>{body}</Markdown>
                </div>
              )}

              {grammarFocus && (
                <div className="bg-violet-50/80 border border-violet-200/90 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-violet-900 block font-semibold">Key Grammar Focus:</strong>
                    <span className="text-slate-700 leading-relaxed">{grammarFocus}</span>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // 4. Vocabulary & Word Choice
        if (title.toLowerCase().includes("vocabulary") || title.toLowerCase().includes("word choice")) {
          const goodWordsMatch = body.match(/\*\*Good words you used:\*\*\s*([^\n]+)/i);
          const repeatedWordsMatch = body.match(/\*\*Words you repeated often:\*\*\s*([^\n]+)/i);
          
          const altMatches: Array<{ from: string; to: string }> = [];
          const altRegex = /Instead of\s*["“']?([^"”',]+?)["”']?,\s*(?:try\s*saying|use|try saying)\s*["“']?([^"”'\n]+)["”']?/gi;
          let am;
          while ((am = altRegex.exec(body)) !== null) {
            altMatches.push({ from: am[1].trim(), to: am[2].trim() });
          }

          return (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">📚</span>
                <h4 className="font-bold text-slate-900 text-base">Vocabulary & Word Choice</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goodWordsMatch && (
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Good words you used
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium">
                      {goodWordsMatch[1].trim()}
                    </p>
                  </div>
                )}

                {repeatedWordsMatch && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Words repeated often
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800">
                      {repeatedWordsMatch[1].trim()}
                    </p>
                  </div>
                )}
              </div>

              {altMatches.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Natural Alternatives</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {altMatches.map((alt, aIdx) => (
                      <div key={aIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="text-rose-700 font-medium line-through bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {alt.from}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {alt.to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // 5. Pronunciation
        if (title.toLowerCase().includes("pronunciation")) {
          return (
            <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="text-xl">🎙️</span>
                <h4 className="font-bold text-slate-900 text-base">Pronunciation & Rhythm</h4>
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed">
                <Markdown>{body}</Markdown>
              </div>
            </div>
          );
        }

        // Default section fallback
        return (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-slate-900 text-base pb-2 border-b border-slate-100">{title}</h4>
            <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed">
              <Markdown>{body}</Markdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const SpeakingPerformanceReport = ({ testId, onNext, audioUrl, submissionId, submissionData }: { testId?: string, onNext?: () => void, audioUrl?: string, submissionId?: string, submissionData?: any }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [selectedScores, setSelectedScores] = useState<Record<CriterionKey, number | null>>({
    FC: null,
    LR: null,
    GRA: null,
    PR: null
  });
  const [savedScores, setSavedScores] = useState<Record<CriterionKey, number | null>>({
    FC: null,
    LR: null,
    GRA: null,
    PR: null
  });

  const [activeCriterion, setActiveCriterion] = useState<CriterionKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Teacher Checking & Draft State
  const [isAutoScoring, setIsAutoScoring] = useState(false);
  const [autoScoreStatus, setAutoScoreStatus] = useState<string | null>(null);
  const [autoScoreStep, setAutoScoreStep] = useState<number>(0);
  const [autoScoreError, setAutoScoreError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [examinerFeedback, setExaminerFeedback] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState<string>('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [showFeedbackEditor, setShowFeedbackEditor] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const cachedRecordingsRef = useRef<Array<{ qId: string; label: string; questionText: string; audioBase64: string; mimeType: string }> | null>(null);

  useEffect(() => {
    let timer: any;
    if (isAutoScoring) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isAutoScoring]);

  useEffect(() => {
    if (submissionData) {
      if (submissionData.rubricScores) {
        const loadedScores = {
          FC: submissionData.rubricScores.FC || null,
          LR: submissionData.rubricScores.LR || null,
          GRA: submissionData.rubricScores.GRA || null,
          PR: submissionData.rubricScores.PR || null
        };
        setSelectedScores(loadedScores);
        setSavedScores(loadedScores);
      }
      const rawFb = submissionData.feedback || submissionData.teacherComment || submissionData.aiFeedback || '';
      const loadedFb = cleanTeacherFeedback(rawFb);
      setExaminerFeedback(loadedFb);
      setSavedFeedback(loadedFb);
      // User requested: do not add suggestions in teachers and feedback
      setImprovements([]);
    }
  }, [submissionData]);

  useEffect(() => {
    const scores = Object.values(selectedScores);
    if (scores.includes(null)) {
      setOverallScore(null);
      return;
    }

    const sum = scores.reduce((a, b) => (a || 0) + (b || 0), 0);
    const average = sum / 4;
    const roundedScore = Math.round(average * 2) / 2;
    setOverallScore(roundedScore);
  }, [selectedScores]);

  const formattedId = testId ? (testId.toLowerCase().includes('test') || testId.toLowerCase().includes('practice') || testId.toLowerCase().includes('homework') ? testId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/Ielts/i, 'IELTS') : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/Ielts/i, 'IELTS')) : 'IELTS Speaking Test 1';

  // Accurate questions resolution prioritizing saved submission questions, homework, and all test numbers
  const initialResolvedQuestions = getSpeakingTestQuestions(submissionData?.assignmentTitle || testId || submissionData?.assignmentId, submissionData);
  const [activeQuestions, setActiveQuestions] = useState(initialResolvedQuestions);

  useEffect(() => {
    const q = getSpeakingTestQuestions(submissionData?.assignmentTitle || testId || submissionData?.assignmentId, submissionData);
    setActiveQuestions(q);

    // If no custom questions saved directly in submission, check Firestore speaking_tests
    if (!submissionData?.questions) {
      const match = formattedId.match(/(?:test|speaking)\s*(\d+)/i) || formattedId.match(/\b(\d+)\b/);
      let numToFetch = match ? match[1] : (testId || '1');
      const numVal = parseInt(numToFetch, 10);
      if (!isNaN(numVal) && numVal % 4 === 0 && numVal >= 4 && numVal <= 48) {
        numToFetch = (numVal / 4).toString();
      }
      getDoc(doc(db, 'speaking_tests', numToFetch)).then(snap => {
        if (snap.exists() && snap.data().questions) {
          setActiveQuestions(snap.data().questions);
        }
      }).catch(() => {});
    }
  }, [testId, submissionData, formattedId]);

  const testQuestions = activeQuestions;

  const resetScores = () => {
    if (!isAdmin) return;
    setSelectedScores({ FC: null, LR: null, GRA: null, PR: null });
    if (isDraft) {
      setIsDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    setSelectedScores(savedScores);
    setExaminerFeedback(savedFeedback);
    setIsDraft(false);
    setAutoScoreError(null);
  };

  const getQuestionInfo = (qId: string) => {
    if (!testQuestions) return { label: `Question ${qId}`, text: '' };
    if (Array.isArray(testQuestions.part1)) {
      const q = testQuestions.part1.find((item: any) => item && (item.id === qId || String(item.id) === String(qId)));
      if (q) return { label: `Part 1 (${q.topic || 'General'})`, text: q.text || '' };
    }
    if (Array.isArray(testQuestions.part2)) {
      const q = testQuestions.part2.find((item: any) => item && (item.id === qId || qId === 'p2' || qId.includes('part2') || qId.includes('p2_') || String(item.id) === String(qId)));
      if (q) return { label: `Part 2 Cue Card (${q.topic || 'Topic'})`, text: q.cueCard || q.text || '' };
    }
    if (Array.isArray(testQuestions.part3)) {
      const q = testQuestions.part3.find((item: any) => item && (item.id === qId || String(item.id) === String(qId)));
      if (q) return { label: `Part 3 Discussion (${q.topic || 'In-depth'})`, text: q.text || '' };
    }
    if (Array.isArray(testQuestions)) {
      const q = testQuestions.find((item: any) => item && (item.id === qId || String(item.id) === String(qId)));
      if (q) return { label: `Question ${qId}`, text: q.text || q.cueCard || '' };
    }
    return { label: `Question ${qId}`, text: '' };
  };

  const resolveUrlToRecording = async (qId: string, rawUrl: string) => {
    if (!rawUrl || rawUrl === 'LOCAL_ONLY') return null;
    const { label, text: questionText } = getQuestionInfo(qId);

    // 1. Data URL (already base64)
    if (rawUrl.startsWith('data:audio/') || rawUrl.startsWith('data:application/')) {
      const mimeMatch = rawUrl.match(/^data:([^;,]+)/);
      const mimeType = mimeMatch ? mimeMatch[1].trim() : 'audio/webm';
      return { qId, label, questionText, audioBase64: rawUrl, mimeType };
    }

    // 2. Raw base64 string
    if (!rawUrl.startsWith('data:') && !rawUrl.startsWith('http') && !rawUrl.startsWith('blob:') && !rawUrl.startsWith('idb:') && !rawUrl.startsWith('/api/') && rawUrl.length > 50) {
      return { qId, label, questionText, audioBase64: `data:audio/webm;base64,${rawUrl}`, mimeType: 'audio/webm' };
    }

    // 3. Blob or remote/server URL
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/api/')) {
      const fetchCtrl = new AbortController();
      const fetchTo = setTimeout(() => fetchCtrl.abort(), 6000);
      try {
        const res = await fetch(rawUrl, { signal: fetchCtrl.signal });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 100 && blob.size < 15 * 1024 * 1024) {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            return {
              qId,
              label,
              questionText,
              audioBase64: base64,
              mimeType: blob.type ? blob.type.split(';')[0].trim() : 'audio/webm'
            };
          }
        }
      } catch (e) {
        console.warn("Could not fetch audio URL:", rawUrl, e);
      } finally {
        clearTimeout(fetchTo);
      }
    }

    // 4. IndexedDB local storage URL
    if (rawUrl.startsWith('idb:')) {
      try {
        const localId = rawUrl.split(':')[1];
        const blob = await getAudioFromIndexedDB(localId);
        if (blob && blob.size > 100) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          return {
            qId,
            label,
            questionText,
            audioBase64: base64,
            mimeType: blob.type ? blob.type.split(';')[0].trim() : 'audio/webm'
          };
        }
      } catch (e) {
        console.warn("Could not read from IndexedDB:", rawUrl, e);
      }
    }

    return null;
  };

  const handleAutoScore = async () => {
    if (!isAdmin) return;
    setIsAutoScoring(true);
    setAutoScoreError(null);
    setAutoScoreStep(1);
    setAutoScoreStatus("Scanning and selecting key student audio clips for fast evaluation...");

    let timerInterval: any = null;
    let timeoutId: any = null;

    try {
      let audioRecordings: Array<{ qId: string; label: string; questionText: string; audioBase64: string; mimeType: string }> = [];

      // Use cached recordings if already resolved in this session
      if (cachedRecordingsRef.current && cachedRecordingsRef.current.length > 0) {
        audioRecordings = [...cachedRecordingsRef.current];
      } else {
        // Collect candidate question keys
        const allCandidateKeys: string[] = [];
        const seenKeys = new Set<string>();
        const addKey = (k: string) => {
          if (k && !seenKeys.has(k) && !k.includes('_chunk_')) {
            seenKeys.add(k);
            allCandidateKeys.push(k);
          }
        };

        Object.keys(responseUrls || {}).forEach(addKey);
        if (submissionData?.answers) {
          Object.keys(submissionData.answers).forEach(addKey);
        }

        // Prioritize Part 1 and Part 2 (cue card)
        const p1Key = allCandidateKeys.find(k => k.toLowerCase().startsWith('p1') || k.toLowerCase().includes('part1'));
        const p2Key = allCandidateKeys.find(k => k.toLowerCase() === 'cuecard' || k.toLowerCase().startsWith('p2') || k.toLowerCase().includes('part2'));
        const p3Key = allCandidateKeys.find(k => k.toLowerCase().startsWith('p3') || k.toLowerCase().includes('part3'));

        // Pick 2 target keys: 1 from Part 1, 1 from Part 2 (fallback to Part 3 or any other)
        const targetKeys: string[] = [];
        if (p1Key) targetKeys.push(p1Key);
        if (p2Key) targetKeys.push(p2Key);
        else if (p3Key) targetKeys.push(p3Key);
        
        for (const k of allCandidateKeys) {
          if (targetKeys.length >= 2) break;
          if (!targetKeys.includes(k)) targetKeys.push(k);
        }

        // Helper to resolve a specific question ID
        const resolveQId = async (qId: string) => {
          // 1. From responseUrls
          if (responseUrls[qId] && responseUrls[qId] !== 'LOCAL_ONLY') {
            const rec = await resolveUrlToRecording(qId, responseUrls[qId]);
            if (rec) return rec;
          }
          // 2. From Firestore subcollection
          if (submissionId) {
            try {
              const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', qId));
              if (docSnap.exists()) {
                const dData = docSnap.data();
                let base64 = '';
                const mimeType = dData.mimeType || 'audio/webm';
                if (dData.chunks && typeof dData.chunks === 'number' && dData.chunks > 0) {
                  const chunkPromises = Array.from({ length: dData.chunks }, (_, i) =>
                    getDoc(doc(db, 'submissions', submissionId, 'recordings', `${qId}_chunk_${i}`))
                  );
                  const chunkSnaps = await Promise.all(chunkPromises);
                  base64 = chunkSnaps.map(cs => cs.exists() ? (cs.data().audioUrl || '') : '').join('');
                } else if (dData.audioUrl) {
                  base64 = dData.audioUrl;
                } else if (dData.serverUrl) {
                  const fetched = await resolveUrlToRecording(qId, dData.serverUrl);
                  if (fetched) return fetched;
                }
                if (base64 && base64.length > 50) {
                  const dataUrl = base64.startsWith('data:') ? base64 : `data:${mimeType};base64,${base64}`;
                  const { label, text: questionText } = getQuestionInfo(qId);
                  return { qId, label, questionText, audioBase64: dataUrl, mimeType };
                }
              }
            } catch (e) {}
          }
          // 3. From submissionData.answers
          if (submissionData?.answers?.[qId]) {
            const ans = submissionData.answers[qId];
            let ansUrl = typeof ans === 'object' && ans !== null ? (ans as any).audioUrl : (typeof ans === 'string' ? ans : '');
            if (ansUrl) {
              if (ansUrl.startsWith('subcollection:') && submissionId) {
                const subId = ansUrl.split(':')[1];
                try {
                  const sDoc = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
                  if (sDoc.exists()) {
                    const sData = sDoc.data();
                    if (sData.chunks && typeof sData.chunks === 'number' && sData.chunks > 0) {
                      const cPromises = Array.from({ length: sData.chunks }, (_, i) =>
                        getDoc(doc(db, 'submissions', submissionId, 'recordings', `${subId}_chunk_${i}`))
                      );
                      const cSnaps = await Promise.all(cPromises);
                      ansUrl = cSnaps.map(cs => cs.exists() ? (cs.data().audioUrl || '') : '').join('');
                    } else if (sData.audioUrl) {
                      ansUrl = sData.audioUrl;
                    }
                  }
                } catch (e) {}
              }
              const rec = await resolveUrlToRecording(qId, ansUrl);
              if (rec) return rec;
            }
          }
          return null;
        };

        // Resolve target keys in parallel
        const targetPromises = targetKeys.map(k => resolveQId(k));
        const resolvedList = await Promise.all(targetPromises);
        for (const item of resolvedList) {
          if (item) audioRecordings.push(item);
        }

        // If targetKeys didn't find any audio, check all other candidates (fallback)
        if (audioRecordings.length === 0 && allCandidateKeys.length > targetKeys.length) {
          const remainingKeys = allCandidateKeys.filter(k => !targetKeys.includes(k)).slice(0, 4);
          const remainingResults = await Promise.all(remainingKeys.map(k => resolveQId(k)));
          for (const item of remainingResults) {
            if (item && audioRecordings.length < 2) audioRecordings.push(item);
          }
        }

        // Global audioUrl fallback
        if (audioRecordings.length === 0 && submissionData?.audioUrl) {
          const rec = await resolveUrlToRecording('global', submissionData.audioUrl);
          if (rec) {
            audioRecordings.push(rec);
          }
        }

        // Cache collected recordings for instant re-evaluations
        if (audioRecordings.length > 0) {
          cachedRecordingsRef.current = audioRecordings;
        }
      }

      // If zero recordings found, warn clearly and do not make up a fake score
      if (audioRecordings.length === 0) {
        setAutoScoreError(
          "No student audio recordings found for this test. Recordings were either not uploaded or are stored only on the candidate's browser. Please attach an audio recording below to run Teacher Checking, or enter scores manually."
        );
        setAutoScoreStatus(null);
        setAutoScoreStep(0);
        setIsAutoScoring(false);
        return;
      }

      // Step 2: Optimizing & balancing payload (Fast Clip Mode: 2 key clips)
      setAutoScoreStep(2);
      setAutoScoreStatus(`Selected ${audioRecordings.length} key audio clip(s) for rapid evaluation...`);

      const payloadRecordings = audioRecordings.slice(0, 2);

      // Step 3: Teacher Checking audio analysis with live elapsed counter
      setAutoScoreStep(3);
      const evalStartTime = Date.now();
      setAutoScoreStatus(`Teacher Checking: evaluating ${payloadRecordings.length} key audio clip(s)... (1s)`);

      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - evalStartTime) / 1000);
        setAutoScoreStatus(`Teacher Checking: evaluating ${payloadRecordings.length} key audio clip(s)... (${elapsed}s)`);
      }, 1000);

      const payload = {
        submissionId: submissionId || undefined,
        testTitle: formattedId,
        questions: testQuestions,
        audioRecordings: payloadRecordings
      };

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 90000);

      let res: Response;
      try {
        res = await fetch("/api/evaluate-speaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') {
          throw new Error("Evaluation timed out. Please check your internet connection and try again.");
        }
        throw fetchErr;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (timerInterval) clearInterval(timerInterval);
      }

      const contentType = res.headers.get("content-type") || "";
      let data: any;

      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => "");
        if (text.includes("warmup") || text.includes("<!doctype") || text.includes("<html")) {
          throw new Error("The evaluation server is currently warming up or experienced a temporary gateway timeout. Please try again in a few moments.");
        }
        throw new Error(`The evaluation service returned an unexpected response format (${res.status || 'unknown'}). Please retry.`);
      }

      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Unable to parse server evaluation response as JSON. Please retry.");
      }

      if (!res.ok || data.error) {
        throw new Error(data?.error || `Teacher Checking failed with HTTP ${res.status}`);
      }

      // Step 4: Formatting Teacher Report
      setAutoScoreStep(4);
      setAutoScoreStatus("Teacher evaluation & draft scores ready!");

      if (data.scores) {
        setSelectedScores({
          FC: typeof data.scores.FC === 'number' ? data.scores.FC : null,
          LR: typeof data.scores.LR === 'number' ? data.scores.LR : null,
          GRA: typeof data.scores.GRA === 'number' ? data.scores.GRA : null,
          PR: typeof data.scores.PR === 'number' ? data.scores.PR : null
        });
      }

      if (typeof data.overallBand === 'number') {
        setOverallScore(data.overallBand);
      }

      if (data.feedback) {
        const cleaned = cleanTeacherFeedback(data.feedback);
        setExaminerFeedback(cleaned);
        setShowFeedbackEditor(false); // Display rendered teacher preview
      }

      // No suggestions as requested
      setImprovements([]);

      setIsDraft(true);
      setTimeout(() => {
        setAutoScoreStatus(null);
        setAutoScoreStep(0);
      }, 1600);
    } catch (err: any) {
      console.error("Teacher Checking error:", err);
      setAutoScoreError(err.message || "Failed to complete Teacher Checking for speaking test");
      setAutoScoreStatus(null);
      setAutoScoreStep(0);
    } finally {
      setIsAutoScoring(false);
    }
  };

  const openModal = (key: CriterionKey) => {
    if (!isAdmin) return;
    setActiveCriterion(key);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setActiveCriterion(null), 300);
  };

  const selectScore = (band: number) => {
    if (!isAdmin) return;
    if (activeCriterion) {
      setSelectedScores(prev => ({ ...prev, [activeCriterion]: band }));
      closeModal();
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    if (overallScore === null) {
      alert("Please evaluate all 4 criteria before publishing.");
      return;
    }
    setIsSaving(true);
    try {
      if (submissionId) {
        const cleanedFinalFeedback = cleanTeacherFeedback(examinerFeedback);
        await updateDoc(doc(db, 'submissions', submissionId), {
          rubricScores: selectedScores,
          bandScore: overallScore,
          feedback: cleanedFinalFeedback,
          teacherComment: cleanedFinalFeedback,
          aiFeedback: cleanedFinalFeedback,
          improvements: [],
          isEvaluated: true,
          evaluatedBy: 'admin',
          evaluatedAt: new Date(),
          updatedAt: new Date()
        });
        setSavedScores(selectedScores);
        setSavedFeedback(cleanedFinalFeedback);
        setExaminerFeedback(cleanedFinalFeedback);
        setIsDraft(false);
        alert("Evaluation saved and published to student dashboard!");
      } else {
        alert("No submission ID to save to.");
      }
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert("Failed to save evaluation.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const [responseUrls, setResponseUrls] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handlePauseAll = () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      setPlayingId(null);
    };
    window.addEventListener('speaking-audio-pause-all', handlePauseAll);
    return () => {
      window.removeEventListener('speaking-audio-pause-all', handlePauseAll);
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const resolveUrls = async () => {
      if (submissionData && submissionData.answers && Object.keys(submissionData.answers).length > 0) {
        const entries = Object.entries(submissionData.answers);
        const resolvedPairs = await Promise.all(
          entries.map(async ([id, data]) => {
            let url = '';
            if (data && typeof data === 'object' && (data as any).audioUrl) {
              url = (data as any).audioUrl;
            } else if (typeof data === 'string') {
              url = data as string;
            }

            if (url.startsWith('idb:')) {
              const localId = url.split(':')[1];
              let foundBlob = false;
              try {
                const blob = await getAudioFromIndexedDB(localId);
                if (blob) {
                  url = URL.createObjectURL(blob);
                  foundBlob = true;

                  // Auto-sync local blob to backend server & update submission
                  if (submissionId) {
                    try {
                      const formData = new FormData();
                      formData.append("audio", blob, `${submissionId}_${id}.webm`);
                      formData.append("submissionId", submissionId);
                      formData.append("qId", id);
                      fetch("/api/speaking/upload", { method: "POST", body: formData }).then(async (res) => {
                        if (res.ok) {
                          const json = await res.json();
                          if (json.url) {
                            updateDoc(doc(db, 'submissions', submissionId), {
                              [`answers.${id}.audioUrl`]: json.url
                            }).catch(console.warn);
                          }
                        }
                      }).catch(console.warn);
                    } catch (syncErr) {
                      console.warn("Background audio sync failed:", syncErr);
                    }
                  }
                }
              } catch(e) {
                console.error(e);
              }

              if (!foundBlob && submissionId) {
                let foundOnServer = false;
                try {
                  const checkRes = await fetch(`/api/speaking/check/${submissionId}_${id}.webm`);
                  if (checkRes.ok) {
                    const checkJson = await checkRes.json();
                    if (checkJson.exists) {
                      url = `/api/speaking/audio/${submissionId}_${id}.webm`;
                      foundOnServer = true;
                    }
                  }
                } catch (cErr) {}

                if (!foundOnServer) {
                  try {
                    const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', id));
                    if (docSnap.exists()) {
                      const dData = docSnap.data();
                      if (dData.serverUrl) {
                        url = dData.serverUrl;
                        foundOnServer = true;
                      } else if (dData.audioUrl) {
                        url = dData.audioUrl;
                        foundOnServer = true;
                      }
                    }
                  } catch (scErr) {}
                }
                if (!foundOnServer) {
                  url = '';
                }
              }
            } else if (url.startsWith('subcollection:') && submissionId) {
              const subId = url.split(':')[1];
              try {
                const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
                if (docSnap.exists()) {
                  const data = docSnap.data();
                  if (data.chunks && typeof data.chunks === 'number' && data.chunks > 0) {
                    const chunkPromises = Array.from({ length: data.chunks }, (_, i) =>
                      getDoc(doc(db, 'submissions', submissionId, 'recordings', `${subId}_chunk_${i}`))
                    );
                    const chunkSnaps = await Promise.all(chunkPromises);
                    url = chunkSnaps.map(cs => cs.exists() ? (cs.data().audioUrl || '') : '').join('');
                  } else {
                    url = data.audioUrl || '';
                  }
                }
              } catch(e) {
                console.error(e);
              }
            }

            const finalUrl = (url && !url.startsWith('idb:')) ? url : 'LOCAL_ONLY';
            return [id, finalUrl] as [string, string];
          })
        );

        if (!isCancelled) {
          const urls: Record<string, string> = {};
          for (const [id, finalUrl] of resolvedPairs) {
            urls[id] = finalUrl;
          }
          setResponseUrls(urls);
        }
      }
    };
    resolveUrls();
    return () => { isCancelled = true; };
  }, [submissionData, submissionId]);

  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return (audioUrl && audioUrl.startsWith('idb:')) ? 'LOCAL_ONLY' : (audioUrl || null);
  };

  const togglePlayAudio = (qId: string) => {
    let url = getAudioUrl(qId);
    if (!url) {
      alert("No recording available for this test.");
      return;
    }

    if (playingId === qId) {
      try {
        audioRef.current?.pause();
      } catch (e) {}
      setPlayingId(null);
      unregisterActiveSpeakingRecording(qId);
    } else {
      stopAllSpeakingRecordings(qId);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      let isCancelled = false;
      registerActiveSpeakingRecording(qId, audio, () => {
        isCancelled = true;
        try {
          audio.pause();
        } catch (e) {}
        setPlayingId(null);
      });

      audio.play().then(() => {
        if (isCancelled || audio.paused) {
          try {
            audio.pause();
          } catch (e) {}
          setPlayingId(null);
          unregisterActiveSpeakingRecording(qId);
          return;
        }
        setPlayingId(qId);
      }).catch(e => {
        console.warn("Playback failed", e);
        setPlayingId(null);
        unregisterActiveSpeakingRecording(qId);
        alert("Could not play the recording in this browser. The audio format may not be supported or it might be blocked.");
      });
      audio.onended = () => {
        setPlayingId(null);
        unregisterActiveSpeakingRecording(qId);
      };
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden overflow-y-auto w-full">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(0, 0, 0, 0.4); }
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
        .glass-card { background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 1); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        .glass-card:hover { background: rgba(255, 255, 255, 0.9); border-color: rgba(139, 92, 246, 0.4); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.15); }
        .score-circle { background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%); }
        .gradient-text { background: linear-gradient(to right, #7c3aed, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-[128px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply blur-[128px] opacity-40 pointer-events-none" />

      {/* Navigation & Admin Action Toolbar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-6 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white transition-colors font-medium px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 shadow-sm text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isDraft && (
              <button
                onClick={handleDiscardDraft}
                disabled={isSaving || isAutoScoring}
                className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 bg-white/90 hover:bg-red-50 transition-colors font-medium px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 text-sm shadow-sm"
                title="Discard the current draft and revert to original evaluation"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Discard Draft</span>
              </button>
            )}

            <button 
              onClick={handleAutoScore} 
              disabled={isAutoScoring || isSaving}
              className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all font-medium px-5 py-2 rounded-full shadow-md disabled:opacity-50 text-sm border border-purple-400/30 cursor-pointer"
              title="Evaluate speaking audio recordings with Teacher Checking (saved as draft until published)"
            >
              {isAutoScoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Teacher Checking... {elapsedSeconds > 0 ? `(${elapsedSeconds}s)` : ''}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>Teacher Checking</span>
                </>
              )}
            </button>

            <button 
              onClick={handleSave} 
              disabled={isSaving || isAutoScoring}
              className="flex items-center gap-2 text-white hover:bg-emerald-700 bg-emerald-600 transition-colors font-medium px-5 py-2 rounded-full backdrop-blur-sm border border-emerald-500 shadow-sm disabled:opacity-50 text-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isDraft ? 'Save & Publish Evaluation' : 'Save Evaluation'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl w-full glass-panel rounded-3xl overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="relative py-10 px-8 text-center overflow-hidden border-b border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-indigo-100/50 z-0" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              {formattedId.startsWith('IELTS Speaking') ? (
                <>IELTS Speaking <span className="gradient-text">{formattedId.replace('IELTS Speaking ', '')}</span></>
              ) : (
                <span className="gradient-text">{formattedId}</span>
              )}
            </h1>
            <p className="text-slate-600 md:text-lg max-w-2xl mx-auto font-light">
              Official IELTS Band Descriptors (FC, LR, GRA, PR) evaluation report.
            </p>
          </div>
        </div>

        {/* Teacher Checking Draft Alert Banner */}
        {isDraft && (
          <div className="mx-6 md:mx-10 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  Teacher Checking Draft Generated
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Unpublished Draft</span>
                </h4>
                <p className="text-amber-800 text-xs mt-0.5">
                  The band scores and teacher feedback below are kept in draft mode. The student dashboard score will <strong>not</strong> update until you click <strong>"Save & Publish Evaluation"</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handleDiscardDraft}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Publish Now
              </button>
            </div>
          </div>
        )}

        {/* Active Multi-Step Teacher Checking Pipeline Tracker */}
        {isAutoScoring && (
          <div className="mx-6 md:mx-10 mt-6 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white border border-purple-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Teacher Checking Pipeline
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Step {autoScoreStep || 1} of 4
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{autoScoreStatus}</p>
                </div>
              </div>
              <div className="text-xs font-semibold text-purple-700 flex items-center gap-1.5 self-start sm:self-center bg-purple-100/90 px-3 py-1 rounded-full shadow-2xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Checking {elapsedSeconds > 0 ? `(${elapsedSeconds}s)` : 'active'}</span>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-medium">
              <div className={`p-3 rounded-xl border transition-all ${autoScoreStep >= 1 ? (autoScoreStep > 1 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-purple-100/80 border-purple-300 text-purple-900 shadow-xs') : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {autoScoreStep > 1 ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Loader2 className={`w-4 h-4 shrink-0 ${autoScoreStep === 1 ? 'animate-spin text-purple-600' : 'opacity-40'}`} />}
                  <span className="truncate">1. Collect Audio</span>
                </div>
                <p className="text-[11px] mt-1 text-slate-500 font-normal">Parallel cloud fetch</p>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${autoScoreStep >= 2 ? (autoScoreStep > 2 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-purple-100/80 border-purple-300 text-purple-900 shadow-xs') : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {autoScoreStep > 2 ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Loader2 className={`w-4 h-4 shrink-0 ${autoScoreStep === 2 ? 'animate-spin text-purple-600' : 'opacity-40'}`} />}
                  <span className="truncate">2. Key Clips</span>
                </div>
                <p className="text-[11px] mt-1 text-slate-500 font-normal">Part 1 & Part 2</p>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${autoScoreStep >= 3 ? (autoScoreStep > 3 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-purple-100/80 border-purple-300 text-purple-900 shadow-xs') : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {autoScoreStep > 3 ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Loader2 className={`w-4 h-4 shrink-0 ${autoScoreStep === 3 ? 'animate-spin text-purple-600' : 'opacity-40'}`} />}
                  <span className="truncate">3. Teacher Checking {autoScoreStep === 3 && elapsedSeconds > 0 ? `(${elapsedSeconds}s)` : ''}</span>
                </div>
                <p className="text-[11px] mt-1 text-slate-500 font-normal">Audio evaluation (~5s)</p>
              </div>

              <div className={`p-3 rounded-xl border transition-all ${autoScoreStep >= 4 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {autoScoreStep >= 4 ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Loader2 className="w-4 h-4 shrink-0 opacity-40" />}
                  <span className="truncate">4. Teacher Report</span>
                </div>
                <p className="text-[11px] mt-1 text-slate-500 font-normal">Detailed comments</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {autoScoreError && (
          <div className="mx-6 md:mx-10 mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-sm font-medium">{autoScoreError}</span>
            </div>
            <button
              onClick={() => setAutoScoreError(null)}
              className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="p-6 md:p-10">
          {/* Overall Score Section */}
          <div className="mb-12 pb-10 border-b border-slate-200 flex flex-col items-center relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] rounded-full flex items-center gap-1.5">
              <span>Overall Band</span>
              {isDraft && <span className="text-amber-600 font-bold">(Draft)</span>}
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full glass-card score-circle mb-8 group bg-white shadow-lg fade-in">
              <div className={`absolute inset-2 rounded-full border-2 transition-colors ${isDraft ? 'border-amber-300' : 'border-violet-100 group-hover:border-violet-300'}`} />
              <span className={`text-7xl font-bold tracking-tighter drop-shadow-sm ${overallScore !== null ? (isDraft ? 'text-amber-600' : 'gradient-text') : 'text-slate-300'}`}>
                {overallScore !== null ? overallScore.toFixed(1).replace('.0', '') : '-'}
              </span>
            </div>
            
            <button 
              onClick={resetScores} 
              className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl text-slate-600 hover:text-red-500 transition-all font-medium shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" />
              Reset Evaluation
            </button>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 pb-10 border-b border-slate-200">
            {(Object.entries(criteriaNames) as [CriterionKey, string][]).map(([key, name]) => {
              const score = selectedScores[key];
              const hasScore = score !== null;
              return (
                <div 
                  key={key}
                  className={`group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${hasScore ? (isDraft ? 'border-amber-300 bg-amber-50/40' : 'border-violet-300 bg-violet-50/50') : 'glass-card'}`}
                >
                  {hasScore && <div className={`absolute inset-0 opacity-50 ${isDraft ? 'bg-gradient-to-br from-amber-100/40 to-transparent' : 'bg-gradient-to-br from-violet-100/50 to-transparent'}`} />}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{name}</h3>
                        {isDraft && hasScore && (
                          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Teacher Draft
                          </span>
                        )}
                      </div>
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg border transition-all ${hasScore ? (isDraft ? 'text-amber-700 border-amber-300 bg-amber-100 shadow-sm' : 'text-violet-700 border-violet-300 bg-violet-100 shadow-sm') : 'text-slate-400 border-slate-200 bg-white/50'}`}>
                        {hasScore ? score : '-'}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <p className={`text-sm font-medium ${hasScore ? (isDraft ? 'text-amber-700' : 'text-violet-600') : 'text-slate-500'}`}>
                        {hasScore ? `Band ${score} Selected` : 'Pending Assessment'}
                      </p>
                      <button 
                        onClick={() => openModal(key)} 
                        className={`px-4 py-2 bg-white hover:bg-violet-600 border hover:border-violet-500 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer ${hasScore ? 'border-slate-200 text-violet-600 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-white'}`}
                      >
                        {hasScore ? 'Update' : 'Evaluate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Teacher Feedback Section */}
          <div className="mb-12 pb-10 border-b border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-100 rounded-xl text-violet-700">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Teacher's Feedback
                    {isDraft && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                        Teacher Draft
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Constructive teacher-written evaluation with speech observations and grammar corrections.
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackEditor(!showFeedbackEditor)}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {showFeedbackEditor ? 'Preview Teacher Note' : 'Edit Note'}
                  </button>
                </div>
              )}
            </div>

            {isAdmin && showFeedbackEditor ? (
              <div className="space-y-3">
                <textarea
                  value={examinerFeedback}
                  onChange={(e) => {
                    setExaminerFeedback(e.target.value);
                    if (!isDraft) setIsDraft(true);
                  }}
                  placeholder="Enter teacher feedback, pronunciation notes, and grammar corrections for the student... (Markdown supported)"
                  rows={12}
                  className="w-full p-4 rounded-xl border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-mono text-sm text-slate-800 bg-white custom-scrollbar resize-y outline-none transition-all leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Markdown formatting supported (headings, bold, lists, quotes, etc.)</span>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackEditor(false)}
                    className="text-violet-600 hover:underline font-medium"
                  >
                    View Formatted Teacher Note →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                {examinerFeedback ? (
                  <OrganizedTeacherFeedbackView feedback={examinerFeedback} />
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {isAdmin ? (
                      <div>
                        <p className="mb-2 italic">No feedback entered yet.</p>
                        <p className="text-xs text-slate-500">
                          Click <strong className="text-violet-600">"Teacher Checking"</strong> in the top toolbar to evaluate recordings, or click <strong className="text-violet-600">"Edit Note"</strong> to write custom teacher feedback.
                        </p>
                      </div>
                    ) : (
                      <p className="italic">No examiner feedback published yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          
          {audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be') || audioUrl.includes('http')) && !audioUrl.startsWith('blob:') && (
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">External Audio/Video Link</h3>
              {(() => {
                  let embedUrl = audioUrl;
                  if (audioUrl.includes('drive.google.com') && !audioUrl.includes('preview')) {
                      let match = audioUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                      if (!match) match = audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                          embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                      }
                  } else if (audioUrl.includes('youtube.com/watch')) {
                      const urlParams = new URL(audioUrl).searchParams;
                      if (urlParams.has('v')) {
                          embedUrl = `https://www.youtube.com/embed/${urlParams.get('v')}`;
                      }
                  } else if (audioUrl.includes('youtu.be/')) {
                      const match = audioUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                          embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                      }
                  }
                  
                  if (embedUrl !== audioUrl || audioUrl.includes('drive.google.com') || audioUrl.includes('youtube')) {
                      return (
                          <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                          </div>
                      );
                  }
                  
                  return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                           <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>
                              Open External Submission Link
                           </a>
                      </div>
                  );
              })()}
            </div>
          )}
          
          {/* Your Recordings / Uploading */}
          <div className="mt-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] rounded-full">
              {submissionData?.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your performance...
                </span>
              ) : (
                'Your Recordings'
              )}
            </div>
            
            <div className="space-y-8 pt-6">
              {/* Part 1 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-sm">Part 1</span>
                  Introduction & Interview
                </h3>
                <div className="space-y-4">
                  {testQuestions.part1.map((q, idx) => {
                    const isNewTopic = idx === 0 || testQuestions.part1[idx - 1].topic !== q.topic;
                    return (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {isNewTopic && q.topic && (
                          <p className="text-violet-600 font-semibold mb-3 text-sm">Let's talk about {q.topic.toLowerCase()}</p>
                        )}
                        <p className="text-slate-700 font-medium mb-3">{idx + 1}. {q.text}</p>
                        
                        <SpeakingAudioItem
                          qId={q.id}
                          submissionId={submissionId}
                          audioUrl={getAudioUrl(q.id)}
                          defaultDurationStr="0:30"
                          isAdmin={isAdmin}
                          onAudioUpdated={(updatedQId, newUrl) => {
                            setResponseUrls(prev => ({ ...prev, [updatedQId]: newUrl }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">Part 2</span>
                  Long Turn
                </h3>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="mb-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-slate-700 text-sm italic">
                    {testQuestions.part2.topic}<br/>
                    You should say:<br/>
                    {testQuestions.part2.bulletPoints.map((bp, i) => (
                      <React.Fragment key={i}>
                        {i < testQuestions.part2.bulletPoints.length - 1 ? `• ${bp}` : bp}<br/>
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <SpeakingAudioItem
                    qId={testQuestions.part2.id}
                    submissionId={submissionId}
                    audioUrl={getAudioUrl(testQuestions.part2.id)}
                    defaultDurationStr="2:00"
                    isAdmin={isAdmin}
                    onAudioUpdated={(updatedQId, newUrl) => {
                      setResponseUrls(prev => ({ ...prev, [updatedQId]: newUrl }));
                    }}
                  />
                </div>
              </div>

              {/* Part 3 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-lg text-sm">Part 3</span>
                  Discussion
                </h3>
                <div className="space-y-4">
                  {testQuestions.part3.map((q, idx) => {
                    const isNewTopic = idx === 0 || testQuestions.part3[idx - 1].topic !== q.topic;
                    return (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {isNewTopic && q.topic && (
                          <p className="text-fuchsia-600 font-semibold mb-3 text-sm">Let's discuss {q.topic.toLowerCase()}</p>
                        )}
                        <p className="text-slate-700 font-medium mb-3">{idx + 1}. {q.text}</p>
                        
                        <SpeakingAudioItem
                          qId={q.id}
                          submissionId={submissionId}
                          audioUrl={getAudioUrl(q.id)}
                          defaultDurationStr="1:00"
                          isAdmin={isAdmin}
                          onAudioUpdated={(updatedQId, newUrl) => {
                            setResponseUrls(prev => ({ ...prev, [updatedQId]: newUrl }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && activeCriterion && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm p-4 sm:p-6 transition-all duration-300"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden m-auto z-50 transform scale-100 transition-all duration-300 border border-slate-100 fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide">
                  {criteriaNames[activeCriterion]}
                </h3>
              </div>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4 bg-white">
              {([9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map(band => {
                const descriptors = rubricData[activeCriterion][band];
                const isSelected = selectedScores[activeCriterion] === band;
                
                return (
                  <div 
                    key={band}
                    onClick={() => selectScore(band)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected ? 'border-violet-400 bg-violet-50 shadow-md transform scale-[1.02]' : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
                  >
                    {isSelected && <div className="absolute right-0 top-0 w-32 h-32 bg-violet-100 rounded-bl-full pointer-events-none" />}
                    
                    <div className={`flex items-center justify-between mb-2 relative z-10 border-b pb-2 ${isSelected ? 'border-violet-200' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                          {band}
                        </div>
                        <h4 className={`font-bold text-lg md:text-xl ${isSelected ? 'text-violet-900' : 'text-slate-800'}`}>
                          Band {band}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="bg-violet-100 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                          Selected
                        </span>
                      )}
                    </div>
                    
                    <ul className="mt-3 space-y-2 relative z-10">
                      {descriptors.map((desc, i) => (
                        <li key={i} className={`flex items-start text-sm md:text-base transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          <span className="mr-3 text-violet-500 flex-shrink-0 mt-1">✦</span> 
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
