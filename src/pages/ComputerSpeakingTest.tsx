import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveSpeakingTestScreen } from '../components/LiveSpeakingTestScreen';
import { SpeakingPerformanceReport } from '../components/SpeakingPerformanceReport';
import { SpeakingRecordingsReview } from '../components/SpeakingRecordingsReview';
import { Mic, Camera, Wifi, MessageSquare, BarChart, FileText, CheckCircle2, ChevronRight, UploadCloud, Play, Square, Volume2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const STAGES = {
  MIC_CHECK: 'MIC_CHECK',
  TEST: 'TEST',
  PERFORMANCE: 'PERFORMANCE',
  RECORDING: 'RECORDING'
};

const SIDEBAR_STEPS = [
  { id: STAGES.MIC_CHECK, label: 'Microphone Ready', icon: Mic },
  { id: STAGES.TEST, label: 'Speaking Test', icon: MessageSquare }
];

export function ComputerSpeakingTest() {
  const { user } = useAuth();
  const { id } = useParams();
  const [stage, setStage] = useState(STAGES.MIC_CHECK);
  const [recordedAudio, setRecordedAudio] = useState<any>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
    
  const navigate = useNavigate();

  if (!user) {
    return <div className="min-h-[70vh] flex items-center justify-center bg-[#F6F8FC] text-slate-500 font-medium">Please log in to take the test.</div>;
  }

  const currentIndex = SIDEBAR_STEPS.findIndex(s => s.id === stage);

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F6F8FC] w-full font-sans text-[#1A1A1A]">
      
      {/* Progress Sidebar */}
      <div className="w-72 hidden md:flex flex-col bg-white border-r border-slate-100 p-8 shadow-sm z-10">
        <h2 className="text-2xl font-bold mb-10 text-[#4F7DFF]">IELTS Simulator</h2>
        
        <div className="relative flex-1">
          <div className="absolute left-[23px] top-6 bottom-10 w-0.5 bg-slate-100" />
          
          <div className="space-y-8 relative">
            {SIDEBAR_STEPS.map((step, index) => {
              const isCompleted = currentIndex > index;
              const isActive = stage === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex items-center group">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isCompleted ? '#6CCB5F' : isActive ? '#4F7DFF' : '#ffffff',
                      borderColor: isCompleted || isActive ? 'transparent' : '#e2e8f0',
                      scale: isActive ? 1.1 : 1
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-2 transition-colors duration-300 shadow-sm`}
                  >
                    <Icon size={20} className={isCompleted || isActive ? 'text-white' : 'text-slate-400'} />
                  </motion.div>
                  <span className={`ml-4 font-medium transition-colors duration-300 ${isActive ? 'text-[#1A1A1A] text-lg' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {stage === STAGES.MIC_CHECK && (
            <SetupStep 
              key="mic" 
              title="Microphone Check" 
              description="Let's make sure we can hear you clearly."
              onNext={() => setStage(STAGES.TEST)} 
              canContinue={hasRecorded}
            >
              <MicCheckContent onHasRecorded={() => setHasRecorded(true)} />
            </SetupStep>
          )}

          {stage === STAGES.TEST && (
            <motion.div 
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"
            >
              {isSaving && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4F7DFF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-bold text-slate-700 animate-pulse">Saving your performance...</p>
                  </div>
                </div>
              )}
              <LiveSpeakingTestScreen onComplete={async (responses: Record<string, Blob>) => {
                if (responses && Object.keys(responses).length > 0) {
                  setRecordedAudio(responses);
                  
                  setIsSaving(true);
                  try {
                    // Determine title and ID
                    let testNum = id || '1';
                    const numId = parseInt(testNum, 10);
                    if (!isNaN(numId)) {
                      testNum = Math.ceil(numId / 4).toString();
                    }
                    const assignmentTitle = `IELTS Speaking Test ${testNum}`;
                    
                    // Create submission immediately for fast access
                    const docRef = await addDoc(collection(db, 'submissions'), {
                      userId: user?.uid,
                      assignmentId: testNum,
                      assignmentTitle: assignmentTitle,
                      assignmentType: 'speaking',
                      audioUrl: '', 
                      bandScore: 7, // Mock score for now
                      timeSpent: 14 * 60, // 14 mins
                      createdAt: serverTimestamp(),
                      answers: {},
                      status: 'processing' // indicate it's still uploading
                    });
                    
                    // Navigate immediately
                    navigate('/ielts/dashboard?tab=speaking');

                    // Run uploads in background
                    (async () => {
                      try {
                        const uploadPromises = Object.entries(responses).map(async ([qId, blob]) => {
                          if (blob.size === 0) return { qId, url: "" };
                          const audioRef = ref(storage, `speaking_tests/${user?.uid}/${Date.now()}_${qId}.webm`);
                          const uploadResult = await uploadBytes(audioRef, blob);
                          const url = await getDownloadURL(uploadResult.ref);
                          return { qId, url };
                        });

                        const uploadedItems = await Promise.all(uploadPromises);
                        
                        const answersObj: Record<string, any> = {};
                        let firstAudioUrl = "";
                        uploadedItems.forEach(({ qId, url }) => {
                          if (url) {
                            answersObj[qId] = { audioUrl: url };
                            if (!firstAudioUrl) firstAudioUrl = url;
                          }
                        });

                        // Update the document with actual URLs
                        await updateDoc(doc(db, 'submissions', docRef.id), {
                          audioUrl: firstAudioUrl,
                          answers: answersObj,
                          status: 'completed'
                        });
                      } catch (err) {
                        console.error("Background upload failed:", err);
                      }
                    })();
                    
                  } catch (error) {
                    console.error("Error saving test:", error);
                    alert("Failed to save the test. Please try again.");
                    setIsSaving(false);
                  }
                } else {
                  alert("Test aborted or failed to record. Returning to dashboard.");
                  navigate('/ielts/dashboard');
                }
              }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Setup Subcomponents ---

const SetupStep = ({ title, description, children, onNext, autoNext, duration = 2000, canContinue = true }: any) => {
  useEffect(() => {
    if (autoNext) {
      const t = setTimeout(onNext, duration);
      return () => clearTimeout(t);
    }
  }, [autoNext, onNext, duration]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex items-center justify-center p-8 w-full h-full"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[32px] shadow-[0_8px_32px_rgba(79,125,255,0.08)] max-w-xl w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4F7DFF] to-[#6CCB5F]" />
        
        <h2 className="text-3xl font-bold mb-3 text-[#1A1A1A]">{title}</h2>
        <p className="text-slate-500 mb-10 text-lg">{description}</p>
        
        <div className="min-h-[240px] flex items-center justify-center mb-10">
          {children}
        </div>

        {!autoNext && (
          <button 
            onClick={onNext}
            disabled={!canContinue}
            className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${canContinue ? 'bg-gradient-to-r from-[#4F7DFF] to-[#3B66E0] text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Continue <ChevronRight size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const MicCheckContent = ({ onHasRecorded }: { onHasRecorded?: () => void }) => {
  const [level, setLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateLevel = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setLevel(average / 255);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (onHasRecorded) {
          onHasRecorded();
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setLevel(0);
      };

      mediaRecorder.start(500);
      setIsRecording(true);
      setAudioUrl(null);
    } catch (err) {
      console.warn("Failed to start recording:", err);
      alert("Microphone access is required to test audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio play error:", err);
        setIsPlaying(false);
      });
    }
  };
  
  const stopAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-[#1A1A1A] font-medium mb-6 text-lg">Please say: <span className="font-bold text-[#4F7DFF]">&quot;I love English!&quot;</span></p>
      
      <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-8 relative">
        {isRecording && <div className="absolute inset-0 bg-[#4F7DFF] rounded-full opacity-20 animate-ping" />}
        <Mic size={48} className={`transition-colors ${isRecording ? "text-[#4F7DFF]" : "text-slate-400"}`} />
      </div>
      
      <div className="flex items-end gap-1 h-12 w-64 justify-center mb-8">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ height: `${20 + (level * Math.random() * 80)}%` }}
            className={`w-2 rounded-full ${isRecording ? "bg-[#4F7DFF]" : "bg-slate-200"}`}
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        ))}
      </div>
      
      <div className="flex gap-4">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="flex items-center gap-2 bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <Mic size={18} /> Record
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
          >
            <Square size={18} /> Stop
          </button>
        )}
        
        {audioUrl && !isRecording && (
          !isPlaying ? (
            <button 
              onClick={playAudio}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
            >
              <Play size={18} /> Playback
            </button>
          ) : (
            <button 
              onClick={stopAudio}
              className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-6 py-2.5 rounded-xl font-medium hover:bg-amber-100 transition-colors"
            >
              <Square size={18} /> Stop Playback
            </button>
          )
        )}
      </div>
    </div>
  );
};
