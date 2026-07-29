import React, { useState, useEffect, useRef } from 'react';
import { Mic, Clock, Edit3, Volume2, RotateCcw, ChevronRight } from 'lucide-react';

const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', topic: 'Public gardens and parks', text: 'Did you like going to parks as a child?' },
    { id: 'p1_2', topic: 'Public gardens and parks', text: 'Do you still like going to parks now?' },
    { id: 'p1_3', topic: 'Public gardens and parks', text: 'Would you like to see more parks in your city?' },
    { id: 'p1_4', topic: 'Public gardens and parks', text: 'Are there any parks you want to go to in the future?' },
    { id: 'p1_5', topic: 'Tidying up', text: 'Do you like to keep things tidy?' },
    { id: 'p1_6', topic: 'Tidying up', text: 'Did you use to keep your room tidy when you were a child?' },
    { id: 'p1_7', topic: 'Old buildings', text: 'Have you ever seen old buildings in the city？' },
    { id: 'p1_8', topic: 'Old buildings', text: 'Do you think we should preserve old buildings in cities？' },
    { id: 'p1_9', topic: 'Old buildings', text: 'Do you prefer living in an old building or a modern house？' }
  ],
  part2: {
    id: 'p2_1',
    topic: 'Describe an environmental protection law.',
    bulletPoints: [
      'What is it?',
      'How did you first learn about it?',
      'Who benefits from it?',
      'And explain how you feel about this law?'
    ]
  },
  part3: [
    { id: 'p3_1', topic: 'Law', text: 'Is there any situation where in people may disobey the law?' },
    { id: 'p3_2', topic: 'Law', text: 'What qualities should a police officer possess?' },
    { id: 'p3_3', topic: 'Law', text: 'How to solve major crimes in the city?' },
    { id: 'p3_4', topic: 'Law', text: 'Should people be penalized when they use mobile phones while driving?' }
  ]
};

const Waveform = ({ isRecording }: { isRecording: boolean }) => (
  <div className="flex items-center justify-center h-12 gap-1.5 overflow-hidden">
    {[...Array(32)].map((_, i) => (
      <div
        key={i}
        className={`w-1.5 rounded-full transition-all duration-75 ${
          isRecording 
            ? 'bg-[#4F7DFF] shadow-[0_0_10px_rgba(79,125,255,0.4)] animate-pulse' 
            : 'bg-slate-200'
        }`}
        style={{
          height: isRecording ? `${Math.max(20, Math.random() * 100)}%` : '20%',
          animationDelay: `${i * 0.03}s`,
          animationDuration: `${Math.random() * 0.3 + 0.4}s`
        }}
      />
    ))}
  </div>
);

