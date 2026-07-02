import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Square, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pcmToBase64 = (pcmData: Float32Array) => {
  const buffer = new ArrayBuffer(pcmData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const LiveSpeakingTestScreen = ({ onComplete }: any) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const isMutedRef = useRef(false);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const [examinerState, setExaminerState] = useState('LISTENING'); // LISTENING, SPEAKING
  const [candidateState, setCandidateState] = useState('SILENT'); // SILENT, SPEAKING
  
  const [examinerTranscript, setExaminerTranscript] = useState('');
  const isSpeakingRef = useRef(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMode, setTimerMode] = useState<'IDLE' | 'PREP' | 'TALK'>('IDLE');
  
  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const examinerImage = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80"; // Centered portrait of a professional woman

  useEffect(() => {
    let interval: any;
    if (timerMode !== 'IDLE' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerMode !== 'IDLE') {
      // Auto-transition or just stop
      setTimerMode('IDLE');
    }
    return () => clearInterval(interval);
  }, [timerMode, timerSeconds]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') inputAudioCtxRef.current.close();
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') outputAudioCtxRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (isConnected && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isConnected]);

  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }
    
    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const currentTime = ctx.currentTime;
    if (nextPlaybackTimeRef.current < currentTime) {
      nextPlaybackTimeRef.current = currentTime;
    }
    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += audioBuffer.duration;
  };

  const startLiveSession = async () => {
    setIsConnecting(true);
    setError('');
    
    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported in this environment.");
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
    } catch (err: any) {
      console.warn("Camera/Mic not accessible:", err);
      setError("Camera and Microphone are required for the live session.");
      setIsConnecting(false);
      return;
    }
    
    try {
      const ws = new WebSocket(`wss://${location.host}/live`);
      wsRef.current = ws;

      // Setup MediaRecorder for saving the audio
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000);

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputAudioCtx;
      outputAudioCtxRef.current = outputAudioCtx;

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      
      sourceRef.current = source;
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        ws.send(JSON.stringify({ text: "Hello, examiner! I'm ready for the test. Let's begin Part 1." }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.text) {
          if (!isSpeakingRef.current) {
            setExaminerTranscript(msg.text);
            isSpeakingRef.current = true;
          } else {
            setExaminerTranscript(prev => prev + msg.text);
          }
        }
        
        if (msg.audio) {
          setExaminerState('SPEAKING');
          setCandidateState('SILENT');
          isSpeakingRef.current = true;
          playAudioChunk(outputAudioCtx, msg.audio);
          
          // Basic logic to flip state back to listening after speech ends
          // For a real app, you might use more robust timing based on nextPlaybackTimeRef
          setTimeout(() => {
            if (nextPlaybackTimeRef.current <= outputAudioCtx.currentTime + 0.1) {
              setExaminerState('LISTENING');
              setCandidateState('SPEAKING');
              isSpeakingRef.current = false;
            }
          }, 1000);
        }
        if (msg.interrupted) { 
          nextPlaybackTimeRef.current = outputAudioCtx.currentTime; 
          isSpeakingRef.current = false;
        }
      };

      ws.onclose = () => {
        endTest();
      };

    } catch (e) {
      console.error("Failed to start live session:", e);
      setError("Failed to connect to the examiner.");
      setIsConnecting(false);
    }
  };

  const endTest = () => {
    if (wsRef.current) wsRef.current.close();
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') outputAudioCtxRef.current.close();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onComplete(blob);
      };
      mediaRecorderRef.current.stop();
    } else {
      onComplete();
    }
  };

  const stopSpeaking = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: "I have finished my answer, please ask the next question." }));
    }
  };

  const toggleMic = () => {
    setIsMuted(!isMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    }
  };

  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => t.enabled = isCameraOff);
    }
  };

  if (!isConnected && !isConnecting) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={startLiveSession}
          className="bg-gradient-to-r from-[#4F7DFF] to-[#3B66E0] text-white px-10 py-6 rounded-3xl text-2xl font-bold shadow-[0_10px_40px_rgba(79,125,255,0.4)] flex items-center gap-4 hover:shadow-[0_15px_50px_rgba(79,125,255,0.6)] transition-all"
        >
          <Mic size={32} /> Start Speaking Test
        </motion.button>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 border-4 border-slate-100 border-t-[#4F7DFF] rounded-full animate-spin mb-8" />
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Connecting to Examiner...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Speaking Session</h2>
          <p className="text-[#6CCB5F] font-medium text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CCB5F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6CCB5F]"></span>
            </span>
            Live
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 font-mono font-bold text-lg text-[#1A1A1A]">
          <span>Part 1</span>
          <span className="w-px h-4 bg-slate-200" />
          <span>08:35</span>
        </div>
      </div>

      {/* Video Grid and Captions (Stacked Layout) */}
      <div className="flex flex-col gap-6 flex-1 mb-8 pb-16">
        
        {/* Videos Row */}
        <div className="flex flex-col md:flex-row gap-6 h-[250px] md:h-[300px] shrink-0">
          {/* Main View: Examiner */}
          <div className={`flex-1 relative bg-[#111111] rounded-[24px] overflow-hidden shadow-xl border-4 transition-all duration-300 ${examinerState === 'SPEAKING' ? 'border-[#6CCB5F]' : 'border-slate-800'} flex items-center justify-center`}>
            <motion.img 
              animate={{
                y: examinerState === 'SPEAKING' ? [0, -2, 0, -1, 0] : [0, -1, 0],
                scale: examinerState === 'SPEAKING' ? [1, 1.02, 1] : 1
              }}
              transition={{
                duration: examinerState === 'SPEAKING' ? 2 : 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              src={examinerImage}
              alt="Examiner"
              className="w-full h-full object-contain opacity-90"
            />
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              Examiner Emily
            </div>

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              {examinerState === 'SPEAKING' ? (
                <><span className="w-2 h-2 rounded-full bg-[#6CCB5F] animate-pulse" /> Speaking</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-[#4F7DFF]" /> Listening</>
              )}
            </div>
          </div>

          {/* User Side */}
          <div className={`flex-1 relative bg-[#111111] rounded-[24px] overflow-hidden shadow-xl border-4 transition-colors duration-300 ${candidateState === 'SPEAKING' ? 'border-[#4F7DFF]' : 'border-slate-800'} flex items-center justify-center`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-contain scale-x-[-1] transition-opacity duration-300 ${isCameraOff ? 'opacity-0 blur-xl' : 'opacity-100'}`} 
            />
            
            {isCameraOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                <CameraOff size={32} className="mb-2" />
                <p className="font-medium text-sm">Camera Off</p>
              </div>
            )}

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              You
            </div>
            
            <AnimatePresence>
              {candidateState === 'SPEAKING' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 right-4 bg-[#4F7DFF] text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Mic size={14} className="text-white" />
                  Speaking...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Captions/Questions Section */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center overflow-y-auto relative">
          
          {timerMode !== 'IDLE' && (
            <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-mono text-lg font-bold flex items-center gap-2 border border-amber-200">
              <Timer size={20} />
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              <span className="text-xs uppercase tracking-wider ml-2 bg-amber-200 px-2 py-0.5 rounded-md">{timerMode}</span>
            </div>
          )}

          {examinerTranscript.includes("Describe an environmental protection law") && timerMode === 'IDLE' && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => { setTimerMode('PREP'); setTimerSeconds(60); }}
                className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1 border border-indigo-200"
              >
                <Timer size={16} /> 1 Min Prep
              </button>
              <button 
                onClick={() => { setTimerMode('TALK'); setTimerSeconds(120); }}
                className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-200"
              >
                <Mic size={16} /> 2 Min Talk
              </button>
            </div>
          )}

          {examinerTranscript ? (
            <p className="text-xl md:text-2xl font-medium text-slate-800 max-w-3xl leading-relaxed whitespace-pre-wrap mt-8">
              {examinerTranscript}
            </p>
          ) : (
            <p className="text-lg md:text-xl font-medium text-slate-400 max-w-3xl leading-relaxed animate-pulse">
              Waiting for examiner...
            </p>
          )}
        </div>

      </div>



      {/* Bottom Floating Dock */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center gap-4">
        
        <ToolbarButton 
          icon={isMuted ? MicOff : Mic} 
          label={isMuted ? "Unmute" : "Mute"} 
          onClick={toggleMic} 
          isActive={!isMuted} 
          danger={isMuted}
        />
        
        <ToolbarButton 
          icon={isCameraOff ? CameraOff : Camera} 
          label={isCameraOff ? "Turn On" : "Turn Off"} 
          onClick={toggleCamera} 
          isActive={!isCameraOff} 
          danger={isCameraOff}
        />
        
        <ToolbarButton 
          icon={Square} 
          label="Finish Answer" 
          onClick={stopSpeaking} 
          danger={false}
          solid={false}
        />
        
        <div className="w-px h-8 bg-slate-200 mx-2" />
        
        <ToolbarButton 
          icon={PhoneOff} 
          label="End Test" 
          onClick={endTest} 
          danger 
          solid
        />

      </div>
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, label, onClick, isActive, danger, solid }: any) => {
  let bg = "bg-slate-100 text-slate-600 hover:bg-slate-200";
  
  if (solid && danger) {
    bg = "bg-[#F7B731] text-white hover:bg-orange-500 shadow-lg shadow-orange-500/20"; // Using Warning color for End Test
  } else if (danger) {
    bg = "bg-red-50 text-red-500 hover:bg-red-100";
  } else if (isActive) {
    bg = "bg-[#4F7DFF]/10 text-[#4F7DFF] hover:bg-[#4F7DFF]/20";
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${bg}`}
    >
      <Icon size={20} />
    </motion.button>
  );
};
