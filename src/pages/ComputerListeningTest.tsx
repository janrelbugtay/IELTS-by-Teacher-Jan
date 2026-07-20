import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, ArrowLeft, Info, Menu } from 'lucide-react';
import { CustomAudioPlayer } from '../components/CustomAudioPlayer';
import { FebruaryListeningTest } from './FebruaryListeningTest';
import { JanuaryListeningTest } from './JanuaryListeningTest';

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
    1: 'PENNINGTON', 2: 'GREENFIELD', 3: '66 LAKE', 4: 'RADIO', 5: 'UK765024EG',
    6: 'FLAT', 7: 'FOREST', 8: 'ORGANIC', 9: 'BIKE', 10: 'DANCE',
    11: 'G', 12: 'B', 13: 'C', 14: 'F', 15: 'D',
    16: 'A', 17: 'A', 18: 'C', 19: 'A', 20: 'C',
    21: 'B', 22: 'C', 23: 'B', 24: 'A', 25: 'B',
    26: 'C', 27: 'B', 28: 'A', 29: 'B', 30: 'A',
    31: 'FISHING', 32: 'RESOURCES', 33: 'STREET LIGHTING', 34: 'OVER SUPPLY', 35: 'PARTIES',
    36: 'B', 37: 'C', 38: 'A', 39: 'B', 40: 'A'
};

import { MarchListeningTest } from './MarchListeningTest';
import { AprilListeningTest } from './AprilListeningTest';
import { MayListeningTest } from './MayListeningTest';
import { JuneListeningTest } from './JuneListeningTest';
import { JulyListeningTest } from './JulyListeningTest';

