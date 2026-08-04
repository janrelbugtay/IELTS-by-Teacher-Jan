import React, { useState, useEffect, useRef } from 'react';
import { Mic, Clock, Edit3, Volume2, RotateCcw, ChevronRight, Square, Play, Pause, CheckCircle2 } from 'lucide-react';

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

export const LiveSpeakingTestScreen = ({ onComplete }: { onComplete: (responses: Record<string, Blob>, fullBlob?: Blob) => void }) => {
  const [phase, setPhase] = useState('intro'); // intro, p1, p2-prep, p2, p3
  const [qIndex, setQIndex] = useState(0);
  const [qState, setQState] = useState<'ai_speaking' | 'recording' | 'reviewing'>('ai_speaking');
  const [recordingTime, setRecordingTime] = useState(0);
  const [prepTime, setPrepTime] = useState(60);
  const [notes, setNotes] = useState('');
  const [responses, setResponses] = useState<Record<string, Blob>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = async () => {
    if (!streamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (err) {
        console.warn('Microphone access denied or error', err);
      }
    }
  };

  useEffect(() => {
    initAudio();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getCurrentQId = () => {
    if (phase === 'p1') return MOCK_QUESTIONS.part1[qIndex].id;
    if (phase === 'p2') return MOCK_QUESTIONS.part2.id;
    if (phase === 'p3') return MOCK_QUESTIONS.part3[qIndex].id;
    return 'intro';
  };

  // Simulated AI reading and then auto-start recording
  useEffect(() => {
    let timer: any;
    if (phase !== 'intro' && phase !== 'p2-prep') {
      if (qState === 'ai_speaking') {
        let textToRead = '';
        if (phase === 'p1') {
            textToRead = MOCK_QUESTIONS.part1[qIndex].text;
            if (qIndex === 0) {
                textToRead = `Part 1. Let's talk about ${MOCK_QUESTIONS.part1[qIndex].topic}. ${textToRead}`;
            }
        } else if (phase === 'p2') {
            textToRead = `Now, I'd like you to talk about a topic for one to two minutes. ${MOCK_QUESTIONS.part2.topic}. Please start speaking now.`;
        } else if (phase === 'p3') {
            textToRead = MOCK_QUESTIONS.part3[qIndex].text;
            if (qIndex === 0) {
                textToRead = `Part 3. Let's discuss ${MOCK_QUESTIONS.part3[qIndex].topic}. ${textToRead}`;
            }
            if (qIndex === MOCK_QUESTIONS.part3.length - 1) {
                textToRead += " That's all for the speaking test today.";
            }
        }
        
        if (textToRead && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.rate = 0.95;
            
            const setVoiceAndSpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                // Prefer Google UK English Female if available, or any UK English voice
                const ukVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-UK') && v.name.includes('Google')) || 
                                voices.find(v => v.lang === 'en-GB' || v.lang === 'en-UK');
                if (ukVoice) {
                    utterance.voice = ukVoice;
                }
                
                // Track if we already started recording to prevent double firing
                let recordingStarted = false;
                
                const startRec = () => {
                    if (!recordingStarted && qState === 'ai_speaking') {
                        recordingStarted = true;
                        startRecording();
                    }
                };

                utterance.onend = () => {
                    timer = setTimeout(() => {
                        startRec();
                    }, 500);
                };
                
                // Fallback timeout in case onend doesn't fire reliably
                const fallbackDuration = textToRead.length * 80 + 2000;
                timer = setTimeout(() => {
                    startRec();
                }, fallbackDuration);
                
                window.speechSynthesis.speak(utterance);
            };

            if (window.speechSynthesis.getVoices().length > 0) {
                setVoiceAndSpeak();
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    setVoiceAndSpeak();
                };
                // Fallback if event doesn't fire
                setTimeout(() => {
                    if (qState === 'ai_speaking') setVoiceAndSpeak();
                }, 1000);
            }
        } else {
            timer = setTimeout(() => {
              startRecording();
            }, 3000);
        }
      } else if (qState === 'recording') {
        timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      }
    } else if (phase === 'p2-prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            setPhase('p2');
            setQState('ai_speaking');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { 
        clearTimeout(timer); 
        clearInterval(timer); 
        if (qState === 'ai_speaking' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, [phase, qState, qIndex]);

  const startRecording = () => {
    setQState('recording');
    setRecordingTime(0);
    if (!streamRef.current) return;
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(200);
    } catch (e) {
      console.warn('Could not start recorder', e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const qId = getCurrentQId();
        setResponses(prev => ({ ...prev, [qId]: blob }));
        setQState('reviewing');
      };
      mediaRecorderRef.current.stop();
    } else {
      setQState('reviewing');
    }
  };

  const playRecording = () => {
    const qId = getCurrentQId();
    const blob = responses[qId];
    if (blob) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleNext = () => {
    stopPlayback();
    if (phase === 'intro') {
      setPhase('p1');
      setQState('ai_speaking');
    } else if (phase === 'p1') {
      if (qIndex < MOCK_QUESTIONS.part1.length - 1) {
        setQIndex(qIndex + 1);
        setQState('ai_speaking');
      } else {
        setPhase('p2-prep');
        setQIndex(0);
      }
    } else if (phase === 'p2') {
      setPhase('p3');
      setQState('ai_speaking');
    } else if (phase === 'p3') {
      if (qIndex < MOCK_QUESTIONS.part3.length - 1) {
        setQIndex(qIndex + 1);
        setQState('ai_speaking');
      } else {
        setPhase('completed');
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
        <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
          <span className="text-xs font-bold tracking-widest text-red-600 uppercase">Live Exam</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto">
        
        <div className="flex-1 flex flex-col px-8 pb-32 pt-8 w-full justify-center">
          
          {phase === 'intro' && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border border-slate-100">
                <Mic size={40} className="text-[#4F7DFF]" />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight drop-shadow-sm">Speaking Test Simulator</h2>
                <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
                  You will now interact with the AI examiner. The test consists of 3 parts and will take approximately 11-14 minutes.
                </p>
              </div>
            </div>
          )}

          {phase === 'p1' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 1: Let's talk about {MOCK_QUESTIONS.part1[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part1[qIndex].text}
              </h2>
            </div>
          )}

          {phase === 'p2-prep' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Part 2 Preparation</h2>
                  <p className="text-slate-500 font-medium">You have 1 minute to prepare.</p>
                </div>
                <div className="text-3xl font-mono font-bold text-slate-800 flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200 shadow-inner">
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
                <label className="text-sm font-bold text-slate-500 flex items-center gap-2 px-2 tracking-wide uppercase">
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
              <div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#6CCB5F]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part3[qIndex].text}
              </h2>
            </div>
          )}

          {phase === 'completed' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg border border-emerald-200">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4 mb-4">
                  Test Completed
                </h2>
                <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
                  You have completed all parts of the speaking test. Click Submit to save your performance and recordings.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-[2.5rem] px-8 py-5 flex flex-col md:flex-row items-center justify-between w-full mx-auto gap-4">
                 
              {/* Status Indicator */}
              <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-4">
                {phase === 'completed' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to Submit</span>
                  </div>
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-2.5 rounded-full shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Recording</span>
                  </div>
                ) : qState === 'ai_speaking' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-[#4F7DFF] bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm">
                     <Volume2 size={20} className="animate-pulse" />
                     <span className="font-bold text-sm uppercase tracking-wider">Examiner</span>
                  </div>
                ) : qState === 'reviewing' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to review</span>
                  </div>
                ) : (
                  <div className="text-slate-500 font-bold text-sm px-4 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Standby
                  </div>
                )}
              </div>

              {/* Middle: Visualizer & Timer */}
              <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                {phase !== 'intro' && phase !== 'p2-prep' && (
                  <div className="flex flex-col items-center w-full">
                    <div className="text-2xl font-mono font-bold text-slate-800 mb-1 drop-shadow-sm tracking-wider">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="w-full max-w-[180px]">
                      <Waveform isRecording={qState === 'recording'} />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-3">
                {phase === 'intro' && (
                   <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-6 group shadow-md text-base tracking-wide"
                    >
                      Start Test
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
                {phase === 'p2-prep' && (
                  <button 
                    onClick={() => { setPrepTime(0); setPhase('p2'); setQState('ai_speaking'); }}
                    className="bg-slate-100 text-slate-700 border border-slate-200 px-8 py-3 h-12 rounded-full font-bold hover:bg-slate-200 transition-all text-sm tracking-wide shadow-sm"
                  >
                    Skip Prep
                  </button>
                )}
                {phase !== 'intro' && phase !== 'p2-prep' && phase !== 'completed' && qState === 'recording' && (
                  <button 
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-red-700 transition-all shadow-md text-sm tracking-wide"
                  >
                    <Square size={16} fill="currentColor" /> Stop Recording
                  </button>
                )}
                {phase !== 'intro' && phase !== 'p2-prep' && phase !== 'completed' && qState === 'reviewing' && (
                  <>
                    <button 
                      onClick={() => {
                        stopPlayback();
                        startRecording();
                      }}
                      className="flex items-center gap-2 px-6 py-3 h-12 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors font-bold text-sm tracking-wide shadow-sm"
                    >
                       <RotateCcw size={18} /> Redo
                    </button>
                    <button 
                      onClick={isPlaying ? stopPlayback : playRecording}
                      className="flex items-center gap-2 px-6 py-3 h-12 text-[#4F7DFF] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors font-bold text-sm tracking-wide shadow-sm border border-blue-100"
                    >
                       {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />} 
                       {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-4 group shadow-md text-sm tracking-wide"
                    >
                      Next
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
                {phase === 'completed' && (
                  <button 
                    onClick={() => {
                      onComplete(responses, responses['p1_1'] || new Blob()); 
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide"
                  >
                    Submit Test
                  </button>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
