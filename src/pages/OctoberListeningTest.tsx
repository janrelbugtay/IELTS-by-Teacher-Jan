import { useTheme } from '../contexts/ThemeContext';
import React,
 { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, ArrowLeft, Info, Menu } from 'lucide-react';
import { CustomAudioPlayer } from '../components/CustomAudioPlayer';

const CustomStyles = () => (
  <style>{`
    ::highlight(test-highlight) { background-color: yellow; color: black; }

    .ielts-input {
        width: 120px;
        height: 24px;
        border: 1px solid #7a7a7a;
        text-align: center;
        font-size: 14px;
        outline: none;
        transition: all 0.2s;
        border-radius: 2px;
        padding-bottom: 1px;
        margin: 0 4px;
    }
    .w-12 {
        width: 40px;
    }
    .ielts-input:focus {
        border-color: #6eb0de;
        box-shadow: 0 0 3px #6eb0de;
    }
    .ielts-input.active-state {
        background-color: #e5f0fb;
        border-color: #6eb0de;
        color: #0b70b9;
        font-weight: bold;
    }
    .mcq-label {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        cursor: pointer;
        padding: 16px;
        border-radius: 8px;
        border: 2px solid #e5e7eb;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .mcq-label:hover {
        background-color: #f9fafb;
        border-color: #93c5fd;
    }
    .mcq-label.selected {
        background-color: #eff6ff;
        border-color: #3b82f6;
        color: #1e3a8a;
    }
    .mcq-radio {
        margin-top: 5px;
        margin-right: 16px;
        cursor: pointer;
        width: 18px;
        height: 18px;
    }
    .nav-btn {
        width: 22px;
        height: 22px;
        background-color: #222;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        border-radius: 2px;
        cursor: pointer;
        border: 1px solid #000;
        transition: all 0.1s;
        position: relative;
    }
    .nav-btn:hover {
        background-color: #444;
    }
    .nav-btn.active {
        background-color: #7ab3e3;
        border-radius: 50%;
        color: white;
        width: 26px;
        height: 26px;
        margin: -2px 0;
        border: none;
        box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
    }
    .nav-btn.answered::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 2px;
        background-color: #fff;
        border-radius: 1px;
    }
    .content-box {
        border: 1px solid #333;
        padding: 24px;
        background-color: #fff;
        margin-bottom: 24px;
    }
  `}</style>
);

export const OCTOBER_LISTENING_ANSWER_KEY: Record<number, string> = {
};


const SettingsIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Highlighter = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>;
const Edit3 = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const Copy = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

