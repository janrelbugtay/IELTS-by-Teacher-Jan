import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAudioFromIndexedDB } from '../lib/indexedDB';

// Global coordinator to prevent multiple speaking recordings playing simultaneously
type StopAudioCallback = () => void;
interface ActiveAudioSession {
  id: string;
  audio: HTMLAudioElement;
  stop: StopAudioCallback;
}

let activeAudioSession: ActiveAudioSession | null = null;

export const stopAllSpeakingRecordings = (exceptId?: string) => {
  if (activeAudioSession && activeAudioSession.id !== exceptId) {
    try {
      activeAudioSession.audio.pause();
    } catch (e) {}
    try {
      activeAudioSession.stop();
    } catch (e) {}
    activeAudioSession = null;
  }

  // Also stop any other audio/video elements in the DOM
  if (typeof document !== 'undefined') {
    document.querySelectorAll('audio, video').forEach((el) => {
      try {
        if (!(el as HTMLMediaElement).paused) {
          (el as HTMLMediaElement).pause();
        }
      } catch (e) {}
    });
  }

  // Broadcast event across components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('speaking-audio-pause-all', {
        detail: { exceptId }
      })
    );
  }
};

export const registerActiveSpeakingRecording = (
  id: string,
  audio: HTMLAudioElement,
  stop: StopAudioCallback
) => {
  stopAllSpeakingRecordings(id);
  activeAudioSession = { id, audio, stop };
};

export const unregisterActiveSpeakingRecording = (id: string) => {
  if (activeAudioSession?.id === id) {
    activeAudioSession = null;
  }
};

interface SpeakingAudioItemProps {
  qId: string;
  submissionId?: string;
  audioUrl?: string | null;
  defaultDurationStr?: string;
  isAdmin?: boolean;
  onAudioUpdated?: (qId: string, newUrl: string) => void;
}

