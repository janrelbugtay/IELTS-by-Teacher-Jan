const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target1 = `  const [prepTime, setPrepTime] = useState(60);`;
const replacement1 = `  const [prepTime, setPrepTime] = useState(60);
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState(false);`;

code = code.replace(target1, replacement1);

const target2 = `      } else if (phase === 'p2-prep' && qState === 'prep') {
        timer = setInterval(() => {
          setPrepTime(prev => prev - 1);
        }, 1000);
      }`;
const replacement2 = `      } else if (phase === 'p2-prep' && qState === 'prep') {
        if (testNum !== '3' || isPrepTimerRunning) {
          timer = setInterval(() => {
            setPrepTime(prev => prev - 1);
          }, 1000);
        }
      }`;

code = code.replace(target2, replacement2);

const target3 = `                <div className="text-3xl font-mono font-bold text-slate-800 flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200 shadow-inner">
                   <Clock size={28} className="text-[#F7B731] animate-pulse" />
                   {formatTime(prepTime)}
                </div>`;
const replacement3 = `                <div className="flex items-center gap-3">
                  {testNum === '3' && (
                    <button 
                      onClick={() => setIsPrepTimerRunning(!isPrepTimerRunning)}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full font-bold transition-colors text-sm border border-slate-200"
                    >
                      {isPrepTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                      {isPrepTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </button>
                  )}
                  <div className="text-3xl font-mono font-bold text-slate-800 flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200 shadow-inner">
                     <Clock size={28} className={testNum === '3' && !isPrepTimerRunning ? 'text-slate-400' : 'text-[#F7B731] animate-pulse'} />
                     {formatTime(prepTime)}
                  </div>
                </div>`;

code = code.replace(target3, replacement3);

const target4 = `              <div className="bg-white backdrop-blur-xl border border-slate-200 shadow-lg p-8 rounded-3xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>`;
const replacement4 = `              <div className="bg-white backdrop-blur-xl border border-slate-200 shadow-lg p-8 rounded-3xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light mb-6">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => {
                      alert('Sample answer audio/script will be added later.');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full font-medium transition-colors border border-slate-200 shadow-sm"
                  >
                    <Play size={18} className="text-[#4F7DFF]" />
                    Play Sample Answer
                  </button>
                </div>
              </div>`;

code = code.replace(target4, replacement4);

const target5 = `                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
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
                
if (code.lastIndexOf(target5) !== code.indexOf(target5)) {
  // It means it's also in p2. We should remove it from p2.
  let p2index = code.lastIndexOf(target5);
  code = code.substring(0, p2index) + code.substring(p2index + target5.length);
}

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
