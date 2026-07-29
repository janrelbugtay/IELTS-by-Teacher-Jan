const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const isOfflineLogic = `  const today = new Date().toLocaleDateString('en-US', {`;
const newIsOfflineLogic = `  const isOffline = testId === 'offline_speaking' || testId?.toLowerCase().includes('offline');

  const today = new Date().toLocaleDateString('en-US', {`;

code = code.replace(isOfflineLogic, newIsOfflineLogic);

const contentStart = `{/* Content */}
        <div className="space-y-16 max-w-3xl">
          {/* Full Test Recording */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">Full Test Recording</h2>
            <SimpleAudioPlayer src={audioUrl} defaultDurationStr="Full Recording" isRealAudio={!!audioUrl} />
          </section>`;

const newContentStart = `{/* Content */}
        <div className="space-y-16 max-w-3xl">
          {/* Full Test Recording */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">Full Test Recording</h2>
            <SimpleAudioPlayer src={audioUrl} defaultDurationStr="Full Recording" isRealAudio={!!audioUrl} />
          </section>
          {!isOffline && (
            <>`;

code = code.replace(contentStart, newContentStart);

const part3End = `              {MOCK_QUESTIONS.part3.map((q) => (
                <div key={q.id}>
                  <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                  
                </div>
              ))}
            </div>
          </section>`;

const newPart3End = `              {MOCK_QUESTIONS.part3.map((q) => (
                <div key={q.id}>
                  <p className="text-[17px] text-[#1c2b4d] font-medium mb-3">{q.text}</p>
                  
                </div>
              ))}
            </div>
          </section>
          </>
          )}`;

code = code.replace(part3End, newPart3End);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
