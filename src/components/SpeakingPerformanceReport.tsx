import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Play, Pause, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { IELTS_SPEAKING_QUESTIONS } from '../data/speakingTestData';
import { getAudioFromIndexedDB } from '../lib/indexedDB';

export interface PerformanceReportData {
  overallScore: number;
  scores: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
}

const rubricData = {
    FC: {
        9: ["Speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar", "Speaks coherently with fully appropriate cohesive features", "Develops topics fully and appropriately"],
        8: ["Speaks fluently with only occasional repetition or self- correction; hesitation is usually content-related and only rarely to search for language", "Develops topics coherently and appropriately"],
        7: ["Speaks at length without noticeable effort or loss of coherence", "May demonstrate language-related hesitation at times, or some repetition and/or self-correction", "Uses a range of connectives and discourse markers with some flexibility"],
        6: ["Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation", "Uses a range of connectives and discourse markers but not always appropriately"],
        5: ["Usually maintains flow of speech but uses repetition, self correction and/or slow speech to keep going", "May over-use certain connectives and discourse markers", "Produces simple speech fluently, but more complex communication causes fluency problems"],
        4: ["Cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction", "Links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence"],
        3: ["Speaks with long pauses", "Has limited ability to link simple sentences", "Gives only simple responses and is frequently unable to convey basic message"],
        2: ["Pauses lengthily before most words", "Little communication possible"],
        1: ["No communication possible", "No rateable language"]
    },
    LR: {
        9: ["Uses vocabulary with full flexibility and precision in all topics", "Uses idiomatic language naturally and accurately"],
        8: ["Uses a wide vocabulary resource readily and flexibly to convey precise meaning", "Uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies", "Uses paraphrase effectively as required"],
        7: ["Uses vocabulary resource flexibly to discuss a variety of topics", "Uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices", "Uses paraphrase effectively"],
        6: ["Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies", "Generally paraphrases successfully"],
        5: ["Manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility", "Attempts to use paraphrase but with mixed success"],
        4: ["Is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice", "Rarely attempts paraphrase"],
        3: ["Uses simple vocabulary to convey personal information", "Has insufficient vocabulary for less familiar topics"],
        2: ["Only produces isolated words or memorised utterances"],
        1: ["No communication possible", "No rateable language"]
    },
    GRA: {
        9: ["Uses a full range of structures naturally and appropriately", "Produces consistently accurate structures apart from ‘slips’"],
        8: ["Uses a wide range of structures flexibly", "Produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors"],
        7: ["Uses a range of complex structures with some flexibility", "Frequently produces error-free sentences, though some grammatical mistakes persist"],
        6: ["Uses a mix of simple and complex structures, but with limited flexibility", "May make frequent mistakes with complex structures, though these rarely cause comprehension problems"],
        5: ["Produces basic sentence forms with reasonable accuracy", "Uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems"],
        4: ["Produces basic sentence forms and some correct simple sentences but subordinate structures are rare", "Errors are frequent and may lead to misunderstanding"],
        3: ["Attempts basic sentence forms but with limited success, or relies on apparently memorised utterances", "Makes numerous errors except in memorised expressions"],
        2: ["Cannot produce basic sentence forms"],
        1: ["No communication possible", "No rateable language"]
    },
    PR: {
        9: ["Uses a full range of pronunciation features with precision and subtlety", "Sustains flexible use of features throughout", "Is effortless to understand"],
        8: ["Uses a wide range of pronunciation features", "Sustains flexible use of features, with only occasional lapses", "Is easy to understand throughout; L1 accent has minimal effect on intelligibility"],
        7: ["Shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8"],
        6: ["Uses a range of pronunciation features with mixed control", "Shows some effective use of features but this is not sustained", "Can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times"],
        5: ["Shows all features of band 4 and some, but not all the positive features of band 6", "Attempts to control features but lapses are frequent", "Mispronunciations are frequent and cause some difficulty for the listener"],
        4: ["Uses a limited range of pronunciation features"],
        3: ["Shows some of the features of band 2 and some, but not all, of the positive features of band 4"],
        2: ["Speech is often unintelligible"],
        1: ["No communication possible", "No rateable language"]
    }
};