export const SpeakingAudioItem: React.FC<SpeakingAudioItemProps> = ({
  qId,
  submissionId,
  audioUrl: initialAudioUrl,
  defaultDurationStr = "0:30",
  isAdmin = false,
  onAudioUpdated
}) => {
  const instanceId = useRef(`audio_${qId}_${Math.random().toString(36).slice(2, 9)}`).current;
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState(defaultDurationStr || "0:30");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFallbackDurationSecs = () => {
    if (!defaultDurationStr) return 30;
    const parts = defaultDurationStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      const total = mins * 60 + secs;
      if (total > 0) return total;
    }
    return 30;
  };

  useEffect(() => {
    setCurrentUrl(initialAudioUrl || null);
  }, [initialAudioUrl]);

  // Listen for playback from other audio items so they do not play simultaneously
  useEffect(() => {
    const handlePauseOther = (e: any) => {
      if (e.detail?.exceptId !== instanceId) {
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch (err) {}
        }
        setIsPlaying(false);
      }
    };

    window.addEventListener('speaking-audio-pause-all', handlePauseOther as EventListener);
    return () => {
      window.removeEventListener('speaking-audio-pause-all', handlePauseOther as EventListener);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (err) {}
      }
      unregisterActiveSpeakingRecording(instanceId);
    };
  }, [instanceId]);

  // Audio element listeners
  useEffect(() => {
    if (currentUrl && currentUrl !== 'LOCAL_ONLY') {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
      unregisterActiveSpeakingRecording(instanceId);
      setIsPlaying(false);

      const audio = new Audio(currentUrl);
      audioRef.current = audio;

      const handlePlay = () => {
        stopAllSpeakingRecordings(instanceId);
        registerActiveSpeakingRecording(instanceId, audio, () => {
          try {
            audio.pause();
          } catch (e) {}
          setIsPlaying(false);
        });
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
        unregisterActiveSpeakingRecording(instanceId);
      };

      const updateProgress = () => {
        if (Number.isFinite(audio.currentTime)) {
          const currentSecs = Math.floor(audio.currentTime);
          const currentMins = Math.floor(currentSecs / 60);
          const remainSecs = currentSecs % 60;
          setCurrentTime(`${currentMins}:${remainSecs.toString().padStart(2, '0')}`);
        }

        const effectiveDuration = (Number.isFinite(audio.duration) && audio.duration > 0)
          ? audio.duration
          : getFallbackDurationSecs();

        if (effectiveDuration > 0 && Number.isFinite(audio.currentTime)) {
          setProgress(Math.min(100, Math.max(0, (audio.currentTime / effectiveDuration) * 100)));
        }

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          const totalSecs = Math.floor(audio.duration);
          const totalMins = Math.floor(totalSecs / 60);
          const totalRemain = totalSecs % 60;
          setDurationStr(`${totalMins}:${totalRemain.toString().padStart(2, '0')}`);
        } else {
          setDurationStr(defaultDurationStr || "0:30");
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
        unregisterActiveSpeakingRecording(instanceId);
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateProgress);
      audio.addEventListener('ended', handleEnded);

      return () => {
        try {
          audio.pause();
        } catch (e) {}
        unregisterActiveSpeakingRecording(instanceId);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateProgress);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentUrl, instanceId, defaultDurationStr]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      try {
        audioRef.current.pause();
      } catch (e) {}
      setIsPlaying(false);
      unregisterActiveSpeakingRecording(instanceId);
    } else {
      // 1. Immediately pause any other playing recording
      stopAllSpeakingRecordings(instanceId);

      let isCancelled = false;
      registerActiveSpeakingRecording(instanceId, audioRef.current, () => {
        isCancelled = true;
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch (e) {}
        }
        setIsPlaying(false);
      });

      audioRef.current.play().then(() => {
        if (isCancelled || !audioRef.current || audioRef.current.paused) {
          try {
            audioRef.current?.pause();
          } catch (e) {}
          setIsPlaying(false);
          unregisterActiveSpeakingRecording(instanceId);
          return;
        }
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio playback error:", err);
        setIsPlaying(false);
        unregisterActiveSpeakingRecording(instanceId);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage("Uploading audio recording...");

    try {
      // 1. Upload to server
      const formData = new FormData();
      formData.append("audio", file, `${submissionId || 'sub'}_${qId}.webm`);
      formData.append("submissionId", submissionId || "");
      formData.append("qId", qId);

      const res = await fetch("/api/speaking/upload", {
        method: "POST",
        body: formData
      });

      let uploadedUrl = "";
      if (res.ok) {
        const json = await res.json();
        uploadedUrl = json.url;
      }

      // 2. Also save to Firestore subcollection if base64 fits
      if (submissionId) {
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          reader.readAsDataURL(file);
          const base64 = await base64Promise;
          if (base64.length < 900000) {
            await setDoc(doc(db, 'submissions', submissionId, 'recordings', qId), {
              audioUrl: base64,
              serverUrl: uploadedUrl || null,
              mimeType: file.type || 'audio/webm'
            });
            if (!uploadedUrl) uploadedUrl = `subcollection:${qId}`;
          }
        } catch (fbErr) {
          console.warn("Firestore subcollection backup error:", fbErr);
        }

        // 3. Update main submission answer URL
        const finalUrl = uploadedUrl || `/api/speaking/audio/${submissionId}_${qId}.webm`;
        await updateDoc(doc(db, 'submissions', submissionId), {
          [`answers.${qId}.audioUrl`]: finalUrl
        });

        setCurrentUrl(finalUrl);
        if (onAudioUpdated) onAudioUpdated(qId, finalUrl);
        setStatusMessage("Recording attached successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      setStatusMessage("Upload failed. Please try again.");
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveLink = async () => {
    if (!linkInputValue.trim() || !submissionId) return;

    setIsUploading(true);
    try {
      const url = linkInputValue.trim();
      await updateDoc(doc(db, 'submissions', submissionId), {
        [`answers.${qId}.audioUrl`]: url
      });
      setCurrentUrl(url);
      if (onAudioUpdated) onAudioUpdated(qId, url);
      setShowLinkInput(false);
      setLinkInputValue('');
      setStatusMessage("Audio link attached successfully!");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save audio link", err);
      setStatusMessage("Failed to attach link.");
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const isLocalOnly = currentUrl === 'LOCAL_ONLY' || (!currentUrl && !initialAudioUrl);

  if (isLocalOnly) {
    return (
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 my-2.5 text-slate-800">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 leading-snug">
              Recording saved locally on student's device
            </p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              The student's browser stored this recording locally during test completion. If you have the student's audio file or Google Drive link, you can attach it directly below.
            </p>

            {statusMessage && (
              <p className="text-xs font-medium text-emerald-700 mt-2 bg-emerald-50 px-2 py-1 rounded inline-block">
                {statusMessage}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploading ? "Uploading..." : "Attach Audio File"}
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                {showLinkInput ? "Cancel Link" : "Attach Drive Link"}
              </button>
            </div>

            {showLinkInput && (
              <div className="mt-3 flex items-center gap-2 max-w-md">
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or audio URL"
                  value={linkInputValue}
                  onChange={(e) => setLinkInputValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveLink}
                  disabled={!linkInputValue.trim() || isUploading}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Playable audio player
  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 my-2 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#8278FF] hover:bg-[#6b61f2] flex items-center justify-center text-white transition-colors shrink-0 shadow-sm"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        <span className="text-xs text-slate-500 font-medium w-8 text-right font-mono">{currentTime}</span>

        <div 
          className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer relative"
          onClick={(e) => {
            if (audioRef.current) {
              const dur = audioRef.current.duration;
              const effectiveDur = (typeof dur === 'number' && Number.isFinite(dur) && dur > 0)
                ? dur
                : getFallbackDurationSecs();

              if (typeof effectiveDur === 'number' && Number.isFinite(effectiveDur) && effectiveDur > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                if (rect.width > 0) {
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  const newTime = ratio * effectiveDur;
                  if (typeof newTime === 'number' && Number.isFinite(newTime) && !isNaN(newTime) && newTime >= 0) {
                    try {
                      if (Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
                        audioRef.current.currentTime = Math.min(audioRef.current.duration, Math.max(0, newTime));
                      } else {
                        audioRef.current.currentTime = Math.max(0, newTime);
                      }
                    } catch (err) {
                      console.warn("Could not seek audio:", err);
                    }
                  }
                }
              }
            }
          }}
        >
          <div 
            className="h-full bg-[#8278FF] rounded-full transition-all duration-150" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <span className="text-xs text-slate-500 font-medium w-8 font-mono">{durationStr}</span>
      </div>
    </div>
  );
};