export function OctoberListeningTest({ submissionId }: { submissionId?: string }) {

  const { user, isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  

  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    async function checkPublished() {
      try {
        const docRef = doc(db, 'activity_logs', `listening_settings_${id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsPublished(docSnap.data().isPublished !== false);
        }
      } catch (err) {
        console.error("Failed to fetch test settings", err);
      }
    }
    checkPublished();
  }, [id]);

  const handleTogglePublish = async () => {
    const newVal = !isPublished;
    setIsPublished(newVal);
    try {
      await setDoc(doc(db, 'activity_logs', `listening_settings_${id}`), { isPublished: newVal }, { merge: true });
    } catch (err) {
      console.error("Failed to update test settings", err);
    }
  };

  useEffect(() => { if (user?.displayName && !studentName) setStudentName(user.displayName); }, [user]);

  const [hasStarted, setHasStarted] = useState(false);
  const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [adminEditingMode, setAdminEditingMode] = useState(false);
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [manualBandScore, setManualBandScore] = useState<number | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(1);
  // --- SETTINGS STATE ---
  const [textSize, setTextSize] = useState('standard'); 
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const colorTheme = globalTheme === 'dark' ? 'white-on-black' : globalTheme === 'picture' ? 'yellow-on-black' : 'standard';
  const setColorTheme = (val) => setGlobalTheme(val === 'white-on-black' ? 'dark' : val === 'yellow-on-black' ? 'picture' : 'light');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- HIGHLIGHT & NOTES STATE ---
  const [popover, setPopover] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [highlightRanges, setHighlightRanges] = useState<Range[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showSettings]);

  useEffect(() => {
    if ('highlights' in (CSS as any)) {
      try {
        const highlight = new (window as any).Highlight(...highlightRanges);
        (CSS as any).highlights.set('test-highlight', highlight);
      } catch(e) {}
    }
  }, [highlightRanges]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Only show popover if selecting inside main container
    if (mainContainerRef.current && mainContainerRef.current.contains(range.startContainer)) {
      setIsCopied(false);
      setPopover({
        type: 'new',
        x: rect.left + (rect.width / 2),
        y: rect.top,
        range: range.cloneRange(),
        text: selection.toString()
      });
    }
  };

  const addHighlight = (noteText = '') => {
    if (!popover) return;
    const newRanges = [...highlightRanges, popover.range];
    setHighlightRanges(newRanges);
    if (noteText) {
       setNotesList(prev => [...prev, { text: noteText, y: popover.y }]);
    }
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopyText = () => {
    if (popover && popover.text) {
      navigator.clipboard.writeText(popover.text);
      setIsCopied(true);
      setTimeout(() => setPopover(null), 1500);
    }
  };

  const theme = {
    bg: colorTheme === 'standard' ? 'bg-[#e6eaf2]' : colorTheme === 'white-on-black' ? 'bg-[#121212]' : 'bg-[#111111]',
    text: colorTheme === 'standard' ? 'text-[#333]' : colorTheme === 'white-on-black' ? 'text-white' : 'text-[#f0f000]',
    container: colorTheme === 'standard' ? 'bg-white shadow-xl border-gray-200' : 'bg-[#1e1e1e] border-gray-700',
    muted: colorTheme === 'standard' ? 'text-gray-500' : 'text-gray-400',
    border: colorTheme === 'standard' ? 'border-gray-200' : 'border-gray-700',
    inputBg: colorTheme === 'standard' ? 'bg-white text-black' : 'bg-[#333] text-white border-gray-600',
    headerBg: colorTheme === 'standard' ? 'bg-[#f4f7f8] border-gray-300' : 'bg-[#2a2a2a] border-gray-700',
  };

  const textSizeClass = textSize === 'standard' ? 'text-[15px]' : textSize === 'large' ? 'text-[18px]' : 'text-[22px]';

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function loadSubmission() {
      if (submissionId) {
        try {
          const docRef = doc(db, 'submissions', submissionId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let parsedAnswers: Record<number, string> = {};
            if (typeof data.answers === 'string') {
              try { parsedAnswers = JSON.parse(data.answers); } catch (e) {}
            } else {
              parsedAnswers = data.answers || {};
            }
            setAnswers(parsedAnswers);
            if (data.score !== undefined) setManualScore(data.score);
            if (data.bandScore !== undefined) setManualBandScore(data.bandScore);
            setHasStarted(true);
            setIsSubmitted(true);
            setTimeLeft(0);
          }
        } catch (error) {
          console.error("Error loading submission:", error);
        }
      }
    }
    loadSubmission();
  }, [submissionId]);
  const [volume, setVolume] = useState(70);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value, 10);
    setVolume(vol);
    if (audioRef.current) {
        audioRef.current.volume = vol / 100;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && timeLeft > 0 && !isSubmitted && !isTimePaused) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && hasStarted && !isSubmitted) {
      if (timer) clearInterval(timer);
      submitTest();
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, isSubmitted, isTimePaused]);

  const unmountStateRef = useRef({ hasStarted, isSubmitted, submitTest });
  useEffect(() => {
    unmountStateRef.current = { hasStarted, isSubmitted, submitTest };
  }, [hasStarted, isSubmitted, submitTest]);

  useEffect(() => {
    return () => {
      const state = unmountStateRef.current;
      if (state.hasStarted && !state.isSubmitted) {
        state.submitTest().catch(console.error);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setHasStarted(true);
    }
  };

  const handleMultiAnswerChange = (q1: number, q2: number, value: string, isChecked: boolean) => {
    setAnswers(prev => {
        const newAnswers = { ...prev };
        if (isChecked) {
            if (!newAnswers[q1]) {
                newAnswers[q1] = value;
            } else if (!newAnswers[q2] && newAnswers[q1] !== value) {
                newAnswers[q2] = value;
            }
        } else {
            if (newAnswers[q1] === value) {
                newAnswers[q1] = "";
                if (newAnswers[q2]) {
                    newAnswers[q1] = newAnswers[q2];
                    newAnswers[q2] = "";
                }
            } else if (newAnswers[q2] === value) {
                newAnswers[q2] = "";
            }
        }
        return newAnswers;
    });
  };
  const handleAnswerChange = (qNum: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [qNum]: value
    }));
  };

  const submitTest = async () => {
    setIsSubmitted(true);
    if (!user) {
        navigate('/dashboard');
        return;
    }
    
    try {
      let title = 'IELTS Listening Test 10';
      
      const checkAnswer = (qNum: number) => {
          let userAns = (answers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
          const correctAns = OCTOBER_LISTENING_ANSWER_KEY[qNum];
          if (!correctAns) return false;

          const correctAnswers = String(correctAns).toUpperCase().split(/\s*\bOR\b\s*|\s*\/\s*/);
          for (let ans of correctAnswers) {
            ans = ans.trim();
            if (userAns === ans) return true;
            if (userAns.startsWith(ans + " ") || userAns.startsWith(ans + ".")) return true;
            const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
            const cleanAns = ans.replace(/[^A-Z0-9]/g, '');
            if (cleanUser === cleanAns && cleanAns.length > 0) return true;
          }
          return false;
      };

      const score = Array.from({ length: 40 }, (_, i) => i + 1).filter(qNum => checkAnswer(qNum)).length;
      let bandScore = 0;
      if (score >= 39) bandScore = 9.0;
      else if (score >= 37) bandScore = 8.5;
      else if (score >= 35) bandScore = 8.0;
      else if (score >= 32) bandScore = 7.5;
      else if (score >= 30) bandScore = 7.0;
      else if (score >= 26) bandScore = 6.5;
      else if (score >= 23) bandScore = 6.0;
      else if (score >= 18) bandScore = 5.5;
      else if (score >= 16) bandScore = 5.0;
      else if (score >= 13) bandScore = 4.5;
      else if (score >= 11) bandScore = 4.0;
      else if (score >= 8) bandScore = 3.5;
      else if (score >= 6) bandScore = 3.0;
      else if (score >= 4) bandScore = 2.5;
      else if (score >= 2) bandScore = 2.0;
    else if (score >= 1) bandScore = 1.0;
    const finalScore = manualScore !== null ? manualScore : score;
    const finalBandScore = manualBandScore !== null ? manualBandScore : bandScore;



      await addDoc(collection(db, 'submissions'), {
        userId: user.uid,
        studentName: studentName || user.displayName || 'Student',
        assignmentId: id,
        assignmentTitle: title,
        assignmentType: 'listening',
        createdAt: serverTimestamp(),
        status: 'submitted',
        answers: JSON.stringify(answers),
        bandScore,
        percentage: (score / 40) * 100,
        timeSpent: (40 * 60) - timeLeft,
        requiresEvaluation: false
      });

    } catch (err) {
      console.error("Failed to save score", err);
    }
  };

  const navQuestionRange = {
      1: "1 - 10",
      2: "11 - 20",
      3: "21 - 30",
      4: "31 - 40"
  }[currentPartIndex as keyof typeof navQuestionRange];

  if (isSubmitted) {
    const checkAnswer = (qNum: number) => {
        let userAns = (answers[qNum] || '').toString().trim().toUpperCase();
        const correctAns = OCTOBER_LISTENING_ANSWER_KEY[qNum];
        if (!correctAns) return false;

        const correctAnswers = String(correctAns).toUpperCase().split(/\s*\bOR\b\s*|\s*\/\s*/);
        for (let ans of correctAnswers) {
          ans = ans.trim();
          if (userAns === ans) return true;
          if (userAns.startsWith(ans + " ") || userAns.startsWith(ans + ".")) return true;
          const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
          const cleanAns = ans.replace(/[^A-Z0-9]/g, '');
          if (cleanUser === cleanAns && cleanAns.length > 0) return true;
        }
        return false;
    };
    const score = Array.from({ length: 40 }, (_, i) => i + 1).filter(qNum => checkAnswer(qNum)).length;
    let bandScore = 0;
    if (score >= 39) bandScore = 9.0;
    else if (score >= 37) bandScore = 8.5;
    else if (score >= 35) bandScore = 8.0;
    else if (score >= 32) bandScore = 7.5;
    else if (score >= 30) bandScore = 7.0;
    else if (score >= 26) bandScore = 6.5;
    else if (score >= 23) bandScore = 6.0;
    else if (score >= 18) bandScore = 5.5;
    else if (score >= 16) bandScore = 5.0;
    else if (score >= 13) bandScore = 4.5;
    else if (score >= 11) bandScore = 4.0;
    else if (score >= 8) bandScore = 3.5;
    else if (score >= 6) bandScore = 3.0;
    else if (score >= 4) bandScore = 2.5;
    else if (score >= 2) bandScore = 2.0;
    else if (score >= 1) bandScore = 1.0;
    const finalScore = manualScore !== null ? manualScore : score;
    const finalBandScore = manualBandScore !== null ? manualBandScore : bandScore;



    const renderGradedRow = (qNum: number) => {
      const isCorrect = checkAnswer(qNum);
      let userAns = (answers[qNum] || '').toString().trim().toUpperCase();

      return (
        <div key={qNum} className={`w-full text-left flex border h-auto min-h-[44px] rounded-lg overflow-hidden ${isCorrect ? 'border-green-300 shadow-sm' : 'border-red-300 shadow-sm'}`}>
          <div className={`w-10 flex items-center justify-center font-bold text-[1.125em] border-r shrink-0 ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {qNum}
          </div>
          <div className={`flex-1 flex flex-col justify-center px-4 py-2 font-medium text-[1em] ${isCorrect ? 'bg-white text-green-900' : 'bg-white'}`}>
            {isAdmin && adminEditingMode ? (
              <input type="text" className="w-full border rounded px-2 py-1 text-sm font-bold bg-white text-black outline-none focus:ring-2 focus:ring-blue-500" value={answers[qNum] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [qNum]: e.target.value }))} placeholder="Edit answer..." onClick={e => e.stopPropagation()} />
            ) : (
              <>
                <span className={isCorrect ? '' : (userAns ? 'text-red-600 line-through opacity-80' : 'text-gray-500 italic text-[0.875em]')}>
              {userAns || 'No Answer'}
            </span>
            {!isCorrect && (
              <span className={`text-[0.875em] font-bold block mt-1 flex items-center gap-1 text-green-600`}>
                 <CheckCircle2 size={14} /> {OCTOBER_LISTENING_ANSWER_KEY[qNum]}
              </span>
            )}
              </>
            )}
          </div>
          <div className={`w-12 border-l flex items-center justify-center font-bold text-[1.25em] shrink-0 ${isCorrect ? 'border-green-200 bg-green-100 text-green-600' : 'border-red-200 bg-red-100 text-red-600'}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
        </div>
      );
    };

    return (
      <>
        <CustomStyles />
        <div className={`min-h-screen py-10 font-sans overflow-y-auto selection:bg-blue-200 bg-gray-50 text-gray-900`}>
          <div className={`max-w-4xl mx-auto p-8 md:p-12 shadow-xl rounded-2xl bg-white text-gray-900`}>
            <div className={`flex items-center justify-center gap-3 mb-8 py-3 rounded-xl border bg-green-50 text-green-600 border-green-200`}>
              <CheckCircle2 size={24} />
              <span className="text-[1.125em] font-bold">Test Submitted Successfully</span>
            </div>
            
            <button onClick={() => navigate('/dashboard')} className={`mb-6 flex items-center text-[0.875em] font-bold transition-colors text-gray-700 hover:opacity-70`}>
               <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>

            <h1 className={`text-[2.25em] font-bold text-center mb-10 font-serif`}>IELTS Listening Results</h1>
            
            {isAdmin && submissionId && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                <div className="text-yellow-800 font-bold">Admin Controls: Edit Results</div>
                <div className="flex flex-wrap items-center gap-4">
                   {adminEditingMode ? (
                     <>
                        <div className="flex items-center gap-2">
                           <label className="text-xs font-bold text-yellow-800 uppercase">Raw Score Override:</label>
                           <input type="number" min="0" max="40" className="w-16 px-2 py-1 border rounded bg-white text-black" value={manualScore !== null ? manualScore : ''} onChange={e => setManualScore(e.target.value ? parseInt(e.target.value) : null)} placeholder="Auto" />
                        </div>
                        <div className="flex items-center gap-2">
                           <label className="text-xs font-bold text-yellow-800 uppercase">Band Score Override:</label>
                           <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border rounded bg-white text-black" value={manualBandScore !== null ? manualBandScore : ''} onChange={e => setManualBandScore(e.target.value ? parseFloat(e.target.value) : null)} placeholder="Auto" />
                        </div>
                        <button onClick={async () => {
                           try {
                             
                             
                             const scoreVal = manualScore !== null ? manualScore : score;
                             const bandScoreVal = manualBandScore !== null ? manualBandScore : bandScore;
                             await setDoc(doc(db, 'submissions', submissionId), { answers: JSON.stringify(answers), score: scoreVal, bandScore: bandScoreVal }, { merge: true });
                             setAdminEditingMode(false);
                             alert("Saved successfully!");
                           } catch(err) { alert("Failed to save"); console.error(err); }
                        }} className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700">Save Changes</button>
                        <button onClick={() => setAdminEditingMode(false)} className="text-gray-600 hover:text-gray-800 font-bold px-2">Cancel</button>
                     </>
                   ) : (
                     <button onClick={() => setAdminEditingMode(true)} className="bg-yellow-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-yellow-700">Edit Answers & Score</button>
                   )}
                </div>
              </div>
            )}
            
            <div className={`flex flex-col md:flex-row justify-between items-center gap-8 mb-10 p-6 md:p-8 rounded-2xl border shadow-sm bg-blue-50/50 border-blue-100`}>
              <div className="space-y-5 font-bold text-[0.875em] w-full md:w-2/3">
                <div className="flex items-center gap-4">
                  <span className={`w-24 uppercase tracking-widest text-[0.875em] text-gray-600`}>Candidate Name</span>
                  <div className={`border-b-2 px-4 py-2 flex-1 text-[1.25em] uppercase tracking-wider rounded-t shadow-inner bg-white border-blue-200 text-blue-900`}>{studentName}</div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4 flex-1">
                     <span className={`w-24 leading-tight uppercase tracking-widest text-[0.875em] text-gray-600`}>Candidate No.</span>
                     <div className="flex-1 flex gap-1.5">
                       {[...Array(6)].map((_, i) => <div key={i} className={`border shadow-inner w-8 h-8 rounded-md bg-white border-blue-200`}></div>)}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                     <span className={`w-24 text-right uppercase tracking-widest text-[0.875em] text-gray-600`}>Centre No.</span>
                     <div className="flex-1 flex gap-1.5">
                       {[...Array(5)].map((_, i) => <div key={i} className={`border shadow-inner w-8 h-8 rounded-md bg-white border-blue-200`}></div>)}
                     </div>
                  </div>
                </div>
              </div>
              <div className={`text-center p-6 rounded-2xl shadow-md border min-w-[200px] flex flex-col justify-center gap-6 transform hover:scale-105 transition-transform bg-white border-blue-100`}>
                 <div>
                     <span className={`block text-[0.875em] font-bold uppercase tracking-widest mb-1 text-gray-500`}>Band Score</span>
                     <span className={`text-[4.5em] leading-none font-black text-green-600`}>{finalBandScore.toFixed(1)}</span>
                 </div>
                 <div className={`border-t pt-4 border-blue-50`}>
                     <span className={`block text-[0.75em] font-bold uppercase tracking-widest mb-1 text-gray-400`}>Raw Score</span>
                     <span className={`text-[1.5em] font-black text-blue-600`}>{finalScore}<span className={`text-[0.6em] font-bold text-gray-400`}>/40</span></span>
                 </div>
              </div>
            </div>

            <div className={`font-bold text-[1.25em] py-3 px-6 flex justify-between mb-8 rounded-lg shadow-md uppercase tracking-widest bg-[#183473] text-white`}>
              <span>Listening</span><span>Listening</span><span>Listening</span><span>Listening</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex flex-col gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(qNum => renderGradedRow(qNum))}
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 21).map(qNum => renderGradedRow(qNum))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen w-full z-50 flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-8">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[560px] border border-gray-100 relative overflow-y-auto max-h-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">IELTS Listening Test 10</h1>
            <p className="text-[15px] text-gray-500 text-center mb-10">Configure your session and enter your details to begin.</p>
            
            <form onSubmit={handleStart} className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Full Name</label>
                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter your full name" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                {isAdmin && (
                  <div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">Test Visibility (Admin Only)</div>
                        <div className="text-xs text-gray-500 mt-1">Control whether students can take this test.</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={handleTogglePublish} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-800">Select Test Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setTestMode('practice')}
                      className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden ${testMode === 'practice' ? 'border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 bg-white'}`}
                    >
                      {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>}
                      <div className="flex justify-between items-start mb-2">
                        <div className={`font-bold text-[15px] ${testMode === 'practice' ? 'text-blue-700' : 'text-gray-800'}`}>Practice Mode</div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'practice' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {testMode === 'practice' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed pr-2">
                        Control your pace. Ideal for learning and reviewing.
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setTestMode('mock')}
                      className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden ${testMode === 'mock' ? 'border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 bg-white'}`}
                    >
                      {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>}
                      <div className="flex justify-between items-start mb-2">
                        <div className={`font-bold text-[15px] ${testMode === 'mock' ? 'text-blue-700' : 'text-gray-800'}`}>Mock Test Mode</div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'mock' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed pr-2">
                        Strict timed conditions. Audio cannot be paused. Simulates real exam.
                      </div>
                    </button>
                  </div>
                </div>
                
                {!isAdmin && !isPublished ? (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-center font-medium text-sm">
                     Test is currently unpublished. Please ask your administrator for permission to access this test.
                  </div>
                ) : (
                  <button type="submit" disabled={!studentName.trim()} className="mt-4 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-[15px] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                      Start Test Now
                  </button>
                )}
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme.text} ${theme.bg}`}>
      <CustomStyles />
      <div className="bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">
          <div className="text-xs text-gray-300 font-bold tracking-wide flex items-center gap-4">
            CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center gap-2 font-bold text-base tracking-wide absolute left-1/2 transform -translate-x-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
              {testMode === 'practice' && (
                <button 
                  onClick={() => setIsTimePaused(!isTimePaused)} 
                  className="ml-2 px-2 py-0.5 text-xs font-normal bg-white text-black border border-gray-400 rounded hover:bg-gray-100"
                >
                  {isTimePaused ? 'Resume' : 'Pause'}
                </button>
              )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 relative z-30" ref={settingsRef}>
              <button 
                 onClick={(e) => { e.stopPropagation(); setShowSettings(prev => !prev); }}
                 className={`p-2 rounded-full transition-all cursor-pointer pointer-events-auto ${showSettings ? 'bg-blue-100 text-blue-900 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}
                title="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              {showSettings && (
                <div className="absolute top-full right-0 mt-3 bg-white text-black shadow-2xl rounded-xl border border-gray-200 py-3 px-0 w-56 flex flex-col font-sans animate-fade-in-down z-50">
                  <div className="px-5 py-2 border-b border-gray-100 mb-2 flex items-center gap-2">
                    <SettingsIcon size={16} className="text-gray-500" /> <span className="font-bold text-gray-800 text-[1.25em]">Options</span>
                  </div>
                  <div className="px-5 py-2">
                    <p className="text-[1.25em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Text Size</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="standard" checked={textSize === 'standard'} onChange={() => setTextSize('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="large" checked={textSize === 'large'} onChange={() => setTextSize('large')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Large</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="extralarge" checked={textSize === 'extralarge'} onChange={() => setTextSize('extralarge')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Extra Large</span>
                    </label>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 mt-1 bg-gray-50 rounded-b-xl">
                    <p className="text-[1.25em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Screen Colors</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="standard" checked={colorTheme === 'standard'} onChange={() => setColorTheme('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="white-on-black" checked={colorTheme === 'white-on-black'} onChange={() => setColorTheme('white-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">White on black</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="yellow-on-black" checked={colorTheme === 'yellow-on-black'} onChange={() => setColorTheme('yellow-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Yellow on black</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2 bg-gradient-to-b from-gray-100 to-gray-300 px-2 py-0.5 rounded border border-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                <input type="range" className="w-16 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" value={volume} onChange={handleVolumeChange} />
            </div>
          </div>
      </div>
      <div className="bg-white px-8 py-3 shadow-sm border-b border-gray-300 z-10 shrink-0 flex justify-between items-center">
          <div>
              <h1 className="text-[22px] font-bold text-black mb-0.5">Part {currentPartIndex}</h1>
              <p className="text-[13px] text-gray-700">Listen and answer questions <span className="font-bold">{navQuestionRange}</span>.</p>
          </div>
          <div>
              <iframe src="https://drive.google.com/file/d/1BNgVzO9_tSArKpe0VF6VqYDiqasM_IgG/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>
          </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${theme.bg} p-6 flex justify-center items-start shadow-inner relative ${textSizeClass}`} ref={mainContainerRef} onMouseUp={handleTextSelect}>
          
          
          {notesList.map((note, idx) => (
             <div key={idx} className="absolute z-40 bg-yellow-100 border border-yellow-300 p-2 shadow-md rounded text-sm max-w-xs text-black" style={{ top: note.y, right: 20 }}>
                <Edit3 size={12} className="inline mr-1" /> {note.text}
             </div>
          ))}
          <div className="w-full max-w-[1000px] min-h-full">

          {popover && !isSubmitted && (
            <div 
              ref={popoverRef}
              className="absolute z-50 bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200 px-1 py-1 transform -translate-x-1/2 -translate-y-full animate-fade-in"
              style={{ top: popover.y - 12, left: popover.x }}
            >
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-gray-200 rotate-45"></div>
              
              <div className="relative z-10 flex flex-col font-sans">
                {popover.type === 'new' && (
                  <div className="flex items-center h-9">
                    <button 
                      onClick={() => addHighlight('')}
                      className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                    >
                      <Highlighter size={16} strokeWidth={2.5} className="text-yellow-500" />
                      Highlight
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button 
                      onClick={() => { setPopover({...popover, type: 'note-input'}); setNoteInput(''); }}
                      className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                    >
                      <Edit3 size={16} strokeWidth={2.5} className="text-blue-500" />
                      Add Note
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button 
                      onClick={handleCopyText}
                      className={`flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold transition-colors whitespace-nowrap ${isCopied ? 'text-green-600' : 'text-gray-700'}`}
                    >
                      {isCopied ? <CheckCircle2 size={16} strokeWidth={2.5} className="text-green-600" /> : <Copy size={16} strokeWidth={2.5} className="text-gray-500" />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                {popover.type === 'note-input' && (
                  <div className="w-64 p-2">
                    <textarea
                      autoFocus
                      className="w-full border border-gray-300 rounded p-3 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none shadow-inner bg-white text-black"
                      rows={3}
                      placeholder="Type your note here..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[15px] font-bold transition-colors"
                        onClick={() => setPopover(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[15px] font-bold shadow-sm transition-colors"
                        onClick={() => addHighlight(noteInput)}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>
    <h2 className="text-xl font-bold mb-4">Part 1 Placeholder</h2>
</div>
<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>
    <h2 className="text-xl font-bold mb-4">Part 2 Placeholder</h2>
</div>
<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>
    <h2 className="text-xl font-bold mb-4">Part 3 Placeholder</h2>
</div>
<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>
    <h2 className="text-xl font-bold mb-4">Part 4 Placeholder</h2>
</div>
          </div>
      </div>
      <div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">
          <div className="flex items-center text-[12px] font-bold text-gray-800 ml-4 cursor-pointer shrink-0">
               <input type="checkbox" className="mr-2 w-4 h-4 cursor-pointer" id="review-checkbox" /> <label htmlFor="review-checkbox" className="cursor-pointer">Review</label>
          </div>
          
          <div className="flex items-center gap-6 mx-auto shrink-0 min-w-max px-4">
              {[1, 2, 3, 4].map(partNum => (
                <div key={partNum} className="flex items-center cursor-pointer part-nav-header" onClick={() => setCurrentPartIndex(partNum)}>
                    <span className="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part {partNum}</span>
                    <div className="flex gap-0.5">
                        {Array.from({length: 10}, (_, i) => i + 1 + (partNum - 1) * 10).map(qNum => (
                            <div 
                                key={qNum} 
                                className={`nav-btn ${answers[qNum] ? 'answered' : ''} ${currentPartIndex === partNum && qNum % 10 === 1 ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setCurrentPartIndex(partNum); }}
                            >
                                {qNum}
                            </div>
                        ))}
                    </div>
                </div>
              ))}
          </div>
          <div className="mr-4 shrink-0 flex gap-2">
              {currentPartIndex === 4 ? (
                <button onClick={submitTest} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow hover:bg-green-700 transition">
                    Submit Test
                </button>
              ) : (
                <button className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-200 border border-gray-400 shadow flex items-center justify-center hover:from-gray-100 hover:to-gray-300 transition text-lg font-bold pb-1 text-gray-700" onClick={() => setCurrentPartIndex(prev => Math.min(4, prev + 1))}>
                    &rarr;
                </button>
              )}
          </div>
      </div>
    </div>
  );
}
