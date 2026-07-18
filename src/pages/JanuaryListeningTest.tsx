import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, ArrowLeft, Info, Menu } from 'lucide-react';
import { CustomAudioPlayer } from '../components/CustomAudioPlayer';

const CustomStyles = () => (
  <style>{`
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
    .ielts-input-short {
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

export const LISTENING_ANSWER_KEY: Record<number, string> = {
    1: '10/TEN', 2: 'WEATHER', 3: 'SAFETY', 4: 'DISCOUNT', 5: 'DICTIONARY',
    6: 'CERTIFICATE', 7: 'TOWEL', 8: 'CAFÉ/CAFE', 9: 'VIDEOS', 10: 'LOCKERS',
    11: 'A', 12: 'B', 13: 'A', 14: 'A', 15: 'A',
    16: 'C', 17: 'C', 18: 'A', 19: 'B', 20: 'C',
    21: 'B/D', 22: 'B/D', 23: 'C/E', 24: 'C/E', 25: 'G',
    26: 'B', 27: 'F', 28: 'H', 29: 'A', 30: 'E',
    31: 'METAL/METALS', 32: 'SLOW', 33: 'DEMAND', 34: 'EQUATOR', 35: 'RECYCLE',
    36: 'FUNGUS', 37: 'WEATHER', 38: 'STRONG', 39: 'ROOTS', 40: 'SOIL'
};

export function JanuaryListeningTest({ submissionId }: { submissionId?: string }) {

  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState(user?.displayName || '');
  useEffect(() => { if (user?.displayName && !studentName) setStudentName(user.displayName); }, [user]);

  const [hasStarted, setHasStarted] = useState(false);
  const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');
  const [isTimePaused, setIsTimePaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentPartIndex, setCurrentPartIndex] = useState(1);
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

  const handleMultiSelect = (q1: number, q2: number, value: string, isChecked: boolean) => {
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
                newAnswers[q1] = '';
                if (newAnswers[q2]) {
                    newAnswers[q1] = newAnswers[q2];
                    newAnswers[q2] = '';
                }
            } else if (newAnswers[q2] === value) {
                newAnswers[q2] = '';
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
      let title = 'January Listening Practice';
      
      const checkAnswer = (qNum: number) => {
          let userAns = (answers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
          const correctAns = LISTENING_ANSWER_KEY[qNum];
          if (!correctAns) return false;

          if (userAns === 'T') userAns = 'TRUE';
          if (userAns === 'F') userAns = 'FALSE';
          if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
          if (userAns === 'Y') userAns = 'YES';
          if (userAns === 'N' && String(correctAns).includes('NO')) userAns = 'NO';

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
        const correctAns = LISTENING_ANSWER_KEY[qNum];
        if (!correctAns) return false;

        if (userAns === 'T') userAns = 'TRUE';
        if (userAns === 'F') userAns = 'FALSE';
        if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
        if (userAns === 'Y') userAns = 'YES';
        if (userAns === 'N' && String(correctAns).includes('NO')) userAns = 'NO';

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

    const renderGradedRow = (qNum: number) => {
      const isCorrect = checkAnswer(qNum);
      let userAns = (answers[qNum] || '').toString().trim().toUpperCase();

      if (userAns === 'T') userAns = 'TRUE';
      if (userAns === 'F') userAns = 'FALSE';
      if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
      if (userAns === 'Y') userAns = 'YES';
      if (userAns === 'N' && String(LISTENING_ANSWER_KEY[qNum]).includes('NO')) userAns = 'NO';

      return (
        <div key={qNum} className={`w-full text-left flex border h-auto min-h-[44px] rounded-lg overflow-hidden ${isCorrect ? 'border-green-300 shadow-sm' : 'border-red-300 shadow-sm'}`}>
          <div className={`w-10 flex items-center justify-center font-bold text-[1.125em] border-r shrink-0 ${isCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {qNum}
          </div>
          <div className={`flex-1 flex flex-col justify-center px-4 py-2 font-medium text-[1em] ${isCorrect ? 'bg-white text-green-900' : 'bg-white'}`}>
            <span className={isCorrect ? '' : (userAns ? 'text-red-600 line-through opacity-80' : 'text-gray-500 italic text-[0.875em]')}>
              {userAns || 'No Answer'}
            </span>
            {!isCorrect && (
              <span className={`text-[0.875em] font-bold block mt-1 flex items-center gap-1 text-green-600`}>
                 <CheckCircle2 size={14} /> {LISTENING_ANSWER_KEY[qNum]}
              </span>
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
                     <span className={`text-[4.5em] leading-none font-black text-green-600`}>{bandScore.toFixed(1)}</span>
                 </div>
                 <div className={`border-t pt-4 border-blue-50`}>
                     <span className={`block text-[0.75em] font-bold uppercase tracking-widest mb-1 text-gray-400`}>Raw Score</span>
                     <span className={`text-[1.5em] font-black text-blue-600`}>{score}<span className={`text-[0.6em] font-bold text-gray-400`}>/40</span></span>
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-[560px] border border-gray-100 relative overflow-hidden">
            <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">IELTS Listening Test</h1>
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
                
                <button type="submit" disabled={!studentName.trim()} className="mt-4 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-[15px] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                    Start Test Now
                </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-[#333] bg-[#e1e5eb]">
      <CustomStyles />
      <div className="bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">
          <div className="text-xs text-gray-300 font-bold tracking-wide">CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span></div>
          
          <div className="flex items-center gap-2 font-bold text-base tracking-wide absolute left-1/2 transform -translate-x-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
              {testMode === 'practice' && (
                <button 
                  onClick={() => setIsTimePaused(!isTimePaused)} 
                  className="ml-2 px-2 py-0.5 text-xs font-normal bg-white border border-gray-400 rounded hover:bg-gray-100"
                >
                  {isTimePaused ? 'Resume' : 'Pause'}
                </button>
              )}
          </div>

          <div className="flex items-center gap-2">
              <button className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Settings</button>
              <button className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Help <span className="text-blue-700 font-bold ml-0.5">?</span></button>
              <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Quit</button>
              
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
              <CustomAudioPlayer ref={audioRef} src="/api/audio?id=10kSpYtnGZN_gU3JsdiA-hnt_BkEtc2dH"  isMockMode={testMode === 'mock'} />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">
          <div className="w-full max-w-[1000px] min-h-full">
{/* Part 1 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>
                
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-6</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>

                <div className="content-box overflow-x-auto">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Oyster Bay Sailing Club Courses</h2>
                    
                    <table className="w-full border-collapse border border-gray-400 text-left mb-8">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-3">Name of course</th>
                                <th className="border border-gray-400 p-3">What you learn</th>
                                <th className="border border-gray-400 p-3">Cost</th>
                                <th className="border border-gray-400 p-3">Other information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 p-3 align-top">Taster day</td>
                                <td className="border border-gray-400 p-3 align-top">introduction to sailing</td>
                                <td className="border border-gray-400 p-3 align-top">£120 if booking one place</td>
                                <td className="border border-gray-400 p-3 align-top">small groups (max <span className="font-bold mx-1">1</span><input type="text" placeholder="1" className="ielts-input" value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} /> people)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-3 align-top">Level 1</td>
                                <td className="border border-gray-400 p-3 align-top">
                                    basic theory e.g. understanding the <span className="font-bold mx-1">2</span><input type="text" placeholder="2" className="ielts-input" value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} /> and tides<br/><br/>
                                    basic sailing skills including <span className="font-bold mx-1">3</span><input type="text" placeholder="3" className="ielts-input" value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} /> information
                                </td>
                                <td className="border border-gray-400 p-3 align-top">£200</td>
                                <td className="border border-gray-400 p-3 align-top">
                                    <span className="font-bold mx-1">4</span><input type="text" placeholder="4" className="ielts-input" value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} /> available for club members<br/><br/>
                                    all inclusive (plus a useful <span className="font-bold mx-1">5</span><input type="text" placeholder="5" className="ielts-input" value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} />)<br/><br/>
                                    a <span className="font-bold mx-1">6</span><input type="text" placeholder="6" className="ielts-input" value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} /> at the end of the course for all participants
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 7-10</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                    <div className="content-box">
                        <div className="font-bold mb-4 text-[18px] text-blue-900 border-b border-gray-300 pb-2">General information</div>
                        <ul className="list-none space-y-4 mb-8 pl-2">
                            <li>&bull; Participants must be able to swim.</li>
                            <li>&bull; Bring suitable clothing, a <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className="ielts-input" value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} /> and toiletries (e.g. shampoo).</li>
                            <li>&bull; There is a <span className="font-bold mx-2">8</span><input type="text" placeholder="8" className="ielts-input" value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} /> at the club.</li>
                            <li>&bull; Online training <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className="ielts-input" value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} /> are recommended.</li>
                            <li>&bull; <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className="ielts-input" value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} /> are available for course participants.</li>
                        </ul>
                    </div>
                </div>

            </div>

            
{/* Part 2 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11-16</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B</span> or <span className="font-bold">C</span>.</div>

                <div className="content-box mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Working as a makeup trainee</h2>
                    
                    <div className="space-y-8">
                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">11</span><span>What should trainees always expect to get when working on low budget short films?</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q11" value="A" className="mcq-radio" checked={answers[11] === 'A'} onChange={() => handleAnswerChange(11, 'A')} /> <span className="font-bold mr-3">A</span> travel expenses</label>
                                <label className="mcq-label"><input type="radio" name="q11" value="B" className="mcq-radio" checked={answers[11] === 'B'} onChange={() => handleAnswerChange(11, 'B')} /> <span className="font-bold mr-3">B</span> a minimum wage</label>
                                <label className="mcq-label"><input type="radio" name="q11" value="C" className="mcq-radio" checked={answers[11] === 'C'} onChange={() => handleAnswerChange(11, 'C')} /> <span className="font-bold mr-3">C</span> meals</label>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">12</span><span>According to the speaker, on big budget films trainees may get experience of</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q12" value="A" className="mcq-radio" checked={answers[12] === 'A'} onChange={() => handleAnswerChange(12, 'A')} /> <span className="font-bold mr-3">A</span> makeup for special effects.</label>
                                <label className="mcq-label"><input type="radio" name="q12" value="B" className="mcq-radio" checked={answers[12] === 'B'} onChange={() => handleAnswerChange(12, 'B')} /> <span className="font-bold mr-3">B</span> working with different ethnicities.</label>
                                <label className="mcq-label"><input type="radio" name="q12" value="C" className="mcq-radio" checked={answers[12] === 'C'} onChange={() => handleAnswerChange(12, 'C')} /> <span className="font-bold mr-3">C</span> creating a variety of hair styles.</label>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">13</span><span>The speaker says a problem for makeup artists is</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q13" value="A" className="mcq-radio" checked={answers[13] === 'A'} onChange={() => handleAnswerChange(13, 'A')} /> <span className="font-bold mr-3">A</span> dealing with difficult directors.</label>
                                <label className="mcq-label"><input type="radio" name="q13" value="B" className="mcq-radio" checked={answers[13] === 'B'} onChange={() => handleAnswerChange(13, 'B')} /> <span className="font-bold mr-3">B</span> being shouted at by their supervisor.</label>
                                <label className="mcq-label"><input type="radio" name="q13" value="C" className="mcq-radio" checked={answers[13] === 'C'} onChange={() => handleAnswerChange(13, 'C')} /> <span className="font-bold mr-3">C</span> waiting around for hours doing nothing.</label>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">14</span><span>How did the speaker feel when she met famous actors for the first time?</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q14" value="A" className="mcq-radio" checked={answers[14] === 'A'} onChange={() => handleAnswerChange(14, 'A')} /> <span className="font-bold mr-3">A</span> very shy</label>
                                <label className="mcq-label"><input type="radio" name="q14" value="B" className="mcq-radio" checked={answers[14] === 'B'} onChange={() => handleAnswerChange(14, 'B')} /> <span className="font-bold mr-3">B</span> very proud</label>
                                <label className="mcq-label"><input type="radio" name="q14" value="C" className="mcq-radio" checked={answers[14] === 'C'} onChange={() => handleAnswerChange(14, 'C')} /> <span className="font-bold mr-3">C</span> very disappointed</label>
                            </div>
                        </div>
                        
                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">15</span><span>What advice does the speaker give about makeup kits?</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q15" value="A" className="mcq-radio" checked={answers[15] === 'A'} onChange={() => handleAnswerChange(15, 'A')} /> <span className="font-bold mr-3">A</span> Always carry a basic kit with you.</label>
                                <label className="mcq-label"><input type="radio" name="q15" value="B" className="mcq-radio" checked={answers[15] === 'B'} onChange={() => handleAnswerChange(15, 'B')} /> <span className="font-bold mr-3">B</span> Only buy the best products for a makeup kit.</label>
                                <label className="mcq-label"><input type="radio" name="q15" value="C" className="mcq-radio" checked={answers[15] === 'C'} onChange={() => handleAnswerChange(15, 'C')} /> <span className="font-bold mr-3">C</span> Ask other makeup artists to check your kit.</label>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">16</span><span>What advice does the speaker give about creating a portfolio?</span></div>
                            <div className="pl-8 space-y-1">
                                <label className="mcq-label"><input type="radio" name="q16" value="A" className="mcq-radio" checked={answers[16] === 'A'} onChange={() => handleAnswerChange(16, 'A')} /> <span className="font-bold mr-3">A</span> Keep print and digital photos.</label>
                                <label className="mcq-label"><input type="radio" name="q16" value="B" className="mcq-radio" checked={answers[16] === 'B'} onChange={() => handleAnswerChange(16, 'B')} /> <span className="font-bold mr-3">B</span> Only include a small selection of photos.</label>
                                <label className="mcq-label"><input type="radio" name="q16" value="C" className="mcq-radio" checked={answers[16] === 'C'} onChange={() => handleAnswerChange(16, 'C')} /> <span className="font-bold mr-3">C</span> Get permission to use photos.</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 17-20</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">What ability is required for each of the following duties?</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Write the correct letter, A, B, or C, next to Questions 17-20.</div>

                    <div className="content-box">
                        <div className="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div className="grid grid-cols-1 gap-y-3 pl-4">
                                <div><span className="font-bold mr-3">A</span> being well-organised</div>
                                <div><span className="font-bold mr-3">B</span> being flexible</div>
                                <div><span className="font-bold mr-3">C</span> working quickly</div>
                            </div>
                        </div>

                        <div className="font-bold mb-4 text-[18px] border-b pb-2 text-center">Duties</div>
                        <div className="space-y-4 max-w-[450px] mx-auto">
                            <div className="flex items-center justify-between"><span className="font-bold w-8">17</span><span className="flex-1">Prepping an actor</span> <input type="text" placeholder="17" className="ielts-input" value={answers[17] || ''} onChange={(e) => handleAnswerChange(17, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">18</span><span className="flex-1">Continuity</span> <input type="text" placeholder="18" className="ielts-input" value={answers[18] || ''} onChange={(e) => handleAnswerChange(18, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">19</span><span className="flex-1">General</span> <input type="text" placeholder="19" className="ielts-input" value={answers[19] || ''} onChange={(e) => handleAnswerChange(19, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">20</span><span className="flex-1">Applying makeup</span> <input type="text" placeholder="20" className="ielts-input" value={answers[20] || ''} onChange={(e) => handleAnswerChange(20, e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            </div>

            
{/* Part 3 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>
                
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21 and 22</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>

                <div className="content-box mb-8">
                    <div className="space-y-4">
                        <div className="font-bold mb-3">Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?</div>
                        <div className="pl-4 space-y-1 pb-4">
                            
                            <label className="mcq-label"><input type="checkbox" name="q21_22" value="A" className="mcq-checkbox" checked={answers[21] === 'A' || answers[22] === 'A'} onChange={(e) => handleMultiSelect(21, 22, 'A', e.target.checked)} /> <span className="font-bold mr-3">A</span> the references to local problems</label>
                            <label className="mcq-label"><input type="checkbox" name="q21_22" value="B" className="mcq-checkbox" checked={answers[21] === 'B' || answers[22] === 'B'} onChange={(e) => handleMultiSelect(21, 22, 'B', e.target.checked)} /> <span className="font-bold mr-3">B</span> the broad focus of the examples</label>
                            <label className="mcq-label"><input type="checkbox" name="q21_22" value="C" className="mcq-checkbox" checked={answers[21] === 'C' || answers[22] === 'C'} onChange={(e) => handleMultiSelect(21, 22, 'C', e.target.checked)} /> <span className="font-bold mr-3">C</span> the practical suggestions for solutions</label>
                            <label className="mcq-label"><input type="checkbox" name="q21_22" value="D" className="mcq-checkbox" checked={answers[21] === 'D' || answers[22] === 'D'} onChange={(e) => handleMultiSelect(21, 22, 'D', e.target.checked)} /> <span className="font-bold mr-3">D</span> the type of issues discussed</label>
                            <label className="mcq-label"><input type="checkbox" name="q21_22" value="E" className="mcq-checkbox" checked={answers[21] === 'E' || answers[22] === 'E'} onChange={(e) => handleMultiSelect(21, 22, 'E', e.target.checked)} /> <span className="font-bold mr-3">E</span> the implications for government policy</label>
                        </div>
                    </div>
                </div>

                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 23 and 24</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>

                <div className="content-box mb-8">
                    <div className="space-y-4">
                        <div className="font-bold mb-3">Which TWO details about the research project particularly impressed the students?</div>
                        <div className="pl-4 space-y-1 pb-4">
                            <label className="mcq-label"><input type="checkbox" name="q23_24" value="A" className="mcq-checkbox" checked={answers[23] === 'A' || answers[24] === 'A'} onChange={(e) => handleMultiSelect(23, 24, 'A', e.target.checked)} /> <span className="font-bold mr-3">A</span> the team's previous successes</label>
                            <label className="mcq-label"><input type="checkbox" name="q23_24" value="B" className="mcq-checkbox" checked={answers[23] === 'B' || answers[24] === 'B'} onChange={(e) => handleMultiSelect(23, 24, 'B', e.target.checked)} /> <span className="font-bold mr-3">B</span> its wide geographical scale</label>
                            <label className="mcq-label"><input type="checkbox" name="q23_24" value="C" className="mcq-checkbox" checked={answers[23] === 'C' || answers[24] === 'C'} onChange={(e) => handleMultiSelect(23, 24, 'C', e.target.checked)} /> <span className="font-bold mr-3">C</span> the use of new technology</label>
                            <label className="mcq-label"><input type="checkbox" name="q23_24" value="D" className="mcq-checkbox" checked={answers[23] === 'D' || answers[24] === 'D'} onChange={(e) => handleMultiSelect(23, 24, 'D', e.target.checked)} /> <span className="font-bold mr-3">D</span> the extensive statistical evidence</label>
                            <label className="mcq-label"><input type="checkbox" name="q23_24" value="E" className="mcq-checkbox" checked={answers[23] === 'E' || answers[24] === 'E'} onChange={(e) => handleMultiSelect(23, 24, 'E', e.target.checked)} /> <span className="font-bold mr-3">E</span> the large range of specialists involved</label>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 25-30</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">What is the students' opinion of each of the following resources related to ocean biodiversity?</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.</div>

                    <div className="content-box">
                        <div className="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div className="font-bold mb-4 text-center border-b border-gray-300 pb-2 text-[18px]">Opinions</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 pl-4">
                                <div><span className="font-bold mr-3">A</span> This is aimed at a very specialist audience.</div>
                                <div><span className="font-bold mr-3">B</span> This is now rather outdated.</div>
                                <div><span className="font-bold mr-3">C</span> This was an effective description of a new danger.</div>
                                <div><span className="font-bold mr-3">D</span> This suggests possible ways to improve the situation.</div>
                                <div><span className="font-bold mr-3">E</span> This does not give a balanced account.</div>
                                <div><span className="font-bold mr-3">F</span> This is too predictable to be useful.</div>
                                <div><span className="font-bold mr-3">G</span> This gives insufficient evidence for its claims.</div>
                                <div><span className="font-bold mr-3">H</span> This gives a clear explanation of the problems.</div>
                            </div>
                        </div>

                        <div className="font-bold mb-4 text-[18px] border-b pb-2 text-center">Resources</div>
                        <div className="space-y-4 max-w-[500px] mx-auto">
                            <div className="flex items-center justify-between"><span className="font-bold w-8">25</span><span className="flex-1">Article on invasive lionfish</span> <input type="text" placeholder="25" className="ielts-input" value={answers[25] || ''} onChange={(e) => handleAnswerChange(25, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">26</span><span className="flex-1">Documentary on microplastics</span> <input type="text" placeholder="26" className="ielts-input" value={answers[26] || ''} onChange={(e) => handleAnswerChange(26, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">27</span><span className="flex-1">Podcast on ocean pollution</span> <input type="text" placeholder="27" className="ielts-input" value={answers[27] || ''} onChange={(e) => handleAnswerChange(27, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">28</span><span className="flex-1">Book on coastal ecosystems</span> <input type="text" placeholder="28" className="ielts-input" value={answers[28] || ''} onChange={(e) => handleAnswerChange(28, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">29</span><span className="flex-1">Article on metal toxicity</span> <input type="text" placeholder="29" className="ielts-input" value={answers[29] || ''} onChange={(e) => handleAnswerChange(29, e.target.value)} /></div>
                            <div className="flex items-center justify-between"><span className="font-bold w-8">30</span><span className="flex-1">Podcast on floating marine cities</span> <input type="text" placeholder="30" className="ielts-input" value={answers[30] || ''} onChange={(e) => handleAnswerChange(30, e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            </div>

            
{/* Part 4 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                <div className="content-box mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black tracking-wide">Sources of rubber</h2>
                    
                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Three resources which are essential for industrial civilisation</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className="ielts-input" value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} /></li>
                        <li>&bull; fossil fuels</li>
                        <li>&bull; rubber</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Natural rubber</div>
                    <p className="mb-4 pl-4">This mainly comes from the Pará rubber tree, now cultivated in South-East Asia.</p>
                    <p className="mb-2 pl-4">The supply is limited because</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; the growth of the tree is <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className="ielts-input" value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} /></li>
                        <li>&bull; production cannot easily be adjusted because of increasing or decreasing <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className="ielts-input" value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} /></li>
                        <li>&bull; the tree only grows near the <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className="ielts-input" value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} /></li>
                        <li>&bull; extracting the latex (rubber) is labour-intensive</li>
                        <li>&bull; it is very difficult to <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className="ielts-input" value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} /> rubber after production.</li>
                    </ul>
                    
                    <p className="mb-2 pl-4">New threats include</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; lack of genetic diversity, leading to danger of disease caused by a <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className="ielts-input" value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} /></li>
                        <li>&bull; a shift to the cultivation of palm oil</li>
                        <li>&bull; extreme <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className="ielts-input" value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} /> events.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Synthetic rubber</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; may be used for engine parts and cooking utensils</li>
                        <li>&bull; is less <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className="ielts-input" value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} /> than natural rubber</li>
                        <li>&bull; is unsuitable for many purposes e.g. the tyres of aircraft.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">An alternative source of natural rubber</div>
                    <ul className="list-none space-y-4 pl-4">
                        <li>&bull; A wild flower (a type of dandelion) has rubber in its <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className="ielts-input" value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} /> .</li>
                        <li>&bull; It can be grown in many locations and does not require good <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className="ielts-input" value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} /> .</li>
                    </ul>
                </div>
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