export const LiveSpeakingTestScreen = ({ onComplete }: { onComplete: (blob?: Blob) => void }) => {
  const [phase, setPhase] = useState('intro'); // intro, p1, p2-prep, p2, p3, done
  const [qIndex, setQIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [prepTime, setPrepTime] = useState(60);
  const [notes, setNotes] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Start continuous recording for the whole test
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.start(1000);
      } catch (err) {
        console.error("Failed to start test recording:", err);
      }
    };
    startRecording();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Simulated flow controller
  useEffect(() => {
    let timer: any;
    if (isAiSpeaking) {
      // Simulate AI reading the question
      timer = setTimeout(() => {
        setIsAiSpeaking(false);
        if (phase !== 'p2-prep') {
           setIsRecording(true);
        }
      }, 3000); // 3 seconds AI speaking
    } else if (isRecording) {
      // Simulate recording time
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (phase === 'p2-prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            setPhase('p2');
            setIsAiSpeaking(true); // AI says "start speaking"
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { clearTimeout(timer); clearInterval(timer); };
  }, [isAiSpeaking, isRecording, phase]);

  const handleNext = () => {
    setIsRecording(false);
    setRecordingTime(0);
    
    if (phase === 'intro') {
      setPhase('p1');
      setIsAiSpeaking(true);
    } else if (phase === 'p1') {
      if (qIndex < MOCK_QUESTIONS.part1.length - 1) {
        setQIndex(qIndex + 1);
        setIsAiSpeaking(true);
      } else {
        setPhase('p2-prep');
        setQIndex(0);
      }
    } else if (phase === 'p2') {
      setPhase('p3');
      setIsAiSpeaking(true);
    } else if (phase === 'p3') {
      if (qIndex < MOCK_QUESTIONS.part3.length - 1) {
        setQIndex(qIndex + 1);
        setIsAiSpeaking(true);
      } else {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.onstop = () => {
            const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            onComplete(blob);
          };
          mediaRecorderRef.current.stop();
        } else {
          onComplete(new Blob([]));
        }
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col bg-transparent text-slate-800 w-full overflow-hidden font-sans selection:bg-[#4F7DFF]/20 relative h-[80vh] md:h-auto md:flex-1">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4F7DFF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#6CCB5F]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-20 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full border border-red-100">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
          <span className="text-xs font-bold tracking-widest text-red-600 uppercase">Live Exam</span>
        </div>
        
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto">
        
        <div className="flex-1 flex flex-col px-8 pb-32 pt-8 w-full justify-center">
          
          {phase === 'intro' && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <div className="w-24 h-24 mx-auto bg-blue-50 text-[#4F7DFF] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,125,255,0.2)] border border-[#4F7DFF]/20">
                <Mic size={48} />
              </div>
              <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Hello.</h2>
              <p className="text-3xl text-slate-600 leading-relaxed font-light">Welcome to your IELTS Speaking Test.</p>
              {!isAiSpeaking && (
                <button onClick={handleNext} className="mt-12 bg-[#4F7DFF] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all shadow-[0_0_30px_rgba(79,125,255,0.3)] hover:shadow-[0_0_40px_rgba(79,125,255,0.5)]">
                  Begin Part 1
                </button>
              )}
            </div>
          )}

          {phase === 'p1' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide">
                Part 1: Let's talk about {MOCK_QUESTIONS.part1[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm">
                {MOCK_QUESTIONS.part1[qIndex].text}
              </h2>
            </div>
          )}

          {phase === 'p2-prep' && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 fade-in w-full max-w-3xl mx-auto">
              <div className="flex justify-between items-center">
                <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide">
                  Part 2: Preparation
                </div>
                <div className="text-3xl font-mono font-bold text-slate-800 flex items-center gap-3 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm">
                   <Clock size={28} className="text-[#F7B731] animate-pulse" />
                   {formatTime(prepTime)}
                </div>
              </div>
              
              <div className="bg-white backdrop-blur-xl border border-slate-200 shadow-lg p-8 rounded-3xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2 px-2">
                   <Edit3 size={16} /> Digital Notes (Not graded)
                </label>
                <textarea 
                  className="w-full h-32 p-5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent outline-none resize-none text-slate-800 font-sans text-lg placeholder-slate-400 transition-all shadow-sm"
                  placeholder="Type your notes here. You can refer to these while speaking..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {phase === 'p2' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
               <div className="flex justify-center">
                 <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-8 py-3 rounded-full text-base font-bold border border-[#4F7DFF]/20 shadow-sm mb-4 tracking-wide">
                    Part 2: Long Turn
                  </div>
               </div>
               <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight text-center mb-6">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
              {notes && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700 whitespace-pre-wrap font-mono text-lg shadow-inner">
                  <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Your Notes</div>
                  {notes}
                </div>
              )}
            </div>
          )}

          {phase === 'p3' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#6CCB5F]/20 backdrop-blur-sm tracking-wide">
                Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm">
                {MOCK_QUESTIONS.part3[qIndex].text}
              </h2>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem] px-8 py-6 flex items-center justify-between w-full mx-auto">
              
              {/* Status Indicator */}
              <div className="w-1/3 flex items-center gap-4">
                {!isAiSpeaking && isRecording ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                    <span className="font-semibold text-sm uppercase tracking-wider hidden md:inline">Recording</span>
                  </div>
                ) : isAiSpeaking ? (
                  <div className="flex items-center gap-3 text-[#4F7DFF] px-4 py-2">
                     <Volume2 size={20} className="animate-pulse" />
                     <span className="font-semibold text-sm uppercase tracking-wider hidden md:inline">Examiner</span>
                  </div>
                ) : (
                  <div className="text-slate-500 font-medium text-sm px-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Standby
                  </div>
                )}
              </div>

              {/* Middle: Visualizer & Timer */}
              <div className="w-1/3 flex flex-col items-center justify-center">
                {!isAiSpeaking && (phase === 'p1' || phase === 'p2' || phase === 'p3') && (
                  <div className="flex flex-col items-center w-full">
                    <div className="text-xl font-mono font-bold text-slate-800 mb-2 drop-shadow-sm tracking-wider text-2xl">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="w-full max-w-[180px]">
                      <Waveform isRecording={isRecording} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-1/3 flex justify-end gap-3">
                {!isAiSpeaking && phase !== 'intro' && phase !== 'p2-prep' && (
                  <>
                    <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                       <RotateCcw size={18} />
                    </button>
                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-4 group shadow-md"
                    >
                      Done
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
                {phase === 'p2-prep' && (
                  <button 
                    onClick={() => { setPrepTime(0); setPhase('p2'); setIsAiSpeaking(true); }}
                    className="bg-slate-100 text-slate-600 border border-slate-200 px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-semibold hover:bg-slate-200 transition-all text-sm"
                  >
                    Skip
                  </button>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
