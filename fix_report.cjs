const fs = require('fs');
const file = 'src/components/SpeakingPerformanceReport.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId] === 'LOCAL_ONLY' ? null : responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return (audioUrl === 'LOCAL_ONLY' || (audioUrl && audioUrl.startsWith('idb:'))) ? null : (audioUrl || null);
  };`;

const replace1 = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return (audioUrl && audioUrl.startsWith('idb:')) ? 'LOCAL_ONLY' : (audioUrl || null);
  };`;

content = content.replace(target1, replace1);

// P1
const p1Target = `                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}`;
const p1Replace = `                        {getAudioUrl(q.id) === 'LOCAL_ONLY' ? (
                            <div className="text-amber-600 text-sm italic bg-amber-50 p-2 rounded border border-amber-200 mt-2">Recording saved locally on student's device.</div>
                        ) : getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}`;
content = content.replace(p1Target, p1Replace);

// P2
const p2Target = `                  {getAudioUrl(testQuestions.part2.id) ? (
                    <audio controls src={getAudioUrl(testQuestions.part2.id) as string} className="w-full max-w-sm mt-2" />
                  ) : (
                    <div className="text-slate-400 text-sm italic">No recording</div>
                  )}`;
const p2Replace = `                  {getAudioUrl(testQuestions.part2.id) === 'LOCAL_ONLY' ? (
                      <div className="text-amber-600 text-sm italic bg-amber-50 p-2 rounded border border-amber-200 mt-2">Recording saved locally on student's device.</div>
                  ) : getAudioUrl(testQuestions.part2.id) ? (
                    <audio controls src={getAudioUrl(testQuestions.part2.id) as string} className="w-full max-w-sm mt-2" />
                  ) : (
                    <div className="text-slate-400 text-sm italic">No recording</div>
                  )}`;
content = content.replace(p2Target, p2Replace);

// P3
const p3Target = `                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}`;
content = content.replace(p3Target, p1Replace); // Same as p1

fs.writeFileSync(file, content);
