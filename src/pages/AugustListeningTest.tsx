import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';
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
    1: 'collecting', 2: 'records', 3: 'West', 4: 'transport', 5: 'art',
    6: 'hospital', 7: 'garden', 8: 'quiz', 9: 'tickets', 10: 'poster',
    11: 'B', 12: 'C', 13: 'C', 14: 'B', 15: 'D',
    16: 'C', 17: 'G', 18: 'A', 19: 'E', 20: 'F',
    21: 'D', 22: 'E', 23: 'D', 24: 'C', 25: 'A',
    26: 'E', 27: 'F', 28: 'B', 29: 'C', 30: 'C',
    31: '321,000', 32: 'vocabulary', 33: 'podcast', 34: 'smartphones', 35: 'bilingual',
    36: 'playground', 37: 'picture', 38: 'grammar', 39: 'identity', 40: 'fluent'
};

export function AugustListeningTest({ submissionId }: { submissionId?: string }) {

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
      let title = 'August Listening Practice (IELTS)';
      
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
      else if (score >= 1) bandScore = 1.0;

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
            <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">August IELTS Listening Test</h1>
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
                  src="/api/audio?id=1A-Tu0PuDY4QLt3NZpa11Ww5c7EMKUYq_" 
                  isMockMode={testMode === 'mock'} 
                  onPlayClick={() => { window.open('https://drive.google.com/file/d/1A-Tu0PuDY4QLt3NZpa11Ww5c7EMKUYq_/view?usp=sharing', '_blank'); return true; }}
              />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">
          <div className="w-full max-w-[1000px] min-h-full">
<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 1-7</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

    <div className="border border-black p-6 mb-8">
        <h3 className="text-center font-bold text-[20px] mb-4">Opportunities for voluntary work in Southoe village</h3>
        
        <p className="font-bold mb-2">Library</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Help with <span className="font-bold mx-2">1</span><input type="text" placeholder="1" className={`ielts-input ${answers[1] ? 'active-state' : ''}`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} disabled={isSubmitted} /> books (times to be arranged)</li>
            <li>Help needed to keep <span className="font-bold mx-2">2</span><input type="text" placeholder="2" className={`ielts-input ${answers[2] ? 'active-state' : ''}`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} disabled={isSubmitted} /> of books up to date</li>
            <li>Library is in the <span className="font-bold mx-2">3</span><input type="text" placeholder="3" className={`ielts-input ${answers[3] ? 'active-state' : ''}`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} disabled={isSubmitted} /> Room in the village hall</li>
        </ul>

        <p className="font-bold mb-2">Lunch club</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Help by providing <span className="font-bold mx-2">4</span><input type="text" placeholder="4" className={`ielts-input ${answers[4] ? 'active-state' : ''}`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} disabled={isSubmitted} /> </li>
            <li>Help with hobbies such as <span className="font-bold mx-2">5</span><input type="text" placeholder="5" className={`ielts-input ${answers[5] ? 'active-state' : ''}`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} disabled={isSubmitted} /> </li>
        </ul>

        <p className="font-bold mb-2">Help for individuals needed next week</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Taking Mrs Carroll to <span className="font-bold mx-2">6</span><input type="text" placeholder="6" className={`ielts-input ${answers[6] ? 'active-state' : ''}`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} disabled={isSubmitted} /> </li>
            <li>Work in the <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={`ielts-input ${answers[7] ? 'active-state' : ''}`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} disabled={isSubmitted} /> at Mr Selsbury's house</li>
        </ul>
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700">Questions 8-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

    <table className="w-full border-collapse border border-black mb-8">
        <thead>
            <tr>
                <th colSpan={4} className="border border-black bg-gray-100 p-2 text-center font-bold">Village social events</th>
            </tr>
            <tr>
                <th className="border border-black bg-gray-100 p-2 text-left">Date</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Event</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Location</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Help needed</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border border-black p-2">19 Oct</td>
                <td className="border border-black p-2"><span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={`ielts-input ${answers[8] ? 'active-state' : ''}`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} disabled={isSubmitted} /></td>
                <td className="border border-black p-2">Village hall</td>
                <td className="border border-black p-2">providing refreshments</td>
            </tr>
            <tr>
                <td className="border border-black p-2">18 Nov</td>
                <td className="border border-black p-2">dance</td>
                <td className="border border-black p-2">Village hall</td>
                <td className="border border-black p-2">checking <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={`ielts-input ${answers[9] ? 'active-state' : ''}`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} disabled={isSubmitted} /></td>
            </tr>
            <tr>
                <td className="border border-black p-2">31 Dec</td>
                <td className="border border-black p-2">New Year's Eve party</td>
                <td className="border border-black p-2">Mountfort Hotel</td>
                <td className="border border-black p-2">designing the <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={`ielts-input ${answers[10] ? 'active-state' : ''}`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} disabled={isSubmitted} /></td>
            </tr>
        </tbody>
    </table>
  
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11-20</div>
    
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 11-14</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose the correct letter, A, B or C.</div>

    <h3 className="text-right font-bold text-[20px] mb-6 mr-12">Oniton Hall</h3>

    {[
        { num: 11, q: "Many past owners made changes to", options: ["the gardens.", "the house.", "the farm."] },
        { num: 12, q: "Sir Edward Downes built Oniton Hall because he wanted", options: ["a place for discussing politics.", "a place to display his wealth.", "a place for artists and writers."] },
        { num: 13, q: "Visitors can learn about the work of servants in the past from", options: ["audio guides.", "photographs.", "people in costume."] },
        { num: 14, q: "What is new for children at Oniton Hall?", options: ["clothes for dressing up", "mini tractors", "the adventure playground"] }
    ].map(q => (
        <div key={q.num} className="mb-8">
            <div className="flex gap-4 mb-4">
                <span className="font-bold">{q.num}</span>
                <span>{q.q}</span>
            </div>
            <div className="pl-8 space-y-3">
                {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                        <label key={i} className={`mcq-label ${answers[q.num] === letter ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name={`q${q.num}`} 
                                className="mcq-radio"
                                checked={answers[q.num] === letter}
                                onChange={() => handleAnswerChange(q.num, letter)}
                                disabled={isSubmitted}
                            />
                            <span className="font-bold mr-2">{letter}</span>
                            <span>{opt}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    ))}

    <div className="mb-4 italic text-[15px] text-gray-700 mt-8">Questions 15-20</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which activity is offered at each of the following locations on the farm?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15-20.</div>

    <div className="border border-black p-6 w-3/4 mx-auto mb-8">
        <h4 className="text-center font-bold mb-4">Activities</h4>
        <ul className="list-none space-y-2">
            {[
                "shopping", "watching cows being milked", "seeing old farming equipment",
                "eating and drinking", "starting a trip", "seeing rare breeds of animals",
                "helping to look after animals", "using farming tools"
            ].map((activity, idx) => (
                <li key={idx}><span className="font-bold mr-4">{String.fromCharCode(65 + idx)}</span> {activity}</li>
            ))}
        </ul>
    </div>

    <div className="ml-[10%] mb-10">
        <p className="font-bold mb-6">Locations on the farm</p>
        <div className="space-y-4">
            {[
                { num: 15, text: "dairy" },
                { num: 16, text: "large barn" },
                { num: 17, text: "small barn" },
                { num: 18, text: "stables" },
                { num: 19, text: "shed" },
                { num: 20, text: "parkland" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-40">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={`ielts-input w-12 ${answers[q.num] ? 'active-state' : ''}`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
  
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21-30</div>
    
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 21 and 22</div>
    <div className="mb-4 font-bold text-[15px] uppercase">Choose TWO letters, A-E.</div>
    <div className="mb-6">Which TWO things do the students agree they need to include in their reviews of <i className="font-normal">Romeo and Juliet</i>?</div>

    <div className="pl-8 space-y-3 mb-10">
        {[
            "analysis of the text", 
            "a summary of the plot", 
            "a description of the theatre", 
            "a personal reaction", 
            "a reference to particular scenes"
        ].map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = [answers[21], answers[22]].includes(letter);
            return (
                <label key={i} className={`mcq-label ${isSelected ? 'selected' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="mcq-radio"
                        checked={isSelected}
                        onChange={(e) => {
                            if (e.target.checked) {
                                if (!answers[21]) handleAnswerChange(21, letter);
                                else if (!answers[22]) handleAnswerChange(22, letter);
                            } else {
                                if (answers[21] === letter) handleAnswerChange(21, '');
                                else if (answers[22] === letter) handleAnswerChange(22, '');
                            }
                        }}
                        disabled={isSubmitted}
                    />
                    <span className="font-bold mr-2">{letter}</span>
                    <span>{opt}</span>
                </label>
            );
        })}
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700">Questions 23-27</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which opinion do the speakers give about each of the following aspects of The Emporium's production of <i>Romeo and Juliet</i>?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23-27.</div>

    <div className="border border-black p-6 w-4/5 mx-auto mb-8">
        <h4 className="text-center font-bold mb-4">Opinions</h4>
        <ul className="list-none space-y-2">
            {[
                "They both expected this to be more traditional.",
                "They both thought this was original.",
                "They agree this created the right atmosphere.",
                "They agree this was a major strength.",
                "They were both disappointed by this.",
                "They disagree about why this was an issue.",
                "They disagree about how this could be improved."
            ].map((opinion, idx) => (
                <li key={idx}><span className="font-bold mr-4">{String.fromCharCode(65 + idx)}</span> {opinion}</li>
            ))}
        </ul>
    </div>

    <div className="ml-[10%] mb-10">
        <p className="font-bold mb-6">Aspects of the production</p>
        <div className="space-y-4">
            {[
                { num: 23, text: "the set" },
                { num: 24, text: "the lighting" },
                { num: 25, text: "the costume design" },
                { num: 26, text: "the music" },
                { num: 27, text: "the actors' delivery" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-48">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={`ielts-input w-12 ${answers[q.num] ? 'active-state' : ''}`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700 mt-8">Questions 28-30</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose the correct letter, A, B or C.</div>

    {[
        { num: 28, q: "The students think the story of Romeo and Juliet is still relevant for young people today because", options: ["it illustrates how easily conflict can start.", "it deals with problems that families experience.", "it teaches them about relationships."] },
        { num: 29, q: "The students found watching Romeo and Juliet in another language", options: ["frustrating.", "demanding.", "moving."] },
        { num: 30, q: "Why do the students think Shakespeare's plays have such international appeal?", options: ["The stories are exciting.", "There are recognisable characters.", "They can be interpreted in many ways."] }
    ].map(q => (
        <div key={q.num} className="mb-8">
            <div className="flex gap-4 mb-4">
                <span className="font-bold">{q.num}</span>
                <span>{q.q}</span>
            </div>
            <div className="pl-8 space-y-3">
                {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                        <label key={i} className={`mcq-label ${answers[q.num] === letter ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name={`q${q.num}`} 
                                className="mcq-radio"
                                checked={answers[q.num] === letter}
                                onChange={() => handleAnswerChange(q.num, letter)}
                                disabled={isSubmitted}
                            />
                            <span className="font-bold mr-2">{letter}</span>
                            <span>{opt}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    ))}
  
</div>

<div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>
    
    <div className="border border-black p-6 mb-8">
        <h3 className="text-left font-bold text-[20px] mb-6">The impact of digital technology on the Icelandic language</h3>
        
        <p className="font-bold mb-2">The Icelandic language</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>has approximately <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={`ielts-input ${answers[31] ? 'active-state' : ''}`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} disabled={isSubmitted} /> speakers</li>
            <li>has a <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={`ielts-input ${answers[32] ? 'active-state' : ''}`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} disabled={isSubmitted} /> that is still growing</li>
            <li>has not changed a lot over the last thousand years</li>
            <li>has its own words for computer-based concepts, such as web browser and <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={`ielts-input ${answers[33] ? 'active-state' : ''}`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} disabled={isSubmitted} /> </li>
        </ul>

        <p className="font-bold mb-2">Young speakers</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>are big users of digital technology, such as <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={`ielts-input ${answers[34] ? 'active-state' : ''}`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} disabled={isSubmitted} /> </li>
            <li>are becoming <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={`ielts-input ${answers[35] ? 'active-state' : ''}`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} disabled={isSubmitted} /> very quickly</li>
            <li>are having discussions using only English while they are in the <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className={`ielts-input ${answers[36] ? 'active-state' : ''}`} value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} disabled={isSubmitted} /> at school</li>
            <li>are better able to identify the content of a <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className={`ielts-input ${answers[37] ? 'active-state' : ''}`} value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} disabled={isSubmitted} /> in English than Icelandic</li>
        </ul>

        <p className="font-bold mb-2">Technology and internet companies</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>write very little in Icelandic because of the small number of speakers and because of how complicated its <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className={`ielts-input ${answers[38] ? 'active-state' : ''}`} value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} disabled={isSubmitted} /> is</li>
        </ul>

        <p className="font-bold mb-2">The Icelandic government</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>has set up a fund to support the production of more digital content in the language</li>
            <li>believes that Icelandic has a secure future</li>
            <li>is worried that young Icelanders may lose their <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className={`ielts-input ${answers[39] ? 'active-state' : ''}`} value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} disabled={isSubmitted} /> as Icelanders</li>
            <li>is worried about the consequences of children not being <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className={`ielts-input ${answers[40] ? 'active-state' : ''}`} value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} disabled={isSubmitted} /> in either Icelandic or English</li>
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
