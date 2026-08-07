const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const target = `export const SimpleAudioPlayer = ({ src, defaultDurationStr, isRealAudio }: { src: string | null, defaultDurationStr: string, isRealAudio?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState(defaultDurationStr);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRealAudio && src) {
      const audio = new Audio(src);
      audioRef.current = audio;
      
      const setAudioData = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDurationStr(\`\${mins}:\${secs.toString().padStart(2, '0')}\`);
      };

      const setAudioTime = () => {
        const mins = Math.floor(audio.currentTime / 60);
        const secs = Math.floor(audio.currentTime % 60);
        setCurrentTime(\`\${mins}:\${secs.toString().padStart(2, '0')}\`);
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
      };

      audio.addEventListener('loadedmetadata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('loadedmetadata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', onEnded);
        audio.pause();
      };
    }
  }, [src, isRealAudio]);

  const togglePlay = () => {
    if (isRealAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.warn("Playback failed", e);
          setIsPlaying(false);
        });
      }
    } else {
      // Mock playback
      if (isPlaying) return;
      setIsPlaying(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 1;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
        } else {
          // Fake time calculation based on progress and default duration
          const parts = defaultDurationStr.split(':');
          const totalSecs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          const currentSecs = Math.floor((p / 100) * totalSecs);
          const currentMins = Math.floor(currentSecs / 60);
          const remainSecs = currentSecs % 60;
          setCurrentTime(\`\${currentMins}:\${remainSecs.toString().padStart(2, '0')}\`);
        }
      }, 200);
    }
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <button 
        onClick={togglePlay}
        className="w-11 h-11 rounded-full bg-[#8278FF] flex items-center justify-center text-white hover:bg-[#6b61f2] transition-colors shrink-0 shadow-sm"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>
      <span className="text-[13px] text-[#A5B4CB] font-medium w-8">{currentTime}</span>
      <div className="flex-1 h-2 bg-[#8278FF]/20 rounded-full overflow-hidden">
        <div className="h-full bg-[#8278FF] rounded-full transition-all duration-200" style={{ width: \`\${progress}%\` }}></div>
      </div>
      <span className="text-[13px] text-[#A5B4CB] font-medium w-8 text-right">{durationStr}</span>
    </div>
  );
}`;

const replacement = `export const SimpleAudioPlayer = ({ src, defaultDurationStr, isRealAudio }: { src: string | null, defaultDurationStr: string, isRealAudio?: boolean }) => {
  if (isRealAudio && src) {
    return <audio controls src={src} className="w-full mt-2" />;
  }
  return (
    <div className="text-slate-400 text-sm italic">No recording available</div>
  );
}`;

if(code.includes('export const SimpleAudioPlayer')) {
    const startIdx = code.indexOf('export const SimpleAudioPlayer');
    const endIdx = code.indexOf('}', code.indexOf('return (', startIdx)); // this isn't safe enough
    // I'll just use string replacement on the exact code.
}

code = code.replace(target, replacement);
fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
console.log("Replaced SimpleAudioPlayer");
