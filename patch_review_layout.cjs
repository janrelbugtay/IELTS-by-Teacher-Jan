const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

// Remove SimpleAudioPlayer from questions
code = code.replace(
  /<SimpleAudioPlayer src={audioUrl} defaultDurationStr={q\.duration} isRealAudio={!!audioUrl} \/>/g,
  ''
);

code = code.replace(
  /<SimpleAudioPlayer src={audioUrl} defaultDurationStr={MOCK_QUESTIONS\.part2\.duration} isRealAudio={!!audioUrl} \/>/g,
  ''
);

// Add one SimpleAudioPlayer at the top
const contentHeader = `{/* Content */}
        <div className="space-y-16 max-w-3xl">`;

const newContentHeader = `{/* Content */}
        <div className="space-y-16 max-w-3xl">
          {/* Full Test Recording */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
            <h2 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">Full Test Recording</h2>
            <SimpleAudioPlayer src={audioUrl} defaultDurationStr="Full Recording" isRealAudio={!!audioUrl} />
          </section>`;

code = code.replace(contentHeader, newContentHeader);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
