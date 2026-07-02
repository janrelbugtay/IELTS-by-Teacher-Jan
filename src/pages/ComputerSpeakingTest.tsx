import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveSpeakingTestScreen } from '../components/LiveSpeakingTestScreen';
import { Mic, Camera, Wifi, MessageSquare, BarChart, FileText, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const STAGES = {
  MIC_CHECK: 'MIC_CHECK',
  CAMERA_CHECK: 'CAMERA_CHECK',
  WAITING: 'WAITING',
  TEST: 'TEST',
  EVALUATION: 'EVALUATION',
  RESULTS: 'RESULTS'
};

const SIDEBAR_STEPS = [
  { id: STAGES.MIC_CHECK, label: 'Microphone Ready', icon: Mic },
  { id: STAGES.CAMERA_CHECK, label: 'Camera Ready', icon: Camera },
  { id: STAGES.WAITING, label: 'Connected', icon: Wifi },
  { id: STAGES.TEST, label: 'Speaking Test', icon: MessageSquare },
  { id: STAGES.EVALUATION, label: 'Evaluation', icon: BarChart },
  { id: STAGES.RESULTS, label: 'Results', icon: FileText }
];

export function ComputerSpeakingTest() {
  const { user } = useAuth();
  const [stage, setStage] = useState(STAGES.MIC_CHECK);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
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
              onNext={() => setStage(STAGES.CAMERA_CHECK)} 
            >
              <MicCheckContent />
            </SetupStep>
          )}

          {stage === STAGES.CAMERA_CHECK && (
            <SetupStep 
              key="cam" 
              title="Camera Check" 
              description="Position yourself in the center of the frame."
              onNext={() => setStage(STAGES.WAITING)} 
            >
              <CameraCheckContent />
            </SetupStep>
          )}

          {stage === STAGES.WAITING && (
            <SetupStep 
              key="wait" 
              title="Connecting..." 
              description="Establishing secure connection to the examiner."
              onNext={() => setStage(STAGES.TEST)} 
              autoNext
              duration={2500}
            >
              <WaitingContent />
            </SetupStep>
          )}

          {stage === STAGES.TEST && (
            <motion.div 
              key="test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"
            >
              <LiveSpeakingTestScreen onComplete={(blob: Blob | undefined) => {
                if (blob) setRecordedAudio(blob);
                setStage(STAGES.EVALUATION);
              }} />
            </motion.div>
          )}

          {stage === STAGES.EVALUATION && (
            <SetupStep 
              key="eval" 
              title="Evaluating Results" 
              description="Our AI is analyzing your pronunciation, fluency, and vocabulary."
              onNext={() => setStage(STAGES.RESULTS)} 
              autoNext
              duration={4000}
            >
              <EvaluationContent />
            </SetupStep>
          )}

          {stage === STAGES.RESULTS && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
            >
              <ResultsDashboard onFinish={() => navigate('/ielts/dashboard')} recordedAudio={recordedAudio} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Setup Subcomponents ---

const SetupStep = ({ title, description, children, onNext, autoNext, duration = 2000 }: any) => {
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
            className="w-full bg-gradient-to-r from-[#4F7DFF] to-[#3B66E0] text-white py-4 rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const MicCheckContent = () => {
  const [level, setLevel] = useState(0);
  
  useEffect(() => {
    const i = setInterval(() => setLevel(Math.random()), 100);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-[#4F7DFF] rounded-full opacity-20 animate-ping" />
        <Mic size={48} className="text-[#4F7DFF]" />
      </div>
      <div className="flex items-end gap-1 h-12 w-64 justify-center">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ height: `${20 + (level * Math.random() * 80)}%` }}
            className="w-2 bg-[#4F7DFF] rounded-full"
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

const CameraCheckContent = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.warn("Camera not available, ignoring:", err);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden relative shadow-inner ring-4 ring-slate-100 max-w-sm mx-auto">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
    </div>
  );
};

const WaitingContent = () => (
  <div className="flex flex-col items-center">
    <div className="w-24 h-24 border-4 border-slate-100 border-t-[#4F7DFF] rounded-full animate-spin mb-8" />
    <p className="text-xl font-medium animate-pulse text-[#4F7DFF]">Finding an examiner...</p>
  </div>
);

const EvaluationContent = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-32 h-32 mb-8">
      <div className="absolute inset-0 border-4 border-[#6CCB5F] rounded-full opacity-20 animate-ping" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BarChart size={48} className="text-[#6CCB5F]" />
      </div>
    </div>
    <p className="text-xl font-medium animate-pulse text-[#6CCB5F]">Generating personalized feedback...</p>
  </div>
);

const ResultsDashboard = ({ onFinish, recordedAudio }: any) => {
  const [uploading, setUploading] = useState(false);
  const [driveLink, setDriveLink] = useState('');

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setUploading(true);
        const metadata = {
          name: 'IELTS_Speaking_Test_Audio.webm',
          mimeType: 'audio/webm',
        };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        if (recordedAudio) {
          form.append('file', recordedAudio);
        }

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
          body: form,
        });
        const file = await response.json();
        setDriveLink(`https://drive.google.com/file/d/${file.id}/view`);
      } catch (err) {
        console.error(err);
        alert("Failed to upload audio to Google Drive");
      } finally {
        setUploading(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.file'
  });

  return (
  <div className="bg-white/80 backdrop-blur-xl border border-white p-12 rounded-[40px] shadow-[0_8px_32px_rgba(79,125,255,0.08)] max-w-4xl w-full">
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
        <CheckCircle2 size={40} className="text-[#6CCB5F]" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-[#1A1A1A]">Test Complete!</h1>
      <p className="text-xl text-slate-500">Here is your estimated band score.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <div className="bg-gradient-to-br from-[#4F7DFF] to-[#3B66E0] text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
        <span className="text-sm uppercase tracking-wider font-semibold opacity-80 mb-2">Overall Band Score</span>
        <span className="text-7xl font-bold">7.5</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Fluency', score: '7.0' },
          { label: 'Vocabulary', score: '8.0' },
          { label: 'Grammar', score: '7.5' },
          { label: 'Pronunciation', score: '7.5' }
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100">
            <span className="text-sm text-slate-500 font-medium mb-1">{s.label}</span>
            <span className="text-3xl font-bold text-[#1A1A1A]">{s.score}</span>
          </div>
        ))}
      </div>
    </div>
    
    {recordedAudio && (
      <div className="mb-10 text-center">
         {!driveLink ? (
           <button 
             onClick={() => login()} 
             disabled={uploading}
             className="inline-flex items-center gap-2 bg-white text-[#1E4DB7] border border-[#1E4DB7] px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
           >
             <UploadCloud size={20} />
             {uploading ? 'Uploading...' : 'Save Audio to Google Drive'}
           </button>
         ) : (
           <a 
             href={driveLink} 
             target="_blank" 
             rel="noreferrer"
             className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
           >
             <UploadCloud size={20} />
             View Audio in Google Drive
           </a>
         )}
      </div>
    )}

    <button 
      onClick={onFinish}
      className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl text-xl font-semibold hover:bg-slate-800 transition-colors"
    >
      Return to Dashboard
    </button>
  </div>
)};
