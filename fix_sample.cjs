const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target1 = `  const [isPlaying, setIsPlaying] = useState(false);`;
const replacement1 = `  const [isPlaying, setIsPlaying] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  
  const playSampleAnswerText = (text) => {
      setShowSampleAnswer(true);
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          
          const setVoiceAndSpeak = () => {
              const voices = window.speechSynthesis.getVoices();
              const preferredVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
              if (preferredVoice) utterance.voice = preferredVoice;
              window.speechSynthesis.speak(utterance);
          };

          if (window.speechSynthesis.getVoices().length > 0) {
              setVoiceAndSpeak();
          } else {
              window.speechSynthesis.onvoiceschanged = () => {
                  setVoiceAndSpeak();
              };
          }
      }
  };
`;
code = code.replace(target1, replacement1);

const target2 = `                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => {
                      alert('Sample answer audio/script will be added later.');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full font-medium transition-colors border border-slate-200 shadow-sm"
                  >
                    <Play size={18} className="text-[#4F7DFF]" />
                    Play Sample Answer
                  </button>
                </div>`;
const replacement2 = `                {MOCK_QUESTIONS.part2.sampleAnswer && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                    <button 
                      onClick={() => playSampleAnswerText(MOCK_QUESTIONS.part2.sampleAnswer)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full font-medium transition-colors border border-slate-200 shadow-sm"
                    >
                      <Play size={18} className="text-[#4F7DFF]" />
                      Play Sample Answer
                    </button>
                    {showSampleAnswer && (
                      <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                        <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Sample Answer</div>
                        {MOCK_QUESTIONS.part2.sampleAnswer}
                      </div>
                    )}
                  </div>
                )}`;
code = code.replace(target2, replacement2);

const target3 = `                  phase === 'p3' || phase === 'p1' ? (
                    <button 
                      onClick={() => alert('Sample answer audio/script will be added later.')}
                      className="flex items-center gap-3 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-colors cursor-pointer"
                    >
                       <Play size={18} className="text-[#4F7DFF]" />
                       <span className="font-bold text-sm uppercase tracking-wider">Play Sample Answer</span>
                    </button>
                  ) : (`;
const replacement3 = `                  phase === 'p3' || phase === 'p1' ? (
                    <button 
                      onClick={() => {
                        const arr = phase === 'p1' ? MOCK_QUESTIONS.part1 : MOCK_QUESTIONS.part3;
                        const sample = arr[qIndex].sampleAnswer;
                        if (sample) {
                            playSampleAnswerText(sample);
                        } else {
                            alert('Sample answer not available yet.');
                        }
                      }}
                      className="flex items-center gap-3 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-colors cursor-pointer"
                    >
                       <Play size={18} className="text-[#4F7DFF]" />
                       <span className="font-bold text-sm uppercase tracking-wider">Play Sample Answer</span>
                    </button>
                  ) : (`;
code = code.replace(target3, replacement3);

// add showSampleAnswer logic to p1 and p3 rendering
const target4 = `          {phase === 'p1' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 1: Let's talk about {MOCK_QUESTIONS.part1[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part1[qIndex].text}
              </h2>
            </div>
          )}`;
const replacement4 = `          {phase === 'p1' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide shadow-sm">
                Part 1: Let's talk about {MOCK_QUESTIONS.part1[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part1[qIndex].text}
              </h2>
              {showSampleAnswer && MOCK_QUESTIONS.part1[qIndex].sampleAnswer && (
                <div className="mt-8 mx-auto max-w-2xl text-left p-6 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                   <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Sample Answer</div>
                   {MOCK_QUESTIONS.part1[qIndex].sampleAnswer}
                </div>
              )}
            </div>
          )}`;
code = code.replace(target4, replacement4);

const target5 = `          {phase === 'p3' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 shadow-sm tracking-wide">
                Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm px-4">
                {MOCK_QUESTIONS.part3[qIndex].text}
              </h2>
            </div>
          )}`;
const replacement5 = `          {phase === 'p3' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in w-full text-center">
              <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 shadow-sm tracking-wide">
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
code = code.replace(target5, replacement5);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Success");
