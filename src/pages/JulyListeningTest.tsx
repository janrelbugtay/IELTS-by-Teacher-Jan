import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router';
import { CheckCircle2, ArrowLeft, Info, Menu } from 'lucide-react';
import { CustomAudioPlayer } from '../components/CustomAudioPlayer';
import { FebruaryListeningTest } from './FebruaryListeningTest';

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
    1: 'LEIGH', 2: 'MOTORBIKE', 3: 'HAIRDRESSER', 4: 'SUIT', 5: 'LAPTOP',
    6: 'MONDAY', 7: 'COFFEE', 8: 'BOOKS', 9: 'PLANTS', 10: 'CINEMA',
    11: 'C / E', 12: 'E / C', 13: 'A / B', 14: 'B / A', 15: 'C',
    16: 'G', 17: 'D', 18: 'A', 19: 'F', 20: 'B',
    21: 'B', 22: 'A', 23: 'B', 24: 'B', 25: 'E',
    26: 'I', 27: 'A', 28: 'D', 29: 'H', 30: 'G',
    31: 'ROUTINE', 32: 'TRIALS', 33: 'CALMING', 34: 'PILLOWS', 35: 'ANXIETY',
    36: 'MEDICATION', 37: 'AWAKE', 38: 'DISTRACTION', 39: 'NATURE', 40: 'VOLUME'
};

