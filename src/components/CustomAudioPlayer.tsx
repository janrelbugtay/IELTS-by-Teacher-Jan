import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface CustomAudioPlayerProps {
  isMockMode?: boolean;
  src: string;
  onPlayClick?: () => boolean | void;
}

export const CustomAudioPlayer = forwardRef<HTMLAudioElement, CustomAudioPlayerProps>(({ src, isMockMode, onPlayClick }, ref) => {
  const innerAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const setRefs = (node: HTMLAudioElement | null) => {
    innerAudioRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = innerAudioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('durationchange', setAudioData);
    audio.addEventListener('canplay', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    
  

  return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('durationchange', setAudioData);
      audio.removeEventListener('canplay', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = innerAudioRef.current;
    if (!audio) return;
    
    if (!isPlaying && onPlayClick) {
      const preventDefault = onPlayClick();
      if (preventDefault) return;
    }
    
    if (isPlaying) {
      if (isMockMode) return; // Cannot pause in mock mode
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = innerAudioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const audio = innerAudioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  // Extract ID from src
  let driveId = '';
  if (src && src.includes('?id=')) {
    driveId = src.split('?id=')[1].split('&')[0];
  } else if (src && src.includes('file/d/')) {
    driveId = src.split('file/d/')[1].split('/')[0];
  }

  if (driveId) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '140px' }}>
        <iframe src={`https://drive.google.com/file/d/${driveId}/preview`} width="100%" height="100%" style={{ border: 'none' }} allow="autoplay" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-200">
      <audio ref={setRefs} src={src || undefined} preload="auto" />
      
      <button 
        onClick={togglePlayPause}
        disabled={isMockMode && isPlaying}
        className={`w-12 h-12 flex items-center justify-center text-white rounded-full transition-colors shrink-0 shadow-md ${isMockMode && isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
      </button>
      
      <div className="flex items-center gap-3 w-72">
        <span className="text-sm font-medium font-mono text-gray-700 w-12 text-right">
          {formatTime(currentTime)}
        </span>
        
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          disabled={isMockMode}
          className={`flex-1 h-2.5 bg-gray-200 rounded-lg appearance-none accent-blue-600 ${isMockMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        />
        
        <span className="text-sm font-medium font-mono text-gray-700 w-12">
          {formatTime(duration)}
        </span>
      </div>

      <div className="w-px h-8 bg-gray-200 mx-1"></div>
      
      <button 
        onClick={toggleMute}
        className="text-gray-500 hover:text-gray-800 transition-colors"
      >
        {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
      </button>
    </div>
  );
});
