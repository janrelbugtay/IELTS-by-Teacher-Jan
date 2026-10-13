import { useNavigate } from 'react-router';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Clock, Edit3, Volume2, RotateCcw, ChevronRight, Square, Play, Pause, CheckCircle2, ShieldAlert, AlertCircle, BookOpen, Sparkles, Check, X, User } from 'lucide-react';
import { IELTS_SPEAKING_QUESTIONS, getSpeakingTestQuestions } from '../data/speakingTestData';
import { stopAllSpeakingRecordings } from './SpeakingAudioItem';

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

export const LiveSpeakingTestScreen = ({ 
  onComplete, 
  testId, 
  customQuestions,
  isAdmin = false,
  onEditTest,
  initialMode = 'practice',
  initialCandidateName = ''
}: { 
  onComplete: (responses: Record<string, Blob>, testMode?: 'practice' | 'mock', candidateName?: string) => Promise<void>, 
  testId?: string, 
  customQuestions?: any,
  isAdmin?: boolean,
  onEditTest?: () => void,
  initialMode?: 'practice' | 'mock',
  initialCandidateName?: string
}) => {
  const navigate = useNavigate();
  const testNum = testId ? testId : '1';
  const MOCK_QUESTIONS = customQuestions || getSpeakingTestQuestions(testNum) || IELTS_SPEAKING_QUESTIONS['1'];

  const [phase, setPhase] = useState<'p1' | 'p2-prep' | 'p2' | 'p3' | 'completed'>('p1');
  const [testMode, setTestMode] = useState<'practice' | 'mock'>(initialMode);
  const [candidateName, setCandidateName] = useState(initialCandidateName || '');
  const [mockTimeLeft, setMockTimeLeft] = useState(40);
  const [mockTotalTime, setMockTotalTime] = useState(40);
  const [autoStartCount, setAutoStartCount] = useState(2);
  const [qIndex, setQIndex] = useState(0);
  const [qState, setQState] = useState<'ai_speaking' | 'auto_starting' | 'recording' | 'reviewing' | 'prep' | 'waiting_to_record' | 'auto_saving'>('ai_speaking');
  const [recordingTime, setRecordingTime] = useState(0);
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const [responses, setResponses] = useState<Record<string, Blob>>({});
  const responsesRef = useRef<Record<string, Blob>>({});
  const hasSubmittedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setTestMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialCandidateName && !candidateName) {
      setCandidateName(initialCandidateName);
    }
  }, [initialCandidateName]);

  const stopSampleAnswerAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSample(false);
    setPlayingSampleId(null);
  };

  const playSampleAnswerText = (text: string, id: string = 'sample') => {
    if (!text || typeof window === 'undefined') return;
    setShowSampleAnswer(true);

    if ('speechSynthesis' in window) {
      if (isPlayingSample && playingSampleId === id) {
        stopSampleAnswerAudio();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlayingSample(true);
        setPlayingSampleId(id);
      };

      utterance.onend = () => {
        setIsPlayingSample(false);
        setPlayingSampleId(null);
      };

      utterance.onerror = () => {
        setIsPlayingSample(false);
        setPlayingSampleId(null);
      };

      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const ukVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-UK') && v.name.includes('Google')) || 
                        voices.find(v => v.lang === 'en-GB' || v.lang === 'en-UK');
        if (ukVoice) {
          utterance.voice = ukVoice;
        } else {
          const preferredVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
          if (preferredVoice) utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  useEffect(() => {
    stopSampleAnswerAudio();
  }, [phase, qIndex]);

  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  useEffect(() => {
    if (phase === 'p2-prep' && qState === 'prep' && prepTime <= 0) {
      setPhase('p2');
      setQState('ai_speaking');
    }
  }, [prepTime, phase, qState]);

  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = async () => {
    if (!streamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (err) {
        console.warn('Microphone access denied or error', err);
        alert("Microphone access is required for the speaking test. Please allow access in your browser settings and try again.");
      }
    }
  };

  useEffect(() => {
    initAudio();
    const handlePauseAll = () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      setIsPlaying(false);
    };
    window.addEventListener('speaking-audio-pause-all', handlePauseAll);
    return () => {
      window.removeEventListener('speaking-audio-pause-all', handlePauseAll);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
    };
  }, []);

  // Auto-save on unmount (e.g. clicking back)
  useEffect(() => {
    return () => {
      if (!hasSubmittedRef.current && Object.keys(responsesRef.current).length > 0) {
        hasSubmittedRef.current = true;
        onComplete(responsesRef.current).catch(err => {
            console.error("Auto-save on back failed", err);
        });
      }
    };
  }, [onComplete]);

  const getCurrentQId = () => {
    if (phase === 'p1') return MOCK_QUESTIONS.part1[qIndex].id;
    if (phase === 'p2') return MOCK_QUESTIONS.part2.id;
    if (phase === 'p3') return MOCK_QUESTIONS.part3[qIndex].id;
    return 'p1_1';
  };

  // Simulated AI reading and then auto-start recording
  useEffect(() => {
    let timer: any;
    if (qState === 'ai_speaking') {
        let textToRead = '';
        if (phase === 'p1') {
            textToRead = MOCK_QUESTIONS.part1[qIndex].text;
            if (qIndex === 0) {
                textToRead = `Part 1. Let's talk about ${MOCK_QUESTIONS.part1[qIndex].topic}. ${textToRead}`;
            }
        } else if (phase === 'p2-prep') {
            textToRead = "Now I'm going to give you a topic. I'd like you to talk about it for one to two minutes. Before you begin speaking, you'll have one minute to prepare. During that time, you may make notes if you wish. You can see the topic on your screen now.";
        } else if (phase === 'p2') {
            textToRead = `Now, I'd like you to talk about a topic for one to two minutes. ${MOCK_QUESTIONS.part2.topic}. Please start speaking now.`;
        } else if (phase === 'p3') {
            textToRead = MOCK_QUESTIONS.part3[qIndex].text;
            if (qIndex === 0) {
                textToRead = `Part 3. Let's discuss ${MOCK_QUESTIONS.part3[qIndex].topic}. ${textToRead}`;
            }
        } else if (phase === 'completed' && qState === 'ai_speaking') {
            textToRead = "Thank you. That is the end of the Speaking test. You may now leave the test room. Have a nice day.";
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
                        if (phase === 'p2-prep') {
                            setQState('prep');
                            if (testMode === 'mock') {
                              setIsPrepTimerRunning(true);
                            }
                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                            if (!hasSubmittedRef.current) {
                                hasSubmittedRef.current = true;
                                setIsSubmitting(true);
                                onComplete(responsesRef.current, testMode).then(() => navigate('/ielts/dashboard?tab=speaking')).finally(() => setIsSubmitting(false));
                            }
                        } else {
                            if (testMode === 'mock') {
                                setQState('auto_starting');
                                setAutoStartCount(2);
                            } else {
                                setQState('waiting_to_record');
                            }
                        }
                    }
                };

                utterance.onend = () => {
                    timer = setTimeout(() => {
                        startRec();
                    }, 500);
                };
                
                // Fallback duration timeout in case onend doesn't fire reliably
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
              if (phase === 'completed') {
                  setQState('reviewing');
                  if (!hasSubmittedRef.current) {
                      hasSubmittedRef.current = true;
                      setIsSubmitting(true);
                      onComplete(responsesRef.current, testMode).then(() => navigate('/ielts/dashboard?tab=speaking')).finally(() => setIsSubmitting(false));
                  }
              } else if (phase === 'p2-prep') {
                  setQState('prep');
                  if (testMode === 'mock') {
                    setIsPrepTimerRunning(true);
                  }
              } else {
                  if (testMode === 'mock') {
                    setQState('auto_starting');
                    setAutoStartCount(2);
                  } else {
                    setQState('waiting_to_record');
                  }
              }
            }, 3000);
        }
      } else if (qState === 'recording') {
        timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else if (phase === 'p2-prep' && qState === 'prep') {
        if (isPrepTimerRunning) {
          timer = setInterval(() => {
            setPrepTime(prev => prev - 1);
          }, 1000);
        }
      }
    return () => { 
        clearTimeout(timer); 
        clearInterval(timer); 
        if (qState === 'ai_speaking' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, [phase, qState, qIndex, testMode]);

  // Mock Mode: Auto-starting countdown
  useEffect(() => {
    let timer: any;
    if (testMode === 'mock' && qState === 'auto_starting') {
      timer = setInterval(() => {
        setAutoStartCount(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            let limit = 40; // Part 1 limit: 40s
            if (phase === 'p2') limit = 120; // Part 2 limit: 120s (2 mins)
            if (phase === 'p3') limit = 60; // Part 3 limit: 60s (1 min)
            setMockTotalTime(limit);
            setMockTimeLeft(limit);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testMode, qState, phase]);

  // Mock Mode: Strict countdown timer during recording
  useEffect(() => {
    let timer: any;
    if (testMode === 'mock' && qState === 'recording') {
      timer = setInterval(() => {
        setMockTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testMode, qState]);

  const startRecording = () => {
    setQState('recording');
    setRecordingTime(0);
    if (!streamRef.current) return;
    try {
      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 48000 };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm', audioBitsPerSecond: 48000 };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4', audioBitsPerSecond: 48000 };
        }
      }
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(500);
    } catch (e) {
      console.warn('Could not start recorder with options, falling back to default', e);
      try {
        const fallbackRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = fallbackRecorder;
        audioChunksRef.current = [];
        fallbackRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        fallbackRecorder.start(500);
      } catch (err2) {
        console.error('Failed to start fallback recorder', err2);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const qId = getCurrentQId();
        setResponses(prev => { const next = { ...prev, [qId]: blob }; responsesRef.current = next; return next; });
        if (testMode === 'mock') {
          setQState('auto_saving');
          setTimeout(() => {
            handleNext();
          }, 1200);
        } else {
          setQState('reviewing');
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      if (testMode === 'mock') {
        setQState('auto_saving');
        setTimeout(() => {
          handleNext();
        }, 1200);
      } else {
        setQState('reviewing');
      }
    }
  };

  const playRecording = () => {
    const qId = getCurrentQId();
    const blob = responses[qId];
    if (blob) {
      stopAllSpeakingRecordings();
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.play().catch(e => {
        console.warn("Play error:", e);
        setIsPlaying(false);
      });
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

  const handleNext = async () => {
    stopPlayback();
    setShowSampleAnswer(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (phase === 'p1') {
      if (qIndex < MOCK_QUESTIONS.part1.length - 1) {
        setQIndex(qIndex + 1);
        setQState('ai_speaking');
      } else {
        setPhase('p2-prep');
        setQState('ai_speaking');
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
        setQState('ai_speaking');
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col bg-transparent text-slate-800 w-full overflow-visible font-sans selection:bg-[#4F7DFF]/20 relative flex-1 min-h-[600px] md:min-h-0">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#4F7DFF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#6CCB5F]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Status Bar */}
      <div className="relative z-20 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="text-xs text-slate-600 font-bold tracking-wide flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-xs">
          <User size={14} className="text-slate-400" />
          <span>CANDIDATE NAME - <span className="text-slate-900 font-extrabold">{candidateName.toUpperCase() || 'CANDIDATE'}</span></span>
        </div>

        {testMode === 'mock' ? (
          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-xs font-bold tracking-widest text-amber-800 uppercase">Mock Exam Mode &bull; Timed Simulation</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full border border-purple-200 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="text-xs font-bold tracking-widest text-purple-800 uppercase">Practice Study Mode &bull; Interactive</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col relative z-10 w-full max-w-5xl mx-auto">
        <div className="flex-1 flex flex-col px-4 md:px-8 pt-4 md:pt-8 w-full justify-center pb-44">

          {phase === 'p1' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full max-w-3xl mx-auto">
              <div className="text-center">
                <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2 rounded-full text-sm font-bold border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide shadow-sm">
                  Part 1 &bull; {MOCK_QUESTIONS.part1[qIndex]?.topic || 'General'}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Question {qIndex + 1} of {MOCK_QUESTIONS.part1?.length || 1}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-snug">
                  {MOCK_QUESTIONS.part1[qIndex]?.text}
                </h2>
              </div>

              {/* Sample Answer placed directly below the question (Practice Mode Only) */}
              {testMode === 'practice' && (MOCK_QUESTIONS.part1[qIndex] as any)?.sampleAnswer && (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4F7DFF]">
                      <span className="w-2 h-2 rounded-full bg-[#4F7DFF]" />
                      Sample Model Answer
                    </div>
                    <button
                      type="button"
                      onClick={() => playSampleAnswerText((MOCK_QUESTIONS.part1[qIndex] as any).sampleAnswer, `p1-${qIndex}`)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        isPlayingSample && playingSampleId === `p1-${qIndex}`
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'text-slate-700 hover:text-[#4F7DFF] bg-slate-50 hover:bg-blue-50 border-slate-200'
                      }`}
                    >
                      {isPlayingSample && playingSampleId === `p1-${qIndex}` ? (
                        <>
                          <Square size={13} fill="currentColor" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} className="text-[#4F7DFF]" />
                          <span>Listen to Sample Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-base font-normal whitespace-pre-wrap">
                    {(MOCK_QUESTIONS.part1[qIndex] as any).sampleAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

          {phase === 'p2-prep' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4 md:gap-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Part 2 Preparation</h2>
                  <p className="text-slate-500 font-medium">You have 1 minute to prepare your notes.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {testMode === 'practice' ? (
                    <button 
                      onClick={() => setIsPrepTimerRunning(!isPrepTimerRunning)}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-bold transition-colors text-sm border border-slate-200 cursor-pointer"
                    >
                      {isPrepTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                      {isPrepTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setPrepTime(0); }}
                      className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full font-bold transition-colors text-sm cursor-pointer shadow-sm"
                    >
                      <ChevronRight size={16} /> Ready to Speak Early
                    </button>
                  )}
                  <div className="text-2xl md:text-3xl font-mono font-bold text-slate-800 flex items-center gap-2 md:gap-3 bg-slate-50 px-4 py-2 md:px-6 md:py-3 rounded-full border border-slate-200 shadow-inner">
                     <Clock size={28} className={!isPrepTimerRunning ? 'text-slate-400' : 'text-[#F7B731] animate-pulse'} />
                     {formatTime(prepTime)}
                  </div>
                </div>
              </div>
                 
              <div className="bg-white border border-slate-200 shadow-md p-8 rounded-3xl">
                <div className="text-xs uppercase tracking-wider font-bold text-[#4F7DFF] mb-2">Candidate Task Card</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light mb-6">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                </ul>

                {/* Sample Answer below question topic and bullets (Practice Mode Only) */}
                {testMode === 'practice' && (MOCK_QUESTIONS.part2 as any).sampleAnswer && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4F7DFF]">
                        <span className="w-2 h-2 rounded-full bg-[#4F7DFF]" />
                        Sample Model Answer
                      </div>
                      <button 
                        onClick={() => playSampleAnswerText((MOCK_QUESTIONS.part2 as any).sampleAnswer, 'p2-cue')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                          isPlayingSample && playingSampleId === 'p2-cue'
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'text-slate-700 hover:text-[#4F7DFF] bg-slate-50 hover:bg-blue-50 border-slate-200'
                        }`}
                      >
                        {isPlayingSample && playingSampleId === 'p2-cue' ? (
                          <>
                            <Square size={13} fill="currentColor" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} className="text-[#4F7DFF]" />
                            <span>Listen to Sample Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-base font-normal whitespace-pre-wrap">
                      {(MOCK_QUESTIONS.part2 as any).sampleAnswer}
                    </p>
                  </div>
                )}
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
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
               <div className="flex justify-center">
                 <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-8 py-2.5 rounded-full text-base font-bold border border-[#4F7DFF]/20 shadow-sm tracking-wide">
                    Part 2: Long Turn
                  </div>
               </div>

               <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-md">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight text-center mb-6">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light mb-6">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                </ul>

                {/* Sample Answer below question topic and bullets (Practice Mode Only) */}
                {testMode === 'practice' && (MOCK_QUESTIONS.part2 as any).sampleAnswer && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4F7DFF]">
                        <span className="w-2 h-2 rounded-full bg-[#4F7DFF]" />
                        Sample Model Answer
                      </div>
                      <button 
                        onClick={() => playSampleAnswerText((MOCK_QUESTIONS.part2 as any).sampleAnswer, 'p2-cue')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                          isPlayingSample && playingSampleId === 'p2-cue'
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'text-slate-700 hover:text-[#4F7DFF] bg-slate-50 hover:bg-blue-50 border-slate-200'
                        }`}
                      >
                        {isPlayingSample && playingSampleId === 'p2-cue' ? (
                          <>
                            <Square size={13} fill="currentColor" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} className="text-[#4F7DFF]" />
                            <span>Listen to Sample Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-base font-normal whitespace-pre-wrap">
                      {(MOCK_QUESTIONS.part2 as any).sampleAnswer}
                    </p>
                  </div>
                )}
              </div>

              {notes && (
                <div className="bg-blue-50/80 p-6 rounded-2xl border border-blue-100 text-slate-700 whitespace-pre-wrap font-mono text-base shadow-xs">
                  <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Your Preparation Notes</div>
                  {notes}
                </div>
              )}
            </div>
          )}

          {phase === 'p3' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full max-w-3xl mx-auto">
              <div className="text-center">
                <div className="inline-block bg-[#6CCB5F]/15 text-emerald-700 px-6 py-2 rounded-full text-sm font-bold border border-emerald-200 backdrop-blur-sm tracking-wide shadow-sm">
                  Part 3 &bull; {MOCK_QUESTIONS.part3[qIndex]?.topic || 'Discussion'}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md text-center">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Question {qIndex + 1} of {MOCK_QUESTIONS.part3?.length || 1}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-snug">
                  {MOCK_QUESTIONS.part3[qIndex]?.text}
                </h2>
              </div>

              {/* Sample Answer placed directly below the question (Practice Mode Only) */}
              {testMode === 'practice' && (MOCK_QUESTIONS.part3[qIndex] as any)?.sampleAnswer && (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4F7DFF]">
                      <span className="w-2 h-2 rounded-full bg-[#4F7DFF]" />
                      Sample Model Answer
                    </div>
                    <button
                      type="button"
                      onClick={() => playSampleAnswerText((MOCK_QUESTIONS.part3[qIndex] as any).sampleAnswer, `p3-${qIndex}`)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        isPlayingSample && playingSampleId === `p3-${qIndex}`
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'text-slate-700 hover:text-[#4F7DFF] bg-slate-50 hover:bg-blue-50 border-slate-200'
                      }`}
                    >
                      {isPlayingSample && playingSampleId === `p3-${qIndex}` ? (
                        <>
                          <Square size={13} fill="currentColor" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} className="text-[#4F7DFF]" />
                          <span>Listen to Sample Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-base font-normal whitespace-pre-wrap">
                    {(MOCK_QUESTIONS.part3[qIndex] as any).sampleAnswer}
                  </p>
                </div>
              )}
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
                  You have completed all parts of the speaking test. Your test is being saved in the background. You can go back to the dashboard now.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button 
                  disabled={isSubmitting}
                  onClick={() => {
                    navigate('/ielts/dashboard?tab=speaking');
                  }}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md text-base tracking-wide cursor-pointer ${
                    isSubmitting ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting ? 'Saving Results...' : 'Go back to dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS: Only rendered when test is actively in progress (NOT completed) */}
        {phase !== 'completed' && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-4xl">
            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between w-full mx-auto gap-4">
                   
                {/* Status Indicator */}
                <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-4">
                  {qState === 'ai_speaking' ? (
                    <div className="flex items-center gap-3 text-[#4F7DFF] bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 shadow-sm">
                       <Volume2 size={20} className="animate-pulse" />
                       <span className="font-bold text-sm uppercase tracking-wider">Examiner Speaking</span>
                    </div>
                  ) : qState === 'auto_starting' ? (
                    <div className="flex items-center gap-3 text-amber-800 bg-amber-50 px-5 py-2.5 rounded-xl border border-amber-200 shadow-sm animate-pulse">
                       <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                       <span className="font-bold text-sm uppercase tracking-wider">Recording in {autoStartCount}s...</span>
                    </div>
                  ) : qState === 'auto_saving' ? (
                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
                       <CheckCircle2 size={18} className="text-emerald-600" />
                       <span className="font-bold text-sm uppercase tracking-wider">Answer Saved &bull; Next</span>
                    </div>
                  ) : qState === 'waiting_to_record' && phase !== 'p2-prep' ? (
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs uppercase tracking-wider px-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      Your Turn to Speak
                    </div>
                  ) : qState === 'recording' && phase !== 'p2-prep' ? (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-2.5 rounded-xl shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                      <span className="font-bold text-sm uppercase tracking-wider">{testMode === 'mock' ? 'Mock Exam Recording' : 'Recording'}</span>
                    </div>
                  ) : qState === 'reviewing' && phase !== 'p2-prep' ? (
                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100 shadow-sm">
                       <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                       <span className="font-bold text-sm uppercase tracking-wider">Review Response</span>
                    </div>
                  ) : (
                    <div className="text-slate-500 font-bold text-sm px-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-slate-300" /> Standby
                    </div>
                  )}
                </div>

                {/* Middle: Visualizer & Timer */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                  {phase !== 'p2-prep' && (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-mono font-bold tracking-wider ${testMode === 'mock' && mockTimeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                          {testMode === 'mock' ? formatTime(mockTimeLeft) : formatTime(recordingTime)}
                        </div>
                        {testMode === 'mock' && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Remaining
                          </span>
                        )}
                      </div>
                      <div className="w-full max-w-[180px]">
                        <Waveform isRecording={qState === 'recording'} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-3">
                  {phase === 'p2-prep' && (
                    <button 
                      onClick={() => { setPrepTime(0); setPhase('p2'); setQState('ai_speaking'); }}
                      className="bg-slate-100 text-slate-700 border border-slate-200 px-7 py-2.5 h-11 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm tracking-wide shadow-sm cursor-pointer"
                    >
                      {testMode === 'mock' ? 'Ready to Speak Early' : 'Skip Prep'}
                    </button>
                  )}

                  {/* Practice Mode Actions */}
                  {testMode === 'practice' && phase !== 'p2-prep' && qState === 'waiting_to_record' && (
                    <button 
                      onClick={startRecording}
                      className="flex items-center gap-2 bg-[#4F7DFF] text-white px-7 py-2.5 h-11 rounded-xl font-bold hover:bg-[#3D63CC] transition-all shadow-md text-sm tracking-wide cursor-pointer"
                    >
                      <Mic size={16} /> Start Recording
                    </button>
                  )}
                  {testMode === 'practice' && phase !== 'p2-prep' && qState === 'recording' && (
                    <button 
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-red-600 text-white px-7 py-2.5 h-11 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md text-sm tracking-wide cursor-pointer"
                    >
                      <Square size={16} fill="currentColor" /> Stop Recording
                    </button>
                  )}
                  {testMode === 'practice' && phase !== 'p2-prep' && qState === 'reviewing' && (
                    <>
                      <button 
                        onClick={() => {
                          stopPlayback();
                          startRecording();
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 h-11 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm tracking-wide shadow-sm cursor-pointer"
                      >
                         <RotateCcw size={16} /> Redo
                      </button>
                      <button 
                        onClick={isPlaying ? stopPlayback : playRecording}
                        className="flex items-center gap-2 px-5 py-2.5 h-11 text-[#4F7DFF] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-bold text-sm tracking-wide shadow-sm border border-blue-100 cursor-pointer"
                      >
                         {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />} 
                         {isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 h-11 rounded-xl font-bold hover:bg-slate-800 transition-all hover:pr-4 group shadow-md text-sm tracking-wide cursor-pointer"
                      >
                        Next
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  )}

                  {/* Mock Mode Actions (Strict: No Redo, No Replay) */}
                  {testMode === 'mock' && phase !== 'p2-prep' && qState === 'recording' && (
                    <button 
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 h-11 rounded-xl font-bold transition-all shadow-md text-sm tracking-wide cursor-pointer"
                    >
                      <Square size={16} fill="currentColor" /> Finish Answer &bull; Next
                    </button>
                  )}
                  {testMode === 'mock' && qState === 'auto_saving' && (
                    <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs px-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Saving and advancing...
                    </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6">
          <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2 text-slate-900">Uploading Recordings</h3>
            <p className="text-sm text-slate-600">Please do not close this window while your speaking test audio is being saved to the cloud...</p>
          </div>
        </div>
      )}
    </div>
  );
};