export function JulyListeningTest({ submissionId }: { submissionId?: string }) {

  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  if (id === '6' && !submissionId) {
      return <FebruaryListeningTest />;
  }

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
      let title = 'June Listening Practice';
      
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
              <CustomAudioPlayer 
                  ref={audioRef} 
                  src="/api/audio?id=1fjJ_EmkcFK8tm9C7EbehCVERPuQy5EZV" 
                  isMockMode={testMode === 'mock'} 
                  onPlayClick={() => { window.open('https://drive.google.com/file/d/1fjJ_EmkcFK8tm9C7EbehCVERPuQy5EZV/view?usp=sharing', '_blank'); return true; }}
              />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">
          <div className="w-full max-w-[1000px] min-h-full">
<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the form below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>
    <div className="content-box">
        <h2 className="font-bold text-[22px] mb-6 text-black tracking-wide text-center">Survey about shopping in Broadbeach</h2>
        <p className="mb-4"><strong>Name:</strong> Martyn <span className="font-bold mx-2">1</span><input type="text" placeholder="1" className={`ielts-input ${answers[1] ? 'active-state' : ''}`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} disabled={isSubmitted} /></p>
        
        <p className="mb-4"><strong>Today's journey to Broadbeach town centre:</strong><br/>
        used his <span className="font-bold mx-2">2</span><input type="text" placeholder="2" className={`ielts-input ${answers[2] ? 'active-state' : ''}`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} disabled={isSubmitted} /></p>

        <p className="mb-2"><strong>Purpose of today's trip:</strong></p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>has visited the <span className="font-bold mx-2">3</span><input type="text" placeholder="3" className={`ielts-input ${answers[3] ? 'active-state' : ''}`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} disabled={isSubmitted} /></li>
            <li>looking for a new <span className="font-bold mx-2">4</span><input type="text" placeholder="4" className={`ielts-input ${answers[4] ? 'active-state' : ''}`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} disabled={isSubmitted} /></li>
            <li>collecting <span className="font-bold mx-2">5</span><input type="text" placeholder="5" className={`ielts-input ${answers[5] ? 'active-state' : ''}`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} disabled={isSubmitted} /> (after repair)</li>
        </ul>

        <p className="mb-6"><strong>Preferred day for shopping:</strong> <span className="font-bold mx-2">6</span><input type="text" placeholder="6" className={`ielts-input ${answers[6] ? 'active-state' : ''}`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} disabled={isSubmitted} /></p>

        <p className="mb-2 font-bold text-[18px]">Opinions about shopping in the town centre</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Finds the service in shops is excellent</li>
            <li>Thinks there are too many places selling <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={`ielts-input ${answers[7] ? 'active-state' : ''}`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} disabled={isSubmitted} /></li>
            <li>Would like more places to buy <span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={`ielts-input ${answers[8] ? 'active-state' : ''}`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} disabled={isSubmitted} /></li>
        </ul>

        <p className="mb-2 font-bold text-[18px]">Opinions about new out-of-town Shopping Centre</p>
        <ul className="list-disc pl-6 space-y-2">
            <li>Likes the <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={`ielts-input ${answers[9] ? 'active-state' : ''}`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} disabled={isSubmitted} /> best</li>
            <li>Believes the <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={`ielts-input ${answers[10] ? 'active-state' : ''}`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} disabled={isSubmitted} /> is unnecessary</li>
        </ul>
    </div>
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11 and 12</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>
    <div className="content-box mb-8">
        <p className="mb-4">In which TWO areas of the business exhibition did James Craig promote his company last year?</p>
        <div className="space-y-2 mb-4">
            {['A', 'B', 'C', 'D', 'E'].map(opt => (
                <div key={opt} className="flex items-start">
                    <span className="font-bold mr-3">{opt}</span> {opt === 'A' ? 'the Digital Marketing Centre' : opt === 'B' ? 'the TalkCon Zone' : opt === 'C' ? 'the Breakout area' : opt === 'D' ? 'the Business Village' : 'the Business Connections Zone'}
                </div>
            ))}
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex items-center">
                <span className="font-bold mr-2">11</span>
                <input type="text" placeholder="11" className={`ielts-input w-12 ${answers[11] ? 'active-state' : ''}`} value={answers[11] || ''} onChange={(e) => handleAnswerChange(11, e.target.value)} disabled={isSubmitted} />
            </div>
            <div className="flex items-center">
                <span className="font-bold mr-2">12</span>
                <input type="text" placeholder="12" className={`ielts-input w-12 ${answers[12] ? 'active-state' : ''}`} value={answers[12] || ''} onChange={(e) => handleAnswerChange(12, e.target.value)} disabled={isSubmitted} />
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 13 and 14</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>
    <div className="content-box mb-8">
        <p className="mb-4">Which TWO facts are given about discounts on popular brands available to exhibitors?</p>
        <div className="space-y-2 mb-4">
            {['A', 'B', 'C', 'D', 'E'].map(opt => (
                <div key={opt} className="flex items-start">
                    <span className="font-bold mr-3">{opt}</span> {opt === 'A' ? 'They are available to all members of exhibiting companies.' : opt === 'B' ? 'They can be used for both food and clothing.' : opt === 'C' ? 'They only apply if people spend at least £400.' : opt === 'D' ? 'They can be used by family members.' : 'The percentage saved is always the same.'}
                </div>
            ))}
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex items-center">
                <span className="font-bold mr-2">13</span>
                <input type="text" placeholder="13" className={`ielts-input w-12 ${answers[13] ? 'active-state' : ''}`} value={answers[13] || ''} onChange={(e) => handleAnswerChange(13, e.target.value)} disabled={isSubmitted} />
            </div>
            <div className="flex items-center">
                <span className="font-bold mr-2">14</span>
                <input type="text" placeholder="14" className={`ielts-input w-12 ${answers[14] ? 'active-state' : ''}`} value={answers[14] || ''} onChange={(e) => handleAnswerChange(14, e.target.value)} disabled={isSubmitted} />
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 15-20</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which topic will each of the following speakers focus on?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-G, next to Questions 15-20.</div>
    
    <div className="content-box mb-8">
        <div className="mb-6 p-4 border border-gray-300 bg-gray-50 rounded">
            <div className="font-bold mb-2">Topics</div>
            <div className="space-y-2">
                <div><span className="font-bold mr-2">A</span>Supporting job seekers</div>
                <div><span className="font-bold mr-2">B</span>Dealing with personal problems</div>
                <div><span className="font-bold mr-2">C</span>Effects of an unexpectedly rapid expansion</div>
                <div><span className="font-bold mr-2">D</span>A global range of business experiences</div>
                <div><span className="font-bold mr-2">E</span>Coping with financial set-backs</div>
                <div><span className="font-bold mr-2">F</span>Developing a company in response to changing markets</div>
                <div><span className="font-bold mr-2">G</span>Combining business success with contributions to charities</div>
            </div>
        </div>
        
        <div className="space-y-4">
            {[
                { num: 15, text: "Jim Clowrie" },
                { num: 16, text: "David France" },
                { num: 17, text: "Oliver Stanton" },
                { num: 18, text: "Francesca Heptonstall" },
                { num: 19, text: "Salman Khan" },
                { num: 20, text: "Annie Craven" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-48">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={`ielts-input w-12 ${answers[q.num] ? 'active-state' : ''}`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21-23</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B or C</span>.</div>
    <div className="content-box mb-8">
        <div className="space-y-6">
            <div>
                <p className="mb-2"><span className="font-bold mr-2">21</span>Which aspect of their presentation are Mia and Leo both concerned about?</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="A" checked={answers[21] === 'A'} onChange={() => handleAnswerChange(21, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> meeting the deadline</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="B" checked={answers[21] === 'B'} onChange={() => handleAnswerChange(21, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> finding suitable examples</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="C" checked={answers[21] === 'C'} onChange={() => handleAnswerChange(21, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> including original ideas</span>
                    </label>
                </div>
            </div>

            <div>
                <p className="mb-2"><span className="font-bold mr-2">22</span>The students decide to focus their assignment on housing for</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="A" checked={answers[22] === 'A'} onChange={() => handleAnswerChange(22, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> family groups.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="B" checked={answers[22] === 'B'} onChange={() => handleAnswerChange(22, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> old people.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="C" checked={answers[22] === 'C'} onChange={() => handleAnswerChange(22, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> single people.</span>
                    </label>
                </div>
            </div>

            <div>
                <p className="mb-2"><span className="font-bold mr-2">23</span>The students agree that demand for accommodation in urban areas should be met by</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="A" checked={answers[23] === 'A'} onChange={() => handleAnswerChange(23, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> repurposing offices and factories.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="B" checked={answers[23] === 'B'} onChange={() => handleAnswerChange(23, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> constructing tall buildings.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="C" checked={answers[23] === 'C'} onChange={() => handleAnswerChange(23, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> developing creative ideas for smaller homes.</span>
                    </label>
                </div>
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 24-30</div>
    <div className="mb-4 italic text-[15px] text-gray-700">What opinion do the students express about each of the following housing ideas?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SEVEN answers from the box and write the correct letter, A-I, next to Questions 24-30.</div>
    
    <div className="content-box mb-8">
        <div className="mb-6 p-4 border border-gray-300 bg-gray-50 rounded">
            <div className="font-bold mb-2">Opinions</div>
            <div className="space-y-2">
                <div><span className="font-bold mr-2">A</span>This could cause unnecessary anxiety.</div>
                <div><span className="font-bold mr-2">B</span>This would be especially beneficial for city residents.</div>
                <div><span className="font-bold mr-2">C</span>This would be challenging for young people.</div>
                <div><span className="font-bold mr-2">D</span>This would have environmental benefits.</div>
                <div><span className="font-bold mr-2">E</span>This could encourage creativity.</div>
                <div><span className="font-bold mr-2">F</span>This could lead to social problems.</div>
                <div><span className="font-bold mr-2">G</span>This could enable retired people to share a project.</div>
                <div><span className="font-bold mr-2">H</span>This would help some people but cause problems for others.</div>
                <div><span className="font-bold mr-2">I</span>This would suit both existing and new members of a household.</div>
            </div>
        </div>
        
        <div className="space-y-4">
            {[
                { num: 24, text: "use of roof space for gardens" },
                { num: 25, text: "shared working spaces" },
                { num: 26, text: "moveable internal walls" },
                { num: 27, text: "smart mirrors in bathrooms" },
                { num: 28, text: "bike sheds with charging points" },
                { num: 29, text: "restriction of cars to certain areas" },
                { num: 30, text: "communal vegetable plots" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-64">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={`ielts-input w-12 ${answers[q.num] ? 'active-state' : ''}`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>
    <div className="content-box mb-8">
        <h2 className="font-bold text-[22px] mb-6 text-black tracking-wide text-center">Music therapy for surgical patients</h2>
        
        <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Background</div>
        <ul className="list-disc space-y-4 mb-8 pl-6">
            <li>Surgery impacts patients because they may experience discomfort or unwelcome changes to their <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={`ielts-input ${answers[31] ? 'active-state' : ''}`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Current post-surgical strategies focus mainly on pain relief.</li>
        </ul>

        <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Recent research</div>
        <ul className="list-disc space-y-4 mb-8 pl-6">
            <li>A study reviewed data from about 100 <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={`ielts-input ${answers[32] ? 'active-state' : ''}`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} disabled={isSubmitted} /> and found that listening to music:
                <ul className="list-none space-y-2 mt-2 pl-6">
                    <li className="flex items-start">&ndash; <span className="ml-2 flex-1">improved hospital patients' sense of wellbeing.</span></li>
                    <li className="flex items-start">&ndash; <span className="ml-2 flex-1">reduced the length of their stay.</span></li>
                </ul>
            </li>
            <li>The patients in the study all listened to music with a <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={`ielts-input ${answers[33] ? 'active-state' : ''}`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} disabled={isSubmitted} /> effect.</li>
            <li>The music was mostly played through music <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={`ielts-input ${answers[34] ? 'active-state' : ''}`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Patients reported an absence or low levels of <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={`ielts-input ${answers[35] ? 'active-state' : ''}`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Medical records confirmed that patients who were played music in hospital needed less <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className={`ielts-input ${answers[36] ? 'active-state' : ''}`} value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} disabled={isSubmitted} /> than those who weren't played music.</li>
            <li>The best results were achieved when patients were played music while they were <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className={`ielts-input ${answers[37] ? 'active-state' : ''}`} value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>The study concluded that playing music was effective because it served as a <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className={`ielts-input ${answers[38] ? 'active-state' : ''}`} value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>The researchers recommend playing either music or sounds from <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className={`ielts-input ${answers[39] ? 'active-state' : ''}`} value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} disabled={isSubmitted} /> to all surgical patients.</li>
            <li>A future study will investigate the best <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className={`ielts-input ${answers[40] ? 'active-state' : ''}`} value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} disabled={isSubmitted} /> for the music.</li>
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
