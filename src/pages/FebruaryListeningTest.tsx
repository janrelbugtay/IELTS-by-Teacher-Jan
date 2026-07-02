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
    1: 'ELSINORE', 2: '077896245', 3: 'WAITER', 4: 'BASEBALL', 5: 'BEACH',
    6: 'DIVING', 7: 'OCTOBER', 8: 'SATURDAY', 9: '6', 10: 'RADIO',
    11: 'B', 12: 'E', 13: 'F', 14: 'I', 15: 'C',
    16: 'C', 17: 'A', 18: 'B', 19: 'A', 20: 'A',
    21: 'B', 22: 'E', 23: 'C', 24: 'G', 25: 'F',
    26: 'B', 27: 'C', 28: 'A', 29: 'C', 30: 'C',
    31: 'NETS', 32: 'SMILE', 33: 'RATS', 34: 'AWARE', 35: 'INSTINCTIVE',
    36: 'WALKING', 37: 'NEWSPAPER', 38: 'SOCIAL', 39: 'WHISTLE', 40: 'FIGHT'
};

export function FebruaryListeningTest({ submissionId }: { submissionId?: string }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [hasStarted, setHasStarted] = useState(false);
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
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && hasStarted && !isSubmitted) {
      if (timer) clearInterval(timer);
      submitTest();
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, isSubmitted]);

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
      let title = 'February Listening Practice';
      
      const checkAnswer = (qNum: number) => {
          let userAns = (answers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
          const correctAns = LISTENING_ANSWER_KEY[qNum];
          if (!correctAns) return false;

          if (userAns === 'T') userAns = 'TRUE';
          if (userAns === 'F') userAns = 'FALSE';
          if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
          if (userAns === 'Y') userAns = 'YES';
          if (userAns === 'N' && String(correctAns).includes('NO')) userAns = 'NO';

          const correctAnswers = String(correctAns).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
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

        const correctAnswers = String(correctAns).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
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
      <div className="fixed inset-0 bg-[#e1e5eb] z-50 flex flex-col items-center justify-center">
        <div className="bg-white p-10 rounded shadow-lg w-[450px] border border-gray-300">
            <h1 className="text-2xl font-bold mb-2 text-center text-black">IELTS Listening Test</h1>
            <p className="text-sm text-gray-600 text-center mb-8">Please enter your details to begin the test.</p>
            
            <form onSubmit={handleStart} className="mb-6">
                <label className="block text-sm font-bold mb-2 text-gray-800">Full Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full border border-gray-400 p-2.5 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    placeholder="e.g. John Doe" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                />
                
                <button type="submit" disabled={!studentName.trim()} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow-sm text-lg disabled:opacity-50">
                    Start Test
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
              <CustomAudioPlayer ref={audioRef} src="/api/audio?id=1I6JggwdPrDoYsFdD24l7iNda1nWizFcV" />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">
          <div className="w-full max-w-[1000px] min-h-full">
              
              
              {/* Part 1 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 1 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1 - 10</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>

                <div className="border border-[#333] p-6 bg-white mb-6">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Lifeguard Application</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="font-bold underline text-[17px] mb-2">Personal information</div>
                            <div className="pl-4 space-y-2">
                                <div>Name: Peter Smith</div>
                                <div>Address: 130 South Main Street, Lake <span className="font-bold mx-1">1</span><input type="text" placeholder="1" className="ielts-input" value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} /></div>
                                <div>Contact number: <span className="font-bold mx-1">2</span><input type="text" placeholder="2" className="ielts-input" value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} /> (cellphone)</div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="font-bold underline text-[17px] mb-2">Work experience:</div>
                            <ul className="list-none space-y-2 pl-4">
                                <li>&bull; has a part-time job as a <span className="font-bold mx-1">3</span><input type="text" placeholder="3" className="ielts-input" value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} /></li>
                                <li>&bull; is studying PE now</li>
                                <li>&bull; hope to work in a high school as a <span className="font-bold mx-1">4</span><input type="text" placeholder="4" className="ielts-input" value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} /></li>
                            </ul>
                            <div className="pl-4 mt-2">Other relevant work experience: worked at the <span className="font-bold mx-1">5</span><input type="text" placeholder="5" className="ielts-input" value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} /></div>
                        </div>

                        <div>
                            <div className="font-bold underline text-[17px] mb-2">Qualification for water safety:</div>
                            <ul className="list-none space-y-2 pl-4">
                                <li>&bull; Good level of concentration</li>
                                <li>&bull; Good vision</li>
                                <li>&bull; Other relevant skills: <span className="font-bold mx-1">6</span><input type="text" placeholder="6" className="ielts-input" value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} /></li>
                                <li>&bull; need a certificate: it expires in <span className="font-bold mx-1">7</span><input type="text" placeholder="7" className="ielts-input" value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} /></li>
                            </ul>
                        </div>

                        <div>
                            <div className="font-bold underline text-[17px] mb-2">Other information</div>
                            <ul className="list-none space-y-2 pl-4">
                                <li>&bull; Preferred working time: <span className="font-bold mx-1">8</span><input type="text" placeholder="8" className="ielts-input" value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} /> mornings</li>
                                <li>&bull; He can start to work at <span className="font-bold mx-1">9</span><input type="text" placeholder="9" className="ielts-input" value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} /> o'clock</li>
                                <li>&bull; Source of information: <span className="font-bold mx-1">10</span><input type="text" placeholder="10" className="ielts-input" value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} /> coach as a lifeguard</li>
                            </ul>
                        </div>
                    </div>
                </div>
              </div>

              {/* Part 2 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 2 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11 - 14</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Label the map below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write the correct letter, <span className="font-bold">A-I</span>, next to Questions 11–14.</div>

                <div className="bg-blue-50 border border-blue-200 p-6 shadow-sm mb-8">
                    <div className="font-bold mb-4 text-center text-[17px]">Map Labels (Drag & Drop or Type)</div>
                    <div className="flex flex-wrap justify-center gap-4 pl-4">
                        {['A','B','C','D','E','F','G','H','I'].map(char => (
                          <span key={char} className="inline-flex items-center justify-center w-8 h-8 bg-white border border-gray-400 rounded text-sm font-bold shadow-sm hover:bg-gray-50 transition shrink-0 cursor-grab">{char}</span>
                        ))}
                    </div>
                </div>

                <div className="border border-[#333] p-6 bg-white mb-6 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 relative border border-gray-300 rounded bg-gray-100 flex items-center justify-center min-h-[350px] w-full overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/d/1CvMIknSf0ko65SIfILwJ813prTubmKb_" alt="Map" className="relative z-10 w-full h-auto rounded bg-white shadow-sm" />
                    </div>
                    <div className="w-full md:w-64 space-y-4 shrink-0 mt-4 md:mt-0">
                        <div className="flex items-center justify-between"><span className="font-bold w-8">11</span><span className="flex-1">rocks</span> <input type="text" placeholder="11" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[11] || ''} onChange={(e) => handleAnswerChange(11, e.target.value)} /></div>
                        <div className="flex items-center justify-between"><span className="font-bold w-8">12</span><span className="flex-1">Corley nature reserve</span> <input type="text" placeholder="12" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[12] || ''} onChange={(e) => handleAnswerChange(12, e.target.value)} /></div>
                        <div className="flex items-center justify-between"><span className="font-bold w-8">13</span><span className="flex-1">Ashington china factory</span> <input type="text" placeholder="13" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[13] || ''} onChange={(e) => handleAnswerChange(13, e.target.value)} /></div>
                        <div className="flex items-center justify-between"><span className="font-bold w-8">14</span><span className="flex-1">Langton forest</span> <input type="text" placeholder="14" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[14] || ''} onChange={(e) => handleAnswerChange(14, e.target.value)} /></div>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8 mt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 15 - 20</div>
                    <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B</span> or <span className="font-bold">C</span>.</div>
                    
                    <div className="space-y-8">
                        {[
                          { q: 15, text: "What warning does the speaker give about cycling on the Elmsden Way?", options: { A: "The roads usually have heavy traffic.", B: "Bad weather can cause problems.", C: "There may be animals on the cycle path." } },
                          { q: 16, text: "What does the speaker say about Elmsden Station?", options: { A: "It is a very busy station.", B: "It has been modernized.", C: "It reopened recently." } },
                          { q: 17, text: "In the Visitors' Centre, people can", options: { A: "hire a bicycle.", B: "buy refreshments.", C: "learn about local history." } },
                          { q: 18, text: "If cyclists want to travel between Elmsden and Langton by train,", options: { A: "they need to book in advance.", B: "they have to travel at the weekend.", C: "they must pay an additional charge for their bicycle." } },
                          { q: 19, text: "What warning does the speaker give about walking to the River Elm?", options: { A: "It can take a long time to get back.", B: "There is nowhere to leave bicycles.", C: "The waterfall is inaccessible on foot." } },
                          { q: 20, text: "To find out about other cycle paths in the region, you can", options: { A: "look in the local newspaper.", B: "check the radio station website.", C: "ring up the national cycle network." } }
                        ].map((item) => (
                          <div key={item.q}>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">{item.q}</span><span>{item.text}</span></div>
                            <div className="pl-8 space-y-1">
                                {Object.entries(item.options).map(([val, label]) => (
                                  <label key={val} className={`mcq-label ${answers[item.q] === val ? "selected" : ""}`}><input type="radio" name={`q${item.q}`} value={val} checked={answers[item.q] === val} onChange={(e) => handleAnswerChange(item.q, e.target.value)} className="mcq-radio mt-1 mr-3" /> <span className="font-bold font-sans mr-3 shrink-0">{val}.</span> <span className="font-serif">{label}</span></label>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Part 3 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 3 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21 - 25</div>
                <div className="mb-4 italic text-[15px] text-gray-700">What did the students say about each of the following volcanoes for their presentation?</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Choose FIVE answers from the box and write the correct letter, <span className="font-bold">A-G</span>, next to Questions 21-25.</div>

                <div className="bg-blue-50 border border-blue-200 p-6 shadow-sm mb-8">
                    <div className="font-bold mb-4 text-center text-[17px]">Comment Options</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 pl-4">
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">A</span> <span className="mt-0.5">need more photos to support</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">B</span> <span className="mt-0.5">repeat other people's studies</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">C</span> <span className="mt-0.5">inaccurate information</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">D</span> <span className="mt-0.5">need first-hand material</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">E</span> <span className="mt-0.5">need more details</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">F</span> <span className="mt-0.5">no need to talk about it</span></div>
                        <div className="flex items-start"><span className="inline-flex items-center justify-center w-7 h-7 bg-white border border-gray-400 rounded text-sm font-bold mr-3 shadow-sm hover:bg-gray-50 transition shrink-0">G</span> <span className="mt-0.5">check again</span></div>
                    </div>
                </div>

                <div className="font-bold mb-4 text-[17px] text-center">Type of volcanoes:</div>
                <div className="max-w-[400px] mx-auto space-y-4 mb-12">
                    <div className="flex items-center justify-between"><span className="font-bold w-8">21</span><span className="flex-1">shield volcanoes</span> <input type="text" placeholder="21" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[21] || ''} onChange={(e) => handleAnswerChange(21, e.target.value)} /></div>
                    <div className="flex items-center justify-between"><span className="font-bold w-8">22</span><span className="flex-1">stratovolcanoes</span> <input type="text" placeholder="22" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[22] || ''} onChange={(e) => handleAnswerChange(22, e.target.value)} /></div>
                    <div className="flex items-center justify-between"><span className="font-bold w-8">23</span><span className="flex-1">rhyolite caldera complexes</span> <input type="text" placeholder="23" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[23] || ''} onChange={(e) => handleAnswerChange(23, e.target.value)} /></div>
                    <div className="flex items-center justify-between"><span className="font-bold w-8">24</span><span className="flex-1">monogenetic fields</span> <input type="text" placeholder="24" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[24] || ''} onChange={(e) => handleAnswerChange(24, e.target.value)} /></div>
                    <div className="flex items-center justify-between"><span className="font-bold w-8">25</span><span className="flex-1">cinder cones</span> <input type="text" placeholder="25" className="ielts-input ielts-input-short uppercase" maxLength={1} value={answers[25] || ''} onChange={(e) => handleAnswerChange(25, e.target.value)} /></div>
                </div>

                <div className="border-t border-gray-300 pt-8 mt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 26 - 30</div>
                    <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B</span> or <span className="font-bold">C</span>.</div>
                    
                    <div className="space-y-8">
                        {[
                          { q: 26, text: "In Erica's view, what is wrong with Ian's last presentation?", options: { A: "He did not read loud enough.", B: "He did not understand the main reason.", C: "He did not provide enough evidence." } },
                          { q: 27, text: "What materials do the students agree to add to their presentation?", options: { A: "a complete documentary", B: "photographs included in the handouts", C: "Internet video clips" } },
                          { q: 28, text: "By using extinct and dormant volcanoes, the students try to", options: { A: "distinguish between scientific and popular terms.", B: "distinguish between two different types of volcanoes.", C: "distinguish whether an eruption is about to happen." } },
                          { q: 29, text: "What did the professor say about Erica's last presentation?", options: { A: "She carried out an in-depth discussion with other students.", B: "She did not provide sufficient data.", C: "She did not fully develop a personal point." } },
                          { q: 30, text: "The students both agree that volcanoes", options: { A: "haven't caused disastrous outcomes.", B: "cannot help to reshape the landscape.", C: "are not fully recognised for their values." } }
                        ].map((item) => (
                          <div key={item.q}>
                            <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">{item.q}</span><span>{item.text}</span></div>
                            <div className="pl-8 space-y-1">
                                {Object.entries(item.options).map(([val, label]) => (
                                  <label key={val} className={`mcq-label ${answers[item.q] === val ? "selected" : ""}`}><input type="radio" name={`q${item.q}`} value={val} checked={answers[item.q] === val} onChange={(e) => handleAnswerChange(item.q, e.target.value)} className="mcq-radio mt-1 mr-3" /> <span className="font-bold font-sans mr-3 shrink-0">{val}.</span> <span className="font-serif">{label}</span></label>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Part 4 */}
              <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === 4 ? 'block' : 'hidden'}`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31 - 40</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Dolphin Intelligence</h2>
                    
                    <div className="font-bold mb-2 text-[17px] underline underline-offset-4">Point 1: Not highly intelligent</div>
                    <div className="italic mb-2 font-bold pl-4">Research on the size of dolphin brains</div>
                    <ul className="list-none space-y-4 mb-6 pl-8 mt-2">
                        <li>&bull; Dolphins cannot find a way of escaping barriers such as fishing <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className="ielts-input" value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} /> for catching tuna.</li>
                        <li>&bull; People wrongly thought dolphins to be smart and happy as they often have a <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className="ielts-input" value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} />.</li>
                        <li>&bull; Small-brained animals such as pigeons and <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className="ielts-input" value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} /> can perform various complex tasks.</li>
                        <li>&bull; Pigeons are <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className="ielts-input" value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} /> of themselves.</li>
                        <li>&bull; Pigeons are trained to conditional responses and <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className="ielts-input" value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} /> reactions.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[17px] underline underline-offset-4">Counter argument</div>
                    <ul className="list-none space-y-4 mb-8 pl-8 mt-2">
                        <li>&bull; Fatty cells in dolphin brains are linked to protective function and problem-solving skills.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[17px] underline underline-offset-4">Point 2: highly intelligent</div>
                    <div className="italic mb-2 font-bold pl-4">Research on dolphin behaviour</div>
                    <ul className="list-none space-y-4 pl-8 mt-2">
                        <li>&bull; Billy can imitate the keepers' <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className="ielts-input" value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} /> through other dolphins.</li>
                        <li>&bull; Karen hides a <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className="ielts-input" value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} /> for more food.</li>
                        <li>&bull; For the past century, dolphins have been seen as <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className="ielts-input" value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} /> animals.</li>
                        <li>&bull; Each dolphin produces a unique sound, like the <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className="ielts-input" value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} />.</li>
                        <li>&bull; They touch each other to make up after a <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className="ielts-input" value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} />.</li>
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
