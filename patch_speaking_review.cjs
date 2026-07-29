const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const importSearch = `import { Mic, Play, Pause } from 'lucide-react';`;
if (code.includes(importSearch)) {
    code = code.replace(importSearch, `import { Mic, Play, Pause, Video, ExternalLink } from 'lucide-react';`);
} else {
    // try finding lucide-react import
    code = code.replace(`from 'lucide-react';`, `, Video, ExternalLink } from 'lucide-react';`);
}

const search = `          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">{isOffline ? "Offline Audio Submission" : "Full Test Recording"}</h2>
            <SimpleAudioPlayer src={audioUrl} defaultDurationStr={isOffline ? "Audio Recording" : "Full Recording"} isRealAudio={!!audioUrl} />
          </section>`;

const replace = `          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">{isOffline ? "Offline Submission Link" : "Full Test Recording"}</h2>
            {isOffline && audioUrl && audioUrl.startsWith('http') ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-[#4F7DFF]" />
                    <div>
                        <span className="block text-blue-900 font-bold text-sm">Student Video / Audio</span>
                        <span className="block text-blue-700/70 text-xs mt-0.5">Click to view in a new tab</span>
                    </div>
                  </div>
                  <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="bg-[#4F7DFF] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
                    Open Link <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
            ) : (
                <SimpleAudioPlayer src={audioUrl} defaultDurationStr={isOffline ? "Audio Recording" : "Full Recording"} isRealAudio={!!audioUrl} />
            )}
          </section>`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
