const fs = require('fs');

const newCode = `import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause } from 'lucide-react';

const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', text: 'What do you enjoy most about your work?', duration: '0:42' },
    { id: 'p1_2', text: 'Do you prefer working alone or with others?', duration: '0:31' },
    { id: 'p1_3', text: 'Do you think you are a careful reader?', duration: '0:45' }
  ],
  part2: {
    id: 'p2_1',
    text: 'Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and how you felt about it.',
    duration: '2:04'
  },
  part3: [
    { id: 'p3_1', text: 'Do you think people are less willing to help others these days?', duration: '0:55' },
    { id: 'p3_2', text: 'What kinds of people need help in society?', duration: '1:12' }
  ]
};

const SimpleAudioPlayer = ({ src, defaultDurationStr, isRealAudio }: { src: string | null, defaultDurationStr: string, isRealAudio?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState(defaultDurationStr);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (src && isRealAudio) {
      const audio = new Audio(src);
      audioRef.current = audio;

      const setAudioData = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDurationStr(\`\${mins}:\${secs.toString().padStart(2, '0')}\`);
      };
      
      const setAudioTime = () => {
        const currentMins = Math.floor(audio.currentTime / 60);
        const currentSecs = Math.floor(audio.currentTime % 60);
        setCurrentTime(\`\${currentMins}:\${currentSecs.toString().padStart(2, '0')}\`);
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
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Mock playback
      if (isPlaying) return;
      setIsPlaying(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 2;
        if (p >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
        } else {
          setProgress(p);
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
}

export const SpeakingRecordingsReview = ({ testId, recordedAudio }: { testId?: string, recordedAudio: Blob | null }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recordedAudio && recordedAudio.size > 0) {
      const url = URL.createObjectURL(recordedAudio);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [recordedAudio]);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto w-full font-sans bg-white min-h-screen">
      <div className="p-10 md:p-14">
        {/* Header */}
        <div className="flex items-start gap-4 mb-16">
          <Mic className="text-[#8278FF] mt-1" size={28} />
          <div>
            <h1 className="text-[32px] font-bold text-[#282B5C] leading-tight">Recording</h1>
            <p className="text-[15px] text-[#A5B4CB] mt-1">Recorded on {today}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-16 max-w-3xl">
          {/* Part 1 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 1</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              {MOCK_QUESTIONS.part1.map((q, i) => (
                <div key={q.id}>
                  <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                  <SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} isRealAudio={i === 0 && !!audioUrl} />
                </div>
              ))}
            </div>
          </section>

          {/* Part 2 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 2</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              <div>
                <p className="text-[17px] text-[#1c2b4d] font-medium mb-3 leading-relaxed">{MOCK_QUESTIONS.part2.text}</p>
                <SimpleAudioPlayer src={audioUrl} defaultDurationStr={MOCK_QUESTIONS.part2.duration} />
              </div>
            </div>
          </section>

          {/* Part 3 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 3</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              {MOCK_QUESTIONS.part3.map((q) => (
                <div key={q.id}>
                  <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                  <SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', newCode);