export function ComputerListeningTest({ submissionId }: { submissionId?: string }) {

  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  if (id === '6' && !submissionId) {
      return <FebruaryListeningTest />;
  }
  if (id === '10' && !submissionId) return <MarchListeningTest />;
  if (id === '14' && !submissionId) return <AprilListeningTest />;
  if (id === '18' && !submissionId) return <MayListeningTest />;
  if (id === '22' && !submissionId) return <JuneListeningTest />;
  if (id === '26' && !submissionId) return <JulyListeningTest />;
    if (id === '2' && !submissionId) return <JanuaryListeningTest />;

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
              <CustomAudioPlayer ref={audioRef} src="/api/audio?id=1OuGcq0z6bZ28Uv0nKogXeu40tEZTD5Jl" />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">
          <div className="w-full max-w-[1000px] min-h-full">
              
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>
                  <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-5</div>
                  <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                  <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>

                  <div className="content-box">
                      <h2 className="font-bold text-[22px] mb-6 text-center text-black">Eco-Farm</h2>
                      <p className="mb-6 italic">The farm is a member of the Northern Hotel Group.</p>
                      
                      <div className="font-bold mb-4 text-[18px]">Personal information</div>
                      <div className="grid grid-cols-[200px_1fr] gap-4 mb-8 items-center">
                          <div>Name:</div>
                          <div>Helen <span className="font-bold mx-2">1</span><input type="text" placeholder="1" className={`ielts-input ${answers[1] ? 'active-state' : ''}`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} /></div>
                          
                          <div>E-mail address (work):</div>
                          <div>helen123@ <span className="font-bold mx-2">2</span><input type="text" placeholder="2" className={`ielts-input ${answers[2] ? 'active-state' : ''}`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} /> .com</div>
                          
                          <div>Home address:</div>
                          <div><span className="font-bold mr-2">3</span><input type="text" placeholder="3" className={`ielts-input ${answers[3] ? 'active-state' : ''}`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} /> Road, Sheffield</div>

                          <div>Source of information:</div>
                          <div><span className="font-bold mr-2">4</span><input type="text" placeholder="4" className={`ielts-input ${answers[4] ? 'active-state' : ''}`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} /></div>

                          <div>Membership number:</div>
                          <div><span className="font-bold mr-2">5</span><input type="text" placeholder="5" className={`ielts-input ${answers[5] ? 'active-state' : ''}`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} /></div>
                      </div>
                  </div>

                  <div className="border-t border-gray-300 pt-8">
                      <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 6-10</div>
                      <div className="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
                      <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                      <table className="w-full border-collapse border border-black text-left mt-4 shadow-sm">
                          <thead>
                              <tr className="bg-gray-100">
                                  <th className="border border-black p-3 font-bold"></th>
                                  <th className="border border-black p-3 font-bold">Recommendations</th>
                                  <th className="border border-black p-3 font-bold">Customer preferences</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr>
                                  <td className="border border-black p-3 font-bold">Accommodation type</td>
                                  <td className="border border-black p-3">lodges</td>
                                  <td className="border border-black p-3">a <span className="font-bold mx-2">6</span><input type="text" placeholder="6" className={`ielts-input ${answers[6] ? 'active-state' : ''}`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} /></td>
                              </tr>
                              <tr>
                                  <td className="border border-black p-3 font-bold">Accommodation location</td>
                                  <td className="border border-black p-3">lakeside</td>
                                  <td className="border border-black p-3">near the farm or in the <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={`ielts-input ${answers[7] ? 'active-state' : ''}`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} /></td>
                              </tr>
                              <tr>
                                  <td className="border border-black p-3 font-bold">Food</td>
                                  <td className="border border-black p-3">a wide range of food</td>
                                  <td className="border border-black p-3">meat, seafood and <span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={`ielts-input ${answers[8] ? 'active-state' : ''}`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} /> food</td>
                              </tr>
                              <tr>
                                  <td className="border border-black p-3 font-bold">Transport</td>
                                  <td className="border border-black p-3">train or <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={`ielts-input ${answers[9] ? 'active-state' : ''}`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} /></td>
                                  <td className="border border-black p-3">ferry and van</td>
                              </tr>
                              <tr>
                                  <td className="border border-black p-3 font-bold">Courses</td>
                                  <td className="border border-black p-3">flower planting courses</td>
                                  <td className="border border-black p-3">active courses (e.g. a <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={`ielts-input ${answers[10] ? 'active-state' : ''}`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} /> course)</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>

              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>
                  <div className="mb-6 font-bold text-[18px] text-gray-800 italic">Questions 11-15</div>
                  <div className="mb-4 italic text-[15px] text-gray-700">The map has nine labels (A - I). Choose the correct label.</div>
                  
                  <div className="flex justify-center mb-8">
                      <svg viewBox="0 0 700 480" className="w-full max-w-[600px] mx-auto bg-white border-2 border-black p-4" xmlns="http://www.w3.org/2000/svg">
                          <g transform="translate(620, 80)">
                              <text x="0" y="-35" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="black">N</text>
                              <line x1="0" y1="-15" x2="0" y2="40" stroke="black" strokeWidth="2" />
                              <line x1="-25" y1="12" x2="25" y2="12" stroke="black" strokeWidth="2" />
                              <polygon points="0,-25 -8,-10 8,-10" fill="black" />
                              <polygon points="-25,12 -15,4 -15,20" fill="black" />
                              <polygon points="25,12 15,4 15,20" fill="black" />
                              <polygon points="0,40 -8,30 8,30" fill="black" />
                          </g>

                          <text x="350" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill="black">Map of Fitchton Railway Station</text>

                          <polyline points="50,360 50,60 530,60 530,360" fill="none" stroke="black" strokeWidth="2" />
                          
                          <line x1="50" y1="360" x2="160" y2="360" stroke="black" strokeWidth="2" />
                          <line x1="160" y1="360" x2="160" y2="345" stroke="black" strokeWidth="2" />
                          
                          <line x1="220" y1="360" x2="530" y2="360" stroke="black" strokeWidth="2" />
                          <line x1="220" y1="360" x2="220" y2="345" stroke="black" strokeWidth="2" />

                          <line x1="20" y1="390" x2="550" y2="390" stroke="black" strokeWidth="2" />
                          <text x="290" y="380" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fill="black">FITCHTON ROAD</text>
                          
                          <rect x="220" y="110" width="130" height="100" fill="none" stroke="black" strokeWidth="1" />
                          <text x="285" y="165" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">A</text>

                          <rect x="55" y="140" width="35" height="60" fill="none" stroke="black" strokeWidth="1" />
                          <text x="72" y="170" transform="rotate(-90 72,170)" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="black">platform2</text>

                          <rect x="55" y="220" width="35" height="80" fill="none" stroke="black" strokeWidth="1" />
                          <text x="72" y="260" transform="rotate(-90 72,260)" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="black">platform1</text>

                          <rect x="55" y="65" width="110" height="60" fill="none" stroke="black" strokeWidth="1" />
                          <text x="110" y="100" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">F</text>

                          <rect x="130" y="150" width="40" height="90" fill="none" stroke="black" strokeWidth="1" />
                          <text x="150" y="200" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">I</text>

                          <rect x="130" y="260" width="100" height="40" fill="none" stroke="black" strokeWidth="1" />
                          <text x="180" y="285" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">E</text>

                          <rect x="70" y="325" width="50" height="30" fill="none" stroke="black" strokeWidth="1" />
                          <text x="95" y="347" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">B</text>

                          <rect x="230" y="315" width="60" height="40" fill="none" stroke="black" strokeWidth="1" />
                          <text x="260" y="342" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">H</text>

                          <rect x="400" y="65" width="125" height="70" fill="none" stroke="black" strokeWidth="1" />
                          <text x="462" y="105" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">C</text>

                          <rect x="380" y="145" width="145" height="45" fill="none" stroke="black" strokeWidth="1" />
                          <text x="480" y="172" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fill="black">cafe</text>
                          <path d="M 400 175 L 420 175 C 425 175 425 180 420 180 L 400 180 Z" fill="black" />
                          <path d="M 402 160 L 418 160 L 415 175 L 405 175 Z" fill="none" stroke="black" strokeWidth="2" />
                          <path d="M 418 162 C 423 162 423 170 418 170" fill="none" stroke="black" strokeWidth="2" />

                          <rect x="440" y="230" width="85" height="45" fill="none" stroke="black" strokeWidth="1" />
                          
                          <rect x="380" y="290" width="145" height="65" fill="none" stroke="black" strokeWidth="1" />
                          <text x="452" y="330" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">D</text>

                          <rect x="330" y="390" width="70" height="30" fill="none" stroke="black" strokeWidth="1" />
                          <text x="365" y="410" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fill="black">taxi stop</text>
                          <line x1="350" y1="420" x2="350" y2="415" stroke="black" strokeWidth="1" />
                          <line x1="380" y1="420" x2="380" y2="415" stroke="black" strokeWidth="1" />

                          <rect x="410" y="390" width="70" height="40" fill="none" stroke="black" strokeWidth="1" />
                          <text x="445" y="418" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="20" fill="black">G</text>
                      </svg>
                  </div>

                  <div className="space-y-4 max-w-[450px] mx-auto mb-12">
                      {[11,12,13,14,15].map(qNum => (
                        <div key={qNum} className="flex items-center justify-between">
                            <span className="font-bold w-8">{qNum}</span>
                            <span className="flex-1">{qNum === 11 ? 'bike racks' : qNum === 12 ? 'luggage lockers' : qNum === 13 ? "chemist's" : qNum === 14 ? 'toilet' : 'news agency'}</span> 
                            <input type="text" placeholder={qNum.toString()} className={`ielts-input ielts-input-short uppercase ${answers[qNum] ? 'active-state' : ''}`} maxLength={1} value={answers[qNum] || ''} onChange={(e) => handleAnswerChange(qNum, e.target.value)} />
                        </div>
                      ))}
                  </div>

                  <div className="border-t border-gray-300 pt-8">
                      <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 16-20</div>
                      <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct answer.</div>

                      <div className="space-y-8">
                          {[
                            { qNum: 16, text: "Where could the passengers see the exhibition?", options: { A: "in the town library", B: "in Fitchton college", C: "in the station" } },
                            { qNum: 17, text: "What is the best gift for passengers to buy and bring home?", options: { A: "local food", B: "clothing", C: "jewelry" } },
                            { qNum: 18, text: "Where can passengers buy souvenir postcards?", options: { A: "in the museum", B: "in the shop", C: "in the college" } },
                            { qNum: 19, text: "What will the old cinema be converted to?", options: { A: "a housing area", B: "a new theatre", C: "a shop" } },
                            { qNum: 20, text: "Who is the statue in the train station modeled after?", options: { A: "a poet", B: "an engineer", C: "a politician" } }
                          ].map(q => (
                             <div key={q.qNum}>
                                <div className="font-bold mb-4 flex text-[16px]"><span className="w-8 shrink-0">{q.qNum}</span><span>{q.text}</span></div>
                                <div className="pl-8 space-y-3">
                                    {['A', 'B', 'C'].map(opt => (
                                        <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.qNum] === opt ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} /> 
                                            <span className="font-bold mr-3">{opt}</span> <span>{q.options[opt as keyof typeof q.options]}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>
                  <div className="mb-6 font-bold text-[18px] text-gray-800 italic">Questions 21-25</div>
                  <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct answer.</div>

                  <div className="space-y-8 mb-12">
                      {[
                            { qNum: 21, text: "What happened to the earliest nurses in Australia?", options: { A: "They were less respected.", B: "They received training overseas.", C: "Their pay was very low." } },
                            { qNum: 22, text: "What was the problem with the nurse training in the 1940s?", options: { A: "Working time was too long.", B: "It took too much time.", C: "Nurses could not finish training." } },
                            { qNum: 23, text: "What was the challenge for nurses in the 1960s?", options: { A: "Work environment was terrible.", B: "Hospitals had more specialised requirements.", C: "They had limited opportunities." } },
                            { qNum: 24, text: "Why did nurses need more advanced skills?", options: { A: "Diseases were complex.", B: "Patients complained.", C: "Doctors requested it." } },
                            { qNum: 25, text: "What is the current situation of nursing department in the hospitals?", options: { A: "The number of nurses is adequate.", B: "Nurses are better trained.", C: "Hospitals can provide satisfying booking service." } }
                      ].map(q => (
                             <div key={q.qNum}>
                                <div className="font-bold mb-4 flex text-[16px]"><span className="w-8 shrink-0">{q.qNum}</span><span>{q.text}</span></div>
                                <div className="pl-8 space-y-3">
                                    {['A', 'B', 'C'].map(opt => (
                                        <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.qNum] === opt ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} /> 
                                            <span className="font-bold mr-3">{opt}</span> <span>{q.options[opt as keyof typeof q.options]}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                      ))}
                  </div>

                  <div className="border-t border-gray-300 pt-8">
                      <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 26 - 30</div>
                      <div className="mb-4 italic text-[15px] text-gray-700">What should be done to the following aspects of kevin's draft?</div>
                      <div className="mb-6 font-bold text-[15px] uppercase">Choose the correct answer A, B, or C.</div>

                      <div className="content-box">
                          <div className="bg-gray-100 p-4 border border-gray-300 mb-8 font-bold space-y-2">
                              <div><span className="mr-3">A.</span> remain unchanged</div>
                              <div><span className="mr-3">B.</span> add information</div>
                              <div><span className="mr-3">C.</span> Remove information</div>
                          </div>

                          <div className="space-y-4 max-w-[450px] mx-auto">
                              {[26,27,28,29,30].map(qNum => (
                                <div key={qNum} className="flex items-center justify-between">
                                    <span className="font-bold w-8">{qNum}</span>
                                    <span className="flex-1 capitalize">{qNum === 26 ? 'background' : qNum === 27 ? 'categories of nursing' : qNum === 28 ? "work conditions" : qNum === 29 ? 'nursing courses' : 'the future of nursing'}</span> 
                                    <input type="text" placeholder={qNum.toString()} className={`ielts-input ielts-input-short uppercase ${answers[qNum] ? 'active-state' : ''}`} maxLength={1} value={answers[qNum] || ''} onChange={(e) => handleAnswerChange(qNum, e.target.value)} />
                                </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>
                  <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-35</div>
                  <div className="mb-4 italic text-[15px] text-gray-700">Complete the sentences below.</div>
                  <div className="mb-6 font-bold text-[15px] uppercase">Write NO MORE THAN TWO WORDS for each answer.</div>

                  <div className="content-box mb-8">
                      <h2 className="font-bold text-[22px] mb-6 text-center text-black">Road congestion and market failure</h2>
                      
                      <ul className="list-none space-y-5 mb-6 pl-2">
                          <li>- Road congestion, carbon emissions, and commercial <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={`ielts-input ${answers[31] ? 'active-state' : ''}`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} /> are example of market failure.</li>
                          <li>- The lecturer defines market failure as the inability of the free market to develop or allocate <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={`ielts-input ${answers[32] ? 'active-state' : ''}`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} /> appropriately.</li>
                          <li>- The lecturer gives the example of <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={`ielts-input ${answers[33] ? 'active-state' : ''}`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} /> as a market failure due to not seeking profit within those markets.</li>
                          <li>- Markets fail partially in many ways, one of which is <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={`ielts-input ${answers[34] ? 'active-state' : ''}`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} /> when too many goods or services are produced.</li>
                          <li>- Customers and producers cannot get other <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={`ielts-input ${answers[35] ? 'active-state' : ''}`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} /> to be responsible for the consequence of their actions.</li>
                      </ul>
                  </div>

                  <div className="border-t border-gray-300 pt-8">
                      <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 36-40</div>
                      <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct answer.</div>

                      <div className="space-y-8">
                          {[
                            { qNum: 36, text: "The speaker's story about London traffic in 1916 is", options: { A: "an amusing story.", B: "relevant digression.", C: "an entertaining apology." } },
                            { qNum: 37, text: "What connection does the lecturer make between public transport and wealth?", options: { A: "like alcohol and vacations, there are fashions in public transport.", B: "as public transport becomes more convenient, more people use it.", C: "use of public transport declines as wealth increases." } },
                            { qNum: 38, text: "Road traffic was reduced in central London from 2011 to 2014 by more than", options: { A: "10%.", B: "30%.", C: "60%." } },
                            { qNum: 39, text: "How does the lecturer evaluate new road building and congestion charging?", options: { A: "congestion charging is less effective than road construction.", B: "they are equally ineffective.", C: "road construction is less effective than congestion charging." } },
                            { qNum: 40, text: "The lecturer thinks most drivers who contribute to congestion are", options: { A: "unconcerned.", B: "unaware.", C: "undecided." } }
                          ].map(q => (
                             <div key={q.qNum}>
                                <div className="font-bold mb-4 flex text-[16px]"><span className="w-8 shrink-0">{q.qNum}</span><span>{q.text}</span></div>
                                <div className="pl-8 space-y-3">
                                    {['A', 'B', 'C'].map(opt => (
                                        <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.qNum] === opt ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} /> 
                                            <span className="font-bold mr-3">{opt}</span> <span>{q.options[opt as keyof typeof q.options]}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                          ))}
                      </div>
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
