const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target = `          {phase === 'p3' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#6CCB5F]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part3[qIndex].text}
              </h2>
            </div>
          )}`;

const replacement = `          {phase === 'p3' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#6CCB5F]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part3[qIndex].text}
              </h2>
              {showSampleAnswer && MOCK_QUESTIONS.part3[qIndex].sampleAnswer && (
                <div className="mt-8 mx-auto max-w-2xl text-left p-6 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                   <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Sample Answer</div>
                   {MOCK_QUESTIONS.part3[qIndex].sampleAnswer}
                </div>
              )}
            </div>
          )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
