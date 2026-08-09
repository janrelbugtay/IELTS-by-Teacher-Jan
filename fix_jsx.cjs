const fs = require('fs');
let content = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

// For Part 2
const p2Target = `                {(responseUrls[testQuestions.part2.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                  <SimpleAudioPlayer src={(responseUrls[testQuestions.part2.id] === 'LOCAL_ONLY' || (!responseUrls[testQuestions.part2.id] && audioUrl && audioUrl.startsWith('idb:'))) ? null : (responseUrls[testQuestions.part2.id] || audioUrl)} defaultDurationStr="2:00" isRealAudio={!!responseUrls[testQuestions.part2.id] || !!audioUrl} />
                ) : null}`;

const p2Replace = `                {(responseUrls[testQuestions.part2.id] === 'LOCAL_ONLY' || (!responseUrls[testQuestions.part2.id] && audioUrl && audioUrl.startsWith('idb:'))) ? (
                  <div className="text-amber-600 text-sm italic bg-amber-50 p-2 rounded border border-amber-200">Recording saved locally on student's device.</div>
                ) : (responseUrls[testQuestions.part2.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                  <SimpleAudioPlayer src={responseUrls[testQuestions.part2.id] || audioUrl} defaultDurationStr="2:00" isRealAudio={!!responseUrls[testQuestions.part2.id] || !!audioUrl} />
                ) : null}`;

content = content.replace(p2Target, p2Replace);

// For Part 3
const p3Target = `                    {(responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={(responseUrls[q.id] === 'LOCAL_ONLY' || (!responseUrls[q.id] && audioUrl && audioUrl.startsWith('idb:'))) ? null : (responseUrls[q.id] || audioUrl)} defaultDurationStr="1:00" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}`;
                    
const p3Replace = `                    {(responseUrls[q.id] === 'LOCAL_ONLY' || (!responseUrls[q.id] && audioUrl && audioUrl.startsWith('idb:'))) ? (
                        <div className="text-amber-600 text-sm italic bg-amber-50 p-2 rounded border border-amber-200">Recording saved locally on student's device.</div>
                    ) : (responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={responseUrls[q.id] || audioUrl} defaultDurationStr="1:00" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}`;

content = content.replace(p3Target, p3Replace);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', content);
