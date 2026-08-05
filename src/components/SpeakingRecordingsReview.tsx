import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, Video, ExternalLink } from 'lucide-react';
import { IELTS_SPEAKING_QUESTIONS } from '../data/speakingTestData';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAudioFromIndexedDB } from '../lib/indexedDB';

export const SimpleAudioPlayer = ({ src, defaultDurationStr, isRealAudio }: { src: string | null, defaultDurationStr: string, isRealAudio?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [durationStr, setDurationStr] = useState(defaultDurationStr);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (src && isRealAudio) {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onerror = (e) => console.warn("Audio error", e);

      const setAudioData = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDurationStr(`${mins}:${secs.toString().padStart(2, '0')}`);
      };
      
      const setAudioTime = () => {
        const currentMins = Math.floor(audio.currentTime / 60);
        const currentSecs = Math.floor(audio.currentTime % 60);
        setCurrentTime(`${currentMins}:${currentSecs.toString().padStart(2, '0')}`);
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
          setCurrentTime(`${currentMins}:${remainSecs.toString().padStart(2, '0')}`);
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
        <div className="h-full bg-[#8278FF] rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="text-[13px] text-[#A5B4CB] font-medium w-8 text-right">{durationStr}</span>
    </div>
  );
}

export const SpeakingRecordingsReview = ({ testId, recordedAudio, providedAudioUrl, providedAnswers, submissionId }: { testId?: string, recordedAudio?: any, providedAudioUrl?: string | null, providedAnswers?: Record<string, any>, submissionId?: string }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(providedAudioUrl || null);
  const [responseUrls, setResponseUrls] = useState<Record<string, string>>({});

  const formattedId = testId ? (testId.toLowerCase().includes('test') || testId.toLowerCase().includes('practice') ? testId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/Ielts/i, 'IELTS') : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/Ielts/i, 'IELTS')) : 'fallback';
  const testNumMatch = formattedId.match(/Test\s+(\d+)/i);
  const testNum = testNumMatch ? testNumMatch[1] : '1';
  const testQuestions = IELTS_SPEAKING_QUESTIONS[testNum as keyof typeof IELTS_SPEAKING_QUESTIONS] || IELTS_SPEAKING_QUESTIONS['1'];

  useEffect(() => {
    const fetchUrls = async () => {
      if (providedAnswers && Object.keys(providedAnswers).length > 0) {
        const urls: Record<string, string> = {};
        for (const [id, data] of Object.entries(providedAnswers)) {
          let url = '';
          if (data && typeof data === 'object' && data.audioUrl) {
            url = data.audioUrl;
          } else if (typeof data === 'string') {
            url = data; // fallback just in case
          }
          
          if (url.startsWith('subcollection:') && submissionId) {
            const subId = url.split(':')[1];
            try {
              const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
              if (docSnap.exists()) {
                url = docSnap.data().audioUrl;
              }
            } catch (e) {
              console.error("Failed to fetch recording from subcollection:", e);
            }
          } else if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
              }
            } catch (e) {
              console.error("Failed to fetch recording from IndexedDB:", e);
            }
          }
          urls[id] = url;
        }
        setResponseUrls(urls);
      } else if (providedAudioUrl) {
        setAudioUrl(providedAudioUrl);
      } else if (recordedAudio && recordedAudio instanceof Blob && recordedAudio.size > 0) {
        const url = URL.createObjectURL(recordedAudio);
        setAudioUrl(url);
      } else if (recordedAudio && !(recordedAudio instanceof Blob)) {
        const urls: Record<string, string> = {};
        for (const [id, blob] of Object.entries(recordedAudio)) {
          if (blob instanceof Blob && blob.size > 0) {
            urls[id] = URL.createObjectURL(blob);
          }
        }
        setResponseUrls(urls);
      }
    };
    fetchUrls();
  }, [recordedAudio, providedAnswers, providedAudioUrl, submissionId]);

  const isOffline = testId === 'offline_speaking' || testId?.toLowerCase().includes('offline');

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
          
          {isOffline && audioUrl && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">Offline Submission Link</h2>
            {(() => {
                let embedUrl = audioUrl;
                if (audioUrl.includes('drive.google.com') && !audioUrl.includes('preview')) {
                    // Match /file/d/ID or ?id=ID
                    let match = audioUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (!match) match = audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                } else if (audioUrl.includes('youtube.com/watch')) {
                    const urlParams = new URL(audioUrl).searchParams;
                    if (urlParams.has('v')) {
                        embedUrl = `https://www.youtube.com/embed/${urlParams.get('v')}`;
                    }
                } else if (audioUrl.includes('youtu.be/')) {
                    const match = audioUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                    }
                }
                
                if (embedUrl.includes('drive.google.com') || embedUrl.includes('youtube.com')) {
                    return (
                        <div className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative" style={{ paddingTop: '56.25%' }}>
                            <iframe 
                                src={embedUrl} 
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media; fullscreen" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    );
                }
                
                return (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                         <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            Open Submission Link
                         </a>
                    </div>
                );
            })()}
          </section>
          )}

          {!isOffline && (
            <>
          {/* Part 1 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 1</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              {testQuestions.part1.map((q, i) => {
                const isNewTopic = i === 0 || testQuestions.part1[i - 1].topic !== q.topic;
                return (
                  <div key={q.id}>
                    {isNewTopic && q.topic && (
                      <p className="text-[#4F7DFF] font-semibold mb-3 text-sm tracking-wide">Let's talk about {q.topic.toLowerCase()}</p>
                    )}
                    <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                    {(responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={responseUrls[q.id] || audioUrl} defaultDurationStr="0:30" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}
                    
                  </div>
                );
              })}
            </div>
          </section>

          {/* Part 2 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 2</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              <div>
                <p className="text-[17px] text-[#1c2b4d] font-medium mb-3 leading-relaxed whitespace-pre-line">
                  {testQuestions.part2.topic}{"\n"}
                  You should say:{"\n"}
                  {testQuestions.part2.bulletPoints.map(bp => `• ${bp}`).join("\n")}
                </p>
                {(responseUrls[testQuestions.part2.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                  <SimpleAudioPlayer src={responseUrls[testQuestions.part2.id] || audioUrl} defaultDurationStr="2:00" isRealAudio={!!responseUrls[testQuestions.part2.id] || !!audioUrl} />
                ) : null}
              </div>
            </div>
          </section>

          {/* Part 3 */}
          <section>
            <h2 className="text-[13px] font-bold text-[#A5B4CB] tracking-[0.2em] uppercase mb-8">Part 3</h2>
            <div className="space-y-10 pl-4 border-l-2 border-transparent">
              {testQuestions.part3.map((q, i) => {
                const isNewTopic = i === 0 || testQuestions.part3[i - 1].topic !== q.topic;
                return (
                  <div key={q.id}>
                    {isNewTopic && q.topic && (
                      <p className="text-[#4F7DFF] font-semibold mb-3 text-sm tracking-wide">Let's discuss {q.topic.toLowerCase()}</p>
                    )}
                    <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                    {(responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={responseUrls[q.id] || audioUrl} defaultDurationStr="1:00" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}
                    
                  </div>
                );
              })}
            </div>
          </section>
          </>
          )}
        </div>
      </div>
    </div>
  );
};