const criteriaNames = {
  FC: "Fluency & Coherence",
  LR: "Lexical Resource",
  GRA: "Grammatical Range",
  PR: "Pronunciation"
};

type CriterionKey = keyof typeof criteriaNames;

export const SpeakingPerformanceReport = ({ testId, onNext, audioUrl, submissionId, submissionData }: { testId?: string, onNext?: () => void, audioUrl?: string, submissionId?: string, submissionData?: any }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [selectedScores, setSelectedScores] = useState<Record<CriterionKey, number | null>>({
    FC: null,
    LR: null,
    GRA: null,
    PR: null
  });

  const [activeCriterion, setActiveCriterion] = useState<CriterionKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (submissionData && submissionData.rubricScores) {
      setSelectedScores({
        FC: submissionData.rubricScores.FC || null,
        LR: submissionData.rubricScores.LR || null,
        GRA: submissionData.rubricScores.GRA || null,
        PR: submissionData.rubricScores.PR || null
      });
    }
  }, [submissionData]);

  useEffect(() => {
    const scores = Object.values(selectedScores);
    if (scores.includes(null)) {
      setOverallScore(null);
      return;
    }

    const sum = scores.reduce((a, b) => (a || 0) + (b || 0), 0);
    const average = sum / 4;
    const roundedScore = Math.round(average * 2) / 2;
    setOverallScore(roundedScore);
  }, [selectedScores]);

  const formattedId = testId ? (testId.toLowerCase().includes('test') || testId.toLowerCase().includes('practice') ? testId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/Ielts/i, 'IELTS') : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/Ielts/i, 'IELTS')) : 'IELTS Speaking Test 1';

  // Extract test number or use fallback
  const testNumMatch = formattedId.match(/Test\s+(\d+)/i);
  const testNum = testNumMatch ? testNumMatch[1] : '1';
  const testQuestions = IELTS_SPEAKING_QUESTIONS[testNum as keyof typeof IELTS_SPEAKING_QUESTIONS] || IELTS_SPEAKING_QUESTIONS['1'];

  const resetScores = () => {
    if (!isAdmin) return;
    setSelectedScores({ FC: null, LR: null, GRA: null, PR: null });
  };

  const openModal = (key: CriterionKey) => {
    if (!isAdmin) return;
    setActiveCriterion(key);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setActiveCriterion(null), 300);
  };

  const selectScore = (band: number) => {
    if (!isAdmin) return;
    if (activeCriterion) {
      setSelectedScores(prev => ({ ...prev, [activeCriterion]: band }));
      closeModal();
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    if (overallScore === null) {
      alert("Please evaluate all criteria first.");
      return;
    }
    setIsSaving(true);
    try {
      if (submissionId) {
        await updateDoc(doc(db, 'submissions', submissionId), {
          rubricScores: selectedScores,
          bandScore: overallScore,
          updatedAt: new Date()
        });
        alert("Evaluation saved successfully!");
      } else {
        alert("No submission to save to.");
      }
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert("Failed to save evaluation.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const [responseUrls, setResponseUrls] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const resolveUrls = async () => {
      if (submissionData && submissionData.answers && Object.keys(submissionData.answers).length > 0) {
        const urls: Record<string, string> = {};
        for (const [id, data] of Object.entries(submissionData.answers)) {
          let url = '';
          if (data && typeof data === 'object' && (data as any).audioUrl) {
            url = (data as any).audioUrl;
          } else if (typeof data === 'string') {
            url = data as string;
          }
          
          if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            let foundBlob = false;
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
                foundBlob = true;
              }
            } catch(e) {
              console.error(e);
            }
            if (!foundBlob) {
              url = ''; // Prevent idb url from being used
            }
          } else if (url.startsWith('subcollection:') && submissionId) {
             const subId = url.split(':')[1];
             try {
               const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
               if (docSnap.exists()) {
                 url = docSnap.data().audioUrl;
               }
             } catch(e) {
               console.error(e);
             }
          }
          
          if (url) urls[id] = url;
        }
        setResponseUrls(urls);
      }
    };
    resolveUrls();
  }, [submissionData, submissionId]);

  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return audioUrl || null;
  };

  const togglePlayAudio = (qId: string) => {
    let url = getAudioUrl(qId);
    if (!url) {
      alert("No recording available for this test.");
      return;
    }

    if (playingId === qId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(url);
      audioRef.current.play().then(() => setPlayingId(qId)).catch(e => {
        console.warn("Playback failed", e);
        setPlayingId(null);
        alert("Could not play the recording in this browser. The audio format may not be supported or it might be blocked.");
      });
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden overflow-y-auto w-full">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(0, 0, 0, 0.4); }
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
        .glass-card { background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 1); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        .glass-card:hover { background: rgba(255, 255, 255, 0.9); border-color: rgba(139, 92, 246, 0.4); transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.15); }
        .score-circle { background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 70%); }
        .gradient-text { background: linear-gradient(to right, #7c3aed, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-[128px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply blur-[128px] opacity-40 pointer-events-none" />

      {/* Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-end mb-6 z-10">
        {isAdmin && (
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 text-white hover:bg-violet-700 bg-violet-600 transition-colors font-medium px-6 py-2 rounded-full backdrop-blur-sm border border-violet-500 shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Evaluation'}
          </button>
        )}
      </div>

      <div className="max-w-4xl w-full glass-panel rounded-3xl overflow-hidden relative z-10">
        
        {/* Header */}
        <div className="relative py-12 px-8 text-center overflow-hidden border-b border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-indigo-100/50 z-0" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              {formattedId.startsWith('IELTS Speaking') ? (
                <>IELTS Speaking <span className="gradient-text">{formattedId.replace('IELTS Speaking ', '')}</span></>
              ) : (
                <span className="gradient-text">{formattedId}</span>
              )}
            </h1>
            <p className="text-slate-600 md:text-lg max-w-2xl mx-auto font-light">
              Select the band descriptor for each criterion to calculate the precise overall score.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {/* Overall Score Section */}
          <div className="mb-12 pb-10 border-b border-slate-200 flex flex-col items-center relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] rounded-full">
              Overall Band
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center rounded-full glass-card score-circle mb-8 group bg-white shadow-lg fade-in">
              <div className="absolute inset-2 rounded-full border-2 border-violet-100 group-hover:border-violet-300 transition-colors" />
              <span className={`text-7xl font-bold tracking-tighter drop-shadow-sm ${overallScore !== null ? 'gradient-text' : 'text-slate-300'}`}>
                {overallScore !== null ? overallScore.toFixed(1).replace('.0', '') : '-'}
              </span>
            </div>
            
            <button 
              onClick={resetScores} 
              className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl text-slate-600 hover:text-red-500 transition-all font-medium shadow-sm"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" />
              Reset Evaluation
            </button>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 pb-10 border-b border-slate-200">
            {(Object.entries(criteriaNames) as [CriterionKey, string][]).map(([key, name]) => {
              const score = selectedScores[key];
              const hasScore = score !== null;
              return (
                <div 
                  key={key}
                  className={`group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${hasScore ? 'border-violet-300 bg-violet-50/50' : 'glass-card'}`}
                >
                  {hasScore && <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 to-transparent opacity-50" />}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{name}</h3>
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg border transition-all ${hasScore ? 'text-violet-700 border-violet-300 bg-violet-100 shadow-sm' : 'text-slate-400 border-slate-200 bg-white/50'}`}>
                        {hasScore ? score : '-'}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <p className={`text-sm font-medium ${hasScore ? 'text-violet-600' : 'text-slate-500'}`}>
                        {hasScore ? `Band ${score} Selected` : 'Pending Assessment'}
                      </p>
                      <button 
                        onClick={() => openModal(key)} 
                        className={`px-4 py-2 bg-white hover:bg-violet-600 border hover:border-violet-500 rounded-lg text-sm font-semibold transition-all shadow-sm ${hasScore ? 'border-slate-200 text-violet-600 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-white'}`}
                      >
                        {hasScore ? 'Update' : 'Evaluate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          
          {audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be') || audioUrl.includes('http')) && !audioUrl.startsWith('blob:') && (
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">External Audio/Video Link</h3>
              {(() => {
                  let embedUrl = audioUrl;
                  if (audioUrl.includes('drive.google.com') && !audioUrl.includes('preview')) {
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
                  
                  if (embedUrl !== audioUrl || audioUrl.includes('drive.google.com') || audioUrl.includes('youtube')) {
                      return (
                          <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen></iframe>
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
                              Open External Submission Link
                           </a>
                      </div>
                  );
              })()}
            </div>
          )}
          
          {/* Your Recordings / Uploading */}
          <div className="mt-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] rounded-full">
              {submissionData?.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your performance...
                </span>
              ) : (
                'Your Recordings'
              )}
            </div>
            
            <div className="space-y-8 pt-6">
              {/* Part 1 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-lg text-sm">Part 1</span>
                  Introduction & Interview
                </h3>
                <div className="space-y-4">
                  {testQuestions.part1.map((q, idx) => {
                    const isNewTopic = idx === 0 || testQuestions.part1[idx - 1].topic !== q.topic;
                    return (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {isNewTopic && q.topic && (
                          <p className="text-violet-600 font-semibold mb-3 text-sm">Let's talk about {q.topic.toLowerCase()}</p>
                        )}
                        <p className="text-slate-700 font-medium mb-3">{idx + 1}. {q.text}</p>
                        
                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">Part 2</span>
                  Long Turn
                </h3>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="mb-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-slate-700 text-sm italic">
                    {testQuestions.part2.topic}<br/>
                    You should say:<br/>
                    {testQuestions.part2.bulletPoints.map((bp, i) => (
                      <React.Fragment key={i}>
                        {i < testQuestions.part2.bulletPoints.length - 1 ? `• ${bp}` : bp}<br/>
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {getAudioUrl(testQuestions.part2.id) ? (
                    <audio controls src={getAudioUrl(testQuestions.part2.id) as string} className="w-full max-w-sm mt-2" />
                  ) : (
                    <div className="text-slate-400 text-sm italic">No recording</div>
                  )}
                </div>
              </div>

              {/* Part 3 */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-lg text-sm">Part 3</span>
                  Discussion
                </h3>
                <div className="space-y-4">
                  {testQuestions.part3.map((q, idx) => {
                    const isNewTopic = idx === 0 || testQuestions.part3[idx - 1].topic !== q.topic;
                    return (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {isNewTopic && q.topic && (
                          <p className="text-fuchsia-600 font-semibold mb-3 text-sm">Let's discuss {q.topic.toLowerCase()}</p>
                        )}
                        <p className="text-slate-700 font-medium mb-3">{idx + 1}. {q.text}</p>
                        
                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && activeCriterion && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm p-4 sm:p-6 transition-all duration-300"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden m-auto z-50 transform scale-100 transition-all duration-300 border border-slate-100 fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide">
                  {criteriaNames[activeCriterion]}
                </h3>
              </div>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4 bg-white">
              {([9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map(band => {
                const descriptors = rubricData[activeCriterion][band];
                const isSelected = selectedScores[activeCriterion] === band;
                
                return (
                  <div 
                    key={band}
                    onClick={() => selectScore(band)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected ? 'border-violet-400 bg-violet-50 shadow-md transform scale-[1.02]' : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
                  >
                    {isSelected && <div className="absolute right-0 top-0 w-32 h-32 bg-violet-100 rounded-bl-full pointer-events-none" />}
                    
                    <div className={`flex items-center justify-between mb-2 relative z-10 border-b pb-2 ${isSelected ? 'border-violet-200' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                          {band}
                        </div>
                        <h4 className={`font-bold text-lg md:text-xl ${isSelected ? 'text-violet-900' : 'text-slate-800'}`}>
                          Band {band}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="bg-violet-100 border border-violet-200 text-violet-700 text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                          Selected
                        </span>
                      )}
                    </div>
                    
                    <ul className="mt-3 space-y-2 relative z-10">
                      {descriptors.map((desc, i) => (
                        <li key={i} className={`flex items-start text-sm md:text-base transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          <span className="mr-3 text-violet-500 flex-shrink-0 mt-1">✦</span> 
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
